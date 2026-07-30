import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mphuwixprztbzrxndqsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestData() {
  console.log('Fetching latest transactions...');
  const { data: txs, error: txErr } = await supabase
    .from('transactions')
    .select('*')
    .order('id', { ascending: false })
    .limit(5);

  if (txErr) console.error('TX Error:', txErr);
  else console.log('Latest Transactions:', JSON.stringify(txs, null, 2));

  console.log('\nFetching latest receipts...');
  const { data: receipts, error: recErr } = await supabase
    .from('receipts')
    .select('*')
    .order('id', { ascending: false })
    .limit(5);

  if (recErr) console.error('Receipt Error:', recErr);
  else console.log('Latest Receipts:', JSON.stringify(receipts, null, 2));
}

checkLatestData().catch(console.error);
