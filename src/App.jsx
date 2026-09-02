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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  QrCode,
  Send,
  ArrowRight,
  User,
  Zap,
  Coffee,
  Lightbulb,
  Home as HouseIcon,
  ShoppingCart,
  DollarSign as CategoryIcon,
  Upload,
  UserCheck,
  UserPlus,
  Mail,
  Menu,
  ShieldCheck,
  Share2,
  ScanLine,
  Pencil,
  Trash2,
  Loader,
  Wallet,
  CheckSquare,
  FileSpreadsheet,
  MessageSquare,
  Bell,
  HandCoins,
  CheckCircle2,
  ArrowLeftRight,
  ShieldAlert,
  Pin,
  Radio,
  Activity
} from 'lucide-react';

import { supabase } from './supabase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from './firebase';
import logoIcon from './assets/logo_icon.png';
import logoFull from './assets/logo_full.png';
import faviconLogo from './assets/favicon_logo.png';
import MaintenanceView from './components/MaintenanceView';
import AdminDashboard from './components/AdminDashboard';
import BannedUserView from './components/BannedUserView';
import QuickBillModal from './components/QuickBillModal';

const ADMIN_EMAILS = ['tallyin.alerts@gmail.com'];
const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'v3.1.8';

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
    const errorText = document.createElement('pre');
    errorText.innerText = `🚨 Uncaught Runtime Error:\n\nMessage: ${event.message}\nSource: ${event.filename}:${event.lineno}:${event.colno}\n\nStack Trace:\n${event.error ? event.error.stack : 'No stack trace available'}`;

    const reloadBtn = document.createElement('button');
    reloadBtn.innerText = '🔄 Clear Cache & Load Latest Version';
    reloadBtn.style.display = 'block';
    reloadBtn.style.padding = '10px 16px';
    reloadBtn.style.marginBottom = '16px';
    reloadBtn.style.backgroundColor = '#ffffff';
    reloadBtn.style.color = '#7f1d1d';
    reloadBtn.style.fontWeight = '900';
    reloadBtn.style.borderRadius = '8px';
    reloadBtn.style.border = 'none';
    reloadBtn.style.cursor = 'pointer';
    reloadBtn.onclick = () => {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      window.location.reload(true);
    };

    errorDiv.appendChild(reloadBtn);
    errorDiv.appendChild(errorText);
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
    const errorText = document.createElement('pre');
    errorText.innerText = `🚨 Unhandled Promise Rejection:\n\nReason: ${event.reason}\n\nStack Trace:\n${event.reason && event.reason.stack ? event.reason.stack : 'No stack trace available'}`;

    const reloadBtn = document.createElement('button');
    reloadBtn.innerText = '🔄 Clear Cache & Load Latest Version';
    reloadBtn.style.display = 'block';
    reloadBtn.style.padding = '10px 16px';
    reloadBtn.style.marginBottom = '16px';
    reloadBtn.style.backgroundColor = '#ffffff';
    reloadBtn.style.color = '#7f1d1d';
    reloadBtn.style.fontWeight = '900';
    reloadBtn.style.borderRadius = '8px';
    reloadBtn.style.border = 'none';
    reloadBtn.style.cursor = 'pointer';
    reloadBtn.onclick = () => {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      window.location.reload(true);
    };

    errorDiv.appendChild(reloadBtn);
    errorDiv.appendChild(errorText);
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
    this.state = { hasError: false, error: null, isReporting: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reportIssue = () => {
    const err = this.state.error;
    const subject = encodeURIComponent(`[Tallyin Bug] ${err?.name || 'Error'}`);
    const body = encodeURIComponent(
      `Hi Tallyin Support,\n\nI ran into a bug. Here are the details:\n\n` +
      `Error: ${err?.toString() || 'Unknown'}\n\n` +
      `Stack:\n${err?.stack || 'N/A'}\n\n` +
      `App Version: ${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown'}\n` +
      `Page URL: ${window.location.href}\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `Browser: ${navigator.userAgent}\n\n` +
      `Steps to reproduce:\n[Please describe what you were doing]\n`
    );
    window.open(`mailto:support@tallyin.app?subject=${subject}&body=${body}`, '_blank');
    this.setState({ isReporting: true });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto my-10 bg-red-50 border border-red-200 rounded-2xl dark:bg-red-950/20 dark:border-red-900/30 text-red-800 dark:text-red-300 shadow-lg">
          <h2 className="text-lg font-bold">Something went wrong rendering this view.</h2>
          <p className="text-sm mt-2 font-mono bg-red-100 dark:bg-red-900/40 p-4 rounded-xl overflow-auto max-h-60">
            {this.state.error?.toString()}
          </p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-[#1A3827] text-white hover:bg-[#255038] rounded-xl text-xs font-bold transition-all"
            >
              Try Again
            </button>
            <button
              onClick={this.reportIssue}
              disabled={this.state.isReporting}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                this.state.isReporting
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {this.state.isReporting
                ? <><span>✓</span> Email opened — thank you!</>
                : <><AlertCircle className="w-3 h-3" /> Report Issue</>
              }
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


// Local Timezone-aware date helpers
const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalMonthStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getPreviousMonthStr = (d = new Date()) => {
  const prevDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return getLocalMonthStr(prevDate);
};

const getImages = (imageUrl) => {
  if (!imageUrl) return [];
  if (typeof imageUrl === 'string' && imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  return [imageUrl];
};

const formatLogTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return 'Just now';
  }
};

const mapDbTransaction = (t) => ({
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
  createdBy: t.created_by,
  imageUrl: t.image_url
});

const mapDbReceipt = (r) => ({
  id: r.id,
  title: r.title,
  amount: r.amount,
  category: r.category,
  date: r.date,
  bgClass: r.bg_class,
  rotation: r.rotation,
  imageUrl: r.image_url
});

// Returns true when the data URL represents an image
const isImageDataUrl = (dataUrl) => {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:image/');
};

// Returns true when the data URL represents a PDF
const isPdfDataUrl = (dataUrl) => {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:application/pdf');
};

// Returns true when the data URL represents an Excel spreadsheet
const isExcelDataUrl = (dataUrl) => {
  if (!dataUrl) return false;
  return (
    dataUrl.startsWith('data:application/vnd.ms-excel') ||
    dataUrl.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml') ||
    dataUrl.startsWith('data:application/octet-stream')
  );
};

// Returns a short human-readable label for a data-URL's file type
const getFileLabel = (dataUrl) => {
  if (!dataUrl) return 'File';
  if (isPdfDataUrl(dataUrl)) return 'PDF';
  if (isExcelDataUrl(dataUrl)) return 'Excel';
  return 'File';
};



const parseTimeAndHistory = (timeStr) => {
  if (!timeStr) return { time: '', history: [] };
  const parts = timeStr.split('|');
  if (parts.length > 1) {
    try {
      const parsed = JSON.parse(parts[1]);
      const history = Array.isArray(parsed) ? parsed : [parsed];
      return { time: parts[0], history };
    } catch {
      return { time: parts[0], history: [] };
    }
  }
  return { time: timeStr, history: [] };
};

const detectChanges = (oldTx, newTx, payerNickname, oldImages = [], newImages = []) => {
  const changes = [];
  if (oldTx.title !== newTx.title) {
    changes.push(`Title: '${oldTx.title}' → '${newTx.title}'`);
  }
  if (Number(oldTx.amount) !== Number(newTx.amount)) {
    changes.push(`Total Amount: ₹${oldTx.amount} → ₹${newTx.amount}`);
  }
  if (oldTx.category !== newTx.category) {
    changes.push(`Category: '${oldTx.category}' → '${newTx.category}'`);
  }
  if (oldTx.date !== newTx.date) {
    changes.push(`Date: ${oldTx.date} → ${newTx.date}`);
  }
  if (oldTx.paidByUid !== newTx.paidByUid) {
    changes.push(`Payer: '${oldTx.paidBy}' → '${payerNickname}'`);
  }
  if (oldTx.splitType !== newTx.splitType) {
    changes.push(`Split Type: '${oldTx.splitType || 'equal'}' → '${newTx.splitType || 'equal'}'`);
  }

  // Check receipt file changes — describe by actual file type
  const describeFiles = (files) => {
    if (!files || files.length === 0) return '';
    const hasPdf = files.some(f => isPdfDataUrl(f));
    const hasExcel = files.some(f => isExcelDataUrl(f));
    const hasImage = files.some(f => isImageDataUrl(f));
    const types = [hasPdf && 'PDF', hasExcel && 'Excel', hasImage && 'image'].filter(Boolean);
    const typeLabel = types.length > 1 ? 'file' : (types[0] || 'file');
    return `${files.length} ${typeLabel}(s)`;
  };
  if (oldImages.length === 0 && newImages.length > 0) {
    changes.push(`Added receipt files: ${describeFiles(newImages)}`);
  } else if (oldImages.length > 0 && newImages.length === 0) {
    changes.push('Removed all receipt files');
  } else if (oldImages.length > 0 && newImages.length > 0 && JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
    changes.push(`Updated receipt files: ${describeFiles(newImages)}`);
  }

  // Check split members added/removed
  const oldSplits = oldTx.splits || [];
  const newSplits = newTx.splits || [];

  const oldUids = oldSplits.map(s => s.uid);
  const newUids = newSplits.map(s => s.uid);

  const addedMembers = newSplits.filter(s => !oldUids.includes(s.uid)).map(s => s.nickname || 'Unknown');
  const removedMembers = oldSplits.filter(s => !newUids.includes(s.uid)).map(s => s.nickname || 'Unknown');

  if (addedMembers.length > 0) {
    changes.push(`Added to split: ${addedMembers.join(', ')}`);
  }
  if (removedMembers.length > 0) {
    changes.push(`Removed from split: ${removedMembers.join(', ')}`);
  }

  // Check roommate share adjustments
  newSplits.forEach(newS => {
    const oldS = oldSplits.find(s => s.uid === newS.uid);
    if (oldS && Number(oldS.amount) !== Number(newS.amount)) {
      changes.push(`${newS.nickname || 'User'} share: ₹${oldS.amount} → ₹${newS.amount}`);
    }
  });

  return changes.length > 0 ? changes.join(' | ') : 'No fields changed';
};

const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function App() {
  // Authentication state
  const [user, setUser] = useState(() => {
    const codeUserStr = localStorage.getItem('tallyin_code_user');
    if (codeUserStr) {
      try {
        const parsedCodeUser = JSON.parse(codeUserStr);
        if (parsedCodeUser && parsedCodeUser.id) {
          return parsedCodeUser;
        }
      } catch (e) {
        console.error("Failed to parse simulated user session:", e);
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(() => {
    return !localStorage.getItem('tallyin_code_user');
  });
  const [authError, setAuthError] = useState(null);
  const [showCodeLogin, setShowCodeLogin] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [codeLoginEmail, setCodeLoginEmail] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const auth = useMemo(() => ({
    currentUser: user ? {
      id: user.id,
      uid: user.id,
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'You',
      loginCode: user.loginCode
    } : null
  }), [user]);

  // Room members & settings
  const [members, setMembers] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem('monthlyBudget')) || 22000);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(() => String(localStorage.getItem('monthlyBudget') || 22000));
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
  const [settleUpiId, setSettleUpiId] = useState('');
  const [showCustomSettle, setShowCustomSettle] = useState(false);

  useEffect(() => {
    if (settleReceiver) {
      const upi = localStorage.getItem(`upi_id_${settleReceiver}`) || '';
      setTimeout(() => {
        setSettleUpiId(upi);
      }, 0);
    }
  }, [settleReceiver]);

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
  const [editingMemberBudget, setEditingMemberBudget] = useState(null); // { uid, nickname, currentBudget }
  const [newMemberBudgetVal, setNewMemberBudgetVal] = useState('');
  const [enableMemberBudgets, setEnableMemberBudgets] = useState(() => {
    return localStorage.getItem('enableMemberBudgets') !== 'false';
  });
  const [isQuotaMode, setIsQuotaMode] = useState(false);
  const [isDiamondModalOpen, setIsDiamondModalOpen] = useState(false);
  const [activeReceiptZoom, setActiveReceiptZoom] = useState(null);
  const [activeReceiptImageIndex, setActiveReceiptImageIndex] = useState(0);
  const [activeEditHistoryTx, setActiveEditHistoryTx] = useState(null);

  // Navigation & Admin Portal States
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (pathname.includes('admin') || hash.includes('admin') || params.has('admin') || params.has('admin_portal')) {
        return 'admin';
      }
    }
    return 'home';
  });

  // Sync URL location changes to currentView
  useEffect(() => {
    const handleUrlCheck = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (pathname.includes('admin') || hash.includes('admin') || params.has('admin') || params.has('admin_portal')) {
        setCurrentView('admin');
      }
    };
    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  const [isSystemMaintenanceActive, setIsSystemMaintenanceActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tallyin_system_maintenance_active') === 'true';
    }
    return false;
  });

  const [maintenanceMessage, setMaintenanceMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tallyin_maintenance_message') || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.';
    }
    return 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.';
  });

  const [allowedMaintenanceAccounts, setAllowedMaintenanceAccounts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_maintenance_allowed_accounts');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return ['tallyin.alerts@gmail.com'];
  });

  useEffect(() => {
    // Seed 6 Test Accounts into users table for instant Access Code login
    const seedTestAccounts = async () => {
      const testAccs = [
        { uid: 'test_uid_1001', login_code: 'TY1001', updated_at: new Date().toISOString() },
        { uid: 'test_uid_1002', login_code: 'TY1002', updated_at: new Date().toISOString() },
        { uid: 'test_uid_1003', login_code: 'TY1003', updated_at: new Date().toISOString() },
        { uid: 'test_uid_1004', login_code: 'TY1004', updated_at: new Date().toISOString() },
        { uid: 'test_uid_1005', login_code: 'TY1005', updated_at: new Date().toISOString() },
        { uid: 'test_uid_1006', login_code: 'TY1006', updated_at: new Date().toISOString() },
      ];
      try {
        await supabase.from('users').upsert(testAccs, { onConflict: 'uid' });
      } catch (e) {}
    };
    seedTestAccounts();

    const testEmails = ['tester1@tallyin.app', 'tester2@tallyin.app', 'tester3@tallyin.app', 'tester4@tallyin.app', 'tester5@tallyin.app', 'tester6@tallyin.app', 'test_uid_1001', 'test_uid_1002', 'test_uid_1003', 'test_uid_1004', 'test_uid_1005', 'test_uid_1006'];
    setAllowedMaintenanceAccounts(prev => Array.from(new Set([...prev, ...testEmails])));

    // Fetch maintenance control settings from DB on mount
    supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['system_maintenance_active', 'system_maintenance_message', 'maintenance_allowed_accounts'])
      .then(({ data }) => {
        if (data && Array.isArray(data)) {
          data.forEach(item => {
            if (item.key === 'system_maintenance_active') {
              const isActive = item.value === 'true' || item.value === true || (typeof item.value === 'string' && item.value.toLowerCase() === 'true');
              setIsSystemMaintenanceActive(isActive);
              localStorage.setItem('tallyin_system_maintenance_active', String(isActive));
            }
            if (item.key === 'system_maintenance_message') {
              const msg = typeof item.value === 'string' ? item.value : null;
              if (msg) {
                setMaintenanceMessage(msg);
                localStorage.setItem('tallyin_maintenance_message', msg);
              }
            }
            if (item.key === 'maintenance_allowed_accounts') {
              try {
                const parsed = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                const existing = Array.isArray(parsed) ? parsed : [];
                const merged = Array.from(new Set([...existing, ...testEmails]));
                setAllowedMaintenanceAccounts(merged);
                localStorage.setItem('tallyin_maintenance_allowed_accounts', JSON.stringify(merged));
              } catch (e) {}
            }
          });
        }
      })
      .catch(err => console.warn("Fetch system settings error:", err));
  }, []);

  useEffect(() => {
    if (user) {
      const code = user.loginCode || '';
      const email = user.email || '';
      let autoName = userNickname;

      if (!autoName) {
        if (code.startsWith('TY100')) {
          const num = code.slice(-1);
          autoName = `Tester ${num}`;
        } else if (email.startsWith('tester')) {
          const num = email.replace('tester', '').split('@')[0];
          autoName = `Tester ${num || '1'}`;
        }
      }

      if (autoName) {
        setUserNickname(autoName);
        setUserNicknameInput(autoName);
        localStorage.setItem('userNickname', autoName);
      }
    }
  }, [user]);

  const [globalBroadcast, setGlobalBroadcast] = useState(() => {
    const defaultBroadcast = {
      id: `release_${APP_VERSION || 'v3.30.2'}_itemized_bills`,
      text: `✨ New Feature (${APP_VERSION || 'v3.30.2'}): Itemized Bill & PDF Receipt Generator now live in Bills (b9lls).`,
      type: 'feature',
      active: true,
      createdAt: '2026-08-06T12:50:00.000Z',
      expiresAt: new Date(new Date('2026-08-06T12:50:00.000Z').getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      validDays: 2
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_global_broadcast');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.active && parsed.createdAt) {
            const isExp = parsed.expiresAt 
              ? new Date().getTime() > new Date(parsed.expiresAt).getTime()
              : (new Date().getTime() - new Date(parsed.createdAt).getTime()) > ((parsed.validDays || 2) * 24 * 60 * 60 * 1000);
            if (!isExp) return parsed;
          }
        }
      } catch (e) { console.error(e); }
    }
    return defaultBroadcast;
  });

  const [pinnedMessages, setPinnedMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_pinned_messages');
        return saved ? JSON.parse(saved) : {};
      } catch (e) { console.error(e); }
    }
    return {};
  });

  const [dismissedBroadcastKey, setDismissedBroadcastKey] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('tallyin_dismissed_broadcast') : null;
  });

  const [dismissedPinnedKey, setDismissedPinnedKey] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('tallyin_dismissed_pinned') : null;
  });

  const [simulatedLatency, setSimulatedLatency] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('tallyin_simulated_latency')) || 0;
    }
    return 0;
  });

  // Force disable simulated latency on mount to ensure real-time speed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tallyin_simulated_latency', '0');
      setSimulatedLatency(0);
    }
  }, []);

  // Real-time System Admin Channel & Storage Sync
  useEffect(() => {
    const sysChannel = supabase.channel('system_admin_channel');

    sysChannel
      .on('broadcast', { event: 'MAINTENANCE_MODE' }, (payload) => {
        if (payload?.payload) {
          setIsSystemMaintenanceActive(payload.payload.active);
          if (payload.payload.message) setMaintenanceMessage(payload.payload.message);
          localStorage.setItem('tallyin_system_maintenance_active', String(payload.payload.active));
          if (payload.payload.message) localStorage.setItem('tallyin_maintenance_message', payload.payload.message);
        }
      })
      .on('broadcast', { event: 'MAINTENANCE_ALLOWED_ACCOUNTS' }, (payload) => {
        if (payload?.payload?.accounts) {
          setAllowedMaintenanceAccounts(payload.payload.accounts);
          localStorage.setItem('tallyin_maintenance_allowed_accounts', JSON.stringify(payload.payload.accounts));
        }
      })
      .on('broadcast', { event: 'GLOBAL_BROADCAST' }, (payload) => {
        if (payload?.payload) {
          setGlobalBroadcast(payload.payload.broadcast);
          if (payload.payload.broadcast) {
            localStorage.setItem('tallyin_global_broadcast', JSON.stringify(payload.payload.broadcast));
          } else {
            localStorage.removeItem('tallyin_global_broadcast');
          }
        }
      })
      .on('broadcast', { event: 'ROOM_PIN' }, (payload) => {
        if (payload?.payload) {
          const { roomId, pin } = payload.payload;
          setPinnedMessages(prev => {
            const next = { ...(prev || {}) };
            if (pin) {
              next[roomId] = pin;
            } else {
              delete next[roomId];
            }
            localStorage.setItem('tallyin_pinned_messages', JSON.stringify(next));
            return next;
          });
        }
      })
      .on('broadcast', { event: 'USER_BAN_UPDATE' }, (payload) => {
        if (payload?.payload?.bannedUsers) {
          setBannedUsers(payload.payload.bannedUsers);
          localStorage.setItem('tallyin_banned_users', JSON.stringify(payload.payload.bannedUsers));
        }
      })
      .subscribe();

    // Expiration helper for broadcast messages (Default 2 Calendar Days validity)
    const isBroadcastExpired = (bc) => {
      if (!bc) return true;
      if (bc.expiresAt) {
        return new Date().getTime() > new Date(bc.expiresAt).getTime();
      }
      if (bc.createdAt) {
        const validDays = bc.validDays || 2;
        return (new Date().getTime() - new Date(bc.createdAt).getTime()) > (validDays * 24 * 60 * 60 * 1000);
      }
      return true; // Legacy broadcasts without timestamps are expired
    };

    // Automatic Deployment Broadcast for New Feature Release (Valid for 2 Calendar Days)
    const FEATURE_RELEASE_BROADCAST = {
      id: `release_${APP_VERSION || 'v3.30.2'}_itemized_bills`,
      text: `✨ New Feature (${APP_VERSION || 'v3.30.2'}): Itemized Bill & PDF Receipt Generator now live in Bills (b9lls).`,
      type: 'feature',
      active: true,
      createdAt: '2026-08-06T12:50:00.000Z',
      expiresAt: new Date(new Date('2026-08-06T12:50:00.000Z').getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      validDays: 2
    };

    // Fetch latest global broadcast & pinned messages from Supabase DB on startup & sync
    const fetchDBGlobalBroadcastAndPins = async () => {
      try {
        const { data: bcData } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_GLOBAL_BROADCAST__')
          .maybeSingle();

        if (bcData?.name && bcData.name.startsWith('{')) {
          const parsed = JSON.parse(bcData.name);
          if (parsed && parsed.active && !isBroadcastExpired(parsed)) {
            setGlobalBroadcast(parsed);
            localStorage.setItem('tallyin_global_broadcast', JSON.stringify(parsed));
          } else if (!isBroadcastExpired(FEATURE_RELEASE_BROADCAST)) {
            setGlobalBroadcast(FEATURE_RELEASE_BROADCAST);
            localStorage.setItem('tallyin_global_broadcast', JSON.stringify(FEATURE_RELEASE_BROADCAST));
          } else {
            setGlobalBroadcast(null);
            localStorage.removeItem('tallyin_global_broadcast');
          }
        } else if (!isBroadcastExpired(FEATURE_RELEASE_BROADCAST)) {
          setGlobalBroadcast(FEATURE_RELEASE_BROADCAST);
          localStorage.setItem('tallyin_global_broadcast', JSON.stringify(FEATURE_RELEASE_BROADCAST));
        } else {
          setGlobalBroadcast(null);
          localStorage.removeItem('tallyin_global_broadcast');
        }

        const { data: pinData } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_PINNED_MESSAGES__')
          .maybeSingle();

        if (pinData?.name && pinData.name.startsWith('{')) {
          const parsedPins = JSON.parse(pinData.name);
          setPinnedMessages(parsedPins || {});
          localStorage.setItem('tallyin_pinned_messages', JSON.stringify(parsedPins || {}));
        }
      } catch (err) {
        console.warn("Fetch DB global broadcast and pins notice:", err);
      }
    };

    fetchDBGlobalBroadcastAndPins();
    const broadcastSyncInterval = setInterval(fetchDBGlobalBroadcastAndPins, 10000);

    const handleStorageChange = (e) => {
      if (e.key === 'tallyin_system_maintenance_active') {
        setIsSystemMaintenanceActive(e.newValue === 'true');
      }
      if (e.key === 'tallyin_maintenance_message') {
        setMaintenanceMessage(e.newValue || '');
      }
      if (e.key === 'tallyin_global_broadcast') {
        try {
          setGlobalBroadcast(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) { console.error(err); }
      }
      if (e.key === 'tallyin_pinned_messages') {
        try {
          setPinnedMessages(e.newValue ? JSON.parse(e.newValue) : {});
        } catch (err) { console.error(err); }
      }
      if (e.key === 'tallyin_simulated_latency') {
        setSimulatedLatency(Number(e.newValue) || 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(broadcastSyncInterval);
      supabase.removeChannel(sysChannel);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [insightsTab, setInsightsTab] = useState('room');
  const [personalTabSection, setPersonalTabSection] = useState('all'); // 'all' | 'my-self' | 'paid-for-others' | 'by-roommate'
  const [selectedRoommateFilter, setSelectedRoommateFilter] = useState('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // AI Chat State
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Divvy 👋 Ask me anything about your spending, balances, or budget." }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Fund Tracker States
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
  const [isAddFundExpenseModalOpen, setIsAddFundExpenseModalOpen] = useState(false);
  
  // Add/Edit Fund Form States
  const [fundFormName, setFundFormName] = useState('');
  const [fundFormAmount, setFundFormAmount] = useState('');
  const [fundFormDate, setFundFormDate] = useState(() => getLocalDateStr());
  const [editingFund, setEditingFund] = useState(null);
  
  // Add/Edit Fund Spend Form States
  const [fundSpendFormTitle, setFundSpendFormTitle] = useState('');
  const [isFundCategoryManuallyModified, setIsFundCategoryManuallyModified] = useState(false);
  const [fundSpendFormAmount, setFundSpendFormAmount] = useState('');
  const [fundSpendFormCategory, setFundSpendFormCategory] = useState('Shopping');
  const [fundSpendFormDate, setFundSpendFormDate] = useState(() => getLocalDateStr());
  const [editingFundSpend, setEditingFundSpend] = useState(null);
  const [fundSpendFormType, setFundSpendFormType] = useState('expense'); // 'expense' or 'income'
  
  // Search within detailed fund view
  const [fundSearchQuery, setFundSearchQuery] = useState('');
  const [isAuditMode, setIsAuditMode] = useState(false);

  // Core Data States
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  
  // Theme option (default light, read from localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const isInitialThemeMount = useRef(true);
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
  const [onboardingStep, setOnboardingStep] = useState('selection'); // 'selection' | 'room-name' | 'room-mode' | 'room-budget' | 'share-code'
  const [selectedRoomMode, setSelectedRoomMode] = useState('quota'); // 'quota' | 'split'
  const [activityLogs, setActivityLogs] = useState([]);
  // Feature 15: Onboarding Tutorial
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('tallyin_onboarding_done'));
  const [onboardingTipIndex, setOnboardingTipIndex] = useState(0);
  // Feature 14: Emoji Reactions (localStorage-backed)
  const [txReactions, setTxReactions] = useState(() => { try { return JSON.parse(localStorage.getItem('tallyin_reactions') || '{}'); } catch { return {}; } });
  // Feature 3: Expense Comments
  const [commentTxId, setCommentTxId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [txComments, setTxComments] = useState(() => { try { return JSON.parse(localStorage.getItem('tallyin_comments') || '{}'); } catch { return {}; } });
  const [pendingRecurringTxs, setPendingRecurringTxs] = useState([]);
  const [postingRecurringIds, setPostingRecurringIds] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  const [roomCreatedBy, setRoomCreatedBy] = useState(null); // uid of room creator (host)
  const [roomMaxMembers, setRoomMaxMembers] = useState(6);
  const [roomMaxMembersInput, setRoomMaxMembersInput] = useState(6);
  const [settingsMaxMembersInput, setSettingsMaxMembersInput] = useState(6);
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);
  const [joinRequestModalInfo, setJoinRequestModalInfo] = useState(null);
  const [pendingUserRequests, setPendingUserRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('tallyin_pending_user_requests');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedMonth, setSelectedMonth] = useState(() => getLocalMonthStr());

  // Notification Config States
  const [notificationMethod, setNotificationMethod] = useState(() => localStorage.getItem('notificationMethod') || 'tallyin');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(() => localStorage.getItem('pushNotificationsEnabled') === 'true');
  
  // Settlement Record States
  const [settlementSearchQuery, setSettlementSearchQuery] = useState('');
  const [settlementRoommateFilter, setSettlementRoommateFilter] = useState('all');
  const [settlementMonthFilter, setSettlementMonthFilter] = useState('all');
  const [selectedSettlementDetail, setSelectedSettlementDetail] = useState(null);
  const [isSettlementDetailOpen, setIsSettlementDetailOpen] = useState(false);

  // Log download states
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');
  const [downloadAllLogs, setDownloadAllLogs] = useState(false);
  const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);
  const [emailingType, setEmailingType] = useState(null);
  
  // File upload reference
  const fileInputRef = useRef(null);

  // Ban Management State & Lockout Memo
  const [bannedUsers, setBannedUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_banned_users');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { console.error(e); }
    }
    return [];
  });

  // Fetch Banned Users from Supabase on mount in App.jsx (rooms table + system_settings)
  useEffect(() => {
    const fetchDBBannedUsers = async () => {
      let foundList = null;

      // 1. Try rooms table (__SYSTEM_BANNED_USERS__)
      try {
        const { data } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_BANNED_USERS__')
          .maybeSingle();

        if (data?.name && data.name.startsWith('[')) {
          foundList = JSON.parse(data.name);
        }
      } catch (err) {
        console.warn("DB banned users fetch notice:", err);
      }

      // 2. Try system_settings
      if (!foundList) {
        try {
          const { data } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'banned_users')
            .maybeSingle();

          if (data?.value && Array.isArray(data.value)) {
            foundList = data.value;
          }
        } catch (err) {
          console.warn("DB banned users fallback notice:", err);
        }
      }

      if (foundList && Array.isArray(foundList)) {
        setBannedUsers(foundList);
        localStorage.setItem('tallyin_banned_users', JSON.stringify(foundList));
      }
    };

    fetchDBBannedUsers();

    // Cross-tab storage listener
    const handleStorage = (e) => {
      if (e.key === 'tallyin_banned_users' && e.newValue) {
        try {
          setBannedUsers(JSON.parse(e.newValue));
        } catch (err) { console.error(err); }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const banInfo = useMemo(() => {
    if (!bannedUsers || bannedUsers.length === 0) return null;

    const possibleIdentifiers = [
      user?.email,
      user?.uid,
      userNickname,
      codeLoginEmail,
      typeof window !== 'undefined' ? localStorage.getItem('tallyin_user_email') : null,
      typeof window !== 'undefined' ? localStorage.getItem('user_email') : null,
      typeof window !== 'undefined' ? localStorage.getItem('tallyin_user_nickname') : null,
      typeof window !== 'undefined' ? localStorage.getItem('user_nickname') : null
    ]
      .filter(Boolean)
      .map(id => String(id).trim().toLowerCase());

    if (possibleIdentifiers.length === 0) return null;

    return bannedUsers.find(b => {
      const bIdent = (b.identifier || b.email || b.id || '').trim().toLowerCase();
      const bName = (b.name || '').trim().toLowerCase();
      return possibleIdentifiers.some(id => id === bIdent || id === bName);
    }) || null;
  }, [user, userNickname, codeLoginEmail, bannedUsers]);

  const isUserBanned = Boolean(banInfo);

  // Live polling while banned to detect unban in real time
  useEffect(() => {
    if (!isUserBanned) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_BANNED_USERS__')
          .maybeSingle();

        if (data?.name && data.name.startsWith('[')) {
          const latestBanned = JSON.parse(data.name);
          setBannedUsers(latestBanned);
          localStorage.setItem('tallyin_banned_users', JSON.stringify(latestBanned));
        } else {
          setBannedUsers([]);
          localStorage.setItem('tallyin_banned_users', '[]');
        }
      } catch (err) {
        console.warn("Unban polling check notice:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isUserBanned]);
  // Feature D: Expense Comments
  const [expenseComments, setExpenseComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tallyin_expense_comments') || '{}');
    } catch {
      return {};
    }
  });
  const [newCommentInput, setNewCommentInput] = useState('');
  
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
          setFormReceiptImages(getImages(matchingReceipt.imageUrl));
        } else {
          setFormReceiptImages([]);
        }
      } else {
        setFormReceiptImages([]);
      }
    } else {
      setEditingTransaction(null);
      setFormFor('');
      setFormAmount('');
      setFormCategory('Food');
      setFormDate(getLocalDateStr());
      setFormRepeat(false);
      setSuggestedCategory(null);
      setFormReceiptImages([]);
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
    setIsCategoryManuallyModified(false);
    setEditingTransaction(null);
    setFormFor('');
    setFormAmount('');
    setFormCategory('Food');
    setFormDate(getLocalDateStr());
    setFormRepeat(false);
    setFormFundId('');
    setSuggestedCategory(null);
    setFormReceiptImages([]);
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

  const closeAddFundExpenseModal = () => {
    setIsAddFundExpenseModalOpen(false);
    setEditingFundSpend(null);
    setFundSpendFormTitle('');
    setFundSpendFormAmount('');
    setFundSpendFormCategory('Shopping');
    setIsFundCategoryManuallyModified(false);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const existingCount = formReceiptImages.length;
    if (existingCount + files.length > 4) {
      triggerToast("You can upload a maximum of 4 receipt files per transaction.");
      return;
    }

    const loadedImages = [];
    for (let file of files) {
      // HEIC conversion for images
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
        triggerToast(`Converting HEIC image (${file.name})... Please wait.`);
        try {
          file = await convertHeicToPng(file);
        } catch (err) {
          triggerToast(err.message);
          continue;
        }
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isExcel = file.type.includes('spreadsheet') || file.type === 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
      const maxSize = (isPdf || isExcel) ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
      const sizeLabel = (isPdf || isExcel) ? '10MB' : '3MB';

      if (file.size > maxSize) {
        triggerToast(`File ${file.name} is too large. Please upload files under ${sizeLabel}.`);
        continue;
      }

      const p = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => {
          triggerToast(`Failed to read file ${file.name}`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
      const result = await p;
      if (result) {
        loadedImages.push(result);
      }
    }

    setFormReceiptImages(prev => [...prev, ...loadedImages]);
  };

  const preprocessImageForOcr = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        // Scale up if image resolution is low for better OCR text recognition
        const MIN_WIDTH = 1200;
        if (width < MIN_WIDTH && width > 0) {
          const scale = MIN_WIDTH / width;
          width = MIN_WIDTH;
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          // Grayscale & contrast enhancement
          for (let i = 0; i < data.length; i += 4) {
            const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const factor = 1.3;
            let val = factor * (avg - 128) + 128;
            val = Math.min(255, Math.max(0, val));
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const parseNumberValue = (numStr) => {
    if (!numStr) return null;
    let clean = numStr.trim();
    // Handle comma as thousands separator (e.g., "1,250.50" or "12,500")
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(clean)) {
      clean = clean.replace(/,/g, '');
    } else if (/^\d+,\d{2}$/.test(clean)) {
      // European decimal comma (e.g., "450,50")
      clean = clean.replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
    const val = parseFloat(clean);
    return isNaN(val) ? null : val;
  };

  const handleReceiptOcr = async () => {
    if (formReceiptImages.length === 0) {
      triggerToast('Please upload a receipt image first.');
      return;
    }
    const rawImgUrl = formReceiptImages[0];
    if (!rawImgUrl.startsWith('data:image/')) {
      triggerToast('OCR only supports image files (PNG, JPG, HEIC).');
      return;
    }

    setIsOcrLoading(true);
    triggerToast('Analyzing receipt with AI OCR... Please wait.');

    try {
      if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/tesseract.js@5.0.5/dist/tesseract.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Preprocess image for maximum OCR accuracy
      const imgUrl = await preprocessImageForOcr(rawImgUrl);

      const worker = await window.Tesseract.createWorker('eng');
      const ret = await worker.recognize(imgUrl);
      await worker.terminate();

      const text = ret.data.text || '';
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const totalLines = lines.length;

      const candidates = [];

      const highKeywords = /\b(grand\s*total|total\s*amount|net\s*payable|amount\s*payable|total\s*due|final\s*total|balance\s*due|pay\s*total|total\s*to\s*pay|bill\s*amount|total\s*rs|total\s*inr|total\s*₹|amount\s*paid|paid\s*amount)\b/i;
      const medKeywords = /\b(total|net\s*amt|amount|payable|balance|paid)\b/i;
      const subtotalKeywords = /\b(subtotal|sub-total|sub\s*total)\b/i;
      const currencySymbolRegex = /(₹|rs\.?|inr|\$|€|£)/i;
      const penaltyRegex = /\b(phone|mobile|tel|contact|gstin|fssai|tin|cin|pan|date|time|invoice|receipt|order|table|token|discount|tax|gst|cgst|sgst|change|cash\s*tendered|cashier|item|qty|quantity)\b/i;

      // Extract candidate numbers line by line with context scoring
      lines.forEach((lineText, lineIdx) => {
        const lower = lineText.toLowerCase();

        // Match price patterns: e.g. ₹1,250.00 or Rs 450 or 450.50
        const numberMatches = lineText.match(/(?:₹|rs\.?|inr|\$|€|£)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:[\.,]\d{1,2})?)/gi) || [];

        numberMatches.forEach(rawMatch => {
          // Extract the digits part
          const matchValStr = rawMatch.replace(/^(?:₹|rs\.?|inr|\$|€|£)\s*/i, '');
          const val = parseNumberValue(matchValStr);
          if (val === null || val <= 0 || val > 500000) return;

          // Reject 10-12 digit numbers (Phone numbers, GSTINs, Barcodes, Order IDs)
          if (val >= 1000000000 || /^\d{10,12}$/.test(matchValStr.replace(/[\.,]/g, ''))) return;

          // Reject dates (e.g. 2020 to 2035) unless line has explicit currency
          if (val >= 2020 && val <= 2035 && !currencySymbolRegex.test(lineText) && /date/i.test(lineText)) return;

          // Reject postal pin codes (6-digit numbers e.g. 560038)
          if (val >= 100000 && val <= 999999 && (lower.includes('pin') || lower.includes('bangalore') || lower.includes('mumbai') || lower.includes('delhi'))) return;

          let score = 0;

          if (highKeywords.test(lineText)) {
            score += 100;
          } else if (medKeywords.test(lineText)) {
            score += 50;
          } else if (subtotalKeywords.test(lineText)) {
            score += 25;
          }

          if (currencySymbolRegex.test(lineText)) {
            score += 20;
          }

          if (penaltyRegex.test(lineText) && !highKeywords.test(lineText)) {
            score -= 70;
          }

          // Bottom half of receipt bonus (totals usually appear near bottom)
          if (totalLines > 0 && lineIdx / totalLines > 0.5) {
            score += 15;
          }

          candidates.push({ val, score, lineIdx, rawMatch, lineText });
        });
      });

      // Sort candidates by score (descending), then by lineIdx (descending, lower in receipt preferred)
      candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.lineIdx - a.lineIdx;
      });

      const bestCandidate = candidates.length > 0 ? candidates[0] : null;

      // Extract Merchant Name from top lines
      let detectedMerchant = '';
      const headerLines = lines.slice(0, 6);
      for (const hLine of headerLines) {
        const hLower = hLine.toLowerCase();
        if (
          !/\b(tax|invoice|cash|receipt|original|copy|bill|welcome|gstin|date|time|tel|phone|customer)\b/i.test(hLower) &&
          hLine.length >= 3 &&
          /[a-zA-Z]/.test(hLine)
        ) {
          // Clean up merchant name
          detectedMerchant = hLine.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9\s\.\&\-]+$/g, '').trim();
          break;
        }
      }

      // Auto detect category
      let detectedCategory = null;
      if (detectedMerchant) {
        detectedCategory = smartDetectCategory(detectedMerchant);
      }
      if (!detectedCategory) {
        detectedCategory = smartDetectCategory(text);
      }

      if (bestCandidate && bestCandidate.val > 0) {
        setFormAmount(String(bestCandidate.val));
        
        // Auto-fill title (formFor) if currently empty
        if (!formFor && detectedMerchant) {
          setFormFor(detectedMerchant);
        }

        // Auto-fill category if detected & not manually modified
        if (detectedCategory && !isCategoryManuallyModified) {
          setFormCategory(detectedCategory);
          setSuggestedCategory(detectedCategory);
        }

        const categoryText = detectedCategory ? ` (${detectedCategory})` : '';
        const merchantText = detectedMerchant ? ` from ${detectedMerchant}` : '';
        triggerToast(`Success! Detected ${formatINR(bestCandidate.val)}${merchantText}${categoryText}`);
      } else {
        triggerToast('Could not detect total amount automatically. Please enter manually.');
      }
    } catch (err) {
      console.error("OCR analysis failed:", err);
      triggerToast('OCR engine initialization failed. Please enter manually.');
    } finally {
      setIsOcrLoading(false);
    }
  };


  // New Transaction Form State
  const [formFor, setFormFor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(() => getLocalDateStr());
  const [formRepeat, setFormRepeat] = useState(false);
  const [formFundId, setFormFundId] = useState('');
  const [isCategoryManuallyModified, setIsCategoryManuallyModified] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [formReceiptImages, setFormReceiptImages] = useState([]);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // Shopping Board States
  const [isAddShoppingOpen, setIsAddShoppingOpen] = useState(false);
  const [shoppingTitle, setShoppingTitle] = useState('');
  const [shoppingAmount, setShoppingAmount] = useState('');
  
  // Shopping Board 1-Click Split States
  const [isSplitShoppingOpen, setIsSplitShoppingOpen] = useState(false);
  const [selectedShoppingItem, setSelectedShoppingItem] = useState(null);
  const [splitShoppingAmount, setSplitShoppingAmount] = useState('');
  const [splitShoppingPayer, setSplitShoppingPayer] = useState('');
  const [splitShoppingMembers, setSplitShoppingMembers] = useState({});

  // Bills & Subscriptions Module States
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isQuickBillOpen, setIsQuickBillOpen] = useState(false);
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState('Utilities');
  const [billAssignee, setBillAssignee] = useState('');
  const [billInterval, setBillInterval] = useState('30'); // frequency in days (default 30 / monthly)
  const [billDueDate, setBillDueDate] = useState(() => getLocalDateStr());
  const [billIsShared, setBillIsShared] = useState(true);

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

  // Navigation helper — resets search when switching tabs
  const navigateTo = (view) => {
    setCurrentView(view);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

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

      // Filter out any pending requests for rooms where user is now an approved member
      const approvedRoomIds = formatted.map(r => r.roomId);
      setPendingUserRequests(prev => {
        const next = prev.filter(p => !approvedRoomIds.includes(p.roomId));
        localStorage.setItem('tallyin_pending_user_requests', JSON.stringify(next));
        return next;
      });
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

  // Helper to add member to room in Supabase with Capacity Lock Enforcement
  const addMemberToRoom = useCallback(async (roomId, nickname, currentUserObj = null) => {
    const activeUser = currentUserObj || user;
    if (!activeUser || !roomId) return { success: false, reason: 'no_user_or_room' };
    try {
      // 1. Check if user is ALREADY a member of this room
      const { data: existingMembers, error: membersErr } = await supabase
        .from('members')
        .select('uid')
        .eq('room_id', roomId);

      if (membersErr) console.warn("Members check notice:", membersErr);

      const isAlreadyMember = (existingMembers || []).some(m => m.uid === activeUser.id);

      // 2. If NOT already a member, check room capacity limit (max_members)
      if (!isAlreadyMember) {
        const { data: roomData, error: roomErr } = await supabase
          .from('rooms')
          .select('name, created_by, max_members')
          .eq('id', roomId)
          .maybeSingle();

        if (roomErr) console.warn("Room capacity query notice:", roomErr);

        const roomName = roomData?.name || 'Tallyin Room';
        const hostUid = roomData?.created_by;
        let hostNickname = 'Room Admin';
        let hostEmail = '';

        if (hostUid) {
          const { data: hostMember } = await supabase
            .from('members')
            .select('nickname, email')
            .eq('room_id', roomId)
            .eq('uid', hostUid)
            .maybeSingle();

          if (hostMember) {
            hostNickname = hostMember.nickname || 'Room Admin';
            hostEmail = hostMember.email || '';
          }
        }

        const maxLimit = roomData?.max_members ? Number(roomData.max_members) : 6;
        const currentCount = existingMembers ? existingMembers.length : 0;

        if (currentCount >= maxLimit) {
          triggerToast(`🔒 Room "${roomName}" (${roomId}) is full (${currentCount}/${maxLimit} members).`);
          setJoinRequestModalInfo({ roomId, roomName, hostNickname, hostEmail, currentCount, maxLimit });
          // Reset local room state if user tried to auto-join a full room
          if (userRoomId === roomId) {
            setUserRoomId(null);
            localStorage.removeItem('userRoomId');
            setHasConfirmedRoom(false);
          }
          return { success: false, reason: 'capacity_full', currentCount, maxLimit };
        }
      }

      // 3. Upsert member
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
      return { success: true };
    } catch (err) {
      console.error('Failed to add member to room in Supabase:', err);
      return { success: false, reason: err.message };
    }
  }, [user, userRoomId, triggerToast]);

  const generateUniqueLoginCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      attempts++;
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('uid')
        .eq('login_code', code)
        .maybeSingle();
        
      if (!error && !data) {
        isUnique = true;
      }
    }
    return code;
  };

  const handleAuthUser = useCallback(async (currentUser) => {
    // Run self-healing migration from old Supabase UIDs to Firebase UID
    if (currentUser && currentUser.email) {
      try {
        await fetch('https://duoshare-backend.sampathjogipusala123.workers.dev/api/auth/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: currentUser.email,
            uid: currentUser.id
          })
        });
      } catch (err) {
        console.warn('Failed to run authentication migration:', err);
      }
    }

    const cachedNickname = localStorage.getItem('userNickname');
    const displayName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
    const finalNickname = cachedNickname && cachedNickname !== 'You' ? cachedNickname : (displayName || 'You');
    setUserNickname(finalNickname);
    setNicknameInput(finalNickname);
    localStorage.setItem('userNickname', finalNickname);
    if (cachedNickname && cachedNickname !== 'You' && cachedNickname.trim() !== '') {
      setIsNicknameFixed(true);
    }

    const localRoomId = localStorage.getItem('userRoomId');

    // Ensure user record and access code exist in 'users' table
    supabase
      .from('users')
      .select('*')
      .eq('uid', currentUser.id)
      .maybeSingle()
      .then(async ({ data: userProfile, error }) => {
        if (!error) {
          if (!userProfile) {
            const newCode = await generateUniqueLoginCode();
            await supabase.from('users').insert({
              uid: currentUser.id,
              room_id: localRoomId || null,
              login_code: newCode,
              updated_at: new Date().toISOString()
            });
            currentUser.loginCode = newCode;
          } else if (!userProfile.login_code) {
            const newCode = await generateUniqueLoginCode();
            await supabase.from('users').update({
              login_code: newCode,
              updated_at: new Date().toISOString()
            }).eq('uid', currentUser.id);
            currentUser.loginCode = newCode;
          } else {
            currentUser.loginCode = userProfile.login_code;
          }
          setUser({ ...currentUser });
        }
      })
      .catch(e => console.error('Error verifying user login code:', e));

    // Load room ID from localStorage if available, otherwise fetch from Supabase
    // Fire-and-forget addMemberToRoom — don't await it to avoid login latency
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
  const mapFirebaseUser = (fbUser) => {
    if (!fbUser) return null;
    return {
      id: fbUser.uid,
      email: fbUser.email,
      user_metadata: {
        avatar_url: fbUser.photoURL || '',
        picture: fbUser.photoURL || '',
        full_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User'
      }
    };
  };

  useEffect(() => {
    if (localStorage.getItem('tallyin_code_user')) {
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (localStorage.getItem('tallyin_code_user')) return;

      const currentUser = mapFirebaseUser(fbUser);
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
      unsubscribe();
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

  // Prevent accidental number changes on scroll/wheel when number inputs are focused
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Sync with dark mode class on document element and body with smooth transition
  useEffect(() => {
    const applyTheme = () => {
      if (isDarkMode) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };

    if (isInitialThemeMount.current) {
      isInitialThemeMount.current = false;
      applyTheme();
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        applyTheme();
      });
    } else {
      applyTheme();
    }
  }, [isDarkMode]);

  const fetchTransactions = useCallback(async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('room_id', roomId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

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
          splits: (() => {
            if (typeof t.splits === 'string') {
              try {
                return JSON.parse(t.splits);
              } catch (e) {
                return [];
              }
            }
            return t.splits || [];
          })(),
          createdBy: t.created_by,
          imageUrl: t.image_url
        }))
        .filter(t => {
          const currentUid = user?.id || auth.currentUser?.uid || 'anonymous';
          // Fund tracker logs (__FUND_INIT__, __FUND_SPEND__) are shown to all members of the room
          if (t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__') {
            return true;
          }
          // Private bills (__BILL__, __CHORE__) with isShared === false are shown only to their creator/payer
          if ((t.category === '__BILL__' || t.category === '__CHORE__') && t.isShared === false) {
            return t.paidByUid === currentUid || t.createdBy === currentUid || t.paidByUid === 'anonymous' || t.createdBy === 'anonymous';
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
        .select('monthly_budget, name, created_by, max_members, room_mode')
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
            .then(null, err => console.error('Error updating user room_id:', err));
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
        localStorage.setItem('roomName', data.name);
      }
      // Track host (creator) for permission checks
      if (data.created_by) {
        setRoomCreatedBy(data.created_by);
      }
      const limitVal = data.max_members ? Number(data.max_members) : 6;
      setRoomMaxMembers(limitVal);

      // Fetch permanent room operating mode (quota vs split)
      let dbMode = data?.room_mode;
      if (!dbMode) {
        try {
          const { data: sysMode } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', `room_mode_${roomId}`)
            .maybeSingle();

          if (sysMode?.value) {
            const parsed = typeof sysMode.value === 'string' ? JSON.parse(sysMode.value) : sysMode.value;
            if (parsed?.mode) dbMode = parsed.mode;
          }
        } catch (e) {}
      }

      // Pre-existing rooms default to 'split' mode cleanly
      const activeMode = dbMode || localStorage.getItem(`roomMode_${roomId}`) || 'split';
      setIsQuotaMode(activeMode === 'quota');
      localStorage.setItem('isQuotaMode', activeMode === 'quota' ? 'true' : 'false');
      localStorage.setItem(`roomMode_${roomId}`, activeMode);

      // Do not overwrite draft editing inputs if Manage Room modal is currently open
      if (!isManageRoomOpen) {
        setSettingsMaxMembersInput(limitVal);
        if (data.name) setSettingsRoomNameInput(data.name);
      }

      // Fetch pending join requests for this room
      try {
        const { data: sysData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', `join_requests_${roomId}`)
          .maybeSingle();

        if (sysData?.value) {
          const parsed = typeof sysData.value === 'string' ? JSON.parse(sysData.value) : sysData.value;
          setPendingJoinRequests(Array.isArray(parsed) ? parsed : []);
        } else {
          setPendingJoinRequests([]);
        }
      } catch (e) {
        setPendingJoinRequests([]);
      }
    } catch (err) {
      console.warn("Room settings fetch error:", err);
    }
  }, [user, fetchUserRooms, triggerToast]);

  const handleSendJoinRequest = async (targetRoomId, targetNickname = null) => {
    const activeUser = user;
    if (!activeUser || !targetRoomId) {
      triggerToast('Please sign in first to send a join request.');
      return;
    }
    const nickname = targetNickname || userNickname || 'Roommate';
    try {
      const { data: existingData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', `join_requests_${targetRoomId}`)
        .maybeSingle();

      let currentList = [];
      if (existingData?.value) {
        try {
          currentList = typeof existingData.value === 'string' ? JSON.parse(existingData.value) : existingData.value;
          if (!Array.isArray(currentList)) currentList = [];
        } catch (e) { currentList = []; }
      }

      const alreadyRequested = currentList.some(r => r.uid === activeUser.id || (r.email && r.email === activeUser.email));
      if (alreadyRequested) {
        triggerToast('📩 Your join request is already pending review by the room Admin.');
        setJoinRequestModalInfo(null);
        return;
      }

      const resolvedEmail = activeUser.email || auth.currentUser?.email || localStorage.getItem('tallyin_user_email') || localStorage.getItem('user_email') || '';
      const newRequest = {
        id: crypto.randomUUID(),
        uid: activeUser.id,
        nickname: nickname,
        email: resolvedEmail,
        requested_at: new Date().toISOString(),
        room_id: targetRoomId
      };

      const updatedList = [...currentList, newRequest];

      const { error: upsertErr } = await supabase
        .from('system_settings')
        .upsert({
          key: `join_requests_${targetRoomId}`,
          value: JSON.stringify(updatedList),
          created_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (upsertErr) throw upsertErr;

      // Save pending request locally & in DB for user_requests_${activeUser.id}
      const targetRoomName = joinRequestModalInfo?.roomName || targetRoomId;
      const newUserReqItem = {
        roomId: targetRoomId,
        roomName: targetRoomName,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      setPendingUserRequests(prev => {
        const next = [...prev.filter(p => p.roomId !== targetRoomId), newUserReqItem];
        localStorage.setItem('tallyin_pending_user_requests', JSON.stringify(next));
        return next;
      });

      try {
        const { data: userReqData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', `user_requests_${activeUser.id}`)
          .maybeSingle();

        let userReqList = [];
        if (userReqData?.value) {
          try {
            userReqList = typeof userReqData.value === 'string' ? JSON.parse(userReqData.value) : userReqData.value;
            if (!Array.isArray(userReqList)) userReqList = [];
          } catch(e) { userReqList = []; }
        }

        const updatedUserReqList = [...userReqList.filter(r => r.roomId !== targetRoomId), newUserReqItem];

        await supabase
          .from('system_settings')
          .upsert({
            key: `user_requests_${activeUser.id}`,
            value: JSON.stringify(updatedUserReqList),
            created_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (e) {
        console.warn("Notice: failed to save user request state to DB:", e);
      }

      await logActivity('settings', `${nickname} sent a request to join room ${targetRoomId}`);
      triggerToast('📩 Join request sent to room Admin! Redirecting to your rooms screen...');
      setJoinRequestModalInfo(null);
      
      // Drive user back to the Home / Room Selection Screen
      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setOnboardingStep('selection');
    } catch (err) {
      console.error('Failed to send join request:', err);
      triggerToast(`Failed to send request: ${err.message}`);
    }
  };

  const sendApprovalEmail = async (req, roomId, roomDisplayName) => {
    let recipientEmail = req.email;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      try {
        const { data: uData } = await supabase
          .from('users')
          .select('email')
          .eq('uid', req.uid)
          .maybeSingle();

        if (uData?.email) recipientEmail = uData.email;
      } catch (e) {}
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn("No valid recipient email provided for join request approval notification:", req);
      return;
    }

    const joinUrl = `https://tallyin.vercel.app/?room=${roomId}`;
    const subject = `🎉 Approved! Join "${roomDisplayName || roomId}" on Tallyin`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #F6F8F6; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1A3827; margin: 0; font-size: 20px; font-weight: 800;">Tallyin Room Approval</h2>
          <p style="color: #5C6E5C; font-size: 12px; margin-top: 4px;">YouthFirst DuoShare Expense Manager</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 20px; border: 1px solid #E3E8E3; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
          <h3 style="color: #1A3827; margin: 0 0 8px 0; font-size: 18px; font-weight: 800;">Join Request Approved!</h3>
          <p style="color: #5C6E5C; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">
            Hello <strong>${req.nickname}</strong>,<br>
            The room Admin has approved your request to join <strong>"${roomDisplayName || roomId}"</strong> and expanded the room capacity!
          </p>

          <div style="background-color: #EAF0EC; padding: 14px; border-radius: 14px; margin-bottom: 24px; text-align: left;">
            <div style="font-size: 11px; color: #5C6E5C; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Room Details</div>
            <div style="font-size: 14px; font-weight: 800; color: #1A3827; margin-top: 4px;">${roomDisplayName || 'Shared Room'}</div>
            <div style="font-size: 12px; font-family: monospace; color: #1A3827; margin-top: 2px;">Code: <strong>${roomId}</strong></div>
          </div>

          <a href="${joinUrl}" style="display: inline-block; background-color: #1A3827; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(26,56,39,0.2);">
            👉 Enter Room Now (${roomId})
          </a>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #889988;">
          Or copy link: <a href="${joinUrl}" style="color: #1A3827;">${joinUrl}</a>
        </div>
      </div>
    `;

    const textBody = `Hello ${req.nickname},\n\nYour request to join room "${roomDisplayName || roomId}" on Tallyin has been approved by the room Admin!\n\nClick the link below to enter the room:\n${joinUrl}\n\nRoom Code: ${roomId}`;

    try {
      await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          htmlBody: htmlBody,
          textBody: textBody
        })
      });
      console.log(`Approval email dispatched to ${recipientEmail}`);
    } catch (e) {
      console.warn("Failed to send approval email:", e);
    }
  };

  const handleApproveJoinRequest = async (req) => {
    if (!userRoomId) return;
    try {
      // 1. Expand room capacity (+1)
      const newLimit = roomMaxMembers + 1;
      const { error: roomErr } = await supabase
        .from('rooms')
        .update({ max_members: newLimit })
        .eq('id', userRoomId);

      if (roomErr) throw roomErr;
      setRoomMaxMembers(newLimit);
      setSettingsMaxMembersInput(newLimit);

      // 2. Add member to room
      await supabase
        .from('members')
        .upsert({
          room_id: userRoomId,
          uid: req.uid,
          nickname: req.nickname,
          photo_url: '',
          email: req.email || '',
          joined_at: new Date().toISOString()
        }, { onConflict: 'room_id,uid' });

      // 3. Remove request from pending list
      const updatedRequests = pendingJoinRequests.filter(r => r.id !== req.id && r.uid !== req.uid);
      setPendingJoinRequests(updatedRequests);

      await supabase
        .from('system_settings')
        .upsert({
          key: `join_requests_${userRoomId}`,
          value: JSON.stringify(updatedRequests),
          created_at: new Date().toISOString()
        }, { onConflict: 'key' });

      // 4. Update status in user_requests_${req.uid}
      try {
        const { data: userReqData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', `user_requests_${req.uid}`)
          .maybeSingle();

        let userReqList = [];
        if (userReqData?.value) {
          try {
            userReqList = typeof userReqData.value === 'string' ? JSON.parse(userReqData.value) : userReqData.value;
            if (!Array.isArray(userReqList)) userReqList = [];
          } catch(e) { userReqList = []; }
        }

        const updatedUserReqList = userReqList.map(r => r.roomId === userRoomId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r);

        await supabase
          .from('system_settings')
          .upsert({
            key: `user_requests_${req.uid}`,
            value: JSON.stringify(updatedUserReqList),
            created_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (e) { console.warn("Notice: failed to update approved user request state:", e); }

      await fetchMembers(userRoomId);
      
      // 5. Log activity so all roommates see the new roommate joined
      await logActivity('settings', `🎉 ${req.nickname} joined the room! (Approved by ${userNickname})`);

      // 6. Notify all roommates via browser push notification & email
      if (Notification.permission === 'granted' && localStorage.getItem('pushNotificationsEnabled') === 'true') {
        try {
          new Notification("New Roommate Joined!", {
            body: `${req.nickname} has joined ${roomName || userRoomId}`,
            icon: faviconLogo || '/favicon.ico'
          });
        } catch (e) {}
      }

      // Notify roommates via email dispatch
      try {
        await sendEmailNotification({
          title: `🎉 ${req.nickname} joined room ${roomName || userRoomId}!`,
          amount: 0,
          paidBy: req.nickname,
          category: 'General',
          date: getLocalDateStr()
        }, 'new_member');
      } catch (e) { console.warn("Failed to notify roommates of new member:", e); }

      // 7. Send Email Notification to Approved User with direct join link
      await sendApprovalEmail(req, userRoomId, roomName);

      triggerToast(`🎉 Approved ${req.nickname}! Room capacity expanded to ${newLimit} members & email sent.`);
    } catch (err) {
      console.error("Approve join request error:", err);
      triggerToast(`Failed to approve request: ${err.message}`);
    }
  };

  const sendDeclineEmail = async (req, roomId, roomDisplayName, hostName, hostEmail) => {
    let recipientEmail = req.email;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      try {
        const { data: uData } = await supabase
          .from('users')
          .select('email')
          .eq('uid', req.uid)
          .maybeSingle();

        if (uData?.email) recipientEmail = uData.email;
      } catch (e) {}
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn("No valid email provided for join request decline notification:", req);
      return;
    }

    const subject = `Tallyin Join Request Update for "${roomDisplayName || roomId}"`;
    const adminContactLine = hostEmail
      ? `Room Admin: <strong>${hostName || 'Host'}</strong> (<a href="mailto:${hostEmail}" style="color: #0284C7; text-decoration: underline;">${hostEmail}</a>)`
      : `Room Admin: <strong>${hostName || 'Host'}</strong>`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #F6F8F6; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1A3827; margin: 0; font-size: 20px; font-weight: 800;">Tallyin Room Update</h2>
          <p style="color: #5C6E5C; font-size: 12px; margin-top: 4px;">YouthFirst DuoShare Expense Manager</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 20px; border: 1px solid #E3E8E3; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">ℹ️</div>
          <h3 style="color: #1A3827; margin: 0 0 8px 0; font-size: 18px; font-weight: 800;">Join Request Declined</h3>
          <p style="color: #5C6E5C; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">
            Hello <strong>${req.nickname}</strong>,<br>
            Your request to join room <strong>"${roomDisplayName || roomId}"</strong> was reviewed and declined by the room Admin.
          </p>

          <div style="background-color: #F8FAFC; padding: 14px; border-radius: 14px; text-align: left; border: 1px solid #E2E8F0;">
            <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Room Info</div>
            <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-top: 4px;">${roomDisplayName || 'Shared Room'} (Code: ${roomId})</div>
            <div style="font-size: 12px; color: #334155; margin-top: 6px; font-weight: 600;">
              ${adminContactLine}
            </div>
            <p style="font-size: 11px; color: #64748B; margin-top: 6px; margin-bottom: 0;">
              If you need access or believe this was done in error, please contact the room Admin directly.
            </p>
          </div>
        </div>
      </div>
    `;

    const textBody = `Hello ${req.nickname},\n\nYour request to join room "${roomDisplayName || roomId}" on Tallyin was declined by the room Admin (${hostName || 'Host'}${hostEmail ? ` - ${hostEmail}` : ''}).\n\nRoom Code: ${roomId}`;

    try {
      await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          htmlBody: htmlBody,
          textBody: textBody
        })
      });
      console.log(`Decline email dispatched to ${recipientEmail}`);
    } catch (e) {
      console.warn("Failed to send decline email:", e);
    }
  };

  const handleDeclineJoinRequest = async (req) => {
    if (!userRoomId) return;
    try {
      const updatedRequests = pendingJoinRequests.filter(r => r.id !== req.id && r.uid !== req.uid);
      setPendingJoinRequests(updatedRequests);

      await supabase
        .from('system_settings')
        .upsert({
          key: `join_requests_${userRoomId}`,
          value: JSON.stringify(updatedRequests),
          created_at: new Date().toISOString()
        }, { onConflict: 'key' });

      // Update declined status in user_requests_${req.uid}
      try {
        const { data: userReqData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', `user_requests_${req.uid}`)
          .maybeSingle();

        let userReqList = [];
        if (userReqData?.value) {
          try {
            userReqList = typeof userReqData.value === 'string' ? JSON.parse(userReqData.value) : userReqData.value;
            if (!Array.isArray(userReqList)) userReqList = [];
          } catch(e) { userReqList = []; }
        }

        const updatedUserReqList = userReqList.map(r => r.roomId === userRoomId ? { ...r, status: 'declined', declinedAt: new Date().toISOString() } : r);

        await supabase
          .from('system_settings')
          .upsert({
            key: `user_requests_${req.uid}`,
            value: JSON.stringify(updatedUserReqList),
            created_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (e) { console.warn("Notice: failed to update declined user request state:", e); }

      await logActivity('settings', `${userNickname} declined join request from ${req.nickname}`);
      await sendDeclineEmail(req, userRoomId, roomName, userNickname, user?.email);

      triggerToast(`Declined join request for ${req.nickname}. Notification email sent.`);
    } catch (err) {
      console.error("Decline join request error:", err);
      triggerToast(`Failed to decline request: ${err.message}`);
    }
  };

  // Real-time Home Screen Request Status Poller (runs every 3.5s while user is on Home/Selection screen)
  useEffect(() => {
    if (!user || hasConfirmedRoom) return;

    const fetchUserRequestStatus = async () => {
      try {
        const { data: userReqData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', `user_requests_${user.id}`)
          .maybeSingle();

        if (userReqData?.value) {
          const parsed = typeof userReqData.value === 'string' ? JSON.parse(userReqData.value) : userReqData.value;
          if (Array.isArray(parsed)) {
            setPendingUserRequests(parsed);
            localStorage.setItem('tallyin_pending_user_requests', JSON.stringify(parsed));
          }
        }

        // Also refresh user rooms to check for newly approved memberships
        await fetchUserRooms();
      } catch (e) {
        console.warn("Home request status poll error:", e);
      }
    };

    fetchUserRequestStatus();
    const interval = setInterval(fetchUserRequestStatus, 3500);

    return () => clearInterval(interval);
  }, [user, hasConfirmedRoom, fetchUserRooms]);

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
        individualBudget: Number(m.individual_budget) || 2000,
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

  // Reset room-specific states and reset view to home when switching rooms
  useEffect(() => {
    setTransactions([]);
    setReceipts([]);
    setMembers([]);
    setActivityLogs([]);
    setRoomCreatedBy(null);
    if (currentView !== 'admin') {
      setCurrentView('home');
    }
    setIsMobileMenuOpen(false);
    setIsInviteModalOpen(false);
    setIsManageRoomOpen(false);
  }, [userRoomId]);



  // Supabase Real-time Sync & Immediate Room Data Fetch
  useEffect(() => {
    if (!user || !userRoomId) return;

    // Trigger immediate parallel fetch for the active room (0ms latency)
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
        (payload) => {
          if (payload.new && payload.new.room_id !== userRoomId) return;
          if (payload.eventType === 'INSERT' && payload.new) {
            const mapped = mapDbTransaction(payload.new);
            setTransactions(prev => {
              if (prev.some(t => t.id === mapped.id)) return prev;
              const optIndex = prev.findIndex(t => 
                String(t.id).startsWith('optimistic-') &&
                t.title === mapped.title &&
                Number(t.amount) === Number(mapped.amount) &&
                t.category === mapped.category
              );
              if (optIndex !== -1) {
                const copy = [...prev];
                copy[optIndex] = mapped;
                return copy;
              }
              const newList = [mapped, ...prev];
              return newList.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
              });
            });

            const newTx = payload.new;
            const currentUid = user?.id || 'anonymous';
            if (newTx.paid_by_uid !== currentUid && newTx.category !== '__FUND_INIT__' && newTx.category !== '__FUND_SPEND__' && newTx.category !== '__SHOPPING__' && newTx.category !== '__BILL__' && newTx.category !== '__CHORE__') {
              if (Notification.permission === 'granted' && localStorage.getItem('pushNotificationsEnabled') === 'true') {
                try {
                  new Notification("New Room Expense Logged", {
                    body: `${newTx.paid_by || 'Roommate'} added "${newTx.title}" - ₹${newTx.amount}`,
                    icon: logoIcon || '/favicon.ico'
                  });
                } catch (e) {
                  console.warn("Failed to show browser notification:", e);
                }
              }
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const mapped = mapDbTransaction(payload.new);
            setTransactions(prev => prev.map(t => t.id === mapped.id ? mapped : t));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'receipts', filter: `room_id=eq.${userRoomId}` },
        (payload) => {
          if (payload.new && payload.new.room_id !== userRoomId) return;
          if (payload.eventType === 'INSERT' && payload.new) {
            const mapped = mapDbReceipt(payload.new);
            setReceipts(prev => {
              if (prev.some(r => r.id === mapped.id)) return prev;
              const optIndex = prev.findIndex(r => 
                String(r.id).startsWith('optimistic-') &&
                r.title === mapped.title &&
                Number(r.amount) === Number(mapped.amount)
              );
              if (optIndex !== -1) {
                const copy = [...prev];
                copy[optIndex] = mapped;
                return copy;
              }
              return [mapped, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const mapped = mapDbReceipt(payload.new);
            setReceipts(prev => prev.map(r => r.id === mapped.id ? mapped : r));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setReceipts(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
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
        (payload) => {
          if (payload.new && payload.new.room_id !== userRoomId) return;
          if (payload.eventType === 'INSERT' && payload.new) {
            const newLog = payload.new;
            setActivityLogs(prev => {
              if (prev.some(l => l.id === newLog.id)) return prev;
              const optIndex = prev.findIndex(l => 
                String(l.id).startsWith('optimistic-') &&
                l.action === newLog.action &&
                l.details === newLog.details
              );
              if (optIndex !== -1) {
                const copy = [...prev];
                copy[optIndex] = newLog;
                return copy;
              }
              return [newLog, ...prev].slice(0, 100);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for room ${userRoomId}:`, status);
      });

    // Background Auto-Sync Poll Loop for Cloudflare Worker D1 HTTP REST API backend (3.5s real-time sync)
    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && userRoomId) {
        fetchTransactions(userRoomId);
        fetchReceipts(userRoomId);
        fetchRoomSettings(userRoomId);
        fetchMembers(userRoomId);
        fetchActivityLogs(userRoomId);
      }
    }, 3500);

    return () => {
      clearInterval(syncInterval);
      supabase.removeChannel(channel);
    };
  }, [user, userRoomId, fetchTransactions, fetchReceipts, fetchRoomSettings, fetchMembers, fetchActivityLogs]);



  // Initialize settings draft inputs whenever Manage Room modal is opened
  useEffect(() => {
    if (isManageRoomOpen) {
      setSettingsMaxMembersInput(roomMaxMembers);
      setSettingsRoomNameInput(roomName);
    }
  }, [isManageRoomOpen, roomMaxMembers, roomName]);

  // Check for due recurring expenses (Feature 1)
  useEffect(() => {
    if (!transactions.length || !user) return;
    const todayStr = getLocalDateStr();
    const due = [];
    transactions.forEach(t => {
      if (t.time && t.time.includes('RECURRING:')) {
        const parts = t.time.split('|');
        const recPart = parts.find(p => p.startsWith('RECURRING:'));
        if (recPart) {
          const [, interval, nextDue] = recPart.split(':');
          if (nextDue && nextDue <= todayStr) {
            due.push({ tx: t, interval, nextDue });
          }
        }
      }
    });
    setPendingRecurringTxs(due);
  }, [transactions, user]);

  const handlePostRecurringExpense = async (txObj, nextDue) => {
    if (postingRecurringIds.includes(txObj.id)) return;
    setPostingRecurringIds(prev => [...prev, txObj.id]);
    try {
      const todayStr = getLocalDateStr();
      const currentUid = user?.id || 'anonymous';
      const { error: insertErr } = await supabase
        .from('transactions')
        .insert({
          room_id: txObj.roomId,
          title: `${txObj.title} (Recurring)`,
          amount: txObj.amount,
          category: txObj.category,
          date: todayStr,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          paid_by: txObj.paidBy,
          paid_by_uid: txObj.paidByUid,
          is_shared: txObj.isShared,
          split_type: txObj.splitType,
          split: txObj.split,
          splits: txObj.splits,
          created_by: currentUid
        });

      if (insertErr) throw insertErr;

      const d = new Date(nextDue);
      d.setMonth(d.getMonth() + 1);
      const nextNextDueStr = d.toISOString().split('T')[0];

      const recInfo = txObj.time.split('|').find(p => p.startsWith('RECURRING:'));
      const updatedTimeStr = txObj.time.replace(recInfo, `RECURRING:monthly:${nextNextDueStr}`);

      const { error: updateErr } = await supabase
        .from('transactions')
        .update({
          time: updatedTimeStr
        })
        .eq('id', txObj.id);

      if (updateErr) throw updateErr;

      triggerToast(`Recurring expense "${txObj.title}" logged for today!`);
      await logActivity('create', `${userNickname} posted recurring expense "${txObj.title}" (₹${txObj.amount})`);
      
      setPendingRecurringTxs(prev => prev.filter(item => item.tx.id !== txObj.id));
    } catch (e) {
      console.error(e);
      triggerToast('Failed to post recurring expense: ' + e.message);
    } finally {
      setPostingRecurringIds(prev => prev.filter(id => id !== txObj.id));
    }
  };

  // Login handler
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(firebaseAuth, googleProvider);
        } catch (redirErr) {
          console.error("Firebase redirect login error:", redirErr);
          setAuthError(`Auth Error: ${redirErr.message}`);
          setAuthLoading(false);
        }
      } else {
        console.error("Firebase login error:", err);
        setAuthError(`Auth Error: ${err.message}`);
        triggerToast(`Authentication failed: ${err.message}.`);
        setAuthLoading(false);
      }
    }
  };

  const handleCodeLogin = async (e) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;
    
    setIsVerifyingCode(true);
    setAuthError(null);
    
    try {
      const code = accessCodeInput.trim().toUpperCase();
      
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('login_code', code)
        .maybeSingle();
        
      if (profileError) throw profileError;
      
      if (!userProfile) {
        throw new Error('Invalid access code. Please verify and try again.');
      }
      
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('uid', userProfile.uid)
        .limit(1);
        
      if (memberError) console.warn("Member fetch warning for code user:", memberError);
      const member = memberData?.[0];
      
      const TEST_CODE_NAMES = {
        'TY1001': 'Tester 1',
        'TY1002': 'Tester 2',
        'TY1003': 'Tester 3',
        'TY1004': 'Tester 4',
        'TY1005': 'Tester 5',
        'TY1006': 'Tester 6',
      };
      const autoName = TEST_CODE_NAMES[code] || member?.nickname || 'Roommate';

      setUserNickname(autoName);
      setUserNicknameInput(autoName);
      localStorage.setItem('userNickname', autoName);

      const realEmail = codeLoginEmail.trim().toLowerCase() || `tester${code.slice(-1)}@tallyin.app`;
      const simulatedUser = {
        id: userProfile.uid,
        email: realEmail || member?.email || '',
        user_metadata: {
          full_name: autoName,
          avatar_url: member?.photo_url || ''
        },
        isCodeLogin: true,
        loginCode: code
      };
      
      // Save the real email back to the members table if provided
      if (realEmail && member) {
        supabase.from('members')
          .update({ email: realEmail })
          .eq('uid', userProfile.uid)
          .then(({ error }) => { if (error) console.warn('Email save error:', error); });
      }
      
      localStorage.setItem('tallyin_code_user', JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      
      if (userProfile.room_id) {
        setUserRoomId(userProfile.room_id);
        localStorage.setItem('userRoomId', userProfile.room_id);
      }
      
      const nick = member?.nickname || 'You';
      setUserNickname(nick);
      setNicknameInput(nick);
      localStorage.setItem('userNickname', nick);
      setIsNicknameFixed(true);
      setHasConfirmedRoom(true);
      
      triggerToast('Logged in successfully via access code!');
    } catch (err) {
      console.error(err);
      setAuthError(err.message || 'Verification failed.');
      triggerToast(err.message || 'Verification failed.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Delete Room handler
  const handleDeleteRoom = async (bypassHostCheck = false, skipConfirmation = false) => {
    if (!userRoomId || !user) return;
    const isHost = roomCreatedBy && roomCreatedBy === user.id;

    // Strict Permission check: non-hosts cannot delete room directly
    if (!bypassHostCheck && !isHost) {
      triggerToast('⛔ Only the Room Host (Admin) can delete this room space.');
      return;
    }
    if (!skipConfirmation) {
      const confirmed = window.confirm(`Delete room ${userRoomId} permanently? All transactions and data will be lost. This cannot be undone.`);
      if (!confirmed) return;
    }
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

      // 1b. Generate and download CSV statement
      try {
        const statementList = transactions.filter(t => t.category !== '__DELETE_PROPOSAL__');
        if (statementList.length > 0) {
          exportToCSV(statementList);
        }
      } catch (e) {
        console.warn("Failed to auto-download statement CSV:", e);
      }

      // 2. Delete room from rooms table (will cascade delete members, transactions, receipts)
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', userRoomId);

      if (deleteError) throw deleteError;

      // Reset user room binding for all members of this room
      try {
        await supabase
          .from('users')
          .update({ room_id: null })
          .eq('room_id', userRoomId);
      } catch(e) {
        console.warn("Could not unbind room_id for members:", e);
      }

      // Clear local state first
      setUserRoomId(null);
      setHasConfirmedRoom(false);
      setTransactions([]);
      setReceipts([]);
      setMembers([]);
      setActivityLogs([]);
      setRoomCreatedBy(null);
      localStorage.removeItem('userRoomId');
      
      // Reset user room binding for current user
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

  // Delete Room Proposal Memo
  const deleteProposal = useMemo(() => {
    return transactions.find(t => t.category === '__DELETE_PROPOSAL__');
  }, [transactions]);

  // Propose Room Deletion
  const handleProposeDeleteRoom = async () => {
    if (!userRoomId || !user) return;
    const isHost = roomCreatedBy && roomCreatedBy === user.id;
    if (!isHost) {
      triggerToast('⛔ Only the Room Host (Admin) can propose room deletion.');
      return;
    }

    const confirmed = window.confirm("Are you sure you want to propose deleting this room permanently? This requires approval from all members.");
    if (!confirmed) return;

    try {
      // Create a __DELETE_PROPOSAL__ transaction
      const proposalTx = {
        room_id: userRoomId,
        title: 'Delete Room Proposal',
        amount: 0,
        category: '__DELETE_PROPOSAL__',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        paid_by: userNickname,
        paid_by_uid: user.id,
        is_shared: true,
        split_type: 'equal',
        splits: [
          {
            uid: user.id,
            nickname: userNickname,
            approved: true,
            timestamp: new Date().toISOString()
          }
        ],
        created_by: user.id
      };

      const { error } = await supabase
        .from('transactions')
        .insert(proposalTx);

      if (error) throw error;

      await logActivity('settings', `${userNickname} proposed room deletion`);
      triggerToast('Room deletion proposal created!');
      
      // If there is only 1 member in the room, met immediately
      if (members.length <= 1) {
        await handleDeleteRoom(true, true);
      }
    } catch (err) {
      console.error('Propose delete room error:', err);
      triggerToast(`Failed to propose room deletion: ${err.message}`);
    }
  };

  // Approve Room Deletion
  const handleApproveDeleteRoom = async (proposalTx) => {
    if (!userRoomId || !user || !proposalTx) return;

    // Check if already approved
    const existingSplits = proposalTx.splits || [];
    if (existingSplits.some(s => s.uid === user.id)) {
      triggerToast('You have already approved this deletion proposal.');
      return;
    }

    try {
      const updatedSplits = [
        ...existingSplits,
        {
          uid: user.id,
          nickname: userNickname,
          approved: true,
          timestamp: new Date().toISOString()
        }
      ];

      // Update proposal transaction
      const { error } = await supabase
        .from('transactions')
        .update({ splits: updatedSplits })
        .eq('id', proposalTx.id);

      if (error) throw error;

      await logActivity('settings', `${userNickname} approved room deletion`);
      triggerToast('Approval submitted!');

      // Check if all members have now approved
      const approvedUids = new Set(updatedSplits.map(s => s.uid));
      const allApproved = members.every(m => approvedUids.has(m.uid));

      if (allApproved) {
        triggerToast('All members have approved! Finalizing deletion...');
        // Perform actual deletion (bypass check is true, skipConfirmation is true)
        await handleDeleteRoom(true, true);
      }
    } catch (err) {
      console.error('Approve delete room error:', err);
      triggerToast(`Failed to approve room deletion: ${err.message}`);
    }
  };

  // Reject / Cancel Room Deletion
  const handleRejectDeleteRoom = async (proposalTx) => {
    if (!userRoomId || !proposalTx) return;
    const confirmed = window.confirm("Are you sure you want to cancel the room deletion proposal? This will reject the deletion for all members.");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', proposalTx.id);

      if (error) throw error;

      await logActivity('settings', `${userNickname} cancelled the room deletion proposal`);
      triggerToast('Room deletion proposal cancelled.');
    } catch (err) {
      console.error('Reject delete room error:', err);
      triggerToast(`Failed to cancel room deletion: ${err.message}`);
    }
  };



  // Auto-delete trigger for host when all members approve a deletion proposal
  useEffect(() => {
    if (!userRoomId || !user) return;
    const isHost = roomCreatedBy && roomCreatedBy === user.id;
    if (!isHost || !deleteProposal || members.length === 0) return;

    const approvedSplits = deleteProposal.splits || [];
    const approvedUids = new Set(approvedSplits.map(s => s.uid));
    const allApproved = members.every(m => approvedUids.has(m.uid));

    if (allApproved) {
      console.log('Host client detected all approvals. Executing room deletion...');
      const timer = setTimeout(() => {
        handleDeleteRoom(true, true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [deleteProposal, members, user, userRoomId, roomCreatedBy, handleDeleteRoom]);

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

      // Auto-adjust room capacity limit down upon member exit
      try {
        const { data: remMembers } = await supabase
          .from('members')
          .select('uid')
          .eq('room_id', userRoomId);

        const remainingCount = remMembers ? remMembers.length : 0;
        const { data: currentRoom } = await supabase
          .from('rooms')
          .select('max_members')
          .eq('id', userRoomId)
          .maybeSingle();

        const currentMax = currentRoom?.max_members ? Number(currentRoom.max_members) : 6;
        const adjustedCapacity = Math.max(2, Math.min(currentMax - 1, Math.max(remainingCount, 2)));

        await supabase
          .from('rooms')
          .update({ max_members: adjustedCapacity })
          .eq('id', userRoomId);
      } catch (capErr) {
        console.warn("Notice: failed to auto-adjust room capacity on exit:", capErr);
      }

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

      // Auto-adjust room capacity limit down upon member removal
      try {
        const { data: remMembers } = await supabase
          .from('members')
          .select('uid')
          .eq('room_id', userRoomId);

        const remainingCount = remMembers ? remMembers.length : 0;
        const currentMax = roomMaxMembers ? Number(roomMaxMembers) : 6;
        const adjustedCapacity = Math.max(2, Math.min(currentMax - 1, Math.max(remainingCount, 2)));

        await supabase
          .from('rooms')
          .update({ max_members: adjustedCapacity })
          .eq('id', userRoomId);

        setRoomMaxMembers(adjustedCapacity);
        setSettingsMaxMembersInput(adjustedCapacity);
      } catch (capErr) {
        console.warn("Notice: failed to auto-adjust room capacity on member removal:", capErr);
      }

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
      fetchMembers(userRoomId);
      triggerToast(`Removed ${member.nickname} from room.`);
    } catch (err) {
      console.error('Remove member error:', err);
      triggerToast('Failed to remove member.');
    }
  };

  // Update member individual budget handler
  const handleUpdateMemberBudget = async (memberUid, budgetVal) => {
    if (!userRoomId || !memberUid) return;
    const bNum = Math.max(0, Number(budgetVal) || 0);
    try {
      const { error } = await supabase
        .from('members')
        .update({ individual_budget: bNum })
        .eq('room_id', userRoomId)
        .eq('uid', memberUid);

      if (error) throw error;

      setMembers(prev => prev.map(m => m.uid === memberUid ? { ...m, individualBudget: bNum } : m));
      triggerToast('Roommate budget updated!');
      setEditingMemberBudget(null);
      setNewMemberBudgetVal('');
      logActivity('update_budget', `Updated budget for roommate to ₹${bNum}`);
    } catch (err) {
      console.error('Error updating member budget:', err);
      triggerToast('Failed to update roommate budget.');
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('tallyin_code_user');
      setUser(null);

      try {
        await fbSignOut(firebaseAuth);
      } catch (authErr) {
        console.warn("Firebase auth signout warning:", authErr);
      }

      setTransactions([]);
      setReceipts([]);
      setActivityLogs([]);
      setUserRoomId(null);
      localStorage.removeItem('userRoomId');
      localStorage.removeItem('userNickname');
      setUserNickname('You');
      setNicknameInput('You');
      setIsNicknameFixed(false);
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
      await fbSignOut(firebaseAuth);
      
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
      fetchTransactions(userRoomId || tx.room_id);
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
      const initialMaxMembers = Number(roomMaxMembersInput) || 6;
      let roomError = null;

      try {
        const { error: errWithMode } = await supabase
          .from('rooms')
          .insert({
            id: uniqueCode,
            created_by: user ? user.id : 'anonymous',
            created_at: new Date().toISOString(),
            monthly_budget: monthlyBudget,
            max_members: initialMaxMembers,
            name: roomNameInput.trim() || 'Tallyin',
            room_mode: selectedRoomMode
          });

        if (errWithMode) {
          console.warn("D1 room_mode insert check/fallback:", errWithMode);
          const { error: errFallback } = await supabase
            .from('rooms')
            .insert({
              id: uniqueCode,
              created_by: user ? user.id : 'anonymous',
              created_at: new Date().toISOString(),
              monthly_budget: monthlyBudget,
              max_members: initialMaxMembers,
              name: roomNameInput.trim() || 'Tallyin'
            });
          roomError = errFallback;
        }
      } catch (e) {
        const { error: errFallback } = await supabase
          .from('rooms')
          .insert({
            id: uniqueCode,
            created_by: user ? user.id : 'anonymous',
            created_at: new Date().toISOString(),
            monthly_budget: monthlyBudget,
            max_members: initialMaxMembers,
            name: roomNameInput.trim() || 'Tallyin'
          });
        roomError = errFallback;
      }

      if (roomError) throw roomError;

      // Always save room_mode to system_settings as fail-safe fallback
      try {
        await supabase
          .from('system_settings')
          .upsert({
            key: `room_mode_${uniqueCode}`,
            value: JSON.stringify({ mode: selectedRoomMode }),
            created_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (e) {}

      setIsQuotaMode(selectedRoomMode === 'quota');
      localStorage.setItem('isQuotaMode', selectedRoomMode === 'quota' ? 'true' : 'false');
      localStorage.setItem(`roomMode_${uniqueCode}`, selectedRoomMode);
      
      setRoomMaxMembers(initialMaxMembers);
      setSettingsMaxMembersInput(initialMaxMembers);
      
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

      // Check room capacity limit
      const { data: existingMembers, error: membersErr } = await supabase
        .from('members')
        .select('uid')
        .eq('room_id', cleanId);

      if (membersErr) throw membersErr;

      const currentUid = user?.id;
      const isAlreadyMember = (existingMembers || []).some(m => m.uid === currentUid);
      const maxLimit = room.max_members ? Number(room.max_members) : 6;
      const currentCount = existingMembers ? existingMembers.length : 0;

      if (!isAlreadyMember && currentCount >= maxLimit) {
        const hostUid = room.created_by;
        let hostNickname = 'Room Admin';
        let hostEmail = '';

        if (hostUid) {
          const { data: hostMember } = await supabase
            .from('members')
            .select('nickname, email')
            .eq('room_id', cleanId)
            .eq('uid', hostUid)
            .maybeSingle();

          if (hostMember) {
            hostNickname = hostMember.nickname || 'Room Admin';
            hostEmail = hostMember.email || '';
          }
        }

        setJoinRequestModalInfo({
          roomId: cleanId,
          roomName: room.name || 'Tallyin Room',
          hostNickname,
          hostEmail,
          currentCount,
          maxLimit
        });
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
    const data = transactions.filter(t => t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__' && t.category !== '__SHOPPING__' && t.category !== '__BILL__' && t.category !== '__CHORE__' && t.category !== '__DELETE_PROPOSAL__');
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';

    // Calculate totals
    let totalSpend = 0;
    let totalRoomSpend = 0;
    let personalSpend = 0;
    let sharedSpend = 0;
    
    // Map of member uid to net balance: paid - share
    const roomBalances = {};
    const memberOutofPocket = {};
    
    // Initialize balances and spent amounts for all current members
    members.forEach(m => {
      roomBalances[m.uid] = 0;
      memberOutofPocket[m.uid] = 0;
    });
    
    // Default fallback if members list is empty
    if (members.length === 0) {
      roomBalances[currentUid] = 0;
      roomBalances['roommate'] = 0;
      memberOutofPocket[currentUid] = 0;
      memberOutofPocket['roommate'] = 0;
    }

    data.forEach(t => {
      const amount = Number(t.amount) || 0;
      const isPayment = t.category === 'Payment';
      
      if (!isPayment) {
        totalSpend += amount;
        if (t.isShared) {
          totalRoomSpend += amount;
        }
      }

      // Determine payer UID
      let payerUid = t.paidByUid;
      if (!payerUid) {
        const match = members.find(m => m.nickname === t.paidBy || m.name === t.paidBy || m.email === t.paidBy);
        if (match) {
          payerUid = match.uid;
        } else {
          const isSelf = t.paidBy === userNickname;
          payerUid = isSelf ? currentUid : 'roommate';
        }
      }

      if (!isPayment) {
        memberOutofPocket[payerUid] = (memberOutofPocket[payerUid] || 0) + amount;
      }

      if (isPayment) {
        // Add paid amount to payer's balance (since they paid, their net balance increases)
        if (roomBalances[payerUid] !== undefined) {
          roomBalances[payerUid] += amount;
        } else {
          roomBalances[payerUid] = amount;
        }

        // Parse splits safely if string
        let splitsArr = t.splits;
        if (typeof splitsArr === 'string') {
          try {
            splitsArr = JSON.parse(splitsArr);
          } catch (e) {
            splitsArr = null;
          }
        }

        let receiverUid = null;
        if (splitsArr && Array.isArray(splitsArr)) {
          const recSplit = splitsArr.find(s => {
            let sUid = s.uid;
            if (!sUid) {
              const match = members.find(m => m.nickname === s.nickname || m.name === s.nickname);
              sUid = match ? match.uid : null;
            }
            return sUid !== payerUid && (Number(s.amount) > 0 || splitsArr.length === 2);
          });
          if (recSplit) {
            receiverUid = recSplit.uid;
            if (!receiverUid) {
              const match = members.find(m => m.nickname === recSplit.nickname || m.name === recSplit.nickname);
              receiverUid = match ? match.uid : null;
            }
            if (!receiverUid) {
              const isSelf = recSplit.nickname === userNickname || recSplit.nickname === 'Alex';
              receiverUid = isSelf ? currentUid : 'roommate';
            }
          }
        }

        // Fallback receiver if splits are empty or invalid
        if (!receiverUid) {
          const otherMember = members.find(m => m.uid !== payerUid);
          if (otherMember) {
            receiverUid = otherMember.uid;
          } else {
            receiverUid = payerUid === currentUid ? 'roommate' : currentUid;
          }
        }

        // Subtract paid amount from receiver's balance (since they received, their net balance decreases)
        if (roomBalances[receiverUid] !== undefined) {
          roomBalances[receiverUid] -= amount;
        } else {
          roomBalances[receiverUid] = -amount;
        }
      } else {
        // Regular expense balance calculation
        if (roomBalances[payerUid] !== undefined) {
          roomBalances[payerUid] += amount;
        } else {
          roomBalances[payerUid] = amount;
        }

        // Subtract split shares from everyone
        if (t.splits && Array.isArray(t.splits) && t.splits.length > 0) {
          t.splits.forEach(split => {
            let splitUid = split.uid;
            if (!splitUid) {
              const match = members.find(m => m.nickname === split.nickname || m.name === split.nickname);
              splitUid = match ? match.uid : null;
            }
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
          // Fallback when splits is empty/missing: split equally among ALL room members
          if (t.isShared) {
            sharedSpend += amount;
            const mKeys = Object.keys(roomBalances);
            if (mKeys.length > 0) {
              const share = amount / mKeys.length;
              mKeys.forEach(k => {
                roomBalances[k] -= share;
              });
            } else {
              // Legacy 50/50 fallback if no members list
              const halfShare = amount / 2;
              roomBalances[currentUid] -= halfShare;
              const roommateUid = members.find(m => m.uid !== currentUid)?.uid || 'roommate';
              if (roomBalances[roommateUid] !== undefined) {
                roomBalances[roommateUid] -= halfShare;
              } else {
                roomBalances[roommateUid] = -halfShare;
              }
            }
          } else {
            if (payerUid === currentUid) {
              personalSpend += amount;
            }
            roomBalances[payerUid] -= amount;
          }
        }
      }
    });

    // Round values to 2 decimal places and auto-reconcile orphan balances for active members
    Object.keys(roomBalances).forEach(uid => {
      roomBalances[uid] = Math.round(roomBalances[uid] * 100) / 100;
    });

    const activeMemberUids = members.map(m => m.uid);
    if (activeMemberUids.length > 0) {
      Object.keys(roomBalances).forEach(k => {
        if (!activeMemberUids.includes(k) && roomBalances[k] !== 0) {
          const orphanBal = roomBalances[k];
          if (activeMemberUids.length === 2) {
            const otherMemberUid = activeMemberUids.find(id => id !== currentUid) || activeMemberUids[0];
            if (otherMemberUid) {
              roomBalances[otherMemberUid] = Math.round(((roomBalances[otherMemberUid] || 0) + orphanBal) * 100) / 100;
            }
          }
          delete roomBalances[k];
        }
      });
    }

    // Filter out micro-penny rounding artifacts (e.g. ±0.01 / ±0.02) from division remainders
    Object.keys(roomBalances).forEach(uid => {
      if (Math.abs(roomBalances[uid]) <= 0.02) {
        roomBalances[uid] = 0;
      }
    });

    totalSpend = Math.round(totalSpend * 100) / 100;
    totalRoomSpend = Math.round(totalRoomSpend * 100) / 100;
    sharedSpend = Math.round(sharedSpend * 100) / 100;
    personalSpend = Math.round(personalSpend * 100) / 100;

    // Settlement Statistics
    const settlementTransactions = data.filter(t => t.category === 'Payment' || t.splitType === 'settlement' || (t.title && t.title.startsWith('Payment:')));
    const settlementCount = settlementTransactions.length;
    const totalSettledAmount = Math.round(settlementTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) * 100) / 100;

    let mySettlementsPaid = 0;
    let mySettlementsReceived = 0;

    settlementTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      let payerUid = t.paidByUid;
      if (!payerUid) {
        payerUid = t.paidBy === userNickname ? currentUid : 'roommate';
      }
      if (payerUid === currentUid) {
        mySettlementsPaid += amt;
      }

      let isReceiver = false;
      if (t.splits && Array.isArray(t.splits)) {
        isReceiver = t.splits.some(s => s.uid === currentUid && Number(s.amount) > 0);
      } else if (payerUid !== currentUid) {
        isReceiver = true;
      }
      if (isReceiver && payerUid !== currentUid) {
        mySettlementsReceived += amt;
      }
    });

    mySettlementsPaid = Math.round(mySettlementsPaid * 100) / 100;
    mySettlementsReceived = Math.round(mySettlementsReceived * 100) / 100;

    let finalBalances = roomBalances;
    let totalExcessPool = 0;
    let excessSharePerMember = 0;

    if (isQuotaMode && members.length > 0) {
      const quotaBalances = {};
      const memberExcessMap = {};
      
      members.forEach(m => {
        const spent = memberOutofPocket[m.uid] || 0;
        const budget = Number(m.individualBudget) || 2000;
        const excess = Math.max(0, spent - budget);
        memberExcessMap[m.uid] = excess;
        totalExcessPool += excess;
      });

      excessSharePerMember = totalExcessPool / members.length;

      members.forEach(m => {
        const excess = memberExcessMap[m.uid] || 0;
        let netBal = excess - excessSharePerMember;
        quotaBalances[m.uid] = Math.round(netBal * 100) / 100;
      });

      // Factor in direct settlements/payments
      settlementTransactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        let payerUid = t.paidByUid;
        if (!payerUid) {
          payerUid = t.paidBy === userNickname ? currentUid : 'roommate';
        }
        if (quotaBalances[payerUid] !== undefined) {
          quotaBalances[payerUid] += amt;
        }
        
        let receiverUid = null;
        if (t.splits && Array.isArray(t.splits)) {
          const recSplit = t.splits.find(s => s.uid !== payerUid && Number(s.amount) > 0);
          if (recSplit) receiverUid = recSplit.uid;
        }
        if (!receiverUid) {
          const other = members.find(m => m.uid !== payerUid);
          if (other) receiverUid = other.uid;
        }
        if (receiverUid && quotaBalances[receiverUid] !== undefined) {
          quotaBalances[receiverUid] -= amt;
        }
      });

      Object.keys(quotaBalances).forEach(uid => {
        quotaBalances[uid] = Math.round(quotaBalances[uid] * 100) / 100;
      });

      finalBalances = quotaBalances;
    }

    const totalRoomBudgetPool = members.reduce((sum, m) => sum + (Number(m.individualBudget) || 2000), 0);
    const memberBudgetStats = members.map(m => {
      const spent = memberOutofPocket[m.uid] || 0;
      const budget = Number(m.individualBudget) || 2000;
      const quotaUsed = Math.min(spent, budget);
      const excess = Math.max(0, spent - budget);
      const remaining = Math.max(0, budget - spent);
      const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      return {
        ...m,
        spent: Math.round(spent * 100) / 100,
        budget,
        quotaUsed: Math.round(quotaUsed * 100) / 100,
        excess: Math.round(excess * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        pct,
        isExhausted: spent >= budget
      };
    });

    let suggestedNextBuyer = null;
    if (memberBudgetStats.length > 0) {
      suggestedNextBuyer = [...memberBudgetStats].sort((a, b) => b.remaining - a.remaining)[0];
    }

    const currentUserBalance = finalBalances[currentUid] || 0;

    return {
      totalSpend,
      totalRoomSpend,
      sharedSpend,
      personalSpend,
      balances: finalBalances,
      currentUserBalance,
      totalCount: data.length,
      juneSpend: totalSpend,
      totalShared: sharedSpend,
      personalPaidAlex: personalSpend,
      settlementCount,
      totalSettledAmount,
      mySettlementsPaid,
      mySettlementsReceived,
      memberBudgetStats,
      totalRoomBudgetPool,
      suggestedNextBuyer,
      totalExcessPool: Math.round(totalExcessPool * 100) / 100,
      excessSharePerMember: Math.round(excessSharePerMember * 100) / 100
    };
  }, [transactions, members, userNickname, auth.currentUser, isQuotaMode]);

  // Suggested Transfers to settle up debts cleanly
  const suggestedTransfers = useMemo(() => {
    const balances = { ...computedStats.balances };
    const debtors = [];
    const creditors = [];
    
    Object.entries(balances).forEach(([uid, bal]) => {
      const member = members.find(m => m.uid === uid);
      if (member) {
        if (bal < -0.01) {
          debtors.push({ uid, nickname: member.nickname, amount: Math.abs(bal) });
        } else if (bal > 0.01) {
          creditors.push({ uid, nickname: member.nickname, amount: bal });
        }
      }
    });
    
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    const transfers = [];
    let dIdx = 0;
    let cIdx = 0;
    
    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      
      const payment = Math.min(debtor.amount, creditor.amount);
      if (payment > 0.01) {
        transfers.push({
          fromUid: debtor.uid,
          fromName: debtor.nickname,
          toUid: creditor.uid,
          toName: creditor.nickname,
          amount: payment
        });
      }
      
      debtor.amount -= payment;
      creditor.amount -= payment;
      
      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }
    
    return transfers;
  }, [computedStats.balances, members]);

  // Helper to check if transaction is marked as paid back
  const isTxPaidBack = (t) => {
    return t && t.split && typeof t.split === 'string' && t.split.includes('[PAID_BACK]');
  };

  // Helper to format clean, human-readable Transaction ID
  const formatTxId = (id) => {
    if (!id) return 'TX-999999';
    const str = String(id).trim();
    if (str.startsWith('TX-')) return str.toUpperCase();
    if (str.startsWith('optimistic-')) {
      const parts = str.split('-');
      const numStr = (parts[parts.length - 1] || '').slice(-6);
      return `TX-${numStr || '888888'}`;
    }
    if (str.length > 8 && str.includes('-')) {
      return `TX-${str.split('-')[0].toUpperCase()}`;
    }
    return `TX-${str.toUpperCase()}`;
  };

  // Helper to match transaction against universal search query (supports TX ID, title, category, paidBy, amount, splits, date, month, notes)
  const matchesTxSearch = (t, queryStr) => {
    if (!queryStr || !queryStr.trim()) return true;
    if (!t) return false;

    // Split search query into clean lowercase terms (supports multi-keyword search like "Food Alex 100")
    const terms = queryStr.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;

    // Build exhaustive searchable text block for this transaction
    const rawId = String(t.id || '').toLowerCase();
    const formattedId = formatTxId(t.id).toLowerCase();
    const title = String(t.title || '').toLowerCase();
    const category = String(t.category || '').toLowerCase();
    const amountRaw = String(t.amount ?? '').toLowerCase();
    const amountFormatted = formatINR(t.amount).toLowerCase();
    const paidBy = String(t.paidBy || t.paid_by || '').toLowerCase();
    const notes = String(t.notes || t.description || '').toLowerCase();
    const splitType = String(t.splitType || t.split || '').toLowerCase();
    const isSharedStr = t.isShared ? 'shared room' : 'personal private';
    
    // Extract dates & months
    const dateStr = String(t.date || '').toLowerCase();
    let monthNameStr = '';
    if (t.date) {
      try {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          monthNameStr = d.toLocaleString('default', { month: 'long', year: 'numeric' }).toLowerCase() + ' ' +
                         d.toLocaleString('default', { month: 'short' }).toLowerCase();
        }
      } catch (e) {
        // ignore date parse error
      }
    }
    const timeStr = String(t.time || '').toLowerCase();

    // Extract all member names involved in splits
    let splitsNames = '';
    if (t.splits && Array.isArray(t.splits)) {
      splitsNames = t.splits.map(s => String(s.nickname || s.name || s.uid || '')).join(' ').toLowerCase();
    }

    // Combine all fields into a single searchable text
    const searchableText = `${rawId} ${formattedId} ${title} ${category} ${amountRaw} ${amountFormatted} ${paidBy} ${notes} ${splitType} ${isSharedStr} ${dateStr} ${monthNameStr} ${timeStr} ${splitsNames}`;

    // Every search term must match somewhere in the combined searchable text
    return terms.every(term => searchableText.includes(term));
  };

  // Helper to resolve split label without paid back status
  const getDisplaySplitLabel = (t) => {
    if (!t || !t.split) return '';
    return t.split.replace(' [PAID_BACK]', '');
  };

  // Helper to resolve display categories for audited transactions
  const getDisplayCategory = (splitType, isAuditActive) => {
    const raw = splitType || 'Other';
    if (raw.startsWith('Audited:')) {
      return isAuditActive ? 'Audited' : raw.split(':')[1];
    }
    return raw;
  };

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
    
    if (t.category === 'Payment') {
      let receiverName = '';
      if (t.splits && Array.isArray(t.splits)) {
        const receiver = t.splits.find(s => s.uid !== t.paidByUid);
        if (receiver) {
          receiverName = receiver.uid === currentUid ? 'You' : receiver.nickname;
        }
      }
      if (receiverName) {
        return `${payerName} paid • Settlement to ${receiverName}`;
      }
      return `${payerName} paid • Direct Settlement Payment`;
    }

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
  const sendEmailNotification = async (transaction, actionType = 'add') => {
    if (notificationMethod === 'none') return;

    const rawAmt = Number(transaction?.amount ?? 0);
    const amountVal = isNaN(rawAmt) ? 0 : rawAmt;
    const formattedAmount = `₹${amountVal.toLocaleString("en-IN")}`;
    const activeRoomId = userRoomId || localStorage.getItem('userRoomId') || 'TL-ROOM';
    const roomDisplayName = activeRoomId;
    const txTitle = transaction?.title || 'Expense';
    const txPaidBy = transaction?.paidBy || transaction?.paid_by || 'Roommate';
    const txCategory = transaction?.category || 'General';
    const txDate = transaction?.date || getLocalDateStr();
    const rawTime = transaction?.time || '';
    const parsedTimeObj = parseTimeAndHistory(rawTime);
    const txTime = parsedTimeObj.time || (rawTime ? String(rawTime).split('|')[0] : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    const txDateTime = `${txDate} • ${txTime}`;
    const isSettlement = actionType === 'settle' || txCategory === 'Payment' || (txTitle && txTitle.startsWith('Payment:'));
    const txSplit = isSettlement
      ? 'Direct Settlement Transfer'
      : (transaction?.split || (transaction?.isShared ? 'Split equally' : 'Personal'));
    const txIdFormatted = formatTxId(transaction?.id);
    
    let actionTitle = 'New Expense Logged';
    let actionBadge = 'Expense Logged';
    let subjectText = `Tallyin: ${txPaidBy} added ${formattedAmount} for "${txTitle}"`;
    let introText = `A new transaction "${txTitle}" of <strong>${formattedAmount}</strong> has been logged in room <strong>${roomDisplayName}</strong> by <strong>${txPaidBy}</strong>.`;

    if (actionType === 'update' || actionType === 'edit') {
      actionTitle = 'Expense Updated';
      actionBadge = 'Expense Updated';
      subjectText = `Tallyin: Updated expense "${txTitle}" (${formattedAmount})`;
      introText = `The expense "${txTitle}" (${formattedAmount}) was updated in room <strong>${roomDisplayName}</strong> by <strong>${txPaidBy}</strong>.`;
    } else if (actionType === 'settle') {
      actionTitle = 'Payment Settled';
      actionBadge = 'Payment Settled';
      subjectText = `Tallyin: Settlement of ${formattedAmount} from ${txPaidBy}`;
      introText = `A settlement payment of <strong>${formattedAmount}</strong> was recorded in room <strong>${roomDisplayName}</strong> by <strong>${txPaidBy}</strong>.`;
    } else if (actionType === 'bill_due_2days') {
      actionTitle = '⏳ Bill Due in 2 Days';
      actionBadge = 'Upcoming Bill';
      subjectText = `[Tallyin Reminder] Bill "${txTitle}" is due in 2 days (${formattedAmount})`;
      introText = `Reminder: The flat bill <strong>"${txTitle}"</strong> of <strong>${formattedAmount}</strong> is due on <strong>${txDate}</strong> (in 2 days).`;
    } else if (actionType === 'bill_due_today') {
      actionTitle = '🔔 Bill Due Today!';
      actionBadge = 'Bill Due Today';
      subjectText = `[Tallyin Alert] Bill "${txTitle}" is due TODAY (${formattedAmount})`;
      introText = `Action Required: The flat bill <strong>"${txTitle}"</strong> of <strong>${formattedAmount}</strong> is due <strong>TODAY (${txDate})</strong>. Please pay & log it in DuoShare.`;
    } else if (actionType === 'new_member') {
      actionTitle = '🎉 New Roommate Joined!';
      actionBadge = 'New Roommate';
      subjectText = `🎉 ${txPaidBy} has joined room "${roomDisplayName}" on Tallyin!`;
      introText = `Great news! <strong>${txPaidBy}</strong> has joined your Tallyin shared space <strong>${roomDisplayName}</strong>. Give them a warm welcome!`;
    }

    let messageText = `Tallyin: "${txTitle}" of ${formattedAmount} logged by ${txPaidBy} in Room ${roomDisplayName} on ${txDateTime}. Category: ${txCategory}, Split: ${txSplit}.`;

    // Extract & resolve receipt files attached to this transaction
    let receiptImages = [];
    if (Array.isArray(transaction?.receiptImages) && transaction.receiptImages.length > 0) {
      receiptImages = transaction.receiptImages;
    } else if (transaction?.imageUrl) {
      receiptImages = getImages(transaction.imageUrl);
    } else {
      let receiptDateStr = '';
      if (txDate) {
        const parts = txDate.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          if (!isNaN(dateObj.getTime())) {
            receiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
          }
        }
      }
      const matchingReceipt = receipts.find(r =>
        r.title === txTitle &&
        Number(r.amount) === amountVal &&
        (!receiptDateStr || r.date === receiptDateStr)
      );
      if (matchingReceipt && matchingReceipt.imageUrl) {
        receiptImages = getImages(matchingReceipt.imageUrl);
      }
    }

    if (receiptImages && receiptImages.length > 0) {
      messageText += ` [Receipt Attached: ${receiptImages.length} file(s)]`;
    }

    // 1. Determine target members for notification (for 1-on-1 settlements, only notify Payer & Receiver)
    let targetMembers = members;
    let payerUid = transaction?.paidByUid || transaction?.paid_by_uid;
    let payerName = transaction?.paidBy || transaction?.paid_by;
    let receiverUid = '';
    let receiverName = '';

    if (isSettlement) {
      const splitsArr = Array.isArray(transaction?.splits) ? transaction.splits : [];
      const receiverMember = splitsArr.find(s => (s.uid && s.uid !== payerUid) || (s.nickname && s.nickname !== payerName) || (s.amount ?? 0) > 0);
      receiverUid = receiverMember?.uid || '';
      receiverName = receiverMember?.nickname || (txTitle.includes(' to ') ? txTitle.split(' to ')[1]?.trim() : '');

      const filtered = members.filter(m => {
        const isPayer = (payerUid && m.uid === payerUid) || (payerName && m.nickname === payerName);
        const isReceiver = (receiverUid && m.uid === receiverUid) || (receiverName && m.nickname === receiverName);
        return isPayer || isReceiver;
      });

      if (filtered.length > 0) {
        targetMembers = filtered;
      }
    }

    const stateEmails = targetMembers
      .map(m => m.email)
      .filter(e => e && typeof e === 'string' && e.includes('@'));

    // 2. Fetch fresh emails from Supabase DB
    let dbEmails = [];
    let dbMembersList = [];
    if (activeRoomId && activeRoomId !== 'TL-ROOM') {
      try {
        const { data: dbMembers } = await supabase
          .from('members')
          .select('email, uid, nickname')
          .eq('room_id', activeRoomId);
        if (dbMembers) {
          dbMembersList = dbMembers;
          let filteredDb = dbMembers;
          if (isSettlement) {
            filteredDb = dbMembers.filter(m => {
              const isPayer = (payerUid && m.uid === payerUid) || (payerName && m.nickname === payerName);
              const isReceiver = (receiverUid && m.uid === receiverUid) || (receiverName && m.nickname === receiverName);
              return isPayer || isReceiver;
            });
          }

          // Fetch user emails from users table for UIDs missing emails in members table
          const missingEmailUids = filteredDb.filter(m => !m.email || !m.email.includes('@')).map(m => m.uid);
          let extraUserEmails = [];
          if (missingEmailUids.length > 0) {
            try {
              const { data: uData } = await supabase
                .from('users')
                .select('email, uid')
                .in('uid', missingEmailUids);
              if (uData) {
                extraUserEmails = uData.map(u => u.email).filter(e => e && e.includes('@'));
              }
            } catch(e) {}
          }

          dbEmails = [
            ...filteredDb.map(m => m.email).filter(e => e && typeof e === 'string' && e.includes('@')),
            ...extraUserEmails
          ];
        }
      } catch (err) {
        console.warn('[Tallyin Email Debug] DB member fetch warning:', err);
      }
    }

    const emailSet = new Set([...stateEmails, ...dbEmails]);

    // For general room expenses, ensure current user/login emails are included
    if (!isSettlement) {
      const currentUserEmail = (user?.email && typeof user.email === 'string' && user.email.includes('@')) ? user.email : '';
      const storedCodeEmail = (codeLoginEmail && typeof codeLoginEmail === 'string' && codeLoginEmail.includes('@')) ? codeLoginEmail.trim() : '';
      if (currentUserEmail) emailSet.add(currentUserEmail);
      if (storedCodeEmail) emailSet.add(storedCodeEmail);
    }
    const emailList = [...emailSet].map(e => e.trim()).filter(Boolean);

    console.log('[Tallyin Email Debug] Action Type:', actionType, 'Tx ID:', txIdFormatted);
    console.log('[Tallyin Email Debug] All member emails found:', emailList);

    if (emailList.length === 0) {
      console.warn('[Tallyin Email Debug] No valid recipient emails found — email notification skipped.');
      return;
    }

    // Generate Roommate Split Share Breakdown or Settlement Details HTML
    let splitRowsHtml = '';
    const splitsArr = Array.isArray(transaction?.splits) ? transaction.splits : [];
    if (isSettlement) {
      const receiverMember = splitsArr.find(s => s.uid !== transaction?.paidByUid || (s.amount ?? 0) > 0);
      const receiverName = receiverMember?.nickname || (txTitle.includes(' to ') ? txTitle.split(' to ')[1] : 'Roommate');
      splitRowsHtml = `
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; margin-bottom: 28px;">
          <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">SETTLEMENT PAYMENT DETAILS</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">Paid By (Sender)</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #0F172A;">${txPaidBy}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">Paid To (Receiver)</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #1A3827;">${receiverName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">Status</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #16A34A;">Fully Settled</td>
            </tr>
          </table>
        </div>
      `;
    } else if (splitsArr.length > 0) {
      const rows = splitsArr.map(s => {
        const amt = Number(s.amount ?? 0);
        const name = s.nickname || s.name || 'Roommate';
        return `
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">${name}</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #1A3827;">₹${amt.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }).join('');

      splitRowsHtml = `
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; margin-bottom: 28px;">
          <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">ROOMMATE SHARE BREAKDOWN</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${rows}
          </table>
        </div>
      `;
    }

    // Generate Attached Receipt Proofs HTML
    let receiptRowsHtml = '';
    if (receiptImages && receiptImages.length > 0) {
      const itemsHtml = receiptImages.map((fileData, idx) => {
        if (!fileData) return '';
        
        if (typeof fileData === 'string' && (fileData.startsWith('http://') || fileData.startsWith('https://'))) {
          return `
            <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; margin-top: 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 36px; vertical-align: middle;">
                    <div style="background-color: #DCFCE7; color: #166534; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-weight: 800; font-size: 11px;">LINK</div>
                  </td>
                  <td style="padding-left: 10px; vertical-align: middle;">
                    <div style="font-size: 13px; font-weight: 700; color: #0F172A;">Hosted Receipt Link #${idx + 1}</div>
                    <a href="${fileData}" target="_blank" style="font-size: 11px; color: #166534; text-decoration: underline;">Open Receipt Link</a>
                  </td>
                </tr>
              </table>
            </div>
          `;
        }

        let isPdf = false;
        let isExcel = false;
        let isImage = false;

        if (typeof fileData === 'string') {
          if (fileData.startsWith('data:application/pdf') || fileData.startsWith('data:pdf/')) {
            isPdf = true;
          } else if (fileData.startsWith('data:image/')) {
            isImage = true;
          } else if (fileData.startsWith('data:application/vnd') || fileData.startsWith('data:application/spreadsheet')) {
            isExcel = true;
          } else {
            // Check base64 magic bytes
            if (fileData.startsWith('JVBERi0')) {
              isPdf = true;
            } else if (fileData.startsWith('/9j/') || fileData.startsWith('iVBORw0KGgo') || fileData.startsWith('R0lGOD') || fileData.startsWith('UklGR')) {
              isImage = true;
            } else {
              isImage = true;
            }
          }
        }
        
        let labelText = `Receipt Photo #${idx + 1} (JPG/PNG Image)`;
        let badgeText = '📷';
        let badgeBg = '#DCFCE7';
        let badgeColor = '#166534';

        if (isPdf) {
          labelText = `Receipt Document #${idx + 1} (PDF File)`;
          badgeText = '📄';
          badgeBg = '#DBEAFE';
          badgeColor = '#1E40AF';
        } else if (isExcel) {
          labelText = `Receipt Spreadsheet #${idx + 1} (Excel File)`;
          badgeText = '📊';
          badgeBg = '#FEF08A';
          badgeColor = '#854D0E';
        }

        return `
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; margin-top: 10px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 36px; vertical-align: middle;">
                  <div style="background-color: ${badgeBg}; color: ${badgeColor}; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-weight: 800; font-size: 14px;">${badgeText}</div>
                </td>
                <td style="padding-left: 10px; vertical-align: middle;">
                  <div style="font-size: 13px; font-weight: 700; color: #0F172A;">${labelText}</div>
                  <div style="font-size: 11px; color: #64748B;">Attached file (see downloadable attachments at bottom of email)</div>
                </td>
              </tr>
            </table>
          </div>
        `;
      }).filter(Boolean).join('');

      receiptRowsHtml = `
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; margin-bottom: 28px;">
          <div style="font-size: 10px; font-weight: 800; color: #1A3827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
            ATTACHED RECEIPT PROOF (${receiptImages.length} ${receiptImages.length === 1 ? 'FILE' : 'FILES'})
          </div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">The following receipt document(s) & photo(s) were attached to this transaction:</div>
          ${itemsHtml}
        </div>
      `;
    }

    const htmlBody = actionType === 'new_member' ? `
      <div style="background-color: #F1F5F9; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
          
          <!-- Top MNC Banner -->
          <div style="background-color: #1A3827; padding: 32px 36px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle;">
                  <table style="border-collapse: collapse;">
                    <tr>
                      <td style="padding-right: 12px; vertical-align: middle;">
                        <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="T" width="40" height="40" style="display: block; border-radius: 12px;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">Tallyin</span>
                        <span style="display: block; font-size: 10px; color: #A3E635; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">ROOMMATE EXPENSE SYNC</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <span style="background-color: rgba(163, 230, 53, 0.2); color: #A3E635; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 7px 14px; border-radius: 20px; display: inline-block;">NEW ROOMMATE</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Main Body -->
          <div style="padding: 36px 36px 28px 36px;">
            <h2 style="color: #0F172A; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🎉 New Roommate Joined!</h2>
            <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 16px 0;">
              Hello Roommate,
            </p>
            <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 24px 0;">
              Great news! <strong>${txPaidBy}</strong> has joined your Tallyin shared space <strong>"${roomName || roomDisplayName}"</strong> (Code: <strong>${roomDisplayName}</strong>). Give them a warm welcome!
            </p>

            <!-- Welcome Greeting Card -->
            <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 18px; padding: 24px; margin-bottom: 28px; text-align: center;">
              <div style="font-size: 42px; margin-bottom: 8px;">👋</div>
              <div style="font-size: 18px; font-weight: 800; color: #065F46; margin-bottom: 4px;">Say hello to ${txPaidBy}!</div>
              <div style="font-size: 13px; color: #047857;">New roommate approved & added to room <strong>${roomName || roomDisplayName}</strong>.</div>
            </div>

            <!-- Detailed Grid Info Cards -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <tr>
                <td style="width: 50%; padding-right: 8px; padding-bottom: 16px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">NEW ROOMMATE</span>
                    <span style="font-size: 14px; font-weight: 800; color: #1A3827;">${txPaidBy}</span>
                  </div>
                </td>
                <td style="width: 50%; padding-left: 8px; padding-bottom: 16px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">SHARED SPACE</span>
                    <span style="font-size: 14px; font-weight: 800; color: #0F172A;">${roomName || roomDisplayName}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding-right: 8px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">ROOM CODE</span>
                    <span style="font-size: 13px; font-weight: 800; color: #1A3827; font-family: monospace;">${roomDisplayName}</span>
                  </div>
                </td>
                <td style="width: 50%; padding-left: 8px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">JOIN DATE</span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txDateTime}</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://tallyin.vercel.app" style="background-color: #1A3827; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(26, 56, 39, 0.2);">👉 Open Tallyin Room Ledger</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; padding: 24px 36px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="font-size: 11px; color: #64748B; line-height: 1.5; margin: 0 0 6px 0;">
              Automated roommate alert from Tallyin Roommate Sync Engine for room <strong>${roomName || roomDisplayName}</strong>.
            </p>
            <p style="font-size: 10px; color: #94A3B8; margin: 0;">
              © 2026 Tallyin Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    ` : `
      <div style="background-color: #F1F5F9; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
          
          <!-- Top MNC Banner -->
          <div style="background-color: #1A3827; padding: 32px 36px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle;">
                  <table style="border-collapse: collapse;">
                    <tr>
                      <td style="padding-right: 12px; vertical-align: middle;">
                        <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="T" width="40" height="40" style="display: block; border-radius: 12px;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">Tallyin</span>
                        <span style="display: block; font-size: 10px; color: #A3E635; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">ROOMMATE EXPENSE SYNC</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <span style="background-color: rgba(163, 230, 53, 0.2); color: #A3E635; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 7px 14px; border-radius: 20px; display: inline-block;">${actionBadge}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Main Body -->
          <div style="padding: 36px 36px 28px 36px;">
            <h2 style="color: #0F172A; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${actionTitle}</h2>
            <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 16px 0;">
              Hello Roommate,
            </p>
            <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 20px 0;">
              ${introText}
            </p>

            ${receiptImages && receiptImages.length > 0 ? `
              <!-- Prominent Top Attachment Alert Banner -->
              <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 36px; vertical-align: middle;">
                      <div style="background-color: #059669; color: #FFFFFF; width: 32px; height: 32px; border-radius: 10px; text-align: center; line-height: 32px; font-size: 16px;">📷</div>
                    </td>
                    <td style="padding-left: 10px; vertical-align: middle;">
                      <div style="font-size: 13px; font-weight: 800; color: #065F46;">
                        ${receiptImages.length} Receipt Image${receiptImages.length === 1 ? '' : 's'} Attached to this Email!
                      </div>
                      <div style="font-size: 11px; color: #047857; margin-top: 2px;">
                        Attached files are available in your email app at the bottom.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            ` : ''}

            <!-- Prominent Amount Highlight Card -->
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 5px solid #1A3827; padding: 20px 24px; border-radius: 16px; margin-bottom: 28px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">TOTAL AMOUNT</span>
                    <span style="font-size: 28px; font-weight: 900; color: #1A3827; letter-spacing: -0.5px;">${formattedAmount}</span>
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">CATEGORY</span>
                    <span style="background-color: #E2E8F0; color: #0F172A; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 20px; display: inline-block;">${txCategory}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Detailed Grid Info Cards -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <tr>
                <td style="width: 50%; padding-right: 8px; padding-bottom: 16px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">TRANSACTION ID</span>
                    <span style="font-size: 13px; font-weight: 800; color: #1A3827; font-family: monospace;">${txIdFormatted}</span>
                  </div>
                </td>
                <td style="width: 50%; padding-left: 8px; padding-bottom: 16px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">DESCRIPTION / TITLE</span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txTitle}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding-right: 8px; padding-bottom: 16px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">PAID BY</span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txPaidBy}</span>
                  </div>
                </td>
                <td style="width: 50%; padding-left: 8px; padding-bottom: 16px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">DATE & TIMESTAMP</span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txDateTime}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding-right: 8px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">ROOM CODE</span>
                    <span style="font-size: 13px; font-weight: 800; color: #1A3827; font-family: monospace;">${roomDisplayName}</span>
                  </div>
                </td>
                <td style="width: 50%; padding-left: 8px;">
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">SPLIT METHOD</span>
                    <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txSplit}</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Roommate Share Breakdown -->
            ${splitRowsHtml}

            <!-- Attached Receipt Proofs -->
            ${receiptRowsHtml}

            <!-- CTA -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://tallyin.vercel.app" style="background-color: #1A3827; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(26, 56, 39, 0.2);">Open Tallyin Room Ledger</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; padding: 24px 36px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="font-size: 11px; color: #64748B; line-height: 1.5; margin: 0 0 6px 0;">
              Automated expense alert from Tallyin Roommate Sync Engine for room <strong>${roomDisplayName}</strong>.
            </p>
            <p style="font-size: 10px; color: #94A3B8; margin: 0;">
              © 2026 Tallyin Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    // Format attachments array with client-side compressed base64 for Google Apps Script
    const emailAttachments = [];
    if (receiptImages && receiptImages.length > 0) {
      for (let idx = 0; idx < receiptImages.length; idx++) {
        let fileData = receiptImages[idx];
        if (typeof fileData === 'string' && fileData.startsWith('data:image/')) {
          try {
            fileData = await new Promise((resolve) => {
              if (fileData.length < 100000) return resolve(fileData);
              let resolved = false;
              const timer = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  resolve(fileData);
                }
              }, 1500);

              const img = new Image();
              img.onload = () => {
                if (resolved) return;
                resolved = true;
                clearTimeout(timer);
                try {
                  let w = img.width;
                  let h = img.height;
                  const maxDim = 800;
                  if (w > maxDim || h > maxDim) {
                    if (w > h) {
                      h = Math.round((h * maxDim) / w);
                      w = maxDim;
                    } else {
                      w = Math.round((w * maxDim) / h);
                      h = maxDim;
                    }
                  }
                  const canvas = document.createElement('canvas');
                  canvas.width = w;
                  canvas.height = h;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, w, h);
                  resolve(canvas.toDataURL('image/jpeg', 0.6));
                } catch (err) {
                  resolve(fileData);
                }
              };
              img.onerror = () => {
                if (resolved) return;
                resolved = true;
                clearTimeout(timer);
                resolve(fileData);
              };
              img.src = fileData;
            });
          } catch (e) {
            console.warn('Canvas receipt compression error:', e);
          }
        }

        if (typeof fileData === 'string' && fileData.length > 50) {
          try {
            let base64Data = fileData;
            let mimeType = 'image/jpeg';
            let ext = 'jpg';

            if (fileData.startsWith('data:')) {
              const parts = fileData.split(',');
              if (parts.length === 2) {
                const header = parts[0];
                base64Data = parts[1];
                mimeType = header.split(';')[0].replace('data:', '') || 'image/jpeg';
              }
            }

            if (mimeType.includes('pdf') || base64Data.startsWith('JVBERi0')) {
              ext = 'pdf';
              mimeType = 'application/pdf';
            } else if (mimeType.includes('png') || base64Data.startsWith('iVBORw0KGgo')) {
              ext = 'png';
              mimeType = 'image/png';
            } else if (mimeType.includes('jpeg') || mimeType.includes('jpg') || base64Data.startsWith('/9j/')) {
              ext = 'jpg';
              mimeType = 'image/jpeg';
            } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
              ext = 'xlsx';
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }

            const cleanTxTitle = (txTitle || 'Receipt').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
            const attachmentName = `Receipt_${idx + 1}_${cleanTxTitle}.${ext}`;

            emailAttachments.push({
              filename: attachmentName,
              name: attachmentName,
              fileName: attachmentName,
              mimeType: mimeType,
              base64: base64Data
            });
          } catch (e) {
            console.warn('Failed to parse base64 receipt attachment:', e);
          }
        }
      }
    }

    const getRecipientName = (recipientEmail) => {
      if (!recipientEmail) return 'Roommate';
      const cleanEmail = recipientEmail.trim().toLowerCase();

      const stateMatch = (targetMembers || members || []).find(
        m => m?.email && m.email.trim().toLowerCase() === cleanEmail
      );
      if (stateMatch?.nickname?.trim()) return stateMatch.nickname.trim();
      if (stateMatch?.name?.trim()) return stateMatch.name.trim();

      const dbMatch = (dbMembersList || []).find(
        m => m?.email && m.email.trim().toLowerCase() === cleanEmail
      );
      if (dbMatch?.nickname?.trim()) return dbMatch.nickname.trim();

      if (user?.email && user.email.trim().toLowerCase() === cleanEmail) {
        const name = user.user_metadata?.full_name || user.user_metadata?.nickname || userNickname;
        if (name && name.trim()) return name.trim();
      }

      if (codeLoginEmail && codeLoginEmail.trim().toLowerCase() === cleanEmail && userNickname && userNickname.trim()) {
        return userNickname.trim();
      }

      return 'Roommate';
    };

    const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';

    try {
      const promises = emailList.map(email => {
        const roommateName = getRecipientName(email);
        const greetingText = roommateName && roommateName !== 'Roommate' ? `Hello ${roommateName},` : 'Hello Roommate,';
        const personalizedHtmlBody = htmlBody.replace('Hello Roommate,', greetingText);
        const personalizedTextBody = `${greetingText}\n\n${messageText}`;

        return fetch(activeScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            to: email,
            subject: subjectText,
            htmlBody: personalizedHtmlBody,
            textBody: personalizedTextBody,
            attachments: emailAttachments
          })
        });
      });
      await Promise.all(promises);
      console.log(`Central Tallyin email notification (${actionType}) sent successfully with ${emailAttachments.length} attachment(s) to:`, emailList);
    } catch (err) {
      console.error(`Failed to send central email notification (${actionType}):`, err);
    }
  };

  const handleMergeFundSpend = async (existingFundSpend) => {
    if (!fundSpendFormAmount) {
      triggerToast('Please enter an amount.');
      return;
    }
    const baseAmt = Number(fundSpendFormAmount);
    if (isNaN(baseAmt) || baseAmt <= 0) {
      triggerToast('Please enter a valid positive amount.');
      return;
    }

    const addedAmt = fundSpendFormType === 'income' ? -baseAmt : baseAmt;
    const newAmount = Number((Number(existingFundSpend.amount) + addedAmt).toFixed(2));

    // Optimistically update local state
    setTransactions(prev => prev.map(t => {
      if (t.id === existingFundSpend.id) {
        return {
          ...t,
          amount: newAmount,
          is_edited: true
        };
      }
      return t;
    }));

    closeAddFundExpenseModal();

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: newAmount,
          is_edited: true
        })
        .eq('id', existingFundSpend.id);

      if (error) throw error;

      await logActivity('edit', `${userNickname} added ₹${baseAmt} to existing fund payment "${existingFundSpend.title}"`);
      triggerToast(`Added ₹${baseAmt} to "${existingFundSpend.title}" successfully!`);
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error("Error merging fund spends:", err);
      triggerToast(`Failed to add amount: ${err.message}`);
      fetchTransactions(userRoomId);
    }
  };

  const handleTogglePaidBack = async (t) => {
    const isCurrentlyPaidBack = isTxPaidBack(t);
    const originalSplit = t.split || '';
    
    let newSplit;
    if (isCurrentlyPaidBack) {
      // Remove paid back flag
      newSplit = originalSplit.replace(' [PAID_BACK]', '');
    } else {
      // Add paid back flag
      newSplit = `${originalSplit} [PAID_BACK]`.trim();
    }

    // Optimistically update local transactions state
    setTransactions(prev => prev.map(item => {
      if (item.id === t.id) {
        return { ...item, split: newSplit };
      }
      return item;
    }));

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          split: newSplit,
          is_edited: true
        })
        .eq('id', t.id);

      if (error) throw error;

      const logMsg = isCurrentlyPaidBack 
        ? `${userNickname} marked expense "${t.title}" as unpaid` 
        : `${userNickname} marked expense "${t.title}" as paid back`;
      
      await logActivity('edit', logMsg);
      triggerToast(isCurrentlyPaidBack ? 'Marked as unpaid.' : 'Marked as paid back!');

      if (notificationMethod !== 'none') {
        sendEmailNotification({ ...t, split: newSplit }, 'update').catch(err => console.warn('Paid back email failed:', err));
      }

      fetchTransactions(userRoomId);
    } catch (err) {
      console.error("Error toggling paid back state:", err);
      triggerToast('Error updating status.');
      // Revert state
      fetchTransactions(userRoomId);
    }
  };

  const handleMergeExpense = async (existingTx) => {
    if (!formAmount) {
      triggerToast('Please enter an amount to add.');
      return;
    }
    const addedAmount = parseFloat(formAmount);
    if (isNaN(addedAmount) || addedAmount <= 0) {
      triggerToast('Please enter a valid positive amount.');
      return;
    }

    const newAmount = Number((Number(existingTx.amount) + addedAmount).toFixed(2));
    
    // Recalculate splits proportionally to preserve the split ratio
    let updatedSplits = [];
    if (existingTx.splits && existingTx.splits.length > 0) {
      const totalOldSplitsAmt = existingTx.splits.reduce((sum, sp) => sum + (Number(sp.amount) || 0), 0);
      updatedSplits = existingTx.splits.map(sp => {
        const ratio = totalOldSplitsAmt > 0 ? (Number(sp.amount) || 0) / totalOldSplitsAmt : 1 / existingTx.splits.length;
        return {
          ...sp,
          amount: Number((newAmount * ratio).toFixed(2))
        };
      });
    }

    // Prepare time history update
    const newHistoryItem = {
      changes: `Added ₹${addedAmount} to existing expense (New Total: ₹${newAmount})`,
      editedBy: userNickname,
      editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date().toLocaleDateString()
    };
    const parsed = parseTimeAndHistory(existingTx.time);
    const updatedHistory = [...(parsed.history || []), newHistoryItem];
    const finalTime = `${parsed.time}|${JSON.stringify(updatedHistory)}`;

    // Optimistically update local state
    setTransactions(prev => prev.map(t => {
      if (t.id === existingTx.id) {
        return {
          ...t,
          amount: newAmount,
          time: finalTime,
          splits: updatedSplits,
          is_edited: true
        };
      }
      return t;
    }));

    closeAddExpenseModal();

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: newAmount,
          time: finalTime,
          splits: updatedSplits,
          is_edited: true
        })
        .eq('id', existingTx.id);

      if (error) throw error;

      await logActivity('edit', `${userNickname} added ₹${addedAmount} to existing expense "${existingTx.title}"`);
      triggerToast(`Added ₹${addedAmount} to "${existingTx.title}" successfully!`);

      if (notificationMethod !== 'none') {
        sendEmailNotification({ ...existingTx, amount: newAmount }, 'update').catch(err => console.warn('Merge expense email failed:', err));
      }

      fetchTransactions(userRoomId);
    } catch (err) {
      console.error("Error merging transactions:", err);
      triggerToast(`Failed to add amount: ${err.message}`);
      // Revert state
      fetchTransactions(userRoomId);
    }
  };

  // Add expense handler to Firestore
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const activeReceiptImages = Array.isArray(formReceiptImages) ? [...formReceiptImages] : [];
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
    const checkedUids = isQuotaMode 
      ? (members.length > 0 ? members.map(m => m.uid) : [formPaidBy || (auth.currentUser?.uid || 'anonymous')])
      : Object.keys(selectedSplitMembers).filter(uid => selectedSplitMembers[uid]);
    
    if (checkedUids.length === 0) {
      triggerToast('Please select at least one roommate to split with.');
      return;
    }
    
    if (isQuotaMode) {
      const shareAmount = amountNum / checkedUids.length;
      splitsArray = checkedUids.map(uid => {
        const mem = members.find(m => m.uid === uid) || { nickname: uid === (auth.currentUser?.uid || 'anonymous') ? userNickname : 'Unknown' };
        return {
          uid,
          nickname: mem.nickname,
          amount: shareAmount
        };
      });
    } else if (splitType === 'equal') {
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
    } else if (splitType === 'budget_weighted') {
      const totalBudgetForChecked = checkedUids.reduce((sum, uid) => {
        const mem = members.find(m => m.uid === uid);
        return sum + (Number(mem?.individualBudget) || 2000);
      }, 0);

      splitsArray = checkedUids.map(uid => {
        const mem = members.find(m => m.uid === uid) || { nickname: uid === (auth.currentUser?.uid || 'anonymous') ? userNickname : 'Unknown', individualBudget: 2000 };
        const bAmt = Number(mem.individualBudget) || 2000;
        const shareAmt = totalBudgetForChecked > 0 ? (amountNum * (bAmt / totalBudgetForChecked)) : (amountNum / checkedUids.length);
        return {
          uid,
          nickname: mem.nickname,
          amount: Math.round(shareAmt * 100) / 100
        };
      });
    }

    if (!userRoomId) {
      triggerToast('Error: No active room selected.');
      return;
    }
    const currentRoom = userRoomId;
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

    let baseTime = editingTransaction 
      ? parseTimeAndHistory(editingTransaction.time).time 
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    let finalTime = baseTime;
    if (formRepeat) {
      const d = new Date(formDate);
      d.setMonth(d.getMonth() + 1);
      const nextDueStr = d.toISOString().split('T')[0];
      finalTime = `${baseTime}|RECURRING:monthly:${nextDueStr}`;
    }

    let detectedChangesList = '';

    if (editingTransaction) {
      let oldReceiptDateStr = '';
      if (editingTransaction.date) {
        const parts = editingTransaction.date.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          oldReceiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
        }
      }
      const matchingReceipt = receipts.find(r => 
        r.title === editingTransaction.title && 
        Number(r.amount) === Number(editingTransaction.amount) && 
        r.category === editingTransaction.category && 
        r.date === oldReceiptDateStr
      );
      const oldImages = matchingReceipt && matchingReceipt.imageUrl ? getImages(matchingReceipt.imageUrl) : [];

      detectedChangesList = detectChanges(editingTransaction, {
        title: formFor,
        amount: amountNum,
        category: formCategory,
        date: formDate,
        paidByUid: formPaidBy,
        splitType
      }, payerMember.nickname, oldImages, formReceiptImages);

      const newHistoryItem = {
        changes: detectedChangesList,
        editedBy: userNickname,
        editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date().toLocaleDateString()
      };

      const parsed = parseTimeAndHistory(editingTransaction.time);
      const updatedHistory = [...(parsed.history || []), newHistoryItem];
      
      if (formRepeat) {
        const existingRec = editingTransaction.time.split('|').find(p => p.startsWith('RECURRING:'));
        let nextDueStr = '';
        if (existingRec) {
          nextDueStr = existingRec.split(':')[2];
        } else {
          const d = new Date(formDate);
          d.setMonth(d.getMonth() + 1);
          nextDueStr = d.toISOString().split('T')[0];
        }
        finalTime = `${parsed.time}|RECURRING:monthly:${nextDueStr}|${JSON.stringify(updatedHistory)}`;
      } else {
        finalTime = `${parsed.time}|${JSON.stringify(updatedHistory)}`;
      }
    }

    const newPayload = {
      title: formFor,
      amount: amountNum,
      category: formCategory,
      date: formDate,
      time: finalTime,
      paidBy: payerMember.nickname,
      paidByUid: formPaidBy || auth.currentUser?.uid || 'anonymous',
      isShared: isSharedExpense,
      splitType,
      split: splitLabel,
      splits: splitsArray
    };

    if (editingTransaction) {
      // 1. Optimistic UI update — update transaction immediately in local state
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id
          ? { ...t, ...newPayload, isEdited: true }
          : t
      ));

      // 2. Resolve receipt dates & optimistic receipts update
      let oldReceiptDateStr = '';
      if (editingTransaction.date) {
        const parts = editingTransaction.date.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          oldReceiptDateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
        }
      }

      if (newPayload.isShared) {
        const newReceiptDateStr = new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' });
        const serializedImages = activeReceiptImages.length > 0 ? JSON.stringify(activeReceiptImages) : null;
        
        setReceipts(prev => {
          let found = false;
          const updated = prev.map(r => {
            if (r.title === editingTransaction.title && Number(r.amount) === Number(editingTransaction.amount) && r.date === oldReceiptDateStr) {
              found = true;
              return {
                ...r,
                title: formFor,
                amount: amountNum,
                category: formCategory,
                date: newReceiptDateStr,
                imageUrl: serializedImages
              };
            }
            return r;
          });
          
          if (!found && activeReceiptImages.length > 0) {
            const bgColors = [
              'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
              'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
              'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
              'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
            ];
            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
            const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
            const randomRot = rotations[Math.floor(Math.random() * rotations.length)];
            
            updated.unshift({
              id: `optimistic-receipt-${Date.now()}`,
              title: formFor,
              amount: amountNum,
              category: formCategory,
              date: newReceiptDateStr,
              bgClass: randomBg,
              rotation: randomRot,
              imageUrl: serializedImages
            });
          }
          return updated;
        });
      } else {
        setReceipts(prev => prev.filter(r => !(r.title === editingTransaction.title && Number(r.amount) === Number(editingTransaction.amount) && r.date === oldReceiptDateStr)));
      }

      // 3. Close the modal immediately (zero-latency transition)
      closeAddExpenseModal();

      // Fire update email notification immediately & independently with transaction ID
      if (notificationMethod !== 'none') {
        sendEmailNotification({ ...newPayload, id: editingTransaction.id, receiptImages: activeReceiptImages }, 'update').catch(err => {
          console.warn('Update email notification failed silently:', err);
        });
      }

      // 4. Update the DB asynchronously in the background
      (async () => {
        try {
          const { error: txError } = await supabase
            .from('transactions')
            .update({
              title: newPayload.title,
              amount: newPayload.amount,
              category: newPayload.category,
              date: newPayload.date,
              time: newPayload.time,
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
            const newReceiptDateStr = new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' });
            
            const { data: updatedReceipts, error: receiptUpdateError } = await supabase
              .from('receipts')
              .update({
                title: formFor,
                amount: amountNum,
                category: formCategory,
                date: newReceiptDateStr,
                image_url: activeReceiptImages.length > 0 ? JSON.stringify(activeReceiptImages) : null
              })
              .eq('room_id', currentRoom)
              .eq('title', editingTransaction.title)
              .eq('amount', editingTransaction.amount)
              .eq('category', editingTransaction.category)
              .eq('date', oldReceiptDateStr)
              .select();

            if (receiptUpdateError) throw receiptUpdateError;

            if (!updatedReceipts || updatedReceipts.length === 0) {
              const bgColors = [
                'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
                'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
                'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
                'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
              ];
              const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
              const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
              const randomRot = rotations[Math.floor(Math.random() * rotations.length)];

              const { error: insertError } = await supabase
                .from('receipts')
                .insert({
                  room_id: currentRoom,
                  title: formFor,
                  amount: amountNum,
                  category: formCategory,
                  date: newReceiptDateStr,
                  bg_class: randomBg,
                  rotation: randomRot,
                  image_url: activeReceiptImages.length > 0 ? JSON.stringify(activeReceiptImages) : null
                });
              if (insertError) throw insertError;
            }
          } else {
            const { error: deleteError } = await supabase
              .from('receipts')
              .delete()
              .eq('room_id', currentRoom)
              .eq('title', editingTransaction.title)
              .eq('amount', editingTransaction.amount)
              .eq('category', editingTransaction.category)
              .eq('date', oldReceiptDateStr);
            if (deleteError) throw deleteError;
          }

          let logMsg = `${userNickname} edited expense "${newPayload.title}" to ₹${newPayload.amount}`;
          if (detectedChangesList && detectedChangesList.includes('Added receipt files') && !detectedChangesList.includes('Total Amount') && !detectedChangesList.includes('Title')) {
            logMsg = `${userNickname} added receipt file(s) to "${newPayload.title}"`;
          } else if (detectedChangesList && detectedChangesList.includes('Removed all receipt files') && !detectedChangesList.includes('Total Amount') && !detectedChangesList.includes('Title')) {
            logMsg = `${userNickname} removed receipt file(s) from "${newPayload.title}"`;
          } else if (detectedChangesList && detectedChangesList.includes('Updated receipt files') && !detectedChangesList.includes('Total Amount') && !detectedChangesList.includes('Title')) {
            logMsg = `${userNickname} updated receipt file(s) for "${newPayload.title}"`;
          }
          await logActivity('edit', logMsg);
          triggerToast("Expense updated successfully!");
        } catch (error) {
          console.error("Error updating transaction:", error);
          triggerToast(`Failed to update: ${error.message}`);
          fetchTransactions(currentRoom);
          fetchReceipts(currentRoom);
        }
      })();
    } else {
      // Optimistic UI — close modal and add to local state immediately
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticTx = {
        id: optimisticId,
        ...newPayload,
        createdBy: user ? user.id : 'anonymous',
        roomId: currentRoom,
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

        const realTxId = insertedTx ? insertedTx.id : optimisticId;
        const txForEmail = { ...newPayload, id: realTxId, receiptImages: activeReceiptImages };

        // Replace optimistic entry with real DB row (has real id)
        if (insertedTx) {
          setTransactions(prev => prev.map(t =>
            t.id === optimisticId
              ? { ...newPayload, id: insertedTx.id, createdBy: insertedTx.created_by, roomId: insertedTx.room_id, room_id: insertedTx.room_id }
              : t
          ));
        }

        await logActivity('create', `${userNickname} added expense "${newPayload.title}" (₹${newPayload.amount})`);

        // If user chose to link this expense to a fund, insert a __FUND_SPEND__ row
        if (formFundId) {
          const currentUid = auth.currentUser?.uid || 'anonymous';
          await supabase.from('transactions').insert({
            room_id: currentRoom,
            title: newPayload.title,
            amount: newPayload.amount,
            category: '__FUND_SPEND__',
            date: newPayload.date,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            paid_by: userNickname,
            paid_by_uid: currentUid,
            is_shared: false,
            split_type: newPayload.category, // store the original category as the fund spend category
            split: String(formFundId),
            splits: [{ uid: currentUid, amount: newPayload.amount, nickname: userNickname }],
            created_by: currentUid
          });
          triggerToast(`Also added to fund "${myFunds.find(f => String(f.id) === String(formFundId))?.title || 'Fund'}"`);
        }

        if (newPayload.isShared && activeReceiptImages.length > 0) {
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
            id: `optimistic-receipt-${Date.now()}`,
            title: formFor,
            amount: amountNum,
            category: formCategory,
            date: new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' }),
            bgClass: randomBg,
            rotation: randomRot,
            imageUrl: JSON.stringify(activeReceiptImages)
          };
          setReceipts(prev => [newReceipt, ...prev]);
          
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
              image_url: JSON.stringify(activeReceiptImages)
            })
            .then(({ error: receiptError }) => {
              if (receiptError) {
                console.warn('Receipt insert error:', receiptError);
                setReceipts(prev => prev.filter(r => r.id !== newReceipt.id));
              }
            });
        }

        triggerToast("Expense added!");

        // Fire email notification with real transaction ID
        if (notificationMethod !== 'none') {
          sendEmailNotification(txForEmail, 'add').catch(err => {
            console.warn('Email notification failed silently:', err);
          });
        }
      } catch (error) {
        console.error(error);
        triggerToast(`Saved locally (DB sync failed: ${error.message || 'database error'}).`);
        // Still attempt email even if DB had issues
        if (notificationMethod !== 'none') {
          sendEmailNotification({ ...newPayload, id: optimisticId, receiptImages: activeReceiptImages }, 'add').catch(err => console.warn('Email failed:', err));
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
  // Download Receipt helper
  const handleDownloadReceipt = (r) => {
    const images = getImages(r.imageUrl);
    if (images.length > 0) {
      images.forEach((imgUrl, index) => {
        let ext = 'png';
        const mime = imgUrl.match(/data:([^;]+);/);
        if (mime && mime[1]) {
          const parts = mime[1].split('/');
          if (parts[1]) ext = parts[1];
        }
        
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = `${r.title.toLowerCase().replace(/\s+/g, '_')}_receipt_${index + 1}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      triggerToast(images.length > 1 ? `Downloaded ${images.length} receipt images!` : 'Receipt downloaded!');
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

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isExcel = file.type.includes('spreadsheet') || file.type === 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    const maxSize = (isPdf || isExcel) ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    const sizeLabel = (isPdf || isExcel) ? '10MB' : '3MB';

    if (file.size > maxSize) {
      triggerToast(`File size too large. Please upload files under ${sizeLabel}.`);
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

      if (!userRoomId) {
        triggerToast('Error: No active room selected.');
        return;
      }
      const currentRoom = userRoomId;
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
        setReceipts(prev => [newReceipt, ...prev]);
        triggerToast(`Receipt uploaded! 📧 Notification sent to roommates.`);

        if (notificationMethod !== 'none') {
          sendEmailNotification({
            title: newReceipt.title,
            amount: newReceipt.amount,
            category: newReceipt.category,
            date: newReceipt.date,
            paidBy: userNickname,
            receiptImages: [base64Data]
          }, 'add').catch(err => console.warn('Standalone receipt email failed:', err));
        }
      } catch (err) {
        console.error(err);
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
    input.accept = 'image/*,application/pdf,.pdf,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (files.length > 4) {
        triggerToast("You can upload a maximum of 4 receipt files per transaction.");
        return;
      }

      const loadedImages = [];
      for (let file of files) {
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
          triggerToast(`Converting HEIC image (${file.name})... Please wait.`);
          try {
            file = await convertHeicToPng(file);
          } catch (err) {
            triggerToast(err.message);
            continue;
          }
        }

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isExcel = file.type.includes('spreadsheet') || file.type === 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
        const maxSize = (isPdf || isExcel) ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
        const sizeLabel = (isPdf || isExcel) ? '10MB' : '3MB';

        if (file.size > maxSize) {
          triggerToast(`File ${file.name} is too large. Please upload files under ${sizeLabel}.`);
          continue;
        }

        const p = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => {
            triggerToast(`Failed to read file ${file.name}`);
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
        const result = await p;
        if (result) loadedImages.push(result);
      }

      if (loadedImages.length === 0) return;

      const serializedImages = JSON.stringify(loadedImages);
      try {
        const { error } = await supabase
          .from('receipts')
          .update({ image_url: serializedImages })
          .eq('id', receiptId);

        if (error) throw error;

        const targetReceipt = receipts.find(r => r.id === receiptId);
        setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, imageUrl: serializedImages } : r));
        triggerToast(`Successfully attached ${loadedImages.length} receipt file(s)!`);

        if (notificationMethod !== 'none' && targetReceipt) {
          sendEmailNotification({
            title: targetReceipt.title,
            amount: targetReceipt.amount,
            category: targetReceipt.category,
            date: targetReceipt.date,
            paidBy: userNickname,
            receiptImages: loadedImages
          }, 'update').catch(err => console.warn('Attach receipt email failed:', err));
        }
      } catch (err) {
        console.error("Error attaching receipt:", err);
        triggerToast(`Failed to attach file: ${err.message}`);
      }
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
    
    // Identify all debtors and creditors
    let debtors = [];
    let creditors = [];
    
    members.forEach(m => {
      const bal = computedStats.balances[m.uid] || 0;
      if (bal < -0.01) {
        debtors.push({ uid: m.uid, bal, nickname: m.nickname });
      } else if (bal > 0.01) {
        creditors.push({ uid: m.uid, bal, nickname: m.nickname });
      }
    });

    // Sort debtors ascending (most negative first)
    debtors.sort((a, b) => a.bal - b.bal);
    // Sort creditors descending (highest positive first)
    creditors.sort((a, b) => b.bal - a.bal);

    if (myBalance < -0.01) {
      // Current user owes money. Suggested payer: current user.
      setSettlePayer(currentUid);
      const bestCreditor = creditors[0];
      setSettleReceiver(bestCreditor ? bestCreditor.uid : members.find(m => m.uid !== currentUid)?.uid || '');
      setSettleAmount(Math.abs(myBalance).toFixed(2));
    } else if (myBalance > 0.01) {
      // Current user is owed money. Suggested receiver: current user.
      setSettleReceiver(currentUid);
      const bestDebtor = debtors[0];
      setSettlePayer(bestDebtor ? bestDebtor.uid : members.find(m => m.uid !== currentUid)?.uid || '');
      setSettleAmount(Math.abs(bestDebtor ? bestDebtor.bal : 0).toFixed(2));
    } else {
      // Current user is settled up (balance is 0)
      if (debtors.length > 0 && creditors.length > 0) {
        // Suggest payment between the top debtor and top creditor
        const bestDebtor = debtors[0];
        const bestCreditor = creditors[0];
        setSettlePayer(bestDebtor.uid);
        setSettleReceiver(bestCreditor.uid);
        const amount = Math.min(Math.abs(bestDebtor.bal), bestCreditor.bal);
        setSettleAmount(amount.toFixed(2));
      } else {
        // Everyone is settled up
        setSettlePayer(currentUid);
        setSettleReceiver(members.find(m => m.uid !== currentUid)?.uid || '');
        setSettleAmount('0.00');
      }
    }
    
    setIsSettleModalOpen(true);
  };

  // 1-Tap Quick Settlement Handler
  const executeQuickSettle = async (fromUid, toUid, amountNum) => {
    if (!fromUid || !toUid || amountNum <= 0) return;
    const payer = members.find(m => m.uid === fromUid);
    const receiver = members.find(m => m.uid === toUid);
    if (!payer || !receiver) return;

    if (!userRoomId) {
      triggerToast('Error: No active room selected.');
      return;
    }
    const currentRoom = userRoomId;
    const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';

    const newPayload = {
      title: `Payment: ${payer.nickname} to ${receiver.nickname}`,
      amount: amountNum,
      category: 'Payment',
      date: getLocalDateStr(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      paidBy: payer.nickname,
      paidByUid: fromUid,
      isShared: true,
      splitType: 'amount',
      splits: [
        { uid: fromUid, nickname: payer.nickname, amount: 0 },
        { uid: toUid, nickname: receiver.nickname, amount: amountNum }
      ]
    };

    const optimisticId = `optimistic-payment-${Date.now()}`;
    const optimisticTx = {
      id: optimisticId,
      ...newPayload,
      roomId: currentRoom,
      room_id: currentRoom,
      created_at: new Date().toISOString()
    };

    setTransactions(prev => [optimisticTx, ...prev]);
    setIsSettleModalOpen(false);
    
    const partnerName = fromUid === currentUid ? receiver.nickname : payer.nickname;
    triggerToast(`⚡ Settled ${formatINR(amountNum)} with ${partnerName}!`);

    try {
      const { data: insertedPayment, error: txError } = await supabase
        .from('transactions')
        .insert([{
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
          splits: newPayload.splits
        }])
        .select();

      if (txError) throw txError;
      if (insertedPayment && insertedPayment.length > 0) {
        const raw = insertedPayment[0];
        const savedTx = {
          id: raw.id,
          roomId: raw.room_id,
          title: raw.title,
          amount: Number(raw.amount) || 0,
          category: raw.category,
          date: raw.date,
          time: raw.time,
          paidBy: raw.paid_by,
          paidByUid: raw.paid_by_uid,
          isShared: raw.is_shared,
          isEdited: raw.is_edited,
          splitType: raw.split_type,
          split: raw.split,
          splits: raw.splits,
          createdBy: raw.created_by,
          imageUrl: raw.image_url
        };
        setTransactions(prev => prev.map(t => t.id === optimisticId ? savedTx : t));
      }
      logActivity('settled_payment', `Settled ₹${amountNum.toFixed(2)} payment between ${payer.nickname} and ${receiver.nickname}`, currentRoom);
    } catch (e) {
      console.error('Failed to save payment to DB:', e);
      triggerToast('Settlement recorded locally.');
    }
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

    if (settleUpiId && settleReceiver) {
      localStorage.setItem(`upi_id_${settleReceiver}`, settleUpiId.trim());
    }

    if (!userRoomId) {
      triggerToast('Error: No active room selected.');
      return;
    }
    const currentRoom = userRoomId;
    const newPayload = {
      title: `Payment: ${payer.nickname} to ${receiver.nickname}`,
      amount: amountNum,
      category: 'Payment',
      date: getLocalDateStr(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      paidBy: payer.nickname,
      paidByUid: settlePayer,
      isShared: true,
      splitType: 'amount',
      splits: [
        { uid: settlePayer, nickname: payer.nickname, amount: 0 },
        { uid: settleReceiver, nickname: receiver.nickname, amount: amountNum }
      ]
    };

    // Optimistic UI update so balances adjust immediately
    const optimisticId = `optimistic-payment-${Date.now()}`;
    const optimisticTx = {
      id: optimisticId,
      ...newPayload,
      roomId: currentRoom,
      room_id: currentRoom,
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [optimisticTx, ...prev]);
    setIsSettleModalOpen(false);

    try {
      const { data: insertedPayment, error: txError } = await supabase
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
        })
        .select()
        .single();

      if (txError) throw txError;

      const realTxId = insertedPayment ? insertedPayment.id : optimisticId;
      const txForEmail = { ...newPayload, id: realTxId };

      // Fire settlement email notification with real transaction ID
      if (notificationMethod !== 'none') {
        sendEmailNotification(txForEmail, 'settle').catch(err => {
          console.warn('Settle email notification failed silently:', err);
        });
      }

      await logActivity('settle', `${payer.nickname} recorded payment of ${formatINR(amountNum)} to ${receiver.nickname}`);
      triggerToast(`Recorded payment of ${formatINR(amountNum)} from ${payer.nickname} to ${receiver.nickname}!`);
    } catch (err) {
      console.error(err);
      triggerToast(`Failed to record payment: ${err.message}`);
      // Retry email notification if DB had issues
      if (notificationMethod !== 'none') {
        sendEmailNotification({ ...newPayload, id: optimisticId }, 'settle').catch(err => console.warn('Settle email retry failed:', err));
      }
    }
  };

  // Invite trigger
  const handleInviteTrigger = async () => {
    if (!userRoomId) {
      triggerToast('Error: No active room selected.');
      return;
    }
    const currentRoom = userRoomId;
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
  function exportToCSV(list = null) {
    try {
      const dataList = Array.isArray(list) ? list : filteredTransactions;
      if (dataList.length === 0) {
        triggerToast('No transaction records to export.');
        return;
      }

      const headers = ['Date', 'Time', 'Description', 'Amount (INR)', 'Category', 'Paid By', 'Split Type'];
      const rows = dataList.map(t => [
        `"${t.date || ''}"`,
        `"${parseTimeAndHistory(t.time).time || ''}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${t.category || ''}"`,
        `"${t.paidBy || ''}"`,
        `"${getDisplaySplitLabel(t) || (t.isShared ? 'Shared' : 'Personal')}"`
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

      const totalSpend = dataList.filter(t => t.category !== 'Payment').reduce((s, t) => s + (Number(t.amount) || 0), 0);
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
            <b>Exported on:</b> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}<br/>
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
                  <td>${parseTimeAndHistory(t.time).time}</td>
                  <td>${t.title}</td>
                  <td>${t.amount}</td>
                  <td>${t.category}</td>
                  <td>${t.paidBy}</td>
                  <td>${getDisplaySplitLabel(t)}</td>
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

  // Itemized PDF Export Handler for Quick Bills / Receipts
  const exportItemizedBillToPDF = (billData) => {
    try {
      const {
        title = 'Itemized Expense Receipt',
        merchantName = 'Delivery & Outlets',
        date = getLocalDateStr(),
        time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referenceCode = 'RC-1001',
        currency = '₹',
        items = [],
        subtotal = 0,
        grandTotal = 0,
        notes = '',
        creator = userNickname || 'User',
        roomName = roomName || 'Room'
      } = billData;

      const formatCurr = (val) => `${currency}${(Number(val) || 0).toLocaleString('en-IN')}`;

      const itemsRowsHtml = items.map((item, idx) => `
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 10px 12px; font-size: 12px; color: #4B5563; font-weight: 600;">#${idx + 1}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 700;">${item.name}</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #6B7280;">${item.category || 'General'}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 800; text-align: right;">${formatCurr(item.amount * (item.qty || 1))}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title} — ${referenceCode}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, sans-serif; 
              color: #111827; 
              padding: 40px; 
              background-color: #ffffff;
              line-height: 1.5;
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 2.5px solid #0F291E;
              margin-bottom: 28px;
            }
            .brand-title {
              font-size: 24px;
              font-weight: 900;
              color: #0F291E;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 11px;
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              font-weight: 700;
              margin-top: 2px;
            }
            .meta-box {
              text-align: right;
              font-size: 12px;
            }
            .ref-code {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              font-weight: 700;
              color: #059669;
              background: #ECFDF5;
              padding: 4px 8px;
              border-radius: 6px;
              display: inline-block;
              margin-top: 4px;
            }
            .details-card {
              background: #F9FAFB;
              border: 1px solid #E5E7EB;
              border-radius: 12px;
              padding: 16px 20px;
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 28px;
            }
            .detail-label {
              font-size: 10px;
              font-weight: 800;
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .detail-val {
              font-size: 14px;
              font-weight: 800;
              color: #111827;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 28px;
            }
            th {
              background: #0F291E;
              color: #ffffff;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 10px 12px;
              text-align: left;
            }
            th:last-child {
              text-align: right;
            }
            .total-summary {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 32px;
            }
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
            .summary-table td {
              padding: 6px 12px;
              font-size: 13px;
            }
            .grand-total-row td {
              font-size: 18px;
              font-weight: 900;
              color: #0F291E;
              border-top: 2px solid #111827;
              padding-top: 10px;
            }
            .footer-note {
              border-top: 1px solid #E5E7EB;
              padding-top: 16px;
              font-size: 11px;
              color: #6B7280;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="brand-title">Tallyin DuoShare</div>
              <div class="subtitle">Itemized Receipt & Statement</div>
            </div>
            <div class="meta-box">
              <div style="font-weight: 700; font-size: 14px;">${title}</div>
              <div class="ref-code">${referenceCode}</div>
            </div>
          </div>

          <div class="details-card">
            <div>
              <div class="detail-label">Merchant / Outlet</div>
              <div class="detail-val">${merchantName}</div>
            </div>
            <div>
              <div class="detail-label">Date & Time</div>
              <div class="detail-val">${date} ${time}</div>
            </div>
            <div>
              <div class="detail-label">Created By / Room</div>
              <div class="detail-val">${creator} (${roomName})</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">S.NO</th>
                <th>ITEM DESCRIPTION</th>
                <th>CATEGORY</th>
                <th style="text-align: right;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="total-summary">
            <table class="summary-table">
              <tr>
                <td style="color: #6B7280; font-weight: 600;">Total Items:</td>
                <td style="text-align: right; font-weight: 700;">${items.length}</td>
              </tr>
              <tr>
                <td style="color: #6B7280; font-weight: 600;">Subtotal:</td>
                <td style="text-align: right; font-weight: 700;">${formatCurr(subtotal)}</td>
              </tr>
              <tr class="grand-total-row">
                <td>GRAND TOTAL:</td>
                <td style="text-align: right; color: #059669;">${formatCurr(grandTotal)}</td>
              </tr>
            </table>
          </div>

          <div class="footer-note">
            <div>${notes || 'Official Itemized Statement generated via DuoShare b9lls.'}</div>
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #9CA3AF;">VERIFIED STATEMENT</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      }
      triggerToast('Generating detailed PDF receipt...');
    } catch (error) {
      console.error('PDF Export Error:', error);
      triggerToast('Failed to export PDF receipt.');
    }
  };

  const handleAddExpenseFromQuickBill = async ({ description, amount, category, paid_by, split_type, notes }) => {
    const currentUid = auth?.currentUser?.uid || 'anonymous';
    const currentRoom = userRoomId || 'general';
    
    const checkedUids = members.length > 0 ? members.map(m => m.uid) : [currentUid];
    const shareAmount = amount / (checkedUids.length || 1);
    const splits = checkedUids.map(uid => {
      const mem = members.find(m => m.uid === uid) || { nickname: uid === currentUid ? userNickname : 'Unknown' };
      return { uid, nickname: mem.nickname, amount: shareAmount };
    });

    const newPayload = {
      title: description,
      amount: amount,
      category: category || 'bills',
      date: getLocalDateStr(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      paidBy: paid_by || userNickname,
      paidByUid: currentUid,
      isShared: true,
      splitType: 'equal',
      split: 'all',
      splits: splits
    };

    const optimisticId = `opt_${Date.now()}`;
    setTransactions(prev => [{ ...newPayload, id: optimisticId, createdBy: currentUid, roomId: currentRoom, room_id: currentRoom }, ...prev]);

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
          is_shared: true,
          split_type: 'equal',
          split: 'all',
          splits: splits,
          created_by: currentUid
        })
        .select()
        .single();

      if (txError) {
        console.error(txError);
        triggerToast('Failed to post bill to room transactions.');
      } else if (insertedTx) {
        setTransactions(prev => prev.map(t => t.id === optimisticId ? { ...newPayload, id: insertedTx.id } : t));
        if (typeof logActivity === 'function') {
          await logActivity('create', `${userNickname} added itemized bill "${newPayload.title}" (₹${newPayload.amount})`);
        }
      }
    } catch (e) {
      console.error(e);
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

      const totalSpend = dataList.filter(t => t.category !== 'Payment').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const sharedSpend = dataList.filter(t => t.isShared && t.category !== 'Payment').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const personalSpend = totalSpend - sharedSpend;
      const myBalance = computedStats.currentUserBalance;
      const statusText = myBalance === 0
        ? 'All settled up'
        : myBalance > 0
          ? `You are owed ${formatINR(myBalance)}`
          : `You owe ${formatINR(Math.abs(myBalance))}`;
      const memberNames = members.map(m => m.nickname).join(', ') || userNickname;
      const auditRefCode = `TL-${(userRoomId || 'ROOM').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tallyin — Statement of Account (${roomName || 'Room'})</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              color: #111827; 
              padding: 40px; 
              background-color: #ffffff; 
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
            }

            /* Header Section — Minimal & Classic */
            .statement-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 24px;
              border-bottom: 2px solid #111827;
              margin-bottom: 32px;
            }
            .brand-group {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .brand-row {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .brand-logo {
              width: 32px;
              height: 32px;
              object-fit: contain;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 800;
              letter-spacing: -0.6px;
              color: #111827;
            }
            .statement-type {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #6B7280;
              margin-top: 4px;
            }

            .doc-metadata {
              text-align: right;
              font-size: 11px;
              line-height: 1.6;
              color: #374151;
            }
            .meta-row {
              display: flex;
              justify-content: flex-end;
              gap: 16px;
            }
            .meta-row .label {
              color: #6B7280;
              font-weight: 500;
            }
            .meta-row .val {
              font-weight: 700;
              color: #111827;
            }
            .meta-ref {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #4B5563;
              margin-top: 4px;
            }

            /* Section Headers */
            .section-label {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #6B7280;
              margin-bottom: 14px;
            }

            /* Executive Summary Grid — Minimal Hairline Boxes */
            .summary-grid {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 32px;
            }
            .summary-box {
              border: 1px solid #E5E7EB;
              padding: 16px;
              background-color: #FAFAFA;
              border-radius: 8px;
            }
            .box-title {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #6B7280;
              margin-bottom: 6px;
            }
            .box-amount {
              font-size: 18px;
              font-weight: 800;
              color: #111827;
              letter-spacing: -0.4px;
            }
            .box-note {
              font-size: 10px;
              color: #6B7280;
              margin-top: 2px;
            }

            /* Minimal Note Box */
            .note-box {
              border-left: 3px solid #111827;
              padding: 12px 16px;
              background-color: #F9FAFB;
              font-size: 11px;
              color: #374151;
              margin-bottom: 32px;
            }

            /* Tables — Clean Classic Lines */
            .table-block {
              margin-bottom: 32px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              border-bottom: 2px solid #111827;
              color: #111827;
              font-weight: 800;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 10px 12px;
              text-align: left;
              background: transparent;
            }
            th.text-right { text-align: right; }
            td {
              padding: 11px 12px;
              border-bottom: 1px solid #E5E7EB;
              color: #1F2937;
              font-weight: 500;
            }
            td.text-right { text-align: right; }
            tr:last-child td { border-bottom: 1px solid #111827; }

            .tx-id {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #4B5563;
              font-weight: 600;
            }

            .tag {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .tag-shared { background-color: #F3F4F6; color: #111827; border: 1px solid #D1D5DB; }
            .tag-personal { background-color: #F9FAFB; color: #6B7280; border: 1px solid #E5E7EB; }
            .tag-owed { background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
            .tag-owes { background-color: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }

            /* Footer Section */
            .doc-footer {
              border-top: 1px solid #E5E7EB;
              padding-top: 20px;
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #6B7280;
            }
            .footer-left {
              font-weight: 500;
            }
            .footer-right {
              font-family: 'JetBrains Mono', monospace;
              color: #9CA3AF;
            }

            @media print {
              body { padding: 24px; }
              .statement-header { border-bottom-color: #000000 !important; }
              th { border-bottom-color: #000000 !important; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>

          <!-- Minimal Classic Header -->
          <div class="statement-header">
            <div class="brand-group">
              <div class="brand-row">
                <img src="${logoIcon}" class="brand-logo" alt="Tallyin Logo" />
                <span class="brand-name">Tallyin</span>
              </div>
              <div class="statement-type">Statement of Account</div>
            </div>

            <div class="doc-metadata">
              <div class="meta-row"><span class="label">Room:</span> <span class="val">${roomName || 'Shared Workspace'}</span></div>
              <div class="meta-row"><span class="label">Workspace ID:</span> <span class="val">${userRoomId || 'N/A'}</span></div>
              <div class="meta-row"><span class="label">Exported by:</span> <span class="val">${userNickname}</span></div>
              <div class="meta-row"><span class="label">Date:</span> <span class="val">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
              <div class="meta-ref">REF #${auditRefCode}</div>
            </div>
          </div>

          <!-- Executive Summary Grid -->
          <div class="section-label">Financial Summary</div>
          <div class="summary-grid">
            <div class="summary-box">
              <div class="box-title">Total Activity</div>
              <div class="box-amount">${formatINR(totalSpend)}</div>
              <div class="box-note">${dataList.length} transactions</div>
            </div>
            <div class="summary-box">
              <div class="box-title">Shared Ledger</div>
              <div class="box-amount" style="color: #047857;">${formatINR(sharedSpend)}</div>
              <div class="box-note">Included in balance</div>
            </div>
            <div class="summary-box">
              <div class="box-title">Personal Ledger</div>
              <div class="box-amount" style="color: #4B5563;">${formatINR(personalSpend)}</div>
              <div class="box-note">Excluded from balance</div>
            </div>
            <div class="summary-box">
              <div class="box-title">Your Net Standing</div>
              <div class="box-amount" style="color: ${myBalance >= 0 ? '#047857' : '#B91C1C'};">${statusText}</div>
              <div class="box-note">Based on shared bills</div>
            </div>
          </div>

          <!-- Minimal Status Note -->
          <div class="note-box">
            <strong>Statement Note:</strong> Net roommate balance standing is <strong>${statusText}</strong> derived from shared bills totaling ${formatINR(sharedSpend)}. Personal expenses (${formatINR(personalSpend)}) are tracked for private reference and excluded from roommate settlements.
          </div>

          <!-- Per-Member Balance Breakdown Table -->
          <div class="table-block">
            <div class="section-label">Roommate Balance Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th class="text-right">Total Paid</th>
                  <th class="text-right">Shared Paid</th>
                  <th class="text-right">Personal Paid</th>
                  <th class="text-right">Net Standing</th>
                </tr>
              </thead>
              <tbody>
                ${members.map(m => {
                  const mTotalPaid = dataList.filter(t => t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)).reduce((s,t)=>s+(Number(t.amount)||0),0);
                  const mSharedPaid = dataList.filter(t => t.isShared && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname))).reduce((s,t)=>s+(Number(t.amount)||0),0);
                  const mPersonalPaid = mTotalPaid - mSharedPaid;
                  const mBal = computedStats.balances?.[m.uid] || 0;
                  const tagClass = mBal > 0 ? 'tag-owed' : mBal < 0 ? 'tag-owes' : 'tag-personal';
                  const balText = mBal > 0 ? `+${formatINR(mBal)} (Owed)` : mBal < 0 ? `-${formatINR(Math.abs(mBal))} (Owes)` : 'Settled';
                  return `<tr>
                    <td style="font-weight: 700;">${m.nickname}</td>
                    <td class="text-right" style="font-weight: 600;">${formatINR(mTotalPaid)}</td>
                    <td class="text-right" style="color: #047857; font-weight: 600;">${formatINR(mSharedPaid)}</td>
                    <td class="text-right" style="color: #6B7280;">${formatINR(mPersonalPaid)}</td>
                    <td class="text-right">
                      <span class="tag ${tagClass}">${balText}</span>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Itemized Transaction Audit Log -->
          <div class="table-block">
            <div class="section-label">Itemized Transactions (${dataList.length})</div>
            <table>
              <thead>
                <tr>
                  <th>TX ID</th>
                  <th>Date & Time</th>
                  <th>Description / Merchant</th>
                  <th class="text-right">Amount (INR)</th>
                  <th>Category</th>
                  <th>Paid By</th>
                  <th>Split Type</th>
                </tr>
              </thead>
              <tbody>
                ${dataList.map(t => `
                  <tr>
                    <td class="tx-id">${formatTxId(t.id)}</td>
                    <td style="white-space: nowrap; color: #4B5563;">${t.date} ${t.time ? `• ${parseTimeAndHistory(t.time).time}` : ''}</td>
                    <td style="font-weight: 700; color: #111827;">${t.title}</td>
                    <td class="text-right" style="font-weight: 700; color: #111827;">${formatINR(t.amount)}</td>
                    <td style="color: #4B5563;">${t.category}</td>
                    <td style="font-weight: 600;">${t.paidBy}</td>
                    <td>
                      <span class="tag ${t.isShared ? 'tag-shared' : 'tag-personal'}">
                        ${getDisplaySplitLabel(t) || (t.isShared ? 'Shared' : 'Personal')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Classic Footer -->
          <div class="doc-footer">
            <div class="footer-left">
              Tallyin Financial Systems • Official Statement of Account
            </div>
            <div class="footer-right">
              ${auditRefCode}
            </div>
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

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        // Fallback using hidden iframe if popup blocker prevents new tab
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      }
      triggerToast('Generating PDF statement...');
    } catch (error) {
      console.error(error);
      triggerToast('Failed to generate PDF statement.');
    }
  };

  const sendStatementEmail = async (txList, recipientList, type, ownerName = '', targetMonthStr = '') => {
    if (txList.length === 0) return;
    const cleanRecipients = recipientList.map(e => e.trim()).filter(e => e && e.includes('@'));
    if (cleanRecipients.length === 0) return;

    const activeMonthStr = targetMonthStr || selectedMonth || 'ledger';

    try {
      // 1. Generate CSV Attachment
      const csvHeaders = ['Transaction ID', 'Date', 'Time', 'Description/Merchant', 'Amount (INR)', 'Category', 'Paid By', 'Split Type'];
      const csvRows = txList.map(t => [
        formatTxId(t.id),
        t.date,
        parseTimeAndHistory(t.time).time,
        t.title,
        t.amount,
        t.category,
        t.paidBy,
        getDisplaySplitLabel(t)
      ]);
      const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

      // 2. Generate Excel HTML Table Attachment
      const totalSpend = txList.filter(t => t.category !== 'Payment').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const memberNames = members.map(m => m.nickname).join(' & ') || userNickname;
      
      let reportTitle = '';
      if (type === 'room') reportTitle = 'Room Financial Ledger Report';
      else if (type === 'fund') reportTitle = 'Room Fund Tracker Report';
      else reportTitle = `Personal Financial Statement: ${ownerName}`;

      const excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
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
            <span class="header-title">${reportTitle}</span><br/>
            <b>Room Workspace:</b> ${userRoomId || 'N/A'}<br/>
            <b>Room Name:</b> ${roomName}<br/>
            <b>Generated on:</b> ${new Date().toLocaleDateString()}<br/>
            <b>Total Selected Spend:</b> ${formatINR(totalSpend)}<br/>
            ${type !== 'personal' ? `<b>Members:</b> ${memberNames}` : `<b>Owner Name:</b> ${ownerName}`}
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
              ${txList.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${parseTimeAndHistory(t.time).time}</td>
                  <td>${t.title}</td>
                  <td>${t.amount}</td>
                  <td>${t.category}</td>
                  <td>${t.paidBy}</td>
                  <td>${getDisplaySplitLabel(t)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // 3. Generate HTML Content for PDF Conversion (MNC Statement Style)
      const sharedSpend = txList.filter(t => t.isShared && t.category !== 'Payment').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const personalSpend = totalSpend - sharedSpend;
      const myBalance = computedStats.currentUserBalance;
      const statusText = myBalance === 0
        ? 'All settled up'
        : myBalance > 0
          ? `You are owed ${formatINR(myBalance)}`
          : `You owe ${formatINR(Math.abs(myBalance))}`;

      const pdfHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; color: #0F172A; padding: 40px; background-color: #ffffff; line-height: 1.5; }
            
            .invoice-container { max-width: 800px; margin: 0 auto; }
            
            /* Premium Header Layout */
            .header-banner { border-bottom: 2px solid #E2E8F0; padding-bottom: 24px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand-logo { display: flex; align-items: center; gap: 8px; }
            .brand-icon { background-color: #1A3827; color: #A3E635; font-weight: 900; padding: 6px 12px; border-radius: 8px; font-size: 18px; letter-spacing: -0.5px; }
            .brand-name { font-size: 20px; font-weight: 800; color: #1A3827; letter-spacing: -0.5px; }
            
            .meta-info { text-align: right; font-size: 11px; color: #475569; line-height: 1.6; }
            .meta-info h2 { font-size: 18px; font-weight: 800; color: #1E293B; margin-bottom: 4px; letter-spacing: -0.5px; }
            
            /* Overview Cards */
            .summary-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; margin-bottom: 12px; }
            .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
            .summary-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; background-color: #F8FAFC; }
            .card-label { font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .card-value { font-size: 15px; font-weight: 800; color: #0F172A; }
            
            /* Table Styling */
            table { width: 100%; border-collapse: collapse; margin-bottom: 36px; }
            th { background-color: #1A3827; color: #ffffff; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 14px; text-align: left; }
            td { padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #334155; }
            tr:nth-child(even) td { background-color: #F8FAFC; }
            
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 700; }
            .badge-shared { background-color: rgba(26, 56, 39, 0.08); color: #1A3827; }
            .badge-personal { background-color: #F1F5F9; color: #475569; }
            
            .footer { border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: center; font-size: 10px; color: #64748B; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header-banner">
              <div class="brand-logo">
                <table style="border-collapse: collapse;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 10px;">
                      <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="T" width="36" height="36" style="display: block; border-radius: 10px;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 22px; font-weight: 900; color: #1A3827; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Tallyin</span>
                    </td>
                  </tr>
                </table>
              </div>
              <div class="meta-info">
                <h2>Account Statement</h2>
                <b>Room Name:</b> ${roomName}<br/>
                <b>Workspace ID:</b> ${userRoomId || 'N/A'}<br/>
                <b>Generated on:</b> ${new Date().toLocaleDateString()}<br/>
                ${type !== 'personal' ? `<b>Members:</b> ${memberNames}` : `<b>Statement Owner:</b> ${ownerName}`}
              </div>
            </div>
            
            <h4 class="summary-title">Financial Summary</h4>
            <div class="cards-grid">
              <div class="summary-card">
                <p class="card-label">Total Spent</p>
                <p class="card-value">${formatINR(totalSpend)}</p>
              </div>
              <div class="summary-card" style="border-color:#D1FAE5;background-color:#ECFDF5">
                <p class="card-label" style="color:#065F46">Shared Bills</p>
                <p class="card-value" style="color:#065F46">${formatINR(sharedSpend)}</p>
              </div>
              <div class="summary-card">
                <p class="card-label">Personal</p>
                <p class="card-value">${formatINR(personalSpend)}</p>
              </div>
              <div class="summary-card" style="border-color:${myBalance >= 0 ? '#D1FAE5' : '#FEE2E2'};background-color:${myBalance >= 0 ? '#ECFDF5' : '#FFF1F2'}">
                <p class="card-label" style="color:${myBalance >= 0 ? '#065F46' : '#991B1B'}">Your Balance</p>
                <p class="card-value" style="color:${myBalance >= 0 ? '#047857' : '#B91C1C'}">${statusText}</p>
              </div>
            </div>
            
            <h4 class="summary-title">Ledger Transaction Details</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Paid By</th>
                  <th>Split</th>
                </tr>
              </thead>
              <tbody>
                ${txList.map(t => `
                  <tr>
                    <td>${t.date}</td>
                    <td>${parseTimeAndHistory(t.time).time}</td>
                    <td style="font-weight: 600; color: #0F172A;">${t.title}</td>
                    <td style="font-weight: 700; color: #1A3827;">${formatINR(t.amount)}</td>
                    <td>${t.category}</td>
                    <td>${t.paidBy}</td>
                    <td>
                      <span class="badge ${t.isShared ? 'badge-shared' : 'badge-personal'}">
                        ${getDisplaySplitLabel(t)}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              This statement of account was generated securely by Tallyin roommate expense platform.
            </div>
          </div>
        </body>
        </html>
      `;

      // 4. Construct Attachments Payload
      const label = type === 'room' ? 'room' : type === 'fund' ? 'fund' : `personal_${ownerName.toLowerCase().replace(/\s+/g, '_')}`;
      const attachments = [
        {
          name: `tallyin_${activeMonthStr}_${label}_statement.csv`,
          mimeType: 'text/csv',
          base64: toBase64(csvContent)
        },
        {
          name: `tallyin_${activeMonthStr}_${label}_statement.xls`,
          mimeType: 'application/vnd.ms-excel',
          base64: toBase64(excelContent)
        },
        {
          name: `tallyin_${activeMonthStr}_${label}_statement.html`,
          mimeType: 'text/html',
          base64: toBase64(pdfHtmlContent),
          convertToPdf: true // Flag to tell Apps Script to convert to PDF
        }
      ];

      const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
      const subject = `Tallyin ${type === 'room' ? 'Room Ledger' : type === 'fund' ? 'Fund Tracker' : `Personal Statement - ${ownerName}`}: ${roomName} (${activeMonthStr})`;
      
      const statementDesc = type === 'room' 
        ? 'room financial statement of account (shared ledger)' 
        : type === 'fund' 
          ? 'room fund tracker transaction report' 
          : `personal expense statement of account for <strong>${ownerName}</strong>`;

      const htmlBody = `
        <div style="background-color: #F8FAFC; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #E2E8F0;">
            
            <!-- MNC Premium Header Banner -->
            <div style="background-color: #1A3827; padding: 28px 32px; text-align: left;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: middle;">
                    <table style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="T" width="36" height="36" style="display: block; border-radius: 10px;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1;">Tallyin</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="background-color: rgba(163, 230, 53, 0.2); color: #A3E635; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 12px; border-radius: 20px; font-family: sans-serif;">STATEMENT</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Content Area -->
            <div style="padding: 32px;">
              <h2 style="color: #0F172A; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; font-family: sans-serif;">Monthly Financial Statement</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                Hello Roommate,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                Attached is the official ${statementDesc} in room <strong>${roomName}</strong> (${userRoomId || 'N/A'}) for the period of <strong>${activeMonthStr}</strong>.
              </p>

              <!-- Key Metadata Info Cards -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td style="width: 50%; padding-right: 8px; padding-bottom: 16px;">
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">WORKSPACE ID</span>
                      <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${userRoomId || 'N/A'}</span>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 8px; padding-bottom: 16px;">
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">PERIOD</span>
                      <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${activeMonthStr}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; padding-right: 8px;">
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">TOTAL AMOUNT</span>
                      <span style="font-size: 13px; font-weight: 700; color: #1A3827;">${formatINR(totalSpend)}</span>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 8px;">
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">RECIPIENT</span>
                      <span style="font-size: 13px; font-weight: 700; color: #0F172A; text-overflow: ellipsis; display: block; overflow: hidden; white-space: nowrap;">${ownerName || 'Room Members'}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Attachments Description -->
              <div style="border-top: 1px solid #E2E8F0; padding-top: 24px; margin-bottom: 24px;">
                <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin: 0 0 12px 0;">Attached Documents</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #F1F5F9;">
                    <td style="padding: 10px 0; font-size: 13px; color: #0F172A; font-weight: 600;">📄 PDF Statement</td>
                    <td style="padding: 10px 0; font-size: 12px; color: #64748B; text-align: right;">Official print-ready ledger</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #F1F5F9;">
                    <td style="padding: 10px 0; font-size: 13px; color: #0F172A; font-weight: 600;">📊 Excel Sheet (.xls)</td>
                    <td style="padding: 10px 0; font-size: 12px; color: #64748B; text-align: right;">Styled spreadsheet summary</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 13px; color: #0F172A; font-weight: 600;">📝 CSV Document</td>
                    <td style="padding: 10px 0; font-size: 12px; color: #64748B; text-align: right;">Raw comma-separated table data</td>
                  </tr>
                </table>
              </div>

              <!-- MNC CTA Action Button -->
              <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
                <a href="https://tallyin.vercel.app" style="background-color: #1A3827; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: sans-serif;">Go to Tallyin Workspace</a>
              </div>
            </div>

            <!-- MNC Footer Section -->
            <div style="background-color: #F8FAFC; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="font-size: 11px; color: #64748B; line-height: 1.5; margin: 0 0 8px 0;">
                This document and attachments contain confidential financial details generated securely by the Tallyin billing synchronization platform.
              </p>
              <p style="font-size: 10px; color: #94A3B8; margin: 0;">
                © 2026 Tallyin Corporation. All rights reserved. • Roommate Expense Management Sync
              </p>
            </div>
          </div>
        </div>
      `;

      for (const email of cleanRecipients) {
        const cleanEmail = email.trim().toLowerCase();
        const matchedMember = (members || []).find(m => m?.email && m.email.trim().toLowerCase() === cleanEmail);
        let recipientName = matchedMember?.nickname || matchedMember?.name;
        if (!recipientName && user?.email && user.email.trim().toLowerCase() === cleanEmail) {
          recipientName = user.user_metadata?.full_name || user.user_metadata?.nickname || userNickname;
        }
        if (!recipientName && codeLoginEmail && codeLoginEmail.trim().toLowerCase() === cleanEmail) {
          recipientName = userNickname;
        }
        const roommateName = recipientName?.trim() || 'Roommate';
        const greetingText = roommateName !== 'Roommate' ? `Hello ${roommateName},` : 'Hello Roommate,';

        const personalizedHtmlBody = htmlBody.replace('Hello Roommate,', greetingText);
        const personalizedTextBody = `Hi ${roommateName},\n\nYour Tallyin statement is attached.`;

        await fetch(activeScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            to: email,
            subject: subject,
            htmlBody: personalizedHtmlBody,
            textBody: personalizedTextBody,
            attachments: attachments
          })
        });
      }
    } catch (err) {
      console.error(`Failed to send statement email type ${type}:`, err);
      throw err;
    }
  };

  const emailAllStatements = async (targetMonthOverride = null) => {
    setEmailingType('all');

    const currentMonthStr = getLocalMonthStr();
    let targetMonth = targetMonthOverride;
    if (!targetMonth) {
      if (!selectedMonth || selectedMonth === 'All' || selectedMonth === currentMonthStr) {
        targetMonth = getPreviousMonthStr();
      } else {
        targetMonth = selectedMonth;
      }
    }

    triggerToast(`Emailing monthly statements (${targetMonth})...`);
    
    try {
      // 1. Email Room Shared Ledger
      const roomTxs = transactions.filter(t => {
        if (t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__' || t.category === '__SHOPPING__' || t.category === '__BILL__' || t.category === '__CHORE__' || t.category === '__DELETE_PROPOSAL__' || t.category === 'Payment') return false;
        const matchesMonth = t.date && t.date.startsWith(targetMonth);
        return t.isShared && matchesMonth;
      });
      
      const allEmails = members.map(m => m.email).filter(Boolean);
      if (allEmails.length > 0 && roomTxs.length > 0) {
        triggerToast(`Sending Room Ledger (${targetMonth}) to all roommates...`);
        await sendStatementEmail(roomTxs, allEmails, 'room', '', targetMonth);
      }

      // 3. Email Personal Statements to each member individually
      triggerToast(`Distributing personal statements (${targetMonth}) to members...`);
      let personalSent = 0;
      for (const member of members) {
        if (!member.email) continue;
        const memberPersonalTxs = transactions.filter(t => {
          const matchesMonth = t.date && t.date.startsWith(targetMonth);
          return t.isShared === false && 
                 t.splits && 
                 Array.isArray(t.splits) && 
                 t.splits.length === 1 && 
                 t.splits[0] && 
                 t.splits[0].uid === member.uid &&
                 t.category !== '__FUND_INIT__' &&
                 t.category !== '__FUND_SPEND__' &&
                 t.category !== '__SHOPPING__' &&
                 t.category !== '__CHORE__' &&
                 t.category !== '__DELETE_PROPOSAL__' &&
                 matchesMonth;
        });
        
        if (memberPersonalTxs.length > 0) {
          await sendStatementEmail(memberPersonalTxs, [member.email], 'personal', member.nickname, targetMonth);
          personalSent++;
        }
      }

      triggerToast(`All monthly statements (${targetMonth}) successfully emailed!`);
    } catch (err) {
      console.error('Failed to email all statements:', err);
      triggerToast('Failed to email monthly statements.');
    } finally {
      setEmailingType(null);
    }
  };

  // Filtered transactions for the ledger
  // Ledger shows: shared expenses + personal expenses added by OTHER users.
  // Current user's own personal expenses are hidden here — they live in the Personal Expenses tab.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredTransactions = useMemo(() => {
    const currentUid = user?.id || 'anonymous';
    const activeTxList = transactions.filter(t => {
      if (t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__' || t.category === '__SHOPPING__' || t.category === '__BILL__' || t.category === '__CHORE__' || t.category === '__DELETE_PROPOSAL__') return false;
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
      const matchesSearch = matchesTxSearch(t, searchQuery);
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesMonth = selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth));
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [transactions, searchQuery, categoryFilter, selectedMonth, user]);

  // Check if there is an existing transaction matching current input title
  const matchingExistingTx = useMemo(() => {
    if (!formFor || formFor.trim().length < 2 || editingTransaction) return null;
    return transactions.find(t => 
      t.title &&
      t.title.toLowerCase().trim() === formFor.toLowerCase().trim() &&
      t.category !== '__FUND_INIT__' &&
      t.category !== '__FUND_SPEND__' &&
      t.category !== '__SHOPPING__' &&
      t.category !== '__CHORE__' &&
      t.category !== '__DELETE_PROPOSAL__'
    );
  }, [formFor, transactions, editingTransaction]);

  // Check if there is an existing fund spend transaction with matching title
  const matchingExistingFundSpend = useMemo(() => {
    if (!fundSpendFormTitle || fundSpendFormTitle.trim().length < 2 || editingFundSpend || !selectedFundId) return null;
    return transactions.find(t => 
      t.category === '__FUND_SPEND__' &&
      String(t.split) === String(selectedFundId) &&
      t.title &&
      t.title.toLowerCase().trim() === fundSpendFormTitle.toLowerCase().trim()
    );
  }, [fundSpendFormTitle, transactions, editingFundSpend, selectedFundId]);

  // All personal expenses in the room (isShared is false)
  const allPersonalExpenses = useMemo(() => {
    return transactions.filter(t => {
      return t.isShared === false && 
             t.category !== '__FUND_INIT__' &&
             t.category !== '__FUND_SPEND__' &&
             t.category !== '__SHOPPING__' &&
             t.category !== '__BILL__' &&
             t.category !== '__CHORE__' &&
             t.category !== '__DELETE_PROPOSAL__' &&
             t.category !== 'Payment';
    });
  }, [transactions]);

  // Personal expenses paid by YOU for YOURSELF
  const mySelfPersonalExpenses = useMemo(() => {
    const currentUid = user?.id || auth.currentUser?.uid || 'anonymous';
    return allPersonalExpenses.filter(t => {
      const isPaidByMe = (t.paidByUid === currentUid || t.createdBy === currentUid || t.paidBy === userNickname);
      const isForMeOnly = t.splits && Array.isArray(t.splits) && t.splits.length === 1 && t.splits[0] && t.splits[0].uid === currentUid;
      return isPaidByMe && isForMeOnly;
    });
  }, [allPersonalExpenses, user, auth.currentUser, userNickname]);

  // Personal expenses paid by YOU for SOMEONE ELSE
  const paidForOthersByMeExpenses = useMemo(() => {
    const currentUid = user?.id || auth.currentUser?.uid || 'anonymous';
    return allPersonalExpenses.filter(t => {
      const isPaidByMe = (t.paidByUid === currentUid || t.createdBy === currentUid || t.paidBy === userNickname);
      const isForOther = t.splits && Array.isArray(t.splits) && t.splits[0] && t.splits[0].uid !== currentUid;
      return isPaidByMe && isForOther;
    });
  }, [allPersonalExpenses, user, auth.currentUser, userNickname]);

  // My personal expenses (all expenses involving self)
  const myPersonalExpenses = useMemo(() => {
    const currentUid = user?.id || auth.currentUser?.uid || 'anonymous';
    return allPersonalExpenses.filter(t => {
      const isMine = (t.splits && Array.isArray(t.splits) && t.splits.length === 1 && t.splits[0] && t.splits[0].uid === currentUid) ||
                     (t.paidByUid === currentUid) ||
                     (t.createdBy === currentUid) ||
                     (t.paidBy === userNickname);
      return isMine;
    });
  }, [allPersonalExpenses, user, auth.currentUser, userNickname]);

  // Active base personal list based on section tab ('all' | 'my-self' | 'paid-for-others' | 'by-roommate')
  const activeBasePersonalList = useMemo(() => {
    if (personalTabSection === 'my-self') return mySelfPersonalExpenses;
    if (personalTabSection === 'paid-for-others') return paidForOthersByMeExpenses;
    if (personalTabSection === 'by-roommate') {
      if (!selectedRoommateFilter || selectedRoommateFilter === 'all') return allPersonalExpenses;
      return allPersonalExpenses.filter(t => {
        const isPaidByTarget = t.paidByUid === selectedRoommateFilter;
        const isForTarget = t.splits && Array.isArray(t.splits) && t.splits.some(s => s.uid === selectedRoommateFilter);
        return isPaidByTarget || isForTarget;
      });
    }
    return allPersonalExpenses;
  }, [personalTabSection, mySelfPersonalExpenses, paidForOthersByMeExpenses, allPersonalExpenses, selectedRoommateFilter]);



  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const myFunds = useMemo(() => {
    return transactions.filter(t => 
      t.category === '__FUND_INIT__'
    );
  }, [transactions]);

  const myFundSpends = useMemo(() => {
    return transactions.filter(t => 
      t.category === '__FUND_SPEND__'
    );
  }, [transactions]);

  const pendingShoppingCount = useMemo(() => {
    return transactions.filter(t => t.category === '__SHOPPING__' && t.splitType === 'pending').length;
  }, [transactions]);

  const pendingBillsCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter(t => {
      if (t.category !== '__BILL__' && t.category !== '__CHORE__') return false;
      if (t.split === 'paid') return false;
      if (!t.date) return false;
      const due = new Date(t.date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    }).length;
  }, [transactions]);

  const shoppingItems = useMemo(() => {
    return transactions.filter(t => t.category === '__SHOPPING__');
  }, [transactions]);

  const billsList = useMemo(() => {
    const currentUid = user?.id || auth.currentUser?.uid || 'anonymous';
    return transactions.filter(t => {
      if (t.category !== '__BILL__' && t.category !== '__CHORE__') return false;
      if (t.isShared === false && t.createdBy !== currentUid && t.paidByUid !== currentUid && t.createdBy !== 'anonymous' && t.paidByUid !== 'anonymous') return false;
      return true;
    });
  }, [transactions, user, auth.currentUser]);

  // Automated Bill Due Notification Engine (Browser Push + Email for 2-day advance & due date)
  useEffect(() => {
    if (!billsList || billsList.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateStr(today);

    const in2Days = new Date(today);
    in2Days.setDate(in2Days.getDate() + 2);
    const dueIn2DaysStr = getLocalDateStr(in2Days);

    billsList.forEach(bill => {
      const isPaid = bill.split === 'paid' || bill.split?.endsWith('|paid');
      if (isPaid || !bill.date) return;

      const dueStr = bill.date;
      const billId = bill.id;
      const rawAmt = Number(bill.amount) || 0;
      const formattedAmt = formatINR(rawAmt);

      // 1. Bill Due TODAY Notification
      if (dueStr === todayStr) {
        const notifKeyToday = `bill_notif_today_${billId}_${todayStr}`;
        if (!localStorage.getItem(notifKeyToday)) {
          localStorage.setItem(notifKeyToday, 'true');

          if (Notification.permission === 'granted' && localStorage.getItem('pushNotificationsEnabled') === 'true') {
            try {
              new Notification("🔔 Bill Due Today!", {
                body: `"${bill.title}" (${formattedAmt}) is due TODAY (${todayStr}). Pay & log it on DuoShare!`,
                icon: logoIcon || '/favicon.ico'
              });
            } catch (e) {
              console.warn("Failed browser notification:", e);
            }
          }

          if (notificationMethod !== 'none') {
            sendEmailNotification(bill, 'bill_due_2days').catch(err => {
              console.warn("Failed to send bill due in 2 days email:", err);
            });
          }
        }
      }
    });
  }, [billsList, notificationMethod, pushNotificationsEnabled]);

  const filteredPersonalExpenses = useMemo(() => {
    return activeBasePersonalList.filter(t => {
      const matchesSearch = matchesTxSearch(t, searchQuery);
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesMonth = selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth));
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [activeBasePersonalList, searchQuery, categoryFilter, selectedMonth]);

  // Available unique months from all transactions
  const availableMonths = useMemo(() => {
    const months = new Set();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        months.add(t.date.substring(0, 7)); // "YYYY-MM"
      }
    });
    // Ensure current month is always available
    const current = getLocalMonthStr();
    months.add(current);
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Memoized calculations for Home View to prevent unneeded loops
  const homeStats = useMemo(() => {
    const activeMonth = selectedMonth === 'All' ? getLocalMonthStr() : selectedMonth;
    const monthlyPersonalTotal = myPersonalExpenses
      .filter(t => selectedMonth === 'All' || (t.date && t.date.startsWith(activeMonth)))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const personalPercentage = Math.min((monthlyPersonalTotal / personalCap) * 100, 100);

    const monthSharedSpend = transactions
      .filter(t => t.isShared && t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__' && t.category !== '__SHOPPING__' && t.category !== '__BILL__' && t.category !== '__CHORE__' && t.category !== 'Payment' && t.date && t.date.startsWith(activeMonth))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const isLowBalance = monthlyBudget > 0 && monthSharedSpend > (monthlyBudget * 0.9);

    return {
      monthlyPersonalTotal,
      personalPercentage,
      monthSharedSpend,
      isLowBalance
    };
  }, [transactions, myPersonalExpenses, selectedMonth, personalCap, monthlyBudget]);

  // Memoized calculations for Insights View to ensure zero-latency renders
  const computedInsights = useMemo(() => {
    const today = new Date();
    const currentMonthStr = getLocalMonthStr(today);
    const isPersonalTab = insightsTab === 'personal';

    const monthTransactions = transactions.filter(t => 
      (selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth))) &&
      t.category !== '__FUND_INIT__' && 
      t.category !== '__FUND_SPEND__' &&
      t.category !== '__SHOPPING__' &&
      t.category !== '__CHORE__' &&
      t.category !== 'Payment'
    );
    const monthPersonalExpenses = myPersonalExpenses.filter(t => selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth)));

    const targetTransactions = isPersonalTab ? monthPersonalExpenses : monthTransactions;

    let daysInMonth = 30, daysPassed = 15, daysLeft = 15;
    
    if (selectedMonth === 'All') {
      let earliestDate = today;
      if (targetTransactions.length > 0) {
        const dates = targetTransactions
          .map(t => t.date ? new Date(t.date) : null)
          .filter(d => d && !isNaN(d.getTime()));
        if (dates.length > 0) {
          earliestDate = new Date(Math.min(...dates));
        }
      }
      const diffTime = Math.abs(today - earliestDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      daysPassed = diffDays;
      daysLeft = Math.max(0, daysInMonth - today.getDate());
    } else {
      const [year, month] = selectedMonth.split('-');
      const y = Number(year) || today.getFullYear();
      const m = Number(month) || (today.getMonth() + 1); // 1-indexed
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

    const monthSharedSpend = monthTransactions
      .filter(t => t.isShared)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
    const monthPersonalSpend = monthPersonalExpenses
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
    const monthTotalSpend = monthSharedSpend + monthPersonalSpend;

    const catMap = {};
    targetTransactions.forEach(t => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
    });
    const rawTotal = targetTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const total = rawTotal > 0 ? rawTotal : 1;
    const catArr = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const dailyAvg = rawTotal > 0 && daysPassed > 0 ? Math.round(rawTotal / daysPassed) : 0;
    const monthsCount = selectedMonth === 'All' ? (availableMonths.length || 1) : 1;
    const activeLimit = (isPersonalTab ? personalCap : monthlyBudget) * monthsCount;
    const roomOrPersonalTotal = isPersonalTab ? rawTotal : monthSharedSpend;
    const limitRemaining = Math.max(0, activeLimit - roomOrPersonalTotal);
    const safeDailyLimit = daysLeft > 0 ? Math.round(limitRemaining / daysLeft) : 0;
    const myShare = Math.abs(computedStats.currentUserBalance);

    const activeTransactions = targetTransactions;
    const largestTx = activeTransactions.length > 0 
      ? [...activeTransactions].sort((a, b) => Number(b.amount) - Number(a.amount))[0] 
      : null;
      
    const totalTransactionsCount = activeTransactions.length;
    const avgTxValue = totalTransactionsCount > 0 ? (rawTotal / totalTransactionsCount) : 0;
    const isProjectable = selectedMonth !== 'All' && daysPassed > 0;
    
    // Smart Month-End Projection: prevents early-month lump-sum bills (e.g. Rent on 1st) from multiplying x31
    let projectedSpend = rawTotal;
    if (isProjectable) {
      if (daysPassed >= 5) {
        projectedSpend = Math.round((rawTotal / daysPassed) * daysInMonth);
      } else if (daysLeft > 0) {
        // Early month (Days 1-4): project current spend + baseline daily pacing for remaining days
        const baselineDailyRate = activeLimit > 0 ? (activeLimit / daysInMonth) : 200;
        projectedSpend = Math.round(rawTotal + (baselineDailyRate * daysLeft));
      }
    }

    // Compute dynamic Fairness Score
    let fairnessScore = 100;
    let fairnessRating = 'Perfect';
    let fairnessDesc = 'Communal expenses are perfectly distributed.';
    
    if (!isPersonalTab && members.length > 0) {
      const activeMonthStr = selectedMonth === 'All' ? '' : selectedMonth;
      const allMonthTxs = transactions.filter(t => 
        (!activeMonthStr || (t.date && t.date.startsWith(activeMonthStr))) &&
        t.category !== '__FUND_INIT__' && 
        t.category !== '__FUND_SPEND__' &&
        t.category !== '__SHOPPING__' &&
        t.category !== '__CHORE__'
      );

      const monthSharedPurchases = allMonthTxs
        .filter(t => t.isShared && t.category !== 'Payment')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      if (monthSharedPurchases > 0) {
        const fairShare = monthSharedPurchases / members.length;
        let sumOfDeviations = 0;
        
        members.forEach(m => {
          const purchasesPaid = allMonthTxs
            .filter(t => t.isShared && t.category !== 'Payment' && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)))
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);

          const settlementsPaid = allMonthTxs
            .filter(t => t.isShared && t.category === 'Payment' && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)))
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);

          const settlementsReceived = allMonthTxs
            .filter(t => {
              if (!t.isShared || t.category !== 'Payment') return false;
              if (t.splits && Array.isArray(t.splits)) {
                return t.splits.some(split => split.uid === m.uid && Number(split.amount) > 0);
              }
              const payerUid = t.paidByUid;
              if (payerUid === m.uid) return false;
              return true;
            })
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);

          const netContribution = purchasesPaid + settlementsPaid - settlementsReceived;
          sumOfDeviations += Math.abs(netContribution - fairShare);
        });

        const maxPossibleDeviation = 2 * (members.length - 1) * fairShare;
        if (maxPossibleDeviation > 0) {
          fairnessScore = Math.max(0, Math.min(100, Math.round(100 - (sumOfDeviations / maxPossibleDeviation) * 100)));
        }
      }

      if (fairnessScore >= 90) {
        fairnessRating = 'Excellent';
        fairnessDesc = 'Expenses are very fairly distributed among members.';
      } else if (fairnessScore >= 70) {
        fairnessRating = 'Good';
        fairnessDesc = 'Spend distribution is decent, but some roommates paid more.';
      } else if (fairnessScore >= 40) {
        fairnessRating = 'Uneven';
        fairnessDesc = 'Communal bills are unevenly split. Consider settling up soon.';
      } else {
        fairnessRating = 'Very Uneven';
        fairnessDesc = 'High imbalance in payments. Settle up to restore balance.';
      }
    }

    // Advanced MoM (Month-over-Month) calculation for MNC Level upgrade
    let momChangePct = null;
    let isSpendUp = false;
    let prevMonthSpend = 0;

    if (selectedMonth !== 'All') {
      const [year, month] = selectedMonth.split('-');
      const y = Number(year) || today.getFullYear();
      const m = Number(month) || (today.getMonth() + 1);
      const prevDate = new Date(y, m - 2, 1);
      const prevMonthStr = getLocalMonthStr(prevDate);

      const prevMonthTransactions = transactions.filter(t => 
        t.date && t.date.startsWith(prevMonthStr) &&
        t.category !== '__FUND_INIT__' && 
        t.category !== '__FUND_SPEND__' &&
        t.category !== '__SHOPPING__' &&
        t.category !== '__CHORE__' &&
        t.category !== 'Payment'
      );
      const prevMonthPersonalExpenses = myPersonalExpenses.filter(t => t.date && t.date.startsWith(prevMonthStr));
      const prevSource = isPersonalTab ? prevMonthPersonalExpenses : prevMonthTransactions;
      prevMonthSpend = prevSource.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      if (prevMonthSpend > 0) {
        momChangePct = Math.round(((rawTotal - prevMonthSpend) / prevMonthSpend) * 100);
        isSpendUp = rawTotal > prevMonthSpend;
      }
    }

    return {
      monthTransactions,
      monthPersonalExpenses,
      targetTransactions,
      daysInMonth,
      daysPassed,
      daysLeft,
      monthSharedSpend,
      monthPersonalSpend,
      monthTotalSpend,
      catArr,
      dailyAvg,
      activeLimit,
      roomOrPersonalTotal,
      limitRemaining,
      safeDailyLimit,
      myShare,
      largestTx,
      totalTransactionsCount,
      avgTxValue,
      projectedSpend,
      isProjectable,
      fairnessScore,
      fairnessRating,
      fairnessDesc,
      momChangePct,
      isSpendUp,
      prevMonthSpend
    };
  }, [transactions, myPersonalExpenses, selectedMonth, insightsTab, members, userNickname, personalCap, monthlyBudget, computedStats.currentUserBalance, availableMonths]);

  // Maintenance Mode Whitelist Check (Declared before early returns)
  const currentEmailClean = (user?.email || auth.currentUser?.email || '').trim().toLowerCase();
  const currentUidClean = (user?.id || user?.uid || auth.currentUser?.uid || '').trim();

  const isUserWhitelistedForMaintenance = useMemo(() => {
    if (!currentEmailClean && !currentUidClean) return false;
    if (ADMIN_EMAILS.includes(currentEmailClean)) return true;
    return allowedMaintenanceAccounts.some(acc => {
      const cleanAcc = String(acc).trim().toLowerCase();
      return cleanAcc && (cleanAcc === currentEmailClean || cleanAcc === currentUidClean.toLowerCase());
    });
  }, [currentEmailClean, currentUidClean, allowedMaintenanceAccounts]);

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

  // DIRECT ADMIN PORTAL RENDER (Top-level view override)
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 p-4 sm:p-8 font-sans text-left transition-colors duration-300">
        <AdminDashboard
          user={user}
          userNickname={userNickname}
          userRooms={userRooms}
          triggerToast={triggerToast}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          appVersion={APP_VERSION}
          onExitAdmin={() => setCurrentView('home')}
          isSystemMaintenanceActive={isSystemMaintenanceActive}
          setIsSystemMaintenanceActive={setIsSystemMaintenanceActive}
          maintenanceMessage={maintenanceMessage}
          setMaintenanceMessage={setMaintenanceMessage}
          globalBroadcast={globalBroadcast}
          setGlobalBroadcast={setGlobalBroadcast}
          pinnedMessages={pinnedMessages}
          setPinnedMessages={setPinnedMessages}
          simulatedLatency={simulatedLatency}
          setSimulatedLatency={setSimulatedLatency}
          allowedMaintenanceAccounts={allowedMaintenanceAccounts}
          setAllowedMaintenanceAccounts={setAllowedMaintenanceAccounts}
        />
      </div>
    );
  }

  // BANNED USER OVERRIDE (Block Suspended Accounts)
  if (isUserBanned && currentView !== 'admin') {
    const isUserAdmin = currentEmailClean === 'tallyin.alerts@gmail.com';
    return (
      <BannedUserView
        user={user}
        banInfo={banInfo}
        handleSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenAdmin={isUserAdmin ? () => setCurrentView('admin') : null}
      />
    );
  }

  // SYSTEM MAINTENANCE OVERRIDE (System-wide Maintenance Screen)
  if (isSystemMaintenanceActive && currentView !== 'admin' && !isUserWhitelistedForMaintenance) {
    return (
      <MaintenanceView
        user={user}
        currentUserEmail={user?.email}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        handleGoogleLogin={handleGoogleLogin}
        handleCodeLogin={handleCodeLogin}
        handleSignOut={handleSignOut}
        accessCodeInput={accessCodeInput}
        setAccessCodeInput={setAccessCodeInput}
        codeLoginEmail={codeLoginEmail}
        setCodeLoginEmail={setCodeLoginEmail}
        showCodeLogin={showCodeLogin}
        setShowCodeLogin={setShowCodeLogin}
        isVerifyingCode={isVerifyingCode}
        authError={authError}
        setAuthError={setAuthError}
        toastMessage={toastMessage}
        triggerToast={triggerToast}
        appVersion={APP_VERSION}
        maintenanceMessage={maintenanceMessage}
      />
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
              src={faviconLogo} 
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

          {!showCodeLogin ? (
            <div className="space-y-3">
              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-[#1A3827] text-white hover:bg-[#255038] py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 border border-white/5 active:scale-98"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
              
              <div className="flex items-center justify-center gap-2 pt-2 text-xs">
                <span className="text-[#5C6E5C] dark:text-slate-400 font-medium">Or have an access code?</span>
                <button
                  onClick={() => {
                    setShowCodeLogin(true);
                    setAuthError(null);
                  }}
                  className="text-[#1A3827] dark:text-[#A3E635] font-extrabold underline hover:opacity-85"
                >
                  Log In via Code
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCodeLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Enter your 6-digit Access Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. TY9832"
                  value={accessCodeInput}
                  onChange={e => setAccessCodeInput(e.target.value)}
                  className="w-full px-3.5 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900 font-mono tracking-widest uppercase text-center font-bold animate-fade-in"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Your Email <span className="text-[#5C6E5C] dark:text-slate-500 font-normal">(optional — for expense alerts)</span></label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={codeLoginEmail}
                  onChange={e => setCodeLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeLogin(false);
                    setAuthError(null);
                  }}
                  className="flex-1 py-3 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingCode}
                  className="flex-1 py-3 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs hover:bg-[#255038] disabled:opacity-60 shadow-sm rounded-xl"
                >
                  {isVerifyingCode ? 'Verifying...' : 'Log In'}
                </button>
              </div>
            </form>
          )}

          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-[11px] text-red-700 dark:text-red-400 font-bold leading-relaxed text-center break-words select-all animate-fade-in">
              {authError}
            </div>
          )}

          <div className="text-center pt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none">
            Version {APP_VERSION}
          </div>
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
  if (user && (!userRoomId || !hasConfirmedRoom) && currentView !== 'admin') {
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
              src={faviconLogo} 
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
                    className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90"
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
              ) : (() => {
                const combinedRooms = [...userRooms];
                pendingUserRequests.forEach(p => {
                  if (!combinedRooms.some(r => r.roomId === p.roomId)) {
                    combinedRooms.push({
                      roomId: p.roomId,
                      roomName: p.roomName || p.roomId,
                      status: p.status || 'pending',
                      declinedAt: p.declinedAt,
                      approvedAt: p.approvedAt
                    });
                  }
                });

                // Filter out declined cards older than 24 hours (86,400,000 ms)
                const visibleRooms = combinedRooms.filter(r => {
                  const reqItem = pendingUserRequests.find(p => p.roomId === r.roomId) || r;
                  if (reqItem && reqItem.status === 'declined') {
                    const declinedTime = reqItem.declinedAt ? new Date(reqItem.declinedAt).getTime() : 0;
                    if (declinedTime > 0 && (Date.now() - declinedTime >= 24 * 60 * 60 * 1000)) {
                      return false; // Auto-vanish after 24 hours
                    }
                  }
                  return true;
                });

                if (visibleRooms.length === 0) return null;

                return (
                  <div className="space-y-2 text-left pt-3 border-t border-[#E3E8E3]/50 dark:border-slate-800/50">
                    <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block font-sans">
                      Your Spaces & Requests ({visibleRooms.length})
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {visibleRooms.map(r => {
                        const isActive = r.roomId === userRoomId;
                        const reqItem = pendingUserRequests.find(p => p.roomId === r.roomId);
                        const isUserMember = userRooms.some(u => u.roomId === r.roomId);
                        
                        const approvedTime = reqItem && reqItem.approvedAt ? new Date(reqItem.approvedAt).getTime() : 0;
                        const isApprovedExpired = approvedTime > 0 && (Date.now() - approvedTime >= 24 * 60 * 60 * 1000);
                        const isRecentlyApproved = reqItem && reqItem.status === 'approved' && !isApprovedExpired;
                        const isDeclined = !isUserMember && reqItem && reqItem.status === 'declined';
                        const isPending = !isUserMember && !isDeclined && reqItem && (reqItem.status === 'pending' || r.isPendingReq);

                        return (
                          <div 
                            key={r.roomId}
                            onClick={async () => {
                              if (isDeclined) {
                                triggerToast('❌ Your join request for this room was declined by the Admin.');
                                return;
                              }
                              if (isPending) {
                                triggerToast('⏳ Your join request for this room is pending review by the room Admin.');
                                return;
                              }
                              if (!nicknameInput.trim() || nicknameInput === 'You') {
                                triggerToast('Please enter your display name first.');
                                return;
                              }

                              // Clear recently approved item state once entered
                              if (isRecentlyApproved) {
                                setPendingUserRequests(prev => {
                                  const next = prev.filter(p => p.roomId !== r.roomId);
                                  localStorage.setItem('tallyin_pending_user_requests', JSON.stringify(next));
                                  return next;
                                });
                              }

                              setUserRoomId(r.roomId);
                              localStorage.setItem('userRoomId', r.roomId);
                              if (r.roomName) {
                                setRoomName(r.roomName);
                                localStorage.setItem('roomName', r.roomName);
                              }
                              setHasConfirmedRoom(true);
                              setCurrentView('home');
                              setIsMobileMenuOpen(false);
                              setIsInviteModalOpen(false);
                              setIsManageRoomOpen(false);
                              triggerToast(isRecentlyApproved ? `🎉 Entering approved room: ${r.roomName}!` : `Entering room: ${r.roomName}...`);
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
                            className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-all ${
                              isDeclined
                                ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50 cursor-default'
                                : isPending
                                ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-300 dark:border-purple-900/50 cursor-default'
                                : isRecentlyApproved
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-sm cursor-pointer animate-pulse font-bold'
                                : isActive 
                                ? 'border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/20 dark:bg-[#A3E635]/5 font-bold cursor-pointer' 
                                : 'border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6]/40 dark:hover:bg-slate-800/20 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base shrink-0">{isDeclined ? '❌' : isPending ? '⏳' : isRecentlyApproved ? '🎉' : '🏠'}</span>
                              <div className="min-w-0">
                                <p className="font-bold text-[#1A3827] dark:text-slate-100 truncate">{r.roomName}</p>
                                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-mono truncate">{r.roomId}</p>
                              </div>
                            </div>
                            {isDeclined ? (
                              <span className="text-[9px] bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-full font-black shrink-0">
                                ❌ Request Declined
                              </span>
                            ) : isPending ? (
                              <span className="text-[9px] bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2.5 py-1 rounded-full font-extrabold shrink-0">
                                ⏳ Pending Approval
                              </span>
                            ) : isRecentlyApproved ? (
                              <span className="text-[9px] bg-emerald-800 text-white dark:bg-[#A3E635] dark:text-slate-950 px-2.5 py-1 rounded-full font-black shrink-0 shadow-sm">
                                🎉 Approved! Explore New Room
                              </span>
                            ) : isActive ? (
                              <span className="text-[9px] bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 px-2 py-0.5 rounded-full font-bold shrink-0">Active</span>
                            ) : (
                              <span className="text-[9px] text-[#5C6E5C] dark:text-slate-400 shrink-0">Enter</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Room Member Limit (Capacity)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={roomMaxMembersInput}
                    onChange={(e) => setRoomMaxMembersInput(Math.max(2, Math.min(50, Number(e.target.value) || 2)))}
                    className="flex-1 px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                  />
                  <span className="text-xs font-extrabold text-[#5C6E5C] dark:text-slate-400 shrink-0">Members</span>
                </div>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">How many persons are involved? (e.g. 6). The room locks when limit is reached.</p>
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
                    setOnboardingStep('room-mode');
                  }}
                  className="flex-1 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs"
                >
                  Next: Select Mode
                </button>
              </div>
            </div>
          )}

          {/* Wizard step: room-mode */}
          {onboardingStep === 'room-mode' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1A3827] dark:text-slate-100 block">
                  Select Permanent Room Operating Mode *
                </label>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                  Choose how expenses and calculations will be processed for room <strong>{roomNameInput || 'Space'}</strong>. This choice is permanent for this room.
                </p>
              </div>

              {/* Mode Options Cards */}
              <div className="space-y-3 pt-1">
                {/* Split Mode Option (Recommended) */}
                <div 
                  onClick={() => setSelectedRoomMode('split')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedRoomMode === 'split'
                      ? 'border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/40 dark:bg-[#A3E635]/10 shadow-sm ring-1 ring-[#1A3827] dark:ring-[#A3E635]'
                      : 'border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6]/60 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚖️</span>
                      <div>
                        <p className="text-xs font-black text-[#1A3827] dark:text-slate-100">Classic Equal Split Mode</p>
                        <span className="text-[8px] bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          Recommended for Shared Flats & Trips
                        </span>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="roomModeSelect" 
                      checked={selectedRoomMode === 'split'}
                      onChange={() => setSelectedRoomMode('split')}
                      className="accent-[#1A3827] dark:accent-[#A3E635] w-4 h-4"
                    />
                  </div>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-300 leading-relaxed">
                    Standard Splitwise-style mode where all shared expenses are divided equally across active roommates with 1-tap net balance settlements.
                  </p>
                  {/* Feature Checklist */}
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-[#E3E8E3]/60 dark:border-slate-800/60 space-y-1 text-[9.5px] text-slate-700 dark:text-slate-300 font-medium">
                    <p className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> <strong>Equal Expense Splitter:</strong> Automatically divides shared bills equally among active roommates.</p>
                    <p className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> <strong>Net Settlement Engine:</strong> Calculates who owes whom for instant 1-click settlements.</p>
                    <p className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> <strong>Statements & History:</strong> Full itemized activity log with receipt image attachments.</p>
                  </div>
                </div>

                {/* Quota Mode Option */}
                <div 
                  onClick={() => setSelectedRoomMode('quota')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedRoomMode === 'quota'
                      ? 'border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/40 dark:bg-[#A3E635]/10 shadow-sm ring-1 ring-[#1A3827] dark:ring-[#A3E635]'
                      : 'border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6]/60 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <div>
                        <p className="text-xs font-black text-[#1A3827] dark:text-slate-100">Quota & Excess Pool Mode</p>
                        <span className="text-[8px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          Best for Hostels & Mess
                        </span>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="roomModeSelect" 
                      checked={selectedRoomMode === 'quota'}
                      onChange={() => setSelectedRoomMode('quota')}
                      className="accent-[#1A3827] dark:accent-[#A3E635] w-4 h-4"
                    />
                  </div>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-300 leading-relaxed">
                    Roommates spend towards preset individual monthly quotas. Real-time excess pool calculations, transaction projections, and settlements are viewable anytime.
                  </p>
                  {/* Feature Checklist */}
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-[#E3E8E3]/60 dark:border-slate-800/60 space-y-1 text-[9.5px] text-slate-700 dark:text-slate-300 font-medium">
                    <p className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> <strong>Real-Time Quota & Excess Tracker:</strong> Monitor spent vs. remaining quota and excess pool live anytime.</p>
                    <p className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> <strong>Anytime Settlements & Projections:</strong> View transaction projections and run 1-click settlements whenever needed.</p>
                    <p className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> <strong>Personal Quota Limits:</strong> Assign custom monthly spending caps per roommate (e.g. ₹2,000/mo).</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setOnboardingStep('room-name')}
                  className="flex-1 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 py-2.5 rounded-xl font-bold text-xs"
                >
                  Back
                </button>
                <button 
                  onClick={() => setOnboardingStep('room-budget')}
                  className="flex-1 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs"
                >
                  Next: Set Budget
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
                  type="text"
                  inputMode="numeric"
                  value={monthlyBudgetInput}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    setMonthlyBudgetInput(rawVal);
                    const num = Number(rawVal);
                    if (!isNaN(num) && num > 0) {
                      setMonthlyBudget(num);
                      localStorage.setItem('monthlyBudget', String(num));
                    }
                  }}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                />
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Set a shared spending limit for your room.</p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setOnboardingStep('room-mode')}
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
                    className="flex-1 px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
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

          <div className="pt-4 border-t border-[#E3E8E3] dark:border-slate-800 flex flex-col items-center gap-2 text-xs">
            <div className="w-full flex justify-between items-center">
              <span className="text-[#5C6E5C] dark:text-slate-400">Signed in as {user.email}</span>
              <button 
                onClick={handleSignOut}
                className="text-rose-700 font-bold hover:underline"
              >
                Sign out
              </button>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none pt-1">
              Version {APP_VERSION}
            </span>
          </div>
        </div>

        {/* QR Scanner Simulator Overlay */}
        {isQrScannerOpen && renderQrScanner()}
        {nicknamePromptAction && renderNicknamePromptModal()}
        {joinRequestModalInfo && renderJoinRequestModal()}

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



  // ==========================================
  // UTILITIES: SHOPPING LIST & CHORES HANDLERS
  // ==========================================
  const handleSaveShoppingItem = async (e) => {
    e.preventDefault();
    if (!shoppingTitle.trim()) {
      triggerToast('Please enter an item name.');
      return;
    }
    const amt = parseFloat(shoppingAmount) || 0;
    const currentUid = auth.currentUser?.uid || 'anonymous';
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          room_id: userRoomId,
          title: shoppingTitle.trim(),
          amount: amt,
          category: '__SHOPPING__',
          date: getLocalDateStr(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          paid_by: userNickname,
          paid_by_uid: currentUid,
          is_shared: true,
          split_type: 'pending',
          split: '',
          splits: [],
          created_by: currentUid
        });
      if (error) throw error;
      triggerToast('Shopping item added!');
      setIsAddShoppingOpen(false);
      setShoppingTitle('');
      setShoppingAmount('');
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to add shopping item.');
    }
  };

  const handleDeleteShoppingItem = async (item) => {
    const confirm = window.confirm(`Remove "${item.title}" from the shopping list?`);
    if (!confirm) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
      triggerToast('Shopping item removed.');
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to delete item.');
    }
  };

  const openSplitShopping = (item) => {
    setSelectedShoppingItem(item);
    setSplitShoppingAmount(item.amount > 0 ? String(item.amount) : '');
    const currentUid = auth.currentUser?.uid || 'anonymous';
    setSplitShoppingPayer(currentUid);
    
    const initialSplits = {};
    members.forEach(m => {
      initialSplits[m.uid] = true;
    });
    setSplitShoppingMembers(initialSplits);
    setIsSplitShoppingOpen(true);
  };

  const handleSaveSplitShopping = async (e) => {
    e.preventDefault();
    if (!selectedShoppingItem) return;
    const amt = parseFloat(splitShoppingAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please enter a valid amount.');
      return;
    }
    
    const activeMemberUids = Object.entries(splitShoppingMembers)
      .filter(([, active]) => active)
      .map(([uid]) => uid);
      
    if (activeMemberUids.length === 0) {
      triggerToast('Please select at least one roommate to split with.');
      return;
    }

    const currentUid = auth.currentUser?.uid || 'anonymous';
    const payerMember = members.find(m => m.uid === splitShoppingPayer) || { nickname: userNickname, uid: currentUid };
    
    const shareAmount = Number((amt / activeMemberUids.length).toFixed(2));
    const splitsArray = activeMemberUids.map(uid => {
      const memObj = members.find(m => m.uid === uid) || { nickname: 'Roommate' };
      return {
        uid,
        amount: shareAmount,
        nickname: memObj.nickname
      };
    });

    const detectedCategory = smartDetectCategory(selectedShoppingItem.title) || 'Groceries';

    try {
      const { error: deleteErr } = await supabase
        .from('transactions')
        .delete()
        .eq('id', selectedShoppingItem.id);
      if (deleteErr) throw deleteErr;

      const { error: insertErr } = await supabase
        .from('transactions')
        .insert({
          room_id: userRoomId,
          title: selectedShoppingItem.title,
          amount: amt,
          category: detectedCategory,
          date: getLocalDateStr(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          paid_by: payerMember.nickname,
          paid_by_uid: payerMember.uid,
          is_shared: true,
          split_type: 'equal',
          split: '',
          splits: splitsArray,
          created_by: currentUid
        });
      if (insertErr) throw insertErr;

      await logActivity('create', `${payerMember.nickname} bought & split "${selectedShoppingItem.title}" (₹${amt})`);
      triggerToast(`Successfully split ₹${amt} for ${selectedShoppingItem.title}!`);
      setIsSplitShoppingOpen(false);
      setSelectedShoppingItem(null);
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to record purchase.');
    }
  };

  const handlePayAndLogBill = async (bill) => {
    try {
      const currentUid = auth.currentUser?.uid || 'anonymous';
      const payerMember = members.find(m => m.uid === (bill.splitType || currentUid));
      const payerName = payerMember?.nickname || userNickname;
      const amountVal = Number(bill.amount) || 0;
      const billCat = (bill.imageUrl && bill.imageUrl !== 'null') ? bill.imageUrl : 'Utilities';

      // 1. Log actual expense into room ledger
      const { error: txErr } = await supabase
        .from('transactions')
        .insert({
          room_id: userRoomId,
          title: `${bill.title} (Bill Payment)`,
          amount: amountVal,
          category: billCat,
          date: getLocalDateStr(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          paid_by: payerName,
          paid_by_uid: bill.splitType || currentUid,
          is_shared: bill.isShared !== false,
          split_type: bill.isShared !== false ? 'equal' : (bill.splitType || currentUid),
          split: bill.isShared !== false ? '50/50' : 'personal',
          splits: [],
          created_by: currentUid
        });

      if (txErr) throw txErr;

      // 2. Advance due date if recurring
      const daysToAdd = Number(bill.time) || 30; // e.g. 30 for monthly, 7 for weekly
      if (daysToAdd > 0) {
        const currentDueDate = bill.date ? new Date(bill.date) : new Date();
        currentDueDate.setDate(currentDueDate.getDate() + daysToAdd);
        const nextDueDateStr = currentDueDate.toISOString().split('T')[0];

        await supabase
          .from('transactions')
          .update({
            date: nextDueDateStr,
            split: 'pending'
          })
          .eq('id', bill.id);

        triggerToast(`Paid ${formatINR(amountVal)} for "${bill.title}" & logged to Room Ledger! Next due: ${nextDueDateStr}`);
      } else {
        await supabase
          .from('transactions')
          .update({ split: 'paid' })
          .eq('id', bill.id);

        triggerToast(`Bill "${bill.title}" paid & ${formatINR(amountVal)} logged to Room Ledger!`);
      }

      await logActivity('bill_paid', `${userNickname} paid bill "${bill.title}" (${formatINR(amountVal)}) and logged it to room expenses.`);
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to log bill payment.');
    }
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!billTitle.trim()) {
      triggerToast('Please enter a bill title.');
      return;
    }

    if (!userRoomId) {
      triggerToast('No active room found. Please join or create a room first.');
      return;
    }

    const currentUid = user?.id || auth.currentUser?.uid || 'anonymous';
    const payerMember = members.find(m => m.uid === billAssignee);
    const payerName = payerMember?.nickname || userNickname || 'You';

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          room_id: userRoomId,
          title: billTitle.trim(),
          amount: Number(billAmount) || 0,
          category: '__BILL__',
          date: billDueDate || getLocalDateStr(),
          time: String(billInterval || '30'),
          paid_by: payerName,
          paid_by_uid: billAssignee || currentUid,
          is_shared: billIsShared !== false,
          split_type: billAssignee || currentUid,
          split: `${billCategory || 'Utilities'}|pending`,
          splits: [{ category: billCategory || 'Utilities', assignee: billAssignee || currentUid }],
          created_by: currentUid
        })
        .select('*');

      if (error) {
        console.error("Supabase insert bill error:", error);
        throw error;
      }

      if (data && data[0]) {
        const newBillMapped = mapDbTransaction(data[0]);
        setTransactions(prev => [newBillMapped, ...prev]);
      }

      triggerToast('Bill reminder added successfully!');
      setIsAddBillOpen(false);
      setBillTitle('');
      setBillAmount('');
      setBillCategory('Utilities');
      setBillInterval('30');
      setBillDueDate(getLocalDateStr());
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error("Failed to add bill:", err);
      triggerToast(`Failed to add bill: ${err.message || err.details || String(err)}`);
    }
  };

  const handleDeleteBill = async (bill) => {
    const confirm = window.confirm(`Remove bill reminder "${bill.title}"?`);
    if (!confirm) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', bill.id);
      if (error) throw error;
      triggerToast('Bill deleted.');
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to delete bill.');
    }
  };

  function renderOnboardingOverlay() {
    const tips = [
      { title: "Welcome to Tallyin!", desc: "Let's take a quick tour of your new shared room." },
      { title: "Dashboard", desc: "This is your home base. See who owes who and your current balance at a glance." },
      { title: "Add Expenses", desc: "Use the Quick Actions to add bills, scan receipts, or invite roommates." },
      { title: "Insights", desc: "Check out the Insights tab to see where your money is going." }
    ];
    const tip = tips[onboardingTipIndex];

    const handleNext = () => {
      if (onboardingTipIndex < tips.length - 1) {
        setOnboardingTipIndex(onboardingTipIndex + 1);
      } else {
        localStorage.setItem('tallyin_onboarding_done', 'true');
        setShowOnboarding(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-[#E3E8E3] dark:border-slate-800">
          <button onClick={() => { localStorage.setItem('tallyin_onboarding_done', 'true'); setShowOnboarding(false); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <div className="w-12 h-12 bg-[#EAF0EC] dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-[#1A3827] dark:text-[#A3E635]" />
            </div>
            <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100 mb-2">{tip.title}</h3>
            <p className="text-sm text-[#5C6E5C] dark:text-slate-400">{tip.desc}</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-1.5">
              {tips.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === onboardingTipIndex ? 'bg-[#1A3827] dark:bg-[#A3E635]' : 'bg-[#E3E8E3] dark:bg-slate-800'}`} />
              ))}
            </div>
            <button onClick={handleNext} className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-[#255038] dark:hover:bg-slate-200 transition-all shadow-sm">
              {onboardingTipIndex < tips.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderCommentModal() {
    const tx = transactions.find(t => t.id === commentTxId);
    const comments = expenseComments[commentTxId] || [];

    const handleAddComment = (e) => {
      e.preventDefault();
      if (!newCommentInput.trim()) return;
      
      const newComment = {
        id: Date.now().toString(),
        text: newCommentInput.trim(),
        author: userNickname || 'You',
        authorUid: auth.currentUser?.uid || 'anonymous',
        timestamp: new Date().toISOString()
      };
      
      const updatedComments = {
        ...expenseComments,
        [commentTxId]: [...comments, newComment]
      };
      setExpenseComments(updatedComments);
      localStorage.setItem('tallyin_expense_comments', JSON.stringify(updatedComments));
      setNewCommentInput('');
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in" onClick={() => setCommentTxId(null)}>
        <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col h-[70vh] sm:h-[600px] border border-[#E3E8E3] dark:border-slate-800 overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-5 border-b border-[#F6F8F6] dark:border-slate-800">
            <div>
              <h3 className="font-black text-[#1A3827] dark:text-slate-100 text-sm">Comments</h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 truncate">{tx?.title}</p>
            </div>
            <button onClick={() => setCommentTxId(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-[#5C6E5C] dark:text-slate-400 text-sm mt-10 italic">No comments yet.</div>
            ) : (
              comments.map(c => {
                const isMe = c.authorUid === auth.currentUser?.uid || (c.authorUid === 'anonymous' && c.author === userNickname);
                return (
                  <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-[#5C6E5C] dark:text-slate-500 font-semibold mb-1 mx-1">{isMe ? 'You' : c.author}</span>
                    <div className={`px-4 py-2 rounded-2xl text-xs max-w-[85%] ${isMe ? 'bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-tr-sm' : 'bg-[#F6F8F6] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 border border-[#E3E8E3] dark:border-slate-700 rounded-tl-sm'}`}>
                      {c.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleAddComment} className="p-4 border-t border-[#F6F8F6] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-950/50 flex gap-2">
            <input
              type="text"
              value={newCommentInput}
              onChange={(e) => setNewCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs focus:outline-none bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white"
            />
            <button type="submit" disabled={!newCommentInput.trim()} className="p-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // FEATURE 15: ONBOARDING TUTORIAL OVERLAY
  // ==========================================
  function renderOnboardingOverlay() {
    const tips = [
      { icon: '🏠', title: 'Welcome to Tallyin!', desc: 'Your all-in-one roommate expense tracker. Log shared bills, track who owes what, and settle up instantly.' },
      { icon: '➕', title: 'Add Expenses', desc: 'Tap the green "Quick add" button to log any shared bill. Smart AI will auto-detect the category for you.' },
      { icon: '📊', title: 'Insights & Analytics', desc: 'Visit the Insights tab to see your spending breakdown by category, per-member charts, and budget projections.' },
      { icon: '🏦', title: 'Settle Up', desc: 'When balances are due, use Settle Up. Scan a UPI QR code to pay instantly — no cash needed.' },
      { icon: '✅', title: 'Chore Rotation', desc: 'Set up household chores in the Chores tab. Completing them auto-rotates tasks to the next roommate.' },
    ];
    const tip = tips[onboardingTipIndex];
    const isLast = onboardingTipIndex === tips.length - 1;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[100] p-4 sm:items-center animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto">{tip.icon}</div>
            <h3 className="font-extrabold text-lg text-[#1A3827] dark:text-slate-100 tracking-tight">{tip.title}</h3>
            <p className="text-sm text-[#5C6E5C] dark:text-slate-400 leading-relaxed">{tip.desc}</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {tips.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === onboardingTipIndex ? 'bg-[#1A3827] dark:bg-[#A3E635] w-5' : 'bg-[#E3E8E3] dark:bg-slate-700 w-2'}`} />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { localStorage.setItem('tallyin_onboarding_done', '1'); setShowOnboarding(false); }}
              className="flex-1 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
            >Skip</button>
            <button
              onClick={() => {
                if (isLast) { localStorage.setItem('tallyin_onboarding_done', '1'); setShowOnboarding(false); }
                else { setOnboardingTipIndex(prev => prev + 1); }
              }}
              className="flex-1 py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm"
            >{isLast ? 'Get Started 🚀' : 'Next →'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FEATURE 3: EXPENSE COMMENTS MODAL
  // ==========================================
  function renderCommentModal() {
    const tx = transactions.find(t => t.id === commentTxId) || myPersonalExpenses.find(t => t.id === commentTxId);
    if (!tx) return null;
    const comments = txComments[commentTxId] || [];
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E8E3] dark:border-slate-800 shrink-0">
            <div>
              <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Comments</h3>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5 truncate max-w-[200px]">{tx.title} · {formatINR(tx.amount)}</p>
            </div>
            <button onClick={() => { setCommentTxId(null); setCommentInput(''); }} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {comments.length === 0 ? (
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 italic text-center py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="bg-[#F6F8F6] dark:bg-slate-950 rounded-xl p-3 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#1A3827] dark:text-[#A3E635]">{c.author}</span>
                    <button onClick={() => {
                      const updated = { ...txComments, [commentTxId]: comments.filter((_, j) => j !== i) };
                      setTxComments(updated);
                      localStorage.setItem('tallyin_comments', JSON.stringify(updated));
                    }} className="text-rose-400 hover:text-rose-600 p-0.5" title="Delete"><X className="w-3 h-3" /></button>
                  </div>
                  <p className="text-xs text-[#1A3827] dark:text-slate-200">{c.text}</p>
                  <p className="text-[9px] text-[#5C6E5C] dark:text-slate-500">{new Date(c.at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 shrink-0 pt-2 border-t border-[#F6F8F6] dark:border-slate-800">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && commentInput.trim()) {
                  const updated = { ...txComments, [commentTxId]: [...(txComments[commentTxId] || []), { author: userNickname, text: commentInput.trim(), at: new Date().toISOString() }] };
                  setTxComments(updated);
                  localStorage.setItem('tallyin_comments', JSON.stringify(updated));
                  setCommentInput('');
                }
              }}
              className="flex-1 px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
            />
            <button
              onClick={() => {
                if (!commentInput.trim()) return;
                const updated = { ...txComments, [commentTxId]: [...(txComments[commentTxId] || []), { author: userNickname, text: commentInput.trim(), at: new Date().toISOString() }] };
                setTxComments(updated);
                localStorage.setItem('tallyin_comments', JSON.stringify(updated));
                setCommentInput('');
              }}
              className="px-3 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90"
            >Post</button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DIVVY AI — Gemini-powered spending assistant
  // ==========================================

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const AI_SUGGESTIONS = [
    "Am I on track with my budget?",
    "Who owes who and how much?",
    "Where am I spending the most?",
    "What's my biggest expense this month?",
  ];

  const sendAiMessage = async (text) => {
    const msgText = (text || aiInput).trim();
    if (!msgText || aiLoading) return;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: msgText }]);
    setAiLoading(true);

    const stats = computedStats;
    const myBal = stats.currentUserBalance || 0;
    const spent = stats.totalSpend || 0;
    const shared = stats.sharedSpend || 0;
    const personal = stats.personalSpend || 0;
    const now = new Date();
    const daysPassed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAvg = daysPassed > 0 ? (spent / daysPassed) : 0;
    const projectedSpend = dailyAvg * daysInMonth;
    const budgetLeft = monthlyBudget - spent;

    const memberSummary = members.map(m => {
      const bal = stats.balances?.[m.uid] || 0;
      return `${m.nickname}: balance ₹${bal.toFixed(2)} (${bal > 0 ? 'is owed' : bal < 0 ? 'owes' : 'settled'})`;
    }).join(', ');

    const systemPrompt = `You are Divvy, a smart and friendly personal finance assistant embedded inside Tallyin — a roommate expense splitting app. You have access to the user's real spending data. Answer questions concisely and helpfully. Use ₹ for currency. Be encouraging but honest.

Current financial snapshot for ${userNickname}:
- Total room spend (all time): ₹${spent.toFixed(2)}
- Shared bills (your share): ₹${shared.toFixed(2)}
- Personal expenses: ₹${personal.toFixed(2)}
- Your current balance: ₹${Math.abs(myBal).toFixed(2)} (${myBal > 0 ? 'others owe you' : myBal < 0 ? 'you owe' : 'all settled'})
- Monthly budget: ₹${monthlyBudget}
- Personal cap: ₹${personalCap}
- Budget remaining this month: ₹${budgetLeft.toFixed(2)} (${budgetLeft < 0 ? 'OVER BUDGET' : 'within budget'})
- Daily average spend: ₹${dailyAvg.toFixed(2)}/day
- Projected month-end spend: ₹${projectedSpend.toFixed(2)}
- Day ${daysPassed} of ${daysInMonth} in the month
- Members: ${memberSummary}
- Total transactions: ${stats.totalCount}

Keep responses under 4 sentences unless asked for detail. Use bullet points for lists.`;

    try {
      const history = aiMessages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: msgText }] }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const apiErrorMsg = errorData?.error?.message || `HTTP Error ${res.status}`;
        throw new Error(apiErrorMsg);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't parse a response. Please try again.";
      setAiMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error("Divvy AI Error:", err);
      let friendlyError = err.message || "";
      const lowerErr = friendlyError.toLowerCase();
      
      if (lowerErr.includes('quota') || lowerErr.includes('exhausted') || lowerErr.includes('limit') || lowerErr.includes('429') || lowerErr.includes('rate')) {
        friendlyError = "Divvy free query quota has been reached! ☕ Please try again later.";
      } else if (lowerErr.includes('api key') || lowerErr.includes('invalid') || lowerErr.includes('key')) {
        friendlyError = "API key configuration issue. Please verify the VITE_GEMINI_API_KEY settings.";
      } else {
        friendlyError = "I'm having trouble connecting right now. Please try again in a moment.";
      }
      
      setAiMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${friendlyError}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  function renderAiChat() {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
          onClick={() => setShowAiChat(false)}
        />

        {/* Chat Panel */}
        <div className="relative pointer-events-auto w-full max-w-sm mr-4 mb-24 sm:mb-6 flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 dark:border-white/10 bg-white/95 dark:bg-[#070A0D]/95 backdrop-blur-3xl animate-slide-up" style={{ maxHeight: 'min(600px, 80vh)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4.5 py-4 bg-gradient-to-r from-[#0F291E] via-[#0A1A13] to-[#06120D] text-white shrink-0 border-b border-emerald-500/20">
            <div className="w-9 h-9 rounded-2xl bg-[#A3E635] flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-lime-500/20">AI</div>
            <div className="flex-1">
              <p className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Divvy</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] shadow-[0_0_6px_#A3E635]"></span>
              </p>
              <p className="text-[10px] text-emerald-300 font-bold">Powered by Gemini • Realtime finances</p>
            </div>
            <button
              onClick={() => setShowAiChat(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#A3E635] flex items-center justify-center text-[#1A3827] font-black text-[9px] shrink-0 mt-0.5">AI</div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#1A3827] text-white rounded-tr-sm'
                    : 'bg-[#F6F8F6] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-[#A3E635] flex items-center justify-center text-[#1A3827] font-black text-[9px] shrink-0 mt-0.5">AI</div>
                <div className="bg-[#F6F8F6] dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-[#5C6E5C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#5C6E5C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#5C6E5C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions (show only on first open) */}
          {aiMessages.length <= 1 && (
            <div className="px-3 pb-2 flex gap-2 flex-wrap shrink-0">
              {AI_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendAiMessage(s)}
                  className="text-[10px] font-semibold px-2.5 py-1.5 bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 rounded-full border border-[#E3E8E3] dark:border-slate-700 hover:bg-[#1A3827] hover:text-white dark:hover:bg-[#A3E635] dark:hover:text-slate-950 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-[#E3E8E3] dark:border-slate-800 shrink-0">
            <div className="flex gap-2 items-center bg-[#F6F8F6] dark:bg-slate-800 rounded-2xl px-3 py-2 border border-[#E3E8E3] dark:border-slate-700">
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                placeholder="Ask about your spending…"
                className="flex-1 bg-transparent text-sm text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => sendAiMessage()}
                disabled={!aiInput.trim() || aiLoading}
                className="w-7 h-7 rounded-full bg-[#1A3827] text-[#A3E635] disabled:opacity-40 flex items-center justify-center hover:bg-[#255038] transition-colors shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN RUNNING APP

  return (
    <div className={`h-screen flex overflow-hidden bg-[#F0F4F1] dark:bg-[#060809] transition-colors duration-300 ${isDarkMode ? 'dark text-slate-100' : 'text-[#1A3827]'}`}>
      
      {/* Hidden File Input for Receipt Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleReceiptUpload} 
        accept="image/*,application/pdf,.pdf,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
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
      <aside className={`w-64 border-r border-[#DCE4DC]/80 dark:border-[#1C2428] bg-white/90 dark:bg-[#0C1012]/90 backdrop-blur-2xl flex flex-col justify-between fixed top-0 bottom-0 left-0 h-full z-40 transition-transform duration-300 overflow-y-auto ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img 
                src={faviconLogo} 
                alt="Tallyin Logo" 
                className="w-9 h-9 object-cover rounded-xl shadow-sm flex-shrink-0"
              />
              <div>
                <h1 className="font-black text-[#1A3827] dark:text-white tracking-tight leading-tight">Tallyin</h1>
                <p className="text-[9px] text-[#5C6E5C] dark:text-slate-400 font-bold uppercase tracking-wider">Smart Roommate Sync</p>
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
                    setCurrentView('home');
                    setIsMobileMenuOpen(false);
                    setIsInviteModalOpen(false);
                    setIsManageRoomOpen(false);
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
              onClick={() => navigateTo('home')}
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
              onClick={() => navigateTo('ledger')}
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
              onClick={() => navigateTo('personal-expenses')}
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
              onClick={() => navigateTo('fund-tracker')}
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
              onClick={() => navigateTo('insights')}
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
              onClick={() => navigateTo('receipts')}
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
              onClick={() => navigateTo('shopping-board')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'shopping-board' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4" />
                <span>Shopping List</span>
              </div>
              {pendingShoppingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full">
                  {pendingShoppingCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => navigateTo('bills')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'bills' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Bills & Subscriptions</span>
              </div>
              {pendingBillsCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500 text-slate-950 rounded-full">
                  {pendingBillsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => navigateTo('settings')}
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
      <div className="flex-1 flex flex-col pl-0 md:pl-64 h-screen min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#E2EAE3] dark:border-[#1A222C] bg-white/85 dark:bg-[#07090C]/85 backdrop-blur-2xl flex items-center justify-between px-4 sm:px-8 fixed top-0 right-0 left-0 md:left-64 z-20 transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl mr-1.5 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img 
                src={faviconLogo} 
                alt="Tallyin Logo" 
                className="w-8 h-8 object-cover rounded-xl hidden sm:block flex-shrink-0 shadow-sm border border-emerald-500/20"
              />
              <div className="flex flex-col justify-center text-left">
                <h2 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-slate-100 leading-tight tracking-tight">
                  {roomName}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {/* Live Sync Status Indicator */}
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black tracking-wider uppercase transition-all ${
                    isDbSynced 
                      ? 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/20 dark:border-emerald-400/20 text-emerald-700 dark:text-[#A3E635]' 
                      : 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/20 dark:border-amber-400/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isDbSynced 
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' 
                        : 'bg-amber-500 animate-pulse'
                    }`}></span>
                    <span>{isDbSynced ? 'LIVE SYNC' : 'OFFLINE CACHE'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Right) */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Broadcast Re-open / Toggle Button */}
            {globalBroadcast?.active && (
              <button
                onClick={() => {
                  const bKey = globalBroadcast.createdAt || globalBroadcast.text;
                  const isCurrentlyClosed = dismissedBroadcastKey === bKey;
                  if (isCurrentlyClosed) {
                    setDismissedBroadcastKey(null);
                    localStorage.removeItem('tallyin_dismissed_broadcast');
                    if (triggerToast) triggerToast('Broadcast Banner restored');
                  } else {
                    setDismissedBroadcastKey(bKey);
                    localStorage.setItem('tallyin_dismissed_broadcast', bKey);
                    if (triggerToast) triggerToast('Broadcast Banner hidden');
                  }
                }}
                className={`p-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-bold ${
                  dismissedBroadcastKey === (globalBroadcast.createdAt || globalBroadcast.text)
                    ? 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-800'
                    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 shadow-sm'
                }`}
                title={dismissedBroadcastKey === (globalBroadcast.createdAt || globalBroadcast.text) ? 'Re-open System Broadcast Banner' : 'Hide System Broadcast Banner'}
              >
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Broadcast</span>
              </button>
            )}

            {/* Pinned Announcement Re-open / Toggle Button */}
            {userRoomId && (pinnedMessages?.[userRoomId] || pinnedMessages?.['ALL']) && (
              <button
                onClick={() => {
                  const pMsg = pinnedMessages[userRoomId] || pinnedMessages['ALL'];
                  const pKey = pMsg.updatedAt || pMsg.text;
                  const isCurrentlyClosed = dismissedPinnedKey === pKey;
                  if (isCurrentlyClosed) {
                    setDismissedPinnedKey(null);
                    localStorage.removeItem('tallyin_dismissed_pinned');
                    if (triggerToast) triggerToast('Pinned Announcement restored');
                  } else {
                    setDismissedPinnedKey(pKey);
                    localStorage.setItem('tallyin_dismissed_pinned', pKey);
                    if (triggerToast) triggerToast('Pinned Announcement hidden');
                  }
                }}
                className={`p-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-bold ${
                  dismissedPinnedKey === ((pinnedMessages[userRoomId] || pinnedMessages['ALL']).updatedAt || (pinnedMessages[userRoomId] || pinnedMessages['ALL']).text)
                    ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-800'
                    : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-500/30 shadow-sm'
                }`}
                title={dismissedPinnedKey === ((pinnedMessages[userRoomId] || pinnedMessages['ALL']).updatedAt || (pinnedMessages[userRoomId] || pinnedMessages['ALL']).text) ? 'Re-open Pinned Announcement' : 'Hide Pinned Announcement'}
              >
                <Pin className="w-4 h-4 text-amber-500 rotate-45" />
                <span className="hidden sm:inline">Pinned</span>
              </button>
            )}

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

            {/* Direct Admin Portal Button for tallyin.alerts@gmail.com */}
            {(() => {
              const currentEmailClean = (user?.email || auth.currentUser?.email || '').trim().toLowerCase();
              const isUserAdmin = currentEmailClean === 'tallyin.alerts@gmail.com';
              return isUserAdmin ? (
                <button 
                  onClick={() => setCurrentView('admin')}
                  className="px-3 py-2 bg-rose-600/10 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-600 hover:text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  title="Open Admin Operations Console"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </button>
              ) : null;
            })()}

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
              <div className="absolute right-0 top-12 mt-2 w-52 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-30 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                <div className="px-4 py-2 border-b border-[#F6F8F6] dark:border-slate-800 text-left">
                  <p className="text-[9px] text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest font-bold">Access Code</p>
                  <div className="flex items-center justify-between mt-1 gap-2 bg-[#F6F8F6] dark:bg-slate-950 px-2 py-1 rounded-lg">
                    <span className="font-mono text-[11px] text-[#1A3827] dark:text-[#A3E635] tracking-wide select-all">
                      {auth.currentUser?.loginCode || 'Generating...'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(auth.currentUser?.loginCode || '');
                        triggerToast('Access code copied!');
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 shrink-0"
                      title="Copy Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => { setCurrentView('settings'); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                {(() => {
                  const currentEmailClean = (user?.email || auth.currentUser?.email || '').trim().toLowerCase();
                  const isUserAdmin = currentEmailClean === 'tallyin.alerts@gmail.com';
                  return isUserAdmin ? (
                    <button 
                      onClick={() => { setCurrentView('admin'); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 flex items-center gap-2 font-black"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Console</span>
                    </button>
                  ) : null;
                })()}
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

        <main className="flex-grow pt-16 sm:pt-20 px-3 sm:px-8 pb-24 overflow-y-auto">
          {/* Live Broadcast Banner Overlay (Completely Closeable) */}
          {(() => {
            const activeBroadcastKey = globalBroadcast?.active
              ? (globalBroadcast.id || globalBroadcast.createdAt || globalBroadcast.text)
              : null;

            const isExpired = globalBroadcast?.expiresAt 
              ? new Date().getTime() > new Date(globalBroadcast.expiresAt).getTime()
              : globalBroadcast?.createdAt
                ? (new Date().getTime() - new Date(globalBroadcast.createdAt).getTime() > (globalBroadcast.validDays || 2) * 24 * 60 * 60 * 1000)
                : false;

            const isBroadcastVisible = globalBroadcast?.active && !isExpired && dismissedBroadcastKey !== activeBroadcastKey;

            if (!isBroadcastVisible) return null;

            return (
              <div className={`w-full mb-4 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl shadow-lg border transition-all duration-300 relative overflow-hidden animate-fade-in ${
                globalBroadcast.type === 'alert'
                  ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/30 dark:border-rose-500/40 text-slate-900 dark:text-slate-100 shadow-rose-500/5'
                  : globalBroadcast.type === 'maintenance'
                  ? 'bg-white/95 dark:bg-slate-900/95 border-amber-500/30 dark:border-amber-500/40 text-slate-900 dark:text-slate-100 shadow-amber-500/5'
                  : 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/30 dark:border-emerald-500/40 text-slate-900 dark:text-slate-100 shadow-emerald-500/5'
              }`}>
                {/* Left Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  globalBroadcast.type === 'alert'
                    ? 'bg-rose-500'
                    : globalBroadcast.type === 'maintenance'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`} />

                <div className="flex items-start justify-between gap-3 pl-1.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                      globalBroadcast.type === 'alert'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : globalBroadcast.type === 'maintenance'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {globalBroadcast.type === 'alert' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : globalBroadcast.type === 'maintenance' ? (
                        <Activity className="w-4 h-4" />
                      ) : (
                        <Radio className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5 text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                          globalBroadcast.type === 'alert'
                            ? 'text-rose-600 dark:text-rose-400'
                            : globalBroadcast.type === 'maintenance'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              globalBroadcast.type === 'alert' ? 'bg-rose-400' : globalBroadcast.type === 'maintenance' ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}></span>
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                              globalBroadcast.type === 'alert' ? 'bg-rose-500' : globalBroadcast.type === 'maintenance' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>
                          </span>
                          <span>{globalBroadcast.type === 'alert' ? 'Critical Alert' : globalBroadcast.type === 'maintenance' ? 'System Maintenance' : globalBroadcast.type === 'feature' ? 'New Feature Release' : 'System Broadcast'}</span>
                        </span>

                        <span className="text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          ⏳ Active 2 Calendar Days
                        </span>

                        {globalBroadcast.createdAt && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            • {new Date(globalBroadcast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100 break-words">
                        {globalBroadcast.text}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (activeBroadcastKey) {
                        setDismissedBroadcastKey(activeBroadcastKey);
                        localStorage.setItem('tallyin_dismissed_broadcast', activeBroadcastKey);
                        if (triggerToast) triggerToast('Broadcast banner closed. Click Broadcast icon in header to re-open anytime.');
                      }
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0"
                    title="Close Broadcast Banner (Can re-open from header icon)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Pinned Room Announcement Banner (Completely Closeable) */}
          {(() => {
            const currentPinnedMsg = userRoomId ? (pinnedMessages?.[userRoomId] || pinnedMessages?.['ALL']) : null;
            const activePinnedKey = currentPinnedMsg ? (currentPinnedMsg.updatedAt || currentPinnedMsg.text) : null;
            const isPinnedVisible = currentPinnedMsg && dismissedPinnedKey !== activePinnedKey;

            if (!isPinnedVisible || !currentPinnedMsg) return null;

            return (
              <div className="w-full mb-4 rounded-2xl p-3.5 sm:p-4 bg-white/95 dark:bg-slate-900/95 border border-amber-500/30 dark:border-amber-500/40 backdrop-blur-xl shadow-lg shadow-amber-500/5 transition-all duration-300 relative overflow-hidden animate-fade-in">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <div className="flex items-start justify-between gap-3 pl-1.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                      <Pin className="w-4 h-4 rotate-45" />
                    </div>
                    <div className="space-y-0.5 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Pinned Announcement
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                          • By {currentPinnedMsg.author || 'Admin'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100 break-words">
                        {currentPinnedMsg.text}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (activePinnedKey) {
                        setDismissedPinnedKey(activePinnedKey);
                        localStorage.setItem('tallyin_dismissed_pinned', activePinnedKey);
                        if (triggerToast) triggerToast('Pinned announcement closed. Click Pin icon in header to re-open anytime.');
                      }
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0"
                    title="Close Pinned Announcement (Can re-open from header icon)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          <ErrorBoundary>
            {currentView === 'home' && <ViewRenderer render={renderHome} />}
            {currentView === 'ledger' && <ViewRenderer render={renderLedger} />}
            {currentView === 'personal-expenses' && <ViewRenderer render={renderPersonalExpenses} />}
            {currentView === 'fund-tracker' && <ViewRenderer render={renderFundTracker} />}
            {currentView === 'insights' && <ViewRenderer render={renderInsights} />}
            {currentView === 'settlement-records' && <ViewRenderer render={renderSettlementRecords} />}
            {currentView === 'receipts' && <ViewRenderer render={renderReceipts} />}
            {currentView === 'shopping-board' && <ViewRenderer render={renderShoppingBoard} />}
            {currentView === 'bills' && <ViewRenderer render={renderBills} />}
            {currentView === 'settings' && <ViewRenderer render={renderSettings} />}
            {currentView === 'admin' && (
              <AdminDashboard
                user={user}
                userNickname={userNickname}
                userRooms={userRooms}
                triggerToast={triggerToast}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                appVersion={APP_VERSION}
                onExitAdmin={() => setCurrentView('home')}
                isSystemMaintenanceActive={isSystemMaintenanceActive}
                setIsSystemMaintenanceActive={setIsSystemMaintenanceActive}
                maintenanceMessage={maintenanceMessage}
                setMaintenanceMessage={setMaintenanceMessage}
                globalBroadcast={globalBroadcast}
                setGlobalBroadcast={setGlobalBroadcast}
                pinnedMessages={pinnedMessages}
                setPinnedMessages={setPinnedMessages}
                simulatedLatency={simulatedLatency}
                setSimulatedLatency={setSimulatedLatency}
              />
            )}
          </ErrorBoundary>
        </main>


        {/* Add Expense Modal Overlay */}
        {isAddExpenseOpen && renderAddExpenseModal()}
        {isAddShoppingOpen && renderAddShoppingModal()}
        {isSplitShoppingOpen && renderSplitShoppingModal()}
        {isAddBillOpen && renderAddBillModal()}
        
        {/* Quick Itemized Bill & Receipt Modal */}
        <QuickBillModal
          isOpen={isQuickBillOpen}
          onClose={() => setIsQuickBillOpen(false)}
          userNickname={userNickname}
          roomName={roomName || 'Room'}
          triggerToast={triggerToast}
          exportItemizedBillToPDF={exportItemizedBillToPDF}
          handleAddExpense={handleAddExpenseFromQuickBill}
        />
        
        {/* Custom Invite Roommate Share Modal */}
        {isInviteModalOpen && renderInviteModal()}

        {/* Settle Up Modal */}
        {isSettleModalOpen && renderSettleModal()}
        {isSettlementDetailOpen && renderSettlementDetailModal()}

        {/* Manage Room Modal */}
        {isManageRoomOpen && renderManageRoomModal()}
        {joinRequestModalInfo && renderJoinRequestModal()}
        {editingMemberBudget && renderMemberBudgetModal()}
        {nicknamePromptAction && renderNicknamePromptModal()}

        {/* Tallyin Diamond VIP Analytics Modal */}
        {isDiamondModalOpen && renderDiamondModal()}

        {/* Receipt Zoom Lightbox Modal */}
        {activeReceiptZoom && renderReceiptZoomModal()}

        {/* Edit History Lightbox Modal */}
        {activeEditHistoryTx && renderEditHistoryModal()}

        {/* Fund Tracker Modals */}
        {isAddFundModalOpen && renderAddFundModal()}
        {isAddFundExpenseModalOpen && renderAddFundExpenseModal()}

        {/* Feature D: Comment Modal */}
        {commentTxId && renderCommentModal()}


        
        {/* Feature B: Onboarding Modal */}
        {showOnboarding && hasConfirmedRoom && renderOnboardingOverlay()}

        {/* Divvy Chat Overlay */}
        {showAiChat && renderAiChat()}
      </div>

      {/* Floating Divvy Button */}
      {hasConfirmedRoom && (
        <div className="fixed bottom-24 right-6 z-30 animate-fade-in" style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}>
          <button 
            onClick={() => setShowAiChat(true)}
            className="flex items-center justify-center w-13 h-13 bg-[#0F291E] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full shadow-2xl shadow-emerald-950/30 hover:scale-110 active:scale-95 transition-all duration-200 border border-[#A3E635]/40 cursor-pointer"
            id="fab-ai-assistant"
            title="Ask Divvy"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-30" style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}>
        <button 
          onClick={() => openAddExpenseModal()}
          className="flex items-center gap-2.5 bg-[#A3E635] text-[#0F291E] font-black px-5 py-3.5 rounded-full shadow-xl shadow-lime-950/20 hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 border border-[#84CC16] cursor-pointer"
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
    const { monthlyPersonalTotal, personalPercentage, monthSharedSpend, isLowBalance } = homeStats;
    const activeLimit = monthlyBudget;
    const activeMonth = selectedMonth === 'All' ? getLocalMonthStr() : selectedMonth;
    const [yearStr, monthStr] = activeMonth.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
    const monthlyRoomSpend = transactions
      .filter(t => t.isShared && t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__' && t.category !== '__SHOPPING__' && t.category !== '__BILL__' && t.category !== '__CHORE__' && t.category !== 'Payment' && t.date && t.date.startsWith(activeMonth))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const budgetPct = Math.min(100, Math.round((monthlyRoomSpend / monthlyBudget) * 100)) || 0;
    const remaining = Math.max(0, monthlyBudget - monthlyRoomSpend);
    const today = new Date();
    const currentMonthStr = getLocalMonthStr(today);
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysLeft = activeMonth === currentMonthStr ? daysInMonth - today.getDate() : (activeMonth < currentMonthStr ? 0 : daysInMonth);
    const dailyLimit = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;
    const isOver = budgetPct >= 100;
    const isHost = roomCreatedBy && user && roomCreatedBy === user.id;

    return (
      <div className="max-w-7xl mx-auto animate-fade-in pb-24 lg:pb-8">

        {/* Whitelisted Account Maintenance Mode Testing Banner */}
        {isSystemMaintenanceActive && isUserWhitelistedForMaintenance && (
          <div className="mb-4 bg-amber-500 text-slate-950 px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg border border-amber-400 text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className="w-5 h-5 text-slate-950 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <span className="font-black tracking-tight text-xs block truncate">
                  🚨 SITE MAINTENANCE IS ACTIVE — Browsing via Whitelisted Admin Access ({currentEmailClean || 'Tester'})
                </span>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('admin')}
              className="px-3.5 py-1.5 bg-slate-950 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition-all shrink-0 shadow-md active:scale-95 ml-2 cursor-pointer"
            >
              Open Admin
            </button>
          </div>
        )}

        {/* ─── Top Alerts ─── */}
        <div className="space-y-3 mb-4">
          {/* Host Pending Join Requests Banner */}
          {isHost && pendingJoinRequests.length > 0 && (
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-purple-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black tracking-tight text-white">Pending Join Requests</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-400 text-purple-950 uppercase">
                        {pendingJoinRequests.length} Pending
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-200 mt-0.5">
                      Users requesting approval to enter <strong>{roomName || userRoomId}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManageRoomOpen(true)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl border border-white/20 transition-all shrink-0"
                >
                  Manage Room
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {pendingJoinRequests.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-white/10 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/10">
                    <div>
                      <p className="text-xs font-black text-white">{req.nickname}</p>
                      <p className="text-[10px] text-purple-200 truncate">{req.email || 'No email provided'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveJoinRequest(req)}
                        className="px-3.5 py-2 bg-[#A3E635] text-slate-950 rounded-xl text-xs font-black hover:opacity-90 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve (+1 Capacity)</span>
                      </button>
                      <button
                        onClick={() => handleDeclineJoinRequest(req)}
                        className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLowBalance && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3.5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Budget Warning</h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-0.5">Approaching shared budget. {formatINR(Math.max(0, activeLimit - monthSharedSpend))} remaining.</p>
              </div>
            </div>
          )}
          {pendingRecurringTxs.length > 0 && (
            <div className="bg-[#EAF0EC] dark:bg-slate-900 border border-[#1A3827]/10 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
                <h3 className="font-bold text-sm text-[#1A3827] dark:text-slate-100">Due Recurring Expenses</h3>
              </div>
              <div className="space-y-2">
                {pendingRecurringTxs.map(({ tx, interval, nextDue }) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{tx.title}</p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Due {nextDue} · {interval}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#1A3827] dark:text-white">{formatINR(tx.amount)}</span>
                      <button disabled={postingRecurringIds.includes(tx.id)} onClick={() => handlePostRecurringExpense(tx, nextDue)} className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-[10px] rounded-lg transition-all disabled:opacity-50 cursor-pointer">
                        {postingRecurringIds.includes(tx.id) ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Futuristic Quota Mode Header Banner ─── */}
        <div className="mb-5 bg-gradient-to-r from-[#0F291E] via-[#163E2D] to-[#0A1F16] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                  isQuotaMode ? 'bg-[#A3E635] text-slate-950' : 'bg-slate-700 text-slate-300'
                }`}>
                  <span>{isQuotaMode ? '⚡ QUOTA & EXCESS POOL MODE' : 'CLASSIC EQUAL SPLIT MODE'}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isQuotaMode ? 'Personal Quotas & Excess Pool' : 'Standard Expense Splitter'}
              </h2>
              <p className="text-xs text-slate-300/80 max-w-xl leading-relaxed">
                {isQuotaMode 
                  ? 'Members spend towards their preset quotas. Extra spending beyond quota forms an Excess Pool, split equally at month-end.'
                  : 'Classic Splitwise mode where shared expenses are divided on each transaction.'}
              </p>
            </div>

            {/* Permanent Room Mode Indicator Badge */}
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
              <div className="text-right">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Permanent Mode</p>
                <p className="text-[11px] font-black text-white flex items-center justify-end gap-1">
                  <span>{isQuotaMode ? '⚡ Quota Mode' : '⚖️ Split Mode'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Greeting + CTA Button ─── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight">{getGreeting()}, {userNickname.split(' ')[0]} 👋</h1>
            <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Here's your room overview</p>
          </div>
          <button onClick={() => openAddExpenseModal()} className="bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-[#1A3827] dark:hover:bg-[#BEF264] active:scale-95 transition-all duration-150 shadow-md cursor-pointer flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RESPONSIVE GRID
            Mobile / Tablet  → single column stack
            Desktop (lg+)   → 12-col: 8 left main + 4 right sidebar
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* ── LEFT MAIN COLUMN (lg: 8 cols) ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* ── Hero Balance Card ── */}
            <div className="bg-[#061811] text-white rounded-3xl p-5 sm:p-6 lg:p-7 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-teal-500/8 blur-3xl rounded-full -mb-16 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:gap-8">
                {/* Balance */}
                <div className="flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#A3E635]">NET BALANCE</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {myBalance > 0 ? 'You are owed' : myBalance < 0 ? 'You owe' : 'All settled up ✓'}
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-black text-[#A3E635] tracking-tight mt-1 leading-none">
                    {formatINR(Math.abs(myBalance))}
                  </h2>
                  <p className="text-xs text-slate-300/70 mt-2 leading-relaxed max-w-xs">
                    {myBalance > 0 ? 'You have paid more than your share.' : myBalance < 0 ? 'You owe money to your roommates.' : 'You are completely settled with everyone!'}
                  </p>
                  <button onClick={handleSettleUp} className="inline-flex items-center gap-2 mt-4 bg-[#A3E635] text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs hover:bg-[#BEF264] active:scale-95 transition-all cursor-pointer shadow-lg">
                    <HandCoins className="w-4 h-4" /><span>Settle Up</span><ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Roommate balances — side panel on sm+, stacked below on mobile */}
                {members.length > 1 && (
                  <div className="border-t border-white/10 sm:border-t-0 sm:border-l sm:border-white/10 pt-4 sm:pt-0 sm:pl-8 mt-4 sm:mt-0 space-y-1.5 flex flex-col justify-center sm:w-52 lg:w-60 shrink-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">Roommate Balances</p>
                    {members.map(m => {
                      if (m.uid === currentUid) return null;
                      const bal = computedStats.balances[m.uid] || 0;
                      return (
                        <div key={m.uid} className="flex justify-between items-center text-xs py-1.5 px-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-white/80 font-semibold truncate max-w-[110px]">{m.nickname}</span>
                          <span className={`shrink-0 text-[11px] font-black ${bal > 0 ? 'text-[#A3E635]' : bal < 0 ? 'text-rose-400' : 'text-white/30'}`}>
                            {bal > 0 ? `is owed ${formatINR(bal)}` : bal < 0 ? `owes ${formatINR(Math.abs(bal))}` : 'settled'}
                          </span>
                        </div>
                      );
                    })}
                    {suggestedTransfers.length > 0 && (
                      <div className="pt-2 border-t border-white/10 mt-1 space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#A3E635]">Suggested Transfers</p>
                        {suggestedTransfers.slice(0, 2).map((t, idx) => (
                          <div key={idx} className="text-[11px] text-white/80 flex flex-wrap items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                            <span className="text-rose-400 font-bold">{t.fromUid === currentUid ? 'You' : t.fromName}</span>
                            <span className="text-white/40 text-[10px]">owes</span>
                            <span className="text-[#A3E635] font-black">{formatINR(t.amount)}</span>
                            <span className="text-white/40 text-[10px]">to</span>
                            <span className="text-[#A3E635] font-bold">{t.toUid === currentUid ? 'You' : t.toName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Roommate Budgets & Spending Limits Card (Visible ONLY when toggle is ON) ─── */}
            {enableMemberBudgets && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                      <span>👥 Roommate Budgets & Spent Limits</span>
                    </h3>
                    <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">Track individual monthly budget caps & spending capacity</p>
                  </div>
                  
                  {/* Feature Toggle Switch */}
                  <div className="flex items-center gap-2 bg-[#F6F8F6] dark:bg-slate-800/60 px-3 py-1.5 rounded-2xl border border-[#E3E8E3] dark:border-slate-700">
                    <span className="text-[10px] font-bold text-[#1A3827] dark:text-slate-300">
                      {enableMemberBudgets ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !enableMemberBudgets;
                        setEnableMemberBudgets(nextState);
                        localStorage.setItem('enableMemberBudgets', nextState ? 'true' : 'false');
                        triggerToast(nextState ? 'Per-person room budgets enabled' : 'Per-person room budgets disabled');
                      }}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        enableMemberBudgets ? 'bg-[#1A3827] dark:bg-[#A3E635]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform ${
                        enableMemberBudgets ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {computedStats.suggestedNextBuyer && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      💡 Suggested Next Buyer: <strong>{computedStats.suggestedNextBuyer.nickname}</strong> ({formatINR(computedStats.suggestedNextBuyer.remaining)} remaining capacity)
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {computedStats.memberBudgetStats.map(m => {
                    const isSelf = auth.currentUser && m.uid === auth.currentUser.uid;
                    return (
                      <div key={m.uid} className={`p-3 rounded-2xl border transition-all ${
                        m.isExhausted 
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' 
                          : 'bg-[#F6F8F6] dark:bg-slate-800/40 border-[#E3E8E3] dark:border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {m.photoURL ? (
                              <img src={m.photoURL} alt={m.nickname} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#1A3827] text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                {m.nickname?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200 truncate">
                              {m.nickname}{isSelf ? ' (You)' : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingMemberBudget(m);
                              setNewMemberBudgetVal(m.budget);
                            }}
                            className="text-[10px] font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline"
                          >
                            Set Cap
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-[#5C6E5C] dark:text-slate-400">Spent: <strong className="text-[#1A3827] dark:text-white">{formatINR(m.spent)}</strong></span>
                            <span className="text-[#5C6E5C] dark:text-slate-400">Budget: <strong className="text-[#1A3827] dark:text-white">{formatINR(m.budget)}</strong></span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                m.pct >= 100 
                                  ? 'bg-rose-500' 
                                  : m.pct >= 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, m.pct)}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px]">
                            {m.isExhausted ? (
                              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                                ⚠️ Limit Reached (100%)
                              </span>
                            ) : (
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                {formatINR(m.remaining)} remaining
                              </span>
                            )}
                            <span className="font-bold text-slate-500">{m.pct}% used</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Excess Redistribution Matrix Card */}
                {isQuotaMode && (
                  <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 text-white border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#A3E635]">⚡ END-OF-MONTH EXCESS MATRIX</span>
                        <h4 className="text-sm font-black text-white">Excess Redistribution Pool</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400">Total Excess Pool</span>
                        <p className="text-base font-black text-[#A3E635]">{formatINR(computedStats.totalExcessPool || 0)}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Total excess spent beyond quotas is <strong className="text-white">{formatINR(computedStats.totalExcessPool || 0)}</strong>. Divided equally among members ({members.length}), each member's equal excess share is <strong className="text-[#A3E635]">{formatINR(computedStats.excessSharePerMember || 0)}</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {computedStats.memberBudgetStats.map(m => {
                        const netBal = computedStats.balances[m.uid] || 0;
                        return (
                          <div key={m.uid} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white truncate">{m.nickname}</span>
                              <span className="text-[9px] font-bold text-slate-400">Quota: {formatINR(m.budget)}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">Spent: <strong className="text-white">{formatINR(m.spent)}</strong></span>
                              <span className={m.excess > 0 ? 'text-purple-400 font-bold' : 'text-slate-400'}>
                                {m.excess > 0 ? `+${formatINR(m.excess)} Excess` : 'Quota Met'}
                              </span>
                            </div>
                            <div className="pt-1 border-t border-white/10 flex justify-between items-center text-[10px]">
                              <span className="text-slate-400">Net Settlement</span>
                              <span className={`font-black ${netBal > 0 ? 'text-[#A3E635]' : netBal < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                {netBal > 0 ? `+${formatINR(netBal)} (Gets)` : netBal < 0 ? `-${formatINR(Math.abs(netBal))} (Owes)` : 'Settled'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Quick Actions ── */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#5C6E5C] dark:text-slate-400 mb-2.5">QUICK ACTIONS</p>
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { label: 'Add Bill', icon: <Plus className="w-5 h-5 sm:w-6 sm:h-6" />, action: () => openAddExpenseModal() },
                  { label: 'Scan Receipt', icon: <Upload className="w-5 h-5 sm:w-6 sm:h-6" />, action: () => handleTriggerUpload() },
                  { label: 'Insights', icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />, action: () => setCurrentView('insights') },
                  { label: 'Invite', icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />, action: () => handleInviteTrigger() },
                ].map(({ label, icon, action }) => (
                  <button key={label} onClick={action}
                    className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 hover:border-[#1A3827]/20 active:scale-95 transition-all duration-150 cursor-pointer text-[#1A3827] dark:text-[#A3E635] group"
                  >
                    <div className="group-hover:scale-110 transition-transform duration-150">{icon}</div>
                    <span className="text-[9px] sm:text-[10px] font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wide text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Recent Transactions ── */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                <h3 className="text-xs sm:text-sm font-black text-[#1A3827] dark:text-slate-100 tracking-tight">Recent Transactions</h3>
                <button onClick={() => setCurrentView('ledger')} className="text-[10px] sm:text-xs font-bold text-[#1A3827] dark:text-[#A3E635] flex items-center gap-1 hover:underline cursor-pointer">
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-[#F6F8F6] dark:divide-slate-800">
                {dataList.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">No transactions yet.</p>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Expenses you log will appear here.</p>
                  </div>
                ) : (
                  dataList.slice(0, 6).map((t) => {
                    const isPayer = (t.paidByUid && t.paidByUid === currentUid) || (!t.paidByUid && t.paidBy === userNickname);
                    return (
                      <div key={t.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800/50 transition-colors cursor-default">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-800 flex items-center justify-center shrink-0">{getCategoryIcon(t.category)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[#1A3827] dark:text-slate-100 truncate">
                            {t.title}
                            {t.isEdited && <span onClick={e => { e.stopPropagation(); setActiveEditHistoryTx(t); }} className="ml-1.5 text-[9px] text-rose-500 italic font-bold cursor-pointer">(Edited)</span>}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap truncate">
                            <span>{getTransactionSubtitle(t)}</span>
                            {isQuotaMode && t.category !== 'Payment' && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-[#A3E635] border border-emerald-300/50">
                                ⚡ Quota Entry
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs sm:text-sm font-bold ${isPayer ? 'text-[#1A3827] dark:text-[#A3E635]' : 'text-slate-400 dark:text-slate-500'}`}>
                            {isPayer ? '−' : '+'}{formatINR(t.amount)}
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-0.5">{t.date}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 sm:px-5 py-2.5 border-t border-[#F6F8F6] dark:border-slate-800 flex items-center gap-1.5 text-[9px] text-[#5C6E5C] dark:text-slate-500">
                <Clock className="w-3 h-3" /><span>Live sync via Supabase</span>
              </div>
            </div>

          </div>{/* end left column */}

          {/* ── RIGHT SIDEBAR (lg: 4 cols) ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Monthly Budget Card */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">{monthName} Room Budget</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(monthlyRoomSpend)}</span>
                    <span className="text-xs text-[#5C6E5C] dark:text-slate-400">/ {formatINR(monthlyBudget)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${isOver ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]'}`}>{budgetPct}% used</span>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-1">{daysLeft}d left</p>
                </div>
              </div>
              <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-[#1A3827] dark:bg-[#A3E635]'}`} style={{ width: `${budgetPct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">
                <span>{isOver ? `⚠️ Over by ${formatINR(monthlyRoomSpend - monthlyBudget)}` : `${formatINR(remaining)} remaining`}</span>
                {!isOver && daysLeft > 0 && <span>~{formatINR(dailyLimit)}/day</span>}
              </div>
              {activeMonth === currentMonthStr && today.getDate() > 0 && monthlyRoomSpend > 0 && (() => {
                const projected = Math.round((monthlyRoomSpend / today.getDate()) * daysInMonth);
                return (
                  <div className={`rounded-xl p-3 flex items-start gap-2 ${isOver ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30' : 'bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800'}`}>
                    <Sparkles className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isOver ? 'text-rose-600' : 'text-[#1A3827] dark:text-[#A3E635]'}`} />
                    <div>
                      <p className={`text-[10px] font-bold ${isOver ? 'text-rose-700 dark:text-rose-400' : 'text-[#1A3827] dark:text-slate-200'}`}>{isOver ? 'Over budget!' : "You're on track"}</p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">📈 Projected: <span className="font-black">{formatINR(projected)}</span></p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Personal Spending Card */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">Personal Spending</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(monthlyPersonalTotal)}</span>
                    <span className="text-xs text-[#5C6E5C] dark:text-slate-400">/ {formatINR(personalCap)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${personalPercentage >= 90 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]'}`}>{personalPercentage.toFixed(0)}%</span>
                  <button onClick={() => { setPersonalCapInput(String(personalCap)); setIsEditingPersonalCap(true); }} className="p-1.5 rounded-lg hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all cursor-pointer" title="Edit limit">
                    <Pencil className="w-3 h-3 text-[#5C6E5C] dark:text-slate-400" />
                  </button>
                </div>
              </div>
              {isEditingPersonalCap && (
                <div className="flex items-center gap-2 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">₹</span>
                  <input type="number" min="0" value={personalCapInput}
                    onChange={e => setPersonalCapInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { const val = Number(personalCapInput); if (val > 0) { setPersonalCap(val); localStorage.setItem('personalCap', val); } setIsEditingPersonalCap(false); }
                      if (e.key === 'Escape') setIsEditingPersonalCap(false);
                    }}
                    className="flex-1 bg-transparent text-sm font-bold text-[#1A3827] dark:text-slate-100 outline-none min-w-0" autoFocus />
                  <button onClick={() => { const val = Number(personalCapInput); if (val > 0) { setPersonalCap(val); localStorage.setItem('personalCap', val); } setIsEditingPersonalCap(false); }} className="text-[10px] font-black bg-[#1A3827] text-white px-2.5 py-1 rounded-lg cursor-pointer">Save</button>
                  <button onClick={() => setIsEditingPersonalCap(false)} className="text-[10px] text-[#5C6E5C] px-2 py-1 rounded-lg hover:bg-[#E3E8E3] dark:hover:bg-slate-800 cursor-pointer">✕</button>
                </div>
              )}
              <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${personalPercentage >= 90 ? 'bg-rose-500' : 'bg-[#1A3827] dark:bg-[#A3E635]'}`} style={{ width: `${Math.min(100, personalPercentage)}%` }} />
              </div>
              <p className="text-[10px] font-medium text-[#5C6E5C] dark:text-slate-400">
                {personalPercentage >= 100 ? `⚠️ Exceeded by ${formatINR(monthlyPersonalTotal - personalCap)}` : `${formatINR(personalCap - monthlyPersonalTotal)} remaining`}
              </p>
            </div>

            {/* Room Activity Feed */}
            {activityLogs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-[#5C6E5C] dark:text-slate-400">Room Activity</h3>
                <div className="space-y-2.5">
                  {activityLogs.slice(0, 5).map(log => {
                    const isCreate = log.action === 'create', isEdit = log.action === 'edit', isSettle = log.action === 'settle', isDelete = log.action === 'delete';
                    let col = 'text-slate-400', bg = 'bg-slate-50 dark:bg-slate-800', icon = <Clock className="w-3 h-3" />;
                    if (isCreate) { col = 'text-emerald-600 dark:text-[#A3E635]'; bg = 'bg-emerald-50 dark:bg-emerald-950/30'; icon = <Plus className="w-3 h-3" />; }
                    else if (isEdit) { col = 'text-amber-600'; bg = 'bg-amber-50 dark:bg-amber-950/20'; icon = <Pencil className="w-3 h-3" />; }
                    else if (isSettle) { col = 'text-blue-600'; bg = 'bg-blue-50 dark:bg-blue-950/20'; icon = <Check className="w-3 h-3" />; }
                    else if (isDelete) { col = 'text-rose-600'; bg = 'bg-rose-50 dark:bg-rose-950/20'; icon = <Trash2 className="w-3 h-3" />; }
                    return (
                      <div key={log.id} className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bg} ${col}`}>{icon}</div>
                        <div>
                          <p className="text-xs font-semibold text-[#1A3827] dark:text-slate-200 leading-snug">{log.details || log.action}</p>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">{formatLogTime(log.created_at || log.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Low Fund Balance Alert */}
            {(() => {
              if (myFunds.length === 0) return null;
              const totalFundBalance = myFunds.reduce((sum, fund) => {
                const fundId = fund.id;
                const spent = myFundSpends.filter(s => s.splitType && (s.splitType === `__FUND_SPEND__:${fundId}` || s.splitType === fundId)).reduce((a, b) => a + (Number(b.amount) || 0), 0);
                return sum + ((Number(fund.amount) || 0) - spent);
              }, 0);
              if (totalFundBalance < 2000 && totalFundBalance >= 0) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3.5 flex items-start gap-3">
                    <span className="text-base shrink-0">⚠️</span>
                    <div>
                      <p className="text-xs font-black text-amber-800 dark:text-amber-300">Low Fund Balance</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Total: <span className="font-bold">{formatINR(Math.max(0, totalFundBalance))}</span>. Consider topping up.</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

          </div>{/* end right sidebar */}

        </div>{/* end main grid */}

      </div>
    );
  }


  // ==========================================
  // PAGE 2: THE LEDGER
  // ==========================================
  function renderLedger() {
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport', 'People', 'Payment'];
    
    const totalFilteredSpend = filteredTransactions.filter(t => t.category !== 'Payment').reduce((sum, t) => sum + t.amount, 0);
    const totalFilteredShared = filteredTransactions.filter(t => t.isShared && t.category !== 'Payment').reduce((sum, t) => sum + t.amount, 0);
    const totalFilteredPersonal = filteredTransactions.filter(t => !t.isShared && t.category !== 'Payment').reduce((sum, t) => sum + t.amount, 0);

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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12291C] dark:text-slate-100 tracking-tight">The ledger</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Every expense, transparently tracked and split in real time.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Primary Action */}
            <button 
              onClick={() => openAddExpenseModal()}
              className="order-1 sm:order-3 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 px-5 py-3 rounded-2xl font-black hover:bg-[#1A3827] dark:hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm shadow-lg shadow-emerald-950/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add expense</span>
            </button>

            {/* Secondary Actions */}
            <div className="order-2 flex items-center gap-2 w-full sm:w-auto">
              {/* Export Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <button 
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="w-full flex items-center justify-center gap-2 hud-card hover:border-[#A3E635]/60 text-[#12291C] dark:text-slate-200 px-4 py-2.5 rounded-2xl font-bold transition-all text-xs cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  <span>Export</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                
                {isExportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsExportDropdownOpen(false)} />
                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white/95 dark:bg-[#0E1317]/95 backdrop-blur-2xl border border-[#E2EAE3] dark:border-[#1F2830] rounded-2xl shadow-2xl py-2 z-40 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                      <button 
                        onClick={() => { exportToCSV(filteredTransactions); setIsExportDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                        <span>Export to CSV</span>
                      </button>
                      <button 
                        onClick={() => { exportToExcel(filteredTransactions); setIsExportDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span>Export to Excel</span>
                      </button>
                      <button 
                        onClick={() => { exportToPDF(filteredTransactions); setIsExportDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Settlement Records Button */}
              <button 
                onClick={() => navigateTo('settlement-records')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 hud-card hover:border-[#A3E635]/60 text-[#12291C] dark:text-[#A3E635] px-4 py-2.5 rounded-2xl font-bold transition-all text-xs cursor-pointer shadow-sm"
                title="View Settlement History"
              >
                <HandCoins className="w-4 h-4 text-emerald-600 dark:text-[#A3E635] shrink-0" />
                <span className="truncate">Settlements</span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#0F291E] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full shrink-0">
                  {computedStats.settlementCount || 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="hud-card p-4 rounded-3xl flex flex-col md:flex-row md:items-center gap-3 justify-between transition-all duration-300">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search TX ID, title, amount, payer, member, month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-[#E2EAE3] dark:border-[#1F2830] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A3E635] text-[#12291C] dark:text-white bg-white/70 dark:bg-[#080B0D]/70 font-medium placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:gap-3 sm:w-auto">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-[#E2EAE3] dark:border-[#1F2830] bg-white/70 dark:bg-[#080B0D]/70 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A3E635] text-[#12291C] dark:text-slate-200 font-bold cursor-pointer transition-all"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
                ))}
              </select>

              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-[#E2EAE3] dark:border-[#1F2830] bg-white/70 dark:bg-[#080B0D]/70 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A3E635] text-[#12291C] dark:text-slate-200 font-bold cursor-pointer transition-all"
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
                setSelectedMonth(getLocalMonthStr());
                triggerToast('Search filter reset.');
              }}
              className="w-full sm:w-auto bg-[#0F291E] dark:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#1A3827] dark:hover:bg-slate-700 transition-all text-center cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
          <div 
            onClick={() => navigateTo('settlement-records')}
            className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 cursor-pointer group col-span-2 md:col-span-1"
            title="Click to view Settlement Records"
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-[#A3E635] tracking-wider uppercase flex items-center gap-1">
                <HandCoins className="w-3.5 h-3.5" />
                <span>SETTLEMENTS</span>
              </p>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-base sm:text-2xl font-black text-emerald-700 dark:text-[#A3E635] mt-1 truncate">{formatINR(computedStats.totalSettledAmount || 0)}</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">{computedStats.settlementCount || 0} records →</p>
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
                          {t.isEdited && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveEditHistoryTx(t);
                              }}
                              className="ml-1.5 text-[9px] text-rose-500 dark:text-rose-400 italic font-bold tracking-wide cursor-pointer hover:underline"
                              title="Click to view edit history"
                            >
                              (Edited)
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shrink-0 border border-[#E3E8E3]/60 dark:border-slate-800" title="Transaction ID">
                            {formatTxId(t.id)}
                          </span>
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
                          <span>{t.date} {t.time && `• ${parseTimeAndHistory(t.time).time}`}</span>
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
    setFormPaidBy(currentUid);
    const newSplits = {};
    members.forEach(m => {
      newSplits[m.uid] = m.uid === currentUid;
    });
    setSelectedSplitMembers(newSplits);
  }

  function renderPersonalExpenses() {
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport', 'People'];
    const activeMonth = selectedMonth === 'All' ? getLocalMonthStr() : selectedMonth;
    const monthlyPersonalTotal = selectedMonth === 'All'
      ? myPersonalExpenses.reduce((sum, t) => sum + t.amount, 0)
      : myPersonalExpenses.filter(t => t.date && t.date.startsWith(activeMonth)).reduce((sum, t) => sum + t.amount, 0);
    const personalPercentage = Math.min((monthlyPersonalTotal / personalCap) * 100, 100);

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Personal expenses</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Your private ledger, separate from room bills.</p>
          </div>

          {/* Section Segmented Control: All / Paid by You for You / Paid for Others by You / By Roommate */}
          <div className="flex hud-card p-1.5 rounded-2xl self-start md:self-auto shadow-sm gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => { setPersonalTabSection('all'); setSelectedRoommateFilter('all'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                personalTabSection === 'all'
                  ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#12291C] dark:hover:text-slate-200'
              }`}
            >
              All ({allPersonalExpenses.length})
            </button>
            <button
              onClick={() => setPersonalTabSection('my-self')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                personalTabSection === 'my-self'
                  ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#12291C] dark:hover:text-slate-200'
              }`}
            >
              Paid by You (For You) ({mySelfPersonalExpenses.length})
            </button>
            <button
              onClick={() => setPersonalTabSection('paid-for-others')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                personalTabSection === 'paid-for-others'
                  ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#12291C] dark:hover:text-slate-200'
              }`}
            >
              Paid for Others by You ({paidForOthersByMeExpenses.length})
            </button>
            <button
              onClick={() => setPersonalTabSection('by-roommate')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                personalTabSection === 'by-roommate'
                  ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#12291C] dark:hover:text-slate-200'
              }`}
            >
              By Roommate
            </button>
          </div>
          
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Export Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <button 
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="w-full flex items-center justify-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              
              {isExportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExportDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-40 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                    <button 
                      onClick={() => { exportToCSV(filteredPersonalExpenses); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Export to CSV</span>
                    </button>
                    <button 
                      onClick={() => { exportToExcel(filteredPersonalExpenses); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Export to Excel</span>
                    </button>
                    <button 
                      onClick={() => { exportToPDF(filteredPersonalExpenses); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
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
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-bold hover:bg-[#1A3827] dark:hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add personal expense</span>
            </button>
          </div>
        </div>

        {/* Sub-bar for By Roommate filter */}
        {personalTabSection === 'by-roommate' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 animate-fade-in hud-card p-3 rounded-2xl">
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400 shrink-0">Filter by Roommate:</span>
            <button
              onClick={() => setSelectedRoommateFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                selectedRoommateFilter === 'all'
                  ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                  : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              All Members ({allPersonalExpenses.length})
            </button>
            {members.map(m => {
              const count = allPersonalExpenses.filter(t => t.paidByUid === m.uid || (t.splits && t.splits.some(s => s.uid === m.uid))).length;
              return (
                <button
                  key={m.uid}
                  onClick={() => setSelectedRoommateFilter(m.uid)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedRoommateFilter === m.uid
                      ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                      : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{m.nickname}</span>
                  <span className="opacity-70 font-normal">({count})</span>
                </button>
              );
            })}
          </div>
        )}

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
              placeholder="Search TX ID, title, amount, payer, member, month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
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
                setSelectedMonth(getLocalMonthStr());
                setSelectedRoommateFilter('all');
                triggerToast('Search filter reset.');
              }}
              className="w-full sm:w-auto bg-[#1A3827] dark:bg-slate-800 text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all text-center cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Transaction list panel */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center bg-[#F6F8F6]/30 dark:bg-slate-950/20">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
              {personalTabSection === 'all' 
                ? 'All Personal Expenses' 
                : personalTabSection === 'my-self' 
                  ? 'Personal Expenses Paid by You (For You)' 
                  : personalTabSection === 'paid-for-others'
                    ? 'Personal Expenses Paid by You (For Others)'
                    : selectedRoommateFilter === 'all'
                      ? 'Personal Expenses (All Roommates)'
                      : `Personal Expenses for ${members.find(m => m.uid === selectedRoommateFilter)?.nickname || 'Roommate'}`}
            </h3>
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              {filteredPersonalExpenses.length === activeBasePersonalList.length 
                ? `${filteredPersonalExpenses.length} transactions` 
                : `Filtered ${filteredPersonalExpenses.length} of ${activeBasePersonalList.length}`}
            </span>
          </div>

          <div className="divide-y divide-[#F6F8F6] dark:divide-slate-800">
            {activeBasePersonalList.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No personal expenses logged in this section yet.</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Expenses split with single individuals appear here.</p>
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
                          {t.isEdited && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveEditHistoryTx(t);
                              }}
                              className="ml-1.5 text-[9px] text-rose-500 dark:text-rose-400 italic font-bold tracking-wide cursor-pointer hover:underline"
                              title="Click to view edit history"
                            >
                              (Edited)
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shrink-0 border border-[#E3E8E3]/60 dark:border-slate-800" title="Transaction ID">
                            {formatTxId(t.id)}
                          </span>
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
                          <span>{t.date} {t.time && `• ${parseTimeAndHistory(t.time).time}`}</span>
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
        <div className="bg-white/95 dark:bg-[#0E1317]/95 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2EAE3] dark:border-[#1F2830] relative max-h-[90vh] flex flex-col transition-all duration-300">
          
          <div className="px-6 py-5 border-b border-[#E2EAE3]/60 dark:border-[#1F2830] flex justify-between items-center bg-[#F4F9F5]/40 dark:bg-[#161D22]/40 shrink-0">
            <div>
              <p className="text-[10px] tracking-widest font-black uppercase text-emerald-800 dark:text-[#A3E635]">
                {editingTransaction ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}
              </p>
              <h2 className="font-extrabold text-lg sm:text-xl text-[#12291C] dark:text-slate-100 mt-0.5 tracking-tight">
                {editingTransaction ? 'Edit expense' : 'Add an expense'}
              </h2>
            </div>
            <button 
              onClick={() => setIsAddExpenseOpen(false)}
              className="p-2 rounded-2xl text-[#5C6E5C] dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-[#12291C] dark:hover:text-slate-200 transition-all cursor-pointer"
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
                  if (val.trim() === '') {
                    setIsCategoryManuallyModified(false);
                  }
                  const detected = smartDetectCategory(val);
                  setSuggestedCategory(detected);
                  if (detected && !isCategoryManuallyModified) setFormCategory(detected);
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
              {matchingExistingTx && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3.5 rounded-2xl text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 animate-fade-in space-y-2.5 mt-2">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 mt-0.5 text-amber-500 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold">Existing expense found:</span> "{matchingExistingTx.title}" has a balance of <span className="font-black text-[#1A3827] dark:text-slate-100">{formatINR(matchingExistingTx.amount)}</span> paid by {matchingExistingTx.paidBy}.
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-amber-200/50 dark:border-amber-900/20">
                    <span className="font-bold text-[10px] text-amber-600 dark:text-amber-400">Add new amount to it?</span>
                    <button
                      type="button"
                      onClick={() => handleMergeExpense(matchingExistingTx)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[9px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                    >
                      Yes, Add & Save
                    </button>
                  </div>
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
                  onChange={(e) => {
                    setIsCategoryManuallyModified(true);
                    setFormCategory(e.target.value);
                  }}
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

            {/* Attach Receipt Files */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Attach Receipts (Optional, max 4 · Images, PDF, Excel)</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="file"
                    accept="image/*,application/pdf,.pdf,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    multiple
                    onChange={handleFormReceiptChange}
                    className="hidden"
                    id="form-receipt-upload"
                    disabled={formReceiptImages.length >= 4}
                  />
                  {formReceiptImages.length < 4 && (
                    <label 
                      htmlFor="form-receipt-upload"
                      className="flex items-center justify-center gap-2 bg-[#F6F8F6] dark:bg-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-700 text-[#1A3827] dark:text-slate-200 px-4 py-2 rounded-xl font-bold border border-[#E3E8E3] dark:border-slate-700 transition-all text-xs cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#1A3827] dark:text-slate-200" />
                      <span>Choose Files</span>
                    </label>
                  )}
                  {formReceiptImages.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400">
                        {formReceiptImages.length} of 4 files selected
                      </span>
                      {isImageDataUrl(formReceiptImages[0]) && (
                        <button
                          type="button"
                          disabled={isOcrLoading}
                          onClick={handleReceiptOcr}
                          className="flex items-center gap-1 bg-[#A3E635] text-[#1A3827] hover:bg-[#BEF264] px-2.5 py-1 rounded-lg font-bold text-[9px] transition-all disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isOcrLoading ? 'Scanning...' : 'Auto-detect amount (OCR)'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {formReceiptImages.length > 0 && (
                  <div className="flex gap-2.5 overflow-x-auto py-1">
                    {formReceiptImages.map((fileData, idx) => (
                      <div key={idx} className="relative shrink-0 group">
                        {isImageDataUrl(fileData) ? (
                          // Image: 64×64 thumbnail
                          <div className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                            <img src={fileData} className="w-full h-full object-cover" alt={`Receipt ${idx + 1}`} />
                            <button
                              type="button"
                              onClick={() => setFormReceiptImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all scale-90"
                              title="Remove file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : isPdfDataUrl(fileData) ? (
                          // PDF: wider preview card with embedded iframe
                          <div className="relative w-28 h-20 rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 overflow-hidden flex flex-col shadow-sm">
                            <iframe
                              src={fileData}
                              title={`PDF preview ${idx + 1}`}
                              className="w-full flex-1 pointer-events-none"
                              style={{transform:'scale(0.4)', transformOrigin:'0 0', width:'250%', height:'250%'}}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-red-50/90 dark:from-slate-900/90 to-transparent flex items-end justify-center pb-1">
                              <span className="text-[8px] font-black text-red-500 uppercase tracking-wider flex items-center gap-0.5">
                                <FileText className="w-2.5 h-2.5" /> PDF
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormReceiptImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all scale-90 z-10"
                              title="Remove file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          // Excel: icon card
                          <div className="relative w-16 h-16 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 overflow-hidden flex flex-col items-center justify-center gap-0.5 shadow-sm">
                            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">XL</span>
                            <button
                              type="button"
                              onClick={() => setFormReceiptImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all scale-90"
                              title="Remove file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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
                {(enableMemberBudgets ? ['equal', 'percentage', 'amount', 'budget_weighted'] : ['equal', 'percentage', 'amount']).map(type => (
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
                    {type === 'equal' ? 'Equally' : type === 'percentage' ? 'By %' : type === 'amount' ? 'By ₹' : 'Budget Ratio'}
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
                  const checkedMembers = members.filter(mm => selectedSplitMembers[mm.uid] !== false);
                  const checkedCount = checkedMembers.length || 1;
                  const equalShare = amountNum / checkedCount;
                  const totalCheckedBudget = checkedMembers.reduce((sum, mm) => sum + (Number(mm.individualBudget) || 2000), 0);
                  const mBudget = Number(m.individualBudget) || 2000;
                  const budgetWeightedShare = totalCheckedBudget > 0 ? (amountNum * (mBudget / totalCheckedBudget)) : equalShare;
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
                      {splitType === 'budget_weighted' && isChecked && (
                        <span className="text-[11px] font-bold text-[#1A3827] dark:text-[#A3E635]">
                          {formatINR(budgetWeightedShare)} <span className="text-[9px] font-normal text-slate-400">({totalCheckedBudget > 0 ? Math.round((mBudget / totalCheckedBudget) * 100) : 0}%)</span>
                        </span>
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

            {/* Also add to Fund Tracker — only shown when expense is personal and user has funds available */}
            {myFunds && myFunds.length > 0 && members.filter(mm => selectedSplitMembers[mm.uid] !== false).length === 1 && (
              <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 bg-[#F6F8F6]/30 dark:bg-slate-900/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635] shrink-0" />
                  <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">Also add to Fund Tracker</p>
                </div>
                <select
                  value={formFundId}
                  onChange={(e) => setFormFundId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827]"
                >
                  <option value="">— Don&apos;t add to any fund —</option>
                  {myFunds.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
                {formFundId && (
                  <p className="text-[10px] text-emerald-700 dark:text-[#A3E635] font-semibold">
                    ✓ This expense will also be recorded under the selected fund pot.
                  </p>
                )}
              </div>
            )}

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
  // SETTLE UP MODAL (Ultra-Minimalist 1-Tap Single Payments)
  // ==========================================
  function renderSettleModal() {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const myBalance = computedStats.currentUserBalance || 0;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-[#0E1315] w-full max-w-md rounded-3xl shadow-2xl border border-[#E3E8E3] dark:border-[#1E282C] max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300">
          
          {/* Minimal Header */}
          <div className="px-6 py-5 border-b border-[#E3E8E3]/60 dark:border-[#1E282C] flex justify-between items-center bg-[#F4F7F4]/40 dark:bg-[#161D20]/40 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635] animate-pulse"></span>
                <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100 tracking-tight">Settle Up</h3>
              </div>
              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 font-medium mt-0.5">1-Tap instant roommate payments</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                myBalance > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#A3E635] border border-emerald-300 dark:border-emerald-800' :
                myBalance < 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800' :
                'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {myBalance > 0 ? `+${formatINR(myBalance)}` : myBalance < 0 ? `-${formatINR(Math.abs(myBalance))}` : 'Settled'}
              </span>
              <button 
                onClick={() => setIsSettleModalOpen(false)} 
                className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* 1-Tap Single Roommate Settlement Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5C6E5C] dark:text-slate-400">ROOMMATE BALANCES</span>
                <span className="text-[9px] font-bold text-[#A3E635] uppercase">1-TAP PAY</span>
              </div>

              {members.length <= 1 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No roommates to settle with yet.
                </div>
              ) : (
                members.map(m => {
                  if (m.uid === currentUid) return null;

                  // Determine transfer relationship between current user and roommate m from suggestedTransfers
                  const transferFromMToMe = suggestedTransfers.find(t => t.fromUid === m.uid && t.toUid === currentUid);
                  const transferFromMeToM = suggestedTransfers.find(t => t.fromUid === currentUid && t.toUid === m.uid);

                  const owesMe = Boolean(transferFromMToMe && transferFromMToMe.amount > 0.01);
                  const iOwe = Boolean(transferFromMeToM && transferFromMeToM.amount > 0.01);
                  const settleAmt = owesMe ? transferFromMToMe.amount : iOwe ? transferFromMeToM.amount : 0;

                  return (
                    <div 
                      key={m.uid} 
                      className="hud-card rounded-3xl p-4.5 flex items-center justify-between gap-3 shadow-md hover:border-emerald-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-inner ${
                          owesMe ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#A3E635] border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' :
                          iOwe ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {m.nickname.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-slate-100 truncate">{m.nickname}</h4>
                          <p className={`text-[11px] font-bold truncate mt-0.5 ${
                            owesMe ? 'text-emerald-600 dark:text-[#A3E635]' :
                            iOwe ? 'text-rose-500' :
                            'text-slate-400'
                          }`}>
                            {owesMe ? `Owes you ${formatINR(settleAmt)}` : iOwe ? `You owe ${formatINR(settleAmt)}` : 'All settled up'}
                          </p>
                        </div>
                      </div>

                      {/* 1-Tap Action Buttons */}
                      <div className="shrink-0">
                        {iOwe ? (
                          <button
                            type="button"
                            onClick={() => executeQuickSettle(currentUid, m.uid, settleAmt)}
                            className="px-4 py-2.5 bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-950/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current text-[#A3E635] dark:text-slate-950" />
                            <span>Pay {formatINR(settleAmt)}</span>
                          </button>
                        ) : owesMe ? (
                          <button
                            type="button"
                            onClick={() => executeQuickSettle(m.uid, currentUid, settleAmt)}
                            className="px-4 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Mark {formatINR(settleAmt)} Paid</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold rounded-xl">
                            Settled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom Amount Toggle Button */}
            <div className="pt-2 border-t border-[#E3E8E3]/60 dark:border-[#1E282C]">
              <button
                type="button"
                onClick={() => setShowCustomSettle(!showCustomSettle)}
                className="w-full text-center py-2 text-xs font-extrabold text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-[#A3E635] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{showCustomSettle ? '✕ Hide Custom Amount' : '⚙️ Custom Partial Amount'}</span>
              </button>

              {/* Collapsible Custom Amount Form */}
              {showCustomSettle && (
                <form onSubmit={handleRecordPayment} className="mt-3 space-y-3 p-4 rounded-2xl bg-[#F4F7F4]/60 dark:bg-[#161D20] border border-[#E3E8E3] dark:border-[#1E282C] animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block uppercase">Payer</label>
                      <select
                        value={settlePayer}
                        onChange={e => setSettlePayer(e.target.value)}
                        className="w-full px-2.5 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white"
                      >
                        {members.map(m => <option key={m.uid} value={m.uid}>{m.nickname}{m.uid === currentUid ? ' (You)' : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block uppercase">Receiver</label>
                      <select
                        value={settleReceiver}
                        onChange={e => setSettleReceiver(e.target.value)}
                        className="w-full px-2.5 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white"
                      >
                        {members.filter(m => m.uid !== settlePayer).map(m => <option key={m.uid} value={m.uid}>{m.nickname}{m.uid === currentUid ? ' (You)' : ''}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block uppercase">Amount (₹)</label>
                    <input
                      type="number" min="0.01" step="0.01" required
                      placeholder="Enter custom amount..."
                      value={settleAmount}
                      onChange={e => setSettleAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-extrabold text-xs rounded-xl shadow-sm"
                  >
                    Record Custom Settlement
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Join Request Modal when room is full / locked
  function renderJoinRequestModal() {
    if (!joinRequestModalInfo) return null;
    const { roomId, roomName, hostNickname, currentCount, maxLimit } = joinRequestModalInfo;
    const displayName = roomName && roomName !== 'Tallyin' ? `${roomName} (${roomId})` : roomId;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#E3E8E3] dark:border-slate-800 text-left space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center font-black text-xl">
            🔒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">Room is Locked</h3>
              <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full uppercase">Full</span>
            </div>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1">
              Room <strong className="text-[#1A3827] dark:text-slate-200">{displayName}</strong> has reached its capacity limit of <strong>{maxLimit}</strong> members ({currentCount}/{maxLimit}).
            </p>
          </div>
          
          {/* Admin / Host Info Box (Name Only) */}
          <div className="p-3.5 bg-[#F6F8F6] dark:bg-slate-950 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">Room Admin</span>
              <span className="text-[10px] font-black text-emerald-800 dark:text-[#A3E635] bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">Host</span>
            </div>
            <p className="text-xs font-black text-[#1A3827] dark:text-slate-100">{hostNickname || 'Room Admin'}</p>
          </div>

          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
            Send an in-app join request to <strong>{hostNickname || 'the Admin'}</strong> to expand capacity (+1) and enter the room.
          </p>

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => setJoinRequestModalInfo(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 font-bold text-xs hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSendJoinRequest(roomId)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-xs hover:opacity-90 flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Send Join Request</span>
            </button>
          </div>
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

            {/* Pending Join Requests Section (Host only) */}
            {isHost && (
              <div className="border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs font-black text-[#1A3827] dark:text-slate-100">Pending Join Requests</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                    {pendingJoinRequests.length} Pending
                  </span>
                </div>

                {pendingJoinRequests.length === 0 ? (
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400 italic py-1">No pending join requests.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingJoinRequests.map(req => (
                      <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-[#1A3827] dark:text-slate-100">{req.nickname}</p>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 truncate">{req.email || 'No email provided'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleApproveJoinRequest(req)}
                            className="px-2.5 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-lg text-[10px] font-black hover:opacity-90 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve (+1 Capacity)</span>
                          </button>
                          <button
                            onClick={() => handleDeclineJoinRequest(req)}
                            className="px-2 py-1.5 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-[10px] font-bold"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Members List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black text-[#1A3827] dark:text-slate-200">
                  Members ({members.length} / {roomMaxMembers})
                </p>
                {members.length >= roomMaxMembers && (
                  <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    🔒 Room Locked (Capacity Full)
                  </span>
                )}
              </div>
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                              Quota: <strong className="text-[#1A3827] dark:text-slate-200">{formatINR(m.individualBudget || 2000)}</strong>
                            </span>
                            <button
                              onClick={() => {
                                setEditingMemberBudget(m);
                                setNewMemberBudgetVal(m.individualBudget || 2000);
                              }}
                              className="text-[9px] font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline"
                            >
                              Edit Quota
                            </button>
                          </div>
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
                          // Others: host can pass admin or remove
                          isHost && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Transfer Host/Admin authority to ${m.nickname}? They will become the primary room admin.`)) {
                                    try {
                                      const { error: transferErr } = await supabase
                                        .from('rooms')
                                        .update({ created_by: m.uid })
                                        .eq('id', userRoomId);
                                      if (transferErr) throw transferErr;
                                      setRoomCreatedBy(m.uid);
                                      triggerToast(`Host/Admin authority transferred to ${m.nickname}!`);
                                      await logActivity('settings', `${userNickname} transferred host authority to ${m.nickname}`);
                                    } catch (err) {
                                      triggerToast(`Failed to transfer admin: ${err.message}`);
                                    }
                                  }
                                }}
                                className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#A3E635] hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-lg text-[9px] font-black transition-all flex items-center gap-1"
                                title={`Pass Admin auth to ${m.nickname}`}
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Pass Admin</span>
                              </button>
                              <button
                                onClick={() => handleRemoveMember(m.uid)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                                title={`Remove ${m.nickname}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Room Capacity Limit Setting — host editable */}
            <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Room Member Capacity (Limit)</p>
                <span className="text-[10px] font-extrabold text-[#5C6E5C] dark:text-slate-400">Current Limit: {roomMaxMembers}</span>
              </div>
              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">Restrict total members in this room. Room locks automatically when limit is reached.</p>
              
              {members.length > roomMaxMembers && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                  <span>⚠️ Active members ({members.length}) exceed limit ({roomMaxMembers}).</span>
                  {isHost && (
                    <button
                      onClick={() => setSettingsMaxMembersInput(members.length)}
                      className="px-2 py-1 bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 rounded-lg text-[10px] font-black hover:underline"
                    >
                      Set to {members.length}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={Math.max(2, members.length)}
                  max="50"
                  value={settingsMaxMembersInput}
                  onChange={e => setSettingsMaxMembersInput(Math.max(2, Number(e.target.value) || 2))}
                  disabled={!isHost}
                  className={`flex-1 px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-900 ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">Members</span>
                {isHost && (
                  <button
                    onClick={async () => {
                      if (userRoomId) {
                        try {
                          const newLimit = Number(settingsMaxMembersInput) || 6;
                          if (newLimit < members.length) {
                            triggerToast(`Cannot set limit to ${newLimit}. Room currently has ${members.length} members. Set limit to at least ${members.length} or remove a member.`);
                            return;
                          }
                          const { error: updateError } = await supabase
                            .from('rooms')
                            .update({ max_members: newLimit })
                            .eq('id', userRoomId);
                          if (updateError) throw updateError;
                          setRoomMaxMembers(newLimit);
                          await logActivity('settings', `${userNickname} updated room member capacity limit to ${newLimit}`);
                          triggerToast(`Room capacity limit set to ${newLimit} members!`);
                        } catch (err) {
                          triggerToast(`Failed to update capacity: ${err.message}`);
                        }
                      }
                    }}
                    className="px-3 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl text-xs font-bold hover:opacity-90 shrink-0"
                  >
                    Save Capacity
                  </button>
                )}
                {!isHost && (
                  <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold px-1">Host only</span>
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
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger Zone — consensus-based deletion */}
            <div className="border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/10 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-black text-rose-700 dark:text-rose-400">Danger Zone</p>
              
              {!deleteProposal ? (
                <>
                  <p className="text-[11px] text-rose-600/80 dark:text-rose-400/70">
                    Deleting the room will permanently remove all transactions, members, and data. {roomCreatedBy === user?.id ? "This requires approval from all room members." : "Only the Host can propose room deletion."}
                  </p>
                  {roomCreatedBy === user?.id ? (
                    <button
                      onClick={() => {
                        if (members.length <= 1) {
                          handleDeleteRoom(false);
                        } else {
                          handleProposeDeleteRoom();
                        }
                      }}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {members.length <= 1 ? "Delete Room Permanently" : "Propose Room Deletion"}
                    </button>
                  ) : (
                    <p className="text-[10px] text-rose-500 font-medium italic">
                      🔒 Only the Room Host (Admin) can delete or propose room deletion.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-950 space-y-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Delete Room Proposal Active
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Proposed by <span className="font-semibold text-rose-600 dark:text-rose-400">{deleteProposal.paidBy}</span>. All members must approve.
                    </p>
                    
                    {/* Status grid */}
                    <div className="space-y-1.5 pt-1">
                      {members.map(m => {
                        const approved = (deleteProposal.splits || []).some(s => s.uid === m.uid);
                        return (
                          <div key={m.uid} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{m.nickname}</span>
                            {approved ? (
                              <span className="text-emerald-600 dark:text-[#A3E635] font-bold flex items-center gap-1">
                                ✓ Approved
                              </span>
                            ) : (
                              <span className="text-amber-500 font-medium flex items-center gap-1">
                                ◷ Pending
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!(deleteProposal.splits || []).some(s => s.uid === currentUid) ? (
                      <button
                        onClick={() => handleApproveDeleteRoom(deleteProposal)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Approve Deletion
                      </button>
                    ) : (
                      <div className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700">
                        Approved (Waiting...)
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleRejectDeleteRoom(deleteProposal)}
                      className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Leave room is still shown to non-hosts for convenience */}
              {!isHost && (
                <div className="pt-2 border-t border-rose-100 dark:border-rose-950/40">
                  <button
                    onClick={() => { setIsManageRoomOpen(false); handleLeaveRoom(); }}
                    className="w-full py-1.5 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] rounded-lg transition-all"
                  >
                    Leave Room Instead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderMemberBudgetModal() {
    if (!editingMemberBudget) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1A3827] dark:text-slate-100">Set Roommate Budget Cap</h3>
            <button onClick={() => setEditingMemberBudget(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
            Set individual monthly room expense budget cap for <strong>{editingMemberBudget.nickname}</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Monthly Budget Cap (₹)</label>
            <input
              type="number"
              value={newMemberBudgetVal}
              onChange={e => setNewMemberBudgetVal(e.target.value)}
              placeholder="e.g. 2000, 3000, 10000"
              className="w-full px-3.5 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-sm bg-white dark:bg-slate-950 text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingMemberBudget(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleUpdateMemberBudget(editingMemberBudget.uid, newMemberBudgetVal)}
              className="px-4 py-2 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Save Budget
            </button>
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
      time: editingFund ? editingFund.time : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
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
        
        const txId = (data && data[0] && data[0].id) ? data[0].id : `optimistic-fund-${Date.now()}`;
        const newTx = {
          id: txId,
          roomId: userRoomId,
          title: payload.title,
          amount: payload.amount,
          category: payload.category,
          date: payload.date,
          time: payload.time,
          paidBy: payload.paid_by,
          paidByUid: payload.paid_by_uid,
          isShared: payload.is_shared,
          splitType: payload.split_type,
          split: payload.split,
          splits: payload.splits,
          createdBy: currentUid
        };
        setTransactions(prev => [newTx, ...prev.filter(t => t.id !== txId)]);
        triggerToast('Fund created successfully.');
      }
      setIsAddFundModalOpen(false);
      setEditingFund(null);
      setFundFormName('');
      setFundFormAmount('');
      fetchTransactions(userRoomId);
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
        .in('split', [String(fund.id), `${fund.id} [PAID_BACK]`])
        .eq('category', '__FUND_SPEND__');
        
      if (spendsError) throw spendsError;

      // Delete fund init
      const { error: fundError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', fund.id);

      if (fundError) throw fundError;

      setTransactions(prev => prev.filter(t => String(t.id) !== String(fund.id) && !(t.category === '__FUND_SPEND__' && String(getDisplaySplitLabel(t)) === String(fund.id))));
      
      if (String(selectedFundId) === String(fund.id)) {
        setSelectedFundId(null);
      }
      triggerToast('Fund deleted successfully.');
      fetchTransactions(userRoomId);
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

    // Auto-merge duplicate fund spends on create if they have the same name
    if (!editingFundSpend) {
      const duplicate = transactions.find(t => 
        t.category === '__FUND_SPEND__' &&
        String(t.split) === String(selectedFundId) &&
        t.title &&
        t.title.toLowerCase().trim() === fundSpendFormTitle.toLowerCase().trim()
      );
      if (duplicate) {
        handleMergeFundSpend(duplicate);
        return;
      }
    }

    const amtNum = fundSpendFormType === 'income' ? -baseAmt : baseAmt;

    const currentUid = user?.id || 'anonymous';
    const nickname = userNickname || 'You';

    const payload = {
      title: fundSpendFormTitle.trim(),
      amount: amtNum,
      category: '__FUND_SPEND__',
      date: fundSpendFormDate,
      time: editingFundSpend ? editingFundSpend.time : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
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

        if (notificationMethod !== 'none') {
          sendEmailNotification({ title: payload.title, amount: payload.amount, paidBy: nickname }, 'update').catch(err => console.warn('Fund update email failed:', err));
        }
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
        
        const txId = (data && data[0] && data[0].id) ? data[0].id : `optimistic-spend-${Date.now()}`;
        const newTx = {
          id: txId,
          roomId: userRoomId,
          title: payload.title,
          amount: payload.amount,
          category: payload.category,
          date: payload.date,
          time: payload.time,
          paidBy: payload.paid_by,
          paidByUid: payload.paid_by_uid,
          isShared: payload.is_shared,
          splitType: payload.split_type,
          split: payload.split,
          splits: payload.splits,
          createdBy: currentUid
        };
        setTransactions(prev => [newTx, ...prev.filter(t => t.id !== txId)]);
        triggerToast('Payment recorded successfully.');

        if (notificationMethod !== 'none') {
          sendEmailNotification({ title: payload.title, amount: payload.amount, paidBy: nickname, isShared: false, split: selectedFundId }, 'add').catch(err => console.warn('Fund spend email failed:', err));
        }
      }
      closeAddFundExpenseModal();
      fetchTransactions(userRoomId);
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
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Error deleting payment.');
    }
  }

  async function handleToggleAudit(spendTx) {
    const rawCategory = spendTx.splitType || 'Other';
    const isCurrentlyAudited = rawCategory.startsWith('Audited:');
    
    let newCategory;
    if (isCurrentlyAudited) {
      newCategory = rawCategory.split(':')[1] || 'Other';
    } else {
      newCategory = `Audited:${rawCategory}`;
    }
    
    // Optimistic local state update
    setTransactions(prev => prev.map(t => {
      if (t.id === spendTx.id) {
        return { ...t, splitType: newCategory };
      }
      return t;
    }));
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          split_type: newCategory,
          is_edited: true
        })
        .eq('id', spendTx.id);
        
      if (error) throw error;
      
      triggerToast(isCurrentlyAudited ? 'Removed from Audited category.' : 'Marked as Audited!');
      
      // Log audit action in activity logs
      await supabase
        .from('activity_logs')
        .insert({
          room_id: userRoomId,
          user_id: user?.id || 'anonymous',
          user_name: userNickname,
          action: 'edit',
          details: `${userNickname} ${isCurrentlyAudited ? 'removed' : 'marked'} fund payment "${spendTx.title}" ${isCurrentlyAudited ? 'from' : 'as'} Audited.`,
          created_at: new Date().toISOString()
        });
        
      fetchTransactions(userRoomId);
    } catch (err) {
      console.error(err);
      triggerToast('Error updating audit state.');
      // Revert local state
      setTransactions(prev => prev.map(t => {
        if (t.id === spendTx.id) {
          return { ...t, splitType: spendTx.splitType };
        }
        return t;
      }));
    }
  }

  function exportFundToCSV(fund, spends) {
    try {
      const headers = ['Title', 'Amount (₹)', 'Category', 'Date'];
      const rows = spends.map(s => [
        `"${s.title.replace(/"/g, '""')}"`,
        s.amount,
        getDisplayCategory(s.splitType, isAuditMode),
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

  function exportFundToPDF(fund, spends) {
    try {
      const fundSpends = spends.filter(s => String(getDisplaySplitLabel(s)) === String(fund.id));
      const spent = fundSpends.filter(s => s.amount > 0 && !isTxPaidBack(s)).reduce((sum, s) => sum + s.amount, 0);
      const received = fundSpends.filter(s => s.amount < 0).reduce((sum, s) => sum + Math.abs(s.amount), 0);
      const netSpent = spent - received;
      const remaining = fund.amount - netSpent;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${fund.title} - Statement</title>
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
            .cards-grid { display: grid; grid-template-cols: repeat(5, 1fr); gap: 16px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #E3E8E3; border-radius: 16px; padding: 16px; background-color: #fcfdfc; }
            .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #5C6E5C; margin-bottom: 4px; }
            .card-value { font-size: 18px; font-weight: 800; color: #1A3827; }
            .card-value.green { color: #15803d; }
            .card-value.blue { color: #1a5632; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; padding: 14px 16px; background-color: #F6F8F6; color: #5C6E5C; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #E3E8E3; }
            td { padding: 14px 16px; font-size: 12px; color: #102217; border-bottom: 1px solid #E3E8E3; font-weight: 500; }
            tr:hover td { background-color: #fcfdfc; }
            td.amount-col { font-weight: 800; text-align: right; }
            td.amount-col.outflow { color: #102217; }
            td.amount-col.inflow { color: #15803d; }
            
            .badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; background-color: #EAF0EC; color: #1A3827; }
            
            @media print {
              body { padding: 0; }
              .header-banner { border-radius: 0; margin-bottom: 20px; background-color: #1A3827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .summary-card { border-radius: 8px; background-color: #fcfdfc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              th { background-color: #F6F8F6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              td.amount-col.inflow { color: #15803d !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .badge { background-color: #EAF0EC !important; color: #1A3827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="logo-title">
              <img src="${logoIcon}" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;" />
              <div>
                <h1 class="logo-text">Tallyin Funds</h1>
                <p style="font-size: 11px; opacity: 0.8; font-weight: 600; margin-top: 2px;">Private & Isolated Fund statement</p>
              </div>
            </div>
            <div class="doc-info">
              <p style="font-weight: 700;">${fund.title}</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              <p>Created: ${new Date(fund.date).toLocaleDateString()}</p>
            </div>
          </div>

          <p class="summary-title">Allocation Summary</p>
          <div class="cards-grid">
            <div class="summary-card">
              <p class="card-label">Total Allocation</p>
              <p class="card-value">${formatINR(fund.amount)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">Total Spent</p>
              <p class="card-value">${formatINR(spent)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">Total Received</p>
              <p class="card-value green">${formatINR(received)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">Net Spent</p>
              <p class="card-value">${formatINR(netSpent)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">Remaining Balance</p>
              <p class="card-value blue">${formatINR(remaining)}</p>
            </div>
          </div>

          <p class="summary-title">Transaction Ledger</p>
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Title</th>
                <th style="width: 20%;">Category</th>
                <th style="width: 15%;">Date</th>
                <th style="width: 20%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${fundSpends.map(s => {
                const dateObj = s.date ? new Date(s.date) : null;
                const formattedDate = (dateObj && !isNaN(dateObj.getTime()))
                  ? dateObj.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A';
                return `
                  <tr>
                    <td style="font-weight: 700;">${s.title}</td>
                    <td><span class="badge">${getDisplayCategory(s.splitType, isAuditMode)}</span></td>
                    <td>${formattedDate}</td>
                    <td class="amount-col ${s.amount < 0 ? 'inflow' : 'outflow'}">
                      ${s.amount < 0 ? `+ ${formatINR(Math.abs(s.amount))}` : `- ${formatINR(s.amount)}`}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

        </body>
        </html>
      `;

      // Print using a hidden iframe to bypass browser popup blockers and webview tab limitations
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();
      
      setTimeout(() => {
        try {
          if (typeof iframe.contentWindow.print !== 'function') {
            throw new Error('print function not available on contentWindow');
          }
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
          triggerToast('Opening PDF print dialog...');
        } catch (printErr) {
          console.warn('iframe.print failed, falling back to file download:', printErr);
          try {
            document.body.removeChild(iframe);
          } catch(e) {}
          // Fallback: download HTML blob
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fund.title.replace(/\s+/g, '_')}_statement.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          triggerToast('Print not supported. Statement downloaded as HTML file.');
        }
      }, 500);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to generate PDF statement.');
    }
  }

  function renderFundTracker() {
    
    // Group active fund spends by category
    const activeFund = myFunds.find(f => String(f.id) === String(selectedFundId));
    const activeFundSpends = myFundSpends.filter(s => String(getDisplaySplitLabel(s)) === String(selectedFundId));

    // Compute stats for all funds
    const fundStats = {};
    myFunds.forEach(f => {
      const fundSpends = myFundSpends.filter(s => String(getDisplaySplitLabel(s)) === String(f.id));
      const spent = fundSpends.filter(s => s.amount > 0 && !isTxPaidBack(s)).reduce((sum, s) => sum + s.amount, 0);
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
        return matchesTxSearch(s, fundSearchQuery);
      });

      // Category breakdown (sum positive spends only)
      const categorySummary = {};
      activeFundSpends.forEach(s => {
        if (s.amount > 0 && !isTxPaidBack(s)) {
          const cat = getDisplayCategory(s.splitType, isAuditMode);
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
          'Audited': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/55',
          'Other': 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-300 border-slate-200/55'
        };
        return colors[cat] || 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-300';
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
                  exportFundToPDF(activeFund, activeFundSpends);
                }}
                className="flex items-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  exportFundToCSV(activeFund, activeFundSpends);
                }}
                className="flex items-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
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
                  placeholder="Search payments by title, TX ID, or category..."
                  value={fundSearchQuery}
                  onChange={(e) => setFundSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  const turningOff = isAuditMode;
                  setIsAuditMode(!isAuditMode);
                  if (turningOff) {
                    // Strip Audited: prefix from all fund spends in this fund when turning off audit mode
                    const auditedSpends = activeFundSpends.filter(s => s.splitType?.startsWith('Audited:'));
                    if (auditedSpends.length > 0) {
                      // Optimistic local update
                      setTransactions(prev => prev.map(t => {
                        if (auditedSpends.find(s => s.id === t.id)) {
                          return { ...t, splitType: (t.splitType || '').replace('Audited:', '').trim() || 'Other' };
                        }
                        return t;
                      }));
                      // Persist all un-audit changes to DB
                      try {
                        await Promise.all(auditedSpends.map(s => {
                          const original = (s.splitType || '').replace('Audited:', '').trim() || 'Other';
                          return supabase
                            .from('transactions')
                            .update({ split_type: original, is_edited: true })
                            .eq('id', s.id);
                        }));
                        fetchTransactions(userRoomId);
                      } catch (err) {
                        console.error('Error reverting audit categories:', err);
                        fetchTransactions(userRoomId);
                      }
                    }
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 w-full sm:w-auto justify-center border ${
                  isAuditMode
                    ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm'
                    : 'border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-300 hover:bg-[#F6F8F6] dark:hover:bg-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isAuditMode ? 'Audit Mode: Active' : 'Audit Mode'}</span>
              </button>
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
                      {isAuditMode && <th className="py-3.5 px-3 text-center w-12">Audit</th>}
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
                        {isAuditMode && (
                          <td className="py-4 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={s.splitType?.startsWith('Audited:')}
                              onChange={() => handleToggleAudit(s)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shrink-0 border border-[#E3E8E3]/60 dark:border-slate-800" title="Payment ID">
                              {formatTxId(s.id)}
                            </span>
                            <p className="font-bold text-sm text-[#1A3827] dark:text-slate-100">{s.title}</p>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getCategoryColor(getDisplayCategory(s.splitType, isAuditMode))}`}>
                              {getDisplayCategory(s.splitType, isAuditMode)}
                            </span>
                            {isTxPaidBack(s) && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-[#A3E635] border border-emerald-200/50 shrink-0">
                                Paid Back
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
                          {new Date(s.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className={`py-4 px-3 text-right font-black text-sm ${s.amount < 0 ? 'text-green-600 dark:text-green-400' : 'text-[#1A3827] dark:text-slate-100'}`}>
                          {s.amount < 0 ? `+ ${formatINR(Math.abs(s.amount))}` : `- ${formatINR(s.amount)}`}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {s.amount > 0 && (
                              <button
                                onClick={() => handleTogglePaidBack(s)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isTxPaidBack(s)
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 hover:text-emerald-700'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={isTxPaidBack(s) ? "Mark as Unpaid" : "Mark as Paid Back"}
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setFundSpendFormTitle(s.title);
                                setFundSpendFormAmount(String(Math.abs(s.amount)));
                                setFundSpendFormCategory(getDisplayCategory(s.splitType, false));
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
                <div 
                  key={f.id} 
                  onClick={() => setSelectedFundId(f.id)}
                  className="cursor-pointer bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className="font-extrabold text-base text-[#1A3827] dark:text-slate-100 line-clamp-1">{f.title}</h3>
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] border border-[#E3E8E3]/60 dark:border-slate-800 shrink-0" title="Fund ID">
                          {formatTxId(f.id)}
                        </span>
                      </div>
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
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Creation Date</label>
              <input 
                type="date" 
                value={fundFormDate}
                onChange={(e) => setFundFormDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold cursor-pointer"
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
              onClick={() => { closeAddFundExpenseModal(); }}
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
                  if (val.trim() === '') {
                    setIsFundCategoryManuallyModified(false);
                  }
                  const detected = smartDetectCategory(val);
                  if (detected && !isFundCategoryManuallyModified) setFundSpendFormCategory(detected);
                }}
                required
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold"
              />
              {matchingExistingFundSpend && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-2xl text-[10px] sm:text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 animate-fade-in space-y-2 mt-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold">Existing payment found:</span> "{matchingExistingFundSpend.title}" has a total balance of <span className="font-black text-[#1A3827] dark:text-slate-100">{formatINR(Math.abs(matchingExistingFundSpend.amount))}</span> in this fund.
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-amber-200/50 dark:border-amber-900/20">
                    <span className="font-bold text-[9px] text-amber-600 dark:text-amber-400">Add new amount to it?</span>
                    <button
                      type="button"
                      onClick={() => handleMergeFundSpend(matchingExistingFundSpend)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                    >
                      Yes, Add & Save
                    </button>
                  </div>
                </div>
              )}
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
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
              <select
                value={fundSpendFormCategory}
                onChange={(e) => {
                  setIsFundCategoryManuallyModified(true);
                  setFundSpendFormCategory(e.target.value);
                }}
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-bold cursor-pointer"
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
                className="w-full px-4 py-3 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] text-[#1A3827] dark:text-white font-semibold cursor-pointer"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                type="button"
                onClick={() => { closeAddFundExpenseModal(); }}
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
    const isPersonalTab = insightsTab === 'personal';
    const {
      monthTransactions,
      monthPersonalExpenses,
      targetTransactions,
      daysInMonth,
      daysPassed,
      daysLeft,
      monthSharedSpend,
      monthPersonalSpend,
      monthTotalSpend,
      catArr,
      dailyAvg,
      activeLimit,
      roomOrPersonalTotal,
      limitRemaining,
      safeDailyLimit,
      myShare,
      largestTx,
      totalTransactionsCount,
      avgTxValue,
      projectedSpend,
      isProjectable,
      fairnessScore,
      fairnessRating,
      fairnessDesc,
      momChangePct,
      isSpendUp,
      prevMonthSpend
    } = computedInsights;

    const rawTotal = targetTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const total = rawTotal > 0 ? rawTotal : 1;           // safe divisor for percentages only
    const circumference = 2 * Math.PI * 40; // 251.3
    let cumulativePct = 0;

    const CATEGORY_COLORS = {
      'Rent': '#1A3827', 'Food': '#FBBF24', 'Groceries': '#22C55E',
      'Utilities': '#3B82F6', 'Shopping': '#F43F5E', 'Transport': '#8B5CF6',
      'Fuel': '#F97316', 'Entertainment': '#EC4899', 'Medical': '#14B8A6',
      'Payment': '#6366F1', 'Other': '#94A3B8'
    };

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12291C] dark:text-slate-100 tracking-tight">Spending insights</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">A clearer view of where your money goes — powered by real data.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Segmented Control */}
            <div className="flex hud-card p-1.5 rounded-2xl self-start sm:self-auto shadow-sm">
              <button
                onClick={() => setInsightsTab('room')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                  !isPersonalTab
                    ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#12291C] dark:hover:text-slate-200'
                }`}
              >
                Room Expenses
              </button>
              <button
                onClick={() => setInsightsTab('personal')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                  isPersonalTab
                    ? 'bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 shadow-md'
                    : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#12291C] dark:hover:text-slate-200'
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
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">{targetTransactions.length} txs</span>
              {selectedMonth !== 'All' && momChangePct !== null && (
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  isSpendUp 
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                    : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isSpendUp ? '▲' : '▼'} {Math.abs(momChangePct)}% MoM
                </span>
              )}
              {selectedMonth !== 'All' && momChangePct === null && prevMonthSpend === 0 && (
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 rounded-full">New Room</span>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">DAILY AVG</p>
            <p className="text-base sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1 truncate">{formatINR(dailyAvg)}</p>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">
              {selectedMonth === 'All' ? 'Avg/day (full period)' : 'Avg/day (this month)'} · Safe: {formatINR(safeDailyLimit)}/day
            </p>
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

        {/* Monthly Spending Trend Chart */}
        {(() => {
          // Use the FULL unfiltered source arrays (not targetTransactions which is already month-scoped)
          // so each bar reflects real spending for that calendar month regardless of the month filter
          const excludedCats = new Set(['__FUND_INIT__', '__FUND_SPEND__', '__SHOPPING__', '__BILL__', '__CHORE__', 'Payment']);
          const trendSource = isPersonalTab
            ? myPersonalExpenses
            : transactions.filter(t => t.isShared && !excludedCats.has(t.category));

          const trendMonths = [];
          const referenceDate = new Date();
          for (let i = 5; i >= 0; i--) {
            const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
            const mStr = getLocalMonthStr(d);
            const label = d.toLocaleString('default', { month: 'short' });

            const totalForMonth = trendSource
              .filter(t => t.date && t.date.startsWith(mStr))
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            trendMonths.push({ label, mStr, amount: totalForMonth });
          }

          const maxSpend = Math.max(...trendMonths.map(m => m.amount), 1);

          return (
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors duration-300 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Monthly Spending Trend</h3>
                <span className="text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">
                  {isPersonalTab ? 'Personal' : 'Room (shared)'}
                </span>
              </div>
              <div className="h-44 flex items-end gap-2 sm:gap-4 pt-4 border-b border-[#E3E8E3] dark:border-slate-800">
                {trendMonths.map((mInfo) => {
                  const isActive = selectedMonth !== 'All' && mInfo.mStr === selectedMonth;
                  const pct = mInfo.amount === 0 ? 4 : Math.max(6, Math.round((mInfo.amount / maxSpend) * 90));
                  return (
                    <div key={mInfo.label} className="flex-1 h-full flex flex-col justify-end items-center group">
                      <div className="w-full flex-1 flex items-end mb-2 relative">
                        <div
                          className={`w-full rounded-t-lg relative transition-all duration-300 ${
                            isActive
                              ? 'bg-[#A3E635] dark:bg-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.4)]'
                              : mInfo.amount === 0
                                ? 'bg-[#F0F4F0] dark:bg-slate-800/60 opacity-40'
                                : 'bg-[#EAF0EC] dark:bg-slate-700 group-hover:bg-[#1A3827] dark:group-hover:bg-[#A3E635] group-hover:shadow-[0_0_12px_rgba(26,56,39,0.2)] dark:group-hover:shadow-[0_0_12px_rgba(163,230,53,0.2)]'
                          }`}
                          style={{ height: `${pct}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-black text-[#1A3827] dark:text-slate-200 transition-opacity duration-200 whitespace-nowrap bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-xl shadow-md border border-[#E3E8E3] dark:border-slate-800 z-10">
                            {mInfo.amount === 0 ? 'No spend' : formatINR(mInfo.amount)}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-[#1A3827] dark:text-[#A3E635]' : 'text-[#5C6E5C] dark:text-slate-400'}`}>
                        {mInfo.label}{isActive ? ' ●' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-[#5C6E5C] dark:text-slate-500 mt-3 font-semibold">
                {selectedMonth !== 'All' ? `● Highlighted bar = selected filter month` : 'Showing last 6 calendar months of actual spend'}
              </p>
            </div>
          );
        })()}

        {/* Treasury Diagnostics & Advisory Panel (MNC Level Upgrade) */}
        <div className="bg-gradient-to-br from-[#1A3827]/5 to-[#A3E635]/5 dark:from-slate-900 dark:to-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Treasury Diagnostics & Advisory</h3>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold uppercase tracking-wider">Enterprise-Grade Financial Advisory</p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1A3827] dark:text-[#A3E635] bg-[#EAF0EC] dark:bg-slate-800 px-2.5 py-1 rounded-full border border-[#1A3827]/10 dark:border-slate-700">MNC ANALYTICS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Cashflow Velocity */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-[#E3E8E3] dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Burn Velocity</p>
                  {daysLeft === 0 ? (
                    <span className="w-2 h-2 rounded-full bg-blue-500" title="Closed" />
                  ) : dailyAvg > safeDailyLimit ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="High speed" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Optimal speed" />
                  )}
                </div>
                <p className="text-base font-black text-[#1A3827] dark:text-slate-100">{formatINR(dailyAvg)}/day</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-2 leading-relaxed">
                  {daysLeft === 0 
                    ? "Month closed. Run-rate calculations final." 
                    : dailyAvg > safeDailyLimit 
                      ? `Pacing fast. Daily average exceeds safe run-rate limit of ${formatINR(safeDailyLimit)}/day.` 
                      : `Optimal pace. Daily average is within safe budget parameters (${formatINR(safeDailyLimit)}/day remaining).`
                  }
                </p>
              </div>
            </div>

            {/* 2. Top Expense Hotspot */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-[#E3E8E3] dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Expense Hotspot</p>
                  <span className="text-xs">🔥</span>
                </div>
                <p className="text-base font-black text-[#1A3827] dark:text-slate-100 truncate">
                  {catArr[0] ? catArr[0][0] : 'None'}
                </p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-2 leading-relaxed">
                  {catArr[0] 
                    ? `Highest allocation in ${catArr[0][0]}, consuming ${formatINR(catArr[0][1])} (${rawTotal > 0 ? Math.round((catArr[0][1] / rawTotal) * 100) : 0}% of total).`
                    : "No categories detected. Log expenses to pinpoint hotspots."
                  }
                </p>
              </div>
            </div>

            {/* 3. Compliance Rating */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-[#E3E8E3] dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">Compliance Rating</p>
                  <span className="text-xs">📊</span>
                </div>
                {(() => {
                  const usedPct = Math.round((roomOrPersonalTotal / activeLimit) * 100) || 0;
                  const compliance = Math.max(0, 100 - usedPct);
                  return (
                    <>
                      <p className="text-base font-black text-[#1A3827] dark:text-slate-100">
                        {compliance}% Available
                      </p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-2 leading-relaxed">
                        {usedPct >= 100 
                          ? "Budget limits breached. Consider reviewing allocations or raising caps." 
                          : `Room limits are compliant at ${usedPct}% utilized (${formatINR(limitRemaining)} head-room).`
                        }
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 4. Roommate settlement metric OR Personal Savings projection */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-[#E3E8E3] dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">
                    {isPersonalTab ? "Savings Indicator" : "Settlement Volume"}
                  </p>
                  <span className="text-xs">{isPersonalTab ? "💰" : "⚖️"}</span>
                </div>
                {isPersonalTab ? (
                  <>
                    <p className="text-base font-black text-[#1A3827] dark:text-slate-100">
                      {rawTotal < personalCap ? formatINR(personalCap - rawTotal) : formatINR(0)}
                    </p>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-2 leading-relaxed">
                      {rawTotal < personalCap 
                        ? `Projected surplus of ${formatINR(personalCap - rawTotal)} relative to your cap constraint.` 
                        : "Limit cap breached. Cost containment requested."
                      }
                    </p>
                  </>
                ) : (
                  (() => {
                    const totalImbalance = Object.values(computedStats.balances || {})
                      .filter(b => b > 0)
                      .reduce((sum, b) => sum + b, 0);
                    return (
                      <>
                        <p className="text-base font-black text-[#1A3827] dark:text-slate-100">
                          {formatINR(totalImbalance)}
                        </p>
                        <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-2 leading-relaxed">
                          {totalImbalance > 0 
                            ? `Imbalance identified. Settling splits will restore perfect roommate fairness.` 
                            : "Room treasury is balanced. No settlements required."
                          }
                        </p>
                      </>
                    );
                  })()
                )}
              </div>
            </div>
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
                        <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 truncate">Paid {formatINR(memberSharedPaid)} • <span className={bal > 0 ? 'text-emerald-600' : bal < 0 ? 'text-rose-500' : 'text-slate-450 dark:text-slate-500 font-bold'}>{bal > 0 ? `owed ${formatINR(bal)}` : bal < 0 ? `owes ${formatINR(Math.abs(bal))}` : 'settled'}</span></p>
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
          {!isPersonalTab && (
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors duration-300 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Fairness Score</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#A3E635] flex items-center justify-center shrink-0">
                  <span className="text-xl font-black text-[#1A3827] dark:text-slate-100">{fairnessScore}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{fairnessRating}</p>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-1">{fairnessDesc}</p>
                </div>
              </div>
            </div>
          )}

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
                      .filter(t => t.isShared && (t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname)))
                      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
                    const memberPct = monthSharedSpend > 0 ? Math.round((memberPaid / monthSharedSpend) * 100) : 0;
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
                            <p className={`text-[9px] font-semibold ${memberBal > 0 ? 'text-emerald-600' : memberBal < 0 ? 'text-rose-500' : 'text-slate-400 font-bold'}`}>
                              {memberBal > 0 ? `+${formatINR(memberBal)} owed` : memberBal < 0 ? `${formatINR(Math.abs(memberBal))} owes` : 'settled'}
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
                  <span>{selectedMonth === 'All' ? 'Accumulated budget (shared)' : 'Monthly budget (shared bills)'}</span>
                  <span>{formatINR(monthSharedSpend)} / {formatINR(activeLimit)}</span>
                </div>
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${monthSharedSpend >= activeLimit ? 'bg-rose-500' : 'bg-[#A3E635]'}`}
                    style={{ width: `${Math.min(100, Math.round((monthSharedSpend / activeLimit) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                  <span>{Math.min(100, Math.round((monthSharedSpend / activeLimit) * 100))}% used</span>
                  <span>{formatINR(Math.max(0, activeLimit - monthSharedSpend))} remaining</span>
                </div>
              </div>

              {/* Tip card */}
              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
                <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400">
                  {monthSharedSpend === 0
                    ? '✦ No shared expenses logged yet. Add your first shared expense to start tracking!'
                    : monthSharedSpend >= activeLimit
                      ? `⚠ Budget exceeded by ${formatINR(monthSharedSpend - activeLimit)}. Consider adjusting your limit in Manage Room.`
                      : `✦ Keep daily spend under ${formatINR(safeDailyLimit)} to stay within your ${formatINR(activeLimit)} budget.`
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
                  <span>{formatINR(rawTotal)} / {formatINR(activeLimit)}</span>
                </div>
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${rawTotal >= activeLimit ? 'bg-rose-500' : 'bg-[#A3E635]'}`}
                    style={{ width: `${Math.min(100, Math.round((rawTotal / activeLimit) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                  <span>{Math.min(100, Math.round((rawTotal / activeLimit) * 100))}% used</span>
                  <span>{formatINR(limitRemaining)} remaining</span>
                </div>
              </div>

              {/* Tip card */}
              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
                <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400 leading-relaxed">
                  {rawTotal === 0
                    ? '✦ No personal expenses logged this month. Keep it up!'
                    : rawTotal >= activeLimit
                      ? `⚠ Limit exceeded by ${formatINR(rawTotal - activeLimit)}. Consider increasing your limit cap on the Dashboard.`
                      : `✦ Keep daily personal spend under ${formatINR(safeDailyLimit)} to stay within your ${formatINR(activeLimit)} cap.`
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
  // PAGE: SETTLEMENT RECORD
  // ==========================================
  function renderSettlementRecords() {
    const rawSettlements = transactions.filter(t => 
      t.category === 'Payment' || 
      t.splitType === 'settlement' || 
      (t.title && t.title.startsWith('Payment:'))
    );

    // Apply filters
    const filteredSettlements = rawSettlements.filter(t => {
      const amtStr = (t.amount || 0).toString();
      const titleLower = (t.title || '').toLowerCase();
      const payerLower = (t.paidBy || '').toLowerCase();
      const query = settlementSearchQuery.trim().toLowerCase();

      // Search match
      const matchesQuery = !query || 
        titleLower.includes(query) || 
        payerLower.includes(query) || 
        amtStr.includes(query);

      // Roommate filter match
      const currentUid = auth.currentUser ? auth.currentUser.uid : '';
      let payerUid = t.paidByUid;
      if (!payerUid) {
        payerUid = t.paidBy === userNickname ? currentUid : 'roommate';
      }
      let receiverUid = '';
      if (t.splits && Array.isArray(t.splits)) {
        const receiverObj = t.splits.find(s => s.uid !== payerUid || Number(s.amount) > 0);
        if (receiverObj) receiverUid = receiverObj.uid;
      }

      let matchesRoommate = true;
      if (settlementRoommateFilter === 'me') {
        matchesRoommate = payerUid === currentUid || receiverUid === currentUid;
      } else if (settlementRoommateFilter === 'paid_by_me') {
        matchesRoommate = payerUid === currentUid;
      } else if (settlementRoommateFilter === 'received_by_me') {
        matchesRoommate = receiverUid === currentUid;
      } else if (settlementRoommateFilter !== 'all') {
        matchesRoommate = payerUid === settlementRoommateFilter || receiverUid === settlementRoommateFilter;
      }

      // Month filter match
      let matchesMonth = true;
      if (settlementMonthFilter !== 'all') {
        matchesMonth = t.date && t.date.startsWith(settlementMonthFilter);
      }

      return matchesQuery && matchesRoommate && matchesMonth;
    });

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Minimal Executive Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#061811] dark:bg-slate-900 border border-[#061811] dark:border-slate-800 p-6 sm:p-7 rounded-3xl text-white shadow-md">
          <div>
            <div className="flex items-center gap-2 text-[#A3E635] text-[10px] font-extrabold uppercase tracking-widest mb-1">
              <HandCoins className="w-3.5 h-3.5" />
              <span>ROOM DEBT AUDIT LOG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Settlement Records</h1>
            <p className="text-xs text-slate-300 dark:text-slate-400 mt-1 max-w-xl">
              Complete history of roommate payments, direct transfers, and debt settlements logged in your room.
            </p>
          </div>

          <button 
            onClick={handleSettleUp}
            className="flex items-center justify-center gap-2 bg-[#A3E635] hover:bg-[#b2f048] text-slate-950 px-5 py-2.5 rounded-xl font-extrabold transition-all duration-200 text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Settle Up Now</span>
          </button>
        </div>

        {/* Minimalist Dashboard Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-4.5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">TOTAL SETTLED</span>
              <HandCoins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#1A3827] dark:text-slate-100">
              {formatINR(computedStats.totalSettledAmount || 0)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {computedStats.settlementCount || 0} transfers logged
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-4.5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">TRANSFERS LOGGED</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#1A3827] dark:text-slate-100">
              {computedStats.settlementCount || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Room ledger transfers
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-4.5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">MY OUTGOING</span>
              <Send className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
              {formatINR(computedStats.mySettlementsPaid || 0)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Paid by you to others
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-4.5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">MY INCOMING</span>
              <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400">
              {formatINR(computedStats.mySettlementsReceived || 0)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Received by you
            </p>
          </div>
        </div>

        {/* Minimal Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-3.5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, amount, date..."
              value={settlementSearchQuery}
              onChange={(e) => setSettlementSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#061811]/30 dark:focus:ring-[#A3E635]/30 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            {settlementSearchQuery && (
              <button onClick={() => setSettlementSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={settlementRoommateFilter}
              onChange={(e) => setSettlementRoommateFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Members</option>
              <option value="me">Involving Me</option>
              <option value="paid_by_me">Paid by Me</option>
              <option value="received_by_me">Received by Me</option>
              {members.map(m => <option key={m.uid} value={m.uid}>{m.nickname}</option>)}
            </select>
            <select
              value={settlementMonthFilter}
              onChange={(e) => setSettlementMonthFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{new Date(`${m}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Settlements List */}
        {filteredSettlements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <HandCoins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Settlement Records Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {rawSettlements.length === 0
                ? "No debt settlements have been recorded in this room yet."
                : "No settlements match your current filters. Try resetting them."}
            </p>
            {rawSettlements.length === 0 && (
              <button
                onClick={handleSettleUp}
                className="mt-4 inline-flex items-center gap-2 bg-[#061811] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1A3827] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Settlement</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSettlements.map((st) => {
              const currentUid = auth.currentUser ? auth.currentUser.uid : '';
              let payerUid = st.paidByUid;
              if (!payerUid) payerUid = st.paidBy === userNickname ? currentUid : 'roommate';
              const payerMember = members.find(m => m.uid === payerUid) || { nickname: st.paidBy || 'Roommate' };

              let receiverMember = null;
              if (st.splits && Array.isArray(st.splits)) {
                const rSplit = st.splits.find(s => s.uid !== payerUid || Number(s.amount) > 0);
                if (rSplit) receiverMember = members.find(m => m.uid === rSplit.uid) || { nickname: rSplit.nickname || 'Roommate' };
              }
              if (!receiverMember && st.title && st.title.includes(' to ')) {
                const parts = st.title.replace('Payment: ', '').split(' to ');
                if (parts[1]) receiverMember = { nickname: parts[1] };
              }
              if (!receiverMember) receiverMember = { nickname: 'Roommate' };

              const isUserPayer = payerUid === currentUid;
              const isUserReceiver = receiverMember && receiverMember.uid === currentUid;

              return (
                <div
                  key={st.id}
                  className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl px-4 py-3.5 sm:px-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Transfer parties */}
                  <div className="flex items-center gap-3">
                    {/* Payer avatar */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F5F5F0] dark:bg-slate-800 text-[#1A3827] dark:text-slate-300 font-black text-xs flex items-center justify-center border border-[#E3E8E3] dark:border-slate-700">
                        {payerMember.nickname ? payerMember.nickname.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{payerMember.nickname}</p>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">PAID</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />

                    {/* Receiver avatar */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                        {receiverMember.nickname ? receiverMember.nickname.charAt(0).toUpperCase() : 'R'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{receiverMember.nickname}</p>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">RECEIVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: meta info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                      {formatTxId(st.id)}
                    </span>
                    {isUserPayer && (
                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">YOU PAID</span>
                    )}
                    {isUserReceiver && (
                      <span className="text-[9px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 px-2 py-0.5 rounded-full">YOU RECEIVED</span>
                    )}
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{st.date}</span>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatINR(st.amount)}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => { setSelectedSettlementDetail(st); setIsSettlementDetailOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        title="View Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete settlement record of ${formatINR(st.amount)}? This will recalculate room balances.`)) {
                            try {
                              const { error: delErr } = await supabase.from('transactions').delete().eq('id', st.id);
                              if (delErr) throw delErr;
                              setTransactions(prev => prev.filter(item => item.id !== st.id));
                              triggerToast('Settlement record deleted.');
                            } catch (err) {
                              console.error(err);
                              triggerToast('Failed to delete settlement record.');
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

  function renderSettlementDetailModal() {
    if (!selectedSettlementDetail) return null;
    const st = selectedSettlementDetail;

    const currentUid = auth.currentUser ? auth.currentUser.uid : '';
    let payerUid = st.paidByUid;
    if (!payerUid) payerUid = st.paidBy === userNickname ? currentUid : 'roommate';
    const payerMember = members.find(m => m.uid === payerUid) || { nickname: st.paidBy || 'Roommate' };

    let receiverMember = null;
    if (st.splits && Array.isArray(st.splits)) {
      const rSplit = st.splits.find(s => s.uid !== payerUid || Number(s.amount) > 0);
      if (rSplit) receiverMember = members.find(m => m.uid === rSplit.uid) || { nickname: rSplit.nickname || 'Roommate' };
    }
    if (!receiverMember && st.title && st.title.includes(' to ')) {
      const parts = st.title.replace('Payment: ', '').split(' to ');
      if (parts[1]) receiverMember = { nickname: parts[1] };
    }
    if (!receiverMember) receiverMember = { nickname: 'Roommate' };

    const handleCopyReceiptText = () => {
      const text = `TALLYIN SETTLEMENT RECEIPT\nRoom: ${userRoomId}\nRef: ${formatTxId(st.id)}\nDate: ${st.date} ${st.time || ''}\nPayer: ${payerMember.nickname}\nReceiver: ${receiverMember.nickname}\nAmount: ${formatINR(st.amount)}\nStatus: Verified & Settled`;
      navigator.clipboard.writeText(text);
      triggerToast('Receipt copied to clipboard.');
    };

    return (
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-xl relative overflow-hidden">

          {/* Minimal header strip */}
          <div className="bg-[#061811] dark:bg-slate-950 px-6 pt-6 pb-5 text-white">
            <button
              onClick={() => { setIsSettlementDetailOpen(false); setSelectedSettlementDetail(null); }}
              className="absolute right-4 top-4 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#A3E635] mb-1">SETTLEMENT RECEIPT</div>
            <div className="text-2xl font-black tracking-tight">{formatINR(st.amount)}</div>
            <div className="font-mono text-[10px] text-white/40 mt-1">{formatTxId(st.id)}</div>
          </div>

          {/* Transfer visual */}
          <div className="px-6 py-5 flex items-center gap-3 border-b border-[#E3E8E3] dark:border-slate-800">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm flex items-center justify-center">
                {payerMember.nickname ? payerMember.nickname.charAt(0).toUpperCase() : 'P'}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5">{payerMember.nickname}</p>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Payer</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">settled</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                {receiverMember.nickname ? receiverMember.nickname.charAt(0).toUpperCase() : 'R'}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5">{receiverMember.nickname}</p>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Receiver</span>
            </div>
          </div>

          {/* Details rows */}
          <div className="px-6 py-4 space-y-0">
            {[
              { label: 'Date', value: `${st.date}${st.time ? ' • ' + st.time : ''}` },
              { label: 'Room', value: userRoomId || 'N/A' },
              { label: 'Status', value: 'Verified & Settled' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#F1F5F9] dark:border-slate-800 last:border-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{value}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 flex gap-2.5 pt-2">
            <button
              onClick={handleCopyReceiptText}
              className="flex-1 flex items-center justify-center gap-2 bg-[#061811] dark:bg-[#A3E635] text-white dark:text-slate-950 py-2.5 rounded-xl font-bold text-xs hover:bg-[#1A3827] dark:hover:bg-[#b2f048] transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Receipt</span>
            </button>
            <button
              onClick={() => { setIsSettlementDetailOpen(false); setSelectedSettlementDetail(null); }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Close
            </button>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12291C] dark:text-slate-100 tracking-tight">Receipts gallery</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Every proof of purchase, securely archived & searchable.</p>
          </div>

          <button 
            onClick={handleTriggerUpload}
            className="flex items-center justify-center gap-2 bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 px-5 py-3 rounded-2xl font-black hover:bg-[#1A3827] dark:hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm shadow-lg shadow-emerald-950/10 cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload receipt</span>
          </button>
        </div>

        {activeReceipts.length === 0 ? (
          <div className="hud-card rounded-3xl p-12 text-center shadow-xl">
            <p className="text-xs sm:text-sm font-semibold text-[#5C6E5C] dark:text-slate-400">No receipts uploaded yet.</p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Upload roommate bill receipt files to archive them in this visual polaroid grid.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {activeReceipts.map((r) => (
              <div 
                key={r.id}
                onClick={() => {
                  setActiveReceiptZoom(r);
                  setActiveReceiptImageIndex(0);
                }}
                className={`rounded-3xl border p-3 sm:p-4 shadow-sm flex flex-col justify-between h-auto select-none transition-transform duration-300 hover:scale-102 hover:shadow-md cursor-pointer ${r.bgClass}`}
              >
                <div 
                  className={`bg-white text-slate-800 p-3 border border-slate-200/50 shadow-sm mx-auto w-full aspect-[4/5] flex flex-col justify-between transform transition-all duration-300 hover:rotate-0 hover:scale-102 relative overflow-hidden group/polaroid ${r.rotation}`}
                >
                  {(() => {
                    const images = getImages(r.imageUrl);
                    if (images.length > 0) {
                      const firstFile = images[0];
                      return (
                        <div className="w-full h-full relative overflow-hidden rounded bg-slate-50 flex flex-col">
                          <div className="w-full h-[65%] relative overflow-hidden shrink-0 flex items-center justify-center">
                            {isImageDataUrl(firstFile) ? (
                              <img 
                                src={firstFile} 
                                alt={r.title} 
                                className="w-full h-full object-cover pointer-events-none" 
                              />
                            ) : isPdfDataUrl(firstFile) ? (
                              <div className="flex flex-col items-center justify-center gap-1 w-full h-full bg-red-50">
                                <FileText className="w-8 h-8 text-red-500" />
                                <span className="text-[8px] font-black text-red-500 uppercase tracking-wider">PDF</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1 w-full h-full bg-emerald-50">
                                <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">Excel</span>
                              </div>
                            )}
                            {images.length > 1 && (
                              <div className="absolute top-1 right-1 bg-[#1A3827]/80 text-[#A3E635] text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-sm shadow-sm select-none">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{images.length} files</span>
                              </div>
                            )}
                          </div>
                          <div className="p-1 text-center font-mono flex-1 flex flex-col justify-center border-t border-slate-100">
                            <p className="text-[7px] font-black text-slate-500 tracking-wider">TALLYIN REC</p>
                            <p className="text-[9px] font-black tracking-tight text-slate-800 truncate uppercase mt-0.5">{r.title}</p>
                            <p className="text-xs font-black text-[#1A3827] mt-0.5">{formatINR(r.amount)}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
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
                      );
                    }
                  })()}
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

          {(() => {
            const images = getImages(activeReceiptZoom.imageUrl);
            if (images.length > 0) {
              const currentFile = images[activeReceiptImageIndex] || images[0];
              const isImg = isImageDataUrl(currentFile);
              const isPdf = isPdfDataUrl(currentFile);
              return (
                <div className="space-y-3">
                  <div className="w-full relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center group" style={{minHeight: '45vh'}}>
                    {isImg ? (
                      <img 
                        src={currentFile} 
                        alt={`${activeReceiptZoom.title} - File ${activeReceiptImageIndex + 1}`} 
                        className="max-w-full max-h-[45vh] object-contain rounded-lg transition-all duration-300 p-2"
                      />
                    ) : isPdf ? (
                      <div className="w-full h-full flex flex-col" style={{minHeight:'42vh'}}>
                        <iframe
                          src={currentFile}
                          title={`PDF preview - ${activeReceiptZoom.title}`}
                          className="w-full flex-1 rounded-xl border-0"
                          style={{minHeight:'38vh'}}
                        />
                        <div className="flex items-center justify-between px-2 pt-2 pb-1">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">PDF · File {activeReceiptImageIndex + 1} of {images.length}</span>
                          </div>
                          <a
                            href={currentFile}
                            download={`${activeReceiptZoom.title}_receipt_${activeReceiptImageIndex + 1}.pdf`}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-[10px] transition-all shadow"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center gap-4 py-10 px-4">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex flex-col items-center justify-center gap-1 shadow-sm">
                          <FileSpreadsheet className="w-9 h-9 text-emerald-600" />
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Excel</span>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-sm text-slate-800 dark:text-slate-100">Excel Spreadsheet</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">File {activeReceiptImageIndex + 1} of {images.length} · Open in Excel/Sheets to view</p>
                        </div>
                        <a
                          href={currentFile}
                          download={`${activeReceiptZoom.title}_receipt_${activeReceiptImageIndex + 1}.xlsx`}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Excel File
                        </a>
                      </div>
                    )}
                    
                    {images.length > 1 && (
                      <>
                        {/* Prev Button */}
                        <button
                          onClick={() => setActiveReceiptImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition-all shadow-md ${isImg ? 'opacity-0 group-hover:opacity-100' : 'opacity-80'}`}
                          title="Previous file"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        {/* Next Button */}
                        <button
                          onClick={() => setActiveReceiptImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition-all shadow-md ${isImg ? 'opacity-0 group-hover:opacity-100' : 'opacity-80'}`}
                          title="Next file"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Page number badge */}
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] font-black px-2 py-0.5 rounded-full select-none shadow">
                          {activeReceiptImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Multi-file nav dots/thumbnails */}
                  {images.length > 1 && (
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {images.map((fileItem, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveReceiptImageIndex(idx)}
                          className={`flex items-center justify-center rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                            idx === activeReceiptImageIndex
                              ? 'border-[#1A3827] dark:border-[#A3E635] w-10 h-10'
                              : 'border-slate-200 dark:border-slate-700 w-8 h-8 opacity-60 hover:opacity-90'
                          }`}
                          title={`File ${idx + 1} (${getFileLabel(fileItem)})`}
                        >
                          {isImageDataUrl(fileItem) ? (
                            <img src={fileItem} alt={`thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          ) : isPdfDataUrl(fileItem) ? (
                            <FileText className="w-4 h-4 text-red-500" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              );
            } else {
              return (
                <div className="w-full py-16 rounded-2xl border-2 border-dashed border-[#E3E8E3] dark:border-slate-850 text-center text-slate-450 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold">No receipt image file uploaded</p>
                  <p className="text-[9px] mt-1 max-w-[240px] mx-auto opacity-80">This transaction was auto-recorded. Download the text receipt details below.</p>
                </div>
              );
            }
          })()}

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
  // TRANSACTION EDIT HISTORY MODAL
  // ==========================================
  function renderEditHistoryModal() {
    if (!activeEditHistoryTx) return null;
    const parsed = parseTimeAndHistory(activeEditHistoryTx.time);
    let historyList = parsed.history || [];

    if (historyList.length === 0) {
      const matchingLogs = activityLogs.filter(log => 
        log.action === 'edit' && 
        log.details && 
        log.details.toLowerCase().includes(activeEditHistoryTx.title.toLowerCase())
      );
      
      historyList = matchingLogs.map(log => {
        return {
          editedBy: log.user_name || 'System',
          editedAt: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date(log.created_at).toLocaleDateString(),
          changes: log.details
        };
      });
    }

    // Deduplicate consecutive identical entries (same editedBy + changes)
    historyList = historyList.filter((item, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return !(prev.editedBy === item.editedBy && prev.changes === item.changes && prev.editedAt === item.editedAt);
    });

    return (
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={() => setActiveEditHistoryTx(null)}
      >
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl relative flex flex-col gap-4 text-slate-800 dark:text-slate-200 transition-colors duration-300 max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm sm:text-base text-rose-500 dark:text-rose-450 uppercase tracking-tight">Edit History</h3>
              <p className="text-[10px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">
                {activeEditHistoryTx.title} (₹{activeEditHistoryTx.amount})
              </p>
            </div>
            <button 
              onClick={() => setActiveEditHistoryTx(null)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 py-2">
            {historyList.length === 0 ? (
              <div className="text-center py-6 text-slate-450 dark:text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold">No edit logs found</p>
                <p className="text-[9px] mt-1 max-w-[240px] mx-auto opacity-80">This transaction was marked as edited, but has no stored log details.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {historyList.slice().reverse().map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2 relative shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-[#1A3827] dark:text-[#A3E635]">By: {item.editedBy || 'Unknown User'}</span>
                      <span>{item.editedAt}</span>
                    </div>
                    {item.reason && item.reason !== 'No reason provided' && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-[#5C6E5C] dark:text-slate-455">Reason:</p>
                        <p className="text-xs font-bold text-[#1A3827] dark:text-white bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1.5 pt-1.5 border-t border-dashed border-slate-100 dark:border-slate-850">
                      <p className="text-[9px] font-semibold text-[#5C6E5C] dark:text-slate-455">Changes Detected:</p>
                      <div className="space-y-1 text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50/10 dark:bg-rose-950/10 px-3 py-2 rounded-xl border border-rose-100/20 dark:border-rose-900/20 leading-relaxed">
                        {item.changes ? (
                          item.changes.split(' | ').map((change, cIdx) => (
                            <div key={cIdx} className="flex items-start gap-1">
                              <span className="text-rose-500 font-bold shrink-0">•</span>
                              <span>{change}</span>
                            </div>
                          ))
                        ) : (
                          <div>No changes detected</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-150 dark:border-slate-800">
            <button
              onClick={() => setActiveEditHistoryTx(null)}
              className="px-5 py-2 bg-[#1A3827] dark:bg-slate-800 text-white hover:opacity-90 font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 7: SHARED SHOPPING LIST
  // ==========================================
  function renderShoppingBoard() {
    const pendingItems = shoppingItems.filter(item => item.splitType === 'pending');
    
    return (
      <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12291C] dark:text-slate-100 tracking-tight">Shopping List</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">List items needed for the flat and split them in 1-click once bought.</p>
          </div>
          <button 
            onClick={() => setIsAddShoppingOpen(true)}
            className="bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black px-5 py-3 rounded-2xl text-xs hover:bg-[#1A3827] dark:hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-950/10 cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Shopping Item</span>
          </button>
        </div>

        {/* List Layout */}
        <div className="hud-card rounded-3xl p-6 shadow-xl transition-all duration-300">
          {pendingItems.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F6F8F6] dark:bg-slate-850 flex items-center justify-center mx-auto text-[#1A3827] dark:text-[#A3E635]">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#1A3827] dark:text-slate-100">All stocked up!</h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">No pending shopping items for your room.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingItems.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl bg-[#F6F8F6]/30 dark:bg-slate-950/20 hover:border-[#1A3827]/30 dark:hover:border-slate-700 transition-all group"
                >
                  <div className="space-y-1 pr-3 truncate">
                    <p className="text-xs sm:text-sm font-bold text-[#1A3827] dark:text-slate-100 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                      <span>Est: {formatINR(item.amount)}</span>
                      <span>•</span>
                      <span>Added by {item.paidBy || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openSplitShopping(item)}
                      className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Bought</span>
                    </button>
                    <button
                      onClick={() => handleDeleteShoppingItem(item)}
                      className="p-2 border border-[#E3E8E3] dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAddShoppingModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Add Shopping Item</h3>
            <button onClick={() => setIsAddShoppingOpen(false)} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSaveShoppingItem} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Toilet rolls, Dish soap"
                value={shoppingTitle}
                onChange={e => setShoppingTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Estimated Cost (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={shoppingAmount}
                onChange={e => setShoppingAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddShoppingOpen(false)}
                className="flex-1 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Add to List
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderSplitShoppingModal() {
    if (!selectedShoppingItem) return null;
    const currentUid = auth.currentUser?.uid || 'anonymous';
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">1-Click Split: {selectedShoppingItem.title}</h3>
            <button onClick={() => { setIsSplitShoppingOpen(false); setSelectedShoppingItem(null); }} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSaveSplitShopping} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Actual Amount Paid (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={splitShoppingAmount}
                onChange={e => setSplitShoppingAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-bold"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Who paid?</label>
              <select
                value={splitShoppingPayer}
                onChange={e => setSplitShoppingPayer(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-[#1A3827] dark:text-white focus:outline-none"
              >
                {members.map(m => <option key={m.uid} value={m.uid}>{m.nickname}{m.uid === currentUid ? ' (You)' : ''}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Split between roommates</label>
              <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1">
                {members.map(m => {
                  const checked = splitShoppingMembers[m.uid] !== false;
                  return (
                    <label key={m.uid} className="flex items-center gap-2 p-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl bg-[#F6F8F6]/20 dark:bg-slate-900/20 text-[10px] font-semibold text-[#1A3827] dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => setSplitShoppingMembers(prev => ({ ...prev, [m.uid]: e.target.checked }))}
                        className="w-3.5 h-3.5 accent-[#1A3827] dark:accent-[#A3E635] rounded"
                      />
                      <span className="truncate">{m.nickname}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsSplitShoppingOpen(false); setSelectedShoppingItem(null); }}
                className="flex-1 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Convert to Split
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 8: CHORES ROTATOR / ROTATION BOARD
  // ==========================================
  // ==========================================
  // PAGE 8: BILLS & RECURRING SUBSCRIPTIONS BOARD
  // ==========================================
  function renderBills() {
    const getBillStatus = (dueDateStr, isPaid) => {
      if (isPaid) return { text: 'Paid & Settled', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-[#A3E635] font-black' };
      if (!dueDateStr) return { text: 'No due date', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400' };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDateStr);
      due.setHours(0, 0, 0, 0);
      
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { text: `🚨 OVERDUE (${Math.abs(diffDays)}d late)`, color: 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 font-black border border-rose-300 dark:border-rose-800 shadow-sm animate-pulse' };
      } else if (diffDays === 0) {
        return { text: '⚡ Due Today', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 font-black border border-amber-300/60 shadow-sm animate-pulse' };
      } else if (diffDays === 1) {
        return { text: 'Due Tomorrow', color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 font-bold' };
      } else {
        return { text: `Due in ${diffDays}d`, color: 'text-[#1A3827] bg-[#F6F8F6] dark:bg-slate-800 dark:text-slate-300 font-semibold' };
      }
    };

    const getFrequencyLabel = (intervalStr) => {
      const val = String(intervalStr);
      if (val === '7') return 'Weekly';
      if (val === '14') return 'Fortnightly';
      if (val === '30') return 'Monthly';
      if (val === '60') return 'Bi-Monthly';
      if (val === '90') return 'Quarterly';
      if (val === '365') return 'Yearly';
      if (val === '0') return 'One-Time';
      return `Every ${val}d`;
    };

    const getCategoryIcon = (cat) => {
      const lower = String(cat || '').toLowerCase();
      if (lower.includes('wifi') || lower.includes('internet') || lower.includes('broadband') || lower.includes('utilities')) return '📶';
      if (lower.includes('electric') || lower.includes('power')) return '⚡';
      if (lower.includes('water')) return '💧';
      if (lower.includes('rent') || lower.includes('flat')) return '🏠';
      if (lower.includes('movie') || lower.includes('ott') || lower.includes('netflix') || lower.includes('entertainment')) return '📺';
      if (lower.includes('maid') || lower.includes('clean') || lower.includes('cook') || lower.includes('services')) return '🧹';
      if (lower.includes('gas') || lower.includes('lpg') || lower.includes('fuel')) return '⛽';
      return '📄';
    };

    const totalMonthlyAmount = billsList.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const urgentCount = billsList.filter(b => {
      if (b.split === 'paid') return false;
      if (!b.date) return false;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const due = new Date(b.date); due.setHours(0, 0, 0, 0);
      return due.getTime() <= today.getTime();
    }).length;

    return (
      <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12291C] dark:text-slate-100 tracking-tight">Bills & Subscriptions</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Track upcoming flat bills, OTT subscriptions, and log payments straight into room expenses.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsQuickBillOpen(true)}
              className="bg-emerald-600 dark:bg-emerald-500 text-white font-black px-4 py-3 rounded-2xl text-xs hover:bg-emerald-700 dark:hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>Create Itemized Bill / Receipt</span>
            </button>
            <button 
              onClick={() => {
                if (members.length > 0) {
                  setBillAssignee(members[0].uid);
                }
                setIsAddBillOpen(true);
              }}
              className="bg-[#0F291E] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black px-5 py-3 rounded-2xl text-xs hover:bg-[#1A3827] dark:hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-950/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Recurring Bill</span>
            </button>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#5C6E5C] dark:text-slate-400">Tracked Monthly Bills</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(totalMonthlyAmount)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#5C6E5C] dark:text-slate-400">Action Needed (Due/Overdue)</p>
            <p className={`text-xl sm:text-2xl font-black ${urgentCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#1A3827] dark:text-slate-100'}`}>
              {urgentCount} {urgentCount === 1 ? 'Bill' : 'Bills'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#5C6E5C] dark:text-slate-400">Active Bill Reminders</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">{billsList.length} Total</p>
          </div>
        </div>

        {/* List Layout */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          {billsList.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F6F8F6] dark:bg-slate-850 flex items-center justify-center mx-auto text-[#1A3827] dark:text-[#A3E635]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#1A3827] dark:text-slate-100">No bills added yet</h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">Add WiFi, Rent, Electricity, or OTT subscriptions to stay on top of flat due dates.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {billsList.map(bill => {
                const assigneeMember = members.find(m => m.uid === bill.splitType);
                const isPaid = bill.split === 'paid' || bill.split?.endsWith('|paid');
                const rawCategory = bill.splits?.[0]?.category || (bill.split?.includes('|') ? bill.split.split('|')[0] : bill.split) || bill.imageUrl || bill.category;
                const status = getBillStatus(bill.date, isPaid);
                const freqText = getFrequencyLabel(bill.time);
                const iconEmoji = getCategoryIcon(rawCategory || bill.title);

                return (
                  <div 
                    key={bill.id}
                    className="flex flex-col justify-between p-5 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl bg-[#F6F8F6]/20 dark:bg-slate-950/20 hover:border-[#1A3827]/30 dark:hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-lg">{iconEmoji}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black ${status.color}`}>
                            {status.text}
                          </span>
                          {!bill.isShared && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">
                              🔒 Private
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-extrabold text-[#5C6E5C] dark:text-slate-400 bg-[#EAF0EC] dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {freqText}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-[#1A3827] dark:text-slate-100 line-clamp-1 leading-snug">{bill.title}</h3>
                        <p className="text-base font-black text-[#1A3827] dark:text-[#A3E635] mt-0.5">
                          {formatINR(Number(bill.amount) || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F6F8F6] dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {assigneeMember?.photo_url ? (
                          <img 
                            src={assigneeMember.photo_url} 
                            alt={assigneeMember.nickname}
                            className="w-6 h-6 rounded-full object-cover border border-white dark:border-slate-850"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-[10px] flex items-center justify-center border border-white dark:border-slate-850">
                            {assigneeMember?.nickname.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="leading-tight">
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">Assigned Payer</p>
                          <p className="text-[11px] text-[#1A3827] dark:text-slate-200 font-bold truncate max-w-[95px]">
                            {assigneeMember?.nickname || 'Me'} {bill.isShared ? '(50/50)' : '(🔒 Private)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handlePayAndLogBill(bill)}
                          className="px-2.5 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl hover:opacity-90 active:scale-95 transition-all text-[10px] font-extrabold flex items-center gap-1 shadow-sm"
                          title="Pay and log expense directly to Room Ledger"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Pay & Log</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill)}
                          className="p-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl transition-all"
                          title="Delete Bill Reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAddBillModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Add Bill Reminder</h3>
            <button onClick={() => setIsAddBillOpen(false)} className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSaveBill} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Bill Name</label>
              <input
                type="text"
                required
                placeholder="e.g. WiFi Fiber Broadband, Electricity"
                value={billTitle}
                onChange={e => setBillTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Expected Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 999"
                  value={billAmount}
                  onChange={e => setBillAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Category</label>
                <select
                  value={billCategory}
                  onChange={e => setBillCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-[#1A3827] dark:text-white focus:outline-none font-semibold"
                >
                  <option value="Utilities">📶 Utilities / WiFi</option>
                  <option value="Electricity">⚡ Electricity</option>
                  <option value="Rent">🏠 House Rent</option>
                  <option value="Entertainment">📺 OTT / Streaming</option>
                  <option value="Services">🧹 Maid / Services</option>
                  <option value="Food">🍕 Mess / Tiffin</option>
                  <option value="Shopping">🛍️ Shopping / Supplies</option>
                  <option value="Other">📄 Other Bill</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Assigned Payer (Who pays vendor)</label>
                <select
                  value={billAssignee}
                  onChange={e => setBillAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-[#1A3827] dark:text-white focus:outline-none"
                >
                  {members.map(m => <option key={m.uid} value={m.uid}>{m.nickname}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Frequency</label>
                <select
                  value={billInterval}
                  onChange={e => setBillInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-[#1A3827] dark:text-white focus:outline-none font-semibold"
                >
                  <option value="30">Monthly (30 days)</option>
                  <option value="7">Weekly (7 days)</option>
                  <option value="14">Fortnightly (14 days)</option>
                  <option value="60">Bi-Monthly (60 days)</option>
                  <option value="90">Quarterly (90 days)</option>
                  <option value="365">Yearly (365 days)</option>
                  <option value="0">One-Time Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Next Due Date</label>
              <input
                type="date"
                required
                value={billDueDate}
                onChange={e => setBillDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950 font-semibold cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Bill Privacy & Sharing</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillIsShared(true)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    billIsShared
                      ? 'border-[#1A3827] bg-[#EAF0EC] dark:bg-slate-800 dark:border-[#A3E635] text-[#1A3827] dark:text-slate-100 font-bold'
                      : 'border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs font-black">👥 Shared Bill</p>
                  <p className="text-[9px] opacity-75 mt-0.5">Visible to room, split 50/50 when logged</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBillIsShared(false)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    !billIsShared
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-400 text-amber-900 dark:text-amber-300 font-bold'
                      : 'border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs font-black">🔒 Private Bill</p>
                  <p className="text-[9px] opacity-75 mt-0.5">Hidden from room, visible ONLY to you</p>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddBillOpen(false)}
                className="flex-1 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Save Bill
              </button>
            </div>
          </form>
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12291C] dark:text-slate-100 tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Configure your profile, active room workspace, themes, and notifications.</p>
        </div>

        {/* Stacked Cards */}
        <div className="space-y-6">
          
          {/* Your Profile */}
          <div className="hud-card rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2EAE3]/60 dark:border-[#1F2830]">
              <h3 className="font-extrabold text-[#12291C] dark:text-slate-100 text-sm sm:text-base tracking-tight">
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

            {/* Unique Access Code */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3 border-t border-[#F6F8F6] dark:border-slate-800 mt-2">
              <div className="flex-1 w-full text-left">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Unique Access Code</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">Use this unique code to instantly log in to this account on other devices.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold bg-[#F6F8F6] dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-[#E3E8E3]/50 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] tracking-wide select-all">
                  {auth.currentUser?.loginCode || 'Generating...'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(auth.currentUser?.loginCode || '');
                    triggerToast('Access code copied!');
                  }}
                  className="p-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
                  title="Copy Access Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
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
                <span className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline">
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
            <div className="flex flex-col gap-4 py-3 border-t border-[#F6F8F6] dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Export Room Ledger</p>
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Download full transaction logs for manual backup.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => exportToCSV()}
                    className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                    title="Export all transactions in CSV"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => {
                      const month = getLocalMonthStr();
                      const monthTxs = transactions.filter(t => t.date && t.date.startsWith(month) && t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__' && t.category !== '__SHOPPING__' && t.category !== '__CHORE__' && t.category !== '__DELETE_PROPOSAL__' && t.category !== 'Payment');
                      const total = monthTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
                      const categories = {};
                      monthTxs.forEach(t => { categories[t.category || 'Other'] = (categories[t.category || 'Other'] || 0) + Number(t.amount || 0); });
                      const rows = [
                        ['Tallyin Monthly Summary'],
                        ['Room', roomName],
                        ['Month', month],
                        ['Total Spend', total],
                        [''],
                        ['Category', 'Amount (INR)'],
                        ...Object.entries(categories).sort(([,a],[,b]) => b - a).map(([c, a]) => [c, a]),
                        [''],
                        ['Date', 'Title', 'Category', 'Amount', 'Paid By'],
                        ...monthTxs.map(t => [t.date, t.title, t.category, t.amount, t.paidBy])
                      ];
                      const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `tallyin_${month}_summary.csv`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      triggerToast('Monthly summary CSV downloaded!');
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                    title="Export Monthly Summary CSV"
                  >
                    Monthly CSV
                  </button>
                  <button 
                    onClick={() => exportToExcel()}
                    className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                    title="Export styled Excel spreadsheet"
                  >
                    Excel
                  </button>
                  <button 
                    onClick={() => exportToPDF()}
                    className="px-3 py-1.5 bg-[#1A3827] dark:bg-slate-800 text-white dark:text-slate-100 font-bold text-[10px] rounded-lg transition-all hover:opacity-90 cursor-pointer"
                    title="Open styled print PDF statement"
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* Email Statements */}
              <div className="flex flex-col gap-3 pt-3 border-t border-[#F6F8F6] dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Email Monthly Statements (CSV, Excel & PDF)</p>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">
                    Send Room Ledger to everyone, and distribute Personal statements to each roommate individually.
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => emailAllStatements()}
                    disabled={emailingType !== null}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#A3E635] hover:bg-[#BEF264] text-[#1A3827] disabled:opacity-50 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-[#84CC16]"
                    title="Send Room Shared Ledger to everyone, and distribute Personal statements to individuals"
                  >
                    {emailingType === 'all' ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Emailing All Statements...
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Email Monthly Statements
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          {/* Email Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
                  Email Notifications
                </h3>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5 font-medium">
                  Send real-time alerts when roommate expenses are added or updated.
                </p>
              </div>
              <button 
                onClick={() => {
                  const newMethod = notificationMethod === 'tallyin' ? 'none' : 'tallyin';
                  setNotificationMethod(newMethod);
                  localStorage.setItem('notificationMethod', newMethod);
                  triggerToast(newMethod === 'tallyin' ? 'Email alerts enabled!' : 'Email alerts disabled.');
                }}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-200 cursor-pointer shrink-0 ${
                  notificationMethod === 'tallyin' ? 'bg-[#A3E635]' : 'bg-[#E3E8E3] dark:bg-slate-800'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    notificationMethod === 'tallyin' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {notificationMethod === 'tallyin' && (
              <div className="space-y-4 pt-4 border-t border-[#F6F8F6] dark:border-slate-800 animate-fade-in">
                <div className="bg-emerald-50/50 dark:bg-[#1e2d24] border border-emerald-100 dark:border-[#2f4638] rounded-2xl p-3 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold space-y-1">
                  <p>✨ Centralized Mailer Active</p>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">
                    Alerts are sent automatically to all roommates' Google Sign-in email addresses. No personal setup or inputs required!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Browser Push Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Browser Push Notifications
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Enable Push Alerts</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">Receive browser notifications for new expenses.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={pushNotificationsEnabled}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      if (!('Notification' in window)) {
                        triggerToast('Browser notifications are not supported in this browser.');
                        return;
                      }
                      const permission = await Notification.requestPermission();
                      if (permission === 'granted') {
                        setPushNotificationsEnabled(true);
                        localStorage.setItem('pushNotificationsEnabled', 'true');
                        triggerToast('Browser push notifications enabled!');
                        try {
                          new Notification("Tallyin Notifications Active", {
                            body: "You'll be notified of roommate activity here.",
                            icon: logoIcon || '/favicon.ico'
                          });
                        } catch (err) {
                          console.warn(err);
                        }
                      } else {
                        triggerToast('Notification permission denied.');
                        setPushNotificationsEnabled(false);
                        localStorage.setItem('pushNotificationsEnabled', 'false');
                      }
                    } else {
                      setPushNotificationsEnabled(false);
                      localStorage.setItem('pushNotificationsEnabled', 'false');
                      triggerToast('Browser push notifications disabled.');
                    }
                  }}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#A3E635]"></div>
              </label>
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
                onClick={async () => {
                  if (confirm("Leave this room space? You'll be redirected back to the onboarding room setup.")) {
                    setUserRoomId(null);
                    setHasConfirmedRoom(false);
                    setTransactions([]);
                    setReceipts([]);
                    setActivityLogs([]);
                    localStorage.removeItem('userRoomId');
                    if (user) {
                      try {
                        await supabase
                          .from('users')
                          .upsert({
                            uid: user.id,
                            room_id: null,
                            updated_at: new Date().toISOString()
                          }, { onConflict: 'uid' });
                      } catch (err) {
                        console.error('Error leaving room in database:', err);
                      }
                    }
                    triggerToast("Left room workspace.");
                  }
                }}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
              >
                Leave room
              </button>
            </div>

            {/* Delete Room Space — Host Only */}
            {userRoomId && user && roomCreatedBy === user.id && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete room space</span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">
                    Permanently delete this room space ({userRoomId}) and clear all transactions, receipts, and member links. Automatic JSON backup will download.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (members.length <= 1) {
                      handleDeleteRoom(false);
                    } else {
                      handleProposeDeleteRoom();
                    }
                  }}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 shrink-0 w-full sm:w-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{members.length <= 1 ? "Delete room" : "Propose Deletion"}</span>
                </button>
              </div>
            )}

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
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                  <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-[#1A3827] dark:text-slate-305 break-all select-all">
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
        // Filter transactions:
        // 1. Exclude system categories
        // 2. Filter by selectedMonth if not 'All'
        const filteredTx = transactions.filter(t => {
          if (t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__' || t.category === '__SHOPPING__' || t.category === '__BILL__' || t.category === '__CHORE__' || t.category === '__DELETE_PROPOSAL__' || t.category === 'Payment') return false;
          return selectedMonth === 'All' || (t.date && t.date.startsWith(selectedMonth));
        });

        const totalSpendVal = filteredTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const avgTxValue = filteredTx.length > 0 ? Math.round(totalSpendVal / filteredTx.length) : 0;

        // Busiest day analysis
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const daysCount = {};
        filteredTx.forEach(t => {
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
        filteredTx.forEach(t => {
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
            const paid = filteredTx
              .filter(t => t.paidByUid === m.uid || (!t.paidByUid && t.paidBy === m.nickname))
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            if (paid > maxPaid) {
              maxPaid = paid;
              topSpender = { nickname: m.nickname, paid, pct: Math.round((paid / totalSpendVal) * 100) };
            }
          });
        }

        // Settlements simplification computed just on the filtered transactions (month-wise)
        const modalBalances = {};
        const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
        
        // Initialize balances for all current members
        members.forEach(m => {
          modalBalances[m.uid] = 0;
        });
        if (members.length === 0) {
          modalBalances[currentUid] = 0;
          modalBalances['roommate'] = 0;
        }

        filteredTx.forEach(t => {
          const amount = Number(t.amount) || 0;
          const isPayment = t.category === 'Payment';
          
          // Determine payer UID
          let payerUid = t.paidByUid;
          if (!payerUid) {
            const isSelf = t.paidBy === userNickname;
            payerUid = isSelf ? currentUid : 'roommate';
          }

          // Add paid amount to payer's balance
          if (modalBalances[payerUid] !== undefined) {
            modalBalances[payerUid] += amount;
          } else {
            modalBalances[payerUid] = amount;
          }

          // Subtract split shares from everyone
          if (t.splits && Array.isArray(t.splits)) {
            t.splits.forEach(split => {
              let splitUid = split.uid;
              if (!splitUid) {
                const isSelf = split.nickname === userNickname || split.nickname === 'Alex';
                splitUid = isSelf ? currentUid : 'roommate';
              }
              if (modalBalances[splitUid] !== undefined) {
                modalBalances[splitUid] -= Number(split.amount) || 0;
              } else {
                modalBalances[splitUid] = -(Number(split.amount) || 0);
              }
            });
          } else {
            // Legacy splits fallback (50/50 shared vs 100% personal)
            if (t.isShared) {
              const halfShare = amount / 2;
              modalBalances[currentUid] -= halfShare;
              const roommateUid = members.find(m => m.uid !== currentUid)?.uid || 'roommate';
              if (modalBalances[roommateUid] !== undefined) {
                modalBalances[roommateUid] -= halfShare;
              } else {
                modalBalances[roommateUid] = -halfShare;
              }
            } else {
              modalBalances[payerUid] -= amount;
            }
          }
        });

        const debtors = [];
        const creditors = [];
        members.forEach(m => {
          const bal = modalBalances[m.uid] || 0;
          const roundedBal = Math.round(bal * 100) / 100;
          if (roundedBal < -0.05) {
            debtors.push({ uid: m.uid, nickname: m.nickname, amount: -roundedBal });
          } else if (roundedBal > 0.05) {
            creditors.push({ uid: m.uid, nickname: m.nickname, amount: roundedBal });
          }
        });

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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fade-in">
            <div className="bg-slate-900 border border-amber-500/20 dark:border-amber-500/30 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative max-h-[92vh] sm:max-h-[90vh] flex flex-col transition-colors duration-300 text-slate-100">
              
              {/* Modal Header */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center rotate-45">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 -rotate-45" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] sm:text-[9px] tracking-widest font-black uppercase text-amber-500 block">TALLYIN DIAMOND</span>
                    <h2 className="font-extrabold text-sm sm:text-lg text-white mt-0.5">VIP Room Insights</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDiamondModalOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:bg-slate-850 hover:text-white transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-3.5 sm:space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
                
                {/* 0. Month Filter / Selected Period Selector */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-2.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#94a3b8] dark:text-slate-300 uppercase tracking-wider">Analysis Period</span>
                  </div>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none text-amber-400 cursor-pointer hover:border-amber-500/30 transition-colors"
                  >
                    <option value="All">All Time (Overall)</option>
                    {availableMonths.map((m) => {
                      const [year, month] = m.split('-');
                      const dateObj = new Date(Number(year), Number(month) - 1, 1);
                      const monthName = dateObj.toLocaleString('default', { month: 'short' });
                      return (
                        <option key={m} value={m}>
                          {monthName} {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {filteredTx.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 space-y-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">No data for this period</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
                      Add some transaction records or invite roommates to generate Diamond VIP financial summaries and AI observations.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 1. Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
                        <span className="text-xs sm:text-base font-black text-amber-400 block truncate" title={formatINR(totalSpendVal)}>{formatINR(totalSpendVal)}</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-500 block truncate">Shared + Personal</span>
                      </div>
                      
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Busiest Day</span>
                        <span className="text-xs sm:text-base font-black text-white block truncate" title={busiestDay}>{busiestDay}</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-500 block truncate">Highest frequency</span>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Bill Size</span>
                        <span className="text-xs sm:text-base font-black text-white block truncate" title={formatINR(avgTxValue)}>{formatINR(avgTxValue)}</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-500 block truncate">Per transaction</span>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Top Spender</span>
                        <span className="text-xs sm:text-base font-black text-emerald-450 block truncate" title={topSpender ? `${topSpender.nickname} paid ${formatINR(topSpender.paid)}` : ''}>
                          {topSpender ? topSpender.nickname : 'N/A'}
                        </span>
                        <span className="text-[8px] sm:text-[9px] text-slate-500 block truncate">
                          {topSpender ? `Covered ${topSpender.pct}%` : 'No members'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Simplified settlements */}
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 sm:p-5 space-y-2.5 sm:space-y-3">
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Debt Settlement Plan</h4>
                      {settlements.length === 0 ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-[11px] sm:text-xs font-semibold py-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0"></div>
                          <span>All settled up! No roommate payments are currently outstanding.</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5 sm:space-y-3">
                          {settlements.map((s, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2 border-b border-slate-850 last:border-b-0 gap-1.5 sm:gap-0 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                                <span className="text-[11px] sm:text-xs font-bold text-rose-400 truncate max-w-[90px] sm:max-w-[120px]" title={s.from}>{s.from}</span>
                                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
                                <span className="text-[11px] sm:text-xs font-bold text-emerald-400 truncate max-w-[90px] sm:max-w-[120px]" title={s.to}>{s.to}</span>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                                <span className="text-[11px] sm:text-xs font-black text-white">{formatINR(s.amount)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickSettle(s.fromUid, s.toUid, s.amount)}
                                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-lg transition-all shadow-sm"
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
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4">
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Category Breakdown</h4>
                      <div className="space-y-2.5 sm:space-y-3">
                        {categoryBreakdown.map(({ category, amount }) => {
                          const pct = totalSpendVal > 0 ? Math.round((amount / totalSpendVal) * 100) : 0;
                          return (
                            <div key={category} className="space-y-1 sm:space-y-1.5">
                              <div className="flex justify-between items-center text-[11px] sm:text-xs">
                                <span className="font-semibold text-slate-205 truncate max-w-[150px] sm:max-w-[200px]" title={category}>{category}</span>
                                <span className="font-bold text-slate-400 shrink-0">{formatINR(amount)} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-900 h-1.5 sm:h-2 rounded-full overflow-hidden">
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
                    <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 space-y-2.5 sm:space-y-3 relative overflow-hidden">
                      <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                      
                      <div className="flex items-center gap-2 text-amber-400">
                        <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Smart Roommate Insights</h4>
                      </div>
                      
                      <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-slate-300 leading-relaxed list-disc list-inside">
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
                <div className="text-center py-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full">
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
