import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Twitter, Facebook, MessageCircle, Copy, Check, Download, Image as ImageIcon, QrCode, Zap } from 'lucide-react';
import { ShareCard, ShareCardType } from './ShareCard';
import { cn } from '../lib/utils';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: ShareCardType;
  data: any;
  onShareEnd?: () => void;
  initialTab?: 'card' | 'qr';
}

export function ShareDialog({ isOpen, onClose, type, data, onShareEnd, initialTab = 'card' }: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'card' | 'qr'>(initialTab);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const qrRef = React.useRef<HTMLDivElement>(null);

  // Update active tab when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const shareUrl = `${window.location.origin}${window.location.pathname}?ref=davidotu`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const targetRef = activeTab === 'card' ? cardRef : qrRef;
    if (targetRef.current) {
      setGenerating(true);
      try {
        const dataUrl = await toPng(targetRef.current, { 
          cacheBust: true,
          backgroundColor: '#ffffff',
          style: {
            padding: '20px'
          }
        });
        const link = document.createElement('a');
        link.download = `nigeria-pulse-${activeTab}-${type}.png`;
        link.href = dataUrl;
        link.click();
        onShareEnd?.();
      } catch (err) {
        console.error('Export failed', err);
      } finally {
        setGenerating(false);
      }
    }
  };

  const platforms = [
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'bg-emerald-500', url: `https://wa.me/?text=${encodeURIComponent("Check out this week's Nigeria Pulse results! " + window.location.href)}` },
    { name: 'X', icon: <Twitter size={20} />, color: 'bg-slate-900', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Nigeria Pulse Results: " + (data.question || "How we feel"))}&url=${encodeURIComponent(window.location.href)}` },
    { name: 'Facebook', icon: <Facebook size={20} />, color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
    { name: 'Telegram', icon: <Send size={20} />, color: 'bg-sky-500', url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Nigeria Pulse Results")}` },
  ];

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-6 md:p-10 z-[70] grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[95vh]"
          >
            {/* Left: Preview Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('card')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === 'card' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                    )}
                  >
                    Visual Card
                  </button>
                  <button 
                    onClick={() => setActiveTab('qr')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === 'qr' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                    )}
                  >
                    QR Code
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400">{activeTab === 'card' ? 'Visual Generated' : 'Real-time QR'}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 md:p-8 rounded-[40px] flex items-center justify-center min-h-[400px]">
                {activeTab === 'card' ? (
                  <ShareCard type={type} data={data} cardRef={cardRef} />
                ) : (
                  <div ref={qrRef} className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-6 border border-slate-100">
                    <div className="text-center space-y-2 mb-2">
                       <div className="w-10 h-10 bg-nigeria-green rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Zap className="text-white w-6 h-6" />
                       </div>
                       <h4 className="text-lg font-black text-slate-900 tracking-tight">Scan to Join</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">The Nigeria Pulse</p>
                    </div>
                    
                    <QRCodeSVG 
                      value={shareUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                    
                    <div className="w-full h-px bg-slate-100" />
                    <p className="text-[9px] text-slate-400 text-center font-medium max-w-[180px]">
                      Point your camera here to join the conversation instantly.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleDownload}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {activeTab === 'card' ? <Download size={18} /> : <QrCode size={18} />}
                  {generating ? 'Generating...' : `Download ${activeTab === 'card' ? 'Card' : 'QR code'}`}
                </button>
              </div>
            </div>

            {/* Right: Platforms & Link */}
            <div className="flex flex-col justify-center space-y-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Spread your voice</h3>
                  <p className="text-slate-500 font-medium mt-2">Choose where you want to share your impact.</p>
                </div>
                <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl group hover:bg-slate-100 transition-all border border-slate-100"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", platform.color)}>
                      {platform.icon}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{platform.name}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Share Link with Friends</p>
                <div className="flex items-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1 px-4 text-sm font-medium text-slate-500 truncate">
                    {shareUrl.replace(/^https?:\/\//, '')}
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      copied ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-black"
                    )}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">✨ Earn <span className="text-nigeria-gold font-black">20 Points</span> for each friend who joins.</p>
              </div>

              <div className="p-6 bg-nigeria-green/5 rounded-[32px] border border-nigeria-green/10 flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🚀</div>
                 <p className="text-xs font-medium text-slate-600 leading-relaxed">
                   <strong>Did you know?</strong> 84% of our growth comes from WhatsApp status shares! Thanks for being an ambassador.
                 </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
