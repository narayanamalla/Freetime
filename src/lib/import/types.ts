export interface ImportOption {
  text: string
  is_correct: boolean
}

export interface ImportQuestion {
  subject: string
  chapter: string
  type: 'mcq' | 'numerical'
  statement: string
  difficulty: 'easy' | 'medium' | 'hard'
  options?: ImportOption[]
  correct_answer?: string
  hint?: string
  solution?: string
  tags?: string[]
  source?: string
  hash?: string
}

export interface RawImportData {
  [key: string]: any
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  question: ImportQuestion
}

export interface PreviewData {
  validQuestions: ValidationResult[]
  invalidQuestions: ValidationResult[]
  duplicateHashes: string[]
}
