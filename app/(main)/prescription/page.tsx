'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Camera, ChevronDown, ChevronUp, Trash2, Bell, BellOff, Check, X, AlertCircle, Clock } from 'lucide-react'
import LegalDisclaimer from '@/components/LegalDisclaimer'
import { useAlarmContext } from '@/components/AlarmProvider'
import {
  getPrescriptions, savePrescription, deletePrescription,
  getMedChecks, setMedCheck, getTodayChecks, getHealthLogs,
  getActivePet,
  type Prescription, type Medication, type MedicationCheck,
} from '@/lib/storage'
import {
  getAlarms, saveAlarm, deleteAlarm, toggleAlarm, getAlarmsForMedication,
  deleteAlarmsForPrescription, type MedicationAlarm,
} from '@/lib/alarms'

const DUMMY_MEDS: Medication[] = [
  {
    id: 'dum_1', name: '피모벤단 (Pimobendan)', dosage: '2.5mg', frequency: 2,
    times: ['08:00', '20:00'],
    startDate: new Date().toISOString().split('T')[0], duration: '30일',
    purpose: '심장 기능 강화 — 심장이 혈액을 더 효율적으로 펌핑하게 도와줘요',
    warnings: '반드시 공복에 투여 (식전 1시간 또는 식후 2시간 후)',
    sideEffects: '식욕 감소, 무기력증이 일시적으로 나타날 수 있어요',
  },
  {
    id: 'dum_2', name: '후로세미드 (Furosemide)', dosage: '20mg', frequency: 2,
    times: ['08:00', '20:00'],
    startDate: new Date().toISOString().split('T')[0], duration: '30일',
    purpose: '이뇨제 — 폐나 몸에 찬 과도한 수분을 소변으로 배출시켜요',
    warnings: '충분한 물 섭취 필수. 전해질(칼륨) 수치 정기 확인 필요',
    sideEffects: '소변량이 크게 늘어요. 과도한 탈수 주의',
  },
]

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function getCorrelationNote(med: Medication, logs: ReturnType<typeof getHealthLogs>): string | null {
  if (logs.length < 2) return null
  const days = logs.filter(l => l.date >= med.startDate).length
  if (!days) return null
  if (med.name.includes('피모벤단') || med.name.includes('Pimobendan'))
    return `${med.name.split(' ')[0]} 복용 ${days}일째, 호흡수 변화 모니터링 중`
  if (med.name.includes('후로세미드') || med.name.includes('Furosemide'))
    return `이뇨제 복용 ${days}일째, 음수량 증가 여부 확인 권장`
  return `${med.name.split(' ')[0]} 복용 ${days}일째`
}

