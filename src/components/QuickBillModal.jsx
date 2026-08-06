import React, { useState, useMemo } from 'react';
import { 
  X, Receipt, Plus, Trash2, Download, Copy, Check, FileSpreadsheet, 
  Sparkles, DollarSign, ArrowRight, ShieldCheck, Printer, RefreshCw, Send
} from 'lucide-react';

export default function QuickBillModal({
  isOpen,
  onClose,
  userNickname = 'User',
  roomName = 'Room',
  triggerToast = () => {},
  exportItemizedBillToPDF = () => {},
  handleAddExpense = null
}) {
  // Metadata states
  const [billTitle, setBillTitle] = useState('Itemized Expense Receipt');
  const [merchantName, setMerchantName] = useState('Delivery & Food Outlets');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [billTime, setBillTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [currency, setCurrency] = useState('₹');
  const [notes, setNotes] = useState('Logged via DuoShare Quick Bill Builder');

  // Input view mode: 'smart' (bulk text parse) or 'table' (manual rows)
  const [inputMode, setInputMode] = useState('smart');

  // Raw bulk text input
  const [bulkText, setBulkText] = useState(
`blinkit : 9501
swiggy : 1800
instamart : 11153
zomato: 3923
burger king: 563
kfc: 748`
  );

  // Structured items list
  const [items, setItems] = useState([
    { id: '1', name: 'Blinkit', category: 'Groceries', amount: 9501, qty: 1 },
    { id: '2', name: 'Swiggy', category: 'Food & Dining', amount: 1800, qty: 1 },
    { id: '3', name: 'Instamart', category: 'Groceries', amount: 11153, qty: 1 },
    { id: '4', name: 'Zomato', category: 'Food & Dining', amount: 3923, qty: 1 },
    { id: '5', name: 'Burger King', category: 'Fast Food', amount: 563, qty: 1 },
    { id: '6', name: 'KFC', category: 'Fast Food', amount: 748, qty: 1 },
  ]);

  const [copiedText, setCopiedText] = useState(false);
  const [isSavingToRoom, setIsSavingToRoom] = useState(false);

  if (!isOpen) return null;

  // Helper to format currency in Indian format
  const formatAmount = (val) => {
    const num = Number(val) || 0;
    return `${currency}${num.toLocaleString('en-IN')}`;
  };

  // Smart Parser for Bulk Text
  const parseBulkText = (text) => {
    if (!text.trim()) return [];
    const lines = text.split('\n');
    const parsed = [];

    lines.forEach((line, idx) => {
      const clean = line.trim();
      if (!clean) return;

      // Regex matching formats: "Item Name : 1234" or "Item Name - 1234" or "Item Name 1234"
      const match = clean.match(/^(.+?)[:=-]\s*([₹$]?\s*[\d,]+(?:\.\d+)?)\s*$/i) ||
                    clean.match(/^(.+?)\s+([₹$]?\s*[\d,]+(?:\.\d+)?)\s*$/i);

      if (match) {
        const name = match[1].trim();
        const amtStr = match[2].replace(/[₹$,\s]/g, '');
        const amt = parseFloat(amtStr);

        if (name && !isNaN(amt)) {
          // Infer category
          let category = 'General';
          const lowerName = name.toLowerCase();
          if (lowerName.includes('blinkit') || lowerName.includes('instamart') || lowerName.includes('zepto') || lowerName.includes('grocery')) {
            category = 'Groceries';
          } else if (lowerName.includes('swiggy') || lowerName.includes('zomato') || lowerName.includes('dine') || lowerName.includes('food')) {
            category = 'Food & Dining';
          } else if (lowerName.includes('burger') || lowerName.includes('kfc') || lowerName.includes('mcd') || lowerName.includes('pizza')) {
            category = 'Fast Food';
          } else if (lowerName.includes('uber') || lowerName.includes('ola') || lowerName.includes('cab') || lowerName.includes('rapido')) {
            category = 'Travel';
          }

          parsed.push({
            id: `parsed_${Date.now()}_${idx}`,
            name,
            category,
            amount: amt,
            qty: 1
          });
        }
      }
    });

    return parsed;
  };

  // Apply parsed items from text area
  const handleApplyBulkText = () => {
    const parsed = parseBulkText(bulkText);
    if (parsed.length === 0) {
      triggerToast('Could not detect valid items. Use format "Item : Amount".');
      return;
    }
    setItems(parsed);
    triggerToast(`Parsed ${parsed.length} item(s) successfully!`);
  };

  // Load the exact user sample
  const handleLoadSample = () => {
    const sampleText = 
`blinkit : 9501
swiggy : 1800
instamart : 11153
zomato: 3923
burger king: 563
kfc: 748`;
    setBulkText(sampleText);
    setMerchantName('Swiggy, Blinkit & Outlets');
    setBillTitle('Delivery & Outlets Bill');
    const parsed = parseBulkText(sampleText);
    setItems(parsed);
    triggerToast('Sample bill loaded (Total ₹27,668)');
  };

  // Item Table Handlers
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: `item_${Date.now()}`, name: 'New Item', category: 'General', amount: 0, qty: 1 }
    ]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'amount' || field === 'qty' ? Math.max(0, Number(value) || 0) : value
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.amount * (item.qty || 1)), 0);
  }, [items]);

  const grandTotal = subtotal;

  const receiptRefCode = useMemo(() => {
    return `RC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, [isOpen]);

  // Export handlers
  const handleTriggerPDF = () => {
    if (items.length === 0) {
      triggerToast('Please add at least one transaction item.');
      return;
    }

    const billData = {
      title: billTitle,
      merchantName,
      date: billDate,
      time: billTime,
      referenceCode: receiptRefCode,
      currency,
      items,
      subtotal,
      grandTotal,
      notes,
      creator: userNickname,
      roomName
    };

    exportItemizedBillToPDF(billData);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;
    let csv = `Receipt Title,${billTitle}\nMerchant,${merchantName}\nDate,${billDate}\nReference,${receiptRefCode}\n\nItem Name,Category,Quantity,Amount (${currency})\n`;
    items.forEach(item => {
      csv += `"${item.name}","${item.category}",${item.qty || 1},${item.amount}\n`;
    });
    csv += `\nTOTAL,,,${grandTotal}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${billTitle.replace(/\s+/g, '_')}_Receipt.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV receipt downloaded!');
  };

  // Copy Plain Text / WhatsApp
  const handleCopySummary = () => {
    if (items.length === 0) return;
    let text = `🧾 *${billTitle.toUpperCase()}*\n`;
    text += `📍 Merchant: ${merchantName}\n`;
    text += `📅 Date: ${billDate} ${billTime}\n`;
    text += `🆔 Ref: ${receiptRefCode}\n`;
    text += `─────────────\n`;
    items.forEach(item => {
      text += `• ${item.name}: ${formatAmount(item.amount * (item.qty || 1))}\n`;
    });
    text += `─────────────\n`;
    text += `*TOTAL: ${formatAmount(grandTotal)}*\n`;
    text += `\nShared via DuoShare b9lls`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    triggerToast('Receipt summary copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Post directly into DuoShare Room Expenses
  const handleSaveToRoomExpenses = async () => {
    if (items.length === 0 || !handleAddExpense) return;
    setIsSavingToRoom(true);
    try {
      const breakdownNote = items.map(i => `${i.name}: ${formatAmount(i.amount)}`).join(', ');
      await handleAddExpense({
        description: `${billTitle} (${merchantName})`,
        amount: grandTotal,
        category: 'bills',
        paid_by: userNickname,
        split_type: 'equal',
        notes: `Itemized Receipt breakdown: [${breakdownNote}] | Ref: ${receiptRefCode}`
      });
      triggerToast(`Saved ${formatAmount(grandTotal)} bill directly to room expenses!`);
      setIsSavingToRoom(false);
      onClose();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to save expense.');
      setIsSavingToRoom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-[#A3E635] rounded-2xl">
              <Receipt className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Itemized Bill & Receipt Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Enter multiple manual transactions, calculate totals, & export detailed PDF receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-[#A3E635] bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
              title="Load example with Blinkit, Swiggy, Instamart, Zomato, Burger King, KFC"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample (₹27,668)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Dual Column */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form & Item Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Receipt Title</label>
                <input 
                  type="text" 
                  value={billTitle} 
                  onChange={e => setBillTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Outlets & Delivery Bill"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Merchant / Category</label>
                <input 
                  type="text" 
                  value={merchantName} 
                  onChange={e => setMerchantName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Swiggy / Blinkit / Outlets"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  value={billDate} 
                  onChange={e => setBillDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Currency Symbol</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </div>
            </div>

            {/* Input Mode Selector */}
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setInputMode('smart')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    inputMode === 'smart' 
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#A3E635] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  ⚡ Smart Text Parser
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    inputMode === 'table' 
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#A3E635] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  📋 Row Item Table ({items.length})
                </button>
              </div>

              <button
                onClick={handleLoadSample}
                className="sm:hidden text-xs font-bold text-emerald-600 dark:text-[#A3E635] underline"
              >
                Load Sample
              </button>
            </div>

            {/* Smart Text Mode */}
            {inputMode === 'smart' && (
              <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Paste / Type Transactions (Line by line)
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    e.g. <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-[10px]">blinkit : 9501</code>
                  </span>
                </div>

                <textarea
                  rows={7}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={`blinkit : 9501\nswiggy : 1800\ninstamart : 11153\nzomato: 3923\nburger king: 563\nkfc: 748`}
                  className="w-full p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 leading-relaxed"
                />

                <button
                  type="button"
                  onClick={handleApplyBulkText}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-[#A3E635] dark:hover:bg-[#BEF264] text-white dark:text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Parse & Update Items</span>
                </button>
              </div>
            )}

            {/* Row Item Table Mode */}
            {inputMode === 'table' && (
              <div className="space-y-3">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      No line items added yet. Click "Add Item" or use Smart Text.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-center">#{idx + 1}</span>
                        
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                          placeholder="Item Name"
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                        />

                        <input
                          type="number"
                          value={item.amount}
                          onChange={e => handleUpdateItem(item.id, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                        />

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>
            )}

            {/* Total Summary Footer */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Items Logged</p>
                <p className="text-sm font-extrabold">{items.length} Transactions</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Grand Total</p>
                <p className="text-2xl font-black text-emerald-400 tracking-tight">{formatAmount(grandTotal)}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Live Receipt Preview & Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                Live Receipt Preview
              </h3>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#A3E635] px-2 py-0.5 rounded-full font-bold">
                Detailed Invoice
              </span>
            </div>

            {/* Thermal / Executive Styled Paper Receipt */}
            <div className="bg-[#FAFBF9] dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner font-mono text-slate-800 dark:text-slate-200 space-y-4 text-xs relative overflow-hidden">
              
              {/* Receipt Top Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-800">
                <p className="font-extrabold text-sm tracking-widest text-slate-900 dark:text-white uppercase">{billTitle}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{merchantName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Date: {billDate} {billTime}</p>
                <p className="text-[9px] text-slate-400 font-mono">REF: {receiptRefCode}</p>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-2 py-1 max-h-48 overflow-y-auto">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span>ITEM</span>
                  <span>AMOUNT</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-center text-slate-400 text-[11px] py-4">No items added</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="truncate pr-2 font-medium">{item.name}</span>
                      <span className="font-bold">{formatAmount(item.amount * (item.qty || 1))}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Calculation Breakdown */}
              <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>TOTAL AMOUNT</span>
                  <span className="text-emerald-600 dark:text-[#A3E635]">{formatAmount(grandTotal)}</span>
                </div>
              </div>

              {/* Receipt Footer Barcode Visual */}
              <div className="text-center pt-2 space-y-1">
                <div className="inline-block h-6 w-3/4 bg-slate-900 dark:bg-slate-200 opacity-25 rounded-xs"></div>
                <p className="text-[9px] text-slate-400">DUOSHARE B9LLS • VERIFIED STATEMENT</p>
              </div>

            </div>

            {/* Actions & Export Buttons Grid */}
            <div className="space-y-2 pt-2">
              
              {/* Main PDF Export Button */}
              <button
                onClick={handleTriggerPDF}
                className="w-full py-3.5 bg-[#0F291E] dark:bg-[#A3E635] hover:bg-[#1A3827] dark:hover:bg-[#BEF264] text-white dark:text-slate-950 font-black text-xs rounded-2xl transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Export Detailed PDF Receipt</span>
              </button>

              {/* Secondary Export Options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportCSV}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download CSV</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Post to Room Expenses Option */}
              {handleAddExpense && (
                <button
                  onClick={handleSaveToRoomExpenses}
                  disabled={isSavingToRoom}
                  className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-[#A3E635] font-extrabold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Bill to Room Shared Expenses</span>
                </button>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
