'use client';

import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ImportResponse {
  summary: {
    imported: number;
    skipped: number;
    orphans: number;
    importedAt: string;
    filename: string;
  };
  warnings: { row: number; reason: string }[];
  totalRows: number;
}

export default function ImportPanel({ onImported }: { onImported: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/import', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '取り込みに失敗しました');
        return;
      }
      setResult(data as ImportResponse);
      onImported();
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      upload(file);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
        Excelの取り込み
      </h2>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        校務システムから出力したExcel（.xlsx）を選ぶと、児童の情報を読み取って保存します。
        同じメールの児童は最新の内容で上書きされます。
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={onFile}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`w-full h-14 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all border-2 ${
          busy
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 cursor-pointer'
        }`}
      >
        <Upload className="w-5 h-5" />
        {busy ? '取り込み中…' : 'Excelファイルをえらぶ'}
      </button>
      {fileName && !busy && (
        <p className="text-xs text-slate-400 mt-2 truncate">えらんだファイル: {fileName}</p>
      )}

      {error && (
        <div className="mt-4 bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-rose-800 text-sm font-bold flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold mb-2">
            <CheckCircle2 className="w-5 h-5" />
            取り込みが完了しました
          </div>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>保存した児童: <strong>{result.summary.imported}人</strong></li>
            <li>スキップ/警告: <strong>{result.summary.skipped}件</strong></li>
            <li>
              DBにあるが今回ファイルに無い児童: <strong>{result.summary.orphans}人</strong>
              <span className="text-xs text-slate-400">（自動削除はしていません）</span>
            </li>
            <li className="text-xs text-slate-500">
              取込日時: {new Date(result.summary.importedAt).toLocaleString('ja-JP')}
            </li>
          </ul>

          {result.warnings.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs font-bold text-amber-700 cursor-pointer">
                警告の詳細（{result.warnings.length}件）
              </summary>
              <ul className="mt-2 text-xs text-amber-800 space-y-1 max-h-48 overflow-y-auto">
                {result.warnings.map((w, i) => (
                  <li key={i}>・{w.row}行目: {w.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
