import { Ban, ShieldAlert, LogOut, Sun, Moon, Mail, ShieldCheck } from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';

export default function BannedUserView({
  user,
  banInfo,
  handleSignOut,
  isDarkMode,
  setIsDarkMode,
  onOpenAdmin
}) {
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

        {/* Appeal Information */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl text-xs text-[#5C6E5C] dark:text-slate-400 space-y-1">
          <p className="font-bold text-[#1A3827] dark:text-slate-200 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Need Help or Appeal?</span>
          </p>
          <p className="text-[11px]">
            If you believe this suspension was made in error, contact support at <a href="mailto:tallyin.alerts@gmail.com" className="font-bold text-emerald-700 dark:text-[#A3E635] underline">tallyin.alerts@gmail.com</a>.
          </p>
        </div>

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
