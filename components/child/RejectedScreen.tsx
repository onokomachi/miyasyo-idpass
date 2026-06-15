'use client';

import { HelpCircle } from 'lucide-react';

export default function RejectedScreen({
  email,
  onBack,
}: {
  email?: string | null;
  onBack: () => void;
}) {
  return (
    <div className="bg-white border-2 border-amber-200 rounded-3xl p-8 md:p-12 shadow-sm text-center max-w-md w-full mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
        <HelpCircle className="w-8 h-8 text-amber-600" />
      </div>
      <h1 className="text-xl font-black text-slate-900 mb-2">
        このアカウントの じょうほうが 見つかりません
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-2">
        ログインした<strong className="text-slate-700">Googleアカウント</strong>が、まだとうろくされていないみたいです。
      </p>
      {email && (
        <p className="text-xs text-slate-400 font-mono mb-6 break-all">{email}</p>
      )}
      <p className="text-sm text-amber-700 font-extrabold mb-8">
        べつのアカウントでログインしていないか たしかめて、
        わからないときは 先生（せんせい）に きいてね。
      </p>
      <button
        onClick={onBack}
        className="w-full h-12 rounded-2xl font-extrabold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
      >
        べつのアカウントでログインする
      </button>
    </div>
  );
}