export default function PrescriptionPage() {
  const { permissionGranted, requestPermission } = useAlarmContext()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [todayChecks, setTodayChecks] = useState<MedicationCheck[]>([])
  const [healthLogs, setHealthLogs] = useState<ReturnType<typeof getHealthLogs>>([])
  const [alarms, setAlarms] = useState<MedicationAlarm[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedMed, setExpandedMed] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [alarmModal, setAlarmModal] = useState<{ med: Medication; prescriptionId: string } | null>(null)
  const [alarmTimes, setAlarmTimes] = useState<{ time: string; enabled: boolean }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const today = new Date().toISOString().split('T')[0]

  function refresh() {
    setPrescriptions(getPrescriptions())
    setTodayChecks(getTodayChecks())
    setAlarms(getAlarms())
    setHealthLogs(getHealthLogs())
  }

  useEffect(() => { refresh() }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPreviewUrl(ev.target?.result as string); setShowAddModal(true) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleAnalyze() {
    setAnalyzing(true)
    setTimeout(() => {
      const pet = getActivePet()
      const newP: Prescription = {
        id: Date.now().toString(), date: today,
        imageDataUrl: previewUrl || undefined,
        vetName: '김민준 수의사', clinicName: '그린동물병원',
        nextVisit: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        medications: DUMMY_MEDS.map(m => ({ ...m, id: m.id + '_' + Date.now(), startDate: today })),
      }
      savePrescription(newP)
      setShowAddModal(false); setPreviewUrl(null); setAnalyzing(false)
      setExpanded(newP.id); refresh()
    }, 2000)
  }

  function handleDelete(id: string) {
    if (!confirm('이 처방전을 삭제할까요?')) return
    deletePrescription(id)
    deleteAlarmsForPrescription(id)
    if (expanded === id) setExpanded(null)
    refresh()
  }

  function toggleCheck(med: Medication, time: string) {
    const current = isTaken(med.id, time)
    setMedCheck({ date: today, medicationId: med.id, time, taken: !current })
    setTodayChecks(getTodayChecks())
  }

  function isTaken(medId: string, time: string) {
    return todayChecks.some(c => c.medicationId === medId && c.time === time && c.taken)
  }

  function openAlarmModal(med: Medication, prescriptionId: string) {
    const existing = getAlarmsForMedication(med.id)
    const times = med.times.map(t => {
      const found = existing.find(a => a.time === t)
      return { time: t, enabled: found ? found.enabled : true }
    })
    // Add any extra alarms not in default times
    existing.filter(a => !med.times.includes(a.time)).forEach(a => {
      times.push({ time: a.time, enabled: a.enabled })
    })
    setAlarmTimes(times)
    setAlarmModal({ med, prescriptionId })
  }

  function addAlarmTime() {
    setAlarmTimes(prev => [...prev, { time: '09:00', enabled: true }])
  }

  function removeAlarmTime(idx: number) {
    setAlarmTimes(prev => prev.filter((_, i) => i !== idx))
  }

  function saveAlarms() {
    if (!alarmModal) return
    const { med, prescriptionId } = alarmModal
    const pet = getActivePet()
    const petName = pet?.name || '반려동물'

    // 기존 알람 삭제 후 재등록
    getAlarmsForMedication(med.id).forEach(a => deleteAlarm(a.id))
    alarmTimes.forEach((at, i) => {
      saveAlarm({
        id: `alarm_${med.id}_${i}_${Date.now()}`,
        prescriptionId, medicationId: med.id,
        medicationName: med.name.split(' ')[0],
        dosage: med.dosage, time: at.time,
        enabled: at.enabled, petName,
      })
    })
    refresh(); setAlarmModal(null)
  }

  const todayMeds = prescriptions.flatMap(p => p.medications)
  const totalDoses = todayMeds.reduce((sum, m) => sum + m.times.length, 0)
  const takenDoses = todayMeds.reduce((sum, m) => sum + m.times.filter(t => isTaken(m.id, t)).length, 0)
  const activeAlarmCount = alarms.filter(a => a.enabled).length

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">처방전 관리</h1>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={15} />추가
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

      {/* 알림 권한 배너 */}
      {!permissionGranted && activeAlarmCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellOff size={14} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">알림 권한이 없어요. 허용하면 복약 시간에 알람을 받을 수 있어요.</p>
          </div>
          <button onClick={requestPermission} className="text-xs font-semibold text-amber-700 whitespace-nowrap underline">허용</button>
        </div>
      )}

      {/* 오늘 복약 현황 */}
      {totalDoses > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">오늘 복약 현황</p>
            <div className="flex items-center gap-2">
              {activeAlarmCount > 0 && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Bell size={11} /> {activeAlarmCount}개 알람 설정됨
                </span>
              )}
              <p className="text-xs text-green-600 font-semibold">{takenDoses}/{totalDoses}회</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: totalDoses ? `${(takenDoses / totalDoses) * 100}%` : '0%' }}
            />
          </div>
          {takenDoses === totalDoses && totalDoses > 0 && (
            <p className="text-xs text-green-600 mt-2 text-center">🎉 오늘 복약을 모두 완료했어요!</p>
          )}
        </div>
      )}

      {/* 처방전 목록 */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-3">💊</div>
          <p className="text-gray-500 text-sm font-medium mb-1">처방전이 없어요</p>
          <p className="text-gray-400 text-xs mb-4">처방전 사진을 찍으면 AI가 약 정보를 자동으로 정리해드려요</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 mx-auto bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            <Camera size={15} />처방전 촬영하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {p.imageDataUrl
                    ? <img src={p.imageDataUrl} alt="처방전" className="w-10 h-10 rounded-lg object-cover" />
                    : <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">💊</div>
                  }
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">{p.clinicName || '처방전'}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.date)} · {p.medications.length}종 처방</p>
                  </div>
                </div>
                {expanded === p.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {expanded === p.id && (
                <div className="border-t border-gray-50 px-5 pb-5">
                  <div className="py-3 space-y-1">
                    {p.vetName && <p className="text-xs text-gray-500">담당 수의사: <span className="font-medium text-gray-700">{p.vetName}</span></p>}
                    {p.nextVisit && <p className="text-xs text-gray-500">다음 내원: <span className="font-medium text-gray-700">{formatDate(p.nextVisit)}</span></p>}
                  </div>

                  <div className="space-y-3">
                    {p.medications.map(med => {
                      const correlation = getCorrelationNote(med, healthLogs)
                      const medAlarms = getAlarmsForMedication(med.id)
                      const hasAlarms = medAlarms.some(a => a.enabled)
                      return (
                        <div key={med.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50"
                          >
                            <div className="text-left">
                              <p className="text-sm font-semibold text-gray-800">{med.name}</p>
                              <p className="text-xs text-gray-400">{med.dosage} · 하루 {med.frequency}회 · {med.duration}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasAlarms && <Bell size={13} className="text-green-500" />}
                              {expandedMed === med.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </button>

                          {expandedMed === med.id && (
                            <div className="px-4 py-3 space-y-2.5">
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-0.5">효능</p>
                                <p className="text-xs text-gray-700">{med.purpose}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-amber-600 uppercase mb-0.5">주의사항</p>
                                <p className="text-xs text-amber-700">{med.warnings}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-0.5">부작용</p>
                                <p className="text-xs text-gray-600">{med.sideEffects}</p>
                              </div>
                              {correlation && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                  <p className="text-xs text-blue-600">📊 {correlation}</p>
                                </div>
                              )}
                              <p className="text-[10px] text-gray-300">약 정보는 참고용이며 반드시 담당 수의사의 지도를 따르세요</p>
                            </div>
                          )}

                          {/* 복약 체크 */}
                          <div className="px-4 py-3 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-semibold text-gray-500">오늘 복약 체크</p>
                              <button
                                onClick={() => openAlarmModal(med, p.id)}
                                className="flex items-center gap-1 text-[10px] text-green-600 font-semibold"
                              >
                                <Bell size={11} />
                                {hasAlarms ? '알람 수정' : '알람 설정'}
                              </button>
                            </div>
                            <div className="flex gap-2">
                              {med.times.map(time => {
                                const taken = isTaken(med.id, time)
                                return (
                                  <button
                                    key={time}
                                    onClick={() => toggleCheck(med, time)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                                      taken ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                                    }`}
                                  >
                                    {taken ? <Check size={12} /> : <X size={12} />}
                                    {time}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />처방전 삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 처방전 분석 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">처방전 분석</h2>
            <p className="text-xs text-gray-400 mb-4">AI가 처방전에서 약 정보를 읽어드릴게요</p>
            {previewUrl && <img src={previewUrl} alt="처방전" className="w-full h-40 object-cover rounded-xl mb-4" />}
            {analyzing ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">처방전을 분석하고 있어요...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">현재 데모 모드입니다. API 연결 후 실제 처방전을 자동 인식해요.</p>
                </div>
                <button onClick={handleAnalyze} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  AI로 분석하기 (데모)
                </button>
                <button onClick={() => { setShowAddModal(false); setPreviewUrl(null) }} className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl text-sm">
                  취소
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 알람 설정 모달 */}
      {alarmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-800">알람 설정</h2>
              <button onClick={() => setAlarmModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              <span className="font-medium text-gray-600">{alarmModal.med.name.split(' ')[0]}</span> 복약 알람 시간을 설정하세요
            </p>

            {!permissionGranted && (
              <button
                onClick={requestPermission}
                className="w-full flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-medium py-2.5 rounded-xl text-xs mb-4 justify-center"
              >
                <Bell size={13} />
                알림 권한 허용하기 (기기 알람 수신)
              </button>
            )}

            <div className="space-y-3 mb-4">
              {alarmTimes.map((at, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <Clock size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="time"
                    value={at.time}
                    onChange={e => setAlarmTimes(prev => prev.map((a, j) => j === i ? { ...a, time: e.target.value } : a))}
                    className="flex-1 bg-transparent text-base font-semibold text-gray-800 focus:outline-none"
                  />
                  {/* 토글 */}
                  <button
                    onClick={() => setAlarmTimes(prev => prev.map((a, j) => j === i ? { ...a, enabled: !a.enabled } : a))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${at.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${at.enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                  <button onClick={() => removeAlarmTime(i)} className="text-gray-300 hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addAlarmTime}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-green-600 font-medium py-2 border border-dashed border-green-300 rounded-xl mb-4"
            >
              <Plus size={14} />알람 시간 추가
            </button>

            <button
              onClick={saveAlarms}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
            >
              알람 저장
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              앱이 켜져 있을 때 설정한 시간에 알람이 울려요
            </p>
          </div>
        </div>
      )}

      <LegalDisclaimer extra="약 정보는 참고용이며 반드시 담당 수의사의 지도를 따르세요." />
    </div>
  )
}
