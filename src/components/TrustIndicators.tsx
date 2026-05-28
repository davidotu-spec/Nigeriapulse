import React from 'react';
import { Shield, Lock, EyeOff, CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function AnonymousBadge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg border border-white/10", className)}>
      <EyeOff size={16} className="text-emerald-400" />
      <span className="text-[10px] font-black uppercase tracking-widest">
        100% Anonymous — No personal data collected
      </span>
    </div>
  );
}

export function NonPartisanLabel({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]", className)}>
      <Shield size={12} className="text-nigeria-gold" />
      Independent. Non-partisan. Built for Nigeria.
    </div>
  );
}

export function TransparencyNote({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100", className)}>
      <Lock size={16} className="text-slate-400 flex-shrink-0" />
      <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
        Your answer is encrypted and cannot be linked to your identity. We never store names, PVC numbers, or phone numbers.
      </p>
    </div>
  );
}

export function AntiManipulationNote({ className }: { className?: string }) {
  return (
    <div className={cn("text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2", className)}>
      <CheckCircle2 size={12} className="text-emerald-500" />
      Multiple responses from the same device are automatically prevented.
    </div>
  );
}

export function MethodologyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 md:p-12 z-[70] overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-[10px] font-black text-nigeria-gold uppercase tracking-[0.3em] mb-2">Internal Protocol</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Our Methodology</h3>
              </div>
              <button onClick={onClose} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-10">
              <section>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-nigeria-green rounded-full" />
                  Question Sovereignty
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Questions are generated based on trending national topics, economic data, and civic sentiment. Our non-partisan board ensures questions remain neutral and non-leading, promoting objective discourse.
                </p>
              </section>

              <section>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-nigeria-blue rounded-full" />
                  Integrity & Authentication
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Responses are verified via device-based hashing and session monitoring. This unique "Fingerprint Protocol" prevents bot manipulation and duplicate voting without ever collecting personal identifiers.
                </p>
              </section>

              <section>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-nigeria-gold rounded-full" />
                  Demographic Weighting
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Results are parsed through age, gender, and regional filters to represent a true cross-section of Nigeria's population. No individual response is ever isolated or traceable.
                </p>
              </section>

              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 italic">
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  "Our mission is to provide an unfiltered look into the collective mood, protecting the voice of every Nigerian through transparent technology."
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-12 bg-slate-100 text-slate-900 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
            >
              Close Methodology
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TrustModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 z-[70] overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-nigeria-green" />
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600">
                <Shield size={32} />
              </div>
              <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">How We Protect Your Voice</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Nigeria Pulse was built from the ground up to ensure every individual can speak their truth without fear.
            </p>

            <div className="space-y-6">
              {[
                { 
                  icon: <EyeOff size={20} />, 
                  title: "Anonymity First", 
                  text: "We collect only demographic buckets—never identifying data like names or PVCs." 
                },
                { 
                  icon: <Lock size={20} />, 
                  title: "Secure Encryption", 
                  text: "Every response is hashed and encrypted before storage, making it untraceable." 
                },
                { 
                  icon: <CheckCircle2 size={20} />, 
                  title: "Independent", 
                  text: "We have no political affiliation. Our mission is pure data transparency for civic good." 
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{item.title}</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-10 bg-slate-900 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              I Understand & Trust
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
