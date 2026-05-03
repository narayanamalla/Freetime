'use client'

import { useState, useEffect, useTransition } from 'react'
import { updateQuestion } from './actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRouter } from 'next/navigation'

const inputCls = "w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-2 focus:border-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-glow/30 transition text-sm"
const textareaCls = `${inputCls} resize-none`
const selectTriggerCls = "w-full bg-surface-2 border border-border text-foreground focus:ring-accent-glow/30 focus:border-accent-glow h-12 rounded-md"

export default function EditQuestionClient({ questionId, initialData }: { questionId: string, initialData: any }) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>(initialData.subjects || [])
  const [chapters, setChapters] = useState<any[]>(initialData.initialChapters || [])
  const [selectedSubject, setSelectedSubject] = useState<string>(initialData.subjectId || '')
  const [type, setType] = useState(initialData.type || 'mcq')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const supabase = createClient()

  let initCorrectIndex = '0'
  if (initialData.type === 'mcq' && initialData.options) {
    const idx = initialData.options.findIndex((o: any) => o.is_correct)
    if (idx !== -1) initCorrectIndex = idx.toString()
  }

  const [correctOptionState, setCorrectOptionState] = useState(initCorrectIndex)

  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubject) { setChapters([]); return }
      if (selectedSubject === initialData.subjectId && initialData.initialChapters?.length > 0) {
        setChapters(initialData.initialChapters); return
      }
      const { data } = await supabase.from('chapters').select('*').eq('subject_id', selectedSubject).order('name')
      if (data) setChapters(data)
    }
    loadChapters()
  }, [selectedSubject, supabase, initialData])

  async function handleSubmit(formData: FormData) {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await updateQuestion(questionId, formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else if (res?.success) {
        router.push('/admin')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Edit Question</h1>
        <p className="text-muted mt-1">Update the details of this practice question.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <form action={handleSubmit}>
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-bold text-foreground">Question Details</h2>
          </div>
          <div className="space-y-6 p-6">

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Subject</Label>
                <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? '')} required>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border border-border text-foreground">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id} className="focus:bg-surface-2">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Chapter</Label>
                <Select name="chapterId" defaultValue={initialData.chapterId} required disabled={!selectedSubject}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select Chapter" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border border-border text-foreground">
                    {chapters.map(c => (
                      <SelectItem key={c.id} value={c.id} className="focus:bg-surface-2">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Type</Label>
                <Select name="type" value={type} onValueChange={(v) => setType(v ?? 'mcq')}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border border-border text-foreground">
                    <SelectItem value="mcq" className="focus:bg-surface-2">Multiple Choice</SelectItem>
                    <SelectItem value="numerical" className="focus:bg-surface-2">Numerical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Difficulty</Label>
                <Select name="difficulty" defaultValue={initialData.difficulty}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border border-border text-foreground">
                    <SelectItem value="easy" className="focus:bg-surface-2">Easy</SelectItem>
                    <SelectItem value="medium" className="focus:bg-surface-2">Medium</SelectItem>
                    <SelectItem value="hard" className="focus:bg-surface-2">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Problem Statement</Label>
              <textarea name="statement" defaultValue={initialData.statement} placeholder="Enter the question text here..." rows={4} required className={textareaCls} />
            </div>

            {type === 'mcq' ? (
              <div className="space-y-4 border border-border bg-surface-2 p-5 rounded-xl">
                <Label className="text-sm font-bold text-foreground">Options &amp; Correct Answer</Label>
                <input type="hidden" name="correctOptionIndex" value={correctOptionState} />
                <RadioGroup value={correctOptionState} onValueChange={setCorrectOptionState} className="space-y-3">
                  {[0, 1, 2, 3].map((index) => {
                    const opt = initialData.options?.[index]
                    return (
                      <div key={index} className="flex items-center space-x-3 bg-surface border border-border p-3 rounded-xl">
                        {opt?.id && <input type="hidden" name={`option_id_${index}`} value={opt.id} />}
                        <RadioGroupItem value={index.toString()} id={`opt_${index}`} className="border-border-strong text-accent-cyan ml-2" />
                        <input name={`option_${index}`} defaultValue={opt?.text || ''} placeholder={`Option ${index + 1}`} required className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-2 focus:outline-none text-sm" />
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>
            ) : (
              <div className="space-y-2 border border-border bg-surface-2 p-5 rounded-xl">
                <Label className="text-sm font-bold text-foreground">Correct Numerical Answer</Label>
                <input name="correct_answer" defaultValue={type === 'numerical' ? initialData.numericalAnswer : ''} placeholder="e.g. 42" required className={inputCls} />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Solution (Optional)</Label>
              <textarea name="solution" defaultValue={initialData.solution} placeholder="Detailed step-by-step solution..." rows={3} className={textareaCls} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Hint (Optional)</Label>
              <input name="hint" defaultValue={initialData.hint} placeholder="A short hint..." className={inputCls} />
            </div>
          </div>

          <div className="border-t border-border px-6 py-5">
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Updating…' : 'Update Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
