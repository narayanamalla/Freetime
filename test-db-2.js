const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log("Fetching a valid user and question...");
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users.users[0]?.id;
  
  const { data: question } = await supabase.from('questions').select('id').limit(1).single();
  const questionId = question?.id;
  
  console.log({ userId, questionId });
  
  if (userId && questionId) {
    console.log("Trying double insert...");
    const attempt = {
      user_id: userId,
      question_id: questionId,
      answer: 'test',
      is_correct: false,
      time_taken: 0
    };
    
    const res1 = await supabase.from('attempts').insert(attempt);
    console.log("Insert 1:", res1.error ? res1.error : 'Success');
    
    const res2 = await supabase.from('attempts').insert(attempt);
    console.log("Insert 2:", res2.error ? res2.error : 'Success');
    
    // cleanup
    await supabase.from('attempts').delete().eq('user_id', userId).eq('question_id', questionId);
  }
}
test();
