import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth/requireAdmin';
import { parseWorkbook } from '@/lib/excel/parseWorkbook';
import { upsertStudents } from '@/lib/firestore/students';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/admin/import : Excel をアップロードして解析・保存する。
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get('file');
    if (value instanceof File) file = value;
  } catch {
    file = null;
  }

  if (!file) {
    return NextResponse.json(
      { error: 'Excelファイルが見つかりません。' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = await parseWorkbook(buffer);
  } catch {
    return NextResponse.json(
      { error: 'Excelの読み取りに失敗しました。ファイル形式を確認してください。' },
      { status: 400 },
    );
  }

  if (parsed.students.length === 0) {
    return NextResponse.json(
      {
        error: '保存できる児童データが見つかりませんでした。列の位置（学年C・組D・番号E・備考5 AL・備考6 BE）を確認してください。',
        warnings: parsed.warnings,
      },
      { status: 400 },
    );
  }

  try {
    const summary = await upsertStudents(parsed.students, file.name);
    return NextResponse.json({
      summary: { ...summary, skipped: parsed.warnings.length },
      warnings: parsed.warnings,
      totalRows: parsed.totalRows,
    });
  } catch (e) {
    console.error('[admin/import] 保存に失敗しました', e);
    return NextResponse.json(
      {
        error: 'データベースへの保存に失敗しました。サーバーの設定（Firebase認証情報）を確認してください。',
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
