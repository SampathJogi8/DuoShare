import os

HTML = r"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tallyin — Centralized Admin Portal</title>
  <meta name="description" content="Official admin dashboard for Tallyin platform management."/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          },
          colors: {
            brand: {
              50: '#F4F7F5',
              100: '#EAF0EC',
              200: '#D5E1D9',
              500: '#3A7050',
              800: '#1A3827',
              900: '#0F2318',
              lime: '#A3E635'
            }
          }
        }
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-[#F6F8F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased min-h-screen selection:bg-brand-lime selection:text-slate-950">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useCallback, useRef, useMemo } = React;
    const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';
    const ADMIN_EMAIL = 'tallyin.alerts@gmail.com';
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const fmt = {
      inr: n => `\u20B9${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      num: n => Number(n || 0).toLocaleString('en-IN'),
      date: d => { if (!d) return '\u2014'; try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } },
      time: d => { if (!d) return '\u2014'; try { return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }); } catch { return d; } },
      init: e => (e || '?').slice(0, 2).toUpperCase()
    };

    let _ts = null;
    const toast = {
      success: m => _ts && _ts({ m, t: 's', id: Date.now() }),
      error: m => _ts && _ts({ m, t: 'e', id: Date.now() }),
      info: m => _ts && _ts({ m, t: 'i', id: Date.now() })
    };

    function ToastProvider() {
      const [toasts, setToasts] = useState([]);
      _ts = t => setToasts(p => [...p.slice(-4), t]);
      useEffect(() => {
        if (!toasts.length) return;
        const x = setTimeout(() => setToasts(p => p.slice(1)), 4000);
        return () => clearTimeout(x);
      }, [toasts]);
      return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xl border backdrop-blur-md transition-all transform animate-bounce-short ${
              t.t === 's' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800' :
              t.t === 'e' ? 'bg-rose-950/90 text-rose-200 border-rose-800' :
              'bg-slate-900/90 text-slate-200 border-slate-700'
            }`}>
              <span>{t.t === 's' ? '✅' : t.t === 'e' ? '❌' : 'ℹ️'}</span>
              <span>{t.m}</span>
            </div>
          ))}
        </div>
      );
    }

    function LoginView({ onLogin }) {
      const [email, setEmail] = useState(ADMIN_EMAIL);
      const [pwd, setPwd] = useState('');
      const [loading, setLoading] = useState(false);
      const [err, setErr] = useState('');
      const [magic, setMagic] = useState(false);

      const doLogin = async e => {
        e.preventDefault();
        if (!email || !pwd) { setErr('Email and password are required.'); return; }
        setLoading(true); setErr('');
        try {
          const { data, error } = await db.auth.signInWithPassword({ email, password: pwd });
          if (error) throw error;
          if (data && data.user && data.user.email !== ADMIN_EMAIL) {
            await db.auth.signOut();
            throw new Error('Access denied. Only tallyin.alerts@gmail.com can log in here.');
          }
          onLogin(data.user);
        } catch (e2) { setErr(e2.message || 'Login failed.'); }
        finally { setLoading(false); }
      };

      const doMagic = async () => {
        setLoading(true); setErr('');
        try {
          const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
          if (error) throw error;
          setMagic(true);
        } catch (e2) { setErr(e2.message || 'Failed to send magic link.'); }
        finally { setLoading(false); }
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F6F8F6] dark:bg-slate-950">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 shadow-md">
                🛡️
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Tallyin Admin</h1>
              <p className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400 mt-1 uppercase tracking-widest">Centralized Control Portal</p>
            </div>

            {magic ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">📫</div>
                <h3 className="text-lg font-bold text-emerald-600 dark:text-[#A3E635] mb-2">Magic link sent!</h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">Check <strong className="text-slate-800 dark:text-slate-200">{email}</strong> for the one-click login link.</p>
                <button onClick={() => setMagic(false)} className="mt-6 text-xs font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline">Back to password login</button>
              </div>
            ) : (
              <form onSubmit={doLogin} className="space-y-4">
                {err && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <span>⚠️</span> <span>{err}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#5C6E5C] dark:text-slate-400 mb-1.5 tracking-wider">Admin Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tallyin.alerts@gmail.com" className="w-full px-4 py-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-sm font-semibold outline-none focus:border-[#1A3827] dark:focus:border-[#A3E635] transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#5C6E5C] dark:text-slate-400 mb-1.5 tracking-wider">Password</label>
                  <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-sm font-semibold outline-none focus:border-[#1A3827] dark:focus:border-[#A3E635] transition-all" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-[#1A3827] hover:bg-[#255038] dark:bg-[#A3E635] dark:hover:bg-lime-400 text-white dark:text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={doMagic} disabled={loading} className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-[#A3E635] transition-all">
                    ✉️ Send Magic Login Link Instead
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-[#E3E8E3] dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-500 uppercase tracking-widest">
                Protected Portal &bull; Tallyin v3.2
              </p>
            </div>
          </div>
        </div>
      );
    }

    function App() {
      const [user, setUser] = useState(null);
      const [authLoading, setAuthLoading] = useState(true);
      const [tab, setTab] = useState('overview');
      const [stats, setStats] = useState(null);
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState('');
      const [rooms, setRooms] = useState([]);
      const [members, setMembers] = useState([]);
      const [txns, setTxns] = useState([]);
      const [announcements, setAnns] = useState([]);
      const [mm, setMm] = useState(() => localStorage.getItem('admin_mm') === 'true');
      const [annTitle, setAnnTitle] = useState('');
      const [annBody, setAnnBody] = useState('');
      const [annType, setAnnType] = useState('info');
      const [sendingAnn, setSendingAnn] = useState(false);
      const [selectedRoom, setSelectedRoom] = useState(null);

      useEffect(() => {
        db.auth.getSession().then(({ data }) => {
          if (data && data.session && data.session.user && data.session.user.email === ADMIN_EMAIL) {
            setUser(data.session.user);
          }
          setAuthLoading(false);
        });
        const { data: { subscription } } = db.auth.onAuthStateChange((_, session) => {
          if (session && session.user && session.user.email === ADMIN_EMAIL) setUser(session.user);
          else setUser(null);
          setAuthLoading(false);
        });
        return () => subscription && subscription.unsubscribe();
      }, []);

      const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
          const [rr, mr, tr, ar] = await Promise.all([
            db.from('rooms').select('*').order('created_at', { ascending: false }),
            db.from('room_members').select('*, rooms(name, code)').order('created_at', { ascending: false }),
            db.from('transactions').select('*, rooms(name, code)').order('created_at', { ascending: false }).limit(500),
            db.from('announcements').select('*').order('created_at', { ascending: false }).limit(50)
          ]);

          const roomList = rr.data || [];
          const memberList = mr.data || [];
          const txnList = tr.data || [];
          const annList = ar.data || [];

          setRooms(roomList);
          setMembers(memberList);
          setTxns(txnList);
          setAnns(annList);

          const uniqUsers = new Set(memberList.map(m => m.uid)).size;
          const totalVol = txnList.reduce((s, t) => s + Number(t.amount || 0), 0);
          const activeThisMonth = new Set(txnList.filter(t => t.date && t.date.startsWith(new Date().toISOString().slice(0, 7))).map(t => t.room_id)).size;

          setStats({
            rooms: roomList.length,
            users: uniqUsers,
            memberships: memberList.length,
            transactions: txnList.length,
            volume: totalVol,
            activeRooms: activeThisMonth,
            avgBudget: roomList.length ? roomList.reduce((s, r) => s + (r.monthly_budget || 0), 0) / roomList.length : 0
          });
        } catch (err) {
          toast.error('Failed to load data: ' + err.message);
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => {
        if (user) fetchAllData();
      }, [user, fetchAllData]);

      const toggleMaintenance = () => {
        const next = !mm;
        setMm(next);
        localStorage.setItem('admin_mm', String(next));
        db.from('platform_settings').upsert({ key: 'maintenance_mode', value: String(next), updated_at: new Date().toISOString() }).then(() => {});
        toast.success(`Maintenance Mode is now ${next ? 'ON' : 'OFF'}`);
      };

      const handleSendAnnouncement = async () => {
        if (!annTitle.trim() || !annBody.trim()) { toast.error('Title and message are required'); return; }
        setSendingAnn(true);
        try {
          const { error } = await db.from('announcements').insert({
            title: annTitle.trim(),
            body: annBody.trim(),
            type: annType,
            created_at: new Date().toISOString(),
            created_by: 'admin',
            is_active: true
          });
          if (error) throw error;
          toast.success('Announcement broadcasted!');
          setAnnTitle(''); setAnnBody('');
          fetchAllData();
        } catch (err) {
          toast.error('Error sending announcement: ' + err.message);
        } finally {
          setSendingAnn(false);
        }
      };

      const handleDeleteRoom = async (room) => {
        if (!window.confirm(`Permanently delete room "${room.name}" and all associated transactions?`)) return;
        try {
          await db.from('transactions').delete().eq('room_id', room.id);
          await db.from('room_members').delete().eq('room_id', room.id);
          const { error } = await db.from('rooms').delete().eq('id', room.id);
          if (error) throw error;
          toast.success(`Room "${room.name}" deleted.`);
          fetchAllData();
        } catch (err) {
          toast.error('Delete failed: ' + err.message);
        }
      };

      const handleDeleteTxn = async (txn) => {
        if (!window.confirm(`Delete transaction "${txn.title}"?`)) return;
        try {
          const { error } = await db.from('transactions').delete().eq('id', txn.id);
          if (error) throw error;
          toast.success('Transaction deleted');
          fetchAllData();
        } catch (err) {
          toast.error('Delete failed: ' + err.message);
        }
      };

      const exportCSV = (tableData, filename) => {
        if (!tableData || !tableData.length) { toast.info('No data to export'); return; }
        const csv = [
          Object.keys(tableData[0]).join(','),
          ...tableData.map(r => Object.values(r).map(v => typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : `"${String(v || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tallyin_${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast.success(`Exported ${tableData.length} records`);
      };

      if (authLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-[#F6F8F6] dark:bg-slate-950 text-[#5C6E5C] dark:text-slate-400 font-bold text-sm">
            Loading Admin Control Panel...
          </div>
        );
      }

      if (!user) {
        return (
          <>
            <ToastProvider />
            <LoginView onLogin={setUser} />
          </>
        );
      }

      const filteredRooms = rooms.filter(r => (r.name && r.name.toLowerCase().includes(search.toLowerCase())) || (r.code && r.code.toLowerCase().includes(search.toLowerCase())) || (r.id && r.id.toLowerCase().includes(search.toLowerCase())));
      const filteredMembers = members.filter(m => (m.nickname && m.nickname.toLowerCase().includes(search.toLowerCase())) || (m.email && m.email.toLowerCase().includes(search.toLowerCase())) || (m.uid && m.uid.toLowerCase().includes(search.toLowerCase())));
      const filteredTxns = txns.filter(t => (t.title && t.title.toLowerCase().includes(search.toLowerCase())) || (t.category && t.category.toLowerCase().includes(search.toLowerCase())) || (t.paid_by && t.paid_by.toLowerCase().includes(search.toLowerCase())));

      return (
        <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          <ToastProvider />

          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#E3E8E3] dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-sm">
                  🛡️
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight flex items-center gap-2">
                    Tallyin Admin
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">SUPERADMIN</span>
                  </h1>
                  <p className="text-[11px] font-semibold text-[#5C6E5C] dark:text-slate-400">tallyin.alerts@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={toggleMaintenance} className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${mm ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'}`}>
                  <span>{mm ? '🚨 Maintenance ON' : '✅ System Normal'}</span>
                </button>
                <button onClick={fetchAllData} className="p-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all text-xs font-bold" title="Refresh Data">
                  🔄
                </button>
                <button onClick={() => db.auth.signOut()} className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all">
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Maintenance Mode Alert Banner */}
            {mm && (
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="text-sm font-extrabold">Maintenance Mode Active</h4>
                    <p className="text-xs font-medium opacity-90">All regular room users see a maintenance block screen while administrative edits are underway.</p>
                  </div>
                </div>
                <button onClick={toggleMaintenance} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs shadow-sm hover:bg-amber-700 transition-all">
                  Turn Off
                </button>
              </div>
            )}

            {/* Admin Filter Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E3E8E3] dark:border-slate-800">
              {[
                { id: 'overview', label: '📊 Platform Overview' },
                { id: 'rooms', label: `🏠 Rooms (${rooms.length})` },
                { id: 'users', label: `👥 Users & Members (${members.length})` },
                { id: 'txns', label: `💸 Transactions (${txns.length})` },
                { id: 'broadcasts', label: '📢 Broadcasts' },
                { id: 'export', label: '📥 Data Export' }
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${tab === t.id ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md' : 'bg-white dark:bg-slate-900 text-[#5C6E5C] dark:text-slate-400 border border-[#E3E8E3] dark:border-slate-800 hover:text-[#1A3827]'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Bar for List Views */}
            {['rooms', 'users', 'txns'].includes(tab) && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <span className="text-sm">🔍</span>
                <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm font-semibold outline-none text-slate-800 dark:text-slate-200" />
                {search && <button onClick={() => setSearch('')} className="text-xs font-bold text-[#5C6E5C] hover:text-slate-900 dark:hover:text-slate-100">Clear</button>}
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Total Rooms', val: fmt.num(stats?.rooms), icon: '🏠', color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
                    { label: 'Registered Users', val: fmt.num(stats?.users), icon: '👥', color: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' },
                    { label: 'Memberships', val: fmt.num(stats?.memberships), icon: '📋', color: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' },
                    { label: 'Transactions', val: fmt.num(stats?.transactions), icon: '💸', color: 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' },
                    { label: 'Total Volume', val: fmt.inr(stats?.volume), icon: '💰', color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
                    { label: 'Active (Month)', val: fmt.num(stats?.activeRooms), icon: '⚡', color: 'bg-lime-50 text-lime-800 dark:bg-lime-950/40 dark:text-lime-300' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
                        <span className={`text-base p-1.5 rounded-xl ${s.color}`}>{s.icon}</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-extrabold text-[#1A3827] dark:text-slate-100">{s.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Rooms Quick Panel */}
                  <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">Recent Rooms</h3>
                      <button onClick={() => setTab('rooms')} className="text-xs font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline">View All &rarr;</button>
                    </div>
                    <div className="space-y-2">
                      {rooms.slice(0, 5).map(r => (
                        <div key={r.id} className="p-3 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#1A3827] dark:text-slate-100">{r.name || 'Unnamed Room'}</p>
                            <p className="text-[11px] font-mono text-[#5C6E5C] dark:text-slate-400">Code: {r.code || 'N/A'} &bull; Budget: {fmt.inr(r.monthly_budget)}</p>
                          </div>
                          <button onClick={() => setSelectedRoom(r)} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#EAF0EC] transition-all">Details</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Broadcast Quick Panel */}
                  <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">Quick Platform Announcement</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold outline-none" />
                      <textarea placeholder="Message body..." value={annBody} onChange={e => setAnnBody(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-medium outline-none resize-none" />
                      <button onClick={handleSendAnnouncement} disabled={sendingAnn} className="w-full py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-black shadow-sm hover:opacity-90 transition-all">
                        {sendingAnn ? 'Sending...' : '📢 Broadcast Announcement'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROOMS */}
            {tab === 'rooms' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">All Platform Rooms ({filteredRooms.length})</h3>
                  <button onClick={() => exportCSV(rooms, 'rooms')} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F8F6] dark:bg-slate-950 text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-[#E3E8E3] dark:border-slate-800">
                      <tr>
                        <th className="p-4">Room Name</th>
                        <th className="p-4">Code</th>
                        <th className="p-4">Monthly Budget</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E3] dark:divide-slate-800 font-semibold">
                      {filteredRooms.map(r => (
                        <tr key={r.id} className="hover:bg-[#F6F8F6]/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 text-sm font-extrabold text-[#1A3827] dark:text-slate-100">{r.name || 'Unnamed'}</td>
                          <td className="p-4 font-mono font-bold text-emerald-700 dark:text-[#A3E635]">{r.code || 'N/A'}</td>
                          <td className="p-4">{fmt.inr(r.monthly_budget)}</td>
                          <td className="p-4 text-[#5C6E5C] dark:text-slate-400">{fmt.date(r.created_at)}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => setSelectedRoom(r)} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200">View</button>
                            <button onClick={() => handleDeleteRoom(r)} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold hover:bg-rose-100">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: USERS & MEMBERS */}
            {tab === 'users' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">All Room Members ({filteredMembers.length})</h3>
                  <button onClick={() => exportCSV(members, 'members')} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F8F6] dark:bg-slate-950 text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-[#E3E8E3] dark:border-slate-800">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E3] dark:divide-slate-800 font-semibold">
                      {filteredMembers.map(m => (
                        <tr key={m.id} className="hover:bg-[#F6F8F6]/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 flex items-center justify-center font-extrabold text-xs">
                              {fmt.init(m.nickname || m.email)}
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">{m.nickname || 'Anonymous'}</p>
                              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">{m.email || m.uid}</p>
                            </div>
                          </td>
                          <td className="p-4 font-bold">{m.rooms?.name || 'Unknown Room'}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${m.role === 'host' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {m.role || 'member'}
                            </span>
                          </td>
                          <td className="p-4 text-[#5C6E5C] dark:text-slate-400">{fmt.date(m.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: TRANSACTIONS */}
            {tab === 'txns' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">All Room Transactions ({filteredTxns.length})</h3>
                  <button onClick={() => exportCSV(txns, 'transactions')} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F8F6] dark:bg-slate-950 text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-[#E3E8E3] dark:border-slate-800">
                      <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Paid By</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E3] dark:divide-slate-800 font-semibold">
                      {filteredTxns.map(t => (
                        <tr key={t.id} className="hover:bg-[#F6F8F6]/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-extrabold text-[#1A3827] dark:text-slate-100">{t.title}</td>
                          <td className="p-4 text-sm font-black text-emerald-700 dark:text-[#A3E635]">{fmt.inr(t.amount)}</td>
                          <td className="p-4"><span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{t.category || 'General'}</span></td>
                          <td className="p-4">{t.paid_by || 'Unknown'}</td>
                          <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.is_shared ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{t.is_shared ? 'Shared' : 'Personal'}</span></td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteTxn(t)} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold hover:bg-rose-100">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: BROADCASTS */}
            {tab === 'broadcasts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">Send Platform Broadcast</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#5C6E5C] mb-1">Title</label>
                      <input type="text" placeholder="Title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#5C6E5C] mb-1">Message Body</label>
                      <textarea placeholder="Message body..." value={annBody} onChange={e => setAnnBody(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-medium outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#5C6E5C] mb-1">Type</label>
                      <select value={annType} onChange={e => setAnnType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold outline-none">
                        <option value="info">ℹ️ Info</option>
                        <option value="warning">⚠️ Warning</option>
                        <option value="success">✅ Success</option>
                        <option value="error">🚨 Alert</option>
                      </select>
                    </div>
                    <button onClick={handleSendAnnouncement} disabled={sendingAnn} className="w-full py-3 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-black shadow-sm hover:opacity-90 transition-all">
                      {sendingAnn ? 'Broadcasting...' : '📢 Broadcast Message'}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">Active Broadcasts ({announcements.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {announcements.map(a => (
                      <div key={a.id} className="p-3.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#1A3827] dark:text-slate-100">{a.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800">{a.type}</span>
                        </div>
                        <p className="text-xs text-[#5C6E5C] dark:text-slate-400">{a.body}</p>
                        <p className="text-[10px] font-mono text-slate-400 pt-1">{fmt.time(a.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: DATA EXPORT */}
            {tab === 'export' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">Export System Datasets (CSV)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={() => exportCSV(rooms, 'rooms')} className="p-4 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-left hover:border-[#1A3827] transition-all space-y-1">
                    <p className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">🏠 Rooms Dataset</p>
                    <p className="text-xs text-[#5C6E5C]">{rooms.length} room entries</p>
                  </button>
                  <button onClick={() => exportCSV(members, 'members')} className="p-4 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-left hover:border-[#1A3827] transition-all space-y-1">
                    <p className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">👥 Members Dataset</p>
                    <p className="text-xs text-[#5C6E5C]">{members.length} user memberships</p>
                  </button>
                  <button onClick={() => exportCSV(txns, 'transactions')} className="p-4 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-left hover:border-[#1A3827] transition-all space-y-1">
                    <p className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">💸 Transactions Dataset</p>
                    <p className="text-xs text-[#5C6E5C]">{txns.length} transactions</p>
                  </button>
                </div>
              </div>
            )}

          </main>

          {/* Modal for Room Details */}
          {selectedRoom && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A3827] dark:text-slate-100">Room Details: {selectedRoom.name}</h3>
                  <button onClick={() => setSelectedRoom(null)} className="text-sm font-bold text-[#5C6E5C] hover:text-slate-900">✕</button>
                </div>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between py-1.5 border-b border-[#E3E8E3]/50 dark:border-slate-800"><span className="text-[#5C6E5C]">Room ID:</span> <span className="font-mono text-slate-900 dark:text-slate-100">{selectedRoom.id}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-[#E3E8E3]/50 dark:border-slate-800"><span className="text-[#5C6E5C]">Room Code:</span> <span className="font-mono font-bold text-emerald-600">{selectedRoom.code}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-[#E3E8E3]/50 dark:border-slate-800"><span className="text-[#5C6E5C]">Monthly Budget:</span> <span>{fmt.inr(selectedRoom.monthly_budget)}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-[#E3E8E3]/50 dark:border-slate-800"><span className="text-[#5C6E5C]">Created At:</span> <span>{fmt.time(selectedRoom.created_at)}</span></div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={() => setSelectedRoom(null)} className="px-4 py-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
  </script>
</body>
</html>"""

out = os.path.join(os.path.dirname(__file__), "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(HTML)
print("Updated admin HTML successfully!")
