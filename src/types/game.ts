export interface GameStats {
  power: number;   // 0-100: 동력 에너지를 나타냄
  shield: number;  // 0-100: 기지 및 방어 체력
  sanity: number;  // 0-100: 정신력 및 정신적 저항력
  hack: number;    // 0-100: AI 중앙 통제 해킹 및 우회 진행도 (100% 달성 시 승리!)
}

export interface ChoiceEffect {
  label: string;
  powerEffect: number;
  shieldEffect: number;
  sanityEffect: number;
  hackEffect: number;
}

export interface StoryCard {
  id: string;
  speaker: string;
  title: string;
  description: string;
  avatarType?: 'ai' | 'drone' | 'survivor' | 'terminal' | 'alarm' | 'ghost';
  leftChoice: ChoiceEffect;
  rightChoice: ChoiceEffect;
  levelReq?: number;
}

export interface StoryLogEntry {
  id: string;
  turn: number;
  title: string;
  speaker: string;
  choiceMade: string;
  statChanges: Partial<GameStats>;
  timestamp: string;
}

export type GameMode = 'EXPLORE' | 'CARD_DECISION' | 'GAME_OVER' | 'VICTORY';
