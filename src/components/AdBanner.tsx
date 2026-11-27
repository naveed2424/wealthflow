import React from 'react';
import { ArrowRight, Calculator, PiggyBank, ShieldCheck, Target } from 'lucide-react';

interface AdBannerProps {
  format: 'leaderboard' | 'rectangle' | 'in-article' | 'sidebar';
  className?: string;
  enabled?: boolean;
  onNavigate?: (path: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format,
  className = '',
  enabled = true,
  onNavigate,
}) => {
  if (!enabled) return null;

  const handleAction = (e: React.MouseEvent, tabPath: string, queryTab: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(tabPath);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/?tab=${queryTab}`;
    }
  };

  return (
    <aside
      aria-label="WealthFlow AI Interactive Tool Spotlight"
      className={`my-6 rounded-2xl border border-slate-800 bg-slate-900/75 p-4 transition-all ${className}`}
    >
      {format === 'leaderboard' && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 hidden sm:flex">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                Free Interactive Financial Suite
              </span>
              <h4 className="text-sm font-bold text-white">
                Turn Insights Into Action With the Savings Goals &amp; Debt Payoff Planners
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Attach real deadlines to savings milestones or model Debt Avalanche vs. Snowball payoff timelines locally in your browser.
              </p>
            </div>
          </div>
          <a
            href="/?tab=savings-goals"
            onClick={(e) => handleAction(e, '/savings-goals', 'savings-goals')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 rounded-xl transition shrink-0"
          >
            Open Savings Goals
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {format === 'in-article' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 hidden sm:flex">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                Interactive 50/30/20 Cashflow Audit
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100">
                Compare Your Monthly Needs, Wants &amp; Savings Distribution
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Privacy-first browser ledger—no external bank credentials required.
              </p>
            </div>
          </div>
          <a
            href="/?tab=tracker"
            onClick={(e) => handleAction(e, '/tracker', 'tracker')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-4 py-2.5 rounded-xl transition shrink-0"
          >
            Open Budget Tracker
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {format === 'sidebar' && (
        <div className="text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Daily Expense Leak Finder
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Quantify recurring coffee, delivery, and subscription costs over 5–20 years in seconds.
          </p>
          <a
            href="/?tab=daily-tools"
            onClick={(e) => handleAction(e, '/daily-tools', 'daily-tools')}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 py-2 rounded-xl transition"
          >
            Launch Daily Audits
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {format === 'rectangle' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 hidden sm:flex">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Debt-Free &amp; Compounding Math
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">
                Calculate your exact debt-free calendar date or simulate 10-year index growth.
              </p>
            </div>
          </div>
          <a
            href="/?tab=debt-payoff"
            onClick={(e) => handleAction(e, '/debt-payoff', 'debt-payoff')}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl transition shrink-0"
          >
            Debt Payoff Calculator
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </aside>
  );
};
