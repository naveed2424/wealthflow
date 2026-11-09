import React, { useState, useMemo } from 'react';
import { 
  Coffee, 
  Clock, 
  Trash2, 
  Plus, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  DollarSign, 
  Calculator,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DailyLifeExpenseToolsProps {
  currencySymbol: string;
}

interface MicroExpense {
  id: string;
  name: string;
  cost: number;
  frequencyDaysPerWeek: number;
  category: string;
}

const DEFAULT_MICRO_EXPENSES: MicroExpense[] = [
  { id: '1', name: 'Specialty Latte / Flat White', cost: 6.50, frequencyDaysPerWeek: 5, category: 'Beverage' },
  { id: '2', name: 'Takeout / Fast Casual Lunch', cost: 16.00, frequencyDaysPerWeek: 4, category: 'Food' },
  { id: '3', name: 'Workday Rideshare vs Public Transit', cost: 22.00, frequencyDaysPerWeek: 3, category: 'Transport' },
  { id: '4', name: 'Convenience Snacks & Energy Drinks', cost: 5.50, frequencyDaysPerWeek: 4, category: 'Snacks' },
  { id: '5', name: 'Unplanned Evening DoorDash/Delivery', cost: 34.00, frequencyDaysPerWeek: 2, category: 'Food' },
];

interface SubscriptionItem {
  id: string;
  name: string;
  monthlyCost: number;
  active: boolean;
  essential: boolean;
}

const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: 's1', name: 'Streaming Bundle (Netflix & Max)', monthlyCost: 32.99, active: true, essential: false },
  { id: 's2', name: 'Music Streaming (Spotify / Apple)', monthlyCost: 11.99, active: true, essential: false },
  { id: 's3', name: 'Food Delivery Pass (DashPass / UberOne)', monthlyCost: 9.99, active: true, essential: false },
  { id: 's4', name: 'Premium Gym & Fitness Club', monthlyCost: 65.00, active: true, essential: true },
  { id: 's5', name: 'Cloud Storage & Productivity Suite', monthlyCost: 14.99, active: true, essential: true },
  { id: 's6', name: 'Forgotten Fitness / Meditation App', monthlyCost: 12.99, active: true, essential: false },
  { id: 's7', name: 'Prime / Fast Shipping Membership', monthlyCost: 14.99, active: true, essential: false },
];

