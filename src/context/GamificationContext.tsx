import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, LEVELS, BADGES, Level, Badge } from '../types';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

interface GamificationContextType {
  profile: UserProfile;
  addPoints: (amount: number) => void;
  recordParticipation: () => void;
  unlockBadge: (badgeId: string) => void;
  updateDemographics: (data: Partial<UserProfile>) => void;
  currentLevel: Level;
  nextLevel: Level | null;
  progressToNext: number;
  isNewBadgeOpen: boolean;
  setIsNewBadgeOpen: (open: boolean) => void;
  latestBadge: Badge | null;
}

const STORAGE_KEY = 'nigeria_pulse_gamification';

const DEFAULT_PROFILE: UserProfile = {
  uid: uuidv4(),
  email: null,
  isAdmin: false,
  points: 0,
  streak: 0,
  level: 1,
  badges: [],
  history: [],
  referralCount: 0,
  referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure new fields exist in old saved profiles
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          history: parsed.history || [],
          badges: parsed.badges || [],
          points: parsed.points || 0,
        };
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const addPoints = (amount: number) => {
    setProfile(prev => {
      const currentPoints = prev.points || 0;
      const newPoints = currentPoints + amount;
      const nextLevelIdx = LEVELS.findIndex(l => l.minPoints > newPoints);
      const newLevelRank = nextLevelIdx === -1 ? LEVELS.length : LEVELS[nextLevelIdx - 1].rank;
      
      if (newLevelRank > (prev.level || 1)) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#008751', '#FCD116', '#FFFFFF']
        });
      }

      return {
        ...prev,
        points: newPoints,
        level: Math.max(prev.level || 1, newLevelRank)
      };
    });
  };

  const unlockBadge = (badgeId: string) => {
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    setProfile(prev => {
      const currentBadges = prev.badges || [];
      if (currentBadges.includes(badgeId)) return prev;
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#008751', '#FCD116', '#FFFFFF']
      });

      setLatestBadge(badge);
      setIsNewBadgeOpen(true);

      return {
        ...prev,
        badges: [...currentBadges, badgeId],
        points: (prev.points || 0) + 15
      };
    });
  };

  useEffect(() => {
    if (!profile?.history) return;

    // Check for first_voice badge
    if (profile.history.length > 0 && !profile.badges?.includes('first_voice')) {
      unlockBadge('first_voice');
    }
    
    // Check for pulse_guardian (4 week streak)
    if ((profile.streak || 0) >= 4 && !profile.badges?.includes('pulse_guardian')) {
      unlockBadge('pulse_guardian');
    }

    // Check for explorer (participated in 5 different surveys)
    if (profile.history.length >= 5 && !profile.badges?.includes('explorer')) {
      unlockBadge('explorer');
    }
  }, [profile?.points, profile?.streak, profile?.history?.length]);

  const recordParticipation = () => {
    const today = new Date().toISOString().split('T')[0];
    const history = profile.history || [];
    const isAlreadyParticipated = history.some(h => h.timestamp.split('T')[0] === today);
    if (isAlreadyParticipated) return;

    const lastDate = history.length > 0 ? new Date(history[0].timestamp) : null;
    let newStreak = profile.streak || 0;

    if (lastDate) {
      const diffInDays = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (diffInDays <= 7) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    setProfile(prev => ({
      ...prev,
      streak: newStreak,
      lastParticipationDate: today,
      history: [{ surveyId: 'current', timestamp: new Date().toISOString() }, ...(prev.history || [])].slice(0, 10),
      points: (prev.points || 0) + 10,
    }));
  };

  const updateDemographics = (data: Partial<UserProfile>) => {
    setProfile(prev => {
      const isCompletingAll = data.ageRange && data.gender && data.state && data.employmentStatus;
      const newBadges = [...(prev.badges || [])];
      let earnedPoints = 0;

      if (isCompletingAll && !newBadges.includes('truth_teller')) {
        newBadges.push('truth_teller');
        earnedPoints = 25; // 15 for badge + 10 for completion
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#008751', '#FCD116']
        });
      }

      return {
        ...prev,
        ...data,
        badges: newBadges,
        points: (prev.points || 0) + earnedPoints,
        lastDemographicsUpdate: new Date().toISOString()
      };
    });
  };

  const [isNewBadgeOpen, setIsNewBadgeOpen] = useState(false);
  const [latestBadge, setLatestBadge] = useState<Badge | null>(null);

  const currentLevel = LEVELS.find(l => l.rank === (profile.level || 1)) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.rank === (profile.level || 1) + 1) || null;
  
  let progressToNext = 0;
  if (nextLevel) {
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const progress = (profile.points || 0) - currentLevel.minPoints;
    progressToNext = Math.min(100, Math.max(0, (progress / range) * 100));
  } else {
    progressToNext = 100;
  }

  return (
    <GamificationContext.Provider value={{
      profile,
      addPoints,
      recordParticipation,
      unlockBadge,
      updateDemographics,
      currentLevel,
      nextLevel,
      progressToNext,
      isNewBadgeOpen,
      setIsNewBadgeOpen,
      latestBadge
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within GamificationProvider');
  return context;
};
