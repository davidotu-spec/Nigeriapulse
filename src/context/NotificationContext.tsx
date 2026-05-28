import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { messaging, db, auth, doc, setDoc, serverTimestamp } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, Zap, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSurvey } from './SurveyContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'pulse' | 'trending';
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  dismissNotification: (id: string) => void;
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, message: string, type?: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentSurvey } = useSurvey();
  const [lastSeenPulseId, setLastSeenPulseId] = useState<string | null>(localStorage.getItem('last_seen_pulse_id'));

  // Handle in-app messaging when app is open
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      if (payload.notification) {
        showNotification(
          payload.notification.title || 'New Update',
          payload.notification.body || '',
          'info'
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Detect new pulse questions
  useEffect(() => {
    if (currentSurvey && currentSurvey.id !== lastSeenPulseId) {
      // Don't notify on the very first load if it's the same one, 
      // but if ID changed, it's a new pulse
      if (lastSeenPulseId) {
        showNotification(
          'New Pulse Question Live!',
          `Participate in "${currentSurvey.question}" now.`,
          'pulse'
        );
      }
      setLastSeenPulseId(currentSurvey.id);
      localStorage.setItem('last_seen_pulse_id', currentSurvey.id);
    }
  }, [currentSurvey, lastSeenPulseId]);

  const showNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => dismissNotification(newNotif.id), 8000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!messaging) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: (import.meta as any).env.VITE_FCM_VAPID_KEY
        });
        
        if (token && auth.currentUser) {
          // Store token in user's profile or dedicated collection
          await setDoc(doc(db, 'fcm_tokens', auth.currentUser.uid), {
            token,
            updatedAt: serverTimestamp(),
            email: auth.currentUser.email
          }, { merge: true });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return false;
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, dismissNotification, requestPermission, showNotification }}>
      {children}
      
      {/* In-app Notification UI - Refined Responsiveness */}
      <div className="fixed top-4 md:top-10 left-0 right-0 sm:left-auto sm:right-8 z-[9999] pointer-events-none flex flex-col items-center sm:items-end gap-3 px-4 sm:px-0">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className="pointer-events-auto w-full max-w-[400px] sm:max-w-sm bg-white/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden ring-1 ring-black/5"
            >
              <div className="flex p-3 sm:p-4 gap-3 sm:gap-4 items-center">
                <div className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-[20px] flex items-center justify-center shadow-inner",
                  n.type === 'pulse' ? "bg-emerald-500 text-white" : 
                  n.type === 'trending' ? "bg-amber-500 text-white" : "bg-slate-900 text-white"
                )}>
                  {n.type === 'pulse' ? <Zap className="h-5 w-5 sm:h-6 sm:w-6" /> : 
                   n.type === 'trending' ? <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" /> : <Info className="h-5 w-5 sm:h-6 sm:w-6" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h4 className="text-[12px] sm:text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tight truncate">{n.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 font-medium leading-[1.3] line-clamp-2 sm:line-clamp-3">{n.message}</p>
                </div>
                <button 
                  onClick={() => dismissNotification(n.id)}
                  className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all active:scale-90"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="h-0.5 w-full bg-slate-50">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className={cn(
                    "h-full",
                    n.type === 'pulse' ? "bg-emerald-500" : 
                    n.type === 'trending' ? "bg-amber-500" : "bg-slate-900"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
