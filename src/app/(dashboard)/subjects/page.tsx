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
    return <div>Error loading subjects: {error.message}</div>
  }

  const subjectMeta: Record<string, { icon: string; iconClass: string; gradient: string }> = {
    'Physics': {
      icon: '⚡',
      iconClass: 'icon-3d-blue',
      gradient: 'from-blue-500/10 to-indigo-500/10',
    },
    'Chemistry': {
      icon: '🧪',
      iconClass: 'icon-3d-orange',
      gradient: 'from-orange-500/10 to-amber-500/10',
    },
    'Mathematics': {
      icon: '📐',
      iconClass: 'icon-3d-green',
      gradient: 'from-emerald-500/10 to-green-500/10',
    },
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Subjects</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">Select a subject to start practicing.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects?.map((subject) => {
          const meta = subjectMeta[subject.name] || { icon: '📚', iconClass: 'icon-3d', gradient: 'from-indigo-500/10 to-purple-500/10' }
          const count = subjectCounts[subject.id] || 0

          return (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <div className="premium-card p-6 h-full group">
                <div className="flex items-start justify-between">
                  <div className={`${meta.iconClass} p-3 text-2xl flex items-center justify-center`}>
                    <span className="text-lg">{meta.icon}</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mt-5">{subject.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{count} Questions available</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full w-0 group-hover:w-[5%] transition-all duration-700" />
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Start →</span>
                </div>
              </div>
            </Link>
          )
        })}
        {subjects?.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="icon-3d p-4 text-white w-fit mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-gray-400 font-medium">No subjects found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
