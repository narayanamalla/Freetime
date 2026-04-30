'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitAttempt(questionId: string, answer: string, timeTaken: number) {
  const supabase = await createClient()

  const [
    { data: authUser },
    { data: question, error: qError }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('questions').select('correct_answer, type').eq('id', questionId).single()
  ])

  if (!authUser.user) return { error: 'Not authenticated' }
  if (qError || !question) return { error: 'Question not found' }

  let isCorrect = false

  if (question.type === 'mcq') {
    // For MCQ: the answer is the option UUID. Check is_correct on that option directly.
    const { data: allOptions } = await supabase
      .from('question_options')
      .select('id, text, is_correct')
      .eq('question_id', questionId)
    
    console.log(`[Submit] Question ${questionId} options:`, allOptions?.map(o => ({ text: o.text?.substring(0, 30), is_correct: o.is_correct })))
    console.log(`[Submit] User selected option ID: ${answer}`)
    
    const selectedOption = allOptions?.find(o => o.id === answer)
    isCorrect = selectedOption?.is_correct === true
  } else {
    // For numerical: compare the text values
    isCorrect = (question.correct_answer || '').trim() === answer.trim()
  }

  const { error: insertError } = await supabase
    .from('attempts')
    .insert({
      user_id: authUser.user.id,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
      time_taken: timeTaken
    })

  if (insertError) {
    return { error: 'Failed to record attempt' }
  }

  revalidatePath(`/questions/${questionId}`)
  revalidatePath(`/chapters/[chapterId]`, 'page')
  revalidatePath(`/dashboard`)

  return { success: true, isCorrect }
}

