type QAEntry = { t: string; b: string; a: string }

let cache: QAEntry[] | null = null
let loadPromise: Promise<QAEntry[]> | null = null

// 원본 DB에 완전히 동일한 사례(제목+본문+답변)가 중복 수록된 경우가 있어
// 검색 결과에 같은 사례가 두 번 나오는 걸 막기 위해 로드 시점에 제거한다.
function dedupe(data: QAEntry[]): QAEntry[] {
  const seen = new Set<string>()
  return data.filter(e => {
    const key = e.t + '|' + e.b + '|' + e.a
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function loadQADB(): Promise<QAEntry[]> {
  if (cache) return cache
  if (loadPromise) return loadPromise
  loadPromise = fetch('/qa-db.json')
    .then(r => r.json())
    .then((data: QAEntry[]) => {
      cache = dedupe(data)
      return cache
    })
  return loadPromise
}

// 조사를 떼어내도 남는 순수 문법 표현(어미/접속사 등)은 의료 키워드가 아닌데도
// 2~4자 서브스트링 매칭 과정에서 전혀 무관한 사례의 문장과 우연히 겹치는 경우가 많아
// (예: "토를 하려고해"의 "하려고" 조각이 "~하려고 하게 됩니다" 같은 무관한 문장과 매칭됨)
// 검색 대상에서 제외한다.
const STOPWORD_FRAGMENTS = new Set([
  '하려고해', '하려고', '하려', '려고', '려고해', '고해',
  '그래서', '그런데', '근데', '하지만', '인데', '는데',
  '습니다', '입니다', '있어요', '없어요', '같아요', '해요', '했어요',
  '되어요', '됐어요', '되었', '이에요', '예요', '거예요', '것같',
  '나요', '까요', '겠어요', '보여요', '해서', '했는데', '한테', '부터', '까지',
])

// 의미 있는 한국어 의료 키워드만 추출 (조사/어미 제거)
function extractTerms(query: string): string[] {
  const terms = new Set<string>()

  // 공백 기준으로 나눈 단어
  const words = query.split(/\s+/)
  for (const word of words) {
    const w = word.replace(/[은는이가을를도의에서와과으로]\s*$/, '').replace(/[^가-힣a-zA-Z0-9]/g, '')
    if (w.length >= 2 && !STOPWORD_FRAGMENTS.has(w)) terms.add(w)
    // 2~4자 서브스트링도 추가 (복합어 처리)
    for (let i = 0; i < w.length; i++) {
      for (let len = 2; len <= 4; len++) {
        if (i + len <= w.length) {
          const sub = w.slice(i, i + len)
          if (!STOPWORD_FRAGMENTS.has(sub)) terms.add(sub)
        }
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

function cleanBody(body: string): string {
  return body.replace(/\s+/g, ' ').trim()
}

export function formatQAAnswer(entries: QAEntry[]): string {
  if (entries.length === 0) return ''

  const lines: string[] = []
  entries.forEach((e, idx) => {
    if (idx > 0) lines.push('')
    lines.push(entries.length > 1 ? `📋 관련 사례 ${idx + 1}: ${e.t}` : `📋 ${e.t}`)
    lines.push(`Q. ${cleanBody(e.b)}`)
    lines.push(`A. ${e.a.trim()}`)
  })

  return lines.join('\n')
}
