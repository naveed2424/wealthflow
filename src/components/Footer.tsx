import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Sparkles, Lock, Flame, CheckCircle2 } from 'lucide-react';
import { BLOG_CATEGORIES } from '../data/categories';

interface FooterProps {
  onSelectCategory: (name: string) => void;
  onOpenStaticPage: (page: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact') => void;
  onNavigateToTab: (tab: 'tracker' | 'simulator' | 'savings-goals' | 'debt-payoff' | 'blog' | 'daily-tools') => void;
  onOpenPublisherPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenStaticPage,
  onNavigateToTab,
  onOpenPublisherPortal,
}) => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-[#020408] border-t border-amber-500/20 mt-20 text-slate-400 text-xs">
      {/* Newsletter Bar */}
      <div className="border-b border-amber-500/10 bg-[#050811] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              WealthFlow Intelligence Dispatch
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Get Personal Finance &amp; Smart Money Research Updates</h3>
            <p className="text-slate-400 text-xs mt-1">Weekly guides on 50/30/20 budgeting, automated savings, debt elimination, and macro literacy.</p>
          </div>
          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Subscribed! Watch your inbox for WealthFlow AI updates.
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); setSubscribed(true); }}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email..."
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 w-full md:w-64"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shrink-0 transition shadow-lg shadow-amber-500/20"
              >
                Subscribe Free
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black">
                <TrendingUp className="w-4 h-4 text-slate-950 font-black" />
              </div>
              <span className="text-base font-black text-white">
                WealthFlow <span className="text-amber-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering households to conquer everyday life expenses, defeat lifestyle inflation, and simulate compound wealth through interactive financial tools and verified AI research.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-mono">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Independent Financial Education
            </div>
          </div>

          {/* 6 Official Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Topic Domains (6 Categories)</h4>
            <ul className="space-y-2">
              {BLOG_CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.name)}
                    className="hover:text-amber-400 transition text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Calculators & Tools */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Everyday Money Tools</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateToTab('daily-tools')} className="hover:text-amber-400 transition text-left flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Daily Expense & "Coffee Factor"
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToTab('tracker')} className="hover:text-amber-400 transition text-left">
                  50/30/20 Budget Gauge
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToTab('simulator')} className="hover:text-amber-400 transition text-left">
                  Compound Interest Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToTab('savings-goals')} className="hover:text-emerald-400 transition text-left">
                  Savings Goals &amp; Deadlines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToTab('debt-payoff')} className="hover:text-amber-400 transition text-left">
                  Debt Payoff Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToTab('daily-tools')} className="hover:text-amber-400 transition text-left">
                  True Hourly Wage Cost
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToTab('daily-tools')} className="hover:text-amber-400 transition text-left">
                  Subscription Vampire Killer
                </button>
              </li>
            </ul>
          </div>

          {/* Editorial & Trust Center */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Editorial &amp; Trust Center</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onOpenStaticPage('about')} className="hover:text-amber-400 transition text-left">
                  About Us &amp; Editorial Standards
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStaticPage('privacy')} className="hover:text-amber-400 transition text-left">
                  Privacy Policy &amp; Cookies
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event('wealthflow-open-cookie-settings'))}
                  className="hover:text-emerald-400 transition text-left"
                >
                  Cookie Preferences
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStaticPage('terms')} className="hover:text-amber-400 transition text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStaticPage('disclaimer')} className="hover:text-amber-400 transition text-left">
                  Financial &amp; Editorial Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStaticPage('contact')} className="hover:text-amber-400 transition text-left">
                  Contact &amp; Editorial Desk
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenPublisherPortal}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-amber-300 font-bold bg-amber-950/40 border border-amber-500/20 px-2 py-1 rounded"
                >
                  <Lock className="w-3 h-3" />
                  Owner / Publisher Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer footer banner */}
        <div className="pt-8 border-t border-slate-900 text-[11px] text-slate-500 space-y-2">
          <p>
            <strong>Disclaimer:</strong> WealthFlow AI is an educational and informational media publication. Content published here is for informational purposes only and does not constitute certified financial, tax, or investment advice. Always consult a licensed fiduciary advisor before executing large investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <div>
              © 2026 WealthFlow AI – Daily Expense Tracker &amp; Smart Money Tools. Contact: <a href="mailto:Afzal460@gmail.com" className="text-slate-400 hover:text-emerald-400 underline">Afzal460@gmail.com</a>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              Editorial Standards &amp; Privacy First
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
