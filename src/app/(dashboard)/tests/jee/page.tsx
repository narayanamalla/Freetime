import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import Link from 'next/link'
import JeeStartButton from './jee-start-button'

export const metadata = {
  title: 'JEE Mains Mock — JEE Practice',
  description: 'Start a full-length JEE Mains mock paper with official NTA interface.',
}

const SUBJECT_NAMES = ['Physics', 'Chemistry', 'Mathematics'] as const
const MCQ_NEEDED = 20
const NUM_NEEDED = 10

export default async function JeeMockPage() {
  const supabase = await createClient()

  // Fetch subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('name', [...SUBJECT_NAMES])

  // Fetch chapters for all subjects
  const subjectIds = (subjects ?? []).map(s => s.id)
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, subject_id')
    .in('subject_id', subjectIds)

  // For each subject, count available MCQ and Numerical
  type SubjectAvail = {
    name: string
    mcqCount: number
    numCount: number
    mcqOk: boolean
    numOk: boolean
  }
  const subjectAvail: SubjectAvail[] = []

  for (const name of SUBJECT_NAMES) {
    const subject = (subjects ?? []).find(s => s.name === name)
    if (!subject) {
      subjectAvail.push({ name, mcqCount: 0, numCount: 0, mcqOk: false, numOk: false })
      continue
    }
    const chapterIds = (chapters ?? [])
      .filter(c => c.subject_id === subject.id)
      .map(c => c.id)

    const [{ count: mcqCount }, { count: numCount }] = await Promise.all([
      supabase
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .in('chapter_id', chapterIds)
        .eq('type', 'mcq'),
      supabase
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .in('chapter_id', chapterIds)
        .eq('type', 'numerical'),
    ])

    subjectAvail.push({
      name,
      mcqCount: mcqCount ?? 0,
      numCount: numCount ?? 0,
      mcqOk: (mcqCount ?? 0) >= MCQ_NEEDED,
      numOk: (numCount ?? 0) >= NUM_NEEDED,
    })
  }

  const canStart = subjectAvail.every(s => s.mcqOk && s.numOk)
  const hasWarning = !canStart

  return (
    <div className="space-y-6 animate-in-up max-w-3xl">
      <div>
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Link>
        <h1 className="text-3xl font-extrabold text-gradient mb-1">JEE Mains Mock</h1>
        <p className="text-sm text-muted">Full-length paper with official NTA exam interface. 90 questions, 3 hours.</p>
      </div>

      {/* Warning */}
      {hasWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Some subjects don't have enough questions. Import more questions via the Admin panel before starting.
          </span>
        </div>
      )}

      {/* Paper Structure */}
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h2 className="font-bold text-foreground">Paper Structure</h2>
        <div className="space-y-3">
          {subjectAvail.map(s => (
            <div key={s.name} className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-foreground">{s.name}</span>
                <span className="text-xs text-muted">30 questions • 120 marks</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* MCQ */}
                <div className="flex items-center justify-between bg-surface rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-xs text-muted">Multiple Choice</p>
                    <p className="text-sm font-bold text-foreground">
                      {MCQ_NEEDED} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.mcqOk
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      : <AlertTriangle className="h-4 w-4 text-red-400" />
                    }
                    <span className={`text-xs font-medium ${s.mcqOk ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.mcqCount} avail
                    </span>
                  </div>
                </div>
                {/* Numerical */}
                <div className="flex items-center justify-between bg-surface rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-xs text-muted">Numerical</p>
                    <p className="text-sm font-bold text-foreground">
                      {NUM_NEEDED} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.numOk
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      : <AlertTriangle className="h-4 w-4 text-red-400" />
                    }
                    <span className={`text-xs font-medium ${s.numOk ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.numCount} avail
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marking Scheme */}
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h2 className="font-bold text-foreground">Marking Scheme</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-2">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Multiple Choice (MCQ)</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Correct</span>
                <span className="text-emerald-400 font-bold">+4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Wrong</span>
                <span className="text-red-400 font-bold">−1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Unattempted</span>
                <span className="text-muted font-bold">0</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-2">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Numerical</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Correct</span>
                <span className="text-emerald-400 font-bold">+4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Wrong</span>
                <span className="text-muted font-bold">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Unattempted</span>
                <span className="text-muted font-bold">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Questions', value: '90' },
          { label: 'Duration', value: '3 Hours' },
          { label: 'Max Marks', value: '360' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-extrabold text-gradient">{item.value}</p>
            <p className="text-xs text-muted mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent-cyan" />
        Questions will be randomly picked from the question bank each time. The interface replicates the official NTA exam portal.
      </div>

      {/* Start Button */}
      <JeeStartButton disabled={!canStart} />
    </div>
  )
}
