import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mphuwixprztbzrxndqsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Attempting to query table info via RPC or pg_catalog...');
  // PostgREST sometimes exposes schemas, let's try direct SQL RPC if exists,
  // otherwise let's try to fetch a row from activity_logs and inspect its structure.
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Existed logs structure:', data);
  }
}

run();
