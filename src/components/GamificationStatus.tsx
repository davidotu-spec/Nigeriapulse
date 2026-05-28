import React from 'react';
import { motion } from 'motion/react';
import { useGamification } from '../context/GamificationContext';
import { Trophy, Star, TrendingUp } from 'lucide-react';

export function GamificationStatus() {
  const { profile, currentLevel, nextLevel, progressToNext } = useGamification();

  return (
    <div className="w-full bg-white border-b border-slate-100 px-4 py-3 sticky top-16 z-30 shadow-sm md:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl shadow-inner group relative">
            {currentLevel.emoji}
            <div className="absolute -top-2 -right-2 bg-nigeria-gold text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {currentLevel.rank}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{currentLevel.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 md:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  className="h-full bg-nigeria-green"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{Math.round(progressToNext)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Next Rank</p>
            <p className="text-[11px] font-bold text-slate-600">{nextLevel?.name || 'Max Rank'}</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-nigeria-gold">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-sm font-black text-slate-800">{profile.points}</span>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Points</p>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-orange-500">
                <TrendingUp className="w-3 h-3" />
                <span className="text-sm font-black text-slate-800">{profile.streak}</span>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
