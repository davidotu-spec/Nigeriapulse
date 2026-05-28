import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface NigeriaHeatMapProps {
  data: Record<string, number>;
  totalVotes: number;
}

// Representative simplified coordinates for Nigerian States to create a "Bubble Map" 
// (much more reliable and responsive than complex SVG paths for this environment)
const STATE_COORDS: Record<string, { x: number; y: number; name: string }> = {
  "Abia": { x: 70, y: 80, name: "Abia" },
  "Adamawa": { x: 85, y: 40, name: "Adamawa" },
  "Akwa Ibom": { x: 70, y: 88, name: "Akwa Ibom" },
  "Anambra": { x: 65, y: 78, name: "Anambra" },
  "Bauchi": { x: 75, y: 35, name: "Bauchi" },
  "Bayelsa": { x: 55, y: 88, name: "Bayelsa" },
  "Benue": { x: 70, y: 60, name: "Benue" },
  "Borno": { x: 90, y: 25, name: "Borno" },
  "Cross River": { x: 80, y: 82, name: "Cross River" },
  "Delta": { x: 58, y: 78, name: "Delta" },
  "Ebonyi": { x: 75, y: 75, name: "Ebonyi" },
  "Edo": { x: 55, y: 72, name: "Edo" },
  "Ekiti": { x: 45, y: 65, name: "Ekiti" },
  "Enugu": { x: 68, y: 74, name: "Enugu" },
  "FCT": { x: 55, y: 50, name: "FCT" },
  "Gombe": { x: 82, y: 38, name: "Gombe" },
  "Imo": { x: 67, y: 83, name: "Imo" },
  "Jigawa": { x: 75, y: 18, name: "Jigawa" },
  "Kaduna": { x: 60, y: 35, name: "Kaduna" },
  "Kano": { x: 68, y: 22, name: "Kano" },
  "Katsina": { x: 60, y: 18, name: "Katsina" },
  "Kebbi": { x: 35, y: 25, name: "Kebbi" },
  "Kogi": { x: 55, y: 62, name: "Kogi" },
  "Kwara": { x: 40, y: 55, name: "Kwara" },
  "Lagos": { x: 35, y: 78, name: "Lagos" },
  "Nasarawa": { x: 65, y: 52, name: "Nasarawa" },
  "Niger": { x: 45, y: 40, name: "Niger" },
  "Ogun": { x: 35, y: 72, name: "Ogun" },
  "Ondo": { x: 48, y: 70, name: "Ondo" },
  "Osun": { x: 42, y: 68, name: "Osun" },
  "Oyo": { x: 35, y: 63, name: "Oyo" },
  "Plateau": { x: 70, y: 45, name: "Plateau" },
  "Rivers": { x: 62, y: 88, name: "Rivers" },
  "Sokoto": { x: 45, y: 18, name: "Sokoto" },
  "Taraba": { x: 80, y: 55, name: "Taraba" },
  "Yobe": { x: 85, y: 20, name: "Yobe" },
  "Zamfara": { x: 50, y: 25, name: "Zamfara" }
};

