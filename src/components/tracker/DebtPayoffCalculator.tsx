import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  Flame,
  Snowflake,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export type PayoffStrategy = 'avalanche' | 'snowball';

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

interface DebtPayoffResultAccount {
  id: string;
  name: string;
  startingBalance: number;
  apr: number;
  minPayment: number;
  payoffMonth: number;
  payoffDateLabel: string;
  totalInterestPaid: number;
  orderIndex: number;
}

interface MonthlyScheduleRow {
  month: number;
  dateLabel: string;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  paidOffNames: string[];
}

interface SimulationSummary {
  strategy: PayoffStrategy | 'minimum';
  months: number;
  debtFreeDateLabel: string;
  totalInterest: number;
  totalPaid: number;
  unpayableWarning: boolean;
  accounts: DebtPayoffResultAccount[];
  schedule: MonthlyScheduleRow[];
}

interface CombinedChartPoint {
  month: number;
  dateLabel: string;
  avalancheBalance: number;
  snowballBalance: number;
  minimumBalance: number;
  avalancheInterest: number;
  snowballInterest: number;
}

interface DebtPayoffCalculatorProps {
  currencySymbol: string;
}

const DEFAULT_DEBTS: DebtItem[] = [
  { id: 'debt-1', name: 'Retail Store / BNPL Card', balance: 1620, apr: 28.5, minPayment: 65 },
  { id: 'debt-2', name: 'Rewards Credit Card', balance: 4850, apr: 24.99, minPayment: 145 },
  { id: 'debt-3', name: 'Auto Loan', balance: 12400, apr: 6.49, minPayment: 310 },
  { id: 'debt-4', name: 'Student Loan', balance: 9200, apr: 4.75, minPayment: 115 },
];

const STORAGE_DEBTS_KEY = 'finai_debts_v1';
const STORAGE_CAPACITY_KEY = 'finai_debt_capacity_v1';

