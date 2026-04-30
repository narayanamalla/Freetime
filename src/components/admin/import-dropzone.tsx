'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud } from 'lucide-react'
import { RawImportData } from '@/lib/import/types'

interface ImportDropzoneProps {
  onParsed: (data: RawImportData[]) => void
}

export function ImportDropzone({ onParsed }: ImportDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError(null)
    const reader = new FileReader()
    
    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          onParsed(Array.isArray(json) ? json : [json])
        } catch (err) {
          setError('Failed to parse JSON file.')
        }
      }
      reader.readAsText(file)
    } else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV Error: ${results.errors[0].message}`)
            return
          }
          onParsed(results.data as RawImportData[])
        },
        error: (err) => {
          setError(`Failed to parse CSV: ${err.message}`)
        }
      })
    } else {
      setError('Unsupported file type. Please upload a JSON or CSV file.')
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full">
          <UploadCloud className="w-8 h-8 text-gray-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg">Upload Questions</h3>
          <p className="text-sm text-gray-500 mt-1">Drag and drop a JSON or CSV file here, or click to select.</p>
        </div>
        
        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        <input 
          type="file" 
          accept=".json,.csv" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          Select File
        </Button>
      </CardContent>
    </Card>
  )
}
