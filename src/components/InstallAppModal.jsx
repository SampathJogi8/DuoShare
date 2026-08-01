import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';

export default function InstallAppModal({ triggerToast }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    // 2. Check if user already dismissed install prompt recently
    const isDismissed = localStorage.getItem('tallyin_install_dismissed');
    if (isDismissed) return;

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Delay showing banner slightly for smooth UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }

    // 4. Capture native beforeinstallprompt event for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setIsVisible(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction if event didn't fire
      if (triggerToast) {
        triggerToast('To install, open your browser menu (⋮) and select "Install app" or "Add to Home Screen".');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (triggerToast) triggerToast('Tallyin app installed successfully!');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('tallyin_install_dismissed', 'true');
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-fade-in">
      <div className="hud-card rounded-3xl p-5 shadow-2xl border border-emerald-500/30 dark:border-emerald-500/20 relative overflow-hidden backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-left">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 dark:bg-[#A3E635]/15 rounded-full blur-3xl -z-10"></div>

        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img 
              src={faviconLogo} 
              alt="Tallyin Logo" 
              className="w-12 h-12 object-cover rounded-2xl shadow-md border border-white dark:border-slate-800" 
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-[9px] shadow-md">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-1 pr-6 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#1A3827] dark:text-slate-100">Install Tallyin App</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#A3E635] text-[9px] font-extrabold uppercase">
                Web App
              </span>
            </div>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-snug">
              Install on your home screen for quick 1-tap access and native app performance.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E3E8E3] dark:border-slate-800/60 text-[11px] font-bold text-[#1A3827] dark:text-slate-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0" />
            <span>1-Tap Launch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635] shrink-0" />
            <span>Full-Screen View</span>
          </div>
        </div>

        {/* iOS Safari Instructions Guide */}
        {showIosGuide && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-2 text-xs text-[#1A3827] dark:text-slate-200 animate-fade-in">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">To install on iOS Safari:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#5C6E5C] dark:text-slate-300">
              <li>Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-emerald-600" /> <strong>Share</strong> icon in Safari bottom menu.</li>
              <li>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-600" /> <strong>Add to Home Screen</strong>.</li>
            </ol>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 hover:bg-[#255038] dark:hover:bg-[#b7f34c] py-2.5 px-3 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIos ? 'Show How to Install' : 'Install App Now'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F0F4F1] dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors"
          >
            Not Now
          </button>
        </div>

      </div>
    </div>
  );
}
