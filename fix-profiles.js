const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fix() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: users } = await supabase.auth.admin.listUsers();
  const { data: profiles } = await supabase.from('profiles').select('id');
  const profileIds = new Set(profiles.map(p => p.id));
  
  for (const u of users.users) {
    if (!profileIds.has(u.id)) {
      console.log(`Fixing missing profile for ${u.email}...`);
      const name = u.email.split('@')[0];
      const { error } = await supabase.from('profiles').insert({
        id: u.id,
        name: name,
        is_admin: false
      });
      if (error) console.error("Error inserting profile:", error);
      else console.log("Profile created successfully!");
    }
  }
}
fix();
