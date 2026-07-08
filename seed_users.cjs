const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wgwpetvuugupzgychijt.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function reset() {
  console.log('Resetting adam@demo.com...');
  const { data: adamList } = await supabase.auth.admin.listUsers();
  
  const adam = adamList.users.find(u => u.email === 'adam@demo.com');
  if (adam) {
    const { error } = await supabase.auth.admin.updateUserById(adam.id, { password: 'demo1234', email_confirm: true });
    if (error) console.error('Error updating adam:', error.message);
    else console.log('Successfully updated adam password');
  }

  const nor = adamList.users.find(u => u.email === 'nor@demo.com');
  if (nor) {
    const { error } = await supabase.auth.admin.updateUserById(nor.id, { password: 'demo1234', email_confirm: true });
    if (error) console.error('Error updating nor:', error.message);
    else console.log('Successfully updated nor password');
  }
}

reset().catch(console.error);
