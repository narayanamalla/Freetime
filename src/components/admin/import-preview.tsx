'use client'

import { useState } from 'react'
import { PreviewData } from '@/lib/import/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react'

interface ImportPreviewProps {
  data: PreviewData
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
}

export function ImportPreview({ data, onConfirm, onCancel, isSubmitting }: ImportPreviewProps) {
  const [showInvalid, setShowInvalid] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Valid Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {data.validQuestions.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready to insert</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Invalid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {data.invalidQuestions.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Missing required data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <Copy className="w-5 h-5" />
              {data.duplicateHashes.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Will be skipped</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={onConfirm} disabled={isSubmitting || data.validQuestions.length === 0}>
          {isSubmitting ? 'Inserting...' : `Confirm & Insert ${data.validQuestions.length} Questions`}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {data.invalidQuestions.length > 0 && (
          <Button variant="ghost" onClick={() => setShowInvalid(!showInvalid)}>
            {showInvalid ? 'Hide Invalid' : 'Show Invalid Details'}
          </Button>
        )}
      </div>

      {showInvalid && data.invalidQuestions.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-400">Invalid Rows Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.invalidQuestions.map((res, idx) => (
              <div key={idx} className="text-sm p-3 bg-white dark:bg-zinc-900 rounded border">
                <p className="font-semibold text-red-600">Row {idx + 1} Errors:</p>
                <ul className="list-disc pl-5 mb-2 text-red-500">
                  {res.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
                <p className="text-gray-500">Partial Data: {JSON.stringify(res.question).substring(0, 100)}...</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Preview (First 10 Valid)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.validQuestions.slice(0, 10).map((res, idx) => (
              <div key={idx} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary">{res.question.subject}</Badge>
                  <Badge variant="outline">{res.question.chapter}</Badge>
                  <Badge className="capitalize">{res.question.type}</Badge>
                </div>
                <p className="text-sm font-medium line-clamp-2">{res.question.statement}</p>
                {res.question.type === 'mcq' && (
                  <p className="text-xs text-gray-500 mt-1">Options: {res.question.options?.map(o => o.text).join(' | ')}</p>
                )}
                {res.question.type === 'numerical' && (
                  <p className="text-xs text-gray-500 mt-1">Answer: {res.question.correct_answer}</p>
                )}
              </div>
            ))}
            {data.validQuestions.length === 0 && (
              <p className="text-sm text-gray-500">No valid questions to preview.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
