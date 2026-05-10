'use client'

import { useState, useTransition } from 'react'
import { createWeeklyExam } from './actions'
import { Search, X, CheckSquare, Square } from 'lucide-react'

type Question = {
  id: string
  statement: string
  type: string
  difficulty: string
  chapters: {
    name: string
    subjects: { name: string }
  } | null
}

type GroupedQuestions = Record<string, Record<string, Question[]>>

const inputCls =
  'w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-2 focus:border-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-glow/30 transition text-sm'
const textareaCls = `${inputCls} resize-none`

const diffColor: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  hard: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

export function WeeklyExamForm({ questions }: { questions: Question[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Group by subject → chapter
  const grouped: GroupedQuestions = {}
  for (const q of questions) {
    const subjectName = q.chapters?.subjects?.name ?? 'Unknown Subject'
    const chapterName = q.chapters?.name ?? 'Unknown Chapter'
    if (!grouped[subjectName]) grouped[subjectName] = {}
    if (!grouped[subjectName][chapterName]) grouped[subjectName][chapterName] = []
    grouped[subjectName][chapterName].push(q)
  }

  const filteredSearch = search.trim().toLowerCase()

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('question_ids', JSON.stringify(Array.from(selectedIds)))
    startTransition(async () => {
      const result = await createWeeklyExam(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-[-0.03em]">New Weekly Exam</h1>
        <p className="text-sm text-muted mt-1">Fill in the details and pick questions for this exam.</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Basic details */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-bold text-foreground">Exam Details</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title <span className="text-red-400">*</span></label>
              <input name="title" required placeholder="e.g. Weekly Exam — Week 12" className={inputCls} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description <span className="text-muted-2 font-normal">(optional)</span></label>
              <textarea name="description" rows={3} placeholder="Brief description for students…" className={textareaCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Starts At <span className="text-red-400">*</span></label>
                <input name="starts_at" type="datetime-local" required className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ends At <span className="text-red-400">*</span></label>
                <input name="ends_at" type="datetime-local" required className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Duration (minutes) <span className="text-red-400">*</span></label>
                <input name="duration_minutes" type="number" defaultValue={180} min={5} required className={inputCls} />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <input
                  name="is_published"
                  id="is_published"
                  type="checkbox"
                  className="size-4 rounded border-border accent-violet-500 cursor-pointer"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-foreground cursor-pointer">
                  Publish immediately (visible to students)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Question picker */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 border-b border-border px-6 py-4 bg-surface flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-foreground">Questions</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                selectedIds.size > 0
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                  : 'bg-surface-2 text-muted border-border'
              }`}>
                {selectedIds.size} selected
              </span>
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:border-accent-glow/60 focus:ring-1 focus:ring-accent-glow/30 transition"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {Object.entries(grouped).map(([subject, chapters]) => {
              const subjectQs = Object.values(chapters).flat()
              const anyMatch = filteredSearch
                ? subjectQs.some((q) => q.statement.toLowerCase().includes(filteredSearch))
                : true
              if (!anyMatch) return null

              return (
                <div key={subject}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-2/70 mb-2 px-1">{subject}</h3>
                  <div className="space-y-3">
                    {Object.entries(chapters).map(([chapter, qs]) => {
                      const visible = filteredSearch
                        ? qs.filter((q) => q.statement.toLowerCase().includes(filteredSearch))
                        : qs
                      if (visible.length === 0) return null

                      return (
                        <div key={chapter} className="rounded-xl border border-border bg-surface-2 overflow-hidden">
                          <div className="px-4 py-2 border-b border-border bg-surface-2">
                            <span className="text-xs font-semibold text-foreground">{chapter}</span>
                          </div>
                          <div className="divide-y divide-border">
                            {visible.map((q) => {
                              const isSelected = selectedIds.has(q.id)
                              return (
                                <button
                                  key={q.id}
                                  type="button"
                                  onClick={() => toggle(q.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                    isSelected ? 'bg-violet-500/8' : 'hover:bg-surface'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 ${isSelected ? 'text-violet-400' : 'text-muted-2'}`}>
                                    {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                  </span>
                                  <span className="flex-1 text-sm text-foreground line-clamp-1 text-left">
                                    {q.statement.slice(0, 80)}{q.statement.length > 80 ? '…' : ''}
                                  </span>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      q.type === 'mcq'
                                        ? 'bg-accent-electric/10 text-accent-electric border border-accent-electric/20'
                                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    }`}>
                                      {q.type === 'mcq' ? 'MCQ' : 'Num'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${diffColor[q.difficulty] ?? 'bg-surface text-muted border border-border'}`}>
                                      {q.difficulty}
                                    </span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hidden field for question_ids */}
        <input type="hidden" name="question_ids" value={JSON.stringify(Array.from(selectedIds))} readOnly />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending || selectedIds.size === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-[0_8px_24px_-6px_rgba(37,99,235,0.55)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating…' : `Create Exam (${selectedIds.size} questions)`}
          </button>
          <a href="/admin/weekly-exams" className="text-sm text-muted hover:text-foreground transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
