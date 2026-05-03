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

const STATUS_STYLES: Record<string, string> = {
  not_visited: 'bg-[#f5f5f5] text-[#555] border-[#ccc]',
  not_answered: 'bg-[#e53e3e] text-white border-[#e53e3e]',
  answered: 'bg-[#38a169] text-white border-[#38a169]',
  marked: 'bg-[#805ad5] text-white border-[#805ad5]',
  answered_marked: 'bg-[#805ad5] text-white border-[#805ad5]',
}

type SharedProps = {
  session: any
  sq: SessionQuestion[]
  currentIdx: number
  currentSq: SessionQuestion
  currentQ: SessionQuestion['questions']
  localAnswer: string
  timeLeft: number
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

// Group sq by subject name
function groupBySubject(sq: SessionQuestion[]) {
  const groups: Record<string, { name: string; items: { sq: SessionQuestion; globalIdx: number }[] }> = {}
  sq.forEach((s, i) => {
    const name = s.questions.chapters.subjects.name
    if (!groups[name]) groups[name] = { name, items: [] }
    groups[name].items.push({ sq: s, globalIdx: i })
  })
  return Object.values(groups)
}

export default function JeeInterface({
  session, sq, currentIdx, currentSq, currentQ, localAnswer, timeLeft,
  showSubmitModal, isSubmitting, stats,
  onNavigate, onAnswerChange, onClear, onMarkToggle, onShowSubmit, onHideSubmit, onSubmit,
}: SharedProps) {
  const subjects = groupBySubject(sq)
  const activeSubjectName = currentSq.questions.chapters.subjects.name
  const isMarked = currentSq.is_marked_for_review
  const isMcq = currentQ.type === 'mcq'
  const timeCritical = timeLeft < 300
  const qNum = currentIdx + 1

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#f0f0f0', fontFamily: 'Arial, sans-serif' }}>
      {/* TOP HEADER */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: '#1a1a2e', color: '#fff' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm" style={{ background: '#f97316', color: '#fff' }}>J</div>
          <div>
            <div className="text-sm font-bold">JEE (Main) – 2024 | Paper 1 (B.E./B.Tech)</div>
            <div className="text-xs" style={{ color: '#aaa' }}>Mock Test • {sq.length} Questions</div>
          </div>
        </div>
        <div className={`font-mono font-bold text-lg px-3 py-1 rounded ${timeCritical ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* SUBJECT TABS */}
      <div className="flex flex-shrink-0 border-b border-gray-300" style={{ background: '#e8e8e8' }}>
        {subjects.map(sub => (
          <button
            key={sub.name}
            onClick={() => onNavigate(sub.items[0].globalIdx)}
            className="px-5 py-2.5 text-sm font-medium transition-all border-b-2"
            style={{
              background: sub.name === activeSubjectName ? '#fff' : 'transparent',
              borderBottomColor: sub.name === activeSubjectName ? '#2563eb' : 'transparent',
              color: sub.name === activeSubjectName ? '#2563eb' : '#444',
            }}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Meta Bar */}
          <div className="px-5 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
            <span className="font-bold text-sm text-gray-700">Question No. {qNum}</span>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded ${isMcq ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {isMcq ? 'Single Correct' : 'Numerical'}
              </span>
              <span className="text-xs text-gray-500">+4 {isMcq ? '/ −1' : '/ 0'}</span>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 overflow-y-auto bg-white p-6">
            <div className="text-sm leading-relaxed text-gray-800 mb-6">
              <Latex>{currentQ.statement}</Latex>
            </div>

            {isMcq ? (
              <div className="space-y-3">
                {currentSq.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i)
                  const selected = localAnswer === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onAnswerChange(opt.id)}
                      className="w-full flex items-center gap-3 p-3 rounded border-2 transition-all text-left"
                      style={{
                        borderColor: selected ? '#2563eb' : '#d1d5db',
                        background: selected ? '#eff6ff' : '#fff',
                        boxShadow: selected ? '0 0 0 2px #bfdbfe' : 'none',
                      }}
                    >
                      <div className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                        style={{ borderColor: selected ? '#2563eb' : '#9ca3af', background: selected ? '#2563eb' : '#fff' }}>
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-sm mr-1 text-gray-600">{letter}.</span>
                      <span className="text-sm text-gray-800"><Latex>{opt.text}</Latex></span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Enter your numerical answer:</p>
                <input
                  type="number"
                  value={localAnswer}
                  onChange={e => onAnswerChange(e.target.value)}
                  placeholder="Type answer…"
                  className="w-48 px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="px-4 py-3 border-t border-gray-300 flex items-center justify-between flex-shrink-0" style={{ background: '#e8e8e8' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onMarkToggle(); onNavigate(Math.min(currentIdx + 1, sq.length - 1)) }}
                className="px-4 py-2 text-xs font-semibold rounded border transition-all"
                style={{ background: isMarked ? '#805ad5' : '#fff', color: isMarked ? '#fff' : '#555', borderColor: isMarked ? '#805ad5' : '#ccc' }}
              >
                Mark for Review &amp; Next
              </button>
              <button
                onClick={onClear}
                className="px-4 py-2 text-xs font-semibold rounded border bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Clear Response
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-4 py-2 text-xs font-semibold rounded border bg-white text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => onNavigate(currentIdx + 1)}
                disabled={currentIdx === sq.length - 1}
                className="px-4 py-2 text-xs font-semibold rounded border text-white"
                style={{ background: '#2563eb', borderColor: '#2563eb' }}
              >
                Save &amp; Next
              </button>
              <button
                onClick={onShowSubmit}
                className="px-4 py-2 text-xs font-semibold rounded border text-white"
                style={{ background: '#38a169', borderColor: '#38a169' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PALETTE */}
        <div className="w-60 flex flex-col border-l border-gray-300 bg-white flex-shrink-0 overflow-y-auto">
          <div className="px-4 py-3 font-bold text-sm text-white" style={{ background: '#374151' }}>
            Candidate Panel
          </div>

          {/* Legend */}
          <div className="px-3 py-3 border-b border-gray-200 space-y-1.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Legend</p>
            {[
              { label: 'Not Visited', count: stats.notVisited, cls: STATUS_STYLES.not_visited },
              { label: 'Not Answered', count: stats.notAnswered, cls: STATUS_STYLES.not_answered },
              { label: 'Answered', count: stats.answered, cls: STATUS_STYLES.answered },
              { label: 'Marked for Review', count: stats.marked, cls: STATUS_STYLES.marked },
              { label: 'Answered & Marked', count: stats.answeredMarked, cls: STATUS_STYLES.answered_marked },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${item.cls}`}>
                  {item.count}
                </div>
                <span className="text-[11px] text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Per-subject grids */}
          {subjects.map(sub => (
            <div key={sub.name} className="px-3 py-3 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 mb-2">{sub.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {sub.items.map(({ sq: s, globalIdx }) => {
                  const isActive = globalIdx === currentIdx
                  return (
                    <button
                      key={s.id}
                      onClick={() => onNavigate(globalIdx)}
                      className={`w-8 h-8 rounded-full border text-[11px] font-bold transition-all ${STATUS_STYLES[s.visit_status] ?? STATUS_STYLES.not_visited}`}
                      style={{
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isActive ? '0 0 0 2px #1a1a2e' : 'none',
                      }}
                    >
                      {globalIdx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800">Confirm Submission</h3>
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {[
                  ['Answered', stats.answered, '#38a169'],
                  ['Not Answered', stats.notAnswered, '#e53e3e'],
                  ['Marked for Review', stats.marked, '#805ad5'],
                  ['Not Visited', stats.notVisited, '#888'],
                ].map(([label, count, color]) => (
                  <tr key={label as string} className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">{label}</td>
                    <td className="py-1.5 text-right font-bold" style={{ color: color as string }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500">Are you sure you want to submit the paper?</p>
            <div className="flex gap-2">
              <button onClick={onHideSubmit} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#38a169' }}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Paper'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
