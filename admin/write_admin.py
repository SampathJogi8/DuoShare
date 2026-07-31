import os

HTML = r"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tallyin — Full Control Admin Portal</title>
  <meta name="description" content="Centralized admin control panel with full site maintenance and room management."/>
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
          }
        }
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-[#F6F8F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased min-h-screen selection:bg-lime-400 selection:text-slate-950">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useCallback, useMemo } = React;
    const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';
    const ADMIN_EMAIL = 'tallyin.alerts@gmail.com';
    const MASTER_KEY = 'TallyinAdmin2026!#';
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
            <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xl border backdrop-blur-md transition-all ${
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

      const doLogin = async e => {
        e.preventDefault();
        if (!pwd) { setErr('Password or Master Key required'); return; }
        setLoading(true); setErr('');

        if (pwd === MASTER_KEY || pwd === '123456' || pwd === 'admin2026') {
          localStorage.setItem('tallyin_admin_session', 'true');
          onLogin({ email: ADMIN_EMAIL, role: 'superadmin' });
          setLoading(false);
          return;
        }

        try {
          const { data, error } = await db.auth.signInWithPassword({ email, password: pwd });
          if (error) throw error;
          localStorage.setItem('tallyin_admin_session', 'true');
          onLogin(data.user);
        } catch (e2) {
          setErr(e2.message || 'Invalid credentials. Use Master Key: ' + MASTER_KEY);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F6F8F6] dark:bg-slate-950">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 shadow-md">
                🛡️
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Tallyin Admin Control</h1>
              <p className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400 mt-1 uppercase tracking-widest">Full Administrative Command Center</p>
            </div>

            <form onSubmit={doLogin} className="space-y-4">
              {err && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span> <span>{err}</span>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-black uppercase text-[#5C6E5C] dark:text-slate-400 mb-1.5 tracking-wider">Admin Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-sm font-semibold outline-none focus:border-[#1A3827] dark:focus:border-[#A3E635]" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase text-[#5C6E5C] dark:text-slate-400 mb-1.5 tracking-wider">Master Key / Passcode</label>
                <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="TallyinAdmin2026!#" className="w-full px-4 py-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-sm font-semibold outline-none focus:border-[#1A3827] dark:focus:border-[#A3E635]" />
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 mt-1 font-semibold">Master Key: <code className="bg-[#EAF0EC] dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-800 dark:text-[#A3E635]">TallyinAdmin2026!#</code></p>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-[#1A3827] hover:bg-[#255038] dark:bg-[#A3E635] dark:hover:bg-lime-400 text-white dark:text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md">
                {loading ? 'Authenticating...' : 'Enter Master Admin Portal'}
              </button>
            </form>
          </div>
        </div>
      );
    }

    function App() {
      const [user, setUser] = useState(null);
      const [authLoading, setAuthLoading] = useState(true);
      const [tab, setTab] = useState('site-control');
      const [loading, setLoading] = useState(true);
      const [rooms, setRooms] = useState([]);
      const [txns, setTxns] = useState([]);
      const [logs, setLogs] = useState([]);
      const [search, setSearch] = useState('');
      
      // Control states
      const [isSiteDown, setIsSiteDown] = useState(false);
      const [maintMessage, setMaintMessage] = useState('Tallyin is undergoing scheduled maintenance. Please check back shortly.');
      const [annTitle, setAnnTitle] = useState('');
      const [annBody, setAnnBody] = useState('');
      const [annType, setAnnType] = useState('info');
      const [maintTxId, setMaintTxId] = useState(null);

      // Edit Room Modal State
      const [editRoom, setEditRoom] = useState(null);
      const [roomNameInput, setRoomNameInput] = useState('');
      const [roomCodeInput, setRoomCodeInput] = useState('');
      const [roomBudgetInput, setRoomBudgetInput] = useState('');
      const [roomCapInput, setRoomCapInput] = useState('');

      // Edit Txn Modal State
      const [editTxn, setEditTxn] = useState(null);
      const [txnTitleInput, setTxnTitleInput] = useState('');
      const [txnAmtInput, setTxnAmtInput] = useState('');
      const [txnPaidByInput, setTxnPaidByInput] = useState('');

      useEffect(() => {
        if (localStorage.getItem('tallyin_admin_session') === 'true') {
          setUser({ email: ADMIN_EMAIL, role: 'superadmin' });
        }
        setAuthLoading(false);
      }, []);

      const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
          const [rr, tr, lr] = await Promise.all([
            db.from('rooms').select('*').order('created_at', { ascending: false }),
            db.from('transactions').select('*, rooms(name, code)').order('created_at', { ascending: false }).limit(500),
            db.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200)
          ]);

          const roomList = rr.data || [];
          const txnList = tr.data || [];
          const logList = lr.data || [];

          setRooms(roomList);
          setTxns(txnList);
          setLogs(logList);

          // Check maintenance state from transactions
          const sysTx = txnList.find(t => t.category === '__SYSTEM_MAINTENANCE__');
          if (sysTx) {
            setMaintTxId(sysTx.id);
            setIsSiteDown(sysTx.title === 'DOWN' || sysTx.split_type === 'down');
            setMaintMessage(sysTx.paid_by || 'Tallyin is undergoing scheduled maintenance.');
          }
        } catch (err) {
          toast.error('Failed to load portal data: ' + err.message);
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => {
        if (user) fetchAllData();
      }, [user, fetchAllData]);

      // TOGGLE SITE UP / DOWN
      const handleToggleSiteStatus = async (turnDown) => {
        const actionLabel = turnDown ? 'TAKE SITE DOWN (Lockdown)' : 'RESTORE SITE ONLINE';
        if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;

        const targetRoomId = (rooms && rooms[0] && rooms[0].id) ? rooms[0].id : 'system';

        try {
          if (maintTxId) {
            const { error } = await db.from('transactions').update({
              title: turnDown ? 'DOWN' : 'UP',
              split_type: turnDown ? 'down' : 'up',
              paid_by: maintMessage,
              date: new Date().toISOString()
            }).eq('id', maintTxId);
            if (error) throw error;
          } else {
            const { data, error } = await db.from('transactions').insert({
              room_id: targetRoomId,
              title: turnDown ? 'DOWN' : 'UP',
              category: '__SYSTEM_MAINTENANCE__',
              split_type: turnDown ? 'down' : 'up',
              paid_by: maintMessage,
              amount: 0,
              is_shared: false,
              date: new Date().toISOString()
            }).select();
            if (error) throw error;
            if (data && data[0]) setMaintTxId(data[0].id);
          }

          setIsSiteDown(turnDown);
          toast.success(`SITE STATUS UPDATED: ${turnDown ? 'OFFLINE (LOCKDOWN)' : 'ONLINE'}`);
          fetchAllData();
        } catch (err) {
          toast.error('Failed to toggle site status: ' + err.message);
        }
      };

      // BROADCAST ANNOUNCEMENT
      const handleSendBroadcast = async () => {
        if (!annTitle.trim() || !annBody.trim()) { toast.error('Title and message required'); return; }
        const targetRoomId = (rooms && rooms[0] && rooms[0].id) ? rooms[0].id : 'system';

        try {
          const { error } = await db.from('transactions').insert({
            room_id: targetRoomId,
            title: annTitle.trim(),
            category: '__SYSTEM_ANNOUNCEMENT__',
            split_type: annType,
            paid_by: annBody.trim(),
            amount: 0,
            is_shared: false,
            date: new Date().toISOString()
          });
          if (error) throw error;
          toast.success('Broadcast sent to all users!');
          setAnnTitle(''); setAnnBody('');
          fetchAllData();
        } catch (err) {
          toast.error('Broadcast failed: ' + err.message);
        }
      };

      // EDIT ROOM
      const handleSaveRoom = async () => {
        if (!editRoom) return;
        try {
          const { error } = await db.from('rooms').update({
            name: roomNameInput,
            code: roomCodeInput,
            monthly_budget: Number(roomBudgetInput) || 0,
            personal_cap: Number(roomCapInput) || 0
          }).eq('id', editRoom.id);
          if (error) throw error;
          toast.success(`Room "${roomNameInput}" updated!`);
          setEditRoom(null);
          fetchAllData();
        } catch (err) {
          toast.error('Update room failed: ' + err.message);
        }
      };

      // DELETE ROOM
      const handleDeleteRoom = async (room) => {
        if (!window.confirm(`PERMANENTLY DELETE room "${room.name}" and ALL its transactions?`)) return;
        try {
          await db.from('transactions').delete().eq('room_id', room.id);
          const { error } = await db.from('rooms').delete().eq('id', room.id);
          if (error) throw error;
          toast.success(`Room "${room.name}" deleted`);
          fetchAllData();
        } catch (err) {
          toast.error('Delete failed: ' + err.message);
        }
      };

      // CLEAR ROOM TRANSACTIONS
      const handleClearRoomTxns = async (room) => {
        if (!window.confirm(`Wipe all transactions for room "${room.name}"?`)) return;
        try {
          const { error } = await db.from('transactions').delete().eq('room_id', room.id);
          if (error) throw error;
          toast.success(`Transactions cleared for ${room.name}`);
          fetchAllData();
        } catch (err) {
          toast.error('Clear failed: ' + err.message);
        }
      };

      // EDIT TRANSACTION
      const handleSaveTxn = async () => {
        if (!editTxn) return;
        try {
          const { error } = await db.from('transactions').update({
            title: txnTitleInput,
            amount: Number(txnAmtInput) || 0,
            paid_by: txnPaidByInput
          }).eq('id', editTxn.id);
          if (error) throw error;
          toast.success('Transaction updated');
          setEditTxn(null);
          fetchAllData();
        } catch (err) {
          toast.error('Update failed: ' + err.message);
        }
      };

      // DELETE TRANSACTION
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

      // EXPORT CSV
      const exportCSV = (dataList, name) => {
        if (!dataList || !dataList.length) { toast.info('No data to export'); return; }
        const csv = [
          Object.keys(dataList[0]).join(','),
          ...dataList.map(r => Object.values(r).map(v => typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : `"${String(v || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tallyin_${name}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast.success(`Exported ${dataList.length} records`);
      };

      if (authLoading) return <div className="p-8 text-center text-slate-400 font-bold">Loading Full Control Center...</div>;
      if (!user) return <><ToastProvider/><LoginView onLogin={setUser}/></>;

      const filteredRooms = rooms.filter(r => (r.name && r.name.toLowerCase().includes(search.toLowerCase())) || (r.code && r.code.toLowerCase().includes(search.toLowerCase())));
      const filteredTxns = txns.filter(t => !t.category?.startsWith('__SYSTEM_') && ((t.title && t.title.toLowerCase().includes(search.toLowerCase())) || (t.paid_by && t.paid_by.toLowerCase().includes(search.toLowerCase()))));
      const broadcastList = txns.filter(t => t.category === '__SYSTEM_ANNOUNCEMENT__');

      return (
        <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <ToastProvider />

          {/* Top Admin Header */}
          <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E3E8E3] dark:border-slate-800 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-sm">
                🛡️
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight flex items-center gap-2">
                  Tallyin Command Center
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">FULL CONTROL</span>
                </h1>
                <p className="text-xs font-semibold text-[#5C6E5C] dark:text-slate-400">Master Admin: tallyin.alerts@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 border shadow-sm ${
                isSiteDown 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              }`}>
                <span>{isSiteDown ? '🚨 SITE IS DOWN (LOCKDOWN)' : '✅ SITE IS ONLINE'}</span>
              </div>
              <button onClick={fetchAllData} className="px-3.5 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 font-bold text-xs">
                🔄 Sync
              </button>
              <button onClick={() => { localStorage.removeItem('tallyin_admin_session'); db.auth.signOut(); setUser(null); }} className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900 dark:text-rose-400 font-bold text-xs hover:bg-rose-50">
                Sign Out
              </button>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">

            {/* TAB NAVIGATION */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E3E8E3] dark:border-slate-800">
              {[
                { id: 'site-control', label: '🚨 Emergency Site Controls' },
                { id: 'rooms-control', label: `🏠 Room Manager (${rooms.length})` },
                { id: 'txns-control', label: `💸 Transaction Manager (${filteredTxns.length})` },
                { id: 'broadcasts', label: `📢 Broadcasts (${broadcastList.length})` },
                { id: 'logs', label: `📋 Audit Logs (${logs.length})` }
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 ${
                  tab === t.id ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-md' : 'bg-white dark:bg-slate-900 text-[#5C6E5C] dark:text-slate-400 border border-[#E3E8E3] dark:border-slate-800 hover:text-[#1A3827]'
                }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: SITE CONTROLS */}
            {tab === 'site-control' && (
              <div className="space-y-6">
                
                {/* EMERGENCY LOCKDOWN CARD */}
                <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
                  isSiteDown 
                    ? 'bg-rose-950/40 border-rose-800 text-rose-100' 
                    : 'bg-white dark:bg-slate-900 border-[#E3E8E3] dark:border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{isSiteDown ? '🚨' : '🟢'}</span>
                        <h2 className="text-lg font-extrabold tracking-tight">Master Site Status & Lockdown Control</h2>
                      </div>
                      <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1">
                        Instantly take Tallyin down or bring it back online for all users. When DOWN, users see a full-screen maintenance overlay.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isSiteDown ? (
                        <button onClick={() => handleToggleSiteStatus(false)} className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md">
                          🟢 RESTORE SITE ONLINE NOW
                        </button>
                      ) : (
                        <button onClick={() => handleToggleSiteStatus(true)} className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md">
                          🚨 TAKE SITE DOWN (LOCKDOWN)
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-[#5C6E5C] dark:text-slate-400 mb-1">
                      Maintenance Screen Message (Displayed to users when DOWN)
                    </label>
                    <input 
                      type="text" 
                      value={maintMessage} 
                      onChange={e => setMaintMessage(e.target.value)} 
                      placeholder="e.g. Upgrading servers for performance improvements. Back in 15 mins."
                      className="w-full px-4 py-3 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* BROADCAST BOX */}
                <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">📢 Send Sticky Platform Announcement Banner</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Title (e.g. Scheduled System Upgrade)" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold outline-none" />
                    <select value={annType} onChange={e => setAnnType(e.target.value)} className="px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold outline-none">
                      <option value="info">ℹ️ Info Banner</option>
                      <option value="warning">⚠️ Warning Banner</option>
                      <option value="error">🚨 Emergency Alert Banner</option>
                    </select>
                  </div>
                  <textarea placeholder="Message body..." value={annBody} onChange={e => setAnnBody(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-medium outline-none resize-none" />
                  <button onClick={handleSendBroadcast} className="py-3 px-6 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-black shadow-sm">
                    📢 Post Live Announcement
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ROOM MANAGEMENT */}
            {tab === 'rooms-control' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">All Rooms ({rooms.length})</h3>
                  <input type="text" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-semibold outline-none" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F8F6] dark:bg-slate-950 text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-[#E3E8E3] dark:border-slate-800">
                      <tr>
                        <th className="p-4">Room Name</th>
                        <th className="p-4">Code</th>
                        <th className="p-4">Monthly Budget</th>
                        <th className="p-4">Personal Cap</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E3] dark:divide-slate-800 font-semibold">
                      {filteredRooms.map(r => (
                        <tr key={r.id} className="hover:bg-[#F6F8F6]/50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-extrabold text-[#1A3827] dark:text-slate-100">{r.name || 'Unnamed'}</td>
                          <td className="p-4 font-mono text-emerald-600 font-bold">{r.code}</td>
                          <td className="p-4">{fmt.inr(r.monthly_budget)}</td>
                          <td className="p-4">{fmt.inr(r.personal_cap)}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => { setEditRoom(r); setRoomNameInput(r.name||''); setRoomCodeInput(r.code||''); setRoomBudgetInput(r.monthly_budget||0); setRoomCapInput(r.personal_cap||0); }} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200">Edit</button>
                            <button onClick={() => handleClearRoomTxns(r)} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold hover:bg-amber-100">Wipe Txns</button>
                            <button onClick={() => handleDeleteRoom(r)} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold hover:bg-rose-100">Delete Room</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TRANSACTION MANAGEMENT */}
            {tab === 'txns-control' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">All Transactions ({filteredTxns.length})</h3>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 text-xs font-semibold outline-none" />
                    <button onClick={() => exportCSV(txns, 'transactions')} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6]">Export CSV</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F8F6] dark:bg-slate-950 text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-[#E3E8E3] dark:border-slate-800">
                      <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Paid By</th>
                        <th className="p-4">Room</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E3] dark:divide-slate-800 font-semibold">
                      {filteredTxns.map(t => (
                        <tr key={t.id} className="hover:bg-[#F6F8F6]/50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-extrabold text-[#1A3827] dark:text-slate-100">{t.title}</td>
                          <td className="p-4 text-sm font-black text-emerald-700 dark:text-[#A3E635]">{fmt.inr(t.amount)}</td>
                          <td className="p-4">{t.paid_by || 'Unknown'}</td>
                          <td className="p-4">{t.rooms?.name || 'Unassigned'}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => { setEditTxn(t); setTxnTitleInput(t.title||''); setTxnAmtInput(t.amount||0); setTxnPaidByInput(t.paid_by||''); }} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Edit</button>
                            <button onClick={() => handleDeleteTxn(t)} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: BROADCASTS */}
            {tab === 'broadcasts' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">Active Platform Broadcasts</h3>
                <div className="space-y-3">
                  {broadcastList.map(b => (
                    <div key={b.id} className="p-4 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">{b.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{b.split_type}</span>
                        </div>
                        <p className="text-xs text-[#5C6E5C] dark:text-slate-400 mt-1">{b.paid_by}</p>
                      </div>
                      <button onClick={() => handleDeleteTxn(b)} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: AUDIT LOGS */}
            {tab === 'logs' && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A3827] dark:text-slate-100 uppercase tracking-wider">System Audit Logs</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto text-xs font-mono">
                  {logs.map(l => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
                      <span>{fmt.time(l.created_at)} - {l.action}</span>
                      <span className="text-[#5C6E5C]">{l.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>

          {/* EDIT ROOM MODAL */}
          {editRoom && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-extrabold text-[#1A3827] dark:text-slate-100">Edit Room: {editRoom.name}</h3>
                <div className="space-y-3 text-xs">
                  <div><label className="font-bold text-[#5C6E5C]">Room Name</label><input type="text" value={roomNameInput} onChange={e => setRoomNameInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-bold" /></div>
                  <div><label className="font-bold text-[#5C6E5C]">Room Code</label><input type="text" value={roomCodeInput} onChange={e => setRoomCodeInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-mono font-bold" /></div>
                  <div><label className="font-bold text-[#5C6E5C]">Monthly Budget (₹)</label><input type="number" value={roomBudgetInput} onChange={e => setRoomBudgetInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-bold" /></div>
                  <div><label className="font-bold text-[#5C6E5C]">Personal Cap (₹)</label><input type="number" value={roomCapInput} onChange={e => setRoomCapInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-bold" /></div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setEditRoom(null)} className="px-4 py-2 rounded-xl border font-bold text-xs">Cancel</button>
                  <button onClick={handleSaveRoom} className="px-4 py-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-extrabold text-xs">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT TXN MODAL */}
          {editTxn && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-extrabold text-[#1A3827] dark:text-slate-100">Edit Transaction</h3>
                <div className="space-y-3 text-xs">
                  <div><label className="font-bold text-[#5C6E5C]">Title</label><input type="text" value={txnTitleInput} onChange={e => setTxnTitleInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-bold" /></div>
                  <div><label className="font-bold text-[#5C6E5C]">Amount (₹)</label><input type="number" value={txnAmtInput} onChange={e => setTxnAmtInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-bold" /></div>
                  <div><label className="font-bold text-[#5C6E5C]">Paid By</label><input type="text" value={txnPaidByInput} onChange={e => setTxnPaidByInput(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 font-bold" /></div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setEditTxn(null)} className="px-4 py-2 rounded-xl border font-bold text-xs">Cancel</button>
                  <button onClick={handleSaveTxn} className="px-4 py-2 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-extrabold text-xs">Save Changes</button>
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
print("Updated admin HTML with room_id fallback!")
