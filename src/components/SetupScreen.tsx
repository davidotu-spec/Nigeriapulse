import React from 'react';
import { motion } from 'motion/react';
import { Flame, BarChart4, Award, ChevronRight, UserCircle, Mail, ArrowRight } from 'lucide-react';
import { useSurvey } from '../context/SurveyContext';
import { loginWithGoogle } from '../lib/firebase';

interface SetupScreenProps {
  onContinueAnonymously: () => void;
  onOpenAuth: () => void;
  onContinueToDemographics: () => void;
}

export function SetupScreen({ onContinueAnonymously, onOpenAuth, onContinueToDemographics }: SetupScreenProps) {
  const { user } = useSurvey();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // After login, switch to demographics screen
      onContinueToDemographics();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const benefits = [
    {
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      title: "Weekly Streak",
      text: "Track your participation history."
    },
    {
      icon: <BarChart4 className="w-5 h-5 text-nigeria-blue" />,
      title: "Deep Insights",
      text: "Unlock demographic trends."
    },
    {
      icon: <Award className="w-5 h-5 text-nigeria-gold" />,
      title: "Earn Badges",
      text: "Get recognized for your voice."
    }
  ];

  if (user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white p-12 rounded-[48px] border-2 border-slate-100 shadow-2xl shadow-slate-200 text-center max-w-lg"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-nigeria-green/10">
            <UserCircle className="w-10 h-10 text-nigeria-green" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">You're all set!</h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            Welcome back, <span className="text-nigeria-green font-bold">{user.email}</span>. Your voice is ready to be heard.
          </p>
          <button
            onClick={onContinueToDemographics}
            className="w-full flex items-center justify-center gap-3 bg-nigeria-green text-white px-8 py-5 rounded-2xl text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 group shadow-xl shadow-nigeria-green/10"
          >
            Update Your Context
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onContinueAnonymously}
            className="mt-4 text-xs font-bold text-slate-400 hover:text-nigeria-green transition-colors uppercase tracking-widest"
          >
            Skip to Pulse
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-[10px] font-black text-nigeria-green tracking-[0.3em] uppercase mb-4">Step 4: Your Voice</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          Your voice is the <span className="text-nigeria-green">heartbeat</span> of Nigeria
        </h2>
        <div className="w-12 h-1 bg-nigeria-gold mx-auto rounded-full mb-6"></div>
        <p className="text-slate-400 text-sm font-medium">How do you want to join the conversation?</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Benefits Column */}
        <div className="space-y-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Why create an account?</p>
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                {benefit.icon}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{benefit.title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{benefit.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Buttons Column */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 px-8 py-5 rounded-[24px] text-base font-bold transition-all hover:bg-slate-50 hover:border-nigeria-gold active:scale-95 group shadow-sm w-full"
          >
            <img src="https://www.google.com/favicon.ico" className="h-5 w-5" alt="Google" />
            Continue with Google
          </button>
          
          <button
            onClick={onOpenAuth}
            className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 px-8 py-5 rounded-[24px] text-base font-bold transition-all hover:bg-slate-50 hover:border-nigeria-gold active:scale-95 group shadow-sm w-full"
          >
            <Mail className="w-5 h-5 text-nigeria-green" />
            Continue with Email
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 bg-[#FDFCF8] px-2 tracking-widest">or</div>
          </div>

          <button
            onClick={onContinueAnonymously}
            className="flex items-center justify-center gap-3 bg-nigeria-green text-white px-8 py-5 rounded-[24px] text-base font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 group shadow-xl shadow-nigeria-green/10 w-full"
          >
            Continue Anonymously
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
            You’re part of something national
          </p>
        </div>
      </div>
      
      <p className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        No pressure. You can always sign in and merge data later.
      </p>
    </div>
  );
}
