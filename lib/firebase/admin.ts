import 'server-only';

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// サーバー専用。サービスアカウント鍵で初期化する Admin SDK。
// 環境変数はリクエスト時にのみ参照する（ビルド時の初期化を避けるため遅延初期化）。

function getAdminApp(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel / .env では private_key の改行が \n でエスケープされているため復元する。
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin の環境変数が未設定です（FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY）。',
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
