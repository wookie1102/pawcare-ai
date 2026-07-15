type QAEntry = { t: string; b: string; a: string }

let cache: QAEntry[] | null = null
let loadPromise: Promise<QAEntry[]> | null = null

export async function loadQADB(): Promise<QAEntry[]> {
  if (cache) return cache
  if (loadPromise) return loadPromise
  loadPromise = fetch('/qa-db.json')
    .then(r => r.json())
    .then((data: QAEntry[]) => {
      cache = data
      return data
    })
  return loadPromise
}

// 의미 있는 한국어 의료 키워드만 추출 (조사/어미 제거)
function extractTerms(query: string): string[] {
  const terms = new Set<string>()

  // 공백 기준으로 나눈 단어
  const words = query.split(/\s+/)
  for (const word of words) {
    const w = word.replace(/[은는이가을를도의에서와과으로]\s*$/, '').replace(/[^가-힣a-zA-Z0-9]/g, '')
    if (w.length >= 2) terms.add(w)
    // 2~4자 서브스트링도 추가 (복합어 처리)
    for (let i = 0; i < w.length; i++) {
      for (let len = 2; len <= 4; len++) {
        if (i + len <= w.length) terms.add(w.slice(i, i + len))
      }
    }
  }

  return [...terms]
}

function scoreEntry(entry: QAEntry, terms: string[]): number {
  const title = entry.t
  const answer = entry.a
  const all = title + ' ' + entry.b + ' ' + answer

  let score = 0
  for (const term of terms) {
    if (title.includes(term)) score += 4       // 제목 일치 = 높은 가중치
    else if (answer.includes(term)) score += 2 // 답변 일치
    else if (all.includes(term)) score += 1    // 질문 본문 일치
  }
  return score
}

export async function searchQA(query: string, topK = 3): Promise<QAEntry[]> {
  const db = await loadQADB()
  const terms = extractTerms(query)
  if (terms.length === 0) return []

  const scored = db
    .map(e => ({ e, s: scoreEntry(e, terms) }))
    .filter(x => x.s >= 4)
    .sort((a, b) => b.s - a.s)
    .slice(0, topK)

  return scored.map(x => x.e)
}

export function formatQAAnswer(entries: QAEntry[]): string {
  if (entries.length === 0) return ''

  if (entries.length === 1) {
    return entries[0].a.trim()
  }

  const lines: string[] = []
  entries.forEach((e, idx) => {
    if (idx > 0) lines.push('')
    lines.push(`📋 관련 사례 ${idx + 1}: ${e.t}`)
    lines.push(e.a.trim())
  })

  return lines.join('\n')
}
