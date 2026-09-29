import React from 'react';
import { Menu, Sparkles, ChevronDown, MoreVertical, ShieldCheck, Trophy, Scale, Lock } from 'lucide-react';
import { detectiveFx } from '../utils/detectiveAudio';

interface GeminiHeaderProps {
  onToggleMobileSidebar: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  investigationScore: number;
  isSolved: boolean;
  canAccuse: boolean;
  onOpenAccuseModal?: () => void;
}

export const GeminiHeader: React.FC<GeminiHeaderProps> = ({
  onToggleMobileSidebar,
  selectedModel,
  onSelectModel,
  investigationScore,
  isSolved,
  canAccuse,
  onOpenAccuseModal,
}) => {
  return (
    <header className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
      {/* Left Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown with Jimini branding */}
        <div className="relative group">
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-[#1e1f20] text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-hidden hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <option value="Jimini-Lite">Jimini Flash-Lite (빠른 수사)</option>
            <option value="Jimini-Pro">Jimini-Pro (정밀 심문 연산)</option>
            <option value="Jimini-Detective">Jimini Detective (명탐정 모드)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Investigation Progress Gauge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-full text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">수사 진척도:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{investigationScore}%</span>
        </div>
      </div>

      {/* Right Area: Conditionally Unlocked Accuse Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isSolved ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full shadow-2xs animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            <span>🏆 사건 해결 완료!</span>
          </div>
        ) : onOpenAccuseModal && (
          canAccuse ? (
            <button
              onClick={() => {
                detectiveFx.playOptionClick();
                onOpenAccuseModal();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/30 cursor-pointer active:scale-95 animate-pulse"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">⚖️ 진범 지목하기 (단서 확보됨)</span>
              <span className="sm:hidden">진범 지목</span>
            </button>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-200 dark:border-slate-700"
              title="Jimini와 수사를 진행하고 SNS 단서를 수집하면 진범 지목이 해금됩니다"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>진범 지목 잠김 (수사 필요)</span>
            </div>
          )
        )}

        {/* Upgrade Button */}
        <button
          onClick={() => alert('Jimini Pro 탐정 전용 수사 기능이 모두 활성화되어 있습니다.')}
          className="hidden xs:flex px-3.5 py-1.5 bg-[#c2e7ff] hover:bg-[#b2dcfa] text-[#001d35] font-bold text-xs rounded-full items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-[#001d35]" />
          <span>Jimini Pro</span>
        </button>

        <button className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
