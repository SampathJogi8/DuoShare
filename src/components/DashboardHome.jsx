import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  HandCoins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Search, 
  FileText, 
  TrendingUp, 
  Calendar, 
  SlidersHorizontal, 
  DollarSign, 
  Sparkles,
  ChevronRight,
  Eye,
  Trash2,
  PieChart,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function DashboardHome({
  transactions,
  members,
  userNickname,
  computedStats,
  monthlyBudget,
  personalCap,
  setIsAddExpenseOpen,
  setIsSettleModalOpen,
  setSettlePayer,
  setSettleReceiver,
  setSettleAmount,
  setActiveReceiptZoom,
  handleDeleteTransaction,
  handleEditTransaction,
  setCurrentView
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Filtered transactions list (excl. internal system markers)
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(tx => {
      // Exclude internal fund/system tags from room expenses feed
      if (
        tx.category === '__FUND_INIT__' ||
        tx.category === '__FUND_SPEND__' ||
        tx.category === '__SHOPPING__' ||
        tx.category === '__BILL__' ||
        tx.category === '__CHORE__' ||
        tx.category === '__DELETE_PROPOSAL__'
      ) {
        return false;
      }

      const titleStr = tx.title || tx.description || '';
      const payerStr = tx.paidBy || tx.paid_by || '';
      const catStr = tx.category || '';

      const matchesSearch = 
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payerStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catStr.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategoryFilter === 'all' || catStr.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategoryFilter]);

  // Display only top 8 recent transactions on dashboard
  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(0, 8);
  }, [filteredTransactions]);

  // Compute top spending categories (excl. system tags)
  const topCategories = useMemo(() => {
    const map = {};
    (transactions || []).forEach(tx => {
      if (
        tx.category === '__FUND_INIT__' ||
        tx.category === '__FUND_SPEND__' ||
        tx.category === '__SHOPPING__' ||
        tx.category === '__BILL__' ||
        tx.category === '__CHORE__' ||
        tx.category === '__DELETE_PROPOSAL__' ||
        tx.category === 'Payment'
      ) {
        return;
      }
      const cat = tx.category || 'General';
      const amt = Number(tx.amount || 0);
      map[cat] = (map[cat] || 0) + amt;
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions]);


  const netBalance = computedStats?.currentUserBalance || 0;
  const isOwed = netBalance > 0;
  const isSettled = Math.abs(netBalance) < 0.01;

  const roomTotal = computedStats?.totalRoomSpend || 0;
  const budgetLimit = monthlyBudget || 22000;
  const budgetPercent = Math.min(Math.round((roomTotal / budgetLimit) * 100), 100);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* 1. Net Balance Hero Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Main Net Balance Hero Panel */}
        <div className={`lg:col-span-2 hud-card rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between space-y-6 ${
          isOwed ? 'border-emerald-500/30 dark:border-emerald-500/20' : isSettled ? 'border-blue-500/30' : 'border-rose-500/30'
        }`}>
          {/* Ambient Background Gradient Accent */}
          <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 -z-10 ${
            isOwed ? 'bg-emerald-400' : isSettled ? 'bg-blue-400' : 'bg-rose-400'
          }`}></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400 block mb-1">
                Your Overall Balance
              </span>
              <div className="flex items-baseline gap-3">
                <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isOwed ? 'text-emerald-700 dark:text-[#A3E635]' : isSettled ? 'text-[#1A3827] dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isSettled ? '₹0.00' : `₹${Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                  isOwed 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                    : isSettled 
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  {isOwed ? 'You are owed' : isSettled ? 'Settled Up' : 'You owe'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="flex-1 sm:flex-none px-4 py-3 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 hover:bg-[#255038] dark:hover:bg-[#b7f34c] font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Expense</span>
              </button>

              <button
                onClick={() => setIsSettleModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 hover:bg-[#F0F4F1] dark:hover:bg-slate-700 font-extrabold text-xs rounded-2xl border border-[#E3E8E3] dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <HandCoins className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                <span>Settle Up</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E3E8E3]/60 dark:border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400 block">Total Room Spend</span>
              <p className="text-base font-black text-[#1A3827] dark:text-slate-200">
                ₹{roomTotal.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400 block">Your Share</span>
              <p className="text-base font-black text-[#1A3827] dark:text-slate-200">
                ₹{(computedStats?.sharedSpend || computedStats?.myPersonalShare || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-0.5">
              <span className="text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400 block">Personal Budget Cap</span>
              <p className="text-base font-black text-emerald-700 dark:text-[#A3E635]">
                ₹{(personalCap || 2500).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Room Member Balances Card */}
        <div className="hud-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Member Balances
            </h3>
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              {members?.length || 0} Roommates
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {(members || []).map(m => {
              const memBal = (computedStats?.balances && (m.uid in computedStats.balances)) 
                ? computedStats.balances[m.uid] 
                : (computedStats?.balances?.[m.id] || 0);
              const isMemOwed = memBal > 0;
              const isMemSettled = Math.abs(memBal) < 0.01;

              return (
                <div 
                  key={m.id || m.uid || m.nickname}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950/60 border border-[#E3E8E3] dark:border-slate-800/80 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {m.nickname?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200 truncate">
                      {m.nickname} {m.nickname === userNickname ? '(You)' : ''}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-xs font-black ${
                      isMemOwed ? 'text-emerald-700 dark:text-[#A3E635]' : isMemSettled ? 'text-[#5C6E5C] dark:text-slate-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isMemSettled ? 'Settled' : `${isMemOwed ? '+' : ''}₹${memBal.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Room Health & Quick Category Snapshot Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card A: Room Monthly Budget Meter */}
        <div className="hud-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
              Shared Room Budget Progress
            </span>
            <span className="text-xs font-extrabold text-[#5C6E5C] dark:text-slate-400">
              {budgetPercent}% used
            </span>
          </div>

          <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                budgetPercent > 90 ? 'bg-rose-500' : budgetPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
            <span>Spent: ₹{roomTotal.toLocaleString('en-IN')}</span>
            <span>Limit: ₹{budgetLimit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card B: Top Category Spending Snapshot */}
        <div className="hud-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Top Room Categories
            </span>
            <span className="text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400">
              Breakdown
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {topCategories.length === 0 ? (
              <span className="text-xs text-[#5C6E5C] dark:text-slate-400">No expenses recorded yet.</span>
            ) : (
              topCategories.map(cat => (
                <div 
                  key={cat.name}
                  className="px-3 py-1.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 flex items-center gap-2 shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200 capitalize">{cat.name}</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-[#A3E635]">₹{cat.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Transaction Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses, payers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-slate-100 shadow-sm"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'groceries', 'utilities', 'rent', 'dining', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all shrink-0 ${
                selectedCategoryFilter === cat
                  ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-[#5C6E5C] dark:text-slate-400 border border-[#E3E8E3] dark:border-slate-800 hover:text-[#1A3827]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Recent Transactions Feed (Limited to 8 Recent Items) */}
      <div className="hud-card rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
              Recent Transactions
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Showing {recentTransactions.length} of {filteredTransactions.length}
            </span>
          </div>

          {setCurrentView && filteredTransactions.length > 8 && (
            <button 
              onClick={() => setCurrentView('ledger')}
              className="text-xs font-extrabold text-[#1A3827] dark:text-[#A3E635] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#5C6E5C]">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              No matching expense transactions found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map(tx => {
              const txTitle = tx.title || tx.description || 'Expense';
              const txPayer = tx.paidBy || tx.paid_by || 'Roommate';
              const txCategory = tx.category || 'General';
              const txDate = tx.date || tx.created_at || tx.createdAt;
              const txSplitType = tx.splitType || tx.split_type || 'equal';
              const txReceipt = tx.receiptUrl || tx.receipt_url || tx.imageUrl;

              return (
                <div 
                  key={tx.id}
                  className="hud-card-interactive p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#A3E635] flex items-center justify-center font-black text-sm shrink-0">
                      {txCategory.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100 truncate">
                          {txTitle}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-300">
                          {txCategory}
                        </span>
                      </div>

                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold flex items-center gap-2">
                        <span>Paid by <strong className="text-[#1A3827] dark:text-slate-200">{txPayer}</strong></span>
                        <span>•</span>
                        <span>{txDate ? new Date(txDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E3E8E3] dark:border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <p className="text-base font-black text-[#1A3827] dark:text-slate-100">
                        ₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400 capitalize">
                        {txSplitType} split
                      </p>
                    </div>

                    {/* Actions (Receipt zoom & Delete) */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {txReceipt && (
                        <button
                          onClick={() => setActiveReceiptZoom(txReceipt)}
                          className="p-2 text-emerald-600 dark:text-[#A3E635] hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                          title="View Receipt Image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {handleDeleteTransaction && (
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Ledger Button at bottom of feed */}
        {setCurrentView && filteredTransactions.length > 8 && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setCurrentView('ledger')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#F6F8F6] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 hover:bg-[#EAF0EC] dark:hover:bg-slate-700 font-extrabold text-xs rounded-2xl border border-[#E3E8E3] dark:border-slate-700 transition-all inline-flex items-center justify-center gap-2"
            >
              <span>View All {filteredTransactions.length} Transactions in Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}


