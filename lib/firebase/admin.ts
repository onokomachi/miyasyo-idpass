import 'server-only';

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// サーバー専用。サービスアカウント鍵で初期化する Admin SDK。
// 環境変数はリクエスト時にのみ参照する（ビルド時の初期化を避けるため遅延初期化）。

// private_key を実行環境差に強く正規化する。
//  - Vercel ダッシュボードでクォートごと貼られた場合は両端の " ' を外す。
//  - .env / Vercel では改行が \n でエスケープされているため実改行へ復元する。
function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

function getAdminApp(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin の環境変数が未設定です（FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY）。',
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

// サービスアカウント情報を返す（Firestore REST API でのアクセストークン取得に使う）。
export function getServiceAccount(): ServiceAccount & { privateKey: string } {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin の環境変数が未設定です。');
  }
  return { projectId, clientEmail, privateKey };
}

// Firestoreはサーバーレス環境でgRPCの接続が不安定になることがある。
// preferRest: true でHTTP/RESTに切り替えることで解消する。
// db.settings()はFirestore操作の前に一度だけ呼ぶ必要があるためここでキャッシュする。
let cachedDb: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (cachedDb) return cachedDb;
  const db = getFirestore(getAdminApp());
  db.settings({ preferRest: true });
  cachedDb = db;
  return db;
}

// 設定不一致の切り分け用サマリ（秘密値は返さない）。
// client_email には "...@<projectId>.iam.gserviceaccount.com" の形でプロジェクトが
// 埋め込まれているため、FIREBASE_PROJECT_ID とのズレ（タイプミス）を検出できる。
export function getAdminEnvSummary(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() ?? '(未設定)';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? '';
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const emailProject =
    clientEmail.match(/@([^.]+)\.iam\.gserviceaccount\.com$/)?.[1] ?? '(不明)';
  const keyOk = privateKey?.startsWith('-----BEGIN') ? 'ok' : 'NG';
  const mismatch = emailProject !== '(不明)' && emailProject !== projectId
    ? ' ⚠️プロジェクトID不一致'
    : '';

  return `projectId=${projectId} / 鍵のプロジェクト=${emailProject} / 秘密鍵=${keyOk}${mismatch}`;
}
