import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Clock, 
  Eye, 
  Layers, 
  Maximize2 
} from 'lucide-react';

export const BANNER_THEMES = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    desc: 'Community & general announcements',
    colorHex: '#10B981',
    wrapper: 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/30 dark:border-emerald-500/40 text-slate-900 dark:text-slate-100 shadow-emerald-500/10',
    accentBar: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    pingBg: 'bg-emerald-400',
    dotBg: 'bg-emerald-500',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    progress: 'bg-emerald-500'
  },
  lime: {
    id: 'lime',
    name: 'Cyber Lime',
    desc: 'Signature energetic Tallyin theme',
    colorHex: '#A3E635',
    wrapper: 'bg-[#0F291E]/95 dark:bg-[#081710]/95 border-[#A3E635]/40 text-white shadow-[#A3E635]/15',
    accentBar: 'bg-[#A3E635]',
    badge: 'bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30',
    iconBg: 'bg-[#A3E635]/20 text-[#A3E635]',
    pingBg: 'bg-[#A3E635]',
    dotBg: 'bg-[#BEF264]',
    btn: 'bg-[#A3E635] hover:bg-[#BEF264] text-slate-950 font-black shadow-[#A3E635]/30',
    progress: 'bg-[#A3E635]'
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Violet',
    desc: 'Feature launches & premium notices',
    colorHex: '#8B5CF6',
    wrapper: 'bg-white/95 dark:bg-slate-900/95 border-purple-500/30 dark:border-purple-500/40 text-slate-900 dark:text-slate-100 shadow-purple-500/10',
    accentBar: 'bg-purple-600',
    badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
    pingBg: 'bg-purple-400',
    dotBg: 'bg-purple-500',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
    progress: 'bg-purple-500'
  },
  cyan: {
    id: 'cyan',
    name: 'Ocean Cyan',
    desc: 'Informational tips, guides & updates',
    colorHex: '#06B6D4',
    wrapper: 'bg-white/95 dark:bg-slate-900/95 border-cyan-500/30 dark:border-cyan-500/40 text-slate-900 dark:text-slate-100 shadow-cyan-500/10',
    accentBar: 'bg-cyan-500',
    badge: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400',
    pingBg: 'bg-cyan-400',
    dotBg: 'bg-cyan-500',
    btn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20',
    progress: 'bg-cyan-500'
  },
  amber: {
    id: 'amber',
    name: 'Amber Sunset',
    desc: 'Cautionary notes & maintenance windows',
    colorHex: '#F59E0B',
    wrapper: 'bg-white/95 dark:bg-slate-900/95 border-amber-500/30 dark:border-amber-500/40 text-slate-900 dark:text-slate-100 shadow-amber-500/10',
    accentBar: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    pingBg: 'bg-amber-400',
    dotBg: 'bg-amber-500',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    progress: 'bg-amber-500'
  },
  rose: {
    id: 'rose',
    name: 'Crimson Alert',
    desc: 'Urgent system warnings & critical alerts',
    colorHex: '#EF4444',
    wrapper: 'bg-white/95 dark:bg-slate-900/95 border-rose-500/30 dark:border-rose-500/40 text-slate-900 dark:text-slate-100 shadow-rose-500/10',
    accentBar: 'bg-rose-500',
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    pingBg: 'bg-rose-400',
    dotBg: 'bg-rose-500',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    progress: 'bg-rose-500'
  },
  dark: {
    id: 'dark',
    name: 'Midnight Obsidian',
    desc: 'Minimalist high-contrast dark glass',
    colorHex: '#1E293B',
    wrapper: 'bg-slate-950/95 border-slate-700/60 text-white shadow-2xl backdrop-blur-2xl',
    accentBar: 'bg-gradient-to-b from-slate-400 to-slate-600',
    badge: 'bg-slate-800 text-slate-200 border-slate-700',
    iconBg: 'bg-slate-900 text-slate-300',
    pingBg: 'bg-slate-400',
    dotBg: 'bg-white',
    btn: 'bg-white hover:bg-slate-200 text-slate-950 font-bold shadow-lg',
    progress: 'bg-slate-400'
  },
  gradient: {
    id: 'gradient',
    name: 'Aurora Sunset',
    desc: 'High-impact multi-gradient styling',
    colorHex: '#EC4899',
    wrapper: 'bg-gradient-to-r from-emerald-950/95 via-purple-950/95 to-slate-950/95 border-purple-500/40 text-white shadow-2xl',
    accentBar: 'bg-gradient-to-b from-[#A3E635] via-purple-400 to-cyan-400',
    badge: 'bg-white/10 text-white border-white/20',
    iconBg: 'bg-white/10 text-[#A3E635]',
    pingBg: 'bg-[#A3E635]',
    dotBg: 'bg-purple-400',
    btn: 'bg-gradient-to-r from-[#A3E635] to-emerald-400 hover:brightness-110 text-slate-950 font-black shadow-lg',
    progress: 'bg-gradient-to-r from-[#A3E635] to-purple-400'
  }
};

