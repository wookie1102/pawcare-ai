'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { getAlarms, type MedicationAlarm } from '@/lib/alarms'

type FiredAlarm = MedicationAlarm & { firedAt: string }

type AlarmContextType = {
  firedAlarm: FiredAlarm | null
  queuedCount: number
  dismiss: () => void
  requestPermission: () => void
  permissionGranted: boolean
}

const AlarmContext = createContext<AlarmContextType>({
  firedAlarm: null,
  queuedCount: 0,
  dismiss: () => {},
  requestPermission: () => {},
  permissionGranted: false,
})

export function useAlarmContext() {
  return useContext(AlarmContext)
}

export default function AlarmProvider({ children }: { children: React.ReactNode }) {
  // 같은 시각에 약이 2개 이상 예약된 경우를 위한 대기열. firedAlarms[0]이 현재 표시 중인 알람이고,
  // dismiss()는 맨 앞을 제거해 다음 알람을 이어서 보여준다 (예전에는 첫 매칭에서 바로 break 해버려서
  // 같은 시각의 두 번째 이후 약 알림이 조용히 사라졌었다).
  const [firedAlarms, setFiredAlarms] = useState<FiredAlarm[]>([])
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

    const newlyFired: FiredAlarm[] = []
    for (const alarm of getAlarms()) {
      if (!alarm.enabled || alarm.time !== currentTime) continue
      const key = `${alarm.id}_${currentTime}_${now.toDateString()}`
      if (firedRef.current.has(key)) continue

      firedRef.current.add(key)
      newlyFired.push({ ...alarm, firedAt: currentTime })

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💊 복약 시간이에요!', {
          body: `${alarm.petName}에게 ${alarm.medicationName} ${alarm.dosage} 줄 시간입니다.`,
          icon: '/favicon.ico',
          tag: alarm.id,
        })
      }
    }
    if (newlyFired.length > 0) {
      setFiredAlarms(prev => [...prev, ...newlyFired])
    }
  }, [])

  useEffect(() => {
    checkAlarms()
    const interval = setInterval(checkAlarms, 30_000)
    return () => clearInterval(interval)
  }, [checkAlarms])

  return (
    <AlarmContext.Provider
      value={{
        firedAlarm: firedAlarms[0] ?? null,
        queuedCount: Math.max(0, firedAlarms.length - 1),
        dismiss: () => setFiredAlarms(prev => prev.slice(1)),
        requestPermission,
        permissionGranted,
      }}
    >
      {children}
    </AlarmContext.Provider>
  )
}
