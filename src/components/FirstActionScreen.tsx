import React from 'react';
import { motion } from 'motion/react';
import { Radio, ChevronRight, Zap } from 'lucide-react';

interface FirstActionScreenProps {
  onAction: () => void;
}

export function FirstActionScreen({ onAction }: FirstActionScreenProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-nigeria-green/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        
        <div className="w-20 h-20 bg-nigeria-green/10 rounded-[28px] flex items-center justify-center mx-auto mb-10 relative z-10 shadow-lg shadow-nigeria-green/5">
          <Radio className="w-10 h-10 text-nigeria-green animate-pulse" />
          <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-4 border-[#FDFCF8] rounded-full"></div>
        </div>

        <p className="text-[10px] font-black text-nigeria-green tracking-[0.4em] uppercase mb-6 flex items-center justify-center gap-2">
          <Zap className="w-3 h-3 fill-nigeria-green" />
          Live Now
        </p>
        
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] max-w-2xl mx-auto">
          This week’s Pulse is live. <span className="text-nigeria-green underline decoration-nigeria-gold decoration-8 underline-offset-8">Your voice matters today.</span>
        </h2>
        
        <p className="text-slate-500 font-medium mb-12 max-w-md mx-auto text-lg leading-relaxed">
          Nigeria listens when you speak. Join thousands of voices in building the story of us.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="group relative flex items-center gap-4 bg-nigeria-green text-white px-12 py-6 rounded-[32px] text-lg font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-nigeria-green/20"
        >
          Answer Now
          <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          
          {/* Decorative Ring */}
          <div className="absolute inset-0 border-2 border-nigeria-green rounded-[32px] scale-110 opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 flex items-center gap-3 text-slate-400"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Join the conversation</span>
      </motion.div>
    </div>
  );
}
