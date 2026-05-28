import React from 'react';
import { useSurvey } from '../context/SurveyContext';
import { useGamification } from '../context/GamificationContext';
import { motion } from 'motion/react';
import { Mail, Zap, TrendingUp, History, Shield, LogOut, MapPin, User, Calendar, Briefcase, ChevronRight, Share2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { ParticipationHistory } from './ParticipationHistory';
import { BADGES, LEVELS } from '../types';
import { ShareDialog } from './ShareDialog';
import { cn } from '../lib/utils';
import { DemographicsScreen } from './DemographicsScreen';
import { StarRating } from './StarRating';

export function UserProfile() {
  const { user } = useSurvey();
  const { profile, currentLevel, nextLevel, progressToNext } = useGamification();
  const [isEditingDemographics, setIsEditingDemographics] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
        <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6">
          <Shield className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Access Secure Area</h2>
        <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Please sign in to view your profile, rewards, and national contribution stats.</p>
      </div>
    );
  }

  if (isEditingDemographics) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
        <DemographicsScreen 
          onComplete={() => setIsEditingDemographics(false)} 
          onSkip={() => setIsEditingDemographics(false)} 
        />
      </motion.div>
    );
  }

  const canUpdateDemographics = () => {
    if (!profile.lastDemographicsUpdate) return true;
    const lastUpdate = new Date(profile.lastDemographicsUpdate);
    const now = new Date();
    const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 30;
  };

  const getCooldownDays = () => {
    if (!profile.lastDemographicsUpdate) return 0;
    const lastUpdate = new Date(profile.lastDemographicsUpdate);
    const now = new Date();
    const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
    return Math.ceil(30 - diffDays);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-8 mb-8 sm:mb-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 rounded-[24px] sm:rounded-[40px] flex items-center justify-center text-white relative overflow-hidden shrink-0 group">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl sm:text-3xl font-black">{user.email?.charAt(0).toUpperCase()}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900 mb-1 sm:mb-2 truncate">
              {user.displayName || 'Citizen Pulse'}
            </h1>
            <div className="flex items-center gap-1.5 sm:text-slate-400 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => auth.signOut()}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
        <div className="bg-white border border-slate-100 rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 shadow-sm flex items-center gap-4 sm:gap-6 group hover:border-emerald-100 transition-all">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 rounded-[20px] sm:rounded-[28px] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Voice Level</div>
            <div className="text-xl sm:text-3xl font-black text-slate-900 truncate">{currentLevel.emoji} {currentLevel.name}</div>
            <div className="mt-2 w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                className="h-full bg-nigeria-green"
               />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 shadow-sm flex items-center gap-4 sm:gap-6 group hover:border-emerald-100 transition-all">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-[20px] sm:rounded-[28px] flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform shrink-0">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Total Points</div>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 truncate">{profile.points} <span className="text-xs sm:text-sm text-slate-400 font-bold uppercase ml-0.5 sm:ml-1">PTS</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 md:p-12 mb-10 sm:mb-16 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 sm:p-8 pointer-events-none">
          <MapPin className="w-16 h-16 sm:w-24 sm:h-24 text-slate-50 opacity-10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1 sm:mb-2 uppercase tracking-tight">Your Demographic Identity</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest">Helping Nigeria see the full picture</p>
            </div>
            {profile.state && profile.ageRange ? (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100">
                  <MapPin size={16} className="text-nigeria-green shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-slate-700">{profile.state}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100">
                  <Calendar size={16} className="text-nigeria-gold shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-slate-700">{profile.ageRange}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100">
                  <User size={16} className="text-nigeria-blue shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-slate-700">{profile.gender}</span>
                </div>
              </div>
            ) : (
                <div className="bg-nigeria-gold/5 border border-nigeria-gold/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4 w-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-sm shrink-0">⚖️</div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-800">Incomplete Profile</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">Unlock filters and badges by sharing your background.</p>
                  </div>
                </div>
            )}
          </div>

          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6 sm:pt-10 border-t border-slate-100/50">
            <button 
              onClick={() => setIsEditingDemographics(true)}
              disabled={!canUpdateDemographics()}
              className={cn(
                "w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center",
                canUpdateDemographics() 
                  ? "bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {canUpdateDemographics() ? 'Update Demographics' : `Update in ${getCooldownDays()} Days`}
            </button>
            
            <button
               onClick={() => setIsShareDialogOpen(true)}
              className="flex items-center justify-center w-full sm:w-auto gap-2.5 sm:gap-3 py-3 sm:py-0 border border-slate-100 sm:border-0 rounded-xl sm:rounded-none text-xs font-black text-slate-400 uppercase tracking-wider sm:tracking-widest hover:text-nigeria-green transition-colors"
            >
              <Share2 size={15} />
              Share Representation
            </button>
          </div>
        </div>
      </div>

      <ShareDialog 
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        type="state_rivalry"
        data={{
          stateName: profile.state || "Nigeria",
          rank: 1,
          value: profile.points
        }}
      />

      <div className="mb-10 sm:mb-16">
        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-6 sm:mb-8 flex items-center gap-2.5 sm:gap-3 uppercase tracking-tight">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-nigeria-green" />
          Achievement Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = profile.badges.includes(badge.id);

            return (
              <div 
                key={badge.id}
                className={cn(
                  "flex flex-col items-center justify-center p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border transition-all",
                  isUnlocked 
                    ? "border-slate-100 bg-white shadow-sm scale-100" 
                    : "border-slate-50 bg-slate-50/50 grayscale opacity-40 scale-95"
                )}
              >
                <span className="text-3xl sm:text-4xl mb-3 sm:mb-4">{badge.emoji}</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-center leading-tight mb-1">{badge.name}</span>
                <span className="text-[8px] font-bold text-slate-400 text-center leading-tight opacity-70">
                  {isUnlocked ? 'Unlocked' : badge.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-16">
        <StarRating />
      </div>

      <div className="pt-12 border-t border-slate-100">
        <ParticipationHistory />
      </div>
    </motion.div>
  );
}
