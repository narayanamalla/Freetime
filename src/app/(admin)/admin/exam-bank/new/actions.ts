'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createExamQuestion(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Unauthorized' }

  const chapterId = formData.get('chapterId') as string
  const type = formData.get('type') as string
  const difficulty = formData.get('difficulty') as string
  const statement = formData.get('statement') as string
  const solution = formData.get('solution') as string
  const hint = formData.get('hint') as string
  const image_url = formData.get('image_url') as string | null

  const questionData: any = {
    chapter_id: chapterId,
    type,
    difficulty,
    statement,
    solution: solution || null,
    hint: hint || null,
    image_url: image_url || null,
    visibility: 'exam',   // ← key difference: always 'exam'
  }

  if (type === 'numerical') {
    questionData.correct_answer = formData.get('correct_answer') as string
  } else {
    questionData.correct_answer = null
  }

  const { data: question, error: qError } = await supabase
    .from('questions')
    .insert(questionData)
    .select('id')
    .single()

  if (qError || !question) {
    return { error: 'Failed to create question: ' + qError?.message }
  }

  if (type === 'mcq') {
    const options = []
    const correctIndex = parseInt(formData.get('correctOptionIndex') as string)

    for (let i = 0; i < 4; i++) {
      const optText = formData.get(`option_${i}`) as string
      if (optText) {
        options.push({
          question_id: question.id,
          text: optText,
          is_correct: i === correctIndex,
        })
      }
    }

    if (options.length > 0) {
      const { error: optError } = await supabase.from('question_options').insert(options)
      if (optError) {
        return { error: 'Question created but failed to save options: ' + optError.message }
      }

      const { data: savedOptions } = await supabase
        .from('question_options')
        .select('id')
        .eq('question_id', question.id)
        .eq('is_correct', true)
        .single()

      if (savedOptions) {
        await supabase
          .from('questions')
          .update({ correct_answer: savedOptions.id })
          .eq('id', question.id)
      }
    }
  }

  revalidatePath('/admin/exam-bank')
  redirect('/admin/exam-bank')
}
