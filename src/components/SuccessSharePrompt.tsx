import React from 'react';
import { motion } from 'motion/react';
import { Share2, CheckCircle2, TrendingUp, Award, Zap, ChevronRight } from 'lucide-react';
import { ShareDialog } from './ShareDialog';
import { useGamification } from '../context/GamificationContext';

interface SuccessSharePromptProps {
  surveyQuestion: string;
  userAnswer: string;
  userAnswerPercentage: number;
  onContinue: () => void;
}

export function SuccessSharePrompt({ surveyQuestion, userAnswer, userAnswerPercentage, onContinue }: SuccessSharePromptProps) {
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const { streak, addPoints } = useGamification();

  return (
    <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 max-w-2xl mx-auto text-center border border-slate-100">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-500/20"
      >
        <CheckCircle2 size={40} />
      </motion.div>

      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Your Voice is Recorded</h2>
      <p className="text-lg font-medium text-slate-500 mb-10 max-w-md mx-auto">
        You've represented your demographic for this week. Every voice brings us closer to the true national pulse.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
             <TrendingUp size={24} className="text-emerald-500" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Streak</p>
            <p className="text-xl font-black text-slate-900">{streak} Weeks</p>
          </div>
        </div>
        <div className="bg-nigeria-gold/5 p-6 rounded-[32px] border border-nigeria-gold/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
             <Award size={24} className="text-nigeria-gold" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Points Earned</p>
            <p className="text-xl font-black text-slate-900">+10 XP</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsShareOpen(true)}
          className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
          Share Results & Invite Friends
        </button>
        
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          See current dashboard
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-50 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-nigeria-gold" />
          Real-time Engagement
        </div>
        <div className="w-1 h-1 bg-slate-200 rounded-full" />
        <div>
          Independent Data
        </div>
      </div>

      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        type="weekly_result"
        data={{
          question: surveyQuestion,
          value: userAnswerPercentage, 
          insight: userAnswer
        }}
        onShareEnd={() => {
          addPoints(5);
        }}
      />
    </div>
  );
}
