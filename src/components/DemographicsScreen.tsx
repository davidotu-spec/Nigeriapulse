import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGamification } from '../context/GamificationContext';
import { NIGERIA_STATES, AGE_RANGES, GENDERS, EMPLOYMENT_STATUSES } from '../constants';
import { ChevronRight, Info, ShieldCheck, MapPin, User, Briefcase, Calendar, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface DemographicsScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function DemographicsScreen({ onComplete, onSkip }: DemographicsScreenProps) {
  const { updateDemographics, profile } = useGamification();
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);
  
  const [formData, setFormData] = useState({
    ageRange: profile.ageRange || '',
    gender: profile.gender || '',
    state: profile.state || '',
    employmentStatus: profile.employmentStatus || '',
  });

  const handleSave = () => {
    updateDemographics(formData);
    setStep('success');
  };

  const isFormComplete = formData.ageRange && formData.gender && formData.state && formData.employmentStatus;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-12 min-h-[70vh] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-8"
          >
            <div className="w-20 h-20 bg-nigeria-gold/10 rounded-[32px] flex items-center justify-center mx-auto text-nigeria-gold mb-6 shadow-sm">
              <ShieldCheck size={40} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Help us understand <span className="text-nigeria-green underline decoration-nigeria-gold decoration-4 underline-offset-8">Nigeria</span> better.
              </h2>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                Your answers stay anonymous. Sharing a few details helps us show how different groups across Nigeria feel each week.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button
                onClick={() => setStep('form')}
                className="w-full sm:w-auto px-10 py-5 bg-nigeria-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-nigeria-green/20"
              >
                Continue to Profile
              </button>
              <button
                onClick={onSkip}
                className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Skip for now
              </button>
            </div>

            <div className="pt-12 flex items-center justify-center gap-8 border-t border-slate-100 italic text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-nigeria-green" />
                100% Anonymous
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-nigeria-gold" />
                Improve Accuracy
              </div>
            </div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full space-y-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep('intro')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Back</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowPrivacyTooltip(!showPrivacyTooltip)}
                  className="flex items-center gap-2 text-nigeria-green hover:bg-nigeria-green/5 px-3 py-1.5 rounded-full transition-all"
                >
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Why we ask this</span>
                </button>
                
                <AnimatePresence>
                  {showPrivacyTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-72 p-6 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 text-left"
                    >
                      <h4 className="text-sm font-black text-slate-800 mb-3 uppercase">Privacy First</h4>
                      <ul className="space-y-3">
                        <li className="flex gap-3 text-xs text-slate-500 leading-relaxed font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-nigeria-green mt-1 flex-shrink-0" />
                          They help us understand how different groups feel
                        </li>
                        <li className="flex gap-3 text-xs text-slate-500 leading-relaxed font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-nigeria-green mt-1 flex-shrink-0" />
                          They improve the accuracy of national insights
                        </li>
                        <li className="flex gap-3 text-xs text-slate-500 leading-relaxed font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-nigeria-green mt-1 flex-shrink-0" />
                          They remain 100% anonymous
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[40px] border-2 border-slate-50 shadow-sm space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Age Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Age Range</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map(range => (
                      <button
                        key={range}
                        onClick={() => setFormData(prev => ({ ...prev, ageRange: range }))}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2",
                          formData.ageRange === range 
                            ? "bg-nigeria-green border-nigeria-green text-white shadow-lg shadow-nigeria-green/20" 
                            : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <User size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Gender</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map(gender => (
                      <button
                        key={gender}
                        onClick={() => setFormData(prev => ({ ...prev, gender: gender }))}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2",
                          formData.gender === gender 
                            ? "bg-nigeria-green border-nigeria-green text-white shadow-lg shadow-nigeria-green/20" 
                            : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State */}
                <div className="space-y-4 col-span-full">
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">State of Residence</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 custom-scrollbar">
                    {NIGERIA_STATES.map(state => (
                      <button
                        key={state}
                        onClick={() => setFormData(prev => ({ ...prev, state: state }))}
                        className={cn(
                          "py-2 px-1 rounded-lg text-[10px] font-bold transition-all border-2 truncate",
                          formData.state === state 
                            ? "bg-nigeria-green border-nigeria-green text-white" 
                            : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employment */}
                <div className="space-y-4 col-span-full">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Briefcase size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Employment Status</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_STATUSES.map(status => (
                      <button
                        key={status}
                        onClick={() => setFormData(prev => ({ ...prev, employmentStatus: status }))}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2",
                          formData.employmentStatus === status 
                            ? "bg-nigeria-green border-nigeria-green text-white shadow-lg shadow-nigeria-green/20" 
                            : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={!isFormComplete}
                  className={cn(
                    "w-full sm:w-80 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95",
                    isFormComplete 
                      ? "bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-900/20" 
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  )}
                >
                  Complete Profile
                  <ChevronRight size={18} />
                </button>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">
                  Only required details. Use anonymously.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-10"
          >
            <div className="relative h-32 w-32 mx-auto">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[40px] animate-ping opacity-20"></div>
              <div className="relative w-full h-full bg-emerald-50 rounded-[40px] flex items-center justify-center text-nigeria-green border border-emerald-100 shadow-sm">
                <CheckCircle2 size={48} />
              </div>
              <motion.div
                initial={{ rotate: 10, scale: 0 }}
                animate={{ rotate: -10, scale: 1 }}
                className="absolute -top-4 -right-4 bg-nigeria-gold text-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-lg uppercase tracking-tight"
              >
                +25 POINTS
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Profile <span className="text-nigeria-green">Verified</span>
              </h2>
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mx-auto w-fit">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">
                  ⚖️
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Badge Unlocked</p>
                  <p className="text-sm font-black text-slate-800">Truth Teller</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 space-y-6 max-w-md mx-auto shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">What's Unlocked</p>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl shadow-sm border border-slate-50 flex items-center justify-center text-lg">📊</div>
                  <p className="text-xs font-bold text-slate-600">See how people your age answered</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl shadow-sm border border-slate-50 flex items-center justify-center text-lg">🌍</div>
                  <p className="text-xs font-bold text-slate-600">Compare your state with others</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl shadow-sm border border-slate-50 flex items-center justify-center text-lg">👑</div>
                  <p className="text-xs font-bold text-slate-600">Unlock deeper national insights</p>
                </div>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full sm:w-80 py-5 bg-nigeria-green text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-nigeria-green/20 hover:scale-105 active:scale-95 transition-all"
            >
              View Insights
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
