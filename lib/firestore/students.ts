import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { StudentDoc } from '@/lib/model/student';

const STUDENTS = 'students';
const IMPORTS = 'imports';

export interface ImportSummary {
  importBatchId: string;
  imported: number;
  skipped: number;
  orphans: number; // DBにあるが今回ファイルに無い件数
  importedAt: string; // ISO
  filename: string;
}

// メール（小文字）で1件取得。無ければ null。
export async function getStudentByEmail(
  email: string,
): Promise<Record<string, unknown> | null> {
  const adminDb = getAdminDb();
  const snap = await adminDb.collection(STUDENTS).doc(email).get();
  return snap.exists ? (snap.data() as Record<string, unknown>) : null;
}

// 取り込み：emailキーで上書き（merge:false）。500件ずつバッチ。
// 今回ファイルに無い既存児童は削除せず orphans としてカウントのみ返す。
export async function upsertStudents(
  students: StudentDoc[],
  filename: string,
): Promise<ImportSummary> {
  const adminDb = getAdminDb();
  const batchRef = adminDb.collection(IMPORTS).doc();
  const importBatchId = batchRef.id;
  const importedAtDate = new Date();

  // 既存メール集合（orphan 検出用）
  const existingSnap = await adminDb.collection(STUDENTS).select().get();
  const existingEmails = new Set(existingSnap.docs.map((d) => d.id));
  const incomingEmails = new Set(students.map((s) => s.email));

  // 書き込み（500件ずつ）
  const CHUNK = 500;
  for (let i = 0; i < students.length; i += CHUNK) {
    const batch = adminDb.batch();
    for (const s of students.slice(i, i + CHUNK)) {
      const ref = adminDb.collection(STUDENTS).doc(s.email);
      batch.set(ref, {
        ...s,
        importBatchId,
        importedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  let orphans = 0;
  existingEmails.forEach((e) => {
    if (!incomingEmails.has(e)) orphans++;
  });

  await batchRef.set({
    filename,
    count: students.length,
    orphans,
    importedAt: FieldValue.serverTimestamp(),
  });

  return {
    importBatchId,
    imported: students.length,
    skipped: 0,
    orphans,
    importedAt: importedAtDate.toISOString(),
    filename,
  };
}

export interface StudentFilter {
  grade?: number;
  homeClass?: string;
  number?: number;
}

// 管理用：絞り込み一覧（既定は全校）。学年→組→番号順。
export async function listStudents(
  filter: StudentFilter,
): Promise<Record<string, unknown>[]> {
  const adminDb = getAdminDb();
  let query: FirebaseFirestore.Query = adminDb.collection(STUDENTS);
  if (typeof filter.grade === 'number') query = query.where('grade', '==', filter.grade);
  if (filter.homeClass) query = query.where('homeClass', '==', filter.homeClass);
  if (typeof filter.number === 'number') query = query.where('number', '==', filter.number);

  const snap = await query.get();
  const rows: Record<string, unknown>[] = snap.docs.map((d) => {
    const data = d.data();
    const importedAt = data.importedAt as { toDate?: () => Date } | undefined;
    return {
      ...data,
      importedAt:
        importedAt && typeof importedAt.toDate === 'function'
          ? importedAt.toDate().toISOString()
          : null,
    };
  });

  // 並び替えはアプリ側で（複合インデックス不要にするため）。
  rows.sort((a, b) => {
    const ga = (a.grade as number) ?? 0;
    const gb = (b.grade as number) ?? 0;
    if (ga !== gb) return ga - gb;
    const ca = String(a.homeClass ?? '');
    const cb = String(b.homeClass ?? '');
    if (ca !== cb) return ca.localeCompare(cb, 'ja');
    return ((a.number as number) ?? 0) - ((b.number as number) ?? 0);
  });

  return rows;
}

// 最後の取り込み日時を取得（管理ダッシュボード表示用）。
export async function getLatestImport(): Promise<{
  importedAt: string | null;
  filename: string | null;
  count: number | null;
}> {
  const adminDb = getAdminDb();
  const snap = await adminDb
    .collection(IMPORTS)
    .orderBy('importedAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return { importedAt: null, filename: null, count: null };
  const data = snap.docs[0].data();
  const importedAt = data.importedAt as { toDate?: () => Date } | undefined;
  return {
    importedAt:
      importedAt && typeof importedAt.toDate === 'function'
        ? importedAt.toDate().toISOString()
        : null,
    filename: (data.filename as string) ?? null,
    count: (data.count as number) ?? null,
  };
}
