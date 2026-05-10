'use client'

import { useTransition, useState } from 'react'
import { createWeeklyExamSession } from '../../actions'
import { Loader2, Calendar } from 'lucide-react'

export default function WeeklyStartButton({ examId }: { examId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStart() {
    setError(null)

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Could not enter fullscreen:', err)
      })
    }

    startTransition(async () => {
      const result = await createWeeklyExamSession(examId)
      if (result?.error) {
        setError(result.error)
      }
    })
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
