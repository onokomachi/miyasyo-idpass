'use client';

import { Flower2 } from 'lucide-react';
import type { SanitizedStudent } from '@/lib/model/student';

export default function StudentHeader({ student }: { student: SanitizedStudent }) {
  const himawari = student.himawari;
  const himawariText = himawari
    ? [himawari.grade, himawari.class].filter(Boolean).join(' ')
    : '';

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl shrink-0">
        👤
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-400 font-bold tracking-wider">
          {student.grade}年 {student.homeClass}組 {student.number}番
        </div>
        <div className="text-xl md:text-2xl font-black text-slate-900 flex items-baseline gap-1.5 flex-wrap">
          {student.name}
          <span className="text-sm font-medium text-slate-500">さん</span>
        </div>
        {student.kana && (
          <div className="text-xs text-slate-500 font-bold">{student.kana}</div>
        )}
        {himawariText && (
          <div className="mt-1 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
            <Flower2 className="w-3.5 h-3.5" />
            ひまわり {himawariText}
          </div>
        )}
      </div>
    </div>
  );
}
