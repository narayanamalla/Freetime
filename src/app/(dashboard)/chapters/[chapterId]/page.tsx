import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle2, XCircle, Circle } from 'lucide-react'
import Latex from '@/components/ui/latex'

export default async function ChapterQuestionsPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const supabase = await createClient()

  const [
    { data: chapter, error: chapterError },
    { data: questions, error: questionsError },
    { data: authUser }
  ] = await Promise.all([
    supabase.from('chapters').select('*, subjects(id, name)').eq('id', chapterId).single(),
    supabase.from('questions').select('id, type, statement, difficulty').eq('chapter_id', chapterId),
    supabase.auth.getUser()
  ])

  if (chapterError || questionsError) {
    return <div>Error loading data.</div>
  }

  let attempts: any[] = []
  if (authUser.user) {
    const { data } = await supabase
      .from('attempts')
      .select('question_id, is_correct')
      .eq('user_id', authUser.user.id)
      .in('question_id', questions?.map(q => q.id) || [])
    attempts = data || []
  }

  const getStatus = (qId: string) => {
    const a = attempts.find(a => a.question_id === qId)
    if (!a) return 'unsolved'
    return a.is_correct ? 'solved' : 'attempted'
  }

  const diffColor: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/subjects" className="text-gray-400 hover:text-indigo-600 font-medium transition-colors">Subjects</Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {/* @ts-ignore */}
        <Link href={`/subjects/${chapter?.subjects?.id}`} className="text-gray-400 hover:text-indigo-600 font-medium transition-colors">
          {/* @ts-ignore */}
          {chapter?.subjects?.name}
        </Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-bold text-gray-900">{chapter?.name}</span>
      </div>

      {/* Question List */}
      <div className="premium-card overflow-hidden" style={{ cursor: 'default' }}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">{chapter?.name}</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">{questions?.length || 0} Questions available</p>
        </div>

        <div className="divide-y divide-gray-50">
          {questions?.map((q, idx) => {
            const status = getStatus(q.id)

            return (
              <Link key={q.id} href={`/questions/${q.id}`} className="block">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition-colors group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {status === 'solved' && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />}
                    {status === 'attempted' && <XCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />}
                    {status === 'unsolved' && <Circle className="h-4.5 w-4.5 text-gray-300 shrink-0" />}

                    <span className="text-sm text-gray-400 font-mono shrink-0 w-7 font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm text-gray-700 truncate font-medium">
                      <Latex>{q.statement.substring(0, 120)}</Latex>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${diffColor[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                      {q.difficulty}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {questions?.length === 0 && (
          <div className="py-16 text-center">
            <div className="icon-3d p-4 text-white w-fit mx-auto mb-4">
              <span className="text-xl">📝</span>
            </div>
            <p className="text-gray-400 font-medium">No questions in this chapter yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
