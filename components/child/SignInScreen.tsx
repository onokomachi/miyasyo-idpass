'use client';

import { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

// メールアドレスの共通部分（@より後ろ）。児童は@より前だけ入力すればよい。
const EMAIL_DOMAIN = 'isesaki-school.ed.jp';

export default function SignInScreen({
  onSignIn,
  onPasswordLogin,
  busy,
  error,
}: {
  onSignIn: () => void;
  onPasswordLogin: (email: string, password: string) => void;
  busy: boolean;
  error?: string | null;
}) {
  const [emailLocal, setEmailLocal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // @を含めて入力された場合はそのまま、無ければ共通ドメインを補う。
  const buildEmail = (input: string) => {
    const v = input.trim();
    if (!v) return '';
    return v.includes('@') ? v : `${v}@${EMAIL_DOMAIN}`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLocal || !password || busy) return;
    onPasswordLogin(buildEmail(emailLocal), password);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm max-w-md w-full mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
        <KeyRound className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2 text-center">
        ようこそ！
      </h1>
      <p className="text-sm text-slate-500 mb-7 leading-relaxed text-center">
        <strong className="text-slate-700">Googleのメール</strong>と
        <strong className="text-slate-700">パスワード</strong>を入れると、
        じぶんのIDやパスワードを見られるよ。
      </p>

      {/* メール＋パスワードでログイン */}
      <form onSubmit={submit} className="space-y-3 text-left">
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 mb-1 block">
            Googleのメール
          </label>
          <div className="flex items-stretch border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600/30 transition-all">
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              value={emailLocal}
              onChange={(e) => setEmailLocal(e.target.value)}
              placeholder="メール"
              className="flex-1 min-w-0 h-13 py-3 bg-white px-4 text-sm font-bold outline-none"
            />
            <span className="flex items-center px-3 bg-slate-50 text-slate-400 text-xs font-bold border-l-2 border-slate-200 select-none whitespace-nowrap">
              @{EMAIL_DOMAIN}
            </span>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 mb-1 block">
            Googleのパスワード
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              className="w-full h-13 py-3 bg-white border-2 border-slate-200 rounded-xl px-4 pr-12 text-sm font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={showPassword ? 'パスワードをかくす' : 'パスワードを見る'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy || !emailLocal || !password}
          className={`w-full h-14 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all border-2 ${
            busy || !emailLocal || !password
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700 cursor-pointer active:scale-[0.99] shadow-sm'
          }`}
        >
          {busy ? 'かくにんちゅう…' : 'ログイン'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-xs text-rose-600 font-bold text-center">{error}</p>
      )}

      {/* くぎり */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] font-extrabold text-slate-400">または</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Googleでログイン（従来方式も残す） */}
      <button
        onClick={onSignIn}
        disabled={busy}
        className={`w-full h-13 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all border-2 ${
          busy
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
        }`}
      >
        <GoogleMark />
        <span>Googleアカウントでログイン</span>
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-black text-white">
      G
    </span>
  );
}
