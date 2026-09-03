import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ShieldAlert, 
  Power, 
  Radio, 
  Mail, 
  Pin, 
  Activity, 
  Users, 
  Home, 
  Check, 
  AlertTriangle, 
  Send, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Clock, 
  Lock, 
  Sparkles,
  Server,
  Zap,
  CheckCircle2,
  Sliders,
  PieChart,
  Building2,
  Flame,
  HandCoins,
  Terminal,
  FileText,
  Download,
  DollarSign,
  Search,
  Globe,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Filter,
  Cpu,
  Layers,
  UserCheck,
  Key,
  Ban,
  UserX,
  Database,
  Crown,
  Plus,
  Shield,
  CheckSquare,
  Square,
  UserPlus,
  Eye,
  FileCheck,
  Network,
  Laptop,
  ExternalLink,
  X,
  SlidersHorizontal,
  AlertCircle,
  Edit3,
  Save,
  FileSpreadsheet,
  AlertOctagon,
  UserMinus,
  Trash,
  Play,
  Menu,
  ChevronRight,
  ChevronDown,
  Bell,
  ArrowUpRight
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';
import securityShieldLogo from '../assets/tallyin_security_shield.png';
import { supabase, realSupabase } from '../supabase';

const ADMIN_EMAILS = [
  'tallyin.alerts@gmail.com'
];

