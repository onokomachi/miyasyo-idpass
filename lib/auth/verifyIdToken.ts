import 'server-only';

import { getAdminAuth } from '@/lib/firebase/admin';

// Authorization ヘッダの Bearer トークンを検証し、検証済みメールアドレス（小文字）を返す。
// 不正・欠如・メール未確認なら null。
export async function verifyRequestEmail(
  request: Request,
): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1]);
    if (!decoded.email) return null;
    return decoded.email.toLowerCase().trim();
  } catch {
    return null;
  }
}
