import React, { useState } from 'react';
import { useSurvey } from '../context/SurveyContext';
import { Share2, Zap, User, LogOut, Award, Shield, Bell, BellOff, Globe, QrCode } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ShareDialog } from './ShareDialog';
import { auth, signOut } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useNotification } from '../context/NotificationContext';

interface NavbarProps {
  isAdminMode?: boolean;
  setIsAdminMode?: (val: boolean) => void;
  currentView?: 'welcome' | 'how-it-works' | 'mission' | 'trust' | 'setup' | 'demographics' | 'first-action' | 'pulse' | 'results' | 'profile';
  onViewChange?: (view: 'welcome' | 'how-it-works' | 'mission' | 'trust' | 'setup' | 'demographics' | 'first-action' | 'pulse' | 'results' | 'profile') => void;
}

const LANGUAGES = [
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'pidgin', label: 'PID', full: 'Pidgin' },
  { id: 'yoruba', label: 'YOR', full: 'Yoruba' },
  { id: 'hausa', label: 'HAU', full: 'Hausas' },
  { id: 'igbo', label: 'IGB', full: 'Igbo' },
];

export function Navbar({ isAdminMode, setIsAdminMode, currentView, onViewChange }: NavbarProps) {
  const { currentSurvey, user, userProfile, language, setLanguage } = useSurvey();
  const { requestPermission } = useNotification();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareTab, setShareTab] = useState<'card' | 'qr'>('card');

  const openShare = (tab: 'card' | 'qr' = 'card') => {
    setShareTab(tab);
    setIsShareDialogOpen(true);
  };

  const handleNotificationRequest = async () => {
    setIsNotifying(true);
    await requestPermission();
    setIsNotifying(false);
  };

  return (
    <>
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="h-16 flex items-center justify-between px-3 md:px-8 border-b border-slate-50">
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-nigeria-green rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <button 
            onClick={() => {
              setIsAdminMode?.(false);
              onViewChange?.('welcome');
            }}
            className="text-xs sm:text-base md:text-xl font-bold tracking-tight text-slate-900 border-none bg-none p-0 cursor-pointer text-left whitespace-nowrap"
          >
            NIGERIA
            <span className="text-nigeria-green font-light underline decoration-nigeria-gold decoration-4 underline-offset-4 ml-1">
              PULSE
            </span>
          </button>
        </div>

        <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-500 items-center">
          <button 
            onClick={() => {
              setIsAdminMode?.(false);
              onViewChange?.('pulse');
            }}
            className={cn(
              "transition-colors",
              (!isAdminMode && currentView === 'pulse') ? "text-nigeria-green font-bold" : "hover:text-slate-900"
            )}
          >
            Active Pulse
          </button>
          <button 
            onClick={() => {
              setIsAdminMode?.(false);
              onViewChange?.('results');
            }}
            className={cn(
              "transition-colors",
              (!isAdminMode && currentView === 'results') ? "text-nigeria-green font-bold" : "hover:text-slate-900"
            )}
          >
            Live Results
          </button>
          <button 
            onClick={() => {
              setIsAdminMode?.(false);
              onViewChange?.('profile');
            }}
            className={cn(
              "transition-colors",
              (!isAdminMode && currentView === 'profile') ? "text-nigeria-green font-bold" : "hover:text-slate-900"
            )}
          >
            Your Profile
          </button>
          
          <button 
            onClick={() => setIsAdminMode?.(true)}
            className={cn(
              "flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg",
              isAdminMode 
                ? "bg-slate-900 text-white" 
                : "text-slate-400 hover:text-nigeria-green hover:bg-emerald-50 border border-transparent hover:border-emerald-100"
            )}
          >
            <Shield className="h-3 w-3" /> Console
          </button>
        </nav>
        
        <div className="flex items-center gap-1.5 md:gap-4">
          {user ? (
            <div className="flex items-center gap-1.5 md:gap-3 bg-[#FDFCF8] px-2 md:px-3 py-1.5 rounded-full border border-slate-100">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-black text-nigeria-green tracking-tighter uppercase flex items-center gap-1">
                  <Award className="h-2 w-2 text-nigeria-gold" /> {userProfile?.points || 0} PTS
                </span>
                <span className="text-[10px] font-bold text-slate-700">Participating</span>
              </div>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-nigeria-gold/20 overflow-hidden"
              >
                <User className="h-4 w-4 text-nigeria-green" />
              </button>
              {isProfileOpen && (
                <div className="absolute top-16 right-2 md:right-4 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                  <div className="p-3 border-b border-slate-50">
                     <p className="text-xs font-bold truncate">{user.email}</p>
                     <p className="text-[10px] text-slate-400 mt-1 uppercase">Nigeria Pulse Member</p>
                  </div>
                  <button 
                    onClick={() => signOut(auth)}
                    className="w-full flex items-center gap-2 p-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-3 md:px-5 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200 shrink-0"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={handleNotificationRequest}
            disabled={isNotifying}
            className={cn(
              "hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-sm active:scale-95",
              isNotifying && "animate-pulse opacity-50"
            )}
            title="Enable Notifications"
          >
            <Bell className="h-4 w-4 text-slate-500" />
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
             {['en', 'pidgin'].map((lang) => (
                <button
                   key={lang}
                   onClick={() => setLanguage(lang as any)}
                   className={cn(
                     "px-1.5 sm:px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                     language === lang 
                       ? "bg-white text-emerald-700 shadow-sm" 
                       : "text-slate-400 hover:text-slate-600"
                   )}
                >
                  {lang === 'pidgin' ? 'PID' : lang}
                </button>
             ))}
          </div>

          <button 
            onClick={() => openShare('qr')}
            className="hidden sm:flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-sm hover:border-slate-300 active:scale-95"
            title="App QR Code"
          >
            <QrCode className="h-4 w-4 text-slate-700" />
          </button>

          <button 
            onClick={() => openShare('card')}
            className="hidden sm:flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-sm hover:border-emerald-200 active:scale-95"
            title="Share Pulse"
          >
            <Share2 className="h-4 w-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation */}
      <nav className="lg:hidden flex items-center justify-around px-2 py-2 bg-slate-50/50 backdrop-blur-sm overflow-x-auto no-scrollbar whitespace-nowrap gap-4">
        <button 
          onClick={() => {
            setIsAdminMode?.(false);
            onViewChange?.('pulse');
          }}
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3 py-1 transition-all",
            (!isAdminMode && currentView === 'pulse') ? "text-nigeria-green bg-white shadow-sm rounded-lg" : "text-slate-400"
          )}
        >
          Pulse
        </button>
        <button 
          onClick={() => {
            setIsAdminMode?.(false);
            onViewChange?.('results');
          }}
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3 py-1 transition-all",
            (!isAdminMode && currentView === 'results') ? "text-nigeria-green bg-white shadow-sm rounded-lg" : "text-slate-400"
          )}
        >
          Results
        </button>
        <button 
          onClick={() => {
            setIsAdminMode?.(false);
            onViewChange?.('profile');
          }}
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3 py-1 transition-all",
            (!isAdminMode && currentView === 'profile') ? "text-nigeria-green bg-white shadow-sm rounded-lg" : "text-slate-400"
          )}
        >
          Profile
        </button>
        {isAdminMode && (
          <button 
            onClick={() => setIsAdminMode?.(true)}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 text-slate-900 bg-white shadow-sm rounded-lg"
          >
            Console
          </button>
        )}
      </nav>
    </header>

    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    
    <ShareDialog 
      isOpen={isShareDialogOpen}
      onClose={() => setIsShareDialogOpen(false)}
      type="weekly_result"
      initialTab={shareTab}
      data={{
        question: currentSurvey?.question || "Have your say on Nigeria's future",
        value: 62,
        insight: "National Pulse"
      }}
    />
    </>
  );
}
