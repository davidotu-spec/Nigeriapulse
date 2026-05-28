import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-nigeria-green rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-white font-black uppercase tracking-widest text-sm">Nigeria Pulse</span>
          </div>
          <p className="text-xs max-w-xs text-center md:text-left leading-relaxed">
            The democratic engine for real-time collective intelligence across Nigeria. Your voice, protected and amplified.
          </p>
          <a 
            id="footer-email-link"
            href="mailto:Info@nigeriapulse.com" 
            className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors mt-1"
          >
            Info@nigeriapulse.com
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Methodology</a>
          <a href="mailto:Info@nigeriapulse.com" className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <span className="text-[10px] font-mono tracking-widest text-slate-500">SYSTEM STATUS: OPTIMAL</span>
          <p className="text-[10px] font-medium uppercase tracking-widest">
            &copy; {currentYear} Nigeria Pulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
