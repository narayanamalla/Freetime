'use client'

import { useState } from 'react'
import { RawImportData, PreviewData, ImportQuestion } from '@/lib/import/types'
import { normalizeImportData } from '@/lib/import/normalize'
import { processImportData, commitImport } from './actions'
import { ImportDropzone } from '@/components/admin/import-dropzone'
import { ImportPreview } from '@/components/admin/import-preview'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [insertResult, setInsertResult] = useState<{ insertedCount: number; skippedCount: number; errorCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParsed = async (rawData: RawImportData[]) => {
    setIsProcessing(true)
    setError(null)
    try {
      const normalized = normalizeImportData(rawData)
      const result = await processImportData(normalized)
      setPreviewData(result)
      setStep('preview')
    } catch (err: any) {
      setError(err.message || 'Failed to process import data.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = async () => {
    if (!previewData) return
    setIsProcessing(true)
    setError(null)
    try {
      const validQs = previewData.validQuestions.map(v => v.question)
      const res = await commitImport(validQs)
      setInsertResult(res)
      setStep('result')
    } catch (err: any) {
      setError(err.message || 'Failed to insert questions.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setPreviewData(null)
    setStep('upload')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Bulk Import Questions</h1>
        <p className="text-white/50 font-medium">Upload a JSON or CSV file to add multiple questions at once.</p>
      </div>

      {error && (
        <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="font-bold">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'upload' && (
        <div className="relative">
          <ImportDropzone onParsed={handleParsed} />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md rounded-xl z-10">
              <span className="font-bold text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">Processing data...</span>
            </div>
          )}
        </div>
      )}

      {step === 'preview' && previewData && (
        <ImportPreview 
          data={previewData} 
          onConfirm={handleConfirm} 
          onCancel={handleCancel}
          isSubmitting={isProcessing}
        />
      )}

      {step === 'result' && insertResult && (
        <div className="space-y-6">
          <Alert className="bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <AlertTitle className="text-emerald-400 font-bold">Import Complete</AlertTitle>
            <AlertDescription className="text-emerald-500/80">
              Successfully processed the import batch.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 border border-white/5 rounded-2xl text-center bg-black/40 premium-card">
              <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{insertResult.insertedCount}</div>
              <div className="text-sm text-white/50 font-medium mt-1">Inserted</div>
            </div>
            <div className="p-5 border border-white/5 rounded-2xl text-center bg-black/40 premium-card">
              <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{insertResult.skippedCount}</div>
              <div className="text-sm text-white/50 font-medium mt-1">Skipped (Dupes)</div>
            </div>
            <div className="p-5 border border-white/5 rounded-2xl text-center bg-black/40 premium-card">
              <div className="text-3xl font-black text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{insertResult.errorCount}</div>
              <div className="text-sm text-white/50 font-medium mt-1">Errors</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98]"
              onClick={() => {
                setStep('upload')
                setPreviewData(null)
                setInsertResult(null)
              }}
            >
              Import Another File
            </button>
            <Link href="/admin" className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/80 font-bold text-sm rounded-xl hover:bg-white/10 hover:text-white transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
