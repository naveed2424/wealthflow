import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  Target, 
  Coins, 
  X, 
  TrendingUp,
  ShieldCheck,
  Zap,
  Flame,
  Award
} from 'lucide-react';

export interface SavingsMilestoneGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  color: string;
  lastCelebratedMilestone?: number; // 25, 50, 75, or 100
}

interface SavingsMilestonesProps {
  currencySymbol: string;
}

const DEFAULT_MILESTONES: SavingsMilestoneGoal[] = [
  {
    id: 'goal-1',
    title: 'Starter Emergency Buffer',
    targetAmount: 1000,
    currentAmount: 850,
    category: 'Safety',
    color: '#f59e0b', // Amber
    lastCelebratedMilestone: 75,
  },
  {
    id: 'goal-2',
    title: '3-Month Living Expense Cushion',
    targetAmount: 7500,
    currentAmount: 4200,
    category: 'Resilience',
    color: '#10b981', // Emerald
    lastCelebratedMilestone: 50,
  },
  {
    id: 'goal-3',
    title: 'First $10,000 Compounding Milestone',
    targetAmount: 10000,
    currentAmount: 10000,
    category: 'Wealth',
    color: '#fbbf24', // Gold
    lastCelebratedMilestone: 100,
  },
  {
    id: 'goal-4',
    title: 'House Deposit & Real Estate Vault',
    targetAmount: 25000,
    currentAmount: 14500,
    category: 'Property',
    color: '#3b82f6', // Blue
    lastCelebratedMilestone: 50,
  },
  {
    id: 'goal-5',
    title: 'Dream Travel & Lifestyle Experiential Fund',
    targetAmount: 3500,
    currentAmount: 2800,
    category: 'Lifestyle',
    color: '#ec4899', // Pink
    lastCelebratedMilestone: 75,
  },
];

