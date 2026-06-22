import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Home as HomeIcon, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
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
  ChevronRight, 
  Info,
  DollarSign,
  AlertCircle,
  HelpCircle,
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
  QrCode,
  Share2,
  ScanLine,
  Bell,
  Mail,
  Pencil,
  Trash2
} from 'lucide-react';

import { supabase } from './supabase';

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
      (errorMsg) => { if (onError) onError(errorMsg); }
    ).catch((err) => {
      console.error('QR scanner start error:', err);
      if (onError) onError(err);
    });
    return () => {
      scanner.stop().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-64 h-64 mx-auto rounded-2xl border-2 border-[#1A3827] dark:border-[#A3E635] overflow-hidden bg-slate-950">
      <div id={mountId} className="absolute inset-0 w-full h-full" />
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#A3E635] z-10 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#A3E635] z-10 pointer-events-none" />
      {/* Scan line */}
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

  const auth = {
    get currentUser() {
      return user ? {
        id: user.id,
        uid: user.id,
        photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'You'
      } : null;
    }
  };

  // Room members & settings
  const [members, setMembers] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem('monthlyBudget')) || 22000);
  const [personalCap, setPersonalCap] = useState(() => Number(localStorage.getItem('personalCap')) || 10000);
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
  const [joinInput, setJoinInput] = useState('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState('code'); // 'code' | 'qr' | 'link'
  const [deepLinkRoomCode, setDeepLinkRoomCode] = useState(null); // set when ?join= param detected
  const qrScannerRef = useRef(null);

  // Responsive drawer menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dropdown & Modal toggles
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageRoomOpen, setIsManageRoomOpen] = useState(false);
  const [isSettleModalOpen2, setIsSettleModalOpen2] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

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
  const [roommateOnline, setRoommateOnline] = useState(true);
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(() => localStorage.getItem('userNickname') || 'You');
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [settingsRoomNameInput, setSettingsRoomNameInput] = useState(() => localStorage.getItem('roomName') || 'Tallyin');
  const [nicknamePromptAction, setNicknamePromptAction] = useState(null); // null | 'create' | 'join'
  const [onboardingStep, setOnboardingStep] = useState('selection'); // 'selection' | 'room-name' | 'room-budget' | 'share-code'
  const [activityLogs, setActivityLogs] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));

  // Notification Config States
  const [notificationMethod, setNotificationMethod] = useState(() => localStorage.getItem('notificationMethod') || 'none');
  const [recipientEmails, setRecipientEmails] = useState(() => localStorage.getItem('recipientEmails') || '');
  const [emailJsServiceId, setEmailJsServiceId] = useState(() => localStorage.getItem('emailJsServiceId') || '');
  const [emailJsTemplateId, setEmailJsTemplateId] = useState(() => localStorage.getItem('emailJsTemplateId') || '');
  const [emailJsPublicKey, setEmailJsPublicKey] = useState(() => localStorage.getItem('emailJsPublicKey') || '');
  const [googleScriptUrl, setGoogleScriptUrl] = useState(() => localStorage.getItem('googleScriptUrl') || '');
  
  // File upload reference
  const fileInputRef = useRef(null);
  
  // Room code copying
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3000);
  };

  // New Transaction Form State
  const [formFor, setFormFor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState('2026-06-21');
  const [formWho, setFormWho] = useState('Shared'); 
  const [formRepeat, setFormRepeat] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);

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
    ]
  };

  const smartDetectCategory = (title) => {
    const lower = title.toLowerCase().trim();
    if (!lower) return null;
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

  const fetchUserRooms = async () => {
    if (!user) return;
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
    } catch (err) {
      console.warn("Error fetching user rooms:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRooms();
    } else {
      setUserRooms([]);
    }
  }, [user, userRoomId]);

  // Helper to add member to room in Supabase
  const addMemberToRoom = async (roomId, nickname, currentUserObj = null) => {
    const activeUser = currentUserObj || user;
    if (!activeUser) return;
    try {
      const avatarUrl = activeUser.user_metadata?.avatar_url || '';
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
  };

  const handleAuthUser = async (currentUser) => {
    const cachedNickname = localStorage.getItem('userNickname');
    const displayName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
    const finalNickname = cachedNickname && cachedNickname !== 'You' ? cachedNickname : (displayName || 'You');
    setUserNickname(finalNickname);
    setNicknameInput(finalNickname);
    localStorage.setItem('userNickname', finalNickname);

    // Load room ID from localStorage if available, otherwise fetch from Supabase
    const localRoomId = localStorage.getItem('userRoomId');
    if (localRoomId) {
      setUserRoomId(localRoomId);
      addMemberToRoom(localRoomId, finalNickname, currentUser);
    } else {
      try {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('room_id')
          .eq('uid', currentUser.id)
          .maybeSingle();

        if (!error && userProfile?.room_id) {
          const rId = userProfile.room_id;
          setUserRoomId(rId);
          localStorage.setItem('userRoomId', rId);
          addMemberToRoom(rId, finalNickname, currentUser);
        }
      } catch (e) {
        console.error('Error fetching user room ID:', e);
      }
    }
    setAuthLoading(false);
  };

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
        setHasConfirmedRoom(false);
        setAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Deep-link invite handler: parse ?join=ROOM-CODE from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.trim()) {
      const code = joinCode.trim().toUpperCase();
      setJoinInput(code);
      setDeepLinkRoomCode(code);
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

  // Initialize and reset Add Expense Form when opened
  useEffect(() => {
    if (isAddExpenseOpen) {
      if (editingTransaction) {
        // Populating for edit mode
        setFormFor(editingTransaction.title);
        setFormAmount(editingTransaction.amount.toString());
        setFormCategory(editingTransaction.category);
        setFormDate(editingTransaction.date);
        setFormPaidBy(editingTransaction.paidByUid || (auth.currentUser?.uid || 'anonymous'));
        setSplitType(editingTransaction.splitType || 'equal');
        
        // Populate selected splits and custom values
        const initialSplits = {};
        const initialCustomValues = {};
        if (editingTransaction.splits && Array.isArray(editingTransaction.splits)) {
          members.forEach(m => {
            initialSplits[m.uid] = editingTransaction.splits.some(s => s.uid === m.uid);
          });
          editingTransaction.splits.forEach(s => {
            initialCustomValues[s.uid] = s.amount;
          });
        } else {
          members.forEach(m => {
            initialSplits[m.uid] = true;
          });
        }
        setSelectedSplitMembers(initialSplits);
        setCustomSplitValues(initialCustomValues);
      } else {
        // Initialize default paid by if not set
        if (!formPaidBy) {
          const currentUid = auth.currentUser?.uid || 'anonymous';
          if (members.some(m => m.uid === currentUid)) {
            setFormPaidBy(currentUid);
          } else if (members.length > 0) {
            setFormPaidBy(members[0].uid);
          } else {
            setFormPaidBy(currentUid);
          }
        }
        
        // Initialize splits to true if they are empty
        if (Object.keys(selectedSplitMembers).length === 0) {
          const initialSplits = {};
          members.forEach(m => {
            initialSplits[m.uid] = true;
          });
          setSelectedSplitMembers(initialSplits);
        }
      }
    }
  }, [isAddExpenseOpen, members, editingTransaction]);

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

  const fetchTransactions = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('room_id', roomId)
        .order('date', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(t => ({
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
        splitType: t.split_type,
        split: t.split,
        splits: t.splits,
        createdBy: t.created_by
      }));
      setTransactions(mapped);
      setIsDbSynced(true);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setIsDbSynced(false);
    }
  };

  const fetchActivityLogs = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (err) {
      console.warn("Error fetching activity logs:", err);
    }
  };

  const fetchReceipts = async (roomId) => {
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
        rotation: r.rotation
      }));
      setReceipts(mappedReceipts);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const fetchRoomSettings = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('monthly_budget, name')
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

      if (data.monthly_budget) {
        setMonthlyBudget(Number(data.monthly_budget));
        localStorage.setItem('monthlyBudget', data.monthly_budget);
      }
      if (data.name) {
        setRoomName(data.name);
        setSettingsRoomNameInput(data.name);
        localStorage.setItem('roomName', data.name);
      }
    } catch (err) {
      console.warn("Room settings fetch error:", err);
    }
  };

  const fetchMembers = async (roomId) => {
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
  };

  // Supabase Real-time Sync
  useEffect(() => {
    if (!user || !userRoomId) return;

    fetchTransactions(userRoomId);
    fetchReceipts(userRoomId);
    fetchRoomSettings(userRoomId);
    fetchMembers(userRoomId);
    fetchActivityLogs(userRoomId);

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
      supabase.removeChannel(channel);
    };
  }, [user, userRoomId]);

  // Login handler
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
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

  // Delete Room handler
  const handleDeleteRoom = async () => {
    if (!userRoomId) return;
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
      triggerToast('Room deleted. Redirected to onboarding.');
    } catch (err) {
      console.error('Delete room error:', err);
      triggerToast('Failed to fully delete room data from server, cleared locally.');
      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setTransactions([]);
      setReceipts([]);
      setMembers([]);
      localStorage.removeItem('userRoomId');
      await fetchUserRooms();
    }
  };

  // Remove member from room
  const handleRemoveMember = async (memberUid) => {
    if (!userRoomId) return;
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
      setUserRoomId(null);
      localStorage.removeItem('userRoomId');
      setHasConfirmedRoom(false);
      triggerToast('Signed out successfully.');
    } catch (err) {
      console.error(err);
      triggerToast(`Sign out failed: ${err.message}`);
    }
  };

  const handleEditTransaction = (tx) => {
    const canEdit = !tx.createdBy || tx.createdBy === 'anonymous' || tx.createdBy === user?.id;
    if (!canEdit) {
      triggerToast('You are not authorized to edit this expense. Only the creator can edit it.');
      return;
    }
    setEditingTransaction(tx);
    setIsAddExpenseOpen(true);
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
    const data = transactions;
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';

    // Calculate totals
    let totalSpend = 0;
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
      sharedSpend,
      personalSpend,
      balances: roomBalances,
      currentUserBalance,
      totalCount: data.length,
      juneSpend: totalSpend,
      totalShared: sharedSpend,
      personalPaidAlex: personalSpend
    };
  }, [transactions, members, userNickname]);

  // Subtitle helper for ledger displays
  const getTransactionSubtitle = (t) => {
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
    const payerName = t.paidByUid === currentUid ? 'You' : t.paidBy;
    
    let splitText = '';
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
      if (t.splitType === 'equal') splitText = 'split equally';
      else if (t.splitType === 'percentage') splitText = 'split by %';
      else if (t.splitType === 'amount') splitText = 'split by amount';
      else splitText = 'shared';
    } else {
      splitText = t.isShared ? 'split equally' : 'personal';
    }
    
    return `${payerName} paid • ${splitText}`;
  };

  // Copy Room Code Helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userRoomId || roomCode);
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
    let splitLabel = 'Shared';
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
            split_type: newPayload.splitType,
            split: newPayload.split,
            splits: newPayload.splits
          })
          .eq('id', editingTransaction.id);

        if (txError) throw txError;
        
        await logActivity('edit', `${userNickname} edited expense "${newPayload.title}" to ₹${newPayload.amount}`);
        triggerToast("Expense updated successfully!");
        
        // Reset Form
        setFormFor('');
        setFormAmount('');
        setFormCategory('Food');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormWho('Shared');
        setFormRepeat(false);
        setSuggestedCategory(null);
        setEditingTransaction(null);
        setIsAddExpenseOpen(false);
      } catch (error) {
        console.error("Error updating transaction:", error);
        triggerToast(`Failed to update: ${error.message}`);
      }
    } else {
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
            splits: newPayload.splits,
            created_by: user ? user.id : 'anonymous'
          });

        if (txError) throw txError;

        await logActivity('create', `${userNickname} added expense "${newPayload.title}" (₹${newPayload.amount})`);

        if (formWho === 'Shared') {
          const bgColors = [
            'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
            'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
            'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
            'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
          ];
          const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
          const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
          const randomRot = rotations[Math.floor(Math.random() * rotations.length)];
          
          const { error: receiptError } = await supabase
            .from('receipts')
            .insert({
              room_id: currentRoom,
              title: formFor,
              amount: amountNum,
              category: formCategory,
              date: new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' }),
              bg_class: randomBg,
              rotation: randomRot
            });
          
          if (receiptError) throw receiptError;
        }

        // Send client-side email notifications if configured
        if (notificationMethod !== 'none' && recipientEmails) {
          sendEmailNotification(newPayload);
          triggerToast(`Added expense! 📧 Email notification sent.`);
        } else {
          triggerToast("Added expense!");
        }

        // Reset Form
        setFormFor('');
        setFormAmount('');
        setFormCategory('Food');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormWho('Shared');
        setFormRepeat(false);
        setSuggestedCategory(null);
        setEditingTransaction(null);
        setIsAddExpenseOpen(false);
      } catch (error) {
        console.error(error);
        setTransactions([{ id: Date.now().toString(), ...newPayload }, ...transactions]);
        if (notificationMethod !== 'none' && recipientEmails) {
          triggerToast(`Failed to save: ${error.message || 'database error'}. 📧 Notification queued.`);
        } else {
          triggerToast(`Failed to save: ${error.message || 'database error'}.`);
        }
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
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = file.name.split('.')[0] || "Uploaded Receipt";
    const enteredAmount = prompt(`Confirm amount for receipt "${title}":`, "1240");
    if (enteredAmount === null) return; 

    const amountNum = parseFloat(enteredAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast("Invalid receipt amount.");
      return;
    }

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
      rotation: randomRot
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
          rotation: newReceipt.rotation
        });

      if (uploadError) throw uploadError;
      triggerToast(`Receipt uploaded! 📧 Notification sent to roommates.`);
    } catch (err) {
      console.error(err);
      setReceipts([newReceipt, ...receipts]);
      triggerToast(`Failed to upload: ${err.message || 'database error'}`);
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
      } catch (err) {
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
      default:
        return <CategoryIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Helper to format currency
  const formatINR = (val) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // CSV Export Handler
  const exportToCSV = (list = null) => {
    try {
      const dataList = list || filteredTransactions;
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
      const dataList = list || filteredTransactions;
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
      const dataList = list || filteredTransactions;
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
  const currentUid = auth.currentUser?.uid || 'anonymous';
  const activeTxList = transactions.filter(t => {
    if (t.isShared) return true; // always show shared bills
    // For personal expenses: hide if the expense belongs solely to the current user
    const isMineOnly =
      t.splits &&
      Array.isArray(t.splits) &&
      t.splits.length === 1 &&
      t.splits[0]?.uid === currentUid;
    return !isMineOnly; // show only if it's someone else's personal expense
  });
  const filteredTransactions = useMemo(() => {
    return activeTxList.filter(t => {
      const titleStr = t.title || '';
      const categoryStr = t.category || '';
      const matchesSearch = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            categoryStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesMonth = selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth));
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [activeTxList, searchQuery, categoryFilter, selectedMonth]);

  // Personal expenses memo (isShared is false, split only with self)
  const myPersonalExpenses = useMemo(() => {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    return transactions.filter(t => {
      return t.isShared === false && 
             t.splits && 
             Array.isArray(t.splits) && 
             t.splits.length === 1 && 
             t.splits[0] && 
             t.splits[0].uid === currentUid;
    });
  }, [transactions, auth.currentUser?.uid]);

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
            <div className="w-14 h-14 bg-[#EAF0EC] dark:bg-slate-800 border border-[#1A3827]/10 dark:border-slate-700 rounded-2xl flex items-center justify-center font-black text-2xl text-[#1A3827] dark:text-[#A3E635] mx-auto shadow-sm">
              T
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">Tallyin</h1>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold uppercase tracking-wider">YouthFirst Roommate Expense Tracker</p>
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
            <div className="w-12 h-12 bg-[#EAF0EC] dark:bg-slate-800 border border-[#1A3827]/10 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-xl text-[#1A3827] dark:text-[#A3E635] mx-auto shadow-sm">
              T
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Set up your shared space</h1>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-bold uppercase tracking-wider">YouthFirst Tallyin Onboarding</p>
            </div>
          </div>

          {/* Wizard step: selection */}
          {onboardingStep === 'selection' && (
            <div className="space-y-5">
              {/* Nickname input */}
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
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">This is how you'll appear to roommates.</p>
              </div>

              {userRoomId && (
                <div className="border border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/20 dark:bg-[#A3E635]/5 rounded-2xl p-4 flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <span className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Active Room</span>
                    <p className="font-mono text-xs font-bold text-[#1A3827] dark:text-slate-100 mt-1">Code: {userRoomId}</p>
                  </div>
                  <button 
                    onClick={() => setHasConfirmedRoom(true)}
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
                    setOnboardingStep('join-room');
                  }}
                  className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 hover:border-[#1A3827]/25 dark:hover:border-slate-700 hover:bg-[#F6F8F6]/20 dark:hover:bg-slate-800/10 transition-all flex flex-col items-center justify-center gap-2 text-center text-xs font-bold text-[#1A3827] dark:text-slate-200"
                >
                  <UserCheck className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635]" />
                  <span>Join Room</span>
                </button>
              </div>

              {userRooms.length > 0 && (
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
                            setRoomName(r.roomName);
                            localStorage.setItem('roomName', r.roomName);
                            setMonthlyBudget(r.monthlyBudget);
                            localStorage.setItem('monthlyBudget', r.monthlyBudget);
                            setHasConfirmedRoom(true);
                            triggerToast(`Entered room: ${r.roomName}`);
                            
                            if (user) {
                              await supabase
                                .from('users')
                                .upsert({
                                  uid: user.id,
                                  room_id: r.roomId,
                                  updated_at: new Date().toISOString()
                                }, { onConflict: 'uid' });
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
              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/15 dark:border-slate-800 rounded-2xl p-5 text-center space-y-2">
                <p className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Your Room Code</p>
                <p className="font-mono font-black text-2xl text-[#1A3827] dark:text-[#A3E635] tracking-widest select-all">{userRoomId}</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  Share this code with your roommate. They open Tallyin → Join Room → enter code.
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

  // Helper Components for ErrorBoundary to catch rendering exceptions
  const HomeView = () => renderHome();
  const LedgerView = () => renderLedger();
  const PersonalExpensesView = () => renderPersonalExpenses();
  const InsightsView = () => renderInsights();
  const ReceiptsView = () => renderReceipts();
  const SettingsView = () => renderSettings();

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
              <div className="w-10 h-10 bg-[#EAF0EC] dark:bg-slate-800 border border-[#1A3827]/10 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-xl text-[#1A3827] dark:text-[#A3E635]">
                T
              </div>
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
            <div className="mb-6 space-y-1">
              <label className="text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block font-sans">Active Workspace</label>
              <select
                value={userRoomId || ''}
                onChange={async (e) => {
                  const selectedRoomId = e.target.value;
                  const selectedRoom = userRooms.find(r => r.roomId === selectedRoomId);
                  if (selectedRoom) {
                    setUserRoomId(selectedRoomId);
                    localStorage.setItem('userRoomId', selectedRoomId);
                    setRoomName(selectedRoom.roomName);
                    localStorage.setItem('roomName', selectedRoom.roomName);
                    setMonthlyBudget(selectedRoom.monthlyBudget);
                    localStorage.setItem('monthlyBudget', selectedRoom.monthlyBudget);
                    setHasConfirmedRoom(true);
                    triggerToast(`Switched to room: ${selectedRoom.roomName}`);
                    
                    if (user) {
                      await supabase
                        .from('users')
                        .upsert({
                          uid: user.id,
                          room_id: selectedRoomId,
                          updated_at: new Date().toISOString()
                        }, { onConflict: 'uid' });
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'personal-expenses' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>Personal Expenses</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full">
                {myPersonalExpenses.length}
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
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 ${isSelf ? 'bg-[#1A3827]' : 'bg-pink-400'}`}>
                      {m.nickname ? m.nickname.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#1A3827] dark:text-slate-100 truncate">{m.nickname}{isSelf ? ' (You)' : ''}</p>
                    </div>
                    {isSelf && <span className="text-[8px] font-bold text-[#1A3827] dark:text-[#A3E635] bg-[#EAF0EC] dark:bg-slate-700 px-1.5 py-0.5 rounded-full">Host</span>}
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
      <div className="flex-1 flex flex-col pl-0 md:pl-64 min-h-screen">
        
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
              <div className="p-2 bg-[#EAF0EC] dark:bg-slate-800 rounded-lg hidden sm:block">
                <HouseIcon className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
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
              onClick={() => triggerToast('Tallyin Diamond is active! VIP benefits enabled.')}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-amber-500 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Diamond Membership Status"
            >
              <div className="w-4 h-4 border border-[#5C6E5C] dark:border-slate-700 hover:border-amber-500 rotate-45 flex items-center justify-center relative">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute"></span>
              </div>
            </button>

            {/* Profile widget */}
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 border-l border-[#E3E8E3] dark:border-slate-800 pl-2 sm:pl-4 cursor-pointer select-none hover:opacity-80 py-1"
            >
              {user && user.photoURL ? (
                <img 
                  src={user.photoURL} 
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
            {currentView === 'home' && <HomeView />}
            {currentView === 'ledger' && <LedgerView />}
            {currentView === 'personal-expenses' && <PersonalExpensesView />}
            {currentView === 'insights' && <InsightsView />}
            {currentView === 'receipts' && <ReceiptsView />}
            {currentView === 'settings' && <SettingsView />}
          </ErrorBoundary>
        </main>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-6 right-6 z-30">
          <button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 bg-[#A3E635] text-[#1A3827] font-bold px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-lg shadow-lime-900/10 hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 border border-[#84CC16]"
            id="fab-quick-add"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span className="text-xs sm:text-sm">Quick add</span>
          </button>
        </div>

        {/* Add Expense Modal Overlay */}
        {isAddExpenseOpen && renderAddExpenseModal()}
        
        {/* Custom Invite Roommate Share Modal */}
        {isInviteModalOpen && renderInviteModal()}

        {/* Settle Up Modal */}
        {isSettleModalOpen && renderSettleModal()}

        {/* Manage Room Modal */}
        {isManageRoomOpen && renderManageRoomModal()}
        {nicknamePromptAction && renderNicknamePromptModal()}
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

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Good afternoon, {userNickname.split(' ')[0]}.</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Everything looks calm in your room today.</p>
          </div>
          <button 
            onClick={() => setIsAddExpenseOpen(true)}
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
                    <div key={m.uid} className="flex justify-between items-center text-xs font-semibold py-1 border-b border-white/5 last:border-b-0">
                      <span className="text-white/80">{m.nickname}</span>
                      <span className={bal > 0 ? 'text-[#A3E635] font-bold' : bal < 0 ? 'text-rose-400 font-bold' : 'text-white/40'}>
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
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">{t.title}</h4>
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
              const budgetPct = Math.min(100, Math.round((computedStats.totalSpend / monthlyBudget) * 100)) || 0;
              const remaining = Math.max(0, monthlyBudget - computedStats.totalSpend);
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
                      <span className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(computedStats.totalSpend)}</span>
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
                        {isOver ? `Exceeded by ${formatINR(computedStats.totalSpend - monthlyBudget)}.` : `Keep daily spend under ${formatINR(dailyLimit)} to stay on budget.`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom: Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-xs sm:text-sm tracking-widest uppercase">Quick actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsAddExpenseOpen(true)}
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
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport'];
    
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
              onClick={() => { setEditingTransaction(null); setIsAddExpenseOpen(true); }}
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
              className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-955"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-none border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
              ))}
            </select>

            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 md:flex-none border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
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

            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setSelectedMonth(new Date().toISOString().substring(0, 7));
                triggerToast('Search filter reset.');
              }}
              className="bg-[#1A3827] dark:bg-slate-800 text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">{activeMonthLabel} SPEND</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(totalFilteredSpend)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">SHARED</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(totalFilteredShared)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">PERSONAL</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(totalFilteredPersonal)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">TRANSACTIONS</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{filteredTransactions.length}</p>
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
                  <div key={t.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-[#F6F8F6]/30 dark:hover:bg-slate-800/10 transition-all duration-100">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center border border-[#E3E8E3]/20 shrink-0">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">{t.title}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                          <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                            {t.category}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold truncate">
                            {getTransactionSubtitle(t)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className={`font-black text-xs sm:text-sm ${t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? 'text-red-700 dark:text-rose-500' : 'text-[#1A3827] dark:text-[#A3E635]'}`}>
                          {t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? '-' : '+'}{formatINR(t.amount)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 justify-end text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                          <Calendar className="w-3 h-3 hidden sm:block" />
                          <span>{t.date}</span>
                        </div>
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1.5 border-l border-slate-150 dark:border-slate-800 pl-3">
                          <button 
                            onClick={() => handleEditTransaction(t)}
                            className="p-1.5 text-slate-500 hover:text-[#1A3827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(t)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
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
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport'];
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Personal expenses</h1>
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
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">
                Expense Meter — {selectedMonth === 'All' ? 'All Time' : (() => {
                  const [year, month] = activeMonth.split('-');
                  const dateObj = new Date(Number(year), Number(month) - 1, 1);
                  return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                })()}
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">
                {formatINR(monthlyPersonalTotal)} / {formatINR(personalCap)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
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
          
          <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-[#E3E8E3]/50 dark:border-slate-800">
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
              className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-955"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-none border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 md:flex-none border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
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

            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setSelectedMonth(new Date().toISOString().substring(0, 7));
                triggerToast('Search filter reset.');
              }}
              className="bg-[#1A3827] dark:bg-slate-800 text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all"
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
                  <div key={t.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-[#F6F8F6]/30 dark:hover:bg-slate-800/10 transition-all duration-100">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center border border-[#E3E8E3]/20 shrink-0">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">{t.title}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                          <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                            {t.category}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold truncate">
                            Paid by {t.paidByUid === auth.currentUser?.uid ? 'You' : t.paidBy}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-xs sm:text-sm text-red-700 dark:text-rose-500">
                          -{formatINR(t.amount)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 justify-end text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                          <Calendar className="w-3 h-3 hidden sm:block" />
                          <span>{t.date}</span>
                        </div>
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1.5 border-l border-slate-150 dark:border-slate-800 pl-3">
                          <button 
                            onClick={() => handleEditTransaction(t)}
                            className="p-1.5 text-slate-500 hover:text-[#1A3827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(t)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
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
              <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">NEW TRANSACTION</p>
              <h2 className="font-extrabold text-lg sm:text-xl text-[#1A3827] dark:text-slate-100 mt-0.5">Add an expense</h2>
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
                      <div className="w-6 h-6 rounded-full bg-[#1A3827] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                        {m.nickname?.charAt(0).toUpperCase()}
                      </div>
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
                Add expense
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
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">Settle Up</h3>
            <button onClick={() => setIsSettleModalOpen(false)} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
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
                  type="number" min="1" required
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
    const currentUid = auth.currentUser?.uid || 'anonymous';
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300">
          <div className="px-6 py-4 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">Manage Room</h3>
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
                    return (
                      <div key={m.uid} className="flex items-center gap-3 p-3 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 ${isSelf ? 'bg-[#1A3827]' : 'bg-pink-400'}`}>
                          {m.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#1A3827] dark:text-slate-100 truncate">{m.nickname}</p>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-mono truncate">{isSelf ? 'You' : m.uid?.substring(0,8) + '...'}</p>
                        </div>
                        {isSelf ? (
                          <span className="text-[9px] font-black text-[#1A3827] dark:text-[#A3E635] bg-[#EAF0EC] dark:bg-slate-700 px-2 py-1 rounded-full uppercase">You</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveMember(m.uid)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                            title={`Remove ${m.nickname}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Budget Setting */}
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
                  className="flex-1 px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
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
                      } catch(e) {
                        triggerToast('Budget saved locally.');
                      }
                    } else {
                      triggerToast('Budget saved locally.');
                    }
                  }}
                  className="px-3 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl text-xs font-bold hover:opacity-90 shrink-0"
                >Save</button>
              </div>
            </div>

            {/* Danger Zone */}
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
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 4: SPENDING INSIGHTS
  // ==========================================
  function renderInsights() {
    // Compute real category breakdown from actual transactions
    const CATEGORY_COLORS = {
      'Rent': '#1A3827', 'Food': '#FBBF24', 'Groceries': '#22C55E',
      'Utilities': '#3B82F6', 'Shopping': '#F43F5E', 'Transport': '#8B5CF6',
      'Fuel': '#F97316', 'Entertainment': '#EC4899', 'Medical': '#14B8A6',
      'Payment': '#6366F1', 'Other': '#94A3B8'
    };
    const catMap = {};
    transactions.forEach(t => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
    });
    const rawTotal = computedStats.totalSpend;          // real total, may be 0
    const total = rawTotal > 0 ? rawTotal : 1;           // safe divisor for percentages only
    const catArr = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const circumference = 2 * Math.PI * 40; // 251.3
    let cumulativePct = 0;
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();
    const dailyAvg = rawTotal > 0 && daysPassed > 0 ? Math.round(rawTotal / daysPassed) : 0;
    const budgetRemaining = Math.max(0, monthlyBudget - rawTotal);
    const daysLeft = daysInMonth - daysPassed;
    const safeDailyLimit = daysLeft > 0 ? Math.round(budgetRemaining / daysLeft) : 0;
    const myShare = Math.abs(computedStats.currentUserBalance);
    const totalSpendForDisplay = rawTotal;

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">ROOM INTELLIGENCE</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Spending insights</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">A clearer view of where your money goes — powered by real data.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 px-3 py-1.5 rounded-xl">
              {transactions.length} transactions
            </span>
            <span className="text-[10px] font-bold text-[#1A3827] dark:text-[#A3E635] bg-[#EAF0EC] dark:bg-slate-900 border border-[#1A3827]/10 dark:border-slate-800 px-3 py-1.5 rounded-xl">
              {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">TOTAL SPEND</p>
          <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(rawTotal)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">{transactions.length} transactions</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">DAILY AVG</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(dailyAvg)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">Safe limit: {formatINR(safeDailyLimit)}/day</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">SHARED BILLS</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(computedStats.sharedSpend)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">of total room spend</p>
          </div>
          <div className={`border p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300 ${
            computedStats.currentUserBalance >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
          }`}>
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">YOUR BALANCE</p>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${
              computedStats.currentUserBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>{formatINR(myShare)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">
              {computedStats.currentUserBalance > 0 ? 'you are owed' : computedStats.currentUserBalance < 0 ? 'you owe' : 'all settled'}
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
              <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(computedStats.totalSpend)}</p>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1.5 leading-relaxed">All transactions in this room — shared bills <em>and</em> personal expenses combined.</p>
            </div>
            {/* Shared Bills */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Shared Bills</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatINR(computedStats.sharedSpend)}</p>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1.5 leading-relaxed">Expenses split among roommates. These <strong>are counted</strong> in the balance &amp; settlement calculation.</p>
            </div>
            {/* Personal */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Personal (Excluded)</p>
              <p className="text-2xl font-black text-slate-600 dark:text-slate-300">{formatINR(computedStats.personalSpend)}</p>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1.5 leading-relaxed">Your personal expenses logged for tracking only. These are <strong>excluded</strong> from any roommate balance or settlement.</p>
            </div>
          </div>
          {/* Per-member paid row */}
          {members.length > 0 && (
            <div className="mt-4 border-t border-[#F6F8F6] dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest mb-3">Who Paid What (shared bills only)</p>
              <div className="flex flex-wrap gap-3">
                {members.map(m => {
                  const memberSharedPaid = transactions
                    .filter(t => t.isShared && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)))
                    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
                  const bal = computedStats.balances?.[m.uid] || 0;
                  return (
                    <div key={m.uid} className="flex items-center gap-2 bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                        auth.currentUser && m.uid === auth.currentUser.uid ? 'bg-[#1A3827]' : 'bg-pink-400'
                      }`}>{m.nickname?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200">{m.nickname}</p>
                        <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Paid {formatINR(memberSharedPaid)} • <span className={bal >= 0 ? 'text-emerald-600' : 'text-rose-500'}>{bal >= 0 ? `owed ${formatINR(bal)}` : `owes ${formatINR(Math.abs(bal))}`}</span></p>
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
            {transactions.length === 0 ? (
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
                      catArr.map(([cat, amt], i) => {
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
                  const memberPaid = transactions
                    .filter(t => t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname))
                    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
                  const memberPct = rawTotal > 0 ? Math.round((memberPaid / rawTotal) * 100) : 0;
                  const memberBal = computedStats.balances?.[m.uid] || 0;
                  return (
                    <div key={m.uid} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                            auth.currentUser && m.uid === auth.currentUser.uid ? 'bg-[#1A3827]' : 'bg-pink-400'
                          }`}>{m.nickname?.charAt(0).toUpperCase()}</div>
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
                <span>Monthly budget</span>
              <span>{formatINR(rawTotal)} / {formatINR(monthlyBudget)}</span>
              </div>
              <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${rawTotal >= monthlyBudget ? 'bg-rose-500' : 'bg-[#A3E635]'}`}
                  style={{ width: `${Math.min(100, Math.round((rawTotal / monthlyBudget) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                <span>{Math.min(100, Math.round((rawTotal / monthlyBudget) * 100))}% used</span>
                <span>{formatINR(budgetRemaining)} remaining</span>
              </div>
            </div>

            {/* Tip card */}
            <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
              <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400">
                {rawTotal === 0
                  ? '✦ No expenses logged yet. Add your first expense to start tracking!'
                  : rawTotal >= monthlyBudget
                    ? `⚠ Budget exceeded by ${formatINR(rawTotal - monthlyBudget)}. Consider adjusting your limit in Manage Room.`
                    : `✦ Keep daily spend under ${formatINR(safeDailyLimit)} to stay within your ${formatINR(monthlyBudget)} budget.`
                }
              </p>
            </div>
          </div>

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
                className={`rounded-3xl border p-3 sm:p-4 shadow-sm flex flex-col justify-between aspect-square select-none transition-transform duration-300 hover:scale-102 hover:shadow-md cursor-pointer ${r.bgClass}`}
              >
                <div 
                  className={`bg-white text-slate-800 p-3 sm:p-4 border border-slate-200/50 shadow-sm mx-auto w-full aspect-[4/5] flex flex-col justify-between transform transition-all duration-300 hover:rotate-0 hover:scale-102 ${r.rotation}`}
                >
                  <div className="text-center font-mono">
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-500 tracking-wider">TALLYIN REC</p>
                    <p className="text-[10px] sm:text-xs font-black tracking-tight mt-2 uppercase truncate">{r.title}</p>
                    
                    <div className="border-t border-dashed border-slate-300 my-1.5"></div>
                    
                    <p className="text-base sm:text-xl font-black mt-2 text-slate-800">{formatINR(r.amount)}</p>
                  </div>
                  
                  <div className="text-center text-[8px] font-bold text-slate-400 tracking-wide mt-2">
                    <span>SECURE SYNC</span>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="mt-3 sm:mt-4 pt-2 border-t border-black/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[10px] sm:text-xs tracking-tight truncate">{r.title}</h4>
                    <p className="text-[8px] sm:text-[10px] opacity-70 font-semibold mt-0.5 truncate">{r.category} • {r.date}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerToast('Downloading receipt image...');
                    }}
                    className="p-1 rounded-lg hover:bg-black/5 transition-all shrink-0"
                    title="Download receipt details"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

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
                  {userRoomId || roomCode}
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

            {/* Nickname editing */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Your nickname</p>
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
                        if (userRoomId && user) {
                          await addMemberToRoom(userRoomId, nicknameInput);
                        }
                        setIsEditingNickname(false);
                        triggerToast('Nickname updated!');
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
                          } catch (e) {
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
                      } catch(e) {
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
                    const isSelf = auth.currentUser && m.uid === auth.currentUser.uid;
                    return (
                      <div key={m.uid} className="flex items-center gap-3 p-3 bg-[#F6F8F6] dark:bg-slate-950 rounded-xl">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${isSelf ? 'bg-[#1A3827]' : 'bg-pink-400'}`}>
                          {m.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1A3827] dark:text-slate-100 truncate">{m.nickname}{isSelf ? ' (You)' : ''}</p>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'recently'}</p>
                        </div>
                        {!isSelf && (
                          <button onClick={() => handleRemoveMember(m.uid)} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all" title="Remove member">
                            <X className="w-3.5 h-3.5" />
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
                  onClick={exportToCSV}
                  className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all"
                  title="Export detailed CSV file"
                >
                  CSV
                </button>
                <button 
                  onClick={exportToExcel}
                  className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all"
                  title="Export styled Excel spreadsheet"
                >
                  Excel
                </button>
                <button 
                  onClick={exportToPDF}
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
          </div>

          {/* Activity Logs */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Activity Logs
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 italic">No activity logs recorded yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-start gap-2 text-xs border-b border-[#F6F8F6] dark:border-slate-800/50 pb-2 last:border-b-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#1A3827] dark:text-slate-200">{log.details}</p>
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
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 transition-colors duration-300">

          {/* Header */}
          <div className="flex justify-between items-center px-6 pt-6 pb-4">
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
          <div className="flex mx-6 bg-[#F6F8F6] dark:bg-slate-950 rounded-2xl p-1 gap-1">
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

          <div className="px-6 pb-6 pt-4 space-y-4">

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
              } catch {}
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
