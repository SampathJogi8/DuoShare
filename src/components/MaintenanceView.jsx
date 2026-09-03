import { useState } from 'react';
import { LogOut, Check, Sun, Moon, Zap, Sparkles, ShieldCheck, Wrench, Lock } from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';

const ICON_MAP = {
  'bolt': <Zap className="w-[18px] h-[18px]" />,
  'palette': <Sparkles className="w-[18px] h-[18px]" />,
  'shield-check': <ShieldCheck className="w-[18px] h-[18px]" />,
  'zap': <Zap className="w-[18px] h-[18px]" />,
  'sparkles': <Sparkles className="w-[18px] h-[18px]" />,
};

const DEFAULT_FEATURES = [
  { icon: 'bolt',         label: 'Faster core',     sub: 'Cloudflare D1 engine' },
  { icon: 'palette',      label: 'Refined UI',       sub: 'Quieter, more minimal' },
  { icon: 'shield-check', label: 'Encrypted sync',   sub: 'Protected storage' },
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
  const features = (Array.isArray(maintenanceFeatures) && maintenanceFeatures.length > 0)
    ? maintenanceFeatures
    : DEFAULT_FEATURES;

  const initials = currentUserEmail
    ? currentUserEmail.slice(0, 2).toUpperCase()
    : 'U';

  const [showMaintenanceLogin, setShowMaintenanceLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('admin') || params.has('login') || params.has('bypass') || params.has('access') || params.has('sampath');
    }
    return false;
  });

  const handleLogoClick = () => {
    setShowMaintenanceLogin(true);
    if (triggerToast) triggerToast('Maintenance override unlocked.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8F6] dark:bg-[#0A0A0A] p-4 font-sans transition-colors duration-300">

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            if (triggerToast) triggerToast(isDarkMode ? 'Light mode' : 'Dark mode');
          }}
          className="p-2 rounded-lg border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#5C6E5C] dark:text-slate-400 shadow-sm transition-all"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-[560px] bg-white dark:bg-[#111111] border border-[#E3E8E3] dark:border-[#222] rounded-xl shadow-sm overflow-hidden">
        <div className="p-10 text-center space-y-7">

          {/* Diamond Icon */}
          <div
            className="w-10 h-10 mx-auto border border-[#D0D7D0] dark:border-[#333] rounded-[10px] flex items-center justify-center cursor-pointer select-none"
            style={{ transform: 'rotate(45deg)' }}
            onClick={handleLogoClick}
            title="Admin bypass"
          >
            <Zap className="w-[17px] h-[17px] text-[#5C6E5C] dark:text-slate-400" style={{ transform: 'rotate(-45deg)' }} />
          </div>

          {/* Status Pill */}
          <div className="inline-flex items-center gap-[7px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[12px] font-medium px-[13px] py-[5px] rounded-full border border-amber-200 dark:border-amber-900/50">
            <span className="w-[6px] h-[6px] rounded-full bg-amber-500 flex-shrink-0" />
            Maintenance in progress
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <p className="text-[27px] font-medium text-[#1A1A1A] dark:text-slate-100 tracking-[-0.01em] leading-tight">
              Tallyin is upgrading
            </p>
            <p className="text-[14px] text-[#5C6E5C] dark:text-slate-400 leading-[1.65] max-w-[360px] mx-auto">
              {maintenanceMessage || 'A planned upgrade is underway. Access resumes shortly, no action needed on your side.'}
            </p>
          </div>

          {/* Feature List — flat, no cards */}
          <div className="space-y-4 text-left max-w-[340px] mx-auto">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <span className="text-[#5C6E5C] dark:text-slate-400 shrink-0 mt-0.5">
                  {ICON_MAP[feat.icon] || <Zap className="w-[18px] h-[18px]" />}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-slate-200 leading-tight">{feat.label}</p>
                  <p className="text-[12px] text-[#8A9A8A] dark:text-slate-500 mt-[2px]">{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider + User Row */}
          <div className="border-t border-[#E8ECE8] dark:border-[#222] pt-6">
            {user ? (
              <div className="flex items-center gap-3 text-left">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center text-[13px] font-medium text-[#1A3827] dark:text-slate-200 shrink-0">
                  {initials}
                </div>
                {/* Email + Status */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-slate-200 truncate">{currentUserEmail || 'User'}</p>
                  <p className="text-[12px] text-[#8A9A8A] dark:text-slate-500 mt-[2px]">Signed in · access temporarily restricted</p>
                </div>
                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="shrink-0 inline-flex items-center gap-1.5 text-[13px] px-3.5 h-8 rounded-lg border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-slate-200 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all font-medium"
                >
                  <LogOut className="w-[14px] h-[14px]" />
                  Sign out
                </button>
              </div>
            ) : showMaintenanceLogin ? (
              <div className="space-y-3 text-left animate-fade-in">
                <p className="text-[12px] font-semibold text-[#5C6E5C] dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Sign in to continue
                </p>
                {!showCodeLogin ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-9 flex items-center justify-center gap-2 rounded-lg bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-[13px] font-medium hover:opacity-90 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 488 512">
                        <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                      </svg>
                      Sign in with Google
                    </button>
                    <button
                      onClick={() => { setShowCodeLogin(true); if (setAuthError) setAuthError(null); }}
                      className="w-full text-center text-[12px] text-[#5C6E5C] dark:text-slate-400 hover:underline"
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
                      className="w-full h-9 px-3 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-[13px] bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-white font-mono tracking-widest uppercase text-center focus:outline-none focus:ring-1 focus:ring-[#1A3827]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={codeLoginEmail}
                      onChange={e => setCodeLoginEmail(e.target.value)}
                      className="w-full h-9 px-3 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-[13px] bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827]"
                    />
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setShowCodeLogin(false)} className="flex-1 h-9 rounded-lg border border-[#E3E8E3] dark:border-slate-800 text-[13px] text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all">
                        Back
                      </button>
                      <button type="submit" disabled={isVerifyingCode} className="flex-1 h-9 rounded-lg bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-[13px] font-medium hover:opacity-90 disabled:opacity-60 transition-all">
                        {isVerifyingCode ? 'Verifying...' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowMaintenanceLogin(true)}
                className="text-[12px] text-[#8A9A8A] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-slate-200 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>

          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-[12px] text-red-700 dark:text-red-400 text-center">
              {authError}
            </div>
          )}

          {/* Version */}
          <p className="text-[12px] text-[#C0C8C0] dark:text-slate-600">
            Tallyin · {appVersion || 'v3.63.0'}
          </p>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1A3827] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold max-w-sm border border-[#BEF264]/20 animate-bounce">
          <Check className="w-4 h-4 text-[#A3E635] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
