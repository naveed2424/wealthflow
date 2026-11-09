import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Landmark, 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  Home, 
  Coffee, 
  Zap, 
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign,
  Vault
} from 'lucide-react';

interface MoneyFlowAnimationProps {
  currencySymbol: string;
}

export const MoneyFlowAnimation: React.FC<MoneyFlowAnimationProps> = ({ currencySymbol }) => {
  const [activeNode, setActiveNode] = useState<string>('bank');
  const [flowSpeed, setFlowSpeed] = useState<'normal' | 'fast'>('normal');
  const [isAutoSweeping, setIsAutoSweeping] = useState(true);

  // Dynamic particle count
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; delay: number }>>([]);

  useEffect(() => {
    // Generate ambient golden spark particles
    const sparks = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95,
      top: Math.random() * 85,
      delay: Math.random() * 3,
    }));
    setParticles(sparks);
  }, []);

  const nodes = [
    {
      id: 'central',
      name: 'Central Income Terminal',
      type: 'Source',
      amount: `${currencySymbol}5,000 / mo`,
      sub: 'Direct Payroll & Inflow',
      color: '#f59e0b',
      icon: Landmark,
      desc: 'Primary liquidity entry point. Incoming funds are split in real-time according to the 50/30/20 algorithmic rules.',
    },
    {
      id: 'bank',
      name: 'High-Yield Reserve Bank',
      type: 'Bank & Vault',
      amount: `${currencySymbol}12,850`,
      sub: '5.2% APY Compounding',
      color: '#fbbf24',
      icon: Building2,
      desc: 'FDIC-insured digital liquidity reservoir. Automated micro-sweeps deposit idle change here every midnight.',
    },
    {
      id: 'daily',
      name: 'Daily Life & Living Hub',
      type: 'Everyday Outflow',
      amount: `${currencySymbol}2,450 / mo`,
      sub: 'Food, Rent & Utilities',
      color: '#f97316',
      icon: Home,
      desc: 'Essential living expenditures. Monitored continuously to prevent subtle lifestyle creep and dining leakages.',
    },
    {
      id: 'lifestyle',
      name: 'Discretionary Lifestyle',
      type: 'Wants & Coffee',
      amount: `${currencySymbol}890 / mo`,
      sub: 'Dining & Subscriptions',
      color: '#ec4899',
      icon: Coffee,
      desc: 'Flexible lifestyle spend. Governed by daily safe burn-rate caps so you enjoy life guilt-free.',
    },
    {
      id: 'investments',
      name: 'Autonomous Wealth House',
      type: 'Growth Engine',
      amount: `${currencySymbol}38,400`,
      sub: '+9.4% Annualized Return',
      color: '#10b981',
      icon: TrendingUp,
      desc: 'Tax-advantaged index funds & compound dividends. Builds generational security while you sleep.',
    },
  ];

  const selectedNode = nodes.find(n => n.id === activeNode) || nodes[1];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#090d16] via-[#050811] to-[#020408] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
      {/* Ambient glowing gold aura & grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Golden Sparks */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60 animate-ping pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${2.5 + p.delay}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Section Header with Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Live Golden Architecture
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Interactive Money Flow & Bank Organizers
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Watch real-time golden currency streams route capital between your central income, commercial banks, daily life organizers, and automated compounding vaults.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFlowSpeed(flowSpeed === 'normal' ? 'fast' : 'normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              flowSpeed === 'fast'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Flow: {flowSpeed === 'fast' ? 'Turbo' : 'Normal'}
          </button>
          <button
            onClick={() => setIsAutoSweeping(!isAutoSweeping)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              isAutoSweeping
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Auto-Sweeps: {isAutoSweeping ? 'Active' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Main Visual Interactive Stage */}
      <div className="relative z-10 my-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 p-4 sm:p-6 backdrop-blur-md">
        {/* SVG animated track connecting the bank buildings */}
        <div className="relative w-full h-80 sm:h-96">
          <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 800 360">
            <defs>
              <linearGradient id="goldTrack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Static background rail */}
            <path
              d="M 120 180 Q 250 80 400 80 T 680 80 M 400 80 Q 400 220 400 280 M 400 80 Q 550 200 680 280 M 400 80 Q 250 220 120 280"
              fill="none"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Animated Golden Money Stream 1: Income to Central Bank */}
            <path
              d="M 120 180 Q 250 80 400 80"
              fill="none"
              stroke="url(#goldTrack)"
              strokeWidth="3.5"
              filter="url(#goldGlow)"
              className={flowSpeed === 'fast' ? 'animate-money-stream-fast' : 'animate-money-stream'}
            />

            {/* Stream 2: Bank to High-Yield Reserve Vault */}
            <path
              d="M 400 80 L 680 80"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.5"
              filter="url(#goldGlow)"
              className={flowSpeed === 'fast' ? 'animate-money-stream-fast' : 'animate-money-stream'}
            />

            {/* Stream 3: Bank to Daily Life Living Hub */}
            <path
              d="M 400 80 Q 250 220 120 280"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              filter="url(#goldGlow)"
              className={flowSpeed === 'fast' ? 'animate-money-stream-fast' : 'animate-money-stream'}
            />

            {/* Stream 4: Bank to Discretionary Lifestyle */}
            <path
              d="M 400 80 Q 400 220 400 280"
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
              className={flowSpeed === 'fast' ? 'animate-money-stream-fast' : 'animate-money-stream'}
            />

            {/* Stream 5: Bank to Autonomous Wealth Engine */}
            <path
              d="M 400 80 Q 550 200 680 280"
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              filter="url(#goldGlow)"
              className={flowSpeed === 'fast' ? 'animate-money-stream-fast' : 'animate-money-stream'}
            />
          </svg>

          {/* Node 1: Central Income Terminal (Left-Center) */}
          <div
            onClick={() => setActiveNode('central')}
            className={`absolute top-1/2 left-[5%] sm:left-[8%] -translate-y-1/2 cursor-pointer transition-all duration-300 p-3 sm:p-4 rounded-2xl border text-center z-20 ${
              activeNode === 'central'
                ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/30 scale-110 ring-2 ring-amber-400/50'
                : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/50 hover:scale-105'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black mx-auto mb-2 shadow-md">
              <Landmark className="w-6 h-6 text-slate-950 animate-coin-float" />
            </div>
            <div className="text-xs font-bold text-white whitespace-nowrap">Income Terminal</div>
            <div className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">{currencySymbol}5,000 / mo</div>
          </div>

          {/* Node 2: Primary Bank & Sweeper Engine (Top Center) */}
          <div
            onClick={() => setActiveNode('bank')}
            className={`absolute top-[6%] left-1/2 -translate-x-1/2 cursor-pointer transition-all duration-300 p-3 sm:p-4 rounded-2xl border text-center z-20 ${
              activeNode === 'bank'
                ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/40 scale-110 ring-2 ring-amber-400/50'
                : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/50 hover:scale-105'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black mx-auto mb-2 shadow-lg glow-gold">
              <Building2 className="w-7 h-7 text-slate-950" />
            </div>
            <div className="text-xs sm:text-sm font-black text-white whitespace-nowrap">Reserve Bank & Vault</div>
            <div className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">5.2% APY • {currencySymbol}12,850</div>
          </div>

          {/* Node 3: Daily Life Living Expenses (Bottom Left) */}
          <div
            onClick={() => setActiveNode('daily')}
            className={`absolute bottom-[4%] left-[6%] sm:left-[10%] cursor-pointer transition-all duration-300 p-3 sm:p-4 rounded-2xl border text-center z-20 ${
              activeNode === 'daily'
                ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/30 scale-110 ring-2 ring-amber-400/50'
                : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/50 hover:scale-105'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-slate-950 font-black mx-auto mb-2 shadow-md">
              <Home className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-xs font-bold text-white whitespace-nowrap">Daily Living Hub</div>
            <div className="text-[10px] text-orange-400 font-mono font-bold mt-0.5">{currencySymbol}2,450 / mo</div>
          </div>

          {/* Node 4: Discretionary Lifestyle (Bottom Center) */}
          <div
            onClick={() => setActiveNode('lifestyle')}
            className={`absolute bottom-[4%] left-1/2 -translate-x-1/2 cursor-pointer transition-all duration-300 p-3 sm:p-4 rounded-2xl border text-center z-20 ${
              activeNode === 'lifestyle'
                ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/30 scale-110 ring-2 ring-amber-400/50'
                : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/50 hover:scale-105'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-slate-950 font-black mx-auto mb-2 shadow-md">
              <Coffee className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-xs font-bold text-white whitespace-nowrap">Lifestyle & Coffee</div>
            <div className="text-[10px] text-pink-400 font-mono font-bold mt-0.5">{currencySymbol}890 / mo</div>
          </div>

          {/* Node 5: Autonomous Wealth House (Bottom Right) */}
          <div
            onClick={() => setActiveNode('investments')}
            className={`absolute bottom-[4%] right-[6%] sm:right-[10%] cursor-pointer transition-all duration-300 p-3 sm:p-4 rounded-2xl border text-center z-20 ${
              activeNode === 'investments'
                ? 'bg-slate-900 border-emerald-400 shadow-xl shadow-emerald-500/30 scale-110 ring-2 ring-emerald-400/50'
                : 'bg-slate-950/90 border-slate-800 hover:border-emerald-500/50 hover:scale-105'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black mx-auto mb-2 shadow-md">
              <TrendingUp className="w-6 h-6 text-slate-950 animate-coin-float" />
            </div>
            <div className="text-xs font-bold text-white whitespace-nowrap">Autonomous Wealth</div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">{currencySymbol}38,400</div>
          </div>

          {/* Golden Coin indicators floating along paths */}
          <div className="absolute top-[28%] left-[26%] text-amber-300 font-black text-xs animate-coin-float flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full border border-amber-400/40 shadow-lg">
            <span>🪙</span>
            <span>+{currencySymbol}15/day</span>
          </div>
          <div className="absolute top-[28%] right-[26%] text-emerald-300 font-black text-xs animate-coin-float flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full border border-emerald-400/40 shadow-lg">
            <span>📈</span>
            <span>Compounding</span>
          </div>
        </div>

        {/* Selected Building Details Drawer */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <selectedNode.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedNode.desc}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Telemetry Balance</span>
            <span className="text-base font-black text-amber-400">{selectedNode.amount}</span>
            <span className="text-[11px] text-slate-400 block">{selectedNode.sub}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
