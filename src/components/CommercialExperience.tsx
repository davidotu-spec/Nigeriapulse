import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Play, Pause, X, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface CommercialExperienceProps {
  onClose: () => void;
}

const scenes = [
  {
    image: "/images/commercial_market_scene.png",
    title: "The Pulse of a Nation",
    subtitle: "In the markets, the streets, and the soul of Nigeria...",
    description: "Every day, millions of stories are told. But who is listening to the collective voice?",
    script: "The Pulse of a Nation. In the markets, the streets, and the soul of Nigeria. Every day, millions of stories are told. But who is listening to the collective voice?"
  },
  {
    image: "/images/commercial_digital_map.png",
    title: "Connected Hearts",
    subtitle: "Real-time insights across every state.",
    description: "From Lagos to Kano, our technology bridges the distance, turning individual opinions into actionable data.",
    script: "Connected Hearts. Real-time insights across every state. From Lagos to Kano, our technology bridges the distance, turning individual opinions into actionable data."
  },
  {
    image: "/images/commercial_app_hand.png",
    title: "Your Voice, Our Strength",
    subtitle: "Decentralized. Transparent. Honest.",
    description: "Nigeria Pulse is more than an app. It's a digital town hall where every vote is secured and every pulse is preserved.",
    script: "Your Voice, Our Strength. Decentralized. Transparent. Honest. Nigeria Pulse is more than an app. It's a digital town hall where every vote is secured and every pulse is preserved."
  }
];

export function CommercialExperience({ onClose }: CommercialExperienceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(true);
  const [audioBuffers, setAudioBuffers] = useState<Record<number, AudioBuffer>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Fetch Voiceovers in parallel for better speed
  useEffect(() => {
    const fetchVoiceovers = async () => {
      try {
        const fetchPromises = scenes.map(async (scene, i) => {
          try {
            const response = await fetch('/api/v1/commercial/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: scene.script })
            });
            const data = await response.json();
            if (data.audio && audioContextRef.current) {
              const buffer = await decodePcm(data.audio, audioContextRef.current);
              return { index: i, buffer };
            }
          } catch (e) {
            console.error(`Failed scene ${i}`, e);
          }
          return null;
        });

        const results = await Promise.all(fetchPromises);
        const newBuffers: Record<number, AudioBuffer> = {};
        results.forEach(res => {
          if (res) newBuffers[res.index] = res.buffer;
        });
        
        setAudioBuffers(newBuffers);
        setIsVoiceLoading(false);
      } catch (err) {
        console.error("Failed to load voiceover:", err);
        setIsVoiceLoading(false);
      }
    };

    fetchVoiceovers();
  }, []);

  const decodePcm = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return await ctx.decodeAudioData(bytes.buffer);
  };

  const playVoice = (index: number) => {
    if (isMuted || !audioBuffers[index] || !audioContextRef.current) return;

    // Stop previous
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffers[index];
    source.connect(audioContextRef.current.destination);
    source.start();
    sourceNodeRef.current = source;
  };

  // Scene Switching Logic
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % scenes.length);
    }, 7000); // Slightly longer for the voiceover
    
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Sync Voice with Scene
  useEffect(() => {
    if (isPlaying && !isVoiceLoading) {
      playVoice(currentIndex);
    }
  }, [currentIndex, isVoiceLoading, isPlaying, isMuted]);

  const togglePlayback = () => {
    if (isPlaying && sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }
    setIsPlaying(!isPlaying);
  };

  const nextScene = () => {
    setCurrentIndex((prev) => (prev + 1) % scenes.length);
    setIsPlaying(true);
  };

  const prevScene = () => {
    setCurrentIndex((prev) => (prev === 0 ? scenes.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans overflow-hidden">
      {/* Background Cinematic Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <img 
            src={scenes[currentIndex].image} 
            alt={scenes[currentIndex].title}
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>
      </AnimatePresence>

      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-nigeria-green rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-white font-black uppercase tracking-widest text-sm">Nigeria Pulse Commercial</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h4 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-nigeria-gold font-bold uppercase tracking-[0.4em] mb-4 text-xs md:text-sm"
            >
              {scenes[currentIndex].subtitle}
            </motion.h4>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-none tracking-tighter">
              {scenes[currentIndex].title}
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
              {scenes[currentIndex].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-20 p-8 md:p-12 mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            {scenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                }}
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'w-12 bg-nigeria-green' : 'w-4 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={prevScene}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={togglePlayback}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-xl relative"
            >
              {isVoiceLoading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
              )}
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button 
              onClick={nextScene}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/10 text-white border border-white/20'
              }`}
              title={isMuted ? "Unmute Voiceover" : "Mute Voiceover"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              Detailed Explanation
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Explanation Overlay */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full md:w-[500px] z-[110] bg-slate-900 shadow-2xl p-8 md:p-12 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-white">Commercial Strategy</h2>
              <button onClick={() => setShowExplanation(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8 text-slate-300">
              <section>
                <h3 className="text-nigeria-gold font-bold uppercase tracking-widest text-xs mb-4">Core Narrative</h3>
                <p className="leading-relaxed">
                  The commercial, titled <strong>"The Pulse of a Nation"</strong>, focuses on the democratic democratization of opinion. It moves from the tangible (marketplaces) to the digital (data nodes), signifying Nigeria's growth as a tech-forward society.
                </p>
              </section>

              <section>
                <h3 className="text-nigeria-green font-bold uppercase tracking-widest text-xs mb-4">Scene 1: Heritage & Market</h3>
                <p className="leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                  <strong>Visual:</strong> Busy Lagos market at sunrise. High-energy, authentic, vibrant.
                  <br /><br />
                  <strong>Atmosphere:</strong> Establishing that the "Pulse" starts with everyday people in their natural habitats.
                </p>
              </section>

              <section>
                <h3 className="text-nigeria-green font-bold uppercase tracking-widest text-xs mb-4">Scene 2: Data & Connectivity</h3>
                <p className="leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                  <strong>Visual:</strong> Abstract 3D Nigeria map with glowing nodes.
                  <br /><br />
                  <strong>Concept:</strong> Demonstrating how Nigeria Pulse captures the collective consciousness across all 36 states simultaneously.
                </p>
              </section>

              <section>
                <h3 className="text-nigeria-green font-bold uppercase tracking-widest text-xs mb-4">Scene 3: Empowerment</h3>
                <p className="leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                  <strong>Visual:</strong> Close-up of interaction with the app.
                  <br /><br />
                  <strong>Message:</strong> Confidence and security. Showing that "Your Voice" is truly your strength in this ecosystem.
                </p>
              </section>

              <section>
                <h3 className="text-white/40 font-mono text-[10px] uppercase tracking-widest pt-8 border-t border-white/10">
                  AI Generation Strategy: DALL-E 3 Photographic Style + Framer Motion Cinematic Overlays
                </h3>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
