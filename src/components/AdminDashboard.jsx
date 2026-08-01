import { useState, useEffect, useCallback } from 'react';
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
  Sliders
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';
import { supabase } from '../supabase';

const ADMIN_EMAILS = ['sampathjogipusala123@gmail.com'];
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
  const [targetPinRoomId, setTargetPinRoomId] = useState(userRooms?.[0]?.roomId || '');
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

  // Fetch Database System Stats
  const fetchSystemStats = useCallback(async () => {
    try {
      const [roomsRes, usersRes, txRes, receiptsRes] = await Promise.allSettled([
        supabase.from('rooms').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('uid', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('receipts').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalRooms: roomsRes.status === 'fulfilled' ? roomsRes.value.count || 0 : 0,
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.count || 0 : 0,
        totalTransactions: txRes.status === 'fulfilled' ? txRes.value.count || 0 : 0,
        totalReceipts: receiptsRes.status === 'fulfilled' ? receiptsRes.value.count || 0 : 0
      });
    } catch (e) {
      console.warn("Stats fetch failed:", e);
    }
  }, []);

  useEffect(() => {
    if (adminAuthenticated) {
      measurePing();
      fetchSystemStats();
    }
  }, [adminAuthenticated, measurePing, fetchSystemStats]);

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

  // Toggle Maintenance Mode
  const handleToggleMaintenance = async () => {
    const nextState = !isSystemMaintenanceActive;
    setIsSystemMaintenanceActive(nextState);
    localStorage.setItem('tallyin_system_maintenance_active', String(nextState));
    localStorage.setItem('tallyin_maintenance_message', maintMsgInput);

    if (triggerToast) {
      triggerToast(nextState ? '🚨 SITE IS NOW UNDER MAINTENANCE' : '✅ Site maintenance mode DEACTIVATED');
    }
  };

  // Publish Global Broadcast
  const handlePublishBroadcast = () => {
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
    if (triggerToast) triggerToast('Global Broadcast Live to all active clients!');
    setBroadcastText('');
  };

  const handleClearBroadcast = () => {
    setGlobalBroadcast(null);
    localStorage.removeItem('tallyin_global_broadcast');
    if (triggerToast) triggerToast('Broadcast message cleared.');
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
        // Fetch all member emails
        const { data: memberData } = await supabase.from('members').select('email');
        recipientList = (memberData || []).map(m => m.email).filter(Boolean);
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
                  <h2 style="color: #1a3827; margin: 0;">Tallyin Central Broadcast</h2>
                  <p style="color: #64748b; font-size: 12px; margin-top: 4px;">System Notification • ${new Date().toLocaleDateString()}</p>
                </div>
                <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                  ${emailBody.replace(/\n/g, '<br/>')}
                </div>
                <div style="text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                  Sent via Tallyin Centralized Admin Portal
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
      if (triggerToast) triggerToast('Email dispatch encountered an issue.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Pin Room Message
  const handlePinMessage = () => {
    if (!pinText.trim() || !targetPinRoomId) {
      if (triggerToast) triggerToast('Please select target room and text.');
      return;
    }

    const updatedPins = {
      ...(pinnedMessages || {}),
      [targetPinRoomId]: {
        id: `pin-${Date.now()}`,
        text: pinText.trim(),
        author: pinAuthor.trim() || 'Admin',
        pinnedAt: new Date().toISOString()
      }
    };

    setPinnedMessages(updatedPins);
    localStorage.setItem('tallyin_pinned_messages', JSON.stringify(updatedPins));
    if (triggerToast) triggerToast(`Announcement pinned to room ${targetPinRoomId}`);
    setPinText('');
  };

  const handleRemovePin = (roomId) => {
    const copy = { ...(pinnedMessages || {}) };
    delete copy[roomId];
    setPinnedMessages(copy);
    localStorage.setItem('tallyin_pinned_messages', JSON.stringify(copy));
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
          <span>Overview Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'maintenance'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>Maintenance Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'email'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Centralized Email Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('pinning')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'pinning'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Pinned Announcements</span>
        </button>

        <button
          onClick={() => setActiveTab('latency')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'latency'
              ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md'
              : 'hud-card text-[#5C6E5C] dark:text-slate-300 hover:text-[#1A3827]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Latency & Throttling</span>
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

            <div className="flex gap-3">
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
                  value={targetPinRoomId}
                  onChange={e => setTargetPinRoomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-bold text-[#1A3827] dark:text-white"
                >
                  {(userRooms || []).map(r => (
                    <option key={r.roomId} value={r.roomId}>🏠 {r.roomName} ({r.roomId})</option>
                  ))}
                </select>
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

    </div>
  );
}
