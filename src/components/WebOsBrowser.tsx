import React, { useState } from 'react';
import {
  Globe,
  Twitter,
  Instagram,
  FileText,
  Lock,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  Sparkles,
  Heart,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { SnsPost, SnsComment, RegisteredClue } from '../types/mystery';
import { detectiveFx } from '../utils/detectiveAudio';

interface WebOsBrowserProps {
  posts: SnsPost[];
  caseTitle: string;
  registeredClues: RegisteredClue[];
  onFoundClueSentence: (post: SnsPost, sentenceText: string, clueTitle?: string, clueSummary?: string) => void;
  onFoundClueComment: (comment: SnsComment, parentPost: SnsPost) => void;
  onNonClueClick: (sentenceText: string) => void;
  activeBrowserTab: 'fadebook' | 'twitcher' | 'instapic' | 'notes';
  setActiveBrowserTab: (tab: 'fadebook' | 'twitcher' | 'instapic' | 'notes') => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  onSendNotesToJimini: (notes: string) => void;
  onSwitchToJiminiChat: () => void;
}

export const WebOsBrowser: React.FC<WebOsBrowserProps> = ({
  posts,
  caseTitle,
  registeredClues,
  onFoundClueSentence,
  onFoundClueComment,
  onNonClueClick,
  activeBrowserTab,
  setActiveBrowserTab,
  notes,
  onUpdateNotes,
  onSendNotesToJimini,
  onSwitchToJiminiChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<{ [id: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [id: string]: boolean }>({});

  const getUrlForTab = (tab: string) => {
    switch (tab) {
      case 'fadebook':
        return searchQuery
          ? `https://fadebook.com/search?q=${encodeURIComponent(searchQuery)}`
          : 'https://fadebook.com/feed/timeline';
      case 'twitcher':
        return searchQuery
          ? `https://twitcher.com/search?q=${encodeURIComponent(searchQuery)}`
          : 'https://twitcher.com/explore';
      case 'instapic':
        return searchQuery
          ? `https://instapic.com/explore/tags/${encodeURIComponent(searchQuery)}`
          : 'https://instapic.com/feed';
      case 'notes':
        return 'https://local.detective.os/investigation-notes';
      default:
        return 'https://web.browser.os';
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesTab =
      activeBrowserTab === 'notes' ||
      p.platform === activeBrowserTab ||
      (activeBrowserTab === 'fadebook' && (p.platform === 'fadebook' || (p.platform as any) === 'fakebook')) ||
      (activeBrowserTab === 'twitcher' && (p.platform === 'twitcher' || (p.platform as any) === 'twitter')) ||
      (activeBrowserTab === 'instapic' && (p.platform === 'instapic' || (p.platform as any) === 'instagram'));

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.authorHandle && p.authorHandle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesTab && matchesSearch;
  });

  const handleToggleLike = (postId: string) => {
    detectiveFx.playOptionClick();
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleToggleComments = (postId: string) => {
    detectiveFx.playOptionClick();
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const isPostClueRegistered = (post: SnsPost) => {
    return registeredClues.some(
      (c) =>
        c.sourcePostId === post.id ||
        (post.keyPhrase && c.contentSnippet.includes(post.keyPhrase)) ||
        c.title === post.clueTitle
    );
  };

  const isCommentClueRegistered = (comment: SnsComment) => {
    return registeredClues.some(
      (c) =>
        c.contentSnippet.includes(comment.content) ||
        (comment.keyPhrase && c.contentSnippet.includes(comment.keyPhrase)) ||
        c.title === comment.clueTitle
    );
  };

  // Clean and sanitize clicked word
  const cleanWordToken = (word: string) => {
    return word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>\[\]]/g, '').trim();
  };

  // Word-level click handler for Post body
  const handleWordClickInPost = (post: SnsPost, rawWord: string) => {
    const cleanWord = cleanWordToken(rawWord);
    if (!cleanWord || cleanWord.length < 1) return;

    if (post.isRealClue || post.isDecoy) {
      const keywords = post.keywords || [];
      const keyPhrase = post.keyPhrase || '';

      // Check if the clicked word matches any of the post's clue keywords
      const isKeywordMatch =
        keywords.some((k) => cleanWord.includes(k) || k.includes(cleanWord)) ||
        (keyPhrase && (keyPhrase.includes(cleanWord) && cleanWord.length >= 2));

      if (isKeywordMatch) {
        // Trigger clue discovery!
        const sentenceSnippet = keyPhrase || post.content;
        onFoundClueSentence(post, sentenceSnippet, post.clueTitle, post.clueSummary);
        return;
      }
    }

    // Otherwise, it is a non-clue normal word
    onNonClueClick(cleanWord);
  };

  // Word-level click handler for Comment body
  const handleWordClickInComment = (comment: SnsComment, parentPost: SnsPost, rawWord: string) => {
    const cleanWord = cleanWordToken(rawWord);
    if (!cleanWord || cleanWord.length < 1) return;

    if (comment.isRealClue || comment.isDecoy) {
      const keywords = comment.keywords || [];
      const keyPhrase = comment.keyPhrase || '';

      const isKeywordMatch =
        keywords.some((k) => cleanWord.includes(k) || k.includes(cleanWord)) ||
        (keyPhrase && (keyPhrase.includes(cleanWord) && cleanWord.length >= 2));

      if (isKeywordMatch) {
        onFoundClueComment(comment, parentPost);
        return;
      }
    }

    onNonClueClick(cleanWord);
  };

  // Render natural paragraph with seamlessly clickable words (NO blocky sentence outlines!)
  const renderNaturalClickableText = (
    text: string,
    post: SnsPost,
    isComment = false,
    comment?: SnsComment
  ) => {
    const isAlreadyFound = isComment
      ? comment && isCommentClueRegistered(comment)
      : isPostClueRegistered(post);

    // Split text by whitespace into natural words
    const words = text.split(/(\s+)/);

    return (
      <div className={`leading-relaxed font-sans text-xs sm:text-sm ${
        isAlreadyFound
          ? 'p-2.5 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/40 dark:border-amber-700/50 rounded-xl'
          : ''
      }`}>
        {isAlreadyFound && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1.5 font-mono">
            <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>[📌 핵심 단서 확보됨]</span>
          </div>
        )}

        <div className="text-slate-800 dark:text-slate-200 select-text">
          {words.map((w, idx) => {
            if (/^\s+$/.test(w)) {
              return <span key={idx}>{w}</span>;
            }

            return (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isComment && comment) {
                    handleWordClickInComment(comment, post, w);
                  } else {
                    handleWordClickInPost(post, w);
                  }
                }}
                className="inline-block cursor-pointer px-0.5 py-0.5 rounded-xs transition-colors hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 active:scale-95 select-text"
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col bg-white dark:bg-[#1e1f20] border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[680px] animate-fadeIn relative">
      {/* Chrome Style Tab Strip Header: Fadebook, Twitcher, Instapic, Notes */}
      <div className="bg-[#dde1e6] dark:bg-[#18191a] pt-2 px-2 flex items-center gap-1 border-b border-slate-300 dark:border-slate-800 select-none overflow-x-auto">
        {/* Jimini AI Shortcut Tab */}
        <button
          onClick={onSwitchToJiminiChat}
          className="px-3.5 py-1.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all text-blue-600 dark:text-blue-400 hover:bg-white/60 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✦ Jimini AI 수사방</span>
        </button>

        {/* 1. Fadebook (페이드북) Tab */}
        <button
          onClick={() => {
            detectiveFx.playOptionClick();
            setActiveBrowserTab('fadebook');
          }}
          className={`px-3.5 py-1.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeBrowserTab === 'fadebook'
              ? 'bg-white dark:bg-[#28292a] text-blue-600 shadow-xs border-t-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
            f
          </span>
          <span>📘 페이드북 (Fadebook)</span>
        </button>

        {/* 2. Twitcher (트위처) Tab */}
        <button
          onClick={() => {
            detectiveFx.playOptionClick();
            setActiveBrowserTab('twitcher');
          }}
          className={`px-3.5 py-1.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeBrowserTab === 'twitcher'
              ? 'bg-white dark:bg-[#28292a] text-sky-500 shadow-xs border-t-2 border-sky-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800'
          }`}
        >
          <Twitter className="w-3.5 h-3.5 fill-current text-sky-500" />
          <span>𝕏 트윗처 (Twitcher)</span>
        </button>

        {/* 3. Instapic (인스타픽) Tab */}
        <button
          onClick={() => {
            detectiveFx.playOptionClick();
            setActiveBrowserTab('instapic');
          }}
          className={`px-3.5 py-1.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeBrowserTab === 'instapic'
              ? 'bg-white dark:bg-[#28292a] text-pink-500 shadow-xs border-t-2 border-pink-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800'
          }`}
        >
          <Instagram className="w-3.5 h-3.5 text-pink-500" />
          <span>📸 인스타픽 (Instapic)</span>
        </button>

        {/* 4. Detective Notes Tab */}
        <button
          onClick={() => {
            detectiveFx.playOptionClick();
            setActiveBrowserTab('notes');
          }}
          className={`px-3.5 py-1.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeBrowserTab === 'notes'
              ? 'bg-white dark:bg-[#28292a] text-purple-500 shadow-xs border-t-2 border-purple-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-500" />
          <span>📝 수사 메모장</span>
        </button>
      </div>

      {/* Chrome Navigation Bar & URL Omnibox */}
      <div className="p-2.5 bg-slate-100 dark:bg-[#202124] border-b border-slate-300 dark:border-slate-800 flex items-center gap-2 select-none">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => onSwitchToJiminiChat()}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            title="뒤로 가기 (Jimini 채팅)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              detectiveFx.playOptionClick();
              setSearchQuery('');
            }}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            title="새로고침"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Omnibox Address Bar with real URL */}
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#131314] px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-xs text-slate-800 dark:text-slate-200 font-mono flex-1 truncate">
            {getUrlForTab(activeBrowserTab)}
          </span>
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        {/* In-Site Search Input */}
        {activeBrowserTab !== 'notes' && (
          <div className="relative w-44 sm:w-56 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이 사이트에서 단서 검색..."
              className="w-full py-1.5 pl-7 pr-3 text-xs bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 rounded-full text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* Detective Clue Click Rule Guide Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-blue-500/20 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>
            💡 <strong>단서 포착 수칙</strong>: 글이나 댓글 속 의심스러운 <strong>핵심 단어(예: 소화기, 30억, 마취, 약품, 독극물 등)</strong>를 직접 클릭하면 단서함에 등록됩니다!
          </span>
        </div>
        <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-2">
          수집 단서: {registeredClues.length}건
        </span>
      </div>

      {/* Main Browser Content Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-[#131314]">
        {/* TAB: DETECTIVE NOTES */}
        {activeBrowserTab === 'notes' ? (
          <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>수석 탐정 수사 메모장</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">사건: {caseTitle}</span>
            </div>

            <div className="bg-white dark:bg-[#1e1f20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 단서, 타임라인, 용의자들의 거짓말을 자유롭게 적어두세요. 작성한 메모를 Jimini에게 직접 전달해 추리를 발전시킬 수 있습니다!
              </p>

              <textarea
                rows={10}
                value={notes}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="[탐정 메모 예시]&#10;- 한서진 관장의 30억 빚더미 확인됨&#10;- 소화기 뒤편 열쇠 일련번호와 도어락 대조 필요&#10;- 윤아영의 인스타픽 11시 쿵 소리와 마취약품 냄새 일치..."
                className="w-full p-3.5 text-xs sm:text-sm font-sans bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {notes.length}자 작성됨 (자동 저장됨)
                </span>
                <button
                  onClick={() => onSendNotesToJimini(notes)}
                  disabled={!notes.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>이 메모 내용으로 Jimini에게 질문하기</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB: SNS FEEDS (Fadebook, Twitcher, Instapic) */
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Fadebook Profile Cover Header (Shown on Fadebook tab) */}
            {activeBrowserTab === 'fadebook' && (
              <div className="bg-white dark:bg-[#1e1f20] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs mb-4">
                <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 relative">
                  <div className="absolute -bottom-8 left-5">
                    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1e1f20] bg-slate-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
                      f
                    </div>
                  </div>
                </div>
                <div className="pt-10 px-5 pb-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>페이드북 (Fadebook) 네트워크 피드</span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium">
                        사건 관계자 타임라인
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      사건 관련 인물들의 일상 게시글과 댓글 타임라인
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">게시물 {filteredPosts.length}개</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instapic Stories Row (Shown only on Instapic tab) */}
            {activeBrowserTab === 'instapic' && (
              <div className="p-3 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 overflow-x-auto shadow-xs">
                {posts.map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-100">
                        {p.avatarLetter || p.authorName[0]}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate w-14 text-center">
                      {p.authorName.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#1e1f20] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-2">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">검색어 "{searchQuery}"에 맞는 게시물이 없습니다.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-blue-500 text-xs rounded-lg font-medium cursor-pointer"
                >
                  전체 글 보기
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = likedPosts[post.id];
                const areCommentsOpen = expandedComments[post.id];

                return (
                  <div
                    key={post.id}
                    className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1e1f20] border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-xs"
                  >
                    {/* Author Lockup */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center shrink-0">
                          {post.avatarLetter || post.authorName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {post.authorName}
                            </span>
                            {post.authorHandle && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {post.authorHandle}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {post.timeAgo} · {post.authorRole || '회원'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Post Content with Natural Clickable Words */}
                    <div className="mb-3">
                      {renderNaturalClickableText(post.content, post, false)}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((t, idx) => (
                          <span
                            key={idx}
                            onClick={() => setSearchQuery(t.replace('#', ''))}
                            className="text-xs text-sky-500 hover:underline font-medium cursor-pointer"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions Bar: Like, Comments Toggle */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1 transition-colors cursor-pointer ${
                            isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{(post.likesCount || 0) + (isLiked ? 1 : 0)}</span>
                        </button>
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>댓글 {post.commentsList ? post.commentsList.length : (post.commentsCount || 0)}개</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Comments Section with Word-Level Interaction */}
                    {areCommentsOpen && post.commentsList && post.commentsList.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fadeIn">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>💬 게시물 댓글 ({post.commentsList.length})</span>
                        </div>

                        {post.commentsList.map((c) => {
                          return (
                            <div
                              key={c.id}
                              className="p-3 rounded-xl border text-xs transition-all bg-slate-50 dark:bg-[#18191a] border-slate-200 dark:border-slate-800"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                  <span>{c.authorName}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
                              </div>
                              <div>
                                {renderNaturalClickableText(c.content, post, true, c)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
