const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users.users[0]?.id;
  console.log("User ID from Auth:", userId);
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId);
  console.log("Profile from DB:", profile);
}
test();
