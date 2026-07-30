import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testWithRealRoom() {
  // Get an existing room_id from rooms table
  const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
  if (!rooms || !rooms[0]) {
    console.log('No rooms found');
    return;
  }
  const realRoomId = rooms[0].id;
  console.log('Using real room_id:', realRoomId);

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      room_id: realRoomId,
      title: 'Test Bill - WiFi',
      amount: 999,
      category: '__BILL__',
      date: '2026-08-01',
      time: '30',
      paid_by: 'Test User',
      paid_by_uid: 'test_uid',
      is_shared: true,
      split_type: 'test_uid',
      split: 'Utilities|pending',
      splits: [{ category: 'Utilities', assignee: 'test_uid' }],
      created_by: 'test_uid'
    })
    .select('*');

  console.log('Insert Result:', { data, error });

  if (data && data[0]) {
    console.log('SUCCESSFULLY INSERTED BILL ID:', data[0].id);
    await supabase.from('transactions').delete().eq('id', data[0].id);
    console.log('Cleaned up test row.');
  }
}

testWithRealRoom();
