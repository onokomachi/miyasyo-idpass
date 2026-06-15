'use client';

import { useCallback, useEffect, useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import AdminLogin from '@/components/admin/AdminLogin';
import ImportPanel from '@/components/admin/ImportPanel';
import StudentTable from '@/components/admin/StudentTable';

type State = 'checking' | 'login' | 'ready';

export default function AdminApp() {
  const [state, setState] = useState<State>('checking');
  const [reloadKey, setReloadKey] = useState(0);

  // httpOnly Cookie は読めないため、保護APIを叩いて認証状態を判定する。
  const probe = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/students?probe=1');
      setState(res.ok ? 'ready' : 'login');
    } catch {
      setState('login');
    }
  }, []);

  useEffect(() => {
    probe();
  }, [probe]);

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setState('login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col overflow-x-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-35 pointer-events-none z-0" />

      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 md:px-12 justify-between z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              みやしょうPASS <span className="text-slate-400 text-sm">管理</span>
            </div>
          </div>
        </div>
        {state === 'ready' && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 transition-colors px-4 py-2 rounded-xl font-extrabold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col relative z-10">
        {state === 'checking' && (
          <div className="text-center text-slate-400 font-bold py-20">読み込み中…</div>
        )}

        {state === 'login' && (
          <div className="flex-1 flex items-center justify-center py-10">
            <AdminLogin onSuccess={() => setState('ready')} />
          </div>
        )}

        {state === 'ready' && (
          <div className="space-y-6">
            <ImportPanel onImported={() => setReloadKey((k) => k + 1)} />
            <StudentTable reloadKey={reloadKey} />
          </div>
        )}
      </main>
    </div>
  );
}
