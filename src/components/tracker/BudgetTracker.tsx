import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  PlusCircle, 
  Sparkles, 
  TrendingDown, 
  Trash2, 
  Receipt, 
  Calendar, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { Transaction, ExpenseCategory, BudgetRuleType, AIAdvisorInsight } from '../../types/finance';
import { BudgetAlertToast } from '../common/BudgetAlertToast';
import { SavingsMilestones } from './SavingsMilestones';

interface BudgetTrackerProps {
  currencySymbol: string;
  onTriggerAIAdvisor: (data: { income: number; expenses: Transaction[]; savingsGoal: number }) => void;
  isAdvisorLoading?: boolean;
  advisorResult?: AIAdvisorInsight | null;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Housing & Rent': '#3b82f6',
  'Food & Groceries': '#10b981',
  'Dining & Coffee': '#f59e0b',
  'Transport & Fuel': '#6366f1',
  'Utilities & Internet': '#06b6d4',
  'Subscriptions & SaaS': '#ec4899',
  'Health & Wellness': '#14b8a6',
  'Shopping & Lifestyle': '#f43f5e',
  'Investments & Savings': '#84cc16',
  'Debt & Loans': '#ef4444',
  'Misc': '#94a3b8',
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', title: 'Apartment Rent & Parking', amount: 1450, category: 'Housing & Rent', ruleType: 'Needs', date: '2026-11-01', isRecurring: true },
  { id: 'tx-2', title: 'Whole Foods Groceries', amount: 245, category: 'Food & Groceries', ruleType: 'Needs', date: '2026-11-03' },
  { id: 'tx-3', title: 'High-Speed Fiber Internet', amount: 75, category: 'Utilities & Internet', ruleType: 'Needs', date: '2026-11-04', isRecurring: true },
  { id: 'tx-4', title: 'Weekend Dining & Cocktails', amount: 165, category: 'Dining & Coffee', ruleType: 'Wants', date: '2026-11-05' },
  { id: 'tx-5', title: 'Streaming Bundle (Netflix/Spotify)', amount: 38, category: 'Subscriptions & SaaS', ruleType: 'Wants', date: '2026-11-02', isRecurring: true },
  { id: 'tx-6', title: 'Automated S&P 500 Index Sweep', amount: 500, category: 'Investments & Savings', ruleType: 'Savings/Debt', date: '2026-11-01', isRecurring: true },
  { id: 'tx-7', title: 'Metro Transit Monthly Pass', amount: 90, category: 'Transport & Fuel', ruleType: 'Needs', date: '2026-11-02', isRecurring: true },
  { id: 'tx-8', title: 'Student Loan Auto-Pay', amount: 220, category: 'Debt & Loans', ruleType: 'Savings/Debt', date: '2026-11-06', isRecurring: true },
  { id: 'tx-9', title: 'Specialty Espresso Beans & Cafe', amount: 48, category: 'Dining & Coffee', ruleType: 'Wants', date: '2026-11-07' },
];

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  currencySymbol,
  onTriggerAIAdvisor,
  isAdvisorLoading,
  advisorResult,
}) => {
  const [income, setIncome] = useState<number>(4500);
  const [savingsTarget, setSavingsTarget] = useState<number>(900); // 20%
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finai_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Food & Groceries');
  const [newRuleType, setNewRuleType] = useState<BudgetRuleType>('Needs');
  const [isRecurring, setIsRecurring] = useState(false);
  const [filterRule, setFilterRule] = useState<string>('all');

  const saveTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    localStorage.setItem('finai_transactions', JSON.stringify(updated));
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(amountVal) || amountVal <= 0) return;

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      title: newTitle.trim(),
      amount: amountVal,
      category: newCategory,
      ruleType: newRuleType,
      date: new Date().toISOString().split('T')[0],
      isRecurring,
    };

    saveTransactions([newTx, ...transactions]);
    setNewTitle('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (id: string) => {
    saveTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculations
  const totalSpent = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const netSavings = income - totalSpent;
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : '0';

  // 50 / 30 / 20 breakdowns
  const needsSpent = useMemo(() => transactions.filter(t => t.ruleType === 'Needs').reduce((a, b) => a + b.amount, 0), [transactions]);
  const wantsSpent = useMemo(() => transactions.filter(t => t.ruleType === 'Wants').reduce((a, b) => a + b.amount, 0), [transactions]);
  const savingsSpent = useMemo(() => transactions.filter(t => t.ruleType === 'Savings/Debt').reduce((a, b) => a + b.amount, 0), [transactions]);

  const needsPercent = income > 0 ? Math.round((needsSpent / income) * 100) : 0;
  const wantsPercent = income > 0 ? Math.round((wantsSpent / income) * 100) : 0;
  const savingsPercent = income > 0 ? Math.round((savingsSpent / income) * 100) : 0;

  // Category breakdown for chart
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  // Days left in current month calculation for safe daily spend
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate() + 1);
  const remainingDiscretionary = Math.max(0, income * 0.3 - wantsSpent);
  const safeDailySpend = (remainingDiscretionary / daysRemaining).toFixed(0);

  const filteredTransactions = transactions.filter(t => {
    if (filterRule === 'all') return true;
    return t.ruleType === filterRule;
  });

  return (
    <div className="space-y-8">
      {/* High-Impact Amber/Gold 50% Needs Budget Alert Toast */}
      <BudgetAlertToast
        income={income}
        needsSpent={needsSpent}
        currencySymbol={currencySymbol}
        onAuditSpending={() => onTriggerAIAdvisor({ income, expenses: transactions, savingsGoal: savingsTarget })}
        onNavigateToGauge={() => {
          const el = document.getElementById('gauge-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Top Banner / Lifestyle Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Autonomous Cashflow Intelligence
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Personal Wealth & Spending Studio
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Track spending velocity, master the 50/30/20 money framework, and optimize your lifestyle cash reserves with real-time AI recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (needsPercent > 50) {
                  saveTransactions(transactions.filter(t => !t.id.startsWith('tx-breach-')));
                } else {
                  const neededAmount = Math.max(500, (income * 0.5) - needsSpent + 280);
                  const breachTx: Transaction = {
                    id: 'tx-breach-' + Date.now(),
                    title: 'Urgent Home HVAC & Emergency Repair',
                    amount: Math.round(neededAmount),
                    category: 'Housing & Rent',
                    ruleType: 'Needs',
                    date: new Date().toISOString().split('T')[0],
                  };
                  saveTransactions([breachTx, ...transactions]);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl transition border text-xs font-bold ${
                needsPercent > 50
                  ? 'bg-amber-950/90 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/30 glow-gold'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-amber-400/90 border-amber-500/30'
              }`}
              title="Toggle a mock essential needs expense to test the amber/gold warning toast"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {needsPercent > 50 ? 'Reset Simulated Breach' : 'Simulate 50% Breach'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              Add Expense
            </button>
            <button
              onClick={() => onTriggerAIAdvisor({ income, expenses: transactions, savingsGoal: savingsTarget })}
              disabled={isAdvisorLoading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-5 py-3 rounded-2xl transition shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              {isAdvisorLoading ? 'Auditing with AI...' : 'Audit My Spending (AI)'}
            </button>
          </div>
        </div>

        {/* Quick KPI stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Monthly Take-Home</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {currencySymbol}{income.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span className="text-emerald-400 cursor-pointer hover:underline" onClick={() => {
                const val = prompt('Enter your monthly take-home income:', income.toString());
                if (val && !isNaN(parseFloat(val))) setIncome(parseFloat(val));
              }}>Edit Income</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Total Spent This Month</span>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
              {currencySymbol}{totalSpent.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {((totalSpent / income) * 100).toFixed(0)}% of monthly budget
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Net Monthly Surplus</span>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {currencySymbol}{netSavings.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Savings rate: <strong className="text-white">{savingsRate}%</strong>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Safe Daily Burn Rate</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {currencySymbol}{safeDailySpend}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {daysRemaining} days left in cycle
            </div>
          </div>
        </div>
      </div>

      {/* AI Advisor Preview Card if result is present */}
      {advisorResult && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border border-emerald-500/30 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Financial Copilot Audit</h3>
                <p className="text-xs text-slate-400">Personalized automated recommendations</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Health Score</span>
              <div className="text-2xl font-black text-emerald-400">{advisorResult.healthScore}/100</div>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 mb-4">
            {advisorResult.statusSummary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Leaks & Opportunities</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {advisorResult.leaksIdentified.map((leak, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{leak}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Recommended AI Tools</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {advisorResult.aiToolRecommendations.map((tool, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <strong className="text-white">{tool.name}</strong>
                      <span className="text-slate-400 text-[10px] ml-1.5">({tool.category})</span>
                      <p className="text-slate-400 text-[11px]">{tool.benefit}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 50 / 30 / 20 Interactive Framework Section */}
      <div id="gauge-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-24">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                The 50/30/20 Rule Balance Gauge
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: 50% Essential Needs, 30% Lifestyle Wants, 20% Compounding Wealth & Debt
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Live Balance
            </span>
          </div>

          <div className="space-y-6">
            {/* Needs Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Essential Needs ({needsPercent}% of income)
                </span>
                <span className="text-slate-300">
                  {currencySymbol}{needsSpent.toLocaleString()} / {currencySymbol}{(income * 0.5).toLocaleString()} max
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${needsPercent > 50 ? 'bg-rose-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (needsSpent / (income * 0.5 || 1)) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Rent, groceries, utilities, primary transport</span>
                <span>{needsPercent > 50 ? '⚠️ Exceeding 50% target' : '✓ Well within safe buffer'}</span>
              </div>
            </div>

            {/* Wants Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Lifestyle Wants ({wantsPercent}% of income)
                </span>
                <span className="text-slate-300">
                  {currencySymbol}{wantsSpent.toLocaleString()} / {currencySymbol}{(income * 0.3).toLocaleString()} max
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${wantsPercent > 30 ? 'bg-rose-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(100, (wantsSpent / (income * 0.3 || 1)) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Dining out, entertainment, subscriptions, shopping</span>
                <span>{wantsPercent > 30 ? '⚠️ High discretionary spend' : '✓ Good lifestyle control'}</span>
              </div>
            </div>

            {/* Savings & Debt Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Savings, Debt & Investments ({savingsPercent}% of income)
                </span>
                <span className="text-slate-300">
                  {currencySymbol}{savingsSpent.toLocaleString()} / {currencySymbol}{(income * 0.2).toLocaleString()} target
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (savingsSpent / (income * 0.2 || 1)) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>High-yield savings, index funds, student/car loan principal</span>
                <span>{savingsPercent >= 20 ? '🌟 Meeting wealth building velocity!' : 'Build to 20% minimum'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Top Category Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Ranked by total monthly outflow</p>

            <div className="space-y-3">
              {categoryTotals.slice(0, 6).map(([cat, amt]) => {
                const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : '0';
                const color = CATEGORY_COLORS[cat as ExpenseCategory] || '#94a3b8';
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        {cat}
                      </span>
                      <span className="font-semibold text-white">
                        {currencySymbol}{amt.toLocaleString()} <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400">
              💡 Tip: Automated micro-sweeping of just <strong>{currencySymbol}5/day</strong> adds <strong>{currencySymbol}1,825</strong> to annual net worth.
            </span>
          </div>
        </div>
      </div>

      {/* Savings Milestones & Golden Coin Celebration Component */}
      <SavingsMilestones currencySymbol={currencySymbol} />

      {/* Transaction Ledger Table with filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Expense & Outflow Ledger
            </h2>
            <p className="text-xs text-slate-400">All registered spending, auto-categorized by budget type</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterRule('all')}
                className={`px-3 py-1 rounded-lg transition ${filterRule === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRule('Needs')}
                className={`px-3 py-1 rounded-lg transition ${filterRule === 'Needs' ? 'bg-blue-900/60 text-blue-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Needs
              </button>
              <button
                onClick={() => setFilterRule('Wants')}
                className={`px-3 py-1 rounded-lg transition ${filterRule === 'Wants' ? 'bg-amber-900/60 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Wants
              </button>
              <button
                onClick={() => setFilterRule('Savings/Debt')}
                className={`px-3 py-1 rounded-lg transition ${filterRule === 'Savings/Debt' ? 'bg-emerald-900/60 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Savings
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Transaction</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Budget Type</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition group">
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {tx.title}
                      {tx.isRecurring && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                          Recurring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#94a3b8' }}
                      />
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.ruleType === 'Needs' ? 'bg-blue-950 text-blue-400 border border-blue-500/20' :
                      tx.ruleType === 'Wants' ? 'bg-amber-950 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {tx.ruleType}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {tx.date}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right font-bold text-white text-sm">
                    {currencySymbol}{tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="opacity-40 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition p-1"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-1">Add New Expense</h3>
            <p className="text-xs text-slate-400 mb-4">Log a recent purchase or recurring commitment</p>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Merchant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trader Joe's, Netflix, Electric Bill"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {Object.keys(CATEGORY_COLORS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">50/30/20 Type</label>
                  <select
                    value={newRuleType}
                    onChange={e => setNewRuleType(e.target.value as BudgetRuleType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Needs">Needs (Essential)</option>
                    <option value="Wants">Wants (Discretionary)</option>
                    <option value="Savings/Debt">Savings & Debt</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurring-check"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="recurring-check" className="text-xs text-slate-300 cursor-pointer">
                  Mark as monthly recurring expense
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition shadow-lg"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
