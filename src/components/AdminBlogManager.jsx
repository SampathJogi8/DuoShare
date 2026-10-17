import { useState, useMemo, useCallback } from 'react';
import { 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Plus, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Search,
  ExternalLink,
  Edit3
} from 'lucide-react';
import WikipediaBlogEditor from './WikipediaBlogEditor';
import { 
  BLOG_CATEGORIES, 
  getStoredBlogPosts, 
  saveStoredBlogPost, 
  updateBlogPostStatus, 
  deleteStoredBlogPost, 
  getStoredViewsMap, 
  formatViews 
} from '../data/blogData';

export default function AdminBlogManager({
  user,
  triggerToast = () => {},
  onOpenBlogView = () => {}
}) {
  const [posts, setPosts] = useState(() => getStoredBlogPosts());
  const [viewsMap, setViewsMap] = useState(() => getStoredViewsMap());
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'published' | 'rejected' | 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [previewArticle, setPreviewArticle] = useState(null);
  const [isWikipediaEditorOpen, setIsWikipediaEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  // Form states for creating new admin post
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Product & Features');
  const [newTags, setNewTags] = useState('Updates, Features, Tallyin');
  const [authorName, setAuthorName] = useState(() => user?.displayName || user?.name || 'Tallyin Product Team');
  const [authorRole, setAuthorRole] = useState('Official Editorial');
  const [takeaways, setTakeaways] = useState('');
  const [contentBlocks, setContentBlocks] = useState([
    { type: 'paragraph', text: '' },
    { type: 'heading', text: '' },
    { type: 'paragraph', text: '' }
  ]);
  const [publishImmediately, setPublishImmediately] = useState(true);

  const reload = () => {
    setPosts(getStoredBlogPosts());
    setViewsMap(getStoredViewsMap());
  };

  const getViews = useCallback((article) => {
    if (typeof viewsMap[article.id] === 'number') return viewsMap[article.id];
    return article.viewsCount || 0;
  }, [viewsMap]);

  const pendingPosts = useMemo(() => {
    return posts.filter(p => p.status === 'pending_review');
  }, [posts]);

  const publishedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'published');
  }, [posts]);

  const rejectedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'rejected');
  }, [posts]);

  // Overall Stats
  const totalViews = useMemo(() => {
    return posts.reduce((acc, p) => acc + getViews(p), 0);
  }, [posts, getViews]);

  // Filtered list based on active tab
  const currentList = useMemo(() => {
    let list = [];
    if (activeTab === 'pending') list = pendingPosts;
    else if (activeTab === 'published') list = publishedPosts;
    else if (activeTab === 'rejected') list = rejectedPosts;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.author?.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }, [activeTab, pendingPosts, publishedPosts, rejectedPosts, searchQuery]);

  const handleApprove = (article) => {
    updateBlogPostStatus(article.id, 'published');
    reload();
    if (triggerToast) triggerToast(`🎉 "${article.title}" approved and published to the live blog!`);
    if (previewArticle?.id === article.id) setPreviewArticle(null);
  };

  const handleReject = (article) => {
    const reason = window.prompt('Enter feedback / reason for rejection (author will see this):', 'Content requires further revision or formatting.');
    if (reason === null) return;
    updateBlogPostStatus(article.id, 'rejected', reason || 'Declined by admin.');
    reload();
    if (triggerToast) triggerToast(`Article "${article.title}" marked as rejected.`);
    if (previewArticle?.id === article.id) setPreviewArticle(null);
  };

  const handleDelete = (article) => {
    if (!window.confirm(`Permanently delete "${article.title}"?`)) return;
    deleteStoredBlogPost(article.id);
    reload();
    if (triggerToast) triggerToast(`🗑️ Article "${article.title}" deleted.`);
    if (previewArticle?.id === article.id) setPreviewArticle(null);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please enter an article title.');
      return;
    }

    const validBlocks = contentBlocks.filter(b => b.text && b.text.trim() !== '');
    if (validBlocks.length === 0) {
      alert('Please write at least one section of content.');
      return;
    }

    const words = validBlocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0);
    const readMinutes = Math.max(2, Math.ceil(words / 180));
    const tagsArr = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const takeawaysArr = takeaways.split('\n').map(t => t.trim()).filter(Boolean);

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `post-${Date.now()}`;

    const created = {
      id: `admin-${Date.now()}`,
      slug,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Official update from the Tallyin team.',
      category: newCategory,
      tags: tagsArr.length ? tagsArr : [newCategory],
      readTime: `${readMinutes} min read`,
      publishedAt: publishImmediately 
        ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : null,
      status: publishImmediately ? 'published' : 'pending_review',
      viewsCount: 1,
      likesCount: 0,
      author: {
        name: authorName.trim() || 'Tallyin Team',
        role: authorRole.trim() || 'Admin Editorial',
        email: user?.email || 'tallyin.alerts@gmail.com',
        avatar: user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      takeaways: takeawaysArr.length ? takeawaysArr : null,
      content: validBlocks,
      submittedAt: new Date().toISOString()
    };

    saveStoredBlogPost(created);
    reload();

    // Reset form
    setNewTitle('');
    setNewSubtitle('');
    setTakeaways('');
    setContentBlocks([
      { type: 'paragraph', text: '' },
      { type: 'heading', text: '' },
      { type: 'paragraph', text: '' }
    ]);

    if (triggerToast) {
      triggerToast(publishImmediately ? '🎉 Official blog post published live!' : 'Post saved to draft queue.');
    }
    setActiveTab(publishImmediately ? 'published' : 'pending');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner & Overview Metrics */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1A3827] via-[#224832] to-[#102217] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#BEF264] border border-white/15">
            <Sparkles className="w-3 h-3" />
            <span>Editorial &amp; Review Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Blog &amp; Knowledge Base Manager
          </h2>
          <p className="text-xs text-emerald-200">
            Review user-submitted articles, approve pending posts, track real-time article views, and publish official guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBlogView}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>View Public Blog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditingArticle(null);
              setIsWikipediaEditorOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#BEF264] text-slate-950 hover:bg-[#A3E635] font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span className="font-serif font-black px-1.5 py-0.2 rounded bg-slate-950 text-[#BEF264] text-[10px]">W</span>
            <span>Compose Wikipedia Article</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="hud-card p-4 rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20">
          <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">Pending Review</p>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{pendingPosts.length}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Requires admin approval</p>
        </div>

        <div className="hud-card p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20">
          <p className="text-[10px] font-black uppercase text-emerald-700 dark:text-[#A3E635]">Live Articles</p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{publishedPosts.length}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Visible to readers</p>
        </div>

        <div className="hud-card p-4 rounded-2xl border border-blue-300 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20">
          <p className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400">Total Read Views</p>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">{formatViews(totalViews)}</p>
          <p className="text-[10px] text-blue-600/80 mt-0.5">Dynamic reader count</p>
        </div>

        <div className="hud-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase text-slate-500">Declined Submissions</p>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-200 mt-1">{rejectedPosts.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Filtered out</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Review Queue</span>
            {pendingPosts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {pendingPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'published'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published ({publishedPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Declined ({rejectedPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Article</span>
          </button>
        </div>

        {activeTab !== 'create' && (
          <div className="flex items-center relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
        )}
      </div>

      {/* ARTICLE PREVIEW MODAL */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="hud-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 text-left space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  previewArticle.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : previewArticle.status === 'pending_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {previewArticle.status === 'pending_review' ? 'Pending Approval' : previewArticle.status}
                </span>
                <span className="text-xs text-slate-400 font-bold">{previewArticle.category}</span>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViews(getViews(previewArticle))} views
                </span>
              </div>
              <button 
                onClick={() => setPreviewArticle(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#1A3827] dark:text-slate-100">{previewArticle.title}</h2>
              <p className="text-sm text-[#5C6E5C] dark:text-slate-300">{previewArticle.subtitle}</p>
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                <span>By <strong>{previewArticle.author?.name}</strong> ({previewArticle.author?.email || 'No email'})</span>
                <span>• {previewArticle.readTime}</span>
              </div>
            </div>

            {/* Key Takeaways */}
            {previewArticle.takeaways && previewArticle.takeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-slate-900 border border-emerald-500/20 space-y-1.5 text-xs">
                <p className="font-black text-emerald-800 dark:text-[#A3E635] uppercase tracking-wider text-[10px]">Key Takeaways</p>
                {previewArticle.takeaways.map((t, i) => (
                  <p key={i} className="flex items-center gap-1.5 text-emerald-950 dark:text-slate-200">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{t}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Content Body */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 space-y-3 max-h-64 overflow-y-auto text-xs sm:text-sm">
              {previewArticle.content?.map((b, i) => (
                <div key={i}>
                  {b.type === 'heading' ? (
                    <h4 className="font-bold text-sm text-[#1A3827] dark:text-slate-100 mt-2">{b.text}</h4>
                  ) : b.type === 'callout' ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-amber-900 dark:text-amber-300">
                      <strong>{b.title}:</strong> {b.text}
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300">{b.text}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Admin Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E3E8E3] dark:border-slate-800 flex-wrap">
              <div className="flex items-center gap-2">
                {previewArticle.status !== 'published' && (
                  <button
                    onClick={() => handleApprove(previewArticle)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Publish</span>
                  </button>
                )}
                {previewArticle.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(previewArticle)}
                    className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingArticle(previewArticle);
                    setIsWikipediaEditorOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit in Wikipedia Editor</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(previewArticle)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PENDING / REVIEW QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {currentList.length === 0 ? (
            <div className="hud-card p-12 text-center rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                All caught up! No pending submissions.
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When users write and submit articles for the Tallyin blog, they will appear here for your review and approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map(article => (
                <div 
                  key={article.id}
                  className="hud-card p-5 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Pending Review
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{article.category}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">{article.readTime}</span>
                    </div>

                    <h4 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                      {article.title}
                    </h4>

                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 line-clamp-2">
                      {article.subtitle}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <span>Submitted by <strong>{article.author?.name}</strong></span>
                      {article.author?.email && <span>({article.author.email})</span>}
                      {article.submittedAt && <span>• {new Date(article.submittedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setPreviewArticle(article)}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold"
                    >
                      Read Full
                    </button>
                    <button
                      onClick={() => handleReject(article)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(article)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve &amp; Publish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLISHED ARTICLES (With Views) */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentList.map(article => (
              <div 
                key={article.id}
                className="hud-card p-5 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-[#A3E635]">
                      {article.category}
                    </span>
                    <span className="text-emerald-700 dark:text-[#A3E635] font-black flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[11px]">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(getViews(article))} views
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[#1A3827] dark:text-slate-100 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400 line-clamp-2">
                    {article.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">By {article.author?.name} • {article.publishedAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewArticle(article)}
                      className="text-xs font-bold text-emerald-700 dark:text-[#A3E635] hover:underline"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(article)}
                      className="text-xs text-rose-500 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DECLINED / REJECTED ARTICLES */}
      {activeTab === 'rejected' && (
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <div className="hud-card p-8 text-center rounded-2xl text-xs text-slate-500">
              No declined submissions.
            </div>
          ) : (
            currentList.map(article => (
              <div 
                key={article.id}
                className="hud-card p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">{article.title}</h4>
                  <p className="text-xs text-slate-500">By {article.author?.name}</p>
                  {article.reviewReason && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Reason: {article.reviewReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(article)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Reconsider &amp; Publish
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DIRECT ADMIN ARTICLE CREATOR */}
      {activeTab === 'create' && (
        <div className="hud-card p-6 sm:p-8 rounded-3xl border border-[#E3E8E3] dark:border-slate-800 space-y-5">
          <div className="border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
            <h3 className="text-lg font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
              <span>Create Official Admin Blog Post</span>
            </h3>
            <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
              Publish an authoritative release, product update, or expense guide directly to the public blog.
            </p>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#1A3827] dark:text-slate-200">Headline Title *</label>
              <input
                type="text"
                placeholder="e.g. Announcing Trip Splitter 2.0 & Multi-Currency Expense Groups"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1A3827] dark:text-slate-200">Subtitle / Hook</label>
              <input
                type="text"
                placeholder="Brief summary explaining what readers will discover in this article."
                value={newSubtitle}
                onChange={e => setNewSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1A3827] dark:text-slate-200">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1A3827] dark:text-slate-200">Tags</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1A3827] dark:text-slate-200">Author Display Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#1A3827] dark:text-slate-200">Author Role</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1A3827] dark:text-slate-200">Key Takeaways (one per line)</label>
              <textarea
                rows={2}
                placeholder="Bullet 1&#10;Bullet 2"
                value={takeaways}
                onChange={e => setTakeaways(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            {/* Sections */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-[#1A3827] dark:text-slate-200">Article Content Sections</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setContentBlocks(prev => [...prev, { type: 'paragraph', text: '' }])}
                    className="px-2 py-1 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[10px] font-bold text-emerald-800 dark:text-[#A3E635]"
                  >
                    + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentBlocks(prev => [...prev, { type: 'heading', text: '' }])}
                    className="px-2 py-1 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 text-[10px] font-bold text-emerald-800 dark:text-[#A3E635]"
                  >
                    + Heading
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {contentBlocks.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{b.type.toUpperCase()}</span>
                      {contentBlocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setContentBlocks(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={b.type === 'heading' ? 1 : 2}
                      placeholder={b.type === 'heading' ? 'Section Heading...' : 'Section content...'}
                      value={b.text}
                      onChange={e => {
                        const copy = [...contentBlocks];
                        copy[idx] = { ...copy[idx], text: e.target.value };
                        setContentBlocks(copy);
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-950 dark:text-emerald-200">Publish Immediately</p>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-400">Post will appear live on public blog instantly.</p>
              </div>
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={e => setPublishImmediately(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{publishImmediately ? 'Publish to Live Blog' : 'Save as Draft'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wikipedia Blog Editor Modal */}
      {isWikipediaEditorOpen && (
        <WikipediaBlogEditor
          isOpen={isWikipediaEditorOpen}
          user={user}
          isAdmin={true}
          initialArticle={editingArticle}
          onClose={() => {
            setIsWikipediaEditorOpen(false);
            setEditingArticle(null);
          }}
          onSave={(savedPost) => {
            saveStoredBlogPost(savedPost);
            reload();
            setIsWikipediaEditorOpen(false);
            setEditingArticle(null);
            if (previewArticle && previewArticle.id === savedPost.id) {
              setPreviewArticle(savedPost);
            }
            if (triggerToast) triggerToast('🎉 Article successfully published live by Admin Tallyin!');
          }}
        />
      )}

    </div>
  );
}
