'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
