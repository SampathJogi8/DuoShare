import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const email = `test_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (authError) {
    console.error('Signup error:', authError);
    return;
  }
  
  const uid = authData.user.id;
  console.log('Signed up:', uid);
  
  const { error: insertErr } = await supabase.from('users').insert({ uid, room_id: null });
  console.log('Insert users error:', insertErr);
  
  const { error: delErr } = await supabase.from('users').delete().eq('uid', uid);
  console.log('Delete users error:', delErr);
}
test();
