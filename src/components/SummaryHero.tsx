import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface SummaryHeroProps {
  percentage: number;
  headline: string;
  subheadline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  trendValue?: string;
  totalVotes: number;
}

export function SummaryHero({ 
  percentage, 
  headline, 
  subheadline, 
  sentiment, 
  trendValue, 
  totalVotes 
}: SummaryHeroProps) {
  const getColors = () => {
    switch (sentiment) {
      case 'positive': return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-600',
        accent: 'bg-emerald-600',
        icon: TrendingUp
      };
      case 'negative': return {
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        text: 'text-rose-600',
        accent: 'bg-rose-600',
        icon: TrendingDown
      };
      default: return {
        bg: 'bg-slate-50',
        border: 'border-slate-100',
        text: 'text-slate-600',
        accent: 'bg-slate-600',
        icon: Minus
      };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[40px] border-2 p-8 md:p-12 shadow-sm transition-all",
        colors.bg,
        colors.border
      )}
    >
      {/* Decorative patterns */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/40 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/40 blur-3xl rounded-full" />
      
      {/* Nigeria Silhouette Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center p-8">
         <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
           <path d="M30 20 L50 15 L70 18 L90 20 L95 40 L85 60 L80 90 L60 85 L40 90 L20 85 L10 70 L15 40 Z" />
         </svg>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-shrink-0 text-center md:text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center md:items-start"
          >
            <span className={cn("text-7xl md:text-9xl font-black tracking-tighter leading-none mb-2", colors.text)}>
              {percentage}%
            </span>
            <div className="flex items-center gap-3">
              <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg", colors.accent)}>
                Majority Voice
              </div>
              {trendValue && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100">
                  <colors.icon size={14} className={colors.text} />
                  {trendValue}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Zap size={16} className="text-nigeria-gold animate-pulse" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
              Weekly Insight • {totalVotes.toLocaleString()} Responses
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            {headline}
          </h2>
          <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
            {subheadline}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
