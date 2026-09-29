export interface Suspect {
  id: string;
  name: string;
  role: string;
  handle?: string;
  avatarUrl?: string;
  avatarLetter?: string;
  suspicionLevel: number;
  isAlibiRevealed: boolean;
  isMotiveRevealed: boolean;
  alibiText: string;
  motive?: string;
}

export type PlatformType = 'fadebook' | 'twitcher' | 'instapic' | 'notes';

export interface SnsComment {
  id: string;
  authorName: string;
  authorHandle?: string;
  content: string;
  timeAgo: string;
  likesCount?: number;
  isRealClue?: boolean;
  isDecoy?: boolean;
  clueTitle?: string;
  clueSummary?: string;
  keyPhrase?: string;
  keywords?: string[];
  fakeVerdictReason?: string;
}

export interface ClueSentence {
  text: string;
  isClue: boolean;
  isDecoy?: boolean;
  clueTitle?: string;
  clueSummary?: string;
  keywords?: string[];
  fakeVerdictReason?: string;
}

export interface SnsPost {
  id: string;
  platform: 'fadebook' | 'twitcher' | 'instapic' | 'fakebook' | 'twitter' | 'instagram';
  authorName: string;
  authorHandle?: string;
  authorRole?: string;
  avatarLetter?: string;
  timeAgo: string;
  content: string;
  sentences?: ClueSentence[];
  tags?: string[];
  likesCount?: number;
  commentsCount?: number;
  commentsList?: SnsComment[];
  isRealClue: boolean;
  isDecoy?: boolean;
  clueTitle: string;
  clueSummary?: string;
  cluePrompt: string;
  keyPhrase?: string;
  keywords?: string[];
  fakeVerdictReason?: string;
}

export interface RegisteredClue {
  id: string;
  sourcePostId?: string;
  platform: 'fadebook' | 'twitcher' | 'instapic' | 'fakebook' | 'twitter' | 'instagram' | 'field' | 'custom';
  title: string;
  contentSnippet: string;
  authorName: string;
  registeredAt: string;
  isKeyEvidence: boolean;
  isDecoy?: boolean;
  verificationStatus?: 'unverified' | 'verified_true' | 'verified_fake' | 'verified_valid' | 'verified_invalid';
  verificationVerdict?: string;
  cluePrompt?: string;
}

export interface CaseFile {
  id: string;
  title: string;
  category: string;
  difficulty: '보통' | '어려움' | '최고 난이도';
  summary: string;
  location: string;
  victim: string;
  initialClues: string[];
  suspects: Suspect[];
  snsPosts: SnsPost[];
  solutionSummary?: string;
  culpritId?: string;
}

export interface OptionButton {
  id: number;
  label: string;
  isSnsClue?: boolean;
  clueRef?: RegisteredClue;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  selectedOptionNumber?: number;
  text: string;
  options?: OptionButton[];
  timestamp: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  newCluesFound?: string[];
}

export interface CaseProgressState {
  messages: ChatMessage[];
  registeredClues: RegisteredClue[];
  suspects: Suspect[];
  investigationScore: number;
  isSolved: boolean;
  investigationStep: number;
  notes: string;
  discoveredPostIds: string[];
  foundCluePhrases: string[];
}
