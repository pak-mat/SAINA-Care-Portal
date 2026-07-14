require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeData() {
  const tables = [
    'notifications',
    'chat_messages',
    'student_intake',
    'wellness_checkins',
    'case_notes',
    'friends',
    'friend_requests',
    'kudos',
    'appointments',
    'school_transfers',
    'users'
  ];

  for (const table of tables) {
    console.log(`Deleting from ${table}...`);
    // Delete all rows where id is not null (which is all rows)
    const { error } = await supabase.from(table).delete().not('id', 'is', null);
    if (error) {
      // Some tables might not have 'id', fallback to 'created_at' or something else
      const { error: err2 } = await supabase.from(table).delete().neq('created_at', '1970-01-01');
      if (err2) {
        console.error(`Error deleting ${table}:`, err2.message);
      }
    }
  }

  console.log('Fetching auth users...');
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Error fetching auth users:', userError.message);
  } else {
    for (const u of users) {
      console.log(`Deleting auth user ${u.email}...`);
      await supabase.auth.admin.deleteUser(u.id);
    }
  }
  
  console.log('Database wipe complete!');
}

wipeData();
