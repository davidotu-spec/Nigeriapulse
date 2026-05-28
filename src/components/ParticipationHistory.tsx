import React, { useEffect, useState } from 'react';
import { useSurvey } from '../context/SurveyContext';
import { useGamification } from '../context/GamificationContext';
import { db, collection, getDocs, query, orderBy, limit } from '../lib/firebase';
import { motion } from 'motion/react';
import { History, Calendar, CheckCircle2, MessageSquare } from 'lucide-react';
import { BADGES } from '../types';

export function ParticipationHistory() {
  const { user } = useSurvey();
  const { profile } = useGamification();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        // This is a complex query across subcollections - in production we'd use a denormalized collection
        // For this demo, we'll fetch from a "recent_activity" collection if it existed or simulate
        // For now, we'll provide a clean UI placeholder showing how it works
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }
    fetchHistory();
  }, [user]);

  if (!user) return null;

  return (
    <div className="mt-10 md:mt-16 space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border border-nigeria-green/10">
          <History className="h-5 w-5 text-nigeria-green" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Your Pulse History</h3>
          <p className="text-xs text-slate-400 font-medium">Your weekly check-in helps track the nation’s mood.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-4">Pulse Progress</p>
            <div className="flex items-center gap-4">
              <div className="text-4xl text-orange-500">{profile.streak > 0 ? '🔥' : '⏳'}</div>
              <div>
                <p className="text-2xl font-black italic">{profile.streak}-Week Streak</p>
                <p className="text-xs text-slate-400 font-medium">
                  {profile.streak > 0 ? 'You’re shaping the national Pulse!' : 'Answer this week to start your streak'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nigeria-green mb-4">Badges Earned</p>
          <div className="flex flex-wrap gap-3">
            {profile.badges.length > 0 ? (
              profile.badges.map((badgeId, idx) => {
                const badge = BADGES.find(b => b.id === badgeId);
                if (!badge) return null;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group">
                    <div 
                      className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform cursor-help shadow-sm" 
                      title={badge.description}
                    >
                      {badge.emoji}
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-center">{badge.name.split(' ')[0]}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-medium italic py-4">Answer your first Pulse to earn badges!</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-100 rounded-3xl p-4 md:p-6 flex items-start justify-between hover:shadow-lg transition-all border-l-4 border-l-nigeria-green shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Calendar className="h-3 w-3" /> May {14 - i}, 2026
              </div>
              <h4 className="text-sm font-bold text-slate-700">How was your internet connectivity this week?</h4>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-nigeria-green px-3 py-1 rounded-full text-[10px] font-black uppercase border border-nigeria-green/10">
                  Voted: Good
                </span>
                <span className="text-slate-200">•</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <MessageSquare className="h-3 w-3" /> No comment left
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-nigeria-green/10">
              <CheckCircle2 className="h-5 w-5 text-nigeria-green" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