export const BANNER_PLACEMENTS = {
  top_sticky: {
    id: 'top_sticky',
    label: 'Top Sticky Bar',
    desc: 'Pinned to the top of screen above navigation'
  },
  top_inline: {
    id: 'top_inline',
    label: 'Top In-Feed',
    desc: 'Inline banner inside main page header feed'
  },
  bottom_floating: {
    id: 'bottom_floating',
    label: 'Bottom Floating Dock',
    desc: 'Floating dock pill at bottom center of screen'
  },
  modal_dialog: {
    id: 'modal_dialog',
    label: 'Center Modal Dialog',
    desc: 'Full-screen backdrop popup overlay'
  }
};

export const BANNER_FREQUENCIES = {
  always: { id: 'always', label: 'Always (Every page view / refresh)' },
  once_per_session: { id: 'once_per_session', label: 'Once per session (Session capped)' },
  once_total: { id: 'once_total', label: '1 Time total (Single impression per user)' },
  twice_total: { id: 'twice_total', label: '2 Times total (Max 2 impressions)' },
  three_times: { id: 'three_times', label: '3 Times total (Max 3 impressions)' },
  until_dismissed: { id: 'until_dismissed', label: 'Until dismissed by user' }
};

export const BANNER_AUTO_TIMERS = [
  { value: 0, label: 'Stay permanently (Until manually closed)' },
  { value: 5, label: 'Auto-dismiss in 5 seconds' },
  { value: 10, label: 'Auto-dismiss in 10 seconds' },
  { value: 15, label: 'Auto-dismiss in 15 seconds' },
  { value: 30, label: 'Auto-dismiss in 30 seconds' },
  { value: 60, label: 'Auto-dismiss in 60 seconds' }
];

export const BANNER_AUDIENCES = {
  ALL: { id: 'ALL', label: 'Everyone (All Users & Guests)', desc: 'System-wide to anyone visiting the app' },
  AUTHENTICATED: { id: 'AUTHENTICATED', label: 'Registered Users Only', desc: 'Only users signed in to an account' },
  GUESTS: { id: 'GUESTS', label: 'Guests / Anonymous Only', desc: 'Visitors who are not signed in' },
  HOSTS: { id: 'HOSTS', label: 'Room Hosts Only', desc: 'Room creators and primary room managers' },
  CO_HOSTS: { id: 'CO_HOSTS', label: 'Room Hosts & Co-Hosts', desc: 'Room hosts and assigned co-hosts' },
  ADMINS: { id: 'ADMINS', label: 'Administrators Only', desc: 'Staff and system administrators' },
  SPECIFIC_USERS: { id: 'SPECIFIC_USERS', label: 'Specific Users (Email / UID)', desc: 'Target individual emails or user IDs' }
};

export const BANNER_DEVICES = {
  ALL: { id: 'ALL', label: 'All Devices (Desktop & Mobile)' },
  MOBILE_ONLY: { id: 'MOBILE_ONLY', label: '📱 Mobile Devices Only' },
  DESKTOP_ONLY: { id: 'DESKTOP_ONLY', label: '💻 Desktop / Laptop Only' }
};

/**
 * Normalizes any URL, route, or link target for safe navigation.
 */
