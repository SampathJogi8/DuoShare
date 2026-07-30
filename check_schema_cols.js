import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('receipts').select('*').limit(1);
  console.log('Receipt error:', error);
  console.log('Receipt columns:', data ? Object.keys(data[0] || {}) : null);
  console.log('Receipt record:', data ? data[0] : null);
}
test();
