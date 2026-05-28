import React from 'react';
import { motion } from 'motion/react';
import { Zap, ChevronRight, Info, Shield, CheckCircle2, Lock, Play } from 'lucide-react';
import { AnonymousBadge, NonPartisanLabel } from './TrustIndicators';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onHowItWorks: () => void;
  onWatchCommercial: () => void;
}

export function WelcomeScreen({ onGetStarted, onHowItWorks, onWatchCommercial }: WelcomeScreenProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl flex flex-col items-center"
      >
        <AnonymousBadge className="mb-6" />
        <NonPartisanLabel className="mb-8" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-nigeria-gold/10 border border-nigeria-gold/20 px-3 py-1.5 rounded-full mb-8"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          <span className="text-[10px] font-black text-nigeria-green uppercase tracking-wider">
            23,482 Nigerians answered this week
          </span>
        </motion.div>

        <div className="flex justify-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-nigeria-green rounded-[28px] flex items-center justify-center shadow-2xl shadow-nigeria-green/20 relative"
          >
            <div className="absolute inset-0 rounded-[28px] border-4 border-nigeria-gold/30 scale-110 animate-ping opacity-20"></div>
            <Zap className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        <motion.h1 
          className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 md:mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Your Voice is the <br />
          <span className="text-nigeria-green underline decoration-nigeria-gold decoration-8 underline-offset-8">Heartbeat of Nigeria.</span>
        </motion.h1>

        <motion.p 
          className="text-base md:text-xl text-slate-500 mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed font-medium px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Join thousands shaping the nation’s weekly mood. <br className="hidden md:block" />
          One national question. Thousands of voices.
          <span className="block mt-4 text-nigeria-green/80 font-bold">Safe. Anonymous. Real.</span>
        </motion.p>

        <motion.div 
          className="flex flex-col items-center justify-center gap-4 px-4 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onGetStarted();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-nigeria-green text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-sm md:text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-nigeria-green/10 group cursor-pointer"
            >
              Get Started
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onHowItWorks();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-600 border-2 border-slate-100 px-8 md:px-10 py-4 md:py-5 rounded-2xl text-sm md:text-base font-bold uppercase tracking-widest hover:border-nigeria-gold hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
            >
              <Info className="w-5 h-5" />
              How It Works
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onWatchCommercial();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-sm md:text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 cursor-pointer shadow-lg shadow-black/10"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Pulse AI
            </button>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
            Your voice counts. Nigeria is listening.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12 md:mt-20 pt-10 border-t border-slate-100 w-full max-w-2xl mx-auto"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 font-mono">
            CIVIC INTEGRITY PARTNERS & PROTOCOLS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center opacity-40 hover:opacity-60 transition-opacity">
            <div className="flex flex-col items-center gap-2 group">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                 <Shield size={20} />
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Secure.ng</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
               <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-800 scale-90 group-hover:scale-100 transition-transform">
                 <CheckCircle2 size={20} />
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">CivicTrust</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
               <div className="w-10 h-10 bg-nigeria-green rounded-xl flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform font-black">
                 NP
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">OpenPulse</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                 <Lock size={20} />
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">PrivacyGrid</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
