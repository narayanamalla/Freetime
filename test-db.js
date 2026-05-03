const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log("Checking attempts table schema...");
  // Try inserting a dummy row
  const { data, error } = await supabase.from('attempts').insert({
    user_id: '00000000-0000-0000-0000-000000000000', // invalid uuid, will fail FK if it has one
    question_id: '00000000-0000-0000-0000-000000000000',
    answer: 'test',
    is_correct: false,
    time_taken: 0
  });
  console.log("Insert result:", { data, error });
}
test();
