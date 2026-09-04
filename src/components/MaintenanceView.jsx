import { useState } from 'react';
import { 
  LogOut, 
  Check, 
  Sun, 
  Moon, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  LayoutGrid, 
  Database, 
  Cloud, 
  Cpu, 
  ArrowRight, 
  RefreshCw, 
  Key, 
  ShieldAlert,
  Server
} from 'lucide-react';
import logoIcon from '../assets/logo_icon.png';
import logoFull from '../assets/logo_full.png';
import faviconLogo from '../assets/favicon_logo.png';

/* ─── Icon Map with Graceful Fallbacks ─── */
const ICON_MAP = {
  bolt:           (cls) => <Zap className={cls} />,
  zap:            (cls) => <Zap className={cls} />,
  palette:        (cls) => <LayoutGrid className={cls} />,
  'shield-check': (cls) => <ShieldCheck className={cls} />,
  shield:         (cls) => <ShieldCheck className={cls} />,
  database:       (cls) => <Database className={cls} />,
  sparkles:       (cls) => <Sparkles className={cls} />,
  cloud:          (cls) => <Cloud className={cls} />,
  lock:           (cls) => <Lock className={cls} />,
  cpu:            (cls) => <Cpu className={cls} />,
  server:         (cls) => <Server className={cls} />,
};

const renderIcon = (key, cls = 'w-5 h-5') => {
  const normalized = (key || 'bolt').toLowerCase().trim();
  const renderer = ICON_MAP[normalized] || ICON_MAP.bolt;
  return renderer(cls);
};

/* ─── Default Features if Admin Has Not Configured Any ─── */
const DEFAULT_FEATURES = [
  { icon: 'bolt',         label: 'Ultra Fast Core',       sub: 'Cloudflare D1 engine' },
  { icon: 'palette',      label: 'Refined Experience',    sub: 'Clean, effortless UI' },
  { icon: 'shield-check', label: 'Bank-Grade Security',   sub: 'Zero-data-loss sync' },
];

