import React from 'react';
import { Terminal, ShieldAlert } from 'lucide-react';

interface AITauntBannerProps {
  tauntText: string;
  isAiThinking?: boolean;
}

export const AITauntBanner: React.FC<AITauntBannerProps> = ({ tauntText, isAiThinking }) => {
  return (
    <div className="w-full bg-slate-950/90 border-y border-rose-500/30 px-4 py-2.5 shadow-md">
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        <div className="p-1.5 bg-rose-950/80 border border-rose-500/50 rounded text-rose-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
        </div>

        <div className="flex-1 font-mono text-xs">
          <div className="flex items-center justify-between text-rose-400 font-bold mb-0.5">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>APEX-9 MASTER CONTROL LOG</span>
            </span>
            {isAiThinking && (
              <span className="text-[10px] text-cyan-400 animate-pulse">
                [ AI 신경망 분석 중... ]
              </span>
            )}
          </div>
          <p className="text-slate-300 leading-snug break-words">
            "{tauntText}"
          </p>
        </div>
      </div>
    </div>
  );
};
