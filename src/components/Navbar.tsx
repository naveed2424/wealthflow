import React, { useState } from 'react';
import { 
  Sparkles, 
  PieChart, 
  PiggyBank, 
  BookOpen, 
  ChevronDown, 
  DollarSign, 
  Sliders, 
  Menu, 
  X,
  Layers,
  ShieldCheck, 
  TrendingUp,
  Lock,
  Flame,
  Zap
} from 'lucide-react';
import { BLOG_CATEGORIES } from '../data/categories';

interface NavbarProps {
  currentTab: 'tracker' | 'simulator' | 'blog' | 'daily-tools' | 'static';
  onSelectTab: (tab: 'tracker' | 'simulator' | 'blog' | 'daily-tools') => void;
  onOpenPublisherPortal: () => void;
  currencySymbol: string;
  onChangeCurrency: (symbol: string) => void;
  adSenseEnabled: boolean;
  onToggleAdSense: () => void;
  onSelectCategory: (categoryName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPublisherPortal,
  currencySymbol,
  onChangeCurrency,
  adSenseEnabled,
  onToggleAdSense,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const currencies = [
    { label: 'USD ($)', symbol: '$' },
    { label: 'EUR (€)', symbol: '€' },
    { label: 'GBP (£)', symbol: '£' },
    { label: 'CAD (C$)', symbol: 'C$' },
    { label: 'AUD (A$)', symbol: 'A$' },
    { label: 'INR (₹)', symbol: '₹' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-amber-500/20 transition-all shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo with Black & Gold Theme */}
          <div
            onClick={() => onSelectTab('blog')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform border border-amber-300">
              <TrendingUp className="w-5 h-5 text-slate-950 font-black stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                WealthFlow <span className="text-amber-400">AI</span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase block">
                Daily Expense & Money Tools
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('daily-tools')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'daily-tools'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Daily Expense Audits
            </button>

            <button
              onClick={() => onSelectTab('tracker')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'tracker'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <PieChart className="w-4 h-4 text-amber-400" />
              50/30/20 Budget
            </button>

            <button
              onClick={() => onSelectTab('simulator')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'simulator'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              Savings Simulator
            </button>

            <button
              onClick={() => onSelectTab('blog')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'blog'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              AI Tools Blog
            </button>

            {/* 6 Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/60 transition flex items-center gap-1"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                6 Categories
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {categoriesDropdownOpen && (
                <div
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-72 bg-slate-950 border border-amber-500/30 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="text-[10px] uppercase font-bold text-amber-400/80 px-3 py-1.5">
                    Explore Topic Domains
                  </div>
                  {BLOG_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.name);
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition text-xs flex flex-col group"
                    >
                      <span className="font-bold text-white group-hover:text-amber-400">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {cat.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right utility buttons: Currency, AdSense Preview Toggle, Discreet Publisher Portal */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Currency selector */}
            <select
              value={currencySymbol}
              onChange={e => onChangeCurrency(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
              title="Select Currency"
            >
              {currencies.map(c => (
                <option key={c.symbol} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* AdSense Preview Layout Toggle */}
            <button
              onClick={onToggleAdSense}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                adSenseEnabled
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle Google AdSense responsive slots to audit ad placement and monetization compliance"
            >
              <span className={`w-2 h-2 rounded-full ${adSenseEnabled ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
              AdSense: {adSenseEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Secure Author & Publisher Desk (Only for the site owner) */}
            <button
              onClick={onOpenPublisherPortal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition hover:border-amber-400 shadow-sm"
              title="Author & Publisher Portal (Restricted to site owner)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Publisher Desk
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenPublisherPortal}
              className="flex items-center gap-1 bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl"
            >
              <Lock className="w-3.5 h-3.5" />
              Publisher
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => { onSelectTab('daily-tools'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'daily-tools' ? 'bg-amber-950/60 text-amber-300' : 'text-slate-300'
              }`}
            >
              Daily Expense Audits
            </button>
            <button
              onClick={() => { onSelectTab('tracker'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'tracker' ? 'bg-amber-950/60 text-amber-300' : 'text-slate-300'
              }`}
            >
              Budget Tracker (50/30/20)
            </button>
            <button
              onClick={() => { onSelectTab('simulator'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'simulator' ? 'bg-amber-950/60 text-amber-300' : 'text-slate-300'
              }`}
            >
              Compound Savings Simulator
            </button>
            <button
              onClick={() => { onSelectTab('blog'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'blog' ? 'bg-amber-950/60 text-amber-300' : 'text-slate-300'
              }`}
            >
              AI Tools Blog
            </button>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
              <span className="text-xs text-slate-400">AdSense Preview</span>
              <button
                onClick={onToggleAdSense}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-amber-500/30 font-bold"
              >
                {adSenseEnabled ? 'Units Enabled' : 'Units Hidden'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
