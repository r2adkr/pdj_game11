import React from 'react';
import { Volume2, VolumeX, History, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface NavbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLogs: () => void;
  logCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMuted,
  onToggleMute,
  onOpenLogs,
  logCount,
}) => {
  return (
    <header className="w-full bg-slate-950/90 border-b border-cyan-500/30 px-4 md:px-8 py-3.5 flex items-center justify-between backdrop-blur-md z-30">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-rose-400 font-orbitron">
        APEX EVASION
      </a>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-slate-300">
        <span className="text-cyan-400 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Three.js 2D 탐사 필드
        </span>
        <span className="text-slate-500">·</span>
        <span>Reigns 카드 시스템</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Gemini AI 실시간 연동
        </span>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundFx.playTerminalClick();
            onOpenLogs();
          }}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">의사결정 기록</span>
          <span className="bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
            {logCount}
          </span>
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </header>
  );
};
