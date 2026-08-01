import { useState, useEffect } from 'react';
import { X, HandCoins, ArrowRight, Loader } from 'lucide-react';

export default function SettleUpModal({
  isOpen,
  onClose,
  members,
  userNickname,
  handleSettleUp,
  triggerToast
}) {
  const [payer, setPayer] = useState(userNickname || '');
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultReceiver = (members && members.length > 0)
    ? (members.find(m => m.nickname !== userNickname) || members[0])?.nickname || ''
    : '';

  const receiver = selectedReceiver || defaultReceiver;

  const upiId = receiver ? (localStorage.getItem(`upi_id_${receiver}`) || '') : '';

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payer || !receiver || payer === receiver || !amount || Number(amount) <= 0) {
      if (triggerToast) triggerToast('Please select valid payer, receiver, and settlement amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (handleSettleUp) {
        await handleSettleUp({
          payer,
          receiver,
          amount: Number(amount)
        });
      }
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const generateUpiUrl = () => {
    if (!upiId || !amount) return null;
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(receiver)}&am=${encodeURIComponent(amount)}&cu=INR`;
  };

  const upiUrl = generateUpiUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md hud-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
              Settle Room Balance
            </h3>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
              Record a direct payment between room members.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F0F4F1] dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Payer & Receiver Selection */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Who is Paying?</label>
              <select
                value={payer}
                onChange={e => setPayer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
              >
                {(members || []).map(m => (
                  <option key={m.id || m.nickname} value={m.nickname}>
                    {m.nickname} {m.nickname === userNickname ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Who is Receiving?</label>
              <select
                value={receiver}
                onChange={e => setSelectedReceiver(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
              >
                {(members || []).filter(m => m.nickname !== payer).map(m => (
                  <option key={m.id || m.nickname} value={m.nickname}>
                    {m.nickname} {m.nickname === userNickname ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settlement Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Amount Paid (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-black text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
              required
            />
          </div>

          {/* UPI Direct Link Section */}
          {upiUrl && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-2">
              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>UPI Quick Pay Link</span>
                <span className="font-mono text-[10px] font-normal">{upiId}</span>
              </p>

              <a
                href={upiUrl}
                className="w-full py-2 bg-emerald-600 dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <span>Open UPI App (Google Pay / PhonePe)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-[#E3E8E3] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#E3E8E3] dark:border-slate-800 text-xs font-extrabold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F0F4F1] dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-xs hover:bg-[#255038] dark:hover:bg-[#b7f34c] disabled:opacity-60 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Confirm Settlement</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
