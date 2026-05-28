import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, EyeOff, UserPlus, ChevronRight, ExternalLink } from 'lucide-react';
import { TrustModal } from './TrustIndicators';

interface TrustScreenProps {
  onContinue: () => void;
}

export function TrustScreen({ onContinue }: TrustScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statements = [
    {
      icon: <EyeOff className="w-8 h-8 text-nigeria-green" />,
      title: "Full Anonymity",
      text: "Your identity is never linked to your responses. Zero tracking.",
      color: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-nigeria-blue" />,
      title: "Safe Protocol",
      text: "We use secure, enterprise-grade protocols to protect the pulse.",
      color: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      icon: <UserPlus className="w-8 h-8 text-nigeria-gold" />,
      title: "Your Choice",
      text: "Participate anonymously or create an account for history.",
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
        <p className="text-[10px] font-black text-nigeria-green tracking-[0.3em] uppercase mb-4">Privacy First</p>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          Nigeria listens when you speak
        </h2>
        <div className="w-12 h-1 bg-nigeria-gold mx-auto rounded-full"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mb-12 md:mb-16">
        {statements.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`${item.color} p-8 md:p-10 rounded-[32px] md:rounded-[40px] border ${item.border} shadow-sm flex flex-col items-center text-center relative group bg-white`}
          >
            <div className="w-12 md:w-14 h-12 md:h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 md:mb-8 border border-slate-50">
              {item.icon}
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 md:mb-3">{item.title}</h3>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed px-2">
              {item.text}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-6 md:gap-8"
      >
        <button
          onClick={onContinue}
          className="flex items-center gap-3 bg-nigeria-green text-white px-10 md:px-12 py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-sm md:text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 group shadow-2xl shadow-nigeria-green/10"
        >
          Secure & Ready
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest cursor-pointer"
        >
          <ExternalLink className="w-3 h-3" />
          Learn more about our transparency protocol
        </button>
      </motion.div>

      <TrustModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
