import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const tables = ['transactions', 'receipts', 'activity_logs', 'users'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`${table} columns:`, data ? Object.keys(data[0] || {}) : null);
    console.log(`${table} sample:`, data ? data[0] : null);
    console.log(`${table} error:`, error);
  }
}
test();
