import 'server-only';

import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth/adminSession';

// 管理セッションCookieが有効かを判定する（各管理APIの先頭で使う）。
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
