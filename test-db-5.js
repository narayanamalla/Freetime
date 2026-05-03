const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Use postgrest RPC to query postgres if possible, but we don't have rpc.
  // We can query pg_catalog using rest endpoint if it's exposed? No.
  
  // Let's insert and purposely NOT delete, then list.
  const supabase = createClient(url, key);
  
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users.users[0]?.id;
  const { data: question } = await supabase.from('questions').select('id').limit(1).single();
  const questionId = question?.id;
  
  const attempt = {
    user_id: userId,
    question_id: questionId,
    answer: 'test',
    is_correct: false,
    time_taken: 0
  };
  
  console.log("Inserting...");
  const res1 = await supabase.from('attempts').insert(attempt).select();
  console.log("Insert result:", res1.data, res1.error);
}
test();
