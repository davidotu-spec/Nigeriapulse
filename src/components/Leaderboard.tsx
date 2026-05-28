import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, Users } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  points: number;
  level: string;
  streak: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: "PulseGuardian_92", points: 1250, level: "National Influencer", streak: 12 },
  { rank: 2, id: "CitizenX_41", points: 1105, level: "Pulse Leader", streak: 8 },
  { rank: 3, id: "AbujaVoice_12", points: 980, level: "Pulse Leader", streak: 10 },
  { rank: 4, id: "Edo_Connector", points: 840, level: "Community Voice", streak: 6 },
  { rank: 5, id: "LagosPulse_01", points: 790, level: "Community Voice", streak: 5 },
];

export function Leaderboard() {
  return (
    <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-8 border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
        <Trophy size={80} className="text-slate-900" />
      </div>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-nigeria-gold/10 rounded-2xl flex items-center justify-center text-nigeria-gold">
          <Trophy size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">National Leaderboard</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Contributors This Month</p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_LEADERBOARD.map((entry, idx) => (
          <motion.div 
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-3xl border ${idx === 0 ? 'bg-nigeria-gold/5 border-nigeria-gold/20' : 'bg-slate-50 border-slate-100 hover:bg-white transition-colors'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black">
                {idx === 0 ? <Medal className="text-nigeria-gold w-5 h-5" /> : idx === 1 ? <Medal className="text-slate-400 w-5 h-5" /> : idx === 2 ? <Medal className="text-orange-400 w-5 h-5" /> : `#${entry.rank}`}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{entry.id}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{entry.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800">{entry.points.toLocaleString()} pts</p>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">🔥 {entry.streak}wk Streak</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="text-[10px] font-black uppercase tracking-widest text-nigeria-green hover:text-black transition-colors">
          View Full Leaderboard →
        </button>
      </div>
    </div>
  );
}

export function StateCompetition({ stateData }: { stateData: { name: string, value: number }[] }) {
  const topState = stateData[0];
  
  return (
    <div className="bg-slate-900 rounded-3xl md:rounded-[40px] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-nigeria-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center text-nigeria-gold">
          <Award size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest">State Participation</h4>
          <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider">The race for the national voice</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {stateData.slice(0, 3).map((state, idx) => (
          <div key={state.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-nigeria-gold text-white' : 'bg-white/10 text-white/60'}`}>
                  {idx + 1}
                </span>
                <span className="font-bold text-sm tracking-tight">{state.name}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{state.value} voices</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(state.value / (topState?.value || 1)) * 100}%` }}
                className={`h-full ${idx === 0 ? 'bg-nigeria-gold' : 'bg-nigeria-green'}`}
              />
            </div>
          </div>
        ))}

        <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/40 font-medium italic mb-4">
              "{topState?.name} is leading this week — can Abuja catch up?"
            </p>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-center gap-2 text-nigeria-gold mb-1">
                <Users size={14} />
                <span className="text-xs font-black uppercase tracking-widest">Global Streak</span>
              </div>
              <p className="text-lg font-black tracking-tight">14,291 Participating</p>
              <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">42% anonymous growth since Mon</p>
            </div>
        </div>
      </div>
    </div>
  );
}
