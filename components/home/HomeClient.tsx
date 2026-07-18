'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, AlertTriangle, Activity } from 'lucide-react'
import LegalDisclaimer from '@/components/LegalDisclaimer'
import {
  getTodayLog,
  saveHealthLog,
  getRecentAverages,
  getActivePet,
  type HealthLog,
  type PetProfile,
} from '@/lib/storage'

type Tab = 'home' | 'record'

const VITALITY_LABELS = ['', '매우 처짐', '처짐', '보통', '활발', '매우 활발']
const SPECIES_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' }

export default function HomeClient({ displayName }: { displayName: string }) {
  const [tab, setTab] = useState<Tab>('home')
  const [todayLog, setTodayLog] = useState<HealthLog | null>(null)
  const [averages, setAverages] = useState<ReturnType<typeof getRecentAverages>>({
    breathing: null, water: null, meal: null, vitality: null,
  })
  const [form, setForm] = useState({
    breathingRate: '',
    waterIntake: '',
    mealAmount: '',
    vitality: 0,
    notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [activePet, setActivePet] = useState<PetProfile | null>(null)

  function loadData() {
    const pet = getActivePet()
    setActivePet(pet)
    const log = getTodayLog()
    setTodayLog(log)
    if (log) {
      setForm({
        breathingRate: log.breathingRate,
        waterIntake: log.waterIntake,
        mealAmount: log.mealAmount,
        vitality: log.vitality ?? 0,
        notes: log.notes,
      })
    } else {
      setForm({ breathingRate: '', waterIntake: '', mealAmount: '', vitality: 0, notes: '' })
    }
    setAverages(getRecentAverages())
  }

  useEffect(() => {
    loadData()
    window.addEventListener('pawcare_pet_updated', loadData)
    return () => window.removeEventListener('pawcare_pet_updated', loadData)
  }, [])

  function handleSave() {
    const today = new Date().toISOString().split('T')[0]
    const log: HealthLog = {
      date: today,
      breathingRate: form.breathingRate,
      waterIntake: form.waterIntake,
      mealAmount: form.mealAmount,
      vitality: form.vitality || null,
      notes: form.notes,
    }
    saveHealthLog(log)
    setTodayLog(log)
    setAverages(getRecentAverages())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function makeComparisonNote(label: string, today: string | number | null, avg: number | null, unit: string): string | null {
    if (!today || !avg) return null
    const val = Number(today)
    if (isNaN(val)) return null
    const diff = val - avg
    const pct = Math.abs(Math.round((diff / avg) * 100))
    if (pct < 10) return null
    const dir = diff > 0 ? '높아요' : '낮아요'
    return `오늘 ${label}가 평소보다 ${pct}% ${dir} (평균 ${Math.round(avg)}${unit})`
  }

  const comparisonNotes = [
    makeComparisonNote('호흡수', form.breathingRate, averages.breathing, '회/분'),
    makeComparisonNote('음수량', form.waterIntake, averages.water, 'ml'),
    makeComparisonNote('식사량', form.mealAmount, averages.meal, 'ml'),
  ].filter(Boolean) as string[]

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-sm">안녕하세요 👋</p>
            <h1 className="text-xl font-bold text-gray-800">{displayName}님</h1>
            {activePet && (
              <p className="text-sm text-green-600 font-medium mt-0.5">
                {activePet.emoji || SPECIES_EMOJI[activePet.species]} {activePet.name} 보호중
              </p>
            )}
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
            {activePet?.emoji || activePet ? (SPECIES_EMOJI[activePet.species]) : '🐾'}
          </div>
        </div>

        {/* 탭 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('home')}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'home' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
            }`}
          >
            홈
          </button>
          <button
            onClick={() => setTab('record')}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'record' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
            }`}
          >
            오늘 기록
          </button>
        </div>
      </div>

      {tab === 'home' && (
        <div className="px-4 pb-4 space-y-4">
          {/* 상담 배너 */}
          <Link href="/chat">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white active:scale-[0.98] transition-transform">
              <p className="text-green-100 text-xs mb-1">수의사 교수님 데이터 기반 AI</p>
              <h2 className="text-lg font-bold mb-0.5">
                반려동물 증상을<br />물어보세요
              </h2>
              <p className="text-green-100 text-xs mb-4">1,839개 실제 상담 데이터 학습</p>
              <span className="inline-block bg-white text-green-600 font-bold px-5 py-2 rounded-xl text-sm">
                상담 시작하기 →
              </span>
            </div>
          </Link>

          {/* 오늘 기록 요약 */}
          {todayLog && comparisonNotes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">📊 오늘 베이스라인 알림</p>
              {comparisonNotes.map((note, i) => (
                <p key={i} className="text-xs text-amber-600 mb-1">• {note}</p>
              ))}
            </div>
          )}

          {!todayLog && (
            <button
              onClick={() => setTab('record')}
              className="w-full bg-white border border-dashed border-green-300 rounded-2xl p-4 text-center"
            >
              <Activity size={20} className="text-green-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-600">오늘 건강 기록 남기기</p>
              <p className="text-xs text-gray-400 mt-0.5">호흡수, 음수량, 식사량, 활력 기록</p>
            </button>
          )}

          {/* 긴급도 안내 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">긴급도 안내</h3>
            <div className="space-y-2.5">
              {[
                { bg: 'bg-green-100', Icon: Clock, color: 'text-green-600', label: '관찰', desc: '집에서 지켜봐도 괜찮아요' },
                { bg: 'bg-yellow-100', Icon: AlertTriangle, color: 'text-yellow-500', label: '주의', desc: '가까운 시일 내 병원 방문 권장' },
                { bg: 'bg-red-100', Icon: AlertTriangle, color: 'text-red-500', label: '긴급', desc: '즉시 병원에 가세요' },
              ].map(({ bg, Icon, color, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {tab === 'record' && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 건강 기록
            </p>
            <p className="text-xs text-gray-400 mb-4">매일 기록하면 이상 패턴을 빠르게 발견할 수 있어요</p>

            <div className="space-y-4">
              {/* 호흡수 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  🫁 수면 중 호흡수 (1분)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.breathingRate}
                    onChange={e => setForm({ ...form, breathingRate: e.target.value })}
                    placeholder="예: 18"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">회/분</span>
                </div>
                {averages.breathing && (
                  <p className="text-xs text-gray-400 mt-1">평균 {averages.breathing}회/분</p>
                )}
              </div>

              {/* 음수량 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  💧 음수량
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.waterIntake}
                    onChange={e => setForm({ ...form, waterIntake: e.target.value })}
                    placeholder="예: 250"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">ml</span>
                </div>
                {averages.water && (
                  <p className="text-xs text-gray-400 mt-1">평균 {averages.water}ml</p>
                )}
              </div>

              {/* 식사량 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  🍖 식사량
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={form.mealAmount}
                    onChange={e => setForm({ ...form, mealAmount: e.target.value })}
                    placeholder="예: 200"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">ml</span>
                </div>
                {averages.meal && (
                  <p className="text-xs text-gray-400 mt-1">평균 {averages.meal}ml</p>
                )}
              </div>

              {/* 활력 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  ⚡ 활력 점수
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      onClick={() => setForm({ ...form, vitality: v })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.vitality === v
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {form.vitality > 0 && (
                  <p className="text-xs text-green-600 mt-1.5 text-center">{VITALITY_LABELS[form.vitality]}</p>
                )}
              </div>

              {/* 특이사항 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  📝 특이사항 (선택)
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="오늘 특이한 점이 있었나요?"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              {/* 비교 알림 */}
              {comparisonNotes.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  {comparisonNotes.map((note, i) => (
                    <p key={i} className="text-xs text-amber-700">• {note}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {saved ? '✓ 저장됐어요!' : '오늘 기록 저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LegalDisclaimer />
    </div>
  )
}
