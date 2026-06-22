import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mphuwixprztbzrxndqsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const testPayload = {
    room_id: 'TL-7729-XM',
    user_id: 'd0b4cb3b-e0bd-44df-b876-f284e542dc0f',
    user_name: 'Sampath Jogi Pusala',
    action: 'test',
    details: 'Diagnostic test log insertion'
  };

  console.log('Testing insert into activity_logs...');
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(testPayload)
    .select();

  if (error) {
    console.error('Error inserting into activity_logs:', error);
  } else {
    console.log('Success! Inserted row:', data);
  }
}

run();
