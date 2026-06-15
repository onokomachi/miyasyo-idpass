import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smile, 
  Key, 
  Calendar, 
  Search, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Volume2, 
  HelpCircle, 
  School, 
  Sparkles, 
  RefreshCw,
  ArrowRight,
  Info,
  ChevronDown,
  User,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { STUDENTS_DATA, Student } from './data';

export default function App() {
  // Input states
  const [selectedNum, setSelectedNum] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  
  // App states
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedPw, setCopiedPw] = useState<boolean>(false);
  const [showHowToUse, setShowHowToUse] = useState<boolean>(false);
  const [showTeacherList, setShowTeacherList] = useState<boolean>(false);
  const [teacherPass, setTeacherPass] = useState<string>('');
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  
  // Filterable class list for children or teachers
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Set default birthday lists dynamically
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (month: number) => {
    if ([4, 6, 9, 11].includes(month)) return 30;
    if (month === 2) return 29; // Cover 2016 leap year beautifully
    return 31;
  };
  const currentMonthNum = selectedMonth ? parseInt(selectedMonth, 10) : 12;
  const days = Array.from({ length: getDaysInMonth(currentMonthNum) }, (_, i) => i + 1);

  // When month changes, check if the current day is still valid
  useEffect(() => {
    if (selectedMonth && selectedDay) {
      const maxDay = getDaysInMonth(parseInt(selectedMonth, 10));
      if (parseInt(selectedDay, 10) > maxDay) {
        setSelectedDay('');
      }
    }
  }, [selectedMonth]);

  // Handler to verify matching details
  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setCurrentUser(null);
    setCopiedId(false);
    setCopiedPw(false);

    if (!selectedNum || !selectedMonth || !selectedDay) {
      return;
    }

    const num = parseInt(selectedNum, 10);
    const month = parseInt(selectedMonth, 10);
    const day = parseInt(selectedDay, 10);

