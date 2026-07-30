import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const SUPABASE_SERVICE_ROLE_KEY = env.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

console.log("Has service role key:", !!SUPABASE_SERVICE_ROLE_KEY);
