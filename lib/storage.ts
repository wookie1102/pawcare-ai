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

// 구버전 단일 프로필 → 다중 프로필 마이그레이션
function migrateSinglePet() {
  if (typeof window === 'undefined') return
  const old = localStorage.getItem('pawcare_pet_profile')
  if (!old || localStorage.getItem(KEYS.PETS)) return
  try {
    const profile = JSON.parse(old)
    const withId = { ...profile, id: 'pet_migrated' }
    localStorage.setItem(KEYS.PETS, JSON.stringify([withId]))
    localStorage.setItem(KEYS.ACTIVE_PET_ID, 'pet_migrated')
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
  localStorage.setItem(KEYS.PETS, JSON.stringify(pets))
}

export function deletePet(id: string): void {
  const pets = getPets().filter(p => p.id !== id)
  localStorage.setItem(KEYS.PETS, JSON.stringify(pets))
  if (getActivePetId() === id) {
    if (pets.length > 0) setActivePetId(pets[0].id)
    else localStorage.removeItem(KEYS.ACTIVE_PET_ID)
  }
}

export function getActivePetId(): string | null {
  return safeParse<string | null>(KEYS.ACTIVE_PET_ID, null)
}

export function setActivePetId(id: string): void {
  localStorage.setItem(KEYS.ACTIVE_PET_ID, id)
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
  localStorage.setItem(KEYS.HEALTH_LOGS, JSON.stringify(logs))
}

export function getTodayLog(): HealthLog | null {
  const today = new Date().toISOString().split('T')[0]
  return getHealthLogs().find(l => l.date === today) ?? null
}

export function getRecentAverages(): { breathing: number | null; water: number | null; meal: number | null; vitality: number | null } {
  const today = new Date().toISOString().split('T')[0]
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
  localStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(list))
}

export function deletePrescription(id: string): void {
  const list = getPrescriptions().filter(p => p.id !== id)
  localStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(list))
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
  localStorage.setItem(KEYS.MED_CHECKS, JSON.stringify(checks))
}

export function getTodayChecks(): MedicationCheck[] {
  const today = new Date().toISOString().split('T')[0]
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
  localStorage.setItem(KEYS.CONSULTATIONS, JSON.stringify(list))
}

export function getRecentConsultations(n = 3): ConsultationRecord[] {
  return getConsultations().slice(0, n)
}
