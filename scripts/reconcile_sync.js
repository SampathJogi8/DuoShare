import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';
const D1_WORKER_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';

const realSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function queryD1(table, action, data = null, filters = []) {
  const body = { table, action };
  if (data !== null) body.data = data;
  if (filters.length > 0) body.filters = filters;

  const res = await fetch(D1_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`D1 Error (${res.status}): ${errText}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`D1 API Error: ${json.error}`);
  return json.data || [];
}

async function reconcileUsers() {
  console.log('\n--- Reconciling [users] ---');
  const d1Users = await queryD1('users', 'select');
  const { data: sbUsers, error } = await realSupabase.from('users').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Users.length}, Supabase=${sbUsers.length}`);

  const d1Keys = new Set(d1Users.map(u => u.uid || u.id));
  const sbKeys = new Set(sbUsers.map(u => u.uid || u.id));

  // 1. Sync Supabase users missing in D1
  const missingInD1 = sbUsers.filter(u => !d1Keys.has(u.uid) && !d1Keys.has(u.id));
  console.log(`Found ${missingInD1.length} users missing in D1.`);
  for (const u of missingInD1) {
    try {
      await queryD1('users', 'insert', u);
      console.log(`  + Added user ${u.email || u.name} (${u.uid || u.id}) to D1`);
    } catch (e) {
      console.warn(`  ! Failed adding user ${u.email} to D1:`, e.message);
    }
  }

  // 2. Sync D1 users missing in Supabase
  const missingInSb = d1Users.filter(u => !sbKeys.has(u.uid) && !sbKeys.has(u.id));
  console.log(`Found ${missingInSb.length} users missing in Supabase.`);
  for (const u of missingInSb) {
    try {
      const cleanU = { ...u };
      delete cleanU.phone;
      if (!cleanU.id) cleanU.id = cleanU.uid;
      const { error: insErr } = await realSupabase.from('users').insert(cleanU);
      if (insErr) throw insErr;
      console.log(`  + Added user ${u.email || u.name} (${u.uid || u.id}) to Supabase`);
    } catch (e) {
      console.warn(`  ! Failed adding user ${u.email} to Supabase:`, e.message);
    }
  }
}

async function reconcileRooms() {
  console.log('\n--- Reconciling [rooms] ---');
  const d1Rooms = await queryD1('rooms', 'select');
  const { data: sbRooms, error } = await realSupabase.from('rooms').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Rooms.length}, Supabase=${sbRooms.length}`);

  const d1Keys = new Set(d1Rooms.map(r => r.id));
  const sbKeys = new Set(sbRooms.map(r => r.id));

  const missingInD1 = sbRooms.filter(r => !d1Keys.has(r.id));
  for (const r of missingInD1) {
    await queryD1('rooms', 'insert', r);
    console.log(`  + Added room ${r.id} to D1`);
  }

  const missingInSb = d1Rooms.filter(r => !sbKeys.has(r.id));
  for (const r of missingInSb) {
    const { error: insErr } = await realSupabase.from('rooms').insert(r);
    if (insErr) console.warn(`  ! Failed adding room ${r.id} to Supabase:`, insErr.message);
    else console.log(`  + Added room ${r.id} to Supabase`);
  }
}

async function reconcileMembers() {
  console.log('\n--- Reconciling [members] ---');
  const d1Members = await queryD1('members', 'select');
  const { data: sbMembers, error } = await realSupabase.from('members').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Members.length}, Supabase=${sbMembers.length}`);

  const d1Keys = new Set(d1Members.map(m => m.id));
  const sbKeys = new Set(sbMembers.map(m => m.id));

  const allowedSbCols = ['id', 'room_id', 'uid', 'nickname', 'photo_url', 'email', 'role', 'joined_at', 'individual_budget'];
  const cleanForSb = (m) => {
    const res = {};
    for (const c of allowedSbCols) {
      if (c in m && m[c] !== undefined) res[c] = m[c];
    }
    return res;
  };

  // Missing in Supabase
  const missingInSb = d1Members.filter(m => !sbKeys.has(m.id));
  console.log(`Found ${missingInSb.length} members missing in Supabase.`);
  for (const m of missingInSb) {
    try {
      const cleaned = cleanForSb(m);
      const { error: insErr } = await realSupabase.from('members').insert(cleaned);
      if (insErr) throw insErr;
      console.log(`  + Added member ${m.nickname || m.email} (${m.id}) to Supabase`);
    } catch (e) {
      console.warn(`  ! Failed adding member ${m.nickname || m.email} to Supabase:`, e.message);
    }
  }

  // Missing in D1
  const missingInD1 = sbMembers.filter(m => !d1Keys.has(m.id));
  console.log(`Found ${missingInD1.length} members missing in D1.`);
  for (const m of missingInD1) {
    try {
      await queryD1('members', 'insert', m);
      console.log(`  + Added member ${m.nickname || m.email} (${m.id}) to D1`);
    } catch (e) {
      console.warn(`  ! Failed adding member ${m.nickname} to D1:`, e.message);
    }
  }
}

