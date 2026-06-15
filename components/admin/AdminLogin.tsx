'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError('パスワードがちがいます');
        setPassword('');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm max-w-sm w-full mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-5">
        <Lock className="w-7 h-7 text-white" />
      </div>
      <h1 className="text-xl font-black text-slate-900 text-center mb-1">
        管理ページ
      </h1>
      <p className="text-xs text-slate-500 text-center mb-6">
        パスワードを入力してください
      </p>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          className="w-full h-14 bg-white border-2 border-slate-200 rounded-xl px-4 text-center text-lg font-bold tracking-widest outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
        />
        <button
          type="submit"
          disabled={busy || !password}
          className={`w-full h-14 rounded-xl font-extrabold text-base transition-all border-2 ${
            busy || !password
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800 cursor-pointer'
          }`}
        >
          {busy ? '確認中…' : 'ログイン'}
        </button>
        {error && (
          <p className="text-xs text-rose-600 font-bold text-center">{error}</p>
        )}
      </form>
    </div>
  );
}
