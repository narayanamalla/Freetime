import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SubjectsPage() {
  const supabase = await createClient()

  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')

  const { data: allQuestions } = await supabase
    .from('questions')
    .select('id, chapters(subject_id)')

  const subjectCounts: Record<string, number> = {}
  allQuestions?.forEach(q => {
    // @ts-ignore
    const sid = q.chapters?.subject_id
    if (sid) subjectCounts[sid] = (subjectCounts[sid] || 0) + 1
  })

  if (error) {
    return <div className="text-red-400">Error loading subjects: {error.message}</div>
  }

  const subjectMeta: Record<string, { icon: string; accentColor: string }> = {
    'Physics':     { icon: '⚡', accentColor: 'text-accent-cyan' },
    'Chemistry':   { icon: '🧪', accentColor: 'text-amber-400' },
    'Mathematics': { icon: '📐', accentColor: 'text-emerald-400' },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-[-0.03em]">
          <span className="text-gradient">Subjects</span>
        </h1>
        <p className="text-sm text-muted mt-2">Select a subject to start practicing.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects?.map((subject) => {
          const meta = subjectMeta[subject.name] || { icon: '📚', accentColor: 'text-accent-cyan' }
          const count = subjectCounts[subject.id] || 0

          return (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <div className="rounded-2xl border border-border bg-surface hover:bg-surface-2 hover:border-border-strong p-6 h-full group transition-all duration-300 relative overflow-hidden">
                {/* Top gradient line on hover */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between">
                  <div className="size-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {meta.icon}
                  </div>
                  <svg className={`w-5 h-5 text-muted-2 group-hover:${meta.accentColor} transition-colors group-hover:translate-x-1 duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-foreground mt-5">{subject.name}</h3>
                <p className="text-sm text-muted mt-1">{count} Questions available</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-surface-2 rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-gradient-primary rounded-full w-0 group-hover:w-[5%] transition-all duration-700" />
                  </div>
                  <span className={`text-[11px] ${meta.accentColor} font-medium`}>Start →</span>
                </div>
              </div>
            </Link>
          )
        })}
        {subjects?.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="size-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-muted font-medium">No subjects found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
