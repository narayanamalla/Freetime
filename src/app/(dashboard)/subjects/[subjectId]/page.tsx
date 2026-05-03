import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ChaptersPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params
  const supabase = await createClient()

  const [
    { data: subject, error: subjectError },
    { data: chapters, error: chaptersError },
  ] = await Promise.all([
    supabase.from('subjects').select('*').eq('id', subjectId).single(),
    supabase.from('chapters').select('*').eq('subject_id', subjectId).order('name'),
  ])

  if (subjectError || chaptersError) {
    return <div>Error loading data.</div>
  }

  const chapterIds = chapters?.map(c => c.id) || []
  const { data: questions } = await supabase
    .from('questions')
    .select('id, chapter_id')
    .in('chapter_id', chapterIds.length > 0 ? chapterIds : ['none'])

  const { data: userAttempts } = await supabase
    .from('attempts')
    .select('question_id, is_correct')

  const solvedQuestionIds = new Set(
    userAttempts?.filter(a => a.is_correct).map(a => a.question_id) || []
  )

  const chapterStats: Record<string, { total: number; solved: number }> = {}
  chapterIds.forEach(id => { chapterStats[id] = { total: 0, solved: 0 } })

  questions?.forEach(q => {
    if (chapterStats[q.chapter_id]) {
      chapterStats[q.chapter_id].total += 1
      if (solvedQuestionIds.has(q.id)) {
        chapterStats[q.chapter_id].solved += 1
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/subjects" className="text-white/50 hover:text-cyan-400 font-medium transition-colors">
          Subjects
        </Link>
        <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-bold text-white">{subject?.name}</span>
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {chapters?.map((chapter, idx) => {
          const stats = chapterStats[chapter.id] || { total: 0, solved: 0 }
          const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0

          return (
            <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
              <div className="premium-card p-5 h-full group bg-black/40 border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-[15px] text-white leading-tight">{chapter.name}</h3>
                  <svg className="w-4 h-4 text-white/30 group-hover:text-cyan-400 shrink-0 mt-0.5 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-white/50 font-medium">{stats.total} Questions</p>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-white/40 font-medium">{stats.solved} / {stats.total} Solved</p>
                    {pct > 0 && (
                      <span className="text-[11px] font-bold text-cyan-400">{pct}%</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
        {chapters?.length === 0 && (
          <div className="col-span-full py-16 text-center premium-card p-8 bg-black/40 border-white/5" style={{ cursor: 'default' }}>
            <p className="text-white/40 font-medium">No chapters found for this subject.</p>
          </div>
        )}
      </div>
    </div>
  )
}
