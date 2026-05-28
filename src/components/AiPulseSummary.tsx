import React, { useState, useEffect } from 'react';
import { useSurvey } from '../context/SurveyContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Quote, RefreshCw, AlertCircle } from 'lucide-react';

interface AiPulseSummaryProps {
  surveyId: string;
}

export function AiPulseSummary({ surveyId }: AiPulseSummaryProps) {
  const { language } = useSurvey();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ summary: string; vibe: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/v1/pulse/${surveyId}/ai-summary?lang=${language}`);
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || data.details || 'Failed to generate summary');
      }
      
      setSummary(data);
    } catch (err: any) {
      console.error('AI Summary Error:', err);
      setError(err.message || 'AI Insight engine is temporarily offline. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSummary(null); // Clear summary when survey or language changes to encourage fresh generation
    setError(null);
  }, [surveyId, language]);

  return (
    <div id="ai-pulse-summary" className="bg-slate-900 rounded-3xl md:rounded-[40px] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-nigeria-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-nigeria-gold/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nigeria-green rounded-2xl flex items-center justify-center shadow-lg shadow-nigeria-green/20 shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black tracking-tight">AI National Insight</h3>
              <p className="text-[10px] text-nigeria-green font-bold uppercase tracking-widest">Together, we build the Nigeria we want</p>
            </div>
          </div>

          <button 
            onClick={fetchSummary}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 w-full sm:w-auto border border-white/5 shadow-sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-nigeria-gold" />
            ) : (
              <Sparkles className="h-4 w-4 text-nigeria-gold" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">{summary ? 'Regenerate Insight' : 'Analyze Pulse'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!summary && !loading && !error && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Sparkles className="h-8 w-8 text-white/20" />
              </div>
              <div className="max-w-md">
                <p className="text-slate-400 text-sm font-medium italic leading-relaxed">
                  Ready to uncover the deep narrative? Click "Analyze Pulse" to synthesize thousands of votes and comments into a coherent national snapshot.
                </p>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-nigeria-gold to-transparent"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-white/5 rounded-full w-full animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded-full w-[90%] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-3 bg-white/5 rounded-full w-[95%] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Synthesizing Participant Sentiment...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          {summary && !loading && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative">
                <Quote className="absolute -top-2 -left-6 h-8 w-8 text-white/5" />
                <p className="text-slate-200 leading-relaxed font-medium">
                  {summary.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                  <div className="text-[8px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-0.5">National vibe</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">{summary.vibe}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Summary updated moments ago based on {new Date().toLocaleTimeString()} snapshot.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
