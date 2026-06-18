import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const res = await supabase.auth.signUp({ email: 'test_auth_123@example.com', password: 'Password123!' });
  console.log('Auth check:', res.data, res.error);
}
run();
