import { ImportQuestion, RawImportData } from './types'

// Helper: find a value from an object by trying multiple possible key names (case-insensitive)
function findValue(item: RawImportData, ...possibleKeys: string[]): string | undefined {
  // Build a lowercase-key map of the item
  const keys = Object.keys(item)
  for (const pk of possibleKeys) {
    const target = pk.toLowerCase().replace(/[\s_-]+/g, '')
    for (const k of keys) {
      const normalized = k.toLowerCase().replace(/[\s_-]+/g, '')
      if (normalized === target) {
        return item[k] !== undefined && item[k] !== null && String(item[k]).trim() !== ''
          ? String(item[k]).trim()
          : undefined
      }
    }
  }
  return undefined
}

export function normalizeImportData(data: RawImportData[]): ImportQuestion[] {
  // Log the first row's keys for debugging
  if (data.length > 0) {
    console.log('[Import Normalizer] CSV Column Headers:', Object.keys(data[0]))
    console.log('[Import Normalizer] First row sample:', JSON.stringify(data[0]).substring(0, 500))
  }

  return data.map(item => {
    const options = []

    // Check if options are already structured (JSON)
    if (Array.isArray(item.options)) {
      options.push(...item.options)
    } else {
      // Try to find option columns with flexible naming
      const optionKeys = [
        ['option_1', 'option 1', 'option1', 'option a', 'optiona', 'option_a'],
        ['option_2', 'option 2', 'option2', 'option b', 'optionb', 'option_b'],
        ['option_3', 'option 3', 'option3', 'option c', 'optionc', 'option_c'],
        ['option_4', 'option 4', 'option4', 'option d', 'optiond', 'option_d'],
      ]

      const correctRaw = findValue(item, 'correct_answer', 'correct answer', 'correctanswer', 'answer', 'correct_option_index', 'correct option')
      const correctStr = (correctRaw || '').toLowerCase().trim()

      for (let i = 0; i < 4; i++) {
        const optVal = findValue(item, ...optionKeys[i])

        if (optVal) {
          const letter = ['a', 'b', 'c', 'd'][i]
          const index = String(i + 1)

          let is_correct = false
          if (correctStr === index || correctStr === letter || correctStr === optVal.toLowerCase()) {
            is_correct = true
          }

          options.push({ text: optVal, is_correct })
        }
      }
    }

    const typeRaw = findValue(item, 'type', 'question type', 'question_type', 'questiontype') || 'mcq'
    const type = typeRaw.toLowerCase() === 'numerical' ? 'numerical' : 'mcq'

    const correctAnswerRaw = findValue(item, 'correct_answer', 'correct answer', 'correctanswer', 'answer')

    return {
      subject: findValue(item, 'subject') || '',
      chapter: findValue(item, 'chapter') || '',
      type: type,
      statement: findValue(item, 'statement', 'question') || '',
      difficulty: (findValue(item, 'difficulty') || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard',
      options: options.length > 0 ? options : undefined,
      correct_answer: type === 'numerical' ? (correctAnswerRaw || '') : undefined,
      hint: findValue(item, 'hint') || undefined,
      solution: findValue(item, 'solution') || undefined,
      tags: (() => {
        const raw = findValue(item, 'tags')
        if (!raw) return []
        return raw.split(',').map(s => s.trim())
      })(),
      source: findValue(item, 'source') || undefined,
    }
  })
}

