import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, BarChart2, TrendingUp, ChevronRight } from 'lucide-react';

interface HowItWorksScreenProps {
  onContinue: () => void;
}

export function HowItWorksScreen({ onContinue }: HowItWorksScreenProps) {
  const steps = [
    {
      title: "Answer",
      description: "Answer one question each week",
      icon: <CheckCircle2 className="w-8 h-8 text-nigeria-green" />,
      color: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      title: "See",
      description: "See real-time national results",
      icon: <BarChart2 className="w-8 h-8 text-nigeria-blue" />,
      color: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Track",
      description: "Track trends and earn badges",
      icon: <TrendingUp className="w-8 h-8 text-nigeria-gold" />,
      color: "bg-amber-50",
      border: "border-amber-100"
    }
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-8 md:py-12 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-16"
      >
        <p className="text-[10px] font-black text-nigeria-green tracking-[0.3em] uppercase mb-4">The Process</p>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          How We Listen
        </h2>
        <div className="w-12 h-1 bg-nigeria-gold mx-auto rounded-full"></div>
        <p className="mt-6 text-slate-500 font-medium max-w-lg mx-auto">
          "When we speak together, the pulse of the nation becomes impossible to ignore."
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full mb-12 md:mb-16 relative">
        {/* Connection lines for desktop */}
        <div className="hidden md:block absolute top-[60px] left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-slate-200 -z-10"></div>
        
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-20 md:w-24 h-20 md:h-24 ${step.color} rounded-[28px] md:rounded-[32px] border ${step.border} flex items-center justify-center mb-6 md:mb-8 shadow-sm relative z-10 bg-white`}>
              <div className="scale-75 md:scale-100">
                {step.icon}
              </div>
              <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-7 h-7 md:w-8 md:h-8 bg-nigeria-green text-white text-[10px] md:text-xs font-black rounded-full flex items-center justify-center border-4 border-[#FDFCF8]">
                {index + 1}
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2">{step.title}</h3>
            <p className="text-sm md:text-slate-500 font-medium leading-relaxed max-w-[200px]">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={onContinue}
          className="flex items-center gap-3 bg-slate-900 text-white px-10 md:px-12 py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-sm md:text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 group shadow-2xl shadow-slate-200"
        >
          Sounds Easy
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
