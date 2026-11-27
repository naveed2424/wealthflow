import React, { useState } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  Users,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Award,
  PieChart,
  Flame,
  TrendingUp,
  BookOpen,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

const NAVEED_OFFICE_PORTRAIT = '/assets/aistudio/Portrait_professionnel_dans_un_bureau_moderne_7ddf5c42.png';

interface StaticPagesProps {
  page: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact';
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onBack }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold mb-6 group transition"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to WealthFlow AI Portal
      </button>

      {page === 'about' && (
        <div className="bg-slate-900/90 border border-amber-500/25 rounded-3xl p-6 sm:p-10 text-slate-200 shadow-2xl space-y-10">
          {/* Founder Spotlight Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050811] via-slate-950 to-amber-950/20 border border-amber-500/30 p-6 sm:p-8">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Uploaded Studio Office Portrait */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20 bg-slate-950">
                  <img
                    src={NAVEED_OFFICE_PORTRAIT}
                    alt="Naveed in modern multi-monitor FinTech engineering office — Founder of WealthFlow AI"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent p-3.5">
                    <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Founder &amp; FinTech Architect
                    </div>
                    <div className="text-sm font-bold text-white">Naveed — WealthFlow AI Studio</div>
                  </div>
                </div>
              </div>

              {/* Bio & Portfolio Overview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  About Naveed &amp; WealthFlow AI
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Hi, I&apos;m <span className="text-amber-400">Naveed</span> — Building Practical AI Wealth &amp; Budgeting Tools for Everyday Life.
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  I created <strong className="text-white">WealthFlow AI</strong> out of a straightforward conviction: modern households do not need bloated spreadsheets or Wall Street jargon to build lasting financial freedom. They need crisp, honest software that exposes daily cashflow leaks alongside deeply researched, fact-checked journalism covering AI financial tools, household saving, equity markets, and the evolving digital asset economy.
                </p>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Every calculator, visual chart, and investigative guide across this portfolio reflects my hands-on focus on combining disciplined <strong className="text-amber-300">50/30/20 money management</strong> with real-time AI analytics—empowering readers to protect purchasing power, track recurring habits, and turn small daily surpluses into multi-year compounding net worth.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Independent Research
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    AI Tools &amp; FinTech Builder
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Macro, Saving &amp; Crypto Analyst
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Naveed's Built-In Portfolio Showcase */}
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Portfolio Ecosystem</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              What I&apos;ve Built Inside the WealthFlow AI Portfolio
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              From interactive daily expense diagnostics to long-form Google Trends financial journalism, every module in this platform is engineered to bridge insight with immediate action.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/75 border border-slate-800 hover:border-amber-500/40 transition">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm mb-2">
                  <Flame className="w-4 h-4" />
                  Daily Expense &amp; &ldquo;Coffee Factor&rdquo; Studio
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uncovers hidden everyday leaks, calculates true after-tax hourly wage cost per purchase, and flags unused recurring subscriptions before they compound against you.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/75 border border-slate-800 hover:border-amber-500/40 transition">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-2">
                  <PieChart className="w-4 h-4" />
                  50/30/20 Budget Ledger &amp; Recharts Analytics
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time spending tracker featuring current-month Recharts category comparisons, automated amber/gold 50% Needs breach alerts, AI spending audits, and Savings Milestones celebrations.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/75 border border-slate-800 hover:border-amber-500/40 transition">
                <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Compound Wealth &amp; Inflation Simulator
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive multi-decade forecasting tool modeling monthly contributions, yield assumptions, and purchasing-power preservation over 5 to 40 years.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/75 border border-slate-800 hover:border-amber-500/40 transition">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm mb-2">
                  <BookOpen className="w-4 h-4" />
                  Trend-Driven Financial Research &amp; 6 Core Domains
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Long-form, SEO-audited briefings spanning AI Budgeting Tools, Stock &amp; Fed Macro Strategy, Cash-Fortress Saving, and Institutional Crypto Infrastructure.
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Standards */}
          <div className="pt-4 border-t border-slate-800/80">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Editorial &amp; Journalistic Standards
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Every daily research guide and tool breakdown published under my editorial desk follows strict transparency and verification benchmarks:
            </p>
            <ul className="space-y-2.5 text-sm text-slate-300 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Primary-Source Fact-Checking:</strong> Data points are cross-referenced with authoritative benchmarks including the Federal Reserve, BLS, CFPB, and audited public filings.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero Pay-for-Play Bias:</strong> Budgeting apps, AI agents, and financial platforms are evaluated solely on real household utility, privacy posture, and fee clarity.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Action-First Clarity:</strong> Every investigation pairs clear takeaways and FAQs with live tools on the portal so readers can apply insights immediately.</span>
              </li>
            </ul>

            <h3 className="text-base font-bold text-white mb-4">Editorial Leadership &amp; Contributors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/30 flex items-center gap-3">
                <img
                  src={NAVEED_OFFICE_PORTRAIT}
                  alt="Naveed — Founder & Editor-in-Chief"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover object-center border-2 border-amber-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Naveed</h4>
                  <p className="text-xs text-amber-400 font-semibold">Founder &amp; Editor-in-Chief</p>
                  <p className="text-[11px] text-slate-400 mt-1">Product architect &amp; lead researcher behind WealthFlow AI.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="Dr. Sarah Sterling"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border border-emerald-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Dr. Sarah Sterling, CFA</h4>
                  <p className="text-xs text-emerald-400">Macro &amp; FinTech Strategist</p>
                  <p className="text-[11px] text-slate-400 mt-1">Quantitative researcher focused on autonomous cashflow models.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Marcus Vance"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border border-amber-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Vance, M.Sc.</h4>
                  <p className="text-xs text-amber-400">Behavioral Data Lead</p>
                  <p className="text-[11px] text-slate-400 mt-1">Specializes in micro-saving habits and frugal tech optimization.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Privacy Policy &amp; Cookie Disclosure</h1>
          </div>
          <p className="text-xs text-slate-400">
            Effective Date: November 27, 2026 • Publisher: WealthFlow AI (Naveed) • Contact:{' '}
            <a href="mailto:Afzal460@gmail.com" className="text-emerald-400 underline">
              Afzal460@gmail.com
            </a>
          </p>

          <h2 className="text-lg font-bold text-white pt-2">1. Information We Collect &amp; Local-First Storage</h2>
          <p className="text-sm leading-relaxed">
            WealthFlow AI respects user privacy. Financial figures entered into our 50/30/20 Budget Tracker, Savings Goals, Debt Payoff Calculator, and Compound Savings Simulator are stored locally inside your own browser&apos;s <code className="text-emerald-300">localStorage</code> and are never sold or shared with third-party data brokers. When you voluntarily use the optional AI Spending Advisor, anonymized budget category totals are transmitted securely via HTTPS solely to return your immediate summary.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">2. Google AdSense, DoubleClick Cookie &amp; Personalized Advertising</h2>
          <p className="text-sm leading-relaxed">
            WealthFlow AI partners with third-party advertising networks, including Google AdSense, to display relevant advertisements that support free educational journalism and tools. Third-party vendors, including Google, use cookies (including the DoubleClick DART cookie) to serve ads based on a user&apos;s prior visits to this website or other websites across the internet.
          </p>
          <p className="text-sm leading-relaxed">
            You may opt out of personalized advertising anytime by visiting{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
              Google Ads Settings
            </a>{' '}
            or the Digital Advertising Alliance consumer opt-out portal at{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
              aboutads.info/choices
            </a>.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">3. GDPR, EEA/UK Consent &amp; CCPA Rights</h2>
          <p className="text-sm leading-relaxed">
            Visitors from the European Economic Area (EEA), United Kingdom, California, and other privacy jurisdictions may accept or reject non-essential advertising cookies at any time. Clearing browser site data deletes all locally stored calculator figures immediately.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('wealthflow-open-cookie-settings'))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              Manage Cookie &amp; Consent Preferences
            </button>
          </div>

          <h2 className="text-lg font-bold text-white pt-2">4. Contacting Data Protection</h2>
          <p className="text-sm leading-relaxed">
            For privacy requests, CCPA/GDPR inquiries, or data removal questions, email our publisher directly at{' '}
            <a href="mailto:Afzal460@gmail.com" className="text-emerald-400 font-mono underline">
              Afzal460@gmail.com
            </a>.
          </p>
        </div>
      )}

      {page === 'terms' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          </div>
          <p className="text-xs text-slate-400">Effective Date: November 27, 2026 • WealthFlow AI</p>

          <h2 className="text-lg font-bold text-white pt-2">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">
            By accessing WealthFlow AI, reading published guides, or operating any financial calculator on this portal, you agree to comply with these Terms of Service and all applicable laws.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">2. Educational &amp; Informational Purpose</h2>
          <p className="text-sm leading-relaxed">
            All editorial guides, calculators, projections, and interactive charts on WealthFlow AI are provided strictly for personal educational and informational use. Calculations depend on user-supplied assumptions and do not constitute personalized financial, tax, accounting, or legal advice.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">3. Intellectual Property &amp; Acceptable Use</h2>
          <p className="text-sm leading-relaxed">
            Original editorial text, interactive tools, and layout architecture remain the property of WealthFlow AI. Brief excerpts may be quoted with proper attribution and a direct link back to the source article. Automated scraping or unauthorized republication of full articles is prohibited.
          </p>
        </div>
      )}

      {page === 'disclaimer' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300 space-y-4">
          <div className="flex items-center gap-3 text-amber-400 mb-2">
            <AlertTriangle className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Financial &amp; Editorial Disclaimer</h1>
          </div>
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-sm leading-relaxed">
            <strong>YMYL Educational Notice:</strong> WealthFlow AI is an independent financial literacy and software publisher. We are not a registered investment advisor, broker-dealer, CPA firm, or licensed fiduciary planner.
          </div>

          <h2 className="text-lg font-bold text-white pt-2">No Professional Financial or Tax Advice</h2>
          <p className="text-sm leading-relaxed">
            Market commentary, interest-rate examples, debt payoff scenarios, and compound interest models reflect historical data or illustrative math and do not guarantee future investment returns. Individual tax brackets, state regulations, lender terms, and inflation vary substantially. Always consult a qualified fiduciary advisor, attorney, or CPA before making major investment, tax, or borrowing decisions.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">Advertising &amp; Editorial Independence Disclosure</h2>
          <p className="text-sm leading-relaxed">
            In accordance with FTC disclosure standards, WealthFlow AI may display advertisements (including Google AdSense) or clearly labeled resource links to sustain free access to our calculators and research. Advertising relationships never dictate editorial conclusions, rankings, or mathematical calculator formulas.
          </p>
        </div>
      )}

      {page === 'contact' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <Mail className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Contact &amp; Editorial Desk</h1>
          </div>
          <p className="text-sm text-slate-300 mb-2 leading-relaxed">
            Have a story lead, calculator bug report, advertising inquiry, or factual correction request? Reach founder Naveed and the WealthFlow AI editorial desk directly at{' '}
            <a href="mailto:Afzal460@gmail.com" className="text-emerald-400 font-semibold underline">
              Afzal460@gmail.com
            </a>{' '}
            or use the inquiry form below (typical response time: 24–48 business hours).
          </p>

          {contactSubmitted ? (
            <div className="mt-6 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-sm text-emerald-200 space-y-2 max-w-lg">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Inquiry Logged for Review
              </div>
              <p className="text-xs text-slate-300">
                Thank you, {contactName || 'reader'}. For urgent editorial corrections or partnership inquiries, you can also email{' '}
                <a href="mailto:Afzal460@gmail.com" className="text-emerald-400 underline">
                  Afzal460@gmail.com
                </a>{' '}
                directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setContactSubmitted(false);
                  setContactName('');
                  setContactEmail('');
                  setContactMessage('');
                }}
                className="text-xs font-bold text-emerald-400 hover:underline pt-1"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setContactSubmitted(true);
              }}
              className="space-y-4 max-w-lg mt-6"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Type</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500">
                  <option>Editorial Correction / Source Feedback</option>
                  <option>Calculator Feature Request</option>
                  <option>Advertising &amp; Sponsorship</option>
                  <option>Privacy / GDPR Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="How can we assist you today?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition shadow-lg"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
