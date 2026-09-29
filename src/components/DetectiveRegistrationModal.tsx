import React, { useState } from 'react';
import { Sparkles, User, ArrowRight, ShieldCheck, Check, Fingerprint } from 'lucide-react';
import { detectiveFx } from '../utils/detectiveAudio';

interface DetectiveRegistrationModalProps {
  initialName: string;
  onSaveName: (name: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const DetectiveRegistrationModal: React.FC<DetectiveRegistrationModalProps> = ({
  initialName,
  onSaveName,
  isOpen,
}) => {
  const [nameInput, setNameInput] = useState(initialName || 'pai');
  const [selectedSpecialty, setSelectedSpecialty] = useState('사이버 디지털 포렌식');
  const [selectedAvatar, setSelectedAvatar] = useState('🕵️‍♂️');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !agreedToTerms) return;
    detectiveFx.playCaseSolved();
    onSaveName(nameInput.trim());
  };

  const specialties = [
    { title: '사이버 포렌식', desc: 'SNS 타임라인 분석 특화' },
    { title: '범죄 프로파일링', desc: '용의자 진술 추궁 특화' },
    { title: '밀실 트릭 수사', desc: '현장 미세 물증 감식' },
    { title: '금융 & 사기 추적', desc: '은닉 계약서 추적' },
  ];

  const avatars = ['🕵️‍♂️', '🕵️‍♀️', '🔎', '💻', '🕶️', '⚡'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col space-y-6">
        {/* Sleek Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jimini AI Studio Detective Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            탐정 프로필 등록
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            사건 현장 수사 및 포렌식 분석을 위한 수사관 계정을 설정하세요.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Detective Name / Handle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              탐정 닉네임 (활동명) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="수사관 이름 입력 (예: pai, 셜록)"
                maxLength={12}
                required
                autoFocus
                className="w-full py-2.5 px-3.5 pl-10 text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 2. Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              수사관 아바타 선택
            </label>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    setSelectedAvatar(av);
                  }}
                  className={`h-11 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Specialization Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              주 수사 전문 분야
            </label>
            <div className="grid grid-cols-2 gap-2">
              {specialties.map((spec) => {
                const isSelected = selectedSpecialty === spec.title;
                return (
                  <button
                    type="button"
                    key={spec.title}
                    onClick={() => {
                      detectiveFx.playOptionClick();
                      setSelectedSpecialty(spec.title);
                    }}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold truncate">{spec.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{spec.desc}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded-md text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                [필수] 수사 기밀 유지 및 포렌식 조사 수칙에 동의합니다.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!nameInput.trim() || !agreedToTerms}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-40"
          >
            <span>프로필 등록 완료 & 수사 시작</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Minimal Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Jimini AI 미스터리 수사 전용 공인 프로필</span>
        </div>
      </div>
    </div>
  );
};
