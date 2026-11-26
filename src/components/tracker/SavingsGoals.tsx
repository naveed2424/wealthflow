import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Trophy,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  X,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { GoalProgressBar } from './GoalProgressBar';

export interface SavingsGoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  monthlyContribution: number;
  category: string;
  color: string;
  notes?: string;
  lastCelebratedMilestone?: number;
}

interface SavingsGoalsProps {
  currencySymbol: string;
}

const STORAGE_KEY = 'wealthflow_savings_milestones';

const addMonthsIso = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

const CATEGORY_OPTIONS = [
  { label: 'Safety & Emergency', value: 'Safety', color: '#f59e0b' },
  { label: 'Resilience & Cushion', value: 'Resilience', color: '#10b981' },
  { label: 'Wealth & Investing', value: 'Wealth', color: '#fbbf24' },
  { label: 'Real Estate & Housing', value: 'Property', color: '#3b82f6' },
  { label: 'Travel & Lifestyle', value: 'Lifestyle', color: '#ec4899' },
  { label: 'Education & Upskilling', value: 'Education', color: '#8b5cf6' },
  { label: 'Tax & Debt Reserve', value: 'Reserve', color: '#06b6d4' },
];

const DEFAULT_GOALS: SavingsGoalItem[] = [
  {
    id: 'goal-1',
    title: 'Starter Emergency Buffer',
    targetAmount: 1500,
    currentAmount: 1150,
    deadline: addMonthsIso(2),
    monthlyContribution: 200,
    category: 'Safety',
    color: '#f59e0b',
    notes: 'Liquid cash kept in HYSA for immediate car or medical deductibles.',
    lastCelebratedMilestone: 75,
  },
  {
    id: 'goal-2',
    title: '6-Month Living Expense Fortress',
    targetAmount: 18000,
    currentAmount: 9600,
    deadline: addMonthsIso(14),
    monthlyContribution: 650,
    category: 'Resilience',
    color: '#10b981',
    notes: 'Split 25% instant HYSA and 75% rolling 4-week U.S. Treasury bills.',
    lastCelebratedMilestone: 50,
  },
  {
    id: 'goal-3',
    title: 'Home Down Payment Vault',
    targetAmount: 35000,
    currentAmount: 19250,
    deadline: addMonthsIso(22),
    monthlyContribution: 800,
    category: 'Property',
    color: '#3b82f6',
    notes: 'Automated bi-weekly payroll split toward closing costs and equity.',
    lastCelebratedMilestone: 50,
  },
  {
    id: 'goal-4',
    title: 'First $10,000 Index Milestone',
    targetAmount: 10000,
    currentAmount: 10000,
    deadline: addMonthsIso(1),
    monthlyContribution: 500,
    category: 'Wealth',
    color: '#fbbf24',
    notes: 'Fully funded S&P 500 Roth IRA milestone now compounding passively.',
    lastCelebratedMilestone: 100,
  },
  {
    id: 'goal-5',
    title: 'Annual Travel & Sabbatical Fund',
    targetAmount: 4200,
    currentAmount: 2650,
    deadline: addMonthsIso(6),
    monthlyContribution: 300,
    category: 'Lifestyle',
    color: '#ec4899',
    notes: 'Pre-funded flights and lodging with zero credit card debt.',
    lastCelebratedMilestone: 50,
  },
];

