import React from 'react';
import { motion } from 'motion/react';
import { Shield, TrendingUp, Users, MapPin, Award, Zap, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type ShareCardType = 'weekly_result' | 'achievement' | 'state_rivalry' | 'demographic';

interface ShareCardProps {
  type: ShareCardType;
  data: {
    title?: string;
    value?: string | number;
    subtitle?: string;
    stateName?: string;
    rank?: number;
    badgeName?: string;
    streakCount?: number;
    question?: string;
    insight?: string;
  };
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function ShareCard({ type, data, cardRef }: ShareCardProps) {
  const renderContent = () => {
    switch (type) {
      case 'weekly_result':
        return (
          <div className="flex flex-col h-full justify-between p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp size={120} />
            </div>
            
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 mb-8">
                <Zap size={16} className="text-nigeria-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Weekly Pulse Results</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
                {data.question || "How is the nation feeling?"}
              </h2>
            </div>

            <div className="space-y-8">
              <div className="flex items-end gap-4">
                <span className="text-7xl md:text-9xl font-black text-nigeria-gold leading-none">
                  {data.value}%
                </span>
                <span className="text-xl md:text-2xl font-bold text-white/80 pb-4">
                  {data.insight || "Agree"}
                </span>
              </div>
              
              <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-nigeria-green font-black">
                    NP
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Nigeria Pulse</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Real voices. Real data.</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  nigeriapulse.app
                </div>
              </div>
            </div>
          </div>
        );

      case 'achievement':
        return (
          <div className="flex flex-col h-full items-center justify-center p-8 md:p-12 text-center relative">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-40 h-40 bg-nigeria-gold rounded-[40px] flex items-center justify-center text-white shadow-2xl mb-10 relative z-10"
            >
              <Award size={80} />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Zap size={24} className="text-nigeria-gold" />
              </div>
            </motion.div>

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4">New Milestone Unlocked</p>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                {data.badgeName || "Pulse Guardian"}
              </h2>
              <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 mb-12">
                <TrendingUp size={20} className="text-emerald-400" />
                <span className="text-lg font-black text-white">{data.streakCount || 1} Week Streak!</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-nigeria-green font-black mb-2">
                  NP
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Representing Nigeria Honestly</p>
              </div>
            </div>
            
            {/* Abstract Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nigeria-gold/20 blur-[100px] rounded-full" />
          </div>
        );

      case 'state_rivalry':
        return (
          <div className="flex flex-col h-full justify-between p-8 md:p-12 relative overflow-hidden bg-white text-slate-900">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MapPin size={160} />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 mb-8">
                <MapPin size={16} className="text-nigeria-blue" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">State Leaderboard</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter mb-4">
                {data.stateName || "Lagos"} is Leading!
              </h2>
              <p className="text-xl font-bold text-slate-400">Can your state catch up this week?</p>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-6xl font-black text-nigeria-blue">#{data.rank || 1}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Rank</span>
                </div>
                <div className="w-px h-12 bg-slate-100" />
                <div className="flex flex-col">
                  <span className="text-6xl font-black text-slate-900">{data.value || 0}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voices Added</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">
                    NP
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Nigeria Pulse</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">State Participation Index</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  nigeriapulse.app
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "aspect-[4/5] w-full max-w-md mx-auto rounded-[40px] shadow-2xl relative overflow-hidden",
        type === 'weekly_result' ? "bg-nigeria-green" : 
        type === 'achievement' ? "bg-slate-900" : 
        "bg-white"
      )}
    >
      {/* Nigeria Map Watermark for all cards */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center p-12">
         <svg viewBox="0 0 100 100" className={cn("w-full h-full", type === 'state_rivalry' ? "fill-slate-900" : "fill-white")}>
           <path d="M30 20 L50 15 L70 18 L90 20 L95 40 L85 60 L80 90 L60 85 L40 90 L20 85 L10 70 L15 40 Z" />
         </svg>
      </div>

      {renderContent()}
    </div>
  );
}
