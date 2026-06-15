'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';

// Firebase の Web 用構成は「公開情報」（秘密鍵ではない）。保護は Firestore ルールと
// 承認済みドメイン、IDトークン検証で担保する。設定の手間を減らすため既定値を埋め込み、
// 必要なら環境変数(NEXT_PUBLIC_*)で上書きできるようにしている。
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyA0NRZ43YMbAC7a1xv31hRZ4VEJvlM0o1Q',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    'miyasyo-idpass.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'miyasyo-idpass',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'miyasyo-idpass.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '48706735508',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    '1:48706735508:web:23e1d94973c8186beb9381',
};

// 遅延初期化（ブラウザで初めて使うときに初期化）。
// これによりビルド時の静的生成やサーバー実行で初期化が走らない。
let cachedAuth: Auth | null = null;
let cachedProvider: GoogleAuthProvider | null = null;

function getClientApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getClientAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getClientApp());
  }
  return cachedAuth;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!cachedProvider) {
    cachedProvider = new GoogleAuthProvider();
    // 毎回アカウント選択を出す（共用端末で別の子のアカウントが残らないように）
    cachedProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return cachedProvider;
}
