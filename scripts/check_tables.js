import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tables = ['rooms', 'room_members', 'transactions', 'announcements', 'activity_logs', 'bills', 'platform_settings'];

async function checkTables() {
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) console.log(`Table ${t}: ❌ ${error.message}`);
    else console.log(`Table ${t}: ✅ Available (${data.length} rows sample)`);
  }
}

checkTables();
