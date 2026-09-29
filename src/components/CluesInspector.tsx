import React, { useState } from 'react';
import {
  Search,
  FolderKanban,
  ShieldCheck,
  Globe,
  Sparkles,
  Trash2,
  AlertTriangle,
  Pin,
  FileText,
  MessageSquare,
  Instagram,
  Twitter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { RegisteredClue } from '../types/mystery';
import { detectiveFx } from '../utils/detectiveAudio';

interface CluesInspectorProps {
  clues: RegisteredClue[];
  caseTitle: string;
  onGoToSns?: () => void;
  onRemoveClue?: (clueId: string) => void;
  onAskJiminiWithClue?: (clue: RegisteredClue) => void;
}

export const CluesInspector: React.FC<CluesInspectorProps> = ({
  clues,
  caseTitle,
  onGoToSns,
  onRemoveClue,
  onAskJiminiWithClue,
}) => {
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'invalid'>('all');

  const verifiedCount = clues.filter(
    (c) => c.verificationStatus === 'verified_true' || c.verificationStatus === 'verified_valid'
  ).length;
  const unverifiedCount = clues.filter(
    (c) => !c.verificationStatus || c.verificationStatus === 'unverified'
  ).length;
  const invalidCount = clues.filter(
    (c) => c.verificationStatus === 'verified_fake' || c.verificationStatus === 'verified_invalid'
  ).length;

  const filteredClues = clues.filter((c) => {
    if (filter === 'verified') {
      return c.verificationStatus === 'verified_true' || c.verificationStatus === 'verified_valid';
    }
    if (filter === 'unverified') {
      return !c.verificationStatus || c.verificationStatus === 'unverified';
    }
    if (filter === 'invalid') {
      return c.verificationStatus === 'verified_fake' || c.verificationStatus === 'verified_invalid';
    }
    return true;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'fadebook':
      case 'fakebook':
        return <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">f</span>;
      case 'twitcher':
      case 'twitter':
        return <Twitter className="w-4 h-4 text-sky-500" />;
      case 'instapic':
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      default:
        return <Pin className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'fadebook':
      case 'fakebook':
        return '페이드북 (Fadebook)';
      case 'twitcher':
      case 'twitter':
        return '𝕏 트위처 (Twitcher)';
      case 'instapic':
      case 'instagram':
        return '인스타픽 (Instapic)';
      case 'field':
        return '현장 수색';
      default:
        return '단서 발췌';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base sm:text-lg">
            <Pin className="w-5 h-5 text-amber-500" />
            <span>수사 증거 및 수집 단서 보관함</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SNS에서 찾은 의심 정황이라도 **Jimini에게 정밀 분석을 요청해 사건의 진짜 핵심 증거인지, 사건과 무관한 잘못된 단서인지 감식**해야 합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full">
            총 {clues.length}건 수집됨
          </span>
        </div>
      </div>

      {/* Case Info bar & Quick Action */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span>사건: <strong className="text-slate-800 dark:text-slate-200">{caseTitle}</strong></span>
        {onGoToSns && (
          <button
            onClick={onGoToSns}
            className="text-blue-500 hover:text-blue-600 font-sans font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>📘 페이드북 & SNS 단서 탐색하러 가기</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {clues.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => {
              detectiveFx.playOptionClick();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            전체 단서 ({clues.length})
          </button>
          <button
            onClick={() => {
              detectiveFx.playOptionClick();
              setFilter('verified');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'verified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>🎯 진품 증거 ({verifiedCount})</span>
          </button>
          <button
            onClick={() => {
              detectiveFx.playOptionClick();
              setFilter('unverified');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'unverified'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>❓ 미검증 ({unverifiedCount})</span>
          </button>
          <button
            onClick={() => {
              detectiveFx.playOptionClick();
              setFilter('invalid');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'invalid'
                ? 'bg-slate-700 text-white shadow-xs dark:bg-slate-600'
                : 'bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>⚠️ 잘못된 단서 ({invalidCount})</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {clues.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-100/70 dark:bg-[#1e1f20]/60 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              아직 수집된 단서가 없습니다
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              <strong>페이드북(Fadebook)</strong>, <strong>트위처(Twitcher)</strong>, <strong>인스타픽(Instapic)</strong>에서 수많은 일상 글 중 의심스러운 <span className="text-blue-500 font-bold">핵심 단어를 클릭</span>해 단서를 찾아보세요!
            </p>
          </div>
          {onGoToSns && (
            <button
              onClick={onGoToSns}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              📘 페이드북 타임라인 탐색하러 가기
            </button>
          )}
        </div>
      ) : filteredClues.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-[#1e1f20] rounded-2xl border border-slate-200 dark:border-slate-800">
          해당 필터에 맞는 단서가 없습니다.
        </div>
      ) : (
        /* Clues Card Grid */
        <div className="grid grid-cols-1 gap-3.5">
          {filteredClues.map((clue) => {
            const isVerifiedTrue =
              clue.verificationStatus === 'verified_true' || clue.verificationStatus === 'verified_valid';
            const isVerifiedInvalid =
              clue.verificationStatus === 'verified_fake' || clue.verificationStatus === 'verified_invalid';

            return (
              <div
                key={clue.id}
                className={`p-4 sm:p-5 bg-white dark:bg-[#1e1f20] border rounded-2xl shadow-xs space-y-3 transition-all ${
                  isVerifiedTrue
                    ? 'border-emerald-500/60 dark:border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isVerifiedInvalid
                    ? 'border-slate-300 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 opacity-90'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {/* Card Header: Platform badge & Verification Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {getPlatformIcon(clue.platform)}
                      <span>{getPlatformName(clue.platform)}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      작성자: <strong className="text-slate-800 dark:text-slate-200">{clue.authorName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Verification Status Pill */}
                    {isVerifiedTrue ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-md flex items-center gap-1 animate-fadeIn">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>🎯 검증된 진품 증거</span>
                      </span>
                    ) : isVerifiedInvalid ? (
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-md flex items-center gap-1 animate-fadeIn">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>⚠️ 사건 무관 (잘못된 단서)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold rounded-md flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                        <span>❓ 미검증 (감식 대기)</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono">
                      {clue.registeredAt}
                    </span>
                  </div>
                </div>

                {/* Clue Title & Excerpt Snippet */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{clue.title}</span>
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                    "{clue.contentSnippet}"
                  </div>
                </div>

                {/* Card Actions: Ask Jimini & Remove */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  {onRemoveClue && (
                    <button
                      onClick={() => {
                        detectiveFx.playOptionClick();
                        onRemoveClue(clue.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="단서함에서 제거"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">단서 등록 해제</span>
                    </button>
                  )}

                  {onAskJiminiWithClue && (
                    <button
                      onClick={() => {
                        detectiveFx.playOptionClick();
                        onAskJiminiWithClue(clue);
                      }}
                      className={`px-3.5 py-1.5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ml-auto transition-all ${
                        isVerifiedTrue
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : isVerifiedInvalid
                          ? 'bg-slate-600 hover:bg-slate-500'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isVerifiedTrue
                          ? 'Jimini와 이 증거로 용의자 몰아붙이기'
                          : isVerifiedInvalid
                          ? 'Jimini에게 재검토 및 반증 확인 요청'
                          : 'Jimini에게 진위 여부 정밀 감식 요청'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
