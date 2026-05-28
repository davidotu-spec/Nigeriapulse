import React from 'react';
import { useSurvey } from '../context/SurveyContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList, PieChart, Pie, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Info, Zap, MessageSquare, Quote, Activity, PieChart as PieIcon, MapPin, TrendingUp, Share2, BarChart3, LayoutGrid, CheckCircle2, AlertCircle, X, Copy, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BrandSearchIcon } from './BrandSearchIcon';
import { ParticipationHistory } from './ParticipationHistory';
import { CommentSection } from './CommentSection';
import { LiveActivityFeed } from './LiveActivityFeed';
import { AiPulseSummary } from './AiPulseSummary';
import { NigeriaHeatMap } from './NigeriaHeatMap';
import { Leaderboard, StateCompetition } from './Leaderboard';
import { SummaryHero } from './SummaryHero';
import { TrendTimeline } from './TrendTimeline';
import { InsightGrid } from './InsightGrid';
import { ExportTools } from './ExportTools';
import { AntiManipulationNote, AnonymousBadge, MethodologyModal } from './TrustIndicators';
import { ShareDialog } from './ShareDialog';
import { useNotification } from '../context/NotificationContext';
import { useGamification } from '../context/GamificationContext';
import { StarRating } from './StarRating';
import { AGE_RANGES, GENDERS, EMPLOYMENT_STATUSES, NIGERIA_STATES } from '../constants';
import { cn } from '../lib/utils';

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export function ResultsView() {
  const { currentSurvey, language, userProfile } = useSurvey();
  const { showNotification } = useNotification();
  const { addPoints, profile } = useGamification();
  const [hasNotifiedTrend, setHasNotifiedTrend] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'age' | 'gender' | 'state' | 'employment' | null>(null);
  const [filterValue, setFilterValue] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'bar' | 'pie'>('bar');
  const [isMethodologyOpen, setIsMethodologyOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const qrRef = React.useRef<HTMLDivElement>(null);
  const [isExportingQR, setIsExportingQR] = React.useState(false);

  const exportAsImage = async () => {
    if (dashboardRef.current) {
      try {
        const dataUrl = await toPng(dashboardRef.current, { cacheBust: true, backgroundColor: '#f8fafc' });
        const link = document.createElement('a');
        link.download = `nigeria-pulse-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
        showNotification("Success!", "Dashboard exported as high-quality image.", "achievement");
      } catch (err) {
        console.error('oops, something went wrong!', err);
      }
    }
  };

  const exportAsPDF = () => {
     const doc = new jsPDF();
     doc.setFontSize(20);
     doc.text("Public Voice Weekly Report", 20, 20);
     doc.setFontSize(14);
     doc.text(`Question: ${currentSurvey?.question}`, 20, 40);
     doc.text(`Total Voices: ${currentSurvey?.totalVotes}`, 20, 50);
     doc.text("Generated on: " + new Date().toLocaleDateString(), 20, 60);
     doc.save(`public-voice-report-${new Date().getTime()}.pdf`);
     showNotification("PDF Ready", "Detailed report saved to your downloads.", "share");
  };

  const downloadQRCode = async () => {
    if (qrRef.current) {
      setIsExportingQR(true);
      try {
        const dataUrl = await toPng(qrRef.current, { 
          cacheBust: true, 
          backgroundColor: '#ffffff',
          style: {
            padding: '40px',
            borderRadius: '40px'
          }
        });
        const link = document.createElement('a');
        link.download = `public-voice-qr-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
        showNotification("Success!", "QR Code downloaded.", "share");
      } catch (err) {
        console.error('QR Export failed', err);
        showNotification("Export Error", "Could not export QR code.", "error");
      } finally {
        setIsExportingQR(false);
      }
    }
  };

  const copySummary = () => {
    const summary = `Public Voice Weekly Review: ${currentSurvey?.question}. Total responses: ${currentSurvey?.totalVotes}. Insights suggest a 14.2% growth in optimism. Join us at PublicVoice.app`;
    navigator.clipboard.writeText(summary);
    showNotification("Copied!", "Summary text ready to paste.", "share");
  };

  const getFilterOptions = () => {
    switch (filterType) {
      case 'age': return AGE_RANGES;
      case 'gender': return GENDERS;
      case 'state': return NIGERIA_STATES.slice(0, 10);
      case 'employment': return EMPLOYMENT_STATUSES;
      default: return [];
    }
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  const hasParticipated = profile.history?.some(h => h.surveyId === currentSurvey?.id);

  // Mock trend data
  const trendData = [
    { week: 'WK 18', value: 42, label: 'Optimism', sentiment: 'neutral' as const },
    { week: 'WK 19', value: 38, label: 'Concern', sentiment: 'negative' as const },
    { week: 'WK 20', value: 45, label: 'Optimism', sentiment: 'positive' as const },
    { week: 'WK 21', value: 52, label: 'Optimism', sentiment: 'positive' as const },
    { week: 'WK 22', value: 58, label: 'Optimism', sentiment: 'positive' as const },
    { week: 'WK 23', value: 65, label: 'Optimism', sentiment: 'positive' as const },
  ];

  // Mock insights
  const insights = [
    { 
      id: '1', 
      type: 'demographic' as const, 
      title: 'Youth Optimism Spike', 
      description: 'The 18-24 age group is 12% more optimistic about digital economy shifts than any other group.',
      change: { value: '12%', isPositive: true },
      icon: Users
    },
    { 
      id: '2', 
      type: 'regional' as const, 
      title: 'Kano Leading Participation', 
      description: 'Northern regions show a 24% increase in engagement this week, driven by local discussions.',
      change: { value: '24%', isPositive: true },
      icon: MapPin
    },
    { 
      id: '3', 
      type: 'trend' as const, 
      title: 'Cost of Living Shift', 
      description: 'Concern regarding food prices has stabilized across all states for the first time in 4 weeks.',
      change: { value: 'Stable', isPositive: true },
      icon: Activity
    }
  ];

  React.useEffect(() => {
    if (currentSurvey && !hasNotifiedTrend && currentSurvey.totalVotes > 50) {
      const total = currentSurvey.totalVotes;
      const results = currentSurvey.results || {};
      const isTrending = Object.values(results).some(v => (Number(v) / total) > 0.4);
      
      if (isTrending) {
        showNotification(
          "Sentiment Trending! 📈",
          `A strong majority is emerging for "${currentSurvey.question}".`,
          "trending"
        );
        setHasNotifiedTrend(true);
      }
    }
  }, [currentSurvey, hasNotifiedTrend, showNotification]);

  if (!currentSurvey) return null;

  const displayQuestion = language !== 'en' && currentSurvey.translations?.[language] 
    ? currentSurvey.translations[language] 
    : currentSurvey.question;

  const CHART_COLORS = ['#008751', '#D4213D', '#FCD116', '#003087', '#10B981', '#6366F1'];

  const getSemanticColor = (option: string, index: number) => {
    const text = option.toLowerCase();
    if (text.includes('good') || text.includes('optimis') || text.includes('great') || text.includes('excellent')) return '#008751'; // Nigeria Green
    if (text.includes('worse') || text.includes('critical') || text.includes('very bad')) return '#D4213D'; // Red
    if (text.includes('bad') || text.includes('poor') || text.includes('negative')) return '#FCD116'; // Gold
    if (text.includes('better') || text.includes('improv') || text.includes('hopeful')) return '#003087'; // Blue
    return CHART_COLORS[index % CHART_COLORS.length];
  };

  const data = currentSurvey.options.map((option, index) => ({
    name: option,
    value: currentSurvey.results?.[index] || 0,
    color: getSemanticColor(option, index)
  })).filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalVotes = currentSurvey.totalVotes || 0;

  const ageData = Object.entries(currentSurvey.demographics?.ageRange || {})
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value);
    
  const stateData = Object.entries(currentSurvey.demographics?.state || {})
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = CHART_COLORS;

  return (
    <div ref={dashboardRef} className="space-y-8 md:space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Hero Narrative Section */}
      <SummaryHero 
        percentage={totalVotes > 0 ? Math.round(((currentSurvey.results?.[0] || 0) / totalVotes) * 100) : 0}
        headline={displayQuestion || "Weekly National Pulse"}
        subheadline={`The collective mood on ${currentSurvey.options[0]?.toLowerCase()} remains the dominant sentiment, reflecting a broader trend in Nigerian civic discourse.`}
        sentiment={(data[0]?.value / totalVotes) > 0.5 ? "positive" : "neutral"}
        trendValue="+4.2% vs last week"
        totalVotes={totalVotes}
      />

      <AiPulseSummary surveyId={currentSurvey.id} />

      {/* User Voice Highlight Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "p-6 rounded-[32px] border flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative",
          hasParticipated 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-nigeria-gold/10 border-nigeria-gold/20 text-slate-800"
        )}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm",
            hasParticipated ? "bg-white text-emerald-600" : "bg-white text-nigeria-gold"
          )}>
            {hasParticipated ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">
              {hasParticipated ? "Your Voice is Recorded" : "Your Voice is Missing"}
            </p>
            <p className="text-xs font-medium opacity-70">
              {hasParticipated 
                ? "You represented your demographic this week. Thank you!" 
                : "Answer this week's question to see your voice reflected in the results."}
            </p>
          </div>
        </div>
        {!hasParticipated && (
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all relative z-10"
          >
            Answer Now
          </button>
        )}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-current opacity-5 -skew-x-12 translate-x-12" />
      </motion.div>

      <div className="rounded-3xl md:rounded-[40px] bg-white p-4 md:p-10 border border-slate-200 shadow-sm lg:p-14">
        <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-100 pb-10 gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-nigeria-green text-[10px] font-bold tracking-widest uppercase border border-nigeria-green/10">
              <span className="w-1.5 h-1.5 bg-nigeria-green rounded-full animate-pulse" />
              Live National Pulse
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">
              Breakdown of Public Sentiment
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button 
                  onClick={() => setViewMode('bar')}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    viewMode === 'bar' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
               >
                 <BarChart3 size={18} />
               </button>
               <button 
                  onClick={() => setViewMode('pie')}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    viewMode === 'pie' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
               >
                 <PieIcon size={18} />
               </button>
            </div>
            <ExportTools 
              onExportImage={exportAsImage}
              onExportPDF={exportAsPDF}
              onCopyText={copySummary}
              onShare={handleShare}
            />
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h3 className="text-xl font-bold text-slate-700 leading-tight flex-1">{displayQuestion}</h3>
            <div className="relative w-full md:w-64 group">
              <BrandSearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-nigeria-green transition-colors" />
              <input 
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-nigeria-green/10 focus:border-nigeria-green transition-all"
              />
            </div>
          </div>

          <div className="mb-8 overflow-x-auto pb-2 flex items-center gap-3 custom-scrollbar">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter By:</p>
            </div>
            <div className="flex items-center gap-2">
              {(['age', 'gender', 'state', 'employment'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    if (filterType === type) {
                      setFilterType(null);
                      setFilterValue(null);
                    } else {
                      setFilterType(type);
                      setFilterValue(null);
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2",
                    filterType === type 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {filterType && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 pl-4 border-l border-slate-100 ml-2"
                >
                  {getFilterOptions().map(val => (
                    <button
                      key={val}
                      onClick={() => setFilterValue(filterValue === val ? null : val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                        filterValue === val 
                          ? "bg-nigeria-green text-white shadow-lg shadow-nigeria-green/20" 
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {filterValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-slate-900 text-white rounded-[32px] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">🎯</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Filtered Intelligence</p>
                  <p className="text-sm font-bold">
                    Showing insights for: <span className="text-nigeria-gold underline decoration-2 underline-offset-4 font-black">{filterType === 'state' ? 'State of ' : ''}{filterValue}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                   {totalVotes > 0 ? (Math.random() * 20 + 5).toFixed(1) : 0}% Engagement
                 </div>
                 <button 
                  onClick={() => { setFilterType(null); setFilterValue(null); }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 min-h-[400px] w-full mt-4 flex items-center justify-center">
              {data.length > 0 ? (
                viewMode === 'bar' ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: '#334155' }} />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={48}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80 transition-opacity" />)}
                        <LabelList dataKey="value" position="right" content={(props: any) => {
                          const { x, y, width, value } = props;
                          const percentage = ((Number(value) / (totalVotes || 1)) * 100).toFixed(1);
                          return <text x={Number(x) + Number(width) + 10} y={Number(y) + 30} className="text-sm font-black fill-slate-800">{percentage}%</text>;
                        }} />
                      </Bar>
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                             return (
                               <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800">
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].name}</p>
                                 <p className="text-lg font-black">{payload[0].value.toLocaleString()} <span className="text-xs font-bold text-slate-400">Votes</span></p>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80 transition-opacity" />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 italic">
                  <BrandSearchIcon size={32} className="mb-2 opacity-20" />
                  <p>No matching results found</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-50 p-5 md:p-8 rounded-[40px] border border-slate-100">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Regional Highlights</h4>
                <div className="space-y-6">
                  {stateData.map((state, i) => (
                    <div key={state.name} className="space-y-2">
                       <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                         <span className="text-slate-600">{state.name}</span>
                         <span className="text-slate-900">{((state.value / totalVotes) * 100).toFixed(1)}%</span>
                       </div>
                       <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                         <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(state.value / (stateData[0].value)) * 100}%` }}
                          className="h-full bg-nigeria-blue"
                         />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-nigeria-green/5 p-5 md:p-8 rounded-[40px] border border-nigeria-green/10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">👑</div>
                   <p className="text-sm font-black text-slate-800">State Leaderboard</p>
                 </div>
                 <p className="text-xs font-medium text-slate-500 mb-6 font-medium leading-relaxed">
                   <strong>Lagos</strong> is currently leading in civic participation with 2.4k voices this week.
                 </p>
                 <button onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-widest text-nigeria-green hover:underline">
                   View full rankings →
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><TrendingUp size={12} className="text-nigeria-green" /> Trend Strength</p>
            <p className="text-xl md:text-2xl font-black text-slate-800">{totalVotes > 500 ? 'High' : 'Medium'}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin size={12} className="text-nigeria-blue" /> Top State</p>
            <p className="text-xl md:text-2xl font-black text-slate-800 truncate">{stateData[0]?.name || 'National'}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Users size={12} className="text-nigeria-gold" /> Core Demographic</p>
            <p className="text-xl md:text-2xl font-black text-slate-800 truncate">{ageData[0]?.name || 'N/A'}</p>
          </div>
          <div className="bg-nigeria-green rounded-2xl p-4 md:p-6 shadow-xl shadow-nigeria-green/10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Status</p>
              <p className="text-xl md:text-2xl font-black">Active Pulse</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-1.5 w-1.5 rounded-full bg-nigeria-gold animate-pulse"></div>
                <p className="text-[10px] text-emerald-50 opacity-80 font-medium">Listening live...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InsightGrid insights={insights} />

      <TrendTimeline data={trendData} />

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <AntiManipulationNote />
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMethodologyOpen(true)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <Info size={14} />
            National Methodology
          </button>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
               {totalVotes.toLocaleString()} Live Voices
            </span>
          </div>
        </div>
      </motion.div>

      <MethodologyModal isOpen={isMethodologyOpen} onClose={() => setIsMethodologyOpen(false)} />

      <ShareDialog 
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        type="weekly_result"
        data={{
          question: currentSurvey.question,
          value: totalVotes > 0 ? Math.round(((currentSurvey.results?.[0] || 0) / totalVotes) * 100) : 0,
          insight: currentSurvey.options[0] || "Optimism"
        }}
        onShareEnd={() => {
          showNotification("Points Added!", "You earned 5 XP for sharing the national pulse.", "achievement");
          addPoints(5);
        }}
      />

      <div id="leaderboard" className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
        <Leaderboard />
        <StateCompetition stateData={stateData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <NigeriaHeatMap data={currentSurvey.demographics?.state || {}} totalVotes={totalVotes} />
        </div>
        <div className="space-y-8">
          <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="h-10 w-10 bg-slate-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-white"><PieIcon size={20} /></div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Age Range</h4>
            </div>
            <div className="h-[240px] w-full">
              {ageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={ageData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {ageData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold italic">Not enough demographic data yet</div>}
            </div>
          </div>
          <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><Activity size={20} /></div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Real-time Stream</h4>
            </div>
            <LiveActivityFeed surveyId={currentSurvey.id} />
          </div>
          <StarRating surveyId={currentSurvey.id} />
        </div>
      </div>

      <div className="text-center py-12 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-400 italic">"Together, we can understand the community we live in — and the future we want."</p>
      </div>
      <CommentSection />
      
      <div className="bg-slate-900 rounded-[40px] p-8 md:p-14 text-white overflow-hidden relative mt-12 mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-nigeria-gold/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Join the Movement</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
              Bring more voices to the <span className="text-nigeria-gold font-light italic">conversation.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Every voice adds a pixel to the collective picture. Share this QR code with your community to help us build a more accurate map of our reality.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
               <button 
                onClick={() => handleShare()}
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-900 transition-all flex items-center gap-3"
               >
                 <Share2 size={18} />
                 Share Result
               </button>
               <button 
                onClick={copySummary}
                className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-3 border border-white/5"
               >
                 <Copy size={18} />
                 Copy Text Link
               </button>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 group hover:rotate-2 transition-transform duration-500">
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Public Voice APP</p>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
                  <div ref={qrRef} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <QRCodeSVG 
                      value={`${window.location.origin}${window.location.pathname}`}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-12 w-full bg-nigeria-green rounded-2xl flex items-center justify-center gap-3 px-6">
                    <div className="w-2 h-2 bg-nigeria-gold rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Scan to participate</span>
                  </div>
                  <button 
                    onClick={downloadQRCode}
                    disabled={isExportingQR}
                    className="h-12 w-full bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    <Download size={14} />
                    {isExportingQR ? 'Saving...' : 'Download QR'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <ParticipationHistory />
    </div>
  );
}
