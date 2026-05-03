'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { saveAnswer, submitTest } from '../actions'
import JeeInterface from './jee-interface'
import CustomInterface from './custom-interface'

export type SessionQuestion = {
  id: string
  question_id: string
  order_index: number
  answer_given: string | null
  is_marked_for_review: boolean
  visit_status: string
  time_taken: number
  questions: {
    id: string
    type: 'mcq' | 'numerical'
    statement: string
    difficulty: string
    correct_answer: string | null
    hint: string | null
    solution: string | null
    chapters: { id: string; name: string; subjects: { id: string; name: string } }
  }
  options: { id: string; question_id: string; text: string; is_correct: boolean }[]
}

type Props = {
  session: any
  sessionQuestions: SessionQuestion[]
}

export default function TestClient({ session, sessionQuestions: initial }: Props) {
  const router = useRouter()
  const isJee = session.mode === 'jee_mains'

  const [sq, setSq] = useState<SessionQuestion[]>(initial)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(session.time_limit_minutes * 60)
  const [questionTimer, setQuestionTimer] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, startTransition] = useTransition()

  const questionTimerRef = useRef(0)
  const autoSubmitted = useRef(false)

  const currentSq = sq[currentIdx]
  const currentQ = currentSq?.questions

  // Derive current answer state from sq
  const [localAnswer, setLocalAnswer] = useState<string>(currentSq?.answer_given ?? '')

  // Sync localAnswer when navigating
  useEffect(() => {
    setLocalAnswer(sq[currentIdx]?.answer_given ?? '')
  }, [currentIdx, sq])

  // Global countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1 && !autoSubmitted.current) {
          autoSubmitted.current = true
          clearInterval(interval)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Per-question timer
  useEffect(() => {
    questionTimerRef.current = 0
    setQuestionTimer(0)
    const interval = setInterval(() => {
      questionTimerRef.current += 1
      setQuestionTimer(questionTimerRef.current)
    }, 1000)
    return () => clearInterval(interval)
  }, [currentIdx])

  const computeVisitStatus = (answer: string, isMarked: boolean) => {
    const has = answer.trim() !== ''
    if (has && isMarked) return 'answered_marked'
    if (has) return 'answered'
    if (isMarked) return 'marked'
    return 'not_answered'
  }

  const navigateTo = useCallback(async (idx: number) => {
    if (idx === currentIdx || idx < 0 || idx >= sq.length) return

    const cur = sq[currentIdx]
    const answer = localAnswer
    const isMarked = cur.is_marked_for_review
    const visitStatus = computeVisitStatus(answer, isMarked)
    const timeTaken = cur.time_taken + questionTimerRef.current

    // Optimistic update
    setSq(prev => prev.map((q, i) =>
      i === currentIdx
        ? { ...q, answer_given: answer || null, visit_status: visitStatus, time_taken: timeTaken }
        : q
    ))

    // Mark next question as not_answered if not_visited
    setSq(prev => prev.map((q, i) =>
      i === idx && q.visit_status === 'not_visited'
        ? { ...q, visit_status: 'not_answered' }
        : q
    ))

    setCurrentIdx(idx)

    // Persist
    startTransition(async () => {
      await saveAnswer({
        sessionQuestionId: cur.id,
        answer: answer || null,
        isMarked,
        timeTaken,
      })
    })
  }, [currentIdx, sq, localAnswer, startTransition])

  const handleClear = () => setLocalAnswer('')

  const handleMarkToggle = () => {
    const newMarked = !currentSq.is_marked_for_review
    setSq(prev => prev.map((q, i) =>
      i === currentIdx ? { ...q, is_marked_for_review: newMarked } : q
    ))
  }

  const handleSubmit = async (auto = false) => {
    if (!auto) setShowSubmitModal(false)
    setIsSubmitting(true)

    // Save current question first
    const cur = sq[currentIdx]
    const answer = localAnswer
    const isMarked = cur.is_marked_for_review
    const visitStatus = computeVisitStatus(answer, isMarked)
    const timeTaken = cur.time_taken + questionTimerRef.current

    await saveAnswer({
      sessionQuestionId: cur.id,
      answer: answer || null,
      isMarked,
      timeTaken,
    })

    const elapsed = session.time_limit_minutes * 60 - timeLeft
    const result = await submitTest(session.id, elapsed)

    if (result?.error) {
      setIsSubmitting(false)
      alert('Submit failed: ' + result.error)
      return
    }

    router.push(`/tests/${session.id}/result`)
  }

  const stats = {
    answered: sq.filter(q => q.visit_status === 'answered' || q.visit_status === 'answered_marked').length,
    notAnswered: sq.filter(q => q.visit_status === 'not_answered').length,
    marked: sq.filter(q => q.visit_status === 'marked').length,
    notVisited: sq.filter(q => q.visit_status === 'not_visited').length,
    answeredMarked: sq.filter(q => q.visit_status === 'answered_marked').length,
  }

  const sharedProps = {
    session,
    sq,
    currentIdx,
    currentSq,
    currentQ,
    localAnswer,
    timeLeft,
    questionTimer,
    showSubmitModal,
    isSubmitting,
    stats,
    onNavigate: navigateTo,
    onAnswerChange: setLocalAnswer,
    onClear: handleClear,
    onMarkToggle: handleMarkToggle,
    onShowSubmit: () => setShowSubmitModal(true),
    onHideSubmit: () => setShowSubmitModal(false),
    onSubmit: () => handleSubmit(false),
  }

  if (isJee) return <JeeInterface {...sharedProps} />
  return <CustomInterface {...sharedProps} />
}
