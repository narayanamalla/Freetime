import { createAdminClient } from '@/lib/supabase/server'
import { ImportQuestion } from './types'
import { generateHash } from './dedupe'

export async function insertQuestions(questions: ImportQuestion[]) {
  const supabase = createAdminClient()

  let insertedCount = 0
  let skippedCount = 0
  let errorCount = 0
  const errors: string[] = []

  // We need to resolve subject/chapter names to IDs.
  // We'll cache them in memory for this batch.
  const subjectMap = new Map<string, string>()
  const chapterMap = new Map<string, string>() // Key: "Subject|Chapter"

  const getSubjectId = async (name: string) => {
    const key = name.toLowerCase()
    if (subjectMap.has(key)) return subjectMap.get(key)
    
    // Lookup
    let { data, error } = await supabase.from('subjects').select('id').ilike('name', name).single()
    if (error || !data) {
      // Create if missing
      const res = await supabase.from('subjects').insert({ name }).select('id').single()
      if (res.error) {
        console.error(`[Insert] Failed to create subject "${name}":`, res.error.message)
        return null
      }
      data = res.data
    }
    if (data) {
      subjectMap.set(key, data.id)
      return data.id
    }
    return null
  }

  const getChapterId = async (subjectId: string, subjectName: string, chapterName: string) => {
    const key = `${subjectName.toLowerCase()}|${chapterName.toLowerCase()}`
    if (chapterMap.has(key)) return chapterMap.get(key)

    let { data, error } = await supabase.from('chapters').select('id').eq('subject_id', subjectId).ilike('name', chapterName).single()
    if (error || !data) {
      const res = await supabase.from('chapters').insert({ subject_id: subjectId, name: chapterName }).select('id').single()
      if (res.error) {
        console.error(`[Insert] Failed to create chapter "${chapterName}":`, res.error.message)
        return null
      }
      data = res.data
    }
    if (data) {
      chapterMap.set(key, data.id)
      return data.id
    }
    return null
  }

  console.log(`[Insert] Starting insertion of ${questions.length} questions...`)

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx]

    // Regenerate hash if missing (can happen when data is serialized between client/server)
    if (!q.hash) {
      q.hash = await generateHash(q)
    }

    // Check if duplicate exists
    const { data: existing } = await supabase.from('questions').select('id').eq('hash', q.hash).maybeSingle()
    if (existing) {
      skippedCount++
      continue
    }

    const subjectId = await getSubjectId(q.subject)
    if (!subjectId) {
      errors.push(`Row ${idx + 1}: Could not resolve subject "${q.subject}"`)
      errorCount++
      continue
    }

    const chapterId = await getChapterId(subjectId, q.subject, q.chapter)
    if (!chapterId) {
      errors.push(`Row ${idx + 1}: Could not resolve chapter "${q.chapter}"`)
      errorCount++
      continue
    }

    // Insert Question
    const questionData: any = {
      chapter_id: chapterId,
      type: q.type,
      statement: q.statement,
      difficulty: q.difficulty,
      hint: q.hint || null,
      solution: q.solution || null,
      tags: q.tags || [],
      source: q.source || null,
      hash: q.hash,
      correct_answer: q.correct_answer || null
    }

    const { data: newQuestion, error: qError } = await supabase.from('questions').insert(questionData).select('id').single()
    
    if (qError || !newQuestion) {
      const msg = qError?.message || 'Unknown error'
      console.error(`[Insert] Question ${idx + 1} error:`, msg)
      errors.push(`Row ${idx + 1}: ${msg}`)
      errorCount++
      continue
    }

    // Insert Options if MCQ
    if (q.type === 'mcq' && q.options && q.options.length > 0) {
      const optionsToInsert = q.options.map(opt => ({
        question_id: newQuestion.id,
        text: opt.text,
        is_correct: opt.is_correct
      }))

      const { error: optError } = await supabase.from('question_options').insert(optionsToInsert)
      if (optError) {
        console.error(`[Insert] Options for question ${idx + 1} error:`, optError.message)
        errors.push(`Row ${idx + 1} options: ${optError.message}`)
        errorCount++
        continue
      }

      // Update question's correct_answer with option ID for consistency
      const { data: correctOpt } = await supabase.from('question_options').select('id').eq('question_id', newQuestion.id).eq('is_correct', true).maybeSingle()
      if (correctOpt) {
        await supabase.from('questions').update({ correct_answer: correctOpt.id }).eq('id', newQuestion.id)
      }
    }

    insertedCount++

    // Log progress every 50 questions
    if ((idx + 1) % 50 === 0) {
      console.log(`[Insert] Progress: ${idx + 1}/${questions.length} processed (${insertedCount} inserted, ${errorCount} errors)`)
    }
  }

  console.log(`[Insert] Complete: ${insertedCount} inserted, ${skippedCount} skipped, ${errorCount} errors`)
  if (errors.length > 0) {
    console.log(`[Insert] First 5 errors:`, errors.slice(0, 5))
  }

  return { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
}

