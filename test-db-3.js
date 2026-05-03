const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.rpc('get_schema');
  // if rpc doesn't exist, we can use raw query if we have postgres connection string.
  // We don't have postgres connection string.
  
  // Let's try to trigger a 409 manually. What if id is duplicated?
  // attempts table schema:
}
test();
