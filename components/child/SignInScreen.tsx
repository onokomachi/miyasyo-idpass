'use client';

import { KeyRound } from 'lucide-react';

export default function SignInScreen({
  onSignIn,
  busy,
  error,
}: {
  onSignIn: () => void;
  busy: boolean;
  error?: string | null;
}) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm text-center max-w-md w-full mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
        <KeyRound className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">
        ようこそ！
      </h1>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        じぶんの<strong className="text-slate-700">Googleアカウント</strong>でログインすると、
        IDやパスワードをかんたんに見られるよ。
      </p>

      <button
        onClick={onSignIn}
        disabled={busy}
        className={`w-full h-14 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all border-2 ${
          busy
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700 cursor-pointer active:scale-[0.99] shadow-sm'
        }`}
      >
        <GoogleMark />
        <span>{busy ? 'ログインちゅう…' : 'Googleでログイン'}</span>
      </button>

      {error && (
        <p className="mt-4 text-xs text-rose-600 font-bold">{error}</p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-black text-blue-600">
      G
    </span>
  );
}
