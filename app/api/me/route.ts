import { NextResponse } from 'next/server';
import { verifyRequestEmail } from '@/lib/auth/verifyIdToken';
import { getStudentByEmail } from '@/lib/firestore/students';
import { sanitizeStudent } from '@/lib/model/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/me : ログイン児童本人のデータだけを返す。
// メールは検証済みIDトークンからのみ取得し、クライアント指定は一切信頼しない。
export async function GET(request: Request) {
  const email = await verifyRequestEmail(request);
  if (!email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const data = await getStudentByEmail(email);
  if (!data) {
    return NextResponse.json({ error: 'NOT_REGISTERED' }, { status: 404 });
  }

  return NextResponse.json({ student: sanitizeStudent(data) });
}
