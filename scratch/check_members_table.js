import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: members, error: mErr } = await supabase.from('members').select('*').limit(20);
  console.log('Members table sample:', members, mErr);

  const { data: users, error: uErr } = await supabase.from('users').select('*').limit(20);
  console.log('Users table sample:', users, uErr);
}
test();