const getDeadlineTelemetry = (goal: SavingsGoalItem) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(`${goal.deadline}T00:00:00`);
  const isValidDate = !isNaN(deadlineDate.getTime());

  const diffMs = isValidDate ? deadlineDate.getTime() - now.getTime() : 0;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(0.25, daysRemaining / 30.4375);

  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isComplete = goal.currentAmount >= goal.targetAmount && goal.targetAmount > 0;
  const isOverdue = !isComplete && isValidDate && daysRemaining < 0;

  const requiredMonthly = isComplete
    ? 0
    : isOverdue
    ? remainingAmount
    : Math.ceil(remainingAmount / Math.max(1, monthsRemaining));

  const requiredWeekly = isComplete
    ? 0
    : isOverdue
    ? remainingAmount
    : Math.ceil(remainingAmount / Math.max(1, daysRemaining / 7));

  let status: 'completed' | 'on-track' | 'behind' | 'overdue' = 'on-track';
  if (isComplete) {
    status = 'completed';
  } else if (isOverdue) {
    status = 'overdue';
  } else if (goal.monthlyContribution < requiredMonthly) {
    status = 'behind';
  }

  const formattedDeadline = isValidDate
    ? deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  return {
    daysRemaining,
    monthsRemaining,
    remainingAmount,
    isComplete,
    isOverdue,
    requiredMonthly,
    requiredWeekly,
    status,
    formattedDeadline,
  };
};

