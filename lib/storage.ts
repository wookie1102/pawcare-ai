import { localDateStr } from './utils'

export type PetProfile = {
  id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  ageYears: string
  ageMonths: string
  weight: string
  conditions: string[]
  notes: string
  emoji?: string
  updatedAt?: string
}

export type HealthLog = {
  date: string
  breathingRate: string
  waterIntake: string
  mealAmount: string
  vitality: number | null
  notes: string
}

export type Medication = {
  id: string
  name: string
  dosage: string
  frequency: number
  times: string[]
  startDate: string
  duration: string
  purpose: string
  warnings: string
  sideEffects: string
}

export type Prescription = {
  id: string
  date: string
  imageDataUrl?: string
  vetName: string
  clinicName: string
  nextVisit: string
  medications: Medication[]
}

export type MedicationCheck = {
  date: string
  medicationId: string
  time: string
  taken: boolean
}

export type ConsultationMessage = {
  id: string
  role: 'ai' | 'user'
  content: string
  isResult?: boolean
  urgency?: 'emergency' | 'caution' | 'watch'
  imageDataUrl?: string
}

export type ConsultationRecord = {
  id: string
  date: string
  petName: string
  petId?: string
  mode: 'symptom' | 'behavior'
  symptomText: string
  urgency: 'emergency' | 'caution' | 'watch'
  behaviorType?: string
  systems?: string[]
  messages: ConsultationMessage[]
}

const KEYS = {
  PETS: 'pawcare_pets',
  ACTIVE_PET_ID: 'pawcare_active_pet_id',
  HEALTH_LOGS: 'pawcare_health_logs',
  PRESCRIPTIONS: 'pawcare_prescriptions',
  MED_CHECKS: 'pawcare_med_checks',
  CONSULTATIONS: 'pawcare_consultations',
}

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// localStorage.setItem은 용량 초과(QuotaExceededError) 시 예외를 던지는데, 특히 사진이
// 포함된 상담 기록/처방전이 쌓이면 브라우저 저장 한도(보통 5~10MB)를 넘기기 쉽다. 이 예외를
// 그대로 흘려보내면 결과 화면 진입 시 실행되는 useEffect 안에서 터져서 화면이 깨질 수 있으므로,
// 여기서 잡아서 실패 여부만 boolean으로 알려준다.
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

// 구버전 단일 프로필 → 다중 프로필 마이그레이션
function migrateSinglePet() {
  if (typeof window === 'undefined') return
  const old = localStorage.getItem('pawcare_pet_profile')
  if (!old || localStorage.getItem(KEYS.PETS)) return
  try {
    const profile = JSON.parse(old)
    const withId = { ...profile, id: 'pet_migrated' }
    safeSetItem(KEYS.PETS, JSON.stringify([withId]))
    safeSetItem(KEYS.ACTIVE_PET_ID, 'pet_migrated')
    localStorage.removeItem('pawcare_pet_profile')
  } catch { /* ignore */ }
}

// ── 반려동물 (다중) ──────────────────────────────────────
export function getPets(): PetProfile[] {
  migrateSinglePet()
  return safeParse<PetProfile[]>(KEYS.PETS, [])
}

export function savePet(pet: PetProfile): void {
  const pets = getPets()
  const idx = pets.findIndex(p => p.id === pet.id)
  const updated = { ...pet, updatedAt: new Date().toISOString() }
  if (idx >= 0) pets[idx] = updated
  else pets.push(updated)
  safeSetItem(KEYS.PETS, JSON.stringify(pets))
}

export function deletePet(id: string): void {
  const pets = getPets().filter(p => p.id !== id)
  safeSetItem(KEYS.PETS, JSON.stringify(pets))
  if (getActivePetId() === id) {
    if (pets.length > 0) setActivePetId(pets[0].id)
    else localStorage.removeItem(KEYS.ACTIVE_PET_ID)
  }
}

export function getActivePetId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEYS.ACTIVE_PET_ID)
}

export function setActivePetId(id: string): void {
  safeSetItem(KEYS.ACTIVE_PET_ID, id)
}

export function getActivePet(): PetProfile | null {
  const pets = getPets()
  if (pets.length === 0) return null
  const activeId = getActivePetId()
  return pets.find(p => p.id === activeId) || pets[0]
}

// 하위 호환 alias
export const getPetProfile = getActivePet
export const savePetProfile = (p: PetProfile) => savePet(p)

