import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const tables = ['transactions', 'receipts', 'members', 'rooms', 'activity_logs'];

tables.forEach(table => {
  supabase.channel(`test-${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        console.log(`REALTIME EVENT RECEIVED FOR ${table}:`, payload.eventType, payload.new?.id || payload.new?.room_id || payload.new?.name);
      }
    )
    .subscribe((status) => {
      console.log(`Subscription status for ${table}:`, status);
    });
});

setTimeout(async () => {
  console.log('\n--- Performing test operations to trigger events ---');
  
  console.log('Inserting a transaction...');
  const { data: tx } = await supabase.from('transactions').insert([{
    room_id: 'realtime_test_room',
    title: 'Realtime Test Tx',
    amount: 123.45,
    category: 'Groceries',
    paid_by: 'Test User',
    date: '2026-06-27',
    split_type: 'equal',
    split_details: {},
    is_shared: true
  }]).select();

  console.log('Inserting a receipt...');
  const { data: rc } = await supabase.from('receipts').insert([{
    room_id: 'realtime_test_room',
    title: 'Realtime Test Receipt',
    amount: 123.45,
    category: 'Groceries',
    date: '27 Jun'
  }]).select();

  console.log('Inserting an activity log...');
  const { data: log } = await supabase.from('activity_logs').insert([{
    room_id: 'realtime_test_room',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    user_name: 'test',
    action: 'test',
    details: 'realtime test from multi-table script'
  }]).select();

  setTimeout(async () => {
    // Clean up
    console.log('\n--- Cleaning up test records ---');
    if (tx && tx[0]) {
      await supabase.from('transactions').delete().eq('id', tx[0].id);
    }
    if (rc && rc[0]) {
      await supabase.from('receipts').delete().eq('id', rc[0].id);
    }
    if (log && log[0]) {
      await supabase.from('activity_logs').delete().eq('id', log[0].id);
    }
    setTimeout(() => {
      console.log('Realtime test complete.');
      process.exit(0);
    }, 2000);
  }, 2000);
}, 3000);
