import React from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';

interface GoalProgressBarProps {
  label?: string;
  currentAmount: number;
  targetAmount: number;
  currencySymbol: string;
  accentColor?: string;
  showCheckpoints?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  label,
  currentAmount,
  targetAmount,
  currencySymbol,
  accentColor = '#10b981',
  showCheckpoints = true,
  size = 'md',
}) => {
  const safeTarget = targetAmount > 0 ? targetAmount : 1;
  const rawPercent = (currentAmount / safeTarget) * 100;
  const clampedPercent = Math.min(100, Math.max(0, rawPercent));
  const displayPercent = Math.round(rawPercent);
  const remaining = Math.max(0, targetAmount - currentAmount);
  const isComplete = currentAmount >= targetAmount && targetAmount > 0;

  const heightClass =
    size === 'sm' ? 'h-2.5' : size === 'lg' ? 'h-5' : 'h-4';

  const barGradient = isComplete
    ? 'linear-gradient(90deg, #10b981 0%, #fbbf24 100%)'
    : `linear-gradient(90deg, ${accentColor}cc 0%, ${accentColor} 100%)`;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-300">{label}</span>
          <span className={`font-black ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
            {displayPercent}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-label={label || 'Savings goal progress'}
        aria-valuenow={Math.min(100, Math.max(0, Math.round(rawPercent)))}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`relative w-full ${heightClass} bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner`}
      >
        {/* Subtle 25 / 50 / 75 guide ticks inside track */}
        {showCheckpoints && (
          <>
            <span
              className="pointer-events-none absolute top-0 bottom-0 left-1/4 w-px bg-slate-800/80 z-10"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-slate-800/80 z-10"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute top-0 bottom-0 left-3/4 w-px bg-slate-800/80 z-10"
              aria-hidden="true"
            />
          </>
        )}

        <div
          className="h-full rounded-full transition-all duration-700 ease-out shadow-sm relative z-0"
          style={{
            width: `${clampedPercent}%`,
            background: barGradient,
            boxShadow: `0 0 12px ${isComplete ? '#10b98166' : `${accentColor}55`}`,
          }}
        />
      </div>

      {/* Checkpoint Labels */}
      {showCheckpoints && (
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
          <span className={rawPercent >= 25 ? 'text-amber-400 font-bold' : ''}>25%</span>
          <span className={rawPercent >= 50 ? 'text-amber-400 font-bold' : ''}>50%</span>
          <span className={rawPercent >= 75 ? 'text-amber-400 font-bold' : ''}>75%</span>
          <span className={`inline-flex items-center gap-1 ${isComplete ? 'text-emerald-400 font-bold' : ''}`}>
            {isComplete && <Trophy className="w-3 h-3" />}
            100%
          </span>
        </div>
      )}

      {/* Remaining Status Caption */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
        {isComplete ? (
          <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Goal Funded ({currencySymbol}
            {currentAmount.toLocaleString()} saved)
          </span>
        ) : (
          <span>
            <strong className="text-slate-200">
              {currencySymbol}
              {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </strong>{' '}
            remaining to target
          </span>
        )}
        <span className="font-mono text-[10px] text-slate-500">
          {displayPercent}% complete
        </span>
      </div>
    </div>
  );
};