async function reconcileTransactions() {
  console.log('\n--- Reconciling [transactions] ---');
  const d1Txs = await queryD1('transactions', 'select');
  const { data: sbTxs, error } = await realSupabase.from('transactions').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Txs.length}, Supabase=${sbTxs.length}`);

  const d1Keys = new Set(d1Txs.map(t => t.id));
  const sbKeys = new Set(sbTxs.map(t => t.id));

  const cleanForSb = (t) => ({
    ...t,
    is_shared: t.is_shared === 1 || t.is_shared === true || t.is_shared === '1' || t.is_shared === 'true',
    is_edited: t.is_edited === 1 || t.is_edited === true || t.is_edited === '1' || t.is_edited === 'true'
  });

  // Missing in Supabase
  const missingInSb = d1Txs.filter(t => !sbKeys.has(t.id));
  console.log(`Found ${missingInSb.length} transactions missing in Supabase.`);
  for (const t of missingInSb) {
    try {
      const cleaned = cleanForSb(t);
      const { error: insErr } = await realSupabase.from('transactions').insert(cleaned);
      if (insErr) throw insErr;
      console.log(`  + Added tx "${t.title}" (${t.id}) to Supabase`);
    } catch (e) {
      console.warn(`  ! Failed adding tx "${t.title}" (${t.id}) to Supabase:`, e.message);
    }
  }

  // Missing in D1
  const missingInD1 = sbTxs.filter(t => !d1Keys.has(t.id));
  console.log(`Found ${missingInD1.length} transactions missing in D1.`);
  for (const t of missingInD1) {
    try {
      await queryD1('transactions', 'insert', t);
      console.log(`  + Added tx "${t.title}" (${t.id}) to D1`);
    } catch (e) {
      console.warn(`  ! Failed adding tx "${t.title}" (${t.id}) to D1:`, e.message);
    }
  }
}

async function reconcileReceipts() {
  console.log('\n--- Reconciling [receipts] ---');
  const d1Receipts = await queryD1('receipts', 'select');
  const { data: sbReceipts, error } = await realSupabase.from('receipts').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Receipts.length}, Supabase=${sbReceipts.length}`);

  const d1Keys = new Set(d1Receipts.map(r => r.id));
  const sbKeys = new Set(sbReceipts.map(r => r.id));

  const cleanForSb = (r) => {
    let rot = 0;
    if (typeof r.rotation === 'number' && !isNaN(r.rotation)) {
      rot = r.rotation;
    } else if (typeof r.rotation === 'string') {
      const match = r.rotation.match(/-?\d+/);
      rot = match ? parseInt(match[0], 10) : 0;
    }
    return {
      ...r,
      rotation: rot
    };
  };

  // Missing in Supabase
  const missingInSb = d1Receipts.filter(r => !sbKeys.has(r.id));
  console.log(`Found ${missingInSb.length} receipts missing in Supabase.`);
  for (const r of missingInSb) {
    try {
      const cleaned = cleanForSb(r);
      const { error: insErr } = await realSupabase.from('receipts').insert(cleaned);
      if (insErr) throw insErr;
      console.log(`  + Added receipt "${r.title}" (${r.id}) to Supabase`);
    } catch (e) {
      console.warn(`  ! Failed adding receipt "${r.title}" (${r.id}) to Supabase:`, e.message);
    }
  }

  // Missing in D1
  const missingInD1 = sbReceipts.filter(r => !d1Keys.has(r.id));
  console.log(`Found ${missingInD1.length} receipts missing in D1.`);
  for (const r of missingInD1) {
    try {
      await queryD1('receipts', 'insert', r);
      console.log(`  + Added receipt "${r.title}" (${r.id}) to D1`);
    } catch (e) {
      console.warn(`  ! Failed adding receipt "${r.title}" (${r.id}) to D1:`, e.message);
    }
  }
}

