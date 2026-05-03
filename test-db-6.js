const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users.users[0]?.id;
  const { data: questions } = await supabase.from('questions').select('id').limit(2);
  
  const attempt1 = { user_id: userId, question_id: questions[0].id, answer: 't1', is_correct: false, time_taken: 0 };
  const attempt2 = { user_id: userId, question_id: questions[1].id, answer: 't2', is_correct: false, time_taken: 0 };
  
  const res1 = await supabase.from('attempts').insert(attempt1);
  console.log("Insert 1:", res1.error);
  
  const res2 = await supabase.from('attempts').insert(attempt2);
  console.log("Insert 2:", res2.error);
  
  await supabase.from('attempts').delete().eq('user_id', userId);
}
test();
