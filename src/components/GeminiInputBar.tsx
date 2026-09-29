import React, { useState } from 'react';
import { Plus, Mic, Send, Sparkles, ChevronDown } from 'lucide-react';
import { detectiveFx } from '../utils/detectiveAudio';

interface GeminiInputBarProps {
  onSendMessage: (text: string) => void;
  isAiThinking: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const GeminiInputBar: React.FC<GeminiInputBarProps> = ({
  onSendMessage,
  isAiThinking,
  selectedModel,
  onSelectModel,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiThinking) return;
    detectiveFx.playMessageSent();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3 pt-2 shrink-0">
      {/* Input Pill Container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#f0f4f9] dark:bg-[#1e1f20] border border-slate-200/80 dark:border-slate-700/80 focus-within:border-blue-400 rounded-full px-4 py-2.5 shadow-md flex items-center gap-3 transition-all"
      >
        <button
          type="button"
          onClick={() => alert('SNS 캡처 사진이나 현장 사진 단서를 추가할 수 있습니다.')}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full cursor-pointer"
          title="사진/단서 파일 추가"
        >
          <Plus className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isAiThinking ? "Jimini AI가 수사 분석 중입니다..." : "Jimini에게 물어보기 또는 수사 지시 입력..."}
          disabled={isAiThinking}
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-hidden font-sans"
        />

        {/* Model Selector Inline Pill */}
        <div className="hidden sm:flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-full text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
          <span>{selectedModel}</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>

        {/* Mic Button */}
        <button
          type="button"
          onClick={() => alert('음성 수사 지시 기능이 준비되었습니다.')}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full cursor-pointer"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isAiThinking}
          className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
        >
          {isAiThinking ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      {/* Footer Disclaimer Text */}
      <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-2 font-sans">
        Jimini는 AI 수사 파트너이며 추리 도중 엉뚱한 가설을 제시할 수 있습니다.{' '}
        <span className="underline cursor-pointer">개인 정보 보호 및 Jimini Detective</span>
      </p>
    </div>
  );
};
