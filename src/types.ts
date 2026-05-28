import { Timestamp } from 'firebase/firestore';

export interface Survey {
  id: string;
  question: string;
  options: string[];
  activeFrom: Timestamp;
  activeTo: Timestamp;
  status: 'planned' | 'active' | 'archived';
  totalVotes: number;
  results: Record<string, number>; // optionIndex -> count
  demographics?: {
    ageRange?: Record<string, number>;
    gender?: Record<string, number>;
    state?: Record<string, number>;
  };
  weekLabel: string; // e.g., "Week 20, 2026"
}

export interface Vote {
  surveyId: string;
  optionIndex: number;
  timestamp: Timestamp;
  deviceId: string;
  demographics?: {
    ageRange?: string;
    gender?: string;
    state?: string;
    employmentStatus?: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  isAdmin: boolean;
  points: number;
  streak: number;
  level: number;
  badges: string[];
  lastParticipationDate?: string; // ISO date
  history: { surveyId: string; timestamp: string; }[];
  referralCount: number;
  referralCode: string;
  state?: string;
  ageRange?: string;
  gender?: string;
  employmentStatus?: string;
  lastDemographicsUpdate?: string; // ISO date for 30-day cooldown
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'participation' | 'community' | 'state' | 'truth';
}

export interface Level {
  rank: number;
  name: string;
  minPoints: number;
  emoji: string;
}

export const LEVELS: Level[] = [
  { rank: 1, name: "Citizen", minPoints: 0, emoji: "🇳🇬" },
  { rank: 2, name: "Active Citizen", minPoints: 50, emoji: "📢" },
  { rank: 3, name: "Community Voice", minPoints: 150, emoji: "🤝" },
  { rank: 4, name: "Pulse Leader", minPoints: 400, emoji: "⚡" },
  { rank: 5, name: "National Influencer", minPoints: 1000, emoji: "👑" },
];

export const BADGES: Badge[] = [
  { id: 'first_voice', name: 'First Voice', description: 'Answered your first Pulse question', emoji: '🎉', category: 'participation' },
  { id: 'pulse_guardian', name: 'Pulse Guardian', description: 'Maintained a 4-week streak', emoji: '🛡️', category: 'participation' },
  { id: 'truth_teller', name: 'Truth Teller', description: 'Completed your demographic profile', emoji: '⚖️', category: 'truth' },
  { id: 'state_rep', name: 'State Representative', description: 'Active contributor from your state', emoji: '🏛️', category: 'state' },
  { id: 'community_builder', name: 'Community Builder', description: 'Invited 3 friends to the Pulse', emoji: '🏗️', category: 'community' },
  { id: 'pulse_ambassador', name: 'Pulse Ambassador', description: 'Invited 10 friends to the Pulse', emoji: '🌍', category: 'community' },
];
