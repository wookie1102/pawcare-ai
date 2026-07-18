'use client'

import { useAlarmContext } from './AlarmProvider'
import { X, Bell } from 'lucide-react'

export default function AlarmToast() {
  const { firedAlarm, queuedCount, dismiss } = useAlarmContext()

  if (!firedAlarm) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-50 px-4 max-w-md mx-auto animate-in slide-in-from-top">
      <div className="bg-green-600 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm">💊 복약 시간이에요!</p>
            {queuedCount > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold">
                +{queuedCount}건 더 있어요
              </span>
            )}
          </div>
          <p className="text-green-100 text-xs mt-0.5 leading-relaxed">
            {firedAlarm.petName}에게 {firedAlarm.medicationName} {firedAlarm.dosage} 줄 시간입니다.
          </p>
          <p className="text-green-200 text-xs mt-1">{firedAlarm.firedAt}</p>
        </div>
        <button onClick={dismiss} className="text-white/70 hover:text-white mt-0.5">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
