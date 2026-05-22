'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { getAlarms, type MedicationAlarm } from '@/lib/alarms'

type FiredAlarm = MedicationAlarm & { firedAt: string }

type AlarmContextType = {
  firedAlarm: FiredAlarm | null
  dismiss: () => void
  requestPermission: () => void
  permissionGranted: boolean
}

const AlarmContext = createContext<AlarmContextType>({
  firedAlarm: null,
  dismiss: () => {},
  requestPermission: () => {},
  permissionGranted: false,
})

export function useAlarmContext() {
  return useContext(AlarmContext)
}

export default function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [firedAlarm, setFiredAlarm] = useState<FiredAlarm | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted')
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setPermissionGranted(perm === 'granted')
  }, [])

  const checkAlarms = useCallback(() => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hh}:${mm}`

    for (const alarm of getAlarms()) {
      if (!alarm.enabled) continue
      const key = `${alarm.id}_${currentTime}_${now.toDateString()}`
      if (alarm.time !== currentTime || firedRef.current.has(key)) continue

      firedRef.current.add(key)
      setFiredAlarm({ ...alarm, firedAt: currentTime })

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💊 복약 시간이에요!', {
          body: `${alarm.petName}에게 ${alarm.medicationName} ${alarm.dosage} 줄 시간입니다.`,
          icon: '/favicon.ico',
          tag: alarm.id,
        })
      }
      break
    }
  }, [])

  useEffect(() => {
    checkAlarms()
    const interval = setInterval(checkAlarms, 30_000)
    return () => clearInterval(interval)
  }, [checkAlarms])

  return (
    <AlarmContext.Provider value={{ firedAlarm, dismiss: () => setFiredAlarm(null), requestPermission, permissionGranted }}>
      {children}
    </AlarmContext.Provider>
  )
}