const formatCalendarMonth = (monthsAhead: number): string => {
  const base = new Date();
  const target = new Date(base.getFullYear(), base.getMonth() + monthsAhead, 1);
  return target.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatCompactMonth = (monthsAhead: number): string => {
  const base = new Date();
  const target = new Date(base.getFullYear(), base.getMonth() + monthsAhead, 1);
  const mon = target.toLocaleDateString('en-US', { month: 'short' });
  const yr = String(target.getFullYear()).slice(-2);
  return `${mon} '${yr}`;
};

function runDebtSimulation(
  debts: DebtItem[],
  monthlyBudget: number,
  strategy: PayoffStrategy | 'minimum',
  lumpSumWindfall: number
): SimulationSummary {
  const activeDebts = debts.filter(d => d.balance > 0);
  if (activeDebts.length === 0) {
    return {
      strategy,
      months: 0,
      debtFreeDateLabel: formatCalendarMonth(0),
      totalInterest: 0,
      totalPaid: 0,
      unpayableWarning: false,
      accounts: [],
      schedule: [],
    };
  }

  // Sort priority order for extra cascade cash
  const sortOrder = (a: { apr: number; balance: number }, b: { apr: number; balance: number }) => {
    if (strategy === 'avalanche') {
      if (b.apr !== a.apr) return b.apr - a.apr;
      return a.balance - b.balance;
    }
    if (strategy === 'snowball') {
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.apr - a.apr;
    }
    return b.apr - a.apr;
  };

  const state = activeDebts
    .map(d => ({
      id: d.id,
      name: d.name,
      startingBalance: d.balance,
      balance: d.balance,
      apr: Math.max(0, d.apr),
      minPayment: Math.max(0, d.minPayment),
      totalInterestPaid: 0,
      payoffMonth: 0,
    }))
    .sort(sortOrder);

  const schedule: MonthlyScheduleRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = 360;
  let unpayableWarning = false;

  // Apply one-time Month-0 windfall directly along priority queue before Month 1 accrual if requested
  let windfallRemaining = strategy === 'minimum' ? 0 : Math.max(0, lumpSumWindfall);
  if (windfallRemaining > 0) {
    for (const acc of state) {
      if (windfallRemaining <= 0) break;
      const applied = Math.min(acc.balance, windfallRemaining);
      acc.balance = Math.max(0, acc.balance - applied);
      windfallRemaining -= applied;
      totalPaid += applied;
      if (acc.balance <= 0.005) {
        acc.balance = 0;
        acc.payoffMonth = 1;
      }
    }
  }

  while (state.some(a => a.balance > 0.005) && month < maxMonths) {
    month += 1;
    let monthInterest = 0;
    let monthPaymentTotal = 0;
    let monthPrincipalTotal = 0;
    const paidOffNames: string[] = [];

    // 1. Accrue monthly interest on remaining balances
    for (const acc of state) {
      if (acc.balance <= 0.005) continue;
      const monthlyRate = acc.apr / 100 / 12;
      const interestCharge = acc.balance * monthlyRate;
      acc.balance += interestCharge;
      acc.totalInterestPaid += interestCharge;
      monthInterest += interestCharge;
      totalInterest += interestCharge;
    }

    // 2. Determine available payment budget this month
    const requiredMinSum = state.reduce((sum, acc) => {
      if (acc.balance <= 0.005) return sum;
      return sum + Math.min(acc.balance, acc.minPayment);
    }, 0);

    const budgetThisMonth =
      strategy === 'minimum'
        ? requiredMinSum
        : Math.max(monthlyBudget, requiredMinSum);

    let remainingCash = budgetThisMonth;

    // 3. Pay required minimums across all active debts first
    for (const acc of state) {
      if (acc.balance <= 0.005) continue;
      const minDue = Math.min(acc.balance, acc.minPayment);
      const pay = Math.min(remainingCash, minDue);
      acc.balance = Math.max(0, acc.balance - pay);
      remainingCash -= pay;
      monthPaymentTotal += pay;
      totalPaid += pay;

      if (acc.balance <= 0.005 && acc.payoffMonth === 0) {
        acc.balance = 0;
        acc.payoffMonth = month;
        paidOffNames.push(acc.name);
      }
    }

    // 4. Cascade extra capacity + freed minimums to highest-priority active debt(s)
    if (strategy !== 'minimum' && remainingCash > 0.005) {
      const priorityQueue = state.filter(a => a.balance > 0.005).sort(sortOrder);
      for (const acc of priorityQueue) {
        if (remainingCash <= 0.005) break;
        const extraPay = Math.min(acc.balance, remainingCash);
        acc.balance = Math.max(0, acc.balance - extraPay);
        remainingCash -= extraPay;
        monthPaymentTotal += extraPay;
        totalPaid += extraPay;

        if (acc.balance <= 0.005 && acc.payoffMonth === 0) {
          acc.balance = 0;
          acc.payoffMonth = month;
          paidOffNames.push(acc.name);
        }
      }
    }

    const endingBalance = state.reduce((sum, a) => sum + a.balance, 0);
    monthPrincipalTotal = Math.max(0, monthPaymentTotal - monthInterest);

    schedule.push({
      month,
      dateLabel: formatCompactMonth(month),
      payment: monthPaymentTotal,
      principalPaid: monthPrincipalTotal,
      interestPaid: monthInterest,
      remainingBalance: endingBalance,
      paidOffNames,
    });

    if (month === maxMonths && endingBalance > 1) {
      unpayableWarning = true;
    }
  }

  const orderedAccounts: DebtPayoffResultAccount[] = state
    .map((acc, idx) => ({
      id: acc.id,
      name: acc.name,
      startingBalance: acc.startingBalance,
      apr: acc.apr,
      minPayment: acc.minPayment,
      payoffMonth: acc.payoffMonth || maxMonths,
      payoffDateLabel: formatCalendarMonth(acc.payoffMonth || maxMonths),
      totalInterestPaid: acc.totalInterestPaid,
      orderIndex: idx + 1,
    }));

  return {
    strategy,
    months: month,
    debtFreeDateLabel: formatCalendarMonth(month),
    totalInterest,
    totalPaid,
    unpayableWarning,
    accounts: orderedAccounts,
    schedule,
  };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: CombinedChartPoint;
  }>;
  currencySymbol: string;
}

