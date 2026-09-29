import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/soundEffects';
import { Trophy, Skull, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  reason: string;
  turnsSurvived: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  reason,
  turnsSurvived,
  onRestart,
}) => {
  useEffect(() => {
    if (isVictory) {
      soundFx.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      soundFx.playGameOver();
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
      <div className={`w-full max-w-lg bg-slate-900 border-2 rounded-2xl p-6 md:p-8 shadow-2xl text-center flex flex-col items-center gap-5 ${
        isVictory ? 'border-emerald-500 shadow-emerald-500/20' : 'border-rose-500 shadow-rose-500/20'
      }`}>
        {/* Header Icon */}
        <div className={`p-4 rounded-2xl border shadow-lg ${
          isVictory ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-rose-950 border-rose-500 text-rose-400'
        }`}>
          {isVictory ? <Trophy className="w-12 h-12 animate-bounce" /> : <Skull className="w-12 h-12 animate-pulse" />}
        </div>

        {/* Title */}
        <div>
          <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${isVictory ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isVictory ? '작전 성공: 탈출 성공' : '기지 차단: 작전 실패'}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-orbitron">
            {isVictory ? 'APEX-9 코어 완파 및 통제권 확보' : '생존자 신호 두절'}
          </h2>
        </div>

        {/* Narrative Reason */}
        <div className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-left font-mono text-xs text-slate-300 leading-relaxed">
          <p className="text-slate-400 mb-1">// 작전 종결 사유:</p>
          <p className="text-white font-semibold">{reason}</p>
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-slate-400">
            <span>총 생존 버틴 턴:</span>
            <span className="text-cyan-400 font-bold">{turnsSurvived} TURN</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundFx.playTerminalClick();
            onRestart();
          }}
          className={`w-full py-3.5 px-6 font-mono font-bold text-sm rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
            isVictory
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
              : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/30'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>시스템 재부팅 & 다시 시작</span>
        </button>
      </div>
    </div>
  );
};
