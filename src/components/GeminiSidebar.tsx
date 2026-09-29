import React from 'react';
import { Sparkles, Plus, FolderKanban, Search, Globe, Moon, Sun, ShieldCheck, Edit3, Pin } from 'lucide-react';
import { CaseFile, SnsPost, RegisteredClue } from '../types/mystery';

interface GeminiSidebarProps {
  cases: CaseFile[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  registeredClues: RegisteredClue[];
  snsPosts: SnsPost[];
  activeTab: 'chat' | 'sns' | 'clues';
  setActiveTab: (tab: 'chat' | 'sns' | 'clues') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  detectiveName: string;
  onOpenNameModal: () => void;
}

export const GeminiSidebar: React.FC<GeminiSidebarProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onNewCase,
  registeredClues,
  snsPosts,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleTheme,
  isMobileOpen,
  setIsMobileOpen,
  detectiveName,
  onOpenNameModal,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 w-72 bg-[#f0f4f9] dark:bg-[#1e1f20] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 space-y-4">
          {/* Logo Brand: Jimini Detective */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-400 rounded-xl text-white shadow-sm">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-800 dark:text-slate-100">
                  Jimini Detective
                </span>
                <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">
                  AI 수사 & 브라우저 OS
                </span>
              </div>
            </div>
          </div>

          {/* New Case Button */}
          <button
            onClick={() => {
              onNewCase();
              setIsMobileOpen(false);
            }}
            className="w-full py-2.5 px-4 bg-[#dde3ea] hover:bg-[#d0d8e2] dark:bg-[#28292a] dark:hover:bg-[#333537] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full flex items-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-500" />
            <span>새 사건 수사 시작</span>
          </button>

          {/* Navigation Tabs (Chat, Browser, Clues) */}
          <nav className="space-y-1 pt-1">
            {/* 1. Jimini AI Chat */}
            <button
              onClick={() => {
                setActiveTab('chat');
                setIsMobileOpen(false);
              }}
              className={`w-full py-2.5 px-3 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold dark:bg-[#004a77] dark:text-[#c2e7ff]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Jimini AI 수사방</span>
            </button>

            {/* 2. Web OS Browser Tab (Fakebook, Twitter, Insta, Notes) */}
            <button
              onClick={() => {
                setActiveTab('sns');
                setIsMobileOpen(false);
              }}
              className={`w-full py-2.5 px-3 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'sns'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold dark:bg-[#004a77] dark:text-[#c2e7ff]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>웹 브라우저 (SNS 탐색)</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded-full">
                페이드북/트윗처/인스타픽
              </span>
            </button>

            {/* 3. Clues & Evidence Docket */}
            <button
              onClick={() => {
                setActiveTab('clues');
                setIsMobileOpen(false);
              }}
              className={`w-full py-2.5 px-3 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'clues'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-bold dark:bg-[#004a77] dark:text-[#c2e7ff]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pin className="w-4 h-4 text-amber-500" />
                <span>증거 및 수집 단서함</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                registeredClues.length > 0
                  ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {registeredClues.length}
              </span>
            </button>
          </nav>

          {/* Case File List Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-3 mb-2 uppercase tracking-wider">
              사건 파일 선택 (진행도 보존)
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                    activeCaseId === c.id
                      ? 'bg-white dark:bg-[#2e2f31] border border-blue-400/40 shadow-xs'
                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {c.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{c.category}</span>
                    <span className="text-amber-500 font-bold">{c.difficulty}</span>
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Profile & Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full py-2 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}</span>
            </div>
          </button>

          {/* Custom Detective Profile Lockup with Name Editing */}
          <div
            onClick={onOpenNameModal}
            className="flex items-center justify-between p-2 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {detectiveName[0] || 'P'}
              </div>
              <div className="truncate text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{detectiveName} 탐정님</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>수사 면허 발급됨</span>
                </p>
              </div>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