const TrajectoryTooltip: React.FC<ChartTooltipProps> = ({ active, payload, currencySymbol }) => {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  return (
    <div className="bg-slate-950/95 border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl min-w-[235px]">
      <div className="flex items-center justify-between gap-4 pb-1.5 mb-2 border-b border-slate-800">
        <span className="text-xs font-bold text-white">{pt.dateLabel}</span>
        <span className="text-[11px] font-mono tabular-nums text-slate-400">Month {pt.month}</span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Avalanche Balance
          </span>
          <span className="font-mono tabular-nums font-bold text-white">
            {currencySymbol}{Math.round(pt.avalancheBalance).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Snowball Balance
          </span>
          <span className="font-mono tabular-nums font-bold text-white">
            {currencySymbol}{Math.round(pt.snowballBalance).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">Minimum-Only Path</span>
          <span className="font-mono tabular-nums text-slate-300">
            {currencySymbol}{Math.round(pt.minimumBalance).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export const DebtPayoffCalculator: React.FC<DebtPayoffCalculatorProps> = ({ currencySymbol }) => {
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DEBTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback cleanly to starter dataset
    }
    return DEFAULT_DEBTS;
  });

  const minPaymentFloor = useMemo(
    () => Math.round(debts.reduce((sum, d) => sum + (d.balance > 0 ? Math.max(0, d.minPayment) : 0), 0)),
    [debts]
  );

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CAPACITY_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return 950;
  });

  const [lumpSumWindfall, setLumpSumWindfall] = useState<number>(0);
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Add new debt form state
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newApr, setNewApr] = useState('');
  const [newMin, setNewMin] = useState('');
  const [formError, setFormError] = useState('');

  // Persist user debt slate locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DEBTS_KEY, JSON.stringify(debts));
    } catch {
      // ignore quota issues
    }
  }, [debts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CAPACITY_KEY, String(monthlyBudget));
    } catch {
      // ignore quota issues
    }
  }, [monthlyBudget]);

  // Effective capacity always at least minimum floor
  const effectiveMonthlyCapacity = Math.max(monthlyBudget, minPaymentFloor);
  const extraMonthlyCascade = Math.max(0, effectiveMonthlyCapacity - minPaymentFloor);

  const totalDebtBalance = useMemo(
    () => debts.reduce((sum, d) => sum + Math.max(0, d.balance), 0),
    [debts]
  );

  const weightedAvgApr = useMemo(() => {
    if (totalDebtBalance <= 0) return 0;
    const weighted = debts.reduce((sum, d) => sum + Math.max(0, d.balance) * Math.max(0, d.apr), 0);
    return weighted / totalDebtBalance;
  }, [debts, totalDebtBalance]);

  const avalancheResult = useMemo(
    () => runDebtSimulation(debts, effectiveMonthlyCapacity, 'avalanche', lumpSumWindfall),
    [debts, effectiveMonthlyCapacity, lumpSumWindfall]
  );

  const snowballResult = useMemo(
    () => runDebtSimulation(debts, effectiveMonthlyCapacity, 'snowball', lumpSumWindfall),
    [debts, effectiveMonthlyCapacity, lumpSumWindfall]
  );

  const minimumResult = useMemo(
    () => runDebtSimulation(debts, minPaymentFloor, 'minimum', 0),
    [debts, minPaymentFloor]
  );

  const activeResult = strategy === 'avalanche' ? avalancheResult : snowballResult;
  const interestSavedVsMinimum = Math.max(0, minimumResult.totalInterest - activeResult.totalInterest);
  const monthsSavedVsMinimum = Math.max(0, minimumResult.months - activeResult.months);
  const avalancheVsSnowballInterestDiff = Math.max(0, snowballResult.totalInterest - avalancheResult.totalInterest);
  const firstWinAccount = useMemo(() => {
    if (activeResult.accounts.length === 0) return null;
    return [...activeResult.accounts].sort((a, b) => a.payoffMonth - b.payoffMonth)[0];
  }, [activeResult]);

  // Build unified Recharts trajectory dataset
  const chartData = useMemo<CombinedChartPoint[]>(() => {
    if (totalDebtBalance <= 0) return [];
    const horizon = Math.max(avalancheResult.months, snowballResult.months, Math.min(minimumResult.months, Math.max(avalancheResult.months, snowballResult.months) + 12));
    const cappedHorizon = Math.min(horizon, 180);

    const points: CombinedChartPoint[] = [
      {
        month: 0,
        dateLabel: 'Today',
        avalancheBalance: Math.max(0, totalDebtBalance - lumpSumWindfall),
        snowballBalance: Math.max(0, totalDebtBalance - lumpSumWindfall),
        minimumBalance: totalDebtBalance,
        avalancheInterest: 0,
        snowballInterest: 0,
      },
    ];

    let avCumInt = 0;
    let snCumInt = 0;
    const step = cappedHorizon > 60 ? 2 : 1;

    for (let m = 1; m <= cappedHorizon; m++) {
      const avRow = avalancheResult.schedule[m - 1];
      const snRow = snowballResult.schedule[m - 1];
      const minRow = minimumResult.schedule[m - 1];
      if (avRow) avCumInt += avRow.interestPaid;
      if (snRow) snCumInt += snRow.interestPaid;

      if (m % step === 0 || m === cappedHorizon || m === avalancheResult.months || m === snowballResult.months) {
        points.push({
          month: m,
          dateLabel: formatCompactMonth(m),
          avalancheBalance: avRow ? avRow.remainingBalance : 0,
          snowballBalance: snRow ? snRow.remainingBalance : 0,
          minimumBalance: minRow ? minRow.remainingBalance : 0,
          avalancheInterest: avCumInt,
          snowballInterest: snCumInt,
        });
      }
    }

    return points;
  }, [avalancheResult, snowballResult, minimumResult, totalDebtBalance, lumpSumWindfall]);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(newBalance);
    const aprVal = parseFloat(newApr);
    const minVal = parseFloat(newMin);

    if (!newName.trim() || Number.isNaN(bal) || bal <= 0 || Number.isNaN(aprVal) || aprVal < 0 || Number.isNaN(minVal) || minVal <= 0) {
      setFormError('Enter an account name, positive balance, non-negative APR %, and positive minimum payment.');
      return;
    }

    const nextDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      name: newName.trim(),
      balance: Math.round(bal * 100) / 100,
      apr: Math.round(aprVal * 100) / 100,
      minPayment: Math.round(minVal * 100) / 100,
    };

    const nextDebts = [...debts, nextDebt];
    const nextFloor = nextDebts.reduce((s, d) => s + d.minPayment, 0);
    setDebts(nextDebts);
    if (monthlyBudget < nextFloor) {
      setMonthlyBudget(Math.ceil(nextFloor + 150));
    }
    setNewName('');
    setNewBalance('');
    setNewApr('');
    setNewMin('');
    setFormError('');
  };

  const handleUpdateDebtField = (id: string, field: keyof Omit<DebtItem, 'id'>, raw: string) => {
    setDebts(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        if (field === 'name') return { ...item, name: raw };
        const parsed = parseFloat(raw);
        return { ...item, [field]: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed };
      })
    );
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const handleLoadSamples = () => {
    setDebts(DEFAULT_DEBTS);
    setMonthlyBudget(950);
    setLumpSumWindfall(0);
  };

  const handleClearAll = () => {
    setDebts([]);
    setMonthlyBudget(0);
    setLumpSumWindfall(0);
  };

  const triggerBoostCelebration = (addAmount: number) => {
    const nextCap = effectiveMonthlyCapacity + addAmount;
    setMonthlyBudget(nextCap);
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#fbbf24', '#10b981', '#38bdf8'],
    });
  };

  const sliderMax = Math.max(minPaymentFloor + 2500, Math.ceil((totalDebtBalance * 0.25) / 50) * 50, 1500);

  return (
    <div className="space-y-8">
      {/* Hero Summary Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-amber-500/25 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>Debt Elimination Engine</span>
              <span aria-hidden="true">·</span>
              <span>Avalanche vs. Snowball Amortization</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
              Debt Payoff Calculator &amp; Freedom Roadmap
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Enter your current balances, APR interest rates, and monthly payment capacity to compare exact payoff timelines and pick your optimal route to zero debt.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 min-w-[260px] shrink-0">
            <div className="text-xs text-slate-400 font-medium">
              Projected Debt-Free Date ({strategy === 'avalanche' ? 'Avalanche' : 'Snowball'})
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-mono tabular-nums">
              {totalDebtBalance <= 0 ? 'Debt Free!' : activeResult.debtFreeDateLabel}
            </div>
            <div className="text-xs text-amber-300 mt-1.5 font-mono tabular-nums">
              {totalDebtBalance <= 0
                ? `${currencySymbol}0 remaining balance`
                : `${activeResult.months} months · Save ${currencySymbol}${Math.round(interestSavedVsMinimum).toLocaleString()} interest`}
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Total Debt Balance</div>
            <div className="text-xl font-bold text-white mt-1 font-mono tabular-nums">
              {currencySymbol}{Math.round(totalDebtBalance).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              {debts.filter(d => d.balance > 0).length} active accounts · {weightedAvgApr.toFixed(2)}% avg APR
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Monthly Rollover Power</div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono tabular-nums">
              {currencySymbol}{effectiveMonthlyCapacity.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              {currencySymbol}{minPaymentFloor.toLocaleString()} min + {currencySymbol}{extraMonthlyCascade.toLocaleString()} extra boost
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Interest Saved vs. Minimums</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">
              {currencySymbol}{Math.round(interestSavedVsMinimum).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5 font-mono tabular-nums">
              {monthsSavedVsMinimum} months faster than minimums
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <div className="text-xs text-slate-400">First Account Eliminated</div>
            <div className="text-xl font-bold text-white mt-1 truncate">
              {firstWinAccount ? firstWinAccount.payoffDateLabel : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {firstWinAccount
                ? `${firstWinAccount.name} (Mo ${firstWinAccount.payoffMonth})`
                : 'Add a debt to begin'}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Switcher & Capacity Controls + Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          {/* Strategy Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Payoff Strategy</span>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                Avalanche saves {currencySymbol}{Math.round(avalancheVsSnowballInterestDiff).toLocaleString()} vs. Snowball
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setStrategy('avalanche')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  strategy === 'avalanche'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 shrink-0" />
                Avalanche (High APR)
              </button>
              <button
                type="button"
                onClick={() => setStrategy('snowball')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  strategy === 'snowball'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Snowflake className="w-4 h-4 shrink-0" />
                Snowball (Small Bal)
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              {strategy === 'avalanche'
                ? 'Targets your highest APR rate first—minimizing total interest charges mathematically.'
                : 'Clears your smallest balance first—freeing minimum payments rapidly for psychological momentum.'}
            </p>
          </div>

          {/* Monthly Payment Capacity */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="monthly-capacity-input" className="text-xs font-bold text-slate-300">
                Monthly Payment Capacity
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1">
                <span className="text-xs text-slate-400">{currencySymbol}</span>
                <input
                  id="monthly-capacity-input"
                  type="number"
                  min={minPaymentFloor}
                  step="25"
                  value={effectiveMonthlyCapacity}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setMonthlyBudget(Number.isNaN(val) ? minPaymentFloor : Math.max(0, val));
                  }}
                  className="w-24 bg-transparent text-right text-sm font-bold text-amber-400 font-mono tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              aria-label="Monthly Payment Capacity Slider"
              min={minPaymentFloor}
              max={sliderMax}
              step="25"
              value={Math.min(sliderMax, effectiveMonthlyCapacity)}
              onChange={e => setMonthlyBudget(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>Floor: {currencySymbol}{minPaymentFloor.toLocaleString()}</span>
              <span>Extra: +{currencySymbol}{extraMonthlyCascade.toLocaleString()}/mo</span>
              <span>{currencySymbol}{sliderMax.toLocaleString()}</span>
            </div>

            {monthlyBudget < minPaymentFloor && minPaymentFloor > 0 && (
              <div className="text-xs text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Floor adjusted to {currencySymbol}{minPaymentFloor.toLocaleString()} to cover required minimums.</span>
              </div>
            )}

            {/* Quick Accelerator Boosters */}
            <div>
              <div className="text-[11px] text-slate-400 mb-2">Test Extra Monthly Payment Boost</div>
              <div className="flex flex-wrap gap-2">
                {[100, 250, 500].map(boost => (
                  <button
                    key={boost}
                    type="button"
                    onClick={() => triggerBoostCelebration(boost)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-emerald-400 transition whitespace-nowrap"
                  >
                    +{currencySymbol}{boost}/mo
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMonthlyBudget(minPaymentFloor)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition whitespace-nowrap"
                >
                  Reset to Minimums
                </button>
              </div>
            </div>
          </div>

          {/* Optional Lump-Sum Windfall */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="windfall-input" className="text-xs font-bold text-slate-300">
                One-Time Windfall / Bonus (Optional)
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <span className="text-xs text-slate-400">{currencySymbol}</span>
                <input
                  id="windfall-input"
                  type="number"
                  min="0"
                  step="100"
                  value={lumpSumWindfall}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setLumpSumWindfall(Number.isNaN(val) || val < 0 ? 0 : val);
                  }}
                  className="w-20 bg-transparent text-right text-xs font-bold text-white font-mono tabular-nums focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Applies an immediate Month-1 lump sum (tax refund, side hustle, or bonus) directly against your priority debt.
            </p>
          </div>
        </div>

        {/* Right Visualization Column (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Balance Payoff Trajectory</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Avalanche vs. Snowball vs. Minimum-Only balance decline to zero
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                Avalanche
              </span>
              <span className="flex items-center gap-1.5 text-sky-300 font-semibold whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
                Snowball
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                Min Only
              </span>
            </div>
          </div>

          {totalDebtBalance > 0 && chartData.length > 0 ? (
            <div className="h-72 w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="avalancheFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="snowballFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="dateLabel"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    minTickGap={24}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={val => `${currencySymbol}${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                  />
                  <Tooltip content={<TrajectoryTooltip currencySymbol={currencySymbol} />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="minimumBalance"
                    name="Minimum-Only Baseline"
                    stroke="#64748b"
                    strokeDasharray="5 5"
                    strokeWidth={1.75}
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="snowballBalance"
                    name="Debt Snowball"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fill="url(#snowballFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="avalancheBalance"
                    name="Debt Avalanche"
                    stroke="#fbbf24"
                    strokeWidth={2.75}
                    fill="url(#avalancheFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div className="text-base font-bold text-white">Zero Active Debt Entered</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Add your credit cards, auto loans, or student loans below—or load sample debts to test Snowball vs. Avalanche trajectories.
              </p>
              <button
                type="button"
                onClick={handleLoadSamples}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
              >
                Load Sample Debts
              </button>
            </div>
          )}

          {/* Side-by-Side Avalanche vs. Snowball Comparison Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div
              onClick={() => setStrategy('avalanche')}
              className={`cursor-pointer rounded-2xl p-4 border transition ${
                strategy === 'avalanche'
                  ? 'bg-amber-950/30 border-amber-400/60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Avalanche Outcome
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {avalancheResult.months} mo
                </span>
              </div>
              <div className="text-lg font-black text-white mt-1.5 font-mono tabular-nums">
                {avalancheResult.debtFreeDateLabel}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                Total Interest: {currencySymbol}{Math.round(avalancheResult.totalInterest).toLocaleString()}
              </div>
            </div>

            <div
              onClick={() => setStrategy('snowball')}
              className={`cursor-pointer rounded-2xl p-4 border transition ${
                strategy === 'snowball'
                  ? 'bg-sky-950/30 border-sky-400/60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Snowflake className="w-4 h-4" />
                  Snowball Outcome
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {snowballResult.months} mo
                </span>
              </div>
              <div className="text-lg font-black text-white mt-1.5 font-mono tabular-nums">
                {snowballResult.debtFreeDateLabel}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                Total Interest: {currencySymbol}{Math.round(snowballResult.totalInterest).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debt Accounts Input Table + Add Debt Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Your Debt Portfolio &amp; Priority Payoff Order</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit any balance, APR, or minimum payment inline—calculations update immediately.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSamples}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sample Data
            </button>
            {debts.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-slate-400 hover:text-rose-300 transition whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Add Debt Inline Form */}
        <form onSubmit={handleAddDebt} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Account Name</label>
            <input
              type="text"
              placeholder="e.g. Visa Sapphire, Car Note..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Balance ({currencySymbol})</label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="3500"
              value={newBalance}
              onChange={e => setNewBalance(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono tabular-nums placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">APR (%)</label>
            <input
              type="number"
              min="0"
              max="99"
              step="0.01"
              placeholder="21.99"
              value={newApr}
              onChange={e => setNewApr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono tabular-nums placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Payment ({currencySymbol})</label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="110"
              value={newMin}
              onChange={e => setNewMin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono tabular-nums placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap h-[34px]"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Add Debt
            </button>
          </div>
          {formError && (
            <div className="sm:col-span-12 text-xs text-rose-400 flex items-center gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
        </form>

        {/* Editable Accounts + Payoff Sequence Table */}
        {debts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 pr-3 font-semibold">Priority</th>
                  <th className="pb-3 pr-3 font-semibold">Account Name</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Balance</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Interest APR</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Min Monthly</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Interest Paid</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Debt-Free Target</th>
                  <th className="pb-3 font-semibold text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {activeResult.accounts.map((acc, idx) => {
                  const pctOfTimeline = activeResult.months > 0 ? (acc.payoffMonth / activeResult.months) * 100 : 100;
                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 pr-3 font-mono tabular-nums text-amber-400 font-bold">
                        #{idx + 1}
                      </td>
                      <td className="py-3 pr-3 min-w-[160px]">
                        <input
                          type="text"
                          value={acc.name}
                          onChange={e => handleUpdateDebtField(acc.id, 'name', e.target.value)}
                          className="w-full bg-transparent text-white font-semibold border border-transparent hover:border-slate-700 focus:border-amber-500 focus:bg-slate-950 rounded-lg px-2 py-1 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1">
                          <span className="text-slate-500">{currencySymbol}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={acc.startingBalance}
                            onChange={e => handleUpdateDebtField(acc.id, 'balance', e.target.value)}
                            className="w-20 bg-transparent text-right text-white font-mono tabular-nums font-bold focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <div className="inline-flex items-center justify-end gap-0.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            step="0.01"
                            value={acc.apr}
                            onChange={e => handleUpdateDebtField(acc.id, 'apr', e.target.value)}
                            className="w-14 bg-transparent text-right text-amber-300 font-mono tabular-nums font-semibold focus:outline-none"
                          />
                          <span className="text-slate-500">%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1">
                          <span className="text-slate-500">{currencySymbol}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={acc.minPayment}
                            onChange={e => handleUpdateDebtField(acc.id, 'minPayment', e.target.value)}
                            className="w-16 bg-transparent text-right text-slate-200 font-mono tabular-nums focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-right font-mono tabular-nums text-rose-300">
                        {currencySymbol}{Math.round(acc.totalInterestPaid).toLocaleString()}
                      </td>
                      <td className="py-3 pr-3 text-right min-w-[155px]">
                        <div className="font-mono tabular-nums font-bold text-emerald-400">
                          {acc.payoffDateLabel}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${strategy === 'avalanche' ? 'bg-amber-400' : 'bg-sky-400'}`}
                              style={{ width: `${Math.min(100, Math.max(8, pctOfTimeline))}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">Mo {acc.payoffMonth}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteDebt(acc.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title={`Remove ${acc.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            No debts listed. Add your first balance above or click Sample Data to inspect an example payoff waterfall.
          </div>
        )}
      </div>

      {/* Month-by-Month Payoff Amortization Schedule */}
      {activeResult.schedule.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Monthly Payoff Schedule ({strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Milestone checkpoints and monthly principal vs. interest breakdown
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFullSchedule(prev => !prev)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-300 transition inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              {showFullSchedule ? (
                <>
                  Show Milestones Only
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View All {activeResult.schedule.length} Months
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 pr-3 font-semibold">Month</th>
                  <th className="pb-3 pr-3 font-semibold">Calendar Date</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Monthly Payment</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Principal Cleared</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Interest Cost</th>
                  <th className="pb-3 pr-3 font-semibold text-right">Remaining Balance</th>
                  <th className="pb-3 font-semibold text-right">Milestone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeResult.schedule
                  .filter((row, idx, arr) =>
                    showFullSchedule ||
                    idx === 0 ||
                    idx === arr.length - 1 ||
                    row.paidOffNames.length > 0 ||
                    row.month % 6 === 0
                  )
                  .map(row => (
                    <tr key={row.month} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 pr-3 font-mono tabular-nums text-slate-400">#{row.month}</td>
                      <td className="py-2.5 pr-3 font-semibold text-white">{row.dateLabel}</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-200">
                        {currencySymbol}{Math.round(row.payment).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                        {currencySymbol}{Math.round(row.principalPaid).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-rose-300">
                        {currencySymbol}{Math.round(row.interestPaid).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums font-bold text-white">
                        {currencySymbol}{Math.round(row.remainingBalance).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-amber-300 font-medium">
                        {row.paidOffNames.length > 0
                          ? `Cleared ${row.paidOffNames.join(', ')}`
                          : row.remainingBalance === 0
                          ? 'Debt-Free Achieved'
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
