import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mphuwixprztbzrxndqsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestData() {
  const { data: txs } = await supabase
    .from('transactions')
    .select('id, title, amount, created_at, date')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('Top 3 Recent Transactions:', txs);

  const { data: receipts } = await supabase
    .from('receipts')
    .select('id, title, amount, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('Top 3 Recent Receipts:', receipts);
}

checkLatestData().catch(console.error);
