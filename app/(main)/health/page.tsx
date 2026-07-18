'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { getHealthLogs, saveHealthLog, getTodayLog, getActivePet, type HealthLog } from '@/lib/storage'
import { localDateStr } from '@/lib/utils'

type ChartMetric = 'vitality' | 'mealAmount' | 'waterIntake' | 'breathingRate'

const METRIC_CONFIG: Record<ChartMetric, { label: string; color: string; unit: string; max: number }> = {
  vitality:      { label: '활력도',  color: '#22c55e', unit: '점',  max: 5 },
  mealAmount:    { label: '식사량',  color: '#f59e0b', unit: 'ml', max: 500 },
  waterIntake:   { label: '음수량',  color: '#3b82f6', unit: 'ml', max: 500 },
  breathingRate: { label: '호흡수',  color: '#ef4444', unit: '회', max: 60 },
}

const VITALITY_EMOJI = ['', '😴', '😟', '😐', '😊', '🤩']

function LineChart({ logs, metric }: { logs: HealthLog[]; metric: ChartMetric }) {
  const cfg = METRIC_CONFIG[metric]
  const W = 320
  const H = 120
  const PAD = { top: 12, right: 16, bottom: 28, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const vals = logs.map(l => {
    const v = l[metric]
    return v !== null && v !== '' ? Number(v) : null
  })

  const defined = vals.filter(v => v !== null) as number[]
  if (defined.length === 0) return (
    <div className="flex items-center justify-center h-[120px] text-xs text-gray-300">데이터 없음</div>
  )

  const dataMax = Math.max(...defined, cfg.max * 0.5)
  const yMax = metric === 'vitality' ? 5 : Math.ceil(dataMax / 100) * 100 || 100

  const xOf = (i: number) => PAD.left + (i / (logs.length - 1 || 1)) * innerW
  const yOf = (v: number) => PAD.top + innerH - (v / yMax) * innerH

  const points = vals.map((v, i) => v !== null ? { x: xOf(i), y: yOf(v), v } : null)

  // Build path skipping nulls
  let d = ''
  points.forEach((p, i) => {
    if (!p) return
    const prev = points.slice(0, i).findLast(x => x)
    d += prev ? ` L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`
  })

  // Y axis labels
  const yTicks = metric === 'vitality' ? [1, 2, 3, 4, 5] : [0, Math.round(yMax / 2), yMax]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid lines */}
      {yTicks.map(t => (
        <g key={t}>
          <line
            x1={PAD.left} y1={yOf(t)} x2={W - PAD.right} y2={yOf(t)}
            stroke="#f3f4f6" strokeWidth="1"
          />
          <text x={PAD.left - 4} y={yOf(t) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{t}</text>
        </g>
      ))}

      {/* X axis labels */}
      {logs.map((l, i) => {
        if (logs.length > 7 && i % 2 !== 0) return null
        const d = new Date(l.date)
        const label = `${d.getMonth() + 1}/${d.getDate()}`
        return (
          <text key={l.date} x={xOf(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {label}
          </text>
        )
      })}

      {/* Area fill */}
      {d && (
        <path
          d={d + ` V ${PAD.top + innerH} L ${xOf(0)} ${PAD.top + innerH} Z`}
          fill={cfg.color} fillOpacity="0.08"
        />
      )}

      {/* Line */}
      {d && <path d={d} fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

      {/* Dots */}
      {points.map((p, i) =>
        p ? (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={cfg.color} strokeWidth="2" />
        ) : null
      )}
    </svg>
  )
}

function getLast14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return localDateStr(d)
  })
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return localDateStr(d)
  })
}

