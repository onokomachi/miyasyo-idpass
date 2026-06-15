import 'server-only';

import ExcelJS from 'exceljs';
import { COL, cellToString, splitField } from '@/lib/excel/columns';
import type { StudentDoc } from '@/lib/model/student';

export interface ParseWarning {
  row: number;
  reason: string;
}

export interface ParseResult {
  students: StudentDoc[];
  warnings: ParseWarning[];
  totalRows: number; // 走査したデータ行数
}

const EMAIL_RE = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/;

// Excel のバッファを読み取り、児童データに変換する。
export async function parseWorkbook(buffer: Buffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { students: [], warnings: [], totalRows: 0 };
  }

  const students: StudentDoc[] = [];
  const warnings: ParseWarning[] = [];
  const seenEmails = new Map<string, number>(); // email -> 配列index
  let totalRows = 0;

  sheet.eachRow((row, rowNumber) => {
    const get = (col: string) => cellToString(row.getCell(col).value);

    const numberRaw = get(COL.NUMBER);
    const numParsed = Number(numberRaw);
    // E列（番号）が正の整数でない行はヘッダ・空行とみなしスキップ。
    if (!Number.isInteger(numParsed) || numParsed <= 0) return;

    totalRows++;

    const name = get(COL.NAME);
    const kana = get(COL.KANA);
    const grade = Number(get(COL.GRADE));
    const homeClass = get(COL.CLASS);

    const himaGrade = get(COL.HIMA_GRADE);
    const himaClass = get(COL.HIMA_CLASS);

    const [gmail, gPass, ipad] = splitField(get(COL.BIKO5), 3);
    const [miraiPass, smileId, smilePass] = splitField(get(COL.BIKO6), 3);

    const label = name || `${numParsed}番`;

    if (!gmail) {
      warnings.push({
        row: rowNumber,
        reason: `${label}: Gmailアドレス（備考5）が未入力のため、ログインで確認できません。`,
      });
      return;
    }

    const email = gmail.toLowerCase().trim();
    if (!EMAIL_RE.test(email)) {
      warnings.push({
        row: rowNumber,
        reason: `${label}: Gmailアドレス「${gmail}」の形式が正しくありません。`,
      });
      return;
    }

    const doc: StudentDoc = {
      email,
      grade: Number.isFinite(grade) ? grade : 0,
      homeClass,
      number: numParsed,
      name,
      kana,
      google: { email, password: gPass ?? '' },
    };

    if (himaGrade || himaClass) {
      doc.himawari = {
        ...(himaGrade ? { grade: himaGrade } : {}),
        ...(himaClass ? { class: himaClass } : {}),
      };
    }
    if (ipad) doc.ipadSerial = ipad;
    if (smileId || smilePass) {
      doc.smileNext = {
        ...(smileId ? { id: smileId } : {}),
        ...(smilePass ? { password: smilePass } : {}),
      };
    }
    if (miraiPass) doc.miraiSeed = { password: miraiPass };

    // 同一ファイル内の重複メールは後勝ち＋警告。
    const existing = seenEmails.get(email);
    if (existing !== undefined) {
      warnings.push({
        row: rowNumber,
        reason: `${label}: メール「${email}」が重複しています。後の行で上書きしました。`,
      });
      students[existing] = doc;
    } else {
      seenEmails.set(email, students.length);
      students.push(doc);
    }
  });

  return { students, warnings, totalRows };
}
