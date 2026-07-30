import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FundTracker({
  members = [],
  userNickname = '',
  myFunds = [],
  myFundSpends = [],
  triggerToast
}) {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const activeFunds = myFunds || [];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600 dark:text-[#A3E635]" />
            Room Group Funds & Savings
          </h2>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
            Manage shared room funds, maintenance reserves, and group savings goals.
          </p>
        </div>
      </div>

      {/* Funds Grid */}
      {activeFunds.length === 0 ? (
        <div className="hud-card rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#5C6E5C]">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100">No active group funds yet</h3>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400">Create a room fund to track group savings and shared pool reserves.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeFunds.map(fund => {
            const fundAmount = Number(fund.amount || 0);
            const fundSpends = (myFundSpends || []).filter(s => s.splitType === String(fund.id));
            const totalSpent = fundSpends.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
            const remaining = fundAmount - totalSpent;
            const progress = fundAmount > 0 ? Math.min(Math.round((totalSpent / fundAmount) * 100), 100) : 0;

            return (
              <div key={fund.id} className="hud-card-interactive rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {fund.title || 'Group Fund'}
                    </span>
                    <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
                      {progress}% Spent
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                    {fund.title || 'Room Reserve'}
                  </h3>

                  <div className="flex items-baseline justify-between pt-1">
                    <p className="text-2xl font-black text-emerald-700 dark:text-[#A3E635]">
                      ₹{remaining.toLocaleString('en-IN')}
                    </p>
                    <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
                      Initial: ₹{fundAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 dark:bg-[#A3E635] h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
