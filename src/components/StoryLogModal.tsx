import React from 'react';
import { StoryLogEntry } from '../types/game';
import { X, History, Terminal } from 'lucide-react';

interface StoryLogModalProps {
  logs: StoryLogEntry[];
  onClose: () => void;
}

export const StoryLogModal: React.FC<StoryLogModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
            <History className="w-4 h-4" />
            <span>작전 의사결정 수행 기록 ({logs.length}건)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-center text-slate-500 py-8">아직 기록된 의사결정이 없습니다.</p>
          ) : (
            logs.slice().reverse().map((log) => (
              <div key={log.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">TURN {log.turn}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{log.title}</span>
                </div>
                <p className="text-slate-300">
                  <span className="text-slate-400">화자:</span> {log.speaker}
                </p>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-cyan-300">
                  선택: <span className="font-semibold text-white">{log.choiceMade}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
