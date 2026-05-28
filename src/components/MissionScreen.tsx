import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, TrendingUp, ChevronRight } from 'lucide-react';

interface MissionScreenProps {
  onContinue: () => void;
}

export function MissionScreen({ onContinue }: MissionScreenProps) {
  const cards = [
    {
      icon: <Target className="w-8 h-8 text-nigeria-green" />,
      title: "One Question",
      text: "We ask one national question every week to focus the pulse.",
      color: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      icon: <Users className="w-8 h-8 text-nigeria-blue" />,
      title: "United Voice",
      text: "Your answers help track how Nigerians feel together.",
      color: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-nigeria-gold" />,
      title: "Real Impact",
      text: "Data-driven insights empower better national decisions.",
      color: "bg-amber-50",
      border: "border-amber-100"
    }
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-[10px] font-black text-nigeria-green tracking-[0.3em] uppercase mb-4">The Heartbeat</p>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          One answer. One voice. One Nigeria.
        </h2>
        <div className="w-12 h-1 bg-nigeria-gold mx-auto rounded-full"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mb-12 md:mb-16">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`${card.color} p-8 md:p-10 rounded-[32px] md:rounded-[40px] border ${card.border} shadow-sm flex flex-col items-center text-center relative group hover:shadow-xl transition-all duration-500 bg-white`}
          >
            <div className="w-14 md:w-16 h-14 md:h-16 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-sm mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 border border-slate-50">
              {card.icon}
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 md:mb-3">{card.title}</h3>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed px-2">
              {card.text}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <button
          onClick={onContinue}
          className="flex items-center gap-3 bg-nigeria-green text-white px-10 py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-sm md:text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 group shadow-2xl shadow-nigeria-green/10"
        >
          I get it, let's go
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          100% Anonymous & Secure
        </p>
      </motion.div>
    </div>
  );
}
