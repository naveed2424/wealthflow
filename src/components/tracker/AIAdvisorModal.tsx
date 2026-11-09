import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { AIAdvisorInsight } from '../../types/finance';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: AIAdvisorInsight | null;
  currencySymbol: string;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  insight,
  currencySymbol,
}) => {
  if (!isOpen || !insight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-amber-400 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">
            AI Financial Co-Pilot Report
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Cashflow & Spending Audit</h2>
            <p className="text-xs text-slate-400">Actionable intelligence to increase monthly savings velocity</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Health Score</span>
              <span className="text-2xl font-black text-emerald-400">{insight.healthScore}/100</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Potential Savings</span>
              <span className="text-sm font-bold text-amber-400">+{insight.monthlySavingsEstimated}/mo</span>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-slate-200 text-sm leading-relaxed mb-6">
          {insight.statusSummary}
        </div>

        {/* Leaks Identified */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" />
            Detected Cash Leaks & Inefficiencies
          </h3>
          <div className="space-y-2">
            {insight.leaksIdentified.map((leak, idx) => (
              <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2.5 text-xs text-slate-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{leak}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended AI Tools */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            Recommended AI Tools to Automate Savings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insight.aiToolRecommendations.map((tool, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{tool.name}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {tool.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Action Steps */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Immediate 7-Day Action Plan
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {insight.actionSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition shadow-lg"
          >
            Got It, Implement Plan
          </button>
        </div>
      </div>
    </div>
  );
};