// Target find
    const match = STUDENTS_DATA.find(
      (s) => s.id === num && s.birthMonth === month && s.birthDay === day
    );

    if (match) {
      setCurrentUser(match);
      playChime(true);
    } else {
      setIsError(true);
      playChime(false);
    }
  };

  // Modern Audio Synthesizer playing a cute "Pikon!" chimb sound
  const playChime = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (success) {
        // High-pitched retro double beep ("Pikon!" sound)
        // Tune 1: C5 (523.25Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.08);

        // Tune 2: C6 (1046.50Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, now + 0.07);
        
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.15, now + 0.07);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.07);
        osc2.stop(now + 0.25);
      } else {
        // Warning chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle clipboard copies with cool feedback
  const copyToClipboard = (text: string, type: 'id' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 2000);
    }
    playChime(true);
  };

  const handleReset = () => {
    setSelectedNum('');
    setSelectedMonth('');
    setSelectedDay('');
    setCurrentUser(null);
    setIsError(false);
    setShowPassword(false);
    setCopiedId(false);
    setCopiedPw(false);
  };

  const handleTeacherAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPass === 'smilenext') {
      setIsTeacherAuthenticated(true);
      setTeacherPass('');
    } else {
      alert('パスワードがちがいます！');
    }
  };

  // Filter students based on search
  const filteredStudents = STUDENTS_DATA.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.includes(term) ||
      student.kana.includes(term) ||
      student.id.toString() === term ||
      `${student.birthMonth}/${student.birthDay}`.includes(term) ||
      student.smileId.includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative font-sans text-slate-800 flex flex-col antialiased overflow-x-hidden">
      
      {/* Background dot grid for modern visual appeal */}
      <div className="absolute inset-0 bg-dot-grid opacity-35 pointer-events-none z-0" />
      
      {/* Header Panel */}
      <header className="h-20 bg-white border-b border-slate-250 flex items-center px-6 md:px-12 justify-between z-10 sticky top-0 shadow-3xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
            ス
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              スマネクパス
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider hidden sm:block">
              4年3組 スマイルネクスト ID・パスワードかんたん確認
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHowToUse(!showHowToUse)}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors px-4 py-2 rounded-xl font-extrabold cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>つかいかた</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center relative z-10">
        
        {/* Help Panel */}
        <AnimatePresence>
          {showHowToUse && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="mb-8 bg-white border-2 border-slate-200 p-6 rounded-2xl text-slate-700 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-550/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-3 text-sm md:text-base">
                <Sparkles className="w-5 h-5 text-blue-600" />
                IDのしらべかた
              </h3>
              <ol className="text-xs md:text-sm space-y-2 text-slate-600 list-decimal pl-4 font-medium">
                <li>
                  じぶんの<strong className="text-slate-900 font-bold">「しゅっせきばんごう」</strong>をえらびます。
                </li>
                <li>
                  じぶんの<strong className="text-slate-900 font-bold">「おたんじょうび（月 と 日）」</strong>をえらびます。
                </li>
                <li>
                  黒いボタン<strong className="text-slate-900 font-bold">「IDをしらべる」</strong>をおすと、となりに情報がでてきます。
                </li>
                <li>
                  IDのよこにある<strong className="text-slate-900 font-bold">「コピー」</strong>ボタンをおすと、スマイルネクストの画面でそのままペースト（貼りつけ）できるよ！
                </li>
              </ol>
              <button
                onClick={() => setShowHowToUse(false)}
                className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-bold block transition-colors cursor-pointer decoration-dotted underline underline-offset-4"
              >
                ガイドを閉じる
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simplistic Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full mb-8">
          
          {/* Form Side */}
          <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl flex flex-col justify-center shadow-3xs">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                ID・PASSけんさく
              </h1>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                出席番号と誕生日をえらんで、「IDをしらべる」をおしてね。
              </p>

              <form onSubmit={handleCheck} className="space-y-6">
                
                {/* Attendance number dropdown */}
                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 block">
                    出席番号（しゅっせきばんごう）
                  </label>
                  <div className="relative">
                    <select
                      id="student-id-select"
                      value={selectedNum}
                      onChange={(e) => {
                        setSelectedNum(e.target.value);
                        setIsError(false);
                      }}
                      className="w-full h-14 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm text-slate-800 cursor-pointer appearance-none outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all font-bold"
                    >
                      <option value="">出席番号をえらんでね</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num.toString()}>
                          {num}番
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Birthday selection dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 block">
                      生まれた月（がつ）
                    </label>
                    <div className="relative">
                      <select
                        id="birth-month-select"
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          setIsError(false);
                        }}
                        className="w-full h-14 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm text-slate-800 cursor-pointer appearance-none outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all font-bold"
                      >
                        <option value="">月をえらぶ</option>
                        {months.map((m) => (
                          <option key={m} value={m.toString()}>
                            {m}月
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 block">
                      生まれた日（にち）
                    </label>
                    <div className="relative">
                      <select
                        id="birth-day-select"
                        value={selectedDay}
                        disabled={!selectedMonth}
                        onChange={(e) => {
                          setSelectedDay(e.target.value);
                          setIsError(false);
                        }}
                        className={`w-full h-14 border-2 rounded-xl px-4 text-sm font-bold appearance-none outline-hidden transition-all ${
                          selectedMonth 
                            ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 cursor-pointer focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <option value="">日をえらぶ</option>
                        {days.map((d) => (
                          <option key={d} value={d.toString()}>
                            {d}日
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  disabled={!selectedNum || !selectedMonth || !selectedDay}
                  className={`w-full h-14 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 tracking-wide ${
                    selectedNum && selectedMonth && selectedDay
                      ? 'bg-slate-900 border-2 border-slate-950 text-white hover:bg-slate-800 cursor-pointer transform active:scale-[0.99]'
                      : 'bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>IDをしらべる</span>
                </button>
              </form>

              {/* Reset helper */}
              {(selectedNum || selectedMonth || selectedDay) && (
                <div className="mt-5 flex justify-start">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors font-bold cursor-pointer py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-rose-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>はじめからやりなおす</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Result Card Side */}
          <div className="flex flex-col justify-stretch">
            <AnimatePresence mode="wait">
              {currentUser ? (
                <motion.div
                  key="result-auth-card"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  transition={{ type: "spring", stiffness: 220, damping: 25 }}
                  className="bg-blue-600 rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between h-full shadow-lg relative overflow-hidden min-h-[380px]"
                >
                  {/* Subtle decorative glow element */}
                  <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full pointer-events-none" />

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-white/20">
                      <div className="text-xs font-bold tracking-wider text-white/80">
                        しらべた結果（けっか）
                      </div>
                      
                      <div className="flex gap-2">
                        <span className="bg-emerald-500 text-[10px] px-2.5 py-1 rounded-full font-extrabold tracking-wider text-white">
                          あっていたよ！
                        </span>
                      </div>
                    </div>

                    {/* Name detail card block */}
                    <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0">
                        👤
                      </div>
                      <div>
                        <div className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
                          {currentUser.id}番
                        </div>
                        <div className="text-lg font-black flex items-baseline gap-1.5">
                          {currentUser.name}
                          <span className="text-xs font-medium text-white/80">
                            さん
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* SMILE ID BLOCK */}
                      <div>
                        <div className="text-xs font-bold text-white/70 mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Smile Next ID（スマイルネクスト アイディー）
                        </div>
                        <div className="flex items-center justify-between bg-white/10 rounded-xl p-3.5 border border-white/10">
                          <span id="smile-id-text" className="text-2xl md:text-3xl font-mono font-black tracking-tight select-all">
                            {currentUser.smileId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(currentUser.smileId, 'id')}
                            className={`text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-all outline-hidden cursor-pointer ${
                              copiedId 
                                ? 'bg-emerald-500 text-white shadow-xs' 
                                : 'bg-white/15 hover:bg-white/25 text-white'
                            }`}
                          >
                            {copiedId ? (
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

                      {/* PASSWORD BLOCK */}
                      <div>
                        <div className="text-xs font-bold text-white/70 mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          パスワード
                        </div>
                        <div className="flex items-center justify-between bg-white/10 rounded-xl p-3.5 border border-white/10">
                          <span id="smile-password-text" className="text-2xl md:text-3xl font-mono font-black tracking-tight select-all">
                            {showPassword ? currentUser.password : '••••••'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1 px-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                              title={showPassword ? "かくす" : "ひょうじ"}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(currentUser.password, 'password')}
                              className={`text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-all outline-hidden cursor-pointer ${
                                copiedPw 
                                  ? 'bg-emerald-500 text-white shadow-xs' 
                                  : 'bg-white/15 hover:bg-white/25 text-white'
                              }`}
                            >
                              {copiedPw ? (
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
                        <p className="text-[10px] text-white/70 mt-2 font-medium">※ パスワードは「111111」の人がおおいよ！</p>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="result-placeholder-card"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="border-2 border-dashed border-slate-250 rounded-3xl p-8 text-slate-400 flex flex-col justify-center items-center text-center min-h-[380px] bg-slate-50/50"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-300 shadow-3xs">
                      <Key className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-extrabold text-base mb-1">ここにしらべた結果がでるよ</h3>
                      <p className="text-xs leading-relaxed text-slate-400 max-w-xs mx-auto">
                        左がわのフォームから「出席番号（ばんごう）」と「誕生日（たんじょうび）」をえらんで、ボタンをおしてください。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Error Notification when details do not match */}
        <AnimatePresence>
          {isError && !currentUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 text-rose-800 flex items-start gap-4 mb-4"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-rose-950 text-sm">
                  あれれ？ 番号かお誕生日がちがうみたいだよ！
                </h4>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed font-semibold">
                  えらび間違いがないか、もう一度「出席番号（ばんごう）」と「誕生日（おたんじょうび）」をたしかめてみてね！
                </p>
                <span className="text-[10px] text-rose-500 font-bold block mt-2">
                  ※ ぜんぜん確認できないときは、先生（せんせい）にきいてみてね。
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer copyright and balance footer */}
      <footer className="bg-white border-t border-slate-200 h-16 flex items-center px-6 justify-center z-10 mt-auto">
        <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase text-center">
          スマネクパス • 4年3組 スマイルネクスト ID確認アシスタント
        </div>
      </footer>
    </div>
  );
}
