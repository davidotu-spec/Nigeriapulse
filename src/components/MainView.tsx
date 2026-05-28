import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSurvey } from '../context/SurveyContext';
import { QuestionCard } from './QuestionCard';
import { ResultsView } from './ResultsView';
import { Navbar } from './Navbar';
import { AdminView } from './AdminView';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { WelcomeScreen } from './WelcomeScreen';
import { MissionScreen } from './MissionScreen';
import { TrustScreen } from './TrustScreen';
import { SetupScreen } from './SetupScreen';
import { DemographicsScreen } from './DemographicsScreen';
import { FirstActionScreen } from './FirstActionScreen';
import { HowItWorksScreen } from './HowItWorksScreen';
import { CommercialExperience } from './CommercialExperience';
import { AuthModal } from './AuthModal';
import { SuccessSharePrompt } from './SuccessSharePrompt';
import { AchievementDialog } from './AchievementDialog';
import { Footer } from './Footer';
import { useGamification } from '../context/GamificationContext';

import { GamificationStatus } from './GamificationStatus';

export function MainView() {
  const { currentSurvey, loading, hasVoted, userVote } = useSurvey();
  const { latestBadge, isNewBadgeOpen, setIsNewBadgeOpen } = useGamification();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'how-it-works' | 'mission' | 'trust' | 'setup' | 'demographics' | 'first-action' | 'pulse' | 'share-prompt' | 'results' | 'profile' | 'commercial'>('welcome');

  // Initial redirect for voted users
  React.useEffect(() => {
    if (hasVoted && !isAdminMode && currentView === 'welcome') {
      setCurrentView('results');
    }
  }, [hasVoted, isAdminMode]); // Remove currentView from dependencies to prevent fighting manual navigation

  const handleGetStarted = () => {
    if (hasVoted) {
      setCurrentView('results');
    } else {
      setCurrentView('how-it-works');
    }
  };

  const getUserAnswerText = () => {
    if (!userVote || !currentSurvey) return "Thinking...";
    return currentSurvey.options[userVote.optionIndex] || "Thinking...";
  };

  const getUserAnswerValue = () => {
    if (!userVote || !currentSurvey || !currentSurvey.results || currentSurvey.totalVotes === 0) return 0;
    const count = currentSurvey.results[userVote.optionIndex] || 0;
    return Math.round((count / currentSurvey.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-10 w-10 text-emerald-600" />
        </motion.div>
      </div>
    );
  }

  if (!currentSurvey && !isAdminMode && currentView !== 'welcome' && currentView !== 'how-it-works' && currentView !== 'mission' && currentView !== 'trust' && currentView !== 'setup' && currentView !== 'demographics' && currentView !== 'first-action') {
    return (
      <div className="flex h-screen w-full flex-col bg-slate-50">
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <button 
            onClick={() => setIsAdminMode(true)}
            className="absolute top-20 right-4 flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white transition-colors"
          >
            <Shield className="h-3 w-3" /> Admin
          </button>
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
            No active pulse found.
          </h2>
          <p className="mt-4 text-slate-500 max-w-sm">
            We're currently preparing the next weekly insight. Check back soon to have your voice heard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar 
        isAdminMode={isAdminMode} 
        setIsAdminMode={setIsAdminMode} 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      
      {!isAdminMode && currentView !== 'welcome' && (
        <GamificationStatus />
      )}
      
      {!isAdminMode && (
        <button 
          onClick={() => setIsAdminMode(!isAdminMode)}
          className="fixed bottom-14 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 shadow-xl border border-slate-700 hover:bg-black transition-all active:scale-90"
        >
          <Shield className="h-5 w-5 text-white" />
        </button>
      )}
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-12 md:px-8">
        <AnimatePresence mode="wait">
          {isAdminMode ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminView />
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => setIsAdminMode(false)}
                  className="text-xs font-bold tracking-widest text-slate-400 uppercase underline underline-offset-8 hover:text-slate-900 transition-colors"
                >
                  Exit Admin Management
                </button>
              </div>
            </motion.div>
          ) : currentView === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <WelcomeScreen 
                onGetStarted={handleGetStarted} 
                onHowItWorks={() => setCurrentView('how-it-works')}
                onWatchCommercial={() => setCurrentView('commercial')}
              />
            </motion.div>
          ) : currentView === 'commercial' ? (
            <CommercialExperience onClose={() => setCurrentView('welcome')} />
          ) : currentView === 'how-it-works' ? (
            <motion.div
              key="how-it-works"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <HowItWorksScreen onContinue={() => setCurrentView('mission')} />
            </motion.div>
          ) : currentView === 'mission' ? (
            <motion.div
              key="mission"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <MissionScreen onContinue={() => setCurrentView('trust')} />
            </motion.div>
          ) : currentView === 'trust' ? (
            <motion.div
              key="trust"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <TrustScreen onContinue={() => setCurrentView('setup')} />
            </motion.div>
          ) : currentView === 'setup' ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <SetupScreen 
                onContinueAnonymously={() => setCurrentView('first-action')} 
                onOpenAuth={() => setIsAuthOpen(true)}
                onContinueToDemographics={() => setCurrentView('demographics')}
              />
            </motion.div>
          ) : currentView === 'demographics' ? (
            <motion.div
              key="demographics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <DemographicsScreen 
                onComplete={() => setCurrentView('first-action')} 
                onSkip={() => setCurrentView('first-action')} 
              />
            </motion.div>
          ) : currentView === 'first-action' ? (
            <motion.div
              key="first-action"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <FirstActionScreen onAction={() => setCurrentView('pulse')} />
            </motion.div>
          ) : currentView === 'pulse' && !hasVoted ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <QuestionCard setCurrentView={setCurrentView} />
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setCurrentView('results')}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  View Live Results Dashboard
                </button>
              </div>
            </motion.div>
          ) : currentView === 'share-prompt' ? (
            <motion.div
              key="share-prompt"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <SuccessSharePrompt 
                surveyQuestion={currentSurvey?.question || ""}
                userAnswer={getUserAnswerText()}
                userAnswerPercentage={getUserAnswerValue()}
                onContinue={() => setCurrentView('results')}
              />
            </motion.div>
          ) : currentView === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <UserProfile />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResultsView />
              {!hasVoted && (
                <div className="mt-6 text-center">
                   <button 
                    onClick={() => setCurrentView('pulse')}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    ← Back to Vote
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AchievementDialog 
          badge={latestBadge} 
          isOpen={isNewBadgeOpen} 
          onClose={() => setIsNewBadgeOpen(false)} 
        />

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={() => {
            if (currentView === 'setup') {
              setCurrentView('demographics');
            } else if (currentView === 'first-action') {
              // Stay here or go to pulse? success in first action should probably go to pulse
              setCurrentView('pulse');
            }
          }}
        />

        {!isAdminMode && hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-emerald-700">
                Pulse Registered. Thank you for participating.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
