'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { updateQuestion } from './actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY!

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

  // Image upload state — seeded from existing value
  const [imageUrl, setImageUrl] = useState<string>(initialData.image_url || '')
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError(null)
    setImageUploading(true)
    setImageUrl('')

    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (json.success) {
        setImageUrl(json.data.url)
      } else {
        setImageError('Upload failed. Please try again.')
      }
    } catch {
      setImageError('Network error during upload.')
    } finally {
      setImageUploading(false)
    }
  }

  function handleRemoveImage() {
    setImageUrl('')
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

            {/* ── IMAGE UPLOAD ── */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Question Image <span className="text-muted-2 font-normal">(Optional — diagrams, figures)</span>
              </Label>

              {/* Hidden input carries the current URL to the server action */}
              <input type="hidden" name="image_url" value={imageUrl} />

              {imageUrl ? (
                <div className="space-y-3">
                  <div className="flex justify-center bg-surface-2 border border-border rounded-xl p-3">
                    <Image
                      src={imageUrl}
                      alt="Question diagram preview"
                      width={600}
                      height={300}
                      className="max-h-[220px] w-auto object-contain rounded"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload-edit"
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors ${
                    imageUploading
                      ? 'border-accent-glow/50 bg-accent-glow/5 cursor-not-allowed'
                      : 'border-border hover:border-accent-glow/60 hover:bg-surface-2'
                  }`}
                >
                  {imageUploading ? (
                    <>
                      <svg className="animate-spin w-6 h-6 text-accent-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="text-sm text-muted">Uploading image…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-muted-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-muted">Click to upload a diagram or figure</span>
                      <span className="text-xs text-muted-2">PNG, JPG, GIF, WebP</span>
                    </>
                  )}
                  <input
                    id="image-upload-edit"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={imageUploading}
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {imageError && (
                <p className="text-xs text-red-400">{imageError}</p>
              )}
            </div>
            {/* ── END IMAGE UPLOAD ── */}

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
            <Button type="submit" variant="primary" disabled={isPending || imageUploading}>
              {imageUploading ? 'Uploading image…' : isPending ? 'Updating…' : 'Update Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
