export type MedicationAlarm = {
  id: string
  prescriptionId: string
  medicationId: string
  medicationName: string
  dosage: string
  time: string // 'HH:mm'
  enabled: boolean
  petName: string
}

const KEY = 'pawcare_alarms'

function safe<T>(fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') ?? fallback }
  catch { return fallback }
}

export function getAlarms(): MedicationAlarm[] {
  return safe<MedicationAlarm[]>([])
}

export function saveAlarm(alarm: MedicationAlarm): void {
  const list = getAlarms()
  const idx = list.findIndex(a => a.id === alarm.id)
  if (idx >= 0) list[idx] = alarm
  else list.push(alarm)
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function deleteAlarm(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getAlarms().filter(a => a.id !== id)))
}

export function toggleAlarm(id: string): void {
  const list = getAlarms()
  const idx = list.findIndex(a => a.id === id)
  if (idx >= 0) {
    list[idx].enabled = !list[idx].enabled
    localStorage.setItem(KEY, JSON.stringify(list))
  }
}

export function getAlarmsForMedication(medicationId: string): MedicationAlarm[] {
  return getAlarms().filter(a => a.medicationId === medicationId)
}

export function deleteAlarmsForPrescription(prescriptionId: string): void {
  localStorage.setItem(KEY, JSON.stringify(getAlarms().filter(a => a.prescriptionId !== prescriptionId)))
}
