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
        <h1 className="text-3xl font-bold tracking-tight">Bulk Import Questions</h1>
        <p className="text-gray-500">Upload a JSON or CSV file to add multiple questions at once.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'upload' && (
        <div className="relative">
          <ImportDropzone onParsed={handleParsed} />
          {isProcessing && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-lg">
              <span className="font-medium animate-pulse">Processing data...</span>
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
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-400">Import Complete</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-500">
              Successfully processed the import batch.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center bg-white dark:bg-zinc-950">
              <div className="text-2xl font-bold text-green-600">{insertResult.insertedCount}</div>
              <div className="text-sm text-gray-500">Inserted</div>
            </div>
            <div className="p-4 border rounded-lg text-center bg-white dark:bg-zinc-950">
              <div className="text-2xl font-bold text-orange-600">{insertResult.skippedCount}</div>
              <div className="text-sm text-gray-500">Skipped (Dupes)</div>
            </div>
            <div className="p-4 border rounded-lg text-center bg-white dark:bg-zinc-950">
              <div className="text-2xl font-bold text-red-600">{insertResult.errorCount}</div>
              <div className="text-sm text-gray-500">Errors</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                setStep('upload')
                setPreviewData(null)
                setInsertResult(null)
              }}
            >
              Import Another File
            </button>
            <Link href="/admin" className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-zinc-800">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
