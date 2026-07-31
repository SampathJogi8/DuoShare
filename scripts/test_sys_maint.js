import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testToggle() {
  const { data: roomData } = await supabase.from('rooms').select('*').limit(1);
  const roomId = roomData[0] ? roomData[0].id : 'DUO-KLIZ-2508';

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);

  console.log('Attempting insert with all NOT NULL columns...');
  const { data, error } = await supabase.from('transactions').insert({
    room_id: roomId,
    title: 'DOWN',
    category: '__SYSTEM_MAINTENANCE__',
    split_type: 'down',
    paid_by: 'Site is under maintenance',
    paid_by_uid: 'system',
    created_by: 'system',
    amount: 0,
    is_shared: false,
    date: dateStr,
    time: timeStr
  }).select();

  if (error) {
    console.log('❌ INSERT ERROR:', error.message);
  } else {
    console.log('✅ SUCCESS! Inserted row ID:', data[0].id);
  }
}

testToggle();
