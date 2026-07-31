import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanupDuplicates() {
  console.log('Cleaning up duplicate __SYSTEM_MAINTENANCE__ rows...');
  const { error } = await supabase.from('transactions').delete().eq('category', '__SYSTEM_MAINTENANCE__');
  if (error) console.log('Error deleting:', error.message);
  else console.log('Successfully cleared old maintenance rows!');
}

cleanupDuplicates();
