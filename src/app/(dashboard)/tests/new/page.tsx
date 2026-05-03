import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CustomTestForm from './custom-test-form'

export const metadata = {
  title: 'New Custom Test — JEE Practice',
  description: 'Configure your custom test with subjects, chapters, difficulty and question count.',
}

export default async function NewTestPage() {
  const supabase = await createClient()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name')

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, name, subject_id')
    .order('name')

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex items-center gap-3">
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-gradient mb-1">Custom Test</h1>
        <p className="text-sm text-muted">Select subjects, chapters, difficulty and duration to start your test.</p>
      </div>

      <CustomTestForm
        subjects={subjects ?? []}
        chapters={chapters ?? []}
      />
    </div>
  )
}
