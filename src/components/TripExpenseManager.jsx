import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Wallet,
  DollarSign,
  Check,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Share2,
  Download,
  Copy,
  Sparkles,
  TrendingUp,
  Calculator,
  Bed,
  Car,
  Utensils,
  Fuel,
  ShoppingBag,
  Tag,
  AlertCircle,
  ArrowRight,
  Clock,
  ArrowLeftRight,
  FileText,
  Palmtree,
  Luggage,
  Sliders
} from 'lucide-react';

// Category helpers
export const TRIP_CATEGORIES = [
  { id: 'stay', label: 'Accommodation & Stay', icon: Bed, color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' },
  { id: 'travel', label: 'Flights, Train & Transit', icon: Car, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'activities', label: 'Activities & Sightseeing', icon: Palmtree, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' },
  { id: 'fuel', label: 'Fuel & Tolls', icon: Fuel, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  { id: 'shopping', label: 'Shopping & Souvenirs', icon: ShoppingBag, color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20' },
  { id: 'misc', label: 'Misc & Others', icon: Tag, color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' }
];

export const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

// Calculate Debt Simplification Algorithm
export function calculateTripSettlements(companions = [], expenses = [], settlements = []) {
  const balances = {};
  companions.forEach(c => {
    balances[c.id] = 0;
  });

  // Calculate Net Balances from Expenses
  expenses.forEach(exp => {
    const amount = Number(exp.amount) || 0;
    const payerId = exp.paidBy;
    balances[payerId] = (balances[payerId] || 0) + amount;

    if (exp.splitType === 'exact' && exp.splits) {
      Object.entries(exp.splits).forEach(([cid, share]) => {
        balances[cid] = (balances[cid] || 0) - (Number(share) || 0);
      });
    } else if (exp.includedMembers && exp.includedMembers.length > 0) {
      const splitAmount = amount / exp.includedMembers.length;
      exp.includedMembers.forEach(cid => {
        balances[cid] = (balances[cid] || 0) - splitAmount;
      });
    } else {
      const splitAmount = amount / (companions.length || 1);
      companions.forEach(c => {
        balances[c.id] = (balances[c.id] || 0) - splitAmount;
      });
    }
  });

  // Factor in Recorded Settlements
  settlements.forEach(st => {
    const amt = Number(st.amount) || 0;
    // payer gave money to receiver -> payer balance increases (debt cleared), receiver decreases
    balances[st.payerId] = (balances[st.payerId] || 0) + amt;
    balances[st.receiverId] = (balances[st.receiverId] || 0) - amt;
  });

  // Debt Simplification (Greedy algorithm for minimum transactions)
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([id, bal]) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ id, amount: -rounded });
    } else if (rounded > 0.01) {
      creditors.push({ id, amount: rounded });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let d = 0;
  let c = 0;
  const dCopy = debtors.map(item => ({ ...item }));
  const cCopy = creditors.map(item => ({ ...item }));

  while (d < dCopy.length && c < cCopy.length) {
    const debtor = dCopy[d];
    const creditor = cCopy[c];
    const settleAmt = Math.min(debtor.amount, creditor.amount);

    if (settleAmt > 0.01) {
      transfers.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(settleAmt)
      });
    }

    debtor.amount -= settleAmt;
    creditor.amount -= settleAmt;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return { balances, transfers };
}

export default function TripExpenseManager({
  members = [],
  userNickname = 'You',
  userRoomId = null,
  triggerToast = () => {},
  isDarkMode = false,
  onNavigate
}) {
  // Master Trip State
  const [trips, setTrips] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_trips_data');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading trips data:', e);
      }
    }

    // Default Seed Trip for new users
    const defaultCompanions = [
      { id: 'c1', name: userNickname || 'You', isHost: true },
      { id: 'c2', name: members[0]?.nickname || 'Aman', isHost: false },
      { id: 'c3', name: members[1]?.nickname || 'Priya', isHost: false },
      { id: 'c4', name: 'Rahul', isHost: false }
    ];

    return [
      {
        id: 'trip-seed-goa',
        title: 'Goa Coastal Roadtrip & Beach Retreat',
        destination: 'Goa, India',
        startDate: '2026-10-15',
        endDate: '2026-10-19',
        status: 'Ongoing', // 'Planning' | 'Ongoing' | 'Completed'
        budget: 45000,
        currency: '₹',
        companions: defaultCompanions,
        planner: {
          stay: 18000,
          travel: 12000,
          food: 9000,
          activities: 4000,
          fuel: 2000,
          shopping: 0,
          buffer: 2000
        },
        expenses: [
          {
            id: 'exp-1',
            title: 'Sea Breeze Luxury Villa Booking',
            amount: 18500,
            category: 'stay',
            paidBy: defaultCompanions[0].id,
            splitType: 'equal',
            date: '2026-10-15',
            notes: 'Advance paid for 4 nights pool villa'
          },
          {
            id: 'exp-2',
            title: 'Highway Fuel & Fastag Tolls',
            amount: 2800,
            category: 'fuel',
            paidBy: defaultCompanions[1].id,
            splitType: 'equal',
            date: '2026-10-15',
            notes: 'SUV tank top-up'
          },
          {
            id: 'exp-3',
            title: 'Sunset Seafood Dinner at Thalassa',
            amount: 5400,
            category: 'food',
            paidBy: defaultCompanions[2].id,
            splitType: 'equal',
            date: '2026-10-16',
            notes: 'Appetizers & mocktails'
          },
          {
            id: 'exp-4',
            title: 'Scuba Diving & Watersports Package',
            amount: 7200,
            category: 'activities',
            paidBy: defaultCompanions[0].id,
            splitType: 'equal',
            includedMembers: [defaultCompanions[0].id, defaultCompanions[1].id, defaultCompanions[2].id],
            date: '2026-10-17',
            notes: 'Grand Island Scuba Dive (3 people)'
          }
        ],
        settlements: [
          {
            id: 'st-1',
            payerId: defaultCompanions[1].id,
            receiverId: defaultCompanions[0].id,
            amount: 3000,
            date: '2026-10-17',
            note: 'UPI Payment via Google Pay'
          }
        ]
      }
    ];
  });

  // Persist trips to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tallyin_trips_data', JSON.stringify(trips));
      } catch (e) {
        console.error('Error saving trips:', e);
      }
    }
  }, [trips]);

  // Selected Trip View
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [tripTab, setTripTab] = useState('expenses'); // 'expenses' | 'settlement' | 'planner' | 'companions'

  // Filter & Search states
  const [tripStatusFilter, setTripStatusFilter] = useState('all'); // 'all' | 'Ongoing' | 'Planning' | 'Completed'
  const [tripSearch, setTripSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePayer, setSettlePayer] = useState('');
  const [settleReceiver, setSettleReceiver] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Active Trip Object
  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  // Current User's Companion Record in Active Trip
  const currentUserCompanion = useMemo(() => {
    if (!activeTrip) return null;
    return (
      activeTrip.companions.find(c => c.name.toLowerCase() === (userNickname || 'You').toLowerCase()) ||
      activeTrip.companions[0] ||
      null
    );
  }, [activeTrip, userNickname]);

  // Trip Calculations for Active Trip
  const tripStats = useMemo(() => {
    if (!activeTrip) return { totalSpent: 0, perPersonAvg: 0, categoryTotals: {}, balances: {}, transfers: [] };

    const expenses = activeTrip.expenses || [];
    const companions = activeTrip.companions || [];
    const settlements = activeTrip.settlements || [];

    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const perPersonAvg = companions.length > 0 ? totalSpent / companions.length : 0;

    // Category breakdown
    const categoryTotals = {};
    TRIP_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
    expenses.forEach(e => {
      const cat = e.category || 'misc';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });

    // Settlements & Balances
    const { balances, transfers } = calculateTripSettlements(companions, expenses, settlements);

    return {
      totalSpent,
      perPersonAvg,
      categoryTotals,
      balances,
      transfers
    };
  }, [activeTrip]);

  // Overall Global Trips Summary
  const globalSummary = useMemo(() => {
    const totalTrips = trips.length;
    const ongoingCount = trips.filter(t => t.status === 'Ongoing').length;
    const totalSpendAllTrips = trips.reduce((sum, t) => {
      return sum + (t.expenses || []).reduce((eSum, exp) => eSum + (Number(exp.amount) || 0), 0);
    }, 0);

    return {
      totalTrips,
      ongoingCount,
      totalSpendAllTrips
    };
  }, [trips]);

  // Handlers for Trip Creation & Editing
  const handleSaveTrip = (tripData) => {
    if (editingTrip) {
      setTrips(prev => prev.map(t => t.id === editingTrip.id ? { ...t, ...tripData } : t));
      triggerToast('Trip details updated successfully!');
    } else {
      const newTrip = {
        id: `trip-${Date.now()}`,
        ...tripData,
        expenses: [],
        settlements: []
      };
      setTrips(prev => [newTrip, ...prev]);
      setSelectedTripId(newTrip.id);
      triggerToast('✨ New trip created! Let the journey begin!');
    }
    setIsTripModalOpen(false);
    setEditingTrip(null);
  };

  const handleDeleteTrip = (tripId) => {
    const target = trips.find(t => t.id === tripId);
    if (!window.confirm(`Are you sure you want to permanently delete "${target?.title || 'this trip'}"?`)) {
      return;
    }
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
    triggerToast('Trip removed.');
  };

  // Handlers for Expenses
  const handleSaveExpense = (expenseData) => {
    if (!activeTrip) return;

    if (editingExpense) {
      setTrips(prev => prev.map(t => {
        if (t.id !== activeTrip.id) return t;
        return {
          ...t,
          expenses: t.expenses.map(e => e.id === editingExpense.id ? { ...e, ...expenseData } : e)
        };
      }));
      triggerToast('Expense updated!');
    } else {
      const newExpense = {
        id: `exp-${Date.now()}`,
        ...expenseData
      };
      setTrips(prev => prev.map(t => {
        if (t.id !== activeTrip.id) return t;
        return {
          ...t,
          expenses: [newExpense, ...(t.expenses || [])]
        };
      }));
      triggerToast('Trip expense recorded!');
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    if (!activeTrip) return;
    if (!window.confirm('Delete this expense entry?')) return;

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        expenses: t.expenses.filter(e => e.id !== expenseId)
      };
    }));
    triggerToast('Expense deleted.');
  };

  // Handlers for Settlements
  const handleRecordSettlement = () => {
    if (!activeTrip || !settlePayer || !settleReceiver || !settleAmount || Number(settleAmount) <= 0) {
      triggerToast('Please select payer, receiver and valid amount.');
      return;
    }
    if (settlePayer === settleReceiver) {
      triggerToast('Payer and receiver cannot be the same person.');
      return;
    }

    const newSettlement = {
      id: `st-${Date.now()}`,
      payerId: settlePayer,
      receiverId: settleReceiver,
      amount: Number(settleAmount),
      date: new Date().toISOString().split('T')[0],
      note: settleNote.trim() || 'Settlement via Tallyin'
    };

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        settlements: [newSettlement, ...(t.settlements || [])]
      };
    }));

    setIsSettleModalOpen(false);
    setSettleAmount('');
    setSettleNote('');
    triggerToast('Settlement logged! Balances updated.');
  };

  const handleDeleteSettlement = (settleId) => {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        settlements: (t.settlements || []).filter(s => s.id !== settleId)
      };
    }));
    triggerToast('Settlement record removed.');
  };

  // Handler for adding/updating trip budget planner
  const handleUpdatePlanner = (categoryKey, value) => {
    if (!activeTrip) return;
    const num = Math.max(0, Number(value) || 0);
    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      const currentPlanner = t.planner || {};
      const updatedPlanner = { ...currentPlanner, [categoryKey]: num };
      const newTotalBudget = Object.values(updatedPlanner).reduce((sum, v) => sum + (Number(v) || 0), 0);
      return {
        ...t,
        planner: updatedPlanner,
        budget: newTotalBudget > 0 ? newTotalBudget : t.budget
      };
    }));
  };

  // Handler for managing companions
  const handleAddCompanion = (name) => {
    if (!activeTrip || !name.trim()) return;
    const trimmed = name.trim();
    if (activeTrip.companions.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      triggerToast('A companion with this name already exists.');
      return;
    }

    const newCompanion = {
      id: `c-${Date.now()}`,
      name: trimmed,
      isHost: false
    };

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        companions: [...t.companions, newCompanion]
      };
    }));
    triggerToast(`Added ${trimmed} to trip!`);
  };

  const handleRemoveCompanion = (cid) => {
    if (!activeTrip) return;
    const comp = activeTrip.companions.find(c => c.id === cid);
    const hasExpenses = (activeTrip.expenses || []).some(
      e => e.paidBy === cid || (e.includedMembers && e.includedMembers.includes(cid))
    );

    if (hasExpenses) {
      triggerToast(`Cannot remove ${comp?.name || 'companion'}: they are linked to recorded expenses.`);
      return;
    }

    if (activeTrip.companions.length <= 1) {
      triggerToast('A trip must have at least one companion.');
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        companions: t.companions.filter(c => c.id !== cid)
      };
    }));
    triggerToast(`Removed ${comp?.name || 'companion'}.`);
  };

  // Helper: Export text formatted summary
  const generateTripShareText = () => {
    if (!activeTrip) return '';
    const companions = activeTrip.companions || [];
    const compMap = {};
    companions.forEach(c => { compMap[c.id] = c.name; });

    let msg = `🌴 *${activeTrip.title.toUpperCase()}*\n`;
    msg += `📍 Destination: ${activeTrip.destination || 'Vacation'}\n`;
    if (activeTrip.startDate) msg += `🗓️ Dates: ${activeTrip.startDate} to ${activeTrip.endDate || 'TBD'}\n`;
    msg += `💰 Total Spend: ${formatINR(tripStats.totalSpent)}\n`;
    msg += `👥 Per Person Average: ${formatINR(tripStats.perPersonAvg)}\n\n`;

    msg += `⚖️ *WHO OWES WHOM (SIMPLIFIED SETTLEMENTS)*:\n`;
    if (tripStats.transfers.length === 0) {
      msg += `🎉 Everyone is all settled up! No pending payments.\n\n`;
    } else {
      tripStats.transfers.forEach(tf => {
        msg += `• *${compMap[tf.from] || tf.from}* owes *${compMap[tf.to] || tf.to}*: ${formatINR(tf.amount)}\n`;
      });
      msg += `\n`;
    }

    msg += `📊 *INDIVIDUAL NET STANDINGS*:\n`;
    companions.forEach(c => {
      const bal = tripStats.balances[c.id] || 0;
      const status = bal > 0 ? `Gets back ${formatINR(bal)}` : bal < 0 ? `Owes ${formatINR(Math.abs(bal))}` : `Settled (₹0)`;
      msg += `• ${c.name}: ${status}\n`;
    });

    msg += `\n_Generated via Tallyin Trip Splitter_ 🚀`;
    return msg;
  };

  const copyTripSummary = () => {
    const text = generateTripShareText();
    navigator.clipboard.writeText(text);
    triggerToast('Trip settlement summary copied to clipboard!');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateTripShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const downloadCSV = () => {
    if (!activeTrip) return;
    const compMap = {};
    activeTrip.companions.forEach(c => { compMap[c.id] = c.name; });

    let csvContent = 'Date,Title,Category,Amount,Paid By,Split Mode,Notes\n';
    (activeTrip.expenses || []).forEach(e => {
      const payer = compMap[e.paidBy] || e.paidBy;
      const cat = TRIP_CATEGORIES.find(c => c.id === e.category)?.label || e.category;
      csvContent += `"${e.date || ''}","${(e.title || '').replace(/"/g, '""')}","${cat}",${e.amount},"${payer}","${e.splitType || 'equal'}","${(e.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTrip.title.replace(/\s+/g, '_')}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV downloaded!');
  };

  // ==========================================
  // RENDER: SINGLE TRIP WORKSPACE
  // ==========================================
  if (activeTrip) {
    const companions = activeTrip.companions || [];
    const compMap = {};
    companions.forEach(c => { compMap[c.id] = c.name; });

    const myBalance = currentUserCompanion ? (tripStats.balances[currentUserCompanion.id] || 0) : 0;
    const budgetPct = activeTrip.budget > 0 ? Math.min(Math.round((tripStats.totalSpent / activeTrip.budget) * 100), 150) : 0;
    const budgetRemaining = (activeTrip.budget || 0) - tripStats.totalSpent;

    return (
      <div className="space-y-6 animate-fade-in text-left pb-16">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTripId(null)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 hover:bg-[#dfe7e2] text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>All Trips</span>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">
                  {activeTrip.title}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  activeTrip.status === 'Ongoing'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#A3E635] border border-emerald-500/30'
                    : activeTrip.status === 'Completed'
                      ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                }`}>
                  {activeTrip.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#5C6E5C] dark:text-slate-400 font-medium mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635]" />
                  {activeTrip.destination || 'Vacation'}
                </span>
                {activeTrip.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeTrip.startDate} {activeTrip.endDate ? `to ${activeTrip.endDate}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {companions.length} Companions
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-[#1A3827] dark:text-slate-200 hover:bg-[#F6F8F6] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Share Settlement Summary"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
              <span className="hidden sm:inline">Share Summary</span>
            </button>
            <button
              onClick={() => {
                setEditingTrip(activeTrip);
                setIsTripModalOpen(true);
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] text-xs font-bold transition-all shadow-sm"
              title="Edit Trip Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Core Summary Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Group Spend */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Total Group Spend</span>
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">
              {formatINR(tripStats.totalSpent)}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
              Across {(activeTrip.expenses || []).length} logged expenses
            </p>
          </div>

          {/* Card 2: Budget Progress */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Trip Budget</span>
              <Calculator className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-[#1A3827] dark:text-slate-100">
                {formatINR(activeTrip.budget || 0)}
              </span>
              <span className={`text-[11px] font-black ${
                budgetRemaining < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-[#A3E635]'
              }`}>
                {budgetRemaining >= 0 ? `${formatINR(budgetRemaining)} left` : `${formatINR(Math.abs(budgetRemaining))} over`}
              </span>
            </div>
            <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetPct > 100 ? 'bg-rose-500' : budgetPct > 80 ? 'bg-amber-500' : 'bg-emerald-500 dark:bg-[#A3E635]'
                }`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Per-Person Average */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Per Person Avg</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">
              {formatINR(tripStats.perPersonAvg)}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
              Divided equally ({companions.length} members)
            </p>
          </div>

          {/* Card 4: Your Balance Standing */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Your Standing ({currentUserCompanion?.name || 'You'})</span>
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-xl sm:text-2xl font-black ${
              myBalance > 0
                ? 'text-emerald-600 dark:text-[#A3E635]'
                : myBalance < 0
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'text-[#1A3827] dark:text-slate-200'
            }`}>
              {myBalance > 0 ? `+${formatINR(myBalance)}` : myBalance < 0 ? `-${formatINR(Math.abs(myBalance))}` : '₹0'}
            </p>
            <p className="text-[10px] font-semibold text-[#5C6E5C] dark:text-slate-400">
              {myBalance > 0 ? 'You are owed by friends' : myBalance < 0 ? 'You owe friends' : 'All balances settled'}
            </p>
          </div>

        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EAF0EC]/80 dark:bg-slate-900 border border-[#1A3827]/5 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setTripTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'expenses'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Expenses & Ledger ({(activeTrip.expenses || []).length})</span>
          </button>

          <button
            onClick={() => setTripTab('settlement')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'settlement'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Who Owes Whom ({tripStats.transfers.length} Debts)</span>
          </button>

          <button
            onClick={() => setTripTab('planner')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'planner'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Budget Estimator & Actuals</span>
          </button>

          <button
            onClick={() => setTripTab('companions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'companions'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Companions ({companions.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: EXPENSES & LEDGER */}
        {/* ======================================================== */}
        {tripTab === 'expenses' && (
          <div className="space-y-4">
            
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expenses by title or note..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setExpenseCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    expenseCategoryFilter === 'all'
                      ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950'
                      : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#dfe7e2]'
                  }`}
                >
                  All
                </button>
                {TRIP_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setExpenseCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                      expenseCategoryFilter === cat.id
                        ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950'
                        : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#dfe7e2]'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    <span>{cat.label.split('&')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses List */}
            {(() => {
              const filtered = (activeTrip.expenses || []).filter(e => {
                if (expenseCategoryFilter !== 'all' && e.category !== expenseCategoryFilter) return false;
                if (expenseSearch) {
                  const q = expenseSearch.toLowerCase();
                  const matchTitle = e.title?.toLowerCase().includes(q);
                  const matchNotes = e.notes?.toLowerCase().includes(q);
                  const matchPayer = (compMap[e.paidBy] || '').toLowerCase().includes(q);
                  if (!matchTitle && !matchNotes && !matchPayer) return false;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="hud-card rounded-3xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto">
                      <Palmtree className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                      No expenses match your search
                    </h3>
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
                      Log your first hotel booking, travel tickets, dining bill, or adventure sport pass!
                    </p>
                    <button
                      onClick={() => {
                        setEditingExpense(null);
                        setIsExpenseModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add First Expense</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-2.5">
                  {filtered.map(exp => {
                    const catObj = TRIP_CATEGORIES.find(c => c.id === exp.category) || TRIP_CATEGORIES[TRIP_CATEGORIES.length - 1];
                    const CatIcon = catObj.icon;
                    const payerName = compMap[exp.paidBy] || exp.paidBy;

                    // Calculation of participants
                    const count = exp.includedMembers ? exp.includedMembers.length : companions.length;
                    const perPersonShare = count > 0 ? (Number(exp.amount) || 0) / count : 0;

                    return (
                      <div
                        key={exp.id}
                        className="hud-card-interactive rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${catObj.color} shrink-0`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                                {exp.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-300">
                                {catObj.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#5C6E5C] dark:text-slate-400 flex-wrap">
                              <span className="font-semibold text-emerald-700 dark:text-[#A3E635]">
                                Paid by {payerName}
                              </span>
                              <span>•</span>
                              <span>{exp.date || 'Today'}</span>
                              <span>•</span>
                              <span>
                                Split {count} ways ({formatINR(perPersonShare)} / person)
                              </span>
                            </div>
                            {exp.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                "{exp.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#E3E8E3] dark:border-slate-800">
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-black text-[#1A3827] dark:text-slate-100">
                              {formatINR(exp.amount)}
                            </p>
                            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                              Your share: {formatINR(perPersonShare)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingExpense(exp);
                                setIsExpenseModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#5C6E5C] hover:text-[#1A3827] dark:hover:text-slate-200 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all"
                              title="Edit Expense"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: WHO OWES WHOM & SETTLEMENT MATRIX */}
        {/* ======================================================== */}
        {tripTab === 'settlement' && (
          <div className="space-y-6">
            
            {/* Top Settlement Action Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  Smart Debt Simplification
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Tallyin minimizes cross-transfers into the fewest possible payments so friends settle debts effortlessly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSettlePayer(companions[0]?.id || '');
                    setSettleReceiver(companions[1]?.id || '');
                    setSettleAmount('');
                    setIsSettleModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Payment / Settle Up</span>
                </button>
                <button
                  onClick={shareViaWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Simplified Transfer Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Optimized Direct Transfers ({tripStats.transfers.length})
              </h4>

              {tripStats.transfers.length === 0 ? (
                <div className="hud-card rounded-2xl p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                    All Settled Up!
                  </h4>
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                    No debts pending between trip companions. Everyone is balanced out.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tripStats.transfers.map((tf, idx) => {
                    const fromName = compMap[tf.from] || tf.from;
                    const toName = compMap[tf.to] || tf.to;

                    return (
                      <div
                        key={idx}
                        className="hud-card rounded-2xl p-4 flex items-center justify-between gap-3 border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#A3E635] flex items-center justify-center font-black text-xs shadow-inner">
                            {fromName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-[#1A3827] dark:text-slate-100">
                              <span>{fromName}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-emerald-700 dark:text-[#A3E635]">{toName}</span>
                            </div>
                            <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                              Payment of <strong className="text-[#1A3827] dark:text-slate-200">{formatINR(tf.amount)}</strong> clears this debt
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSettlePayer(tf.from);
                            setSettleReceiver(tf.to);
                            setSettleAmount(String(tf.amount));
                            setIsSettleModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 hover:bg-emerald-100 text-emerald-800 dark:text-[#A3E635] font-black text-xs transition-all shrink-0"
                        >
                          Mark Settled
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Companion Balances Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Individual Participant Ledgers
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {companions.map(c => {
                  const bal = tripStats.balances[c.id] || 0;
                  const totalPaid = (activeTrip.expenses || [])
                    .filter(e => e.paidBy === c.id)
                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                  return (
                    <div key={c.id} className="hud-card rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-black text-[#1A3827] dark:text-slate-100 truncate max-w-[100px]">
                            {c.name}
                          </span>
                        </div>
                        {c.isHost && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">
                            Host
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 pt-1 text-xs">
                        <div className="flex justify-between text-[#5C6E5C] dark:text-slate-400">
                          <span>Total Paid:</span>
                          <span className="font-bold text-[#1A3827] dark:text-slate-200">{formatINR(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1 border-t border-[#E3E8E3] dark:border-slate-800">
                          <span className="font-bold">Net Standing:</span>
                          <span className={`font-black ${
                            bal > 0
                              ? 'text-emerald-600 dark:text-[#A3E635]'
                              : bal < 0
                                ? 'text-rose-500'
                                : 'text-slate-500'
                          }`}>
                            {bal > 0 ? `+${formatINR(bal)}` : bal < 0 ? `-${formatINR(Math.abs(bal))}` : '₹0 (Settled)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recorded Settlements History */}
            {(activeTrip.settlements || []).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                  Recorded Settlement Payments ({(activeTrip.settlements || []).length})
                </h4>
                <div className="space-y-2">
                  {(activeTrip.settlements || []).map(st => {
                    const pName = compMap[st.payerId] || st.payerId;
                    const rName = compMap[st.receiverId] || st.receiverId;

                    return (
                      <div
                        key={st.id}
                        className="hud-card rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                          <div>
                            <span className="font-black text-[#1A3827] dark:text-slate-100">{pName}</span>
                            <span className="text-[#5C6E5C] dark:text-slate-400"> paid </span>
                            <span className="font-black text-[#1A3827] dark:text-slate-100">{rName}</span>
                            <span className="font-black text-emerald-700 dark:text-[#A3E635] ml-2">
                              {formatINR(st.amount)}
                            </span>
                            {st.note && (
                              <span className="text-[11px] text-slate-500 ml-2 italic">({st.note})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400">{st.date}</span>
                          <button
                            onClick={() => handleDeleteSettlement(st.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="Delete Settlement Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PRE-TRIP BUDGET ESTIMATOR & PLANNER */}
        {/* ======================================================== */}
        {tripTab === 'planner' && (
          <div className="space-y-6">
            
            {/* Header intro */}
            <div className="hud-card rounded-3xl p-6 space-y-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-[#A3E635]">
                <Calculator className="w-5 h-5" />
                <h3 className="text-base font-black">Pre-Trip Group Cost Estimator</h3>
              </div>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-300 leading-relaxed max-w-2xl">
                Plan expected expenses per category before packing your bags. Adjust estimates, view projected per-person costs, and track real-time variance against what you actually spent.
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-bold text-[#1A3827] dark:text-slate-200">
                <div>
                  <span className="text-[#5C6E5C] dark:text-slate-400">Total Estimated Budget: </span>
                  <span className="font-black text-base text-emerald-700 dark:text-[#A3E635]">
                    {formatINR(activeTrip.budget || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#5C6E5C] dark:text-slate-400">Est. Cost Per Person: </span>
                  <span className="font-black text-base text-purple-700 dark:text-purple-400">
                    {formatINR(companions.length > 0 ? (activeTrip.budget || 0) / companions.length : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Breakdown & Comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Planned vs. Actual Spend Breakdown
              </h4>

              <div className="space-y-3">
                {TRIP_CATEGORIES.map(cat => {
                  const planned = (activeTrip.planner && activeTrip.planner[cat.id]) || 0;
                  const actual = tripStats.categoryTotals[cat.id] || 0;
                  const variance = planned - actual;
                  const pct = planned > 0 ? Math.min(Math.round((actual / planned) * 100), 150) : (actual > 0 ? 100 : 0);
                  const CatIcon = cat.icon;

                  return (
                    <div key={cat.id} className="hud-card rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${cat.color}`}>
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#1A3827] dark:text-slate-100">
                              {cat.label}
                            </h5>
                            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                              Actual Spend: <strong className="text-[#1A3827] dark:text-slate-200">{formatINR(actual)}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Editable Planner Input */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block">
                              Estimated Budget (₹)
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={planned || ''}
                              placeholder="0"
                              onChange={(e) => handleUpdatePlanner(cat.id, e.target.value)}
                              className="w-28 px-2.5 py-1 text-right rounded-lg border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="text-right min-w-[70px]">
                            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block">Status</span>
                            <span className={`text-xs font-black ${
                              variance < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-[#A3E635]'
                            }`}>
                              {variance >= 0 ? `${formatINR(variance)} left` : `${formatINR(Math.abs(variance))} over`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            pct > 100 ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500 dark:bg-[#A3E635]'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: COMPANIONS & PARTICIPANTS */}
        {/* ======================================================== */}
        {tripTab === 'companions' && (
          <div className="space-y-6">
            
            {/* Add Companion Form */}
            <div className="hud-card rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                Add Friends & Guest Companions
              </h4>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                You can add any friend, partner, or guest traveling on this trip without requiring them to join your flat room.
              </p>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.companionName;
                  handleAddCompanion(input.value);
                  input.value = '';
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  name="companionName"
                  type="text"
                  placeholder="e.g. Vikram, Neha, Rohit..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Companions Roster */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Active Trip Travelers ({companions.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {companions.map(c => {
                  const totalPaid = (activeTrip.expenses || [])
                    .filter(e => e.paidBy === c.id)
                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                  const bal = tripStats.balances[c.id] || 0;

                  return (
                    <div key={c.id} className="hud-card rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-inner">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-black text-[#1A3827] dark:text-slate-100">
                              {c.name}
                            </h5>
                            {c.isHost && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                Host
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                            Paid: {formatINR(totalPaid)} • Net: {bal > 0 ? `+${formatINR(bal)}` : bal < 0 ? `-${formatINR(Math.abs(bal))}` : '₹0'}
                          </p>
                        </div>
                      </div>

                      {!c.isHost && (
                        <button
                          onClick={() => handleRemoveCompanion(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          title="Remove Companion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ADD / EDIT EXPENSE */}
        {/* ======================================================== */}
        {isExpenseModalOpen && (
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => {
              setIsExpenseModalOpen(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense}
            companions={companions}
            currentUserId={currentUserCompanion?.id}
            onSave={handleSaveExpense}
          />
        )}

        {/* ======================================================== */}
        {/* MODAL: RECORD SETTLEMENT */}
        {/* ======================================================== */}
        {isSettleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
            <div className="w-full max-w-md hud-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
                  <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                    Record Payment / Settle Up
                  </h3>
                </div>
                <button
                  onClick={() => setIsSettleModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Who Paid? (Debtor)
                  </label>
                  <select
                    value={settlePayer}
                    onChange={(e) => setSettlePayer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  >
                    {companions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Who Received the Money? (Creditor)
                  </label>
                  <select
                    value={settleReceiver}
                    onChange={(e) => setSettleReceiver(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  >
                    {companions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Settlement Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter settled amount"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Note / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid via GPay / UPI, Cash at hotel"
                    value={settleNote}
                    onChange={(e) => setSettleNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordSettlement}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md"
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: SHARE / EXPORT SUMMARY */}
        {/* ======================================================== */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
            <div className="w-full max-w-lg hud-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
                  <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                    Share Trip Settlement Summary
                  </h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
                  Copy formatted summary or dispatch directly to your trip's WhatsApp group:
                </p>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-[#E3E8E3] dark:border-slate-800 font-mono text-xs max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
                  {generateTripShareText()}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800 flex-wrap">
                <button
                  onClick={downloadCSV}
                  className="px-3 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyTripSummary}
                    className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 hover:bg-[#dfe7e2] font-black text-xs flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                  <button
                    onClick={shareViaWhatsApp}
                    className="px-4 py-2 rounded-xl bg-[#25D366] text-white font-black text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // RENDER: TRIPS HUB (OVERVIEW LIST)
  // ==========================================
  const filteredTrips = trips.filter(t => {
    if (tripStatusFilter !== 'all' && t.status !== tripStatusFilter) return false;
    if (tripSearch) {
      const q = tripSearch.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDest = t.destination?.toLowerCase().includes(q);
      if (!matchTitle && !matchDest) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left pb-16">
      
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600 dark:text-[#A3E635]" />
            Trips & Vacation Expense Splitter
          </h2>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
            Plan group budgets, track on-the-go travel expenses, split costs with companions & settle balances.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrip(null);
            setIsTripModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Global Stats Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
            <span>Total Trips</span>
            <Luggage className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
          </div>
          <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">
            {globalSummary.totalTrips}
          </p>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            {globalSummary.ongoingCount} currently active/ongoing
          </p>
        </div>

        <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
            <span>All Trips Total Spend</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">
            {formatINR(globalSummary.totalSpendAllTrips)}
          </p>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            Tracked across all past and ongoing journeys
          </p>
        </div>

        <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
            <span>Split settlements</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-[#A3E635]">
            Instant Math
          </p>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            Automated minimum transfer algorithm
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EAF0EC]/80 dark:bg-slate-900 border border-[#1A3827]/5 dark:border-slate-800 overflow-x-auto">
          {['all', 'Ongoing', 'Planning', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setTripStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                tripStatusFilter === status
                  ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              {status === 'all' ? 'All Trips' : status}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search destination or trip..."
            value={tripSearch}
            onChange={(e) => setTripSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="hud-card rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#5C6E5C]">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
            No trips found
          </h3>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
            Ready for your next adventure? Create a trip to plan budgets and split expenses with friends.
          </p>
          <button
            onClick={() => {
              setEditingTrip(null);
              setIsTripModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Your First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map(trip => {
            const expenses = trip.expenses || [];
            const companions = trip.companions || [];
            const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const budget = trip.budget || 0;
            const progress = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

            // Find current user balance
            const currentUser = companions.find(c => c.name.toLowerCase() === (userNickname || 'You').toLowerCase()) || companions[0];
            const { balances } = calculateTripSettlements(companions, expenses, trip.settlements || []);
            const userBal = currentUser ? (balances[currentUser.id] || 0) : 0;

            return (
              <div
                key={trip.id}
                className="hud-card-interactive rounded-3xl p-6 flex flex-col justify-between space-y-4 group cursor-pointer"
                onClick={() => setSelectedTripId(trip.id)}
              >
                <div className="space-y-3">
                  
                  {/* Status & Destination */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      trip.status === 'Ongoing'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#A3E635] border border-emerald-500/30'
                        : trip.status === 'Completed'
                          ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                    }`}>
                      {trip.status}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditingTrip(trip);
                          setIsTripModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200"
                        title="Edit Trip Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-[#A3E635] transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 dark:text-[#A3E635]" />
                      <span>{trip.destination || 'Vacation Spot'}</span>
                      {trip.startDate && <span>• {trip.startDate}</span>}
                    </p>
                  </div>

                  {/* Spend vs Budget */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#5C6E5C] dark:text-slate-400">Total Spent</span>
                      <span className="text-[#1A3827] dark:text-slate-200">
                        {formatINR(totalSpent)} {budget > 0 ? `/ ${formatINR(budget)}` : ''}
                      </span>
                    </div>

                    <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-[#A3E635] h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Companions Avatars */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {companions.slice(0, 4).map((c, i) => (
                        <div
                          key={c.id}
                          className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs"
                          title={c.name}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {companions.length > 4 && (
                        <div className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[9px] font-black flex items-center justify-center">
                          +{companions.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Net balance status chip */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      userBal > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#A3E635]'
                        : userBal < 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-[#EAF0EC] text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {userBal > 0 ? `+${formatINR(userBal)}` : userBal < 0 ? `-${formatINR(Math.abs(userBal))}` : 'Settled'}
                    </span>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-700 dark:text-[#A3E635]">
                  <span>Open Trip Workspace</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT TRIP */}
      {/* ======================================================== */}
      {isTripModalOpen && (
        <TripModal
          isOpen={isTripModalOpen}
          onClose={() => {
            setIsTripModalOpen(false);
            setEditingTrip(null);
          }}
          initialData={editingTrip}
          defaultHostName={userNickname}
          roomMembers={members}
          onSave={handleSaveTrip}
        />
      )}

    </div>
  );
}

// =========================================================================
// SUB-MODAL COMPONENT: TRIP CREATE / EDIT
// =========================================================================
function TripModal({
  isOpen,
  onClose,
  initialData,
  defaultHostName = 'You',
  roomMembers = [],
  onSave
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [budget, setBudget] = useState(initialData?.budget || '');
  const [status, setStatus] = useState(initialData?.status || 'Planning');
  
  // Companions
  const [companions, setCompanions] = useState(() => {
    if (initialData?.companions && initialData.companions.length > 0) {
      return initialData.companions;
    }
    // Default seed from current user + room members
    const list = [
      { id: 'c-host', name: defaultHostName || 'You', isHost: true }
    ];
    roomMembers.forEach((m, idx) => {
      const name = m.nickname || m.name;
      if (name && name.toLowerCase() !== (defaultHostName || 'You').toLowerCase()) {
        list.push({ id: `c-rm-${idx}`, name, isHost: false });
      }
    });
    return list;
  });

  const [newCompanionInput, setNewCompanionInput] = useState('');

  if (!isOpen) return null;

  const handleAddCompanionChip = () => {
    if (!newCompanionInput.trim()) return;
    const name = newCompanionInput.trim();
    if (companions.some(c => c.name.toLowerCase() === name.toLowerCase())) return;

    setCompanions(prev => [...prev, { id: `c-${Date.now()}`, name, isHost: false }]);
    setNewCompanionInput('');
  };

  const handleRemoveChip = (cid) => {
    if (companions.length <= 1) return;
    setCompanions(prev => prev.filter(c => c.id !== cid));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: Number(budget) || 0,
      status,
      companions
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
      <div className="w-full max-w-lg hud-card rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
            <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
              {initialData ? 'Edit Trip Details' : 'Plan New Vacation / Trip'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Trip Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Goa Beach Weekend, Manali Trek 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Goa, Pondicherry, Ladakh"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Trip Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Planning">Planning</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Estimated Total Budget Target (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              placeholder="e.g. 40000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Companions / Participants selector */}
          <div className="space-y-2 pt-1 border-t border-[#E3E8E3] dark:border-slate-800">
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block">
              Trip Companions ({companions.length})
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              {companions.map(c => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-[#A3E635] border border-emerald-500/20 font-bold text-xs"
                >
                  <span>{c.name}</span>
                  {c.isHost && <span className="text-[9px] uppercase font-black opacity-70">(Host)</span>}
                  {!c.isHost && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(c.id)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add companion name (e.g. friend outside flat)..."
                value={newCompanionInput}
                onChange={(e) => setNewCompanionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompanionChip();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
              />
              <button
                type="button"
                onClick={handleAddCompanionChip}
                className="px-3.5 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 hover:bg-[#dfe7e2] font-black text-xs shrink-0"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md"
            >
              {initialData ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-MODAL COMPONENT: ADD / EDIT EXPENSE
// =========================================================================
function ExpenseModal({
  isOpen,
  onClose,
  initialData,
  companions = [],
  currentUserId,
  onSave
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || 'food');
  const [paidBy, setPaidBy] = useState(initialData?.paidBy || currentUserId || companions[0]?.id || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [splitMode, setSplitMode] = useState(initialData?.splitType || 'equal'); // 'equal' | 'selective' | 'exact'
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Selected members for 'selective' split
  const [selectedMembers, setSelectedMembers] = useState(() => {
    if (initialData?.includedMembers) {
      return initialData.includedMembers;
    }
    return companions.map(c => c.id);
  });

  // Exact custom amounts for 'exact' split
  const [exactShares, setExactShares] = useState(() => {
    if (initialData?.splits) {
      return initialData.splits;
    }
    const shares = {};
    companions.forEach(c => { shares[c.id] = ''; });
    return shares;
  });

  if (!isOpen) return null;

  const toggleMemberSelection = (cid) => {
    if (selectedMembers.includes(cid)) {
      if (selectedMembers.length <= 1) return; // Must have at least 1 person
      setSelectedMembers(prev => prev.filter(id => id !== cid));
    } else {
      setSelectedMembers(prev => [...prev, cid]);
    }
  };

  const handleExactShareChange = (cid, val) => {
    setExactShares(prev => ({ ...prev, [cid]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!title.trim() || !numAmt || numAmt <= 0) return;

    const payload = {
      title: title.trim(),
      amount: numAmt,
      category,
      paidBy,
      date,
      splitType: splitMode,
      notes: notes.trim()
    };

    if (splitMode === 'selective') {
      payload.includedMembers = selectedMembers;
    } else if (splitMode === 'exact') {
      payload.splits = {};
      companions.forEach(c => {
        payload.splits[c.id] = Number(exactShares[c.id]) || 0;
      });
    }

    onSave(payload);
  };

  // Exact shares sum check
  const totalExactShares = Object.values(exactShares).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const exactDifference = (Number(amount) || 0) - totalExactShares;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
      <div className="w-full max-w-lg hud-card rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
            <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
              {initialData ? 'Edit Trip Expense' : 'Log Trip Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scuba diving, Beach resort stay, Dinner at Fisherman's Wharf"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="₹0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-sm text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TRIP_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {companions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Split Mode Selector */}
          <div className="space-y-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block">
              Split Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'equal', label: 'All Equally' },
                { id: 'selective', label: 'Select Who' },
                { id: 'exact', label: 'Exact ₹' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSplitMode(mode.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all ${
                    splitMode === mode.id
                      ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                      : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#dfe7e2]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Split Details: Selective */}
            {splitMode === 'selective' && (
              <div className="p-3 rounded-2xl bg-[#EAF0EC]/60 dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-[#5C6E5C] dark:text-slate-400">
                  Select companions participating in this expense:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {companions.map(c => {
                    const isSelected = selectedMembers.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleMemberSelection(c.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-[#A3E635] border border-emerald-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Details: Exact */}
            {splitMode === 'exact' && (
              <div className="p-3 rounded-2xl bg-[#EAF0EC]/60 dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-[#5C6E5C] dark:text-slate-400">Specify amount for each person:</span>
                  <span className={exactDifference === 0 ? 'text-emerald-600 font-black' : 'text-rose-500 font-black'}>
                    {exactDifference === 0 ? '✓ Balanced' : `${formatINR(Math.abs(exactDifference))} ${exactDifference > 0 ? 'unassigned' : 'over'}`}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {companions.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{c.name}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="₹0"
                        value={exactShares[c.id] || ''}
                        onChange={(e) => handleExactShareChange(c.id, e.target.value)}
                        className="w-24 px-2 py-1 text-right rounded-lg border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Scuba tickets for 3 people, includes equipment hire"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md"
            >
              {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
