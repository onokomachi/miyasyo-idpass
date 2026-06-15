import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth/requireAdmin';
import { listStudents, getLatestImport } from '@/lib/firestore/students';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/students?grade=&class=&number= : 絞り込み一覧（既定=全校）。
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const gradeParam = searchParams.get('grade');
  const classParam = searchParams.get('class');
  const numberParam = searchParams.get('number');

  const grade = gradeParam ? Number(gradeParam) : undefined;
  const number = numberParam ? Number(numberParam) : undefined;

  try {
    const [students, latestImport] = await Promise.all([
      listStudents({
        grade: Number.isFinite(grade) ? grade : undefined,
        homeClass: classParam || undefined,
        number: Number.isFinite(number) ? number : undefined,
      }),
      getLatestImport(),
    ]);

    return NextResponse.json({ students, latestImport, count: students.length });
  } catch (e) {
    console.error('[admin/students] 取得に失敗しました', e);
    return NextResponse.json(
      {
        error: 'データベースの読み取りに失敗しました。サーバーの設定（Firebase認証情報）を確認してください。',
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