// ── 건강 기록 ────────────────────────────────────────────
export function getHealthLogs(): HealthLog[] {
  return safeParse<HealthLog[]>(KEYS.HEALTH_LOGS, [])
}

export function saveHealthLog(log: HealthLog): void {
  const logs = getHealthLogs()
  const idx = logs.findIndex(l => l.date === log.date)
  if (idx >= 0) logs[idx] = log
  else logs.push(log)
  safeSetItem(KEYS.HEALTH_LOGS, JSON.stringify(logs))
}

export function getTodayLog(): HealthLog | null {
  const today = localDateStr()
  return getHealthLogs().find(l => l.date === today) ?? null
}

export function getRecentAverages(): { breathing: number | null; water: number | null; meal: number | null; vitality: number | null } {
  const today = localDateStr()
  const logs = getHealthLogs()
    .filter(l => l.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  if (logs.length === 0) return { breathing: null, water: null, meal: null, vitality: null }

  const avg = (vals: (string | number | null)[]): number | null => {
    const nums = vals.map(v => (v !== null && v !== '' ? Number(v) : NaN)).filter(n => !isNaN(n))
    return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  }

  return {
    breathing: avg(logs.map(l => l.breathingRate)),
    water: avg(logs.map(l => l.waterIntake)),
    meal: avg(logs.map(l => l.mealAmount)),
    vitality: avg(logs.map(l => l.vitality)),
  }
}

// ── 처방전 ───────────────────────────────────────────────
export function getPrescriptions(): Prescription[] {
  return safeParse<Prescription[]>(KEYS.PRESCRIPTIONS, [])
}

export function savePrescription(p: Prescription): void {
  const list = getPrescriptions()
  const idx = list.findIndex(x => x.id === p.id)
  if (idx >= 0) list[idx] = p
  else list.unshift(p)

  if (safeSetItem(KEYS.PRESCRIPTIONS, JSON.stringify(list))) return
  // 용량 초과: 오래된 처방전의 사진부터 지우고 재시도 (최근 5건만 사진 유지)
  const stripped = list.map((x, i) => (i < 5 ? x : { ...x, imageDataUrl: undefined }))
  safeSetItem(KEYS.PRESCRIPTIONS, JSON.stringify(stripped))
}

export function deletePrescription(id: string): void {
  const list = getPrescriptions().filter(p => p.id !== id)
  safeSetItem(KEYS.PRESCRIPTIONS, JSON.stringify(list))
}

// ── 복약 체크 ────────────────────────────────────────────
export function getMedChecks(): MedicationCheck[] {
  return safeParse<MedicationCheck[]>(KEYS.MED_CHECKS, [])
}

export function setMedCheck(check: MedicationCheck): void {
  const checks = getMedChecks()
  const idx = checks.findIndex(
    c => c.date === check.date && c.medicationId === check.medicationId && c.time === check.time
  )
  if (idx >= 0) checks[idx] = check
  else checks.push(check)
  safeSetItem(KEYS.MED_CHECKS, JSON.stringify(checks))
}

export function getTodayChecks(): MedicationCheck[] {
  const today = localDateStr()
  return getMedChecks().filter(c => c.date === today)
}

// ── 상담 기록 ────────────────────────────────────────────
export function getConsultations(): ConsultationRecord[] {
  return safeParse<ConsultationRecord[]>(KEYS.CONSULTATIONS, [])
}

export function saveConsultation(record: ConsultationRecord): void {
  const list = getConsultations()
  list.unshift(record)
  if (list.length > 50) list.splice(50)

  if (safeSetItem(KEYS.CONSULTATIONS, JSON.stringify(list))) return

  // 용량 초과: 오래된 기록의 첨부 사진부터 지우고 재시도 (최근 5건만 사진 유지)
  const stripped = list.map((r, i) =>
    i < 5 ? r : { ...r, messages: r.messages.map(m => ({ ...m, imageDataUrl: undefined })) }
  )
  if (safeSetItem(KEYS.CONSULTATIONS, JSON.stringify(stripped))) return

  // 그래도 초과하면 기록 개수 자체를 줄여서 최후 시도 (그래도 실패하면 이번 저장은 포기하되 앱은 죽지 않는다)
  safeSetItem(KEYS.CONSULTATIONS, JSON.stringify(stripped.slice(0, 20)))
}

export function getRecentConsultations(n = 3): ConsultationRecord[] {
  return getConsultations().slice(0, n)
}
