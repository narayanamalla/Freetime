import { ImportQuestion } from './types'

// Simple deterministic hash function using Web Crypto API or Node crypto
// Since this might run in browser (preview) or server (insert), we'll use a simple string hash
export async function generateHash(q: ImportQuestion): Promise<string> {
  const normalizedStatement = q.statement.trim().toLowerCase().replace(/\s+/g, ' ')
  const normalizedOptions = q.type === 'mcq' && q.options 
    ? q.options.map(o => o.text.trim().toLowerCase()).sort().join('|')
    : q.correct_answer?.trim().toLowerCase() || ''
  
  const visibility = q.visibility || 'public'
  const rawString = `${q.subject}|${q.chapter}|${q.type}|${normalizedStatement}|${normalizedOptions}`
  
  // Use SubtleCrypto for hashing if available
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(rawString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else {
    // Fallback naive hash for environments without crypto (shouldn't happen in modern Next.js)
    let hash = 0
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0 // Convert to 32bit integer
    }
    return hash.toString(16)
  }
}
