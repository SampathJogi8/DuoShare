import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function initSettings() {
  console.log('Upserting platform_settings table...');
  const { data, error } = await supabase.from('platform_settings').upsert([
    { key: 'site_status', value: 'online', updated_at: new Date().toISOString() },
    { key: 'maintenance_message', value: 'Tallyin is undergoing scheduled maintenance. Please check back shortly.', updated_at: new Date().toISOString() }
  ]);
  if (error) console.log('Error:', error.message);
  else console.log('Successfully set initial platform settings!');
}

initSettings();
