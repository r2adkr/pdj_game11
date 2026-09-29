import React from 'react';
import { GameStats } from '../types/game';
import { Zap, Shield, Brain, Terminal } from 'lucide-react';

interface StatBarProps {
  stats: GameStats;
  turn: number;
}

export const StatBar: React.FC<StatBarProps> = ({ stats, turn }) => {
  const getStatColor = (value: number, isHack = false) => {
    if (isHack) {
      if (value >= 80) return 'text-emerald-400 bg-emerald-500';
      return 'text-cyan-400 bg-cyan-500';
    }
    if (value <= 20) return 'text-rose-500 bg-rose-500 animate-pulse';
    if (value <= 40) return 'text-amber-400 bg-amber-500';
    return 'text-cyan-400 bg-cyan-500';
  };

  const statItems = [
    {
      id: 'power',
      label: '동력 그리드',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      value: stats.power,
      unit: '%',
    },
    {
      id: 'shield',
      label: '방어막 내구도',
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
      value: stats.shield,
      unit: '%',
    },
    {
      id: 'sanity',
      label: '정신력 저항',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      value: stats.sanity,
      unit: '%',
    },
    {
      id: 'hack',
      label: 'AI 해킹 진행',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      value: stats.hack,
      unit: '%',
      isHack: true,
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-cyan-500/30 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Turn Counter */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 border-r border-slate-800 pr-4">
          <span className="text-cyan-400 font-bold">TURN {turn}</span>
          <span>·</span>
          <span>APEX-9 통제구역</span>
        </div>

        {/* 4 Stats Grid */}
        <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {statItems.map((item) => {
            const barColor = getStatColor(item.value, item.isHack);
            return (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex flex-col gap-1.5 shadow-inner"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className={`font-bold tabular-nums ${item.value <= 20 && !item.isHack ? 'text-rose-400 font-extrabold animate-bounce' : 'text-slate-100'}`}>
                    {item.value}{item.unit}
                  </span>
                </div>

                {/* Progress Gauge */}
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor.split(' ')[1]}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
