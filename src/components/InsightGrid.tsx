import React from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Info, ArrowUpRight, ArrowDownRight, User, MapIcon, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

interface Insight {
  id: string;
  type: 'demographic' | 'regional' | 'trend' | 'surprising';
  title: string;
  description: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon: any;
}

interface InsightGridProps {
  insights: Insight[];
}

export function InsightGrid({ insights }: InsightGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {insights.map((insight, index) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col"
        >
          <div className="flex items-start justify-between mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110",
              "bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
            )}>
              <insight.icon size={28} />
            </div>
            {insight.change && (
              <div className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                insight.change.isPositive 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                  : "bg-rose-50 border-rose-100 text-rose-600"
              )}>
                {insight.change.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {insight.change.value}
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
              {insight.type} Insight
            </p>
            <h4 className="text-xl font-black text-slate-800 mb-3 leading-tight group-hover:text-nigeria-green transition-colors">
              {insight.title}
            </h4>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {insight.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2">
              <Info size={14} />
              Deep Dive
            </button>
            <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              Live Verified
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
