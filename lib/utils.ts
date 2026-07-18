import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// "오늘 날짜"를 구할 때 Date.toISOString().split('T')[0]를 쓰면 UTC 기준 날짜가 나온다.
// 이 앱은 한국 사용자를 대상으로 하는데, UTC+9(KST)에서는 자정~오전 9시 사이에 UTC 날짜가
// 아직 전날이라, 그 시간대에 건강 기록/복약 체크 등을 남기면 "오늘"이 실제로는 어제 걸로
// 저장/조회돼서 전날 저녁 기록을 덮어쓰는 등 혼란이 생긴다. 로컬(기기) 타임존 기준으로
// YYYY-MM-DD를 만들어서 이런 문제를 피한다.
export function localDateStr(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