export default function HealthPage() {
  const today = localDateStr()
  const pet = getActivePet()

  const [form, setForm] = useState<HealthLog>({
    date: today, breathingRate: '', waterIntake: '', mealAmount: '', vitality: null, notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [metric, setMetric] = useState<ChartMetric>('vitality')
  const [range, setRange] = useState<7 | 14>(7)
  const [allLogs, setAllLogs] = useState<HealthLog[]>([])

  useEffect(() => {
    const existing = getTodayLog()
    if (existing) setForm(existing)
    setAllLogs(getHealthLogs())
  }, [])

  function handleSave() {
    saveHealthLog(form)
    setAllLogs(getHealthLogs())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const days = range === 7 ? getLast7Days() : getLast14Days()
  const logMap = Object.fromEntries(allLogs.map(l => [l.date, l]))
  const chartLogs = days.map(d => logMap[d] ?? { date: d, breathingRate: '', waterIntake: '', mealAmount: '', vitality: null, notes: '' })

  const streak = (() => {
    let count = 0
    const d = new Date()
    // 오늘 기록을 아직 안 넣었다고 해서 그동안의 연속 기록이 끊긴 건 아니므로,
    // 오늘 항목이 비어있으면 어제부터 세기 시작한다.
    if (!logMap[localDateStr(d)]) {
      d.setDate(d.getDate() - 1)
    }
    while (true) {
      const key = localDateStr(d)
      if (!logMap[key]) break
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">건강 일지</h1>
        {streak > 0 && (
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
            🔥 {streak}일 연속 기록
          </span>
        )}
      </div>

      {/* 오늘 기록 입력 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">오늘 기록</p>
          {pet && <p className="text-xs text-green-600">{pet.emoji || '🐾'} {pet.name}</p>}
        </div>

        {/* 활력도 */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">활력도</label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => setForm(f => ({ ...f, vitality: f.vitality === v ? null : v }))}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl border-2 transition-all ${
                  form.vitality === v
                    ? 'border-green-500 bg-green-50'
                    : 'border-transparent bg-gray-50'
                }`}
              >
                <span className="text-xl">{VITALITY_EMOJI[v]}</span>
                <span className="text-[9px] text-gray-400 mt-0.5">{v}점</span>
              </button>
            ))}
          </div>
        </div>

        {/* 식사량 / 음수량 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'mealAmount', label: '식사량', placeholder: '예: 200', unit: 'ml' },
            { key: 'waterIntake', label: '음수량', placeholder: '예: 300', unit: 'ml' },
          ].map(({ key, label, placeholder, unit }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <input
                  type="number"
                  value={(form as Record<string, string | number | null>)[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  min="0"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none w-0"
                />
                <span className="text-xs text-gray-400 pr-3">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 호흡수 */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">분당 호흡수 (안정 시)</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <input
              type="number"
              value={form.breathingRate}
              onChange={e => setForm(f => ({ ...f, breathingRate: e.target.value }))}
              placeholder="예: 20"
              min="0"
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
            />
            <span className="text-xs text-gray-400 pr-3">회/분</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">정상 범위: 강아지 15~30회, 고양이 20~30회</p>
        </div>

        {/* 특이사항 */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">특이사항</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="오늘 특이한 점을 기록해주세요..."
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {saved ? <><Check size={15} /> 저장됨</> : '오늘 기록 저장'}
        </button>
      </div>

      {/* 추세 그래프 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800">추세 보기</p>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {([7, 14] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  range === r ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
                }`}
              >
                {r}일
              </button>
            ))}
          </div>
        </div>

        {/* 지표 선택 탭 */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {(Object.keys(METRIC_CONFIG) as ChartMetric[]).map(m => {
            const cfg = METRIC_CONFIG[m]
            return (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  metric === m
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
                style={metric === m ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>

        <LineChart logs={chartLogs} metric={metric} />

        <p className="text-[10px] text-gray-400 text-center mt-1">
          단위: {METRIC_CONFIG[metric].unit}
        </p>
      </div>

      {/* 최근 기록 목록 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-3">최근 기록</p>
        {allLogs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">아직 기록이 없어요</p>
        ) : (
          <div className="space-y-2">
            {[...allLogs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
              .map(log => {
                const d = new Date(log.date)
                const label = log.date === today ? '오늘' :
                  `${d.getMonth() + 1}/${d.getDate()}`
                return (
                  <div key={log.date} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-semibold text-gray-400 w-10 flex-shrink-0">{label}</span>
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      {log.vitality && (
                        <span className="text-sm">{VITALITY_EMOJI[log.vitality]}</span>
                      )}
                      {log.mealAmount && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">식사 {log.mealAmount}ml</span>
                      )}
                      {log.waterIntake && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">음수 {log.waterIntake}ml</span>
                      )}
                      {log.breathingRate && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">호흡 {log.breathingRate}회</span>
                      )}
                    </div>
                    {log.notes && (
                      <span className="text-[10px] text-gray-400 max-w-[80px] truncate">{log.notes}</span>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
