import React from 'react';
import { Users, AlertTriangle, ShieldAlert, Scale, Search, Globe, Lock, Unlock, HelpCircle, FileText } from 'lucide-react';
import { Suspect } from '../types/mystery';
import { detectiveFx } from '../utils/detectiveAudio';

interface SuspectsInspectorProps {
  suspects: Suspect[];
  caseTitle: string;
  onAccuseSuspect: (suspect: Suspect, actionType: 'interrogate' | 'accuse') => void;
  onViewSuspectSns?: (handleOrName: string) => void;
}

export const SuspectsInspector: React.FC<SuspectsInspectorProps> = ({
  suspects,
  caseTitle,
  onAccuseSuspect,
  onViewSuspectSns,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base sm:text-lg">
            <Users className="w-5 h-5 text-purple-500" />
            <span>용의자 심문 및 알리바이 프로필</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            수사를 진행하고 SNS를 파헤칠수록 숨겨진 알리바이와 범행 동기가 하나씩 밝혀집니다.
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full shrink-0">
          용의자 {suspects.length}명
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        사건명: <span className="text-slate-800 dark:text-slate-200 font-semibold">{caseTitle}</span>
      </p>

      {/* Suspects List */}
      <div className="space-y-4">
        {suspects.map((s) => (
          <div
            key={s.id}
            className="p-4 sm:p-5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            {/* Header: Avatar, Name, Role, Handle & Status Badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold text-base flex items-center justify-center shrink-0 border border-purple-500/20">
                  {s.avatarLetter || s.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{s.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">({s.role})</span>
                    {s.handle && (
                      <span className="text-[11px] font-mono text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {s.handle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {s.isMotiveRevealed ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>수사 진행: 유력한 범행 동기 포착됨</span>
                      </span>
                    ) : s.isAlibiRevealed ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>수사 진행: 알리바이 진술 검증 중</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">초동 조사 대상자</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-1.5">
                {s.isMotiveRevealed && (
                  <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold rounded-lg flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>동기 확인</span>
                  </span>
                )}
                {s.isAlibiRevealed && (
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold rounded-lg flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    <span>진술 확보</span>
                  </span>
                )}
              </div>
            </div>

            {/* Progressive Alibi & Motive Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {/* Alibi Section */}
              <div className={`p-3 rounded-xl border ${
                s.isAlibiRevealed
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
              }`}>
                <span className="font-bold flex items-center gap-1.5 mb-1 text-slate-700 dark:text-slate-300">
                  {s.isAlibiRevealed ? (
                    <Unlock className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>알리바이 진술:</span>
                </span>
                {s.isAlibiRevealed ? (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{s.alibiText}</p>
                ) : (
                  <p className="text-slate-400 italic">🔒 알리바이 미확인 (Jimini와 심문하거나 SNS 탐색으로 해금)</p>
                )}
              </div>

              {/* Motive Section */}
              <div className={`p-3 rounded-xl border ${
                s.isMotiveRevealed
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
              }`}>
                <span className="font-bold flex items-center gap-1.5 mb-1 text-rose-600 dark:text-rose-400">
                  {s.isMotiveRevealed ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>추정 범행 동기 & 의심점:</span>
                </span>
                {s.isMotiveRevealed && s.motive ? (
                  <p className="text-rose-700 dark:text-rose-300 leading-relaxed">{s.motive}</p>
                ) : (
                  <p className="text-slate-400 italic">🔒 범행 동기 미확인 (비밀 장부/SNS 단서 탐색으로 해금)</p>
                )}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800">
              {onViewSuspectSns && (
                <button
                  onClick={() => onViewSuspectSns(s.name)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-500 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>이 사람의 SNS 피드 조사하기</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    onAccuseSuspect(s, 'interrogate');
                  }}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>🗣️ Jimini와 정밀 심문</span>
                </button>

                <button
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    onAccuseSuspect(s, 'accuse');
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>⚖️ 진범으로 지목</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
