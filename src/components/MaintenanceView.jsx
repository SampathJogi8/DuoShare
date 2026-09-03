import { useState } from 'react';
import { LogOut, Check, Sun, Moon, Zap, Sparkles, ShieldCheck, Lock, LayoutGrid, ArrowRight } from 'lucide-react';

/* ─── Icon registry ─────────────────────────────────────── */
const ICONS = {
  bolt:           (cls) => <Zap className={cls} />,
  zap:            (cls) => <Zap className={cls} />,
  palette:        (cls) => <LayoutGrid className={cls} />,
  sparkles:       (cls) => <Sparkles className={cls} />,
  'shield-check': (cls) => <ShieldCheck className={cls} />,
};
const getIcon = (key, cls = 'w-4 h-4') => (ICONS[key] || ICONS.bolt)(cls);

/* ─── Defaults (shown when admin hasn't set features) ─── */
const DEFAULT_FEATURES = [
  { icon: 'bolt',         label: 'Faster core',     sub: 'Cloudflare D1 engine' },
  { icon: 'palette',      label: 'Refined UI',       sub: 'Quieter, more minimal' },
  { icon: 'shield-check', label: 'Encrypted sync',   sub: 'Protected storage' },
];

/* ═══════════════════════════════════════════════════════════
   MaintenanceView — Sonar Ring Design
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

  const handleIconClick = () => {
    setShowLogin(true);
    if (triggerToast) triggerToast('Maintenance bypass unlocked.');
  };

  /* ── accent palette driven by mode ── */
  const accent  = isDarkMode ? '#4ade80' : '#16a34a';
  const accentA = (a) => isDarkMode ? `rgba(74,222,128,${a})` : `rgba(22,163,74,${a})`;

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes sonar {
          0%   { opacity: .5; transform: scale(.95); }
          70%  { opacity: 0;  transform: scale(1.35); }
          100% { opacity: 0;  transform: scale(1.35); }
        }
        @keyframes icon-breathe {
          0%,100% { box-shadow: 0 0 0 0 ${accentA(.25)}; }
          50%      { box-shadow: 0 0 0 14px ${accentA(0)}; }
        }
        .sonar-ring { animation: sonar 3.6s ease-out infinite; }
        .icon-glow  { animation: icon-breathe 3s ease-in-out infinite; }
      `}</style>

      {/* ── Root ── */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 select-none"
        style={{ background: isDarkMode ? '#09090B' : '#FAFAFA' }}
      >

        {/* ── Dot-grid background ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${isDarkMode ? '#27272a' : '#d4d4d8'} 1px, transparent 1px)`,
            backgroundSize: '26px 26px',
          }}
        />

        {/* ── Vignette — fades dots at edges ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDarkMode
              ? 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #09090B 100%)'
              : 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #FAFAFA 100%)',
          }}
        />

        {/* ── Theme toggle ── */}
        <button
          aria-label="Toggle theme"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: isDarkMode ? '#18181b' : '#fff',
            border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
            color: isDarkMode ? '#a1a1aa' : '#52525b',
          }}
        >
          {isDarkMode
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4" />}
        </button>

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-[480px] space-y-8">

          {/* ── Sonar rings + icon ── */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {/* Rings */}
            {[80, 112, 144].map((r, i) => (
              <div
                key={i}
                aria-hidden
                className="sonar-ring absolute rounded-full"
                style={{
                  width: r, height: r,
                  border: `1px solid ${accentA(.5)}`,
                  animationDelay: `${i * 0.9}s`,
                }}
              />
            ))}

            {/* Icon button — hidden admin bypass */}
            <button
              onClick={handleIconClick}
              aria-label="System status"
              className="icon-glow relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer"
              style={{
                background: isDarkMode ? '#0a0a0a' : '#fff',
                border: `1.5px solid ${accentA(.4)}`,
              }}
            >
              <Zap className="w-6 h-6" style={{ color: accent }} />
            </button>
          </div>

          {/* ── Status pill ── */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase"
            style={{
              background: accentA(.08),
              border: `1px solid ${accentA(.2)}`,
              color: isDarkMode ? '#86efac' : '#15803d',
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
            />
            Maintenance in progress
          </div>

          {/* ── Headline ── */}
          <div className="space-y-3 -mt-2">
            <h1
              className="text-[38px] leading-[1.1] font-bold tracking-tight"
              style={{ color: isDarkMode ? '#fafafa' : '#09090b' }}
            >
              Tallyin is<br />upgrading
            </h1>
            <p
              className="text-[14px] leading-relaxed max-w-[340px] mx-auto"
              style={{ color: isDarkMode ? '#71717a' : '#71717a' }}
            >
              {maintenanceMessage || 'A planned upgrade is underway. Access resumes shortly — no action needed on your side.'}
            </p>
          </div>

          {/* ── Thin rule ── */}
          <div
            className="w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${isDarkMode ? '#27272a' : '#e4e4e7'}, transparent)`,
            }}
          />

          {/* ── Feature list — fully admin-editable ── */}
          <div className="w-full space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-4 text-left">
                {/* Icon blob */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: accentA(.1),
                    border: `1px solid ${accentA(.2)}`,
                    color: accent,
                  }}
                >
                  {getIcon(feat.icon)}
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: isDarkMode ? '#e4e4e7' : '#18181b' }}
                  >
                    {feat.label}
                  </p>
                  <p
                    className="text-[12px] leading-snug"
                    style={{ color: isDarkMode ? '#52525b' : '#a1a1aa' }}
                  >
                    {feat.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Thick rule ── */}
          <div
            className="w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${isDarkMode ? '#27272a' : '#e4e4e7'}, transparent)`,
            }}
          />

          {/* ── User strip / login area ── */}
          {user ? (
            <div className="w-full flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                style={{
                  background: accentA(.12),
                  border: `1px solid ${accentA(.25)}`,
                  color: accent,
                }}
              >
                {initials}
              </div>

              {/* Email / status */}
              <div className="flex-1 min-w-0 text-left">
                <p
                  className="text-[13px] font-medium truncate leading-tight"
                  style={{ color: isDarkMode ? '#e4e4e7' : '#18181b' }}
                >
                  {currentUserEmail}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: isDarkMode ? '#52525b' : '#a1a1aa' }}>
                  Signed in · access temporarily restricted
                </p>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
                  background: isDarkMode ? '#18181b' : '#fff',
                  color: isDarkMode ? '#a1a1aa' : '#52525b',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>

          ) : showLogin ? (
            <div className="w-full space-y-3 text-left">
              <p className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: isDarkMode ? '#71717a' : '#a1a1aa' }}>
                <Lock className="w-3.5 h-3.5" />
                Sign in to continue
              </p>

              {!showCodeLogin ? (
                <div className="space-y-2">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{ background: accent, color: '#fff' }}
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 488 512">
                      <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    onClick={() => { setShowCodeLogin(true); if (setAuthError) setAuthError(null); }}
                    className="w-full text-center text-[12px] transition-colors"
                    style={{ color: isDarkMode ? '#52525b' : '#a1a1aa' }}
                  >
                    Or use access code →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCodeLogin} className="space-y-2">
                  <input
                    type="text" maxLength={6} placeholder="Access code (e.g. TY9832)"
                    value={accessCodeInput} onChange={e => setAccessCodeInput(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg text-[13px] font-mono tracking-widest uppercase text-center focus:outline-none transition-all"
                    style={{
                      background: isDarkMode ? '#18181b' : '#fff',
                      border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
                      color: isDarkMode ? '#fafafa' : '#09090b',
                    }}
                  />
                  <input
                    type="email" placeholder="Email address"
                    value={codeLoginEmail} onChange={e => setCodeLoginEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg text-[13px] focus:outline-none transition-all"
                    style={{
                      background: isDarkMode ? '#18181b' : '#fff',
                      border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
                      color: isDarkMode ? '#fafafa' : '#09090b',
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button" onClick={() => setShowCodeLogin(false)}
                      className="flex-1 h-9 rounded-lg text-[13px] transition-all"
                      style={{
                        border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
                        color: isDarkMode ? '#71717a' : '#a1a1aa',
                        background: isDarkMode ? '#18181b' : '#fff',
                      }}
                    >Back</button>
                    <button
                      type="submit" disabled={isVerifyingCode}
                      className="flex-1 h-9 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-60"
                      style={{ background: accent }}
                    >
                      {isVerifyingCode ? 'Verifying…' : 'Sign in'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-[12px] transition-colors"
              style={{ color: isDarkMode ? '#3f3f46' : '#d4d4d8' }}
            >
              Sign in
            </button>
          )}

          {authError && (
            <div
              className="w-full p-3 rounded-xl text-[12px] text-center"
              style={{
                background: 'rgba(239,68,68,.08)',
                border: '1px solid rgba(239,68,68,.2)',
                color: '#f87171',
              }}
            >
              {authError}
            </div>
          )}

          {/* ── Version footer ── */}
          <p className="text-[11px] pb-6" style={{ color: isDarkMode ? '#3f3f46' : '#d4d4d8' }}>
            Tallyin · {appVersion || 'v3.64.2'}
          </p>

        </div>{/* /content */}
      </div>{/* /root */}

      {/* ── Toast ── */}
      {toastMessage && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold max-w-sm shadow-lg"
          style={{
            background: isDarkMode ? '#18181b' : '#fff',
            border: `1px solid ${accentA(.3)}`,
            color: isDarkMode ? '#fafafa' : '#09090b',
          }}
        >
          <Check className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
          {toastMessage}
        </div>
      )}
    </>
  );
}
