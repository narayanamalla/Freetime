'use client'

import { useTransition, useState } from 'react'
import { createWeeklyExamSession } from '@/app/(dashboard)/tests/actions'
import { Loader2, Calendar } from 'lucide-react'

export default function ExamStartButton({
  examId,
  compact = false,
}: {
  examId: string
  compact?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStart() {
    setError(null)
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
    startTransition(async () => {
      const result = await createWeeklyExamSession(examId)
      if (result?.error) setError(result.error)
    })
  }

  if (compact) {
    return (
      <div>
        {error && <p className="text-xs text-red-400 mb-1">{error}</p>}
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="text-sm font-extrabold uppercase tracking-wide text-emerald-600 hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {isPending ? 'Starting…' : 'Start Exam'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleStart}
        disabled={isPending}
        className="w-full py-4 rounded-2xl font-bold text-base bg-violet-500 hover:bg-violet-400 text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_32px_-8px_rgba(139,92,246,0.5)]"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Starting Exam…
          </>
        ) : (
          <>
            <Calendar className="h-5 w-5" />
            Start Exam
          </>
        )}
      </button>
    </div>
  )
}
