'use client'

import { useState, useEffect } from 'react'
import { createQuestion } from './actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const inputCls = "w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-2 focus:border-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-glow/30 transition text-sm"
const textareaCls = `${inputCls} resize-none`
const selectTriggerCls = "w-full bg-surface-2 border border-border text-foreground focus:ring-accent-glow/30 focus:border-accent-glow h-12 rounded-md"

export default function NewQuestionPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [type, setType] = useState('mcq')
  const supabase = createClient()

  useEffect(() => {
    async function loadSubjects() {
      const { data } = await supabase.from('subjects').select('*').order('name')
      if (data) setSubjects(data)
    }
    loadSubjects()
  }, [])

  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubject) { setChapters([]); return }
      const { data } = await supabase.from('chapters').select('*').eq('subject_id', selectedSubject).order('name')
      if (data) setChapters(data)
    }
    loadChapters()
  }, [selectedSubject])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Add New Question</h1>
        <p className="text-muted mt-1">Create a new practice question for students.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <form action={createQuestion}>
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-bold text-foreground">Question Details</h2>
          </div>
          <div className="space-y-6 p-6">

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
                <Select name="chapterId" required disabled={!selectedSubject}>
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
                <Select name="difficulty" defaultValue="medium">
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
              <textarea name="statement" placeholder="Enter the question text here..." rows={4} required className={textareaCls} />
            </div>

            {type === 'mcq' ? (
              <div className="space-y-4 border border-border bg-surface-2 p-5 rounded-xl">
                <Label className="text-sm font-bold text-foreground">Options &amp; Correct Answer</Label>
                <RadioGroup name="correctOptionIndex" defaultValue="0" className="space-y-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center space-x-3 bg-surface border border-border p-3 rounded-xl">
                      <RadioGroupItem value={index.toString()} id={`opt_${index}`} className="border-border-strong text-accent-cyan ml-2" />
                      <input name={`option_${index}`} placeholder={`Option ${index + 1}`} required className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-2 focus:outline-none text-sm" />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ) : (
              <div className="space-y-2 border border-border bg-surface-2 p-5 rounded-xl">
                <Label className="text-sm font-bold text-foreground">Correct Numerical Answer</Label>
                <input name="correct_answer" placeholder="e.g. 42" required className={inputCls} />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Solution (Optional)</Label>
              <textarea name="solution" placeholder="Detailed step-by-step solution..." rows={3} className={textareaCls} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Hint (Optional)</Label>
              <input name="hint" placeholder="A short hint..." className={inputCls} />
            </div>
          </div>

          <div className="border-t border-border px-6 py-5">
            <Button type="submit" variant="primary">Create Question</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
