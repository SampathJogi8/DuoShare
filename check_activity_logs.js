import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert([{
      room_id: 'test_room',
      user_id: null,
      user_name: 'test',
      action: 'test',
      details: 'test details'
    }]);
  
  console.log('Insert Error:', error);
  
  const { data: fetch, error: fetchErr } = await supabase.from('activity_logs').select('*').limit(1);
  console.log('Fetch Error:', fetchErr);
  console.log('Fetch Data:', fetch);
}
test();
