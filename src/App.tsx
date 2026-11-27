/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  PieChart, 
  PiggyBank, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  DollarSign,
  Award,
  Flame,
  Clock,
  Building2,
  Lock,
  Zap
} from 'lucide-react';

import { BlogPost } from './types/blog';
import { AIAdvisorInsight, Transaction } from './types/finance';
import { BLOG_CATEGORIES } from './data/categories';
import { INITIAL_BLOG_POSTS } from './data/initialArticles';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { CookieBanner } from './components/CookieBanner';
import { BlogCard } from './components/blog/BlogCard';
import { ArticleView } from './components/blog/ArticleView';
import { GeneratePostModal } from './components/blog/GeneratePostModal';
import { SEOScorecardModal } from './components/blog/SEOScorecardModal';
import { BudgetTracker } from './components/tracker/BudgetTracker';
import { SavingsSimulator } from './components/tracker/SavingsSimulator';
import { DebtPayoffCalculator } from './components/tracker/DebtPayoffCalculator';
import { SavingsGoals } from './components/tracker/SavingsGoals';
import { DailyLifeExpenseTools } from './components/tracker/DailyLifeExpenseTools';
import { AIAdvisorModal } from './components/tracker/AIAdvisorModal';
import { StaticPages } from './components/pages/StaticPages';
import { MoneyFlowAnimation } from './components/animation/MoneyFlowAnimation';
import { BudgetAlertToast } from './components/common/BudgetAlertToast';

