import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CASE_FILES } from './data/cases';
import { ChatMessage, OptionButton, Suspect, CaseFile, SnsPost, SnsComment, RegisteredClue, CaseProgressState } from './types/mystery';
import { GeminiSidebar } from './components/GeminiSidebar';
import { GeminiHeader } from './components/GeminiHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { GeminiInputBar } from './components/GeminiInputBar';
import { CluesInspector } from './components/CluesInspector';
import { WebOsBrowser } from './components/WebOsBrowser';
import { SuspectAccusationModal } from './components/SuspectAccusationModal';
import { DetectiveRegistrationModal } from './components/DetectiveRegistrationModal';
import { detectiveFx } from './utils/detectiveAudio';
import { Sparkles, Globe, Pin, ShieldAlert, CheckCircle2, Search, Scale, X, MessageSquare, FolderKanban } from 'lucide-react';

export default function App() {
  const [cases] = useState<CaseFile[]>(CASE_FILES);
  const [activeCaseId, setActiveCaseId] = useState<string>(CASE_FILES[0].id);
  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Multi-Case State Persistence Map
  const [caseStates, setCaseStates] = useState<{ [caseId: string]: CaseProgressState }>({});

  // Detective Registration Name
  const [detectiveName, setDetectiveName] = useState<string>('pai');
  const [showNameModal, setShowNameModal] = useState<boolean>(true);

  // Active Case Working States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [registeredClues, setRegisteredClues] = useState<RegisteredClue[]>([]);
  const [suspects, setSuspects] = useState<Suspect[]>(activeCase.suspects);
  const [investigationScore, setInvestigationScore] = useState<number>(10);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [investigationStep, setInvestigationStep] = useState<number>(1);
  const [remainingWarrantAttempts, setRemainingWarrantAttempts] = useState<number>(2);
  const [discoveredPostIds, setDiscoveredPostIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Floating Toast Notification state
  const [toast, setToast] = useState<{ text: string; subText?: string; isKey: boolean; clueObj?: RegisteredClue } | null>(null);
  const toastTimerRef = useRef<any>(null);

  // Real-time AI response streaming state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamingTimerRef = useRef<any>(null);

  const [selectedModel, setSelectedModel] = useState<string>('Jimini-Lite');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'sns' | 'clues'>('chat');
  const [activeBrowserTab, setActiveBrowserTab] = useState<'fadebook' | 'twitcher' | 'instapic' | 'notes'>('fadebook');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [showAccuseModal, setShowAccuseModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Condition to unlock accusing the culprit (must have questioned Jimini & investigated clues)
  const canAccuse = investigationStep >= 3 || registeredClues.length >= 2 || investigationScore >= 50 || isSolved;

  // Show Toast Alert helper
  const showClueToast = (text: string, subText?: string, isKey = false, clueObj?: RegisteredClue) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, subText, isKey, clueObj });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, clueObj ? 6500 : 3800);
  };

  // Sync Dark/Light Mode Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load or Switch Case with State Persistence
  useEffect(() => {
    if (caseStates[activeCaseId]) {
      const saved = caseStates[activeCaseId];
      setMessages(saved.messages);
      setRegisteredClues(saved.registeredClues || []);
      setSuspects(saved.suspects);
      setInvestigationScore(saved.investigationScore);
      setIsSolved(saved.isSolved);
      setInvestigationStep(saved.investigationStep);
      setDiscoveredPostIds(saved.discoveredPostIds || []);
      setNotes(saved.notes || '');
    } else {
      const selected = cases.find((c) => c.id === activeCaseId) || cases[0];
      const initialSuspects = selected.suspects.map((s) => ({
        ...s,
        suspicionLevel: 10,
        isAlibiRevealed: false,
        isMotiveRevealed: false,
      }));

      const initialAiMsg: ChatMessage = {
        id: `msg_init_${Date.now()}`,
        sender: 'gemini',
        text: `반가워요, 수석 탐정 **${detectiveName}님**! 수사 파트너 **Jimini(지미니) AI**입니다! 🕵️‍♂️✨

오늘 우리가 파헤쳐야 할 사건은 **[ ${selected.title} ]**이에요!

📖 **사건 개요**:
${selected.summary}

📍 **사건 현장**: ${selected.location}
👤 **피해자**: ${selected.victim}

🔍 **수사 룰 안내**:
1. 현재 수사 단서함은 깨끗이 비어 있습니다.
2. 좌측 메뉴의 **[웹 브라우저]**에서 **Fadebook(페이드북), 트위처(X), 인스타그램** 글과 댓글을 직접 읽다가, 의심스러운 **문장을 마우스로 클릭**하세요!
3. Jimini와 대화하며 선택지를 골라 단서와 정황을 어느 정도 모으면, 상단에 **[⚖️ 진범 지목하기]** 버튼이 열립니다!

어디서부터 조사를 시작해 볼까요?`,
        options: [
          { id: 1, label: `🔍 사건 현장 (${selected.location}) 및 핏자국 정밀 수색하기` },
          { id: 2, label: `📘 Fadebook(페이드북) & SNS 타임라인 열어서 관계자 글 문장 클릭 수색하기`, isSnsClue: true },
          { id: 3, label: `🗣️ 용의자 ${selected.suspects.length}명 초동 진술 및 알리바이 집중 추궁하기` },
          { id: 4, label: `🧯 복도 비품 및 환기구 주변 물리적 흔적 정밀 감식하기` },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([initialAiMsg]);
      setRegisteredClues([]);
      setSuspects(initialSuspects);
      setInvestigationScore(10);
      setIsSolved(false);
      setInvestigationStep(1);
      setDiscoveredPostIds([]);
      setNotes('');
    }

    if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);
    setIsStreaming(false);
  }, [activeCaseId]);

  // Save state on any change for current case
  useEffect(() => {
    if (messages.length > 0) {
      setCaseStates((prev) => ({
        ...prev,
        [activeCaseId]: {
          messages,
          registeredClues,
          suspects,
          discoveredPostIds,
          investigationScore,
          isSolved,
          investigationStep,
          notes,
          foundCluePhrases: registeredClues.map((c) => c.contentSnippet),
        },
      }));
    }
  }, [messages, registeredClues, suspects, discoveredPostIds, investigationScore, isSolved, investigationStep, notes, activeCaseId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking, isStreaming]);

  // Stream text generation helper
  const streamAiResponse = (
    fullText: string,
    options: OptionButton[],
    newClues?: string[],
    onFinished?: () => void
  ) => {
    setIsStreaming(true);
    const msgId = `msg_ai_${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: 'gemini',
        text: '',
        options: options,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        newCluesFound: newClues,
      },
    ]);

    let currentIndex = 0;
    const chunkSize = 3;

    if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);

    streamingTimerRef.current = setInterval(() => {
      currentIndex += chunkSize;

      if (currentIndex >= fullText.length) {
        clearInterval(streamingTimerRef.current);
        streamingTimerRef.current = null;
        setIsStreaming(false);

        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: fullText } : m))
        );

        if (onFinished) onFinished();
      } else {
        const currentSlice = fullText.slice(0, currentIndex);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: currentSlice } : m))
        );
      }
    }, 16);
  };

  // Bespoke contextual dynamic story reply generator
  const generateContextualDetectiveReply = (
    userText: string,
    targetSuspect: string | undefined,
    currentCase: CaseFile,
    step: number,
    clues: RegisteredClue[]
  ) => {
    const s1 = currentCase.suspects[0]?.name || '용의자 1';
    const s2 = currentCase.suspects[1]?.name || '용의자 2';
    const s3 = currentCase.suspects[2]?.name || '용의자 3';
    const isReadyToAccuse = step >= 3 || clues.length >= 2;

    // Case 1: Red Gallery Masterpiece
    if (currentCase.id === 'case_01') {
      if (userText.includes('현장') || userText.includes('수색')) {
        return {
          replyText: `탐정 **${detectiveName}님**, 화실 내부를 정밀 수색한 결과 결정적인 물리적 흔적들을 포착했습니다! 🔍

1. **환기구 철사 조작 흔적**: 3층 환기창 그릴에 가느다란 철사(와이어)가 걸려 있었고, 흡입형 휘발성 약품의 잔향이 짙게 남아있습니다!
2. **도어락 외부 조작 가능성**: 안쪽 빗장은 걸려 있었으나, 복도 소화기 뒤편에서 발견된 예비 마스터 키가 도어락과 정확히 일치합니다.

이것은 내부 사정을 완벽히 아는 자가 외부에서 연출한 **'계획된 인위적 밀실'**입니다!`,
          options: [
            { id: 1, label: `🧯 복도 소화기 뒤편 예비 열쇠의 지문 정밀 감식하기` },
            { id: 2, label: `🧪 피해자 혈액 속 무색무취 흡입 마취용제 성분 대조하기` },
            { id: 3, label: `📘 페이드북 한서진 관장의 3층 소화기 단독 점검 글 파헤치기`, isSnsClue: true },
            ...(isReadyToAccuse
              ? [{ id: 4, label: `⚖️ 진범 특정: 한서진 관장을 범인으로 지목하고 자백받기` }]
              : [{ id: 4, label: `🗣️ 용의자 ${s1}의 30억 사채 빚 및 50억 보험금 수령 조항 추궁하기` }]),
          ],
          newClue: '환기구 철사 조작 흔적 및 고순도 흡입 마취약품 잔여물',
        };
      } else if (userText.includes('열쇠') || userText.includes('소화기')) {
        return {
          replyText: `놀라운 결과입니다, ${detectiveName} 탐정님! 🔑

국과수 지문 감식반에서 복도 소화기 뒤편 예비 열쇠의 포렌식 결과를 전달해 왔습니다.
- 열쇠 손잡이 부분에서 **미술관 관장 한서진의 미세 지문 2점**이 뚜렷하게 검출되었습니다!
- 미술관 마스터 키 관리 대장에는 해당 열쇠가 '관장실 전용 금고 보관 중'으로 허위 기재되어 있었습니다.

한서진 관장은 거짓 알리바이를 대며 발을 빼려 하지만, 빼도 박도 못할 물증이 확보되었습니다!`,
          options: [
            { id: 1, label: `📱 트윗처 비공개 부계정의 '30억 사채 빚 해방' 트윗 들이밀기`, isSnsClue: true },
            { id: 2, label: `🧪 약품 공급업자 강태호와의 흡입 용제 밀거래 대화록 추궁` },
            { id: 3, label: `🗣️ 한서진 관장에게 마스터 키 은닉 경위 집중 신문하기` },
            { id: 4, label: `⚖️ 진범 특정: 확보된 물증으로 최종 자백 받아내기` },
          ],
          newClue: '소화기 뒤 예비 열쇠에서 한서진 관장 지문 일치 확인',
        };
      } else if (userText.includes('약품') || userText.includes('마취') || userText.includes('용제')) {
        return {
          replyText: `독성학 분석 결과가 도착했습니다! 🧪

피해자의 호흡기 점막에서 검출된 성분은 **'초고순도 에테르 화합물'**로, 환기구로 주입 시 1분 이내에 피해자를 의식불명에 빠뜨릴 수 있는 특수 마취용제입니다.
약품 공급업자 강태호 케미컬의 은닉 차량 트렁크에서 발견된 병의 로트 번호와 현장 잔여물의 성분이 100% 일치합니다!

강태호가 한서진 관장의 사주를 받고 마취제를 공급한 정황이 확실해졌습니다!`,
          options: [
            { id: 1, label: `📱 강태호의 '화실 뒤 골목 1시간 대기' 트윗 알리바이 깨부수기`, isSnsClue: true },
            { id: 2, label: `💳 한서진과 강태호 사이의 2억 원 불법 거래 내역 조회` },
            { id: 3, label: `🗣️ 강태호에게 마취제 납품 의뢰자가 한서진인지 자백 유도` },
            ...(isReadyToAccuse
              ? [{ id: 4, label: `⚖️ 진범 특정: 사건 현장 밀실 살인 트릭 재구성 및 지목` }]
              : [{ id: 4, label: `🔍 피해자 화실 창문 및 빗장 추가 감식하기` }]),
          ],
          newClue: '초고순도 에테르 마취용제 및 강태호 공급처 일치 확인',
        };
      } else if (userText.includes('심문') || userText.includes('진술') || targetSuspect) {
        const suspect = targetSuspect || s1;
        return {
          replyText: `탐정 ${detectiveName}님의 날카로운 질문에 **${suspect}**의 동공이 심하게 흔들리고 있습니다! 🗣️

"그, 그게 무슨 말씀이시죠? 전 그 시간에 제 사무실에서 기획전 서류를 보고 있었다니까요... 소화기는 그냥 안전 점검이었을 뿐이에요!"

변명을 늘어놓고 있지만, 손을 파르르 떨며 시선을 회피하고 있습니다. 이미 페이드북(Fadebook)과 현장 물증의 압박으로 알리바이의 거짓이 와르르 무너져 내리고 있습니다!`,
          options: [
            { id: 1, label: `🧾 50억 보험금 단독 수령 서류와 30억 사채 독촉장 제시` },
            { id: 2, label: `📱 비공개 SNS 트윗 '오늘 밤이면 해방이다' 결정타 날리기`, isSnsClue: true },
            { id: 3, label: `🔑 소화기 뒤 지문 일치 감식서 얼굴 앞에 들이대기` },
            { id: 4, label: `⚖️ ${suspect}에게 진범 자백 요구 및 최종 구속 영장 청구` },
          ],
          newClue: `${suspect}의 심문 도중 알리바이 번복 및 모순 포착`,
        };
      }
    }

    // Default Progressive Investigation Branch
    return {
      replyText: `수석 탐정 **${detectiveName}님**, 요청하신 **"${userText}"** 항목에 대한 심층 포렌식 조사 결과입니다! 🔍

사건 관계자들의 타임라인과 온라인 활동 로그를 교차 대조한 결과, 사건 발생 시각에 치명적인 알리바이 공백과 숨겨진 거짓말이 명백하게 드러났습니다. ${
        targetSuspect ? `특히 **${targetSuspect}**의 진술이 물증과 정면으로 충돌하고 있습니다!` : '용의자가 은폐하려던 결정적 증거가 수면 위로 떠올랐습니다.'
      }

다음으로 어떤 수사를 집중적으로 진행해 볼까요?`,
      options: [
        { id: 1, label: `🔑 사건 현장의 은닉된 비밀 잠금장치 및 포렌식 증거 대조` },
        { id: 2, label: `📱 SNS 타임라인에 등록된 핵심 단서로 용의자 거짓말 반박`, isSnsClue: true },
        { id: 3, label: `🗣️ 유력 용의자 ${targetSuspect || s1}에게 결정적 물증 들이대기` },
        ...(isReadyToAccuse
          ? [{ id: 4, label: `⚖️ 진범으로 정식 지목하고 자백 받아내기` }]
          : [{ id: 4, label: `🧪 추가 화합물 성분 및 현장 도구 감식 의뢰` }]),
      ],
      newClue: `${userText.slice(0, 15)} 조사를 통해 확보한 핵심 물증`,
    };
  };

  // Progressive Suspects Information Unlocking Logic
  const updateSuspectsProgressively = (
    suspectsUpdate: any[],
    targetSuspectName?: string
  ) => {
    setSuspects((prev) =>
      prev.map((s) => {
        const update = suspectsUpdate?.find((u: any) => u.name === s.name);
        const isTargeted = targetSuspectName && (s.name.includes(targetSuspectName) || targetSuspectName.includes(s.name));

        const shouldRevealAlibi = s.isAlibiRevealed || isTargeted || (update && update.suspicionLevel >= 30) || investigationStep >= 2;
        const shouldRevealMotive = s.isMotiveRevealed || isTargeted || (update && update.suspicionLevel >= 55) || investigationStep >= 3;
        const newSuspicion = update ? update.suspicionLevel : isTargeted ? Math.min(85, s.suspicionLevel + 25) : s.suspicionLevel;

        return {
          ...s,
          suspicionLevel: newSuspicion,
          isAlibiRevealed: Boolean(shouldRevealAlibi),
          isMotiveRevealed: Boolean(shouldRevealMotive),
          alibiText: update?.alibiText || s.alibiText,
        };
      })
    );
  };

  // Handle Clicking on a Valid Clue Sentence inside a Post
  const handleFoundClueSentence = (
    post: SnsPost,
    sentenceText: string,
    clueTitle?: string,
    clueSummary?: string
  ) => {
    const isAlready = registeredClues.some((c) => c.contentSnippet === sentenceText || c.title === clueTitle);
    if (isAlready) {
      showClueToast(`이미 확보된 단서입니다`, `"${sentenceText.slice(0, 30)}..."`, false);
      return;
    }

    const title = clueTitle || post.clueTitle || `${post.authorName}의 게시글 단서`;
    const isDecoy = Boolean(post.isDecoy);
    const newClue: RegisteredClue = {
      id: `clue_${Date.now()}`,
      sourcePostId: post.id,
      platform: post.platform,
      title: title,
      contentSnippet: sentenceText,
      authorName: post.authorName,
      registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isKeyEvidence: post.isRealClue && !isDecoy,
      isDecoy: isDecoy,
      verificationStatus: 'unverified',
      verificationVerdict: post.fakeVerdictReason,
      cluePrompt: `${post.platform.toUpperCase()}에서 "${sentenceText}" (작성자: ${post.authorName}) 단서를 포착했습니다. 이 단서의 진위 여부를 정밀 감식해 줘!`,
    };

    setRegisteredClues((prev) => [newClue, ...prev]);
    detectiveFx.playClueFound();

    showClueToast(
      `📥 [수사 단서 포착] "${title}"`,
      `"${sentenceText}"`,
      post.isRealClue && !isDecoy,
      newClue
    );

    updateSuspectsProgressively([], post.authorName);
  };

  // Handle Clicking on a Valid Clue Comment inside a Post
  const handleFoundClueComment = (comment: SnsComment, parentPost: SnsPost) => {
    const isAlready = registeredClues.some((c) => c.contentSnippet === comment.content);
    if (isAlready) {
      showClueToast(`이미 확보된 댓글 단서입니다`, `"${comment.content.slice(0, 30)}..."`, false);
      return;
    }

    const title = comment.clueTitle || `${comment.authorName}의 댓글 단서`;
    const isDecoy = Boolean(comment.isDecoy);
    const newClue: RegisteredClue = {
      id: `clue_comment_${Date.now()}`,
      sourcePostId: parentPost.id,
      platform: parentPost.platform,
      title: title,
      contentSnippet: comment.content,
      authorName: comment.authorName,
      registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isKeyEvidence: Boolean(comment.isRealClue && !isDecoy),
      isDecoy: isDecoy,
      verificationStatus: 'unverified',
      verificationVerdict: comment.fakeVerdictReason,
      cluePrompt: `댓글에서 "${comment.content}" (작성자: ${comment.authorName}) 단서를 발견했습니다. 이 단서의 진위 여부를 정밀 감식해 줘!`,
    };

    setRegisteredClues((prev) => [newClue, ...prev]);
    detectiveFx.playClueFound();

    showClueToast(
      `📥 [댓글 단서 포착] "${title}"`,
      `"${comment.content}"`,
      Boolean(comment.isRealClue && !isDecoy),
      newClue
    );

    updateSuspectsProgressively([], comment.authorName);
  };

  // Handle Clicking on a Non-Clue / Everyday Word
  const handleNonClueClick = (wordText: string) => {
    detectiveFx.playOptionClick();
    showClueToast(
      `🔍 [단서 분석] "${wordText.slice(0, 20)}"`,
      `사건과 직접 연관이 없는 일반 단어입니다. 수상한 행적이나 물증 단어를 찾아보세요.`,
      false
    );
  };

  // Remove Clue from docket
  const handleRemoveClue = (clueId: string) => {
    setRegisteredClues((prev) => prev.filter((c) => c.id !== clueId));
  };

  // Handle Option Button Click in Chat
  const handleSelectOption = async (option: OptionButton, targetSuspectName?: string) => {
    if (isAiThinking || isStreaming) return;

    if (
      option.label.includes('다음 사건') ||
      option.label.includes('사건 파일 해결 완료') ||
      option.label.includes('해결 완료 및 다음')
    ) {
      detectiveFx.playOptionClick();
      handleNewCase();
      return;
    }

    if (option.label.includes('처음부터 다시 시작하기') || option.label.includes('다시 수사 시작하기')) {
      detectiveFx.playOptionClick();
      setRemainingWarrantAttempts(2);
      setIsSolved(false);
      setRegisteredClues([]);
      setInvestigationScore(10);
      setInvestigationStep(1);
      showClueToast('수사 리셋 완료', '사건 수사를 처음부터 다시 시작합니다.', false);
      return;
    }

    if (option.label.includes('웹 브라우저') || option.label.includes('페이드북') || option.label.includes('Fakebook') || option.label.includes('SNS')) {
      setActiveTab('sns');
      detectiveFx.playOptionClick();
      return;
    }

    if (option.label.includes('진범 바로 지목') || option.label.includes('진범 특정') || option.label.includes('범인으로 지목') || option.label.includes('자백 받아내기')) {
      if (!isSolved) {
        setShowAccuseModal(true);
      }
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      selectedOptionNumber: option.id,
      text: option.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);
    setInvestigationStep((prev) => prev + 1);

    try {
      const res = await fetch('/api/ai/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: activeCase.title,
          caseSummary: activeCase.summary,
          history: messages,
          userChoice: `[선택지 ${option.id}] ${option.label} (탐정: ${detectiveName}님)`,
          modelName: selectedModel,
          targetSuspect: targetSuspectName,
          isSnsClue: option.isSnsClue,
          registeredClues: registeredClues.map((c) => `${c.title}: ${c.contentSnippet}`),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        detectiveFx.playAiResponse();

        if (data.newClues && data.newClues.length > 0) {
          detectiveFx.playClueFound();
          data.newClues.forEach((clueText: string) => {
            const fieldClue: RegisteredClue = {
              id: `clue_field_${Date.now()}_${Math.random()}`,
              platform: 'field',
              title: `${option.label.slice(0, 18)} 현장 단서`,
              contentSnippet: clueText,
              authorName: '현장 감식반',
              registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isKeyEvidence: true,
            };
            setRegisteredClues((prev) => [fieldClue, ...prev]);
          });
        }

        updateSuspectsProgressively(data.suspectsUpdate || [], targetSuspectName);
        setInvestigationScore((prev) => Math.min(100, prev + 20));

        if (data.isSolved) {
          setIsSolved(true);
          detectiveFx.playCaseSolved();
          confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
        }

        const dynamicOpts =
          data.options && data.options.length >= 3
            ? data.options
            : generateContextualDetectiveReply(option.label, targetSuspectName, activeCase, investigationStep + 1, registeredClues).options;

        streamAiResponse(
          data.replyText || 'Jimini가 수사 결과를 정리 중입니다...',
          dynamicOpts,
          data.newClues
        );
      } else {
        fallbackContextualResponse(option.label, targetSuspectName);
      }
    } catch (e) {
      console.warn('Jimini API investigation error:', e);
      fallbackContextualResponse(option.label, targetSuspectName);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle Asking Jimini with a specific Registered Clue (From Clues Inspector)
  const handleAskJiminiWithClue = (clue: RegisteredClue) => {
    setActiveTab('chat');

    const isDecoy = Boolean(clue.isDecoy);
    const newStatus: 'verified_true' | 'verified_fake' = isDecoy ? 'verified_fake' : 'verified_true';

    // Update the clue status in registeredClues
    setRegisteredClues((prev) =>
      prev.map((c) => (c.id === clue.id ? { ...c, verificationStatus: newStatus } : c))
    );

    const userMsg: ChatMessage = {
      id: `msg_user_clue_${Date.now()}`,
      sender: 'user',
      text: `🔬 [단서 정밀 감식 요청 - ${clue.title}]\n"${clue.contentSnippet}"\n(작성자: ${clue.authorName} · ${clue.platform})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);
    setInvestigationStep((prev) => prev + 1);

    setTimeout(() => {
      setIsAiThinking(false);

      if (isDecoy) {
        detectiveFx.playOptionClick();
        const verdictReason =
          clue.verificationVerdict ||
          '국과수 및 현장 CCTV 포렌식 결과, 이 제보는 사건 당일 범행과 직접적인 인과관계가 성립하지 않는 일상적 정황으로 확인되었습니다.';

        const invalidReply = `수석 탐정 **${detectiveName}님**, 등록해주신 단서 **"${clue.title}"**에 대한 Jimini의 정밀 포렌식 감식 브리핑입니다! 🔬

📋 **[포렌식 감식 브리핑: 사건 관련성 낮음 (잘못된 단서 분류)]**
${verdictReason}

탐정님의 날카로운 관찰력이 돋보인 정황이었으나, 현장 물리 물증 및 타임라인 교차 검증 결과 이번 범행 트릭과는 직접 연결되지 않는 것으로 분석되었습니다.

수사의 혼선을 줄이기 위해 해당 항목을 **'잘못된 단서'**로 분류해 두었습니다. 웹 브라우저(페이드북·트윗처·인스타픽)에서 용의자들의 실제 알리바이 모순이나 범행 도구와 직결된 다른 핵심 단어를 계속해서 추적해 보시길 권장합니다!`;

        streamAiResponse(invalidReply, [
          { id: 1, label: `🌐 페이드북 & 트윗처 타임라인에서 다른 핵심 단서 찾기` },
          { id: 2, label: `🗂️ 수사 단서함의 다른 단서 정밀 감식하기` },
          { id: 3, label: `🔑 사건 현장 추가 물리 감식 및 도어락 확인` },
          { id: 4, label: `🗣️ 용의자들의 알리바이 재조사하기` },
        ]);
      } else {
        detectiveFx.playClueFound();
        updateSuspectsProgressively([], clue.authorName);
        setInvestigationScore((prev) => Math.min(100, prev + 25));

        const realReply = `결정적인 포착입니다, **${detectiveName} 탐정님**! 🎯

📋 **[포렌식 감식 브리핑: 100% 진품 핵심 증거 공식 인증]**
국과수 포렌식 및 현장 증거 대조 결과, 등록해주신 **"${clue.title}"** ("${clue.contentSnippet}")는 사건 당일 용의자의 결정적 알리바이 파괴 및 범행 수법을 입증하는 반박 불가의 핵심 물증으로 공식 인증되었습니다!

${clue.authorName ? `**${clue.authorName}**의 범행 혐의가 수면 위로 명백히 드러났으며,` : ''} 이제 이 증거를 들이밀어 범인을 심리적으로 압박하거나 최종 진범으로 특정할 수 있습니다!`;

        const dynamicOpts = [
          { id: 1, label: `🗣️ 용의자 ${clue.authorName}에게 이 핵심 증거를 들이대고 집중 추궁` },
          { id: 2, label: `🧪 피해자 혈액 속 흡입 마취 성분과 최종 대조하기` },
          { id: 3, label: `⚖️ 진범 특정: 확보된 물증으로 정식 체포 및 자백 받아내기` },
          { id: 4, label: `🌐 다른 SNS 게시글에서 공범 또는 추가 증거 탐색하기`, isSnsClue: true },
        ];

        streamAiResponse(realReply, dynamicOpts, [clue.title]);
      }
    }, 800);
  };

  // Handle Notes Sent to Jimini
  const handleSendNotesToJimini = (notesContent: string) => {
    setActiveTab('chat');
    const noteMsg: ChatMessage = {
      id: `msg_user_notes_${Date.now()}`,
      sender: 'user',
      text: `📝 [${detectiveName} 탐정의 수사 메모 브리핑]\n"${notesContent}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, noteMsg]);
    setIsAiThinking(true);
    setInvestigationStep((prev) => prev + 1);

    fetch('/api/ai/investigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseTitle: activeCase.title,
        caseSummary: activeCase.summary,
        history: messages,
        userChoice: `[탐정 수사 메모 기반 질문]: ${notesContent}`,
        modelName: selectedModel,
        registeredClues: registeredClues.map((c) => `${c.title}: ${c.contentSnippet}`),
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed')))
      .then((data) => {
        detectiveFx.playAiResponse();
        updateSuspectsProgressively(data.suspectsUpdate || []);
        setInvestigationScore((prev) => Math.min(100, prev + 20));

        const dynamicOpts =
          data.options && data.options.length >= 3
            ? data.options
            : generateContextualDetectiveReply(notesContent, undefined, activeCase, investigationStep + 1, registeredClues).options;

        streamAiResponse(
          data.replyText || `꼼꼼한 메모 덕분에 수사의 퍼즐이 맞춰지고 있어요, ${detectiveName} 탐정님!`,
          dynamicOpts,
          data.newClues
        );
      })
      .catch(() => {
        fallbackContextualResponse(notesContent);
      })
      .finally(() => {
        setIsAiThinking(false);
      });
  };

  // Direct Accusation or Interrogation
  const handleAccuseSuspect = (
    suspect: Suspect,
    actionType: 'interrogate' | 'accuse',
    selectedClue?: RegisteredClue
  ) => {
    setShowAccuseModal(false);
    setActiveTab('chat');

    if (isSolved && actionType === 'accuse') {
      showClueToast('이미 본 사건은 정식 체포가 완료되었습니다!', '다음 사건으로 이동하세요.', false);
      return;
    }

    if (actionType === 'interrogate') {
      handleSelectOption(
        { id: 1, label: `🗣️ 용의자 ${suspect.name} (${suspect.role}) 정밀 집중 심문하기` },
        suspect.name
      );
    } else {
      // Must present a verified clue
      if (!selectedClue || (selectedClue.verificationStatus !== 'verified_valid' && selectedClue.verificationStatus !== 'verified_true')) {
        showClueToast('체포 영장 신청 불가!', '[검증된 핵심 증거]를 함께 선택해야만 정식 영장이 청구됩니다.', false);
        return;
      }

      // Check if suspect is the genuine culprit for the current active case
      const isActualCulprit =
        (activeCase.id === 'case_01' && (suspect.id === 'suspect_1' || suspect.name.includes('한서진'))) ||
        (activeCase.id === 'case_02' && (suspect.id === 'suspect_21' || suspect.name.includes('최현우'))) ||
        (activeCase.id === 'case_03' && (suspect.id === 'suspect_32' || suspect.name.includes('서진우')));

      if (!isActualCulprit) {
        // Decrease warrant chance
        const newAttempts = remainingWarrantAttempts - 1;
        setRemainingWarrantAttempts(newAttempts);
        detectiveFx.playOptionClick();
        setInvestigationScore((prev) => Math.max(0, prev - 20));

        const userMsg: ChatMessage = {
          id: `msg_user_accuse_fail_${Date.now()}`,
          sender: 'user',
          text: `⚖️ [체포 영장 청구] 용의자 ${suspect.name} (${suspect.role}) 체포 영장 신청! (제출 증거: ${selectedClue.title})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);

        if (newAttempts <= 0) {
          // GAME OVER
          const gameOverReply = `🚨 **[체포 영장 최종 기각 & 수사 실패: 범인 도주!]**

수석 탐정 **${detectiveName}님**, 검찰 법원에서 제출하신 증거 **"${selectedClue.title}"** 및 용의자 **${suspect.name}**에 대한 체포 영장을 최종 기각했습니다!

🏛️ **[검찰 영장 기각 및 범인 도주 전말]**:
**${suspect.name}**은(는) 이번 사건과 직접적인 물증 연결 고리가 없는 사람이었습니다. 섣부른 영장 청구로 수사망이 노출되어, **진짜 범인이 밤을 타 해외로 도주**해 버렸습니다!

⚠️ **체포 영장 기회 2회 모두 소진 (수사 실패)**
아래 버튼을 눌러 사건 수사를 처음부터 다시 시작하세요!`;

          streamAiResponse(gameOverReply, [
            { id: 1, label: `🔄 이 사건 수사 처음부터 다시 시작하기 (영장 및 단서 리셋)` },
            { id: 2, label: `🌐 페이드북 & SNS 타임라인 탐색하러 가기`, isSnsClue: true },
          ]);
        } else {
          // 1 attempt remaining
          const failureReply = `❌ **[체포 영장 기각: 무고한 용의자 지목! (영장 기회 ${newAttempts}/2회 남음)]**

탐정 **${detectiveName}님**, 용의자 **${suspect.name} (${suspect.role})**은(는) 제출하신 증거 **"${selectedClue.title}"**과(와) 직접적인 범행 인과관계가 입증되지 않았습니다!

🔍 **[현장 수사팀 & 알리바이 검증 보고]**:
**${suspect.name}**의 동선을 정밀 재조사한 결과, 범행 시각 시신 주변 및 물리적 트릭을 수행할 수 없었던 명확한 부재 증명이 입증되었습니다. 

⚠️ **잘못된 영장 신청으로 수사 혼선 발생! (남은 영장 기회: ${newAttempts}회)**
수사 단서함의 다른 검증된 물증(소화기 뒤 열쇠, 30억 사채 빚, 에테르 마취용제 거래 등)을 다시 확인하시고, 진짜 범인을 가리키는 유력 용의자를 지목해 주십시오!`;

          streamAiResponse(failureReply, [
            { id: 1, label: `🌐 페이드북 & 트윗처 타임라인에서 진범의 물증 재확인`, isSnsClue: true },
            { id: 2, label: `🗂️ 수사 단서함에서 검증된 핵심 증거 대조` },
            { id: 3, label: `🗣️ 용의자들의 알리바이 재심문하기` },
          ]);
        }
      } else {
        // Player accused the correct suspect AND presented verified evidence -> VICTORY!
        setIsSolved(true);
        detectiveFx.playCaseSolved();
        confetti({ particleCount: 180, spread: 95, origin: { y: 0.5 } });
        setInvestigationScore(100);

        const victoryText = `🎉 **사건 완벽 해결! (CASE CLOSED)** 🏆✨

탐정 **${detectiveName}님**과 **Jimini**의 완벽한 콤비 플레이로 **${suspect.name} (${suspect.role})**이(가) 진범임이 완벽히 입증되었습니다!

🏛️ **[제출된 결정적 물증]**: **"${selectedClue.title}"** ("${selectedClue.contentSnippet}")

💡 **밝혀진 범행 수법과 진실**:
현장 증거와 페이드북(Fadebook), 트윗처, 인스타픽에서 탐정님이 직접 포착하고 감식한 명확한 물증에 덜미를 잡힌 범인은 법정 제출용 물증 앞에서 결국 모든 범행을 완전 자백했습니다!

정말 명료하고 논리적인 명추리였습니다, ${detectiveName} 수석 탐정님! 👏`;

        streamAiResponse(victoryText, [
          { id: 1, label: '🏆 사건 파일 해결 완료 및 다음 사건으로 이동' },
        ]);
      }
    }
  };

  const handleCustomSendMessage = (text: string) => {
    handleSelectOption({ id: 9, label: text });
  };

  // Fallback handler
  const fallbackContextualResponse = (userText: string, suspectName?: string) => {
    const contextual = generateContextualDetectiveReply(
      userText,
      suspectName,
      activeCase,
      investigationStep + 1,
      registeredClues
    );

    detectiveFx.playAiResponse();
    setInvestigationScore((prev) => Math.min(100, prev + 20));
    updateSuspectsProgressively([], suspectName);

    streamAiResponse(contextual.replyText, contextual.options, contextual.newClue ? [contextual.newClue] : undefined);
  };

  const handleNewCase = () => {
    const nextIdx = (cases.findIndex((c) => c.id === activeCaseId) + 1) % cases.length;
    setActiveCaseId(cases[nextIdx].id);
  };

  return (
    <div className="w-screen h-screen flex bg-white dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] overflow-hidden font-sans transition-colors duration-200 relative">
      {/* Sleek Gemini AI Clue Discovered Floating Notification Card */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounceIn shadow-2xl max-w-lg w-[92%] sm:w-auto">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col gap-2.5 transition-all ${
              toast.isKey
                ? 'bg-[#18191a]/95 border-rose-500/60 text-white shadow-rose-950/50'
                : 'bg-[#18191a]/95 border-blue-500/60 text-white shadow-blue-950/50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    toast.isKey ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <span className="text-xs font-bold font-mono tracking-wide text-blue-400">
                  ✨ Jimini AI 포렌식 단서 감지 & 자동 등록
                </span>
              </div>

              <button
                onClick={() => setToast(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-1">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{toast.text}</span>
              </h4>
              {toast.subText && (
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 font-mono">
                  {toast.subText}
                </p>
              )}
            </div>

            {/* Action Chips */}
            {toast.clueObj ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    setActiveTab('chat');
                    handleAskJiminiWithClue(toast.clueObj!);
                    setToast(null);
                  }}
                  className="flex-1 py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>🗣️ Jimini와 이 단서 정밀 감식하기</span>
                </button>

                <button
                  onClick={() => {
                    detectiveFx.playOptionClick();
                    setActiveTab('clues');
                    setToast(null);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                  <span>🗂️ 단서함 확인</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Left Navigation Sidebar (Only 3 Tabs: Chat, Browser, Clues) */}
      <GeminiSidebar
        cases={cases}
        activeCaseId={activeCaseId}
        onSelectCase={(id) => setActiveCaseId(id)}
        onNewCase={handleNewCase}
        registeredClues={registeredClues}
        snsPosts={activeCase.snsPosts || []}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        detectiveName={detectiveName}
        onOpenNameModal={() => setShowNameModal(true)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        <GeminiHeader
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          investigationScore={investigationScore}
          isSolved={isSolved}
          canAccuse={canAccuse}
          onOpenAccuseModal={() => setShowAccuseModal(true)}
        />

        {/* Content View Based on Active Tab */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 space-y-4">
          {/* TAB 1: JIMINI CHAT */}
          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
              {/* Welcoming Banner */}
              {messages.length <= 1 && (
                <div className="py-6 text-center space-y-2 animate-fadeIn">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    <span className="text-blue-500">{detectiveName}님</span>, 페이드북(Fadebook)에서 문장을 클릭해 단서를 찾아보세요!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    선택지 버튼을 누르거나 <span className="text-blue-500 font-bold">🌐 웹 브라우저</span>에서 **페이드북 / 트윗처 / 인스타픽**의 글과 댓글 문장을 직접 클릭해 보세요!
                  </p>
                </div>
              )}

              {/* Chat Message List with Streaming support */}
              {messages.map((msg, index) => {
                const isLatest = index === messages.length - 1;
                return (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    onSelectOption={handleSelectOption}
                    onOpenAccuseModal={() => setShowAccuseModal(true)}
                    isLatestMessage={isLatest}
                    isAiThinking={isAiThinking}
                    isStreaming={isStreaming && isLatest && msg.sender === 'gemini'}
                    canAccuse={canAccuse}
                    isSolved={isSolved}
                  />
                );
              })}

              {/* Jimini AI Thinking Indicator */}
              {isAiThinking && (
                <div className="flex items-center gap-2.5 my-4 text-blue-500 font-medium text-xs animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Jimini가 클릭된 단서와 SNS 타임라인을 대조하며 다음 선택지를 추론 중입니다...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* TAB 2: WEB OS BROWSER (Fakebook, Twitter, Instagram, Notes) */}
          {activeTab === 'sns' && (
            <WebOsBrowser
              posts={activeCase.snsPosts || []}
              caseTitle={activeCase.title}
              registeredClues={registeredClues}
              onFoundClueSentence={handleFoundClueSentence}
              onFoundClueComment={handleFoundClueComment}
              onNonClueClick={handleNonClueClick}
              activeBrowserTab={activeBrowserTab}
              setActiveBrowserTab={setActiveBrowserTab}
              notes={notes}
              onUpdateNotes={setNotes}
              onSendNotesToJimini={handleSendNotesToJimini}
              onSwitchToJiminiChat={() => setActiveTab('chat')}
            />
          )}

          {/* TAB 3: CLUES & EVIDENCE DOCKET */}
          {activeTab === 'clues' && (
            <CluesInspector
              clues={registeredClues}
              caseTitle={activeCase.title}
              onGoToSns={() => setActiveTab('sns')}
              onRemoveClue={handleRemoveClue}
              onAskJiminiWithClue={handleAskJiminiWithClue}
            />
          )}
        </main>

        {/* Bottom Floating Input Bar */}
        {activeTab === 'chat' && (
          <GeminiInputBar
            onSendMessage={handleCustomSendMessage}
            isAiThinking={isAiThinking || isStreaming}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        )}
      </div>

      {/* Suspect Accusation Modal */}
      {showAccuseModal && (
        <SuspectAccusationModal
          suspects={suspects}
          registeredClues={registeredClues}
          caseTitle={activeCase.title}
          remainingWarrantAttempts={remainingWarrantAttempts}
          isSolved={isSolved}
          onClose={() => setShowAccuseModal(false)}
          onAccuseSuspect={handleAccuseSuspect}
        />
      )}

      {/* Detective Name Registration Modal */}
      <DetectiveRegistrationModal
        initialName={detectiveName}
        isOpen={showNameModal}
        onSaveName={(name) => {
          setDetectiveName(name);
          setShowNameModal(false);
        }}
      />
    </div>
  );
}
