require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreate() {
  const usersToCreate = [
    { email: 'adam@demo.com', password: 'password', raw_user_meta_data: { name: 'Adam Demo', role: 'student' } },
    { email: 'nor@demo.com', password: 'password', raw_user_meta_data: { name: 'Cik Nor', role: 'counselor' } }
  ];
  for (const u of usersToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: u.raw_user_meta_data
    });
    if (error) {
      console.error('Error creating user:', error.message);
    } else {
      console.log('Created user:', data.user.email);
      // Ensure they exist in public.users
      const { error: insertErr } = await supabase.from('users').upsert({
        id: data.user.id,
        email: u.email,
        name: u.raw_user_meta_data.name,
        role: u.raw_user_meta_data.role,
        status: 'Available'
      });
      if (insertErr) console.error('Error inserting into public.users:', insertErr.message);
    }
  }
}

recreate();
