import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Home as HomeIcon, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Calendar, 
  Check, 
  Copy, 
  Download, 
  LogOut, 
  Sparkles, 
  Sliders, 
  X, 
  RefreshCw, 
  Moon, 
  Sun, 
  ChevronDown, 
  AlertCircle,
  Clock,
  ArrowRight,
  User,
  Coffee,
  Lightbulb,
  Home as HouseIcon,
  ShoppingCart,
  DollarSign as CategoryIcon,
  Upload,
  UserCheck,
  Menu,
  ShieldCheck,
  Share2,
  ScanLine,
  Pencil,
  Trash2,
  Loader,
  Wallet
} from 'lucide-react';

import { supabase } from './supabase';
import logoIcon from './assets/logo_icon.png';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error("Global uncaught error intercepted:", event.error);
    const errorDiv = document.createElement('div');
    errorDiv.id = 'global-error-overlay';
    errorDiv.style.position = 'fixed';
    errorDiv.style.inset = '0';
    errorDiv.style.backgroundColor = '#7f1d1d';
    errorDiv.style.color = '#fef2f2';
    errorDiv.style.padding = '24px';
    errorDiv.style.zIndex = '999999';
    errorDiv.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    errorDiv.style.whiteSpace = 'pre-wrap';
    errorDiv.style.overflow = 'auto';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.lineHeight = '1.5';
    errorDiv.innerText = `🚨 Uncaught Runtime Error:\n\nMessage: ${event.message}\nSource: ${event.filename}:${event.lineno}:${event.colno}\n\nStack Trace:\n${event.error ? event.error.stack : 'No stack trace available'}`;
    document.body.appendChild(errorDiv);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error("Global unhandled rejection intercepted:", event.reason);
    const errorDiv = document.createElement('div');
    errorDiv.id = 'global-rejection-overlay';
    errorDiv.style.position = 'fixed';
    errorDiv.style.inset = '0';
    errorDiv.style.backgroundColor = '#7f1d1d';
    errorDiv.style.color = '#fef2f2';
    errorDiv.style.padding = '24px';
    errorDiv.style.zIndex = '999999';
    errorDiv.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    errorDiv.style.whiteSpace = 'pre-wrap';
    errorDiv.style.overflow = 'auto';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.lineHeight = '1.5';
    errorDiv.innerText = `🚨 Unhandled Promise Rejection:\n\nReason: ${event.reason}\n\nStack Trace:\n${event.reason && event.reason.stack ? event.reason.stack : 'No stack trace available'}`;
    document.body.appendChild(errorDiv);
  });
}

// Stable ViewRenderer component helper to safely wrap child view renderers
const ViewRenderer = ({ render }) => {
  return render();
};

