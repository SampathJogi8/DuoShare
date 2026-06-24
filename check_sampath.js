import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('members').select('*').eq('email', 'sampathjogipusala123@gmail.com');
  console.log('Members:', data);
  const { data: rooms } = await supabase.from('rooms').select('*').eq('created_by', 'd0b4cb3b-e0bd-44df-b876-f284e542dc0f');
  console.log('Rooms created:', rooms);
}
test();
