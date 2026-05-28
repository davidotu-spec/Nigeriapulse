import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, X, Share2, Sparkles } from 'lucide-react';
import { Badge } from '../types';
import { ShareDialog } from './ShareDialog';

interface AchievementDialogProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementDialog({ badge, isOpen, onClose }: AchievementDialogProps) {
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  if (!badge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ rotate: 10, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -10, scale: 0.5, opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 z-[110] text-center"
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-nigeria-gold rounded-[32px] flex items-center justify-center text-white shadow-2xl rotate-12">
              <Award size={48} />
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 bg-nigeria-gold/10 px-3 py-1 rounded-full text-nigeria-gold text-[10px] font-black uppercase tracking-widest mb-4">
                <Sparkles size={12} />
                Achievement Unlocked
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{badge.name}</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                {badge.description}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Share2 size={16} />
                  Share Milestone
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>

          <ShareDialog 
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            type="achievement"
            data={{
              badgeName: badge.name,
              streakCount: 3 
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
