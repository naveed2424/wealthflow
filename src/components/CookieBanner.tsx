import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';

interface CookieBannerProps {
  onNavigateToPrivacy?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToPrivacy }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('finai_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('finai_cookie_consent', 'accepted');
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem('finai_cookie_consent', 'essential_only');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cookie & AdSense Consent
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            We use essential cookies and personalized advertising cookies to provide budgeting tools and support high-quality financial journalism.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-lg transition"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              Essential Only
            </button>
            {onNavigateToPrivacy && (
              <button
                onClick={onNavigateToPrivacy}
                className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-2 ml-auto"
              >
                Privacy Policy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