export const resolveBannerUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return { href: '#', isInternal: false, cleanUrl: '' };
  const cleanUrl = rawUrl.trim();
  const lower = cleanUrl.toLowerCase().replace(/^#\/?/, '');

  const internalViews = [
    'trips', 'bills', 'settlements', 'settlement-records', 'insights', 
    'receipts', 'shopping-board', 'settings', 'admin', 'home', 'ledger',
    'privacy', 'terms', 'contact', 'personal-expenses', 'fund-tracker'
  ];

  const isInternal = cleanUrl.startsWith('#') || (!cleanUrl.includes('.') && internalViews.includes(lower));

  let href = cleanUrl;
  if (!isInternal && !/^https?:\/\//i.test(href) && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
    href = `https://${href}`;
  }

  return { href, isInternal, cleanUrl };
};

/**
 * Parses text containing raw URLs or markdown links and returns clickable elements.
 */
export const renderClickableText = (text, onActionClick) => {
  if (!text || typeof text !== 'string') return text;

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<>"']+)|((?:www\.)[^\s<>"']+)|(\b[a-zA-Z0-9-]+\.(?:com|org|net|edu|gov|io|app|co|in|dev|ai|me)(?:\/[^\s<>"']*)?)/gi;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      elements.push(text.slice(lastIndex, matchIndex));
    }

    let label = '';
    let rawUrl = '';

    if (match[1] && match[2]) {
      label = match[1];
      rawUrl = match[2];
    } else {
      rawUrl = match[3] || match[4] || match[5];
      label = rawUrl;
    }

    let trailingPunctuation = '';
    const punctMatch = rawUrl.match(/[.,;:!?)]+$/);
    if (punctMatch) {
      trailingPunctuation = punctMatch[0];
      rawUrl = rawUrl.slice(0, -trailingPunctuation.length);
      if (label.endsWith(trailingPunctuation)) {
        label = label.slice(0, -trailingPunctuation.length);
      }
    }

    const { href, isInternal } = resolveBannerUrl(rawUrl);

    elements.push(
      <a
        key={`link-${matchIndex}`}
        href={href}
        target={isInternal ? '_self' : '_blank'}
        rel={isInternal ? undefined : 'noopener noreferrer'}
        onClick={(e) => {
          e.stopPropagation();
          if (isInternal) {
            e.preventDefault();
            if (onActionClick) onActionClick(rawUrl);
          } else if (onActionClick) {
            onActionClick(href);
          }
        }}
        className="underline font-bold hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-0.5 break-all text-current decoration-current/75"
      >
        <span>{label}</span>
        {!isInternal && <ExternalLink className="w-2.5 h-2.5 inline stroke-[2.5] ml-0.5 shrink-0 opacity-80" />}
      </a>
    );

    if (trailingPunctuation) {
      elements.push(trailingPunctuation);
    }

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
};