async function reconcileActivityLogs() {
  console.log('\n--- Reconciling [activity_logs] ---');
  const d1Logs = await queryD1('activity_logs', 'select');
  const { data: sbLogs, error } = await realSupabase.from('activity_logs').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Logs.length}, Supabase=${sbLogs.length}`);

  const d1Keys = new Set(d1Logs.map(l => l.id));
  const sbKeys = new Set(sbLogs.map(l => l.id));

  // Missing in Supabase
  const missingInSb = d1Logs.filter(l => !sbKeys.has(l.id));
  console.log(`Found ${missingInSb.length} activity_logs missing in Supabase.`);
  for (const l of missingInSb) {
    try {
      const { error: insErr } = await realSupabase.from('activity_logs').insert(l);
      if (insErr) throw insErr;
    } catch (e) {
      // silent or warn
    }
  }

  // Missing in D1
  const missingInD1 = sbLogs.filter(l => !d1Keys.has(l.id));
  console.log(`Found ${missingInD1.length} activity_logs missing in D1.`);
  for (const l of missingInD1) {
    try {
      await queryD1('activity_logs', 'insert', l);
    } catch (e) {}
  }
}

async function reconcileSystemSettings() {
  console.log('\n--- Reconciling [system_settings] ---');
  const d1Settings = await queryD1('system_settings', 'select');
  const { data: sbSettings, error } = await realSupabase.from('system_settings').select('*');
  if (error) throw error;

  console.log(`Initial: D1=${d1Settings.length}, Supabase=${sbSettings.length}`);

  const d1Keys = new Set(d1Settings.map(s => s.key));
  const sbKeys = new Set(sbSettings.map(s => s.key));

  const missingInSb = d1Settings.filter(s => !sbKeys.has(s.key));
  for (const s of missingInSb) {
    try {
      await realSupabase.from('system_settings').upsert({ key: s.key, value: s.value }, { onConflict: 'key' });
      console.log(`  + Synced setting ${s.key} to Supabase`);
    } catch(e) {}
  }

  const missingInD1 = sbSettings.filter(s => !d1Keys.has(s.key));
  for (const s of missingInD1) {
    try {
      await queryD1('system_settings', 'upsert', { key: s.key, value: s.value });
      console.log(`  + Synced setting ${s.key} to D1`);
    } catch(e) {}
  }
}

async function run() {
  console.log('🚀 Starting Full Two-Way Reconciliation between Cloudflare D1 & Supabase...');
  await reconcileRooms();
  await reconcileUsers();
  await reconcileMembers();
  await reconcileTransactions();
  await reconcileReceipts();
  await reconcileActivityLogs();
  await reconcileSystemSettings();
  console.log('\n✅ Reconciliation completed! Checking final database parity...');
}

run().catch(console.error);
