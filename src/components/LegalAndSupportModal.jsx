import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Mail, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Send, 
  Lock, 
  Database, 
  Eye, 
  HeartHandshake, 
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Scale,
  Users,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '../supabase';
import { getUserCode } from '../utils/userCode';

const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const SUPPORT_EMAIL = 'tallyin.alerts@gmail.com';

export default function LegalAndSupportModal({
  isOpen = true,
  initialTab = 'privacy',
  onClose,
  user = null,
  triggerToast = null,
  isFullPage = false,
  onNavigate = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'privacy');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  
  // Contact Form State
  const [contactName, setContactName] = useState(user?.displayName || user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactCategory, setContactCategory] = useState('general');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');
  const [submittedUserCode, setSubmittedUserCode] = useState('');

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    if (triggerToast) triggerToast('Support email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendContactMessage = async (e) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) {
      if (triggerToast) triggerToast('Please provide your email address and message.');
      return;
    }

    setIsSending(true);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketId = `REQ-${dateStr}-${randCode}`;
    const cleanEmail = contactEmail.trim().toLowerCase();
    const cleanName = contactName.trim() || user?.displayName || user?.name || user?.nickname || cleanEmail.split('@')[0] || 'Tallyin User';
    const userCode = (cleanEmail === 'sampathjogipusala123@gmail.com' || user?.email?.toLowerCase() === 'sampathjogipusala123@gmail.com') ? 'USR-0000-8888' : (user?.user_code || user?.userCode || getUserCode(cleanEmail || user?.id || user?.uid));
    const nowIso = new Date().toISOString();

    const categoryMap = {
      general: 'General Support / Question',
      room_access: 'Room Access / Joining Trouble',
      dispute_help: 'Room Expense Dispute Assistance',
      feature_request: 'Feature Suggestion & Feedback',
      bug_report: 'Bug Report / Sync Glitch',
      privacy: 'Privacy & Data Deletion Request'
    };
    const cleanCategory = categoryMap[contactCategory] || contactCategory || 'General Support';
    const isDispute = contactCategory === 'dispute_help' || cleanCategory.toLowerCase().includes('dispute');
    const cleanTitle = contactSubject.trim() || `Support Inquiry: ${cleanCategory}`;
    const cleanMessage = contactMessage.trim();

    const newTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      refNumber: ticketId,
      type: isDispute ? 'dispute' : 'query',
      category: cleanCategory,
      title: cleanTitle,
      description: cleanMessage,
      room_id: user?.roomId || user?.room_id || null,
      room_name: user?.roomName || null,
      transaction_id: null,
      transaction_title: null,
      transaction_amount: null,
      user_code: userCode,
      user_email: cleanEmail,
      user_name: cleanName,
      user_id: user?.uid || user?.id || null,
      status: 'OPEN',
      priority: isDispute ? 'HIGH' : 'MEDIUM',
      createdAt: nowIso,
      updatedAt: nowIso,
      adminResponse: null,
      resolvedBy: null,
      resolvedAt: null
    };

    // Optimistically update UI so user has instant feedback
    setSubmittedTicketId(ticketId);
    setSubmittedUserCode(userCode);
    setIsSent(true);
    if (triggerToast) triggerToast(`Message sent! Reference: ${ticketId}`);

    // Asynchronously save to Supabase, Realtime broadcast, and dispatch emails
    (async () => {
      try {
        let currentList = [];
        try {
          const { data } = await supabase
            .from('rooms')
            .select('name')
            .eq('id', '__SYSTEM_USER_DISPUTES_QUERIES__')
            .maybeSingle();

          if (data?.name && data.name.startsWith('[')) {
            currentList = JSON.parse(data.name);
          } else {
            const { data: setRow } = await supabase
              .from('system_settings')
              .select('value')
              .eq('key', 'user_disputes_and_queries')
              .maybeSingle();
            if (setRow?.value) {
              const parsed = typeof setRow.value === 'string' ? JSON.parse(setRow.value) : setRow.value;
              if (Array.isArray(parsed)) currentList = parsed;
            }
          }
        } catch (fetchErr) {
          console.warn("Could not fetch existing tickets:", fetchErr);
        }

        const updatedGlobal = [newTicket, ...(Array.isArray(currentList) ? currentList.filter(t => t.id !== newTicket.id) : [])];

        // Also save to user's local storage history
        try {
          const mySaved = JSON.parse(localStorage.getItem('tallyin_my_disputes_and_queries') || '[]');
          localStorage.setItem('tallyin_my_disputes_and_queries', JSON.stringify([newTicket, ...mySaved.filter(t => t.id !== newTicket.id)]));
        } catch (lsErr) {}

        // Email template for User Acknowledgment
        const userAckHtml = `
          <div style="background-color: #f6f8f6; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e3e8e3; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <div style="background: linear-gradient(135deg, #1A3827 0%, #214732 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
                <div style="text-align: center; margin-bottom: 14px;">
                  <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="Tallyin Logo" width="52" height="52" style="display: inline-block; width: 52px; height: 52px; border-radius: 14px; border: 2px solid #A3E635; box-shadow: 0 4px 12px rgba(0,0,0,0.35); vertical-align: middle;" />
                </div>
                <div style="display: inline-block; background-color: #A3E635; color: #0a1b11; font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
                  Tallyin Support &amp; Helpdesk
                </div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Inquiry Acknowledged</h1>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0;">Your support ticket has been received and registered</p>
              </div>

              <div style="padding: 28px 24px; color: #1A3827; font-size: 13px; line-height: 1.6;">
                <p style="margin-top: 0;">Hi <strong>${cleanName}</strong>,</p>
                <p>Thank you for contacting Tallyin. We have received your inquiry and our support operations team has registered it under the tracking reference ID below:</p>
                
                <div style="background-color: #eaf0ec; border: 1px solid #cbd7cc; border-left: 4px solid #1A3827; padding: 14px 18px; border-radius: 12px; margin: 20px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #5c6e5c; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Reference ID</div>
                  <div style="font-size: 18px; font-weight: 900; color: #1A3827; font-family: monospace; margin-top: 2px;">${ticketId}</div>
                  <div style="font-size: 11px; font-weight: 700; color: #5c6e5c; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px;">Unique User Tracking Code</div>
                  <div style="font-size: 14px; font-weight: 900; color: #166534; font-family: monospace; margin-top: 2px;">${userCode}</div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                  <tr>
                    <td style="padding: 6px 0; color: #5c6e5c; width: 90px; vertical-align: top;"><strong>Category:</strong></td>
                    <td style="padding: 6px 0; color: #1A3827; font-weight: 600;">${cleanCategory}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #5c6e5c; vertical-align: top;"><strong>Subject:</strong></td>
                    <td style="padding: 6px 0; color: #1A3827; font-weight: 600;">${cleanTitle}</td>
                  </tr>
                </table>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Your Submission Details:</div>
                  <div style="font-size: 12px; color: #334155; white-space: pre-wrap; line-height: 1.5;">${cleanMessage}</div>
                </div>

                <div style="border-top: 1px solid #e3e8e3; padding-top: 18px; font-size: 12px; color: #5c6e5c;">
                  <p style="margin: 0 0 8px 0;"><strong>What happens next?</strong></p>
                  <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
                    <li>Our support team typically reviews inquiries within <strong>12 to 24 hours</strong> on weekdays.</li>
                    <li>Our response will be sent directly to your email: <strong>${cleanEmail}</strong>.</li>
                    <li>If you need to provide additional details, simply reference ticket <code>${ticketId}</code> or user code <code>${userCode}</code>.</li>
                  </ul>
                </div>
              </div>

              <div style="background-color: #f6f8f6; border-top: 1px solid #e3e8e3; padding: 18px 24px; text-align: center; font-size: 11px; color: #718271;">
                <div style="margin-bottom: 8px;">
                  <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="Tallyin" width="22" height="22" style="display: inline-block; vertical-align: middle; border-radius: 6px; margin-right: 6px;" />
                  <span style="font-weight: 800; color: #1A3827; font-size: 12px; vertical-align: middle;">Tallyin</span>
                </div>
                <p style="margin: 0;">Tallyin Support &amp; Dispute Operations Desk</p>
                <p style="margin: 4px 0 0 0; color: #94a394;">Official Helpdesk: <a href="mailto:tallyin.alerts@gmail.com" style="color: #1A3827; font-weight: 700; text-decoration: none;">tallyin.alerts@gmail.com</a></p>
              </div>
            </div>
          </div>
        `;

        // Email template for Admin Alert
        const adminAlertHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
              <div style="margin-bottom: 12px;">
                <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="Tallyin Logo" width="48" height="48" style="display: inline-block; border-radius: 12px; border: 2px solid #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.25);" />
              </div>
              <span style="background-color: #ecfdf5; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">New Support Desk Inquiry</span>
              <h2 style="color: #1a3827; margin: 8px 0 0 0;">${cleanCategory}</h2>
              <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Tracking Ref: <strong>${ticketId}</strong> • User Code: <strong>${userCode}</strong></p>
            </div>
            <div style="padding: 20px 0; color: #334155; font-size: 13px; line-height: 1.6;">
              <p><strong>From:</strong> ${cleanName} (<a href="mailto:${cleanEmail}">${cleanEmail}</a>)</p>
              <p><strong>Verified User Code:</strong> <span style="font-family: monospace; font-weight: bold; background-color: #ecfdf5; padding: 3px 8px; border-radius: 6px; color: #065f46; border: 1px solid #a7f3d0;">${userCode}</span></p>
              <p><strong>Subject:</strong> ${cleanTitle}</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 16px 0; white-space: pre-wrap;">
                ${cleanMessage}
              </div>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
              <div style="margin-bottom: 6px;">
                <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="Tallyin" width="18" height="18" style="display: inline-block; vertical-align: middle; border-radius: 4px; margin-right: 6px;" />
                <span style="font-weight: 700; color: #1a3827;">Tallyin Operations Desk</span>
              </div>
              Tallyin Help &amp; Dispute Operations Center • <a href="https://tallyin.vercel.app/admin" style="color: #10b981; font-weight: bold;">Open Admin Console</a>
            </div>
          </div>
        `;

        await Promise.allSettled([
          // A. Upsert into rooms table
          supabase
            .from('rooms')
            .upsert({
              id: '__SYSTEM_USER_DISPUTES_QUERIES__',
              name: JSON.stringify(updatedGlobal),
              created_by: 'system',
              created_at: nowIso
            }, { onConflict: 'id' }),

          // B. Upsert into system_settings table
          supabase
            .from('system_settings')
            .upsert({
              key: 'user_disputes_and_queries',
              value: JSON.stringify(updatedGlobal),
              created_at: nowIso
            }, { onConflict: 'key' }),

          // C. Realtime Broadcast to active Admin Dashboard
          (async () => {
            try {
              const channel = supabase.channel('system_admin_channel');
              await channel.send({
                type: 'broadcast',
                event: 'DISPUTE_SUBMITTED',
                payload: { dispute: newTicket }
              });
            } catch (bcErr) {
              console.warn("Realtime broadcast error:", bcErr);
            }
          })(),

          // D. Alert Email to Admin Team
          fetch(CENTRAL_EMAIL_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'send_email',
              to: SUPPORT_EMAIL,
              subject: `🚨 [${ticketId}] Support Inquiry: ${cleanTitle} (From: ${cleanEmail})`,
              body: `New Support Inquiry [${ticketId}]\nFrom: ${cleanName} (${cleanEmail})\nCategory: ${cleanCategory}\nSubject: ${cleanTitle}\n\nMessage:\n${cleanMessage}`,
              htmlBody: adminAlertHtml,
              senderName: 'Tallyin Support Queue'
            })
          }),

          // E. ACKNOWLEDGMENT EMAIL TO USER
          fetch(CENTRAL_EMAIL_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'send_email',
              to: cleanEmail,
              subject: `✅ [${ticketId}] We received your inquiry: ${cleanTitle}`,
              body: `Hi ${cleanName},\n\nThank you for reaching out to Tallyin. We have received your inquiry and our support team has registered it under tracking ID: ${ticketId}.\n\nCategory: ${cleanCategory}\nSubject: ${cleanTitle}\n\nYour message:\n${cleanMessage}\n\nOur team typically responds within 12 to 24 hours on weekdays.\n\nTallyin Support Desk`,
              htmlBody: userAckHtml,
              senderName: 'Tallyin Support Desk'
            })
          })
        ]);
      } catch (err) {
        console.error('Support dispatch error:', err);
      } finally {
        setIsSending(false);
      }
    })();
  };

  const content = (
    <div className="flex flex-col h-[90vh] max-h-[860px] min-h-[580px] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-[#E3E8E3] dark:border-slate-800 overflow-hidden text-left font-sans">
      
      {/* ── TALLYIN BRANDED HEADER HERO ── */}
      <div className="bg-gradient-to-r from-[#1A3827] via-[#214732] to-[#1A3827] text-white px-6 sm:px-8 py-3.5 sm:py-4 shrink-0 border-b border-emerald-950/40 relative overflow-hidden">
        {/* Subtle decorative background patterns */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#A3E635]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/3 w-28 h-28 rounded-full bg-[#BEF264]/5 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {isFullPage && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#A3E635] text-slate-950 inline-flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Tallyin Trust &amp; Standards</span>
                </span>
                <span className="text-[10px] text-emerald-200/80 font-medium">Official Reference</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Policies, Privacy &amp; Support Hub</span>
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-100/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── TALLYIN SEGMENTED NAVIGATION PILLS ── */}
      <div className="px-6 sm:px-8 py-2.5 bg-[#F6F8F6] dark:bg-slate-900 border-b border-[#E3E8E3] dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-[#EAF0EC] dark:bg-slate-950 rounded-2xl max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Usage Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT BODY ── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 sm:py-6 space-y-6 pb-12">
        
        {/* ══════════════════════════════════════════
            MODULE 1: PRIVACY POLICY
        ══════════════════════════════════════════ */}
        {activeTab === 'privacy' && (
          <div className="space-y-5 w-full animate-fade-in text-[#1A3827] dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
            
            {/* Core Principle Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#EAF0EC] to-emerald-500/5 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-600/20 dark:border-[#A3E635]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[#1A3827] dark:text-white text-xs sm:text-sm">
                      Core Commitment: Zero Data Commercialization &amp; Isolated Vaults
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 hidden sm:inline-block">
                      Strict Guarantee
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-300 leading-normal">
                    Tallyin is built for roommates, travel groups, and shared households. We believe shared finances are personal. We do not sell your personal information or monetize your room ledgers with advertising brokers.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of Privacy Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Essential Data Minimalization */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white">
                    1. Minimal Data Collection
                  </h3>
                </div>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-normal">
                  We process only the bare minimum data required to compute roommate balances:
                </p>
                <div className="space-y-1.5 text-[11px] text-[#1A3827] dark:text-slate-300 font-medium">
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span><strong>Display Profile:</strong> Nickname and optional Google auth email.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span><strong>Room Records:</strong> Room code, room title, and member nicknames.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span><strong>Ledger Entries:</strong> Expense amount, title, date, payer, and category.</span>
                  </p>
                </div>
              </div>

              {/* Card 2: Cryptographic Isolation */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white">
                    2. Cryptographic Room Vaults
                  </h3>
                </div>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-normal">
                  Each shared room functions as an isolated data silo:
                </p>
                <div className="space-y-1.5 text-[11px] text-[#1A3827] dark:text-slate-300 font-medium">
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Only members with verified room codes can access transaction records.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Protected by Row Level Security (RLS) on PostgreSQL.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Data transmission strictly encrypted via industry-grade TLS 1.3.</span>
                  </p>
                </div>
              </div>

              {/* Card 3: Zero Ad Trackers */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white">
                    3. Local Storage &amp; Zero Trackers
                  </h3>
                </div>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-normal">
                  Your device stays clean and private while using Tallyin:
                </p>
                <div className="space-y-1.5 text-[11px] text-[#1A3827] dark:text-slate-300 font-medium">
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Browser storage is used strictly for offline cache, room selection &amp; theme.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Zero cross-site tracking cookies, telemetry ad SDKs, or meta pixels.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Never shared with outside advertisers or financial data brokers.</span>
                  </p>
                </div>
              </div>

              {/* Card 4: Ledger Exports & Purge */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white">
                    4. Full Portability &amp; Data Purge
                  </h3>
                </div>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-normal">
                  You own your bookkeeping records completely:
                </p>
                <div className="space-y-1.5 text-[11px] text-[#1A3827] dark:text-slate-300 font-medium">
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Export full itemized ledgers to Excel / CSV format at any moment.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Room hosts can permanently delete rooms &amp; attached receipts in Settings.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <span>Direct erasure requests can be directed to <code>{SUPPORT_EMAIL}</code>.</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            MODULE 2: USAGE POLICY & TERMS
        ══════════════════════════════════════════ */}
        {activeTab === 'terms' && (
          <div className="space-y-5 w-full animate-fade-in text-[#1A3827] dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
            
            {/* Standards Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#EAF0EC] to-emerald-500/5 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-600/20 dark:border-[#A3E635]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[#1A3827] dark:text-white text-xs sm:text-sm">
                      Roommate Agreement: Transparent, Fair &amp; Good-Faith Bookkeeping
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 hidden sm:inline-block">
                      Community Code
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-300 leading-normal">
                    By creating a new room or joining an existing one on Tallyin, you commit to recording accurate, mutual shared expenses and honoring settlement agreements with your roommates.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of Usage Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Rule 1: Accurate Expense Entry */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white flex items-center gap-2 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                  <span>Honest Bookkeeping &amp; Shared Responsibility</span>
                </h3>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  Tallyin acts as an automated calculator and shared record-keeper. All entries must reflect actual transactions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-[#1A3827] dark:text-slate-300">
                  <li>Only enter genuine shared expenses incurred on behalf of the room members or group.</li>
                  <li>Verify split ratios, exclusion rules, and individual shares prior to posting recurring transactions.</li>
                  <li>Confirm physical bank/UPI transfers prior to recording settlements as cleared.</li>
                </ul>
              </div>

              {/* Rule 2: Prohibited Conduct Callout */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:border-rose-300 transition-all flex flex-col justify-between space-y-2.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2 pb-2 border-b border-rose-200/60 dark:border-rose-900/40">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>2. Prohibited Platform Misuse</span>
                </h3>
                <p className="text-[11px] text-rose-800/90 dark:text-rose-300/80">
                  The following behaviors violate Tallyin terms and will result in room locks or account revocation:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-rose-800 dark:text-rose-300">
                  <li>Fabricating false expense claims or manipulating settlement figures deceitfully.</li>
                  <li>Uploading unlawful, infringing, or harassing media attachments as receipt proofs.</li>
                  <li>Attempting automated room code harvesting or unauthorized administrative actions.</li>
                </ul>
              </div>

              {/* Rule 3: Host Governance */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/80 border border-[#E3E8E3] dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white flex items-center gap-2 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <Users className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] shrink-0" />
                  <span>3. Room Host &amp; Member Privileges</span>
                </h3>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  Room creators retain administrative authority over their spaces:
                </p>
                <p className="text-[11px] text-[#1A3827] dark:text-slate-300 leading-relaxed">
                  Hosts may configure monthly budget caps, adjust individual quota shares, designate Co-Hosts, toggle frozen audit mode, or remove unverified member profiles from the room.
                </p>
              </div>

              {/* Rule 4: Availability & Financial Disclaimer */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#EAF0EC]/60 dark:bg-slate-900/60 border border-[#1A3827]/10 dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1A3827] dark:text-white flex items-center gap-2 pb-2 border-b border-[#E3E8E3]/70 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">4</span>
                  <span>Disclaimer on Financial Custody</span>
                </h3>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                  Mathematical Debt Settlement Notice:
                </p>
                <p className="text-[11px] text-[#1A3827] dark:text-slate-300 leading-relaxed">
                  Tallyin provides mathematical debt settlement calculations and tracking assistance. Tallyin is not a chartered bank, payment gateway, or escrow agent, and does not hold user funds. Direct payments are performed independently by roommates via UPI, cash, or bank transfers.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            MODULE 3: CONTACT & SUPPORT
        ══════════════════════════════════════════ */}
        {activeTab === 'contact' && (
          <div className="space-y-6 w-full animate-fade-in text-[#1A3827] dark:text-slate-200 text-xs sm:text-sm">
            
            {/* Quick Support Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Channel 1: Email */}
              <div className="p-4 rounded-2xl bg-[#EAF0EC] dark:bg-slate-900 border border-[#1A3827]/15 dark:border-[#A3E635]/20 flex flex-col justify-between space-y-2">
                <div className="p-1.5 rounded-lg bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 w-fit">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3827] dark:text-white text-xs">Official Support Desk</h4>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 font-mono select-all truncate mt-0.5">
                    {SUPPORT_EMAIL}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E3E8E3] dark:border-slate-700 text-[#1A3827] dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>

              {/* Channel 2: Response Time */}
              <div className="p-4 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex flex-col justify-between space-y-2">
                <div className="p-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] w-fit">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3827] dark:text-white text-xs">Response SLA</h4>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">
                    Typically within <strong>12 to 24 hours</strong> on weekdays.
                  </p>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] w-fit">
                  Active Support Queue
                </span>
              </div>

              {/* Channel 3: Security & Dispute */}
              <div className="p-4 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 flex flex-col justify-between space-y-2">
                <div className="p-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] w-fit">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3827] dark:text-white text-xs">Dispute &amp; Security</h4>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-0.5">
                    Urgent room code recovery &amp; data privacy escalation.
                  </p>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] w-fit">
                  High Priority
                </span>
              </div>

            </div>

            {/* Direct Message Form */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F6F8F6] dark:bg-slate-900/90 border border-[#E3E8E3] dark:border-slate-800 space-y-4">
              <div className="space-y-0.5">
                <h3 className="font-black text-sm text-[#1A3827] dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
                  <span>Send a Direct Inquiry to the Tallyin Team</span>
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Have an issue with a room, a feature suggestion, or need dispute help? Fill in below:
                </p>
              </div>

              {isSent ? (
                <div className="p-5 rounded-2xl bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/20 dark:border-[#A3E635]/30 text-center space-y-2 animate-scale-up">
                  <div className="w-10 h-10 rounded-full bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <h4 className="font-black text-[#1A3827] dark:text-white text-sm">
                    Inquiry Dispatched Successfully!
                  </h4>
                  <div className="flex items-center justify-center gap-2 flex-wrap my-1.5">
                    <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-lg bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-xs">
                      Ref: {submittedTicketId}
                    </span>
                    {submittedUserCode && (
                      <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        User Code: {submittedUserCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-300 max-w-md mx-auto">
                    Your inquiry has been registered in the support queue and an acknowledgment email has been dispatched to <strong>{contactEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSent(false);
                      setContactSubject('');
                      setContactMessage('');
                    }}
                    className="mt-3 px-5 py-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendContactMessage} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200">
                        Your Email <span className="text-emerald-700 dark:text-[#A3E635]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200">
                        Inquiry Category
                      </label>
                      <select
                        value={contactCategory}
                        onChange={e => setContactCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
                      >
                        <option value="general">General Support / Question</option>
                        <option value="room_access">Room Access / Joining Trouble</option>
                        <option value="dispute_help">Room Expense Dispute Assistance</option>
                        <option value="feature_request">Feature Suggestion &amp; Feedback</option>
                        <option value="bug_report">Bug Report / Sync Glitch</option>
                        <option value="privacy">Privacy &amp; Data Deletion Request</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={e => setContactSubject(e.target.value)}
                        placeholder="Brief summary of your inquiry"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200">
                      Message Details <span className="text-emerald-700 dark:text-[#A3E635]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder="Please provide details, room code if applicable, and how we can assist you..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] dark:focus:ring-[#A3E635] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] hover:bg-[#255038] dark:hover:bg-[#BEF264] text-white dark:text-slate-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isSending ? (
                      <span>Dispatching Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-3 pt-1">
              <h4 className="font-black text-xs sm:text-sm text-[#1A3827] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
                <span>Frequently Asked Questions</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800">
                  <h5 className="font-bold text-xs text-[#1A3827] dark:text-white">
                    How do Room Codes and QR Codes work?
                  </h5>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-1 leading-normal">
                    Each space is assigned a unique code (e.g. <code>TL-ABCD-1234</code>). Sharing the code or QR code allows verified roommates to instantly join and view synchronized balances in real time.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800">
                  <h5 className="font-bold text-xs text-[#1A3827] dark:text-white">
                    How does the settlement math minimize payments?
                  </h5>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-1 leading-normal">
                    Tallyin uses an optimal net-balance debt simplifier algorithm. Instead of multiple roommates paying each other back and forth, debts are consolidated into the minimum direct payments needed.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 md:col-span-2">
                  <h5 className="font-bold text-xs text-[#1A3827] dark:text-white">
                    Can a room be archived or permanently purged?
                  </h5>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mt-1 leading-normal">
                    Yes. Room hosts can export all historical data to Excel/CSV and permanently delete the room, deleting all transactions and uploaded receipts from our cloud database.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── TALLYIN BRANDED FOOTER ── */}
      <div className="px-6 sm:px-8 py-3 border-t border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6] dark:bg-slate-950 text-[11px] text-[#5C6E5C] dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1A3827] dark:text-[#A3E635]">Tallyin</span>
          <span>•</span>
          <span>All-in-One Roommate Expense Manager</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onNavigate('blog');
                }}
                className="font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Read Blog</span>
                <span className="text-[8px] font-black uppercase px-1 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">Beta</span>
              </button>
              <span>•</span>
            </>
          )}
          <span>© {new Date().getFullYear()} Tallyin</span>
          <span>•</span>
          <a 
            href={`mailto:${SUPPORT_EMAIL}`} 
            className="font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 p-4 sm:p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-5xl h-[90vh]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="max-w-5xl w-full animate-scale-up">
        {content}
      </div>
    </div>
  );
}