/* ═══════════════════════════════════════════════════════════
   MaintenanceView — The Prism Horizon Redesign
   Featuring Tallyin Brand Logo, Glassmorphic Card, 
   Full Light/Dark Mode, and Live-Editable Feature Highlights
   ═══════════════════════════════════════════════════════════ */
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

  const initials = currentUserEmail ? currentUserEmail[0].toUpperCase() : '?';

  const [showLogin, setShowLogin] = useState(() => {
    if (typeof window === 'undefined') return false;
    const p = new URLSearchParams(window.location.search);
    return p.has('admin') || p.has('login') || p.has('bypass') || p.has('sampath');
  });

  const [logoPulse, setLogoPulse] = useState(false);

  const handleLogoBypassClick = () => {
    setLogoPulse(true);
    setTimeout(() => setLogoPulse(false), 600);
    setShowLogin(true);
    if (triggerToast) triggerToast('🔑 Administrator bypass portal opened');
  };

  /* ── Dynamic Palette Driven By Theme ── */
  const colors = {
    bg: isDarkMode ? '#0A0E13' : '#F6F9F7',
    cardBg: isDarkMode ? 'rgba(15, 23, 30, 0.82)' : 'rgba(255, 255, 255, 0.92)',
    cardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(26, 56, 39, 0.12)',
    primaryText: isDarkMode ? '#F8FAFC' : '#143823',
    subText: isDarkMode ? '#94A3B8' : '#527060',
    accent: isDarkMode ? '#10B981' : '#15803D',
    accentHover: isDarkMode ? '#34D399' : '#166534',
    accentLight: isDarkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(22, 163, 74, 0.1)',
    featureCardBg: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(240, 246, 242, 0.8)',
    featureCardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(26, 56, 39, 0.08)',
    gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        .anim-shimmer { animation: shimmer-bar 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .anim-float { animation: subtle-float 4s ease-in-out infinite; }
        .anim-aura { animation: aura-pulse 5s ease-in-out infinite; }
      `}</style>

      {/* ── Outer Root Container ── */}
      <div 
        className="relative min-h-screen flex flex-col items-center justify-center p-3.5 sm:p-6 overflow-hidden transition-colors duration-500 font-sans select-none"
        style={{ background: colors.bg, color: colors.primaryText }}
      >

        {/* ── Background Grid & Ambient Aurora Orbs ── */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${colors.gridColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Glowing Aurora Spots */}
        <div 
          aria-hidden="true"
          className="anim-aura absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[220px] sm:h-[340px] rounded-full blur-[90px] sm:blur-[110px] pointer-events-none"
          style={{
            background: isDarkMode 
              ? 'radial-gradient(ellipse, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.12) 60%, transparent 100%)' 
              : 'radial-gradient(ellipse, rgba(22, 163, 74, 0.16) 0%, rgba(59, 130, 246, 0.08) 60%, transparent 100%)',
          }}
        />

        {/* ── Floating Theme Switcher Button ── */}
        <button
          aria-label="Toggle light or dark theme"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 p-2 sm:p-2.5 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
            border: `1px solid ${colors.cardBorder}`,
            color: colors.primaryText,
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* ── Center Master Glassmorphic Card ── */}
        <div 
          className="relative z-10 w-full max-w-[620px] rounded-2xl sm:rounded-[32px] p-4 sm:p-10 backdrop-blur-2xl shadow-2xl transition-all duration-300 space-y-4 sm:space-y-7 text-center"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: isDarkMode 
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05) inset' 
              : '0 25px 60px -15px rgba(20, 56, 35, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
          }}
        >

          {/* ── Brand Emblem (Tallyin Logo with Glow & Secret Bypass) ── */}
          <div className="flex flex-col items-center justify-center space-y-2.5 sm:space-y-3">
            <button
              onClick={handleLogoBypassClick}
              title="Tallyin System (Click for admin bypass)"
              className={`anim-float relative p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl backdrop-blur-md transition-transform duration-300 active:scale-90 cursor-pointer ${
                logoPulse ? 'scale-110' : ''
              }`}
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 246, 242, 0.7))',
                border: `1.5px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.35)' : 'rgba(22, 163, 74, 0.25)'}`,
                boxShadow: isDarkMode
                  ? '0 12px 30px rgba(16, 185, 129, 0.22)'
                  : '0 12px 30px rgba(22, 163, 74, 0.14)',
              }}
            >
              <img 
                src={logoFull} 
                alt="Tallyin Logo" 
                className="h-8 sm:h-12 w-auto object-contain drop-shadow-md"
                onError={(e) => {
                  // Graceful fallback to logoIcon if logoFull fails
                  e.target.src = logoIcon;
                }}
              />
            </button>

            {/* Status Pill */}
            <div 
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase shadow-sm"
              style={{
                background: colors.accentLight,
                border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(22, 163, 74, 0.25)'}`,
                color: colors.accent,
              }}
            >
              <span 
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 animate-pulse" 
                style={{ background: colors.accent, boxShadow: `0 0 8px ${colors.accent}` }}
              />
              <span>System Upgrade in Progress</span>
            </div>
          </div>

          {/* ── Main Headline & Admin Editable Notice ── */}
          <div className="space-y-1.5 sm:space-y-2.5 px-1">
            <h1 
              className="text-xl sm:text-3xl font-black tracking-tight leading-tight"
              style={{ color: colors.primaryText }}
            >
              We’re Upgrading Tallyin
            </h1>
            <p 
              className="text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-medium"
              style={{ color: colors.subText }}
            >
              {maintenanceMessage || 'Tallyin is undergoing planned maintenance and system upgrades. Normal access will resume shortly. Your data and balances are completely secure.'}
            </p>
          </div>

          {/* ── Progress Shimmer Indicator ── */}
          <div className="w-full max-w-xs sm:max-w-md mx-auto space-y-1 sm:space-y-1.5">
            <div 
              className="relative h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }}
            >
              <div 
                className="anim-shimmer absolute inset-0 w-1/2 rounded-full"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(90deg, transparent, #10B981, transparent)'
                    : 'linear-gradient(90deg, transparent, #15803D, transparent)',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold" style={{ color: colors.subText }}>
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>Zero-Data-Loss Sync</span>
              </span>
              <span>Online Shortly</span>
            </div>
          </div>

          {/* ── Feature Highlights Grid (Dynamically Rendered & Admin-Editable) ── */}
          <div className="space-y-2 sm:space-y-3 pt-0.5 sm:pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-left flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                  style={{
                    background: colors.featureCardBg,
                    border: `1px solid ${colors.featureCardBorder}`,
                  }}
                >
                  <div 
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{
                      background: colors.accentLight,
                      color: colors.accent,
                      border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(22, 163, 74, 0.2)'}`,
                    }}
                  >
                    {renderIcon(feat.icon, 'w-4 h-4')}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h3 
                      className="text-xs font-black leading-snug truncate sm:whitespace-normal"
                      style={{ color: colors.primaryText }}
                    >
                      {feat.label || 'Next-Gen Core'}
                    </h3>
                    <p 
                      className="text-[10px] sm:text-[11px] leading-snug font-medium truncate sm:whitespace-normal"
                      style={{ color: colors.subText }}
                    >
                      {feat.sub || 'Instant responsiveness'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Account Status Strip / Admin Sign-in ── */}
          <div 
            className="pt-3 sm:pt-4 border-t"
            style={{ borderColor: colors.cardBorder }}
          >
            {user ? (
              <div 
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"
                style={{ background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                    style={{ background: colors.accent, color: '#FFFFFF' }}
                  >
                    {initials}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p 
                      className="text-xs font-bold truncate"
                      style={{ color: colors.primaryText }}
                    >
                      {currentUserEmail}
                    </p>
                    <p className="text-[10px] font-medium truncate" style={{ color: colors.subText }}>
                      Session preserved • Public access paused
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                  style={{ border: `1px solid ${isDarkMode ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.3)'}` }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : showLogin ? (
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: colors.primaryText }}>
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Administrator / Tester Sign In</span>
                  </p>
                  <button 
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-200"
                  >
                    Hide
                  </button>
                </div>

                {!showCodeLogin ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all text-white shadow-md cursor-pointer"
                      style={{ background: colors.accent }}
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 488 512">
                        <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCodeLogin(true); if (setAuthError) setAuthError(null); }}
                      className="w-full text-center text-xs font-bold py-1 hover:underline transition-colors"
                      style={{ color: colors.subText }}
                    >
                      Use Access Code instead →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCodeLogin} className="space-y-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Access Code (e.g. TY9832)"
                      value={accessCodeInput}
                      onChange={e => setAccessCodeInput(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-widest uppercase text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        background: isDarkMode ? '#141E28' : '#FFFFFF',
                        border: `1px solid ${colors.cardBorder}`,
                        color: colors.primaryText,
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      value={codeLoginEmail}
                      onChange={e => setCodeLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        background: isDarkMode ? '#141E28' : '#FFFFFF',
                        border: `1px solid ${colors.cardBorder}`,
                        color: colors.primaryText,
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCodeLogin(false)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                        style={{ borderColor: colors.cardBorder, color: colors.subText }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifyingCode}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
                        style={{ background: colors.accent }}
                      >
                        {isVerifyingCode ? 'Verifying…' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="text-[11px] font-semibold transition-colors hover:underline"
                style={{ color: colors.subText }}
              >
                Authorized admin or tester? Click here to bypass
              </button>
            )}

            {/* Auth Error Banner */}
            {authError && (
              <div 
                className="mt-3 p-3 rounded-xl text-xs text-center font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-500"
              >
                {authError}
              </div>
            )}
          </div>

          {/* ── Footer Info ── */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-semibold" style={{ color: colors.subText }}>
            <span>Tallyin Financial Systems</span>
            <span className="font-mono">{appVersion || 'v3.65.0'}</span>
          </div>

        </div>{/* /Card */}
      </div>{/* /Root */}

      {/* ── Toast Feedback Notification ── */}
      {toastMessage && (
        <div 
          className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-xl animate-fade-in"
          style={{
            background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1.5px solid ${colors.accent}`,
            color: colors.primaryText,
          }}
        >
          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
