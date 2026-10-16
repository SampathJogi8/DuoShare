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
      if (!r || (r.status !== 'PENDING' && r.status !== 'PENDING_APPROVAL' && r.status !== 'APPROVED')) return false;
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

  // Realtime subscription and fast polling to detect if Admin activated the account or approved the request remotely
  useEffect(() => {
    // 1. Instantaneous Supabase Realtime Channel (< 100ms)
    let channel;
    try {
      channel = supabase.channel('system_admin_channel')
        .on('broadcast', { event: 'INACTIVE_USERS_UPDATED' }, (payload) => {
          if (payload?.payload?.inactiveUsers && Array.isArray(payload.payload.inactiveUsers)) {
            const inactiveList = payload.payload.inactiveUsers;
            const stillInactive = inactiveList.some(item => {
              if (!item) return false;
              const xId = (typeof item === 'string' ? item : (item.identifier || item.email || item.id || item.userCode || '')).trim().toLowerCase();
              return (cleanEmail && cleanEmail !== 'n/a' && xId === cleanEmail) ||
                     (userUid && xId === userUid.toLowerCase()) ||
                     (userCode && xId === userCode.toLowerCase());
            });
            if (!stillInactive) {
              localStorage.setItem('tallyin_inactive_users', JSON.stringify(inactiveList));
              if (onAccountActivated) onAccountActivated();
            }
          }
        })
        .on('broadcast', { event: 'USER_REACTIVATED' }, (payload) => {
          if (payload?.payload?.inactiveUsers && Array.isArray(payload.payload.inactiveUsers)) {
            const inactiveList = payload.payload.inactiveUsers;
            const stillInactive = inactiveList.some(item => {
              if (!item) return false;
              const xId = (typeof item === 'string' ? item : (item.identifier || item.email || item.id || item.userCode || '')).trim().toLowerCase();
              return (cleanEmail && cleanEmail !== 'n/a' && xId === cleanEmail) ||
                     (userUid && xId === userUid.toLowerCase()) ||
                     (userCode && xId === userCode.toLowerCase());
            });
            if (!stillInactive) {
              localStorage.setItem('tallyin_inactive_users', JSON.stringify(inactiveList));
              if (onAccountActivated) onAccountActivated();
            }
          }
        })
        .on('broadcast', { event: 'ACTIVATION_REQUEST_APPROVED' }, (payload) => {
          if (payload?.payload?.request) {
            const req = payload.payload.request;
            const rEmail = (req.email || '').trim().toLowerCase();
            const rId = String(req.userId || req.id || '').trim().toLowerCase();
            const rCode = String(req.userCode || '').trim().toLowerCase();
            const isSelf = (cleanEmail && cleanEmail !== 'n/a' && rEmail === cleanEmail) ||
                           (userUid && rId === userUid.toLowerCase()) ||
                           (userCode && rCode === userCode.toLowerCase());
            if (isSelf) {
              setPendingRequest(req);
              setSuccessMessage(`Admin approved your request! Check your email (${cleanEmail || 'your inbox'}) for your 6-digit code.`);
            }
          }
        })
        .subscribe();
    } catch (e) {}

    // 2. High-frequency live periodic polling (1.5 seconds)
    const interval = setInterval(async () => {
      try {
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
    }, 1500);

    return () => {
      clearInterval(interval);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
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
      window.dispatchEvent(new CustomEvent('tallyin_inactive_users_updated', { detail: cleaned }));
    }

    try {
      const chan = supabase.channel('system_admin_channel');
      chan.send({
        type: 'broadcast',
        event: 'USER_REACTIVATED',
        payload: {
          inactiveUsers: cleaned,
          reactivatedUser: cleanEmail || cleanName || userCode,
          userCode,
          email: cleanEmail
        }
      }).catch(e => console.warn(e));
      chan.send({
        type: 'broadcast',
        event: 'INACTIVE_USERS_UPDATED',
        payload: { inactiveUsers: cleaned }
      }).catch(e => console.warn(e));
    } catch (e) {}

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
      // Generate a secure cryptographically random 6-digit numeric activation code (100000 - 999999)
      const randomBuf = new Uint32Array(1);
      (typeof window !== 'undefined' && window.crypto ? window.crypto : crypto).getRandomValues(randomBuf);
      const generatedCode = String(100000 + (randomBuf[0] % 900000));
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tallyin.vercel.app';
      const activationLink = `${origin}/?activate_code=${generatedCode}&email=${encodeURIComponent(cleanEmail)}`;

      const reqStatus = isMarkedByAdmin ? 'PENDING_APPROVAL' : 'PENDING';
      const newReq = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: userUid,
        email: cleanEmail || 'No Email',
        name: cleanName,
        userCode,
        daysInactive,
        daysSinceLastActive: daysInactive,
        code: generatedCode,
        activationLink,
        status: reqStatus,
        requiresAdminApproval: Boolean(isMarkedByAdmin),
        isMarkedByAdmin: Boolean(isMarkedByAdmin),
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

      // Only dispatch activation code email to user immediately if NOT marked by Admin (e.g. self-service dormancy).
      // For Admin-marked accounts, the code is mailed ONLY once the Admin approves the request!
      const mailRelayUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
      let emailDispatched = false;

      if (!isMarkedByAdmin && cleanEmail && cleanEmail.includes('@') && cleanEmail.toLowerCase() !== 'n/a' && cleanEmail.toLowerCase() !== 'no email') {
        const userSubject = `Your Tallyin Account Reactivation Code: ${generatedCode} 🔑`;
        const userPlain = `Hello ${cleanName},

You initiated reactivation for your Tallyin account (${userCode}).

Your 6-digit Verification Code:
${generatedCode}

Or click the 1-click reactivation link below:
${activationLink}

Enter this code on the activation screen or click the link above to unlock your account immediately. All your roommate ledgers, rooms, and balances are 100% intact.

Best regards,
Tallyin Support & Administration`;

        const userHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reactivate Your Tallyin Account</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
    <!-- Brand Header with Logo -->
    <tr>
      <td style="padding: 24px 28px; background: linear-gradient(135deg, #1A3827 0%, #0F2418 100%); text-align: left;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="48" valign="middle">
              <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="Tallyin Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; border-radius: 12px; border: 2px solid rgba(163, 230, 53, 0.5); object-fit: contain; background-color: #1A3827;" />
            </td>
            <td style="padding-left: 14px;" valign="middle">
              <span style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; display: block; line-height: 1.1;">Tallyin</span>
              <span style="display: block; font-size: 10px; font-weight: 800; color: #A3E635; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px;">Smart Expense &amp; Room Sync</span>
            </td>
            <td align="right" valign="middle">
              <span style="background-color: rgba(163, 230, 53, 0.15); border: 1px solid rgba(163, 230, 53, 0.4); color: #A3E635; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.5px;">
                Account Recovery
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px 24px 28px;">
        <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 900; color: #0F172A; letter-spacing: -0.4px;">
          Your Account Reactivation Code
        </h1>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
          Hi <strong>${cleanName}</strong>, you initiated a request to reactivate your inactive Tallyin account (<code>${userCode}</code>).
        </p>

        <!-- User Dossier Pill -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px 16px; margin-bottom: 20px;">
          <tr>
            <td style="font-size: 12px; color: #64748B;">Registered Account: <strong style="color: #0F172A;">${cleanName}</strong></td>
            <td align="right" style="font-size: 12px; color: #64748B;">User Code: <strong style="font-family: monospace; color: #047857;">${userCode}</strong></td>
          </tr>
        </table>

        <!-- 6-Digit Code Box -->
        <div style="background-color: #F0FDF4; border: 2px dashed #22C55E; border-radius: 16px; padding: 22px 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 11px; text-transform: uppercase; color: #15803D; font-weight: 800; letter-spacing: 1.5px; display: block;">6-Digit Verification Code</span>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #166534; letter-spacing: 6px; margin-top: 8px;">
            ${generatedCode}
          </div>
          <span style="font-size: 11px; color: #15803D; margin-top: 4px; display: block;">Valid for one-time self-service reactivation</span>
        </div>

        <!-- 1-Click CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 16px 0;">
          <tr>
            <td align="center">
              <a href="${activationLink}" target="_blank" style="display: inline-block; background-color: #1A3827; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(26, 56, 39, 0.25); letter-spacing: 0.3px;">
                Reactivate Account in 1-Click &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style="background-color: #F8FAFC; border-left: 3px solid #10B981; border-radius: 8px; padding: 12px 14px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5;">
            🔒 <strong>100% Data Safety:</strong> Your rooms, group debts, roommate balances, and expense histories remain completely intact and active.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 28px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B;">
          Need assistance? Reach out to support at <a href="mailto:sampathjogipusala123@gmail.com" style="color: #047857; text-decoration: none; font-weight: bold;">sampathjogipusala123@gmail.com</a>
        </p>
        <p style="margin: 0; font-size: 10px; color: #94A3B8; font-family: monospace;">
          Tallyin Platform &bull; Security &amp; Dormancy Governance &bull; Confidential
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

        try {
          fetch(mailRelayUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'send_email',
              to: cleanEmail,
              subject: userSubject,
              body: userPlain,
              htmlBody: userHtml
            })
          });
          emailDispatched = true;
        } catch (e) {
          console.warn("User email dispatch notice:", e);
        }
      }

      setPendingRequest(newReq);
      try {
        const chan = supabase.channel('system_admin_channel');
        chan.send({
          type: 'broadcast',
          event: 'ACTIVATION_REQUEST_CREATED',
          payload: { request: newReq }
        }).catch(e => console.warn(e));
      } catch (e) {}

      if (isMarkedByAdmin) {
        setSuccessMessage(`Reactivation request submitted to Platform Admin. As soon as the Admin approves your request, your 6-digit activation code will be mailed to ${cleanEmail || 'your email'}.`);
        if (triggerToast) triggerToast("Reactivation request submitted to Admin!");
      } else if (emailDispatched) {
        setSuccessMessage(`A 6-digit activation code was sent to ${cleanEmail}. Check your inbox or enter the code below to unlock access.`);
        if (triggerToast) triggerToast(`Activation code sent to ${cleanEmail}!`);
      } else {
        setSuccessMessage(`Activation code generated: ${generatedCode}. Enter it below to unlock access.`);
        if (triggerToast) triggerToast(`Activation code: ${generatedCode}`);
      }
    } catch (err) {
      console.error("Failed to request activation code:", err);
      setErrorMessage("Could not generate activation code. Please check your internet connection.");
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
        if (!r || (r.status !== 'PENDING' && r.status !== 'PENDING_APPROVAL' && r.status !== 'APPROVED')) return false;
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
        setErrorMessage("Invalid or expired activation code. Please check the code in your email or click resend.");
        setIsVerifying(false);
        return;
      }

      if (matchingReq.requiresAdminApproval && matchingReq.status === 'PENDING_APPROVAL') {
        setErrorMessage("Your reactivation request has been submitted to the Admin and is awaiting review. As soon as the Admin approves it, your activation code will be dispatched to your email.");
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
                <>Your account access has been placed on an <strong>administrative hold</strong> by the Platform Admin{inactiveInfo?.reason && inactiveInfo.reason !== 'Marked Inactive by Admin' ? ` for "${inactiveInfo.reason}"` : ' pending account / policy review'}. To restore access, submit an activation request below for admin approval.</>
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
                    Admin Hold{inactiveInfo?.reason && inactiveInfo.reason !== 'Marked Inactive by Admin' ? `: ${inactiveInfo.reason}` : ' (Policy / Admin Action)'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    Dormant ({daysInactive}+ Days Inactive)
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
            {/* Step 1: Send Activation Code to Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-mono text-[10px] font-black flex items-center justify-center">1</span>
                  Send Code to Your Email
                </span>
                {pendingRequest && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ✓ Code Sent to Email
                  </span>
                )}
              </div>

              {pendingRequest ? (
                <div className={`p-4 rounded-2xl space-y-2.5 text-xs border ${
                  pendingRequest.status === 'APPROVED'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : isMarkedByAdmin
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {pendingRequest.status === 'APPROVED' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-950 dark:text-emerald-200">Admin Approved! Code Mailed to {cleanEmail || 'your email'}</span>
                        </>
                      ) : isMarkedByAdmin ? (
                        <>
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span className="text-amber-950 dark:text-amber-200">Request Submitted (Awaiting Admin Approval)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-950 dark:text-emerald-200">Code Dispatched to {cleanEmail || 'your email'}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(pendingRequest.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pendingRequest.status === 'APPROVED' ? (
                      <>The Administrator has approved your request! Check your inbox or spam folder for your <strong>6-digit activation code</strong> and enter it below to restore full access immediately.</>
                    ) : isMarkedByAdmin ? (
                      <>Your reactivation request has been submitted to the Administrator for approval. Once approved, your <strong>6-digit activation code</strong> will be dispatched to <strong>{cleanEmail}</strong>.</>
                    ) : (
                      <>Check your inbox or spam folder for your <strong>6-digit activation code</strong>. Entering the code below will unlock your account immediately.</>
                    )}
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRequestActivationCode}
                      disabled={isRequesting}
                      className="text-[11px] font-bold text-emerald-700 dark:text-[#A3E635] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRequesting ? 'animate-spin' : ''}`} />
                      <span>{isRequesting ? 'Submitting...' : (isMarkedByAdmin ? 'Resubmit Request to Admin' : 'Resend Code via Email')}</span>
                    </button>
                    {pendingRequest.status === 'APPROVED' && pendingRequest.activationLink && (
                      <>
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
                          <span>{copiedLink ? 'Link Copied!' : 'Copy 1-Click Link'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestActivationCode}
                  disabled={isRequesting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isRequesting ? 'animate-spin' : ''}`} />
                  <span>
                    {isRequesting 
                      ? 'Submitting Request...' 
                      : (isMarkedByAdmin ? 'Request Reactivation from Admin' : 'Send 6-Digit Code to My Email')}
                  </span>
                </button>
              )}
            </div>

            {/* Step 2: Enter 6-Digit Activation Code */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-mono text-[10px] font-black flex items-center justify-center">2</span>
                  Enter 6-Digit Code to Unlock Access
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
                  placeholder="Enter 6-digit code"
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
                  <span>{isVerifying ? 'Verifying...' : 'Verify & Unlock'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Instructions Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Instant Self-Service Reactivation:</strong> Inactivity is not a ban. You do not need to wait for administrator approval — entering your 6-digit code or clicking the email link unlocks your account immediately.
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