const normalizeStoredGoal = (raw: any, index: number): SavingsGoalItem => {
  const fallbackDeadline = addMonthsIso(6 + index * 3);
  return {
    id: raw.id || `goal-${Date.now()}-${index}`,
    title: raw.title || 'Untitled Milestone',
    targetAmount: Math.max(1, Number(raw.targetAmount) || 1000),
    currentAmount: Math.max(0, Number(raw.currentAmount) || 0),
    deadline: typeof raw.deadline === 'string' && raw.deadline.trim() ? raw.deadline : fallbackDeadline,
    monthlyContribution: Math.max(0, Number(raw.monthlyContribution) || 250),
    category: raw.category || 'Wealth',
    color: raw.color || '#10b981',
    notes: raw.notes || '',
    lastCelebratedMilestone: raw.lastCelebratedMilestone || 0,
  };
};

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ currencySymbol }) => {
  const [goals, setGoals] = useState<SavingsGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeStoredGoal);
        }
      }
    } catch {
      // ignore corrupted local storage
    }
    return DEFAULT_GOALS;
  });

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'attention' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'remaining'>('deadline');

  // Inline custom contribution input per card
  const [inlineAdjustments, setInlineAdjustments] = useState<Record<string, string>>({});

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('5000');
  const [formCurrent, setFormCurrent] = useState('0');
  const [formDeadline, setFormDeadline] = useState(addMonthsIso(6));
  const [formMonthly, setFormMonthly] = useState('450');
  const [formCategory, setFormCategory] = useState('Wealth');
  const [formColor, setFormColor] = useState('#10b981');
  const [formNotes, setFormNotes] = useState('');

  // Milestone toast banner
  const [milestoneBanner, setMilestoneBanner] = useState<{
    title: string;
    milestone: number;
    amount: number;
  } | null>(null);

  const persistGoals = (updated: SavingsGoalItem[]) => {
    setGoals(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const triggerMilestoneBurst = (goalTitle: string, milestone: number, amount: number) => {
    confetti({
      particleCount: milestone >= 100 ? 85 : 35,
      spread: milestone >= 100 ? 75 : 50,
      origin: { y: 0.65 },
      colors: ['#10b981', '#fbbf24', '#f59e0b', '#38bdf8'],
    });
    setMilestoneBanner({ title: goalTitle, milestone, amount });
  };

  const handleAdjustBalance = (goalId: string, delta: number) => {
    if (!Number.isFinite(delta) || delta === 0) return;

    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      const newAmount = Math.max(0, Math.round((g.currentAmount + delta) * 100) / 100);
      const newPercent = g.targetAmount > 0 ? Math.floor((newAmount / g.targetAmount) * 100) : 0;
      let lastCelebrated = g.lastCelebratedMilestone || 0;

      if (delta > 0) {
        if (newPercent >= 100 && lastCelebrated < 100) {
          lastCelebrated = 100;
          triggerMilestoneBurst(g.title, 100, newAmount);
        } else if (newPercent >= 75 && lastCelebrated < 75) {
          lastCelebrated = 75;
          triggerMilestoneBurst(g.title, 75, newAmount);
        } else if (newPercent >= 50 && lastCelebrated < 50) {
          lastCelebrated = 50;
          triggerMilestoneBurst(g.title, 50, newAmount);
        } else if (newPercent >= 25 && lastCelebrated < 25) {
          lastCelebrated = 25;
          triggerMilestoneBurst(g.title, 25, newAmount);
        } else {
          confetti({
            particleCount: 14,
            spread: 35,
            origin: { y: 0.72 },
            colors: ['#10b981', '#fbbf24'],
          });
        }
      }

      return {
        ...g,
        currentAmount: newAmount,
        lastCelebratedMilestone: lastCelebrated,
      };
    });

    persistGoals(updated);
  };

  const handleApplyInlineAmount = (goalId: string, sign: 1 | -1) => {
    const raw = parseFloat(inlineAdjustments[goalId] || '');
    if (isNaN(raw) || raw <= 0) return;
    handleAdjustBalance(goalId, raw * sign);
    setInlineAdjustments(prev => ({ ...prev, [goalId]: '' }));
  };

  const openCreateModal = () => {
    setEditingGoalId(null);
    setFormTitle('');
    setFormTarget('5000');
    setFormCurrent('500');
    setFormDeadline(addMonthsIso(6));
    setFormMonthly('750');
    setFormCategory('Wealth');
    setFormColor('#fbbf24');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoalItem) => {
    setEditingGoalId(goal.id);
    setFormTitle(goal.title);
    setFormTarget(String(goal.targetAmount));
    setFormCurrent(String(goal.currentAmount));
    setFormDeadline(goal.deadline);
    setFormMonthly(String(goal.monthlyContribution));
    setFormCategory(goal.category);
    setFormColor(goal.color);
    setFormNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(formTarget);
    const currentVal = Math.max(0, parseFloat(formCurrent) || 0);
    const monthlyVal = Math.max(0, parseFloat(formMonthly) || 0);
    if (!formTitle.trim() || isNaN(targetVal) || targetVal <= 0) return;

    const percent = Math.floor((currentVal / targetVal) * 100);
    const computedMilestone =
      percent >= 100 ? 100 : percent >= 75 ? 75 : percent >= 50 ? 50 : percent >= 25 ? 25 : 0;

    if (editingGoalId) {
      const updated = goals.map(g =>
        g.id === editingGoalId
          ? {
              ...g,
              title: formTitle.trim(),
              targetAmount: targetVal,
              currentAmount: currentVal,
              deadline: formDeadline || addMonthsIso(6),
              monthlyContribution: monthlyVal,
              category: formCategory,
              color: formColor,
              notes: formNotes.trim(),
              lastCelebratedMilestone: Math.max(g.lastCelebratedMilestone || 0, computedMilestone),
            }
          : g
      );
      persistGoals(updated);
    } else {
      const created: SavingsGoalItem = {
        id: `goal-${Date.now()}`,
        title: formTitle.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        deadline: formDeadline || addMonthsIso(6),
        monthlyContribution: monthlyVal,
        category: formCategory,
        color: formColor,
        notes: formNotes.trim(),
        lastCelebratedMilestone: computedMilestone,
      };
      persistGoals([created, ...goals]);
      if (computedMilestone >= 100) {
        triggerMilestoneBurst(created.title, 100, currentVal);
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    persistGoals(goals.filter(g => g.id !== id));
  };

  const handleResetDefaults = () => {
    persistGoals(DEFAULT_GOALS);
    setStatusFilter('all');
    setCategoryFilter('all');
    setMilestoneBanner(null);
  };

  // Enriched summary metrics
  const summary = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const completedCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    const behindOrOverdueCount = goals.filter(g => {
      const t = getDeadlineTelemetry(g);
      return t.status === 'behind' || t.status === 'overdue';
    }).length;
    const totalRequiredMonthly = goals.reduce((acc, g) => acc + getDeadlineTelemetry(g).requiredMonthly, 0);
    const totalPlannedMonthly = goals.reduce((acc, g) => {
      const t = getDeadlineTelemetry(g);
      return acc + (t.isComplete ? 0 : g.monthlyContribution);
    }, 0);
    const nextDeadlineGoal = [...goals]
      .filter(g => g.currentAmount < g.targetAmount)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];

    return {
      totalTarget,
      totalSaved,
      completedCount,
      behindOrOverdueCount,
      totalRequiredMonthly,
      totalPlannedMonthly,
      nextDeadlineGoal,
    };
  }, [goals]);

  const filteredAndSortedGoals = useMemo(() => {
    return [...goals]
      .filter(g => {
        const telemetry = getDeadlineTelemetry(g);
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'completed' && telemetry.isComplete) ||
          (statusFilter === 'active' && !telemetry.isComplete) ||
          (statusFilter === 'attention' && (telemetry.status === 'behind' || telemetry.status === 'overdue'));
        const matchesCat = categoryFilter === 'all' || g.category === categoryFilter;
        return matchesStatus && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          const pa = a.currentAmount / Math.max(1, a.targetAmount);
          const pb = b.currentAmount / Math.max(1, b.targetAmount);
          return pb - pa;
        }
        if (sortBy === 'remaining') {
          const ra = Math.max(0, a.targetAmount - a.currentAmount);
          const rb = Math.max(0, b.targetAmount - b.currentAmount);
          return rb - ra;
        }
        return a.deadline.localeCompare(b.deadline);
      });
  }, [goals, statusFilter, categoryFilter, sortBy]);

  const chartData = useMemo(() => {
    return goals.slice(0, 8).map(g => ({
      name: g.title.length > 22 ? `${g.title.slice(0, 20)}…` : g.title,
      Saved: Math.round(Math.min(g.currentAmount, g.targetAmount)),
      Remaining: Math.round(Math.max(0, g.targetAmount - g.currentAmount)),
    }));
  }, [goals]);

  // Suggested monthly pace for the Add/Edit modal live preview
  const modalSuggestedMonthly = useMemo(() => {
    const t = parseFloat(formTarget) || 0;
    const c = parseFloat(formCurrent) || 0;
    const rem = Math.max(0, t - c);
    if (!formDeadline || rem <= 0) return 0;
    const now = new Date();
    const targetDate = new Date(`${formDeadline}T00:00:00`);
    const days = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.ceil(rem / Math.max(1, days / 30.4375));
  }, [formTarget, formCurrent, formDeadline]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090d16] via-[#050811] to-[#020408] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Target className="w-3.5 h-3.5" />
              Deadline-Driven Financial Milestones
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Savings Goals &amp; Milestone Planner
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Define concrete financial targets with custom deadlines, monitor real-time funding progress bars, and verify the exact monthly savings pace required to reach every milestone on schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
              title="Restore default milestone templates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Sample Goals
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create Savings Goal
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Saved Across Goals
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {currencySymbol}
              {summary.totalSaved.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              of {currencySymbol}
              {summary.totalTarget.toLocaleString()} total target
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Milestones Completed
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
              {summary.completedCount} / {goals.length}
              {summary.completedCount > 0 && <Trophy className="w-5 h-5 text-amber-400" />}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {summary.behindOrOverdueCount > 0
                ? `${summary.behindOrOverdueCount} goal${summary.behindOrOverdueCount > 1 ? 's' : ''} behind deadline pace`
                : 'All active goals on schedule'}
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Required Monthly Pace
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {currencySymbol}
              {summary.totalRequiredMonthly.toLocaleString()}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Planned: <strong className={summary.totalPlannedMonthly >= summary.totalRequiredMonthly ? 'text-emerald-400' : 'text-amber-400'}>
                {currencySymbol}{summary.totalPlannedMonthly.toLocaleString()}/mo
              </strong>
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Next Upcoming Deadline
            </span>
            {summary.nextDeadlineGoal ? (
              <>
                <div className="text-sm font-black text-white mt-1.5 truncate">
                  {summary.nextDeadlineGoal.title}
                </div>
                <span className="text-[11px] text-amber-300 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {getDeadlineTelemetry(summary.nextDeadlineGoal).formattedDeadline}
                </span>
              </>
            ) : (
              <div className="text-sm font-bold text-emerald-400 mt-2">
                All Goals Funded!
              </div>
            )}
          </div>
        </div>

        {/* Portfolio-Wide Combined Progress Bar */}
        <div className="relative z-10 mt-5 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
          <GoalProgressBar
            label="Cumulative Milestone Funding Progress"
            currentAmount={summary.totalSaved}
            targetAmount={summary.totalTarget}
            currencySymbol={currencySymbol}
            accentColor="#10b981"
            size="lg"
          />
        </div>
      </div>

      {/* Milestone Celebration Toast Banner */}
      {milestoneBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border border-amber-400/60 flex items-center justify-between gap-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">
                {milestoneBanner.milestone >= 100
                  ? `Goal Completed: "${milestoneBanner.title}"!`
                  : `${milestoneBanner.milestone}% Checkpoint Reached on "${milestoneBanner.title}"!`}
              </div>
              <div className="text-xs text-slate-300">
                Current balance saved: {currencySymbol}
                {milestoneBanner.amount.toLocaleString()} — keep compounding momentum rolling!
              </div>
            </div>
          </div>
          <button
            onClick={() => setMilestoneBanner(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Dismiss celebration banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            Status:
          </span>
          {(
            [
              { id: 'all', label: `All (${goals.length})` },
              { id: 'active', label: `Active (${goals.length - summary.completedCount})` },
              { id: 'attention', label: `Needs Pace Boost (${summary.behindOrOverdueCount})` },
              { id: 'completed', label: `Completed (${summary.completedCount})` },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter goals by category"
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'deadline' | 'progress' | 'remaining')}
            aria-label="Sort savings goals"
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="deadline">Sort: Closest Deadline</option>
            <option value="progress">Sort: Highest % Funded</option>
            <option value="remaining">Sort: Largest Gap Remaining</option>
          </select>
        </div>
      </div>

      {/* Individual Savings Goals Grid */}
      {filteredAndSortedGoals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Target className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No savings milestones match this filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create a new goal with a target amount and deadline, or clear your current status filter to inspect all milestones.
          </p>
          <div className="pt-2">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition"
            >
              Add Savings Milestone
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedGoals.map(goal => {
            const t = getDeadlineTelemetry(goal);

            return (
              <div
                key={goal.id}
                className={`p-6 rounded-3xl bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  t.isComplete
                    ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                    : t.status === 'overdue'
                    ? 'border-rose-500/50'
                    : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${goal.color}1f`,
                          color: goal.color,
                          border: `1px solid ${goal.color}4d`,
                        }}
                      >
                        {t.isComplete ? (
                          <Trophy className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-white truncate">
                            {goal.title}
                          </h3>
                          {t.status === 'completed' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                              Completed
                            </span>
                          )}
                          {t.status === 'on-track' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                              On Pace
                            </span>
                          )}
                          {t.status === 'behind' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Needs +{currencySymbol}
                              {(t.requiredMonthly - goal.monthlyContribution).toLocaleString()}/mo
                            </span>
                          )}
                          {t.status === 'overdue' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Deadline Passed
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>
                            Domain: <strong className="text-slate-200">{goal.category}</strong>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            Due {t.formattedDeadline}
                            {!t.isComplete && (
                              <span className="text-slate-500">
                                ({t.daysRemaining >= 0 ? `${t.daysRemaining}d left` : `${Math.abs(t.daysRemaining)}d overdue`})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 text-slate-400 hover:text-amber-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
                        title="Edit milestone target or deadline"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-2xl font-black text-white">
                        {currencySymbol}
                        {goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        of {currencySymbol}
                        {goal.targetAmount.toLocaleString()} target
                      </span>
                    </div>
                  </div>

                  {/* Dedicated Progress Bar Component */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4">
                    <GoalProgressBar
                      currentAmount={goal.currentAmount}
                      targetAmount={goal.targetAmount}
                      currencySymbol={currencySymbol}
                      accentColor={goal.color}
                      size="md"
                    />
                  </div>

                  {/* Deadline Pace Telemetry Row */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Needed / Month</div>
                      <div className="text-xs font-black text-white mt-0.5">
                        {t.isComplete ? (
                          <span className="text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          `${currencySymbol}${t.requiredMonthly.toLocaleString()}`
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Weekly Pace</div>
                      <div className="text-xs font-black text-amber-300 mt-0.5">
                        {t.isComplete ? `${currencySymbol}0` : `${currencySymbol}${t.requiredWeekly.toLocaleString()}`}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Your Planned Plan</div>
                      <div className="text-xs font-black text-emerald-400 mt-0.5">
                        {currencySymbol}
                        {goal.monthlyContribution.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Quick Deposits & Custom Contribution Strip */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Contribution:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[50, 100, 250, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => handleAdjustBalance(goal.id, amt)}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-emerald-400 hover:text-slate-950 text-emerald-300 border border-slate-800 hover:border-emerald-400 text-xs font-bold transition"
                        >
                          +{currencySymbol}
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="10"
                      placeholder={`Custom amount (${currencySymbol})`}
                      value={inlineAdjustments[goal.id] || ''}
                      onChange={e =>
                        setInlineAdjustments(prev => ({
                          ...prev,
                          [goal.id]: e.target.value,
                        }))
                      }
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleApplyInlineAmount(goal.id, 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition shrink-0"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Deposit
                    </button>
                    <button
                      onClick={() => handleApplyInlineAmount(goal.id, -1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-bold transition shrink-0"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Portfolio Allocation & Remaining Gap Visualization */}
      {goals.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Funded vs. Remaining Target Across Milestones
              </h3>
              <p className="text-xs text-slate-400">
                Compare how much capital is already banked against the remaining amount needed before each goal deadline.
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-400">
              {goals.length} Tracked Goal{goals.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v: number) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={135}
                  stroke="#cbd5e1"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value) => `${currencySymbol}${Number(value ?? 0).toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Saved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Remaining" stackId="a" fill="#334155" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SAVINGS GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#090d16] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition"
              aria-label="Close goal modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Target className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {editingGoalId ? 'Update Financial Milestone' : 'New Financial Milestone'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mb-1">
              {editingGoalId ? 'Edit Savings Goal' : 'Create Savings Goal & Deadline'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Attach a target dollar milestone and target deadline to calculate your required monthly pace automatically.
            </p>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Milestone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 6-Month Emergency Vault, Home Closing Costs, New Car Cash"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={formTarget}
                    onChange={e => setFormTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Saved ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formCurrent}
                    onChange={e => setFormCurrent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Deadline Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[
                      { label: '+3M', m: 3 },
                      { label: '+6M', m: 6 },
                      { label: '+1Y', m: 12 },
                      { label: '+2Y', m: 24 },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormDeadline(addMonthsIso(preset.m))}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Planned Monthly Savings ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formMonthly}
                    onChange={e => setFormMonthly(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {modalSuggestedMonthly > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormMonthly(String(modalSuggestedMonthly))}
                      className="text-[10px] text-emerald-400 hover:underline mt-1.5 block font-semibold"
                    >
                      Match deadline pace: {currencySymbol}
                      {modalSuggestedMonthly.toLocaleString()}/mo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => {
                      const val = e.target.value;
                      setFormCategory(val);
                      const matched = CATEGORY_OPTIONS.find(c => c.value === val);
                      if (matched) setFormColor(matched.color);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Progress Bar Color
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {['#10b981', '#fbbf24', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          formColor === c ? 'border-white scale-110' : 'border-transparent opacity-75'
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Strategy / Account Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Automated $250 every Friday into 4.3% HYSA bucket"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20"
                >
                  {editingGoalId ? 'Save Goal Changes' : 'Save Milestone & Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
