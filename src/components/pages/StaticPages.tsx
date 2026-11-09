import React from 'react';
import { Shield, FileText, AlertTriangle, Users, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

interface StaticPagesProps {
  page: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact';
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium mb-6 group transition"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to FinAI Portal
      </button>

      {page === 'about' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-200">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">About FinAI Wealth Portal</h1>
          </div>
          <p className="text-base text-slate-300 leading-relaxed mb-6">
            FinAI Wealth & Smart Budgeting Portal was founded with a single mission: to democratize financial security by pairing battle-tested personal finance principles (like the 50/30/20 budget and compound investing) with autonomous artificial intelligence.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">Our Editorial & Journalistic Standards</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Our daily research and deep-dive articles are produced by seasoned financial analysts, certified planners, and FinTech software engineers. Every guide adheres to strict journalistic rigor:
          </p>
          <ul className="space-y-2 text-sm text-slate-300 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Fact-Checking:</strong> Every statistic is cross-referenced with primary sources (Federal Reserve, CFPB, academic institutions, and audited corporate filings).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Pay-for-Play:</strong> Software recommendations and AI tool reviews are evaluated on user utility, zero-knowledge privacy, and fee transparency.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Practical Actionability:</strong> Every article includes clear takeaways, FAQs, and interactive calculators so readers can implement strategies immediately.</span>
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">Our Core Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                alt="Dr. Sarah Sterling"
                className="w-14 h-14 rounded-full object-cover border border-emerald-500/30"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Dr. Sarah Sterling, CFA</h4>
                <p className="text-xs text-emerald-400">Chief FinTech Strategist</p>
                <p className="text-xs text-slate-400 mt-1">Former quantitative macro researcher; focuses on autonomous cashflow agents.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Marcus Vance"
                className="w-14 h-14 rounded-full object-cover border border-amber-500/30"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Marcus Vance, M.Sc.</h4>
                <p className="text-xs text-amber-400">Behavioral Data Lead</p>
                <p className="text-xs text-slate-400 mt-1">Specializes in loss aversion psychology, micro-saving apps, and frugal tech.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Privacy Policy & Cookie Disclosure</h1>
          </div>
          <p className="text-xs text-slate-400 mb-6">Last updated: November 2026. Compliant with GDPR, CCPA, and Google AdSense Policies.</p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed mb-4">
            FinAI Wealth values your privacy above all else. Financial inputs (such as income, expense logs, and savings targets entered in the Budget Tracker) are stored locally in your browser session and are never transmitted to external third-party advertisers. When using our AI Spending Advisor, data is sent securely to our server-side inference pipeline solely to generate your requested advice and is not retained for profiling.
          </p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">2. Google AdSense & Third-Party Advertising</h2>
          <p className="text-sm leading-relaxed mb-4">
            We use Google AdSense to serve ads when you visit our website. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
            Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">Google Ads Settings</a>.
          </p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">3. Cookies & Local Storage</h2>
          <p className="text-sm leading-relaxed mb-4">
            We use browser LocalStorage to remember your budget items, saved articles, and cookie consent status. You can clear your browser storage at any time to remove all saved financial data.
          </p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">4. Contacting Data Protection</h2>
          <p className="text-sm leading-relaxed">
            If you have questions about our privacy practices, please contact us at <span className="text-emerald-400 font-mono">privacy@finaiwealth.org</span>.
          </p>
        </div>
      )}

      {page === 'terms' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          </div>
          <p className="text-xs text-slate-400 mb-6">Effective Date: November 8, 2026</p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed mb-4">
            By accessing FinAI Wealth & Smart Budgeting Portal, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue use of the site immediately.
          </p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">2. Informational & Educational Use Only</h2>
          <p className="text-sm leading-relaxed mb-4">
            All content, calculations, projections, and AI-generated articles provided by FinAI Wealth are strictly for educational and informational purposes. They do not constitute certified financial, legal, or investment advice.
          </p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">3. Intellectual Property</h2>
          <p className="text-sm leading-relaxed mb-4">
            Our original software calculators, visual design, and written content are protected by copyright and intellectual property laws. You may quote or reference articles with proper attribution and a reciprocal link back to the original URL.
          </p>
        </div>
      )}

      {page === 'disclaimer' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300">
          <div className="flex items-center gap-3 text-amber-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Financial & Affiliate Disclaimer</h1>
          </div>
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-sm mb-6 leading-relaxed">
            <strong>Important Notice:</strong> FinAI Wealth is an educational technology publisher, not a registered investment advisor, broker-dealer, or certified financial planner.
          </div>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">No Professional Financial Advice</h2>
          <p className="text-sm leading-relaxed mb-4">
            Past performance is no guarantee of future results. Compound interest projections generated in our Savings Simulator are mathematical models based on constant annual percentage yields and do not account for inflation, individual tax brackets, market volatility, or unexpected macroeconomic disruptions. Always consult a qualified fiduciary or tax professional before making significant investment commitments.
          </p>

          <h2 className="text-lg font-bold text-white mt-6 mb-2">Affiliate & Sponsorship Disclosure</h2>
          <p className="text-sm leading-relaxed mb-4">
            In compliance with FTC guidelines: Some links on this website may be affiliate links. If you click on an affiliate link and open an account or purchase a subscription, FinAI Wealth may receive a referral compensation at zero additional cost to you. This compensation helps fund our independent research and maintain free access to our financial software.
          </p>
        </div>
      )}

      {page === 'contact' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-slate-300">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <Mail className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white">Contact & Editorial Inquiries</h1>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Have a story lead, question about an AI budgeting tool, or editorial correction? Our team responds within 24 to 48 hours.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been received by the FinAI editorial desk.'); }} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Type</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500">
                <option>Editorial Feedback / Topic Suggestion</option>
                <option>AI Tool Review Request</option>
                <option>Advertising & Sponsorship</option>
                <option>Technical Support</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
              <textarea
                rows={4}
                required
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
        </div>
      )}
    </div>
  );
};
