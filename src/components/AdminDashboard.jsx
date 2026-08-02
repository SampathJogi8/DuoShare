import { useState, useEffect, useCallback, useRef } from 'react';
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
  UserX
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';
import { supabase } from '../supabase';

const ADMIN_EMAILS = [
  'tallyin.alerts@gmail.com'
];
const DEFAULT_ADMIN_PASSKEY = 'tallyin2026';

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
  globalBroadcast,
  setGlobalBroadcast,
  pinnedMessages,
  setPinnedMessages,
  simulatedLatency,
  setSimulatedLatency
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'maintenance' | 'broadcast' | 'email' | 'pinning' | 'latency'
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    if (user && user.email && ADMIN_EMAILS.includes(user.email.trim().toLowerCase())) {
      return true;
    }
    return localStorage.getItem('tallyin_admin_authenticated') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState(null);

  // Maintenance form states
  const [maintMsgInput, setMaintMsgInput] = useState(maintenanceMessage || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.');

  // Broadcast form states
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastType, setBroadcastType] = useState('announcement'); // 'announcement' | 'alert' | 'maintenance' | 'feature'
  const [broadcastTargetRoom, setBroadcastTargetRoom] = useState('ALL');

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

  // Fetch Database System Stats & Room List
  const fetchSystemStats = useCallback(async () => {
    try {
      const [roomsRes, usersRes, txRes, receiptsRes, roomListRes] = await Promise.allSettled([
        supabase.from('rooms').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('uid', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('receipts').select('id', { count: 'exact', head: true }),
        supabase.from('rooms').select('id, name')
      ]);

      setStats({
        totalRooms: roomsRes.status === 'fulfilled' ? roomsRes.value.count || 0 : 0,
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.count || 0 : 0,
        totalTransactions: txRes.status === 'fulfilled' ? txRes.value.count || 0 : 0,
        totalReceipts: receiptsRes.status === 'fulfilled' ? receiptsRes.value.count || 0 : 0
      });

      if (roomListRes.status === 'fulfilled' && roomListRes.value.data) {
        const mapped = roomListRes.value.data.map(r => ({ roomId: r.id, roomName: r.name || r.id }));
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

  // Ban User Handler
  const handleBanUser = async (targetIdentifier, targetReason, extraData = {}) => {
    const rawTarget = String(targetIdentifier || '').trim();
    if (!rawTarget || rawTarget === 'N/A') {
      if (triggerToast) triggerToast('Valid email or username required to ban user.');
      return;
    }

    const cleanTarget = rawTarget.toLowerCase();

    const newBanObj = {
      identifier: cleanTarget,
      email: cleanTarget,
      name: extraData.name || rawTarget,
      id: extraData.id || rawTarget,
      reason: targetReason?.trim() || 'Account suspended by administrator.',
      bannedAt: new Date().toISOString(),
      bannedBy: user?.email || 'Admin'
    };

    const updatedBanned = [...bannedUsers.filter(b => (b.identifier || b.email)?.toLowerCase() !== cleanTarget), newBanObj];
    await syncBannedUsersToDatabase(updatedBanned);

    if (triggerToast) triggerToast(`User "${rawTarget}" SUSPENDED & BANNED!`);
    setBanEmailInput('');
    setIsBanModalOpen(false);
  };

  // Unban User Handler
  const handleUnbanUser = async (targetIdentifier) => {
    const cleanTarget = String(targetIdentifier || '').trim().toLowerCase();
    const updatedBanned = bannedUsers.filter(b => (b.identifier || b.email)?.toLowerCase() !== cleanTarget);
    await syncBannedUsersToDatabase(updatedBanned);

    if (triggerToast) triggerToast(`User "${targetIdentifier}" RESTORED & UNBANNED!`);
  };

  // User Directory & Search states
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
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

  useEffect(() => {
    if (adminAuthenticated) {
      measurePing();
      fetchSystemStats();
      fetchFinancialsAndLogs();
      fetchUserDirectory();
      fetchBannedUsers();
      fetchBanAppeals();
    }
  }, [adminAuthenticated, measurePing, fetchSystemStats, fetchFinancialsAndLogs, fetchUserDirectory, fetchBannedUsers, fetchBanAppeals]);

  // Handle Passkey verification
  const handlePasskeySubmit = (e) => {
    e.preventDefault();
    if (passkeyInput === DEFAULT_ADMIN_PASSKEY || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))) {
      setAdminAuthenticated(true);
      localStorage.setItem('tallyin_admin_authenticated', 'true');
      setPasskeyError(null);
      if (triggerToast) triggerToast('Admin Control Portal Authorized');
    } else {
      setPasskeyError('Invalid Admin Passkey. Access Denied.');
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
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'MAINTENANCE_MODE',
        payload: { active: isSystemMaintenanceActive, message: textToSave }
      });
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast('Maintenance notice text updated!');
  };

  // Toggle Maintenance Mode
  const handleToggleMaintenance = async () => {
    const nextState = !isSystemMaintenanceActive;
    const textToSave = maintMsgInput.trim() || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly.';
    setIsSystemMaintenanceActive(nextState);
    if (setMaintenanceMessage) {
      setMaintenanceMessage(textToSave);
    }
    localStorage.setItem('tallyin_system_maintenance_active', String(nextState));
    localStorage.setItem('tallyin_maintenance_message', textToSave);

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

  // Publish Global Broadcast
  const handlePublishBroadcast = async () => {
    if (!broadcastText.trim()) {
      if (triggerToast) triggerToast('Please enter broadcast message content.');
      return;
    }
    const newBroadcast = {
      id: `bc-${Date.now()}`,
      text: broadcastText.trim(),
      type: broadcastType,
      targetRoom: broadcastTargetRoom,
      active: true,
      createdAt: new Date().toISOString()
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

    if (triggerToast) triggerToast('Global Broadcast Live to all active clients!');
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

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'ROOM_PIN',
        payload: { roomId: finalRoomId, pin: pinObj }
      });
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast(`Announcement pinned to ${finalRoomId === 'ALL' ? 'ALL ROOMS' : `room ${finalRoomId}`}`);
    setPinText('');
  };

  const handleRemovePin = async (roomId) => {
    const copy = { ...(pinnedMessages || {}) };
    delete copy[roomId];
    setPinnedMessages(copy);
    localStorage.setItem('tallyin_pinned_messages', JSON.stringify(copy));

    try {
      const sysChan = supabase.channel('system_admin_channel');
      await sysChan.send({
        type: 'broadcast',
        event: 'ROOM_PIN',
        payload: { roomId, pin: null }
      });
    } catch (e) { console.error(e); }

    if (triggerToast) triggerToast(`Pin removed from room ${roomId}`);
  };

  // Lock Screen if unauthenticated
  if (!adminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F4F1] dark:bg-slate-950 text-left font-sans animate-fade-in relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md hud-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-emerald-500/30">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1A3827] text-[#A3E635] flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">
                Admin Control Portal
              </h2>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
                Restricted to authorized system administrators.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Admin Security Passkey</label>
              <input
                type="password"
                placeholder="Enter Master Passkey"
                value={passkeyInput}
                onChange={e => setPasskeyInput(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-mono text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {passkeyError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {passkeyError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onExitAdmin}
                className="flex-1 py-3 border border-[#E3E8E3] dark:border-slate-800 text-xs font-extrabold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Back to App
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 hover:bg-[#255038] dark:hover:bg-[#b7f34c] font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Authenticate</span>
              </button>
            </div>
          </form>

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-mono">
            URL: /admin • Portal Version {appVersion || 'v3.5.1'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Top Header Banner */}
      <div className="hud-card rounded-3xl p-6 sm:p-8 space-y-4 border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <img 
              src={faviconLogo} 
              alt="Tallyin Logo" 
              className="w-12 h-12 object-cover rounded-2xl shadow-md border border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">
                  Admin Command Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/20 border border-emerald-500/30 text-emerald-800 dark:text-[#A3E635] text-[10px] font-extrabold uppercase tracking-widest">
                  Live Master
                </span>
              </div>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium mt-0.5">
                Centralized maintenance control, system broadcasts, room pinning, and latency diagnostics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={measurePing}
              className="p-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-300 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
              title="Refresh Ping & System Health"
            >
              <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onExitAdmin}
              className="px-4 py-2.5 bg-[#1A3827] text-white dark:bg-slate-800 dark:text-slate-200 hover:bg-[#255038] dark:hover:bg-slate-700 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>

        </div>

        {/* System Health Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E3E8E3] dark:border-slate-800/80">
          
          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider block">API Latency</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
              <span className="text-base font-black text-[#1A3827] dark:text-white font-mono">
                {pingMs !== null ? `${pingMs} ms` : 'Measuring...'}
              </span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider block">Site Status</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isSystemMaintenanceActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_#10B981]'}`}></span>
              <span className={`text-xs font-black uppercase ${isSystemMaintenanceActive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-[#A3E635]'}`}>
                {isSystemMaintenanceActive ? 'Maintenance ON' : 'Operational'}
              </span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider block">Active Rooms</span>
            <div className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-base font-black text-[#1A3827] dark:text-white">
                {stats.totalRooms}
              </span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider block">Total Members</span>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-base font-black text-[#1A3827] dark:text-white">
                {stats.totalUsers}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Universal Quick Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="🔍 Universal Admin Search (Type user email, room code, or transaction name)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-slate-900/90 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3 text-xs text-[#5C6E5C] hover:text-[#1A3827] font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('activity_feed')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'activity_feed'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Activity Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('user_directory')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'user_directory'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>User Accounts ({allRegisteredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banned_accounts')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'banned_accounts'
              ? 'bg-rose-600 text-white shadow-md'
              : 'hud-card text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Banned Accounts ({bannedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finance_audit')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'finance_audit'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-emerald-500" />
          <span>Financial Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('room_explorer')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'room_explorer'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Rooms Directory ({allSystemRooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security_audit')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security_audit'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'maintenance'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Power className="w-3.5 h-3.5 text-rose-500" />
          <span>Site Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-purple-500" />
          <span>Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'email'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <span>Email Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('pinning')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'pinning'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Pin className="w-3.5 h-3.5 text-amber-400" />
          <span>Room Pinning</span>
        </button>

        <button
          onClick={() => setActiveTab('latency')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'latency'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Latency</span>
        </button>

        <button
          onClick={() => setActiveTab('chaos_tester')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'chaos_tester'
              ? 'bg-rose-600 text-white shadow-md'
              : 'hud-card text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Chaos & Flags</span>
        </button>
      </div>

      {/* Tab 1: Overview Controls */}
      {activeTab === 'overview' && (
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
      )}

      {/* Tab 2: Maintenance Mode Detail */}
      {activeTab === 'maintenance' && (
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
          </div>
        </div>
      )}

      {/* Tab 3: Live Broadcasts */}
      {activeTab === 'broadcast' && (
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
                Remove Current Broadcast
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Broadcast Type</label>
                <select
                  value={broadcastType}
                  onChange={e => setBroadcastType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="alert">⚠️ Critical Alert</option>
                  <option value="maintenance">🔧 Maintenance Warning</option>
                  <option value="feature">✨ New Feature Release</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Target Audience</label>
                <select
                  value={broadcastTargetRoom}
                  onChange={e => setBroadcastTargetRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                >
                  <option value="ALL">All Active Rooms (Global Broadcast)</option>
                  {(userRooms || []).map(r => (
                    <option key={r.roomId} value={r.roomId}>Specific Room: {r.roomName} ({r.roomId})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Broadcast Banner Text</label>
              <input
                type="text"
                placeholder="e.g. Scheduled database maintenance at 2:00 AM UTC. Save your expenses!"
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handlePublishBroadcast}
              className="py-3 px-6 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Publish Live Broadcast</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Centralized Email Hub */}
      {activeTab === 'email' && (
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
              className="py-3 px-6 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs hover:bg-[#255038] dark:hover:bg-[#b7f34c] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingEmail ? 'Dispatching Mail...' : 'Send Broadcast Emails'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Pinned Announcements */}
      {activeTab === 'pinning' && (
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
                      ))
                  }
                  <option value="CUSTOM">✏️ Type Custom Room Code...</option>
                </select>

                {isCustomRoomInput && (
                  <input
                    type="text"
                    placeholder="Enter Room Code (e.g. DUO-KLIZ-2508)"
                    value={customPinRoomId}
                    onChange={e => {
                      const code = e.target.value.toUpperCase();
                      setCustomPinRoomId(code);
                      setTargetPinRoomId(code);
                    }}
                    className="w-full mt-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-400 rounded-xl text-xs font-mono font-bold text-[#1A3827] dark:text-white focus:outline-none"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Pinned By Author Tag</label>
                <input
                  type="text"
                  value={pinAuthor}
                  onChange={e => setPinAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Announcement Content</label>
              <input
                type="text"
                placeholder="e.g. Rent & WiFi bills due on 5th of every month. Please update your splits!"
                value={pinText}
                onChange={e => setPinText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handlePinMessage}
              className="py-3 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Pin className="w-4 h-4" />
              <span>Pin Announcement to Room</span>
            </button>
          </div>

          {/* Active Pinned Messages List */}
          {pinnedMessages && Object.keys(pinnedMessages).length > 0 && (
            <div className="pt-4 border-t border-[#E3E8E3] dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-[#1A3827] dark:text-slate-200 uppercase tracking-wider">
                Active Room Pins ({Object.keys(pinnedMessages).length})
              </h4>
              <div className="space-y-2">
                {Object.entries(pinnedMessages).map(([rId, pinObj]) => (
                  <div key={rId} className="p-3 bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px]">{rId}</span>
                        <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400">• By {pinObj.author}</span>
                      </div>
                      <p className="font-bold text-[#1A3827] dark:text-slate-200 truncate">{pinObj.text}</p>
                    </div>
                    <button
                      onClick={() => handleRemovePin(rId)}
                      className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0"
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
      )}

      {/* Tab 6: Latency & Throttling */}
      {activeTab === 'latency' && (
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
                  }`}
                >
                  {delayMs === 0 ? '0ms (Normal Real Speed)' : `${delayMs}ms (${delayMs === 1500 ? 'Slow 3G' : 'Throttled'})`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Accounts Directory */}
      {activeTab === 'user_directory' && (
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
      )}

      {/* Tab: Banned Accounts Management */}
      {activeTab === 'banned_accounts' && (
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
      )}

      {/* Tab: System Rooms Directory */}
      {activeTab === 'room_explorer' && (
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
      )}
    </div>
  );
}
