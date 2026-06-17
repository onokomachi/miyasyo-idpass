import { NextResponse } from 'next/server';
import { getStudentByEmail } from '@/lib/firestore/students';
import { sanitizeStudent } from '@/lib/model/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/login-password : メール + Googleパスワードを「合言葉」として照合する。
// Google認証(OAuth)を使わずに本人確認する簡易方式。
// DBに保存済みの google.email / google.password と一致したら本人データを返す。
export async function POST(request: Request) {
  let email = '';
  let password = '';
  try {
    const body = await request.json();
    email = String(body?.email ?? '').trim().toLowerCase();
    password = String(body?.password ?? '');
  } catch {
    email = '';
    password = '';
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: 'メールアドレスとパスワードを入力してください。' },
      { status: 400 },
    );
  }

  try {
    const data = await getStudentByEmail(email);
    const stored = (data?.google as { password?: string } | undefined)?.password ?? '';

    // メールが無い・パスワード不一致はどちらも同じ扱い（どのメールが存在するか漏らさない）。
    if (!data || password.trim() !== String(stored).trim()) {
      // ブルートフォース緩和：失敗時は固定遅延。
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json(
        { error: 'メールアドレスかパスワードがちがいます。' },
        { status: 401 },
      );
    }

    return NextResponse.json({ student: sanitizeStudent(data) });
  } catch (e) {
    console.error('[api/login-password] 照合に失敗しました', e);
    return NextResponse.json(
      { error: 'SERVER_ERROR', detail: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  }
}
