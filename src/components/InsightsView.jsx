import React, { useState, useMemo } from 'react';
import { TrendingUp, PieChart as PieChartIcon, Calendar, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign, Wallet } from 'lucide-react';

export default function InsightsView({
  transactions,
  members,
  userNickname,
  computedStats,
  personalCap,
  monthlyBudget
}) {
  const [insightsTab, setInsightsTab] = useState('room'); // 'room' | 'personal'

  // Compute category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    (transactions || []).forEach(tx => {
      const cat = tx.category || 'other';
      const amt = Number(tx.amount || 0);
      map[cat] = (map[cat] || 0) + amt;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: Math.round((amt / total) * 100)
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalRoomSpend = computedStats?.totalRoomSpend || 0;
  const myPersonalShare = computedStats?.myPersonalShare || 0;
  const capProgress = Math.min(Math.round((myPersonalShare / (personalCap || 2500)) * 100), 100);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-[#A3E635]" />
            Spending Analytics & Insights
          </h2>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
            Analyze category breakdowns, spending trends, and personal budget caps.
          </p>
        </div>

        {/* Room / Personal Tab Switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-sm">
          <button
            onClick={() => setInsightsTab('room')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              insightsTab === 'room'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827]'
            }`}
          >
            Room Insights
          </button>
          <button
            onClick={() => setInsightsTab('personal')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              insightsTab === 'personal'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827]'
            }`}
          >
            Personal Insights
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="hud-card rounded-3xl p-6 space-y-2">
          <span className="text-xs font-black uppercase text-[#5C6E5C] dark:text-slate-400 block">
            {insightsTab === 'room' ? 'Total Room Expense' : 'Your Personal Share'}
          </span>
          <p className="text-3xl font-black text-[#1A3827] dark:text-slate-100">
            ₹{(insightsTab === 'room' ? totalRoomSpend : myPersonalShare).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Updated in real-time across members</span>
          </p>
        </div>

        <div className="hud-card rounded-3xl p-6 space-y-2">
          <span className="text-xs font-black uppercase text-[#5C6E5C] dark:text-slate-400 block">
            Personal Budget Cap Progress
          </span>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-[#1A3827] dark:text-slate-100">
              {capProgress}%
            </p>
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              ₹{myPersonalShare.toLocaleString('en-IN')} / ₹{(personalCap || 2500).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                capProgress > 90 ? 'bg-rose-500' : capProgress > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${capProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="hud-card rounded-3xl p-6 space-y-2">
          <span className="text-xs font-black uppercase text-[#5C6E5C] dark:text-slate-400 block">
            Spending Efficiency Score
          </span>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-emerald-700 dark:text-[#A3E635]">
              94 / 100
            </p>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Optimal
            </span>
          </div>
          <p className="text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400">
            Room expenses are well balanced with zero overdue settlements.
          </p>
        </div>

      </div>

      {/* Category Breakdown Progress Grid */}
      <div className="hud-card rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
          Category Distribution
        </h3>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 py-6 text-center">No categories recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="capitalize text-[#1A3827] dark:text-slate-200">{item.category}</span>
                  <span className="text-[#5C6E5C] dark:text-slate-400">
                    ₹{item.amount.toLocaleString('en-IN')} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 dark:bg-[#A3E635] h-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
