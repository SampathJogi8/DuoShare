import { useState, useEffect } from 'react';
import { Ban, ShieldAlert, LogOut, Sun, Moon, Mail, ShieldCheck, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';
import { supabase } from '../supabase';

export default function BannedUserView({
  user,
  banInfo,
  handleSignOut,
  isDarkMode,
  setIsDarkMode,
  onOpenAdmin
}) {
  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [appealStatus, setAppealStatus] = useState('idle'); // 'idle' | 'submitting' | 'submitted'
  const [isAppealRejected, setIsAppealRejected] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const checkAppealStatus = async () => {
      const userEmail = (banInfo?.email || user?.email || localStorage.getItem('tallyin_user_email') || '').toLowerCase();
      if (!userEmail) return;

      try {
        const { data } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_BAN_APPEALS__')
          .maybeSingle();

        if (data?.name && data.name.startsWith('[')) {
          const appeals = JSON.parse(data.name);
          const myAppeal = appeals.find(a => (a.email || '').toLowerCase() === userEmail);
          if (myAppeal && myAppeal.status === 'rejected') {
            setIsAppealRejected(true);
          }
        }
      } catch (err) { console.warn(err); }
    };

    checkAppealStatus();

    // Listen for Realtime rejection broadcast
    const channel = supabase.channel('system_admin_channel');
    channel.on('broadcast', { event: 'BAN_APPEAL_DECISION' }, (payload) => {
      const targetEmail = (payload?.payload?.email || '').toLowerCase();
      const myEmail = (banInfo?.email || user?.email || localStorage.getItem('tallyin_user_email') || '').toLowerCase();
      if (targetEmail && myEmail && targetEmail === myEmail && payload?.payload?.status === 'rejected') {
        setIsAppealRejected(true);
      }
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, banInfo]);

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!appealText.trim()) {
      setErrorMsg('Please write your appeal reason before submitting.');
      return;
    }

    setAppealStatus('submitting');
    setErrorMsg(null);

    const userEmail = banInfo?.email || user?.email || localStorage.getItem('tallyin_user_email') || 'User';

    const appealObj = {
      id: `appeal-${Date.now()}`,
      email: userEmail,
      message: appealText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: new Date().toLocaleDateString(),
      bannedReason: banInfo?.reason || 'Policy violation'
    };

    try {
      // 1. Fetch current appeals list from DB
      let currentAppeals = [];
      try {
        const { data } = await supabase
          .from('rooms')
          .select('name')
          .eq('id', '__SYSTEM_BAN_APPEALS__')
          .maybeSingle();

        if (data?.name && data.name.startsWith('[')) {
          currentAppeals = JSON.parse(data.name);
        }
      } catch (err) { console.warn(err); }

      const updatedAppeals = [appealObj, ...currentAppeals.filter(a => a.email !== userEmail)];

      // 2. Save updated appeals list back to DB
      await supabase
        .from('rooms')
        .upsert({
          id: '__SYSTEM_BAN_APPEALS__',
          name: JSON.stringify(updatedAppeals),
          created_by: 'system',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });

      // 3. Broadcast Realtime notification to Admin Dashboard
      try {
        const channel = supabase.channel('system_admin_channel');
        await channel.subscribe();
        await channel.send({
          type: 'broadcast',
          event: 'BAN_APPEAL_SUBMITTED',
          payload: { appeal: appealObj }
        });
      } catch (err) { console.warn(err); }

      // 4. Send Automated Email Alert to Admin Recipients
      try {
        const mailRelayUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
        const adminRecipients = ['tallyin.alerts@gmail.com', 'sampathjogipusala123@gmail.com'];

        for (const adminEmail of adminRecipients) {
          fetch(mailRelayUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'send_email',
              to: adminEmail,
              subject: `🚨 [Tallyin Appeal] Suspension Review Request from ${userEmail}`,
              body: `Suspension Appeal Submitted by ${userEmail}:\n\nReason for Suspension: "${banInfo?.reason || 'Policy violation'}"\nUser Message: "${appealText.trim()}"\nDate: ${new Date().toLocaleString()}\n\nManage in Admin Console: https://tallyin.vercel.app/admin`,
              htmlBody: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #ef4444;">
                    <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Security Shield Alert</span>
                    <h2 style="color: #1a3827; margin: 8px 0 0 0;">New Account Suspension Appeal</h2>
                    <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Tallyin Operations & Access Control</p>
                  </div>
                  
                  <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Appellant Account</p>
                      <p style="margin: 0; font-size: 15px; font-weight: 800; color: #1e3a8a;">${userEmail}</p>
                    </div>

                    <div style="margin-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Original Ban Reason</p>
                      <p style="margin: 0; font-size: 13px; font-style: italic; color: #ef4444; background-color: #fef2f2; padding: 8px 12px; border-radius: 6px;">"${banInfo?.reason || 'System policy violation'}"</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">User Appeal Statement</p>
                      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 10px; color: #1e40af; font-size: 13px; white-space: pre-wrap;">"${appealText.trim()}"</div>
                    </div>

                    <div style="text-align: center; margin-top: 24px;">
                      <a href="https://tallyin.vercel.app/admin" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 6px rgba(16,185,129,0.3);">Open Admin Operations Console</a>
                    </div>
                  </div>

                  <div style="text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                    Automated Alert • Tallyin Security & User Moderation Service
                  </div>
                </div>
              `
            })
          }).catch(e => console.warn(e));
        }
      } catch (err) { console.warn("Email alert notice:", err); }

      setAppealStatus('submitted');
    } catch (err) {
      console.error("Appeal submission error:", err);
      setErrorMsg("Failed to transmit appeal. Please email support directly.");
      setAppealStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F1] dark:bg-slate-950 p-4 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle & Admin Shortcut */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-100 flex items-center gap-1.5"
            title="Open Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin Portal</span>
          </button>
        )}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
        </button>
      </div>

      {/* Red Glow Background */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-rose-500/10 dark:bg-rose-950/20 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md hud-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center border border-rose-500/30 relative">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mx-auto shadow-md border border-rose-200 dark:border-rose-900/50">
            <Ban className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
              Account Suspended
            </span>
            <h1 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight pt-2">
              Access Restricted
            </h1>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              Your Tallyin account has been suspended by system administration due to a policy or security violation.
            </p>
          </div>
        </div>

        {/* Ban Details Box */}
        <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-300">
            <span>Suspended Account:</span>
            <span className="font-mono truncate max-w-[180px]">{banInfo?.email || user?.email || 'User'}</span>
          </div>

          <div className="pt-1 border-t border-rose-200/40 dark:border-rose-900/40 text-xs">
            <span className="font-extrabold text-rose-900 dark:text-rose-300 block">Reason for Suspension:</span>
            <p className="text-[#5C6E5C] dark:text-slate-300 italic text-[11px] mt-0.5">
              "{banInfo?.reason || 'System policy violation or unauthorized security action.'}"
            </p>
          </div>

          {banInfo?.bannedAt && (
            <p className="text-[10px] text-rose-700 dark:text-rose-400 pt-1 font-mono">
              Enforced on: {new Date(banInfo.bannedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Appeal Section / Rejection Notice */}
        {isAppealRejected ? (
          <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Appeal Reviewed & Rejected</span>
            </div>
            <p className="text-[11px] text-rose-900/80 dark:text-rose-200 leading-normal">
              Your in-app appeal has been reviewed and <strong>rejected</strong> by System Administration. Additional in-app appeal submissions have been closed for your account.
            </p>
            <p className="text-[11px] text-[#5C6E5C] dark:text-slate-300 pt-1">
              If you have further questions or wish to present new information, please email support directly at <a href="mailto:tallyin.alerts@gmail.com" className="font-bold text-emerald-700 dark:text-[#A3E635] underline">tallyin.alerts@gmail.com</a>.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl text-xs space-y-3 text-left">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#1A3827] dark:text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Need Help or Appeal?</span>
              </p>
              <button
                onClick={() => setIsAppealOpen(!isAppealOpen)}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-xl text-[11px] font-black hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-900/50"
              >
                {isAppealOpen ? 'Hide Form' : 'Submit Appeal'}
              </button>
            </div>

            <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-normal">
              If you believe this suspension was made in error, contact support at <a href="mailto:tallyin.alerts@gmail.com" className="font-bold text-emerald-700 dark:text-[#A3E635] underline">tallyin.alerts@gmail.com</a> or send an appeal directly to administration below.
            </p>

            {/* Interactive Appeal Form */}
            {isAppealOpen && (
              <div className="pt-2 border-t border-[#E3E8E3] dark:border-slate-800 space-y-3">
                {appealStatus === 'submitted' ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-1 text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#A3E635] mx-auto" />
                    <p className="font-extrabold text-[#1A3827] dark:text-slate-100 text-xs">Appeal Transmitted!</p>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-300">
                      Your appeal message has been delivered to System Administration via email & panel alert.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAppeal} className="space-y-2.5">
                    <textarea
                      rows={3}
                      placeholder="Explain why your account suspension should be reviewed or lifted..."
                      value={appealText}
                      onChange={e => setAppealText(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6] dark:bg-slate-950 text-xs text-[#1A3827] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                    />
                    {errorMsg && (
                      <p className="text-[10px] font-bold text-rose-600">{errorMsg}</p>
                    )}
                    <button
                      type="submit"
                      disabled={appealStatus === 'submitting'}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{appealStatus === 'submitting' ? 'Transmitting Appeal...' : 'Send Appeal to Admin'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <p className="text-[10px] text-slate-400 font-mono">
          Security Enforcement Protocol • Tallyin System Shield
        </p>
      </div>
    </div>
  );
}