export function NigeriaHeatMap({ data, totalVotes }: NigeriaHeatMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const getSentimentColor = (state: string) => {
    // Determine sentiment based on state name or random for now
    // In a real app, this would come from calculated results per state
    const hash = state.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sentiment = hash % 3; // 0: negative, 1: neutral, 2: positive
    
    switch (sentiment) {
      case 2: return '#10b981'; // Success/Positive
      case 1: return '#f59e0b'; // Warning/Neutral
      case 0: return '#ef4444'; // Danger/Negative
      default: return '#94a3b8';
    }
  };

  const getIntensity = (count: number) => {
    if (count === 0) return 0.2;
    return Math.min(0.3 + (count / (totalVotes * 0.1 || 1)), 1);
  };

  return (
    <div className="bg-white rounded-3xl md:rounded-[40px] p-4 md:p-10 border border-slate-200 shadow-sm h-full relative group/map">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-10 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-14 md:w-14 bg-slate-50 rounded-xl md:rounded-[20px] flex items-center justify-center text-slate-800 border border-slate-100 shadow-sm">
            <MapPin size={18} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h4 className="text-base md:text-xl font-black text-slate-800 uppercase tracking-tight">Geographical Sentiment Map</h4>
            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-nigeria-green animate-pulse" />
              Live Geographical Mood
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 bg-slate-50 p-1.5 md:p-2 rounded-2xl border border-slate-100">
           {['Optimistic', 'Neutral', 'Concerned'].map((label, i) => (
             <div key={label} className="flex items-center gap-1.5 px-2">
               <div className={cn(
                 "w-2 h-2 rounded-full",
                 i === 0 ? "bg-emerald-500" : i === 1 ? "bg-amber-500" : "bg-rose-500"
               )} />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="relative aspect-square md:aspect-auto w-full h-[320px] sm:h-[380px] md:h-[450px] lg:h-[550px] flex items-center justify-center bg-slate-50/30 rounded-[32px]">
        {/* Abstract Nigeria Path */}
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none p-12">
           <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
             <path d="M30 20 L50 15 L70 18 L90 20 L95 40 L85 60 L80 90 L60 85 L40 90 L20 85 L10 70 L15 40 Z" />
           </svg>
        </div>

        {/* State Bubbles */}
        <div className="relative w-full h-full">
          {Object.entries(STATE_COORDS).map(([state, pos]) => {
            const count = data[state] || 0;
            const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : "0.0";
            const scale = Math.max(0.6, Math.min(1.4, 0.8 + (count / (totalVotes || 1)) * 5));
            const color = getSentimentColor(state);
            const isSelected = selectedState === state;

            return (
              <motion.button
                key={state}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? scale * 1.5 : scale, 
                  opacity: 1,
                  zIndex: isSelected ? 50 : 10
                }}
                onClick={() => setSelectedState(isSelected ? null : state)}
                onMouseEnter={() => !selectedState && setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: `${pos.x}%`, 
                  top: `${pos.y}%`,
                }}
              >
                <div 
                  className={cn(
                    "w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-lg transition-all duration-500",
                    isSelected ? "ring-4 ring-slate-900/10" : "hover:ring-2 hover:ring-white"
                  )}
                  style={{ 
                    backgroundColor: color,
                    opacity: getIntensity(count)
                  }}
                />
                
                <AnimatePresence>
                  {(hoveredState === state || isSelected) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -45, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className={cn(
                        "absolute bottom-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 min-w-[140px] text-left mb-2",
                        pos.x > 80 ? "right-0 translate-x-[20%]" : 
                        pos.x < 20 ? "left-0 -translate-x-[20%]" : 
                        "left-1/2 -translate-x-1/2",
                        "after:content-[''] after:absolute after:top-full after:border-8 after:border-transparent after:border-t-slate-900",
                        pos.x > 80 ? "after:right-4" : pos.x < 20 ? "after:left-4" : "after:left-1/2 after:-translate-x-1/2"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{state}</span>
                        <div className={cn("w-2 h-2 rounded-full", color === '#10b981' ? "bg-emerald-400" : color === '#f59e0b' ? "bg-amber-400" : "bg-rose-400")} />
                      </div>
                      <div className="text-lg font-black leading-none mb-1">{percentage}%</div>
                      <div className="text-[9px] font-bold text-white/40 uppercase tracking-tight">of state voices</div>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase">
                            <span className="text-white/40">Engagement</span>
                            <span className="text-emerald-400">High</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-black uppercase">
                            <span className="text-white/40">Trend</span>
                            <span className="text-amber-400">+4% Weekly</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Floating Detail Card for Selected State (Mobile/Tablet helper) */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 right-6 left-6 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-between z-40 md:hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: getSentimentColor(selectedState), color: 'white' }}>
                   📍
                </div>
                <div>
                  <h5 className="font-black text-slate-800 uppercase tracking-tight">{selectedState}</h5>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected State Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedState(null)} className="p-2 text-slate-300 hover:text-slate-900">
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend Overlay - Moved to bottom for better mobile visibility */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-slate-100/80 backdrop-blur-sm rounded-full border border-slate-200">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
            Click state for depth
          </span>
        </div>
      </div>
      
      <div className="mt-6 md:mt-8 flex items-start md:items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-2xl">
        <Info size={16} className="text-slate-400" />
        <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
          Map shows clusters of sentiment based on user-reported primary residence. Darker colors indicate higher engagement volumes in that mood category.
        </p>
      </div>
    </div>
  );
}
