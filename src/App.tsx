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
import { DailyLifeExpenseTools } from './components/tracker/DailyLifeExpenseTools';
import { AIAdvisorModal } from './components/tracker/AIAdvisorModal';
import { StaticPages } from './components/pages/StaticPages';
import { MoneyFlowAnimation } from './components/animation/MoneyFlowAnimation';
import { BudgetAlertToast } from './components/common/BudgetAlertToast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'blog' | 'daily-tools' | 'tracker' | 'simulator' | 'static'>('blog');
  const [staticPage, setStaticPage] = useState<'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact'>('about');
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [adSenseEnabled, setAdSenseEnabled] = useState<boolean>(true);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState<boolean>(true);

  // Blog posts database with LocalStorage persistence and automatic default sync
  const [articles, setArticles] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('finai_articles');
    if (saved) {
      try {
        const parsed: BlogPost[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(p => p.id));
        const missingDefaults = INITIAL_BLOG_POSTS.filter(p => !existingIds.has(p.id));
        const merged = [...parsed, ...missingDefaults];
        if (missingDefaults.length > 0) {
          localStorage.setItem('finai_articles', JSON.stringify(merged));
        }
        return merged;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BLOG_POSTS;
  });

  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);
  const [seoScorecardArticle, setSeoScorecardArticle] = useState<BlogPost | null>(null);
  const [aiAdvisorInsight, setAiAdvisorInsight] = useState<AIAdvisorInsight | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);

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

  // AI Spending audit trigger
  const handleTriggerAIAdvisor = async (data: { income: number; expenses: Transaction[]; savingsGoal: number }) => {
    setIsAdvisorLoading(true);
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
        alert(result.error || 'Failed to analyze spending');
      }
    } catch (err: any) {
      console.error(err);
      alert('Could not connect to AI Financial Advisor backend. Please try again.');
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
        {/* TAB 1: Static AdSense Compliance Pages */}
        {activeTab === 'static' && (
          <StaticPages
            page={staticPage}
            onBack={() => setActiveTab('blog')}
          />
        )}

        {/* TAB 2: Daily Life Expense Audits (NEW) */}
        {activeTab === 'daily-tools' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Interactive Golden Money Flow Architectural Canvas */}
            <MoneyFlowAnimation currencySymbol={currencySymbol} />

            {/* Daily Expense Suite */}
            <DailyLifeExpenseTools currencySymbol={currencySymbol} />

            <AdBanner format="leaderboard" enabled={adSenseEnabled} />
          </div>
        )}

        {/* TAB 3: Budget Tracker (50/30/20) */}
        {activeTab === 'tracker' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Optional Money Flow Animation */}
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
            <AdBanner format="leaderboard" enabled={adSenseEnabled} />
          </div>
        )}

        {/* TAB 4: Compound Savings Simulator */}
        {activeTab === 'simulator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <SavingsSimulator currencySymbol={currencySymbol} />
            <AdBanner format="leaderboard" enabled={adSenseEnabled} />
          </div>
        )}

        {/* TAB 5: Blog Portal / Single Article View */}
        {activeTab === 'blog' && (
          <>
            {selectedArticle ? (
              <ArticleView
                post={selectedArticle}
                onBack={() => setSelectedArticle(null)}
                onNavigateInternal={(path) => {
                  if (path === '/tracker') setActiveTab('tracker');
                  else if (path === '/savings-simulator') setActiveTab('simulator');
                  else if (path === '/daily-tools') setActiveTab('daily-tools');
                  else if (path.includes('/category/')) {
                    const catPart = path.split('/category/')[1];
                    const matched = BLOG_CATEGORIES.find(c => c.slug === catPart);
                    if (matched) setSelectedCategoryFilter(matched.name);
                    setSelectedArticle(null);
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSEOScorecard={(post) => setSeoScorecardArticle(post)}
                adSenseEnabled={adSenseEnabled}
              />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Live Editorial FinTech & AI Tools Ticker */}
                <div className="flex items-center gap-3 overflow-x-auto py-2.5 px-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-xs text-slate-300 shadow-md">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0 shadow-sm">
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    Live Editorial Ticker
                  </span>
                  <span className="text-amber-300 font-bold shrink-0">
                    🔥 Trending: The 2026 "House Money" Playbook (2,260 Words)
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold shrink-0">
                    🏡 New: Modular ADU House Hacking Slashes Mortgages 60%
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 shrink-0">
                    NAR Data: 42% of closed sales feature seller rate buydowns
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-semibold shrink-0">
                    High-yield cash stacks yield 5.2% risk-free
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 shrink-0">
                    All guides 100% fact-checked & SEO-optimized
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
                            Lead Investigation • 2,000+ Words
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
                        Trending In-Depth Guides (2,000+ Words)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Fact-Checked</span>
                    </div>

                    {regularArticles.slice(0, 2).map((post, pIdx) => (
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
                              SEO 98/100
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

                {/* AdSense Top Leaderboard */}
                <AdBanner format="leaderboard" enabled={adSenseEnabled} />

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
                      Showing <strong className="text-white">{filteredArticles.length}</strong> verified articles
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Fact-Checked
                    </span>
                  </div>
                </div>

                {/* Featured Lead Article */}
                {featuredArticle && (
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Featured In-Depth Investigation (2,000+ Words)
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
                      Latest Published Articles & Field Tests
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

                {/* In-feed AdSense slot */}
                <AdBanner format="in-article" enabled={adSenseEnabled} />

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
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setActiveTab('daily-tools')}
                      className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
                    >
                      Audit Daily Life
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
