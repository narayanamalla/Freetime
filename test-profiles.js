const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log(`Total auth users: ${users.users.length}`);
  
  const { data: profiles } = await supabase.from('profiles').select('id');
  console.log(`Total profiles: ${profiles.length}`);
  
  const profileIds = new Set(profiles.map(p => p.id));
  
  for (const u of users.users) {
    if (!profileIds.has(u.id)) {
      console.log(`WARNING: Auth user ${u.email} (${u.id}) is MISSING from profiles table!`);
    }
  }
}
test();
