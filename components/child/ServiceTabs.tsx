'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Smile, Sprout, Tablet, type LucideIcon } from 'lucide-react';
import type { SanitizedStudent } from '@/lib/model/student';
import { useAuthStore, type ServiceTab } from '@/lib/store/authStore';
import CredentialField from '@/components/child/CredentialField';

interface FieldDef {
  label: string;
  value: string;
  secret?: boolean;
  accent?: 'emerald' | 'amber' | 'sky';
}

interface TabDef {
  id: ServiceTab;
  label: string;
  icon: LucideIcon;
  fields: FieldDef[];
}

function buildTabs(s: SanitizedStudent): TabDef[] {
  const tabs: TabDef[] = [];

  if (s.google?.email || s.google?.password) {
    const fields: FieldDef[] = (
      [
        { label: 'Gmail アドレス', value: s.google.email, accent: 'sky' },
        { label: 'パスワード', value: s.google.password, secret: true, accent: 'amber' },
      ] as FieldDef[]
    ).filter((f) => f.value);
    tabs.push({ id: 'google', label: 'Google', icon: Mail, fields });
  }

  if (s.smileNext?.id || s.smileNext?.password) {
    const fields: FieldDef[] = [];
    if (s.smileNext.id) fields.push({ label: 'ID（アイディー）', value: s.smileNext.id, accent: 'emerald' });
    if (s.smileNext.password) fields.push({ label: 'パスワード', value: s.smileNext.password, secret: true, accent: 'amber' });
    tabs.push({ id: 'smileNext', label: 'スマイルネクスト', icon: Smile, fields });
  }

  if (s.miraiSeed?.password) {
    tabs.push({
      id: 'miraiSeed',
      label: 'ミライシード',
      icon: Sprout,
      fields: [
        { label: 'パスワード', value: s.miraiSeed.password, secret: true, accent: 'amber' },
      ],
    });
  }

  if (s.ipadSerial) {
    tabs.push({
      id: 'ipad',
      label: 'iPad',
      icon: Tablet,
      fields: [{ label: 'きたいばんごう（機体番号）', value: s.ipadSerial, accent: 'sky' }],
    });
  }

  return tabs;
}

export default function ServiceTabs({ student }: { student: SanitizedStudent }) {
  const activeTab = useAuthStore((s) => s.activeTab);
  const setActiveTab = useAuthStore((s) => s.setActiveTab);

  const tabs = buildTabs(student);
  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  // 選択中のタブが無効になった場合は先頭タブへ。
  useEffect(() => {
    if (current && current.id !== activeTab) {
      setActiveTab(current.id);
    }
  }, [current, activeTab, setActiveTab]);

  if (!current) return null;

  return (
    <div>
      {/* タブバー */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === current.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer border-2 ${
                active
                  ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 中身カード */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/20">
            <current.icon className="w-5 h-5" />
            <div className="text-sm font-extrabold tracking-wide">{current.label}</div>
          </div>
          {current.fields.map((f) => (
            <CredentialField
              key={f.label}
              label={f.label}
              value={f.value}
              secret={f.secret}
              accent={f.accent}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
