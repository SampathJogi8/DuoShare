import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FundTracker({
  members,
  userNickname,
  triggerToast
}) {
  const [funds, setFunds] = useState([
    { id: 1, name: 'Apartment Maintenance Fund', current: 14500, target: 20000, category: 'maintenance' },
    { id: 2, name: 'Group Emergency Reserve', current: 8200, target: 10000, category: 'emergency' },
    { id: 3, name: 'Weekend Party & Snacks Fund', current: 3400, target: 5000, category: 'leisure' }
  ]);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0 || !selectedFund) return;

    setFunds(prev => prev.map(f => {
      if (f.id === selectedFund.id) {
        return { ...f, current: f.current + Number(depositAmount) };
      }
      return f;
    }));

    if (triggerToast) triggerToast(`Deposited ₹${depositAmount} into ${selectedFund.name}!`);
    setDepositAmount('');
    setIsDepositOpen(false);
    setSelectedFund(null);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {funds.map(fund => {
          const progress = Math.min(Math.round((fund.current / fund.target) * 100), 100);

          return (
            <div key={fund.id} className="hud-card-interactive rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {fund.category}
                  </span>
                  <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
                    {progress}% Funded
                  </span>
                </div>

                <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                  {fund.name}
                </h3>

                <div className="flex items-baseline justify-between pt-1">
                  <p className="text-2xl font-black text-emerald-700 dark:text-[#A3E635]">
                    ₹{fund.current.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
                    Target: ₹{fund.target.toLocaleString('en-IN')}
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

              <button
                onClick={() => {
                  setSelectedFund(fund);
                  setIsDepositOpen(true);
                }}
                className="w-full py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Contribute / Deposit</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Deposit Dialog Modal */}
      {isDepositOpen && selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm hud-card rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
              Contribute to {selectedFund.name}
            </h3>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Deposit Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="flex-1 py-2.5 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
