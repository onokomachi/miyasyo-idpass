import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 min-h-16 flex flex-col sm:flex-row items-center gap-1 sm:gap-4 px-6 py-3 justify-center z-10 mt-auto">
      <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase text-center">
        みやしょうPASS • じぶんの ID・パスワード かんたん確認
      </div>
      <Link
        href="/admin"
        className="text-[10px] font-black text-slate-300 hover:text-slate-500 tracking-wider uppercase transition-colors underline underline-offset-2"
      >
        先生用ページ
      </Link>
    </footer>
  );
}
