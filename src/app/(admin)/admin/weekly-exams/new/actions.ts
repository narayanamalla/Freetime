'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createWeeklyExam(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const question_ids_raw = formData.get('question_ids') as string
  const is_published = formData.get('is_published') === 'on'

  let question_ids: string[] = []
  try {
    question_ids = JSON.parse(question_ids_raw)
  } catch {
    return { error: 'Invalid question selection' }
  }

  const { error } = await supabase.from('weekly_exams').insert({
    title,
    description: description || null,
    starts_at: new Date(starts_at).toISOString(),
    ends_at: new Date(ends_at).toISOString(),
    duration_minutes,
    question_ids,
    is_published,
    created_by: user.id,
  })

  if (error) return { error: error.message }

  redirect('/admin/weekly-exams')
}
