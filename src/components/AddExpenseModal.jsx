import React, { useState } from 'react';
import { X, Upload, Check, DollarSign, Users, Sparkles, Loader } from 'lucide-react';

export default function AddExpenseModal({
  isOpen,
  onClose,
  members,
  userNickname,
  handleAddExpense,
  triggerToast,
  isQuotaMode = false
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('groceries');
  const [paidBy, setPaidBy] = useState(userNickname || '');
  const [splitType, setSplitType] = useState('equal');
  const [selectedSplitMembers, setSelectedSplitMembers] = useState({});
  const [customSplitValues, setCustomSplitValues] = useState({});
  const [enableQuotaSplit, setEnableQuotaSplit] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      if (triggerToast) triggerToast('Please enter a valid description and amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (handleAddExpense) {
        await handleAddExpense({
          description,
          amount: Number(amount),
          category,
          paid_by: paidBy || userNickname,
          split_type: splitType,
          receiptFile
        });
      }
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg hud-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
              Add Shared Expense
            </h3>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
              Log an expense to split among room members.
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
          
          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Description</label>
              <input
                type="text"
                placeholder="e.g. Milk & Snacks"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
                required
              />
            </div>
          </div>

          {/* Paid By & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Paid By</label>
              <select
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
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
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] capitalize"
              >
                {['groceries', 'utilities', 'rent', 'dining', 'entertainment', 'other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* In Quota Mode: Optional Split Toggle */}
          {isQuotaMode && (
            <div className="p-3 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A3827] dark:text-slate-100">Split Mode</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Optional</span>
                </div>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                  {enableQuotaSplit ? 'Custom roommate split active.' : 'Off by default — expense credits directly to quota.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableQuotaSplit(!enableQuotaSplit)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enableQuotaSplit ? 'bg-[#1A3827] dark:bg-[#A3E635]' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md ring-0 transition duration-200 ease-in-out ${enableQuotaSplit ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          )}

          {/* Split Mode Selector (Classic Split Mode or Quota Mode with Toggle ON) */}
          {(!isQuotaMode || enableQuotaSplit) && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Split Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {['equal', 'custom', 'percentage'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold capitalize transition-all border ${
                      splitType === type
                        ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 border-[#1A3827] dark:border-[#A3E635] shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-[#5C6E5C] dark:text-slate-400 border-[#E3E8E3] dark:border-slate-800 hover:text-[#1A3827]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Receipt Attachment Upload */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">
              Receipt Image <span className="text-[#5C6E5C] dark:text-slate-500 font-normal">(optional)</span>
            </label>
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-colors bg-[#F6F8F6] dark:bg-slate-950">
              <Upload className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400" />
              <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400 truncate">
                {receiptFile ? receiptFile.name : 'Upload bill / receipt photo'}
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {receiptPreview && (
              <div className="relative mt-2 w-20 h-20 rounded-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800">
                <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Expense</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
