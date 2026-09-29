import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { StoryCard } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import { Bot, ShieldAlert, Cpu, UserCheck, AlertTriangle, Ghost, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface ReignsCardProps {
  card: StoryCard;
  onChoice: (choice: 'left' | 'right') => void;
  isAiGenerating?: boolean;
}

export const ReignsCard: React.FC<ReignsCardProps> = ({ card, onChoice, isAiGenerating }) => {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-18, 18]);

  const getAvatarIcon = (type?: string) => {
    switch (type) {
      case 'ai':
        return <Cpu className="w-10 h-10 text-rose-400 animate-pulse" />;
      case 'drone':
        return <Bot className="w-10 h-10 text-amber-400" />;
      case 'terminal':
        return <ShieldAlert className="w-10 h-10 text-cyan-400" />;
      case 'survivor':
        return <UserCheck className="w-10 h-10 text-emerald-400" />;
      case 'alarm':
        return <AlertTriangle className="w-10 h-10 text-orange-500 animate-bounce" />;
      case 'ghost':
        return <Ghost className="w-10 h-10 text-purple-400" />;
      default:
        return <Cpu className="w-10 h-10 text-cyan-400" />;
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      soundFx.playCardSelect();
      onChoice('right');
    } else if (info.offset.x < -100) {
      soundFx.playCardSelect();
      onChoice('left');
    }
    setDragOffset(0);
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center p-2">
      {/* Choice Indicator Prompts */}
      <div className="w-full flex justify-between items-center mb-3 px-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            dragOffset < -20
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 scale-105 shadow-md shadow-rose-500/20'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[A] {card.leftChoice.label}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            dragOffset > 20
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 scale-105 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
          }`}
        >
          <span>[B] {card.rightChoice.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Draggable Reigns Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDrag={(_, info) => {
            setDragOffset(info.offset.x);
            if (Math.abs(info.offset.x) % 30 < 5) soundFx.playSwipe();
          }}
          onDragEnd={handleDragEnd}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          whileTap={{ cursor: 'grabbing' }}
          className="relative w-full bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50 backdrop-blur-md cursor-grab overflow-hidden select-none"
        >
          {/* Card Top Speaker Lockup */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-inner">
              {getAvatarIcon(card.avatarType)}
            </div>
            <div>
              <p className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-0.5">
                {card.speaker}
              </p>
              <h3 className="text-lg font-bold text-slate-100 font-orbitron tracking-wide">
                {card.title}
              </h3>
            </div>
          </div>

          {/* Card Story Narrative Body */}
          <div className="min-h-[110px] flex items-center mb-6">
            <p className="text-sm leading-relaxed text-slate-300 font-sans">
              {card.description}
            </p>
          </div>

          {/* Drag Overlay Cue Indicators */}
          {dragOffset < -40 && (
            <div className="absolute inset-0 bg-rose-950/40 border-2 border-rose-500 rounded-2xl flex items-center justify-center p-6 text-center backdrop-blur-xs">
              <span className="text-xl font-bold font-mono text-rose-300 bg-rose-950/90 border border-rose-500 px-4 py-2 rounded-lg shadow-xl">
                ← {card.leftChoice.label}
              </span>
            </div>
          )}

          {dragOffset > 40 && (
            <div className="absolute inset-0 bg-cyan-950/40 border-2 border-cyan-500 rounded-2xl flex items-center justify-center p-6 text-center backdrop-blur-xs">
              <span className="text-xl font-bold font-mono text-cyan-300 bg-cyan-950/90 border border-cyan-500 px-4 py-2 rounded-lg shadow-xl">
                {card.rightChoice.label} →
              </span>
            </div>
          )}

          {/* Footer Drag Tip */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span>◄ 좌/우로 카드를 드래그 ►</span>
            {isAiGenerating && (
              <span className="flex items-center gap-1 text-cyan-400 animate-pulse">
                <Sparkles className="w-3 h-3" />
                Gemini AI 동적 상황 생성중...
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Direct Choice Buttons for Mobile & Quick Taps */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => {
            soundFx.playCardSelect();
            onChoice('left');
          }}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-rose-950/60 border border-rose-500/50 hover:border-rose-400 text-rose-200 text-xs font-mono font-semibold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-left"
        >
          <div className="text-[10px] text-rose-400 uppercase tracking-widest mb-0.5">선택 A</div>
          <div>{card.leftChoice.label}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playCardSelect();
            onChoice('right');
          }}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-cyan-950/60 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 text-xs font-mono font-semibold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-right"
        >
          <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-0.5">선택 B</div>
          <div>{card.rightChoice.label}</div>
        </button>
      </div>
    </div>
  );
};
