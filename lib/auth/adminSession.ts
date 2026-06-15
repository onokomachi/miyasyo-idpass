import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

// 管理セッションCookie。中身は { exp } を HMAC-SHA256 で署名したもの。
// サーバー専用。ADMIN_SESSION_SECRET で署名・検証する。

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8時間

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET が未設定、または短すぎます。');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

// 新しいセッションCookieの値を作る（"exp.signature" 形式）。
export function createSessionToken(): string {
  const exp = String(Date.now() + SESSION_DURATION_MS);
  return `${exp}.${sign(exp)}`;
}

// Cookie値を検証する。署名が正しく、かつ期限内なら true。
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqualHex(sig, sign(exp))) return false;
  const expMs = Number(exp);
  return Number.isFinite(expMs) && Date.now() < expMs;
}

export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_DURATION_MS / 1000);

// 管理パスワードを定数時間で比較する。
export function checkAdminPassword(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD が未設定です。');
  if (typeof input !== 'string') return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
