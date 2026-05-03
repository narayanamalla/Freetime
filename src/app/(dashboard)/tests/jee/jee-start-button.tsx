'use client'

import { useTransition } from 'react'
import { createJeeSession } from '../actions'
import { Loader2, Zap } from 'lucide-react'
import { useState } from 'react'

export default function JeeStartButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStart() {
    setError(null)
    startTransition(async () => {
      const result = await createJeeSession()
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
        disabled={disabled || isPending}
        className="w-full py-4 rounded-2xl font-bold text-base bg-amber-400 hover:bg-amber-300 text-black transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_32px_-8px_rgba(251,191,36,0.5)]"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Paper…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Start JEE Mains Mock
          </>
        )}
      </button>
    </div>
  )
}
