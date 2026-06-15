'use client';

import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { SanitizedStudent } from '@/lib/model/student';

export type AuthStatus =
  | 'loading' // Firebase の状態確認中
  | 'signedOut' // 未ログイン
  | 'fetching' // ログイン済み、/api/me 取得中
  | 'rejected' // ログイン済みだがデータに無い
  | 'ready' // 自分のデータ取得完了
  | 'error'; // 通信エラー

export type ServiceTab = 'google' | 'smileNext' | 'miraiSeed' | 'ipad';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  record: SanitizedStudent | null;
  activeTab: ServiceTab;
  setStatus: (status: AuthStatus) => void;
  setUser: (user: User | null) => void;
  setRecord: (record: SanitizedStudent | null) => void;
  setActiveTab: (tab: ServiceTab) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  record: null,
  activeTab: 'google',
  setStatus: (status) => set({ status }),
  setUser: (user) => set({ user }),
  setRecord: (record) => set({ record }),
  setActiveTab: (activeTab) => set({ activeTab }),
  reset: () => set({ status: 'signedOut', user: null, record: null, activeTab: 'google' }),
}));
