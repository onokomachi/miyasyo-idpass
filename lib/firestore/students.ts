import 'server-only';

import type { StudentDoc } from '@/lib/model/student';
import {
  restGetDoc,
  restSetDoc,
  restBatchSet,
  restRunQuery,
  restListDocIds,
} from '@/lib/firestore/firestoreRest';

const STUDENTS = 'students';
const IMPORTS = 'imports';

export interface ImportSummary {
  importBatchId: string;
  imported: number;
  skipped: number;
  orphans: number;
  importedAt: string; // ISO
  filename: string;
}

// メール（小文字）で1件取得。無ければ null。
export async function getStudentByEmail(
  email: string,
): Promise<Record<string, unknown> | null> {
  return restGetDoc(STUDENTS, email);
}

// 取り込み：emailキーで上書き。500件ずつバッチ。
export async function upsertStudents(
  students: StudentDoc[],
  filename: string,
): Promise<ImportSummary> {
  const importBatchId = crypto.randomUUID();
  const importedAtDate = new Date();

  // 既存メール集合（orphan 検出用）
  const existingEmails = new Set(await restListDocIds(STUDENTS));
  const incomingEmails = new Set(students.map((s) => s.email));

  // 書き込み（importedAt はサーバータイムスタンプ）
  const docs = students.map((s) => ({
    id: s.email,
    data: { ...s, importBatchId } as Record<string, unknown>,
  }));
  await restBatchSet(STUDENTS, docs, ['importedAt']);

  let orphans = 0;
  existingEmails.forEach((e) => { if (!incomingEmails.has(e)) orphans++; });

  // import ログ
  await restSetDoc(IMPORTS, importBatchId, { filename, count: students.length, orphans }, ['importedAt']);

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
  const filters = [];
  if (typeof filter.grade === 'number')
    filters.push({ field: 'grade', op: 'EQUAL' as const, value: filter.grade });
  if (filter.homeClass)
    filters.push({ field: 'homeClass', op: 'EQUAL' as const, value: filter.homeClass });
  if (typeof filter.number === 'number')
    filters.push({ field: 'number', op: 'EQUAL' as const, value: filter.number });

  const rows = await restRunQuery(STUDENTS, { filters });

  // importedAt は ISO 文字列として返る（REST からは timestampValue）
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
  const rows = await restRunQuery(IMPORTS, {
    orderBy: [{ field: 'importedAt', direction: 'DESCENDING' }],
    limit: 1,
  });
  if (rows.length === 0) return { importedAt: null, filename: null, count: null };
  const data = rows[0];
  return {
    importedAt: (data.importedAt as string) ?? null,
    filename: (data.filename as string) ?? null,
    count: (data.count as number) ?? null,
  };
}
