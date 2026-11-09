import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  PiggyBank, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SavingsSimulatorProps {
  currencySymbol: string;
}

export const SavingsSimulator: React.FC<SavingsSimulatorProps> = ({ currencySymbol }) => {
  const [initialDeposit, setInitialDeposit] = useState<number>(2000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(450);
  const [interestRate, setInterestRate] = useState<number>(7.0); // 7% standard index return
  const [years, setYears] = useState<number>(10);
  const [targetGoal, setTargetGoal] = useState<number>(100000);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Yearly compounding calculations
  const projectionData = useMemo(() => {
    const list = [];
    const monthlyRate = interestRate / 100 / 12;
    let currentBalance = initialDeposit;
    let totalContributed = initialDeposit;

    for (let yr = 1; yr <= years; yr++) {
      for (let m = 0; m < 12; m++) {
        currentBalance = currentBalance * (1 + monthlyRate) + monthlyContribution;
        totalContributed += monthlyContribution;
      }
      const totalInterest = Math.max(0, currentBalance - totalContributed);
      list.push({
        year: yr,
        totalBalance: Math.round(currentBalance),
        totalContributed: Math.round(totalContributed),
        totalInterest: Math.round(totalInterest),
      });
    }
    return list;
  }, [initialDeposit, monthlyContribution, interestRate, years]);

  const finalYear = projectionData[projectionData.length - 1] || {
    totalBalance: 0,
    totalContributed: 0,
    totalInterest: 0,
  };

  const isGoalReached = finalYear.totalBalance >= targetGoal;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase mb-3">
              <PiggyBank className="w-3.5 h-3.5" />
              Exponential Compound Interest Simulator
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Grow Wealth Faster: The Math of Intentional Saving
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Witness the power of automated compounding: see how modest monthly contributions combined with smart high-yield returns snowball into transformative financial independence.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-right shrink-0">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projected Net Worth in {years} Years</span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
              {currencySymbol}{finalYear.totalBalance.toLocaleString()}
            </div>
            <div className="text-xs text-amber-400 font-medium mt-1">
              +{currencySymbol}{finalYear.totalInterest.toLocaleString()} in pure compound interest
            </div>
          </div>
        </div>
      </div>

      {/* Goal Target Selector Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Financial Independence Milestones</span>
            <h3 className="text-base font-bold text-white mt-0.5">Select a Wealth Goal to Target:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Emergency Fund ($10k)', value: 10000 },
              { label: 'Home Deposit ($50k)', value: 50000 },
              { label: 'Six-Figure Club ($100k)', value: 100000 },
              { label: 'Financial Freedom ($250k)', value: 250000 },
            ].map(g => (
              <button
                key={g.value}
                onClick={() => {
                  setTargetGoal(g.value);
                  if (finalYear.totalBalance >= g.value) triggerConfetti();
                }}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition ${
                  targetGoal === g.value
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300">
              Progress to {currencySymbol}{targetGoal.toLocaleString()}:
            </span>
            <span className="font-bold text-white">
              {((finalYear.totalBalance / targetGoal) * 100).toFixed(0)}%
              {isGoalReached && ' 🎉 Goal Exceeded!'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isGoalReached ? 'bg-gradient-to-r from-emerald-400 to-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, (finalYear.totalBalance / targetGoal) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & SVG Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Simulator Parameters
          </h2>

          {/* Initial Deposit Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Starting Balance</span>
              <span className="text-white font-bold">{currencySymbol}{initialDeposit.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={initialDeposit}
              onChange={e => setInitialDeposit(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{currencySymbol}0</span>
              <span>{currencySymbol}50,000</span>
            </div>
          </div>

          {/* Monthly Contribution Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Monthly Contribution</span>
              <span className="text-emerald-400 font-bold">{currencySymbol}{monthlyContribution.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="25"
              max="5000"
              step="25"
              value={monthlyContribution}
              onChange={e => setMonthlyContribution(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{currencySymbol}25/mo</span>
              <span>{currencySymbol}5,000/mo</span>
            </div>
          </div>

          {/* Expected Annual Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Expected Annual Return (APY)</span>
              <span className="text-amber-400 font-bold">{interestRate}% APY</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={interestRate}
              onChange={e => setInterestRate(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => setInterestRate(4.8)}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${interestRate === 4.8 ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                HYSA (4.8%)
              </button>
              <button
                onClick={() => setInterestRate(7.0)}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${interestRate === 7.0 ? 'bg-emerald-400/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                Balanced Index (7.0%)
              </button>
              <button
                onClick={() => setInterestRate(10.0)}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${interestRate === 10.0 ? 'bg-blue-400/20 text-blue-300 border-blue-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                S&P 500 Historical (10.0%)
              </button>
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Time Horizon</span>
              <span className="text-white font-bold">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={e => setYears(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">The 72 Rule:</strong> At a <strong>{interestRate}%</strong> return, your money doubles approximately every <strong>{(72 / interestRate).toFixed(1)} years</strong> purely from compounding growth.
          </div>
        </div>

        {/* Visual Chart & Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Compounding Trajectory Curve</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  Principal Deposited
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  Interest Earned
                </span>
              </div>
            </div>

            {/* Interactive Visual SVG Chart */}
            <div className="h-64 w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex items-end gap-1 relative overflow-hidden">
              {projectionData.map((pt, i) => {
                const maxVal = finalYear.totalBalance || 1;
                const totalHeightPct = (pt.totalBalance / maxVal) * 100;
                const depositHeightPct = (pt.totalContributed / maxVal) * 100;
                const interestHeightPct = Math.max(0, totalHeightPct - depositHeightPct);

                return (
                  <div
                    key={pt.year}
                    className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 z-20 pointer-events-none bg-slate-900 text-white text-[10px] p-2 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap">
                      <div className="font-bold">Year {pt.year}</div>
                      <div>Total: {currencySymbol}{pt.totalBalance.toLocaleString()}</div>
                      <div className="text-emerald-400">Interest: +{currencySymbol}{pt.totalInterest.toLocaleString()}</div>
                    </div>

                    {/* Interest segment (top) */}
                    <div
                      className="w-full bg-emerald-400 group-hover:bg-emerald-300 transition-all rounded-t-sm"
                      style={{ height: `${interestHeightPct}%` }}
                    />
                    {/* Principal segment (bottom) */}
                    <div
                      className="w-full bg-blue-600/80 group-hover:bg-blue-500 transition-all"
                      style={{ height: `${depositHeightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>Year 1</span>
              <span>Year {Math.round(years / 2)}</span>
              <span>Year {years}</span>
            </div>
          </div>

          {/* Breakdown Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Your Direct Contributions</span>
              <div className="text-xl font-bold text-white mt-1">
                {currencySymbol}{finalYear.totalContributed.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">
                {finalYear.totalBalance > 0 ? ((finalYear.totalContributed / finalYear.totalBalance) * 100).toFixed(0) : 0}% of ending balance
              </span>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/20 p-4 rounded-2xl">
              <span className="text-xs text-emerald-400 font-medium">Compound Interest "Free Money"</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                +{currencySymbol}{finalYear.totalInterest.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400/80">
                {finalYear.totalBalance > 0 ? ((finalYear.totalInterest / finalYear.totalBalance) * 100).toFixed(0) : 0}% created out of thin air
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-white mb-1">Year-by-Year Growth Table</h3>
        <p className="text-xs text-slate-400 mb-4">Milestone checkpoints across your timeline</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Timeline</th>
                <th className="pb-3 font-semibold">Total Contributions</th>
                <th className="pb-3 font-semibold">Compound Interest</th>
                <th className="pb-3 font-semibold text-right">Ending Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {projectionData.filter((_, idx) => (idx + 1) % 2 === 0 || idx === 0 || idx === projectionData.length - 1).map(item => (
                <tr key={item.year} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 font-semibold text-white">Year {item.year}</td>
                  <td className="py-3 text-slate-300">{currencySymbol}{item.totalContributed.toLocaleString()}</td>
                  <td className="py-3 text-emerald-400 font-medium">+{currencySymbol}{item.totalInterest.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-white text-sm">
                    {currencySymbol}{item.totalBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
