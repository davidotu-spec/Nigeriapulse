import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSurvey } from '../context/SurveyContext';
import { useGamification } from '../context/GamificationContext';
import { useNotification } from '../context/NotificationContext';
import { ArrowRight, ChevronRight, MapPin, User, Briefcase, Loader2, CheckCircle, ShieldCheck, Activity, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { TransparencyNote } from './TrustIndicators';

const states = [
  'Lagos', 'Abuja (FCT)', 'Kano', 'Rivers', 'Oyo', 'Enugu', 'Anambra', 
  'Kaduna', 'Plateau', 'Delta', 'Edo', 'Ogun', 'Abia', 'Adamawa', 
  'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 
  'Ebonyi', 'Ekiti', 'Gombe', 'Imo', 'Jigawa', 'Katsina', 'Kebbi', 
  'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Ondo', 'Osun', 'Sokoto', 
  'Taraba', 'Yobe', 'Zamfara'
];

export function QuestionCard({ setCurrentView }: { setCurrentView?: (view: 'pulse' | 'results' | 'share-prompt') => void }) {
  const { currentSurvey, vote, user, language } = useSurvey();
  const { recordParticipation, profile, unlockBadge, addPoints } = useGamification();
  const { showNotification } = useNotification();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [step, setStep] = useState(1); 
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [demographics, setDemographics] = useState({
    state: profile.state || '',
    ageRange: profile.ageRange || '',
    gender: profile.gender || '',
  });

  React.useEffect(() => {
    if (profile.state || profile.ageRange || profile.gender) {
      setDemographics({
        state: profile.state || '',
        ageRange: profile.ageRange || '',
        gender: profile.gender || '',
      });
    }
  }, [profile]);

  if (!currentSurvey) return null;

  const handleVote = async () => {
    if (selectedOption !== null && !isSubmitting && !isConfirmed) {
      setIsSubmitting(true);
      try {
        await vote(selectedOption, comment, demographics);
        
        // Gamification checks
        recordParticipation();
        if (demographics.ageRange && demographics.gender && demographics.state) {
          unlockBadge('truth_teller');
        }
        
        setIsSubmitting(false);
        setIsConfirmed(true);
      } catch (e) {
        setIsSubmitting(false);
        console.error("Vote submission error:", e);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl md:rounded-[40px] bg-white p-6 md:p-10 border border-slate-200 shadow-sm lg:p-14">
      <div className="absolute top-0 right-0 p-6 md:p-10">
        <span className="text-6xl md:text-8xl font-black text-slate-50 opacity-[0.03] select-none">
          PULSE
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-nigeria-green text-[10px] font-bold tracking-widest uppercase border border-nigeria-green/10 w-fit">
                <span className="w-1.5 h-1.5 bg-nigeria-green rounded-full animate-pulse"></span>
                Current Pulse Question
              </div>
              
              {profile.state && profile.ageRange && profile.gender && (
                <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-nigeria-green flex items-center justify-center text-[8px] text-white border border-white font-black">🇳🇬</div>
                    <div className="w-5 h-5 rounded-full bg-nigeria-gold flex items-center justify-center text-[8px] text-white border border-white font-black">P</div>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">
                    Representing: <span className="text-nigeria-green">{profile.state}</span> • {profile.ageRange} • {profile.gender}
                  </p>
                </div>
              )}
            </div>

            <TransparencyNote className="mb-8" />

            <div className="flex items-start gap-4 mb-8 md:mb-12">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 mt-2">
                 <Shield size={24} />
               </div>
               <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-800 md:text-5xl lg:text-6xl">
                {language !== 'en' && currentSurvey.translations?.[language] 
                  ? currentSurvey.translations[language] 
                  : currentSurvey.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {currentSurvey.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border-2 p-4 md:p-6 text-left transition-all duration-300 group shadow-sm",
                    selectedOption === index 
                      ? "border-nigeria-green bg-nigeria-green shadow-xl shadow-nigeria-green/20 text-white" 
                      : "border-slate-50 hover:border-nigeria-gold hover:bg-emerald-50/30 text-slate-700 bg-slate-50/50"
                  )}
                >
                  <span className="text-lg md:text-xl font-bold">
                    {option}
                  </span>
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:scale-110",
                    selectedOption === index ? "bg-white text-nigeria-green" : "bg-white text-slate-400 border border-slate-100"
                  )}>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-8">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <div className="flex gap-4 text-xs font-medium text-slate-400 justify-center sm:justify-start">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-nigeria-green" /> Anonymous</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-nigeria-blue" /> Live</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 italic sm:text-left text-center opacity-70">
                  "Your answer helps reveal how the nation feels this week."
                </p>
                <button 
                  onClick={() => setCurrentView?.('results')}
                  className="text-[10px] font-black uppercase tracking-widest text-nigeria-green hover:text-black transition-colors text-center sm:text-left mt-3 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm"
                >
                  See Results Dashboard — Every answer strengthens the Pulse
                </button>
              </div>
              <button
                disabled={selectedOption === null}
                onClick={() => setStep(2)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-10 py-4 md:py-5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-slate-200"
              >
                Next Step
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full text-slate-500 text-[10px] font-bold mb-8 tracking-widest uppercase">
              Demographic Insights (Optional)
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">
              Where are you pulsing from?
            </h2>
            <p className="mt-4 text-slate-400 max-w-md">Helping us map national mood across regions without compromising your privacy.</p>

            <div className="mt-12 space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  <MapPin className="h-3 w-3" /> State of Residence
                </label>
                <select 
                  value={demographics.state}
                  onChange={(e) => setDemographics({...demographics, state: e.target.value})}
                  className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-white p-5 text-lg font-bold text-slate-700 outline-none focus:border-nigeria-gold focus:bg-emerald-50/20 transition-colors cursor-pointer"
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Pulse Comment (Optional)
                </label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more about how you feel..."
                  maxLength={500}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-white p-5 text-sm font-medium text-slate-700 outline-none focus:border-nigeria-gold focus:bg-emerald-50/20 transition-colors min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    <User className="h-3 w-3" /> Age Range
                  </label>
                  <select 
                    value={demographics.ageRange}
                    onChange={(e) => setDemographics({...demographics, ageRange: e.target.value})}
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-white p-5 text-lg font-bold text-slate-700 outline-none focus:border-nigeria-gold focus:bg-emerald-50/20 transition-colors cursor-pointer"
                  >
                    <option value="">Select Age</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45+">45+</option>
                  </select>
                </div>
                <div className="space-y-3">
                   <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    <Briefcase className="h-3 w-3" /> Gender
                  </label>
                  <select 
                    value={demographics.gender}
                    onChange={(e) => setDemographics({...demographics, gender: e.target.value})}
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-white p-5 text-lg font-bold text-slate-700 outline-none focus:border-nigeria-gold focus:bg-emerald-50/20 transition-colors cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-16 border-t border-slate-100 pt-8">
              <AnimatePresence mode="wait">
                {isConfirmed ? (
                  <motion.div
                    key="success-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 p-8 rounded-[32px] bg-emerald-50/50 border-2 border-emerald-100"
                  >
                    <div className="w-16 h-16 bg-nigeria-green rounded-full flex items-center justify-center text-nigeria-gold shadow-lg mb-2">
                       <CheckCircle size={32} />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Voice Registered!</h3>
                      <p className="text-sm font-medium text-slate-500">Thank you for representing your demographic. Every voice counts.</p>
                    </div>

                    <div className="flex items-center gap-6 w-full max-w-sm justify-center py-6 border-y border-emerald-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-2 mx-auto shadow-sm">
                          <span className="text-xl">🔥</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</p>
                        <p className="text-sm font-bold text-slate-800">{profile.streak} Weeks</p>
                      </div>
                      <div className="w-px h-12 bg-emerald-100" />
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-2 mx-auto shadow-sm">
                          <span className="text-xl">⭐</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Points</p>
                        <p className="text-sm font-bold text-slate-800">+10 XP</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setCurrentView?.('share-prompt')}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Continue to Results & Share
                    </button>
                    <p className="text-[9px] text-slate-400 font-medium italic">
                      The public is listening. Your data is 100% anonymous.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="action-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row gap-4 w-full"
                  >
                    <button
                      onClick={() => handleVote()}
                      disabled={isSubmitting}
                      className={cn(
                        "flex-[2] flex items-center justify-center rounded-2xl py-6 text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95 overflow-hidden relative",
                        "bg-nigeria-green hover:bg-black hover:shadow-xl",
                        isSubmitting && "cursor-default"
                      )}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Transmitting...
                        </div>
                      ) : (
                        "Register My Vote"
                      )}
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                      className="flex-1 rounded-2xl border-2 border-slate-200 py-6 text-sm font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                    >
                      Go Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
