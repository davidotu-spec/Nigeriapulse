import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  db, 
  auth,
  collection, 
  query, 
  where, 
  orderBy,
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  getDoc,
  onAuthStateChanged,
  User,
  addDoc,
  Timestamp,
  writeBatch
} from '../lib/firebase';
import { Survey, Vote } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SurveyContextType {
  currentSurvey: Survey | null;
  loading: boolean;
  hasVoted: boolean;
  userVote: Vote | null;
  vote: (optionIndex: number, comment?: string, demographics?: Vote['demographics']) => Promise<void>;
  deviceId: string;
  user: User | null;
  userProfile: any | null;
  points: number;
  language: 'en' | 'pidgin' | 'hausa' | 'yoruba' | 'igbo';
  setLanguage: (lang: 'en' | 'pidgin' | 'hausa' | 'yoruba' | 'igbo') => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [points, setPoints] = useState(0);
  const [language, setLanguage] = useState<'en' | 'pidgin' | 'hausa' | 'yoruba' | 'igbo'>('en');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profileRef = doc(db, 'users', u.uid);
        onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            setPoints(data.points || 0);
          } else {
            setDoc(profileRef, {
              email: u.email,
              points: 0,
              streak: 0,
              lastActive: serverTimestamp()
            });
            setPoints(0);
          }
        });
      } else {
        setUserProfile(null);
        setPoints(0);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let id = localStorage.getItem('nigeria_pulse_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('nigeria_pulse_device_id', id);
    }
    setDeviceId(id);

    const q = query(collection(db, 'surveys'), orderBy('activeFrom', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Survey));
      const now = new Date();
      
      // Find the survey that is currently active based on time and status
      const activePulse = surveys.find(s => {
        const from = s.activeFrom instanceof Timestamp ? s.activeFrom.toDate() : new Date(s.activeFrom as any);
        const to = s.activeTo instanceof Timestamp ? s.activeTo.toDate() : new Date(s.activeTo as any);
        return s.status === 'active' && now >= from && now < to;
      });

      if (activePulse) {
        setCurrentSurvey(activePulse);
        
        const activeId = auth.currentUser?.uid || id;
        const voteRef = doc(db, 'surveys', activePulse.id, 'votes', activeId);
        getDoc(voteRef).then(vDoc => {
          setHasVoted(vDoc.exists());
          if (vDoc.exists()) {
            setUserVote({ ...vDoc.data() } as unknown as Vote);
          } else {
            setUserVote(null);
          }
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      } else {
        setCurrentSurvey(null);
        setHasVoted(false);
        setLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'surveys');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const vote = async (optionIndex: number, comment?: string, demographics?: Vote['demographics']) => {
    if (!currentSurvey) return;

    const activeId = auth.currentUser?.uid || deviceId;
    const surveyId = currentSurvey.id;
    const voteRef = doc(db, 'surveys', surveyId, 'votes', activeId);
    const surveyRef = doc(db, 'surveys', surveyId);
    const batch = writeBatch(db);

    try {
      const votePayload: any = {
        surveyId,
        optionIndex,
        timestamp: serverTimestamp(),
        deviceId,
      };

      if (auth.currentUser?.uid) {
        votePayload.userId = auth.currentUser.uid;
      }

      if (comment && comment.trim()) {
        votePayload.comment = comment.trim();
        
        // Add comment to subcollection
        const commentRef = doc(collection(db, 'surveys', surveyId, 'comments'));
        batch.set(commentRef, {
          comment: comment.trim(),
          timestamp: serverTimestamp(),
          optionIndex
        });
      }

      if (demographics && (demographics.state || demographics.ageRange || demographics.gender)) {
        votePayload.demographics = demographics;
      }

      // 1. Create Vote
      batch.set(voteRef, votePayload);

      // 2. Increment Survey Results
      const updates: any = {
        totalVotes: increment(1),
        [`results.${optionIndex}`]: increment(1),
        updatedAt: serverTimestamp()
      };

      if (demographics?.ageRange) {
        updates[`demographics.ageRange.${demographics.ageRange}`] = increment(1);
      }
      if (demographics?.gender) {
        updates[`demographics.gender.${demographics.gender}`] = increment(1);
      }
      if (demographics?.state) {
        updates[`demographics.state.${demographics.state}`] = increment(1);
      }

      batch.update(surveyRef, updates);

      // 3. Update User Profile if logged in
      if (auth.currentUser) {
        const profileRef = doc(db, 'users', auth.currentUser.uid);
        
        let newStreak = userProfile?.streak || 0;
        const lastActive = userProfile?.lastActive?.toDate?.() || new Date(0);
        const now = new Date();
        const diffDays = (now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
        
        // streak logic:
        // if never voted: streak = 1
        // if last vote was between 1 and 8 days ago: streak++
        // if last vote was today: keep streak
        // if last vote > 8 days ago: streak = 1
        if (newStreak === 0) {
          newStreak = 1;
        } else if (diffDays >= 1 && diffDays <= 8) {
          newStreak += 1;
        } else if (diffDays > 8) {
          newStreak = 1;
        }

        batch.update(profileRef, {
          points: increment(10),
          streak: newStreak,
          lastActive: serverTimestamp()
        });
      }

      await batch.commit();
      setHasVoted(true);
      setUserVote(votePayload as unknown as Vote);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `surveys/${surveyId}/votes/${activeId}`);
    }
  };

  return (
    <SurveyContext.Provider value={{ 
      currentSurvey, 
      loading, 
      hasVoted, 
      vote, 
      deviceId, 
      user, 
      userProfile, 
      points,
      language,
      setLanguage,
      userVote
    }}>
      {children}
    </SurveyContext.Provider>
  );
}

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) throw new Error('useSurvey must be used within SurveyProvider');
  return context;
};
