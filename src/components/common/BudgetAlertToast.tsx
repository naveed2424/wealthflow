import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  BellRing, 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Volume2, 
  VolumeX,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';

interface BudgetAlertToastProps {
  income: number;
  needsSpent: number;
  currencySymbol: string;
  onAuditSpending: () => void;
  onNavigateToGauge?: () => void;
}

export const BudgetAlertToast: React.FC<BudgetAlertToastProps> = ({
  income,
  needsSpent,
  currencySymbol,
  onAuditSpending,
  onNavigateToGauge,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const needsLimit = income * 0.5;
  const isOverBudget = income > 0 && needsSpent > needsLimit;
  const overAmount = Math.max(0, needsSpent - needsLimit);
  const needsPercent = income > 0 ? Math.round((needsSpent / income) * 100) : 0;

  // Gentle Web Audio API synthesizer chime (no external mp3 files needed)
  const playAlertChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // High-register golden alert chime (two tones: 587Hz -> 880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);
    } catch (e) {
      // Audio context may require prior user interaction
    }
  };

  // Trigger alert when threshold is crossed
  useEffect(() => {
    if (isOverBudget) {
      setIsDismissed(false);
      if (soundEnabled) {
        playAlertChime();
      }

      // Check browser notification permission
      if ('Notification' in window && Notification.permission === 'granted' && pushEnabled) {
        try {
          new Notification('⚠️ 50% Needs Budget Alert (WealthFlow)', {
            body: `You have spent ${currencySymbol}${needsSpent.toLocaleString()} (${needsPercent}% of income) on Essential Needs, exceeding your 50% limit by ${currencySymbol}${overAmount.toLocaleString()}.`,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [needsSpent, income, isOverBudget]);

  const handleRequestPush = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        new Notification('WealthFlow AI Budget Alert Active', {
          body: 'You will receive push warnings whenever Essential Needs exceed 50%.',
        });
      } else {
        alert('Push notifications were blocked in your browser settings.');
      }
    } else {
      alert('Your browser does not support native push notifications.');
    }
  };

  if (!isOverBudget || isDismissed) return null;

  // Minimized floating amber badge
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-[#090d16] border-2 border-amber-400 text-amber-300 px-3.5 py-2 rounded-2xl shadow-xl shadow-amber-500/30 hover:scale-105 transition glow-gold"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black">Needs: {needsPercent}% (Over 50%)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120e03] via-[#090d16] to-[#04060b] border-2 border-amber-400/90 p-5 shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-xl">
        {/* Amber glowing background pulse */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header row */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/40 shrink-0 animate-bounce">
              <BellRing className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                  Budget Breach Warning
                </span>
                <span className="text-[10px] font-mono text-amber-300/90 font-bold">
                  Rule 50/30/20
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-1">
                50% Essential Needs Exceeded
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-amber-300 p-1.5 rounded-xl hover:bg-slate-900 transition"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-900 transition text-xs font-bold"
              title="Minimize alert to pill"
            >
              _
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-900 transition"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Numbers & Breakdown Bar */}
        <div className="relative z-10 mt-3 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Current Needs Outflow:</span>
            <span className="text-amber-400 font-black text-sm">
              {currencySymbol}{needsSpent.toLocaleString()} <span className="text-xs text-amber-300 font-bold">({needsPercent}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">50% Maximum Safe Target:</span>
            <span className="text-slate-300 font-bold font-mono">
              {currencySymbol}{needsLimit.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Over Budget Threshold:
            </span>
            <span className="text-rose-400 font-black">
              +{currencySymbol}{overAmount.toLocaleString()}
            </span>
          </div>

          {/* Visual high-impact amber bar */}
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 mt-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500 shadow-sm shadow-amber-400/50"
              style={{ width: `${Math.min(100, (needsSpent / (needsLimit || 1)) * 50)}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-3 flex items-center gap-2">
          <button
            onClick={onAuditSpending}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            Audit with AI
          </button>

          {onNavigateToGauge && (
            <button
              onClick={onNavigateToGauge}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              View Gauge
            </button>
          )}

          {!pushEnabled && 'Notification' in window && (
            <button
              onClick={handleRequestPush}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800 transition text-xs font-semibold"
              title="Enable native browser push notifications"
            >
              <BellRing className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
