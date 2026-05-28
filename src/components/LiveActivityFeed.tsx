import React, { useEffect, useState } from 'react';
import { db, collection, query, orderBy, limit, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Vote } from '../types';

interface LiveActivityFeedProps {
  surveyId: string;
}

export function LiveActivityFeed({ surveyId }: LiveActivityFeedProps) {
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    if (!surveyId) return;

    const path = `surveys/${surveyId}/votes`;
    const q = query(
      collection(db, 'surveys', surveyId, 'votes'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVotes(snapshot.docs.map(doc => doc.data() as Vote).filter(v => v.timestamp));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [surveyId]);

  if (votes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nigeria is listening: Live Pulse</h4>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {votes.map((vote, i) => (
            <motion.div
              key={vote.timestamp?.toMillis?.() || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl"
            >
              <div className="h-8 w-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {vote.demographics?.state || 'Verified Citizen'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    pulsed a response
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={10} className="text-slate-300" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {vote.timestamp ? formatDistanceToNow(vote.timestamp.toDate(), { addSuffix: true }) : 'just now'}
                  </span>
                </div>
              </div>
              {vote.demographics?.state && (
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                  {vote.demographics.state}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
