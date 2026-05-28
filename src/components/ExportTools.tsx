import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share2, Copy, FileText, Image, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ExportToolsProps {
  onExportImage: () => void;
  onExportPDF: () => void;
  onCopyText: () => void;
  onShare: () => void;
}

export function ExportTools({ onExportImage, onExportPDF, onCopyText, onShare }: ExportToolsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopyText();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all group lg:min-w-[180px] justify-center"
      >
        <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
        Export Report
        <ChevronDown size={16} className={cn("transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-full mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Download Formats</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { onExportImage(); setIsOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Image size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Visual Card</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Best for Instagram/X</p>
                  </div>
                </button>

                <button
                  onClick={() => { onExportPDF(); setIsOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-nigeria-blue/5 rounded-xl flex items-center justify-center text-nigeria-blue group-hover:bg-nigeria-blue group-hover:text-white transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Insight PDF</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">For Reports & News</p>
                  </div>
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    copied ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                  )}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{copied ? 'Copied!' : 'Copy Summary'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Text-only format</p>
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50">
                 <button
                  onClick={() => { onShare(); setIsOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-nigeria-green text-white hover:bg-black transition-all group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Quick Share</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-tight">WhatsApp / Social</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
