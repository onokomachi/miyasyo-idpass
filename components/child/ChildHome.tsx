'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getClientAuth, getGoogleProvider } from '@/lib/firebase/client';
import { useAuthStore } from '@/lib/store/authStore';
import type { SanitizedStudent } from '@/lib/model/student';
import { playChime } from '@/lib/sound';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import HelpPanel from '@/components/ui/HelpPanel';
import SignInScreen from '@/components/child/SignInScreen';
import RejectedScreen from '@/components/child/RejectedScreen';
import StudentHeader from '@/components/child/StudentHeader';
import ServiceTabs from '@/components/child/ServiceTabs';

export default function ChildHome() {
  const { status, user, record, setStatus, setUser, setRecord, reset } =
    useAuthStore();
  const [showHelp, setShowHelp] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // 本人データを取得する。
  const fetchMe = useCallback(async () => {
    setStatus('fetching');
    try {
      const idToken = await getClientAuth().currentUser?.getIdToken();
      if (!idToken) {
        setStatus('signedOut');
        return;
      }
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.status === 404) {
        setRecord(null);
        setStatus('rejected');
        playChime(false);
        return;
      }
      if (!res.ok) {
        setStatus('error');
        return;
      }
      const data = (await res.json()) as { student: SanitizedStudent };
      setRecord(data.student);
      setStatus('ready');
      playChime(true);
    } catch {
      setStatus('error');
    }
  }, [setStatus, setRecord]);

  // Firebase の認証状態を監視。
  useEffect(() => {
    const unsub = onAuthStateChanged(getClientAuth(), (u) => {
      setUser(u);
      if (u) {
        fetchMe();
      } else {
        reset();
      }
    });
    return () => unsub();
  }, [fetchMe, setUser, reset]);

  const handleSignIn = useCallback(async () => {
    setSignInError(null);
    try {
      await signInWithPopup(getClientAuth(), getGoogleProvider());
      // onAuthStateChanged が fetchMe を呼ぶ
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return; // ユーザーが閉じただけ
      }
      setSignInError('ログインできませんでした。もう一度ためしてね。');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(getClientAuth());
    reset();
  }, [reset]);

  const isLoading = status === 'loading' || status === 'fetching';

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col overflow-x-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-35 pointer-events-none z-0" />

      <Header
        subtitle="じぶんの ID・パスワード かんたん確認"
        onHelpClick={() => setShowHelp((v) => !v)}
        onLogout={status === 'ready' || status === 'rejected' ? handleLogout : undefined}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center relative z-10">
        <HelpPanel open={showHelp} onClose={() => setShowHelp(false)} />

        {isLoading && (
          <div className="text-center text-slate-400 font-bold py-20">
            よみこみちゅう…
          </div>
        )}

        {!isLoading && status === 'signedOut' && (
          <SignInScreen onSignIn={handleSignIn} busy={false} error={signInError} />
        )}

        {!isLoading && status === 'rejected' && (
          <RejectedScreen email={user?.email} onBack={handleLogout} />
        )}

        {!isLoading && status === 'error' && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-8 text-center max-w-md w-full mx-auto">
            <p className="font-extrabold text-rose-800 mb-2">
              つうしんエラーがおきました。
            </p>
            <p className="text-xs text-rose-600 mb-6 leading-relaxed">
              じかんをおいて もう一度ためすか、ログインしなおしてね。
              なおらないときは 先生（せんせい）に きいてね。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchMe}
                className="h-12 px-6 rounded-2xl font-extrabold text-sm bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                もう一度ためす
              </button>
              <button
                onClick={handleLogout}
                className="h-12 px-6 rounded-2xl font-extrabold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                トップにもどる
              </button>
            </div>
          </div>
        )}

        {!isLoading && status === 'ready' && record && (
          <div className="space-y-6">
            <StudentHeader student={record} />
            <ServiceTabs student={record} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
