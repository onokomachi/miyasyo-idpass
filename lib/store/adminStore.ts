'use client';

import { create } from 'zustand';
import type { StudentFilter } from '@/lib/firestore/students';
import type { ImportSummary } from '@/lib/firestore/students';

interface AdminState {
  loggedIn: boolean;
  filter: StudentFilter;
  lastImport: ImportSummary | null;
  setLoggedIn: (loggedIn: boolean) => void;
  setFilter: (filter: StudentFilter) => void;
  setLastImport: (summary: ImportSummary | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  loggedIn: false,
  filter: {},
  lastImport: null,
  setLoggedIn: (loggedIn) => set({ loggedIn }),
  setFilter: (filter) => set({ filter }),
  setLastImport: (lastImport) => set({ lastImport }),
}));
