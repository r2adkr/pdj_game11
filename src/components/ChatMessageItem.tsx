import React from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, RotateCw, Copy, MoreHorizontal, Check, Search, Scale, Globe, Lock } from 'lucide-react';
import { ChatMessage, OptionButton } from '../types/mystery';
import { detectiveFx } from '../utils/detectiveAudio';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectOption: (option: OptionButton) => void;
  onOpenAccuseModal?: () => void;
  isLatestMessage: boolean;
  isAiThinking: boolean;
  isStreaming?: boolean;
  canAccuse?: boolean;
  isSolved?: boolean;
}

// Clean and format Markdown for detective narrative
const renderInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;

  // Clean empty double or quadruple asterisks like **** or ***
  const cleaned = text.replace(/\*{4,}/g, '').replace(/\*{3}/g, '');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // Regex matches **bold text** or *italic text* or `code`
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleaned.substring(lastIndex, match.index));
    }
    if (match[2]) {
      // Bold text
      parts.push(
        <strong key={`bold_${match.index}`} className="font-extrabold text-blue-600 dark:text-blue-400">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic text
      parts.push(
        <em key={`italic_${match.index}`} className="italic text-slate-700 dark:text-slate-300">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // Code snippet
      parts.push(
        <code key={`code_${match.index}`} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-300 rounded text-xs font-mono">
          {match[4]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < cleaned.length) {
    parts.push(cleaned.substring(lastIndex));
  }

  return parts.length > 0 ? parts : cleaned;
};

const renderFormattedDetectiveDialogue = (rawText: string) => {
  if (!rawText) return null;

  // Clean up any stray quadruple asterisks
  const sanitized = rawText.replace(/\*{4,}/g, '');
  const lines = sanitized.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`empty_${idx}`} className="h-2" />;
    }

    // Header match (e.g. "### 1. 현장 수색" or "# 사건 요약")
    const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headerMatch) {
      return (
        <h4 key={`header_${idx}`} className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 mt-2 mb-1 flex items-center gap-1.5">
          <span>{renderInlineMarkdown(headerMatch[2])}</span>
        </h4>
      );
    }

    // Numbered list item (e.g. "1. **환기구 철사 조작 흔적**:")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={`num_${idx}`} className="flex items-start gap-2 my-1.5 pl-1">
          <span className="w-4 h-4 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            {numberedMatch[1]}
          </span>
          <div className="flex-1 leading-relaxed text-xs sm:text-sm">
            {renderInlineMarkdown(numberedMatch[2])}
          </div>
        </div>
      );
    }

    // Bullet item (e.g. "- 열쇠 손잡이 부분에서")
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={`bullet_${idx}`} className="flex items-start gap-2 my-1 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
          <div className="flex-1 leading-relaxed text-xs sm:text-sm">
            {renderInlineMarkdown(bulletMatch[1])}
          </div>
        </div>
      );
    }

    // Blockquote
    const quoteMatch = line.match(/^>\s+(.*)/);
    if (quoteMatch) {
      return (
        <div key={`quote_${idx}`} className="border-l-2 border-blue-500 pl-3 my-1.5 text-slate-600 dark:text-slate-300 italic bg-blue-50/40 dark:bg-blue-950/20 py-1.5 rounded-r-lg text-xs sm:text-sm">
          {renderInlineMarkdown(quoteMatch[1])}
        </div>
      );
    }

    // Standard paragraph
    return (
      <p key={`p_${idx}`} className="leading-relaxed text-xs sm:text-sm">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectOption,
  onOpenAccuseModal,
  isLatestMessage,
  isAiThinking,
  isStreaming = false,
  canAccuse = false,
  isSolved = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end my-3 sm:my-4 animate-fadeIn">
        <div className="flex items-center gap-2">
          {message.selectedOptionNumber !== undefined ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e3e3e3] dark:bg-[#28292a] text-slate-800 dark:text-slate-100 font-bold text-sm flex items-center justify-center shadow-xs border border-slate-300 dark:border-slate-700">
              {message.selectedOptionNumber}
            </div>
          ) : (
            <div className="max-w-lg bg-[#e3e3e3] dark:bg-[#28292a] text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 my-4 sm:my-5 max-w-3xl animate-fadeIn">
      {/* Jimini AI Sparkle Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-400 p-1.5 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 fill-white" />
      </div>

      <div className="flex-1 space-y-3">
        {/* New Clues Alert Banner (Only show when not streaming or clue found) */}
        {!isStreaming && message.newCluesFound && message.newCluesFound.length > 0 && (
          <div className="p-3 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-1 text-xs">
            <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>새로운 핵심 단서 확보! ({message.newCluesFound.length}건)</span>
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5">
              {message.newCluesFound.map((clue, idx) => (
                <li key={idx} className="font-medium">{clue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Response Text with pristine markdown and streaming support */}
        <div
          className={`text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5 font-sans ${
            isStreaming ? 'typing-cursor' : ''
          }`}
        >
          {renderFormattedDetectiveDialogue(message.text)}
        </div>

        {/* Action Toolbar (visible when streaming finished) */}
        {!isStreaming && (
          <div className="flex items-center gap-1 pt-1 text-slate-400">
            <button
              onClick={() => detectiveFx.playOptionClick()}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="도움이 됨"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => detectiveFx.playOptionClick()}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="다른 추리 요청"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => detectiveFx.playOptionClick()}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="다시 생성"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="텍스트 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Interactive Choice Option Buttons (Rendered only when finished streaming) */}
        {!isStreaming && message.options && message.options.length > 0 && isLatestMessage && (
          <div className="pt-3 space-y-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                [ 수사 행동 선택지 ] - 클릭하여 Jimini에게 지시 전달:
              </p>

              {onOpenAccuseModal && canAccuse && !isSolved && (
                <button
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    onOpenAccuseModal();
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer active:scale-95 animate-pulse"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>⚖️ 진범 지목하기 (단서 확보 완료)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isAiThinking}
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    onSelectOption(opt);
                  }}
                  className="w-full text-left p-3 bg-white dark:bg-[#1e1f20] hover:bg-blue-50 dark:hover:bg-[#2e2f31] border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-2xs flex items-start gap-2.5 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {opt.id}
                  </span>
                  <div className="flex-1">
                    <span className="leading-snug">{opt.label}</span>
                    {opt.isSnsClue && (
                      <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded font-mono">
                        <Globe className="w-2.5 h-2.5" />
                        <span>SNS 단서</span>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
