'use client'

import Latex from '@/components/ui/latex'
import type { SessionQuestion } from './test-client'

function formatTime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const PALETTE_STYLE: Record<string, string> = {
  not_visited:    'bg-surface-2 border-border text-muted-2',
  not_answered:   'bg-red-500/20 border-red-500/40 text-red-400',
  answered:       'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  marked:         'bg-violet-500/20 border-violet-500/40 text-violet-400',
  answered_marked:'bg-violet-500/20 border-violet-500/40 text-violet-400',
}

const DIFF_COLOR: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  hard: 'text-red-400 bg-red-400/10 border-red-400/20',
}

type SharedProps = {
  session: any
  sq: SessionQuestion[]
  currentIdx: number
  currentSq: SessionQuestion
  currentQ: SessionQuestion['questions']
  localAnswer: string
  timeLeft: number
  questionTimer: number
  showSubmitModal: boolean
  isSubmitting: boolean
  stats: { answered: number; notAnswered: number; marked: number; notVisited: number; answeredMarked: number }
  onNavigate: (idx: number) => void
  onAnswerChange: (a: string) => void
  onClear: () => void
  onMarkToggle: () => void
  onShowSubmit: () => void
  onHideSubmit: () => void
  onSubmit: () => void
}

export default function CustomInterface({
  session, sq, currentIdx, currentSq, currentQ, localAnswer, timeLeft,
  showSubmitModal, isSubmitting, stats,
  onNavigate, onAnswerChange, onClear, onMarkToggle, onShowSubmit, onHideSubmit, onSubmit,
}: SharedProps) {
  const isMcq = currentQ.type === 'mcq'
  const isMarked = currentSq.is_marked_for_review
  const timeCritical = timeLeft < 300
  const total = sq.length
  const progress = ((currentIdx + 1) / total) * 100
  const subjectName = currentQ.chapters.subjects.name
  const chapterName = currentQ.chapters.name

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-foreground">Q{currentIdx + 1} / {total}</span>
          <div className="w-40 h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={`font-mono font-bold text-sm px-3 py-1 rounded-lg border ${
          timeCritical
            ? 'text-red-400 bg-red-400/10 border-red-400/30 animate-pulse'
            : 'text-foreground bg-surface-2 border-border'
        }`}>
          ⏱ {formatTime(timeLeft)}
        </div>
        <button
          onClick={onShowSubmit}
          className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-95"
        >
          Submit Test
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* QUESTION AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Meta badges */}
          <div className="flex items-center gap-2 px-6 pt-5 pb-3 flex-shrink-0">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan">
              {subjectName}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-surface-2 text-muted">
              {chapterName}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${DIFF_COLOR[currentQ.difficulty] ?? 'text-muted bg-surface-2 border-border'}`}>
              {currentQ.difficulty}
            </span>
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${isMcq ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'}`}>
              {isMcq ? 'MCQ' : 'Numerical'}
            </span>
          </div>

          {/* Statement */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="rounded-2xl border border-border bg-surface p-6 mb-5 text-[15px] leading-relaxed text-foreground">
              <Latex>{currentQ.statement}</Latex>
            </div>

            {/* Options / Input */}
            {isMcq ? (
              <div className="space-y-3">
                {currentSq.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i)
                  const selected = localAnswer === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onAnswerChange(opt.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-accent-cyan/10 border-accent-cyan/50 ring-1 ring-accent-cyan/30'
                          : 'bg-surface-2 border-border hover:border-border-strong'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border transition-all ${
                        selected
                          ? 'bg-accent-cyan border-accent-cyan text-black'
                          : 'border-border-strong text-muted-2'
                      }`}>
                        {letter}
                      </div>
                      <span className="text-sm text-foreground leading-relaxed pt-0.5">
                        <Latex>{opt.text}</Latex>
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted mb-2">Enter your answer:</p>
                <input
                  type="number"
                  value={localAnswer}
                  onChange={e => onAnswerChange(e.target.value)}
                  placeholder="Numerical answer…"
                  className="w-56 bg-surface-2 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30"
                />
              </div>
            )}
          </div>

          {/* Bottom Nav Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkToggle}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  isMarked
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                    : 'bg-surface-2 border-border text-muted hover:border-border-strong'
                }`}
              >
                {isMarked ? '★ Marked' : '☆ Mark'}
              </button>
              <button
                onClick={onClear}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-border bg-surface-2 text-muted hover:text-foreground transition-all"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border bg-surface-2 text-muted hover:text-foreground transition-all disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => onNavigate(currentIdx + 1)}
                disabled={currentIdx === total - 1}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-primary text-black hover:opacity-90 transition-all disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PALETTE */}
        <div className="w-52 flex flex-col border-l border-border bg-surface flex-shrink-0 overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {sq.map((s, i) => {
                const isActive = i === currentIdx
                return (
                  <button
                    key={s.id}
                    onClick={() => onNavigate(i)}
                    className={`w-8 h-8 rounded-full text-[11px] font-bold border transition-all ${PALETTE_STYLE[s.visit_status] ?? PALETTE_STYLE.not_visited}`}
                    style={{
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isActive ? '0 0 0 2px var(--color-accent-cyan)' : 'none',
                    }}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 space-y-1.5 border-t border-border mt-auto">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Legend</p>
            {[
              { label: 'Answered', count: stats.answered, cls: 'text-emerald-400' },
              { label: 'Not Answered', count: stats.notAnswered, cls: 'text-red-400' },
              { label: 'Marked', count: stats.marked, cls: 'text-violet-400' },
              { label: 'Not Visited', count: stats.notVisited, cls: 'text-muted-2' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-2">{item.label}</span>
                <span className={`font-bold ${item.cls}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground">Submit Test?</h3>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 divide-y divide-border text-sm">
              {[
                ['Answered', stats.answered, 'text-emerald-400'],
                ['Not Answered', stats.notAnswered, 'text-red-400'],
                ['Marked', stats.marked, 'text-violet-400'],
                ['Not Visited', stats.notVisited, 'text-muted'],
              ].map(([label, count, cls]) => (
                <div key={label as string} className="flex justify-between px-4 py-2.5">
                  <span className="text-muted">{label}</span>
                  <span className={`font-bold ${cls}`}>{count}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted">This action cannot be undone. All unattempted questions will score 0.</p>

            <div className="flex gap-2">
              <button
                onClick={onHideSubmit}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
