import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Bookmark, 
  Sparkles, 
  Tag, 
  ChevronRight, 
  Mail, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Heart, 
  FileText, 
  Lightbulb,
  Eye,
  PenSquare,
  ShieldCheck,
  Layers,
  LogIn
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';
import WikipediaBlogEditor from './WikipediaBlogEditor';
import { 
  BLOG_CATEGORIES, 
  getStoredBlogPosts, 
  saveStoredBlogPost, 
  getStoredViewsMap, 
  incrementArticleView, 
  formatViews 
} from '../data/blogData';

export default function BlogPage({
  user = null,
  userNickname = '',
  isAdmin = false,
  isDarkMode = false,
  setIsDarkMode = () => {},
  triggerToast = () => {},
  onBack = () => {},
  onNavigate = null,
  onOpenAdmin = null
}) {
  // Articles and dynamic view counters
  const [posts, setPosts] = useState(() => getStoredBlogPosts());
  const [viewsMap, setViewsMap] = useState(() => getStoredViewsMap());

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'mine'

  // Active reading article
  const [activeArticle, setActiveArticle] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const articleSlug = params.get('article') || params.get('post');
      if (articleSlug) {
        const allPosts = getStoredBlogPosts();
        return allPosts.find(p => p.slug === articleSlug || p.id === articleSlug) || null;
      }
    }
    return null;
  });

  // Reading progress tracking
  const [readProgress, setReadProgress] = useState(0);
  const [wikipediaReaderView, setWikipediaReaderView] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);

  // Modals
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);

  // Bookmarks & Likes stored locally
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('tallyin_blog_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedIds, setLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('tallyin_blog_likes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('tallyin_newsletter_subscribed') === 'true';
  });

  const reloadPosts = () => {
    setPosts(getStoredBlogPosts());
    setViewsMap(getStoredViewsMap());
  };

  // Scroll to top when activeArticle changes & monitor read progress
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeArticle]);

  // Open an article and track view count
  const handleSelectArticle = (article) => {
    if (article) {
      const base = article.viewsCount || 0;
      const nextViews = incrementArticleView(article.id, base);
      setViewsMap(prev => ({ ...prev, [article.id]: nextViews }));
      setActiveArticle({ ...article, viewsCount: nextViews });
    } else {
      setActiveArticle(null);
    }

    setReadProgress(0);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (article) {
        url.searchParams.set('article', article.slug || article.id);
      } else {
        url.searchParams.delete('article');
        url.searchParams.delete('post');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  const getArticleViews = (article) => {
    if (!article) return 0;
    if (typeof viewsMap[article.id] === 'number') {
      return viewsMap[article.id];
    }
    return article.viewsCount || 0;
  };

  const readerToc = useMemo(() => {
    if (!activeArticle?.content) return [];
    const list = [];
    activeArticle.content.forEach((b, i) => {
      if (b.type === 'heading') {
        list.push({ id: `sec-${i}`, title: b.text, level: 2 });
      } else if (b.type === 'subheading') {
        list.push({ id: `sec-${i}`, title: b.text, level: 3 });
      }
    });
    if (activeArticle.references?.length) {
      list.push({ id: 'sec-references', title: 'References & Citations', level: 2 });
    }
    return list;
  }, [activeArticle]);

  // Handle Write Article button click (Enforce user authentication)
  const handleWriteClick = () => {
    if (!user) {
      setShowLoginPromptModal(true);
      return;
    }
    setIsWriteModalOpen(true);
  };

  // My submissions count for logged in user
  const mySubmissionsCount = useMemo(() => {
    if (!user) return 0;
    const userEmail = (user.email || '').toLowerCase().trim();
    const userName = (userNickname || user.displayName || user.name || '').toLowerCase().trim();
    return posts.filter(p => {
      const authEmail = (p.author?.email || '').toLowerCase().trim();
      const authName = (p.author?.name || '').toLowerCase().trim();
      return (userEmail && authEmail === userEmail) || (userName && authName === userName);
    }).length;
  }, [posts, user, userNickname]);

  // Filtered Articles based on tab, category, search
  const filteredArticles = useMemo(() => {
    return posts.filter(post => {
      // Tab filter
      if (activeTab === 'published' && post.status !== 'published') return false;
      if (activeTab === 'mine') {
        if (!user) return false;
        const userEmail = (user.email || '').toLowerCase().trim();
        const userName = (userNickname || user.displayName || user.name || '').toLowerCase().trim();
        const authEmail = (post.author?.email || '').toLowerCase().trim();
        const authName = (post.author?.name || '').toLowerCase().trim();
        const isMine = (userEmail && authEmail === userEmail) || (userName && authName === userName);
        if (!isMine) return false;
      }

      // Category filter
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        post.title.toLowerCase().includes(q) ||
        (post.subtitle && post.subtitle.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (post.author?.name && post.author.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [posts, activeTab, selectedCategory, searchQuery, user, userNickname]);

  const featuredPost = useMemo(() => {
    const published = posts.filter(p => p.status === 'published');
    return published.find(p => p.featured) || published[0];
  }, [posts]);

  // Social interactions
  const toggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('tallyin_blog_bookmarks', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save bookmarks:', err);
      }
      if (triggerToast) {
        triggerToast(updated.includes(id) ? '🔖 Article saved to reading list' : 'Bookmark removed');
      }
      return updated;
    });
  };

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    setLikedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('tallyin_blog_likes', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save likes:', err);
      }
      if (triggerToast) {
        triggerToast(updated.includes(id) ? '❤️ Thanks for liking this article!' : 'Like removed');
      }
      return updated;
    });
  };

  const handleShare = async (article, e) => {
    if (e) e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/?view=blog&article=${article.slug || article.id}`
      : `https://tallyin.app/?view=blog&article=${article.slug || article.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.subtitle,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      if (triggerToast) triggerToast('📋 Article link copied to clipboard!');
    } catch {
      if (triggerToast) triggerToast('Link ready: ' + shareUrl);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      if (triggerToast) triggerToast('Please enter a valid email address');
      return;
    }
    localStorage.setItem('tallyin_newsletter_subscribed', 'true');
    setIsSubscribed(true);
    setNewsletterEmail('');
    if (triggerToast) triggerToast('🎉 You are now subscribed to Tallyin Insights!');
  };

  return (
    <div className="min-h-screen bg-[#F6FAF7] dark:bg-black text-[#1A3827] dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-[#A3E635]">
      
      {/* Top Reading Progress Bar (when viewing single article) */}
      {activeArticle && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 dark:bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 via-[#A3E635] to-emerald-400 transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>
      )}

      {/* Login Prompt Modal for Unauthenticated Users trying to Write an Article */}
      {showLoginPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="hud-card max-w-sm w-full p-6 sm:p-7 rounded-3xl space-y-4 border border-emerald-500/30 text-center relative">
            <button
              onClick={() => setShowLoginPromptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-[#A3E635] flex items-center justify-center mx-auto shadow-inner">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100">
                Sign In to Write an Article
              </h3>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                You must have an active Tallyin account to author and submit blog posts. Once submitted, your article will be reviewed by admins in the Admin Portal before going live.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowLoginPromptModal(false);
                  onBack();
                }}
                className="w-full py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Sign In to Tallyin
              </button>
              <button
                onClick={() => setShowLoginPromptModal(false)}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Top Navigation Header */}
      <header className="sticky top-0 z-40 hud-card border-b border-[#E3E8E3] dark:border-slate-800 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Back Action */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (activeArticle) {
                  handleSelectArticle(null);
                } else {
                  onBack();
                }
              }}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white bg-[#EAF0EC]/60 dark:bg-slate-900 border border-[#1A3827]/10 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
              title={activeArticle ? 'Back to All Articles' : 'Return to App'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">
                {activeArticle ? 'All Articles' : user ? 'Dashboard' : 'Sign In'}
              </span>
            </button>

            <div 
              onClick={() => handleSelectArticle(null)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img 
                src={faviconLogo} 
                alt="Tallyin" 
                className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-xl shadow-md group-hover:rotate-6 transition-transform"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-[#1A3827] dark:text-slate-100 leading-tight">
                    Tallyin
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-[#A3E635] rounded-md border border-emerald-500/20">
                    Blog
                  </span>
                </div>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider hidden sm:block">
                  Shared Living &amp; Money Guides
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Search (Desktop) */}
          {!activeArticle && (
            <div className="hidden lg:flex items-center relative flex-1 max-w-xs mx-3">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search roommate tips, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-[#1A3827] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A3827] dark:focus:ring-[#A3E635]/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Action Buttons: Write Article, Admin Portal Link, Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Write Article Button (Requires login) */}
            <button
              onClick={handleWriteClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title={user ? 'Write and submit an article' : 'Sign in required to write an article'}
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Write an Article</span>
            </button>

            {/* Direct Admin Portal Shortcut (For authorized Admins) */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (onOpenAdmin) {
                    onOpenAdmin('blog_manager');
                  } else if (onNavigate) {
                    onNavigate('admin');
                  } else {
                    window.location.search = '?admin=true';
                  }
                }}
                className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
                title="Manage approvals in Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin Portal</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                if (triggerToast) triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
              }}
              className="p-2 sm:p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
            </button>

            {/* Back to App */}
            <button
              onClick={onBack}
              className="bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 dark:hover:bg-[#b7f34c] px-3.5 py-2 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">{user ? 'Dashboard' : 'Sign In'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Wikipedia-Style Article Writer & Editor for Logged In Users */}
      {isWriteModalOpen && user && (
        <WikipediaBlogEditor
          isOpen={isWriteModalOpen}
          user={user}
          userNickname={userNickname}
          isAdmin={isAdmin}
          onClose={() => setIsWriteModalOpen(false)}
          onSave={(newArticle) => {
            saveStoredBlogPost(newArticle);
            reloadPosts();
            setIsWriteModalOpen(false);
            if (newArticle.status === 'published') {
              if (triggerToast) triggerToast('🎉 Your article was published live to the blog!');
            } else {
              if (triggerToast) triggerToast('🚀 Article submitted! An Admin will review it in the Admin Portal.');
              setActiveTab('mine');
            }
          }}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* VIEW 1: FULL ARTICLE READER */}
        {activeArticle ? (
          <article className="animate-fade-in max-w-3xl mx-auto space-y-8">
            
            {/* Top Back & Category Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
              <button
                onClick={() => handleSelectArticle(null)}
                className="inline-flex items-center gap-2 text-xs font-black text-[#1A3827] dark:text-[#A3E635] hover:underline cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to All Articles</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] border border-[#1A3827]/10 dark:border-slate-700">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeArticle.readTime}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-700 dark:text-[#A3E635] font-black flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  <Eye className="w-3.5 h-3.5" />
                  {formatViews(getArticleViews(activeArticle))} views
                </span>
              </div>
            </div>

            {/* Article Headline Header */}
            <div className="space-y-4 text-left">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1A3827] dark:text-slate-50 tracking-tight leading-[1.15]">
                {activeArticle.title}
              </h1>

              <p className="text-base sm:text-lg text-[#5C6E5C] dark:text-slate-300 font-medium leading-relaxed">
                {activeArticle.subtitle}
              </p>

              {/* Author & Meta Bar */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-3 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={activeArticle.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={activeArticle.author?.name || 'Author'}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                      {activeArticle.author?.name || 'Contributor'}
                    </h4>
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                      {activeArticle.author?.role || 'Community Writer'} • {activeArticle.publishedAt || 'Recently Published'}
                    </p>
                  </div>
                </div>

                {/* Article Share & Bookmark Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleLike(activeArticle.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      likedIds.includes(activeArticle.id)
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                        : 'bg-white dark:bg-slate-900 border-[#E3E8E3] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#F6FAF7] dark:hover:bg-slate-800'
                    }`}
                    title="Like article"
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedIds.includes(activeArticle.id) ? 'fill-current' : ''}`} />
                    <span>{(activeArticle.likesCount || 0) + (likedIds.includes(activeArticle.id) ? 1 : 0)}</span>
                  </button>

                  <button
                    onClick={(e) => toggleBookmark(activeArticle.id, e)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      bookmarkedIds.includes(activeArticle.id)
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-[#A3E635]'
                        : 'bg-white dark:bg-slate-900 border-[#E3E8E3] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#F6FAF7] dark:hover:bg-slate-800'
                    }`}
                    title="Save bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setWikipediaReaderView(prev => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      wikipediaReaderView
                        ? 'bg-slate-900 text-[#A3E635] border-emerald-500/40 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-[#E3E8E3] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#F6FAF7] dark:hover:bg-slate-800'
                    }`}
                    title="Toggle Wikipedia Encyclopedic View"
                  >
                    <span className="font-serif font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">W</span>
                    <span className="hidden xs:inline">{wikipediaReaderView ? 'Wikipedia View' : 'Encyclopedia Mode'}</span>
                  </button>

                  <button
                    onClick={(e) => handleShare(activeArticle, e)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#F6FAF7] dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                    title="Share article"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Wikipedia Notice Header when in Encyclopedic View */}
            {wikipediaReaderView && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
                <span>From Tallyin, the free encyclopedia of personal finance and cooperative living.</span>
                <span className="font-mono text-emerald-600 dark:text-[#A3E635] font-bold">WIKIPEDIA FORMAT</span>
              </div>
            )}

            {/* Key Takeaways Callout Card */}
            {activeArticle.takeaways && activeArticle.takeaways.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#EAF0EC]/80 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-[#A3E635]">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Takeaways</span>
                </div>
                <ul className="space-y-2">
                  {activeArticle.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1A3827] dark:text-slate-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Layout Wrapper with Floated Wikipedia Infobox */}
            <div className="relative block text-left">
              
              {/* Floating Wikipedia Infobox Card */}
              {activeArticle.infobox && (
                <div className="w-full lg:w-80 shrink-0 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm space-y-3 lg:float-right lg:ml-6 mb-4">
                  <div className="text-center border-b pb-2 dark:border-slate-800">
                    <h4 className="font-serif font-black text-sm text-[#1A3827] dark:text-slate-100">
                      {activeArticle.infobox.title || activeArticle.title}
                    </h4>
                    {activeArticle.infobox.subtitle && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">{activeArticle.infobox.subtitle}</p>
                    )}
                  </div>

                  <table className="w-full text-xs">
                    <tbody>
                      {activeArticle.infobox.attributes?.map((attr, idx) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-800/80">
                          <td className="py-1.5 pr-2 font-bold text-slate-600 dark:text-slate-400 align-top w-2/5 text-[11px]">
                            {attr.label}
                          </td>
                          <td className="py-1.5 text-slate-800 dark:text-slate-200 text-[11px]">
                            {attr.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Collapsible Table of Contents */}
              {readerToc.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm mb-6 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b pb-1.5 dark:border-slate-800">
                    <span className="font-serif">Contents</span>
                    <button
                      type="button"
                      onClick={() => setTocCollapsed(!tocCollapsed)}
                      className="text-[11px] text-emerald-600 dark:text-[#A3E635] font-normal cursor-pointer"
                    >
                      [{tocCollapsed ? 'show' : 'hide'}]
                    </button>
                  </div>

                  {!tocCollapsed && (
                    <ol className="mt-2 space-y-1 text-xs">
                      {readerToc.map((item, idx) => (
                        <li 
                          key={idx} 
                          className={`text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-[#A3E635] cursor-pointer ${
                            item.level === 3 ? 'pl-4 text-[11px]' : 'font-medium'
                          }`}
                          onClick={() => {
                            const el = document.getElementById(item.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <span>{item.title}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* Article Dynamic Content Blocks */}
              <div className="space-y-6 leading-relaxed text-[#2C4A37] dark:text-slate-200 font-normal">
                {activeArticle.content?.map((block, idx) => {
                  if (block.type === 'heading') {
                    return (
                      <h2 
                        id={`sec-${idx}`} 
                        key={idx} 
                        className="text-xl sm:text-2xl font-black font-serif text-[#1A3827] dark:text-slate-100 tracking-tight pt-4 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between"
                      >
                        <span>{block.text}</span>
                        <span className="text-[11px] text-slate-400 font-sans font-normal">[section]</span>
                      </h2>
                    );
                  }
                  if (block.type === 'subheading') {
                    return (
                      <h3 
                        id={`sec-${idx}`} 
                        key={idx} 
                        className="text-base sm:text-lg font-bold font-serif text-[#1A3827] dark:text-slate-200 pt-3"
                      >
                        {block.text}
                      </h3>
                    );
                  }
                  if (block.type === 'table') {
                    return (
                      <div key={idx} className="overflow-x-auto my-4">
                        <table className="w-full text-xs sm:text-sm border border-slate-300 dark:border-slate-700 border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                              {block.headers?.map((h, hi) => (
                                <th key={hi} className="p-2.5 border border-slate-300 dark:border-slate-700 text-left font-bold font-serif text-[#1A3827] dark:text-slate-100">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows?.map((row, ri) => (
                              <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50 dark:bg-slate-900/40' : ''}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className="p-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  if (block.type === 'callout') {
                    return (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-1.5 my-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                          <Lightbulb className="w-4 h-4 shrink-0" />
                          <span>{block.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-medium leading-relaxed whitespace-pre-line">
                          {block.text}
                        </p>
                      </div>
                    );
                  }
                  if (block.type === 'checklist') {
                    return (
                      <div key={idx} className="hud-card rounded-2xl p-5 border border-[#E3E8E3] dark:border-slate-800 space-y-3 my-4">
                        <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2 font-serif">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                          <span>{block.title}</span>
                        </h3>
                        <div className="space-y-2">
                          {block.items?.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#435748] dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#A3E635] shrink-0 mt-2"></span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (block.type === 'quote') {
                    return (
                      <blockquote key={idx} className="p-4 sm:p-6 border-l-4 border-emerald-600 dark:border-[#A3E635] bg-[#EAF0EC]/40 dark:bg-slate-900/50 rounded-r-2xl italic text-sm sm:text-base font-semibold text-[#1A3827] dark:text-slate-200 my-4">
                        "{block.text}"
                        {block.author && <cite className="block text-xs text-slate-500 not-italic mt-1">— {block.author}</cite>}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={idx} className="text-sm sm:text-base leading-relaxed text-[#35483B] dark:text-slate-300">
                      {block.text}
                    </p>
                  );
                })}
              </div>

              {/* References & Academic Citations Section */}
              {activeArticle.references && activeArticle.references.length > 0 && (
                <div id="sec-references" className="pt-8 border-t border-[#E3E8E3] dark:border-slate-800 space-y-3 text-left mt-8">
                  <h3 className="text-base font-black font-serif text-[#1A3827] dark:text-slate-100 flex items-center justify-between">
                    <span>References &amp; Academic Citations</span>
                    <span className="text-[10px] text-slate-400 font-sans font-normal">[source documents]</span>
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {activeArticle.references.map((r, i) => (
                      <li key={i} className="leading-relaxed">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{r.title}</span>
                        {r.author && <span> — {r.author}</span>}
                        {r.year && <span> ({r.year})</span>}
                        {r.publisher && <span>. {r.publisher}</span>}
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-emerald-600 dark:text-[#A3E635] underline"
                          >
                            [link]
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

            </div>

            {/* Article Tags */}
            {activeArticle.tags && activeArticle.tags.length > 0 && (
              <div className="pt-6 border-t border-[#E3E8E3] dark:border-slate-800 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tagged in:</span>
                {activeArticle.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery(tag);
                      handleSelectArticle(null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-[#1A3827] dark:text-slate-300 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* In-Article Call to Action */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1A3827] via-[#224832] to-[#102217] text-white shadow-xl space-y-4 text-center my-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#BEF264]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Stop Chasing Roommates for Rent &amp; Groceries
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
                Tallyin makes expense splitting completely automatic. Join thousands of roommates maintaining peaceful, organized homes.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-xl bg-[#BEF264] text-slate-950 font-black text-xs hover:bg-[#A3E635] transition-all shadow-md cursor-pointer"
                >
                  {user ? 'Return to Room Dashboard' : 'Open Tallyin Free'}
                </button>
                <button
                  onClick={() => handleSelectArticle(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Explore More Articles
                </button>
              </div>
            </div>

            {/* Related Articles */}
            <div className="space-y-4 pt-6 text-left">
              <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.filter(p => p.status === 'published' && p.id !== activeArticle.id).slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => handleSelectArticle(rel)}
                    className="hud-card-interactive rounded-2xl p-5 border border-[#E3E8E3] dark:border-slate-800 cursor-pointer space-y-2 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-[#A3E635]">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-[#A3E635] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 line-clamp-2">
                      {rel.subtitle}
                    </p>
                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViews(getArticleViews(rel))}
                      </span>
                      <span className="font-bold flex items-center gap-1 text-emerald-700 dark:text-[#A3E635]">
                        Read <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </article>
        ) : (
          
          /* VIEW 2: ARTICLE DIRECTORY & HERO */
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* Header Directory Filter Tabs (Published vs My Submissions) */}
            <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('published')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'published'
                      ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                      : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Published Articles</span>
                </button>

                {user && (
                  <button
                    onClick={() => setActiveTab('mine')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'mine'
                        ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                        : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-white'
                    }`}
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>My Submissions ({mySubmissionsCount})</span>
                  </button>
                )}
              </div>

              {activeTab === 'mine' && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>Articles submitted here are reviewed by Tallyin Admins before publication.</span>
                </div>
              )}
            </div>

            {/* Blog Hero Banner (Only on Published view) */}
            {activeTab === 'published' && !searchQuery && selectedCategory === 'All' && (
              <div className="hud-card rounded-3xl p-6 sm:p-10 border border-[#E3E8E3] dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-[#A3E635] border border-emerald-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>The Tallyin Journal</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1A3827] dark:text-slate-50 tracking-tight leading-tight">
                    Master the Art of Shared Living &amp; Smart Expenses
                  </h1>
                  <p className="text-xs sm:text-base text-[#5C6E5C] dark:text-slate-400 leading-relaxed font-medium">
                    Expert advice, actionable survival guides, and stories from real flatmates and travelers. Want to share your tips? Sign in to write and submit an article!
                  </p>

                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={handleWriteClick}
                      className="px-4 py-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-black shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      <span>Write an Article</span>
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      {user ? 'Submissions reviewed by admins before publishing.' : 'Sign in required to write.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURED STORY CARD (Only on Published Tab & Default Category) */}
            {activeTab === 'published' && !searchQuery && selectedCategory === 'All' && featuredPost && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-[#5C6E5C] dark:text-slate-400">
                    Featured Story
                  </p>
                </div>

                <div 
                  onClick={() => handleSelectArticle(featuredPost)}
                  className="hud-card-interactive rounded-3xl p-6 sm:p-8 border border-emerald-500/20 dark:border-slate-800 cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                          {featuredPost.category}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredPost.readTime}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-emerald-700 dark:text-[#A3E635] font-black flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <Eye className="w-3.5 h-3.5" />
                          {formatViews(getArticleViews(featuredPost))} views
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {featuredPost.publishedAt}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-[#A3E635] transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-300 leading-relaxed line-clamp-3">
                        {featuredPost.subtitle}
                      </p>

                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={featuredPost.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={featuredPost.author?.name || 'Author'}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">
                            {featuredPost.author?.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {featuredPost.author?.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto shrink-0 flex items-center justify-end">
                      <button className="w-full lg:w-auto px-5 py-3 rounded-2xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 group-hover:scale-105 transition-all">
                        <span>Read Full Guide</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY FILTER TABS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
                  {BLOG_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200 border border-[#E3E8E3] dark:border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[#5C6E5C] dark:text-slate-400 font-bold">
                  Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                </div>
              </div>

              {/* ARTICLE CARDS GRID */}
              {filteredArticles.length === 0 ? (
                <div className="hud-card rounded-3xl p-12 text-center space-y-4 border border-[#E3E8E3] dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-[#A3E635]">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100">
                    {activeTab === 'mine' 
                      ? 'No articles submitted yet' 
                      : 'No articles found'}
                  </h3>
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
                    {activeTab === 'mine' 
                      ? 'Click "Write an Article" above to share your tips or stories! Your submissions will appear here with their review status.'
                      : 'Try clearing your category filter or search terms.'}
                  </p>
                  {activeTab === 'mine' ? (
                    <button
                      onClick={handleWriteClick}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      Write First Article
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setActiveTab('published');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-bold"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => {
                    const isBookmarked = bookmarkedIds.includes(article.id);
                    const isPending = article.status === 'pending_review';
                    const isRejected = article.status === 'rejected';

                    return (
                      <div
                        key={article.id}
                        onClick={() => handleSelectArticle(article)}
                        className={`hud-card-interactive rounded-3xl p-5 sm:p-6 border flex flex-col justify-between cursor-pointer group space-y-4 ${
                          isPending 
                            ? 'border-amber-400/80 bg-amber-50/20 dark:bg-amber-950/20' 
                            : isRejected 
                            ? 'border-rose-300 bg-rose-50/10'
                            : 'border-[#E3E8E3] dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Header Meta & Status Badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] border border-[#1A3827]/10 dark:border-slate-700">
                                {article.category}
                              </span>

                              {isPending && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Pending Review</span>
                                </span>
                              )}

                              {isRejected && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                                  Declined
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => toggleBookmark(article.id, e)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isBookmarked 
                                    ? 'text-emerald-700 dark:text-[#A3E635]' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                                title="Bookmark article"
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => handleShare(article, e)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Share"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-black text-[#1A3827] dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-[#A3E635] transition-colors leading-snug line-clamp-2">
                            {article.title}
                          </h3>

                          {/* Subtitle / Excerpt */}
                          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed line-clamp-3">
                            {article.subtitle}
                          </p>

                          {/* Rejection reason if declined */}
                          {article.reviewReason && (
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-[10px] text-rose-700 dark:text-rose-400">
                              <strong>Admin note:</strong> {article.reviewReason}
                            </div>
                          )}
                        </div>

                        {/* Card Bottom: Author, Read Time, & Views */}
                        <div className="pt-3 border-t border-[#E3E8E3] dark:border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={article.author?.name || 'Author'}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-[11px] font-bold text-[#1A3827] dark:text-slate-300 truncate max-w-[90px]">
                              {article.author?.name || 'Contributor'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.readTime}</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-700 dark:text-[#A3E635] font-black">
                              <Eye className="w-3 h-3" />
                              <span>{formatViews(getArticleViews(article))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEWSLETTER SUBSCRIBE BOX */}
            <div className="hud-card rounded-3xl p-6 sm:p-10 border border-[#E3E8E3] dark:border-slate-800 text-center space-y-4 max-w-2xl mx-auto my-12 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-700 dark:text-[#A3E635]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">
                Get Roommate Budgeting Wisdom Delivered
              </h3>
              <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                Join over 15,000 flatmates who receive our monthly breakdown of rental hacks, expense templates, and Tallyin product updates.
              </p>

              {isSubscribed ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-[#A3E635] text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You're subscribed! Next issue arrives in your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto pt-2">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-xs text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1A3827] shadow-inner"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-bold shrink-0 hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-[#E3E8E3] dark:border-slate-800 py-10 bg-white/50 dark:bg-slate-950/50 text-center text-xs text-[#5C6E5C] dark:text-slate-400 space-y-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={faviconLogo} alt="Tallyin" className="w-6 h-6 rounded-lg" />
            <span className="font-black text-[#1A3827] dark:text-slate-100">Tallyin Blog &amp; Knowledge Base</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-bold text-xs">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('privacy');
              }}
              className="hover:text-[#1A3827] dark:hover:text-[#A3E635] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('terms');
              }}
              className="hover:text-[#1A3827] dark:hover:text-[#A3E635] transition-colors cursor-pointer"
            >
              Usage Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('contact');
              }}
              className="hover:text-[#1A3827] dark:hover:text-[#A3E635] transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <span>•</span>
            <button
              onClick={onBack}
              className="text-emerald-700 dark:text-[#A3E635] hover:underline transition-colors cursor-pointer"
            >
              Back to App
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Tallyin. Empowering roommates, couples, and groups with transparent expense sharing.
        </p>
      </footer>

    </div>
  );
}