export const SavingsMilestones: React.FC<SavingsMilestonesProps> = ({ currencySymbol }) => {
  const [goals, setGoals] = useState<SavingsMilestoneGoal[]>(() => {
    const saved = localStorage.getItem('wealthflow_savings_milestones');
    return saved ? JSON.parse(saved) : DEFAULT_MILESTONES;
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [celebrationModal, setCelebrationModal] = useState<{
    show: boolean;
    goalTitle: string;
    milestone: number;
    amountSaved: number;
  }>({ show: false, goalTitle: '', milestone: 0, amountSaved: 0 });

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newCategory, setNewCategory] = useState('Wealth');
  const [newColor, setNewColor] = useState('#fbbf24');

  const saveGoals = (updated: SavingsMilestoneGoal[]) => {
    setGoals(updated);
    localStorage.setItem('wealthflow_savings_milestones', JSON.stringify(updated));
  };

  // Play golden coin chime with Web Audio API
  const playCoinChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Golden coin arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.09, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      // Audio context may need user gesture
    }
  };

  // Fire golden coin celebration effect
  const triggerCelebration = (goalTitle: string, milestone: number, currentAmount: number) => {
    playCoinChime();

    // Trigger dual cannon golden coins and sparkle confetti
    const end = Date.now() + 1200;
    const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setCelebrationModal({
      show: true,
      goalTitle,
      milestone,
      amountSaved: currentAmount,
    });
  };

  // Quick Deposit Handler
  const handleQuickDeposit = (goalId: string, depositAmount: number) => {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;

      const oldPercent = Math.floor((g.currentAmount / g.targetAmount) * 100);
      const newAmount = Math.max(0, g.currentAmount + depositAmount);
      const newPercent = Math.floor((newAmount / g.targetAmount) * 100);

      let lastCelebrated = g.lastCelebratedMilestone || 0;

      // Check milestones crossed (25, 50, 75, 100)
      if (newPercent >= 100 && lastCelebrated < 100) {
        lastCelebrated = 100;
        triggerCelebration(g.title, 100, newAmount);
      } else if (newPercent >= 75 && lastCelebrated < 75) {
        lastCelebrated = 75;
        triggerCelebration(g.title, 75, newAmount);
      } else if (newPercent >= 50 && lastCelebrated < 50) {
        lastCelebrated = 50;
        triggerCelebration(g.title, 50, newAmount);
      } else if (newPercent >= 25 && lastCelebrated < 25) {
        lastCelebrated = 25;
        triggerCelebration(g.title, 25, newAmount);
      } else {
        // Even for small incremental savings, emit subtle golden sparks
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.7 },
          colors: ['#fbbf24', '#f59e0b'],
        });
      }

      return {
        ...g,
        currentAmount: newAmount,
        lastCelebratedMilestone: lastCelebrated,
      };
    });

    saveGoals(updated);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(newTarget);
    const currentVal = parseFloat(newCurrent) || 0;
    if (!newTitle.trim() || isNaN(targetVal) || targetVal <= 0) return;

    const percent = Math.floor((currentVal / targetVal) * 100);
    const newGoal: SavingsMilestoneGoal = {
      id: 'goal-' + Date.now(),
      title: newTitle.trim(),
      targetAmount: targetVal,
      currentAmount: currentVal,
      category: newCategory,
      color: newColor,
      lastCelebratedMilestone: percent >= 100 ? 100 : percent >= 75 ? 75 : percent >= 50 ? 50 : percent >= 25 ? 25 : 0,
    };

    saveGoals([newGoal, ...goals]);
    setNewTitle('');
    setNewTarget('');
    setNewCurrent('');
    setShowAddModal(false);

    if (percent >= 100) {
      triggerCelebration(newGoal.title, 100, currentVal);
    }
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  // Aggregated totals
  const totalTargetAll = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSavedAll = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalProgressPercent = totalTargetAll > 0 ? Math.round((totalSavedAll / totalTargetAll) * 100) : 0;
  const completedGoalsCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Header Container with Black & Gold Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#090d16] via-[#050811] to-[#020408] border-2 border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Coins className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              Interactive Wealth Milestones & Gamification
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Savings Milestones & Golden Coin Celebrations
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Track progress toward critical financial independence milestones. Add deposits, celebrate checkpoints with golden coin showers, and gamify your journey to debt freedom and wealth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl transition shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              New Savings Goal
            </button>
          </div>
        </div>

        {/* Aggregate Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Total Capital Stashed</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {currencySymbol}{totalSavedAll.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">Across {goals.length} defined milestones</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Cumulative Milestone Target</span>
            <div className="text-2xl font-black text-white mt-1">
              {currencySymbol}{totalTargetAll.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">{completedGoalsCount} of {goals.length} fully funded</span>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-400 font-bold">Overall Vault Completion</span>
              <span className="text-white font-black">{totalProgressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 mt-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700 shadow-md shadow-amber-500/30"
                style={{ width: `${Math.min(100, totalProgressPercent)}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1 block">
              {totalProgressPercent >= 100 ? '🎉 All defined vaults funded!' : `${100 - totalProgressPercent}% remaining to total freedom`}
            </span>
          </div>
        </div>
      </div>

      {/* List of Defined Savings Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = goal.currentAmount >= goal.targetAmount;
          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between hover:shadow-2xl relative overflow-hidden group ${
                isComplete
                  ? 'border-amber-400/80 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 hover:border-amber-500/40'
              }`}
            >
              {/* Subtle background glow for completed goals */}
              {isComplete && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
              )}

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-md shrink-0"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        color: goal.color,
                        border: `1px solid ${goal.color}40`,
                      }}
                    >
                      {isComplete ? (
                        <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                          {goal.title}
                        </span>
                        {isComplete && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                            Completed!
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Category: <strong className="text-slate-300">{goal.category}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="opacity-40 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1"
                    title="Remove goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount figures */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-black text-white">
                    {currencySymbol}{goal.currentAmount.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      / {currencySymbol}{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm font-black text-amber-400">
                    {percent}%
                  </div>
                </div>

                {/* Progress Bar with 25%, 50%, 75%, 100% Milestone checkpoints */}
                <div className="relative my-3">
                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-yellow-300 shadow-sm shadow-amber-400/50"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Milestone checkpoint pips */}
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
                    <span className={percent >= 25 ? 'text-amber-400 font-bold' : ''}>25%</span>
                    <span className={percent >= 50 ? 'text-amber-400 font-bold' : ''}>50%</span>
                    <span className={percent >= 75 ? 'text-amber-400 font-bold' : ''}>75%</span>
                    <span className={percent >= 100 ? 'text-emerald-400 font-bold' : ''}>100% 🏆</span>
                  </div>
                </div>

                {/* Context Status */}
                <div className="text-[11px] text-slate-400 mb-4 flex items-center justify-between">
                  <span>
                    {isComplete ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Milestone Fully Reached & Stashed
                      </span>
                    ) : (
                      <span>Need {currencySymbol}{remainingAmount.toLocaleString()} to complete</span>
                    )}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    Goal ID: #{goal.id.slice(-4)}
                  </span>
                </div>
              </div>

              {/* Quick Action Deposit Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Deposit:
                </span>
                <div className="flex items-center gap-1.5">
                  {[25, 100, 500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleQuickDeposit(goal.id, amt)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-slate-800 hover:border-amber-400 text-xs font-bold transition shadow-sm"
                      title={`Add ${currencySymbol}${amt} to this milestone`}
                    >
                      +{currencySymbol}{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const input = prompt(`Enter custom deposit amount for "${goal.title}":`, '250');
                      if (input && !isNaN(parseFloat(input)) && parseFloat(input) > 0) {
                        handleQuickDeposit(goal.id, parseFloat(input));
                      }
                    }}
                    className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    title="Custom deposit amount"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CELEBRATION MODAL (Golden Coin Shower) */}
      {celebrationModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#090d16] border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCelebrationModal({ ...celebrationModal, show: false })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Golden Cup */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black mx-auto mb-4 shadow-xl shadow-amber-500/40 animate-bounce">
              <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider mb-2">
              <Coins className="w-3.5 h-3.5" />
              Golden Coin Celebration!
            </div>

            <h3 className="text-2xl font-black text-white">
              {celebrationModal.milestone >= 100 ? '100% Vault Funded!' : `${celebrationModal.milestone}% Milestone Unlocked!`}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Incredible discipline! You have deposited{' '}
              <strong className="text-amber-400">
                {currencySymbol}{celebrationModal.amountSaved.toLocaleString()}
              </strong>{' '}
              into your <strong className="text-white font-bold">"{celebrationModal.goalTitle}"</strong> milestone.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-amber-300/90 leading-relaxed font-medium">
              🪙 <em>"The compound effect of small savings habits generates life-changing financial freedom."</em>
            </div>

            <button
              onClick={() => {
                // Fire extra golden burst on continue
                confetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#fbbf24', '#f59e0b', '#10b981'],
                });
                setCelebrationModal({ ...celebrationModal, show: false });
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30"
            >
              Claim Victory & Keep Stacking
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW SAVINGS GOAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#090d16] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                New Milestone Target
              </span>
            </div>

            <h3 className="text-lg font-black text-white mb-1">Define Savings Goal</h3>
            <p className="text-xs text-slate-400 mb-4">Set up a visual progress bar with golden celebration rewards</p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Down Payment, Wedding Fund, Crypto Buffer"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="10"
                    required
                    placeholder="5000"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Saved ({currencySymbol})</label>
                  <input
                    type="number"
                    step="10"
                    placeholder="0"
                    value={newCurrent}
                    onChange={e => setNewCurrent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Domain</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Wealth">Wealth & Compounding</option>
                  <option value="Safety">Safety & Emergency</option>
                  <option value="Resilience">Living Cushion</option>
                  <option value="Property">Real Estate / Housing</option>
                  <option value="Lifestyle">Travel & Lifestyle</option>
                  <option value="Debt">Debt Payoff Milestone</option>
                </select>
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
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20"
                >
                  Create Goal & Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
