import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface TrendPoint {
  week: string;
  value: number;
  label: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface TrendTimelineProps {
  data: TrendPoint[];
}

export function TrendTimeline({ data }: TrendTimelineProps) {
  return (
    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <TrendingUp size={120} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">8-Week Sentiment Journey</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tracking the heartbeat of the nation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Optimism</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Concern</span>
          </div>
        </div>
      </div>

      <div className="relative mt-8 px-4 h-40 flex items-center justify-between">
        {/* Connection Line */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100" />
        
        {data.map((point, index) => {
          const isLast = index === data.length - 1;
          const SentimentIcon = point.sentiment === 'positive' ? TrendingUp : (point.sentiment === 'negative' ? TrendingDown : Minus);
          
          return (
            <div key={point.week} className="relative flex flex-col items-center group">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all cursor-crosshair z-20",
                  point.sentiment === 'positive' ? "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                  point.sentiment === 'negative' ? "bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white" :
                  "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-800 group-hover:text-white"
                )}
              >
                <SentimentIcon size={20} />
              </motion.div>

              <div className="mt-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{point.week}</p>
                <p className={cn(
                  "text-[9px] font-bold mt-0.5 whitespace-nowrap invisible group-hover:visible absolute top-full left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-md shadow-lg",
                  "after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-slate-900"
                )}>
                  {point.label}: {point.value}%
                </p>
              </div>

              {isLast && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="bg-nigeria-gold text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce uppercase shadow-sm">
                    Latest
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
        <Info size={16} className="text-slate-400 flex-shrink-0" />
        <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
          Significant shifts often correlate with national policy updates, local holidays, or major economic shifts.
        </p>
      </div>
    </div>
  );
}
