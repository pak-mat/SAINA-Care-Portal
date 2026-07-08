const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDemoUsers() {
  console.log('Creating demo student...');
  const { data: student, error: studentError } = await supabase.auth.admin.createUser({
    email: 'adam@demo.com',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      name: 'Adam Shah',
      studentId: 'ST-001',
      role: 'student'
    }
  });

  if (studentError) {
    if (studentError.message.includes('already registered')) {
        console.log('Student already exists.');
    } else {
        console.error('Error creating student:', studentError);
    }
  } else {
    console.log('Student created:', student.user.id);
  }

  console.log('Creating demo counselor...');
  const { data: counselor, error: counselorError } = await supabase.auth.admin.createUser({
    email: 'nor@demo.com',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      name: 'Cik Nor',
      role: 'counselor'
    }
  });

  if (counselorError) {
    if (counselorError.message.includes('already registered')) {
        console.log('Counselor already exists.');
    } else {
        console.error('Error creating counselor:', counselorError);
    }
  } else {
    console.log('Counselor created:', counselor.user.id);
  }
  
  console.log('Done!');
}

createDemoUsers();