export default function AnnouncementBanner({
  banner,
  onDismiss,
  isDismissed = false,
  isPreview = false,
  onActionClick = null
}) {
  const [isClientVisible, setIsClientVisible] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(false);
  const timerRef = useRef(null);

  if (!banner || !banner.active) return null;

  const bannerId = banner.id || banner.createdAt || banner.text;
  const themeKey = BANNER_THEMES[banner.theme] ? banner.theme : 'emerald';
  const theme = BANNER_THEMES[themeKey];
  const placement = banner.placement || 'top_inline';
  const autoDismissSeconds = Number(banner.autoDismissSeconds) || 0;
  const frequency = banner.frequency || 'until_dismissed';
  const isDismissible = banner.isDismissible !== false;

  // Check frequency rules & impression tracking on client
  useEffect(() => {
    if (isPreview) {
      setIsClientVisible(true);
      return;
    }

    if (typeof window === 'undefined') return;

    // Check explicit dismiss state
    if (isDismissed) {
      setIsClientVisible(false);
      return;
    }

    const sessionKey = `tallyin_banner_seen_${bannerId}`;
    const viewsKey = `tallyin_banner_views_${bannerId}`;

    if (frequency === 'once_per_session') {
      try {
        if (sessionStorage.getItem(sessionKey)) {
          setIsClientVisible(false);
          return;
        }
      } catch (e) {}
    } else if (frequency === 'once_total') {
      try {
        const views = Number(localStorage.getItem(viewsKey) || 0);
        if (views >= 1) {
          setIsClientVisible(false);
          return;
        }
      } catch (e) {}
    } else if (frequency === 'twice_total') {
      try {
        const views = Number(localStorage.getItem(viewsKey) || 0);
        if (views >= 2) {
          setIsClientVisible(false);
          return;
        }
      } catch (e) {}
    } else if (frequency === 'three_times') {
      try {
        const views = Number(localStorage.getItem(viewsKey) || 0);
        if (views >= 3) {
          setIsClientVisible(false);
          return;
        }
      } catch (e) {}
    }

    // Record view impression
    try {
      sessionStorage.setItem(sessionKey, '1');
      const currentViews = Number(localStorage.getItem(viewsKey) || 0);
      localStorage.setItem(viewsKey, String(currentViews + 1));
    } catch (e) {}

    setIsClientVisible(true);
  }, [bannerId, frequency, isDismissed, isPreview]);

  // Handle auto-dismiss timer countdown
  useEffect(() => {
    if (isPreview || autoDismissSeconds <= 0 || !isClientVisible) return;

    setSecondsRemaining(autoDismissSeconds);

    const interval = setInterval(() => {
      if (isPaused) return; // Pause timer on hover!

      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleDismissAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [autoDismissSeconds, isClientVisible, isPaused, isPreview, bannerId]);

  const handleDismissAction = () => {
    setIsClientVisible(false);
    if (onDismiss) {
      onDismiss(banner);
    }
  };

  // Keyboard shortcut listener: Press Escape to close modal dialog
  useEffect(() => {
    if (placement !== 'modal_dialog' || isPreview || !isClientVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismissAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placement, isPreview, isClientVisible]);

  const handleLinkClick = (e) => {
    if (onActionClick) {
      onActionClick(banner.actionUrl);
    }
    if (banner.actionUrl) {
      if (banner.actionUrl.startsWith('http://') || banner.actionUrl.startsWith('https://')) {
        window.open(banner.actionUrl, '_blank', 'noopener,noreferrer');
      } else if (banner.actionUrl.startsWith('#')) {
        window.location.hash = banner.actionUrl;
      }
    }
  };

  if (!isClientVisible && !isPreview) return null;

  // Icon chooser helper
  const renderIcon = () => {
    if (banner.type === 'alert') return <ShieldAlert className="w-4 h-4" />;
    if (banner.type === 'maintenance') return <Activity className="w-4 h-4" />;
    if (banner.type === 'feature') return <Sparkles className="w-4 h-4" />;
    return <Radio className="w-4 h-4" />;
  };

  const typeLabel = banner.type === 'alert' 
    ? 'Critical Alert' 
    : banner.type === 'maintenance' 
      ? 'Maintenance' 
      : banner.type === 'feature' 
        ? 'New Feature' 
        : 'Announcement';

  // Inner Banner Content
  const bannerInner = (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl border transition-all duration-300 relative overflow-hidden text-left ${theme.wrapper} ${
        placement === 'top_sticky' ? 'rounded-none border-x-0 border-t-0' : ''
      }`}
    >
      {/* Colored Left Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accentBar}`} />

      {/* Auto-Dismiss Progress Bar if timer active */}
      {autoDismissSeconds > 0 && !isPreview && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${theme.progress}`}
            style={{ width: `${Math.max(0, Math.min(100, (secondsRemaining / autoDismissSeconds) * 100))}%` }}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pl-2">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Image Thumbnail or Category Icon */}
          {banner.imageUrl ? (
            <div 
              onClick={() => setSelectedImageModal(true)}
              className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-black/10 dark:border-white/15 cursor-pointer group shadow-sm"
              title="Click to zoom image"
            >
              <img 
                src={banner.imageUrl} 
                alt="Banner Attachment" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${theme.iconBg}`}>
              {renderIcon()}
            </div>
          )}

          {/* Text and Badges */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${theme.badge}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.pingBg}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${theme.dotBg}`}></span>
                </span>
                <span>{typeLabel}</span>
              </span>

              {banner.targetRoom && banner.targetRoom !== 'ALL' && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Room: {banner.targetRoom}
                </span>
              )}

              {autoDismissSeconds > 0 && !isPreview && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{secondsRemaining}s {isPaused ? '(paused)' : ''}</span>
                </span>
              )}

              {banner.createdAt && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                  • {new Date(banner.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {banner.headline && (
              <h4 className="font-black text-xs sm:text-sm tracking-tight leading-snug">
                {renderClickableText(banner.headline, onActionClick)}
              </h4>
            )}

            <p className="text-xs sm:text-xs font-medium leading-relaxed opacity-90 break-words line-clamp-3 sm:line-clamp-none">
              {renderClickableText(banner.text, onActionClick)}
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
          {banner.actionUrl && (() => {
            const { href, isInternal } = resolveBannerUrl(banner.actionUrl);
            return (
              <a
                href={href}
                target={isInternal ? '_self' : '_blank'}
                rel={isInternal ? undefined : 'noopener noreferrer'}
                onClick={(e) => {
                  if (isInternal) {
                    e.preventDefault();
                    if (onActionClick) onActionClick(banner.actionUrl);
                  } else if (onActionClick) {
                    onActionClick(href);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 whitespace-nowrap text-decoration-none ${theme.btn}`}
              >
                <span>{banner.actionText || 'Learn More'}</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            );
          })()}

          {(isDismissible || placement === 'modal_dialog') && (
            <button
              type="button"
              onClick={handleDismissAction}
              className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
              title="Close Banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImageModal && banner.imageUrl && (
        <div 
          onClick={() => setSelectedImageModal(false)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-3xl p-2 border border-slate-700 shadow-2xl">
            <button
              onClick={() => setSelectedImageModal(false)}
              className="absolute -top-3 -right-3 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 shadow-lg border border-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img 
              src={banner.imageUrl} 
              alt="Enlarged Banner Attachment" 
              className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto" 
            />
          </div>
        </div>
      )}
    </div>
  );

  // Render according to chosen Placement
  if (placement === 'top_sticky') {
    if (isPreview) {
      return (
        <div className="relative w-full rounded-2xl border-2 border-dashed border-emerald-500/40 p-2.5 bg-slate-900/40 my-2">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center mb-1.5 flex items-center justify-center gap-1.5">
            <span>✦ Top Sticky Bar (Preview Simulation) ✦</span>
          </div>
          {bannerInner}
        </div>
      );
    }
    return (
      <>
        <aside aria-label="Announcement banner" className="fixed top-0 left-0 right-0 z-50 animate-fade-in shadow-xl">
          <div className="w-full">
            {bannerInner}
          </div>
        </aside>
        {/* Content spacer to ensure sticky top banner never obscures navigation header */}
        <div className="w-full h-18 sm:h-20" aria-hidden="true" />
      </>
    );
  }

  if (placement === 'bottom_floating') {
    if (isPreview) {
      return (
        <div className="relative w-full rounded-2xl border-2 border-dashed border-cyan-500/40 p-3 bg-slate-900/40 my-2 flex justify-center">
          <div className="max-w-2xl w-full">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest text-center mb-1.5 flex items-center justify-center gap-1.5">
              <span>✦ Bottom Floating Dock (Preview Simulation) ✦</span>
            </div>
            {bannerInner}
          </div>
        </div>
      );
    }
    return (
      <aside aria-label="Announcement banner" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[94%] animate-fade-in shadow-2xl">
        {bannerInner}
      </aside>
    );
  }

  if (placement === 'modal_dialog') {
    if (isPreview) {
      return (
        <div className="relative w-full rounded-2xl p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm border-2 border-dashed border-purple-500/40 flex flex-col items-center justify-center my-2 shadow-inner">
          <div className="text-[10px] font-black text-purple-300 uppercase tracking-widest text-center mb-2.5 flex items-center justify-center gap-1.5">
            <span>✦ Center Modal Dialog (Preview Simulation) ✦</span>
          </div>
          <div className="max-w-xl w-full shadow-2xl">
            {bannerInner}
          </div>
        </div>
      );
    }

    return (
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Important Announcement"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleDismissAction();
          }
        }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      >
        <div className="max-w-xl w-full shadow-2xl animate-scale-up relative">
          {bannerInner}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={handleDismissAction}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss & Return to App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: 'top_inline'
  return (
    <aside aria-label="Announcement banner" className="w-full mb-4 animate-fade-in">
      {bannerInner}
    </aside>
  );
}
