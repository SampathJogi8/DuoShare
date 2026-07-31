import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAnonFetch() {
  console.log('Testing unauthenticated fetch of __SYSTEM_MAINTENANCE__...');
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('category', '__SYSTEM_MAINTENANCE__');
  
  if (error) {
    console.log('❌ ANON FETCH ERROR:', error.message);
  } else {
    console.log(`✅ ANON FETCH SUCCESS: Found ${data.length} rows:`, data);
  }
}

testAnonFetch();