export const DailyLifeExpenseTools: React.FC<DailyLifeExpenseToolsProps> = ({ currencySymbol }) => {
  const [activeTab, setActiveTab] = useState<'coffee' | 'hours' | 'subs' | 'runway'>('coffee');

  // Tool 1: Coffee Factor state
  const [microExpenses, setMicroExpenses] = useState<MicroExpense[]>(DEFAULT_MICRO_EXPENSES);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemFreq, setNewItemFreq] = useState(5);

  // Tool 2: True Hourly Wage Work-Time Cost state
  const [hourlyWage, setHourlyWage] = useState<number>(28);
  const [purchaseName, setPurchaseName] = useState<string>('Weekend Designer Dinner & Drinks');
  const [purchasePrice, setPurchasePrice] = useState<number>(140);

  // Tool 3: Subscriptions state
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(DEFAULT_SUBSCRIPTIONS);

  // Tool 4: Emergency Runway state
  const [liquidCash, setLiquidCash] = useState<number>(8500);
  const [dailyLivingCost, setDailyLivingCost] = useState<number>(85);

  // Add micro expense
  const handleAddMicroExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const costVal = parseFloat(newItemCost);
    if (!newItemName.trim() || isNaN(costVal) || costVal <= 0) return;

    const newExp: MicroExpense = {
      id: 'm-' + Date.now(),
      name: newItemName.trim(),
      cost: costVal,
      frequencyDaysPerWeek: newItemFreq,
      category: 'Lifestyle',
    };
    setMicroExpenses([...microExpenses, newExp]);
    setNewItemName('');
    setNewItemCost('');
  };

  const handleDeleteMicroExpense = (id: string) => {
    setMicroExpenses(microExpenses.filter(m => m.id !== id));
  };

  // Calculations for Tool 1 (Coffee Factor)
  const coffeeFactorTotals = useMemo(() => {
    let dailyAverage = 0;
    microExpenses.forEach(item => {
      dailyAverage += (item.cost * item.frequencyDaysPerWeek) / 7;
    });

    const monthlyCost = dailyAverage * 30.4;
    const yearlyCost = dailyAverage * 365;

    // 10-year compound interest at 8% annual return if saved instead
    // FV = P * (((1 + r)^n - 1) / r) where P is monthly deposit
    const monthlyRate = 0.08 / 12;
    const months = 120;
    const tenYearCompound = monthlyCost * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return {
      dailyAverage: Math.round(dailyAverage),
      monthlyCost: Math.round(monthlyCost),
      yearlyCost: Math.round(yearlyCost),
      tenYearCompound: Math.round(tenYearCompound),
    };
  }, [microExpenses]);

  // Calculations for Tool 2 (Work-Time Cost)
  const hoursOfLaborRequired = hourlyWage > 0 ? (purchasePrice / hourlyWage).toFixed(1) : '0';
  const workDaysRequired = hourlyWage > 0 ? (purchasePrice / (hourlyWage * 8)).toFixed(1) : '0';

  // Calculations for Tool 3 (Subscriptions)
  const activeSubs = subscriptions.filter(s => s.active);
  const totalMonthlySubs = activeSubs.reduce((acc, s) => acc + s.monthlyCost, 0);
  const totalYearlySubs = totalMonthlySubs * 12;
  const nonEssentialMonthly = activeSubs.filter(s => !s.essential).reduce((acc, s) => acc + s.monthlyCost, 0);

  const toggleSubscription = (id: string) => {
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // Calculations for Tool 4 (Runway)
  const runwayDays = dailyLivingCost > 0 ? Math.round(liquidCash / dailyLivingCost) : 0;
  const runwayMonths = (runwayDays / 30.4).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5" />
            Everyday Financial Reality Check
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Daily Life Expense Audits & Lifestyle Creep Analyzers
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Unmask where your paycheck evaporates every day. Test micro-spending leaks, convert purchases into hours of labor, audit zombie subscriptions, and measure your exact emergency survival runway.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('coffee')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'coffee'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            Daily "Coffee Factor" Multiplier
          </button>

          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'hours'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            True Hourly Wage Life-Cost
          </button>

          <button
            onClick={() => setActiveTab('subs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'subs'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Subscription Vampire Killer
          </button>

          <button
            onClick={() => setActiveTab('runway')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'runway'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency Runway & Burn Rate
          </button>
        </div>
      </div>

      {/* TOOL 1: The "Coffee Factor" Multiplier */}
      {activeTab === 'coffee' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Daily Outflow</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                {currencySymbol}{coffeeFactorTotals.dailyAverage}/day
              </div>
              <span className="text-[11px] text-slate-500">Unnoticed everyday habit cost</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Monthly Drain</span>
              <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {currencySymbol}{coffeeFactorTotals.monthlyCost.toLocaleString()}/mo
              </div>
              <span className="text-[11px] text-slate-500">Equals a car payment or rent bump</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Annual Sunk Cost</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {currencySymbol}{coffeeFactorTotals.yearlyCost.toLocaleString()}/yr
              </div>
              <span className="text-[11px] text-slate-500">Vanishing into thin air</span>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl">
              <span className="text-xs text-emerald-400 font-medium">10-Yr Compounding Lost</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {currencySymbol}{coffeeFactorTotals.tenYearCompound.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400/80">If invested at 8% index return</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of micro habits (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-400" />
                  Your Everyday Micro-Habits
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {microExpenses.length} habits tracked
                </span>
              </div>

              <div className="space-y-3">
                {microExpenses.map(item => {
                  const monthly = Math.round((item.cost * item.frequencyDaysPerWeek / 7) * 30.4);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {currencySymbol}{item.cost.toFixed(2)} • {item.frequencyDaysPerWeek} days/week
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-400">{currencySymbol}{monthly}/mo</div>
                          <div className="text-[10px] text-slate-500">{currencySymbol}{(monthly * 12).toLocaleString()}/yr</div>
                        </div>
                        <button
                          onClick={() => handleDeleteMicroExpense(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Custom Micro Expense (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Add Another Daily Habit</h3>
                <p className="text-xs text-slate-400 mb-4">Test your own daily snacks, gas station stops, or vape habits</p>

                <form onSubmit={handleAddMicroExpense} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Habit Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Afternoon Energy Drink, Daily Pastry"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Per Occurrence ({currencySymbol})</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      placeholder="5.00"
                      value={newItemCost}
                      onChange={e => setNewItemCost(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency: {newItemFreq} Days Per Week</label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={newItemFreq}
                      onChange={e => setNewItemFreq(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Reality Check
                  </button>
                </form>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
                💡 <strong>The Mindset Shift:</strong> You do not have to eliminate every luxury. But redirecting just <strong>half</strong> of these daily micro-expenses into high-yield accounts generates over <strong>{currencySymbol}{Math.round(coffeeFactorTotals.tenYearCompound / 2).toLocaleString()}</strong> in net worth!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: True Hourly Wage Work-Time Cost */}
      {activeTab === 'hours' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Life-Energy Converter</span>
              <h3 className="text-xl font-bold text-white mt-1">What Does It Really Cost You in Hours of Labor?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Money is nothing more than your finite life energy stored in paper form. Convert any expense into actual working hours on the job.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Take-Home Hourly Pay (After Taxes)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={e => setHourlyWage(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                If annual net salary is {currencySymbol}50k, your take-home is ~{currencySymbol}25/hr.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Item or Purchase You Want to Make</label>
              <input
                type="text"
                value={purchaseName}
                onChange={e => setPurchaseName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price Tag ({currencySymbol})</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Sushi Dinner', price: 90 },
                { name: 'Smart Watch', price: 350 },
                { name: 'Flagship Smartphone', price: 1199 },
                { name: 'Weekend Trip', price: 650 },
              ].map(ex => (
                <button
                  key={ex.name}
                  onClick={() => { setPurchaseName(ex.name); setPurchasePrice(ex.price); }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                >
                  {ex.name} ({currencySymbol}{ex.price})
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center items-center text-center p-6 bg-slate-950 rounded-2xl border border-amber-500/30">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <span className="text-xs text-amber-400 uppercase tracking-widest font-black">
              Life Labor Cost
            </span>

            <div className="text-4xl sm:text-6xl font-black text-white mt-2 mb-1">
              {hoursOfLaborRequired} <span className="text-xl sm:text-2xl text-amber-400 font-bold">Hours</span>
            </div>

            <div className="text-sm font-semibold text-slate-300 mb-4">
              Equivalent to <span className="text-amber-400 font-bold">{workDaysRequired} Full 8-Hour Workdays</span>
            </div>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              To buy <strong>"{purchaseName}"</strong> at {currencySymbol}{purchasePrice}, you must wake up, commute, and work for <strong>{hoursOfLaborRequired} uninterrupted hours</strong> at {currencySymbol}{hourlyWage}/hr. Ask yourself: <em>is this item worth giving away a full day of your life?</em>
            </p>
          </div>
        </div>
      )}

      {/* TOOL 3: Subscription Vampire Killer */}
      {activeTab === 'subs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Monthly Active Subscriptions</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {currencySymbol}{totalMonthlySubs.toFixed(2)}/mo
              </div>
              <span className="text-[11px] text-slate-500">{activeSubs.length} services billed automatically</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Annual Subscription Drain</span>
              <div className="text-2xl font-black text-white mt-1">
                {currencySymbol}{totalYearlySubs.toFixed(0)}/yr
              </div>
              <span className="text-[11px] text-slate-500">Every single year on recurring autopilot</span>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl">
              <span className="text-xs text-emerald-400 font-medium">Potential Non-Essential Pruning</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                +{currencySymbol}{nonEssentialMonthly.toFixed(2)}/mo
              </div>
              <span className="text-[11px] text-emerald-400/80">Recaptured if non-essentials are cut</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Interactive Subscription Prune Simulator</h3>
                <p className="text-xs text-slate-400">Toggle subscriptions OFF to see how much cash you instantly free up</p>
              </div>
              <button
                onClick={() => setSubscriptions(subscriptions.map(s => s.essential ? s : { ...s, active: false }))}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl bg-amber-950/40"
              >
                Prune All Non-Essentials
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subscriptions.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubscription(sub.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    sub.active
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      : 'bg-emerald-950/20 border-emerald-500/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      sub.active ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-emerald-500 border-emerald-500 text-slate-950'
                    }`}>
                      {sub.active ? <Trash2 className="w-3 h-3" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {sub.name}
                        {sub.essential && (
                          <span className="text-[9px] text-blue-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-500/20">Essential</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {sub.active ? 'Billed monthly' : '✅ Canceled in simulation'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-bold ${sub.active ? 'text-white' : 'text-emerald-400 line-through'}`}>
                      {currencySymbol}{sub.monthlyCost.toFixed(2)}/mo
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {currencySymbol}{(sub.monthlyCost * 12).toFixed(0)}/yr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: Emergency Runway & Daily Burn Survival Counter */}
      {activeTab === 'runway' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Crisis Shield</span>
              <h3 className="text-xl font-bold text-white mt-1">Emergency Cash Runway Calculator</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                If all income stopped tomorrow, how long can your household survive before running out of funds?
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Liquid Cash Reserves (Checking + High-Yield Savings)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                <input
                  type="number"
                  value={liquidCash}
                  onChange={e => setLiquidCash(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Living Cost (Essential Needs + Survival Burn)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                <input
                  type="number"
                  value={dailyLivingCost}
                  onChange={e => setDailyLivingCost(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Average US household baseline is between {currencySymbol}75 and {currencySymbol}120 per day.
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center items-center text-center p-6 bg-slate-950 rounded-2xl border border-amber-500/30">
            <span className="text-xs text-amber-400 uppercase tracking-widest font-black">
              Survival Runway Capacity
            </span>

            <div className="text-5xl sm:text-7xl font-black text-white mt-2 mb-1">
              {runwayMonths} <span className="text-xl sm:text-3xl text-amber-400 font-bold">Months</span>
            </div>

            <div className="text-sm font-semibold text-slate-300 mb-4">
              ({runwayDays} total days of zero-income safety)
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border mb-4 ${
              parseFloat(runwayMonths) >= 6
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                : parseFloat(runwayMonths) >= 3
                ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                : 'bg-rose-950 text-rose-400 border-rose-500/30'
            }`}>
              {parseFloat(runwayMonths) >= 6
                ? '🛡️ Tier 1 Fortress: Superior Economic Resilience'
                : parseFloat(runwayMonths) >= 3
                ? '⚖️ Standard Safe Cushion: Adequate Buffer'
                : '⚠️ Fragile: High Risk of Liquidity Shock'}
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Financial planners recommend maintaining <strong>3 to 6 months</strong> of daily survival expenses in a high-yield account yielding 4.5%+ APY.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
