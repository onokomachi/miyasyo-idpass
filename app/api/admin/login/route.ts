import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  checkAdminPassword,
  createSessionToken,
} from '@/lib/auth/adminSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/login : パスワード(444325)を検証し、署名Cookieを発行する。
export async function POST(request: Request) {
  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    password = undefined;
  }

  if (!checkAdminPassword(password)) {
    // ブルートフォース緩和：失敗時に固定遅延＋汎用エラー。
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(
      { error: 'パスワードがちがいます' },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/login : ログアウト。
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
