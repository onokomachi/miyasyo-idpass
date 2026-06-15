'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpPanel({ open, onClose }: HelpPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="mb-8 bg-white border-2 border-slate-200 p-6 rounded-2xl text-slate-700 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-3 text-sm md:text-base">
            <Sparkles className="w-5 h-5 text-blue-600" />
            つかいかた
          </h3>
          <ol className="text-xs md:text-sm space-y-2 text-slate-600 list-decimal pl-4 font-medium">
            <li>
              あおいボタン
              <strong className="text-slate-900 font-bold">「Googleでログイン」</strong>
              をおして、じぶんのアカウントをえらびます。
            </li>
            <li>
              うえのタブ（
              <strong className="text-slate-900 font-bold">Google・スマイルネクスト など</strong>
              ）をえらぶと、しらべたいIDやパスワードがでてきます。
            </li>
            <li>
              よこにある
              <strong className="text-slate-900 font-bold">「コピー」</strong>
              ボタンをおすと、そのままはりつけ（ペースト）できるよ！
            </li>
            <li>
              パスワードは
              <strong className="text-slate-900 font-bold">「めのマーク」</strong>
              をおすと見られるよ。ほかの人に見られないようにきをつけてね。
            </li>
          </ol>
          <button
            onClick={onClose}
            className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-bold block transition-colors cursor-pointer decoration-dotted underline underline-offset-4"
          >
            とじる
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
