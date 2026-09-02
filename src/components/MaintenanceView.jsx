import { useState } from 'react';
import { 
  Wrench, 
  Lock, 
  LogOut, 
  Check, 
  Sun, 
  Moon, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Hammer 
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';

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
  maintenanceMessage
}) {
  const [showMaintenanceLogin, setShowMaintenanceLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (
        params.has('admin') || 
        params.has('login') || 
        params.has('bypass') || 
        params.has('access') || 
        params.has('sampath')
      );
    }
    return false;
  });

  const handleLogoClick = () => {
    setShowMaintenanceLogin(true);
    if (triggerToast) triggerToast('Maintenance override unlocked.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F1] dark:bg-slate-950 p-4 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button 
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            if (triggerToast) {
              triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
            }
          }}
          className="p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
        </button>
      </div>

      {/* Ambient Glow Background Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-emerald-500/10 to-purple-500/15 rounded-full blur-3xl opacity-70 -z-10 animate-pulse-slow"></div>

      <div className="w-full max-w-lg hud-card rounded-3xl p-6 sm:p-9 shadow-2xl flex flex-col space-y-7 animate-fade-in border border-white/40 dark:border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle top glowing line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80"></div>
        
        {/* Header & Stealth Logo Listener */}
        <div className="text-center space-y-5">
          <div className="relative inline-block select-none">
            {/* Live Pulsing Beacon Ring */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500 to-[#A3E635] opacity-20 blur-md animate-pulse"></div>
            
            <div 
              className="relative cursor-pointer active:scale-95 transition-all duration-200"
              onClick={handleLogoClick}
              title="Tallyin Status — Click for Admin Bypass"
            >
              <img 
                src={faviconLogo} 
                alt="Tallyin Logo" 
                className="w-16 h-16 object-cover rounded-2xl mx-auto shadow-lg border border-white/20 dark:border-slate-800"
              />
              <div className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-400 p-1.5 rounded-xl shadow-md border border-amber-400/40">
                <Wrench className="w-3.5 h-3.5 animate-spin-slow" />
              </div>
            </div>
          </div>

          {/* Minimal Pill Status */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-widest mx-auto backdrop-blur-sm shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
            <span>System Maintenance Active</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">
              Tallyin is Upgrading ⚡
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800/80 max-w-md mx-auto leading-relaxed p-4 rounded-2xl font-medium shadow-sm">
              {maintenanceMessage || "We are currently undergoing planned maintenance and platform enhancements. Normal access will resume shortly."}
            </p>
          </div>
        </div>

        {/* Feature Teaser Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/50 dark:bg-slate-900/50 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-3.5 text-center space-y-1 hover:border-emerald-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto mb-1">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-[#1A3827] dark:text-slate-200">Ultra Fast</h3>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">Cloudflare D1 engine</p>
          </div>

          <div className="bg-white/50 dark:bg-slate-900/50 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-3.5 text-center space-y-1 hover:border-purple-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-[#1A3827] dark:text-slate-200">Redesigned UI</h3>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">Minimal aesthetic</p>
          </div>

          <div className="bg-white/50 dark:bg-slate-900/50 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-3.5 text-center space-y-1 hover:border-blue-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-[#1A3827] dark:text-slate-200">Encrypted Sync</h3>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-medium">Protected storage</p>
          </div>
        </div>

        {/* User Status / Stealth Login Portal */}
        {user ? (
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200 truncate">
                  Signed in as: <span className="text-amber-800 dark:text-amber-400 font-extrabold">{currentUserEmail || 'User'}</span>
                </p>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-snug">
                  Maintenance mode is active. Access is temporarily restricted.
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-2 bg-white dark:bg-slate-800 hover:bg-amber-100/50 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 py-2.5 px-3 rounded-xl font-bold text-xs border border-amber-300/60 dark:border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : showMaintenanceLogin ? (
          <div className="border-t border-[#E3E8E3] dark:border-slate-800 pt-4 animate-fade-in">
            <div className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1A3827] dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Sign In
                </span>
                <button
                  onClick={() => setShowMaintenanceLogin(false)}
                  className="text-xs text-[#5C6E5C] dark:text-slate-400 hover:underline font-bold"
                >
                  Hide
                </button>
              </div>

              {!showCodeLogin ? (
                <div className="space-y-2">
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#1A3827] text-white hover:bg-[#255038] py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 border border-white/5 active:scale-98"
                  >
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 488 512">
                      <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      onClick={() => {
                        setShowCodeLogin(true);
                        if (setAuthError) setAuthError(null);
                      }}
                      className="text-[11px] text-[#1A3827] dark:text-[#A3E635] font-bold hover:underline"
                    >
                      Or enter Access Code / Email
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCodeLogin} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200 block">Access Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. TY9832"
                      value={accessCodeInput}
                      onChange={e => setAccessCodeInput(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900 font-mono tracking-widest uppercase text-center font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1A3827] dark:text-slate-200 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={codeLoginEmail}
                      onChange={e => setCodeLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
                    />
                  </div>

                  {/* Quick 1-Click Test Accounts Chips */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-extrabold text-[#5C6E5C] dark:text-slate-400 block uppercase tracking-wider">
                      ⚡ Quick Test Accounts (1-Tap Select)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { code: 'TY1001', email: 'tester1@tallyin.app', name: 'Tester 1' },
                        { code: 'TY1002', email: 'tester2@tallyin.app', name: 'Tester 2' },
                        { code: 'TY1003', email: 'tester3@tallyin.app', name: 'Tester 3' },
                        { code: 'TY1004', email: 'tester4@tallyin.app', name: 'Tester 4' },
                        { code: 'TY1005', email: 'tester5@tallyin.app', name: 'Tester 5' },
                        { code: 'TY1006', email: 'tester6@tallyin.app', name: 'Tester 6' },
                      ].map(acc => (
                        <button
                          key={acc.code}
                          type="button"
                          onClick={() => {
                            if (setAccessCodeInput) setAccessCodeInput(acc.code);
                            if (setCodeLoginEmail) setCodeLoginEmail(acc.email);
                          }}
                          className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-[10px] font-bold text-[#1A3827] dark:text-slate-200 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-center shadow-xs cursor-pointer"
                        >
                          <span className="font-black text-[#1A3827] dark:text-[#A3E635] block">{acc.name}</span>
                          <span className="text-[9px] text-[#5C6E5C] dark:text-slate-400 font-mono">{acc.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCodeLogin(false)}
                      className="flex-1 py-2 border border-[#E3E8E3] dark:border-slate-800 text-[11px] font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingCode}
                      className="flex-1 py-2 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-[11px] hover:bg-[#255038] disabled:opacity-60 shadow-sm rounded-lg"
                    >
                      {isVerifyingCode ? 'Verifying...' : 'Log In'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : null}

        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-[11px] text-red-700 dark:text-red-400 font-bold leading-relaxed text-center break-words animate-fade-in">
            {authError}
          </div>
        )}

        <div className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none">
          Tallyin Maintenance System • Version {appVersion || '3.2.13'}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A3827] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#BEF264]/20 animate-bounce text-xs font-semibold max-w-sm">
          <Check className="w-4 h-4 text-[#A3E635] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