// ── QR Scanner Component (wraps html5-qrcode) ───────────────────────────────
function QrScannerMount({ onScan, onError, scannerRef }) {
  const mountId = 'qr-scanner-viewport';
  useEffect(() => {
    const scanner = new Html5Qrcode(mountId);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => { onScan(decodedText); },
      () => {} // suppress per-frame non-match noise
    ).catch((err) => {
      console.warn('QR scanner could not start:', err?.message || err);
      if (onError) onError(err);
    });

    return () => {
      // html5-qrcode throws SYNCHRONOUSLY if not running — must use try/catch
      try { 
        scanner.stop().catch((e) => console.warn('Scanner stop failed:', e)); 
      } catch (err) { 
        console.warn('Scanner stop error:', err); 
      }
      try { 
        scanner.clear(); 
      } catch (err) { 
        console.warn('Scanner clear error:', err); 
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-64 h-64 mx-auto rounded-2xl border-2 border-[#1A3827] dark:border-[#A3E635] overflow-hidden bg-slate-950">
      <div id={mountId} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute left-0 right-0 h-0.5 bg-[#A3E635] shadow-[0_0_8px_#A3E635] animate-scan z-10 pointer-events-none" />
    </div>
  );
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto my-10 bg-red-50 border border-red-200 rounded-2xl dark:bg-red-950/20 dark:border-red-900/30 text-red-800 dark:text-red-300 shadow-lg">
          <h2 className="text-lg font-bold">Something went wrong rendering this view.</h2>
          <p className="text-sm mt-2 font-mono bg-red-100 dark:bg-red-900/40 p-4 rounded-xl overflow-auto max-h-60">
            {this.state.error?.toString()}
          </p>
          <p className="text-xs mt-2 text-slate-500">
            Please report this issue. You can click another tab to continue using Tallyin.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-[#1A3827] text-white hover:bg-[#255038] rounded-xl text-xs font-bold transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}


export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const auth = useMemo(() => ({
    currentUser: user ? {
      id: user.id,
      uid: user.id,
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'You'
    } : null
  }), [user]);

  // Room members & settings
  const [members, setMembers] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem('monthlyBudget')) || 22000);
  const [personalCap, setPersonalCap] = useState(() => Number(localStorage.getItem('personalCap')) || 2500);
  const [isEditingPersonalCap, setIsEditingPersonalCap] = useState(false);
  const [personalCapInput, setPersonalCapInput] = useState('');

  // Add Expense Split States
  const [formPaidBy, setFormPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedSplitMembers, setSelectedSplitMembers] = useState({});
  const [customSplitValues, setCustomSplitValues] = useState({});

  // Settle Up Modal States
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePayer, setSettlePayer] = useState('');
  const [settleReceiver, setSettleReceiver] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  // Onboarding Setup View state
  const [userRoomId, setUserRoomId] = useState(() => localStorage.getItem('userRoomId') || null); 
  const [joinInput, setJoinInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('join');
      return code ? code.trim().toUpperCase() : '';
    }
    return '';
  });
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState('code'); // 'code' | 'qr' | 'link'
  const qrScannerRef = useRef(null);

  // Responsive drawer menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dropdown & Modal toggles
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageRoomOpen, setIsManageRoomOpen] = useState(false);
  const [isDiamondModalOpen, setIsDiamondModalOpen] = useState(false);
  const [activeReceiptZoom, setActiveReceiptZoom] = useState(null);

  // Navigation State
  const [currentView, setCurrentView] = useState('home');
  const [insightsTab, setInsightsTab] = useState('room');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Fund Tracker States
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
  const [isAddFundExpenseModalOpen, setIsAddFundExpenseModalOpen] = useState(false);
  
  // Add/Edit Fund Form States
  const [fundFormName, setFundFormName] = useState('');
  const [fundFormAmount, setFundFormAmount] = useState('');
  const [fundFormDate, setFundFormDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [editingFund, setEditingFund] = useState(null);
  
  // Add/Edit Fund Spend Form States
  const [fundSpendFormTitle, setFundSpendFormTitle] = useState('');
  const [fundSpendFormAmount, setFundSpendFormAmount] = useState('');
  const [fundSpendFormCategory, setFundSpendFormCategory] = useState('Shopping');
  const [fundSpendFormDate, setFundSpendFormDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [editingFundSpend, setEditingFundSpend] = useState(null);
  const [fundSpendFormType, setFundSpendFormType] = useState('expense'); // 'expense' or 'income'
  
  // Search within detailed fund view
  const [fundSearchQuery, setFundSearchQuery] = useState('');

  // Core Data States
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  
  // Theme option (default light, read from localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [offlineMode, setOfflineMode] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [hasConfirmedRoom, setHasConfirmedRoom] = useState(false);
  
  // Nicknames & Roommates Dynamic State
  const [userNickname, setUserNickname] = useState(() => localStorage.getItem('userNickname') || 'You');
  const [roomName, setRoomName] = useState(() => localStorage.getItem('roomName') || 'Tallyin');
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(() => localStorage.getItem('userNickname') || 'You');
  const [isNicknameFixed, setIsNicknameFixed] = useState(() => {
    const cached = localStorage.getItem('userNickname');
    return !!(cached && cached !== 'You' && cached.trim() !== '');
  });
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [settingsRoomNameInput, setSettingsRoomNameInput] = useState(() => localStorage.getItem('roomName') || 'Tallyin');
  const [nicknamePromptAction, setNicknamePromptAction] = useState(null); // null | 'create' | 'join'
  const [onboardingStep, setOnboardingStep] = useState('selection'); // 'selection' | 'room-name' | 'room-budget' | 'share-code'
  const [activityLogs, setActivityLogs] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  const [roomCreatedBy, setRoomCreatedBy] = useState(null); // uid of room creator (host)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));

  // Notification Config States
  const [notificationMethod, setNotificationMethod] = useState(() => localStorage.getItem('notificationMethod') || 'none');
  const [recipientEmails, setRecipientEmails] = useState(() => localStorage.getItem('recipientEmails') || '');
  const [emailJsServiceId, setEmailJsServiceId] = useState(() => localStorage.getItem('emailJsServiceId') || '');
  const [emailJsTemplateId, setEmailJsTemplateId] = useState(() => localStorage.getItem('emailJsTemplateId') || '');
  const [emailJsPublicKey, setEmailJsPublicKey] = useState(() => localStorage.getItem('emailJsPublicKey') || '');
  const [googleScriptUrl, setGoogleScriptUrl] = useState(() => localStorage.getItem('googleScriptUrl') || '');
  
  // Log download states
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');
  const [downloadAllLogs, setDownloadAllLogs] = useState(false);
  const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);
  
  // File upload reference
  const fileInputRef = useRef(null);
  
  // Room code copying
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3000);
  }, []);

  const openAddExpenseModal = (tx = null) => {
    if (tx) {
      setEditingTransaction(tx);
      setFormFor(tx.title);
      setFormAmount(tx.amount.toString());
      setFormCategory(tx.category);
      setFormDate(tx.date);

      // Resolve legacy or missing payer UIDs by matching nickname
      let payerUid = tx.paidByUid;
      if (!payerUid) {
        const mem = members.find(m => m.nickname === tx.paidBy);
        payerUid = mem ? mem.uid : (auth.currentUser?.uid || 'anonymous');
      }
      setFormPaidBy(payerUid);

      setSplitType(tx.splitType || 'equal');
      
      const initialSplits = {};
      const initialCustomValues = {};
      if (tx.splits && Array.isArray(tx.splits)) {
        // Resolve splits without UIDs by matching nickname too
        members.forEach(m => {
          initialSplits[m.uid] = tx.splits.some(s => s.uid === m.uid || s.nickname === m.nickname);
        });
        tx.splits.forEach(s => {
          const matchedMember = members.find(m => m.uid === s.uid || m.nickname === s.nickname);
          if (matchedMember) {
            // Fix: If percentage split type, load calculated percentages instead of absolute amounts
            if (tx.splitType === 'percentage') {
              const pct = tx.amount > 0 ? parseFloat(((s.amount / tx.amount) * 100).toFixed(2)) : 0;
              initialCustomValues[matchedMember.uid] = pct.toString();
            } else {
              initialCustomValues[matchedMember.uid] = s.amount.toString();
            }
          }
        });
      } else {
        members.forEach(m => {
          initialSplits[m.uid] = true;
        });
      }
      setSelectedSplitMembers(initialSplits);
      setCustomSplitValues(initialCustomValues);

      // Try to load the corresponding receipt image from the receipts list
      if (tx.isShared) {
        let receiptDateStr = '';
        if (tx.date) {
          const parts = tx.date.split('-');
          if (parts.length === 3) {
            const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            receiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
          }
        }
        const matchingReceipt = receipts.find(r => r.title === tx.title && r.amount === tx.amount && r.category === tx.category && r.date === receiptDateStr);
        if (matchingReceipt && matchingReceipt.imageUrl) {
          setFormReceiptImage(matchingReceipt.imageUrl);
        } else {
          setFormReceiptImage(null);
        }
      } else {
        setFormReceiptImage(null);
      }
    } else {
      setEditingTransaction(null);
      setFormFor('');
      setFormAmount('');
      setFormCategory('Food');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormRepeat(false);
      setSuggestedCategory(null);
      setFormReceiptImage(null);
      setSplitType('equal');
      const initialSplits = {};
      members.forEach(m => {
        initialSplits[m.uid] = true;
      });
      setSelectedSplitMembers(initialSplits);
      setCustomSplitValues({});
      const currentUid = auth.currentUser?.uid || 'anonymous';
      if (members.some(m => m.uid === currentUid)) {
        setFormPaidBy(currentUid);
      } else if (members.length > 0) {
        setFormPaidBy(members[0].uid);
      } else {
        setFormPaidBy(currentUid);
      }
    }
    setIsAddExpenseOpen(true);
  };

  const closeAddExpenseModal = () => {
    setIsAddExpenseOpen(false);
    setEditingTransaction(null);
    setFormFor('');
    setFormAmount('');
    setFormCategory('Food');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRepeat(false);
    setSuggestedCategory(null);
    setFormReceiptImage(null);
    setSplitType('equal');
    const initialSplits = {};
    members.forEach(m => {
      initialSplits[m.uid] = true;
    });
    setSelectedSplitMembers(initialSplits);
    setCustomSplitValues({});
    const currentUid = auth.currentUser?.uid || 'anonymous';
    if (members.some(m => m.uid === currentUid)) {
      setFormPaidBy(currentUid);
    } else if (members.length > 0) {
      setFormPaidBy(members[0].uid);
    } else {
      setFormPaidBy('');
    }
  };

  // Helper to convert HEIC image to JPEG/PNG format for browser compatibility
  const convertHeicToPng = async (file) => {
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.6
      });
      
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
        type: "image/jpeg"
      });
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      throw new Error("Failed to convert HEIC: " + (error.message || error.toString()), { cause: error });
    }
  };

  const handleFormReceiptChange = async (e) => {
    let file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
      triggerToast("Converting HEIC image... Please wait.");
      try {
        file = await convertHeicToPng(file);
      } catch (err) {
        triggerToast(err.message);
        return;
      }
    }

    if (file.size > 3 * 1024 * 1024) {
      triggerToast("File size too large. Please upload an image under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormReceiptImage(reader.result);
    };
    reader.onerror = () => {
      triggerToast("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  // New Transaction Form State
  const [formFor, setFormFor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState('2026-06-21');
  const [formRepeat, setFormRepeat] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [formReceiptImage, setFormReceiptImage] = useState(null);

  // Smart category keyword map
  const CATEGORY_KEYWORDS = {
    Groceries: [
      'egg','eggs','milk','bread','butter','cheese','vegetable','vegetables','fruit','fruits',
      'rice','dal','flour','sugar','salt','oil','grocery','groceries','supermarket','bigbasket',
      'blinkit','zepto','dmart','reliance fresh','more store','chicken','mutton','fish','meat',
      'paneer','curd','yogurt','onion','tomato','potato','atta','maida','pulses','lentils'
    ],
    Food: [
      'restaurant','cafe','hotel','food','lunch','dinner','breakfast','snack','pizza','burger',
      'biryani','dosa','idli','noodles','pasta','sushi','coffee','tea','chai','juice','swiggy',
      'zomato','eatery','canteen','mess','tiffin','dhaba','mcdonalds','kfc','dominos','subway',
      'thali','rolls','sandwich','shawarma','wrap','ice cream','dessert','cake','bakery'
    ],
    Transport: [
      'uber','ola','auto','cab','taxi','bus','metro','train','rickshaw','rapido','bike taxi',
      'transport','travel','commute','parking','toll','irctc','redbus','flight ticket'
    ],
    Fuel: [
      'fuel','petrol','diesel','cng','gas','hp','iocl','bpcl','shell','pump','refuel','filling'
    ],
    Utilities: [
      'electricity','electric','bill','water bill','gas bill','internet','wifi','broadband',
      'airtel','jio','bsnl','vodafone','vi','recharge','dth','tata sky','dish tv','cable','maintenance'
    ],
    Rent: [
      'rent','landlord','pg','hostel','accommodation','lease','flat rent','house rent','deposit'
    ],
    Shopping: [
      'amazon','flipkart','myntra','ajio','meesho','shopping','clothes','shirt','jeans','shoes',
      'sneakers','dress','saree','kurti','jacket','bag','wallet','watch','electronics','mobile',
      'laptop','gadget','earphones','headphones','charger','cable','cosmetics','beauty','salon'
    ],
    Entertainment: [
      'movie','cinema','netflix','hotstar','prime','spotify','youtube','concert','event',
      'show','ticket','bookmyshow','game','gaming','sport','gym','subscription','ott'
    ],
    Medical: [
      'medicine','medical','hospital','clinic','doctor','pharmacy','chemist','apollo','health',
      'tablet','capsule','syrup','injection','lab test','pathology','diagnostic','dentist'
    ],
    Payment: [
      'payment','transfer','upi','gpay','paytm','phonepe','neft','settlement','repay','paid back'
    ],
    People: [
      'family', 'friends', 'friend', 'brother', 'sister', 'mom', 'dad', 'mother', 'father',
      'wife', 'husband', 'son', 'daughter', 'uncle', 'aunty', 'cousin', 'parents', 'grandpa', 'grandma',
      'sent to', 'transfer to', 'send to', 'paid to', 'gave to', 'gift to', 'to ', 'send ', 'gpay to', 'pay to',
      'sampath', 'jogi', 'rahul', 'amit', 'rohit', 'priya', 'pooja', 'sneha', 'john', 'alex', 'sarah',
      'mike', 'david', 'emily', 'james', 'vijay', 'ajay', 'anil', 'sunil', 'sanjay', 'ranjit', 'raj',
      'ravi', 'karan', 'arjun', 'abhishek', 'vikram', 'vivek', 'pankaj', 'deepak', 'sandeep', 'manish',
      'vikas', 'rohan', 'akash', 'neha', 'tanvi', 'ananya', 'aditi', 'rhea', 'isha', 'sakshi', 'shruti',
      'harsh', 'yash', 'ishaan', 'kabir', 'aarav', 'vihaan', 'sai', 'krishna', 'ram', 'gopal', 'madhav'
    ]
  };

  const smartDetectCategory = (title) => {
    const lower = title.toLowerCase().trim();
    if (!lower) return null;

    const peoplePatterns = [
      /^sent\s+to\s+/,
      /^paid\s+to\s+/,
      /^transfer\s+to\s+/,
      /^send\s+to\s+/,
      /^gpay\s+to\s+/,
      /^payment\s+to\s+/,
      /^transferred\s+to\s+/,
      /^gave\s+to\s+/,
      /^gift\s+to\s+/
    ];
    if (peoplePatterns.some(pat => pat.test(lower))) {
      return 'People';
    }

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return null;
  };

  // Search & Filter State (Ledger)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Helper to log user actions in activity_logs table
  const logActivity = async (action, details, roomId = null) => {
    const targetRoom = roomId || userRoomId;
    if (!user || !targetRoom) return;
    // Optimistic update — add to local state immediately for zero-latency logs
    const optimisticLog = {
      id: `optimistic-${Date.now()}`,
      room_id: targetRoom,
      user_id: user.id,
      user_name: userNickname,
      action,
      details,
      created_at: new Date().toISOString()
    };
    setActivityLogs(prev => [optimisticLog, ...prev].slice(0, 100));
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          room_id: targetRoom,
          user_id: user.id,
          user_name: userNickname,
          action: action,
          details: details,
          created_at: new Date().toISOString()
        });
      if (error) {
        // RLS (Row Level Security) may be blocking the insert.
        // Fix: In Supabase Dashboard → Authentication → Policies → activity_logs
        // Add INSERT policy: (auth.uid() = user_id)
        // Also ensure SELECT policy exists for reading logs.
        console.warn('[Tallyin] Activity log insert blocked:', error.code, error.message);
      }
    } catch (err) {
      console.warn('[Tallyin] Failed to insert log activity:', err);
    }
  };

  const fetchUserRooms = useCallback(async () => {
    if (!user) return;
    
    // Optimistic UI: load from cache first
    const cachedKey = `userRooms_${user.id}`;
    const cachedData = localStorage.getItem(cachedKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed && parsed.length > 0) {
          setUserRooms(parsed);
        } else {
          setIsFetchingRooms(true);
        }
      } catch {
        setIsFetchingRooms(true);
      }
    } else {
      setIsFetchingRooms(true);
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('room_id, rooms:rooms(name, monthly_budget)')
        .eq('uid', user.id);
      
      if (error) throw error;
      
      const formatted = (data || [])
        .filter(item => item.rooms !== null)
        .map(item => ({
          roomId: item.room_id,
          roomName: item.rooms?.name || 'Tallyin',
          monthlyBudget: item.rooms?.monthly_budget || 22000
        }));
      setUserRooms(formatted);
      localStorage.setItem(cachedKey, JSON.stringify(formatted));
    } catch (err) {
      console.warn("Error fetching user rooms:", err);
    } finally {
      setIsFetchingRooms(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      fetchUserRooms();
    } else {
      setUserRooms([]);
    }
  }, [user, userRoomId, fetchUserRooms]);

  // Helper to add member to room in Supabase
  const addMemberToRoom = useCallback(async (roomId, nickname, currentUserObj = null) => {
    const activeUser = currentUserObj || user;
    if (!activeUser) return;
    try {
      const avatarUrl = activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || '';
      const { error } = await supabase
        .from('members')
        .upsert({
          room_id: roomId,
          uid: activeUser.id,
          nickname: nickname,
          photo_url: avatarUrl,
          email: activeUser.email || '',
          joined_at: new Date().toISOString()
        }, { onConflict: 'room_id,uid' });
      
      if (error) throw error;
    } catch (err) {
      console.error('Failed to add member to room in Supabase:', err);
    }
  }, [user]);

  const handleAuthUser = useCallback(async (currentUser) => {
    const cachedNickname = localStorage.getItem('userNickname');
    const displayName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
    const finalNickname = cachedNickname && cachedNickname !== 'You' ? cachedNickname : (displayName || 'You');
    setUserNickname(finalNickname);
    setNicknameInput(finalNickname);
    localStorage.setItem('userNickname', finalNickname);
    if (cachedNickname && cachedNickname !== 'You' && cachedNickname.trim() !== '') {
      setIsNicknameFixed(true);
    }

    // Load room ID from localStorage if available, otherwise fetch from Supabase
    // Fire-and-forget addMemberToRoom — don't await it to avoid login latency
    const localRoomId = localStorage.getItem('userRoomId');
    if (localRoomId) {
      setUserRoomId(localRoomId);
      addMemberToRoom(localRoomId, finalNickname, currentUser); // intentionally not awaited
    } else {
      // Fetch in parallel without blocking auth
      supabase
        .from('users')
        .select('room_id')
        .eq('uid', currentUser.id)
        .maybeSingle()
        .then(({ data: userProfile, error }) => {
          if (!error && userProfile?.room_id) {
            const rId = userProfile.room_id;
            setUserRoomId(rId);
            localStorage.setItem('userRoomId', rId);
            addMemberToRoom(rId, finalNickname, currentUser); // intentionally not awaited
          }
        })
        .catch(e => console.error('Error fetching user room ID:', e));
    }
    setAuthLoading(false); // Show app immediately — don't wait for DB ops
  }, [addMemberToRoom]);

  // Handle Supabase Auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        handleAuthUser(currentUser);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        handleAuthUser(currentUser);
      } else {
        setUserRoomId(null);
        localStorage.removeItem('userRoomId');
        localStorage.removeItem('userNickname');
        setUserNickname('You');
        setNicknameInput('You');
        setIsNicknameFixed(false);
        setHasConfirmedRoom(false);
        setAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link invite handler: parse ?join=ROOM-CODE from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.trim()) {
      // Clean the URL so the param doesn't persist on refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // Auth Initialization Timeout Fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn("Auth initialization timed out.");
        setAuthError("Tallyin is taking longer than usual to connect. Please check your Google Cloud Console API Key restrictions and allow your Vercel domain.");
        setAuthLoading(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [authLoading]);



  // Sync with dark mode class on document element and body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchTransactions = useCallback(async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('room_id', roomId)
        .order('date', { ascending: false });

      if (error) throw error;
      const mapped = (data || [])
        .map(t => ({
          id: t.id,
          roomId: t.room_id,
          title: t.title,
          amount: Number(t.amount) || 0,
          category: t.category,
          date: t.date,
          time: t.time,
          paidBy: t.paid_by,
          paidByUid: t.paid_by_uid,
          isShared: t.is_shared,
          isEdited: t.is_edited,
          splitType: t.split_type,
          split: t.split,
          splits: t.splits,
          createdBy: t.created_by
        }))
        .filter(t => {
          if (t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__') {
            return t.paidByUid === (user?.id || 'anonymous');
          }
          return true;
        });
      // Replace state: real DB rows supercede any optimistic entries
      setTransactions(mapped);
      setIsDbSynced(true);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setIsDbSynced(false);
    }
  }, [user]);

  const fetchActivityLogs = useCallback(async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      // Merge with any optimistic logs that haven't been confirmed yet
      setActivityLogs(prev => {
        const serverIds = new Set((data || []).map(l => l.id));
        const pendingOptimistic = prev.filter(l => 
          String(l.id).startsWith('optimistic-') && !serverIds.has(l.id) && l.room_id === roomId
        );
        return [...pendingOptimistic, ...(data || [])].slice(0, 100);
      });
    } catch (err) {
      console.warn("Error fetching activity logs:", err);
    }
  }, []);

  const downloadLogsAsCSV = (logs, fileName) => {
    const headers = ['Timestamp', 'User', 'Details', 'Action Type'];
    const rows = logs.map(l => [
      new Date(l.created_at).toLocaleString(),
      l.user_name || 'System',
      l.details || '',
      l.action_type || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadLogs = async () => {
    if (!userRoomId) return;
    setIsDownloadingLogs(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('room_id', userRoomId)
        .order('created_at', { ascending: false });
        
      if (!downloadAllLogs) {
        if (logStartDate) {
          query = query.gte('created_at', `${logStartDate}T00:00:00.000Z`);
        }
        if (logEndDate) {
          query = query.lte('created_at', `${logEndDate}T23:59:59.999Z`);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (!data || data.length === 0) {
        triggerToast('No activity logs found for the selected criteria.');
        setIsDownloadingLogs(false);
        return;
      }
      
      const dateRangeStr = downloadAllLogs 
        ? 'All_Time' 
        : `${logStartDate || 'Start'}_to_${logEndDate || 'End'}`;
      downloadLogsAsCSV(data, `Tallyin_Activity_Logs_${dateRangeStr}.csv`);
      triggerToast(`Successfully downloaded ${data.length} logs.`);
    } catch (err) {
      console.error('Failed to download activity logs:', err);
      triggerToast(`Failed to download logs: ${err.message}`);
    } finally {
      setIsDownloadingLogs(false);
    }
  };

  const fetchReceipts = useCallback(async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('room_id', roomId);

      if (error) throw error;
      const mappedReceipts = (data || []).map(r => ({
        id: r.id,
        title: r.title,
        amount: r.amount,
        category: r.category,
        date: r.date,
        bgClass: r.bg_class,
        rotation: r.rotation,
        imageUrl: r.image_url
      }));
      setReceipts(mappedReceipts);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  }, []);

  const fetchRoomSettings = useCallback(async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('monthly_budget, name, created_by')
        .eq('id', roomId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Room does not exist anymore (e.g. deleted by someone else or cleanup)! Clear active room.
        console.warn(`Room ${roomId} does not exist. Clearing active room.`);
        setUserRoomId(null);
        setHasConfirmedRoom(false);
        setTransactions([]);
        setReceipts([]);
        setMembers([]);
        setActivityLogs([]);
        setRoomCreatedBy(null);
        localStorage.removeItem('userRoomId');
        if (user) {
          supabase
            .from('users')
            .upsert({
              uid: user.id,
              room_id: null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'uid' })
            .catch(err => console.error(err));
        }
        await fetchUserRooms();
        triggerToast("Active room is no longer available.");
        return;
      }

      // Always update from DB — never trust stale cache
      if (data.monthly_budget !== undefined && data.monthly_budget !== null) {
        setMonthlyBudget(Number(data.monthly_budget));
        localStorage.setItem('monthlyBudget', data.monthly_budget);
      }
      if (data.name) {
        setRoomName(data.name);
        setSettingsRoomNameInput(data.name);
        localStorage.setItem('roomName', data.name);
      }
      // Track host (creator) for permission checks
      if (data.created_by) {
        setRoomCreatedBy(data.created_by);
      }
    } catch (err) {
      console.warn("Room settings fetch error:", err);
    }
  }, [user, fetchUserRooms, triggerToast]);

  const fetchMembers = useCallback(async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('room_id', roomId);

      if (error) throw error;
      
      const mappedMembers = (data || []).map(m => ({
        uid: m.uid,
        nickname: m.nickname,
        photoURL: m.photo_url || '',
        email: m.email || '',
        joinedAt: m.joined_at
      }));
      
      // Check if we are still a member of the room
      if (user && mappedMembers.length > 0 && !mappedMembers.some(m => m.uid === user.id)) {
        setUserRoomId(null);
        localStorage.removeItem('userRoomId');
        setHasConfirmedRoom(false);
        triggerToast("You have been removed from this room.");
        return;
      }

      setMembers(mappedMembers);
    } catch (err) {
      console.warn("Members fetch error:", err);
    }
  }, [user, triggerToast]);

  // Supabase Real-time Sync
  useEffect(() => {
    if (!user || !userRoomId) return;

    const timer = setTimeout(() => {
      fetchTransactions(userRoomId);
      fetchReceipts(userRoomId);
      fetchRoomSettings(userRoomId);
      fetchMembers(userRoomId);
      fetchActivityLogs(userRoomId);
    }, 0);

    const channel = supabase
      .channel(`room:${userRoomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `room_id=eq.${userRoomId}` },
        () => { fetchTransactions(userRoomId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'receipts', filter: `room_id=eq.${userRoomId}` },
        () => { fetchReceipts(userRoomId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members', filter: `room_id=eq.${userRoomId}` },
        () => { fetchMembers(userRoomId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${userRoomId}` },
        () => { fetchRoomSettings(userRoomId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs', filter: `room_id=eq.${userRoomId}` },
        () => { fetchActivityLogs(userRoomId); }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [user, userRoomId, fetchTransactions, fetchReceipts, fetchRoomSettings, fetchMembers, fetchActivityLogs]);

  // Login handler
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account consent',
          },
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Supabase login error:", err);
      setAuthError(`Auth Error: ${err.message}`);
      triggerToast(`Authentication failed: ${err.message}. (Please verify Supabase URL & Anon Key config)`);
      setAuthLoading(false);
    }
  };

  // Delete Room handler — HOST ONLY
  const handleDeleteRoom = async () => {
    if (!userRoomId) return;
    // Permission check
    if (user && roomCreatedBy && roomCreatedBy !== user.id) {
      triggerToast('Only the room host can delete the room.');
      return;
    }
    const confirmed = window.confirm(`Delete room ${userRoomId} permanently? All transactions and data will be lost. This cannot be undone.`);
    if (!confirmed) return;
    try {
      // 1. Generate and download JSON backup
      const backupData = {
        roomId: userRoomId,
        roomName: roomName,
        monthlyBudget: monthlyBudget,
        exportedAt: new Date().toISOString(),
        exportedBy: userNickname,
        members: members,
        transactions: transactions,
        receipts: receipts,
        activityLogs: activityLogs
      };

      const backupStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tallyin_room_backup_${userRoomId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Room backup JSON downloaded successfully!');

      // 2. Delete room from rooms table (will cascade delete members, transactions, receipts)
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', userRoomId);

      if (deleteError) throw deleteError;

      // Clear local state first
      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setTransactions([]);
      setReceipts([]);
      setMembers([]);
      setActivityLogs([]);
      setRoomCreatedBy(null);
      localStorage.removeItem('userRoomId');
      
      // Reset user room binding
      if (user) {
        try {
          await supabase
            .from('users')
            .upsert({
              uid: user.id,
              room_id: null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'uid' });
        } catch(e) { console.error(e); }
      }
      await fetchUserRooms();
      setOnboardingStep('selection');
      triggerToast('Room deleted. Redirected to onboarding.');
    } catch (err) {
      console.error('Delete room error:', err);
      triggerToast('Failed to fully delete room data from server, cleared locally.');
      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setTransactions([]);
      setReceipts([]);
      setMembers([]);
      setActivityLogs([]);
      setRoomCreatedBy(null);
      localStorage.removeItem('userRoomId');
      await fetchUserRooms();
      setOnboardingStep('selection');
    }
  };

  // Leave Room handler — for NON-HOST members to voluntarily leave
  const handleLeaveRoom = async () => {
    if (!userRoomId || !user) return;
    const confirmed = window.confirm('Leave this room? Your past expenses will remain in the room, but you will no longer be a member.');
    if (!confirmed) return;
    try {
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('room_id', userRoomId)
        .eq('uid', user.id);

      if (deleteError) throw deleteError;

      // Log the leave action before clearing state
      try {
        await supabase
          .from('activity_logs')
          .insert({
            room_id: userRoomId,
            user_id: user.id,
            user_name: userNickname,
            action: 'leave',
            details: `${userNickname} left the room.`,
            created_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn("Failed to log leave activity:", err);
      }

      // Clear user's room binding in users table
      (async () => {
        try {
          await supabase
            .from('users')
            .upsert({
              uid: user.id,
              room_id: null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'uid' });
        } catch (e) { console.error(e); }
      })();

      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setTransactions([]);
      setReceipts([]);
      setMembers([]);
      setActivityLogs([]);
      setRoomCreatedBy(null);
      localStorage.removeItem('userRoomId');
      await fetchUserRooms();
      setOnboardingStep('selection');
      triggerToast('You have left the room.');
    } catch (err) {
      console.error('Leave room error:', err);
      triggerToast(`Failed to leave room: ${err.message}`);
    }
  };

  // Remove member from room — HOST ONLY
  const handleRemoveMember = async (memberUid) => {
    if (!userRoomId) return;
    // Permission check
    if (user && roomCreatedBy && roomCreatedBy !== user.id) {
      triggerToast('Only the room host can remove members.');
      return;
    }
    const member = members.find(m => m.uid === memberUid);
    if (!member) return;
    const confirmed = window.confirm(`Remove ${member.nickname} from this room?`);
    if (!confirmed) return;
    try {
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('room_id', userRoomId)
        .eq('uid', memberUid);

      if (deleteError) throw deleteError;

      // If the removed member is the current user, clear their active room
      if (user && memberUid === user.id) {
        setUserRoomId(null);
        setHasConfirmedRoom(false);
        setTransactions([]);
        setReceipts([]);
        setMembers([]);
        setActivityLogs([]);
        setRoomCreatedBy(null);
        localStorage.removeItem('userRoomId');
        try {
          await supabase
            .from('users')
            .upsert({
              uid: user.id,
              room_id: null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'uid' });
        } catch(e) { console.error(e); }
      }

      await logActivity('remove', `${userNickname} removed ${member.nickname} from the room.`);
      triggerToast(`Removed ${member.nickname} from room.`);
    } catch (err) {
      console.error('Remove member error:', err);
      triggerToast('Failed to remove member.');
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setTransactions([]);
      setReceipts([]);
      setActivityLogs([]);
      setUserRoomId(null);
      localStorage.removeItem('userRoomId');
      setHasConfirmedRoom(false);
      setOnboardingStep('selection');
      triggerToast('Signed out successfully.');
    } catch (err) {
      console.error(err);
      triggerToast(`Sign out failed: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account and personal data? This action cannot be undone.\n\nNote: Shared room expenses you created will remain to preserve group balances, but your memberships and profile will be deleted."
    );
    if (!confirmDelete) return;

    setAuthLoading(true);
    try {
      await supabase.from('members').delete().eq('uid', user.id);
      await supabase.from('users').delete().eq('uid', user.id);
      
      // Verify if deletion actually worked (RLS might silently fail by returning 0 rows affected)
      const { data: memberCheck } = await supabase.from('members').select('uid').eq('uid', user.id).limit(1);
      if (memberCheck && memberCheck.length > 0) {
        throw new Error("Database security policies (RLS) prevented deletion. Please ensure your Supabase 'members' and 'users' tables have a DELETE policy allowing users to delete their own rows.");
      }

      localStorage.clear();
      await supabase.auth.signOut();
      
      setTransactions([]);
      setReceipts([]);
      setActivityLogs([]);
      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setUserNickname('You');
      setNicknameInput('You');
      setIsNicknameFixed(false);
      setUserRooms([]);
      setOnboardingStep('selection');
      triggerToast('Account data deleted successfully.');
    } catch (err) {
      console.error("Error deleting account:", err);
      triggerToast(`Failed to delete account: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEditTransaction = (tx) => {
    const canEdit = !tx.createdBy || tx.createdBy === 'anonymous' || tx.createdBy === user?.id;
    if (!canEdit) {
      triggerToast('You are not authorized to edit this expense. Only the creator can edit it.');
      return;
    }
    openAddExpenseModal(tx);
  };

  const handleDeleteTransaction = async (tx) => {
    const canDelete = !tx.createdBy || tx.createdBy === 'anonymous' || tx.createdBy === user?.id;
    if (!canDelete) {
      triggerToast('You are not authorized to delete this expense. Only the creator can delete it.');
      return;
    }
    const confirmed = window.confirm(`Delete expense "${tx.title}" of ${formatINR(tx.amount)}?`);
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', tx.id);
      
      if (error) throw error;

      // Delete corresponding receipt if it is a shared expense
      if (tx.isShared) {
        let receiptDateStr = '';
        if (tx.date) {
          const parts = tx.date.split('-');
          if (parts.length === 3) {
            const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            receiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
          }
        }

        await supabase
          .from('receipts')
          .delete()
          .eq('room_id', userRoomId || tx.room_id)
          .eq('title', tx.title)
          .eq('amount', tx.amount)
          .eq('category', tx.category)
          .eq('date', receiptDateStr);

        setReceipts(prev => prev.filter(r => !(r.title === tx.title && r.amount === tx.amount && r.category === tx.category && r.date === receiptDateStr)));
      }
      
      // Optimistic UI update
      setTransactions(prev => prev.filter(t => t.id !== tx.id));

      await logActivity('delete', `${userNickname} deleted expense "${tx.title}" (₹${tx.amount})`);
      triggerToast('Expense deleted successfully.');
    } catch (err) {
      console.error("Error deleting transaction:", err);
      triggerToast(`Failed to delete: ${err.message}`);
    }
  };

  // Helper to generate a room code with high entropy (4.1 Billion combinations)
  const generateUniqueRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let letters = '';
    for (let i = 0; i < 4; i++) {
      letters += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `TL-${letters}-${digits}`;
  };

  // Create Room handler with Supabase uniqueness check
  const handleCreateRoom = async () => {
    if (userNickname === 'You' || !userNickname.trim()) {
      triggerToast('Please set your nickname first.');
      return;
    }

    let uniqueCode = '';
    let exists = true;
    let attempts = 0;
    
    // Check up to 5 times for uniqueness (highly likely to succeed on 1st attempt)
    while (exists && attempts < 5) {
      uniqueCode = generateUniqueRoomCode();
      attempts++;
      
      try {
        const { data: room, error } = await supabase
          .from('rooms')
          .select('id')
          .eq('id', uniqueCode)
          .maybeSingle();
        
        if (error) throw error;
        if (!room) {
          exists = false;
        }
      } catch (err) {
        console.warn("Uniqueness check query error:", err);
        exists = false; 
      }
    }

    if (!uniqueCode) {
      uniqueCode = generateUniqueRoomCode();
    }
    
    try {
      // 1. Create a metadata document for the room to claim it
      const { error: roomError } = await supabase
        .from('rooms')
        .insert({
          id: uniqueCode,
          created_by: user ? user.id : 'anonymous',
          created_at: new Date().toISOString(),
          monthly_budget: monthlyBudget,
          name: roomNameInput.trim() || 'Tallyin'
        });

      if (roomError) throw roomError;
      
      // Register as member
      await addMemberToRoom(uniqueCode, userNickname);
      await fetchUserRooms();
      
      // 2. Set active room locally
      const finalRoomName = roomNameInput.trim() || 'Tallyin';
      setRoomName(finalRoomName);
      setSettingsRoomNameInput(finalRoomName);
      localStorage.setItem('roomName', finalRoomName);
      
      setUserRoomId(uniqueCode);
      localStorage.setItem('userRoomId', uniqueCode);
      setOnboardingStep('share-code');
      triggerToast(`Room ${uniqueCode} created!`);
      
      // 3. Write to users profile to bind user session
      if (user) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            uid: user.id,
            room_id: uniqueCode,
            updated_at: new Date().toISOString()
          }, { onConflict: 'uid' });
        
        if (userError) throw userError;
      }
    } catch (err) {
      console.error('Failed to save room creation to Supabase:', err);
      triggerToast(`Failed to create room: ${err.message || 'Supabase error'}. (Please check your connection and database status)`);
    }
  };

  // Join Room handler
  const handleJoinRoom = async () => {
    if (userNickname === 'You' || !userNickname.trim()) {
      triggerToast('Please set your nickname first.');
      return;
    }
    if (!joinInput || joinInput.trim() === '') {
      triggerToast('Please enter a valid room ID.');
      return;
    }
    const cleanId = joinInput.trim();
    
    try {
      // Verify room exists in Supabase
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (roomError) throw roomError;
      
      if (!room) {
        triggerToast(`Room ${cleanId} does not exist. Please check the code.`);
        return;
      }

      // Add user to the members of this room
      await addMemberToRoom(cleanId, userNickname);
      await fetchUserRooms();

      setUserRoomId(cleanId);
      localStorage.setItem('userRoomId', cleanId);
      setHasConfirmedRoom(true);
      triggerToast(`Joined room: ${cleanId}`);
      
      // Write to users profile
      if (user) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            uid: user.id,
            room_id: cleanId,
            updated_at: new Date().toISOString()
          }, { onConflict: 'uid' });
        
        if (userError) throw userError;
      }
    } catch (err) {
      console.error('Failed to save room joining to Supabase:', err);
      triggerToast(`Failed to join room: ${err.message || 'Supabase error'}. (Please check your connection and database status)`);
    }
  };



  // Dynamically calculated values based on synced transactions state
  const computedStats = useMemo(() => {
    const data = transactions.filter(t => t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__');
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';

    // Calculate totals
    let totalSpend = 0;
    let totalRoomSpend = 0;
    let personalSpend = 0;
    let sharedSpend = 0;
    
    // Map of member uid to net balance: paid - share
    const roomBalances = {};
    
    // Initialize balances for all current members
    members.forEach(m => {
      roomBalances[m.uid] = 0;
    });
    
    // Default fallback if members list is empty
    if (members.length === 0) {
      roomBalances[currentUid] = 0;
      roomBalances['roommate'] = 0;
    }

    data.forEach(t => {
      const amount = Number(t.amount) || 0;
      totalSpend += amount;
      if (t.isShared) {
        totalRoomSpend += amount;
      }

      // Determine payer UID
      let payerUid = t.paidByUid;
      if (!payerUid) {
        const isSelf = t.paidBy === userNickname;
        payerUid = isSelf ? currentUid : 'roommate';
      }

      // Add paid amount to payer's balance
      if (roomBalances[payerUid] !== undefined) {
        roomBalances[payerUid] += amount;
      } else {
        roomBalances[payerUid] = amount;
      }

      // Subtract split shares from everyone
      if (t.splits && Array.isArray(t.splits)) {
        t.splits.forEach(split => {
          let splitUid = split.uid;
          if (!splitUid) {
            const isSelf = split.nickname === userNickname || split.nickname === 'Alex';
            splitUid = isSelf ? currentUid : 'roommate';
          }
          
          if (roomBalances[splitUid] !== undefined) {
            roomBalances[splitUid] -= Number(split.amount) || 0;
          } else {
            roomBalances[splitUid] = -(Number(split.amount) || 0);
          }

          // Accumulate spend categories for the current logged-in user based on their share:
          if (splitUid === currentUid) {
            const shareAmt = Number(split.amount) || 0;
            if (t.isShared) {
              sharedSpend += shareAmt;
            } else {
              personalSpend += shareAmt;
            }
          }
        });
      } else {
        // Legacy splits fallback (50/50 shared vs 100% personal)
        if (t.isShared) {
          sharedSpend += amount;
          const halfShare = amount / 2;
          roomBalances[currentUid] -= halfShare;
          const roommateUid = members.find(m => m.uid !== currentUid)?.uid || 'roommate';
          if (roomBalances[roommateUid] !== undefined) {
            roomBalances[roommateUid] -= halfShare;
          } else {
            roomBalances[roommateUid] = -halfShare;
          }
        } else {
          if (payerUid === currentUid) {
            personalSpend += amount;
          }
          roomBalances[payerUid] -= amount;
        }
      }
    });

    const currentUserBalance = roomBalances[currentUid] || 0;

    return {
      totalSpend,
      totalRoomSpend,
      sharedSpend,
      personalSpend,
      balances: roomBalances,
      currentUserBalance,
      totalCount: data.length,
      juneSpend: totalSpend,
      totalShared: sharedSpend,
      personalPaidAlex: personalSpend
    };
  }, [transactions, members, userNickname, auth.currentUser]);

  // Helper to format activity log details nicely
  const formatLogDetails = (log) => {
    const details = log.details || '';
    if (log.action === 'edit' && details.includes(' edited ')) {
      const parts = details.split(' edited ');
      return (
        <>
          {parts[0]} <span className="text-amber-600 dark:text-amber-400 font-bold">edited</span> {parts[1]}
        </>
      );
    }
    if (log.action === 'delete' && details.includes(' deleted expense ')) {
      const parts = details.split(' deleted expense ');
      return (
        <>
          {parts[0]} <span className="text-red-600 dark:text-rose-400 font-bold">deleted expense</span> {parts[1]}
        </>
      );
    }
    if (log.action === 'create' && details.includes(' added expense ')) {
      const parts = details.split(' added expense ');
      return (
        <>
          {parts[0]} <span className="text-emerald-600 dark:text-[#A3E635] font-bold">added expense</span> {parts[1]}
        </>
      );
    }
    if (log.action === 'settle' && details.includes(' recorded payment of ')) {
      const parts = details.split(' recorded payment of ');
      return (
        <>
          {parts[0]} <span className="text-blue-600 dark:text-blue-400 font-bold">recorded payment of</span> {parts[1]}
        </>
      );
    }
    if (log.action === 'remove' && details.includes(' removed ')) {
      const parts = details.split(' removed ');
      return (
        <>
          {parts[0]} <span className="text-rose-500 font-bold">removed</span> {parts[1]}
        </>
      );
    }
    if (log.action === 'settings' && details.includes(' updated the monthly budget to ')) {
      const parts = details.split(' updated the monthly budget to ');
      return (
        <>
          {parts[0]} <span className="text-indigo-600 dark:text-indigo-400 font-bold">updated the monthly budget to</span> {parts[1]}
        </>
      );
    }
    return details;
  };

  // Subtitle helper for ledger displays
  const getTransactionSubtitle = (t) => {
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
    const payerName = t.paidByUid === currentUid ? 'You' : t.paidBy;
    
    let splitText;
    if (!t.isShared) {
      // Find who the personal expense is for
      const splitTarget = t.splits?.[0];
      if (splitTarget) {
        const targetName = splitTarget.uid === currentUid ? 'You' : splitTarget.nickname;
        splitText = `personal (for ${targetName})`;
      } else {
        splitText = 'personal';
      }
    } else if (t.splitType) {
      if (t.splitType === 'equal') {
        splitText = 'split equally';
      } else if (t.splitType === 'percentage') {
        if (t.splits && Array.isArray(t.splits)) {
          const breakdown = t.splits.map(s => {
            const name = s.uid === currentUid ? 'You' : (s.nickname ? s.nickname.trim() : 'Unknown');
            const pct = t.amount > 0 ? Math.round((s.amount / t.amount) * 100) : 0;
            return `${name}: ${pct}%`;
          }).join(', ');
          splitText = `split by % (${breakdown})`;
        } else {
          splitText = 'split by %';
        }
      } else if (t.splitType === 'amount') {
        if (t.splits && Array.isArray(t.splits)) {
          const breakdown = t.splits.map(s => {
            const name = s.uid === currentUid ? 'You' : (s.nickname ? s.nickname.trim() : 'Unknown');
            return `${name}: ${formatINR(s.amount)}`;
          }).join(', ');
          splitText = `split by ₹ (${breakdown})`;
        } else {
          splitText = 'split by amount';
        }
      } else {
        splitText = 'shared';
      }
    } else {
      splitText = t.isShared ? 'split equally' : 'personal';
    }
    
    return `${payerName} paid • ${splitText}`;
  };

  // Copy Room Code Helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userRoomId || '');
    setRoomCodeCopied(true);
    triggerToast('Room code copied to clipboard!');
    setTimeout(() => setRoomCodeCopied(false), 2000);
  };

  // Client-Side Email Notification Dispatcher
  const sendEmailNotification = async (transaction) => {
    if (!notificationMethod || notificationMethod === 'none') return;
    
    const formattedAmount = `₹${transaction.amount.toLocaleString("en-IN")}`;
    const roomDisplayName = userRoomId || 'TL-ROOM';
    const messageText = `Tallyin Alert: A new expense "${transaction.title}" of ${formattedAmount} was added by ${transaction.paidBy} in Room ${roomDisplayName}.`;
    
    // Automatically include all other room members' emails
    const emailList = [...new Set([
      ...recipientEmails.split(',').map(e => e.trim()).filter(Boolean),
      ...members.filter(m => m.uid !== user?.id && m.email).map(m => m.email)
    ])];
    
    if (emailList.length === 0) return;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #F6F8F6; color: #1A3827; border-radius: 16px; border: 1px solid #E3E8E3; max-width: 500px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="color: #1A3827; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Tallyin Expense</h2>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #5C6E5C; margin: 0 0 16px 0; font-weight: bold;">Real-time Billing Sync</p>
        <div style="background-color: white; padding: 20px; border-radius: 12px; border: 1px solid #E3E8E3; margin-bottom: 16px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #5C6E5C;">Hi Roommate,</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #1A3827;">
            A new expense has been recorded in room <strong>${roomDisplayName}</strong>:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C; width: 100px;">Description:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827; font-weight: bold;">${transaction.title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C;">Amount:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827; font-weight: bold; font-size: 15px;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C;">Paid By:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827; font-weight: 600;">${transaction.paidBy}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C;">Split Ratio:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827;">${transaction.split}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 11px; color: #5C6E5C; text-align: center; margin: 0;">Open your Tallyin dashboard to view the full ledger or settle balances.</p>
      </div>
    `;

    if (notificationMethod === 'google-script' && googleScriptUrl) {
      try {
        for (const email of emailList) {
          await fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
              to: email,
              subject: `Tallyin Expense: ${transaction.title} (${formattedAmount})`,
              htmlBody: htmlBody,
              textBody: messageText
            })
          });
        }
        console.log('Client-side Google Apps Script email triggered successfully');
      } catch (err) {
        console.error('Failed client-side Apps Script email trigger:', err);
      }
    } else if (notificationMethod === 'emailjs' && emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
      try {
        for (const email of emailList) {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: emailJsServiceId,
              template_id: emailJsTemplateId,
              user_id: emailJsPublicKey,
              template_params: {
                to_email: email,
                title: transaction.title,
                amount: formattedAmount,
                paid_by: transaction.paidBy,
                split_type: transaction.split,
                room_id: roomDisplayName
              }
            })
          });
          if (response.ok) {
            console.log(`EmailJS notification sent to ${email}`);
          } else {
            const errText = await response.text();
            console.error(`EmailJS error response: ${errText}`);
          }
        }
      } catch (err) {
        console.error('Failed client-side EmailJS trigger:', err);
      }
    }
  };

  // Add expense handler to Firestore
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formFor || !formAmount) {
      triggerToast('Please fill out the description and amount.');
      return;
    }

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast('Please enter a valid amount.');
      return;
    }

    // Calculate splits array
    let splitsArray = [];
    const checkedUids = Object.keys(selectedSplitMembers).filter(uid => selectedSplitMembers[uid]);
    
    if (checkedUids.length === 0) {
      triggerToast('Please select at least one roommate to split with.');
      return;
    }
    
    if (splitType === 'equal') {
      const shareAmount = amountNum / checkedUids.length;
      splitsArray = checkedUids.map(uid => {
        const mem = members.find(m => m.uid === uid) || { nickname: uid === (auth.currentUser?.uid || 'anonymous') ? userNickname : 'Unknown' };
        return {
          uid,
          nickname: mem.nickname,
          amount: shareAmount
        };
      });
    } else if (splitType === 'percentage') {
      let totalPct = 0;
      checkedUids.forEach(uid => {
        totalPct += parseFloat(customSplitValues[uid]) || 0;
      });
      
      if (Math.abs(totalPct - 100) > 0.01) {
        triggerToast(`Total split percentages must sum to 100%. Current total: ${totalPct}%`);
        return;
      }
      
      splitsArray = checkedUids.map(uid => {
        const pct = parseFloat(customSplitValues[uid]) || 0;
        const mem = members.find(m => m.uid === uid) || { nickname: uid === (auth.currentUser?.uid || 'anonymous') ? userNickname : 'Unknown' };
        return {
          uid,
          nickname: mem.nickname,
          amount: amountNum * (pct / 100)
        };
      });
    } else if (splitType === 'amount') {
      let totalAmt = 0;
      checkedUids.forEach(uid => {
        totalAmt += parseFloat(customSplitValues[uid]) || 0;
      });
      
      if (Math.abs(totalAmt - amountNum) > 0.1) {
        triggerToast(`Total split amounts must equal the expense amount (₹${amountNum}). Current total: ₹${totalAmt}`);
        return;
      }
      
      splitsArray = checkedUids.map(uid => {
        const amt = parseFloat(customSplitValues[uid]) || 0;
        const mem = members.find(m => m.uid === uid) || { nickname: uid === (auth.currentUser?.uid || 'anonymous') ? userNickname : 'Unknown' };
        return {
          uid,
          nickname: mem.nickname,
          amount: amt
        };
      });
    }

    const currentRoom = userRoomId || 'TL-7729-XM';
    const payerMember = members.find(m => m.uid === formPaidBy) || { nickname: userNickname };
    
    // Determine split label text and classification
    let splitLabel;
    let isSharedExpense = true;
    if (splitsArray.length === 1) {
      isSharedExpense = false;
      if (splitsArray[0].uid === formPaidBy) {
        splitLabel = 'Personal';
      } else {
        splitLabel = `Personal (${splitsArray[0].nickname})`;
      }
    } else {
      splitLabel = splitType === 'equal' ? 'Shared (Equal)' : `Shared (${splitType})`;
    }

    const newPayload = {
      title: formFor,
      amount: amountNum,
      category: formCategory,
      date: formDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paidBy: payerMember.nickname,
      paidByUid: formPaidBy,
      isShared: isSharedExpense,
      splitType,
      split: splitLabel,
      splits: splitsArray
    };

    if (editingTransaction) {
      try {
        const { error: txError } = await supabase
          .from('transactions')
          .update({
            title: newPayload.title,
            amount: newPayload.amount,
            category: newPayload.category,
            date: newPayload.date,
            paid_by: newPayload.paidBy,
            paid_by_uid: newPayload.paidByUid,
            is_shared: newPayload.isShared,
            is_edited: true,
            split_type: newPayload.splitType,
            split: newPayload.split,
            splits: newPayload.splits
          })
          .eq('id', editingTransaction.id);

        if (txError) throw txError;

        if (newPayload.isShared) {
          let oldReceiptDateStr = '';
          if (editingTransaction.date) {
            const parts = editingTransaction.date.split('-');
            if (parts.length === 3) {
              const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              oldReceiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
            }
          }

          const newReceiptDateStr = new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' });
          
          const { data: updatedReceipts, error: receiptUpdateError } = await supabase
            .from('receipts')
            .update({
              title: formFor,
              amount: amountNum,
              category: formCategory,
              date: newReceiptDateStr,
              image_url: formReceiptImage
            })
            .eq('room_id', currentRoom)
            .eq('title', editingTransaction.title)
            .eq('amount', editingTransaction.amount)
            .eq('category', editingTransaction.category)
            .eq('date', oldReceiptDateStr)
            .select();

          if (!receiptUpdateError && (!updatedReceipts || updatedReceipts.length === 0)) {
            const bgColors = [
              'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
              'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
              'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
              'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
            ];
            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
            const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
            const randomRot = rotations[Math.floor(Math.random() * rotations.length)];

            await supabase
              .from('receipts')
              .insert({
                room_id: currentRoom,
                title: formFor,
                amount: amountNum,
                category: formCategory,
                date: newReceiptDateStr,
                bg_class: randomBg,
                rotation: randomRot,
                image_url: formReceiptImage
              });
          }
        } else {
          let oldReceiptDateStr = '';
          if (editingTransaction.date) {
            const parts = editingTransaction.date.split('-');
            if (parts.length === 3) {
              const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              oldReceiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
            }
          }
          await supabase
            .from('receipts')
            .delete()
            .eq('room_id', currentRoom)
            .eq('title', editingTransaction.title)
            .eq('amount', editingTransaction.amount)
            .eq('category', editingTransaction.category)
            .eq('date', oldReceiptDateStr);
        }

        fetchReceipts(currentRoom);

        // Optimistic UI update — update in local state immediately
        setTransactions(prev => prev.map(t => 
          t.id === editingTransaction.id
            ? { ...t, ...newPayload, isEdited: true }
            : t
        ));
        
        await logActivity('edit', `${userNickname} edited expense "${newPayload.title}" to ₹${newPayload.amount}`);
        triggerToast("Expense updated successfully!");
        
        closeAddExpenseModal();
      } catch (error) {
        console.error("Error updating transaction:", error);
        triggerToast(`Failed to update: ${error.message}`);
      }
    } else {
      // Optimistic UI — close modal and add to local state immediately
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticTx = {
        id: optimisticId,
        ...newPayload,
        createdBy: user ? user.id : 'anonymous',
        room_id: currentRoom
      };
      setTransactions(prev => [optimisticTx, ...prev]);
      closeAddExpenseModal();

      try {
        const { data: insertedTx, error: txError } = await supabase
          .from('transactions')
          .insert({
            room_id: currentRoom,
            title: newPayload.title,
            amount: newPayload.amount,
            category: newPayload.category,
            date: newPayload.date,
            time: newPayload.time,
            paid_by: newPayload.paidBy,
            paid_by_uid: newPayload.paidByUid,
            is_shared: newPayload.isShared,
            split_type: newPayload.splitType,
            split: newPayload.split,
            splits: newPayload.splits,
            created_by: user ? user.id : 'anonymous'
          })
          .select()
          .single();

        if (txError) throw txError;

        // Replace optimistic entry with real DB row (has real id)
        if (insertedTx) {
          setTransactions(prev => prev.map(t =>
            t.id === optimisticId
              ? { ...newPayload, id: insertedTx.id, createdBy: insertedTx.created_by, room_id: insertedTx.room_id }
              : t
          ));
        }

        await logActivity('create', `${userNickname} added expense "${newPayload.title}" (₹${newPayload.amount})`);

        if (newPayload.isShared && formReceiptImage) {
          const bgColors = [
            'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
            'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
            'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
            'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
          ];
          const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
          const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
          const randomRot = rotations[Math.floor(Math.random() * rotations.length)];
          
          supabase
            .from('receipts')
            .insert({
              room_id: currentRoom,
              title: formFor,
              amount: amountNum,
              category: formCategory,
              date: new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' }),
              bg_class: randomBg,
              rotation: randomRot,
              image_url: formReceiptImage
            })
            .then(({ error: receiptError }) => {
              if (receiptError) {
                console.warn('Receipt insert error:', receiptError);
              } else {
                fetchReceipts(currentRoom);
              }
            });
        }

        // Send client-side email notifications if configured
        if (notificationMethod !== 'none' && recipientEmails) {
          sendEmailNotification(newPayload);
          triggerToast(`Added! 📧 Email notification sent.`);
        } else {
          triggerToast("Expense added!");
        }
      } catch (error) {
        console.error(error);
        // Optimistic entry already in state — just show error toast
        triggerToast(`Saved locally (DB sync failed: ${error.message || 'database error'}).`);
      }
    }
  };

  // Upload Receipt trigger
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Receipt File upload selection handler
  // Download Receipt helper
  const handleDownloadReceipt = (r) => {
    if (r.imageUrl) {
      let ext = 'png';
      const mime = r.imageUrl.match(/data:([^;]+);/);
      if (mime && mime[1]) {
        const parts = mime[1].split('/');
        if (parts[1]) ext = parts[1];
      }
      
      const link = document.createElement('a');
      link.href = r.imageUrl;
      link.download = `${r.title.toLowerCase().replace(/\s+/g, '_')}_receipt.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Receipt downloaded!');
    } else {
      const receiptText = `==========================================
             TALLYIN RECEIPT VOUCHER
==========================================
Room Workspace : ${userRoomId || 'N/A'}
Room Name      : ${roomName}

Receipt ID     : ${r.id}
Title          : ${r.title}
Amount         : ${formatINR(r.amount)}
Category       : ${r.category}
Date           : ${r.date}

Status         : Logged communal purchase
==========================================
Generated by Tallyin on ${new Date().toLocaleDateString()}
`;
      const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${r.title.toLowerCase().replace(/\s+/g, '_')}_receipt.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Text receipt downloaded!');
    }
  };

  // Receipt File upload selection handler
  const handleReceiptUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
      triggerToast("Converting HEIC image... Please wait.");
      try {
        file = await convertHeicToPng(file);
      } catch (err) {
        triggerToast(err.message);
        return;
      }
    }

    if (file.size > 3 * 1024 * 1024) {
      triggerToast("File size too large. Please upload an image under 3MB.");
      return;
    }

    const title = file.name.split('.')[0] || "Uploaded Receipt";
    const enteredAmount = prompt(`Confirm amount for receipt "${title}":`, "1240");
    if (enteredAmount === null) return; 

    const amountNum = parseFloat(enteredAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast("Invalid receipt amount.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;

      const bgColors = [
        'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
        'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
        'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
        'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
      ];
      const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
      const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
      const randomRot = rotations[Math.floor(Math.random() * rotations.length)];

      const newReceipt = {
        title: title,
        amount: amountNum,
        category: 'Groceries',
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
        bgClass: randomBg,
        rotation: randomRot,
        imageUrl: base64Data
      };

      const currentRoom = userRoomId || 'TL-7729-XM';
      try {
        const { error: uploadError } = await supabase
          .from('receipts')
          .insert({
            room_id: currentRoom,
            title: newReceipt.title,
            amount: newReceipt.amount,
            category: newReceipt.category,
            date: newReceipt.date,
            bg_class: newReceipt.bgClass,
            rotation: newReceipt.rotation,
            image_url: newReceipt.imageUrl
          });

        if (uploadError) throw uploadError;
        triggerToast(`Receipt uploaded! 📧 Notification sent to roommates.`);
      } catch (err) {
        console.error(err);
        setReceipts([newReceipt, ...receipts]);
        triggerToast(`Failed to upload: ${err.message || 'database error'}`);
      }
    };
    reader.onerror = () => {
      triggerToast("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  // Attach Receipt Image to existing transaction receipt
  const handleAttachReceiptImage = (receiptId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      let file = e.target.files?.[0];
      if (!file) return;

      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
        triggerToast("Converting HEIC image... Please wait.");
        try {
          file = await convertHeicToPng(file);
        } catch (err) {
          triggerToast(err.message);
          return;
        }
      }

      if (file.size > 3 * 1024 * 1024) {
        triggerToast("File size too large. Please upload an image under 3MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const { error } = await supabase
            .from('receipts')
            .update({ image_url: base64Data })
            .eq('id', receiptId);

          if (error) throw error;

          setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, imageUrl: base64Data } : r));
          triggerToast('Receipt image attached successfully!');
        } catch (err) {
          console.error("Error attaching receipt:", err);
          triggerToast(`Failed to attach image: ${err.message}`);
        }
      };
      reader.onerror = () => {
        triggerToast("Failed to read file.");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Delete a receipt permanently from database and state
  const handleDeleteReceipt = async (receiptId) => {
    const confirmed = window.confirm("Delete this receipt image and entry permanently?");
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (error) throw error;

      setReceipts(prev => prev.filter(r => r.id !== receiptId));
      setActiveReceiptZoom(null);
      triggerToast("Receipt deleted successfully.");
    } catch (err) {
      console.error("Error deleting receipt:", err);
      triggerToast(`Failed to delete receipt: ${err.message}`);
    }
  };

  // Settle Up handler
  const handleSettleUp = () => {
    if (members.length < 2) {
      triggerToast('You need at least two roommates in the room to settle up.');
      return;
    }
    
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
    const myBalance = computedStats.currentUserBalance;
    
    if (myBalance < 0) {
      // Current user owes money.
      setSettlePayer(currentUid);
      // Find the member with the highest positive balance (is owed the most)
      let bestReceiver = '';
      let maxOwed = -Infinity;
      members.forEach(m => {
        if (m.uid !== currentUid) {
          const bal = computedStats.balances[m.uid] || 0;
          if (bal > maxOwed) {
            maxOwed = bal;
            bestReceiver = m.uid;
          }
        }
      });
      setSettleReceiver(bestReceiver || members.find(m => m.uid !== currentUid)?.uid || '');
      setSettleAmount(Math.abs(myBalance).toFixed(2));
    } else {
      // Current user is owed money (or balance is 0).
      // Find the member who owes the most (most negative balance)
      let bestPayer = '';
      let maxOwes = Infinity;
      members.forEach(m => {
        if (m.uid !== currentUid) {
          const bal = computedStats.balances[m.uid] || 0;
          if (bal < maxOwes) {
            maxOwes = bal;
            bestPayer = m.uid;
          }
        }
      });
      const payerUid = bestPayer || members.find(m => m.uid !== currentUid)?.uid || '';
      setSettlePayer(payerUid);
      setSettleReceiver(currentUid);
      const payerBal = computedStats.balances[payerUid] || 0;
      setSettleAmount(Math.abs(payerBal).toFixed(2));
    }
    
    setIsSettleModalOpen(true);
  };

  // Record custom settle payment handler
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(settleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast('Please enter a valid amount.');
      return;
    }
    if (settlePayer === settleReceiver) {
      triggerToast('Payer and receiver cannot be the same roommate.');
      return;
    }

    const payer = members.find(m => m.uid === settlePayer);
    const receiver = members.find(m => m.uid === settleReceiver);
    if (!payer || !receiver) return;

    const currentRoom = userRoomId || 'TL-7729-XM';
    const newPayload = {
      title: `Payment: ${payer.nickname} to ${receiver.nickname}`,
      amount: amountNum,
      category: 'Payment',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paidBy: payer.nickname,
      paidByUid: settlePayer,
      isShared: true,
      splitType: 'amount',
      splits: [
        { uid: settlePayer, nickname: payer.nickname, amount: 0 },
        { uid: settleReceiver, nickname: receiver.nickname, amount: amountNum }
      ]
    };

    try {
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          room_id: currentRoom,
          title: newPayload.title,
          amount: newPayload.amount,
          category: newPayload.category,
          date: newPayload.date,
          time: newPayload.time,
          paid_by: newPayload.paidBy,
          paid_by_uid: newPayload.paidByUid,
          is_shared: newPayload.isShared,
          split_type: newPayload.splitType,
          split: newPayload.split,
          splits: newPayload.splits
        });

      if (txError) throw txError;

      // Optimistic UI update so balances adjust immediately
      const optimisticTx = {
        id: `optimistic-payment-${Date.now()}`,
        ...newPayload,
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [optimisticTx, ...prev]);

      await logActivity('settle', `${payer.nickname} recorded payment of ${formatINR(amountNum)} to ${receiver.nickname}`);
      triggerToast(`Recorded payment of ${formatINR(amountNum)} from ${payer.nickname} to ${receiver.nickname}!`);
      setIsSettleModalOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast(`Failed to record payment: ${err.message}`);
    }
  };

  // Invite trigger
  const handleInviteTrigger = async () => {
    const currentRoom = userRoomId || 'TL-7729-XM';
    const shareData = {
      title: 'Tallyin Shared Space',
      text: `Join my roommate shared space on Tallyin! Use Code: ${currentRoom}`,
      url: `https://tallyin.app/invite/${currentRoom}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast('Shared successfully!');
      } catch {
        setIsInviteModalOpen(true);
      }
    } else {
      setIsInviteModalOpen(true);
    }
  };

  // Get icon for categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food':
      case 'Dining':
        return <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Groceries':
        return <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'Utilities':
        return <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Rent':
        return <HouseIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Shopping':
        return <ShoppingCart className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'Fuel':
        return <span className="text-sm">⛽</span>;
      case 'Entertainment':
        return <span className="text-sm">🎬</span>;
      case 'Medical':
        return <span className="text-sm">🏥</span>;
      case 'Transport':
        return <span className="text-sm">🚌</span>;
      case 'Payment':
        return <span className="text-sm">💸</span>;
      case 'People':
        return <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      default:
        return <CategoryIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Helper to format currency
  const formatINR = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0.00';
    return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // CSV Export Handler
  const exportToCSV = (list = null) => {
    try {
      const dataList = Array.isArray(list) ? list : filteredTransactions;
      if (dataList.length === 0) {
        triggerToast('No transaction records to export.');
        return;
      }

      const headers = ['Date', 'Time', 'Description', 'Amount (INR)', 'Category', 'Paid By', 'Split Type'];
      const rows = dataList.map(t => [
        `"${t.date || ''}"`,
        `"${t.time || ''}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${t.category || ''}"`,
        `"${t.paidBy || ''}"`,
        `"${t.split || (t.isShared ? 'Shared' : 'Personal')}"`
      ].join(','));

      const csvText = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tallyin_room_${userRoomId || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('CSV downloaded successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to export CSV.');
    }
  };

  // Excel Export Handler (styled XLS format)
  const exportToExcel = (list = null) => {
    try {
      const dataList = Array.isArray(list) ? list : filteredTransactions;
      if (dataList.length === 0) {
        triggerToast('No transaction records to export.');
        return;
      }

      const totalSpend = dataList.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const memberNames = members.map(m => m.nickname).join(' & ') || userNickname;

      const excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Ledger Sheet</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #1A3827; color: #ffffff; font-weight: bold; font-size: 13px; }
            td, th { border: 1px solid #E3E8E3; padding: 10px; text-align: left; font-size: 12px; }
            tr:nth-child(even) { background-color: #F6F8F6; }
            .header-info { margin-bottom: 20px; }
            .header-title { font-size: 18px; color: #1A3827; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <span class="header-title">Tallyin Financial Ledger Report</span><br/>
            <b>Room Workspace:</b> ${userRoomId || 'N/A'}<br/>
            <b>Room Name:</b> ${roomName}<br/>
            <b>Exported by:</b> ${userNickname} (${user?.email || 'N/A'})<br/>
            <b>Exported on:</b> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br/>
            <b>Total Selected Spend:</b> ${formatINR(totalSpend)}<br/>
            <b>Members:</b> ${memberNames}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Description/Merchant</th>
                <th>Amount (INR)</th>
                <th>Category</th>
                <th>Paid By</th>
                <th>Split Type</th>
              </tr>
            </thead>
            <tbody>
              ${dataList.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.time}</td>
                  <td>${t.title}</td>
                  <td>${t.amount}</td>
                  <td>${t.category}</td>
                  <td>${t.paidBy}</td>
                  <td>${t.split}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tallyin_ledger_export_${userRoomId || 'room'}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerToast("Excel file downloaded successfully!");
    } catch (error) {
      console.error(error);
      triggerToast("Failed to export Excel spreadsheet.");
    }
  };

  // PDF Export Handler — opens styled print page in new tab
  const exportToPDF = (list = null) => {
    try {
      const dataList = Array.isArray(list) ? list : filteredTransactions;
      if (dataList.length === 0) {
        triggerToast('No transaction records to export.');
        return;
      }

      const totalSpend = dataList.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const sharedSpend = dataList.filter(t => t.isShared).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const personalSpend = totalSpend - sharedSpend;
      const myBalance = computedStats.currentUserBalance;
      const statusText = myBalance === 0
        ? 'All settled up'
        : myBalance > 0
          ? `You are owed ${formatINR(myBalance)}`
          : `You owe ${formatINR(Math.abs(myBalance))}`;
      const memberNames = members.map(m => m.nickname).join(', ') || userNickname;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tallyin Ledger - Statement of Account</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; color: #102217; padding: 40px; background-color: #ffffff; }
            .header-banner { background-color: #1A3827; color: #ffffff; padding: 24px 32px; border-radius: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo-title { display: flex; align-items: center; gap: 12px; }
            .logo-icon { width: 36px; height: 36px; background: #eaf0ec; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #1A3827; }
            .logo-text { font-weight: 800; font-size: 22px; letter-spacing: -0.025em; }
            .doc-info { text-align: right; font-size: 11px; opacity: 0.85; line-height: 1.5; }
            
            .summary-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #5C6E5C; letter-spacing: 0.05em; margin-bottom: 12px; }
            .cards-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #E3E8E3; border-radius: 16px; padding: 16px; background-color: #fcfdfc; }
            .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #5C6E5C; margin-bottom: 4px; }
            .card-value { font-size: 18px; font-weight: 800; color: #1A3827; }
            
            .status-banner { background-color: #EAF0EC; border: 1px solid rgba(26, 56, 39, 0.1); border-radius: 12px; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #1A3827; margin-bottom: 30px; display: flex; align-items: center; gap: 8px; }
            .status-dot { width: 8px; height: 8px; background-color: #A3E635; border-radius: 50%; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #1A3827; color: white; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; }
            td { padding: 12px 16px; border-bottom: 1px solid #E3E8E3; font-size: 12px; }
            tr:nth-child(even) td { background-color: #fbfdfb; }
            
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
            .badge-shared { background-color: #eaf0ec; color: #1a3827; }
            .badge-personal { background-color: #f1f3f1; color: #5c6e5c; }
            
            .footer { border-top: 1px solid #E3E8E3; padding-top: 16px; text-align: center; font-size: 10px; color: #5C6E5C; }
            
            @media print {
              body { padding: 20px; }
              .header-banner { background-color: #1A3827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              th { background-color: #1A3827 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .summary-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .status-banner { background-color: #EAF0EC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="logo-title">
              <div class="logo-icon">T</div>
              <div class="logo-text">Tallyin</div>
            </div>
            <div class="doc-info">
              <b>Room Statement</b><br/>
              <b>Room Name:</b> ${roomName}<br/>
              <b>Workspace ID:</b> ${userRoomId || 'N/A'}<br/>
              <b>Exported by:</b> ${userNickname} (${user?.email || 'N/A'})<br/>
              <b>Generated on:</b> ${new Date().toLocaleDateString()}<br/>
              <b>Members:</b> ${memberNames}
            </div>
          </div>
          
          <h4 class="summary-title">Financial Summary</h4>
          <div class="cards-grid">
            <div class="summary-card">
              <p class="card-label">Total Spent</p>
              <p class="card-value">${formatINR(totalSpend)}</p>
              <p style="font-size:10px;color:#5C6E5C;margin-top:4px">Shared + Personal</p>
            </div>
            <div class="summary-card" style="border-color:#d1fae5;background-color:#f0fdf4">
              <p class="card-label" style="color:#065f46">Shared Bills</p>
              <p class="card-value" style="color:#065f46">${formatINR(sharedSpend)}</p>
              <p style="font-size:10px;color:#6b7280;margin-top:4px">Counted in balance</p>
            </div>
            <div class="summary-card" style="border-color:#e5e7eb;background-color:#f9fafb">
              <p class="card-label" style="color:#6b7280">Personal (Excluded)</p>
              <p class="card-value" style="color:#374151">${formatINR(personalSpend)}</p>
              <p style="font-size:10px;color:#9ca3af;margin-top:4px">Excluded from balance</p>
            </div>
            <div class="summary-card" style="border-color:${myBalance >= 0 ? '#d1fae5' : '#fee2e2'};background-color:${myBalance >= 0 ? '#ecfdf5' : '#fff1f2'}">
              <p class="card-label" style="color:${myBalance >= 0 ? '#065f46' : '#be123c'}">Your Balance</p>
              <p class="card-value" style="color:${myBalance >= 0 ? '#059669' : '#e11d48'}">${statusText}</p>
              <p style="font-size:10px;color:#9ca3af;margin-top:4px">Based on shared bills</p>
            </div>
          </div>

          <div class="status-banner">
            <div class="status-dot"></div>
            <span><b>Balance note:</b> ${statusText} — based on shared bills only (${formatINR(sharedSpend)}). Personal expenses of ${formatINR(personalSpend)} are tracked for reference and are <b>excluded</b> from roommate settlements.</span>
          </div>

          <h4 class="summary-title" style="margin-top:24px;margin-bottom:12px">Per-Member Payment Breakdown</h4>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:12px">
            <thead>
              <tr>
                <th style="background:#1A3827;color:white;padding:10px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em">Member</th>
                <th style="background:#1A3827;color:white;padding:10px 14px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:.05em">Total Paid</th>
                <th style="background:#1A3827;color:white;padding:10px 14px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:.05em">Shared Paid</th>
                <th style="background:#1A3827;color:white;padding:10px 14px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:.05em">Personal Paid</th>
                <th style="background:#1A3827;color:white;padding:10px 14px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:.05em">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(m => {
                const mTotalPaid = dataList.filter(t => t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)).reduce((s,t)=>s+(Number(t.amount)||0),0);
                const mSharedPaid = dataList.filter(t => t.isShared && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname))).reduce((s,t)=>s+(Number(t.amount)||0),0);
                const mPersonalPaid = mTotalPaid - mSharedPaid;
                const mBal = computedStats.balances?.[m.uid] || 0;
                const balColor = mBal >= 0 ? '#059669' : '#e11d48';
                const balText = mBal > 0 ? `+${formatINR(mBal)} (owed)` : mBal < 0 ? `${formatINR(Math.abs(mBal))} (owes)` : 'Settled';
                return `<tr>
                  <td style="padding:10px 14px;border-bottom:1px solid #E3E8E3;font-weight:700">${m.nickname}</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #E3E8E3;text-align:right">${formatINR(mTotalPaid)}</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #E3E8E3;text-align:right;color:#065f46">${formatINR(mSharedPaid)}</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #E3E8E3;text-align:right;color:#6b7280">${formatINR(mPersonalPaid)}</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #E3E8E3;text-align:right;font-weight:700;color:${balColor}">${balText}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          
          <h4 class="summary-title" style="margin-bottom: 16px;">Ledger Details</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Description/Merchant</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Paid By</th>
                <th>Split</th>
              </tr>
            </thead>
            <tbody>
              ${dataList.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.time}</td>
                  <td style="font-weight: 600;">${t.title}</td>
                  <td style="font-weight: 700; color: #1A3827;">${formatINR(t.amount)}</td>
                  <td>${t.category}</td>
                  <td>${t.paidBy}</td>
                  <td>
                    <span class="badge ${t.isShared ? 'badge-shared' : 'badge-personal'}">
                      ${t.split}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Tallyin roommate expense statement. Generated securely by Tallyin.
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
        </html>
      `;
      
      // Use Blob + URL.createObjectURL to open in new tab (avoids popup blockers)
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke after a short delay to allow the tab to load
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      triggerToast('PDF statement opened in a new tab. Use browser Print (Ctrl+P) to save as PDF.');
    } catch (error) {
      console.error(error);
      triggerToast('Failed to generate PDF statement.');
    }
  };

  // Filtered transactions for the ledger
  // Ledger shows: shared expenses + personal expenses added by OTHER users.
  // Current user's own personal expenses are hidden here — they live in the Personal Expenses tab.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredTransactions = useMemo(() => {
    const currentUid = user?.id || 'anonymous';
    const activeTxList = transactions.filter(t => {
      if (t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__') return false;
      if (t.isShared) return true; // always show shared bills
      // For personal expenses: hide if the expense belongs solely to the current user
      const isMineOnly =
        t.splits &&
        Array.isArray(t.splits) &&
        t.splits.length === 1 &&
        t.splits[0]?.uid === currentUid;
      return !isMineOnly; // show only if it's someone else's personal expense
    });

    return activeTxList.filter(t => {
      const titleStr = t.title || '';
      const categoryStr = t.category || '';
      const matchesSearch = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            categoryStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesMonth = selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth));
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [transactions, searchQuery, categoryFilter, selectedMonth, user]);

  // Personal expenses memo (isShared is false, split only with self)
  const myPersonalExpenses = useMemo(() => {
    const currentUid = user?.id || 'anonymous';
    return transactions.filter(t => {
      return t.isShared === false && 
             t.splits && 
             Array.isArray(t.splits) && 
             t.splits.length === 1 && 
             t.splits[0] && 
             t.splits[0].uid === currentUid &&
             t.category !== '__FUND_INIT__' &&
             t.category !== '__FUND_SPEND__';
    });
  }, [transactions, user]);

  const myFunds = useMemo(() => {
    const currentUid = user?.id || 'anonymous';
    return transactions.filter(t => 
      t.category === '__FUND_INIT__' && 
      t.paidByUid === currentUid
    );
  }, [transactions, user]);

  const myFundSpends = useMemo(() => {
    const currentUid = user?.id || 'anonymous';
    return transactions.filter(t => 
      t.category === '__FUND_SPEND__' && 
      t.paidByUid === currentUid
    );
  }, [transactions, user]);

  const filteredPersonalExpenses = useMemo(() => {
    return myPersonalExpenses.filter(t => {
      const titleStr = t.title || '';
      const categoryStr = t.category || '';
      const matchesSearch = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            categoryStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesMonth = selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth));
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [myPersonalExpenses, searchQuery, categoryFilter, selectedMonth]);

  // Available unique months from all transactions
  const availableMonths = useMemo(() => {
    const months = new Set();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        months.add(t.date.substring(0, 7)); // "YYYY-MM"
      }
    });
    // Ensure current month is always available
    const current = new Date().toISOString().substring(0, 7);
    months.add(current);
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // LOADING STATE
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-900 border border-[#1A3827]/10 dark:border-slate-800 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#1A3827] dark:text-[#A3E635] animate-spin" />
          </div>
          <p className="text-sm font-bold text-[#1A3827]/80 dark:text-slate-200">Loading Tallyin secure credentials...</p>
        </div>
      </div>
    );
  }

  // LOGIN PAGE VIEW (Unauthenticated State)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F6] dark:bg-slate-950 p-4 font-sans relative overflow-hidden transition-colors duration-300">
        {/* Floating Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
            }}
            className="p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
          </button>
        </div>

        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100 dark:bg-emerald-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-100 dark:bg-lime-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="text-center space-y-3">
            <img 
              src={logoIcon} 
              alt="Tallyin Logo" 
              className="w-14 h-14 object-cover rounded-2xl mx-auto shadow-md"
            />
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">Tallyin</h1>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold uppercase tracking-wider">Tallyin</p>
            </div>
            
            <p className="text-sm text-[#5C6E5C] dark:text-slate-400 max-w-xs mx-auto leading-relaxed pt-2">
              Keep roommate billing transparent, synchronized, and simple. Log in to split shared apartment expenses.
            </p>
          </div>

          <div className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#EAF0EC] dark:bg-slate-900 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <p className="text-xs text-[#1A3827] dark:text-slate-200 font-bold">Secure Google Authentication</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#EAF0EC] dark:bg-slate-900 rounded-lg">
                <RefreshCw className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <p className="text-xs text-[#1A3827] dark:text-slate-200 font-bold">Real-time room syncing across users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#EAF0EC] dark:bg-slate-900 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <p className="text-xs text-[#1A3827] dark:text-slate-200 font-bold">Smart budget insights & visual receipts</p>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-[#1A3827] text-white hover:bg-[#255038] py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 border border-white/5 active:scale-98"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 488 512">
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-[11px] text-red-700 dark:text-red-400 font-bold leading-relaxed text-center break-words select-all animate-fade-in">
              {authError}
            </div>
          )}
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#1A3827] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#BEF264]/20 animate-bounce text-xs font-semibold max-w-sm">
            <Check className="w-4 h-4 text-[#A3E635] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ONBOARDING ROOM SELECTION VIEW (For joining or creating a room)
  if (user && (!userRoomId || !hasConfirmedRoom)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F6] dark:bg-slate-950 p-4 font-sans relative overflow-hidden transition-colors duration-300">
        {/* Floating Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
            }}
            className="p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
          </button>
        </div>

        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100 dark:bg-emerald-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-100 dark:bg-lime-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="text-center space-y-3">
            <img 
              src={logoIcon} 
              alt="Tallyin Logo" 
              className="w-12 h-12 object-cover rounded-xl mx-auto shadow-sm"
            />
            
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Set up your shared space</h1>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">YouthFirst Tallyin Onboarding</p>
            </div>
          </div>

          {/* Wizard step: selection */}
          {onboardingStep === 'selection' && (
            <div className="space-y-5">
              {/* Nickname input */}
              {!isNicknameFixed && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Your display name *</label>
                  <input
                    type="text"
                    value={nicknameInput === 'You' ? '' : nicknameInput}
                    onChange={(e) => {
                      setNicknameInput(e.target.value);
                      setUserNickname(e.target.value);
                      localStorage.setItem('userNickname', e.target.value);
                    }}
                    placeholder="e.g. Sampath, Alex…"
                    className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                  />
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                    This is how you'll appear to roommates. If you want to change this later, you can do so in Settings.
                  </p>
                  <button
                    onClick={() => {
                      if (!nicknameInput.trim() || nicknameInput === 'You') {
                        triggerToast('Please enter your display name first.');
                        return;
                      }
                      setIsNicknameFixed(true);
                    }}
                    className="w-full py-2.5 bg-[#1A3827] dark:bg-[#A3E635] hover:bg-[#234A34] dark:hover:bg-[#b0f23d] text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-sm active:scale-98 mt-3"
                  >
                    Continue
                  </button>
                </div>
              )}

              {isNicknameFixed && (
                <div className="space-y-5">

              {userRoomId && (
                <div className="border border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/20 dark:bg-[#A3E635]/5 rounded-2xl p-4 flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <span className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Active Room</span>
                    <p className="font-mono text-xs font-bold text-[#1A3827] dark:text-slate-100 mt-1">Code: {userRoomId}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsNicknameFixed(true);
                      setHasConfirmedRoom(true);
                    }}
                    className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-955 px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90"
                  >
                    Enter Room
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!nicknameInput.trim() || nicknameInput === 'You') {
                      triggerToast('Please enter your display name first.');
                      return;
                    }
                    setIsNicknameFixed(true);
                    setOnboardingStep('room-name');
                  }}
                  className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 hover:border-[#1A3827]/25 dark:hover:border-slate-700 hover:bg-[#F6F8F6]/20 dark:hover:bg-slate-800/10 transition-all flex flex-col items-center justify-center gap-2 text-center text-xs font-bold text-[#1A3827] dark:text-slate-200"
                >
                  <Plus className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635]" />
                  <span>Create Room</span>
                </button>
                <button
                  onClick={() => {
                    if (!nicknameInput.trim() || nicknameInput === 'You') {
                      triggerToast('Please enter your display name first.');
                      return;
                    }
                    setIsNicknameFixed(true);
                    setOnboardingStep('join-room');
                  }}
                  className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 hover:border-[#1A3827]/25 dark:hover:border-slate-700 hover:bg-[#F6F8F6]/20 dark:hover:bg-slate-800/10 transition-all flex flex-col items-center justify-center gap-2 text-center text-xs font-bold text-[#1A3827] dark:text-slate-200"
                >
                  <UserCheck className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635]" />
                  <span>Join Room</span>
                </button>
              </div>


              {isFetchingRooms ? (
                <div className="space-y-2 text-left pt-3 border-t border-[#E3E8E3]/50 dark:border-slate-800/50">
                  <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block font-sans">
                    Loading your spaces...
                  </label>
                  <div className="flex items-center justify-center p-4">
                    <Loader className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] animate-spin" />
                  </div>
                </div>
              ) : userRooms.length > 0 && (
                <div className="space-y-2 text-left pt-3 border-t border-[#E3E8E3]/50 dark:border-slate-800/50">
                  <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block font-sans">
                    Or choose one of your spaces ({userRooms.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {userRooms.map(r => {
                      const isActive = r.roomId === userRoomId;
                      return (
                        <div 
                          key={r.roomId}
                          onClick={async () => {
                            if (!nicknameInput.trim() || nicknameInput === 'You') {
                              triggerToast('Please enter your display name first.');
                              return;
                            }
                            setUserRoomId(r.roomId);
                            localStorage.setItem('userRoomId', r.roomId);
                            // Optimistically use cached name while we fetch fresh settings
                            if (r.roomName) {
                              setRoomName(r.roomName);
                              localStorage.setItem('roomName', r.roomName);
                            }
                            setHasConfirmedRoom(true);
                            triggerToast(`Entering room: ${r.roomName}...`);
                            // Always fetch fresh budget and created_by from DB
                            await fetchRoomSettings(r.roomId);
                            if (user) {
                              (async () => {
                                try {
                                  await supabase
                                    .from('users')
                                    .upsert({
                                      uid: user.id,
                                      room_id: r.roomId,
                                      updated_at: new Date().toISOString()
                                    }, { onConflict: 'uid' });
                                } catch (e) { console.error(e); }
                              })();
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                            isActive 
                              ? 'border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/20 dark:bg-[#A3E635]/5 font-bold' 
                              : 'border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6]/40 dark:hover:bg-slate-800/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">🏠</span>
                            <div className="min-w-0">
                              <p className="font-bold text-[#1A3827] dark:text-slate-100 truncate">{r.roomName}</p>
                              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-mono truncate">{r.roomId}</p>
                            </div>
                          </div>
                          {isActive ? (
                            <span className="text-[9px] bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-955 px-2 py-0.5 rounded-full font-bold">Active</span>
                          ) : (
                            <span className="text-[9px] text-[#5C6E5C] dark:text-slate-400">Enter</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* Wizard step: room-name */}
          {onboardingStep === 'room-name' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Room name</label>
                <input
                  type="text"
                  placeholder="e.g. Cozy Flat, Room 402…"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                />
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Give your shared space a name.</p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setOnboardingStep('selection')}
                  className="flex-1 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 py-2.5 rounded-xl font-bold text-xs"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    if (!roomNameInput.trim()) {
                      triggerToast('Please enter a room name.');
                      return;
                    }
                    setOnboardingStep('room-budget');
                  }}
                  className="flex-1 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Wizard step: room-budget */}
          {onboardingStep === 'room-budget' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Monthly budget cap (₹)</label>
                <input
                  type="number"
                  min="1000"
                  value={monthlyBudget}
                  onChange={(e) => {
                    setMonthlyBudget(Number(e.target.value));
                    localStorage.setItem('monthlyBudget', e.target.value);
                  }}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                />
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Set a shared spending limit for your room.</p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setOnboardingStep('room-name')}
                  className="flex-1 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 py-2.5 rounded-xl font-bold text-xs"
                >
                  Back
                </button>
                <button 
                  onClick={handleCreateRoom}
                  className="flex-1 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs"
                >
                  Create Room
                </button>
              </div>
            </div>
          )}

          {/* Wizard step: share-code */}
          {onboardingStep === 'share-code' && (
            <div className="space-y-4 text-left">
              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/15 dark:border-slate-800 rounded-2xl p-5 text-center space-y-3">
                <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Your Room Code</p>
                <p className="font-mono font-black text-2xl text-[#1A3827] dark:text-[#A3E635] tracking-widest select-all">{userRoomId}</p>
                <div className="flex justify-center mt-1">
                  <div className="bg-white p-3 rounded-2xl border border-[#E3E8E3] shadow-sm inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(userRoomId)}&color=1A3827&bgcolor=ffffff&margin=2`}
                      alt={`QR code for room ${userRoomId}`}
                      width={160}
                      height={160}
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  Roommate can <strong>scan this QR</strong> or type the code above in Tallyin → Join Room.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => { navigator.clipboard.writeText(userRoomId); triggerToast('Room code copied!'); }}
                  className="flex-1 border border-[#E3E8E3] dark:border-slate-800 text-[#1A3827] dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(userRoomId)}&color=1A3827&bgcolor=ffffff&margin=4`;
                    link.download = `tallyin-room-${userRoomId}.png`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    triggerToast('QR code downloaded!');
                  }}
                  className="flex-1 border border-[#E3E8E3] dark:border-slate-800 text-[#1A3827] dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR</span>
                </button>
                <button 
                  onClick={() => setHasConfirmedRoom(true)}
                  className="flex-1 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs text-center"
                >
                  Enter Room
                </button>
              </div>
            </div>
          )}

          {/* Wizard step: join-room */}
          {onboardingStep === 'join-room' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Room code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter room code (e.g. TL-7729-XM)"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-955 font-semibold"
                  />
                  <button
                    onClick={() => setIsQrScannerOpen(true)}
                    className="p-2.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl text-[#5C6E5C] dark:text-slate-400 transition-all shrink-0"
                    title="Scan Room QR Code"
                  >
                    <ScanLine className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setOnboardingStep('selection')}
                  className="flex-1 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 py-2.5 rounded-xl font-bold text-xs"
                >
                  Back
                </button>
                <button 
                  onClick={handleJoinRoom}
                  className="flex-1 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-[#5C6E5C] dark:text-slate-400">Signed in as {user.email}</span>
            <button 
              onClick={handleSignOut}
              className="text-rose-700 font-bold hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* QR Scanner Simulator Overlay */}
        {isQrScannerOpen && renderQrScanner()}
        {nicknamePromptAction && renderNicknamePromptModal()}

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#1A3827] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#BEF264]/20 animate-bounce text-xs font-semibold max-w-sm">
            <Check className="w-4 h-4 text-[#A3E635] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }



  // MAIN RUNNING APP
  return (
    <div className={`min-h-screen flex bg-[#F6F8F6] dark:bg-slate-950 transition-colors duration-300 ${isDarkMode ? 'dark text-slate-100' : 'text-[#1A3827]'}`}>
      
      {/* Hidden File Input for Receipt Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleReceiptUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A3827] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#BEF264]/20 animate-bounce text-xs font-semibold max-w-sm">
          <Check className="w-4 h-4 text-[#A3E635] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between fixed top-0 bottom-0 left-0 h-full z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img 
                src={logoIcon} 
                alt="Tallyin Logo" 
                className="w-10 h-10 object-cover rounded-xl shadow-sm"
              />
              <div>
                <h1 className="font-black text-[#1A3827] dark:text-slate-100 tracking-tight">Tallyin</h1>
                <p className="text-[9px] text-[#5C6E5C] dark:text-slate-400 font-bold uppercase tracking-wider">YouthFirst</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Room Switcher Dropdown */}
          {user && userRooms.length > 0 && (
            <div className="mb-4 space-y-1">
              <label className="text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block font-sans">Active Workspace</label>
              <select
                value={userRoomId || ''}
                onChange={async (e) => {
                  const selectedRoomId = e.target.value;
                  if (selectedRoomId && selectedRoomId !== userRoomId) {
                    // Optimistically set name from cache, but immediately fetch fresh settings
                    const cachedRoom = userRooms.find(r => r.roomId === selectedRoomId);
                    setUserRoomId(selectedRoomId);
                    localStorage.setItem('userRoomId', selectedRoomId);
                    if (cachedRoom?.roomName) {
                      setRoomName(cachedRoom.roomName);
                    }
                    setHasConfirmedRoom(true);
                    triggerToast(`Switching to: ${cachedRoom?.roomName || selectedRoomId}...`);

                    // Always fetch fresh budget, name, and created_by from DB
                    await fetchRoomSettings(selectedRoomId);
                    
                    if (user) {
                      (async () => {
                        try {
                          await supabase
                            .from('users')
                            .upsert({
                              uid: user.id,
                              room_id: selectedRoomId,
                              updated_at: new Date().toISOString()
                            }, { onConflict: 'uid' });
                        } catch (e) { console.error(e); }
                      })();
                    }
                  }
                }}
                className="w-full bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-[#1A3827] dark:text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer hover:border-[#1A3827]/25 dark:hover:border-slate-700 transition-all font-sans"
              >
                {userRooms.map(r => (
                  <option key={r.roomId} value={r.roomId}>
                    🏠 {r.roomName} ({r.roomId})
                  </option>
                ))}
              </select>
              {/* Quick room action buttons */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => {
                    setHasConfirmedRoom(false);
                    setOnboardingStep('room-name');
                  }}
                  className="flex-1 py-1.5 rounded-lg border border-dashed border-[#1A3827]/30 dark:border-slate-700 text-[9px] font-bold text-[#1A3827] dark:text-[#A3E635] hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all text-center"
                >
                  + New Room
                </button>
                <button
                  onClick={() => {
                    setHasConfirmedRoom(false);
                    setOnboardingStep('join-room');
                  }}
                  className="flex-1 py-1.5 rounded-lg border border-dashed border-[#1A3827]/30 dark:border-slate-700 text-[9px] font-bold text-[#1A3827] dark:text-[#A3E635] hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all text-center"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button 
              onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'home' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('ledger'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'ledger' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Ledger</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full">
                {computedStats.totalCount}
              </span>
            </button>

            <button 
              onClick={() => { setCurrentView('personal-expenses'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-xs sm:text-[13px] ${
                currentView === 'personal-expenses' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span className="whitespace-nowrap">Personal Expenses</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full">
                {myPersonalExpenses.length}
              </span>
            </button>

            <button 
              onClick={() => { setCurrentView('fund-tracker'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-xs sm:text-[13px] ${
                currentView === 'fund-tracker' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4" />
                <span className="whitespace-nowrap">Fund Tracker</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full">
                {myFunds.length}
              </span>
            </button>

            <button 
              onClick={() => { setCurrentView('insights'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'insights' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>Insights</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('receipts'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'receipts' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Receipts</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'settings' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Room Members Panel */}
        <div className="p-4 border-t border-[#E3E8E3] dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Room Members</p>
            <button
              onClick={() => setIsManageRoomOpen(true)}
              className="text-[9px] font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {members.length === 0 ? (
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 italic px-1">No members yet. Invite roommates!</p>
            ) : (
              members.map(m => {
                const isSelf = auth.currentUser && m.uid === auth.currentUser.uid;
                return (
                  <div key={m.uid} className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-800/40">
                    {m.photoURL ? (
                      <img 
                        src={m.photoURL} 
                        alt={m.nickname} 
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E3E8E3] dark:border-slate-800"
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 ${isSelf ? 'bg-[#1A3827]' : 'bg-pink-400'}`}>
                        {m.nickname ? m.nickname.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#1A3827] dark:text-slate-100 truncate">{m.nickname}{isSelf ? ' (You)' : ''}</p>
                    </div>
                    {/* Show 'Host' badge next to the actual host (creator), not just the current user */}
                    {m.uid === roomCreatedBy && <span className="text-[8px] font-bold text-[#1A3827] dark:text-[#A3E635] bg-[#EAF0EC] dark:bg-slate-700 px-1.5 py-0.5 rounded-full">Host</span>}
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#1A3827]/30 dark:border-slate-700 rounded-xl text-[10px] font-bold text-[#1A3827] dark:text-[#A3E635] hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all"
          >
            <UserCheck className="w-3 h-3" />
            <span>Invite Roommate</span>
          </button>
        </div>
      </aside>

      {/* Main Content Page Container */}
      <div className="flex-1 flex flex-col pl-0 md:pl-64 min-h-screen min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-8 fixed top-0 right-0 left-0 md:left-64 z-20 transition-colors duration-300">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl mr-1.5 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <img 
                src={logoIcon} 
                alt="Tallyin Logo" 
                className="w-8 h-8 object-cover rounded-lg hidden sm:block shadow-sm"
              />
              <div>
                <h2 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 leading-tight">{roomName}</h2>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDbSynced ? 'bg-[#A3E635]' : 'bg-amber-500 animate-pulse'}`}></span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">
                    ROOM • {userRoomId} {isDbSynced ? '(Live Sync)' : '(Offline Cache)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Right) */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button 
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
              }}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={() => setIsDiamondModalOpen(true)}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-amber-500 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Diamond Membership Status"
            >
              <div className="w-4 h-4 border border-[#5C6E5C] dark:border-slate-700 hover:border-amber-500 rotate-45 flex items-center justify-center relative animate-pulse">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute"></span>
              </div>
            </button>

            {/* Profile widget */}
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 border-l border-[#E3E8E3] dark:border-slate-800 pl-2 sm:pl-4 cursor-pointer select-none hover:opacity-80 py-1"
            >
              {auth.currentUser && auth.currentUser.photoURL ? (
                <img 
                  src={auth.currentUser.photoURL} 
                  alt={userNickname} 
                  className="w-8 h-8 rounded-full border border-[#E3E8E3] dark:border-slate-800 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {userNickname.charAt(0)}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-100 leading-none truncate max-w-[120px]">{userNickname}</p>
                <span className="text-[9px] text-[#5C6E5C] dark:text-slate-400 font-semibold">Active User</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5C6E5C]" />
            </div>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-30 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                <button 
                  onClick={() => { setCurrentView('settings'); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => { handleSignOut(); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 border-t border-[#F6F8F6] dark:border-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-grow pt-20 px-4 sm:px-8 pb-24 overflow-y-auto">
          <ErrorBoundary>
            {currentView === 'home' && <ViewRenderer render={renderHome} />}
            {currentView === 'ledger' && <ViewRenderer render={renderLedger} />}
            {currentView === 'personal-expenses' && <ViewRenderer render={renderPersonalExpenses} />}
            {currentView === 'fund-tracker' && <ViewRenderer render={renderFundTracker} />}
            {currentView === 'insights' && <ViewRenderer render={renderInsights} />}
            {currentView === 'receipts' && <ViewRenderer render={renderReceipts} />}
            {currentView === 'settings' && <ViewRenderer render={renderSettings} />}
          </ErrorBoundary>
        </main>


        {/* Add Expense Modal Overlay */}
        {isAddExpenseOpen && renderAddExpenseModal()}
        
        {/* Custom Invite Roommate Share Modal */}
        {isInviteModalOpen && renderInviteModal()}

        {/* Settle Up Modal */}
        {isSettleModalOpen && renderSettleModal()}

        {/* Manage Room Modal */}
        {isManageRoomOpen && renderManageRoomModal()}
        {nicknamePromptAction && renderNicknamePromptModal()}

        {/* Tallyin Diamond VIP Analytics Modal */}
        {isDiamondModalOpen && renderDiamondModal()}

        {/* Receipt Zoom Lightbox Modal */}
        {activeReceiptZoom && renderReceiptZoomModal()}

        {/* Fund Tracker Modals */}
        {isAddFundModalOpen && renderAddFundModal()}
        {isAddFundExpenseModalOpen && renderAddFundExpenseModal()}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-30" style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}>
        <button 
          onClick={() => openAddExpenseModal()}
          className="flex items-center gap-2 bg-[#A3E635] text-[#1A3827] font-bold px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-lg shadow-lime-900/10 hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 border border-[#84CC16]"
          id="fab-quick-add"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span className="text-xs sm:text-sm">Quick add</span>
        </button>
      </div>
    </div>
  );

  // ==========================================
  // PAGE 1: HOME (DASHBOARD)
  // ==========================================
  function renderHome() {
    const dataList = transactions;
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
    const myBalance = computedStats.currentUserBalance;

    const activeMonth = selectedMonth === 'All' ? new Date().toISOString().substring(0, 7) : selectedMonth;
    const monthlyPersonalTotal = myPersonalExpenses
      .filter(t => t.date && t.date.startsWith(activeMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const personalPercentage = Math.min((monthlyPersonalTotal / personalCap) * 100, 100);

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Good afternoon, {userNickname.split(' ')[0]}.</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Everything looks calm in your room today.</p>
          </div>
          <button 
            onClick={() => openAddExpenseModal()}
            className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs hover:bg-[#255038] dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add expense</span>
          </button>
        </div>

        {/* Main Balance Card */}
        <div className="bg-[#1A3827] dark:bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-white/5 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8 transition-all duration-300">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#A3E635] opacity-5 blur-3xl rounded-full -mr-20 -mt-20"></div>
          
          <div className="space-y-4 max-w-md z-10">
            <div>
              <p className="text-[10px] tracking-widest font-bold uppercase text-[#A3E635]/80">CURRENT BALANCE</p>
              <h3 className="text-xs text-white/70 mt-0.5">
                {myBalance > 0 ? 'You are owed' : myBalance < 0 ? 'You owe' : 'All settled up'}
              </h3>
              <h2 className="text-4xl sm:text-5xl font-black text-[#A3E635] tracking-tight mt-1">
                {formatINR(Math.abs(myBalance))}
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-[#EAF0EC]/80 dark:text-slate-300 font-medium">
              {myBalance > 0 
                ? "You have paid more than your share of the room expenses."
                : myBalance < 0 
                  ? "You owe money to your roommates for shared expenses."
                  : "You are completely settled up with everyone!"}
            </p>

            <button 
              onClick={handleSettleUp}
              className="inline-flex items-center gap-2 bg-[#A3E635] text-[#1A3827] font-bold px-4 py-2 rounded-xl text-[10px] sm:text-xs hover:bg-[#BEF264] transition-all duration-150 shadow-sm"
            >
              <span>Settle up</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Right side roommate balance sheet */}
          <div className="border-t md:border-t-0 md:border-l border-white/10 dark:border-slate-800 pt-5 md:pt-0 md:pl-10 space-y-4 flex-1 max-w-sm z-10 text-left">
            <p className="text-[10px] font-bold text-white/50 dark:text-slate-400 tracking-wider uppercase">Roommate Balance Sheet</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {members.length > 1 ? (
                members.map(m => {
                  if (m.uid === currentUid) return null;
                  const bal = computedStats.balances[m.uid] || 0;
                  return (
                    <div key={m.uid} className="flex justify-between items-center text-xs font-semibold py-1 border-b border-white/5 last:border-b-0 gap-2">
                      <span className="text-white/80 truncate max-w-[120px]">{m.nickname}</span>
                      <span className={`shrink-0 ${bal > 0 ? 'text-[#A3E635] font-bold' : bal < 0 ? 'text-rose-400 font-bold' : 'text-white/40'}`}>
                        {bal > 0 ? `is owed ${formatINR(bal)}` : bal < 0 ? `owes ${formatINR(Math.abs(bal))}` : 'settled up'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-white/40 italic">Invite roommates to view balance sheet.</p>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Recent activity</h3>
                <button 
                  onClick={() => setCurrentView('ledger')} 
                  className="text-xs font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline flex items-center gap-1 group"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                {dataList.length === 0 ? (
                  <div className="text-center py-8 text-[#5C6E5C] dark:text-slate-400">
                    <p className="text-xs sm:text-sm font-semibold">No recent activity.</p>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Expenses you log will show up here.</p>
                  </div>
                ) : (
                  dataList.slice(0, 4).map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-1 border-b border-[#F6F8F6] dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">
                          {t.title}
                          {t.isEdited && <span className="ml-1.5 text-[9px] text-rose-500 dark:text-rose-400 italic font-bold tracking-wide">(Edited)</span>}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5 truncate">
                          {getTransactionSubtitle(t)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right ml-2 shrink-0">
                      <p className={`font-bold text-xs sm:text-sm ${
                        (t.paidByUid && t.paidByUid === currentUid) || (!t.paidByUid && t.paidBy === userNickname)
                          ? 'text-[#1A3827] dark:text-[#A3E635]'
                          : 'text-gray-500 dark:text-slate-400'
                      }`}>
                        {(t.paidByUid && t.paidByUid === currentUid) || (!t.paidByUid && t.paidBy === userNickname) ? '-' : '+'}{formatINR(t.amount)}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">{t.date}</p>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F6F8F6] dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated 2 mins ago</span>
              </span>
              <span className="text-[#1A3827] dark:text-[#A3E635] font-semibold">Synced live via Firestore</span>
            </div>
          </div>

          {/* Right Column (Stacked Cards) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Top: Monthly Budget (Dynamic) */}
            {(() => {
              const budgetPct = Math.min(100, Math.round((computedStats.totalRoomSpend / monthlyBudget) * 100)) || 0;
              const remaining = Math.max(0, monthlyBudget - computedStats.totalRoomSpend);
              const today = new Date();
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              const daysLeft = daysInMonth - today.getDate();
              const dailyLimit = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;
              const monthName = today.toLocaleString('default', { month: 'long' });
              const isOver = budgetPct >= 100;
              return (
                <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">{monthName} budget</h3>
                    <span className="text-[10px] sm:text-xs font-bold text-[#5C6E5C] dark:text-slate-400 bg-[#F6F8F6] dark:bg-slate-950 px-2.5 py-1 rounded-lg">{daysLeft} days left</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(computedStats.totalRoomSpend)}</span>
                      <span className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 font-semibold">of {formatINR(monthlyBudget)}</span>
                    </div>
                    <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-[#1A3827] dark:bg-[#A3E635]'}`}
                        style={{ width: `${budgetPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] font-semibold text-[#5C6E5C] dark:text-slate-400">{budgetPct}% used</span>
                      <span className="text-[10px] font-semibold text-[#5C6E5C] dark:text-slate-400">{formatINR(remaining)} left</span>
                    </div>
                  </div>

                  <div className={`border p-3.5 rounded-2xl flex items-start gap-3 ${isOver ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' : 'bg-[#EAF0EC] dark:bg-slate-950 border-[#1A3827]/10 dark:border-slate-800'}`}>
                    <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${isOver ? 'text-rose-600' : 'text-[#1A3827] dark:text-[#A3E635]'}`} />
                    <div>
                      <p className={`text-xs font-bold ${isOver ? 'text-rose-700 dark:text-rose-400' : 'text-[#1A3827] dark:text-slate-200'}`}>
                        {isOver ? 'Over budget!' : "You're on track"}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400 mt-0.5">
                        {isOver ? `Exceeded by ${formatINR(computedStats.totalRoomSpend - monthlyBudget)}.` : `Keep daily spend under ${formatINR(dailyLimit)} to stay on budget.`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Personal Expense Meter */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm space-y-3 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">
                    Personal Expense Meter — {selectedMonth === 'All' ? 'All Time' : (() => {
                      const [year, month] = activeMonth.split('-');
                      const dateObj = new Date(Number(year), Number(month) - 1, 1);
                      return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                    })()}
                  </p>
                  <p className="text-lg sm:text-xl font-extrabold text-[#1A3827] dark:text-slate-100 mt-1">
                    {formatINR(monthlyPersonalTotal)} / {formatINR(personalCap)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    personalPercentage >= 90 ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-rose-500' : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]'
                  }`}>
                    {personalPercentage.toFixed(0)}% Used
                  </span>
                  {/* Edit limit button */}
                  <button
                    onClick={() => { setPersonalCapInput(String(personalCap)); setIsEditingPersonalCap(true); }}
                    className="p-1.5 rounded-lg hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all"
                    title="Edit personal spending limit"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#5C6E5C] dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Inline limit editor */}
              {isEditingPersonalCap && (
                <div className="flex items-center gap-2 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">Set limit (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={personalCapInput}
                    onChange={e => setPersonalCapInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = Number(personalCapInput);
                        if (val > 0) { setPersonalCap(val); localStorage.setItem('personalCap', val); }
                        setIsEditingPersonalCap(false);
                      }
                      if (e.key === 'Escape') setIsEditingPersonalCap(false);
                    }}
                    className="flex-1 bg-transparent text-sm font-bold text-[#1A3827] dark:text-slate-100 outline-none min-w-0"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      const val = Number(personalCapInput);
                      if (val > 0) { setPersonalCap(val); localStorage.setItem('personalCap', val); }
                      setIsEditingPersonalCap(false);
                    }}
                    className="text-[10px] font-black bg-[#1A3827] text-white px-3 py-1 rounded-lg hover:bg-[#255038] transition-all"
                  >Save</button>
                  <button
                    onClick={() => setIsEditingPersonalCap(false)}
                    className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 px-2 py-1 rounded-lg hover:bg-[#E3E8E3] dark:hover:bg-slate-800 transition-all"
                  >Cancel</button>
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    personalPercentage >= 90 ? 'bg-red-500' : 'bg-[#1A3827] dark:bg-[#A3E635]'
                  }`}
                  style={{ width: `${personalPercentage}%` }}
                />
              </div>
              <p className="text-[10px] font-semibold text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                {personalPercentage >= 100 
                  ? `You have exceeded your personal limit by ${formatINR(monthlyPersonalTotal - personalCap)}.`
                  : `You have ${formatINR(personalCap - monthlyPersonalTotal)} remaining before reaching your ${formatINR(personalCap)} limit.`}
              </p>
            </div>

            {/* Bottom: Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-xs sm:text-sm tracking-widest uppercase">Quick actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => openAddExpenseModal()}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <Plus className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">Add bill</span>
                </button>
                
                <button 
                  onClick={handleTriggerUpload}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <Upload className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">Scan receipt</span>
                </button>
                
                <button 
                  onClick={handleInviteTrigger}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <UserCheck className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">Invite roommate</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('insights')}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <TrendingUp className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">View insights</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 2: THE LEDGER
  // ==========================================
  function renderLedger() {
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport', 'People'];
    
    const totalFilteredSpend = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFilteredShared = filteredTransactions.filter(t => t.isShared).reduce((sum, t) => sum + t.amount, 0);
    const totalFilteredPersonal = filteredTransactions.filter(t => !t.isShared).reduce((sum, t) => sum + t.amount, 0);

    const activeMonthLabel = selectedMonth === 'All' 
      ? 'TOTAL' 
      : (() => {
          const [year, month] = selectedMonth.split('-');
          const dateObj = new Date(Number(year), Number(month) - 1, 1);
          return dateObj.toLocaleString('default', { month: 'long' }).toUpperCase();
        })();

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">The ledger</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Every expense, clearly accounted for.</p>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Export Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="w-full flex items-center justify-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {isExportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExportDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-40 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                    <button 
                      onClick={() => { exportToCSV(filteredTransactions); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Export to CSV</span>
                    </button>
                    <button 
                      onClick={() => { exportToExcel(filteredTransactions); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Export to Excel</span>
                    </button>
                    <button 
                      onClick={() => { exportToPDF(filteredTransactions); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => openAddExpenseModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add expense</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-3 justify-between transition-colors duration-300">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#5C6E5C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search merchant, title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-955"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:gap-3 sm:w-auto">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
                ))}
              </select>

              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="All">All months</option>
                {availableMonths.map((m) => {
                  const [year, month] = m.split('-');
                  const dateObj = new Date(Number(year), Number(month) - 1, 1);
                  const monthName = dateObj.toLocaleString('default', { month: 'long' });
                  return (
                    <option key={m} value={m}>
                      📅 {monthName} {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setSelectedMonth(new Date().toISOString().substring(0, 7));
                triggerToast('Search filter reset.');
              }}
              className="w-full sm:w-auto bg-[#1A3827] dark:bg-slate-800 text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all text-center"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">{activeMonthLabel} SPEND</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(totalFilteredSpend)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">SHARED</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(totalFilteredShared)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">PERSONAL</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(totalFilteredPersonal)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">TRANSACTIONS</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{filteredTransactions.length}</p>
          </div>
        </div>

        {/* Transaction list panel */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center bg-[#F6F8F6]/30 dark:bg-slate-950/20">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
              {selectedMonth === 'All' ? 'All Transactions' : (() => {
                const [year, month] = selectedMonth.split('-');
                const dateObj = new Date(Number(year), Number(month) - 1, 1);
                return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
              })()}
            </h3>
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              {filteredTransactions.length === transactions.length 
                ? `${filteredTransactions.length} transactions` 
                : `Filtered ${filteredTransactions.length} of ${transactions.length}`}
            </span>
          </div>

          <div className="divide-y divide-[#F6F8F6] dark:divide-slate-800">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No expenses logged yet in this room.</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-505 mt-1">Click "Add Expense" at the top to log your first roommate bill.</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No transactions match your search filter.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setSelectedMonth('All');
                  }} 
                  className="text-xs font-bold text-[#1A3827] dark:text-[#A3E635] underline mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const isCreator = !t.createdBy || t.createdBy === 'anonymous' || t.createdBy === auth.currentUser?.uid;
                return (
                  <div key={t.id} className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#F6F8F6]/30 dark:hover:bg-slate-800/10 transition-all duration-100 gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center border border-[#E3E8E3]/20 shrink-0">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">
                          {t.title}
                          {t.isEdited && <span className="ml-1.5 text-[9px] text-rose-500 dark:text-rose-400 italic font-bold tracking-wide">(Edited)</span>}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shrink-0">
                            {t.category}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold truncate">
                            {getTransactionSubtitle(t)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t border-dashed border-[#F6F8F6] dark:border-slate-800 sm:border-t-0 pt-2.5 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className={`font-black text-xs sm:text-sm ${t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? 'text-red-700 dark:text-rose-500' : 'text-[#1A3827] dark:text-[#A3E635]'}`}>
                          {t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? '-' : '+'}{formatINR(t.amount)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:justify-end text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                          <Calendar className="w-3 h-3 hidden sm:block" />
                          <span>{t.date}</span>
                        </div>
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1 border-l border-slate-150 dark:border-slate-800 pl-3">
                          <button 
                            onClick={() => handleEditTransaction(t)}
                            className="p-1 text-slate-500 hover:text-[#1A3827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(t)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    );
  }

  function openAddPersonalExpense() {
    setEditingTransaction(null);
    setIsAddExpenseOpen(true);
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const newSplits = {};
    members.forEach(m => {
      newSplits[m.uid] = m.uid === currentUid;
    });
    setSelectedSplitMembers(newSplits);
  }

  function renderPersonalExpenses() {
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport', 'People'];
    const activeMonth = selectedMonth === 'All' ? new Date().toISOString().substring(0, 7) : selectedMonth;
    const monthlyPersonalTotal = myPersonalExpenses
      .filter(t => t.date && t.date.startsWith(activeMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const personalPercentage = Math.min((monthlyPersonalTotal / personalCap) * 100, 100);

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Personal expenses</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Your private ledger, separate from room bills.</p>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Export Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="w-full flex items-center justify-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {isExportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExportDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-40 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                    <button 
                      onClick={() => { exportToCSV(filteredPersonalExpenses); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Export to CSV</span>
                    </button>
                    <button 
                      onClick={() => { exportToExcel(filteredPersonalExpenses); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Export to Excel</span>
                    </button>
                    <button 
                      onClick={() => { exportToPDF(filteredPersonalExpenses); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={openAddPersonalExpense}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add personal expense</span>
            </button>
          </div>
        </div>

        {/* Expense Meter */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm space-y-3 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">
                Expense Meter — {selectedMonth === 'All' ? 'All Time' : (() => {
                  const [year, month] = activeMonth.split('-');
                  const dateObj = new Date(Number(year), Number(month) - 1, 1);
                  return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                })()}
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#1A3827] dark:text-slate-100 mt-1">
                {formatINR(monthlyPersonalTotal)} / {formatINR(personalCap)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                personalPercentage >= 90 ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-rose-500' : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]'
              }`}>
                {personalPercentage.toFixed(0)}% Used
              </span>
              {/* Edit limit button */}
              <button
                onClick={() => { setPersonalCapInput(String(personalCap)); setIsEditingPersonalCap(true); }}
                className="p-1.5 rounded-lg hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all"
                title="Edit personal spending limit"
              >
                <Pencil className="w-3.5 h-3.5 text-[#5C6E5C] dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Inline limit editor */}
          {isEditingPersonalCap && (
            <div className="flex items-center gap-2 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">Set limit (₹)</span>
              <input
                type="number"
                min="0"
                value={personalCapInput}
                onChange={e => setPersonalCapInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = Number(personalCapInput);
                    if (val > 0) { setPersonalCap(val); localStorage.setItem('personalCap', val); }
                    setIsEditingPersonalCap(false);
                  }
                  if (e.key === 'Escape') setIsEditingPersonalCap(false);
                }}
                className="flex-1 bg-transparent text-sm font-bold text-[#1A3827] dark:text-slate-100 outline-none min-w-0"
                autoFocus
              />
              <button
                onClick={() => {
                  const val = Number(personalCapInput);
                  if (val > 0) { setPersonalCap(val); localStorage.setItem('personalCap', val); }
                  setIsEditingPersonalCap(false);
                }}
                className="text-[10px] font-black bg-[#1A3827] text-white px-3 py-1 rounded-lg hover:bg-[#255038] transition-all"
              >Save</button>
              <button
                onClick={() => setIsEditingPersonalCap(false)}
                className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 px-2 py-1 rounded-lg hover:bg-[#E3E8E3] dark:hover:bg-slate-800 transition-all"
              >Cancel</button>
            </div>
          )}
          
          <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-[#E3E8E3]/50 dark:border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                personalPercentage >= 90 ? 'bg-red-600' : 'bg-[#1A3827] dark:bg-[#A3E635]'
              }`}
              style={{ width: `${personalPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">
            {personalPercentage >= 100 
              ? "⚠️ You have reached your monthly personal spending limit!" 
              : `You have ${formatINR(personalCap - monthlyPersonalTotal)} remaining before reaching your ${formatINR(personalCap)} limit.`}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-3 justify-between transition-colors duration-300">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#5C6E5C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search personal expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-955"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:gap-3 sm:w-auto">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="All">All months</option>
                {availableMonths.map((m) => {
                  const [year, month] = m.split('-');
                  const dateObj = new Date(Number(year), Number(month) - 1, 1);
                  const monthName = dateObj.toLocaleString('default', { month: 'long' });
                  return (
                    <option key={m} value={m}>
                      📅 {monthName} {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setSelectedMonth(new Date().toISOString().substring(0, 7));
                triggerToast('Search filter reset.');
              }}
              className="w-full sm:w-auto bg-[#1A3827] dark:bg-slate-800 text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all text-center"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Transaction list panel */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center bg-[#F6F8F6]/30 dark:bg-slate-950/20">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
              {selectedMonth === 'All' ? 'All Personal Expenses' : (() => {
                const [year, month] = activeMonth.split('-');
                const dateObj = new Date(Number(year), Number(month) - 1, 1);
                return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
              })()}
            </h3>
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              {filteredPersonalExpenses.length === myPersonalExpenses.length 
                ? `${filteredPersonalExpenses.length} transactions` 
                : `Filtered ${filteredPersonalExpenses.length} of ${myPersonalExpenses.length}`}
            </span>
          </div>

          <div className="divide-y divide-[#F6F8F6] dark:divide-slate-800">
            {myPersonalExpenses.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No personal expenses logged yet.</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-505 mt-1">Add a bill split with only yourself to track it here.</p>
              </div>
            ) : filteredPersonalExpenses.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No personal transactions match your filters.</p>
              </div>
            ) : (
              filteredPersonalExpenses.map((t) => {
                const isCreator = !t.createdBy || t.createdBy === 'anonymous' || t.createdBy === auth.currentUser?.uid;
                return (
                  <div key={t.id} className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#F6F8F6]/30 dark:hover:bg-slate-800/10 transition-all duration-100 gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center border border-[#E3E8E3]/20 shrink-0">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">
                          {t.title}
                          {t.isEdited && <span className="ml-1.5 text-[9px] text-rose-500 dark:text-rose-400 italic font-bold tracking-wide">(Edited)</span>}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shrink-0">
                            {t.category}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold truncate">
                            Paid by {t.paidByUid === auth.currentUser?.uid ? 'You' : t.paidBy}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t border-dashed border-[#F6F8F6] dark:border-slate-800 sm:border-t-0 pt-2.5 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="font-black text-xs sm:text-sm text-red-700 dark:text-rose-500">
                          -{formatINR(t.amount)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:justify-end text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                          <Calendar className="w-3 h-3 hidden sm:block" />
                          <span>{t.date}</span>
                        </div>
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1 border-l border-slate-150 dark:border-slate-800 pl-3">
                          <button 
                            onClick={() => handleEditTransaction(t)}
                            className="p-1 text-slate-500 hover:text-[#1A3827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(t)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 3: ADD EXPENSE MODAL (OVERLAY)
  // ==========================================
  function renderAddExpenseModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 relative max-h-[90vh] flex flex-col transition-colors duration-300">
          
          <div className="px-6 py-4 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center bg-[#F6F8F6]/30 dark:bg-slate-950/20 shrink-0">
            <div>
              <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">
                {editingTransaction ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}
              </p>
              <h2 className="font-extrabold text-lg sm:text-xl text-[#1A3827] dark:text-slate-100 mt-0.5">
                {editingTransaction ? 'Edit expense' : 'Add an expense'}
              </h2>
            </div>
            <button 
              onClick={() => setIsAddExpenseOpen(false)}
              className="p-1.5 rounded-full text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddExpense} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">What was it for?</label>
              <input 
                type="text"
                placeholder="e.g. Weekly groceries"
                required
                value={formFor}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormFor(val);
                  const detected = smartDetectCategory(val);
                  setSuggestedCategory(detected);
                  if (detected) setFormCategory(detected);
                }}
                className="w-full px-4 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
              />
              {suggestedCategory && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">✦ Smart pick:</span>
                  <span className="text-[10px] font-black bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] px-2 py-0.5 rounded-full border border-[#1A3827]/10 dark:border-slate-700">
                    {suggestedCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSuggestedCategory(null)}
                    className="text-[9px] text-[#5C6E5C] dark:text-slate-500 hover:text-rose-500 transition-colors"
                  >✕ dismiss</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 font-semibold">₹</span>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Category</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] cursor-pointer"
                >
                  <option value="Food">🍽️ Food & Dining</option>
                  <option value="Groceries">🛒 Groceries</option>
                  <option value="Utilities">💡 Utilities</option>
                  <option value="Rent">🏠 Rent</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Transport">🚌 Transport</option>
                  <option value="Fuel">⛽ Fuel</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Medical">🏥 Medical</option>
                  <option value="People">👥 People (Family & Friends)</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Expense date</label>
              <input 
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
              />
            </div>

            {/* Attach Receipt Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Attach Receipt (Optional)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFormReceiptChange}
                  className="hidden"
                  id="form-receipt-upload"
                />
                <label 
                  htmlFor="form-receipt-upload"
                  className="flex items-center justify-center gap-2 bg-[#F6F8F6] dark:bg-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-700 text-[#1A3827] dark:text-slate-200 px-4 py-2 rounded-xl font-bold border border-[#E3E8E3] dark:border-slate-700 transition-all text-xs cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1A3827] dark:text-slate-200" />
                  <span>{formReceiptImage ? 'Change Image' : 'Choose Image'}</span>
                </label>
                {formReceiptImage && (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-xl text-[10px] text-emerald-800 dark:text-[#A3E635] font-bold">
                    <span className="truncate max-w-[120px]">✓ Attached</span>
                    <button
                      type="button"
                      onClick={() => setFormReceiptImage(null)}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                    >Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* Paid By */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Paid by</label>
              <select
                value={formPaidBy}
                onChange={(e) => setFormPaidBy(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] cursor-pointer"
              >
                {members.length > 0 ? (
                  members.map(m => (
                    <option key={m.uid} value={m.uid}>
                      {m.uid === (auth.currentUser?.uid) ? `${m.nickname} (You)` : m.nickname}
                    </option>
                  ))
                ) : (
                  <option value="">{userNickname} (You)</option>
                )}
              </select>
            </div>

            {/* Split Type Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Split type</label>
              <div className="bg-[#F6F8F6] dark:bg-slate-950 p-1 rounded-xl flex gap-1 border border-[#E3E8E3]/50 dark:border-slate-800">
                {['equal', 'percentage', 'amount'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-150 capitalize ${
                      splitType === type
                        ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 shadow-sm'
                        : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827]'
                    }`}
                  >
                    {type === 'equal' ? 'Equally' : type === 'percentage' ? 'By %' : 'By ₹'}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Members & Values */}
            {members.length > 0 && (
              <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 bg-[#F6F8F6]/30 dark:bg-slate-900/20 space-y-2">
                <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">Split breakdown</p>
                {members.map(m => {
                  const isChecked = selectedSplitMembers[m.uid] !== false;
                  const amountNum = parseFloat(formAmount) || 0;
                  const checkedCount = members.filter(mm => selectedSplitMembers[mm.uid] !== false).length || 1;
                  const equalShare = amountNum / checkedCount;
                  return (
                    <div key={m.uid} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setSelectedSplitMembers(prev => ({ ...prev, [m.uid]: e.target.checked }))}
                        className="w-3.5 h-3.5 accent-[#1A3827] shrink-0"
                      />
                      {m.photoURL ? (
                        <img 
                          src={m.photoURL} 
                          alt={m.nickname} 
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#E3E8E3] dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#1A3827] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                          {m.nickname?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[11px] font-semibold text-[#1A3827] dark:text-slate-200 flex-1 truncate">
                        {m.uid === auth.currentUser?.uid ? `${m.nickname} (You)` : m.nickname}
                      </span>
                      {splitType === 'equal' && isChecked && (
                        <span className="text-[11px] font-bold text-[#1A3827] dark:text-[#A3E635]">{formatINR(equalShare)}</span>
                      )}
                      {splitType === 'percentage' && isChecked && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            step="any"
                            value={customSplitValues[m.uid] || ''}
                            onChange={e => setCustomSplitValues(prev => ({...prev, [m.uid]: e.target.value}))}
                            placeholder="%"
                            className="w-14 px-2 py-1 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-[10px] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900 focus:outline-none"
                          />
                          <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400">%</span>
                        </div>
                      )}
                      {splitType === 'amount' && isChecked && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#5C6E5C]">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customSplitValues[m.uid] || ''}
                            onChange={e => setCustomSplitValues(prev => ({...prev, [m.uid]: e.target.value}))}
                            placeholder="0"
                            className="w-16 px-2 py-1 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-[10px] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input 
                type="checkbox"
                checked={formRepeat}
                onChange={(e) => setFormRepeat(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A3827] focus:ring-[#1A3827] accent-[#1A3827] border-[#E3E8E3]"
              />
              <span className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">Repeat this expense monthly</span>
            </label>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#E3E8E3] dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 font-bold text-xs hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs hover:bg-[#255038] dark:hover:bg-slate-200 transition-all shadow-sm"
              >
                {editingTransaction ? 'Save changes' : 'Add expense'}
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SETTLE UP MODAL
  // ==========================================
  function renderSettleModal() {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center shrink-0">
            <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">Settle Up</h3>
            <button onClick={() => setIsSettleModalOpen(false)} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleRecordPayment} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Who paid?</label>
              <select
                value={settlePayer}
                onChange={e => {
                  const val = e.target.value;
                  setSettlePayer(val);
                  if (settleReceiver === val) {
                    const firstOther = members.find(m => m.uid !== val);
                    setSettleReceiver(firstOther ? firstOther.uid : '');
                  }
                }}
                className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none"
              >
                {members.map(m => <option key={m.uid} value={m.uid}>{m.nickname}{m.uid === currentUid ? ' (You)' : ''}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Paid to (receiving money)</label>
              <select
                value={settleReceiver}
                onChange={e => setSettleReceiver(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none"
              >
                {members.filter(m => m.uid !== settlePayer).map(m => <option key={m.uid} value={m.uid}>{m.nickname}{m.uid === currentUid ? ' (You)' : ''}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">₹</span>
                <input
                  type="number" min="0.01" step="0.01" required
                  placeholder="0.00"
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsSettleModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs hover:bg-[#255038] shadow-sm">Record Payment</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // MANAGE ROOM MODAL
  // ==========================================
  function renderManageRoomModal() {
    const currentUid = user?.id || 'anonymous';
    const isHost = roomCreatedBy && user && roomCreatedBy === user.id;
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300">
          <div className="px-6 py-4 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">Manage Room</h3>
                {isHost && <span className="text-[9px] font-black text-white bg-[#1A3827] dark:bg-[#A3E635] dark:text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wide">Host</span>}
              </div>
              <p className="text-[10px] font-mono text-[#5C6E5C] dark:text-slate-400 mt-0.5">{userRoomId}</p>
            </div>
            <button onClick={() => setIsManageRoomOpen(false)} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Room Code & Invite */}
            <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black text-[#1A3827] dark:text-[#A3E635] uppercase tracking-widest">Room Code</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-[#1A3827] dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-[#E3E8E3] dark:border-slate-800 flex-1 text-center tracking-widest">{userRoomId}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(userRoomId); triggerToast('Room code copied!'); }}
                  className="p-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-lg hover:opacity-90"
                ><Copy className="w-4 h-4" /></button>
              </div>
              <button
                onClick={() => { setIsManageRoomOpen(false); setIsInviteModalOpen(true); }}
                className="w-full py-2 border border-dashed border-[#1A3827]/40 dark:border-slate-700 rounded-xl text-xs font-bold text-[#1A3827] dark:text-[#A3E635] hover:bg-[#EAF0EC]/80 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Share invite link
              </button>
            </div>

            {/* Members List */}
            <div>
              <p className="text-xs font-black text-[#1A3827] dark:text-slate-200 mb-3">Members ({members.length})</p>
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400 italic text-center py-4">No members yet.</p>
                ) : (
                  members.map(m => {
                    const isSelf = m.uid === currentUid;
                    const isThisHost = m.uid === roomCreatedBy;
                    return (
                      <div key={m.uid} className="flex items-center gap-3 p-3 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 ${isThisHost ? 'bg-[#1A3827]' : 'bg-pink-400'}`}>
                          {m.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm text-[#1A3827] dark:text-slate-100 truncate">{m.nickname}</p>
                            {isThisHost && <span className="text-[8px] font-black text-white bg-[#1A3827] dark:bg-[#A3E635] dark:text-slate-950 px-1.5 py-0.5 rounded-full">Host</span>}
                          </div>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-mono truncate">{isSelf ? 'You' : m.uid?.substring(0,8) + '...'}</p>
                        </div>
                        {isSelf ? (
                          // Self: show "You" tag. If not host, also show leave button
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-[#1A3827] dark:text-[#A3E635] bg-[#EAF0EC] dark:bg-slate-700 px-2 py-1 rounded-full uppercase">You</span>
                            {!isHost && (
                              <button
                                onClick={() => { setIsManageRoomOpen(false); handleLeaveRoom(); }}
                                className="text-[9px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 px-2 py-1 rounded-lg transition-all"
                                title="Leave this room"
                              >
                                Leave
                              </button>
                            )}
                          </div>
                        ) : (
                          // Others: host can remove, member sees nothing
                          isHost && (
                            <button
                              onClick={() => handleRemoveMember(m.uid)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                              title={`Remove ${m.nickname}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Budget Setting — host only editable */}
            <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Monthly Budget Cap</p>
              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">Set a shared monthly spending limit for the room.</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5C6E5C] font-semibold">₹</span>
                <input
                  type="number"
                  min="1000"
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(Number(e.target.value))}
                  disabled={!isHost}
                  className={`flex-1 px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-900 ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {isHost && (
                  <button
                    onClick={async () => {
                      localStorage.setItem('monthlyBudget', monthlyBudget);
                      if (userRoomId) {
                        try {
                          const { error: updateError } = await supabase
                            .from('rooms')
                            .update({ monthly_budget: monthlyBudget })
                            .eq('id', userRoomId);
                          if (updateError) throw updateError;
                          await logActivity('settings', `${userNickname} updated the monthly budget to ₹${monthlyBudget}`);
                          triggerToast('Budget updated for all room members!');
                        } catch {
                          triggerToast('Budget saved locally.');
                        }
                      } else {
                        triggerToast('Budget saved locally.');
                      }
                    }}
                    className="px-3 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl text-xs font-bold hover:opacity-90 shrink-0"
                  >Save</button>
                )}
                {!isHost && (
                  <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold px-1">Host only</span>
                )}
              </div>
            </div>

            {/* Room Log — visible to all members */}
            <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-black text-[#1A3827] dark:text-slate-200">Room Activity Log</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activityLogs.length === 0 ? (
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 italic">No activity yet.</p>
                ) : (
                  activityLogs.map(log => (
                    <div key={log.id} className="flex justify-between items-start gap-2 text-xs pb-2 border-b border-[#F6F8F6] dark:border-slate-800/50 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-[#1A3827] dark:text-slate-200 text-[11px] leading-snug">
                          {formatLogDetails(log)}
                        </p>
                        <p className="text-[9px] text-[#5C6E5C] dark:text-slate-400">by {log.user_name || 'System'}</p>
                      </div>
                      <span className="text-[9px] text-[#5C6E5C] dark:text-slate-500 whitespace-nowrap shrink-0">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger Zone — host only */}
            {isHost ? (
              <div className="border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/10 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-rose-700 dark:text-rose-400">Danger Zone</p>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/70">Deleting the room will permanently remove all transactions, members, and data. This cannot be undone.</p>
                <button
                  onClick={() => { setIsManageRoomOpen(false); handleDeleteRoom(); }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Delete Room Permanently
                </button>
              </div>
            ) : (
              <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/10 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-amber-700 dark:text-amber-400">Leave Room</p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70">You can leave this room at any time. Your past expenses will remain in the room ledger.</p>
                <button
                  onClick={() => { setIsManageRoomOpen(false); handleLeaveRoom(); }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Leave Room
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FUND TRACKER ACTIONS & RENDERING
  // ==========================================

  async function handleSaveFund(e) {
    e.preventDefault();
    if (!fundFormName.trim() || !fundFormAmount) {
      triggerToast('Please fill in all fields.');
      return;
    }
    const amtNum = Number(fundFormAmount);
    if (isNaN(amtNum) || amtNum <= 0) {
      triggerToast('Amount must be positive.');
      return;
    }

    const currentUid = user?.id || 'anonymous';
    const nickname = userNickname || 'You';

    const payload = {
      title: fundFormName.trim(),
      amount: amtNum,
      category: '__FUND_INIT__',
      date: fundFormDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paid_by: nickname,
      paid_by_uid: currentUid,
      is_shared: false,
      split_type: 'equal',
      split: '',
      splits: [{ uid: currentUid, amount: amtNum, nickname }]
    };

    try {
      if (editingFund) {
        // Edit existing fund
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingFund.id);

        if (error) throw error;
        
        setTransactions(prev => prev.map(t => t.id === editingFund.id ? { ...t, title: payload.title, amount: payload.amount, date: payload.date } : t));
        triggerToast('Fund updated successfully.');
      } else {
        // Create new fund
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            room_id: userRoomId,
            ...payload
          })
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          const newTx = {
            id: data[0].id,
            roomId: data[0].room_id,
            title: data[0].title,
            amount: Number(data[0].amount) || 0,
            category: data[0].category,
            date: data[0].date,
            time: data[0].time,
            paidBy: data[0].paid_by,
            paidByUid: data[0].paid_by_uid,
            isShared: data[0].is_shared,
            splitType: data[0].split_type,
            split: data[0].split,
            splits: data[0].splits,
            createdBy: data[0].created_by
          };
          setTransactions(prev => [newTx, ...prev]);
        }
        triggerToast('Fund created successfully.');
      }
      setIsAddFundModalOpen(false);
      setEditingFund(null);
      setFundFormName('');
      setFundFormAmount('');
    } catch (err) {
      console.error(err);
      triggerToast('Error saving fund.');
    }
  }

  async function handleDeleteFund(fund) {
    const confirmed = window.confirm(`Are you sure you want to delete the fund "${fund.title}"? All recorded payments under this fund will also be deleted permanently.`);
    if (!confirmed) return;

    try {
      // Delete spends
      const { error: spendsError } = await supabase
        .from('transactions')
        .delete()
        .eq('split', fund.id)
        .eq('category', '__FUND_SPEND__');
        
      if (spendsError) throw spendsError;

      // Delete fund init
      const { error: fundError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', fund.id);

      if (fundError) throw fundError;

      setTransactions(prev => prev.filter(t => t.id !== fund.id && !(t.category === '__FUND_SPEND__' && t.split === fund.id)));
      
      if (selectedFundId === fund.id) {
        setSelectedFundId(null);
      }
      triggerToast('Fund deleted successfully.');
    } catch (err) {
      console.error(err);
      triggerToast('Error deleting fund.');
    }
  }

  async function handleSaveFundSpend(e) {
    e.preventDefault();
    if (!fundSpendFormTitle.trim() || !fundSpendFormAmount || !selectedFundId) {
      triggerToast('Please fill in all fields.');
      return;
    }
    const baseAmt = Number(fundSpendFormAmount);
    if (isNaN(baseAmt) || baseAmt <= 0) {
      triggerToast('Amount must be positive.');
      return;
    }
    const amtNum = fundSpendFormType === 'income' ? -baseAmt : baseAmt;

    const currentUid = user?.id || 'anonymous';
    const nickname = userNickname || 'You';

    const payload = {
      title: fundSpendFormTitle.trim(),
      amount: amtNum,
      category: '__FUND_SPEND__',
      date: fundSpendFormDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paid_by: nickname,
      paid_by_uid: currentUid,
      is_shared: false,
      split_type: fundSpendFormCategory, // Store category in split_type
      split: selectedFundId,             // Store parent Fund ID in split
      splits: [{ uid: currentUid, amount: amtNum, nickname }]
    };

    try {
      if (editingFundSpend) {
        // Edit existing fund spend
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingFundSpend.id);

        if (error) throw error;
        
        setTransactions(prev => prev.map(t => t.id === editingFundSpend.id ? { 
          ...t, 
          title: payload.title, 
          amount: payload.amount, 
          date: payload.date,
          splitType: payload.split_type 
        } : t));
        triggerToast('Payment updated successfully.');
      } else {
        // Create new fund spend
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            room_id: userRoomId,
            ...payload
          })
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          const newTx = {
            id: data[0].id,
            roomId: data[0].room_id,
            title: data[0].title,
            amount: Number(data[0].amount) || 0,
            category: data[0].category,
            date: data[0].date,
            time: data[0].time,
            paidBy: data[0].paid_by,
            paidByUid: data[0].paid_by_uid,
            isShared: data[0].is_shared,
            splitType: data[0].split_type,
            split: data[0].split,
            splits: data[0].splits,
            createdBy: data[0].created_by
          };
          setTransactions(prev => [newTx, ...prev]);
        }
        triggerToast('Payment recorded successfully.');
      }
      setIsAddFundExpenseModalOpen(false);
      setEditingFundSpend(null);
      setFundSpendFormTitle('');
      setFundSpendFormAmount('');
    } catch (err) {
      console.error(err);
      triggerToast('Error saving payment.');
    }
  }

  async function handleDeleteFundSpend(spend) {
    const confirmed = window.confirm(`Delete payment "${spend.title}" of ${formatINR(spend.amount)}?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', spend.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== spend.id));
      triggerToast('Payment deleted successfully.');
    } catch (err) {
      console.error(err);
      triggerToast('Error deleting payment.');
    }
  }

  function exportFundToCSV(fund, spends) {
    try {
      const headers = ['Title', 'Amount (₹)', 'Category', 'Date'];
      const rows = spends.map(s => [
        `"${s.title.replace(/"/g, '""')}"`,
        s.amount,
        s.splitType || 'Other',
        s.date
      ]);
      
      const csvContent = [
        `"Fund Statement: ${fund.title.replace(/"/g, '""')}"`,
        `"Target Budget: ${fund.amount}"`,
        "",
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fund.title.replace(/\s+/g, '_')}_statement.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Fund CSV downloaded successfully.');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to export CSV.');
    }
  }

  function renderFundTracker() {
    const fundCategories = ['Shopping', 'Travel', 'Food', 'Electronics', 'Utilities', 'Entertainment', 'Medical', 'Other', 'People'];
    
    // Group active fund spends by category
    const activeFund = myFunds.find(f => f.id === selectedFundId);
    const activeFundSpends = myFundSpends.filter(s => s.split === selectedFundId);

    // Compute stats for all funds
    const fundStats = {};
    myFunds.forEach(f => {
      const fundSpends = myFundSpends.filter(s => s.split === f.id);
      const spent = fundSpends.filter(s => s.amount > 0).reduce((sum, s) => sum + s.amount, 0);
      const received = fundSpends.filter(s => s.amount < 0).reduce((sum, s) => sum + Math.abs(s.amount), 0);
      const netSpent = spent - received;
      fundStats[f.id] = {
        total: f.amount,
        spent: spent,
        received: received,
        netSpent: netSpent,
        remaining: f.amount - netSpent,
        percentage: f.amount > 0 ? Math.max(0, Math.min((netSpent / f.amount) * 100, 100)) : 0
      };
    });

    if (selectedFundId && activeFund) {
      const stats = fundStats[selectedFundId] || { total: activeFund.amount, spent: 0, remaining: activeFund.amount, percentage: 0 };
      
      // Filter spends inside active fund
      const filteredSpends = activeFundSpends.filter(s => {
        const titleStr = s.title || '';
        const catStr = s.splitType || '';
        return titleStr.toLowerCase().includes(fundSearchQuery.toLowerCase()) || 
               catStr.toLowerCase().includes(fundSearchQuery.toLowerCase());
      });

      // Category breakdown (sum positive spends only)
      const categorySummary = {};
      activeFundSpends.forEach(s => {
        if (s.amount > 0) {
          const cat = s.splitType || 'Other';
          categorySummary[cat] = (categorySummary[cat] || 0) + s.amount;
        }
      });
      const sortedCategories = Object.entries(categorySummary)
        .sort((a, b) => b[1] - a[1]);

      const getCategoryColor = (cat) => {
        const colors = {
          'Shopping': 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/55',
          'Travel': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/55',
          'Food': 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/55',
          'Electronics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200/55',
          'Utilities': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/55',
          'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400 border-pink-200/55',
          'Medical': 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200/55',
          'Other': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200/55'
        };
        return colors[cat] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      };

      return (
        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button 
                onClick={() => { setSelectedFundId(null); setFundSearchQuery(''); }}
                className="flex items-center gap-1 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200 font-bold text-xs sm:text-sm transition-all mb-2"
              >
                <span>← Back to funds</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">{activeFund.title}</h1>
              <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">
                Created on {new Date(activeFund.date).toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportFundToCSV(activeFund, activeFundSpends);
                }}
                className="flex items-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => {
                  setFundSpendFormTitle('');
                  setFundSpendFormAmount('');
                  setFundSpendFormCategory('Shopping');
                  setFundSpendFormDate(new Date().toISOString().substring(0, 10));
                  setEditingFundSpend(null);
                  setFundSpendFormType('expense');
                  setIsAddFundExpenseModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>

          {/* Hero Stats Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[220px]">
              <div>
                <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Fund Balance Overview</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(stats.remaining)}</span>
                  <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">remaining of {formatINR(stats.total)}</span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 rounded-full h-3.5 overflow-hidden border border-[#E3E8E3]/50 dark:border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.percentage >= 90 ? 'bg-red-600' : 'bg-[#1A3827] dark:bg-[#A3E635]'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <div className="flex flex-wrap justify-between items-center text-[10px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 font-bold gap-y-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>Spent: {formatINR(stats.spent)}</span>
                    {stats.received > 0 && <span className="text-green-600 dark:text-green-400">Received: {formatINR(stats.received)}</span>}
                    {stats.received > 0 && <span>Net: {formatINR(stats.netSpent)} ({stats.percentage.toFixed(0)}%)</span>}
                    {stats.received === 0 && <span>({stats.percentage.toFixed(0)}%)</span>}
                  </div>
                  <span>Budget: {formatINR(stats.total)}</span>
                </div>
              </div>
            </div>

            {/* Category summary card */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest mb-4">Category Breakdown</p>
                {sortedCategories.length === 0 ? (
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400 italic">No payments logged yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                    {sortedCategories.map(([cat, amt]) => {
                      const pct = stats.spent > 0 ? (amt / stats.spent) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-[#1A3827] dark:text-slate-200">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat).split(' ')[0]}`}></span>
                              {cat}
                            </span>
                            <span>{formatINR(amt)} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className={`h-full ${getCategoryColor(cat).split(' ')[0]} rounded-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search & Spends List */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#5C6E5C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search payments by name or category..."
                  value={fundSearchQuery}
                  onChange={(e) => setFundSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            {/* Spends Table / List */}
            {filteredSpends.length === 0 ? (
              <div className="py-12 text-center text-[#5C6E5C] dark:text-slate-400 italic font-bold">
                {fundSearchQuery ? 'No matching payments found.' : 'No payments recorded against this fund yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[#E3E8E3] dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                      <th className="py-3.5 px-3 text-left">Payment Details</th>
                      <th className="py-3.5 px-3 text-left">Category</th>
                      <th className="py-3.5 px-3 text-left">Date</th>
                      <th className="py-3.5 px-3 text-right">Amount</th>
                      <th className="py-3.5 px-3 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSpends.map(s => (
                      <tr key={s.id} className="border-b border-[#F6F8F6] dark:border-slate-800/40 hover:bg-[#F6F8F6]/30 dark:hover:bg-slate-800/20 transition-all">
                        <td className="py-4 px-3">
                          <p className="font-bold text-sm text-[#1A3827] dark:text-slate-100">{s.title}</p>
                        </td>
                        <td className="py-4 px-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getCategoryColor(s.splitType)}`}>
                            {s.splitType || 'Other'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
                          {new Date(s.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className={`py-4 px-3 text-right font-black text-sm ${s.amount < 0 ? 'text-green-600 dark:text-green-400' : 'text-[#1A3827] dark:text-slate-100'}`}>
                          {s.amount < 0 ? `+ ${formatINR(Math.abs(s.amount))}` : `- ${formatINR(s.amount)}`}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setFundSpendFormTitle(s.title);
                                setFundSpendFormAmount(String(Math.abs(s.amount)));
                                setFundSpendFormCategory(s.splitType || 'Other');
                                setFundSpendFormDate(s.date);
                                setFundSpendFormType(s.amount < 0 ? 'income' : 'expense');
                                setEditingFundSpend(s);
                                setIsAddFundExpenseModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#5C6E5C] hover:text-[#1A3827] hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all"
                              title="Edit payment"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFundSpend(s)}
                              className="p-1.5 rounded-lg text-[#5C6E5C] hover:text-red-600 hover:bg-red-50 dark:hover:bg-rose-950/20 transition-all"
                              title="Delete payment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    // LIST VIEW
    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Fund Tracker</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Create isolated budget pots to track specific projects, trips, or savings targets.</p>
          </div>
          
          <button 
            onClick={() => {
              setFundFormName('');
              setFundFormAmount('');
              setFundFormDate(new Date().toISOString().substring(0, 10));
              setEditingFund(null);
              setIsAddFundModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Fund</span>
          </button>
        </div>

        {/* Funds List */}
        {myFunds.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-[#E3E8E3] dark:border-slate-800 p-8 sm:p-12 rounded-3xl text-center max-w-md mx-auto space-y-4 shadow-sm mt-8">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] flex items-center justify-center mx-auto shadow-inner">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-[#1A3827] dark:text-slate-100">No Custom Funds Tracked Yet</h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                Have a starting amount (like ₹1 Lakh) you want to record spends against in complete isolation? Create a pot to get started.
              </p>
            </div>
            <button
              onClick={() => {
                setFundFormName('');
                setFundFormAmount('');
                setFundFormDate(new Date().toISOString().substring(0, 10));
                setEditingFund(null);
                setIsAddFundModalOpen(true);
              }}
              className="bg-[#1A3827] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#255038] transition-all text-xs shadow-md"
            >
              + Create Fund Pot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myFunds.map(f => {
              const stats = fundStats[f.id] || { total: f.amount, spent: 0, remaining: f.amount, percentage: 0 };
              return (
                <div key={f.id} className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-base text-[#1A3827] dark:text-slate-100 line-clamp-1">{f.title}</h3>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFundFormName(f.title);
                            setFundFormAmount(String(f.amount));
                            setFundFormDate(f.date);
                            setEditingFund(f);
                            setIsAddFundModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 transition-all"
                          title="Edit Fund"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFund(f);
                          }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-rose-950/20 text-[#5C6E5C] hover:text-red-600 transition-all"
                          title="Delete Fund"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-[#5C6E5C] dark:text-slate-400 font-bold uppercase tracking-widest">
                      Created {new Date(f.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="my-5">
                    <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(stats.remaining)}</p>
                    <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase mt-0.5">Remaining of {formatINR(stats.total)}</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-[#E3E8E3]/50 dark:border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          stats.percentage >= 90 ? 'bg-red-600' : 'bg-[#1A3827] dark:bg-[#A3E635]'
                        }`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-[#5C6E5C] dark:text-slate-400 font-bold">
                      <span>Spent: {formatINR(stats.netSpent)} ({stats.percentage.toFixed(0)}%)</span>
                      <button
                        onClick={() => setSelectedFundId(f.id)}
                        className="text-[#1A3827] dark:text-[#A3E635] hover:underline font-extrabold flex items-center gap-0.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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

  function renderAddFundModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
            <div>
              <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">{editingFund ? 'Edit Fund Pot' : 'Create Fund Pot'}</h3>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">Allocate a separate amount to track in isolation</p>
            </div>
            <button 
              onClick={() => { setIsAddFundModalOpen(false); setEditingFund(null); }}
              className="p-1.5 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveFund} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Fund Name</label>
              <input 
                type="text" 
                placeholder="e.g. 1 Lakh Savings Pot, Goa Trip"
                value={fundFormName}
                onChange={(e) => setFundFormName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Total Allocation (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 100000"
                value={fundFormAmount}
                onChange={(e) => setFundFormAmount(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Creation Date</label>
              <input 
                type="date" 
                value={fundFormDate}
                onChange={(e) => setFundFormDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold cursor-pointer"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                type="button"
                onClick={() => { setIsAddFundModalOpen(false); setEditingFund(null); }}
                className="flex-1 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-200 py-3 rounded-xl font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#1A3827] hover:bg-[#255038] text-white py-3 rounded-xl font-bold transition-all text-xs shadow-md"
              >
                {editingFund ? 'Save Changes' : 'Create Pot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderAddFundExpenseModal() {
    const categories = ['Shopping', 'Travel', 'Food', 'Electronics', 'Utilities', 'Entertainment', 'Medical', 'Other', 'People'];
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
            <div>
              <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">{editingFundSpend ? 'Edit Transaction' : 'Record Transaction'}</h3>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">{fundSpendFormType === 'income' ? 'Add received money to this fund' : 'Deduct spent amount from this fund'}</p>
            </div>
            <button 
              onClick={() => { setIsAddFundExpenseModalOpen(false); setEditingFundSpend(null); }}
              className="p-1.5 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveFundSpend} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Inflow vs Outflow toggle */}
            <div className="bg-[#F6F8F6] dark:bg-slate-950 p-1 rounded-2xl flex gap-1 border border-[#E3E8E3]/60 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setFundSpendFormType('expense')}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all duration-200 ${
                  fundSpendFormType === 'expense'
                    ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => setFundSpendFormType('income')}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all duration-200 ${
                  fundSpendFormType === 'income'
                    ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
                }`}
              >
                Received (Inflow)
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">{fundSpendFormType === 'income' ? 'Description / Source' : 'Payment Title'}</label>
              <input 
                type="text" 
                placeholder={fundSpendFormType === 'income' ? 'e.g. Received from Dad, Refund' : 'e.g. Flight booking, Dinner bill'}
                value={fundSpendFormTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setFundSpendFormTitle(val);
                  const detected = smartDetectCategory(val);
                  if (detected) setFundSpendFormCategory(detected);
                }}
                required
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">{fundSpendFormType === 'income' ? 'Amount Received (₹)' : 'Amount Spent (₹)'}</label>
              <input 
                type="number" 
                placeholder={fundSpendFormType === 'income' ? 'e.g. 5000' : 'e.g. 3500'}
                value={fundSpendFormAmount}
                onChange={(e) => setFundSpendFormAmount(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
              <select
                value={fundSpendFormCategory}
                onChange={(e) => setFundSpendFormCategory(e.target.value)}
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-bold cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Date</label>
              <input 
                type="date" 
                value={fundSpendFormDate}
                onChange={(e) => setFundSpendFormDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold cursor-pointer"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                type="button"
                onClick={() => { setIsAddFundExpenseModalOpen(false); setEditingFundSpend(null); }}
                className="flex-1 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-200 py-3 rounded-xl font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#1A3827] hover:bg-[#255038] text-white py-3 rounded-xl font-bold transition-all text-xs shadow-md"
              >
                {editingFundSpend ? 'Save Changes' : 'Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 4: SPENDING INSIGHTS
  // ==========================================
  function renderInsights() {
    const today = new Date();
    const currentMonthStr = today.toISOString().substring(0, 7);
    
    let daysInMonth, daysPassed, daysLeft;
    
    if (selectedMonth === 'All') {
      daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      daysPassed = today.getDate();
      daysLeft = daysInMonth - daysPassed;
    } else {
      const [year, month] = selectedMonth.split('-');
      const y = Number(year);
      const m = Number(month); // 1-indexed
      daysInMonth = new Date(y, m, 0).getDate();
      
      if (selectedMonth === currentMonthStr) {
        daysPassed = today.getDate();
        daysLeft = daysInMonth - daysPassed;
      } else if (selectedMonth < currentMonthStr) {
        daysPassed = daysInMonth;
        daysLeft = 0;
      } else {
        daysPassed = 0;
        daysLeft = daysInMonth;
      }
      

    }

    const isPersonalTab = insightsTab === 'personal';
    const monthTransactions = transactions.filter(t => 
      (selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth))) &&
      t.category !== '__FUND_INIT__' && 
      t.category !== '__FUND_SPEND__'
    );
    const monthPersonalExpenses = myPersonalExpenses.filter(t => selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth)));

    const targetTransactions = isPersonalTab ? monthPersonalExpenses : monthTransactions;

    const monthSharedSpend = monthTransactions
      .filter(t => t.isShared)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
    const monthPersonalSpend = monthPersonalExpenses
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
    const monthTotalSpend = monthSharedSpend + monthPersonalSpend;

    // Compute real category breakdown from target transactions
    const CATEGORY_COLORS = {
      'Rent': '#1A3827', 'Food': '#FBBF24', 'Groceries': '#22C55E',
      'Utilities': '#3B82F6', 'Shopping': '#F43F5E', 'Transport': '#8B5CF6',
      'Fuel': '#F97316', 'Entertainment': '#EC4899', 'Medical': '#14B8A6',
      'Payment': '#6366F1', 'Other': '#94A3B8'
    };
    const catMap = {};
    targetTransactions.forEach(t => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
    });
    const rawTotal = targetTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const total = rawTotal > 0 ? rawTotal : 1;           // safe divisor for percentages only
    const catArr = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const circumference = 2 * Math.PI * 40; // 251.3
    let cumulativePct = 0;

    const dailyAvg = rawTotal > 0 && daysPassed > 0 ? Math.round(rawTotal / daysPassed) : 0;
    const activeLimit = isPersonalTab ? personalCap : monthlyBudget;
    const roomOrPersonalTotal = isPersonalTab ? rawTotal : monthSharedSpend;
    const limitRemaining = Math.max(0, activeLimit - roomOrPersonalTotal);
    const safeDailyLimit = daysLeft > 0 ? Math.round(limitRemaining / daysLeft) : 0;
    const myShare = Math.abs(computedStats.currentUserBalance);

    // Calculations for Projections & Trends
    const activeTransactions = targetTransactions;
    const largestTx = activeTransactions.length > 0 
      ? [...activeTransactions].sort((a, b) => b.amount - a.amount)[0] 
      : null;
      
    const totalTransactionsCount = activeTransactions.length;
    const avgTxValue = totalTransactionsCount > 0 ? (rawTotal / totalTransactionsCount) : 0;
    
    const isProjectable = selectedMonth !== 'All' && daysPassed > 0;
    const projectedSpend = isProjectable ? (rawTotal / daysPassed) * daysInMonth : rawTotal;

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">ROOM INTELLIGENCE</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Spending insights</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">A clearer view of where your money goes — powered by real data.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Segmented Control */}
            <div className="flex bg-[#F6F8F6] dark:bg-slate-950 p-1 rounded-2xl border border-[#E3E8E3]/50 dark:border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setInsightsTab('room')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  !isPersonalTab
                    ? 'bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-sm'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
                }`}
              >
                Room Expenses
              </button>
              <button
                onClick={() => setInsightsTab('personal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isPersonalTab
                    ? 'bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-sm'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
                }`}
              >
                Personal Expenses
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                {targetTransactions.length} transactions
              </span>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3 py-1.5 text-[10px] font-bold focus:outline-none text-[#1A3827] dark:text-slate-200 cursor-pointer"
              >
                <option value="All">All Time</option>
                {availableMonths.map((m) => {
                  const [year, month] = m.split('-');
                  const dateObj = new Date(Number(year), Number(month) - 1, 1);
                  return (
                    <option key={m} value={m}>
                      {dateObj.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">TOTAL SPEND</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(rawTotal)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">{targetTransactions.length} transactions</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">DAILY AVG</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(dailyAvg)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">Safe limit: {formatINR(safeDailyLimit)}/day</p>
          </div>
          {!isPersonalTab ? (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
                <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">SHARED BILLS</p>
                <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(monthSharedSpend)}</p>
                <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">of total room spend</p>
              </div>
              <div className={`border p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300 ${
                computedStats.currentUserBalance >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
              }`}>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">YOUR BALANCE</p>
                <p className={`text-base sm:text-2xl font-black mt-1 truncate ${
                  computedStats.currentUserBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>{formatINR(myShare)}</p>
                <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">
                  {computedStats.currentUserBalance > 0 ? 'you are owed' : computedStats.currentUserBalance < 0 ? 'you owe' : 'all settled'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
                <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">LIMIT CAP</p>
                <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(personalCap)}</p>
                <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">monthly spending cap</p>
              </div>
              <div className={`border p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300 ${
                rawTotal < personalCap
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
              }`}>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">REMAINING LIMIT</p>
                <p className={`text-base sm:text-2xl font-black mt-1 truncate ${
                  rawTotal < personalCap ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>{formatINR(Math.max(0, personalCap - rawTotal))}</p>
                <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">
                  {rawTotal < personalCap ? 'under limit cap' : 'limit exceeded'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Projections & Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Projected Spend Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm space-y-2 transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">MONTH-END PROJECTION</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">
              {isProjectable ? formatINR(projectedSpend) : '—'}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold leading-normal">
              {isProjectable ? (
                projectedSpend > activeLimit ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold">⚠️ Over limit by {formatINR(projectedSpend - activeLimit)}</span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ On track ({formatINR(activeLimit - projectedSpend)} under)</span>
                )
              ) : (
                <span>Choose a month to see projection</span>
              )}
            </p>
          </div>

          {/* Largest Expense Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm space-y-2 transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">LARGEST EXPENSE</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">
              {largestTx ? formatINR(largestTx.amount) : '—'}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold truncate leading-normal">
              {largestTx ? `"${largestTx.title}" paid by ${largestTx.paidByUid === auth.currentUser?.uid ? 'You' : largestTx.paidBy}` : 'No transactions recorded'}
            </p>
          </div>

          {/* Average Bill Size Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm space-y-2 transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">AVERAGE BILL SIZE</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">
              {formatINR(avgTxValue)}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold leading-normal">
              Across {totalTransactionsCount} total logged bills
            </p>
          </div>
        </div>

        {/* Spending Breakdown Explainer — clarity card */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">💡</span>
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">How your spending is calculated</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Spent */}
            <div className="bg-[#F6F8F6] dark:bg-slate-950 rounded-2xl p-4 border border-[#E3E8E3] dark:border-slate-800">
              <p className="text-[9px] font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
              <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(monthTotalSpend)}</p>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1.5 leading-relaxed">All transactions in this room — shared bills <em>and</em> personal expenses combined.</p>
            </div>
            {/* Shared Bills */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Shared Bills</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatINR(monthSharedSpend)}</p>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1.5 leading-relaxed">Expenses split among roommates. These <strong>are counted</strong> in the balance &amp; settlement calculation.</p>
            </div>
            {/* Personal */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Personal (Excluded)</p>
              <p className="text-2xl font-black text-slate-600 dark:text-slate-300">{formatINR(monthPersonalSpend)}</p>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1.5 leading-relaxed">Your personal expenses logged for tracking only. These are <strong>excluded</strong> from any roommate balance or settlement.</p>
            </div>
          </div>
          {/* Per-member paid row */}
          {members.length > 0 && (
            <div className="mt-4 border-t border-[#F6F8F6] dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest mb-3">Who Paid What (shared bills only)</p>
              <div className="flex flex-wrap gap-3">
                {members.map(m => {
                  const memberSharedPaid = monthTransactions
                    .filter(t => t.isShared && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)))
                    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
                  const bal = computedStats.balances?.[m.uid] || 0;
                  return (
                    <div key={m.uid} className="flex items-center gap-2 bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2">
                      {m.photoURL ? (
                        <img 
                          src={m.photoURL} 
                          alt={m.nickname} 
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#E3E8E3] dark:border-slate-800"
                        />
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                          auth.currentUser && m.uid === auth.currentUser.uid ? 'bg-[#1A3827]' : 'bg-pink-400'
                        }`}>{m.nickname?.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200 truncate max-w-[100px]">{m.nickname}</p>
                        <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 truncate">Paid {formatINR(memberSharedPaid)} • <span className={bal >= 0 ? 'text-emerald-600' : 'text-rose-500'}>{bal >= 0 ? `owed ${formatINR(bal)}` : `owes ${formatINR(Math.abs(bal))}`}</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-[#5C6E5C] dark:text-slate-500 mt-2">ℹ Personal expenses are fully excluded from balance calculations above.</p>
            </div>
          )}
        </div>

        {/* Charts area - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Left: Spend by category (Dynamic Donut Chart) */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Spend by category</h3>
            {targetTransactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">
                <p>No transactions yet.</p>
                <p className="text-[10px] mt-1">Add expenses to see your category breakdown.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                {/* Dynamic SVG donut */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {catArr.length === 0 ? (
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E3E8E3" strokeWidth="10" />
                    ) : (
                      catArr.map(([cat, amt]) => {
                        const pct = amt / total;
                        const dash = pct * circumference;
                        const offset = -cumulativePct * circumference;
                        cumulativePct += pct;
                        return (
                          <circle
                            key={cat}
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke={CATEGORY_COLORS[cat] || '#94A3B8'}
                            strokeWidth="10"
                            strokeDasharray={`${dash} ${circumference}`}
                            strokeDashoffset={offset}
                            className="transition-all duration-500 hover:stroke-[12] cursor-pointer"
                          />
                        );
                      })
                    )}
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-sm font-black text-[#1A3827] dark:text-slate-100">{rawTotal > 0 ? formatINR(rawTotal) : '—'}</p>
                    <p className="text-[8px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">TOTAL</p>
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-2 w-full sm:w-auto">
                  {catArr.map(([cat, amt]) => (
                    <div key={cat} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#94A3B8' }}></span>
                        <span className="text-xs font-semibold text-[#5C6E5C] dark:text-slate-300 w-20 truncate">{cat}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{formatINR(amt)}</span>
                        <span className="text-[9px] text-gray-400 font-bold">{rawTotal > 0 ? Math.round((amt / rawTotal) * 100) : 0}%</span>
                      </div>
                    </div>
                  ))}
                  {catArr.length === 0 && <p className="text-xs text-[#5C6E5C]">No data</p>}
                </div>
              </div>
            )}
          </div>

          {/* Right: Per-member breakdown + budget progress */}
          {!isPersonalTab ? (
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Per-member spend</h3>
                <span className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">Live</span>
              </div>

              {members.length === 0 ? (
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 italic">No members yet.</p>
              ) : (
                <div className="space-y-3">
                  {members.map(m => {
                    const memberPaid = monthTransactions
                      .filter(t => t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname))
                      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
                    const memberPct = rawTotal > 0 ? Math.round((memberPaid / rawTotal) * 100) : 0;
                    const memberBal = computedStats.balances?.[m.uid] || 0;
                    return (
                      <div key={m.uid} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {m.photoURL ? (
                              <img 
                                src={m.photoURL} 
                                alt={m.nickname} 
                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#E3E8E3] dark:border-slate-800"
                              />
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                                auth.currentUser && m.uid === auth.currentUser.uid ? 'bg-[#1A3827]' : 'bg-pink-400'
                              }`}>{m.nickname?.charAt(0).toUpperCase()}</div>
                            )}
                            <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200 truncate max-w-[80px]">{m.nickname}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{formatINR(memberPaid)}</p>
                            <p className={`text-[9px] font-semibold ${memberBal >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {memberBal >= 0 ? `+${formatINR(memberBal)} owed` : `${formatINR(Math.abs(memberBal))} owes`}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-[#1A3827] dark:bg-[#A3E635]"
                            style={{ width: `${memberPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Budget progress */}
              <div className="border-t border-[#F6F8F6] dark:border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1A3827] dark:text-slate-200">
                  <span>Monthly budget (shared bills)</span>
                  <span>{formatINR(monthSharedSpend)} / {formatINR(monthlyBudget)}</span>
                </div>
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${monthSharedSpend >= monthlyBudget ? 'bg-rose-500' : 'bg-[#A3E635]'}`}
                    style={{ width: `${Math.min(100, Math.round((monthSharedSpend / monthlyBudget) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                  <span>{Math.min(100, Math.round((monthSharedSpend / monthlyBudget) * 100))}% used</span>
                  <span>{formatINR(Math.max(0, monthlyBudget - monthSharedSpend))} remaining</span>
                </div>
              </div>

              {/* Tip card */}
              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
                <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400">
                  {monthSharedSpend === 0
                    ? '✦ No shared expenses logged yet. Add your first shared expense to start tracking!'
                    : monthSharedSpend >= monthlyBudget
                      ? `⚠ Budget exceeded by ${formatINR(monthSharedSpend - monthlyBudget)}. Consider adjusting your limit in Manage Room.`
                      : `✦ Keep daily spend under ${formatINR(safeDailyLimit)} to stay within your ${formatINR(monthlyBudget)} budget.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Personal limit progress</h3>
                <span className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">Live</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1A3827] dark:text-slate-200">
                  <span>Spending limit</span>
                  <span>{formatINR(rawTotal)} / {formatINR(personalCap)}</span>
                </div>
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${rawTotal >= personalCap ? 'bg-rose-500' : 'bg-[#A3E635]'}`}
                    style={{ width: `${Math.min(100, Math.round((rawTotal / personalCap) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                  <span>{Math.min(100, Math.round((rawTotal / personalCap) * 100))}% used</span>
                  <span>{formatINR(limitRemaining)} remaining</span>
                </div>
              </div>

              {/* Tip card */}
              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
                <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400 leading-relaxed">
                  {rawTotal === 0
                    ? '✦ No personal expenses logged this month. Keep it up!'
                    : rawTotal >= personalCap
                      ? `⚠ Limit exceeded by ${formatINR(rawTotal - personalCap)}. Consider increasing your limit cap on the Dashboard.`
                      : `✦ Keep daily personal spend under ${formatINR(safeDailyLimit)} to stay within your ${formatINR(personalCap)} cap.`
                  }
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 5: RECEIPTS GALLERY
  // ==========================================
  function renderReceipts() {
    const activeReceipts = receipts;

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">VISUAL ARCHIVE</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Receipts gallery</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Every proof of purchase, close at hand.</p>
          </div>

          <button 
            onClick={handleTriggerUpload}
            className="flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload receipt</span>
          </button>
        </div>

        {activeReceipts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-xs sm:text-sm font-semibold text-[#5C6E5C] dark:text-slate-400">No receipts uploaded yet.</p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Upload roommate bill receipt files to archive them in this visual polaroid grid.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {activeReceipts.map((r) => (
              <div 
                key={r.id}
                onClick={() => setActiveReceiptZoom(r)}
                className={`rounded-3xl border p-3 sm:p-4 shadow-sm flex flex-col justify-between h-auto select-none transition-transform duration-300 hover:scale-102 hover:shadow-md cursor-pointer ${r.bgClass}`}
              >
                <div 
                  className={`bg-white text-slate-800 p-3 border border-slate-200/50 shadow-sm mx-auto w-full aspect-[4/5] flex flex-col justify-between transform transition-all duration-300 hover:rotate-0 hover:scale-102 relative overflow-hidden group/polaroid ${r.rotation}`}
                >
                  {r.imageUrl ? (
                    <div className="w-full h-full relative overflow-hidden rounded bg-slate-50 flex flex-col">
                      <img 
                        src={r.imageUrl} 
                        alt={r.title} 
                        className="w-full h-[65%] object-cover pointer-events-none" 
                      />
                      <div className="p-1 text-center font-mono flex-1 flex flex-col justify-center border-t border-slate-100">
                        <p className="text-[7px] font-black text-slate-500 tracking-wider">TALLYIN REC</p>
                        <p className="text-[9px] font-black tracking-tight text-slate-800 truncate uppercase mt-0.5">{r.title}</p>
                        <p className="text-xs font-black text-[#1A3827] mt-0.5">{formatINR(r.amount)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center font-mono flex-grow flex flex-col justify-between h-full pt-1">
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-black text-slate-500 tracking-wider">TALLYIN REC</p>
                          <p className="text-[10px] sm:text-xs font-black tracking-tight mt-1 uppercase truncate">{r.title}</p>
                          
                          <div className="border-t border-dashed border-slate-300 my-1"></div>
                          
                          <p className="text-sm sm:text-base font-black mt-1 text-slate-800">{formatINR(r.amount)}</p>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttachReceiptImage(r.id);
                          }}
                          className="mt-2 w-full py-1.5 bg-[#1A3827] dark:bg-slate-800 hover:bg-[#255038] text-white text-[9px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#A3E635]" />
                          <span>Attach Receipt</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="mt-3 sm:mt-4 pt-2 border-t border-black/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[10px] sm:text-xs tracking-tight truncate">{r.title}</h4>
                    <p className="text-[8px] sm:text-[10px] opacity-70 font-semibold mt-0.5 truncate">{r.category} • {r.date}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReceipt(r);
                      }}
                      className="p-1 rounded-lg hover:bg-black/5 transition-all text-[#5C6E5C] dark:text-slate-400"
                      title="Download receipt details"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReceipt(r.id);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all text-[#5C6E5C] dark:text-slate-450"
                      title="Delete receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // RECEIPT ZOOM LIGHTBOX MODAL
  // ==========================================
  function renderReceiptZoomModal() {
    if (!activeReceiptZoom) return null;
    return (
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={() => setActiveReceiptZoom(null)}
      >
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl relative flex flex-col gap-4 text-slate-800 dark:text-slate-200 transition-colors duration-300"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#1A3827] dark:text-white uppercase tracking-tight">{activeReceiptZoom.title}</h3>
              <p className="text-[10px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">{activeReceiptZoom.category} • {activeReceiptZoom.date}</p>
            </div>
            <button 
              onClick={() => setActiveReceiptZoom(null)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeReceiptZoom.imageUrl ? (
            <div className="w-full max-h-[50vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-2">
              <img 
                src={activeReceiptZoom.imageUrl} 
                alt={activeReceiptZoom.title} 
                className="max-w-full max-h-[48vh] object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full py-16 rounded-2xl border-2 border-dashed border-[#E3E8E3] dark:border-slate-850 text-center text-slate-450 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold">No receipt image file uploaded</p>
              <p className="text-[9px] mt-1 max-w-[240px] mx-auto opacity-80">This transaction was auto-recorded. Download the text receipt details below.</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-150 dark:border-slate-800 text-xs">
            <div>
              <span className="font-bold text-slate-500 dark:text-slate-400">Total:</span>
              <span className="font-black text-[#1A3827] dark:text-slate-100 ml-1.5">{formatINR(activeReceiptZoom.amount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteReceipt(activeReceiptZoom.id)}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-450 font-bold rounded-xl flex items-center gap-1.5 transition-all text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={() => {
                  handleDownloadReceipt(activeReceiptZoom);
                }}
                className="px-4 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 6: SETTINGS
  // ==========================================
  function renderSettings() {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto animate-fade-in pb-12">
        
        <div>
          <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">YOUR SPACE</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Settings</h1>
          <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Make Tallyin work the way you do.</p>
        </div>

        {/* Stacked Cards */}
        <div className="space-y-6">
          
          {/* Your Profile */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex justify-between items-center pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
                Your Profile
              </h3>
            </div>
            
            {/* Display Name editing */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Display Name</p>
                {isEditingNickname ? (
                  <input 
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="mt-1 px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold w-full max-w-xs bg-white dark:bg-slate-950"
                  />
                ) : (
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">{userNickname}</p>
                )}
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                {isEditingNickname ? (
                  <div className="flex gap-2 justify-start sm:justify-end">
                    <button 
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNicknameInput(userNickname);
                      }}
                      className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        setUserNickname(nicknameInput);
                        localStorage.setItem('userNickname', nicknameInput);
                        if (nicknameInput && nicknameInput !== 'You' && nicknameInput.trim() !== '') {
                          setIsNicknameFixed(true);
                        }
                        if (userRoomId && user) {
                          await addMemberToRoom(userRoomId, nicknameInput);
                        }
                        setIsEditingNickname(false);
                        triggerToast('Display name updated!');
                      }}
                      className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-[#255038] dark:hover:bg-slate-200"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingNickname(true)}
                    className="px-4 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Room & Members */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex justify-between items-center pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
                Room & Members
              </h3>
              <button
                onClick={() => setIsManageRoomOpen(true)}
                className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all"
              >
                Manage Room
              </button>
            </div>

            {/* Room code */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Room code</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Share this code with a new roommate to sync bills.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold bg-[#F6F8F6] dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-[#E3E8E3]/50 dark:border-slate-800">
                  {userRoomId || ''}
                </span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Copy room code"
                >
                  {roomCodeCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5C6E5C]" />}
                </button>
              </div>
            </div>

            {/* Room Name */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Room name</p>
                {isEditingRoomName ? (
                  <input 
                    type="text"
                    value={settingsRoomNameInput}
                    onChange={(e) => setSettingsRoomNameInput(e.target.value)}
                    className="mt-1 px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold w-full max-w-xs bg-white dark:bg-slate-900"
                  />
                ) : (
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">{roomName}</p>
                )}
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                {isEditingRoomName ? (
                  <div className="flex gap-2 justify-start sm:justify-end">
                    <button 
                      onClick={() => {
                        setIsEditingRoomName(false);
                        setSettingsRoomNameInput(roomName);
                      }}
                      className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        const newRoomName = settingsRoomNameInput.trim() || 'Tallyin';
                        setRoomName(newRoomName);
                        localStorage.setItem('roomName', newRoomName);
                        setIsEditingRoomName(false);
                        if (userRoomId) {
                          try {
                            const { error: updateError } = await supabase
                              .from('rooms')
                              .update({ name: newRoomName })
                              .eq('id', userRoomId);
                            if (updateError) throw updateError;
                            triggerToast('Room name updated!');
                          } catch {
                            triggerToast('Saved locally. Failed to sync to cloud.');
                          }
                        } else {
                          triggerToast('Room name updated!');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-[#255038] dark:hover:bg-slate-200"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingRoomName(true)}
                    className="px-4 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
                  >
                    Rename
                  </button>
                )}
              </div>
            </div>

            {/* Monthly Budget Cap */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Monthly budget cap</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Set the shared monthly budget cap for the room.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5C6E5C] font-semibold">₹</span>
                <input
                  type="number"
                  min="1000"
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                />
                <button
                  onClick={async () => {
                    localStorage.setItem('monthlyBudget', monthlyBudget);
                    if (userRoomId) {
                      try {
                        const { error: updateError } = await supabase
                          .from('rooms')
                          .update({ monthly_budget: monthlyBudget })
                          .eq('id', userRoomId);
                        if (updateError) throw updateError;
                        triggerToast('Budget updated for all room members!');
                      } catch {
                        triggerToast('Budget saved locally.');
                      }
                    } else {
                      triggerToast('Budget saved locally.');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl text-xs font-bold hover:opacity-90 shrink-0"
                >Save</button>
              </div>
            </div>

            {/* Current Members List */}
            <div className="flex flex-col gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Current members ({members.length})</p>
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 italic">No members yet. Invite roommates to join.</p>
                ) : (
                  members.map(m => {
                    const isSelf = user && m.uid === user.id;
                    const isThisHost = m.uid === roomCreatedBy;
                    const currentUserIsHost = user && roomCreatedBy === user.id;
                    return (
                      <div key={m.uid} className="flex items-center gap-3 p-3 bg-[#F6F8F6] dark:bg-slate-950 rounded-xl">
                        {m.photoURL ? (
                          <img 
                            src={m.photoURL} 
                            alt={m.nickname} 
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E3E8E3] dark:border-slate-800"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${isThisHost ? 'bg-[#1A3827]' : 'bg-pink-400'}`}>
                            {m.nickname?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-[#1A3827] dark:text-slate-100 truncate">{m.nickname}{isSelf ? ' (You)' : ''}</p>
                            {isThisHost && <span className="text-[8px] font-black text-white bg-[#1A3827] dark:bg-[#A3E635] dark:text-slate-950 px-1.5 py-0.5 rounded-full">Host</span>}
                          </div>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'recently'}</p>
                        </div>
                        {/* Host can remove others. Non-host can leave (themselves). */}
                        {!isSelf && currentUserIsHost && (
                          <button onClick={() => handleRemoveMember(m.uid)} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all" title="Remove member">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isSelf && !currentUserIsHost && (
                          <button onClick={handleLeaveRoom} className="text-[9px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-2 py-1 rounded-lg transition-all" title="Leave room">
                            Leave
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="w-full py-2 border border-dashed border-[#1A3827]/30 dark:border-slate-700 rounded-xl text-xs font-bold text-[#1A3827] dark:text-[#A3E635] hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all"
              >
                + Invite Another Roommate
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Preferences
            </h3>

            {/* Cosmic Slate */}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Cosmic Slate theme</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Activate a darker, modern charcoal aesthetic.</p>
              </div>
              <button 
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
                }}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-200 cursor-pointer shrink-0 ${
                  isDarkMode ? 'bg-[#A3E635]' : 'bg-[#E3E8E3] dark:bg-slate-800'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Offline Mode */}
            <div className="flex justify-between items-center py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Offline mode cache</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Auto-save data locally when connectivity drops.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#EAF0EC] dark:bg-slate-955 border border-[#1A3827]/10 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline">
                  ACTIVE
                </span>
                <button 
                  onClick={() => {
                    setOfflineMode(!offlineMode);
                    triggerToast(offlineMode ? 'Offline mode disabled.' : 'Offline mode cached & active.');
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-200 cursor-pointer shrink-0 ${
                    offlineMode ? 'bg-[#A3E635]' : 'bg-[#E3E8E3] dark:bg-slate-800'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                      offlineMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Export data */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Export your data</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Download transaction records in multiple formats.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => exportToCSV()}
                  className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all"
                  title="Export detailed CSV file"
                >
                  CSV
                </button>
                <button 
                  onClick={() => exportToExcel()}
                  className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all"
                  title="Export styled Excel spreadsheet"
                >
                  Excel
                </button>
                <button 
                  onClick={() => exportToPDF()}
                  className="px-3 py-1.5 bg-[#1A3827] dark:bg-slate-800 text-white dark:text-slate-100 font-bold text-[10px] rounded-lg transition-all hover:opacity-90"
                  title="Open styled print PDF statement"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Email Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Notification Method</label>
                <select
                  value={notificationMethod}
                  onChange={(e) => {
                    setNotificationMethod(e.target.value);
                    localStorage.setItem('notificationMethod', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none"
                >
                  <option value="none">None (Disabled)</option>
                  <option value="emailjs">EmailJS Service</option>
                  <option value="google-script">Google Script Webhook</option>
                </select>
              </div>

              {notificationMethod !== 'none' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Recipient Emails (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="email1@example.com, email2@example.com"
                      value={recipientEmails}
                      onChange={(e) => {
                        setRecipientEmails(e.target.value);
                        localStorage.setItem('recipientEmails', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                    />
                  </div>

                  {notificationMethod === 'emailjs' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Service ID</label>
                        <input
                          type="text"
                          placeholder="service_xxx"
                          value={emailJsServiceId}
                          onChange={(e) => {
                            setEmailJsServiceId(e.target.value);
                            localStorage.setItem('emailJsServiceId', e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Template ID</label>
                        <input
                          type="text"
                          placeholder="template_xxx"
                          value={emailJsTemplateId}
                          onChange={(e) => {
                            setEmailJsTemplateId(e.target.value);
                            localStorage.setItem('emailJsTemplateId', e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Public Key</label>
                        <input
                          type="text"
                          placeholder="public_key_xxx"
                          value={emailJsPublicKey}
                          onChange={(e) => {
                            setEmailJsPublicKey(e.target.value);
                            localStorage.setItem('emailJsPublicKey', e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                        />
                      </div>
                    </div>
                  )}

                  {notificationMethod === 'google-script' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Google Script URL</label>
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/..."
                        value={googleScriptUrl}
                        onChange={(e) => {
                          setGoogleScriptUrl(e.target.value);
                          localStorage.setItem('googleScriptUrl', e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Account & Danger zone */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Account & Danger zone
            </h3>

            {/* Leave Room (Redirects to Onboarding Setup View) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Leave room workspace</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Disconnect from this room. Room data remains safe in Supabase.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Leave this room space? You'll be redirected back to the onboarding room setup.")) {
                    setUserRoomId(null);
                    setHasConfirmedRoom(false);
                    setTransactions([]);
                    setReceipts([]);
                    setActivityLogs([]);
                    localStorage.removeItem('userRoomId');
                    if (user) {
                      supabase
                        .from('users')
                        .upsert({
                          uid: user.id,
                          room_id: null,
                          updated_at: new Date().toISOString()
                        }, { onConflict: 'uid' })
                        .catch(err => console.error(err));
                    }
                    triggerToast("Left room workspace.");
                  }
                }}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
              >
                Leave room
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Sign out</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Sign out of your Tallyin profile on this browser.</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-500">Delete Account</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Permanently delete your profile and spaces.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Activity Logs
            </h3>

            {/* Log Download Controls */}
            <div className="flex flex-col gap-3 pb-3.5 border-b border-[#F6F8F6] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="download-all-logs-check"
                  checked={downloadAllLogs}
                  onChange={(e) => setDownloadAllLogs(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#1A3827]"
                />
                <label htmlFor="download-all-logs-check" className="text-xs font-bold text-[#1A3827] dark:text-slate-200 cursor-pointer select-none">
                  Download all logs (ignores date filter)
                </label>
              </div>

              {!downloadAllLogs && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                    <input 
                      type="date"
                      value={logStartDate}
                      onChange={(e) => setLogStartDate(e.target.value)}
                      className="w-full bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A3827] dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">End Date</label>
                    <input 
                      type="date"
                      value={logEndDate}
                      onChange={(e) => setLogEndDate(e.target.value)}
                      className="w-full bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A3827] dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleDownloadLogs}
                disabled={isDownloadingLogs || (!downloadAllLogs && !logStartDate && !logEndDate)}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-98 ${
                  isDownloadingLogs || (!downloadAllLogs && !logStartDate && !logEndDate)
                    ? 'bg-[#E3E8E3] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-500 cursor-not-allowed'
                    : 'bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 hover:bg-[#255038] dark:hover:bg-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingLogs ? 'Downloading...' : 'Download CSV Logs'}</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 italic">No activity logs recorded yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-start gap-2 text-xs border-b border-[#F6F8F6] dark:border-slate-800/50 pb-2 last:border-b-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#1A3827] dark:text-slate-200">
                        {formatLogDetails(log)}
                      </p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">By {log.user_name || 'System'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-[#5C6E5C] dark:text-slate-500 whitespace-nowrap">
                      <Clock className="w-2.5 h-2.5" />
                      <span>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // CUSTOM INVITE MODAL
  // ==========================================
  // ==========================================
  // INVITE MODAL (real QR + link + code)
  // ==========================================
  function renderInviteModal() {
    const currentRoom = userRoomId || 'NO-ROOM';
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}?join=${currentRoom}`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}&bgcolor=FFFFFF&color=1A3827&margin=12&qzone=2`;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300">

          {/* Header */}
          <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
            <div>
              <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">Invite Roommate</h3>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">Choose how to share your room</p>
            </div>
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex mx-6 bg-[#F6F8F6] dark:bg-slate-950 rounded-2xl p-1 gap-1 shrink-0">
            {[['code', '🔑 Code'], ['qr', '📷 QR Code'], ['link', '🔗 Link']].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setInviteTab(tab)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-wide transition-all ${
                  inviteTab === tab
                    ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="px-6 pb-6 pt-4 space-y-4 overflow-y-auto flex-1">

            {/* ── TAB: CODE ── */}
            {inviteTab === 'code' && (
              <>
                <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/15 dark:border-slate-800 rounded-2xl p-5 text-center space-y-2">
                  <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Your Room Code</p>
                  <p className="font-mono font-black text-3xl text-[#1A3827] dark:text-[#A3E635] tracking-widest select-all">{currentRoom}</p>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                    Share this code with your roommate. They open Tallyin → Join Room → enter code.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentRoom}
                    className="flex-1 px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-sm font-mono font-black text-[#1A3827] dark:text-[#A3E635] dark:bg-slate-950 text-center tracking-widest"
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(currentRoom); triggerToast('Room code copied!'); }}
                    className="p-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl hover:opacity-90 transition-all"
                    title="Copy room code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* ── TAB: QR CODE ── */}
            {inviteTab === 'qr' && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white border-2 border-[#E3E8E3] dark:border-slate-700 rounded-2xl p-3 shadow-sm">
                    <img
                      src={qrImgUrl}
                      alt={`QR code for room ${currentRoom}`}
                      className="w-48 h-48 rounded-xl"
                      onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                    <div className="w-48 h-48 hidden items-center justify-center text-xs text-[#5C6E5C] text-center p-4 rounded-xl bg-[#F6F8F6]">
                      QR not loaded. Ensure you are online.
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Scan to join room <span className="font-mono text-[#A3E635] bg-[#1A3827] dark:bg-slate-800 px-2 py-0.5 rounded-lg">{currentRoom}</span></p>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Your roommate scans this with their phone camera or the in-app scanner.</p>
                  </div>
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = qrImgUrl;
                      a.download = `duoshare-invite-${currentRoom}.png`;
                      a.target = '_blank';
                      a.click();
                      triggerToast('QR code downloading…');
                    }}
                    className="w-full py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Image
                  </button>
                </div>
              </>
            )}

            {/* ── TAB: LINK ── */}
            {inviteTab === 'link' && (
              <>
                <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/15 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Invite Link</p>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                    Anyone who opens this link will be taken directly to the join screen with your room code pre-filled.
                  </p>
                  <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-[#1A3827] dark:text-slate-300 break-all select-all">
                    {inviteLink}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteLink); triggerToast('Invite link copied!'); }}
                    className="w-full py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy invite link
                  </button>
                  <button
                    onClick={async () => {
                      const text = `Join my Tallyin room!\n\nClick this link to join instantly:\n${inviteLink}\n\nOr enter room code: ${currentRoom}`;
                      if (navigator.share) {
                        try { await navigator.share({ title: 'Join my Tallyin room', text, url: inviteLink }); }
                        catch { navigator.clipboard.writeText(text); triggerToast('Invite message copied!'); }
                      } else {
                        navigator.clipboard.writeText(text);
                        triggerToast('Invite message copied to clipboard!');
                      }
                    }}
                    className="w-full py-2.5 border border-[#1A3827]/30 dark:border-slate-700 text-[#1A3827] dark:text-[#A3E635] font-bold text-xs rounded-xl hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share via app
                  </button>
                </div>
              </>
            )}

            <div className="flex justify-end pt-1 border-t border-[#F6F8F6] dark:border-slate-800">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-5 py-2 bg-[#1A3827] dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TALLYIN DIAMOND VIP ANALYTICS MODAL
  // ==========================================
  function renderDiamondModal() {
    const totalSpendVal = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const avgTxValue = transactions.length > 0 ? Math.round(totalSpendVal / transactions.length) : 0;

    // Busiest day analysis
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysCount = {};
    transactions.forEach(t => {
      if (!t.date) return;
      try {
        const day = new Date(t.date).getDay();
        daysCount[day] = (daysCount[day] || 0) + 1;
      } catch (err) {
        console.warn('Failed to parse date in VIP modal:', t.date, err);
      }
    });
    const sortedDays = Object.entries(daysCount).sort((a, b) => b[1] - a[1]);
    const busiestDay = sortedDays.length > 0 ? dayNames[Number(sortedDays[0][0])] : 'N/A';

    // Category breakdown
    const counts = {};
    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      counts[t.category] = (counts[t.category] || 0) + amt;
    });
    const categoryBreakdown = Object.entries(counts)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Top spender
    let maxPaid = -1;
    let topSpender = null;
    if (members.length > 0 && totalSpendVal > 0) {
      members.forEach(m => {
        const paid = transactions
          .filter(t => t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname))
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        if (paid > maxPaid) {
          maxPaid = paid;
          topSpender = { nickname: m.nickname, paid, pct: Math.round((paid / totalSpendVal) * 100) };
        }
      });
    }

    // Settlements simplification
    const debtors = [];
    const creditors = [];
    if (computedStats.balances) {
      members.forEach(m => {
        const bal = computedStats.balances[m.uid] || 0;
        const roundedBal = Math.round(bal * 100) / 100;
        if (roundedBal < -0.05) {
          debtors.push({ uid: m.uid, nickname: m.nickname, amount: -roundedBal });
        } else if (roundedBal > 0.05) {
          creditors.push({ uid: m.uid, nickname: m.nickname, amount: roundedBal });
        }
      });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let dIdx = 0;
    let cIdx = 0;

    const debtorsCopy = debtors.map(d => ({ ...d }));
    const creditorsCopy = creditors.map(c => ({ ...c }));

    while (dIdx < debtorsCopy.length && cIdx < creditorsCopy.length) {
      const debtor = debtorsCopy[dIdx];
      const creditor = creditorsCopy[cIdx];
      const amountToSettle = Math.min(debtor.amount, creditor.amount);

      if (amountToSettle > 0.05) {
        settlements.push({
          from: debtor.nickname,
          fromUid: debtor.uid,
          to: creditor.nickname,
          toUid: creditor.uid,
          amount: amountToSettle
        });
      }

      debtor.amount -= amountToSettle;
      creditor.amount -= amountToSettle;

      if (debtor.amount <= 0.05) dIdx++;
      if (creditor.amount <= 0.05) cIdx++;
    }

    const handleQuickSettle = (fromUid, toUid, amount) => {
      setSettlePayer(fromUid);
      setSettleReceiver(toUid);
      setSettleAmount(Number(amount).toFixed(2));
      setIsDiamondModalOpen(false);
      setIsSettleModalOpen(true);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-fade-in">
        <div className="bg-slate-900 border border-amber-500/20 dark:border-amber-500/30 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col transition-colors duration-300 text-slate-100">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center rotate-45">
                  <Sparkles className="w-4 h-4 text-amber-400 -rotate-45" />
                </div>
              </div>
              <div>
                <span className="text-[9px] tracking-widest font-black uppercase text-amber-500 block">TALLYIN DIAMOND</span>
                <h2 className="font-extrabold text-base sm:text-lg text-white mt-0.5">VIP Room Insights</h2>
              </div>
            </div>
            <button 
              onClick={() => setIsDiamondModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-850 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            
            {transactions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-white">No data to analyze</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add some transaction records or invite roommates to generate Diamond VIP financial summaries and AI observations.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
                    <span className="text-lg font-black text-amber-400 block">{formatINR(totalSpendVal)}</span>
                    <span className="text-[9px] text-slate-500 block">Shared + Personal</span>
                  </div>
                  
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Busiest Day</span>
                    <span className="text-lg font-black text-white block">{busiestDay}</span>
                    <span className="text-[9px] text-slate-500 block">Highest frequency</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Bill Size</span>
                    <span className="text-lg font-black text-white block">{formatINR(avgTxValue)}</span>
                    <span className="text-[9px] text-slate-500 block">Per transaction</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Top Spender</span>
                    <span className="text-lg font-black text-emerald-450 block truncate" title={topSpender ? `${topSpender.nickname} paid ${topSpender.paid}` : ''}>
                      {topSpender ? topSpender.nickname : 'N/A'}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {topSpender ? `Covered ${topSpender.pct}%` : 'No members'}
                    </span>
                  </div>
                </div>

                {/* 2. Simplified settlements */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Debt Settlement Plan</h4>
                  {settlements.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold py-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span>All settled up! No roommate payments are currently outstanding.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {settlements.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-850 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-rose-400">{s.from}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-emerald-400">{s.to}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-white">{formatINR(s.amount)}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickSettle(s.fromUid, s.toUid, s.amount)}
                              className="px-2.5 py-1 text-[10px] bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-lg transition-all"
                            >
                              Settle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Category distribution */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category Breakdown</h4>
                  <div className="space-y-3">
                    {categoryBreakdown.map(({ category, amount }) => {
                      const pct = totalSpendVal > 0 ? Math.round((amount / totalSpendVal) * 100) : 0;
                      return (
                        <div key={category} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200">{category}</span>
                            <span className="font-bold text-slate-400">{formatINR(amount)} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. AI Observations */}
                <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-2 text-amber-400">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <h4 className="text-[10px] font-black uppercase tracking-wider">Smart Roommate Insights</h4>
                  </div>
                  
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                    {totalSpendVal > monthlyBudget && (
                      <li className="text-rose-400/90 font-medium">
                        Budget Alert: The room is currently over budget by <span className="font-bold">{formatINR(totalSpendVal - monthlyBudget)}</span>. Consider freezing non-essential communal purchases.
                      </li>
                    )}
                    {categoryBreakdown.length > 0 && (
                      <li>
                        Communal Spending: <span className="font-bold text-white">{categoryBreakdown[0].category}</span> represents the largest spending category in your workspace, accounting for <span className="font-bold text-amber-400">{Math.round((categoryBreakdown[0].amount / totalSpendVal) * 100)}%</span> of the total budget.
                      </li>
                    )}
                    {topSpender && topSpender.pct > 50 && (
                      <li>
                        Spender Badge: <span className="font-bold text-white">{topSpender.nickname}</span> has paid more than half of all communal expenses. You should consider settling up soon to ease their cash flow.
                      </li>
                    )}
                    <li>
                      Room Activity: The most active day for transaction registration is <span className="font-bold text-white">{busiestDay}</span>.
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* VIP Footer Badge */}
            <div className="text-center py-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                👑 VIP Member Workspace
              </span>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // QR SCANNER (html5-qrcode powered)
  // ==========================================
  function renderQrScanner() {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300 text-center">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Scan Room QR</h3>
            <button
              onClick={() => {
                if (qrScannerRef.current) {
                  qrScannerRef.current.stop().catch(() => {});
                  qrScannerRef.current = null;
                }
                setIsQrScannerOpen(false);
              }}
              className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scanner viewport */}
          <QrScannerMount
            onScan={(code) => {
              // Extract room code from link or use raw code
              let roomCode = code;
              try {
                const url = new URL(code);
                const joinParam = url.searchParams.get('join');
                if (joinParam) roomCode = joinParam.trim().toUpperCase();
              } catch {
                // Scanned code is not a URL, fall back to using the raw code string
                roomCode = code;
              }
              if (qrScannerRef.current) {
                qrScannerRef.current.stop().catch(() => {});
                qrScannerRef.current = null;
              }
              setIsQrScannerOpen(false);
              setJoinInput(roomCode);
              triggerToast(`Room code scanned: ${roomCode}`);
            }}
            onError={(err) => console.warn('QR scan error:', err)}
            scannerRef={qrScannerRef}
          />

          <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed max-w-[240px] mx-auto">
            Point your camera at the room QR code. Camera access required.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NICKNAME PROMPT MODAL
  // ==========================================
  function renderNicknamePromptModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 text-left transition-colors duration-300">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Set Display Name</h3>
            <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">Please choose a nickname so your roommates know who you are.</p>
          </div>
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Your nickname (e.g. Sampath)"
              value={nicknameInput === 'You' ? '' : nicknameInput}
              onChange={(e) => {
                setNicknameInput(e.target.value);
                setUserNickname(e.target.value);
                localStorage.setItem('userNickname', e.target.value);
              }}
              className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setNicknamePromptAction(null)}
              className="flex-1 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!nicknameInput.trim() || nicknameInput === 'You') {
                  triggerToast('Please enter a valid display name.');
                  return;
                }
                const action = nicknamePromptAction;
                setNicknamePromptAction(null);
                if (action === 'create') {
                  await handleCreateRoom();
                } else if (action === 'join') {
                  await handleJoinRoom();
                }
              }}
              className="flex-1 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm text-center"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

}
