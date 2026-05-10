'use server'

import { createClient } from '@/lib/supabase/server'
import { generateHash } from '@/lib/import/dedupe'
import { ImportQuestion, ValidationResult, PreviewData } from '@/lib/import/types'
import { validateQuestion } from '@/lib/import/validate'
import { insertQuestions } from '@/lib/import/insert'
import { revalidatePath } from 'next/cache'

export async function processImportData(normalizedQuestions: ImportQuestion[]): Promise<PreviewData> {
  const validQuestions: ValidationResult[] = []
  const invalidQuestions: ValidationResult[] = []
  const duplicateHashes: string[] = []
  
  const supabase = await createClient()

  for (const q of normalizedQuestions) {
    const validation = validateQuestion(q)
    if (validation.valid) {
      // Generate hash
      const hash = await generateHash(q)
      validation.question.hash = hash

      // Check DB for duplicate
      const { data } = await supabase.from('questions').select('id').eq('hash', hash).single()
      if (data) {
        duplicateHashes.push(hash)
      } else {
        validQuestions.push(validation)
      }
    } else {
      invalidQuestions.push(validation)
    }
  }

  return {
    validQuestions,
    invalidQuestions,
    duplicateHashes
  }
}

export async function commitImport(questions: ImportQuestion[]) {
  const result = await insertQuestions(questions)
  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard')
  revalidatePath('/subjects')
  return result
}
