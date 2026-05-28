import React, { useState, useEffect } from 'react';
import { db, setDoc, doc, serverTimestamp, auth, loginWithGoogle, getDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { Plus, Trash2, Shield, LogIn, AlertCircle, Calendar, Clock, Archive, Bell, Key, Copy, Check, Download, Activity, TrendingUp, User as UserIcon } from 'lucide-react';
import { BrandSearchIcon } from './BrandSearchIcon';
import { addDays, format } from 'date-fns';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  Timestamp,
  updateDoc
} from 'firebase/firestore';

export function AdminView() {
  const [question, setQuestion] = useState('');
  const [translations, setTranslations] = useState({ pidgin: '', hausa: '', yoruba: '', igbo: '' });
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [activeFrom, setActiveFrom] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [activeTo, setActiveTo] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"));
  const [weekLabel, setWeekLabel] = useState(`Week ${getWeekNumber(new Date())}, ${new Date().getFullYear()}`);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'surveys' | 'insights' | 'keys'>('surveys');
  const [surveyFilter, setSurveyFilter] = useState<'all' | 'live' | 'planned' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

  const generateNewApiKey = async () => {
    setGeneratingKey(true);
    setErrorStatus(null);
    try {
      const resp = await fetch('/api/v1/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: 'PULSE_ADMIN_SECRET',
          ownerEmail: user?.email 
        })
      });
      const data = await resp.json();
      if (data.success) {
        setApiKey(data.key);
      } else {
        setErrorStatus(data.error || 'Key generation failed');
      }
    } catch (e) {
      setErrorStatus('Network error during key generation');
    } finally {
      setGeneratingKey(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const adminDocRef = doc(db, 'admins', u.uid);
          const adminDoc = await getDoc(adminDocRef);
          setIsAdminUser(adminDoc.exists());
        } catch (e) {
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAdminUser) return;
    
    const q = query(collection(db, 'surveys'), orderBy('activeFrom', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSurveys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
       handleFirestoreError(error, OperationType.LIST, 'surveys');
    });
    return () => unsubscribe();
  }, [isAdminUser]);

  // Archive automation
  useEffect(() => {
    if (!isAdminUser || surveys.length === 0) return;
    
    const archiveExpired = async () => {
      const now = new Date();
      const expiredActiveSurveys = surveys.filter(s => {
        const to = s.activeTo?.toDate?.() || new Date(s.activeTo);
        return s.status === 'active' && now >= to;
      });

      if (expiredActiveSurveys.length === 0) return;

      console.log(`[PulseArchiver] archiving ${expiredActiveSurveys.length} survey(s)`);
      
      for (const survey of expiredActiveSurveys) {
        try {
          await updateDoc(doc(db, 'surveys', survey.id), { 
            status: 'archived',
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Archive failure:", err);
        }
      }
    };

    const timer = setTimeout(archiveExpired, 2000);
    return () => clearTimeout(timer);
  }, [isAdminUser, surveys]);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const createSurvey = async () => {
    setErrorStatus(null);
    setSuccessStatus(null);

    if (!question.trim()) {
      setErrorStatus("Please enter a pulse question.");
      return;
    }
    if (options.some(o => !o.trim())) {
      setErrorStatus("Please fill in all response options.");
      return;
    }
    
    setLoading(true);
    
    try {
      const fromDate = new Date(activeFrom);
      const toDate = new Date(activeTo);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        setErrorStatus("Invalid active dates provided.");
        setLoading(false);
        return;
      }

      if (toDate <= fromDate) {
        setErrorStatus("Expiry date must be after the start date.");
        setLoading(false);
        return;
      }

      const surveyId = `CW${getWeekNumber(fromDate)}-${fromDate.getFullYear()}-${Date.now().toString().slice(-4)}`;
      const surveyRef = doc(db, 'surveys', surveyId);
      
      const results: Record<string, number> = {};
      options.forEach((_, i) => results[i] = 0);

      await setDoc(surveyRef, {
        question: question.trim(),
        translations,
        options: options.map(o => o.trim()),
        status: 'active',
        activeFrom: fromDate,
        activeTo: toDate,
        totalVotes: 0,
        results,
        updatedAt: serverTimestamp(),
        weekLabel: weekLabel || `Week ${getWeekNumber(fromDate)}, ${fromDate.getFullYear()}`
      });

      setSuccessStatus('Pulse question scheduled successfully!');
      setQuestion('');
      setTranslations({ pidgin: '', hausa: '', yoruba: '', igbo: '' });
      setOptions(['', '']);
      
      // Auto-hide success after 5s
      setTimeout(() => setSuccessStatus(null), 5000);
    } catch (err: any) {
      console.error("Survey creation failed:", err);
      setErrorStatus(`Failed to schedule: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pulse? All votes and data will be lost.')) return;
    try {
      await deleteDoc(doc(db, 'surveys', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `surveys/${id}`);
    }
  };

  const exportCsv = async (id: string) => {
    if (!apiKey) {
      alert('Please generate or copy an API key first to authenticate the export.');
      return;
    }
    const url = `/api/v1/admin/export/${id}?apiKey=${apiKey}`;
    window.open(url, '_blank');
  };

  function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const [initLoading, setInitLoading] = useState(false);

  const initializeSystem = async () => {
    setInitLoading(true);
    try {
      console.log("Attempting server-side initialization...");
      const resp = await fetch('/api/admin/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, uid: user?.uid })
      });
      const data = await resp.json();
      
      if (data.success) {
        alert('System initialized via server!');
        window.location.reload();
        return;
      }

      console.warn("Server-side initialization failed:", data.error);

      // FALLBACK: Client-side bootstrap (allowed by special Firestore rules for this email)
      if (user?.email === 'davidotu@mixxd.org') {
        await processClientInitialization();
      } else {
        alert(data.error || 'Setup failed');
      }
    } catch (e) {
      console.error("Initialization error:", e);
      if (user?.email === 'davidotu@mixxd.org') {
        await processClientInitialization();
      } else {
        alert('Network error during initialization');
      }
    } finally {
      setInitLoading(false);
    }
  };

  const processClientInitialization = async () => {
    if (!user) return;
    try {
      console.log("Attempting client-side bootstrapping...");
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        role: 'superadmin',
        updatedAt: serverTimestamp()
      });
      alert('System initialized via client-side bootstrap! Welcome back.');
      window.location.reload();
    } catch (err: any) {
      console.error("Client bootstrap failed:", err);
      alert(`Bootstrap failed: ${err.message}`);
    }
  };

  if (isAdminUser === false && user?.email === 'davidotu@mixxd.org') {
    return (
      <div className="flex flex-col items-center justify-center rounded-[40px] bg-white p-16 border border-slate-200 shadow-sm">
        <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-center mb-8">
          <AlertCircle className="h-10 w-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 text-center">Admin Setup Required</h2>
        <p className="mt-4 text-center text-slate-400 max-w-sm">
          UID: <code className="text-[10px] bg-slate-50 px-1">{user?.uid}</code><br/>
          Your admin profile has not been initialized in the database yet.
        </p>
        
        <button
          onClick={initializeSystem}
          disabled={initLoading}
          className="mt-10 w-full rounded-2xl bg-amber-500 px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-amber-600 hover:shadow-xl active:scale-95 disabled:opacity-50"
        >
          {initLoading ? 'Initializing Profile...' : 'Initialize My Admin Profile'}
        </button>
      </div>
    );
  }

  if (isAdminUser === false) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl md:rounded-[40px] bg-white p-8 md:p-16 border border-slate-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center mb-8">
          <Shield className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">Access Denied</h2>
        <p className="mt-4 text-slate-400 max-w-sm">This area is reserved for authorized election and survey administrators. Your account does not have sufficient privileges.</p>
      </div>
    );
  }

  if (isAdminUser === null || !user) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl md:rounded-[40px] bg-white p-8 md:p-16 border border-slate-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-8">
          <Shield className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">Admin Authentication</h2>
        <p className="mt-4 text-center text-slate-400 max-w-sm">Secure access required to manage the national pulse engine. Please sign in with verified credentials.</p>
        <button 
          onClick={loginWithGoogle}
          className="mt-10 flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-black hover:shadow-xl active:scale-95"
        >
          <LogIn className="h-5 w-5" /> Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl md:rounded-[40px] bg-white p-6 md:p-10 border border-slate-200 shadow-sm lg:p-14">
      <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full text-white text-[10px] font-bold mb-6 tracking-widest uppercase">
        Survey Management
      </div>
      <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-800">
        Pulse Control Center.
      </h2>

      <div className="flex items-center gap-2 mt-8 border-b border-slate-100 overflow-x-auto pb-px custom-scrollbar">
        {[
          { id: 'surveys', label: 'Scheduler', icon: Calendar },
          { id: 'insights', label: 'Platform Insights', icon: Activity },
          { id: 'keys', label: 'API Access', icon: Key },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
              adminTab === tab.id 
                ? "border-emerald-600 text-emerald-600 bg-emerald-50/10" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-12 space-y-10">
        {adminTab === 'surveys' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Existing scheduler form */}
              <div className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Weekly Question (English)</label>
              <input 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How do you rate public transport this week?"
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 text-lg font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['pidgin', 'hausa', 'yoruba', 'igbo'] as const).map((lang) => (
                <div key={lang} className="space-y-2">
                  <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase ml-1">{lang}</label>
                  <input 
                    value={translations[lang]}
                    onChange={(e) => setTranslations({ ...translations, [lang]: e.target.value })}
                    placeholder={`${lang} translation...`}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Response Options</label>
              <div className="grid grid-cols-1 gap-4">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-3 items-center group">
                    <div className="flex-1 relative">
                       <input 
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-white p-5 text-lg font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 font-black italic">{i + 1}</span>
                    </div>
                    {options.length > 2 && (
                      <button 
                        onClick={() => removeOption(i)} 
                        className="h-14 w-14 flex items-center justify-center rounded-2xl border-2 border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={addOption}
                className="flex items-center gap-2 text-xs font-black tracking-widest text-emerald-600 uppercase mt-4 hover:text-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Pulse Option
              </button>
            </div>
          </div>

          <div className="space-y-8 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
             <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Schedule Timing
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 ml-2">Active From</span>
                  <input 
                    type="datetime-local"
                    value={activeFrom}
                    onChange={(e) => setActiveFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 ml-2">Active To</span>
                  <input 
                    type="datetime-local"
                    value={activeTo}
                    onChange={(e) => setActiveTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Week Label</label>
              <input 
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                placeholder="e.g., Week 20, 2026"
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 space-y-4">
              <AnimatePresence>
                {errorStatus && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorStatus}
                  </motion.div>
                )}
                {successStatus && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-bold"
                  >
                    <Check className="h-4 w-4 shrink-0" />
                    {successStatus}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={createSurvey}
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 py-6 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 hover:shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Queue Pulse Question'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black tracking-tight text-slate-800">Pulse Queue</h3>
                  <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {surveys.length} Scheduled
                  </span>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[
                    { id: 'all', label: 'All Pulses' },
                    { id: 'live', label: 'Live Now' },
                    { id: 'planned', label: 'Planned' },
                    { id: 'archived', label: 'Archived' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSurveyFilter(f.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        surveyFilter === f.id
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative flex-1 max-w-sm group">
              <BrandSearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question or week..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {surveys.filter(s => {
              const matchesSearch = s.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   s.weekLabel.toLowerCase().includes(searchQuery.toLowerCase());
              
              if (!matchesSearch) return false;

              if (surveyFilter === 'all') return true;

              const now = new Date();
              const from = s.activeFrom?.toDate?.() || new Date(s.activeFrom);
              const to = s.activeTo?.toDate?.() || new Date(s.activeTo);
              
              if (surveyFilter === 'live') return now >= from && now < to;
              if (surveyFilter === 'planned') return now < from;
              if (surveyFilter === 'archived') return now >= to;
              
              return true;
            }).length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-100 rounded-[32px] text-center text-slate-300 font-bold italic">
                {searchQuery || surveyFilter !== 'all' ? 'No results matching your filters' : 'No pulses in the queue'}
              </div>
            ) : (
              surveys
                .filter(s => {
                  const matchesSearch = s.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       s.weekLabel.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  if (!matchesSearch) return false;

                  if (surveyFilter === 'all') return true;

                  const now = new Date();
                  const from = s.activeFrom?.toDate?.() || new Date(s.activeFrom);
                  const to = s.activeTo?.toDate?.() || new Date(s.activeTo);
                  
                  if (surveyFilter === 'live') return now >= from && now < to;
                  if (surveyFilter === 'planned') return now < from;
                  if (surveyFilter === 'archived') return now >= to;
                  
                  return true;
                })
                .map(s => {
                const now = new Date();
                const from = s.activeFrom?.toDate?.() || new Date(s.activeFrom);
                const to = s.activeTo?.toDate?.() || new Date(s.activeTo);
                const isActive = now >= from && now < to;
                const isComing = now < from;
                const isPast = now >= to;

                return (
                  <div key={s.id} className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[32px] border border-slate-100 bg-white hover:border-emerald-100 hover:shadow-sm transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{s.weekLabel}</span>
                        {isActive && <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Live Now</span>}
                        {isComing && <span className="bg-blue-50 text-blue-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Queued</span>}
                        {isPast && <span className="bg-slate-50 text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Archived</span>}
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">{s.question}</h4>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(from, "MMM d, HH:mm")}</span>
                        <span>→</span>
                        <span className="flex items-center gap-1">{format(to, "MMM d, HH:mm")}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {isActive && (
                        <button 
                          onClick={async () => {
                            if (!confirm(`Broadcast this specific survey to all devices?\n\n"${s.question}"`)) return;
                            try {
                              const res = await fetch('/api/v1/admin/broadcast-survey', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  surveyId: s.id,
                                  surveyTitle: s.question,
                                  secret: 'PULSE_ADMIN_SECRET'
                                })
                              });
                              const data = await res.json();
                              alert(`Survey-Specific Broadcast: Sent to ${data.count} devices.`);
                            } catch (e) {
                              alert('Broadcast failed');
                            }
                          }}
                          className="h-12 flex items-center gap-2 px-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                        >
                          <Bell className="h-4 w-4" /> Broadcast
                        </button>
                      )}
                      <div className="text-right px-6 border-r border-slate-100">
                        <div className="text-lg font-black text-slate-800">{s.totalVotes}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Votes</div>
                      </div>
                      <button 
                        onClick={() => exportCsv(s.id)}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all"
                        title="Export Researcher CSV"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => {
                          // We can't easily show this in AdminView without a modal or a route change
                          // For now, let's just alert the results or maybe we should implement a small modal.
                          // Actually, let's just open a new tab with the results endpoint for raw data as a quick win
                          window.open(`/api/v1/pulse/${s.id}/results`, '_blank');
                        }}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-emerald-500 hover:border-emerald-100 hover:bg-emerald-50 transition-all"
                        title="View Raw Results Data"
                      >
                        <BrandSearchIcon size={20} />
                      </button>
                      <button 
                        onClick={() => deleteSurvey(s.id)}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

          </div>
        )}

        {adminTab === 'insights' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Citizens', value: '42,502', trend: '+12%', icon: UserIcon, color: 'text-emerald-600' },
                { label: 'Avg Weekly Pulse', value: '18.2k', trend: '+5%', icon: Activity, color: 'text-nigeria-blue' },
                { label: 'Growth Vector', value: '0.82', trend: 'Optimal', icon: TrendingUp, color: 'text-nigeria-gold' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={stat.color}><stat.icon size={24} /></div>
                    <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-1 rounded-full">{stat.trend}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Demographic Distribution</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Youth (18-24)', value: 0.42 },
                    { label: 'Millennial (25-34)', value: 0.35 },
                    { label: 'Gen X (35-54)', value: 0.18 },
                    { label: 'Senior (55+)', value: 0.05 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <span>{item.label}</span>
                        <span>{(item.value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value * 100}%` }}
                          className="h-full bg-nigeria-green"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Top Regions</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Lagos', value: 0.28 },
                    { label: 'Abuja (FCT)', value: 0.15 },
                    { label: 'Kano', value: 0.12 },
                    { label: 'Rivers', value: 0.10 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <span>{item.label}</span>
                        <span>{(item.value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value * 100}%` }}
                          className="h-full bg-nigeria-blue"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
               <Activity className="absolute bottom-0 right-0 w-64 h-64 text-white opacity-5 -mb-16 -mr-16" />
               <div className="relative z-10 max-w-lg">
                <h4 className="text-2xl font-black mb-4">Strategic Pulse Analysis</h4>
                <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
                  The current national mood is showing strong synchronization between Southern and Northern blocks on economic metrics. Demographic data suggests high engagement from the 18-24 segment in Lagos and Abuja.
                </p>
                <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                  Request AI Deep Dive
                </button>
               </div>
            </div>
          </div>
        )}

        {adminTab === 'keys' && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-800">Public API Access</h3>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
              <p className="text-sm text-slate-500 max-w-2xl mb-8 font-medium font-medium leading-relaxed">
                Generate long-lived API keys for external researchers and news organizations. 
                Keys provide read-only access to aggregated pulse data via the REST API.
              </p>

              {apiKey ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border-2 border-emerald-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-2">New API Key Generated</span>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm break-all">
                      <span className="flex-1 text-slate-700">{apiKey}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          alert('Key copied to clipboard');
                        }}
                        className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Copy className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <p className="mt-4 text-[11px] text-slate-400 font-bold italic">
                      IMPORTANT: Store this key safely. For security, it will not be shown again.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generateNewApiKey}
                  disabled={generatingKey}
                  className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {generatingKey ? <Plus className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Generate New API Key
                </button>
              )}
            </div>
          </div>
        )}

        {user?.email === 'davidotu@mixxd.org' && (
          <button
            onClick={initializeSystem}
            disabled={initLoading}
            className="w-full rounded-2xl border-2 border-slate-100 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all disabled:opacity-50"
          >
            {initLoading ? 'Initializing...' : 'Emergency System Boot (Developer Only)'}
          </button>
        )}
      </div>
    </div>
  );
}
