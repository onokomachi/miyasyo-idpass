'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';

interface Row {
  email: string;
  grade?: number;
  homeClass?: string;
  number?: number;
  name?: string;
  kana?: string;
  himawari?: { grade?: string; class?: string };
  google?: { email?: string; password?: string };
  ipadSerial?: string;
  smileNext?: { id?: string; password?: string };
  miraiSeed?: { password?: string };
  importedAt?: string | null;
}

const GRADES = ['1', '2', '3', '4', '5', '6'];
// 組は全校から読み込んだデータから動的に生成するため初期値は空
const NUMBERS = Array.from({ length: 40 }, (_, i) => String(i + 1));

export default function StudentTable({ reloadKey }: { reloadKey: number }) {
  const [grade, setGrade] = useState('');
  const [homeClass, setHomeClass] = useState('');
  const [number, setNumber] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [allClasses, setAllClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const load = useCallback(async (g: string, c: string, n: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (g) params.set('grade', g);
      if (c) params.set('class', c);
      if (n) params.set('number', n);
      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (!res.ok) { setRows([]); setCount(0); return; }
      const data = await res.json();
      setRows(data.students ?? []);
      setCount(data.count ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 全校データから組の選択肢を収集する（初回 + 取り込み後）
  const loadAllClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/students');
      if (!res.ok) return;
      const data = await res.json();
      const classes = [...new Set<string>(
        (data.students as Row[])
          .map((r) => r.homeClass ?? '')
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, 'ja'));
      setAllClasses(classes);
    } catch { /* 取得失敗は無視 */ }
  }, []);

  useEffect(() => {
    loadAllClasses();
    load('', '', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // プルダウン変更で即座に絞り込む
  useEffect(() => {
    load(grade, homeClass, number);
  }, [grade, homeClass, number, load]);

  const clearFilters = () => {
    setGrade('');
    setHomeClass('');
    setNumber('');
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        全校の児童一覧
      </h2>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <SelectField
          label="学年"
          value={grade}
          onChange={setGrade}
          placeholder="すべて"
          options={GRADES.map((v) => ({ label: `${v}年`, value: v }))}
        />
        <SelectField
          label="組"
          value={homeClass}
          onChange={setHomeClass}
          placeholder="すべて"
          options={allClasses.map((v) => ({ label: `${v}組`, value: v }))}
        />
        <SelectField
          label="番号"
          value={number}
          onChange={setNumber}
          placeholder="すべて"
          options={NUMBERS.map((v) => ({ label: `${v}番`, value: v }))}
        />
        <button
          onClick={clearFilters}
          className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors self-end"
        >
          <RefreshCw className="w-4 h-4" />
          全校にもどす
        </button>
      </div>

      <div className="text-xs text-slate-400 font-bold mb-2">
        {loading ? '読み込み中…' : `${count}件`}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-extrabold">
            <tr>
              {['学年', '組', '番号', '名前', 'ふりがな', 'ひまわり', 'Gmail', 'Googleパス', 'iPad機体', 'ミライシードパス', 'スマネクID', 'スマネクパス', '取込日時'].map((h) => (
                <th key={h} className="px-3 py-2 text-left border-b border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2">{r.grade}</td>
                <td className="px-3 py-2">{r.homeClass}</td>
                <td className="px-3 py-2">{r.number}</td>
                <td className="px-3 py-2 font-bold text-slate-800">{r.name}</td>
                <td className="px-3 py-2 text-slate-500">{r.kana}</td>
                <td className="px-3 py-2">{r.himawari ? [r.himawari.grade, r.himawari.class].filter(Boolean).join(' ') : ''}</td>
                <td className="px-3 py-2 font-mono">{r.google?.email}</td>
                <td className="px-3 py-2 font-mono">{r.google?.password}</td>
                <td className="px-3 py-2 font-mono">{r.ipadSerial}</td>
                <td className="px-3 py-2 font-mono">{r.miraiSeed?.password}</td>
                <td className="px-3 py-2 font-mono">{r.smileNext?.id}</td>
                <td className="px-3 py-2 font-mono">{r.smileNext?.password}</td>
                <td className="px-3 py-2 text-slate-400">
                  {r.importedAt ? new Date(r.importedAt).toLocaleString('ja-JP') : ''}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-slate-400 font-bold">
                  データがありません。Excelを取り込んでください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="text-[11px] font-extrabold text-slate-400 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 bg-white border-2 border-slate-200 rounded-xl px-3 text-sm font-bold outline-none focus:border-blue-600 transition-all cursor-pointer appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