export default function App() {
  const [articles, setArticles] = useState<BlogPost[]>(() => {
    const newestFirstDefaults = [...INITIAL_BLOG_POSTS].reverse();
    const saved = localStorage.getItem('finai_articles');
    if (saved) {
      try {
        const parsed: BlogPost[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(p => p.id));
        const missingDefaults = newestFirstDefaults.filter(p => !existingIds.has(p.id));
        const merged = [...missingDefaults, ...parsed];
        if (missingDefaults.length > 0) {
          localStorage.setItem('finai_articles', JSON.stringify(merged));
        }
        return merged;
      } catch (e) {
        console.error(e);
      }
    }
    return newestFirstDefaults;
  });

  const initialParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTabParam = initialParams?.get('tab');
  const initialArticleSlug = initialParams?.get('article');

  const [activeTab, setActiveTab] = useState<'blog' | 'daily-tools' | 'tracker' | 'simulator' | 'savings-goals' | 'debt-payoff' | 'static'>(() => {
    if (
      initialTabParam === 'tracker' ||
      initialTabParam === 'simulator' ||
      initialTabParam === 'savings-goals' ||
      initialTabParam === 'debt-payoff' ||
      initialTabParam === 'daily-tools'
    ) {
      return initialTabParam;
    }
    if (initialTabParam === 'about' || initialTabParam === 'privacy' || initialTabParam === 'terms' || initialTabParam === 'disclaimer' || initialTabParam === 'contact') {
      return 'static';
    }
    return 'blog';
  });
  const [staticPage, setStaticPage] = useState<'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact'>(() => {
    if (initialTabParam === 'privacy' || initialTabParam === 'terms' || initialTabParam === 'disclaimer' || initialTabParam === 'contact') {
      return initialTabParam;
    }
    return 'about';
  });
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [adSenseEnabled, setAdSenseEnabled] = useState<boolean>(true);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState<boolean>(true);

  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(() => {
    if (!initialArticleSlug) return null;
    const newestFirstDefaults = [...INITIAL_BLOG_POSTS].reverse();
    return newestFirstDefaults.find(p => p.slug === initialArticleSlug || p.id === initialArticleSlug) || null;
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);
  const [seoScorecardArticle, setSeoScorecardArticle] = useState<BlogPost | null>(null);
  const [aiAdvisorInsight, setAiAdvisorInsight] = useState<AIAdvisorInsight | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  // Global transactions state for app-wide budget breach alerts
  const [globalTransactions, setGlobalTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finai_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const globalIncome = 4500; // Baseline monthly income
  const globalNeedsSpent = globalTransactions.filter(t => t.ruleType === 'Needs').reduce((a, b) => a + b.amount, 0);

  // Sync articles to local storage
  const handleSaveArticle = (newArticle: BlogPost) => {
    const updated = [newArticle, ...articles];
    setArticles(updated);
    localStorage.setItem('finai_articles', JSON.stringify(updated));
    setSelectedArticle(newArticle);
    setActiveTab('blog');
  };

  // Helper to navigate from internal paths or tool spotlights
  const navigateInternalPath = (path: string) => {
    if (path === '/tracker') {
      setActiveTab('tracker');
      setSelectedArticle(null);
    } else if (path === '/savings-simulator') {
      setActiveTab('simulator');
      setSelectedArticle(null);
    } else if (path === '/savings-goals') {
      setActiveTab('savings-goals');
      setSelectedArticle(null);
    } else if (path === '/debt-payoff') {
      setActiveTab('debt-payoff');
      setSelectedArticle(null);
    } else if (path === '/daily-tools') {
      setActiveTab('daily-tools');
      setSelectedArticle(null);
    } else if (path === '/about') {
      setStaticPage('about');
      setActiveTab('static');
      setSelectedArticle(null);
    } else if (path === '/contact') {
      setStaticPage('contact');
      setActiveTab('static');
      setSelectedArticle(null);
    } else if (path.startsWith('/article/')) {
      const slugPart = path.replace('/article/', '');
      const matchedPost = articles.find(a => a.slug === slugPart || a.id === slugPart);
      if (matchedPost) {
        setSelectedArticle(matchedPost);
        setActiveTab('blog');
      }
    } else if (path.includes('/category/')) {
      const catPart = path.split('/category/')[1];
      const matched = BLOG_CATEGORIES.find(c => c.slug === catPart);
      if (matched) setSelectedCategoryFilter(matched.name);
      setActiveTab('blog');
      setSelectedArticle(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // AI Spending audit trigger
  const handleTriggerAIAdvisor = async (data: { income: number; expenses: Transaction[]; savingsGoal: number }) => {
    setIsAdvisorLoading(true);
    setAdvisorError(null);
    try {
      const res = await fetch('/api/analyze-spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: data.income,
          expenses: data.expenses,
          savingsGoal: data.savingsGoal,
          currency: currencySymbol,
        }),
      });
      const result = await res.json();
      if (result.success && result.analysis) {
        setAiAdvisorInsight(result.analysis);
        setIsAdvisorModalOpen(true);
      } else {
        setAdvisorError(result.error || 'Failed to analyze spending. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setAdvisorError('Could not connect to the Spending Advisor service. Please try again.');
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Filtered articles
  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategoryFilter === 'all' || art.category === selectedCategoryFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.primaryKeyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles[0] || articles[0];
  const regularArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAboutUs={() => {
          setStaticPage('about');
          setActiveTab('static');
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPublisherPortal={() => setIsPublisherModalOpen(true)}
        currencySymbol={currencySymbol}
        onChangeCurrency={setCurrencySymbol}
        adSenseEnabled={adSenseEnabled}
        onToggleAdSense={() => setAdSenseEnabled(prev => !prev)}
        onSelectCategory={(categoryName) => {
          setSelectedCategoryFilter(categoryName);
          setActiveTab('blog');
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* App-Wide 50% Needs Budget Alert Toast (Amber/Gold Warning System) */}
      {activeTab !== 'tracker' && (
        <BudgetAlertToast
          income={globalIncome}
          needsSpent={globalNeedsSpent}
          currencySymbol={currencySymbol}
          onAuditSpending={() => handleTriggerAIAdvisor({ income: globalIncome, expenses: globalTransactions, savingsGoal: 900 })}
          onNavigateToGauge={() => {
            setActiveTab('tracker');
            setTimeout(() => {
              const el = document.getElementById('gauge-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
        />
      )}

      <main className="flex-1">
        {advisorError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3">
              <span>{advisorError}</span>
              <button onClick={() => setAdvisorError(null)} className="text-rose-300 hover:text-white font-bold">
                Dismiss
              </button>
            </div>
          </div>
        )}
        {/* TAB 1: Static Trust & Policy Pages */}
        {activeTab === 'static' && (
          <StaticPages
            page={staticPage}
            onBack={() => setActiveTab('blog')}
          />
        )}

        {/* TAB 2: Daily Life Expense Audits */}
        {activeTab === 'daily-tools' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <MoneyFlowAnimation currencySymbol={currencySymbol} />
            <DailyLifeExpenseTools currencySymbol={currencySymbol} />
            <AdBanner format="leaderboard" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />
          </div>
        )}

        {/* TAB 3: Budget Tracker (50/30/20) */}
        {activeTab === 'tracker' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {showMoneyAnimation && (
              <div className="mb-4">
                <MoneyFlowAnimation currencySymbol={currencySymbol} />
              </div>
            )}

            <BudgetTracker
              currencySymbol={currencySymbol}
              onTriggerAIAdvisor={handleTriggerAIAdvisor}
              isAdvisorLoading={isAdvisorLoading}
              advisorResult={aiAdvisorInsight}
            />
            <AdBanner format="leaderboard" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />
          </div>
        )}

        {/* TAB 4: Compound Savings Simulator */}
        {activeTab === 'simulator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <SavingsSimulator currencySymbol={currencySymbol} />
            <AdBanner format="leaderboard" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />
          </div>
        )}

        {/* TAB 4B: Debt Payoff Calculator (Snowball & Avalanche) */}
        {activeTab === 'debt-payoff' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <DebtPayoffCalculator currencySymbol={currencySymbol} />
            <AdBanner format="leaderboard" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />
          </div>
        )}

        {/* TAB 4C: Savings Goals & Deadline Milestones */}
        {activeTab === 'savings-goals' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <SavingsGoals currencySymbol={currencySymbol} />
            <AdBanner format="leaderboard" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />
          </div>
        )}

        {/* TAB 5: Blog Portal / Single Article View */}
        {activeTab === 'blog' && (
          <>
            {selectedArticle ? (
              <ArticleView
                post={selectedArticle}
                onBack={() => setSelectedArticle(null)}
                onNavigateInternal={navigateInternalPath}
                onOpenSEOScorecard={(post) => setSeoScorecardArticle(post)}
                adSenseEnabled={adSenseEnabled}
              />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Live Editorial FinTech & AI Tools Ticker */}
                <div className="flex items-center gap-3 overflow-x-auto py-2.5 px-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-xs text-slate-300 shadow-md">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0 shadow-sm">
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    US Google Trends Live
                  </span>
                  <span className="text-amber-300 font-bold shrink-0">
                    📉 Market: Nvidia Capex Reckoning &amp; S&amp;P 500 Bifurcation
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold shrink-0">
                    💰 Saving: Build a 2027 Cash Fortress &amp; Save $3,400/yr on Leaks
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 shrink-0">
                    ₿ Crypto Future: $5B RWA Token Supercycle &amp; Spot ETF Flows
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-semibold shrink-0">
                    🤖 AI Agent Wallets &amp; GENIUS Act Stablecoin Rails
                  </span>
                </div>

                {/* Hero Editorial Showcase: Highlighting the In-Depth Blog Articles */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Lead Featured Investigation (7 cols) */}
                  {featuredArticle && (
                    <div 
                      onClick={() => setSelectedArticle(featuredArticle)}
                      className="lg:col-span-7 cursor-pointer group rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-amber-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                      <div>
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            Lead Analysis
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-amber-500/30">
                            {featuredArticle.category}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {featuredArticle.readTime}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-400 transition-colors leading-tight mb-3">
                          {featuredArticle.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                          {featuredArticle.metaDescription}
                        </p>

                        {/* Image Preview */}
                        <div className="relative rounded-2xl overflow-hidden h-52 sm:h-64 mb-6 border border-slate-800">
                          <img
                            src={featuredArticle.featuredImage.url}
                            alt={featuredArticle.featuredImage.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 text-[11px] text-slate-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md font-mono">
                            {featuredArticle.featuredImage.caption}
                          </div>
                        </div>
                      </div>

                      {/* Author & Action */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={featuredArticle.author.avatar}
                            alt={featuredArticle.author.name}
                            className="w-8 h-8 rounded-full object-cover border border-amber-400/50"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                              {featuredArticle.author.name}
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div className="text-[10px] text-amber-400/90">{featuredArticle.author.role}</div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
                          Read Investigation
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Trending In-Depth Investigations (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Trending Personal Finance Guides
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Editorial Desk</span>
                    </div>

                    {regularArticles.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedArticle(post)}
                        className="cursor-pointer group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl flex-1"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                            <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded">
                              {post.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {post.readTime}
                            </span>
                            <span className="ml-auto text-[10px] font-mono text-emerald-400 font-bold">
                              Research Guide
                            </span>
                          </div>

                          <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-base leading-snug line-clamp-2 mb-2">
                            {post.title}
                          </h3>

                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                            {post.metaDescription}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">{post.author.name}</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Read Guide <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Quick Link Card to Tools */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-950 border border-amber-500/20 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">Interactive Budget & Milestones</div>
                        <div className="text-[11px] text-slate-400">Track 50/30/20 & celebrate savings goals</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('tracker')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shrink-0"
                      >
                        Launch Tracker
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tool Spotlight Banner */}
                <AdBanner format="leaderboard" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />

                {/* 6 Official Category Pills */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                        Browse by Category (6 Core Disciplines)
                      </h2>
                    </div>
                    {selectedCategoryFilter !== 'all' && (
                      <button
                        onClick={() => setSelectedCategoryFilter('all')}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {BLOG_CATEGORIES.map(cat => {
                      const isSelected = selectedCategoryFilter === cat.name;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : cat.name)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-950/80 border-amber-400 text-white shadow-lg shadow-amber-950/50 scale-[1.02]'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-2 h-2 rounded-full mb-2"
                            style={{ backgroundColor: cat.accentColor }}
                          />
                          <div className="text-xs font-bold line-clamp-1">{cat.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {cat.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Stats Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search articles, keywords, or topics..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      Showing <strong className="text-white">{filteredArticles.length}</strong> published guides
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Source-Cited Research
                    </span>
                  </div>
                </div>

                {/* Featured Lead Article */}
                {featuredArticle && (
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Featured In-Depth Guide
                    </div>
                    <BlogCard
                      post={featuredArticle}
                      onSelect={setSelectedArticle}
                      featured={true}
                    />
                  </div>
                )}

                {/* Grid of Articles */}
                {regularArticles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-black text-white mb-6">
                      Latest Published Articles &amp; Guides
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularArticles.map(post => (
                        <BlogCard
                          key={post.id}
                          post={post}
                          onSelect={setSelectedArticle}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* In-feed Resource Spotlight */}
                <AdBanner format="in-article" enabled={adSenseEnabled} onNavigate={navigateInternalPath} />

                {/* Interactive Tools Teaser Card */}
                <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-[#050811] to-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Hands-On Financial Software
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      Ready to Put the Articles into Practice?
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-xl">
                      Audit your everyday micro-spending with the Coffee Factor calculator, or test your household cashflow with our interactive 50/30/20 budget ledger.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setActiveTab('daily-tools')}
                      className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
                    >
                      Audit Daily Life
                    </button>
                    <button
                      onClick={() => setActiveTab('savings-goals')}
                      className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition"
                    >
                      Savings Goals
                    </button>
                    <button
                      onClick={() => setActiveTab('debt-payoff')}
                      className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-xs transition"
                    >
                      Debt Payoff Calculator
                    </button>
                    <button
                      onClick={() => setActiveTab('tracker')}
                      className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs transition"
                    >
                      Open Budget Tracker
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Owner-Only Publisher Modal (Requires PIN / Auth) */}
      <GeneratePostModal
        isOpen={isPublisherModalOpen}
        onClose={() => setIsPublisherModalOpen(false)}
        onPostGenerated={handleSaveArticle}
      />

      <SEOScorecardModal
        post={seoScorecardArticle}
        onClose={() => setSeoScorecardArticle(null)}
      />

      <AIAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
        insight={aiAdvisorInsight}
        currencySymbol={currencySymbol}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner
        onNavigateToPrivacy={() => {
          setActiveTab('static');
          setStaticPage('privacy');
        }}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(name) => {
          setSelectedCategoryFilter(name);
          setActiveTab('blog');
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenStaticPage={(page) => {
          setStaticPage(page);
          setActiveTab('static');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPublisherPortal={() => setIsPublisherModalOpen(true)}
      />
    </div>
  );
}
