'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateQuestion(questionId: string, formData: FormData) {
  const supabase = await createClient()

  const chapterId = formData.get('chapterId') as string
  const type = formData.get('type') as string
  const difficulty = formData.get('difficulty') as string
  const statement = formData.get('statement') as string
  const solution = formData.get('solution') as string
  const hint = formData.get('hint') as string
  
  // Update question
  const questionData: any = {
    chapter_id: chapterId,
    type,
    difficulty,
    statement,
    solution: solution || null,
    hint: hint || null,
  }

  if (type === 'numerical') {
    questionData.correct_answer = formData.get('correct_answer') as string
  } else {
    questionData.correct_answer = null 
  }

  const { error: qError } = await supabase
    .from('questions')
    .update(questionData)
    .eq('id', questionId)

  if (qError) {
    throw new Error('Failed to update question: ' + qError.message)
  }

  if (type === 'mcq') {
    const options = []
    const correctIndex = parseInt(formData.get('correctOptionIndex') as string)
    
    for (let i = 0; i < 4; i++) {
      const optText = formData.get(`option_${i}`) as string
      if (optText) {
        options.push({
          question_id: questionId,
          text: optText,
          is_correct: i === correctIndex
        })
      }
    }

    if (options.length > 0) {
      // Delete existing options
      await supabase.from('question_options').delete().eq('question_id', questionId)
      
      // Insert new options
      const { error: optError } = await supabase.from('question_options').insert(options)
      if (optError) {
        throw new Error('Question updated but failed to save options: ' + optError.message)
      }
      
      // Update correct_answer on question for easier matching
      const { data: savedOptions } = await supabase.from('question_options').select('id').eq('question_id', questionId).eq('is_correct', true).single()
      if (savedOptions) {
        await supabase.from('questions').update({ correct_answer: savedOptions.id }).eq('id', questionId)
      }
    }
  } else {
    // If we changed to numerical from MCQ, clean up old options
    await supabase.from('question_options').delete().eq('question_id', questionId)
  }

  revalidatePath('/admin')
  revalidatePath(`/questions/${questionId}`)
  redirect('/admin')
}
