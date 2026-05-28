import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { useNotification } from '../context/NotificationContext';
import { useGamification } from '../context/GamificationContext';

export function StarRating({ surveyId }: { surveyId?: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const { showNotification } = useNotification();
  const { addPoints } = useGamification();

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      const ratingData: any = {
        rating,
        comment,
        timestamp: serverTimestamp()
      };

      if (auth.currentUser?.uid) {
        ratingData.userId = auth.currentUser.uid;
      }
      
      if (surveyId) {
        ratingData.surveyId = surveyId;
      }

      await addDoc(collection(db, 'ratings'), ratingData);
      
      setIsSubmitted(true);
      showNotification("Thank you!", "Your feedback helps us improve the Pulse.", "achievement");
      addPoints(10); // Reward for feedback
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ratings');
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 border border-emerald-100 p-6 sm:p-8 rounded-[28px] sm:rounded-[40px] text-center shadow-sm"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 shadow-sm">
          🌟
        </div>
        <h4 className="text-emerald-800 font-black uppercase tracking-tight text-base sm:text-lg mb-1">Feedback Received!</h4>
        <p className="text-emerald-600/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest">We appreciate your voice.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-sm relative overflow-hidden group h-full">
      <div className="relative z-10">
        <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-2">
          Rate Your Experience
          <div className="w-1.5 h-1.5 bg-nigeria-gold rounded-full animate-pulse" />
        </h4>
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium mb-4 sm:mb-6">How useful was this week's pulse for you?</p>
        
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
               key={star}
               type="button"
               className="focus:outline-none transition-transform active:scale-90"
               onClick={() => {
                 setRating(star);
                 setIsExpanding(true);
               }}
               onMouseEnter={() => setHover(star)}
               onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`w-6 h-6 sm:w-8 sm:h-8 transition-all ${
                  star <= (hover || rating) 
                    ? "fill-nigeria-gold text-nigeria-gold drop-shadow-sm scale-110" 
                    : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isExpanding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 sm:space-y-4 overflow-hidden"
            >
              <textarea
                placeholder="Any specific thoughts or features you'd like to see?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-nigeria-green/10 focus:border-nigeria-green transition-all"
                rows={3}
              />
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full bg-slate-900 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
              >
                Submit Feedback
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-24 sm:h-24 bg-nigeria-gold/5 rounded-full blur-2xl group-hover:bg-nigeria-gold/10 transition-colors" />
    </div>
  );
}
