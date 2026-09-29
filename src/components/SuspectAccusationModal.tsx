import React, { useState } from 'react';
import { X, Scale, Search, AlertCircle, Sparkles, CheckCircle2, Pin, ShieldAlert } from 'lucide-react';
import { Suspect, RegisteredClue } from '../types/mystery';
import { detectiveFx } from '../utils/detectiveAudio';

interface SuspectAccusationModalProps {
  suspects: Suspect[];
  registeredClues: RegisteredClue[];
  caseTitle: string;
  remainingWarrantAttempts: number;
  isSolved?: boolean;
  onClose: () => void;
  onAccuseSuspect: (suspect: Suspect, actionType: 'interrogate' | 'accuse', selectedClue?: RegisteredClue) => void;
}

export const SuspectAccusationModal: React.FC<SuspectAccusationModalProps> = ({
  suspects,
  registeredClues,
  caseTitle,
  remainingWarrantAttempts,
  isSolved = false,
  onClose,
  onAccuseSuspect,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [selectedClue, setSelectedClue] = useState<RegisteredClue | null>(null);

  // Filter only verified clues
  const verifiedClues = registeredClues.filter(
    (c) => c.verificationStatus === 'verified_true' || c.verificationStatus === 'verified_valid'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18191a]">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base sm:text-lg">
            <Scale className="w-5 h-5 text-rose-500" />
            <span>용의자 지목 & 체포 영장 청구</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Warrant Chances Pill */}
            {!isSolved && (
              <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold rounded-full font-mono">
                ⚖️ 영장 기회 {remainingWarrantAttempts} / 2회 남음
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-slate-200/60 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subheader Notice */}
        {isSolved ? (
          <div className="px-5 sm:px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>🏆 해당 사건의 진범이 이미 정식 체포되어 완벽 해결되었습니다!</span>
          </div>
        ) : (
          <div className="px-5 sm:px-6 py-2.5 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>
              ⚖️ **체포 영장 청구 수칙**: 용의자 지목 시 <strong>[검증된 핵심 증거]</strong>를 함께 선택해야 정식 영장이 발부됩니다. (잘못 지목 시 영장 기회 차감)
            </span>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Step 1: Select Suspect */}
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
              [ 1단계 ] 용의자 선택:
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {suspects.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    setSelectedSuspect(s);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedSuspect?.id === s.id
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 shadow-md ring-2 ring-rose-400/30'
                      : 'bg-white dark:bg-[#28292a] border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold text-sm flex items-center justify-center shrink-0 border border-purple-500/20">
                      {s.avatarLetter || s.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{s.name}</h5>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">
                          {s.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-sm">
                        알리바이: {s.isAlibiRevealed ? s.alibiText : '미확인'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      detectiveFx.playOptionClick();
                      onAccuseSuspect(s, 'interrogate');
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Search className="w-3 h-3 text-blue-500" />
                    <span>집중 심문</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Supporting Verified Clue (Only when not solved) */}
          {!isSolved && selectedSuspect && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 animate-fadeIn">
              <h4 className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400 mb-2 tracking-wider flex items-center justify-between">
                <span>[ 2단계 ] {selectedSuspect.name}의 혐의를 입증할 [검증된 핵심 증거] 선택:</span>
                <span className="text-amber-500 text-[11px]">검증 증거 {verifiedClues.length}건 가능</span>
              </h4>

              {verifiedClues.length === 0 ? (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>아직 [검증된 핵심 증거]가 없습니다!</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    단서함에서 수집한 단서를 **Jimini에게 정밀 감식 요청**하여 '진품 증거'로 검증받은 후 체포 영장을 청구할 수 있습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {verifiedClues.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        detectiveFx.playOptionClick();
                        setSelectedClue(c);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        selectedClue?.id === c.id
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-xs font-bold text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{c.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-md shrink-0">
                        검증 완
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        {!isSolved && selectedSuspect && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18191a] flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              지목 대상: <strong className="text-slate-900 dark:text-slate-100">{selectedSuspect.name}</strong>
              {selectedClue && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  (증거: {selectedClue.title.slice(0, 15)}...)
                </span>
              )}
            </div>

            <button
              disabled={!selectedClue || remainingWarrantAttempts <= 0}
              onClick={() => {
                detectiveFx.playOptionClick();
                if (selectedClue) {
                  onAccuseSuspect(selectedSuspect, 'accuse', selectedClue);
                }
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>⚖️ 체포 영구 집행 (영장 신청)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
