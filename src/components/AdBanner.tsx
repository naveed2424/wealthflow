import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface AdBannerProps {
  format: 'leaderboard' | 'rectangle' | 'in-article' | 'sidebar';
  className?: string;
  enabled?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ format, className = '', enabled = true }) => {
  if (!enabled) return null;

  return (
    <div className={`my-6 rounded-xl border border-dashed border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950 p-3 text-center transition-all ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-amber-400/80 mb-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Sponsored / Advertisement
        </span>
        <span className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">
          <Info className="w-3 h-3" />
          AdChoices
        </span>
      </div>

      {format === 'leaderboard' && (
        <div className="py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 rounded-lg border border-slate-800">
          <div className="text-left">
            <span className="inline-block text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded mb-1">
              High-Yield Cash 5.25% APY
            </span>
            <h4 className="text-sm font-semibold text-white">Automate Your Emergency Reserve with WealthFront AI</h4>
            <p className="text-xs text-slate-400">FDIC-insured up to $8M through partner banks. Zero account fees.</p>
          </div>
          <a
            href="https://www.google.com/adsense/start/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-lg transition-all shadow-md shrink-0"
          >
            Explore Rates
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {format === 'in-article' && (
        <div className="py-5 px-6 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 rounded-lg border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Featured FinTech Partner</div>
            <h4 className="text-base font-bold text-slate-100">Supercharge Your 50/30/20 Budget with AI Auto-Categorization</h4>
            <p className="text-xs text-slate-400 mt-1">Connect your cards securely and stop spending 4 hours a month on manual spreadsheets.</p>
          </div>
          <button className="text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 rounded-lg transition shadow-lg shrink-0">
            Start Free 30-Day Trial
          </button>
        </div>
      )}

      {format === 'sidebar' && (
        <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-800 text-left">
          <div className="w-full h-32 rounded-md bg-gradient-to-tr from-emerald-600/30 to-amber-500/30 flex items-center justify-center border border-slate-700/50 mb-3">
            <div className="text-center p-2">
              <span className="text-2xl font-black text-amber-400">$1,200/yr</span>
              <p className="text-[11px] text-slate-300">Average savings recovered from zombie subscriptions</p>
            </div>
          </div>
          <h4 className="text-xs font-bold text-white mb-1">Rocket Money AI Engine</h4>
          <p className="text-[11px] text-slate-400 mb-3">Scan and cancel unused recurring charges with 1-tap automated concierge.</p>
          <button className="w-full text-center text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 py-1.5 rounded transition border border-slate-700">
            Audit Subscriptions
          </button>
        </div>
      )}

      {format === 'rectangle' && (
        <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[10px] text-amber-400 font-semibold uppercase">Smart Investing</span>
            <p className="text-xs text-slate-200 font-medium">Earn up to 10 free fractional shares upon depositing $100.</p>
          </div>
          <button className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1.5 rounded hover:bg-amber-300 shrink-0">
            Claim Offer
          </button>
        </div>
      )}
    </div>
  );
};
