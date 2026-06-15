'use client';

import { HelpCircle, LogOut } from 'lucide-react';

interface HeaderProps {
  subtitle?: string;
  onHelpClick?: () => void;
  onLogout?: () => void;
  logoutLabel?: string;
}

export default function Header({
  subtitle,
  onHelpClick,
  onLogout,
  logoutLabel = 'ログアウト',
}: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 md:px-12 justify-between z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
          み
        </div>
        <div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            みやしょうPASS
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-bold tracking-wider hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors px-4 py-2 rounded-xl font-extrabold cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>つかいかた</span>
          </button>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 transition-colors px-4 py-2 rounded-xl font-extrabold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{logoutLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
}
