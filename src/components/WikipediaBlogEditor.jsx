import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  FileText, 
  X, 
  Plus, 
  Eye, 
  Edit3, 
  Code, 
  Table, 
  Send, 
  ShieldCheck, 
  Info
} from 'lucide-react';
import { BLOG_CATEGORIES } from '../data/blogData';

/**
 * Wikipedia-style article writer and visual/wikitext editor
 */
export default function WikipediaBlogEditor({
  isOpen,
  onClose,
  onSave,
  user,
  userNickname,
  isAdmin = false,
  initialArticle = null
}) {
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'wikitext' | 'preview'
  const [tocCollapsed, setTocCollapsed] = useState(false);

  // Metadata
  const [title, setTitle] = useState(() => initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState(() => initialArticle?.subtitle || '');
  const [category, setCategory] = useState(() => initialArticle?.category || 'Personal Finance');
  const [tagsInput, setTagsInput] = useState(() => initialArticle?.tags ? initialArticle.tags.join(', ') : 'Personal Finance, Wealth Building');
  
  // Author state
  const defaultAdminAuthorName = 'Admin Tallyin';
  const defaultAdminAuthorRole = 'Chief Financial Editor & Administrator';
  const [postAsAdmin, setPostAsAdmin] = useState(isAdmin);
  const [authorName, setAuthorName] = useState(() => {
    if (initialArticle?.author?.name) return initialArticle.author.name;
    if (isAdmin) return defaultAdminAuthorName;
    return userNickname || user?.displayName || user?.name || user?.email?.split('@')[0] || 'Community Contributor';
  });
  const [authorRole, setAuthorRole] = useState(() => {
    if (initialArticle?.author?.role) return initialArticle.author.role;
    if (isAdmin) return defaultAdminAuthorRole;
    return 'Roommate & Community Writer';
  });

  // Wikipedia Infobox State
  const [hasInfobox, setHasInfobox] = useState(() => Boolean(initialArticle?.infobox));
  const [infoboxTitle, setInfoboxTitle] = useState(() => initialArticle?.infobox?.title || '');
  const [infoboxSubtitle, setInfoboxSubtitle] = useState(() => initialArticle?.infobox?.subtitle || '');
  const [infoboxAttributes, setInfoboxAttributes] = useState(() => {
    if (initialArticle?.infobox?.attributes?.length) return initialArticle.infobox.attributes;
    return [
      { label: 'Category', value: 'Personal Finance' },
      { label: 'Key Principle', value: 'Systematic Cash-Flow Optimization' },
      { label: 'Difficulty', value: 'Foundational' },
      { label: 'Target Audience', value: 'Urban Professionals & Students' }
    ];
  });

  // Content Blocks
  const [blocks, setBlocks] = useState(() => {
    if (initialArticle?.content?.length) return initialArticle.content;
    return [
      { 
        type: 'paragraph', 
        text: 'The foundational principle of modern personal finance posits that sustainable capital allocation requires structured budgeting rules rather than relying solely on post-hoc discipline.' 
      },
      { 
        type: 'heading', 
        text: '1. Theoretical Framework & Origin' 
      },
      { 
        type: 'paragraph', 
        text: 'Historical empirical studies into household consumer expenditure illustrate that fixed living commitments represent the single greatest determinant of insolvency risk.' 
      },
      { 
        type: 'callout', 
        title: 'Core Heuristic', 
        text: 'Always decouple non-negotiable survival obligations from elastic lifestyle consumption before calculating monthly savings targets.' 
      }
    ];
  });

  // Key Takeaways & References
  const [takeawaysInput, setTakeawaysInput] = useState(() => {
    return initialArticle?.takeaways ? initialArticle.takeaways.join('\n') : '';
  });
  const [references, setReferences] = useState(() => {
    if (initialArticle?.references?.length) return initialArticle.references;
    return [
      { id: 1, title: 'All Your Worth: The Ultimate Lifetime Money Plan', author: 'Warren, E. & Tyagi, A. W.', year: '2005', publisher: 'Free Press' },
      { id: 2, title: 'Payment System Vision 2025: Seamless Inter-Bank Settlements', author: 'Reserve Bank of India (RBI)', year: '2023', publisher: 'RBI Bulletins' }
    ];
  });

  // Raw Wikitext buffer (for Wikitext mode)
  const [wikitextSource, setWikitextSource] = useState('');

  // Synchronize Blocks into Wikitext format when toggling to source mode
  const syncToWikitext = () => {
    let raw = '';
    if (hasInfobox) {
      raw += `{{Infobox\n| title = ${infoboxTitle || title || 'Article Infobox'}\n| subtitle = ${infoboxSubtitle}\n`;
      infoboxAttributes.forEach(attr => {
        if (attr.label) raw += `| ${attr.label} = ${attr.value}\n`;
      });
      raw += `}}\n\n`;
    }

    blocks.forEach(b => {
      if (b.type === 'heading') {
        raw += `== ${b.text} ==\n\n`;
      } else if (b.type === 'subheading') {
        raw += `=== ${b.text} ===\n\n`;
      } else if (b.type === 'callout') {
        raw += `{{Notice|${b.title || 'Key Note'}|${b.text}}}\n\n`;
      } else if (b.type === 'quote') {
        raw += `{{Quote|${b.text}|${b.author || ''}}}\n\n`;
      } else if (b.type === 'table') {
        raw += `{| class="wikitable"\n`;
        if (b.headers?.length) {
          raw += `! ` + b.headers.join(' !! ') + `\n`;
        }
        b.rows?.forEach(row => {
          raw += `|-\n| ` + row.join(' || ') + `\n`;
        });
        raw += `|}\n\n`;
      } else if (b.type === 'checklist') {
        raw += `'''${b.title || 'Summary List'}:'''\n`;
        b.items?.forEach(item => {
          raw += `* ${item}\n`;
        });
        raw += `\n`;
      } else {
        raw += `${b.text}\n\n`;
      }
    });

    if (references.length > 0) {
      raw += `== References ==\n`;
      references.forEach(r => {
        raw += `<ref>${r.title} - ${r.author} (${r.year || 'n.d.'})${r.url ? ` [${r.url}]` : ''}</ref>\n`;
      });
    }

    setWikitextSource(raw.trim());
  };

  // Parse Wikitext back into Structured Blocks
  const parseFromWikitext = (raw) => {
    const lines = raw.split('\n');
    const newBlocks = [];
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ').trim();
        if (text) newBlocks.push({ type: 'paragraph', text });
        currentParagraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushParagraph();
        continue;
      }

      // H2 Section == Title ==
      if (line.startsWith('==') && line.endsWith('==') && !line.startsWith('===')) {
        flushParagraph();
        const text = line.replace(/^==\s*|\s*==$/g, '');
        newBlocks.push({ type: 'heading', text });
        continue;
      }

      // H3 Subsection === Subtitle ===
      if (line.startsWith('===') && line.endsWith('===')) {
        flushParagraph();
        const text = line.replace(/^===\s*|\s*===$/g, '');
        newBlocks.push({ type: 'subheading', text });
        continue;
      }

      // Callout Notice {{Notice|Title|Message}}
      if (line.startsWith('{{Notice|') && line.endsWith('}}')) {
        flushParagraph();
        const parts = line.slice(9, -2).split('|');
        newBlocks.push({
          type: 'callout',
          title: parts[0] || 'Notice',
          text: parts.slice(1).join('|') || ''
        });
        continue;
      }

      // Quote {{Quote|Text|Author}}
      if (line.startsWith('{{Quote|') && line.endsWith('}}')) {
        flushParagraph();
        const parts = line.slice(8, -2).split('|');
        newBlocks.push({
          type: 'quote',
          text: parts[0] || '',
          author: parts[1] || ''
        });
        continue;
      }

      currentParagraph.push(line);
    }
    flushParagraph();

    if (newBlocks.length > 0) {
      setBlocks(newBlocks);
    }
  };

  const handleModeSwitch = (mode) => {
    if (mode === 'wikitext' && editorMode === 'visual') {
      syncToWikitext();
    } else if (editorMode === 'wikitext' && (mode === 'visual' || mode === 'preview')) {
      parseFromWikitext(wikitextSource);
    }
    setEditorMode(mode);
  };

  // Block Modifiers
  const addBlock = (type) => {
    if (type === 'heading') {
      setBlocks(prev => [...prev, { type: 'heading', text: `${prev.filter(b => b.type === 'heading').length + 1}. Section Title` }]);
    } else if (type === 'subheading') {
      setBlocks(prev => [...prev, { type: 'subheading', text: 'Subsection Heading' }]);
    } else if (type === 'callout') {
      setBlocks(prev => [...prev, { type: 'callout', title: 'Key Heuristic', text: 'Important principle or financial rule to remember.' }]);
    } else if (type === 'quote') {
      setBlocks(prev => [...prev, { type: 'quote', text: 'Financial transparency is the ultimate safeguard of personal freedom.', author: 'Admin Tallyin' }]);
    } else if (type === 'table') {
      setBlocks(prev => [...prev, {
        type: 'table',
        headers: ['Metric', 'Conservative Allocation', 'Aggressive Growth'],
        rows: [
          ['Fixed Needs', '50% of Net Income', '40% of Net Income'],
          ['Discretionary Wants', '30% of Net Income', '20% of Net Income'],
          ['Compounding Savings', '20% of Net Income', '40% of Net Income']
        ]
      }]);
    } else {
      setBlocks(prev => [...prev, { type: 'paragraph', text: '' }]);
    }
  };

  const removeBlock = (index) => {
    setBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const updateBlock = (index, field, value) => {
    setBlocks(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Infobox attribute helpers
  const addInfoboxAttribute = () => {
    setInfoboxAttributes(prev => [...prev, { label: 'Property', value: 'Value' }]);
  };

  const removeInfoboxAttribute = (idx) => {
    setInfoboxAttributes(prev => prev.filter((_, i) => i !== idx));
  };

  const updateInfoboxAttribute = (idx, field, value) => {
    setInfoboxAttributes(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // References helpers
  const addReference = () => {
    setReferences(prev => [
      ...prev,
      { id: prev.length + 1, title: 'Scholarly Publication or Report', author: 'Author Name', year: '2026', url: '' }
    ]);
  };

  const removeReference = (id) => {
    setReferences(prev => prev.filter(r => r.id !== id));
  };

  // Table of Contents generator from headings
  const tocList = useMemo(() => {
    const headings = [];
    blocks.forEach((b, idx) => {
      if (b.type === 'heading') {
        headings.push({ id: `sec-${idx}`, title: b.text, level: 2 });
      } else if (b.type === 'subheading') {
        headings.push({ id: `sec-${idx}`, title: b.text, level: 3 });
      }
    });
    if (references.length > 0) {
      headings.push({ id: 'sec-references', title: 'References & Citations', level: 2 });
    }
    return headings;
  }, [blocks, references]);

  // Insert Wikitext snippets into source textarea
  const insertWikitextSnippet = (snippet) => {
    setWikitextSource(prev => prev + '\n' + snippet);
  };

  // Handle Submit
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      alert('Please provide an encyclopedic article title.');
      return;
    }

    if (editorMode === 'wikitext') {
      parseFromWikitext(wikitextSource);
    }

    const filteredBlocks = blocks.filter(b => (b.text && b.text.trim() !== '') || b.type === 'table');
    if (filteredBlocks.length === 0) {
      alert('Please compose at least one section of encyclopedic content.');
      return;
    }

    const totalWords = filteredBlocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0);
    const readMinutes = Math.max(3, Math.ceil(totalWords / 160));

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const takeaways = takeawaysInput.split('\n').map(t => t.trim()).filter(Boolean);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `article-${Date.now()}`;

    const finalAuthorName = postAsAdmin && isAdmin ? defaultAdminAuthorName : authorName;
    const finalAuthorRole = postAsAdmin && isAdmin ? defaultAdminAuthorRole : authorRole;

    const newArticle = {
      id: initialArticle?.id || `custom-${Date.now()}`,
      slug,
      title: title.trim(),
      subtitle: subtitle.trim() || 'An informative encyclopedic guide.',
      category,
      tags: tags.length ? tags : [category],
      readTime: `${readMinutes} min read`,
      publishedAt: (isAdmin && postAsAdmin) ? new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : (initialArticle?.publishedAt || null),
      status: (isAdmin && postAsAdmin) ? 'published' : 'pending_review',
      viewsCount: initialArticle?.viewsCount || 1,
      likesCount: initialArticle?.likesCount || 0,
      author: {
        name: finalAuthorName.trim(),
        role: finalAuthorRole.trim(),
        email: postAsAdmin && isAdmin ? 'tallyin.alerts@gmail.com' : (user?.email || ''),
        avatar: postAsAdmin && isAdmin 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : (user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalAuthorName)}`),
        isAdmin: Boolean(postAsAdmin && isAdmin)
      },
      infobox: hasInfobox ? {
        title: infoboxTitle.trim() || title.trim(),
        subtitle: infoboxSubtitle.trim(),
        attributes: infoboxAttributes.filter(a => a.label.trim())
      } : null,
      takeaways: takeaways.length ? takeaways : null,
      content: filteredBlocks,
      references: references.filter(r => r.title.trim()),
      submittedAt: initialArticle?.submittedAt || new Date().toISOString()
    };

    onSave(newArticle);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="hud-card max-w-5xl w-full p-4 sm:p-6 rounded-3xl border border-emerald-500/40 text-left space-y-4 max-h-[94vh] flex flex-col shadow-2xl bg-white dark:bg-slate-900">
        
        {/* Top Header: Wikipedia Brand Bar & Editor Modes */}
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-serif text-lg font-bold text-slate-800 dark:text-slate-100 shadow-xs">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#1A3827] dark:text-slate-100 font-serif">
                  Wikipedia-Style Article Editor
                </h2>
                {isAdmin && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#A3E635] flex items-center gap-1 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin Clearance
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                Author informative, neutral encyclopedic financial treatises and community guides.
              </p>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleModeSwitch('visual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                editorMode === 'visual'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#A3E635] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Visual Editor</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('wikitext')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                editorMode === 'wikitext'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#A3E635] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Edit Source (Wikitext)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#A3E635] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Encyclopedic Preview</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg ml-1"
              title="Close editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin or Contributor Context Alert */}
        {isAdmin ? (
          <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-200 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Publishing with <strong>Administrative Authority</strong>. Articles published will be immediately live and featured under official <strong>Admin Tallyin</strong>.
              </span>
            </div>
            <label className="flex items-center gap-2 font-bold cursor-pointer bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-indigo-300 dark:border-indigo-700">
              <input
                type="checkbox"
                checked={postAsAdmin}
                onChange={e => setPostAsAdmin(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              <span>Post as "Admin Tallyin"</span>
            </label>
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 shrink-0">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Peer Review Process:</strong> You are submitting as <strong>{authorName}</strong>. Once submitted, your article will be reviewed by Tallyin Administration and published upon approval.
            </span>
          </div>
        )}

        {/* Scrollable Editor Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {/* ════════════ MODE 1: VISUAL EDITOR ════════════ */}
          {editorMode === 'visual' && (
            <div className="space-y-4 text-xs">
              
              {/* Primary Article Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
                    <span>Article Title (Encyclopedic Subject) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The 50/30/20 Budgeting Principle: Mathematical Foundations"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-black text-[#1A3827] dark:text-slate-100">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subtitle / Abstract Summary</label>
                  <input
                    type="text"
                    placeholder="Brief 1-2 sentence encyclopedic overview of the subject."
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Personal Finance, Budgeting, Compounding"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Author Name</label>
                  <input
                    type="text"
                    value={postAsAdmin && isAdmin ? defaultAdminAuthorName : authorName}
                    disabled={postAsAdmin && isAdmin}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs disabled:opacity-70"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Author Role / Affiliation</label>
                  <input
                    type="text"
                    value={postAsAdmin && isAdmin ? defaultAdminAuthorRole : authorRole}
                    disabled={postAsAdmin && isAdmin}
                    onChange={e => setAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs disabled:opacity-70"
                  />
                </div>
              </div>

              {/* Wikipedia Infobox Builder Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                    <span className="font-black text-[#1A3827] dark:text-slate-100">
                      Wikipedia Infobox (Quick Facts Card)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasInfobox}
                      onChange={e => setHasInfobox(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Include Infobox Card</span>
                  </label>
                </div>

                {hasInfobox && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Infobox Header</label>
                        <input
                          type="text"
                          placeholder="e.g. The 50/30/20 Rule"
                          value={infoboxTitle}
                          onChange={e => setInfoboxTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Infobox Subtitle</label>
                        <input
                          type="text"
                          placeholder="e.g. Household Allocation Framework"
                          value={infoboxSubtitle}
                          onChange={e => setInfoboxSubtitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Facts / Properties</span>
                        <button
                          type="button"
                          onClick={addInfoboxAttribute}
                          className="text-[11px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Fact Row
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {infoboxAttributes.map((attr, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <input
                              type="text"
                              placeholder="Property (e.g. Formula)"
                              value={attr.label}
                              onChange={e => updateInfoboxAttribute(idx, 'label', e.target.value)}
                              className="w-1/3 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900 text-xs font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g. 50/30/20)"
                              value={attr.value}
                              onChange={e => updateInfoboxAttribute(idx, 'value', e.target.value)}
                              className="flex-1 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeInfoboxAttribute(idx)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wikipedia Visual Blocks Toolbar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span className="font-black text-[#1A3827] dark:text-slate-100">
                      Article Sections &amp; Encyclopedic Content
                    </span>
                  </div>

                  {/* Add Block Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addBlock('paragraph')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" /> Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('heading')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/50 hover:bg-emerald-200 text-emerald-900 dark:text-[#A3E635] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Section (H2)
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('subheading')}
                      className="px-2.5 py-1 rounded-lg bg-teal-100/70 dark:bg-teal-950/50 hover:bg-teal-200 text-teal-900 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Subsection (H3)
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('callout')}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/50 hover:bg-amber-200 text-amber-900 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Notice Box
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('table')}
                      className="px-2.5 py-1 rounded-lg bg-blue-100/70 dark:bg-blue-950/50 hover:bg-blue-200 text-blue-900 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Wikitable
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('quote')}
                      className="px-2.5 py-1 rounded-lg bg-purple-100/70 dark:bg-purple-950/50 hover:bg-purple-200 text-purple-900 dark:text-purple-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Quote
                    </button>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-2xl border transition-all text-left ${
                        block.type === 'heading' 
                          ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20' 
                          : block.type === 'subheading'
                          ? 'border-teal-300 dark:border-teal-900 bg-teal-50/20 dark:bg-teal-950/10'
                          : block.type === 'callout'
                          ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20'
                          : block.type === 'table'
                          ? 'border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider pb-1.5">
                        <span className="flex items-center gap-1">
                          {block.type === 'heading' && <span className="font-serif font-black text-emerald-700 dark:text-[#A3E635]">== Section Heading ==</span>}
                          {block.type === 'subheading' && <span className="font-serif font-black text-teal-700 dark:text-teal-400">=== Subsection ===</span>}
                          {block.type === 'paragraph' && <span>Standard Paragraph</span>}
                          {block.type === 'callout' && <span className="text-amber-700 dark:text-amber-400">Notice / Heuristic Box</span>}
                          {block.type === 'table' && <span className="text-blue-700 dark:text-blue-400">Comparison Wikitable</span>}
                          {block.type === 'quote' && <span className="text-purple-700 dark:text-purple-400">Attributed Quotation</span>}
                        </span>
                        {blocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="text-rose-500 hover:text-rose-700 font-bold"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>

                      {block.type === 'heading' && (
                        <input
                          type="text"
                          value={block.text}
                          onChange={e => updateBlock(idx, 'text', e.target.value)}
                          placeholder="e.g. 1. The Tripartite Capital Allocation Model"
                          className="w-full px-3 py-2 text-sm font-bold font-serif rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900"
                        />
                      )}

                      {block.type === 'subheading' && (
                        <input
                          type="text"
                          value={block.text}
                          onChange={e => updateBlock(idx, 'text', e.target.value)}
                          placeholder="e.g. 1.1 Non-Negotiable Overhead vs Elastic Discretionary Spends"
                          className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900"
                        />
                      )}

                      {block.type === 'callout' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={e => updateBlock(idx, 'title', e.target.value)}
                            placeholder="Callout Title (e.g. Mathematical Formulation)"
                            className="w-full px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 font-bold text-xs"
                          />
                          <textarea
                            rows={2}
                            value={block.text || ''}
                            onChange={e => updateBlock(idx, 'text', e.target.value)}
                            placeholder="Notice text or key rule..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                      )}

                      {block.type === 'quote' && (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={block.text || ''}
                            onChange={e => updateBlock(idx, 'text', e.target.value)}
                            placeholder="Quotation text..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs italic"
                          />
                          <input
                            type="text"
                            value={block.author || ''}
                            onChange={e => updateBlock(idx, 'author', e.target.value)}
                            placeholder="Quotation Author (e.g. Benjamin Graham)"
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                      )}

                      {block.type === 'table' && (
                        <div className="space-y-2 overflow-x-auto">
                          <p className="text-[11px] text-slate-500">Edit table column headers and rows directly below:</p>
                          <table className="w-full text-[11px] border-collapse border border-slate-200 dark:border-slate-700">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800">
                                {block.headers?.map((h, colIdx) => (
                                  <th key={colIdx} className="p-1.5 border border-slate-200 dark:border-slate-700 text-left">
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={e => {
                                        const newHeaders = [...block.headers];
                                        newHeaders[colIdx] = e.target.value;
                                        updateBlock(idx, 'headers', newHeaders);
                                      }}
                                      className="w-full px-1 py-0.5 font-bold bg-transparent"
                                    />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows?.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="p-1.5 border border-slate-200 dark:border-slate-700">
                                      <input
                                        type="text"
                                        value={cell}
                                        onChange={e => {
                                          const newRows = [...block.rows];
                                          newRows[rowIdx][cellIdx] = e.target.value;
                                          updateBlock(idx, 'rows', newRows);
                                        }}
                                        className="w-full px-1 py-0.5 bg-transparent"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {block.type === 'paragraph' && (
                        <textarea
                          rows={3}
                          value={block.text || ''}
                          onChange={e => updateBlock(idx, 'text', e.target.value)}
                          placeholder="Write authoritative paragraph text. Use [1], [2] to reference citations..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs leading-relaxed"
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations & Scholarly References */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>References &amp; Citations</span>
                  </span>
                  <button
                    type="button"
                    onClick={addReference}
                    className="text-[11px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Citation
                  </button>
                </div>

                <div className="space-y-1.5">
                  {references.map((ref, idx) => (
                    <div key={ref.id || idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-mono font-bold text-emerald-600 dark:text-[#A3E635] text-[11px] shrink-0">
                        [{idx + 1}]
                      </span>
                      <input
                        type="text"
                        placeholder="Publication / Article Title"
                        value={ref.title}
                        onChange={e => {
                          const copy = [...references];
                          copy[idx].title = e.target.value;
                          setReferences(copy);
                        }}
                        className="flex-1 px-2 py-1 rounded-lg border text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Author & Year"
                        value={ref.author}
                        onChange={e => {
                          const copy = [...references];
                          copy[idx].author = e.target.value;
                          setReferences(copy);
                        }}
                        className="w-1/3 px-2 py-1 rounded-lg border text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeReference(ref.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-1">
                <label className="font-bold text-[#1A3827] dark:text-slate-200">
                  Key Takeaways (one actionable rule per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Rule 1: Cap fixed needs strictly at 50% of after-tax net income&#10;Rule 2: Automate emergency buffer transfers on salary credit day"
                  value={takeawaysInput}
                  onChange={e => setTakeawaysInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

            </div>
          )}

          {/* ════════════ MODE 2: WIKITEXT / SOURCE EDITOR ════════════ */}
          {editorMode === 'wikitext' && (
            <div className="space-y-3 text-xs">
              {/* Quick Wikitext Snippets Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Insert:</span>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet('== Section Title ==\n\nContent here...\n')}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  == H2 ==
                </button>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet('=== Subsection Title ===\n\nContent here...\n')}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  === H3 ===
                </button>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet("'''Bold text'''")}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  '''B'''
                </button>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet("''Italic text''")}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  ''I''
                </button>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet("{{Notice|Key Rule|Always decouple needs from wants.}}")}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  {'{{Notice}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet("{{Quote|Compound interest is the eighth wonder of the world.|Albert Einstein}}")}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  {'{{Quote}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertWikitextSnippet("<ref>Author, A. (2026). Study on Savings.</ref>")}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px] font-bold"
                >
                  {'<ref>'}
                </button>
              </div>

              <textarea
                rows={16}
                value={wikitextSource}
                onChange={e => setWikitextSource(e.target.value)}
                placeholder="== Section Title ==&#10;&#10;Write encyclopedic source text..."
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* ════════════ MODE 3: ENCYCLOPEDIC LIVE PREVIEW ════════════ */}
          {editorMode === 'preview' && (
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-left">
              
              {/* Wikipedia Header */}
              <div className="border-b border-slate-300 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  From Tallyin, the free encyclopedia of personal finance
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1A3827] dark:text-slate-50 mt-1">
                  {title || 'Untitled Encyclopedic Article'}
                </h1>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {subtitle || 'An informative treatise published by Admin Tallyin.'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2">
                  <span>Author: <strong>{postAsAdmin && isAdmin ? defaultAdminAuthorName : authorName}</strong></span>
                  <span>•</span>
                  <span>Category: <strong>{category}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-600">{isAdmin && postAsAdmin ? 'Published' : 'Pending Review'}</strong></span>
                </div>
              </div>

              {/* Main Content Area with Floated Infobox */}
              <div className="relative block lg:flex lg:gap-6 items-start">
                
                {/* Article Body */}
                <div className="flex-1 space-y-4">
                  
                  {/* Collapsible Table of Contents */}
                  {tocList.length > 0 && (
                    <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm">
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
                          {tocList.map((item, idx) => (
                            <li 
                              key={idx} 
                              className={`text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-[#A3E635] cursor-pointer ${
                                item.level === 3 ? 'pl-4 text-[11px]' : 'font-medium'
                              }`}
                            >
                              <span>{item.title}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {/* Rendered Content Blocks */}
                  {blocks.map((b, i) => (
                    <div key={i} className="text-xs sm:text-sm leading-relaxed">
                      {b.type === 'heading' && (
                        <h2 className="text-lg sm:text-xl font-black font-serif text-[#1A3827] dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 pt-4 flex items-center justify-between">
                          <span>{b.text}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal">[edit]</span>
                        </h2>
                      )}

                      {b.type === 'subheading' && (
                        <h3 className="text-sm sm:text-base font-bold font-serif text-[#1A3827] dark:text-slate-200 pt-3">
                          {b.text}
                        </h3>
                      )}

                      {b.type === 'callout' && (
                        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-amber-500 text-amber-950 dark:text-amber-200 space-y-1 my-2">
                          <strong className="block text-xs uppercase tracking-wider">{b.title || 'Notice'}:</strong>
                          <p className="text-xs leading-relaxed">{b.text}</p>
                        </div>
                      )}

                      {b.type === 'quote' && (
                        <blockquote className="p-3 border-l-4 border-slate-400 bg-slate-50 dark:bg-slate-900 italic my-2">
                          "{b.text}"
                          {b.author && <cite className="block text-[11px] text-slate-400 not-italic mt-1">— {b.author}</cite>}
                        </blockquote>
                      )}

                      {b.type === 'table' && (
                        <div className="overflow-x-auto my-3">
                          <table className="w-full text-xs border border-slate-300 dark:border-slate-700 border-collapse">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800">
                                {b.headers?.map((h, hi) => (
                                  <th key={hi} className="p-2 border border-slate-300 dark:border-slate-700 text-left font-bold font-serif">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {b.rows?.map((row, ri) => (
                                <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50 dark:bg-slate-900/50' : ''}>
                                  {row.map((cell, ci) => (
                                    <td key={ci} className="p-2 border border-slate-300 dark:border-slate-700">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {b.type === 'paragraph' && (
                        <p className="text-slate-800 dark:text-slate-200">
                          {b.text}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* References in Preview */}
                  {references.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <h3 className="text-sm font-black font-serif text-[#1A3827] dark:text-slate-100">
                        References &amp; Citations
                      </h3>
                      <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        {references.map((r, i) => (
                          <li key={i}>
                            <span>{r.title}</span> {r.author && `— ${r.author}`} {r.year && `(${r.year})`}.
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Categories footer */}
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500">
                    <strong>Categories:</strong> <span className="text-emerald-700 dark:text-[#A3E635]">{category}</span> • <span>Personal Finance</span> • <span>Wealth Management</span>
                  </div>

                </div>

                {/* Floating Wikipedia Infobox Card */}
                {hasInfobox && (
                  <div className="w-full lg:w-72 shrink-0 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm space-y-3 mt-4 lg:mt-0">
                    <div className="text-center border-b pb-2 dark:border-slate-800">
                      <h4 className="font-serif font-black text-sm text-[#1A3827] dark:text-slate-100">
                        {infoboxTitle || title || 'Infobox'}
                      </h4>
                      {infoboxSubtitle && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{infoboxSubtitle}</p>
                      )}
                    </div>

                    <table className="w-full text-[11px]">
                      <tbody>
                        {infoboxAttributes.map((attr, idx) => (
                          <tr key={idx} className="border-b border-slate-200 dark:border-slate-800/80">
                            <td className="py-1.5 pr-2 font-bold text-slate-600 dark:text-slate-400 align-top w-2/5">
                              {attr.label}
                            </td>
                            <td className="py-1.5 text-slate-800 dark:text-slate-200">
                              {attr.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#E3E8E3] dark:border-slate-800 pt-3 shrink-0 flex-wrap gap-2">
          <div className="text-xs text-slate-500">
            {editorMode === 'visual' && `${blocks.length} sections defined`}
            {editorMode === 'wikitext' && 'Wikitext source mode'}
            {editorMode === 'preview' && 'Ready to publish / submit'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isAdmin && postAsAdmin ? 'Publish Live (Admin Clearance)' : 'Submit Article for Review'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
