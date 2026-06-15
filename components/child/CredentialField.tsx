'use client';

import { useState } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { playChime } from '@/lib/sound';

interface CredentialFieldProps {
  label: string;
  value: string;
  secret?: boolean; // パスワード等。最初は伏せ字にする
  accent?: 'emerald' | 'amber' | 'sky';
}

const dotColors: Record<NonNullable<CredentialFieldProps['accent']>, string> = {
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  sky: 'bg-sky-300',
};

export default function CredentialField({
  label,
  value,
  secret = false,
  accent = 'emerald',
}: CredentialFieldProps) {
  const [shown, setShown] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    playChime(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[accent]}`} />
        {label}
      </div>
      <div className="flex items-center justify-between gap-2 bg-white/10 rounded-xl p-3.5 border border-white/10">
        <span className="text-xl md:text-2xl font-mono font-black tracking-tight break-all select-all">
          {shown ? value : '••••••'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {secret && (
            <button
              onClick={() => setShown((s) => !s)}
              className="p-1 px-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
              title={shown ? 'かくす' : 'ひょうじ'}
              aria-label={shown ? 'かくす' : 'ひょうじ'}
            >
              {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={copy}
            className={`text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>コピーしたよ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>コピー</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