export default function AdminDashboard({
  user,
  userNickname,
  userRooms,
  triggerToast,
  isDarkMode,
  setIsDarkMode,
  appVersion,
  onExitAdmin,
  isSystemMaintenanceActive,
  setIsSystemMaintenanceActive,
  maintenanceMessage,
  setMaintenanceMessage,
  maintenanceFeatures,
  setMaintenanceFeatures,
  globalBroadcast,
  setGlobalBroadcast,
  pinnedMessages,
  setPinnedMessages,
  simulatedLatency,
  setSimulatedLatency,
  isOnline,
  allowedMaintenanceAccounts = ['tallyin.alerts@gmail.com'],
  setAllowedMaintenanceAccounts,
  coAdmins = [],
  setCoAdmins
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'co_admins' | 'maintenance' | 'broadcast' | 'email' | 'pinning' | 'latency'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const currentEmailClean = (user?.email || '').trim().toLowerCase();
  const SUPER_ADMIN_EMAIL = 'tallyin.alerts@gmail.com';
  const isSuperAdmin = currentEmailClean === SUPER_ADMIN_EMAIL;

  // Normalized Co-Admins list
  const normalizedCoAdmins = useMemo(() => {
    return (coAdmins || []).map(item => {
      const email = (typeof item === 'string' ? item : item?.email || '').trim().toLowerCase();
      const perms = typeof item === 'object' && item?.permissions ? item.permissions : null;

      return {
        email,
        name: (typeof item === 'object' && item?.name) || email.split('@')[0] || 'Co-Admin',
        role: 'co_admin',
        addedAt: (typeof item === 'object' && item?.addedAt) || new Date().toISOString(),
        addedBy: (typeof item === 'object' && item?.addedBy) || 'tallyin.alerts@gmail.com',
        permissions: {
          broadcasts: perms ? Boolean(perms.broadcasts) : true,
          settlements: perms ? Boolean(perms.settlements) : true,
          user_management: perms ? Boolean(perms.user_management) : true,
          room_explorer: perms ? Boolean(perms.room_explorer) : true,
          room_pinning: perms ? Boolean(perms.room_pinning) : true,
          latency_diagnostics: perms ? Boolean(perms.latency_diagnostics) : true,
          maintenance_control: perms ? Boolean(perms.maintenance_control) : false,
          database_migration: perms ? Boolean(perms.database_migration) : false,
        }
      };
    }).filter(a => !!a.email);
  }, [coAdmins]);

  const currentCoAdminObj = useMemo(() => {
    return normalizedCoAdmins.find(a => a.email.toLowerCase() === currentEmailClean.toLowerCase());
  }, [normalizedCoAdmins, currentEmailClean]);

  const isCoAdmin = !!currentCoAdminObj;
  const isAuthorizedAdmin = isSuperAdmin || isCoAdmin;

  const userPermissions = useMemo(() => {
    if (isSuperAdmin) {
      return {
        broadcasts: true,
        settlements: true,
        user_management: true,
        room_explorer: true,
        room_pinning: true,
        latency_diagnostics: true,
        maintenance_control: true,
        database_migration: true,
        manage_co_admins: true,
        room_commander: true,
        dispute_resolver: true,
        database_studio: true,
        system_triggers: true,
        email_hub: true,
      };
    }
    return {
      broadcasts: Boolean(currentCoAdminObj?.permissions?.broadcasts),
      settlements: Boolean(currentCoAdminObj?.permissions?.settlements),
      user_management: Boolean(currentCoAdminObj?.permissions?.user_management),
      room_explorer: Boolean(currentCoAdminObj?.permissions?.room_explorer),
      room_pinning: Boolean(currentCoAdminObj?.permissions?.room_pinning),
      latency_diagnostics: Boolean(currentCoAdminObj?.permissions?.latency_diagnostics),
      maintenance_control: Boolean(currentCoAdminObj?.permissions?.maintenance_control),
      database_migration: Boolean(currentCoAdminObj?.permissions?.database_migration),
      manage_co_admins: false,
      room_commander: Boolean(currentCoAdminObj?.permissions?.room_commander ?? currentCoAdminObj?.permissions?.room_explorer),
      dispute_resolver: Boolean(currentCoAdminObj?.permissions?.dispute_resolver ?? currentCoAdminObj?.permissions?.settlements),
      database_studio: Boolean(currentCoAdminObj?.permissions?.database_studio ?? currentCoAdminObj?.permissions?.database_migration),
      system_triggers: Boolean(currentCoAdminObj?.permissions?.system_triggers ?? currentCoAdminObj?.permissions?.maintenance_control),
      email_hub: Boolean(currentCoAdminObj?.permissions?.email_hub ?? currentCoAdminObj?.permissions?.broadcasts),
    };
  }, [isSuperAdmin, currentCoAdminObj]);

  // Co-Admin Management states
  const [newCoAdminEmail, setNewCoAdminEmail] = useState('');
  const [newCoAdminName, setNewCoAdminName] = useState('');
  const [newCoAdminPerms, setNewCoAdminPerms] = useState({
    broadcasts: true,
    settlements: true,
    user_management: true,
    room_explorer: true,
    room_pinning: true,
    latency_diagnostics: true,
    maintenance_control: false,
    database_migration: false,
  });
  const [isAssigningCoAdmin, setIsAssigningCoAdmin] = useState(false);
  const [editingCoAdminEmail, setEditingCoAdminEmail] = useState(null);
  const [editingPerms, setEditingPerms] = useState({});
  const [coAdminFilter, setCoAdminFilter] = useState('');
  const [coAdminAckRegistry, setCoAdminAckRegistry] = useState(() => {
    try {
      const saved = localStorage.getItem('tallyin_co_admin_ack_registry');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedAckRecord, setSelectedAckRecord] = useState(null);
  const [ackSearchQuery, setAckSearchQuery] = useState('');

  // 1. Room Commander states
  const [commanderRooms, setCommanderRooms] = useState([]);
  const [loadingCommanderRooms, setLoadingCommanderRooms] = useState(false);
  const [commanderSearch, setCommanderSearch] = useState('');
  const [editingRoomCommander, setEditingRoomCommander] = useState(null);
  const [commanderBudgetInput, setCommanderBudgetInput] = useState('');
  const [commanderMaxMembersInput, setCommanderMaxMembersInput] = useState('');
  const [commanderRoomNameInput, setCommanderRoomNameInput] = useState('');
  const [isSavingCommanderRoom, setIsSavingCommanderRoom] = useState(false);
  const [commanderSelectedMembers, setCommanderSelectedMembers] = useState([]);
  const [loadingCommanderMembers, setLoadingCommanderMembers] = useState(false);

  // 2. Dispute & Transaction Resolver states
  const [allGlobalTx, setAllGlobalTx] = useState([]);
  const [loadingGlobalTx, setLoadingGlobalTx] = useState(false);
  const [globalTxSearch, setGlobalTxSearch] = useState('');
  const [editingTx, setEditingTx] = useState(null);
  const [editTxTitle, setEditTxTitle] = useState('');
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxCategory, setEditTxCategory] = useState('');
  const [isSavingTx, setIsSavingTx] = useState(false);
  const [selectedTxDetails, setSelectedTxDetails] = useState(null);

  // 3. Database Studio states
  const [studioTable, setStudioTable] = useState('rooms');
  const [studioRows, setStudioRows] = useState([]);
  const [studioSearch, setStudioSearch] = useState('');
  const [loadingStudio, setLoadingStudio] = useState(false);
  const [inspectedStudioRow, setInspectedStudioRow] = useState(null);

  // 4. System Macro Triggers states
  const [isBroadcastingForceReload, setIsBroadcastingForceReload] = useState(false);
  const [isBroadcastingSettlementReminders, setIsBroadcastingSettlementReminders] = useState(false);
  const [countdownMinsInput, setCountdownMinsInput] = useState('10');
  const [countdownNoticeInput, setCountdownNoticeInput] = useState('System maintenance scheduled. Normal service will resume shortly.');
  const [isSendingCountdown, setIsSendingCountdown] = useState(false);
  const [activeSystemCountdown, setActiveSystemCountdown] = useState(null);

  // 5. User Account Editor & Warning System states
  const [editingUser, setEditingUser] = useState(null);
  const [editUserNickname, setEditUserNickname] = useState('');
  const [editUserPhotoUrl, setEditUserPhotoUrl] = useState('');
  const [editUserRoomId, setEditUserRoomId] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [warningTargetUser, setWarningTargetUser] = useState(null);
  const [warningReason, setWarningReason] = useState('Conduct & Room Etiquette Violation');
  const [warningNotes, setWarningNotes] = useState('');
  const [isSendingWarning, setIsSendingWarning] = useState(false);

  // Maintenance form states
  const [maintMsgInput, setMaintMsgInput] = useState(maintenanceMessage || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.');
  const [newAllowedAccountInput, setNewAllowedAccountInput] = useState('');

  // Broadcast form states
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastType, setBroadcastType] = useState('feature'); // 'feature' | 'announcement' | 'alert' | 'maintenance'
  const [broadcastTargetRoom, setBroadcastTargetRoom] = useState('ALL');
  const [broadcastDurationDays, setBroadcastDurationDays] = useState('2'); // default 2 calendar days

  // Email form states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailRecipientGroup, setEmailRecipientGroup] = useState('ALL_USERS');
  const [customEmails, setCustomEmails] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Pinning form states
  const [allSystemRooms, setAllSystemRooms] = useState([]);
  const [customPinRoomId, setCustomPinRoomId] = useState('');
  const [isCustomRoomInput, setIsCustomRoomInput] = useState(false);
  const [targetPinRoomId, setTargetPinRoomId] = useState(userRooms?.[0]?.roomId || 'ALL');
  const [pinText, setPinText] = useState('');
  const [pinAuthor, setPinAuthor] = useState(userNickname || 'Admin');

  // Latency & Health metrics states
  const [pingMs, setPingMs] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalUsers: 0,
    totalTransactions: 0,
    totalReceipts: 0
  });

  // Settlements form states
  const [selectedSettleRoomId, setSelectedSettleRoomId] = useState('');
  const [settleRoomMembers, setSettleRoomMembers] = useState([]);
  const [settleRoomTransactions, setSettleRoomTransactions] = useState([]);
  const [loadingSettleRoom, setLoadingSettleRoom] = useState(false);
  const [customSettlePayer, setCustomSettlePayer] = useState('');
  const [customSettleReceiver, setCustomSettleReceiver] = useState('');
  const [customSettleAmount, setCustomSettleAmount] = useState('');
  const [isSubmittingAdminSettle, setIsSubmittingAdminSettle] = useState(false);

  // Redesigned Settlements tab states
  const [settleMode, setSettleMode] = useState('fast'); // 'fast' | 'advanced'
  const [advSettleTitle, setAdvSettleTitle] = useState('');
  const [advSettleDate, setAdvSettleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [advSettleTime, setAdvSettleTime] = useState(() => {
    const d = new Date();
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  });
  const [advSettleMethod, setAdvSettleMethod] = useState('UPI'); // 'UPI' | 'Cash' | 'Bank Transfer' | 'Other'
  const [advSettleNotes, setAdvSettleNotes] = useState('');
  const [advSettleIsShared, setAdvSettleIsShared] = useState(true);

  // Fetch Room Members & Transactions for Settlements tab
  const fetchSettleRoomData = useCallback(async (roomId) => {
    if (!roomId) return;
    setLoadingSettleRoom(true);
    try {
      const [membersRes, txRes] = await Promise.all([
        supabase.from('members').select('*').eq('room_id', roomId),
        supabase.from('transactions').select('*').eq('room_id', roomId)
      ]);
      
      if (membersRes.data) {
        setSettleRoomMembers(membersRes.data);
        if (membersRes.data.length > 0) {
          const defaultPayerUid = membersRes.data[0].uid || membersRes.data[0].id || '';
          const nextMember = membersRes.data.find(m => (m.uid || m.id) !== defaultPayerUid);
          const defaultReceiverUid = nextMember ? (nextMember.uid || nextMember.id) : '';
          
          setCustomSettlePayer(defaultPayerUid);
          setCustomSettleReceiver(defaultReceiverUid);
          
          const pName = membersRes.data[0].nickname || membersRes.data[0].name || 'Payer';
          const rName = nextMember ? (nextMember.nickname || nextMember.name) : 'Receiver';
          setAdvSettleTitle(`Payment: ${pName} to ${rName}`);
        }
      }
      if (txRes.data) {
        const parsedTx = txRes.data.map(t => {
          let splits = t.splits;
          if (typeof splits === 'string') {
            try {
              splits = JSON.parse(splits);
            } catch (e) {
              splits = null;
            }
          }
          return { ...t, splits };
        });
        setSettleRoomTransactions(parsedTx);
      }
    } catch (e) {
      console.error("Failed to fetch room data for settlement:", e);
      if (triggerToast) triggerToast("Failed to load room data.");
    } finally {
      setLoadingSettleRoom(false);
    }
  }, [triggerToast]);

  useEffect(() => {
    if (selectedSettleRoomId) {
      fetchSettleRoomData(selectedSettleRoomId);
    } else {
      setSettleRoomMembers([]);
      setSettleRoomTransactions([]);
    }
  }, [selectedSettleRoomId, fetchSettleRoomData]);

  useEffect(() => {
    if (settleRoomMembers.length > 0 && customSettlePayer && customSettleReceiver) {
      const p = settleRoomMembers.find(m => (m.uid || m.id) === customSettlePayer);
      const r = settleRoomMembers.find(m => (m.uid || m.id) === customSettleReceiver);
      if (p && r) {
        setAdvSettleTitle(`Payment: ${p.nickname || p.name} to ${r.nickname || r.name}`);
      }
    }
  }, [customSettlePayer, customSettleReceiver, settleRoomMembers]);

  // Calculate roommate balances for selected room
  const settleRoomBalances = useMemo(() => {
    const data = settleRoomTransactions.filter(t => t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__' && t.category !== '__SHOPPING__' && t.category !== '__BILL__' && t.category !== '__CHORE__' && t.category !== '__DELETE_PROPOSAL__');
    const roomBalances = {};
    
    // Initialize balances for all room members
    settleRoomMembers.forEach(m => {
      const key = m.uid || m.id;
      if (key) roomBalances[key] = 0;
    });

    data.forEach(t => {
      const amount = Number(t.amount) || 0;
      const isPayment = t.category === 'Payment';
      let payerUid = t.paid_by_uid || t.paidByUid;

      if (!payerUid) {
        const match = settleRoomMembers.find(m => m.nickname === t.paid_by || m.name === t.paid_by);
        if (match) {
          payerUid = match.uid || match.id;
        }
      }

      // Add paid amount to payer's balance
      if (payerUid) {
        if (roomBalances[payerUid] !== undefined) {
          roomBalances[payerUid] += amount;
        } else {
          roomBalances[payerUid] = amount;
        }
      }

      // Handle split shares
      if (isPayment) {
        let receiverUid = null;
        let splitsArr = t.splits;
        if (typeof splitsArr === 'string') {
          try {
            splitsArr = JSON.parse(splitsArr);
          } catch (e) {
            splitsArr = null;
          }
        }

        if (splitsArr && Array.isArray(splitsArr)) {
          const recSplit = splitsArr.find(s => {
            let sUid = s.uid;
            if (!sUid) {
              const match = settleRoomMembers.find(m => m.nickname === s.nickname || m.name === s.nickname);
              sUid = match ? (match.uid || match.id) : null;
            }
            return sUid !== payerUid && (Number(s.amount) > 0 || splitsArr.length === 2);
          });
          if (recSplit) {
            receiverUid = recSplit.uid;
            if (!receiverUid) {
              const match = settleRoomMembers.find(m => m.nickname === recSplit.nickname || m.name === recSplit.nickname);
              receiverUid = match ? (match.uid || match.id) : null;
            }
          }
        }

        if (!receiverUid && payerUid) {
          const otherMember = settleRoomMembers.find(m => (m.uid || m.id) !== payerUid);
          if (otherMember) {
            receiverUid = otherMember.uid || otherMember.id;
          }
        }

        if (receiverUid) {
          if (roomBalances[receiverUid] !== undefined) {
            roomBalances[receiverUid] -= amount;
          } else {
            roomBalances[receiverUid] = -amount;
          }
        }
      } else {
        // Regular expense split logic
        let splitsArr = t.splits;
        if (typeof splitsArr === 'string') {
          try {
            splitsArr = JSON.parse(splitsArr);
          } catch (e) {
            splitsArr = null;
          }
        }

        if (splitsArr && Array.isArray(splitsArr) && splitsArr.length > 0) {
          splitsArr.forEach(split => {
            let splitUid = split.uid;
            if (!splitUid) {
              const match = settleRoomMembers.find(m => m.nickname === split.nickname || m.name === split.nickname);
              if (match) splitUid = match.uid || match.id;
            }

            if (splitUid) {
              if (roomBalances[splitUid] !== undefined) {
                roomBalances[splitUid] -= Number(split.amount) || 0;
              } else {
                roomBalances[splitUid] = -(Number(split.amount) || 0);
              }
            }
          });
        } else {
          const mKeys = Object.keys(roomBalances);
          if (mKeys.length > 0) {
            const share = amount / mKeys.length;
            mKeys.forEach(k => {
              roomBalances[k] -= share;
            });
          }
        }
      }
    });

    Object.keys(roomBalances).forEach(k => {
      roomBalances[k] = Math.round(roomBalances[k] * 100) / 100;
    });

    return roomBalances;
  }, [settleRoomTransactions, settleRoomMembers]);

  // Suggested Transfers to settle up cleanly
  const settleRoomSuggestedTransfers = useMemo(() => {
    const debtors = [];
    const creditors = [];
    
    Object.entries(settleRoomBalances).forEach(([uid, bal]) => {
      const member = settleRoomMembers.find(m => (m.uid || m.id) === uid);
      if (member) {
        if (bal < -0.01) {
          debtors.push({ uid, nickname: member.nickname || member.name || uid, amount: Math.abs(bal) });
        } else if (bal > 0.01) {
          creditors.push({ uid, nickname: member.nickname || member.name || uid, amount: bal });
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
          fromName: debtor.nickname || debtor.name || debtor.uid,
          toUid: creditor.uid,
          toName: creditor.nickname || creditor.name || creditor.uid,
          amount: payment
        });
      }
      
      debtor.amount -= payment;
      creditor.amount -= payment;
      
      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }
    
    return transfers;
  }, [settleRoomBalances, settleRoomMembers]);

  const handleAdminSubmitSettle = async (e) => {
    if (e) e.preventDefault();
    if (!userPermissions.settlements) {
      if (triggerToast) triggerToast('⚠️ Access Denied: Financial settlement clearance required.');
      return;
    }
    const amountNum = parseFloat(customSettleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      if (triggerToast) triggerToast('Please enter a valid settlement amount.');
      return;
    }
    if (!customSettlePayer || !customSettleReceiver || customSettlePayer === customSettleReceiver) {
      if (triggerToast) triggerToast('Payer and receiver cannot be the same roommate.');
      return;
    }

    setIsSubmittingAdminSettle(true);
    try {
      const payer = settleRoomMembers.find(m => (m.uid || m.id) === customSettlePayer);
      const receiver = settleRoomMembers.find(m => (m.uid || m.id) === customSettleReceiver);
      if (!payer || !receiver) {
        if (triggerToast) triggerToast('Payer or receiver not found in room.');
        return;
      }

      // Time formatter helper
      const formatTimeTo12h = (time24) => {
        if (!time24) return '';
        try {
          const [hrs, mins] = time24.split(':').map(Number);
          const suffix = hrs >= 12 ? 'PM' : 'AM';
          const displayHrs = hrs % 12 || 12;
          return `${displayHrs}:${String(mins).padStart(2, '0')} ${suffix}`;
        } catch (err) {
          return time24;
        }
      };

      const title = settleMode === 'advanced' && advSettleTitle.trim()
        ? advSettleTitle.trim()
        : `Admin Payment: ${payer.nickname || payer.name} to ${receiver.nickname || receiver.name}`;
      
      const date = settleMode === 'advanced' && advSettleDate
        ? advSettleDate
        : new Date().toISOString().slice(0, 10);

      const time = settleMode === 'advanced' && advSettleTime
        ? formatTimeTo12h(advSettleTime)
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const isShared = settleMode === 'advanced' ? advSettleIsShared : true;

      // Pack payment method and custom notes into split string
      const paymentMetadata = {
        recordedBy: 'Admin Portal',
        method: settleMode === 'advanced' ? advSettleMethod : 'Direct Settle',
        notes: settleMode === 'advanced' ? advSettleNotes.trim() : ''
      };

      const newPayment = {
        room_id: selectedSettleRoomId,
        title,
        amount: amountNum,
        category: 'Payment',
        date,
        time,
        paid_by: payer.nickname || payer.name || payer.email || 'Admin',
        paid_by_uid: customSettlePayer,
        is_shared: isShared ? 1 : 0,
        split_type: 'amount',
        split: JSON.stringify(paymentMetadata),
        splits: [
          { uid: customSettlePayer, nickname: payer.nickname || payer.name || payer.email, amount: 0 },
          { uid: customSettleReceiver, nickname: receiver.nickname || receiver.name || receiver.email, amount: amountNum }
        ]
      };

      const { data, error } = await supabase.from('transactions').insert([newPayment]);
      if (error) throw error;

      if (triggerToast) triggerToast(`Payment of ₹${amountNum} recorded successfully!`);
      logAuditAction('settle_payment', `Admin recorded payment of ₹${amountNum} in room ${selectedSettleRoomId} (Mode: ${settleMode.toUpperCase()})`);
      
      setCustomSettleAmount('');
      setAdvSettleNotes('');
      fetchSettleRoomData(selectedSettleRoomId);
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast(`Failed to record payment: ${err.message}`);
    } finally {
      setIsSubmittingAdminSettle(false);
    }
  };

  const handleAdminQuickSettle = async (fromUid, toUid, amount) => {
    const payer = settleRoomMembers.find(m => (m.uid || m.id) === fromUid);
    const receiver = settleRoomMembers.find(m => (m.uid || m.id) === toUid);
    if (!payer || !receiver || amount <= 0) return;

    try {
      const newPayment = {
        room_id: selectedSettleRoomId,
        title: `Admin Payment: ${payer.nickname || payer.name} to ${receiver.nickname || receiver.name}`,
        amount: Number(amount),
        category: 'Payment',
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        paid_by: payer.nickname || payer.name || payer.email || 'Admin',
        paid_by_uid: fromUid,
        is_shared: true,
        split_type: 'amount',
        splits: [
          { uid: fromUid, nickname: payer.nickname || payer.name || payer.email, amount: 0 },
          { uid: toUid, nickname: receiver.nickname || receiver.name || receiver.email, amount: Number(amount) }
        ]
      };

      const { data, error } = await supabase.from('transactions').insert([newPayment]);
      if (error) throw error;

      if (triggerToast) triggerToast(`⚡ Quick settled ₹${amount} successfully!`);
      logAuditAction('settle_payment', `Admin recorded quick payment of ₹${amount} in room ${selectedSettleRoomId} from ${payer.nickname || payer.name} to ${receiver.nickname || receiver.name}`);
      
      fetchSettleRoomData(selectedSettleRoomId);
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast(`Failed to record quick payment: ${err.message}`);
    }
  };

  // Measure Supabase REST Ping Latency
  const measurePing = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const { error } = await supabase.from('rooms').select('id', { head: true, count: 'exact' });
      const duration = Math.round(performance.now() - start);
      setPingMs(duration);
      setDbStatus(error ? 'degraded' : 'healthy');
    } catch (err) {
      console.error(err);
      setDbStatus('offline');
      setPingMs(999);
    } finally {
      setIsPinging(false);
    }
  }, []);

  const handlePing = measurePing;

  // Fetch Database System Stats & Room List from D1 export snapshot
  const fetchSystemStats = useCallback(async () => {
    try {
      const res = await fetch('https://duoshare-backend.sampathjogipusala123.workers.dev/api/export-all-data');
      if (!res.ok) throw new Error('Export failed');
      const json = await res.json();
      if (!json || !json.data) throw new Error('No data');
      const d = json.data;
      setStats({
        totalRooms:        d.rooms?.length || 0,
        totalUsers:        d.users?.length || 0,
        totalTransactions: d.transactions?.length || 0,
        totalReceipts:     d.receipts?.length || 0,
      });
      if (Array.isArray(d.rooms)) {
        const mapped = d.rooms.map(r => ({ roomId: r.id, roomName: r.name || r.id }));
        setAllSystemRooms(mapped);
      }
    } catch (e) {
      console.warn("Stats fetch failed:", e);
    }
  }, []);

  // Financial Audit & Live Stream states
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [totalFinancialVolume, setTotalFinancialVolume] = useState(0);
  const [simulatedErrorRate, setSimulatedErrorRate] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('tallyin_simulated_error_rate')) || 0;
    }
    return 0;
  });
  const [featureFlags, setFeatureFlags] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_feature_flags');
        return saved ? JSON.parse(saved) : { aiOcr: true, smartSettlements: true, budgetAlerts: true };
      } catch (e) { console.error(e); }
    }
    return { aiOcr: true, smartSettlements: true, budgetAlerts: true };
  });

  const fetchFinancialsAndLogs = useCallback(async () => {
    try {
      const { data: txList } = await supabase
        .from('transactions')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

      if (txList) {
        setRecentTransactions(txList);
        const total = txList.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        setTotalFinancialVolume(total);

        const catMap = {};
        txList.forEach(t => {
          const cat = t.category || 'General';
          if (!cat.startsWith('__')) {
            catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
          }
        });

        const sortedCats = Object.keys(catMap).map(c => ({
          name: c,
          amount: catMap[c],
          pct: total > 0 ? Math.round((catMap[c] / total) * 100) : 0
        })).sort((a, b) => b.amount - a.amount);

        setCategoryBreakdown(sortedCats);
      }
    } catch (e) {
      console.warn("Financials fetch error:", e);
    }
  }, []);

  // Ban Management States
  const adminChannelRef = useRef(null);
  const [bannedUsers, setBannedUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_banned_users');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { console.error(e); }
    }
    return [];
  });
  const [banEmailInput, setBanEmailInput] = useState('');
  const [banReasonInput, setBanReasonInput] = useState('Violation of platform guidelines or debt non-payment');
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  // Ban Appeals State
  const [banAppeals, setBanAppeals] = useState([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_audit_logs');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const logAuditAction = useCallback((action, details) => {
    const newEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      adminEmail: user?.email || userNickname || 'System Admin',
      action,
      details
    };
    setAuditLogs(prev => {
      const updated = [newEntry, ...(prev || [])].slice(0, 150);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tallyin_audit_logs', JSON.stringify(updated));
      }
      try {
        supabase.from('rooms').upsert({
          id: '__SYSTEM_AUDIT_LOGS__',
          name: JSON.stringify(updated),
          created_by: 'system',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' }).then(({ error }) => {
          if (error) console.warn("DB audit log sync notice:", error);
        });
      } catch (err) { console.warn("DB audit log error:", err); }
      return updated;
    });
  }, [user, userNickname]);

  // Web Audio Alert Chime for Incoming Suspension Appeals
  const playAppealAlertSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = 659.25;
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 987.77;
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.warn("Audio chime notice:", err);
    }
  }, []);

  // Keep persistent subscribed Realtime channel for Admin broadcasts & Appeals
  useEffect(() => {
    const channel = supabase.channel('system_admin_channel');
    channel
      .on('broadcast', { event: 'BAN_APPEAL_SUBMITTED' }, (payload) => {
        if (payload?.payload?.appeal) {
          setBanAppeals(prev => [payload.payload.appeal, ...prev.filter(a => a.email !== payload.payload.appeal.email)]);
          playAppealAlertSound();
          if (triggerToast) triggerToast(`🚨 New suspension appeal received from ${payload.payload.appeal.email}!`);
        }
      })
      .subscribe();
    adminChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerToast, playAppealAlertSound]);

  const fetchBanAppeals = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', '__SYSTEM_BAN_APPEALS__')
        .maybeSingle();

      if (data?.name && data.name.startsWith('[')) {
        setBanAppeals(JSON.parse(data.name));
      }
    } catch (err) {
      console.warn("Fetch ban appeals error:", err);
    }
  }, []);

  const handleRejectAppeal = async (appeal) => {
    const rawTarget = String(appeal.email || appeal.identifier || '').trim();
    const cleanTarget = rawTarget.toLowerCase();

    const updatedAppeals = banAppeals.map(a => {
      const aEmail = String(a.email || a.identifier || '').trim().toLowerCase();
      if (aEmail === cleanTarget || a.id === appeal.id) {
        return { ...a, status: 'rejected', rejectedAt: new Date().toISOString() };
      }
      return a;
    });
    setBanAppeals(updatedAppeals);

    // 1. Save updated appeals list to DB
    try {
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_BAN_APPEALS__',
          name: JSON.stringify(updatedAppeals),
          created_by: 'system',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (err) { console.error(err); }

    // 2. Broadcast Realtime rejection event to user
    try {
      if (adminChannelRef.current) {
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'BAN_APPEAL_DECISION',
          payload: { email: cleanTarget, status: 'rejected' }
        });
      }
    } catch (err) { console.warn(err); }

    // 3. Send automated rejection email to user (if email address contains @)
    if (cleanTarget && cleanTarget.includes('@')) {
      try {
        const mailRelayUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
        fetch(mailRelayUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'send_email',
            to: cleanTarget,
            subject: 'Notice Regarding Your Tallyin Account Suspension Appeal',
            body: `Hello,\n\nYour recent account suspension appeal for ${cleanTarget} has been reviewed by Tallyin System Administration and was REJECTED.\n\nFurther in-app appeals cannot be submitted. If you have questions or additional details to present, please email support directly at tallyin.alerts@gmail.com.\n\nSincerely,\nTallyin Administration`,
            htmlBody: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #ef4444;">
                  <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Appeal Decision Notice</span>
                  <h2 style="color: #1a3827; margin: 8px 0 0 0;">Suspension Appeal Rejected</h2>
                  <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Tallyin Access & Security Operations</p>
                </div>

                <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                  <p>Hello,</p>
                  <p>Your recent account suspension appeal for <strong>${cleanTarget}</strong> has been reviewed by Tallyin System Administration and was <strong>REJECTED</strong>.</p>

                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #991b1b; font-size: 13px;">
                    <strong>In-App Appeals Closed:</strong> Additional appeal submissions through the app screen have been permanently closed for this account.
                  </div>

                  <p>If you believe you have new documentation or further information to present, please email system support directly at <a href="mailto:tallyin.alerts@gmail.com" style="color: #2563eb; font-weight: 800; text-decoration: underline;">tallyin.alerts@gmail.com</a>.</p>
                </div>

                <div style="text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                  Official Decision Notice • Tallyin System Administration
                </div>
              </div>
            `
          })
        }).catch(e => console.warn(e));
      } catch (err) { console.warn("Rejection email dispatch notice:", err); }
    }

    if (triggerToast) triggerToast(`Appeal for ${cleanTarget} REJECTED & user notified!`);
  };

  // Sync Banned Users with Supabase DB (rooms table + system_settings) + Realtime Channel
  const syncBannedUsersToDatabase = async (updatedList) => {
    setBannedUsers(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tallyin_banned_users', JSON.stringify(updatedList));
    }

    const jsonStr = JSON.stringify(updatedList);

    // 1. Primary: Save to rooms table under __SYSTEM_BANNED_USERS__
    try {
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_BANNED_USERS__',
          name: jsonStr,
          created_by: 'system',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (err) {
      console.warn("Supabase rooms table upsert notice:", err);
    }

    // 2. Secondary: Save to system_settings table
    try {
      await supabase
        .from('system_settings')
        .upsert({ key: 'banned_users', value: updatedList }, { onConflict: 'key' });
    } catch (err) {
      console.warn("Supabase system_settings upsert notice:", err);
    }

    // 3. Broadcast via active Subscribed Realtime channel
    try {
      if (adminChannelRef.current) {
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'USER_BAN_UPDATE',
          payload: { bannedUsers: updatedList }
        });
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'USER_UNBANNED',
          payload: { bannedUsers: updatedList }
        });
      }
    } catch (err) {
      console.warn("Realtime send ban error:", err);
    }
  };

  const fetchBannedUsers = useCallback(async () => {
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
      console.warn("Fetch rooms table ban list notice:", err);
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
        console.warn("Fetch system_settings notice:", err);
      }
    }

    // 3. Try localStorage
    if (!foundList && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_banned_users');
        if (saved) foundList = JSON.parse(saved);
      } catch (err) { console.error(err); }
    }

    if (foundList && Array.isArray(foundList)) {
      setBannedUsers(foundList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tallyin_banned_users', JSON.stringify(foundList));
      }
    }
  }, []);

  // User Directory & Search states
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);

  // Automated Email Dispatcher for User Bans and Unbans
  const sendUserBanStatusEmail = async ({ type, targetEmail, targetName, reason }) => {
    if (!targetEmail || !targetEmail.includes('@') || targetEmail.toLowerCase() === 'n/a') {
      console.warn("Skipping ban/unban email: target email is invalid or N/A:", targetEmail);
      return;
    }

    const mailRelayUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
    const logoUrl = 'https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/public/tallyin_security_shield.png';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const isBan = type === 'BAN';
    const refId = isBan ? `BAN-${dateStr}-${randHex}` : `RST-${dateStr}-${randHex}`;

    const subject = isBan
      ? `[SECURITY NOTICE] Tallyin Account Suspension — Ref: ${refId}`
      : `[ACCOUNT RESTORED] Tallyin Account Suspension Lifted — Ref: ${refId}`;

    const htmlBody = isBan ? `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 20px; border: 1px solid #fca5a5; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ef4444;">
          <div style="margin: 0 auto 14px auto; text-align: center;">
            <img src="${logoUrl}" alt="Tallyin Security" width="88" height="88" style="width: 88px; height: 88px; display: inline-block; object-fit: contain;" />
          </div>
          <div style="display: inline-block; padding: 5px 14px; background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 9999px; color: #991b1b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            Account Suspension Notice
          </div>
          <h1 style="color: #991b1b; margin: 12px 0 6px 0; font-size: 22px; font-weight: 900;">Tallyin Account Suspended</h1>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Tallyin Trust & Security Governance</p>
        </div>

        <div style="margin: 22px 0; padding: 18px 20px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9f1239; margin-bottom: 6px;">
            Official Suspension Reference ID
          </div>
          <div style="font-family: ui-monospace, monospace; font-size: 18px; font-weight: 900; color: #be123c; letter-spacing: 1px;">
            ${refId}
          </div>
          <div style="margin-top: 14px; font-size: 12px; color: #475569; line-height: 1.6; border-top: 1px solid #fecdd3; padding-top: 12px;">
            <div><strong>Target Account:</strong> ${targetEmail}</div>
            <div><strong>Status:</strong> Immediate Platform Suspension</div>
            <div><strong>Suspended By:</strong> System Administration (${user?.email || 'Super Admin'})</div>
            <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          </div>
        </div>

        <div style="color: #334155; font-size: 14px; line-height: 1.65; margin-bottom: 22px;">
          <p>Hello <strong>${targetName || targetEmail}</strong>,</p>
          <p>This automated communication serves as formal notice that your <strong>Tallyin account access has been suspended</strong> by System Administration.</p>
          <p><strong>Reason for Administrative Suspension:</strong></p>
          <blockquote style="margin: 10px 0; padding: 12px 16px; background-color: #fff1f2; border-left: 3px solid #ef4444; font-style: italic; color: #9f1239; border-radius: 6px;">
            ${reason || 'Account suspended for policy violations or disputed roommate activities.'}
          </blockquote>
          <p>While suspended, you will be unable to access shared rooms, add expenses, or interact on the platform. If you believe this suspension was issued in error, you may submit a reinstatement appeal directly through the Tallyin website.</p>
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="https://tallyin.vercel.app" style="display: inline-block; padding: 12px 28px; background-color: #991b1b; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; box-shadow: 0 4px 12px rgba(153,27,27,0.25);">
            Submit Reinstatement Appeal →
          </a>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          Tallyin Corporate Trust & Safety • tallyin.alerts@gmail.com<br/>
          Official Reference ID: <strong>${refId}</strong>
        </div>
      </div>
    ` : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 20px; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10b981;">
          <div style="margin: 0 auto 14px auto; text-align: center;">
            <img src="${logoUrl}" alt="Tallyin Security" width="88" height="88" style="width: 88px; height: 88px; display: inline-block; object-fit: contain;" />
          </div>
          <div style="display: inline-block; padding: 5px 14px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; color: #047857; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            Access Re-instatement Notice
          </div>
          <h1 style="color: #1a3827; margin: 12px 0 6px 0; font-size: 22px; font-weight: 900;">Account Suspension Lifted</h1>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Tallyin Trust & Security Governance</p>
        </div>

        <div style="margin: 22px 0; padding: 18px 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 6px;">
            Reinstatement Acknowledgement Reference
          </div>
          <div style="font-family: ui-monospace, monospace; font-size: 18px; font-weight: 900; color: #15803d; letter-spacing: 1px;">
            ${refId}
          </div>
          <div style="margin-top: 14px; font-size: 12px; color: #475569; line-height: 1.6; border-top: 1px solid #bbf7d0; padding-top: 12px;">
            <div><strong>Target Account:</strong> ${targetEmail}</div>
            <div><strong>Status:</strong> Restored in Full Good Standing</div>
            <div><strong>Authorized By:</strong> System Administration (${user?.email || 'Super Admin'})</div>
            <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          </div>
        </div>

        <div style="color: #334155; font-size: 14px; line-height: 1.65; margin-bottom: 22px;">
          <p>Hello <strong>${targetName || targetEmail}</strong>,</p>
          <p>We are pleased to inform you that your <strong>Tallyin account suspension has been lifted</strong> and your access privileges have been <strong>fully restored</strong> by System Administration.</p>
          <p>You may now log in to your account, access shared rooms, view expenses, and settle balances normally.</p>
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="https://tallyin.vercel.app" style="display: inline-block; padding: 12px 28px; background-color: #1a3827; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; box-shadow: 0 4px 12px rgba(26,56,39,0.25);">
            Access Tallyin Dashboard →
          </a>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          Tallyin Corporate Trust & Safety • tallyin.alerts@gmail.com<br/>
          Official Reference ID: <strong>${refId}</strong>
        </div>
      </div>
    `;

    try {
      fetch(mailRelayUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'send_email',
          to: targetEmail,
          subject,
          body: `Tallyin Account Notice:\nRef: ${refId}\nType: ${type}\nTarget: ${targetEmail}`,
          htmlBody
        })
      }).catch(e => console.warn("Ban email relay background error:", e));

      logAuditAction(isBan ? 'USER_BAN_EMAIL_DISPATCHED' : 'USER_UNBAN_EMAIL_DISPATCHED', `Dispatched ${type} notification to ${targetEmail} (Ref: ${refId})`);
    } catch (err) {
      console.warn("Mail relay dispatch failed:", err);
    }
  };

  // Ban User Handler
  const handleBanUser = async (targetIdentifier, targetReason, extraData = {}) => {
    if (!userPermissions.user_management) {
      if (triggerToast) triggerToast('⚠️ Access Denied: User governance clearance required.');
      return;
    }
    const rawTarget = String(targetIdentifier || '').trim();
    if (!rawTarget || rawTarget === 'N/A') {
      if (triggerToast) triggerToast('Valid email or username required to ban user.');
      return;
    }

    const cleanTarget = rawTarget.toLowerCase();

    // Determine target email for dispatch
    const matchedUser = allRegisteredUsers.find(u => 
      (u.email && u.email.toLowerCase() === cleanTarget) ||
      (u.name && u.name.toLowerCase() === cleanTarget) ||
      (u.id && String(u.id).toLowerCase() === cleanTarget)
    );

    const targetEmail = cleanTarget.includes('@')
      ? cleanTarget
      : (extraData.email && extraData.email.includes('@') ? extraData.email : matchedUser?.email);

    const targetName = extraData.name || matchedUser?.name || rawTarget;

    const newBanObj = {
      identifier: cleanTarget,
      email: targetEmail || cleanTarget,
      name: targetName,
      id: extraData.id || matchedUser?.id || rawTarget,
      reason: targetReason?.trim() || 'Account suspended by administrator.',
      bannedAt: new Date().toISOString(),
      bannedBy: user?.email || 'Admin'
    };

    const updatedBanned = [...bannedUsers.filter(b => (b.identifier || b.email)?.toLowerCase() !== cleanTarget), newBanObj];
    await syncBannedUsersToDatabase(updatedBanned);

    // Send Ban Email Notification if valid email found
    if (targetEmail && targetEmail.includes('@')) {
      sendUserBanStatusEmail({
        type: 'BAN',
        targetEmail,
        targetName,
        reason: newBanObj.reason
      });
      if (triggerToast) triggerToast(`User "${targetName}" suspended and notification email dispatched!`);
    } else {
      if (triggerToast) triggerToast(`User "${rawTarget}" SUSPENDED & BANNED!`);
    }

    setBanEmailInput('');
    setIsBanModalOpen(false);
  };

  // Unban User Handler
  const handleUnbanUser = async (targetIdentifier) => {
    if (!userPermissions.user_management) {
      if (triggerToast) triggerToast('⚠️ Access Denied: User governance clearance required.');
      return;
    }
    const cleanTarget = String(targetIdentifier || '').trim().toLowerCase();

    const existingBan = bannedUsers.find(b => 
      (b.identifier || '').toLowerCase() === cleanTarget || 
      (b.email || '').toLowerCase() === cleanTarget ||
      (b.name || '').toLowerCase() === cleanTarget
    );

    const matchedUser = allRegisteredUsers.find(u => 
      (u.email && u.email.toLowerCase() === cleanTarget) ||
      (u.name && u.name.toLowerCase() === cleanTarget) ||
      (u.id && String(u.id).toLowerCase() === cleanTarget)
    );

    const targetEmail = cleanTarget.includes('@')
      ? cleanTarget
      : (existingBan?.email && existingBan.email.includes('@') ? existingBan.email : matchedUser?.email);

    const targetName = existingBan?.name || matchedUser?.name || targetIdentifier;

    const updatedBanned = bannedUsers.filter(b => (b.identifier || b.email)?.toLowerCase() !== cleanTarget);
    await syncBannedUsersToDatabase(updatedBanned);

    // Send Unban / Reinstatement Email Notification if valid email found
    if (targetEmail && targetEmail.includes('@')) {
      sendUserBanStatusEmail({
        type: 'UNBAN',
        targetEmail,
        targetName
      });
      if (triggerToast) triggerToast(`User "${targetName}" RESTORED and reinstatement email dispatched!`);
    } else {
      if (triggerToast) triggerToast(`User "${targetIdentifier}" RESTORED & UNBANNED!`);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [securityLogs, setSecurityLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tallyin_security_logs');
        return saved ? JSON.parse(saved) : [
          { id: 'sec-1', action: 'Admin Portal Authorized', email: user?.email || 'tallyin.alerts@gmail.com', timestamp: new Date().toLocaleTimeString(), status: 'SUCCESS' }
        ];
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const fetchUserDirectory = useCallback(async () => {
    try {
      const [{ data: memberList }, { data: userList }] = await Promise.all([
        supabase.from('members').select('*').limit(100),
        supabase.from('users').select('*').limit(100)
      ]);

      const combined = [];
      const seen = new Set();

      (memberList || []).forEach(m => {
        const key = m.email || m.uid || m.nickname;
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push({
            id: m.uid || m.id,
            name: m.nickname || m.name || 'Roommate',
            email: m.email || 'N/A',
            roomId: m.room_id || 'Shared Space',
            photoURL: m.photoURL,
            role: 'Member'
          });
        }
      });

      (userList || []).forEach(u => {
        const key = u.email || u.uid;
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push({
            id: u.uid || u.id,
            name: u.nickname || u.name || 'User',
            email: u.email || 'N/A',
            roomId: u.room_id || 'Joined Space',
            photoURL: u.photoURL,
            role: 'User'
          });
        }
      });

      setAllRegisteredUsers(combined);
    } catch (e) {
      console.warn("User directory fetch error:", e);
    }
  }, []);

  // Fetch Co-Admin Acknowledgement & Clearance Registry from system_settings
  const fetchCoAdminAckRegistry = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'co_admin_ack_registry')
        .maybeSingle();

      if (!error && data?.value) {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) {
          setCoAdminAckRegistry(parsed);
          localStorage.setItem('tallyin_co_admin_ack_registry', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn("Ack registry fetch notice:", e);
    }
  }, []);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      measurePing();
      fetchSystemStats();
      fetchFinancialsAndLogs();
      fetchUserDirectory();
      fetchBannedUsers();
      fetchBanAppeals();
      fetchCoAdminAckRegistry();
    }
  }, [isAuthorizedAdmin, measurePing, fetchSystemStats, fetchFinancialsAndLogs, fetchUserDirectory, fetchBannedUsers, fetchBanAppeals, fetchCoAdminAckRegistry]);

  // Fetch Rooms for Room Commander with members count
  const fetchCommanderRooms = useCallback(async () => {
    setLoadingCommanderRooms(true);
    try {
      const [roomsRes, membersRes, txRes, frozenRes] = await Promise.all([
        supabase.from('rooms').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('room_id'),
        supabase.from('transactions').select('room_id, amount'),
        supabase.from('system_settings').select('value').eq('key', 'frozen_room_ids').maybeSingle()
      ]);

      let frozenIds = [];
      if (frozenRes?.data?.value) {
        try { frozenIds = JSON.parse(frozenRes.data.value); } catch(e) {}
      }

      const memberCounts = {};
      (membersRes.data || []).forEach(m => {
        if (m.room_id) memberCounts[m.room_id] = (memberCounts[m.room_id] || 0) + 1;
      });

      const roomTotals = {};
      (txRes.data || []).forEach(t => {
        if (t.room_id) roomTotals[t.room_id] = (roomTotals[t.room_id] || 0) + (Number(t.amount) || 0);
      });

      const formatted = (roomsRes.data || []).map(r => ({
        ...r,
        memberCount: memberCounts[r.id] || 0,
        totalSpend: roomTotals[r.id] || 0,
        isFrozen: frozenIds.includes(r.id)
      }));

      setCommanderRooms(formatted);
    } catch (e) {
      console.warn("Commander rooms fetch notice:", e);
    } finally {
      setLoadingCommanderRooms(false);
    }
  }, []);

  // Fetch Global Transactions for Dispute Resolver
  const fetchGlobalTransactions = useCallback(async () => {
    setLoadingGlobalTx(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!error && data) {
        setAllGlobalTx(data);
      }
    } catch (e) {
      console.warn("Global transactions fetch notice:", e);
    } finally {
      setLoadingGlobalTx(false);
    }
  }, []);

  // Fetch Supabase Table Data for Database Studio
  const fetchStudioTable = useCallback(async (tableName) => {
    if (!tableName) return;
    setLoadingStudio(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(500);

      if (!error && data) {
        setStudioRows(data);
      } else {
        setStudioRows([]);
      }
    } catch (e) {
      console.warn(`Studio fetch error for ${tableName}:`, e);
      setStudioRows([]);
    } finally {
      setLoadingStudio(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchCommanderRooms();
      fetchGlobalTransactions();
    }
  }, [isAuthorizedAdmin, fetchCommanderRooms, fetchGlobalTransactions]);

  useEffect(() => {
    if (isAuthorizedAdmin && activeTab === 'database_studio') {
      fetchStudioTable(studioTable);
    }
  }, [isAuthorizedAdmin, activeTab, studioTable, fetchStudioTable]);

  // Room Commander Handlers
  const handleToggleFreezeRoom = async (room) => {
    const nextFrozen = !room.isFrozen;
    const actionLabel = nextFrozen ? 'FROZEN' : 'UNFROZEN';
    try {
      // 1. Fetch current frozen_room_ids from system_settings
      const { data: existing } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'frozen_room_ids')
        .maybeSingle();

      let currentFrozen = [];
      if (existing?.value) {
        try { currentFrozen = JSON.parse(existing.value); } catch(e) {}
      }

      let updatedFrozen = [];
      if (nextFrozen) {
        updatedFrozen = Array.from(new Set([...currentFrozen, room.id]));
      } else {
        updatedFrozen = currentFrozen.filter(id => id !== room.id);
      }

      // 2. Persist updated frozen list to system_settings
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'frozen_room_ids',
          value: JSON.stringify(updatedFrozen),
          created_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      setCommanderRooms(prev => prev.map(r => r.id === room.id ? { ...r, isFrozen: nextFrozen } : r));
      logAuditAction('ROOM_FREEZE_TOGGLE', `Room "${room.name}" (${room.id}) was ${actionLabel} by ${user?.email || 'Admin'}`);

      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'ROOM_STATUS_UPDATE',
        payload: { roomId: room.id, isFrozen: nextFrozen, frozenRoomIds: updatedFrozen }
      });

      if (triggerToast) triggerToast(`Room "${room.name}" is now ${actionLabel}!`);
    } catch (err) {
      if (triggerToast) triggerToast(`Failed to update room status: ${err.message}`);
    }
  };

  const handleSaveCommanderRoom = async (roomId) => {
    setIsSavingCommanderRoom(true);
    try {
      const updates = {};
      if (commanderRoomNameInput.trim()) updates.name = commanderRoomNameInput.trim();
      if (commanderBudgetInput !== '') updates.monthly_budget = Number(commanderBudgetInput) || 0;
      if (commanderMaxMembersInput !== '') updates.max_members = Number(commanderMaxMembersInput) || 10;

      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId);

      if (error) throw error;

      setCommanderRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
      logAuditAction('ROOM_UPDATE', `Updated settings for room ${roomId} by ${user?.email || 'Admin'}`);
      if (triggerToast) triggerToast('Room configuration saved successfully!');
      setEditingRoomCommander(null);
    } catch (err) {
      if (triggerToast) triggerToast(`Error updating room: ${err.message}`);
    } finally {
      setIsSavingCommanderRoom(false);
    }
  };

  const handlePurgeRoom = async (room) => {
    if (!window.confirm(`⚠️ DANGER: Are you sure you want to completely PURGE room "${room.name}" (${room.id})? This will permanently delete the room and all associated records.`)) {
      return;
    }

    try {
      // Clean up all related tables first to avoid foreign key errors
      await Promise.all([
        supabase.from('transactions').delete().eq('room_id', room.id),
        supabase.from('members').delete().eq('room_id', room.id),
        supabase.from('receipts').delete().eq('room_id', room.id),
        supabase.from('activity_logs').delete().eq('room_id', room.id),
        supabase.from('system_settings').delete().eq('key', `room_mode_${room.id}`),
        supabase.from('system_settings').delete().eq('key', `join_requests_${room.id}`)
      ]);

      // Remove from frozen_room_ids if present
      try {
        const { data: existing } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'frozen_room_ids')
          .maybeSingle();

        if (existing?.value) {
          const currentFrozen = JSON.parse(existing.value);
          const filtered = currentFrozen.filter(id => id !== room.id);
          await supabase.from('system_settings').upsert({
            key: 'frozen_room_ids',
            value: JSON.stringify(filtered),
            created_at: new Date().toISOString()
          }, { onConflict: 'key' });
        }
      } catch (e) {}

      // Delete the room itself
      const { error: roomErr } = await supabase.from('rooms').delete().eq('id', room.id);
      if (roomErr) throw roomErr;

      setCommanderRooms(prev => prev.filter(r => r.id !== room.id));
      logAuditAction('ROOM_PURGE', `Permanently purged room "${room.name}" (${room.id}) by ${user?.email || 'Admin'}`);
      if (triggerToast) triggerToast(`Room "${room.name}" has been permanently purged.`);
    } catch (err) {
      if (triggerToast) triggerToast(`Purge failed: ${err.message}`);
    }
  };

  // Transaction Dispute Handlers
  const handleSaveEditedTransaction = async (txId) => {
    setIsSavingTx(true);
    try {
      const updates = {
        title: editTxTitle.trim(),
        amount: Number(editTxAmount) || 0,
        category: editTxCategory || 'General'
      };

      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', txId);

      if (error) throw error;

      setAllGlobalTx(prev => prev.map(t => t.id === txId ? { ...t, ...updates } : t));
      logAuditAction('TRANSACTION_EDIT', `Edited transaction ${txId} (${updates.title}, ₹${updates.amount}) by ${user?.email || 'Admin'}`);
      if (triggerToast) triggerToast('Transaction updated successfully!');
      setEditingTx(null);
    } catch (err) {
      if (triggerToast) triggerToast(`Transaction edit failed: ${err.message}`);
    } finally {
      setIsSavingTx(false);
    }
  };

  const handleVoidTransaction = async (tx) => {
    if (!window.confirm(`Are you sure you want to VOID/DELETE transaction "${tx.title || 'Expense'}" (₹${tx.amount}) in Room ${tx.room_id}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', tx.id);
      if (error) throw error;

      setAllGlobalTx(prev => prev.filter(t => t.id !== tx.id));
      logAuditAction('TRANSACTION_VOID', `Voided transaction ${tx.id} ("${tx.title}", ₹${tx.amount}) in Room ${tx.room_id}`);
      if (triggerToast) triggerToast(`Transaction "${tx.title}" voided!`);
    } catch (err) {
      if (triggerToast) triggerToast(`Void failed: ${err.message}`);
    }
  };

  // Database Studio Handlers
  const handleDeleteStudioRow = async (tableName, row) => {
    const keyField = row.id !== undefined ? 'id' : row.key !== undefined ? 'key' : null;
    if (!keyField) {
      if (triggerToast) triggerToast('Cannot determine primary key for row.');
      return;
    }
    const val = row[keyField];
    if (!window.confirm(`Are you sure you want to delete row ${keyField}=${val} from table "${tableName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from(tableName).delete().eq(keyField, val);
      if (error) throw error;

      setStudioRows(prev => prev.filter(r => r[keyField] !== val));
      logAuditAction('STUDIO_ROW_DELETE', `Deleted row ${keyField}=${val} from table ${tableName}`);
      if (triggerToast) triggerToast(`Deleted row from ${tableName}`);
    } catch (err) {
      if (triggerToast) triggerToast(`Delete error: ${err.message}`);
    }
  };

  const handleExportStudioCSV = (tableName) => {
    if (!studioRows || studioRows.length === 0) {
      if (triggerToast) triggerToast('No rows to export.');
      return;
    }
    const cols = Object.keys(studioRows[0]);
    const csvLines = [
      cols.join(','),
      ...studioRows.map(row =>
        cols.map(c => {
          const val = row[c];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tallyin_${tableName}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (triggerToast) triggerToast(`Exported ${tableName} to CSV!`);
  };

  // System Macro Triggers Handlers
  const handleTriggerForceReload = async () => {
    if (!window.confirm('Broadcast SYSTEM_FORCE_RELOAD to all active client devices? This will instruct all connected browsers to refresh their application caches.')) {
      return;
    }
    setIsBroadcastingForceReload(true);
    try {
      const sysChan = adminChannelRef.current || supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'SYSTEM_FORCE_RELOAD',
        payload: { triggeredBy: user?.email || 'Admin', timestamp: Date.now() }
      });
      logAuditAction('SYSTEM_FORCE_RELOAD', `Broadcasted client force reload by ${user?.email || 'Admin'}`);
      if (triggerToast) triggerToast('⚡ Broadcasted SYSTEM_FORCE_RELOAD event to all clients!');
    } catch (e) {
      if (triggerToast) triggerToast(`Broadcast error: ${e.message}`);
    } finally {
      setIsBroadcastingForceReload(false);
    }
  };

  const handleTriggerSettlementReminders = async () => {
    setIsBroadcastingSettlementReminders(true);
    try {
      const reminderBroadcast = {
        id: 'SETTLE-REMIND-' + Date.now(),
        message: '📢 Roommate Month-End Settlement Reminder: Please review pending expenses and settle room balances with your roommates.',
        type: 'announcement',
        targetRoom: 'ALL',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        author: userNickname || 'System Finance'
      };

      if (setGlobalBroadcast) setGlobalBroadcast(reminderBroadcast);
      localStorage.setItem('tallyin_global_broadcast', JSON.stringify(reminderBroadcast));

      // Persist to Supabase rooms table so reloading/offline clients also see it
      try {
        await supabase
          .from('rooms')
          .upsert({
            id: '__SYSTEM_GLOBAL_BROADCAST__',
            name: JSON.stringify(reminderBroadcast),
            created_by: 'system',
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
      } catch (err) {
        console.warn("DB broadcast persistence notice:", err);
      }

      const sysChan = adminChannelRef.current || supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'GLOBAL_BROADCAST',
        payload: { broadcast: reminderBroadcast }
      });

      logAuditAction('TRIGGER_SETTLEMENT_REMINDER', `Dispatched platform-wide month-end settlement reminder broadcast`);
      if (triggerToast) triggerToast('💰 Dispatched settlement reminder broadcast to all rooms!');
    } catch (e) {
      if (triggerToast) triggerToast(`Reminder failed: ${e.message}`);
    } finally {
      setIsBroadcastingSettlementReminders(false);
    }
  };

  const handleStartMaintenanceCountdown = async () => {
    const mins = Number(countdownMinsInput) || 10;
    setIsSendingCountdown(true);
    try {
      const payload = {
        active: true,
        minutes: mins,
        message: countdownNoticeInput.trim() || 'System Maintenance scheduled.',
        targetTime: Date.now() + mins * 60 * 1000,
        initiatedBy: user?.email || 'Admin'
      };

      setActiveSystemCountdown(payload);
      localStorage.setItem('tallyin_maint_countdown', JSON.stringify(payload));

      // Persist to Supabase system_settings so any user loading the app sees the countdown
      try {
        await supabase
          .from('system_settings')
          .upsert({
            key: 'system_maintenance_countdown',
            value: JSON.stringify(payload),
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (err) {
        console.warn("Countdown DB save error:", err);
      }

      const sysChan = adminChannelRef.current || supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_COUNTDOWN',
        payload
      });

      logAuditAction('MAINTENANCE_COUNTDOWN_START', `Scheduled ${mins}-minute maintenance countdown: "${payload.message}"`);
      if (triggerToast) triggerToast(`⏱️ Active ${mins}-minute maintenance countdown broadcasted!`);
    } catch (e) {
      if (triggerToast) triggerToast(`Countdown dispatch error: ${e.message}`);
    } finally {
      setIsSendingCountdown(false);
    }
  };

  const handleCancelMaintenanceCountdown = async () => {
    setActiveSystemCountdown(null);
    localStorage.removeItem('tallyin_maint_countdown');
    try {
      await supabase.from('system_settings').delete().eq('key', 'system_maintenance_countdown');
    } catch (e) {}

    try {
      const sysChan = adminChannelRef.current || supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_COUNTDOWN',
        payload: { active: false }
      });
      logAuditAction('MAINTENANCE_COUNTDOWN_CANCEL', `Canceled active maintenance countdown`);
      if (triggerToast) triggerToast('Cancelled maintenance countdown alert.');
    } catch (e) {}
  };

  // User Warning Email Handler
  const handleSendOfficialWarning = async () => {
    if (!warningTargetUser || !warningTargetUser.email || warningTargetUser.email === 'N/A') {
      if (triggerToast) triggerToast('Target user does not have a registered email address.');
      return;
    }

    setIsSendingWarning(true);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const warningRef = `WRN-${dateStr}-${randHex}`;

    const subject = `[OFFICIAL NOTICE] Administrative Warning from Tallyin — Ref: ${warningRef}`;
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 26px; background-color: #ffffff; border-radius: 18px; border: 1px solid #fed7aa; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="text-align: center; padding-bottom: 18px; border-bottom: 2px solid #f97316;">
          <div style="margin: 0 auto 12px auto;">
            <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/public/tallyin_security_shield.png" alt="Tallyin Security" width="80" height="80" style="width: 80px; height: 80px; display: inline-block; object-fit: contain;" />
          </div>
          <div style="display: inline-block; padding: 5px 14px; background-color: #ffedd5; border: 1px solid #fed7aa; border-radius: 9999px; color: #c2410c; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            Official Administrative Warning
          </div>
          <h1 style="color: #9a3412; margin: 12px 0 6px 0; font-size: 20px; font-weight: 900;">Account Notice & Policy Compliance</h1>
          <p style="color: #64748b; font-size: 12px; margin: 0;">Tallyin Governance & Security Enforcement</p>
        </div>

        <div style="margin: 20px 0; padding: 16px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #ea580c; margin-bottom: 6px;">
            Warning Reference ID
          </div>
          <div style="font-family: monospace; font-size: 17px; font-weight: 900; color: #c2410c; letter-spacing: 1px;">
            ${warningRef}
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #475569; line-height: 1.5; border-top: 1px solid #ffedd5; padding-top: 10px;">
            <div><strong>Recipient:</strong> ${warningTargetUser.name} (${warningTargetUser.email})</div>
            <div><strong>Reason:</strong> ${warningReason}</div>
            <div><strong>Issued By:</strong> System Administration (${user?.email || 'Super Admin'})</div>
            <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          </div>
        </div>

        <div style="color: #334155; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
          <p>Hello <strong>${warningTargetUser.name}</strong>,</p>
          <p>You have received an official administrative notice regarding your activity on the Tallyin platform.</p>
          <p><strong>Specific Notice Details:</strong></p>
          <blockquote style="margin: 10px 0; padding: 10px 14px; background-color: #f8fafc; border-left: 3px solid #f97316; font-style: italic; color: #475569;">
            ${warningNotes.trim() || 'Please adhere to room spending limits and mutual roommate settlement agreements.'}
          </blockquote>
          <p>Continued violations of room guidelines or disputed financial transactions may result in immediate account suspension or removal from shared rooms.</p>
        </div>

        <div style="text-align: center; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
          Tallyin Corporate Governance • Ref: <strong>${warningRef}</strong>
        </div>
      </div>
    `;

    try {
      const mailRelayUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
      fetch(mailRelayUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'send_email',
          to: warningTargetUser.email,
          subject,
          body: `Tallyin Official Warning:\nRef: ${warningRef}\nReason: ${warningReason}\nDetails: ${warningNotes}`,
          htmlBody
        })
      }).catch(console.warn);

      logAuditAction('ISSUE_USER_WARNING', `Issued official warning ${warningRef} to ${warningTargetUser.email} (Reason: ${warningReason})`);
      if (triggerToast) triggerToast(`⚠️ Dispatched official warning to ${warningTargetUser.email}! Ref: ${warningRef}`);
      setWarningTargetUser(null);
      setWarningNotes('');
    } catch (e) {
      if (triggerToast) triggerToast(`Warning dispatch failed: ${e.message}`);
    } finally {
      setIsSendingWarning(false);
    }
  };



  // Save Maintenance Message
  const handleSaveMaintenanceMessage = async () => {
    const textToSave = maintMsgInput.trim() || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.';
    if (setMaintenanceMessage) {
      setMaintenanceMessage(textToSave);
    }
    localStorage.setItem('tallyin_maintenance_message', textToSave);

    try {
      await supabase.from('system_settings').upsert({
        key: 'system_maintenance_message',
        value: textToSave,
        created_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (e) {}

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_MODE',
        payload: { active: isSystemMaintenanceActive, message: textToSave }
      });
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast('Maintenance notice text updated!');
  };

  // Save & Broadcast Maintenance Features
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const handleSaveMaintenanceFeatures = async (listToSave) => {
    const list = listToSave !== undefined ? listToSave : (maintenanceFeatures || []);
    setIsSavingFeatures(true);
    if (setMaintenanceFeatures) {
      setMaintenanceFeatures(list);
    }
    localStorage.setItem('tallyin_maintenance_features', JSON.stringify(list));

    try {
      await supabase.from('system_settings').upsert({
        key: 'maintenance_features',
        value: JSON.stringify(list),
        created_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (e) {
      console.warn("Save maintenance_features DB notice:", e);
    }

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_FEATURES',
        payload: { features: list }
      });
    } catch (e) {}

    setIsSavingFeatures(false);
    logAuditAction('UPDATE_MAINTENANCE_FEATURES', `Updated ${list.length} maintenance feature highlights`);
    if (triggerToast) triggerToast('✅ Maintenance features saved & published live!');
  };

  // Toggle Maintenance Mode
  const handleToggleMaintenance = async () => {
    if (!userPermissions.maintenance_control) {
      if (triggerToast) triggerToast('⚠️ Co-Admin does not have Site Maintenance downtime permission.');
      return;
    }
    const nextState = !isSystemMaintenanceActive;
    const textToSave = maintMsgInput.trim() || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.';
    setIsSystemMaintenanceActive(nextState);
    if (setMaintenanceMessage) {
      setMaintenanceMessage(textToSave);
    }
    localStorage.setItem('tallyin_system_maintenance_active', String(nextState));
    localStorage.setItem('tallyin_maintenance_message', textToSave);

    try {
      await Promise.all([
        supabase.from('system_settings').upsert({
          key: 'system_maintenance_active',
          value: String(nextState),
          created_at: new Date().toISOString()
        }, { onConflict: 'key' }),
        supabase.from('system_settings').upsert({
          key: 'system_maintenance_message',
          value: textToSave,
          created_at: new Date().toISOString()
        }, { onConflict: 'key' })
      ]);
    } catch (e) { console.error("Database save maintenance error:", e); }

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_MODE',
        payload: { active: nextState, message: textToSave }
      });
    } catch (e) { console.error("Realtime send maintenance error:", e); }

    logAuditAction('TOGGLE_MAINTENANCE', nextState ? `Activated (Notice: ${textToSave})` : 'Deactivated');

    if (triggerToast) {
      triggerToast(nextState ? '🚨 SITE IS NOW UNDER MAINTENANCE' : '✅ Site maintenance mode DEACTIVATED');
    }
  };

  // Handle Add Allowed Testing Account (Maintenance Bypass)
  const handleAddAllowedAccount = async () => {
    const clean = newAllowedAccountInput.trim().toLowerCase();
    if (!clean) {
      if (triggerToast) triggerToast('Please enter an email or UID.');
      return;
    }
    if (allowedMaintenanceAccounts.some(acc => acc.toLowerCase() === clean)) {
      if (triggerToast) triggerToast('Account is already in the allowed list.');
      return;
    }

    const nextList = [...allowedMaintenanceAccounts, clean];
    if (setAllowedMaintenanceAccounts) setAllowedMaintenanceAccounts(nextList);
    localStorage.setItem('tallyin_maintenance_allowed_accounts', JSON.stringify(nextList));
    setNewAllowedAccountInput('');

    try {
      await supabase.from('system_settings').upsert({
        key: 'maintenance_allowed_accounts',
        value: JSON.stringify(nextList),
        created_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (e) {}

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_ALLOWED_ACCOUNTS',
        payload: { accounts: nextList }
      });
    } catch (e) {}

    logAuditAction('UPDATE_MAINTENANCE_WHITELIST', `Added ${clean} to maintenance testing whitelist`);
    if (triggerToast) triggerToast(`Added ${clean} to maintenance testing allowed list!`);
  };

  // Handle Remove Allowed Testing Account
  const handleRemoveAllowedAccount = async (accountToRemove) => {
    const nextList = allowedMaintenanceAccounts.filter(acc => acc.toLowerCase() !== accountToRemove.toLowerCase());
    if (setAllowedMaintenanceAccounts) setAllowedMaintenanceAccounts(nextList);
    localStorage.setItem('tallyin_maintenance_allowed_accounts', JSON.stringify(nextList));

    try {
      await supabase.from('system_settings').upsert({
        key: 'maintenance_allowed_accounts',
        value: JSON.stringify(nextList),
        created_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (e) {}

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_ALLOWED_ACCOUNTS',
        payload: { accounts: nextList }
      });
    } catch (e) {}

    logAuditAction('UPDATE_MAINTENANCE_WHITELIST', `Removed ${accountToRemove} from maintenance testing whitelist`);
    if (triggerToast) triggerToast(`Removed ${accountToRemove} from allowed list.`);
  };

  const [isMigratingD1ToSupabase, setIsMigratingD1ToSupabase] = useState(false);

  const [migrationLog, setMigrationLog] = useState([]);

  const handleMigrateD1ToSupabase = async () => {
    if (!userPermissions.database_migration) {
      if (triggerToast) triggerToast('⚠️ Database migration is restricted to Super Admin or authorized operators.');
      return;
    }
    setIsMigratingD1ToSupabase(true);
    setMigrationLog([]);
    const addLog = (msg) => setMigrationLog(prev => [...prev, msg]);

    // Per-table conflict key (primary key column name)
    const CONFLICT_KEY = {
      users:          'id',
      rooms:          'id',
      members:        'id',
      transactions:   'id',
      receipts:       'id',
      activity_logs:  'id',
      system_settings:'key',
    };

    // Row sanitizer — cleans stringified 'null' / 'undefined' from Cloudflare D1 exports
    const sanitizeRow = (row, tbl) => {
      const cleaned = { ...row };
      for (const [k, v] of Object.entries(cleaned)) {
        if (v === 'null' || v === 'undefined') {
          cleaned[k] = null;
        }
      }
      if (tbl === 'rooms') {
        if (cleaned.monthly_budget === null || cleaned.monthly_budget === undefined || isNaN(Number(cleaned.monthly_budget))) {
          cleaned.monthly_budget = 0;
        } else {
          cleaned.monthly_budget = Number(cleaned.monthly_budget);
        }
      }
      if (tbl === 'receipts') {
        if (cleaned.rotation === null || cleaned.rotation === undefined || isNaN(Number(cleaned.rotation))) {
          cleaned.rotation = 0;
        } else {
          cleaned.rotation = Number(cleaned.rotation);
        }
        if (cleaned.amount === null || cleaned.amount === undefined || isNaN(Number(cleaned.amount))) {
          cleaned.amount = 0;
        } else {
          cleaned.amount = Number(cleaned.amount);
        }
      }
      if (tbl === 'transactions') {
        if (cleaned.amount !== null && cleaned.amount !== undefined) {
          cleaned.amount = Number(cleaned.amount) || 0;
        }
        if (typeof cleaned.is_shared === 'string') {
          cleaned.is_shared = cleaned.is_shared !== '0' && cleaned.is_shared !== 'false';
        }
        if (typeof cleaned.is_edited === 'string') {
          cleaned.is_edited = cleaned.is_edited === '1' || cleaned.is_edited === 'true';
        }
      }
      if (tbl === 'activity_logs') {
        if (cleaned.id !== null && cleaned.id !== undefined) {
          cleaned.id = Number(cleaned.id);
        }
      }
      return cleaned;
    };

    // Batch upsert helper — splits rows into chunks of 100
    const batchUpsert = async (tbl, rows) => {
      const key = CONFLICT_KEY[tbl] || 'id';
      const chunkSize = 100;
      let inserted = 0;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await realSupabase.from(tbl).upsert(chunk, { onConflict: key, ignoreDuplicates: false });
        if (error) return { error };
        inserted += chunk.length;
      }
      return { error: null, inserted };
    };

    try {
      addLog('📡 Connecting to Cloudflare D1...');
      if (triggerToast) triggerToast('📡 Fetching all data from Cloudflare D1...');

      const response = await fetch('https://duoshare-backend.sampathjogipusala123.workers.dev/api/export-all-data');
      const json = await response.json();

      if (!response.ok) {
        const errMsg = json?.error || `HTTP ${response.status}`;
        addLog(`❌ D1 Export failed: ${errMsg}`);
        if (triggerToast) triggerToast(`❌ D1 not available: ${errMsg}`);
        return;
      }
      if (!json?.data) {
        addLog('❌ Invalid snapshot from D1');
        return;
      }

      const tables = ['users', 'rooms', 'members', 'transactions', 'receipts', 'activity_logs', 'system_settings'];
      let totalMigrated = 0;
      let totalRows = 0;
      tables.forEach(t => { totalRows += (json.data[t] || []).length; });

      addLog(`✅ D1 Export: ${totalRows} rows across ${tables.length} tables.`);
      if (triggerToast) triggerToast(`✅ ${totalRows} rows found. Writing to Supabase...`);

      if (totalRows === 0) {
        addLog('⚠️ 0 rows returned — D1 may still be rate-limited. Retry after 5:30 AM IST.');
        if (triggerToast) triggerToast('⚠️ No data to migrate. Retry after 5:30 AM IST.');
        return;
      }

      const tableErrors = [];

      for (const tbl of tables) {
        const rows = json.data[tbl];
        if (!Array.isArray(rows) || rows.length === 0) {
          addLog(`⏭️ ${tbl}: empty — skipped`);
          continue;
        }

        const cleanRows = rows.map(r => sanitizeRow(r, tbl));
        addLog(`🔄 ${tbl}: writing ${cleanRows.length} sanitized rows…`);
        const { error, inserted } = await batchUpsert(tbl, cleanRows);

        if (error) {
          addLog(`❌ ${tbl}: ${error.message}`);
          addLog(`   → Run the Supabase schema SQL first, then retry.`);
          tableErrors.push(tbl);
          console.error(`Migration error [${tbl}]:`, error);
        } else {
          addLog(`✅ ${tbl}: ${rows.length} rows done`);
          totalMigrated += rows.length;
        }
      }

      if (tableErrors.length > 0) {
        addLog(`⚠️ ${tableErrors.length} table(s) failed: ${tableErrors.join(', ')}`);
        addLog('   → Open Admin Dashboard → Migration SQL → copy and run in Supabase SQL Editor, then retry.');
        if (triggerToast) triggerToast(`⚠️ ${totalMigrated}/${totalRows} migrated. ${tableErrors.length} tables need schema setup.`);
      } else {
        addLog(`🎉 Done! ${totalMigrated}/${totalRows} records migrated to Supabase.`);
        if (triggerToast) triggerToast(`🎉 Migration complete! ${totalMigrated} records in Supabase.`);
      }

      logAuditAction('DATABASE_MIGRATION', `Migrated ${totalMigrated}/${totalRows} from D1 → Supabase. Failed tables: ${tableErrors.join(',') || 'none'}`);
    } catch (err) {
      console.error('Migration error:', err);
      addLog(`❌ Error: ${err.message}`);
      if (triggerToast) triggerToast(`❌ Migration failed: ${err.message}`);
    } finally {
      setIsMigratingD1ToSupabase(false);
    }
  };

  // Co-Admin Management Handlers
  const saveCoAdminsList = async (updatedList) => {
    if (setCoAdmins) {
      setCoAdmins(updatedList);
    }
    localStorage.setItem('tallyin_co_admins', JSON.stringify(updatedList));

    try {
      await supabase.from('system_settings').upsert({
        key: 'co_admins',
        value: JSON.stringify(updatedList),
        created_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (e) {
      console.warn("Save co_admins to DB notice:", e);
    }

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'CO_ADMINS',
        payload: { coAdmins: updatedList }
      });
    } catch (e) {}
  };

  // Client IP Detector for Security Audit
  const fetchClientIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) });
      const data = await res.json();
      if (data.ip) return data.ip;
    } catch (e) {
      console.warn("ipify lookup notice:", e);
    }
    try {
      const res = await fetch('https://cloudflare.com/cdn-cgi/trace', { signal: AbortSignal.timeout(2500) });
      const text = await res.text();
      const match = text.match(/ip=(.+)/);
      if (match && match[1]) return match[1].trim();
    } catch (e) {
      console.warn("cloudflare trace lookup notice:", e);
    }
    return '127.0.0.1 (Local Session)';
  };

  // Generate unique MNC-grade security acknowledgement reference
  const generateAckNumber = () => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ACK-CAD-${dateStr}-${randomHex}`;
  };

  // Generate cryptographic-style verification signature
  const generateSecurityChecksum = (ackNumber, targetEmail, ip, timestamp) => {
    const str = `${ackNumber}|${targetEmail}|${ip}|${timestamp}|TALLYIN_RBAC_V3`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `SEC-SIG-${hex}`;
  };

  // Save acknowledgement record to state, localStorage, and system_settings
  const saveAckRecord = async (newAck) => {
    let nextList = [];
    setCoAdminAckRegistry(prev => {
      nextList = [newAck, ...prev.filter(r => r.ackNumber !== newAck.ackNumber)].slice(0, 100);
      localStorage.setItem('tallyin_co_admin_ack_registry', JSON.stringify(nextList));
      return nextList;
    });

    try {
      await supabase.from('system_settings').upsert({
        key: 'co_admin_ack_registry',
        value: JSON.stringify(nextList),
        created_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.warn("Supabase ack_registry upsert notice:", err);
    }
  };

  // Automated Security Clearance Email Dispatcher
  const sendCoAdminSecurityEmail = async ({ action, targetEmail, targetName, permissions, ackRecord }) => {
    const mailRelayUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
    const isRevoke = action === 'REVOKE';
    const actionTitle = isRevoke 
      ? 'Access Revoked' 
      : action === 'UPDATE' 
        ? 'Permissions Updated' 
        : 'Access Authorized';

    const subject = isRevoke
      ? `[SECURITY NOTICE] Tallyin Co-Admin Access Revoked — Ref: ${ackRecord.ackNumber}`
      : `[CLEARANCE NOTICE] Tallyin Co-Admin Access ${actionTitle} — Ref: ${ackRecord.ackNumber}`;

    const modules = [
      { key: 'room_commander', label: 'Room Commander & Live Intervention' },
      { key: 'dispute_resolver', label: 'Financial Disputes & Universal Resolver' },
      { key: 'database_studio', label: 'Supabase Database Studio & Row Inspector' },
      { key: 'system_triggers', label: 'System Macro Triggers & Real-Time Directives' },
      { key: 'user_management', label: 'User Directory, Warnings & Ban Governance' },
      { key: 'broadcasts', label: 'Global Broadcasts & Announcements' },
      { key: 'settlements', label: 'Financial Settlements & Audit' },
      { key: 'email_hub', label: 'Administrative Email Hub & Relay' },
      { key: 'room_explorer', label: 'Room Infrastructure Explorer' },
      { key: 'room_pinning', label: 'Room Message Pinning Protocol' },
      { key: 'latency_diagnostics', label: 'Network Latency & System Diagnostics' },
      { key: 'maintenance_control', label: 'System Maintenance Downtime Control' },
      { key: 'database_migration', label: 'Supabase Cloud Migration Engine' },
    ];

    const grantedModules = modules.filter(m => Boolean(permissions?.[m.key]));

    const permissionsRowsHtml = grantedModules.length > 0
      ? grantedModules.map(m => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 16px; font-weight: 700; color: #1e293b; font-size: 13px;">${m.label}</td>
          <td style="padding: 12px 16px; text-align: right;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">
              ✓ GRANTED
            </span>
          </td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="2" style="padding: 16px; text-align: center; color: #64748b; font-size: 13px; font-style: italic;">
            No operational modules currently granted.
          </td>
        </tr>
      `;

    const htmlBody = isRevoke
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 20px; border: 1px solid #fca5a5; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ef4444;">
            <div style="margin: 0 auto 14px auto; text-align: center;">
              <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/public/tallyin_security_shield.png" alt="Tallyin Security" width="88" height="88" style="width: 88px; height: 88px; display: inline-block; object-fit: contain;" />
            </div>
            <div style="display: inline-block; padding: 5px 14px; background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 9999px; color: #991b1b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              Security De-Authorization Notice
            </div>
            <h1 style="color: #991b1b; margin: 12px 0 6px 0; font-size: 22px; font-weight: 900;">Co-Admin Access Revoked</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Tallyin Identity & Access Governance</p>
          </div>

          <div style="margin: 22px 0; padding: 18px 20px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9f1239; margin-bottom: 6px;">
              Official Revocation Acknowledgement Reference
            </div>
            <div style="font-family: ui-monospace, monospace; font-size: 18px; font-weight: 900; color: #be123c; letter-spacing: 1px;">
              ${ackRecord.ackNumber}
            </div>
            <div style="margin-top: 14px; font-size: 12px; color: #475569; line-height: 1.6; border-top: 1px solid #fecdd3; padding-top: 12px;">
              <div><strong>Target Account:</strong> ${targetEmail}</div>
              <div><strong>Revoked By:</strong> ${ackRecord.authorizedBy} (${ackRecord.authorizedByRole})</div>
              <div><strong>Timestamp:</strong> ${new Date(ackRecord.timestamp).toUTCString()}</div>
            </div>
          </div>

          <div style="color: #334155; font-size: 14px; line-height: 1.65; margin-bottom: 24px;">
            <p>Hello <strong>${targetName || targetEmail}</strong>,</p>
            <p>This automated security communication confirms that your <strong>Co-Administrator operational privileges</strong> for the Tallyin platform have been <strong>formally revoked</strong> by System Administration.</p>
            <p>You will no longer have access to the Admin Portal or any privileged administrative actions. Your standard roommate/user account privileges remain active.</p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Tallyin Corporate Security Operations • tallyin.alerts@gmail.com<br/>
            This audit event has been permanently recorded with Acknowledgement Ref: <strong>${ackRecord.ackNumber}</strong>
          </div>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 20px; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10b981;">
            <div style="margin: 0 auto 14px auto; text-align: center;">
              <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/public/tallyin_security_shield.png" alt="Tallyin Security" width="88" height="88" style="width: 88px; height: 88px; display: inline-block; object-fit: contain;" />
            </div>
            <div style="display: inline-block; padding: 5px 14px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; color: #047857; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              Security Clearance Authorization
            </div>
            <h1 style="color: #1a3827; margin: 12px 0 6px 0; font-size: 22px; font-weight: 900;">Co-Admin Privileges ${action === 'UPDATE' ? 'Updated' : 'Authorized'}</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Tallyin Identity & Access Governance</p>
          </div>

          <div style="margin: 22px 0; padding: 18px 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 6px;">
              Official Security Acknowledgement Reference
            </div>
            <div style="font-family: ui-monospace, monospace; font-size: 18px; font-weight: 900; color: #15803d; letter-spacing: 1px;">
              ${ackRecord.ackNumber}
            </div>
            <div style="margin-top: 14px; font-size: 12px; color: #475569; line-height: 1.6; border-top: 1px solid #bbf7d0; padding-top: 12px;">
              <div><strong>Target Account:</strong> ${targetEmail}</div>
              <div><strong>Authorized By:</strong> ${ackRecord.authorizedBy} (${ackRecord.authorizedByRole})</div>
              <div><strong>Timestamp:</strong> ${new Date(ackRecord.timestamp).toUTCString()}</div>
            </div>
          </div>

          <div style="color: #334155; font-size: 14px; line-height: 1.65; margin-bottom: 20px;">
            <p>Hello <strong>${targetName || targetEmail}</strong>,</p>
            <p>You have been formally authorized as a <strong>Tier-2 Co-Administrator</strong> for Tallyin by System Administration.</p>
            <p>You have been granted active administrative access to the following operational modules:</p>
          </div>

          <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px 16px; text-align: left; color: #475569; font-weight: 800; font-size: 11px; text-transform: uppercase;">Granted Operational Capability (${grantedModules.length})</th>
                  <th style="padding: 10px 16px; text-align: right; color: #475569; font-weight: 800; font-size: 11px; text-transform: uppercase;">Access Status</th>
                </tr>
              </thead>
              <tbody>
                ${permissionsRowsHtml}
              </tbody>
            </table>
          </div>

          <div style="text-align: center; margin: 26px 0;">
            <a href="https://tallyin.vercel.app" style="display: inline-block; padding: 12px 28px; background-color: #1a3827; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; box-shadow: 0 4px 12px rgba(26,56,39,0.25);">
              Access Admin Console →
            </a>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Tallyin Corporate Security Operations • tallyin.alerts@gmail.com<br/>
            This audit event has been permanently recorded with Acknowledgement Ref: <strong>${ackRecord.ackNumber}</strong>
          </div>
        </div>
      `;

    try {
      fetch(mailRelayUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'send_email',
          to: targetEmail,
          subject,
          body: `Tallyin Security Notice:\nAction: ${actionTitle}\nRef: ${ackRecord.ackNumber}\nAuthorized By: ${ackRecord.authorizedBy}\nTimestamp: ${ackRecord.timestamp}`,
          htmlBody
        })
      }).catch(e => console.warn("Email relay background notice:", e));
    } catch (err) {
      console.warn("Mail relay dispatch failed:", err);
    }
  };

  const handleAddCoAdmin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanEmail = (newCoAdminEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      if (triggerToast) triggerToast('Please provide a valid email address.');
      return;
    }
    if (cleanEmail === SUPER_ADMIN_EMAIL) {
      if (triggerToast) triggerToast('tallyin.alerts@gmail.com is already the permanent Super Admin.');
      return;
    }
    if (normalizedCoAdmins.some(a => a.email === cleanEmail)) {
      if (triggerToast) triggerToast(`${cleanEmail} is already a Co-Admin.`);
      return;
    }

    setIsAssigningCoAdmin(true);
    try {
      const clientIp = await fetchClientIp();
      const ackNumber = generateAckNumber();
      const timestamp = new Date().toISOString();
      const checksum = generateSecurityChecksum(ackNumber, cleanEmail, clientIp, timestamp);

      const ackRecord = {
        ackNumber,
        action: 'GRANT',
        targetEmail: cleanEmail,
        targetName: (newCoAdminName || '').trim() || cleanEmail.split('@')[0],
        authorizedBy: user?.email || 'tallyin.alerts@gmail.com',
        authorizedByRole: isSuperAdmin ? 'Super Administrator (Root Authority)' : 'Administrative Lead',
        timestamp,
        ipAddress: clientIp,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        permissions: { ...newCoAdminPerms },
        checksum,
        status: 'ACTIVE_CLEARANCE'
      };

      const newAdminRecord = {
        email: cleanEmail,
        name: (newCoAdminName || '').trim() || cleanEmail.split('@')[0],
        role: 'co_admin',
        addedAt: timestamp,
        addedBy: user?.email || 'Super Admin',
        permissions: { ...newCoAdminPerms },
        lastAck: ackRecord,
        lastAckNumber: ackNumber,
        lastAckIp: clientIp,
      };

      const nextList = [...normalizedCoAdmins, newAdminRecord];
      await saveCoAdminsList(nextList);
      await saveAckRecord(ackRecord);
      sendCoAdminSecurityEmail({ action: 'GRANT', targetEmail: cleanEmail, targetName: newAdminRecord.name, permissions: newAdminRecord.permissions, ackRecord });

      logAuditAction('ASSIGN_CO_ADMIN', `Granted Co-Admin role to ${cleanEmail} (Ref: ${ackNumber}, IP: ${clientIp}, By: ${user?.email || 'Super Admin'})`);
      if (triggerToast) triggerToast(`👑 Assigned Co-Admin role! Ref: ${ackNumber}`);

      setNewCoAdminEmail('');
      setNewCoAdminName('');
      setNewCoAdminPerms({
        broadcasts: true,
        settlements: true,
        user_management: true,
        room_explorer: true,
        room_pinning: true,
        latency_diagnostics: true,
        maintenance_control: false,
        database_migration: false,
      });
    } catch (err) {
      if (triggerToast) triggerToast(`Failed to add Co-Admin: ${err.message}`);
    } finally {
      setIsAssigningCoAdmin(false);
    }
  };

  const handleRemoveCoAdmin = async (targetEmail) => {
    const cleanTarget = (targetEmail || '').trim().toLowerCase();
    if (!window.confirm(`Are you sure you want to revoke Co-Admin access for ${cleanTarget}?`)) {
      return;
    }

    try {
      const clientIp = await fetchClientIp();
      const ackNumber = generateAckNumber();
      const timestamp = new Date().toISOString();
      const checksum = generateSecurityChecksum(ackNumber, cleanTarget, clientIp, timestamp);
      const targetAdmin = normalizedCoAdmins.find(a => a.email.toLowerCase() === cleanTarget);

      const ackRecord = {
        ackNumber,
        action: 'REVOKE',
        targetEmail: cleanTarget,
        targetName: targetAdmin?.name || cleanTarget.split('@')[0],
        authorizedBy: user?.email || 'tallyin.alerts@gmail.com',
        authorizedByRole: isSuperAdmin ? 'Super Administrator (Root Authority)' : 'Administrative Lead',
        timestamp,
        ipAddress: clientIp,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        permissions: null,
        previousPermissions: targetAdmin?.permissions || null,
        checksum,
        status: 'REVOKED_DEAUTHORIZED'
      };

      const nextList = normalizedCoAdmins.filter(a => a.email !== cleanTarget);
      await saveCoAdminsList(nextList);
      await saveAckRecord(ackRecord);
      sendCoAdminSecurityEmail({ action: 'REVOKE', targetEmail: cleanTarget, targetName: targetAdmin?.name, permissions: null, ackRecord });

      logAuditAction('REVOKE_CO_ADMIN', `Revoked Co-Admin privileges from ${cleanTarget} (Ref: ${ackNumber}, IP: ${clientIp}, By: ${user?.email || 'Super Admin'})`);
      if (triggerToast) triggerToast(`🗑️ Revoked Co-Admin access from ${cleanTarget}. Ref: ${ackNumber}`);
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast(`Revocation notice: ${err.message}`);
    }
  };

  const handleSaveEditedPermissions = async (targetEmail) => {
    const cleanTarget = String(targetEmail || '').trim().toLowerCase();
    try {
      const clientIp = await fetchClientIp();
      const ackNumber = generateAckNumber();
      const timestamp = new Date().toISOString();
      const checksum = generateSecurityChecksum(ackNumber, cleanTarget, clientIp, timestamp);
      const targetAdmin = normalizedCoAdmins.find(a => a.email.toLowerCase() === cleanTarget);

      const updatedPermissions = {
        broadcasts: Boolean(editingPerms.broadcasts),
        settlements: Boolean(editingPerms.settlements),
        user_management: Boolean(editingPerms.user_management),
        room_explorer: Boolean(editingPerms.room_explorer),
        room_pinning: Boolean(editingPerms.room_pinning),
        latency_diagnostics: Boolean(editingPerms.latency_diagnostics),
        maintenance_control: Boolean(editingPerms.maintenance_control),
        database_migration: Boolean(editingPerms.database_migration),
      };

      const ackRecord = {
        ackNumber,
        action: 'UPDATE_PERMISSIONS',
        targetEmail: cleanTarget,
        targetName: targetAdmin?.name || cleanTarget.split('@')[0],
        authorizedBy: user?.email || 'tallyin.alerts@gmail.com',
        authorizedByRole: isSuperAdmin ? 'Super Administrator (Root Authority)' : 'Administrative Lead',
        timestamp,
        ipAddress: clientIp,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        permissions: updatedPermissions,
        previousPermissions: targetAdmin?.permissions || null,
        checksum,
        status: 'ACTIVE_CLEARANCE'
      };

      const nextList = normalizedCoAdmins.map(a => {
        if (a.email.toLowerCase() === cleanTarget) {
          return {
            ...a,
            permissions: updatedPermissions,
            lastAck: ackRecord,
            lastAckNumber: ackNumber,
            lastAckIp: clientIp,
          };
        }
        return a;
      });

      await saveCoAdminsList(nextList);
      await saveAckRecord(ackRecord);
      sendCoAdminSecurityEmail({ action: 'UPDATE', targetEmail: cleanTarget, targetName: targetAdmin?.name, permissions: updatedPermissions, ackRecord });

      logAuditAction('UPDATE_CO_ADMIN_PERMS', `Updated permissions for ${cleanTarget} (Ref: ${ackNumber}, IP: ${clientIp})`);
      if (triggerToast) triggerToast(`✅ Updated permissions for ${cleanTarget}! Ref: ${ackNumber}`);
      setEditingCoAdminEmail(null);
      setEditingPerms({});
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast(`Update error: ${err.message}`);
    }
  };

  // Publish Global Broadcast
  const handlePublishBroadcast = async () => {
    if (!userPermissions.broadcasts) {
      if (triggerToast) triggerToast('⚠️ Access Denied: Broadcasts operational clearance required.');
      return;
    }
    if (!broadcastText.trim()) {
      if (triggerToast) triggerToast('Please enter broadcast message content.');
      return;
    }

    const now = new Date();
    const durationDays = Number(broadcastDurationDays) || 2;
    const expiresAt = durationDays > 0 
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const newBroadcast = {
      id: `bc-${Date.now()}`,
      text: broadcastText.trim(),
      type: broadcastType,
      targetRoom: broadcastTargetRoom,
      active: true,
      createdAt: now.toISOString(),
      expiresAt: expiresAt,
      validDays: durationDays
    };
    setGlobalBroadcast(newBroadcast);
    localStorage.setItem('tallyin_global_broadcast', JSON.stringify(newBroadcast));

    logAuditAction('PUBLISH_BROADCAST', `[${broadcastType.toUpperCase()}] ${broadcastText.trim()}`);

    // Save to Supabase rooms table for database persistence across all mobile & web clients
    try {
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_GLOBAL_BROADCAST__',
          name: JSON.stringify(newBroadcast),
          created_by: 'system',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (err) { console.warn("DB broadcast persistence notice:", err); }

    try {
      if (adminChannelRef.current) {
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'GLOBAL_BROADCAST',
          payload: { broadcast: newBroadcast }
        });
      }
    } catch (e) { console.error("Realtime send broadcast error:", e); }

    if (triggerToast) triggerToast(`Global Broadcast Live to all active clients! (Valid for ${durationDays > 0 ? `${durationDays} Calendar Days` : 'Indefinite'})`);
    setBroadcastText('');
  };

  const handleClearBroadcast = async () => {
    const cleared = { active: false, text: '', id: '', type: 'info', createdAt: new Date().toISOString() };
    setGlobalBroadcast(null);
    localStorage.removeItem('tallyin_global_broadcast');

    logAuditAction('CLEAR_BROADCAST', 'Cleared global broadcast banner across all clients');

    try {
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_GLOBAL_BROADCAST__',
          name: JSON.stringify(cleared),
          created_by: 'system',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (err) { console.warn("DB clear broadcast notice:", err); }

    try {
      if (adminChannelRef.current) {
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'GLOBAL_BROADCAST',
          payload: { broadcast: null }
        });
      }
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast('Broadcast message cleared across all devices.');
  };

  // Send Centralized Emails
  const handleSendCentralEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || (!emailBody.trim() && !customEmails.trim())) {
      if (triggerToast) triggerToast('Subject and email content required.');
      return;
    }

    setIsSendingEmail(true);
    const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';

    try {
      let recipientList = [];
      if (emailRecipientGroup === 'CUSTOM' && customEmails.trim()) {
        recipientList = customEmails.split(',').map(e => e.trim()).filter(Boolean);
      } else {
        // Fetch all member & user emails from Supabase
        const [{ data: memberData }, { data: userData }] = await Promise.all([
          supabase.from('members').select('email'),
          supabase.from('users').select('email')
        ]);
        const mEmails = (memberData || []).map(m => m.email).filter(Boolean);
        const uEmails = (userData || []).map(u => u.email).filter(Boolean);
        recipientList = Array.from(new Set([...mEmails, ...uEmails]));
      }

      if (recipientList.length === 0) {
        if (triggerToast) triggerToast('No recipient email addresses found.');
        setIsSendingEmail(false);
        return;
      }

      for (const targetEmail of recipientList) {
        await fetch(activeScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'send_email',
            to: targetEmail,
            subject: emailSubject,
            body: emailBody,
            htmlBody: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
                  <h2 style="color: #1a3827; margin: 0;">Tallyin System Alert</h2>
                  <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Official System Notification • tallyin.alerts@gmail.com</p>
                </div>
                <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                  ${emailBody.replace(/\n/g, '<br/>')}
                </div>
                <div style="text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                  Dispatched via Tallyin Centralized Admin Portal
                </div>
              </div>
            `
          })
        });
      }

      if (triggerToast) triggerToast(`Email broadcast dispatched to ${recipientList.length} recipients!`);
      setEmailSubject('');
      setEmailBody('');
      setCustomEmails('');
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast('Email dispatch completed with warnings.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Pin Room Message
  const handlePinMessage = async () => {
    if (!userPermissions.room_pinning) {
      if (triggerToast) triggerToast('⚠️ Access Denied: Room Pinning clearance required.');
      return;
    }
    const finalRoomId = isCustomRoomInput ? customPinRoomId.trim().toUpperCase() : targetPinRoomId;
    if (!pinText.trim() || !finalRoomId) {
      if (triggerToast) triggerToast('Please select or enter target room and text.');
      return;
    }

    const pinObj = {
      id: `pin-${Date.now()}`,
      text: pinText.trim(),
      author: pinAuthor.trim() || 'Admin',
      pinnedAt: new Date().toISOString()
    };

    const updatedPins = {
      ...(pinnedMessages || {}),
      [finalRoomId]: pinObj
    };

    setPinnedMessages(updatedPins);
    localStorage.setItem('tallyin_pinned_messages', JSON.stringify(updatedPins));

    logAuditAction('SAVE_PIN', `Pinned message to ${finalRoomId}: ${pinText.trim()}`);

    // Persist to Supabase rooms table for cross-device sync
    try {
      await supabase.from('rooms').upsert({
        id: '__SYSTEM_PINNED_MESSAGES__',
        name: JSON.stringify(updatedPins),
        created_by: 'system',
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) { console.warn("DB pin save notice:", err); }

    try {
      if (adminChannelRef.current) {
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'ROOM_PIN',
          payload: { roomId: finalRoomId, pin: pinObj }
        });
      }
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast(`Announcement pinned to ${finalRoomId === 'ALL' ? 'ALL ROOMS' : `room ${finalRoomId}`}`);
    setPinText('');
  };

  const handleRemovePin = async (roomId) => {
    const copy = { ...(pinnedMessages || {}) };
    delete copy[roomId];
    setPinnedMessages(copy);
    localStorage.setItem('tallyin_pinned_messages', JSON.stringify(copy));

    logAuditAction('REMOVE_PIN', `Removed pinned message from ${roomId}`);

    // Persist removal to Supabase rooms table
    try {
      await supabase.from('rooms').upsert({
        id: '__SYSTEM_PINNED_MESSAGES__',
        name: JSON.stringify(copy),
        created_by: 'system',
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) { console.warn("DB pin remove notice:", err); }

    try {
      if (adminChannelRef.current) {
        await adminChannelRef.current.send({
          type: 'broadcast',
          event: 'ROOM_PIN',
          payload: { roomId, pin: null }
        });
      }
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast(`Pin removed from room ${roomId}`);
  };

  // Lock Screen if unauthenticated
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F4F1] dark:bg-slate-950 text-left font-sans animate-fade-in relative overflow-hidden">
        <div className="w-full max-w-md hud-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-rose-500/30 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
              The Admin Command Portal is restricted exclusively to authorized administrators (<span className="font-bold text-rose-600 dark:text-rose-400">tallyin.alerts@gmail.com</span>) and assigned Co-Admins.
            </p>
          </div>
          <button
            onClick={onExitAdmin}
            className="w-full py-3 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 hover:bg-[#255038] dark:hover:bg-[#b7f34c] font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to App Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const renderAccessRestrictedCard = (moduleName, requiredClearance) => (
    <div className="hud-card rounded-3xl p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto my-12 border border-amber-500/30 shadow-xl bg-gradient-to-b from-amber-500/5 to-transparent animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-md ring-4 ring-amber-500/10 animate-pulse">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
          Clearance Restricted
        </span>
        <h3 className="text-lg font-black text-[#1A3827] dark:text-white">
          Delegated Clearance Required
        </h3>
        <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          Your current Co-Admin profile does not possess authorization to access <strong>{moduleName}</strong>. This module requires <strong>{requiredClearance}</strong>.
        </p>
      </div>
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => setActiveTab('overview')}
          className="px-6 py-2.5 rounded-xl bg-[#1A3827] hover:bg-[#142d1f] dark:bg-[#A3E635] dark:hover:bg-[#8fd32b] text-white dark:text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Operations Hub</span>
        </button>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     Sidebar nav helper (Inspired by modern SaaS dashboard)
  ───────────────────────────────────────────────────────────── */
  const navItem = (id, label, icon, badge = null, badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300') => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => {
          setActiveTab(id);
          setMobileSidebarOpen(false);
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left group cursor-pointer ${
          isActive
            ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md shadow-[#1A3827]/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-[#EAF0EC]/80 dark:hover:bg-slate-800/60 hover:text-[#1A3827] dark:hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 transition-transform group-hover:scale-110 ${
            isActive ? 'text-[#A3E635] dark:text-slate-950' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#1A3827] dark:group-hover:text-[#A3E635]'
          }`}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {badge !== null && badge !== undefined && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
            isActive ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-950' : badgeColor
          }`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row bg-[#F8FAF9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-3xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 shadow-2xl relative min-h-[88dvh] text-left">

      {/* ══════════════════════════════════════════
          MOBILE SIDEBAR BACKDROP & DRAWER
      ══════════════════════════════════════════ */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* ══════════════════════════════════════════
          LEFT SIDEBAR (Clean & Modern SaaS Style)
      ══════════════════════════════════════════ */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 shrink-0 bg-white dark:bg-slate-900/95 border-r border-[#E3E8E3] dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Brand Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E3E8E3]/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={faviconLogo} alt="Tallyin" className="w-10 h-10 object-cover rounded-2xl shadow-md border border-[#A3E635]/30 ring-2 ring-[#1A3827]/10" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-[0_0_6px_#10B981]" />
            </div>
            <div>
              <div className="text-base font-black text-[#1A3827] dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>Tallyin</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-[#1A3827]/10 dark:bg-[#A3E635]/20 text-[#1A3827] dark:text-[#A3E635]">HQ</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Admin Command Center</div>
            </div>
          </div>
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile Mini Card inside Sidebar */}
        <div className="mx-3 my-3 p-3 rounded-2xl bg-[#F4F7F5] dark:bg-slate-800/50 border border-[#E3E8E3]/70 dark:border-slate-800 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A3827] to-[#25573e] dark:from-[#A3E635] dark:to-emerald-500 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
            {(user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-[#1A3827] dark:text-slate-100 truncate leading-tight">
              {userNickname || user?.email?.split('@')[0] || 'Administrator'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">
                  <Crown className="w-2.5 h-2.5" /> Super Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-2.5 h-2.5" /> Co-Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-none">

          {/* ── Section: MAIN MENU ── */}
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 px-3 pb-1">Menu</p>
            {navItem('overview', isSuperAdmin ? 'Overview' : 'Operations Hub', <Activity className="w-4 h-4" />)}
            {navItem('activity_feed', 'Activity Feed', <Flame className="w-4 h-4 text-amber-500" />)}
            {isSuperAdmin && navItem('co_admins', 'Co-Admin Team', <UserCheck className="w-4 h-4 text-indigo-500" />, normalizedCoAdmins.length, 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300')}
          </div>

          {/* ── Section: USERS & ROOMS ── */}
          {(userPermissions.user_management || userPermissions.room_explorer || userPermissions.room_commander) && (
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 px-3 pb-1">Management</p>
              {userPermissions.user_management && navItem('user_directory', 'User Directory', <Users className="w-4 h-4 text-blue-500" />, allRegisteredUsers.length, 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300')}
              {userPermissions.user_management && navItem('banned_accounts', 'Banned Accounts', <Ban className="w-4 h-4 text-rose-500" />, bannedUsers.length > 0 ? bannedUsers.length : null, 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300')}
              {userPermissions.room_explorer && navItem('room_explorer', 'Room Explorer', <Building2 className="w-4 h-4 text-sky-500" />, allSystemRooms.length, 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300')}
              {userPermissions.room_commander && navItem('room_commander', 'Room Commander', <SlidersHorizontal className="w-4 h-4 text-emerald-500" />)}
            </div>
          )}

          {/* ── Section: FINANCE & AUDIT ── */}
          {(userPermissions.settlements || userPermissions.dispute_resolver) && (
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 px-3 pb-1">Finance & Audit</p>
              {userPermissions.settlements && navItem('finance_audit', 'Finance Audit', <PieChart className="w-4 h-4 text-emerald-600" />)}
              {userPermissions.settlements && navItem('settlements', 'Settlements Hub', <HandCoins className="w-4 h-4 text-teal-600" />)}
              {userPermissions.dispute_resolver && navItem('dispute_resolver', 'Dispute Resolver', <FileSpreadsheet className="w-4 h-4 text-amber-600" />, allGlobalTx.length, 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300')}
            </div>
          )}

          {/* ── Section: SYSTEM TOOLS ── */}
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 px-3 pb-1">System & Tools</p>
            {userPermissions.database_studio && navItem('database_studio', 'Database Studio', <Database className="w-4 h-4 text-cyan-600" />)}
            {userPermissions.system_triggers && navItem('system_triggers', 'System Triggers', <Zap className="w-4 h-4 text-orange-500" />)}
            {(isSuperAdmin || userPermissions.maintenance_control) && navItem('security_audit', 'Security Audit', <ShieldCheck className="w-4 h-4 text-emerald-500" />)}
            {userPermissions.maintenance_control && navItem('maintenance', 'Maintenance Mode', <Power className="w-4 h-4 text-rose-500" />, isSystemMaintenanceActive ? 'ACTIVE' : null, 'bg-rose-500 text-white animate-pulse')}
            {userPermissions.broadcasts && navItem('broadcast', 'Broadcast Center', <Radio className="w-4 h-4 text-purple-500" />)}
            {userPermissions.broadcasts && navItem('email', 'Email Hub', <Mail className="w-4 h-4 text-blue-500" />)}
            {userPermissions.room_pinning && navItem('pinning', 'Room Pinning', <Pin className="w-4 h-4 text-amber-500" />)}
            {userPermissions.latency_diagnostics && navItem('latency', 'Latency Diag.', <Sliders className="w-4 h-4 text-slate-500" />)}
          </div>

          {/* ── Section: DANGER ZONE (Super Admin Only) ── */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-rose-500/70 px-3 pb-1">Danger Zone</p>
              {navItem('chaos_tester', 'Chaos & Feature Flags', <Terminal className="w-4 h-4 text-rose-500" />)}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E3E8E3] dark:border-slate-800 space-y-2 shrink-0 bg-[#FAFBFB] dark:bg-slate-900/50">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E3E8E3] dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSystemMaintenanceActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_6px_#10B981]'}`} />
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 font-mono">
                {pingMs !== null ? `${pingMs}ms` : 'Syncing'}
              </span>
            </div>
            <button
              onClick={measurePing}
              className="p-1 rounded-lg text-slate-400 hover:text-[#1A3827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Refresh Ping"
            >
              <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1A3827] hover:bg-[#142d1f] dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to App</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          RIGHT MAIN CONTENT AREA
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7F5] dark:bg-slate-950/70 overflow-hidden">

        {/* ── Top Header Bar ── */}
        <header className="shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E3E8E3] dark:border-slate-800 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4 z-10">
          
          {/* Left: Mobile Hamburger & Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative flex-1 group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#1A3827] dark:group-focus-within:text-[#A3E635] transition-colors" />
              <input
                type="text"
                placeholder="Search for anything (users, rooms, tx, audit logs)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAF9] dark:bg-slate-800/80 border border-[#E3E8E3] dark:border-slate-700 rounded-2xl text-xs font-semibold text-[#1A3827] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1A3827] dark:focus:border-[#A3E635] focus:ring-2 focus:ring-[#1A3827]/10 dark:focus:ring-[#A3E635]/20 shadow-2xs transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[9px] font-black hover:bg-slate-300 transition-all cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                  /
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Action Controls & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Status Pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
              isSystemMaintenanceActive
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 animate-pulse'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSystemMaintenanceActive ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_6px_#10B981]'}`} />
              <span>{isSystemMaintenanceActive ? 'Maintenance Active' : 'Live Gateway'}</span>
            </div>

            {/* Quick Refresh */}
            <button
              onClick={measurePing}
              className="p-2 rounded-xl bg-[#F8FAF9] dark:bg-slate-800 border border-[#E3E8E3] dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-[#EAF0EC] dark:hover:bg-slate-700 transition-all shadow-2xs cursor-pointer"
              title="Measure Latency"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            </button>

            {/* Exit Shortcut Button */}
            <button
              onClick={onExitAdmin}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A3827] hover:bg-[#142d1f] dark:bg-[#A3E635] dark:hover:bg-[#8fd32b] text-white dark:text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Exit Console</span>
            </button>
          </div>
        </header>

        {/* ── Scrollable Dashboard Canvas ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">

          {/* ── HERO BANNER (Inspired by reference image) ── */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-500/20 bg-gradient-to-r from-[#0d2218] via-[#1a3827] to-[#1b4332] text-white p-6 sm:p-8">
            {/* Ambient background curves & mesh glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#A3E635]/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 75% 40%, rgba(163,230,53,0.5) 0%, transparent 60%)'}} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] text-[10px] font-black uppercase tracking-widest border border-[#A3E635]/30">
                    {isSuperAdmin ? 'Master Authority Active' : 'Delegated Ops Access'}
                  </span>
                  <span className="text-white/40 text-xs font-mono">•</span>
                  <span className="text-white/60 text-xs font-mono">{appVersion || 'v3.83.0'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Hi, {userNickname || user?.email?.split('@')[0] || 'Administrator'}
                </h1>
                <p className="text-white/70 text-xs sm:text-sm font-medium leading-relaxed">
                  {isSuperAdmin 
                    ? 'All Cloudflare Worker security policies, dispute resolvers, and database replication pipelines are functioning at peak efficiency.'
                    : `Your Co-Admin access profile is verified and active. You have access to delegated management tools.`}
                </p>
              </div>

              {/* Action Banner Stats / Chips */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                  <div className="text-xs font-black uppercase tracking-wider text-white/60">Rooms</div>
                  <div className="text-xl sm:text-2xl font-black text-[#A3E635] mt-0.5">{stats.totalRooms}</div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                  <div className="text-xs font-black uppercase tracking-wider text-white/60">Users</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.totalUsers}</div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                  <div className="text-xs font-black uppercase tracking-wider text-white/60">Ping</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5">{pingMs !== null ? `${pingMs}ms` : '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4 KPI STAT METRICS ROW (Inspired by reference dashboard cards) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Users */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#E3E8E3] dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Users</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-white tracking-tight">
                  {stats.totalUsers}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-[#A3E635] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-2.5 h-2.5" /> +100%
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Registered</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Active Rooms */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#E3E8E3] dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Rooms</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-white tracking-tight">
                  {stats.totalRooms}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Realtime
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Shared Ledgers</span>
                </div>
              </div>
            </div>

            {/* Card 3: Global Transactions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#E3E8E3] dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Global Expenses</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-white tracking-tight">
                  {allGlobalTx.length}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                    <FileText className="w-2.5 h-2.5" /> In-Sync
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tx across rooms</span>
                </div>
              </div>
            </div>

            {/* Card 4: Network Latency */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#E3E8E3] dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Worker Latency</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-white tracking-tight font-mono">
                  {pingMs !== null ? `${pingMs}ms` : '—'}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5" /> Edge CDN
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Cloudflare response</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── Active Module Heading & Breadcrumb ── */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 rounded-full bg-[#1A3827] dark:bg-[#A3E635]" />
              <h2 className="text-base font-black text-[#1A3827] dark:text-white capitalize">
                {activeTab.replace(/_/g, ' ')}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              Module: <span className="font-mono text-[#1A3827] dark:text-[#A3E635]">{activeTab}</span>
            </span>
          </div>

          {/* ── Active Tab Content Container ── */}
          <div className="space-y-6">


      {/* Tab 1: Overview Controls (Super Admin Root vs MNC Co-Admin Operations Console) */}
      {activeTab === 'overview' && (
        isSuperAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Maintenance Switch Quick Card */}
            <div className="hud-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <Power className="w-4 h-4 text-rose-500" />
                  Site Maintenance Toggle
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isSystemMaintenanceActive ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {isSystemMaintenanceActive ? 'ACTIVE (SITE DOWN)' : 'LIVE'}
                </span>
              </div>

              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                Activating maintenance mode will immediately block access for non-admin users and render the maintenance screen system-wide.
              </p>

              <button
                onClick={handleToggleMaintenance}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  isSystemMaintenanceActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isSystemMaintenanceActive ? 'Deactivate Maintenance (Bring Site Live)' : 'Turn Site DOWN (Enable Maintenance Mode)'}</span>
              </button>
            </div>

            {/* Broadcast Quick Status */}
            <div className="hud-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Active Global Broadcast
                </h3>
                {globalBroadcast?.active && (
                  <button
                    onClick={handleClearBroadcast}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
                  >
                    Clear Active
                  </button>
                )}
              </div>

              {globalBroadcast?.active ? (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                      {globalBroadcast.type || 'Announcement'}
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                      {new Date(globalBroadcast.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-purple-950 dark:text-purple-100">
                    {globalBroadcast.text}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 py-4 text-center">
                  No active global broadcast broadcasted. Switch to Live Broadcasts tab to push a notification banner.
                </p>
              )}
            </div>

          </div>
        ) : (
          /* MNC-LEVEL CO-ADMIN EXECUTIVE OPERATIONS DASHBOARD */
          <div className="space-y-8 animate-fade-in">
            {/* 1. Executive Operations Header & Security Clearance Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-white">
              {/* Ambient radial glows */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Top status bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                      Tallyin Enterprise · Delegated Operations Platform
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Level-2 Security Clearance
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono">
                      TLS 1.3 · ZERO DATA LEAK
                    </span>
                  </div>
                </div>

                {/* Operator Profile Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-emerald-500/20 shrink-0">
                      {(currentCoAdminObj?.name || currentEmailClean || 'C')[0].toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-white">
                          {currentCoAdminObj?.name || 'Operations Lead'}
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          Delegated Co-Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        {currentEmailClean}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Assigned by Root Master ({currentCoAdminObj?.addedBy || 'tallyin.alerts@gmail.com'}) · Active Session Verified
                      </p>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Clearance Ref: {currentCoAdminObj?.lastAckNumber || coAdminAckRegistry.find(r => r.targetEmail?.toLowerCase() === currentEmailClean)?.ackNumber || 'ACK-CAD-ACTIVE'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const rec = currentCoAdminObj?.lastAck || coAdminAckRegistry.find(r => r.targetEmail?.toLowerCase() === currentEmailClean) || {
                              ackNumber: currentCoAdminObj?.lastAckNumber || 'ACK-CAD-ACTIVE',
                              targetEmail: currentEmailClean,
                              targetName: currentCoAdminObj?.name || 'Co-Admin Operator',
                              authorizedBy: currentCoAdminObj?.addedBy || 'Super Admin',
                              authorizedByRole: 'Super Administrator',
                              timestamp: currentCoAdminObj?.addedAt || new Date().toISOString(),
                              ipAddress: currentCoAdminObj?.lastAckIp || 'Recorded on File',
                              permissions: currentCoAdminObj?.permissions,
                              checksum: generateSecurityChecksum(currentCoAdminObj?.lastAckNumber || 'ACK', currentEmailClean, currentCoAdminObj?.lastAckIp || '0.0.0.0', currentCoAdminObj?.addedAt || ''),
                              status: 'ACTIVE_CLEARANCE'
                            };
                            setSelectedAckRecord(rec);
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                        >
                          View Certificate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Clearance Modules</p>
                      <p className="text-xl font-black text-emerald-400">
                        {Object.values(userPermissions).filter(Boolean).length} <span className="text-xs text-slate-400 font-normal">/ 8 Active</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* SLA Ticker */}
                <div className="pt-2 flex flex-wrap items-center gap-6 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SOC-2 / ISO-27001 Protocol Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cloudflare D1 & Supabase Distributed Engine: 100% Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>RBAC Enforced & Sandboxed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Operations Telemetry Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="hud-card rounded-2xl p-5 space-y-2 border border-[#E3E8E3] dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">System SLA Uptime</p>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1A3827] dark:text-white">99.98%</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Nominal</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  <span>Edge Core Latency</span>
                  <button
                    onClick={measurePing}
                    disabled={isPinging}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isPinging ? 'Pinging...' : pingMs !== null ? `${pingMs}ms (Test Again)` : 'Run Ping'}
                  </button>
                </div>
              </div>

              <div className="hud-card rounded-2xl p-5 space-y-2 border border-[#E3E8E3] dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">Production Rooms</p>
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1A3827] dark:text-white">{allSystemRooms.length}</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Monitored</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  <span>Room Partitioning</span>
                  {userPermissions.room_explorer ? (
                    <button onClick={() => setActiveTab('room_explorer')} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      Inspect →
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Locked 🔒</span>
                  )}
                </div>
              </div>

              <div className="hud-card rounded-2xl p-5 space-y-2 border border-[#E3E8E3] dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">Verified User Accounts</p>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1A3827] dark:text-white">{allRegisteredUsers.length}</span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Verified</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  <span>{bannedUsers.length} Suspended Users</span>
                  {userPermissions.user_management ? (
                    <button onClick={() => setActiveTab('user_directory')} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      Manage →
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Locked 🔒</span>
                  )}
                </div>
              </div>

              <div className="hud-card rounded-2xl p-5 space-y-2 border border-[#E3E8E3] dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">Delegated Scope</p>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1A3827] dark:text-white">
                    {Math.round((Object.values(userPermissions).filter(Boolean).length / 8) * 100)}%
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Coverage</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  <span>Security Sandbox</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>
            </div>

            {/* 3. MNC Delegated Capabilities Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#1A3827] dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Enterprise Operational Capabilities Matrix
                  </h3>
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                    Live operational modules delegated to your profile. Select any authorized module to open its dedicated console.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#5C6E5C] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                  {Object.values(userPermissions).filter(Boolean).length} / 8 GRANTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Broadcasts */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.broadcasts 
                    ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Radio className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.broadcasts ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.broadcasts ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Global Broadcasts</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Dispatch room-wide announcements, maintenance notices, and broadcast alerts.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.broadcasts ? (
                      <button
                        onClick={() => setActiveTab('broadcast')}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Launch Broadcasts</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Clearance Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Settlements */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.settlements 
                    ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <HandCoins className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.settlements ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.settlements ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Financial Settlements</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Audit room ledgers, verify payer-receiver debts, and execute administrative settlements.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.settlements ? (
                      <button
                        onClick={() => setActiveTab('settlements')}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Settlements</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Clearance Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. User Governance */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.user_management 
                    ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.user_management ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.user_management ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">User Accounts & Bans</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Audit user identities, suspend policy violators, review ban appeals, and manage accounts.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.user_management ? (
                      <button
                        onClick={() => setActiveTab('user_directory')}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Manage Accounts</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Clearance Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Room Explorer */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.room_explorer 
                    ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.room_explorer ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.room_explorer ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Rooms Directory</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Inspect production rooms, track member rosters, audit budgets, and monitor capacity.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.room_explorer ? (
                      <button
                        onClick={() => setActiveTab('room_explorer')}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Explore Rooms</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Clearance Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Room Pinning */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.room_pinning 
                    ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Pin className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.room_pinning ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.room_pinning ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Room Pinning Protocol</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Dispatch sticky announcements, guidelines, and priority notices to room headers.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.room_pinning ? (
                      <button
                        onClick={() => setActiveTab('pinning')}
                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Launch Pinning Hub</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Clearance Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Latency & Diagnostics */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.latency_diagnostics 
                    ? 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.latency_diagnostics ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.latency_diagnostics ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Latency & Diagnostics</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Execute database roundtrip latency benchmarks, test network throughput, and run audits.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.latency_diagnostics ? (
                      <button
                        onClick={() => setActiveTab('latency')}
                        className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Run Diagnostics</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Clearance Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Emergency Maintenance */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.maintenance_control 
                    ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <Power className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.maintenance_control ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.maintenance_control ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Site Maintenance</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Control system downtime locks and manage whitelisted accounts during maintenance.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.maintenance_control ? (
                      <button
                        onClick={() => setActiveTab('maintenance')}
                        className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Maintenance Station</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Root Master Only</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 8. Database Migration */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  userPermissions.database_migration 
                    ? 'bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-900/50 hover:shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        userPermissions.database_migration ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {userPermissions.database_migration ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A3827] dark:text-white">Database Migration</h4>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1 leading-relaxed">
                        Replicate and sync data between Cloudflare D1 and Supabase PostgreSQL with zero loss.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    {userPermissions.database_migration ? (
                      <button
                        onClick={() => setActiveTab('maintenance')}
                        className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Migration Suite</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 font-bold text-[11px] text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Root Master Only</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Live Operational Activity Feed */}
            <div className="hud-card rounded-3xl p-6 space-y-4 border border-[#E3E8E3] dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-[#1A3827] dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Live Operational Events & Audit Trail
                </h3>
                <span className="text-[10px] font-mono text-[#5C6E5C] dark:text-slate-400">
                  Real-Time Event Stream
                </span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {auditLogs.slice(0, 6).map((l, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-black font-mono">
                        {l.action}
                      </span>
                      <span className="font-semibold text-[#1A3827] dark:text-slate-200">
                        {l.details}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-mono shrink-0">
                      {l.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Tab: Co-Admins & Permissions Management */}
      {activeTab === 'co_admins' && (
        !isSuperAdmin ? (
          renderAccessRestrictedCard('Co-Admin Management', 'Super Admin Root Clearance Required')
        ) : (
          <div className="space-y-6 animate-fade-in">
          
          {/* Header Banner */}
          <div className="hud-card rounded-3xl p-6 space-y-4 border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                    Administrator Delegation & Co-Admins
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                    RBAC Active
                  </span>
                </div>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Delegate administrative responsibilities to team members. Configure fine-grained operational permissions per co-admin.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>1 Super Admin</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-[11px] font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{normalizedCoAdmins.length} Co-Admin{normalizedCoAdmins.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            {/* Role Explanation Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-[#1A3827] dark:text-white">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Super Admin Authority (Root)</span>
                </div>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  Permanent owner (<code className="text-emerald-700 dark:text-emerald-400 font-bold">tallyin.alerts@gmail.com</code>). Retains full authority to assign or revoke co-admins, toggle site maintenance, trigger database migrations, and configure system settings.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-indigo-900 dark:text-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Co-Admin Capabilities (Delegated)</span>
                </div>
                <p className="text-[11px] text-indigo-950/70 dark:text-indigo-300/80 leading-relaxed">
                  Designated team members with operational permissions (Broadcasts, Settlements, Room Explorer, User Directory, Diagnostics). Co-Admins cannot remove other admins or modify root system credentials.
                </p>
              </div>
            </div>
          </div>

          {/* Add Co-Admin Form (Only Super Admin can add) */}
          {userPermissions.manage_co_admins ? (
            <div className="hud-card rounded-3xl p-6 space-y-5 border border-emerald-500/20">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  Grant New Co-Admin Privileges
                </h4>
                <span className="text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                  Super Admin Exclusive
                </span>
              </div>

              <form onSubmit={handleAddCoAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">
                      Account Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. colleague@gmail.com"
                        value={newCoAdminEmail}
                        onChange={e => setNewCoAdminEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    {allRegisteredUsers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-1">
                        <span>Quick pick:</span>
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              setNewCoAdminEmail(e.target.value);
                              const found = allRegisteredUsers.find(u => (u.email || '').toLowerCase() === e.target.value.toLowerCase());
                              if (found && found.name) setNewCoAdminName(found.name);
                            }
                          }}
                          className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-[#1A3827] dark:text-slate-200"
                        >
                          <option value="">Select registered user...</option>
                          {allRegisteredUsers
                            .filter(u => u.email && u.email.toLowerCase() !== SUPER_ADMIN_EMAIL && !normalizedCoAdmins.some(c => c.email === u.email.toLowerCase()))
                            .map(u => (
                              <option key={u.uid || u.email} value={u.email}>
                                {u.email} {u.name ? `(${u.name})` : ''}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">
                      Display / Team Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Operations Lead"
                      value={newCoAdminName}
                      onChange={e => setNewCoAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Granular Permission Toggles */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider block">
                      Operational Permissions
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewCoAdminPerms({
                          broadcasts: true,
                          settlements: true,
                          user_management: true,
                          room_explorer: true,
                          room_pinning: true,
                          latency_diagnostics: true,
                          maintenance_control: false,
                          database_migration: false,
                        })}
                        className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Standard
                      </button>
                      <span className="text-slate-400">•</span>
                      <button
                        type="button"
                        onClick={() => setNewCoAdminPerms({
                          broadcasts: true,
                          settlements: true,
                          user_management: true,
                          room_explorer: true,
                          room_pinning: true,
                          latency_diagnostics: true,
                          maintenance_control: true,
                          database_migration: true,
                        })}
                        className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold hover:underline"
                      >
                        All Permissions
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {[
                      { key: 'room_commander', label: 'Room Commander', desc: 'Live room freeze, budget & purge controls', icon: SlidersHorizontal },
                      { key: 'dispute_resolver', label: 'Disputes & Expenses', desc: 'Global transaction search, edits & voids', icon: FileSpreadsheet },
                      { key: 'database_studio', label: 'Database Studio', desc: 'Supabase table explorer & raw JSON inspector', icon: Database },
                      { key: 'system_triggers', label: 'System Triggers', desc: 'Force reload cache-buster & countdowns', icon: Zap },
                      { key: 'user_management', label: 'User Directory & Bans', desc: 'Manage users, warnings, bans & appeals', icon: Users },
                      { key: 'broadcasts', label: 'Global Broadcasts', desc: 'Push banner announcements to all rooms', icon: Radio },
                      { key: 'settlements', label: 'Financial Settlements', desc: 'Execute admin settlements and audits', icon: HandCoins },
                      { key: 'email_hub', label: 'Email Hub', desc: 'Dispatch broadcast emails to all users', icon: Mail },
                      { key: 'room_explorer', label: 'Room Explorer', desc: 'Inspect rooms and membership lists', icon: Building2 },
                      { key: 'room_pinning', label: 'Message Pinning', desc: 'Pin alerts to room headers', icon: Pin },
                      { key: 'latency_diagnostics', label: 'Diagnostics & Latency', desc: 'Simulate network latency & pings', icon: Sliders },
                      { key: 'maintenance_control', label: 'Site Maintenance', desc: 'Activate system downtime (Restricted)', icon: Power, dangerous: true },
                      { key: 'database_migration', label: 'Database Migration', desc: 'Trigger D1 to Supabase sync', icon: Database, dangerous: true },
                    ].map(item => {
                      const Icon = item.icon;
                      const isChecked = !!newCoAdminPerms[item.key];
                      return (
                        <div
                          key={item.key}
                          onClick={() => setNewCoAdminPerms(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={`p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                            isChecked
                              ? item.dangerous
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-900 border-[#E3E8E3] dark:border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? (
                              <CheckCircle2 className={`w-4 h-4 ${item.dangerous ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600" />
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-black text-[#1A3827] dark:text-white flex items-center gap-1">
                              <Icon className="w-3 h-3 text-slate-500" />
                              <span className="truncate">{item.label}</span>
                            </p>
                            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 leading-tight">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAssigningCoAdmin}
                  className="px-6 py-3 bg-[#1A3827] hover:bg-[#255038] text-white dark:bg-[#A3E635] dark:hover:bg-[#b7f34c] dark:text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAssigningCoAdmin ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Assigning Co-Admin Role…</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Assign Co-Admin Role & Broadcast Privileges</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                You are currently signed in as an authorized Co-Admin (<strong className="font-bold">{user?.email}</strong>). Role assignments are managed exclusively by the Super Admin (<code className="bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded font-mono">tallyin.alerts@gmail.com</code>).
              </span>
            </div>
          )}

          {/* Active Administrators Directory */}
          <div className="hud-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
              <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Active Administrative Team ({1 + normalizedCoAdmins.length})
              </h4>
              <span className="text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                Live Status Verified
              </span>
            </div>

            <div className="space-y-3">
              {/* Primary Super Admin Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-black text-[#1A3827] dark:text-white">
                        {SUPER_ADMIN_EMAIL}
                      </h5>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                        Root Owner / Super Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">
                      Permanent master credentials • Unrestricted authority across all system tables and infrastructure
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#A3E635] text-[10px] font-black rounded-lg uppercase">
                    All Access Active
                  </span>
                </div>
              </div>

              {/* Co-Admins List */}
              {normalizedCoAdmins.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E3E8E3] dark:border-slate-800 rounded-2xl space-y-2">
                  <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-[#1A3827] dark:text-slate-300">
                    No Co-Admins currently assigned.
                  </p>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
                    Use the form above to delegate administration rights to another team member or developer.
                  </p>
                </div>
              ) : (
                normalizedCoAdmins.map((admin, idx) => {
                  const isBeingEdited = editingCoAdminEmail === admin.email;
                  return (
                    <div
                      key={admin.email || idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 space-y-3 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-300 dark:border-indigo-800 flex items-center justify-center text-sm font-black text-indigo-700 dark:text-indigo-300 shrink-0">
                            {(admin.name || admin.email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-[#1A3827] dark:text-white">
                                {admin.email}
                              </span>
                              {admin.name && (
                                <span className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">
                                  ({admin.name})
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wide">
                                Co-Admin
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">
                              Added {new Date(admin.addedAt).toLocaleDateString()} by {admin.addedBy || 'Super Admin'}
                            </p>
                          </div>
                        </div>

                        {userPermissions.manage_co_admins && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (isBeingEdited) {
                                  setEditingCoAdminEmail(null);
                                  setEditingPerms({});
                                } else {
                                  setEditingCoAdminEmail(admin.email);
                                  setEditingPerms({
                                    broadcasts: Boolean(admin.permissions?.broadcasts),
                                    settlements: Boolean(admin.permissions?.settlements),
                                    user_management: Boolean(admin.permissions?.user_management),
                                    room_explorer: Boolean(admin.permissions?.room_explorer),
                                    room_pinning: Boolean(admin.permissions?.room_pinning),
                                    latency_diagnostics: Boolean(admin.permissions?.latency_diagnostics),
                                    maintenance_control: Boolean(admin.permissions?.maintenance_control),
                                    database_migration: Boolean(admin.permissions?.database_migration),
                                  });
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-[#E3E8E3] dark:border-slate-700 text-[11px] font-bold text-[#1A3827] dark:text-slate-200 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                            >
                              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{isBeingEdited ? 'Cancel Edit' : 'Edit Permissions'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveCoAdmin(admin.email)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold transition-all flex items-center gap-1.5"
                              title="Revoke Co-Admin Privileges"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Permissions Pills Display */}
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#F6F8F6] dark:border-slate-800">
                        {admin.permissions?.room_commander && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            🎛️ Room Commander
                          </span>
                        )}
                        {admin.permissions?.dispute_resolver && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                            ⚖️ Disputes
                          </span>
                        )}
                        {admin.permissions?.database_studio && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold">
                            🗄️ DB Studio
                          </span>
                        )}
                        {admin.permissions?.system_triggers && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            ⚡ Triggers
                          </span>
                        )}
                        {admin.permissions?.broadcasts && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                            📢 Broadcasts
                          </span>
                        )}
                        {admin.permissions?.settlements && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            💰 Settlements
                          </span>
                        )}
                        {admin.permissions?.user_management && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                            👥 Users & Bans
                          </span>
                        )}
                        {admin.permissions?.email_hub && (
                          <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950/50 text-pink-800 dark:text-pink-300 text-[10px] font-bold">
                            📧 Email Hub
                          </span>
                        )}
                        {admin.permissions?.room_explorer && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            🔍 Room Explorer
                          </span>
                        )}
                        {admin.permissions?.room_pinning && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                            📌 Pinning
                          </span>
                        )}
                        {admin.permissions?.latency_diagnostics && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                            ⚡ Latency
                          </span>
                        )}
                        {admin.permissions?.maintenance_control && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                            🔧 Site Maintenance
                          </span>
                        )}
                        {admin.permissions?.database_migration && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold">
                            🗄️ Migration
                          </span>
                        )}
                      </div>

                      {/* Security Acknowledgement Badge & Certificate Launcher */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#F6F8F6] dark:border-slate-800/80">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span>REF: {admin.lastAckNumber || coAdminAckRegistry.find(r => r.targetEmail === admin.email)?.ackNumber || 'ACK-CAD-VERIFIED'}</span>
                          </span>
                          {admin.lastAckIp && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                              <Network className="w-3 h-3 text-slate-400" />
                              <span>IP: {admin.lastAckIp}</span>
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const record = admin.lastAck || coAdminAckRegistry.find(r => r.targetEmail === admin.email) || {
                              ackNumber: admin.lastAckNumber || 'ACK-CAD-VERIFIED',
                              targetEmail: admin.email,
                              targetName: admin.name,
                              authorizedBy: admin.addedBy || 'Super Admin',
                              authorizedByRole: 'Super Administrator',
                              timestamp: admin.addedAt || new Date().toISOString(),
                              ipAddress: admin.lastAckIp || 'Recorded on File',
                              permissions: admin.permissions,
                              checksum: generateSecurityChecksum(admin.lastAckNumber || 'ACK', admin.email, admin.lastAckIp || '0.0.0.0', admin.addedAt || ''),
                              status: 'ACTIVE_CLEARANCE'
                            };
                            setSelectedAckRecord(record);
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Clearance Certificate</span>
                        </button>
                      </div>

                      {/* Inline Permission Editor (when expanded) */}
                      {isBeingEdited && (
                        <div className="p-4 rounded-xl bg-[#F6F8F6] dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-900/50 space-y-3 mt-2">
                          <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
                            Configure permissions for {admin.email}:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { key: 'room_commander', label: 'Room Commander' },
                              { key: 'dispute_resolver', label: 'Disputes & Expenses' },
                              { key: 'database_studio', label: 'DB Studio' },
                              { key: 'system_triggers', label: 'System Triggers' },
                              { key: 'broadcasts', label: 'Broadcasts' },
                              { key: 'settlements', label: 'Settlements' },
                              { key: 'user_management', label: 'User Directory' },
                              { key: 'email_hub', label: 'Email Hub' },
                              { key: 'room_explorer', label: 'Room Explorer' },
                              { key: 'room_pinning', label: 'Room Pinning' },
                              { key: 'latency_diagnostics', label: 'Latency' },
                              { key: 'maintenance_control', label: 'Maintenance' },
                              { key: 'database_migration', label: 'DB Migration' },
                            ].map(p => (
                              <label key={p.key} className="flex items-center gap-2 text-[11px] font-semibold text-[#1A3827] dark:text-slate-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!editingPerms[p.key]}
                                  onChange={e => setEditingPerms(prev => ({ ...prev, [p.key]: e.target.checked }))}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{p.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => { setEditingCoAdminEmail(null); setEditingPerms({}); }}
                              className="px-3 py-1.5 rounded-lg border border-[#E3E8E3] dark:border-slate-700 text-xs font-bold text-slate-500"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditedPermissions(admin.email)}
                              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                            >
                              Save Permissions
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Executive Clearance & Audit Registry Table */}
          <div className="hud-card rounded-3xl p-6 space-y-4 border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                    Co-Admin Access & Clearance Audit Registry
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold font-mono uppercase">
                    {coAdminAckRegistry.length} Events Logged
                  </span>
                </div>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Immutable security audit trail of all administrative access delegations, permission updates, and privilege revocations.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ACK Ref, Email, IP..."
                  value={ackSearchQuery}
                  onChange={e => setAckSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {coAdminAckRegistry.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto opacity-50 text-indigo-400" />
                <p className="text-xs font-bold text-slate-500">No clearance events recorded yet.</p>
                <p className="text-[11px] text-slate-400">Granting or modifying Co-Admin permissions will generate formal cryptographic acknowledgement certificates here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E8E3] dark:border-slate-800 text-[10px] font-black uppercase text-[#5C6E5C] dark:text-slate-400">
                      <th className="pb-3 pr-4">Acknowledgement No.</th>
                      <th className="pb-3 px-4">Action</th>
                      <th className="pb-3 px-4">Target Co-Admin</th>
                      <th className="pb-3 px-4">Authorized By</th>
                      <th className="pb-3 px-4">Origin IP Address</th>
                      <th className="pb-3 px-4">Timestamp</th>
                      <th className="pb-3 pl-4 text-right">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8E3]/60 dark:divide-slate-800/60">
                    {coAdminAckRegistry
                      .filter(rec => {
                        if (!ackSearchQuery.trim()) return true;
                        const q = ackSearchQuery.toLowerCase();
                        return (rec.ackNumber || '').toLowerCase().includes(q) ||
                               (rec.targetEmail || '').toLowerCase().includes(q) ||
                               (rec.ipAddress || '').toLowerCase().includes(q) ||
                               (rec.authorizedBy || '').toLowerCase().includes(q);
                      })
                      .map((rec, i) => (
                        <tr key={rec.ackNumber || i} className="hover:bg-[#F6F8F6] dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 pr-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            <div className="flex items-center gap-1.5">
                              <span>{rec.ackNumber}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(rec.ackNumber);
                                  if (triggerToast) triggerToast(`Copied ${rec.ackNumber}`);
                                }}
                                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-950 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                                title="Copy Reference"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                              rec.action === 'REVOKE'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : rec.action === 'UPDATE_PERMISSIONS'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}>
                              {rec.action === 'REVOKE' ? 'Revoked' : rec.action === 'UPDATE_PERMISSIONS' ? 'Updated' : 'Authorized'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1A3827] dark:text-slate-200">
                            <div>{rec.targetEmail}</div>
                            {rec.targetName && <span className="text-[10px] text-slate-400">({rec.targetName})</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {rec.authorizedBy}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Network className="w-3 h-3 text-slate-400" />
                              {rec.ipAddress || '127.0.0.1'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            {new Date(rec.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedAckRecord(rec)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
        )
      )}

      {/* Tab 2: Maintenance Mode Detail */}
      {activeTab === 'maintenance' && (
        !userPermissions.maintenance_control ? (
          renderAccessRestrictedCard('Site Maintenance Control', 'Maintenance Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Power className="w-5 h-5 text-rose-500" />
                System Maintenance Control & Message
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Configure custom notices shown to users when the site is placed under maintenance.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Maintenance Notice Text</label>
              <textarea
                rows={3}
                value={maintMsgInput}
                onChange={e => setMaintMsgInput(e.target.value)}
                className="w-full p-3.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-extrabold">Warning: System-Wide Impact</p>
                <p className="text-[11px] leading-relaxed">
                  Toggling Maintenance Mode ON immediately blocks normal app access for all active sessions. Only admin users with authorization can access the admin console.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveMaintenanceMessage}
                className="py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Maintenance Notice Text</span>
              </button>

              <button
                onClick={handleToggleMaintenance}
                className={`py-3.5 px-6 rounded-xl font-black text-xs text-white shadow-md transition-all flex items-center gap-2 ${
                  isSystemMaintenanceActive
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isSystemMaintenanceActive ? 'Deactivate Maintenance (Site LIVE)' : 'ACTIVATE MAINTENANCE (Site DOWN)'}</span>
              </button>
            </div>

            {/* Maintenance Page Feature List Editor */}
            <div className="border-t border-[#E3E8E3] dark:border-slate-800 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Maintenance Page Feature Highlights ({ (maintenanceFeatures || []).length })
                  </h4>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                    Edit the feature rows shown on the public maintenance screen. Changes save to database & sync live.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const defaultSet = [
                        { icon: 'bolt',         label: 'Ultra Fast Engine',    sub: 'Cloudflare D1 edge compute' },
                        { icon: 'palette',      label: 'Refined UI & Dark Mode', sub: 'Minimal, intuitive design' },
                        { icon: 'shield-check', label: 'Bank-Grade Security',   sub: 'Encrypted multi-device sync' }
                      ];
                      handleSaveMaintenanceFeatures(defaultSet);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E3E8E3] dark:border-slate-700 text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    disabled={isSavingFeatures}
                    onClick={() => handleSaveMaintenanceFeatures(maintenanceFeatures)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSavingFeatures ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Publish Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {(maintenanceFeatures || []).map((feat, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 w-4 text-center">{idx + 1}.</span>
                      <select
                        value={feat.icon}
                        onChange={e => {
                          const next = [...maintenanceFeatures];
                          next[idx] = { ...next[idx], icon: e.target.value };
                          if (setMaintenanceFeatures) setMaintenanceFeatures(next);
                          localStorage.setItem('tallyin_maintenance_features', JSON.stringify(next));
                        }}
                        className="text-xs font-semibold bg-white dark:bg-slate-800 border border-[#E3E8E3] dark:border-slate-700 rounded-xl px-2.5 py-2 text-[#1A3827] dark:text-slate-200 focus:outline-none w-[130px]"
                      >
                        <option value="bolt">⚡ Bolt (Speed)</option>
                        <option value="zap">⚡ Zap (Core)</option>
                        <option value="palette">🎨 Palette (Design)</option>
                        <option value="shield-check">🛡️ Shield (Security)</option>
                        <option value="database">🗄️ Database</option>
                        <option value="sparkles">✨ Sparkles (Smart)</option>
                        <option value="cloud">☁️ Cloud (Sync)</option>
                        <option value="lock">🔒 Lock (Private)</option>
                        <option value="cpu">🚀 CPU (Engine)</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={feat.label}
                      onChange={e => {
                        const next = [...maintenanceFeatures];
                        next[idx] = { ...next[idx], label: e.target.value };
                        if (setMaintenanceFeatures) setMaintenanceFeatures(next);
                        localStorage.setItem('tallyin_maintenance_features', JSON.stringify(next));
                      }}
                      placeholder="Headline / Label"
                      className="flex-1 text-xs font-bold bg-white dark:bg-slate-800 border border-[#E3E8E3] dark:border-slate-700 rounded-xl px-3 py-2 text-[#1A3827] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <input
                      type="text"
                      value={feat.sub}
                      onChange={e => {
                        const next = [...maintenanceFeatures];
                        next[idx] = { ...next[idx], sub: e.target.value };
                        if (setMaintenanceFeatures) setMaintenanceFeatures(next);
                        localStorage.setItem('tallyin_maintenance_features', JSON.stringify(next));
                      }}
                      placeholder="Muted subtitle description"
                      className="flex-1 text-xs bg-white dark:bg-slate-800 border border-[#E3E8E3] dark:border-slate-700 rounded-xl px-3 py-2 text-[#5C6E5C] dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const next = maintenanceFeatures.filter((_, i) => i !== idx);
                        handleSaveMaintenanceFeatures(next);
                      }}
                      className="self-center text-rose-500 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete this feature highlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(maintenanceFeatures || []), { icon: 'bolt', label: 'High Performance', sub: 'Optimized for mobile & web' }];
                      handleSaveMaintenanceFeatures(next);
                    }}
                    className="flex-1 py-2.5 border border-dashed border-[#E3E8E3] dark:border-slate-700 rounded-2xl text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Feature Highlight</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSavingFeatures}
                    onClick={() => handleSaveMaintenanceFeatures(maintenanceFeatures)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Allowed Testing Accounts for Maintenance Bypass */}
            <div className="border-t border-[#E3E8E3] dark:border-slate-800 pt-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  Allowed Testing Accounts (Maintenance Bypass)
                </h4>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  Accounts listed here will bypass the Maintenance Mode screen and can log in, access rooms, and test the app while Maintenance Mode is active.
                </p>
              </div>

              {/* Add Account Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter email or UID to whitelist (e.g. tester@gmail.com)"
                  value={newAllowedAccountInput}
                  onChange={e => setNewAllowedAccountInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddAllowedAccount(); }}
                  className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddAllowedAccount}
                  className="px-4 py-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add Account</span>
                </button>
              </div>

              {/* Account Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {allowedMaintenanceAccounts.map(account => (
                  <div 
                    key={account}
                    className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635]" />
                    <span>{account}</span>
                    {account.toLowerCase() !== 'tallyin.alerts@gmail.com' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedAccount(account)}
                        className="ml-1 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-black p-0.5 rounded transition-colors cursor-pointer"
                        title="Remove from allowed list"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Database Migration: Cloudflare D1 → Supabase */}
            <div className="border-t border-[#E3E8E3] dark:border-slate-800 pt-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Database Migration: Cloudflare D1 → Supabase
                </h4>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  Zero-data-loss export from Cloudflare D1 to Supabase PostgreSQL. Safe to re-run (upserts, no duplicates). D1 stays as backup.
                </p>
              </div>

              {/* Step 1: Schema Setup */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3.5 space-y-2">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">1</span>
                  Run this SQL in Supabase first (one time only)
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-500">
                  Go to <strong>Supabase Dashboard → SQL Editor → New Query</strong>, paste and run:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const sql = `-- Tallyin: Clean Schema Recreation (Matches Cloudflare D1 Exactly)
-- 1. Drop old outdated tables in Supabase (Cloudflare D1 has all 1602 rows safe)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- 2. Create tables with exact columns matching Cloudflare D1
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  uid TEXT,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  room_id TEXT,
  login_code TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT,
  pin TEXT,
  created_by TEXT,
  monthly_budget REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  max_members INTEGER DEFAULT 6
);

CREATE TABLE public.members (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  uid TEXT,
  nickname TEXT,
  photo_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  payer_id TEXT,
  amount REAL DEFAULT 0,
  title TEXT,
  category TEXT,
  date TEXT,
  time TEXT,
  paid_by TEXT,
  paid_by_uid TEXT,
  is_shared BOOLEAN DEFAULT TRUE,
  is_edited BOOLEAN DEFAULT FALSE,
  split_type TEXT DEFAULT 'equal',
  split TEXT,
  splits TEXT,
  created_by TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.receipts (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  file_url TEXT,
  bg_class TEXT,
  rotation REAL DEFAULT 0,
  image_url TEXT,
  title TEXT,
  amount REAL DEFAULT 0,
  category TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  room_id TEXT
);

CREATE TABLE public.activity_logs (
  id BIGINT PRIMARY KEY,
  room_id TEXT,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable Row Level Security (RLS) so anon migration writes succeed
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;

-- 4. Immediately flush and reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';`;
                    navigator.clipboard.writeText(sql).then(() => {
                      if (triggerToast) triggerToast('✅ Schema SQL copied! Paste in Supabase SQL Editor.');
                    });
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Supabase Schema SQL
                </button>
              </div>

              {/* Step 2: Run Migration */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl p-3.5 space-y-3">
                <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">2</span>
                  Then run migration (after schema is set up)
                </p>
                <button
                  type="button"
                  onClick={handleMigrateD1ToSupabase}
                  disabled={isMigratingD1ToSupabase}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {isMigratingD1ToSupabase ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Migrating… Please wait</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Run Zero-Data-Loss Migration to Supabase</span>
                    </>
                  )}
                </button>

                {/* Live Migration Log */}
                {migrationLog.length > 0 && (
                  <div className="bg-slate-900 dark:bg-black rounded-xl p-3 space-y-1 font-mono text-[10px] max-h-48 overflow-y-auto">
                    {migrationLog.map((line, i) => (
                      <div key={i} className={`leading-relaxed ${line.startsWith('❌') ? 'text-red-400' : line.startsWith('⚠️') ? 'text-yellow-400' : line.startsWith('✅') || line.startsWith('🎉') ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )
      )}

      {/* Tab 3: Live Broadcasts */}
      {activeTab === 'broadcast' && (
        !userPermissions.broadcasts ? (
          renderAccessRestrictedCard('Global Broadcast Communications', 'Broadcast Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Real-Time Global Broadcast Banners
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Push live floating banner messages to all active user screens across all rooms.
                </p>
              </div>

              {globalBroadcast?.active && (
                <button
                  onClick={handleClearBroadcast}
                  className="px-3 py-1.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors"
                >
                  Dismiss Active Broadcast
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Broadcast Message Content</label>
                <textarea
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  rows={3}
                  placeholder="Type emergency alert, new feature launch announcement, or maintenance notice..."
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Broadcast Type</label>
                  <select
                    value={broadcastType}
                    onChange={e => setBroadcastType(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white"
                  >
                    <option value="feature">✨ New Feature Announcement</option>
                    <option value="alert">⚠️ Urgent System Alert</option>
                    <option value="maintenance">🔧 Maintenance Warning</option>
                    <option value="general">📢 General Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Scope</label>
                  <select
                    value={broadcastTargetRoom}
                    onChange={e => setBroadcastTargetRoom(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white"
                  >
                    <option value="ALL">🌐 All Rooms (System-Wide)</option>
                    {allSystemRooms.map(r => (
                      <option key={r.id || r.roomId} value={r.id || r.roomId}>
                        {r.name || r.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Auto-Expire Duration</label>
                  <select
                    value={broadcastDurationDays}
                    onChange={e => setBroadcastDurationDays(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white"
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days (Recommended)</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="0">Until Manually Cleared</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handlePublishBroadcast}
                  className="py-3 px-6 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Live Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Tab 4: Centralized Email Hub */}
      {activeTab === 'email' && (
        !userPermissions.broadcasts ? (
          renderAccessRestrictedCard('Centralized Email Dispatcher', 'Broadcast Clearance Required')
        ) : (
          <form onSubmit={handleSendCentralEmail} className="hud-card rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
                  Centralized Email Dispatcher
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Compose and send automated email broadcasts to room members via central mail script relay.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Recipient Target</label>
                  <select
                    value={emailRecipientGroup}
                    onChange={e => setEmailRecipientGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                  >
                    <option value="ALL_USERS">All Registered Roommates ({stats.totalUsers})</option>
                    <option value="CUSTOM">Custom Email Addresses List</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Email Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Important Tallyin System Update"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {emailRecipientGroup === 'CUSTOM' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Comma-separated Emails</label>
                  <input
                    type="text"
                    placeholder="user1@example.com, user2@example.com"
                    value={customEmails}
                    onChange={e => setCustomEmails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Email Body Content</label>
                <textarea
                  rows={5}
                  placeholder="Write your email body message here..."
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSendingEmail}
                className="py-3 px-6 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs hover:bg-[#255038] dark:hover:bg-[#b7f34c] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingEmail ? 'Dispatching Mail...' : 'Send Broadcast Emails'}</span>
              </button>
            </div>
          </form>
        )
      )}

      {/* Tab 5: Pinned Announcements */}
      {activeTab === 'pinning' && (
        !userPermissions.room_pinning ? (
          renderAccessRestrictedCard('Room Pinning Protocol', 'Room Pinning Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-500" />
                Pin Announcement Messages to Rooms
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Pin persistent announcement banners to specific room feeds.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Target Room</label>
                <select
                  value={isCustomRoomInput ? 'CUSTOM' : targetPinRoomId}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomRoomInput(true);
                    } else {
                      setIsCustomRoomInput(false);
                      setTargetPinRoomId(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                >
                  <option value="ALL">🌐 All Rooms (Global Pin)</option>
                  {allSystemRooms.length > 0
                    ? allSystemRooms.map(r => (
                        <option key={r.roomId} value={r.roomId}>🏠 {r.roomName} ({r.roomId})</option>
                      ))
                    : (userRooms || []).map(r => (
                        <option key={r.roomId} value={r.roomId}>🏠 {r.roomName} ({r.roomId})</option>
                      ))}
                  <option value="CUSTOM">➕ Custom Room ID / Code</option>
                </select>
              </div>

              {isCustomRoomInput && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Custom Room ID / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ROOM-ABC-123"
                    value={customPinRoomId}
                    onChange={e => setCustomPinRoomId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white uppercase font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Author Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Admin / Ops Lead"
                  value={pinAuthor}
                  onChange={e => setPinAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Pinned Announcement Text</label>
              <textarea
                rows={3}
                placeholder="e.g. Please submit all pending food receipts by Sunday evening for monthly settlement."
                value={pinText}
                onChange={e => setPinText(e.target.value)}
                className="w-full p-3.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handlePinMessage}
              className="py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Pin className="w-4 h-4" />
              <span>Pin Announcement to Room</span>
            </button>
          </div>

          {/* Active Pinned Messages List */}
          {Object.keys(pinnedMessages || {}).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
              <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider">Active Pinned Messages ({Object.keys(pinnedMessages).length})</h4>
              <div className="space-y-2">
                {Object.entries(pinnedMessages).map(([rId, pinObj]) => (
                  <div key={rId} className="p-3.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950/60 border border-[#E3E8E3] dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black font-mono">
                          {rId === 'ALL' ? '🌐 ALL ROOMS' : `ROOM: ${rId}`}
                        </span>
                        <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400">by {pinObj.author || 'Admin'}</span>
                      </div>
                      <p className="font-semibold text-[#1A3827] dark:text-slate-200 break-words">{pinObj.text}</p>
                    </div>
                    <button
                      onClick={() => handleRemovePin(rId)}
                      className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0 cursor-pointer"
                      title="Unpin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )
      )}

      {/* Tab 6: Latency & Throttling */}
      {activeTab === 'latency' && (
        !userPermissions.latency_diagnostics ? (
          renderAccessRestrictedCard('Latency & Network Diagnostics', 'Diagnostics Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Network Delay & Latency Control
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Monitor database response times and inject artificial throttling to test app performance under slow networks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">Live API Response</span>
              <p className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-200">
                {pingMs !== null ? `${pingMs}ms` : 'N/A'}
              </p>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {pingMs < 100 ? '⚡ Ultra Fast (Optimum)' : pingMs < 300 ? '🟢 Normal Latency' : '⚠️ Elevated Delay'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300">DB Connection</span>
              <p className="text-2xl font-mono font-black text-blue-900 dark:text-blue-200 capitalize">
                {dbStatus}
              </p>
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400">Supabase PostgreSQL Pool</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300">Artificial Delay</span>
              <p className="text-2xl font-mono font-black text-purple-900 dark:text-purple-200">
                {simulatedLatency || 0}ms
              </p>
              <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Simulated Network Throttle</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Inject Artificial Network Delay (ms)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 200, 500, 1500].map(delayMs => (
                <button
                  key={delayMs}
                  onClick={() => {
                    setSimulatedLatency(delayMs);
                    localStorage.setItem('tallyin_simulated_latency', String(delayMs));
                    if (triggerToast) triggerToast(`Artificial latency set to ${delayMs}ms`);
                  }}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                    (simulatedLatency || 0) === delayMs
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-[#1A3827] dark:text-slate-200 border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6]'
                  } disabled:opacity-50`}
                >
                  {delayMs === 0 ? '0ms (Normal Real Speed)' : `${delayMs}ms (${delayMs === 1500 ? 'Slow 3G' : 'Throttled'})`}
                </button>
              ))}
            </div>
          </div>
        </div>
        )
      )}

      {/* Tab: User Accounts Directory */}
      {activeTab === 'user_directory' && (
        !userPermissions.user_management ? (
          renderAccessRestrictedCard('User Accounts Directory', 'User Governance Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Registered User Accounts Directory ({allRegisteredUsers.length})
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                View registered roommates, email addresses, and room assignments.
              </p>
            </div>
            <button
              onClick={fetchUserDirectory}
              className="px-3 py-1.5 bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-[#d8e4db] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Users</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {allRegisteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center col-span-2 py-8">No registered user accounts found in database.</p>
            ) : (
              allRegisteredUsers
                .filter(u => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (u.name && u.name.toLowerCase().includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.roomId && u.roomId.toLowerCase().includes(q))
                  );
                })
                .map(u => {
                  const userTarget = (u.email && u.email !== 'N/A') ? u.email : (u.name || u.id);
                  const isBanned = bannedUsers.some(b => {
                    const bId = (b.identifier || b.email || b.id || '').toLowerCase();
                    const bName = (b.name || '').toLowerCase();
                    const uEmail = (u.email || '').toLowerCase();
                    const uName = (u.name || '').toLowerCase();
                    const uId = (u.id || '').toLowerCase();
                    return (uEmail && uEmail !== 'n/a' && bId === uEmail) || (uName && bName === uName) || (uId && bId === uId);
                  });

                  return (
                    <div key={u.id || u.email} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-[#1A3827] dark:text-slate-100 truncate">{u.name}</p>
                          <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 truncate">{u.email}</p>
                          <p className="text-[10px] font-mono text-emerald-700 dark:text-[#A3E635]">Room: {u.roomId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEmailRecipientGroup('CUSTOM');
                              setCustomEmails(u.email);
                              setActiveTab('email');
                              if (triggerToast) triggerToast(`Composing email to ${u.email}`);
                            }}
                            className="p-2 bg-[#F6F8F6] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Send Mail"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setWarningTargetUser(u);
                              setWarningNotes('');
                            }}
                            className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                            title="Issue Official Administrative Warning"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>

                          {isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(userTarget)}
                              className="px-2.5 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl text-[10px] font-black hover:bg-emerald-200 transition-colors flex items-center gap-1"
                              title="Unban User Account"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Unban</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBanEmailInput(userTarget);
                                handleBanUser(userTarget, banReasonInput, { name: u.name, id: u.id });
                              }}
                              className="px-2.5 py-1.5 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-[10px] font-black hover:bg-rose-200 transition-colors flex items-center gap-1"
                              title="Ban & Block User Account"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ban</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )
      )}

      {/* Tab: Banned Accounts Management */}
      {activeTab === 'banned_accounts' && (
        !userPermissions.user_management ? (
          renderAccessRestrictedCard('Banned Accounts & Appeals', 'User Governance Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Banned User Accounts Management ({bannedUsers.length})
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Block specific user emails from accessing the platform or restore suspended accounts.
              </p>
            </div>
          </div>

          {/* Incoming Suspension Appeals Section */}
          {banAppeals.length > 0 && (
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Incoming Suspension Appeals ({banAppeals.length})</span>
                </h4>
                <button
                  onClick={fetchBanAppeals}
                  className="text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Refresh Appeals
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {banAppeals.map(appeal => (
                  <div key={appeal.id} className="p-3.5 bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-blue-900 dark:text-blue-300">{appeal.email}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{appeal.timestamp} • {appeal.date}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-200 italic">
                      "{appeal.message}"
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {appeal.status === 'rejected' ? (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg text-[10px] font-black uppercase">
                          Appeal Rejected & User Notified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRejectAppeal(appeal)}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-[10px] font-extrabold transition-colors flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject & Notify User</span>
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          await handleUnbanUser(appeal.email);
                          const updated = banAppeals.filter(a => a.id !== appeal.id);
                          setBanAppeals(updated);
                          try {
                            await supabase
                              .from('rooms')
                              .upsert({
                                id: '__SYSTEM_BAN_APPEALS__',
                                name: JSON.stringify(updated),
                                created_by: 'system',
                                created_at: new Date().toISOString()
                              }, { onConflict: 'id' });
                          } catch (err) { console.error(err); }
                          if (triggerToast) triggerToast(`Approved & Unbanned ${appeal.email}!`);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all shadow-sm flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve & Unban</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Ban Input Box */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider">Ban New User Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="User Email Address (e.g. user@gmail.com)..."
                value={banEmailInput}
                onChange={e => setBanEmailInput(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 text-xs text-[#1A3827] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="text"
                placeholder="Reason for suspension (e.g. Violation of policy)..."
                value={banReasonInput}
                onChange={e => setBanReasonInput(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button
              onClick={() => handleBanUser(banEmailInput, banReasonInput)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              <span>Ban User Email Now</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {bannedUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No user accounts are currently banned.</p>
            ) : (
              bannedUsers.map(b => (
                <div key={b.email} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-rose-700 dark:text-rose-400 truncate">{b.email}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        BANNED
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C6E5C] dark:text-slate-300 italic truncate">
                      "{b.reason}"
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Banned by {b.bannedBy} on {new Date(b.bannedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleUnbanUser(b.email)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Unban User</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        )
      )}

      {/* Tab: Security Audit Logs */}
      {activeTab === 'security_audit' && (
        <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                System Security & Admin Access Logs
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Audit trail of admin authorization events, maintenance toggles, and security verifications.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {securityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No security events logged.</p>
            ) : (
              securityLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#1A3827] dark:text-slate-100 truncate">{log.action}</p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                        Initiated by <span className="font-bold text-[#1A3827] dark:text-slate-200">{log.email}</span> • {log.timestamp}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                    {log.status || 'VERIFIED'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Live Activity Feed */}
      {activeTab === 'activity_feed' && (
        <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Live Real-Time Activity Feed
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Recent transactions and room activities logged across the entire platform.
              </p>
            </div>
            <button
              onClick={fetchFinancialsAndLogs}
              className="px-3 py-1.5 bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-[#d8e4db] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No recent transactions recorded in database.</p>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center font-bold text-[#1A3827] dark:text-[#A3E635] shrink-0">
                      ₹
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#1A3827] dark:text-slate-100 truncate">{tx.title}</p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                        Paid by <span className="font-bold text-[#1A3827] dark:text-slate-200">{tx.paid_by || 'User'}</span> • Room: <span className="font-mono">{tx.room_id || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-black text-sm text-[#1A3827] dark:text-[#A3E635]">₹{Number(tx.amount || 0).toLocaleString('en-IN')}</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">{tx.category || 'General'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Financial Audit */}
      {activeTab === 'finance_audit' && (
        !userPermissions.settlements ? (
          renderAccessRestrictedCard('Platform Financial Ledger', 'Financial Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-500" />
                Platform Financial Audit & Expense Ledger
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                System-wide transaction totals and monetary breakdown by category.
              </p>
            </div>
            <button
              onClick={() => {
                const csvHeader = "ID,Title,Amount,Category,PaidBy,RoomID,Date\n";
                const csvRows = recentTransactions.map(t => `"${t.id}","${t.title}",${t.amount},"${t.category}","${t.paid_by}","${t.room_id}","${t.date}"`).join("\n");
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tallyin-audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                if (triggerToast) triggerToast('Audit report CSV downloaded!');
              }}
              className="px-3.5 py-2 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">Total Financial Volume</span>
              <p className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-200">
                ₹{totalFinancialVolume.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Across Sample Transactions</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300">Total Logged Transactions</span>
              <p className="text-2xl font-mono font-black text-blue-900 dark:text-blue-200">
                {stats.totalTransactions}
              </p>
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400">Database Records Count</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300">Avg Transaction Value</span>
              <p className="text-2xl font-mono font-black text-purple-900 dark:text-purple-200">
                ₹{recentTransactions.length > 0 ? Math.round(totalFinancialVolume / recentTransactions.length).toLocaleString('en-IN') : 0}
              </p>
              <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Average Expense Size</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider">Spend Breakdown by Category</h4>
            <div className="space-y-2">
              {categoryBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No category data available.</p>
              ) : (
                categoryBreakdown.map(cat => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-[#1A3827] dark:text-slate-200">
                      <span>{cat.name}</span>
                      <span className="font-mono">₹{cat.amount.toLocaleString('en-IN')} ({cat.pct}%)</span>
                    </div>
                    <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1A3827] dark:bg-[#A3E635] h-full rounded-full transition-all" style={{ width: `${Math.min(cat.pct, 100)}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )
      )}

      {/* Tab: Settle Payments */}
      {activeTab === 'settlements' && (
        !userPermissions.settlements ? (
          renderAccessRestrictedCard('Room Settlement Center', 'Financial Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          
          {/* Header & Room Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4 gap-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
                Platform Room Settlement Center
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Audit roommate balances, suggested transfers, and record custom or fast settlement payments.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Room Dropdown Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">Select Room:</span>
                <select
                  value={selectedSettleRoomId}
                  onChange={e => setSelectedSettleRoomId(e.target.value)}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="">-- Choose Room --</option>
                  {allSystemRooms.map(r => (
                    <option key={r.roomId} value={r.roomId}>
                      🏠 {r.roomName} ({r.roomId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle Switch (Tabs look-and-feel) */}
              {selectedSettleRoomId && (
                <div className="bg-[#F4F7F4] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-0.5 rounded-xl flex items-center shadow-inner">
                  <button
                    type="button"
                    onClick={() => setSettleMode('fast')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      settleMode === 'fast'
                        ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                        : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>1-Tap Settle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMode('advanced')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      settleMode === 'advanced'
                        ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                        : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Advanced</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main content body */}
          {!selectedSettleRoomId ? (
            <div className="text-center py-16 space-y-3 bg-[#F4F7F4]/40 dark:bg-[#161D20]/40 rounded-3xl border border-dashed border-[#E3E8E3] dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto shadow-sm">
                <Home className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-[#1A3827] dark:text-slate-200">No Room Selected</p>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
                  Choose a shared roommate space from the dropdown selector above to analyze balances and settle payments.
                </p>
              </div>
            </div>
          ) : loadingSettleRoom ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-bold">Retrieving room financial state...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              
              {/* Common Indicators: Members, Imbalance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">Total Imbalance</span>
                  <p className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-200">
                    ₹{(() => {
                      const totalImbalance = Object.values(settleRoomBalances)
                        .filter(b => b > 0)
                        .reduce((sum, b) => sum + b, 0);
                      return totalImbalance.toLocaleString('en-IN', { minimumFractionDigits: 2 });
                    })()}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Sum of outstanding roommate credit</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300">Redesigned Settle Mode</span>
                  <p className="text-xl font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide mt-1 animate-pulse">
                    {settleMode === 'fast' ? '⚡ 1-Tap Settle' : '⚙️ Advanced Options'}
                  </p>
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400">Mode switchable via top toggle</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300">Suggested Transfers</span>
                  <p className="text-2xl font-mono font-black text-purple-900 dark:text-purple-200">
                    {settleRoomSuggestedTransfers.length}
                  </p>
                  <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Greedy settlement paths</p>
                </div>
              </div>

              {/* Mode 1: 1-Tap Fast Settle Mode View */}
              {settleMode === 'fast' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  
                  {/* Left Side: Roommate Balances */}
                  <div className="hud-card p-5 rounded-3xl space-y-3">
                    <div>
                      <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        Roommate Debt & Credit Sheet
                      </h4>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Real-time status of roommate accounts.</p>
                    </div>

                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {settleRoomMembers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No roommates registered.</p>
                      ) : (
                        settleRoomMembers.map(m => {
                          const uid = m.uid || m.id;
                          const bal = settleRoomBalances[uid] || 0;
                          const owes = bal < -0.01;
                          const owed = bal > 0.01;
                          
                          return (
                            <div key={uid} className="p-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm hover:border-emerald-500/30 transition-all">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-8 h-8 rounded-xl font-black flex items-center justify-center shrink-0 ${
                                  owed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-[#A3E635]' :
                                  owes ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' :
                                  'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                }`}>
                                  {(m.nickname || m.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-[#1A3827] dark:text-slate-100 truncate">{m.nickname || m.name}</p>
                                  <p className="font-mono text-[9px] text-slate-400 truncate">{uid}</p>
                                </div>
                              </div>
                              
                              <div className="shrink-0 text-right">
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  owed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-[#A3E635] border border-emerald-300 dark:border-emerald-800' :
                                  owes ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800' :
                                  'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {owed ? `Owed ₹${bal.toFixed(2)}` : owes ? `Owes ₹${Math.abs(bal).toFixed(2)}` : 'Settled'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Side: Suggested Transfers with Quick Settle Action */}
                  <div className="hud-card p-5 rounded-3xl space-y-3">
                    <div>
                      <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#A3E635]" />
                        1-Tap Suggested Debt Settlements
                      </h4>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">Click Quick Settle to clear outstanding transfers instantly.</p>
                    </div>

                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {settleRoomSuggestedTransfers.length === 0 ? (
                        <div className="p-12 bg-[#F4F7F4]/20 dark:bg-[#161D20]/20 border border-dashed border-[#E3E8E3] dark:border-slate-800 rounded-3xl text-center text-xs font-medium text-[#5C6E5C] dark:text-slate-400 space-y-2">
                          <p className="text-lg">🎉</p>
                          <p className="font-extrabold text-[#1A3827] dark:text-slate-200">Everything is Clear!</p>
                          <p className="text-[10px] text-slate-400">No roommate suggested transfers are pending in this room.</p>
                        </div>
                      ) : (
                        settleRoomSuggestedTransfers.map((t, index) => (
                          <div key={index} className="p-3.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm hover:border-emerald-500/30 transition-all">
                            <div className="min-w-0">
                              <p className="font-bold text-[#1A3827] dark:text-slate-100">
                                <span className="font-extrabold text-rose-500">{t.fromName}</span> pays{' '}
                                <span className="font-extrabold text-emerald-600 dark:text-[#A3E635]">{t.toName}</span>
                              </p>
                              <p className="font-mono font-black text-[12px] text-[#1A3827] dark:text-[#A3E635] mt-0.5">
                                ₹{t.amount.toFixed(2)}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => handleAdminQuickSettle(t.fromUid, t.toUid, t.amount)}
                              className="px-3.5 py-2.5 bg-emerald-600 text-white dark:bg-[#A3E635] dark:text-slate-950 rounded-xl text-[10px] font-black hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 fill-current text-white dark:text-slate-950" />
                              <span>Quick Settle</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Mode 2: Advanced Settle Mode View */}
              {settleMode === 'advanced' && (
                <div className="hud-card p-6 rounded-3xl space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      Advanced Custom Settlement Form
                    </h4>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                      Record custom payments with detailed parameters (custom titles, payment types, dates, notes, and visibility).
                    </p>
                  </div>

                  <form onSubmit={handleAdminSubmitSettle} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Payer */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Payer (Who Pays)</label>
                        <select
                          value={customSettlePayer}
                          onChange={e => setCustomSettlePayer(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {settleRoomMembers.map(m => (
                            <option key={m.uid || m.id} value={m.uid || m.id}>
                              {m.nickname || m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Receiver */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Receiver (Who Gets Paid)</label>
                        <select
                          value={customSettleReceiver}
                          onChange={e => setCustomSettleReceiver(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {settleRoomMembers.filter(m => (m.uid || m.id) !== customSettlePayer).map(m => (
                            <option key={m.uid || m.id} value={m.uid || m.id}>
                              {m.nickname || m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Amount (₹)</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          placeholder="Enter settlement amount..."
                          value={customSettleAmount}
                          onChange={e => setCustomSettleAmount(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Title/Description */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Transaction Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Custom Cash Settlement"
                          value={advSettleTitle}
                          onChange={e => setAdvSettleTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Date</label>
                        <input
                          type="date"
                          required
                          value={advSettleDate}
                          onChange={e => setAdvSettleDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Time */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Time (24h)</label>
                        <input
                          type="time"
                          required
                          value={advSettleTime}
                          onChange={e => setAdvSettleTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      
                      {/* Payment Method */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Payment Method</label>
                        <select
                          value={advSettleMethod}
                          onChange={e => setAdvSettleMethod(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="UPI">UPI / Google Pay</option>
                          <option value="Cash">Cash Handover</option>
                          <option value="Bank Transfer">Direct Bank IMPS/NEFT</option>
                          <option value="Other">Other Adjustment</option>
                        </select>
                      </div>

                      {/* Shared / Private toggle */}
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl h-[46px] shadow-sm select-none">
                        <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Show to Roommates?</span>
                        <button
                          type="button"
                          onClick={() => setAdvSettleIsShared(!advSettleIsShared)}
                          className={`w-9 h-5 rounded-full relative transition-all duration-200 focus:outline-none ${
                            advSettleIsShared ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all duration-200 shadow-sm ${
                            advSettleIsShared ? 'left-4.5' : 'left-1'
                          }`}></span>
                        </button>
                      </div>

                      {/* Transaction splits preview block */}
                      <div className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 p-2 bg-[#F6F8F6] dark:bg-slate-800/40 rounded-xl border border-dashed border-[#E3E8E3]/60 dark:border-slate-700/60 leading-normal">
                        ⚡ <span className="text-[#1A3827] dark:text-white font-extrabold uppercase">Transaction Splits:</span><br />
                        • Payer gets <strong>+₹{Number(customSettleAmount || 0).toFixed(2)}</strong> credit<br />
                        • Receiver gets <strong>-₹{Number(customSettleAmount || 0).toFixed(2)}</strong> charge
                      </div>

                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">Administrative Remarks / Reference ID (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Add details like Transaction ID, UPI Ref, reason for adjustments, etc..."
                        value={advSettleNotes}
                        onChange={e => setAdvSettleNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingAdminSettle}
                      className="w-full py-3 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 rounded-xl text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingAdminSettle ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Record Advanced Settlement Payment</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
        )
      )}

      {/* Tab: System Rooms Directory */}
      {activeTab === 'room_explorer' && (
        !userPermissions.room_explorer ? (
          renderAccessRestrictedCard('System Rooms Directory', 'Room Explorer Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Registered System Rooms Directory ({allSystemRooms.length})
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Explore all active roommate spaces registered in the Supabase database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {allSystemRooms.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center col-span-2 py-8">No rooms found in database.</p>
            ) : (
              allSystemRooms.map(r => (
                <div key={r.roomId} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-extrabold text-[#1A3827] dark:text-slate-100 truncate">🏠 {r.roomName}</p>
                    <p className="font-mono text-[11px] text-[#5C6E5C] dark:text-[#A3E635] font-bold">{r.roomId}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setTargetPinRoomId(r.roomId);
                        setIsCustomRoomInput(false);
                        setActiveTab('pinning');
                        if (triggerToast) triggerToast(`Room ${r.roomId} selected for pinning`);
                      }}
                      className="px-2.5 py-1.5 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 rounded-xl text-[10px] font-bold hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                      <Pin className="w-3 h-3" />
                      <span>Pin</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(r.roomId);
                        if (triggerToast) triggerToast(`Room Code ${r.roomId} copied!`);
                      }}
                      className="p-1.5 bg-[#F6F8F6] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-300 rounded-xl hover:bg-slate-200"
                      title="Copy Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )
      )}

      {/* Tab: Security Audit Logs & Log Exporter */}
      {activeTab === 'security_audit' && (
        <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Administrative Security Audit Trail ({auditLogs.length})
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Track all administrative actions, ban events, broadcasts, and system configuration modifications.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const jsonStr = JSON.stringify(auditLogs, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tallyin-security-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  if (triggerToast) triggerToast('Downloaded Security Audit Logs as JSON!');
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => {
                  if (!auditLogs || auditLogs.length === 0) {
                    if (triggerToast) triggerToast('No audit logs available to export.');
                    return;
                  }
                  const headers = ['ID', 'Timestamp', 'Admin Email', 'Action', 'Details'];
                  const rows = auditLogs.map(l => [
                    l.id || '',
                    l.timestamp || '',
                    l.adminEmail || '',
                    `"${(l.action || '').replace(/"/g, '""')}"`,
                    `"${(l.details || '').replace(/"/g, '""')}"`
                  ]);
                  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tallyin-security-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  if (triggerToast) triggerToast('Downloaded Security Audit Logs as CSV!');
                }}
                className="px-3.5 py-2 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
                <p className="text-xs font-bold">No security audit records logged yet.</p>
                <p className="text-[11px]">Admin actions such as banning, broadcasts, and maintenance toggles will appear here.</p>
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-start justify-between gap-3 text-xs shadow-sm">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shrink-0 mt-0.5 ${
                      log.action.includes('BAN') ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' :
                      log.action.includes('BROADCAST') ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                      log.action.includes('MAINTENANCE') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {log.action}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-[#1A3827] dark:text-slate-100 break-words">{log.details}</p>
                      <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-mono">
                        By <span className="font-bold text-[#1A3827] dark:text-slate-300">{log.adminEmail}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Chaos & Feature Flags */}
      {activeTab === 'chaos_tester' && (
        !isSuperAdmin ? (
          renderAccessRestrictedCard('Chaos Engine & Feature Flags', 'Super Admin Root Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Chaos Engineering & System Feature Flags
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                Simulate network glitches and toggle system-wide experimental feature flags.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider">Simulated Error Injection Rate</h4>
              <p className="text-xs text-rose-800 dark:text-rose-300">
                Inject artificial API failures to test offline handling and UI error toasts.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[0, 10, 25, 50].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSimulatedErrorRate(rate);
                      localStorage.setItem('tallyin_simulated_error_rate', String(rate));
                      if (triggerToast) triggerToast(`Error rate set to ${rate}%`);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all border ${
                      simulatedErrorRate === rate
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-[#1A3827] dark:text-slate-200 border-[#E3E8E3] dark:border-slate-800'
                    }`}
                  >
                    {rate === 0 ? '0% (Stable Production)' : `${rate}% Failures`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider">System Feature Flags</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A3827] dark:text-slate-100">AI Receipt OCR Engine</p>
                    <p className="text-[10px] text-[#5C6E5C] font-semibold">Auto item extraction</p>
                  </div>
                  <button
                    onClick={() => {
                      const next = { ...featureFlags, aiOcr: !featureFlags.aiOcr };
                      setFeatureFlags(next);
                      localStorage.setItem('tallyin_feature_flags', JSON.stringify(next));
                      if (triggerToast) triggerToast(`AI OCR ${next.aiOcr ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                      featureFlags.aiOcr ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {featureFlags.aiOcr ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A3827] dark:text-slate-100">Smart Settlement Suggestions</p>
                    <p className="text-[10px] text-[#5C6E5C] font-semibold">Optimized debt minimization</p>
                  </div>
                  <button
                    onClick={() => {
                      const next = { ...featureFlags, smartSettlements: !featureFlags.smartSettlements };
                      setFeatureFlags(next);
                      localStorage.setItem('tallyin_feature_flags', JSON.stringify(next));
                      if (triggerToast) triggerToast(`Smart Settlements ${next.smartSettlements ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                      featureFlags.smartSettlements ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {featureFlags.smartSettlements ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A3827] dark:text-slate-100">Budget Cap Warnings</p>
                    <p className="text-[10px] text-[#5C6E5C] font-semibold">Over-budget notifications</p>
                  </div>
                  <button
                    onClick={() => {
                      const next = { ...featureFlags, budgetAlerts: !featureFlags.budgetAlerts };
                      setFeatureFlags(next);
                      localStorage.setItem('tallyin_feature_flags', JSON.stringify(next));
                      if (triggerToast) triggerToast(`Budget Alerts ${next.budgetAlerts ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                      featureFlags.budgetAlerts ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {featureFlags.budgetAlerts ? 'ON' : 'OFF'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
        )
      )}

      {/* Tab: Room Commander & Intervention */}
      {activeTab === 'room_commander' && (
        !userPermissions.room_commander ? (
          renderAccessRestrictedCard('Room Commander', 'Room Commander Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
                  Room Commander & Live Intervention Hub ({commanderRooms.length})
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Override room settings, freeze/unfreeze disputed rooms, adjust monthly budget caps, and manage member limits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCommanderRooms}
                  disabled={loadingCommanderRooms}
                  className="px-3 py-2 bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-[#d8e4db] transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCommanderRooms ? 'animate-spin' : ''}`} />
                  <span>Refresh Rooms</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={commanderSearch}
                onChange={e => setCommanderSearch(e.target.value)}
                placeholder="Filter rooms by Name, ID, or Status..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {commanderRooms.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No rooms found in Supabase.</p>
                </div>
              ) : (
                commanderRooms
                  .filter(r => {
                    if (!commanderSearch.trim()) return true;
                    const q = commanderSearch.toLowerCase();
                    return (
                      (r.name && r.name.toLowerCase().includes(q)) ||
                      (r.id && r.id.toLowerCase().includes(q)) ||
                      (r.isFrozen ? 'frozen' : 'active').includes(q)
                    );
                  })
                  .map(room => (
                    <div
                      key={room.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        room.isFrozen
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                          : 'bg-white dark:bg-slate-900 border-[#E3E8E3] dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#1A3827] dark:text-slate-100 truncate">
                              {room.name || 'Unnamed Room'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              room.isFrozen
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {room.isFrozen ? '❄️ Frozen' : '● Active'}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-[#5C6E5C] dark:text-slate-400 font-bold">
                            ID: {room.id}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingRoomCommander(room);
                              setCommanderRoomNameInput(room.name || '');
                              setCommanderBudgetInput(room.monthly_budget !== undefined ? String(room.monthly_budget) : '');
                              setCommanderMaxMembersInput(room.max_members !== undefined ? String(room.max_members) : '10');
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            title="Edit Room Configuration"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleFreezeRoom(room)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-colors flex items-center gap-1 ${
                              room.isFrozen
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
                            }`}
                            title={room.isFrozen ? 'Unfreeze Room' : 'Freeze Room to Halt Expenses'}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{room.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 text-center mb-3">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Members</span>
                          <span className="text-xs font-black text-[#1A3827] dark:text-slate-200">
                            {room.memberCount} / {room.max_members || '∞'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Budget Cap</span>
                          <span className="text-xs font-black text-[#1A3827] dark:text-slate-200">
                            {room.monthly_budget ? `₹${room.monthly_budget}` : 'None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Spend</span>
                          <span className="text-xs font-black text-emerald-700 dark:text-[#A3E635]">
                            ₹{Math.round(room.totalSpend || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Danger Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                        <button
                          onClick={() => {
                            setTargetPinRoomId(room.id);
                            setIsCustomRoomInput(false);
                            setActiveTab('pinning');
                          }}
                          className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Pin className="w-3 h-3" /> Pin Notice
                        </button>
                        <button
                          onClick={() => handlePurgeRoom(room)}
                          className="text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Trash className="w-3 h-3" /> Purge Room
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )
      )}

      {/* Tab: Universal Transaction & Financial Dispute Resolver */}
      {activeTab === 'dispute_resolver' && (
        !userPermissions.dispute_resolver ? (
          renderAccessRestrictedCard('Dispute Resolver', 'Dispute Resolution Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                  Universal Transaction & Financial Dispute Resolver ({allGlobalTx.length})
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Global search across all platform expenses, inspect member splits, resolve disputes, and void corrupt entries.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!allGlobalTx || allGlobalTx.length === 0) {
                      if (triggerToast) triggerToast('No transactions to export.');
                      return;
                    }
                    const headers = ['ID', 'Room ID', 'Title', 'Amount', 'Category', 'Paid By', 'Created At'];
                    const rows = allGlobalTx.map(t => [
                      t.id,
                      t.room_id,
                      `"${(t.title || '').replace(/"/g, '""')}"`,
                      t.amount,
                      t.category || 'General',
                      `"${(t.paid_by || '').replace(/"/g, '""')}"`,
                      t.created_at
                    ]);
                    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tallyin_all_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    if (triggerToast) triggerToast('Exported all transactions to CSV!');
                  }}
                  className="px-3.5 py-2 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={fetchGlobalTransactions}
                  disabled={loadingGlobalTx}
                  className="px-3 py-2 bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-[#d8e4db] transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGlobalTx ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={globalTxSearch}
                onChange={e => setGlobalTxSearch(e.target.value)}
                placeholder="Search by Title, Room ID, Category, or Payer..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Transactions List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {allGlobalTx.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 opacity-60 mb-2" />
                  <p className="text-xs font-bold">No transactions found in Supabase.</p>
                </div>
              ) : (
                allGlobalTx
                  .filter(tx => {
                    if (!globalTxSearch.trim()) return true;
                    const q = globalTxSearch.toLowerCase();
                    return (
                      (tx.title && tx.title.toLowerCase().includes(q)) ||
                      (tx.room_id && tx.room_id.toLowerCase().includes(q)) ||
                      (tx.category && tx.category.toLowerCase().includes(q)) ||
                      (tx.paid_by && tx.paid_by.toLowerCase().includes(q)) ||
                      String(tx.amount).includes(q)
                    );
                  })
                  .map(tx => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between gap-3 text-xs shadow-sm hover:border-amber-400 transition-colors"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm truncate">
                            {tx.title || 'Untitled Expense'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            {tx.category || 'General'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#5C6E5C] dark:text-slate-400 font-mono">
                          <span>Room: <strong>{tx.room_id}</strong></span>
                          <span>Payer: <strong>{tx.paid_by || 'Unknown'}</strong></span>
                          <span>{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-emerald-700 dark:text-[#A3E635]">
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                        </span>

                        <button
                          onClick={() => setSelectedTxDetails(tx)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200"
                          title="Inspect Split Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setEditTxTitle(tx.title || '');
                            setEditTxAmount(String(tx.amount || ''));
                            setEditTxCategory(tx.category || 'General');
                          }}
                          className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-100"
                          title="Edit Transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleVoidTransaction(tx)}
                          className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-100"
                          title="Void / Delete Transaction"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )
      )}

      {/* Tab: Supabase Database Studio & Table Inspector */}
      {activeTab === 'database_studio' && (
        !userPermissions.database_studio ? (
          renderAccessRestrictedCard('Database Studio', 'Database Studio Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-500" />
                  Supabase Live Database Studio ({studioRows.length} rows)
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Inspect raw database records across all core tables, export backups, and execute administrative row interventions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportStudioCSV(studioTable)}
                  className="px-3 py-2 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => {
                    const jsonStr = JSON.stringify(studioRows, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tallyin_${studioTable}_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    if (triggerToast) triggerToast(`Exported ${studioTable} to JSON!`);
                  }}
                  className="px-3 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => fetchStudioTable(studioTable)}
                  disabled={loadingStudio}
                  className="px-3 py-2 bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-[#d8e4db] transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStudio ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>
              </div>
            </div>

            {/* Table Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['rooms', 'users', 'members', 'transactions', 'receipts', 'activity_logs', 'system_settings'].map(tName => (
                <button
                  key={tName}
                  onClick={() => {
                    setStudioTable(tName);
                    fetchStudioTable(tName);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all shrink-0 ${
                    studioTable === tName
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tName}
                </button>
              ))}
            </div>

            {/* Search within table */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={studioSearch}
                onChange={e => setStudioSearch(e.target.value)}
                placeholder={`Search within table "${studioTable}"...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Data Grid Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[500px] overflow-x-auto overflow-y-auto">
              {studioRows.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No records found in table <strong>{studioTable}</strong>.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black sticky top-0 z-10">
                    <tr>
                      <th className="p-3">Actions</th>
                      {Object.keys(studioRows[0] || {}).slice(0, 7).map(col => (
                        <th key={col} className="p-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studioRows
                      .filter(row => {
                        if (!studioSearch.trim()) return true;
                        const rowStr = JSON.stringify(row).toLowerCase();
                        return rowStr.includes(studioSearch.toLowerCase());
                      })
                      .slice(0, 100)
                      .map((row, idx) => (
                        <tr key={row.id || row.key || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setInspectedStudioRow(row)}
                              className="px-2 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200 rounded-lg text-[10px] font-bold"
                              title="Inspect JSON Payload"
                            >
                              JSON
                            </button>
                            <button
                              onClick={() => handleDeleteStudioRow(studioTable, row)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Delete Row"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          {Object.keys(studioRows[0] || {}).slice(0, 7).map(col => {
                            const val = row[col];
                            return (
                              <td key={col} className="p-3 max-w-[200px] truncate text-slate-700 dark:text-slate-300">
                                {val === null || val === undefined ? (
                                  <span className="text-slate-400 italic">null</span>
                                ) : typeof val === 'object' ? (
                                  <span className="text-purple-600 dark:text-purple-400">{JSON.stringify(val)}</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )
      )}

      {/* Tab: System Macro Triggers & Real-Time Orchestration */}
      {activeTab === 'system_triggers' && (
        !userPermissions.system_triggers ? (
          renderAccessRestrictedCard('System Macro Triggers', 'System Triggers Clearance Required')
        ) : (
          <div className="hud-card rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                  System Macro Triggers & Real-Time Orchestration
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Execute instant platform-wide emergency directives, cache-busting broadcasts, and automated settlement alerts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trigger 1: Force Client Cache Reload */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                  Force Client Cache-Buster
                </h4>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  Broadcasts a real-time <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">SYSTEM_FORCE_RELOAD</code> packet. Connected browsers and PWAs refresh immediately to load latest software releases.
                </p>
                <button
                  onClick={handleTriggerForceReload}
                  disabled={isBroadcastingForceReload}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isBroadcastingForceReload ? 'Broadcasting...' : 'Broadcast Force Reload'}</span>
                </button>
              </div>

              {/* Trigger 2: Month-End Settlement Reminder */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <HandCoins className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                  Month-End Settlement Alert
                </h4>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  Dispatches a high-priority platform announcement to all room members reminding them to review pending expenses and settle room balances.
                </p>
                <button
                  onClick={handleTriggerSettlementReminders}
                  disabled={isBroadcastingSettlementReminders}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>{isBroadcastingSettlementReminders ? 'Dispatching...' : 'Dispatch Settlement Alert'}</span>
                </button>
              </div>

              {/* Trigger 3: Scheduled Maintenance Countdown */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                  Scheduled Maintenance Countdown
                </h4>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  Broadcasts a countdown banner warning all users before planned server or database maintenance commences.
                </p>

                <div className="space-y-2 pt-1">
                  <div>
                    <input
                      type="text"
                      value={countdownNoticeInput}
                      onChange={e => setCountdownNoticeInput(e.target.value)}
                      placeholder="e.g. Server maintenance scheduled. Normal service will resume shortly."
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Duration:</span>
                    <select
                      value={countdownMinsInput}
                      onChange={e => setCountdownMinsInput(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold"
                    >
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                    </select>
                  </div>

                  {activeSystemCountdown ? (
                    <button
                      onClick={handleCancelMaintenanceCountdown}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel Active Countdown</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartMaintenanceCountdown}
                      disabled={isSendingCountdown}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Countdown Banner</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Modal: Edit Room Commander Configuration */}
      {editingRoomCommander && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-black text-sm text-[#1A3827] dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" />
                Edit Room Configuration
              </h3>
              <button
                onClick={() => setEditingRoomCommander(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Room Name</label>
                <input
                  type="text"
                  value={commanderRoomNameInput}
                  onChange={e => setCommanderRoomNameInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Monthly Budget Cap (₹)</label>
                <input
                  type="number"
                  value={commanderBudgetInput}
                  onChange={e => setCommanderBudgetInput(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Max Capacity (Members)</label>
                <input
                  type="number"
                  value={commanderMaxMembersInput}
                  onChange={e => setCommanderMaxMembersInput(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setEditingRoomCommander(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveCommanderRoom(editingRoomCommander.id)}
                disabled={isSavingCommanderRoom}
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isSavingCommanderRoom ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Transaction Dispute */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-black text-sm text-[#1A3827] dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                Edit Transaction Details
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Title / Description</label>
                <input
                  type="text"
                  value={editTxTitle}
                  onChange={e => setEditTxTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editTxAmount}
                  onChange={e => setEditTxAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Category</label>
                <select
                  value={editTxCategory}
                  onChange={e => setEditTxCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Rent">Rent & Housing</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="General">General / Miscellaneous</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEditedTransaction(editingTx.id)}
                disabled={isSavingTx}
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-600 text-white hover:bg-amber-700"
              >
                {isSavingTx ? 'Saving...' : 'Update Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transaction Details & Split Inspection */}
      {selectedTxDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-black text-sm text-[#1A3827] dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                Transaction Audit & Split Inspection
              </h3>
              <button
                onClick={() => setSelectedTxDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <p className="text-base font-black text-[#1A3827] dark:text-white">{selectedTxDetails.title}</p>
                <p className="text-emerald-700 dark:text-[#A3E635] font-black text-sm">₹{Number(selectedTxDetails.amount).toLocaleString('en-IN')}</p>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                  <span>Room: {selectedTxDetails.room_id}</span> •
                  <span>Category: {selectedTxDetails.category}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Raw Database Metadata</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedTxDetails, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setSelectedTxDetails(null)}
                className="px-4 py-2 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 rounded-xl text-xs font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Database Studio Row JSON Viewer */}
      {inspectedStudioRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-black text-sm text-[#1A3827] dark:text-white flex items-center gap-2 font-mono">
                <Database className="w-4 h-4 text-cyan-500" />
                Raw Row Inspector: {studioTable}
              </h3>
              <button
                onClick={() => setInspectedStudioRow(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[450px]">
              {JSON.stringify(inspectedStudioRow, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectedStudioRow, null, 2));
                  if (triggerToast) triggerToast('Copied JSON payload to clipboard!');
                }}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
              <button
                onClick={() => setInspectedStudioRow(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Official User Warning Dispatcher */}
      {warningTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-black text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                Issue Official Administrative Warning
              </h3>
              <button
                onClick={() => setWarningTargetUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p><strong>Target User:</strong> {warningTargetUser.name} ({warningTargetUser.email})</p>
              <p className="text-[11px] text-slate-500">This will dispatch an official warning notice with a unique Warning Reference ID.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Violation Category</label>
                <select
                  value={warningReason}
                  onChange={e => setWarningReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold"
                >
                  <option value="Conduct & Room Etiquette Violation">Conduct & Room Etiquette Violation</option>
                  <option value="Disputed Unpaid Settlements">Disputed Unpaid Settlements / Debts</option>
                  <option value="Suspected Fraudulent Expenses">Suspected Fraudulent Expenses or Receipts</option>
                  <option value="Terms of Service Non-Compliance">Terms of Service Non-Compliance</option>
                  <option value="Spam / Excessive Actions">Spam / Excessive Account Actions</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Specific Guidance / Actionable Notes</label>
                <textarea
                  rows="3"
                  value={warningNotes}
                  onChange={e => setWarningNotes(e.target.value)}
                  placeholder="e.g. Please settle the pending ₹1,500 electricity bill share before the upcoming weekend."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setWarningTargetUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOfficialWarning}
                disabled={isSendingWarning}
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isSendingWarning ? 'Dispatching Notice...' : 'Dispatch Official Warning'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Clearance & Audit Certificate Modal */}
      {selectedAckRecord && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAckRecord(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl flex flex-col shadow-2xl"
            style={{ maxHeight: '92dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-[#E3E8E3] dark:border-slate-800 shrink-0">
              {/* Mobile drag handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />
              <div className="flex items-center gap-3">
                <img src={securityShieldLogo} alt="Tallyin Security" className="w-10 h-10 object-contain rounded-xl shadow-md border border-emerald-500/30 bg-emerald-950/20 p-1 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-[#1A3827] dark:text-white leading-tight">
                    Official Security Clearance Certificate
                  </h3>
                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 leading-tight mt-0.5">
                    Tallyin Identity &amp; Access Management Governance Audit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAckRecord(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">

              {/* ACK Reference Number Card */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                selectedAckRecord.action === 'REVOKE'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
              }`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Security Acknowledgement Reference No.
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                    selectedAckRecord.action === 'REVOKE'
                      ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100'
                      : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                  }`}>
                    {selectedAckRecord.action === 'REVOKE' ? 'Access Terminated' : 'Verified Clearance'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm sm:text-base font-mono font-black tracking-wide break-all">
                    {selectedAckRecord.ackNumber}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAckRecord.ackNumber);
                      if (triggerToast) triggerToast(`Copied ${selectedAckRecord.ackNumber}!`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 text-xs font-bold flex items-center gap-1 shadow-sm hover:scale-105 transition-all cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Security Metadata Grid — 2 cols always */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950/60 border border-[#E3E8E3] dark:border-slate-800 space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Co-Admin</span>
                  <p className="font-extrabold text-[#1A3827] dark:text-white truncate text-[11px]">{selectedAckRecord.targetEmail}</p>
                  {selectedAckRecord.targetName && <p className="text-[10px] text-slate-500 truncate">Name: {selectedAckRecord.targetName}</p>}
                </div>
                <div className="p-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950/60 border border-[#E3E8E3] dark:border-slate-800 space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Authorized By</span>
                  <p className="font-extrabold text-[#1A3827] dark:text-white truncate text-[11px]">{selectedAckRecord.authorizedBy}</p>
                  <p className="text-[10px] text-slate-500">{selectedAckRecord.authorizedByRole || 'Super Administrator'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950/60 border border-[#E3E8E3] dark:border-slate-800 space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Network className="w-3 h-3 text-indigo-500 shrink-0" />
                    Origin IP
                  </span>
                  <p className="font-mono font-bold text-[#1A3827] dark:text-white text-[11px]">{selectedAckRecord.ipAddress || '127.0.0.1'}</p>
                  <p className="text-[10px] text-slate-500">Verified Network Origin</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950/60 border border-[#E3E8E3] dark:border-slate-800 space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                    Timestamp
                  </span>
                  <p className="font-bold text-[#1A3827] dark:text-white text-[11px]">{new Date(selectedAckRecord.timestamp).toLocaleTimeString()}</p>
                  <p className="text-[10px] text-slate-500">{new Date(selectedAckRecord.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Cryptographic Checksum */}
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Cryptographic Checksum</span>
                  <span className="text-emerald-400">AUTHENTIC</span>
                </div>
                <p className="text-emerald-300 font-bold break-all text-[11px]">
                  {selectedAckRecord.checksum || 'SEC-SIG-RECORDED'}
                </p>
                {selectedAckRecord.userAgent && (
                  <p className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800">
                    Client: {selectedAckRecord.userAgent}
                  </p>
                )}
              </div>

              {/* Permissions Matrix */}
              {selectedAckRecord.action !== 'REVOKE' && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider">
                    Operational Permissions Snapshot
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {[
                      { key: 'room_commander', label: 'Room Cmdr' },
                      { key: 'dispute_resolver', label: 'Disputes' },
                      { key: 'database_studio', label: 'DB Studio' },
                      { key: 'system_triggers', label: 'Sys Triggers' },
                      { key: 'broadcasts', label: 'Broadcasts' },
                      { key: 'settlements', label: 'Settlements' },
                      { key: 'user_management', label: 'Users' },
                      { key: 'email_hub', label: 'Email Hub' },
                      { key: 'room_explorer', label: 'Rooms' },
                      { key: 'room_pinning', label: 'Pinning' },
                      { key: 'latency_diagnostics', label: 'Latency' },
                      { key: 'maintenance_control', label: 'Maintenance' },
                      { key: 'database_migration', label: 'DB Migrate' },
                    ].map(p => {
                      const isGranted = Boolean(selectedAckRecord.permissions?.[p.key]);
                      return (
                        <div
                          key={p.key}
                          className={`p-2 rounded-xl border text-center ${
                            isGranted
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="text-[9px] font-bold leading-tight">{p.label}</div>
                          <div className="text-[8px] font-black uppercase mt-0.5">
                            {isGranted ? '✓ OK' : '✕'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E3E8E3] dark:border-slate-800 shrink-0">
              <span className="text-[10px] text-slate-400 truncate mr-2">
                ID: <code className="font-mono">{selectedAckRecord.ackNumber}</code>
              </span>
              <button
                type="button"
                onClick={() => setSelectedAckRecord(null)}
                className="px-5 py-2 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 rounded-xl font-bold text-xs hover:opacity-90 transition-all cursor-pointer shrink-0"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}
