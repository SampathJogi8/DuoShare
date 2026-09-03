import { useState } from 'react';
import { LogOut, Check, Sun, Moon, Zap, Sparkles, ShieldCheck, Lock, LayoutGrid } from 'lucide-react';

const ICON_MAP = {
  'bolt':         <Zap className="w-5 h-5" />,
  'zap':          <Zap className="w-5 h-5" />,
  'palette':      <LayoutGrid className="w-5 h-5" />,
  'sparkles':     <Sparkles className="w-5 h-5" />,
  'shield-check': <ShieldCheck className="w-5 h-5" />,
};

const DEFAULT_FEATURES = [
  { icon: 'bolt',         label: 'Ultra Fast',      sub: 'Cloudflare D1 engine' },
  { icon: 'palette',      label: 'Redesigned UI',   sub: 'Minimal & intuitive' },
  { icon: 'shield-check', label: 'Encrypted Sync',  sub: 'Your data is protected' },
];

export default function MaintenanceView({
  user,
  currentUserEmail,
  isDarkMode,
  setIsDarkMode,
  handleGoogleLogin,
  handleCodeLogin,
  handleSignOut,
  accessCodeInput,
  setAccessCodeInput,
  codeLoginEmail,
  setCodeLoginEmail,
  showCodeLogin,
  setShowCodeLogin,
  isVerifyingCode,
  authError,
  setAuthError,
  toastMessage,
  triggerToast,
  appVersion,
  maintenanceMessage,
  maintenanceFeatures,
}) {
  const features = Array.isArray(maintenanceFeatures) && maintenanceFeatures.length > 0
    ? maintenanceFeatures
    : DEFAULT_FEATURES;

  const initials = currentUserEmail
    ? currentUserEmail.slice(0, 1).toUpperCase()
    : 'U';

  const [showMaintenanceLogin, setShowMaintenanceLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.has('admin') || p.has('login') || p.has('bypass') || p.has('access') || p.has('sampath');
    }
    return false;
  });

  const handleDiamondClick = () => {
    setShowMaintenanceLogin(true);
    if (triggerToast) triggerToast('Maintenance override unlocked.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050A08] p-4 font-sans relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-emerald-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => { setIsDarkMode(!isDarkMode); }}
          className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-[520px] bg-[#0D1410] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="p-10 flex flex-col items-center text-center space-y-6">

          {/* Diamond icon — glowing green */}
          <button
            onClick={handleDiamondClick}
            className="w-16 h-16 rounded-2xl border border-[#1A3827]/80 bg-[#0A1A10] flex items-center justify-center shadow-[0_0_24px_rgba(74,222,128,0.18)] cursor-pointer hover:shadow-[0_0_32px_rgba(74,222,128,0.28)] transition-all select-none"
            title="Admin bypass"
          >
            {/* Rotated diamond shape with 4 nodes */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="11" y="11" width="10" height="10" rx="1.5" transform="rotate(45 16 16)" stroke="#4ADE80" strokeWidth="1.5" fill="none" />
              <circle cx="16" cy="5"  r="1.8" fill="#4ADE80" />
              <circle cx="27" cy="16" r="1.8" fill="#4ADE80" />
              <circle cx="16" cy="27" r="1.8" fill="#4ADE80" />
              <circle cx="5"  cy="16" r="1.8" fill="#4ADE80" />
            </svg>
          </button>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-[11px] font-semibold uppercase tracking-widest">
            <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 shadow-[0_0_6px_#4ADE80] flex-shrink-0" />
            System Maintenance Active
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
              Tallyin is Upgrading ⚡
            </h1>
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-[360px] mx-auto">
              {maintenanceMessage || "We're currently performing scheduled maintenance and system upgrades. Normal access will resume shortly."}
            </p>
          </div>

          {/* Thin divider */}
          <div className="w-16 h-px bg-white/10" />

          {/* Feature grid — 3 columns, no boxed cards */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 w-full max-w-[400px]">
            {features.map((feat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2 py-2">
                <span className="text-emerald-400">{ICON_MAP[feat.icon] || <Zap className="w-5 h-5" />}</span>
                <p className="text-[13px] font-semibold text-white leading-tight">{feat.label}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{feat.sub}</p>
              </div>
            ))}
          </div>

          {/* User row */}
          <div className="w-full border-t border-white/[0.07] pt-5 mt-2">
            {user ? (
              <div className="flex items-center gap-3 text-left">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#1A3827] border border-emerald-800/40 flex items-center justify-center text-[13px] font-semibold text-emerald-300 shrink-0">
                  {initials}
                </div>
                {/* Email + status */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium text-slate-200 truncate">
                    Signed in as<br />
                    <span className="font-semibold">{currentUserEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Maintenance mode is active. Access is temporarily restricted.</p>
                </div>
                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-[13px] font-medium transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : showMaintenanceLogin ? (
              <div className="space-y-3 text-left animate-fade-in">
                <p className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Sign in to continue
                </p>
                {!showCodeLogin ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold transition-all shadow-md shadow-emerald-900/40"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 488 512">
                        <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                      </svg>
                      Sign in with Google
                    </button>
                    <button
                      onClick={() => { setShowCodeLogin(true); if (setAuthError) setAuthError(null); }}
                      className="w-full text-center text-[12px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Or enter access code
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCodeLogin} className="space-y-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Access code (e.g. TY9832)"
                      value={accessCodeInput}
                      onChange={e => setAccessCodeInput(e.target.value)}
                      className="w-full h-9 px-3 border border-white/10 rounded-lg text-[13px] bg-white/5 text-white font-mono tracking-widest uppercase text-center focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={codeLoginEmail}
                      onChange={e => setCodeLoginEmail(e.target.value)}
                      className="w-full h-9 px-3 border border-white/10 rounded-lg text-[13px] bg-white/5 text-white focus:outline-none focus:border-emerald-500/50"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowCodeLogin(false)}
                        className="flex-1 h-9 rounded-lg border border-white/10 text-[13px] text-slate-400 hover:bg-white/5 transition-all">Back</button>
                      <button type="submit" disabled={isVerifyingCode}
                        className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold disabled:opacity-60 transition-all">
                        {isVerifyingCode ? 'Verifying...' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowMaintenanceLogin(true)}
                className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>

          {authError && (
            <div className="w-full p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-[12px] text-red-400 text-center">
              {authError}
            </div>
          )}
        </div>

        {/* Footer outside card padding */}
        <div className="border-t border-white/[0.06] py-4 text-center space-y-0.5">
          <p className="text-[12px] text-slate-600">Tallyin Maintenance System</p>
          <p className="text-[12px] text-slate-600">Version {appVersion || 'v3.63.1'}</p>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0D1410] border border-emerald-800/40 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold max-w-sm">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
