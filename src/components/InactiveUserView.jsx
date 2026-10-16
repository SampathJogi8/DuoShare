import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  LogOut, 
  Sun, 
  Moon, 
  Copy, 
  ExternalLink, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  HelpCircle,
  Shield,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';
import { supabase } from '../supabase';
import { getUserCode } from '../utils/userCode';

export default function InactiveUserView({
  user,
  inactiveInfo,
  handleSignOut,
  isDarkMode,
  setIsDarkMode,
  onOpenAdmin,
  onAccountActivated,
  triggerToast
}) {
  const [inputCode, setInputCode] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // User Identifiers
  const cleanEmail = (user?.email || inactiveInfo?.email || (typeof window !== 'undefined' ? localStorage.getItem('tallyin_user_email') : '') || '').trim().toLowerCase();
  const cleanName = (user?.displayName || inactiveInfo?.name || (typeof window !== 'undefined' ? localStorage.getItem('userNickname') : '') || 'Tallyin User').trim();
  const userUid = String(user?.uid || inactiveInfo?.id || inactiveInfo?.uid || '');
  const userCode = (cleanEmail === 'sampathjogipusala123@gmail.com') ? 'USR-0000-8888' : (inactiveInfo?.userCode || getUserCode(cleanEmail || userUid || cleanName));
  const daysInactive = inactiveInfo?.daysInactive || inactiveInfo?.daysSinceLastActive || 90;
  const isMarkedByAdmin = inactiveInfo?.markedBy === 'ADMIN' || (typeof inactiveInfo?.reason === 'string' && inactiveInfo.reason.toLowerCase().includes('admin'));

  // Fetch pending activation requests from Supabase / localStorage
  const fetchActivationRequests = useCallback(async () => {
    let requests = [];

    // 1. Try rooms table __SYSTEM_ACTIVATION_REQUESTS__
    try {
      const { data } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', '__SYSTEM_ACTIVATION_REQUESTS__')
        .maybeSingle();

      if (data?.name && data.name.startsWith('[')) {
        requests = JSON.parse(data.name);
      }
    } catch (e) {}

    // 2. Try system_settings activation_requests
    if (!requests || requests.length === 0) {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'activation_requests')
          .maybeSingle();

        if (data?.value && Array.isArray(data.value)) {
          requests = data.value;
        }
      } catch (e) {}
    }

    // 3. Fallback to localStorage
    if (!requests || requests.length === 0) {
      try {
        const saved = localStorage.getItem('tallyin_activation_requests');
        if (saved) requests = JSON.parse(saved);
      } catch (e) {}
    }

    if (!Array.isArray(requests)) requests = [];

    // Find pending request for this user
    const found = requests.find(r => {
      if (!r || r.status !== 'PENDING') return false;
      const rEmail = (r.email || '').trim().toLowerCase();
      const rId = String(r.userId || r.id || '').trim().toLowerCase();
      const rCode = String(r.userCode || '').trim().toLowerCase();

      return (cleanEmail && cleanEmail !== 'n/a' && rEmail === cleanEmail) ||
             (userUid && rId === userUid.toLowerCase()) ||
             (userCode && rCode === userCode.toLowerCase());
    });

    if (found) {
      setPendingRequest(found);
    }
    return requests;
  }, [cleanEmail, userUid, userCode]);

  // Initial load: fetch requests & check URL activation link
  useEffect(() => {
    fetchActivationRequests();

    // Check if URL has ?activate_code=123456 or #activate_code=123456
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('activate_code') || params.get('code') || params.get('activate');
        if (codeParam && codeParam.trim()) {
          const trimmed = codeParam.trim().toUpperCase();
          setInputCode(trimmed);
          handlePerformActivation(trimmed);
        }
      }
    } catch (e) {}
  }, [fetchActivationRequests]);

  // Polling to detect if Admin activated the account or approved the request remotely
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Check rooms table __SYSTEM_INACTIVE_USERS__
        const { data } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_INACTIVE_USERS__')
          .maybeSingle();

        if (data?.name && data.name.startsWith('[')) {
          const inactiveList = JSON.parse(data.name);
          const stillInactive = inactiveList.some(item => {
            if (!item) return false;
            const xId = (typeof item === 'string' ? item : (item.identifier || item.email || item.id || item.userCode || '')).trim().toLowerCase();
            return (cleanEmail && cleanEmail !== 'n/a' && xId === cleanEmail) ||
                   (userUid && xId === userUid.toLowerCase()) ||
                   (userCode && xId === userCode.toLowerCase());
          });

          // If no longer in inactive list, account was activated by admin!
          if (!stillInactive) {
            localStorage.setItem('tallyin_inactive_users', JSON.stringify(inactiveList));
            if (onAccountActivated) onAccountActivated();
            return;
          }
        }
      } catch (err) {}
    }, 3500);

    return () => clearInterval(interval);
  }, [cleanEmail, userUid, userCode, onAccountActivated]);

  // Save updated requests list across Supabase and localStorage
  const saveActivationRequests = async (updatedList) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tallyin_activation_requests', JSON.stringify(updatedList));
    }
    try {
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_ACTIVATION_REQUESTS__',
          name: JSON.stringify(updatedList),
          pin: '9999',
          created_by: 'system_security_daemon',
          monthly_budget: 0,
          max_members: 100
        }, { onConflict: 'id' });
    } catch (e) {}
    try {
      await supabase
        .from('system_settings')
        .upsert({ key: 'activation_requests', value: updatedList }, { onConflict: 'key' });
    } catch (e) {}
  };

  // Remove this user from inactive registry and persist
  const removeUserFromInactiveRegistry = async () => {
    let inactiveList = [];
    try {
      const saved = localStorage.getItem('tallyin_inactive_users');
      if (saved) inactiveList = JSON.parse(saved);
    } catch (e) {}

    try {
      const { data } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', '__SYSTEM_INACTIVE_USERS__')
        .maybeSingle();
      if (data?.name && data.name.startsWith('[')) {
        inactiveList = JSON.parse(data.name);
      }
    } catch (e) {}

    const cleaned = inactiveList.filter(item => {
      if (!item) return false;
      const xId = (typeof item === 'string' ? item : (item.identifier || item.email || item.id || item.userCode || '')).trim().toLowerCase();
      const matches = (cleanEmail && cleanEmail !== 'n/a' && xId === cleanEmail) ||
                      (userUid && xId === userUid.toLowerCase()) ||
                      (userCode && xId === userCode.toLowerCase());
      return !matches;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('tallyin_inactive_users', JSON.stringify(cleaned));
    }
    try {
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_INACTIVE_USERS__',
          name: JSON.stringify(cleaned),
          pin: '9999',
          created_by: 'system_security_daemon',
          monthly_budget: 0,
          max_members: 100
        }, { onConflict: 'id' });
    } catch (e) {}
    try {
      await supabase
        .from('system_settings')
        .upsert({ key: 'inactive_users', value: cleaned }, { onConflict: 'key' });
    } catch (e) {}
  };

  // Handle requesting a new activation code
  const handleRequestActivationCode = async () => {
    setIsRequesting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Generate a secure 6-digit numeric activation code
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tallyin.vercel.app';
      const activationLink = `${origin}/?activate_code=${generatedCode}&email=${encodeURIComponent(cleanEmail)}`;

      const newReq = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: userUid,
        email: cleanEmail || 'No Email',
        name: cleanName,
        userCode,
        code: generatedCode,
        activationLink,
        status: 'PENDING',
        requestedAt: new Date().toISOString()
      };

      // Fetch existing requests and replace or append
      const allRequests = await fetchActivationRequests();
      const filtered = allRequests.filter(r => {
        const rEmail = (r.email || '').trim().toLowerCase();
        const rId = String(r.userId || r.id || '').trim().toLowerCase();
        const rCode = String(r.userCode || '').trim().toLowerCase();
        const isSelf = (cleanEmail && cleanEmail !== 'n/a' && rEmail === cleanEmail) ||
                       (userUid && rId === userUid.toLowerCase()) ||
                       (userCode && rCode === userCode.toLowerCase());
        return !isSelf;
      });

      const updated = [newReq, ...filtered];
      await saveActivationRequests(updated);

      setPendingRequest(newReq);
      setSuccessMessage("Activation code requested! The Admin has been notified in the Command Console. Contact your Admin or enter the 6-digit code below.");
      if (triggerToast) triggerToast("Activation code requested! Admin notified.");
    } catch (err) {
      console.error("Failed to request activation code:", err);
      setErrorMessage("Could not submit activation request. Please check your internet connection.");
    } finally {
      setIsRequesting(false);
    }
  };

  // Perform activation given a code
  const handlePerformActivation = async (codeToVerify) => {
    const targetCode = String(codeToVerify || inputCode || '').trim().toUpperCase();
    if (!targetCode) {
      setErrorMessage("Please enter your 6-digit activation code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const allRequests = await fetchActivationRequests();
      
      // Match candidate request
      const matchingReq = allRequests.find(r => {
        if (!r || r.status !== 'PENDING') return false;
        const matchesCode = String(r.code || '').trim().toUpperCase() === targetCode;
        if (!matchesCode) return false;

        const rEmail = (r.email || '').trim().toLowerCase();
        const rId = String(r.userId || r.id || '').trim().toLowerCase();
        const rCode = String(r.userCode || '').trim().toLowerCase();

        return (cleanEmail && cleanEmail !== 'n/a' && rEmail === cleanEmail) ||
               (userUid && rId === userUid.toLowerCase()) ||
               (userCode && rCode === userCode.toLowerCase()) ||
               (!cleanEmail && !userUid); // Fallback if anonymous
      });

      if (!matchingReq) {
        setErrorMessage("Invalid or expired activation code. Please double check with your Admin.");
        setIsVerifying(false);
        return;
      }

      // Mark request as ACTIVATED
      const updatedRequests = allRequests.map(r => {
        if (r.id === matchingReq.id) {
          return {
            ...r,
            status: 'ACTIVATED',
            activatedAt: new Date().toISOString()
          };
        }
        return r;
      });
      await saveActivationRequests(updatedRequests);

      // Remove from inactive users registry
      await removeUserFromInactiveRegistry();

      setSuccessMessage("Account successfully reactivated! Restoring access...");
      if (triggerToast) triggerToast("🎉 Account successfully reactivated!");

      setTimeout(() => {
        if (onAccountActivated) {
          onAccountActivated();
        }
      }, 700);

    } catch (err) {
      console.error("Failed to verify activation code:", err);
      setErrorMessage("Error verifying activation code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <img 
            src={faviconLogo} 
            alt="Tallyin Logo" 
            className="w-8 h-8 rounded-xl object-contain shadow-2xs border border-emerald-500/30" 
          />
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Tallyin
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {isMarkedByAdmin ? 'Account Paused' : 'Inactive Session'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-[#A3E635] dark:text-slate-950 text-xs font-black hover:opacity-95 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Hero Icon & Title */}
          <div className="text-center space-y-2.5">
            <div className={`w-14 h-14 mx-auto rounded-2xl ${
              isMarkedByAdmin 
                ? 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 text-orange-600 dark:text-orange-400 shadow-orange-500/10' 
                : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 shadow-amber-500/10'
            } flex items-center justify-center shadow-md`}>
              {isMarkedByAdmin ? (
                <ShieldAlert className="w-7 h-7 animate-pulse text-orange-600 dark:text-orange-400" />
              ) : (
                <Clock className="w-7 h-7 animate-pulse text-amber-600 dark:text-amber-400" />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isMarkedByAdmin ? 'Account Paused by Administrator' : 'Account Temporarily Inactive'}
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isMarkedByAdmin ? (
                <>Your account access has been placed on an <strong>administrative hold</strong> by the Platform Admin. To restore access, request an activation code or enter your verification code below.</>
              ) : (
                <>Your account has entered dormant status due to <strong>{daysInactive}+ days without activity</strong>. Reactivating restores full access immediately.</>
              )}
            </p>
          </div>

          {/* User Identity Card - Clean 2-Tier Layout (No Cramming / No Bad Wrapping) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                  isMarkedByAdmin 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950'
                }`}>
                  {cleanName ? cleanName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {cleanName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                    {cleanEmail || 'No email attached'}
                  </p>
                </div>
              </div>

              {/* User Code with Copy Button */}
              <div 
                onClick={() => {
                  navigator.clipboard.writeText(userCode);
                  if (triggerToast) triggerToast(`Copied ${userCode}!`);
                }}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#A3E635] border border-emerald-300/80 dark:border-emerald-800 font-mono text-[11px] font-bold cursor-pointer hover:bg-emerald-100 transition-colors whitespace-nowrap"
                title="Click to copy User Code"
              >
                <span>{userCode}</span>
                <Copy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Differentiated Status Bar */}
            <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[11px]">
                {isMarkedByAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-800">
                    <ShieldAlert className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    Marked Inactive by Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    Inactive ({daysInactive}+ Days Dormant)
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Ledger Status: Protected
              </span>
            </div>
          </div>

          {/* Data Safety Assurance Banner */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Your Data &amp; Balances Are 100% Safe.</strong> All shared rooms, group expenses, and settlements are intact.
            </span>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Recovery Flow: Step 1 & Step 2 */}
          <div className="space-y-4 pt-1">
            {/* Step 1: Request Activation from Admin */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-mono text-[10px] font-black flex items-center justify-center">1</span>
                  Request Activation Code
                </span>
                {pendingRequest && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                    ✓ Request Dispatched
                  </span>
                )}
              </div>

              {pendingRequest ? (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-950 dark:text-amber-200 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Notified Admin in Command Console</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(pendingRequest.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                    Ask your Admin for the <strong>6-digit activation code</strong>, or check your email for the 1-click activation link.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRequestActivationCode}
                      disabled={isRequesting}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRequesting ? 'animate-spin' : ''}`} />
                      <span>{isRequesting ? 'Requesting...' : 'Request New Code'}</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingRequest.activationLink) {
                          navigator.clipboard.writeText(pendingRequest.activationLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                          if (triggerToast) triggerToast("Copied activation link!");
                        }
                      }}
                      className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Activation Link'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestActivationCode}
                  disabled={isRequesting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <KeyRound className={`w-4 h-4 ${isRequesting ? 'animate-spin' : ''}`} />
                  <span>{isRequesting ? 'Submitting Request to Admin...' : 'Request Activation Code from Admin'}</span>
                </button>
              )}
            </div>

            {/* Step 2: Enter 6-Digit Activation Code */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-mono text-[10px] font-black flex items-center justify-center">2</span>
                  Enter 6-Digit Verification Code
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePerformActivation();
                  }}
                  placeholder="e.g. 849201"
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl text-center font-mono text-base font-black tracking-widest text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs"
                />
                <button
                  type="button"
                  onClick={() => handlePerformActivation()}
                  disabled={isVerifying || !inputCode.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{isVerifying ? 'Verifying...' : 'Activate Account'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Instructions Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Once approved by the Platform Administrator, your session will automatically unlock, or you can enter the 6-digit code above.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-[11px] text-slate-400 font-mono">
        Tallyin Security &amp; Dormancy Governance • Active Safeguard
      </footer>
    </div>
  );
}
