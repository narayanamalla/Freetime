'use client'

import { useState, useEffect } from 'react'
import { submitAttempt } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'

type QuestionViewProps = {
  question: any
  options: any[]
  previousAttempt: any | null
}

export default function QuestionView({ question, options, previousAttempt }: QuestionViewProps) {
  const [selectedOption, setSelectedOption] = useState<string>(previousAttempt?.answer || '')
  const [numericalAnswer, setNumericalAnswer] = useState<string>(previousAttempt?.answer || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; isCorrect?: boolean; error?: string } | null>(null)
  const [timeTaken, setTimeTaken] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(true)

  const isSolved = previousAttempt?.is_correct || result?.isCorrect
  const showSolution = isSolved || previousAttempt || result

  useEffect(() => {
    if (isSolved || previousAttempt) return
    const timer = setInterval(() => setTimeTaken(p => p + 1), 1000)
    return () => clearInterval(timer)
  }, [isSolved, previousAttempt])

  const handleSubmit = async () => {
    const answer = question.type === 'mcq' ? selectedOption : numericalAnswer
    if (!answer) return
    setIsSubmitting(true)
    const res = await submitAttempt(question.id, answer, timeTaken)
    setResult(res)
    setIsSubmitting(false)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const diffMap: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in-up">
      {/* Left: Question */}
      <div className="flex-1 space-y-5">
        <div className="premium-card p-7" style={{ cursor: 'default' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {question.chapters?.name || 'Practice Question'}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {question.chapters?.subjects?.name && (
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {question.chapters.subjects.name}
                  </span>
                )}
                {question.chapters?.name && (
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {question.chapters.name}
                  </span>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${diffMap[question.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {question.difficulty}
            </span>
          </div>

          <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
            {question.statement}
          </div>

          {question.hint && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                {showHint ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && (
                <div className="mt-3 text-sm text-indigo-700 bg-indigo-50 rounded-xl p-4">
                  {question.hint}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanation */}
        {showSolution && (
          <div className="premium-card overflow-hidden" style={{ cursor: 'default' }}>
            <button onClick={() => setShowExplanation(!showExplanation)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
              <span className="font-bold text-gray-900">Explanation</span>
              {showExplanation ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {showExplanation && (
              <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">
                {question.solution || "No detailed solution provided for this question."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Answer Panel */}
      <div className="lg:w-[380px] shrink-0">
        <div className="premium-card p-6 sticky top-[90px]" style={{ cursor: 'default' }}>
          {/* Timer */}
          {!isSolved && !previousAttempt && (
            <div className="flex items-center justify-end gap-2 mb-5">
              <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-mono font-bold text-gray-600">Time: {formatTime(timeTaken)}</span>
              </div>
            </div>
          )}

          <h3 className="font-bold text-gray-900 mb-4">Your Answer</h3>

          {question.type === 'mcq' ? (
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} disabled={!!previousAttempt || !!result}>
              <div className="space-y-2.5">
                {options.map((opt, idx) => {
                  const isSelected = selectedOption === opt.id
                  const showCorrectness = !!result || !!previousAttempt

                  let border = 'border-gray-150 hover:border-indigo-200 hover:bg-indigo-50/30'
                  if (isSelected && !showCorrectness) border = 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100'
                  if (showCorrectness && opt.is_correct) border = 'border-emerald-400 bg-emerald-50'
                  if (showCorrectness && isSelected && !opt.is_correct) border = 'border-red-300 bg-red-50'

                  return (
                    <div key={opt.id} className={`flex items-center gap-3 p-3.5 border rounded-2xl transition-all cursor-pointer ${border}`}>
                      <RadioGroupItem value={opt.id} id={opt.id} className="shrink-0" />
                      <Label htmlFor={opt.id} className="flex-1 cursor-pointer text-sm text-gray-700 font-medium">{opt.text}</Label>
                      {showCorrectness && opt.is_correct && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                      {showCorrectness && isSelected && !opt.is_correct && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          ) : (
            <Input
              type="text"
              placeholder="Enter numerical value"
              value={numericalAnswer}
              onChange={(e) => setNumericalAnswer(e.target.value)}
              disabled={!!previousAttempt || !!result}
              className="h-12 rounded-xl text-base"
            />
          )}

          {!previousAttempt && !result && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (question.type === 'mcq' ? !selectedOption : !numericalAnswer)}
              className="w-full mt-5 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}

          {(result || previousAttempt) && (
            <div className={`mt-5 p-4 rounded-2xl flex items-center gap-3 ${
              (result?.isCorrect ?? previousAttempt?.is_correct)
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {(result?.isCorrect ?? previousAttempt?.is_correct)
                ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                : <XCircle className="h-5 w-5 text-red-500" />
              }
              <div>
                <p className={`text-sm font-bold ${
                  (result?.isCorrect ?? previousAttempt?.is_correct) ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {(result?.isCorrect ?? previousAttempt?.is_correct) ? 'Correct Answer!' : 'Incorrect Answer'}
                </p>
                <p className={`text-[11px] mt-0.5 ${
                  (result?.isCorrect ?? previousAttempt?.is_correct) ? 'text-emerald-500' : 'text-red-400'
                }`}>
                  {(result?.isCorrect ?? previousAttempt?.is_correct) ? 'Great job!' : 'Review the solution below.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
