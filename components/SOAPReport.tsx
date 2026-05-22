'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { PetProfile } from '@/lib/storage'
import type { QuestionSystem, UrgencyLevel, Question } from '@/lib/chatLogic'

type Props = {
  onClose: () => void
  symptomText: string
  profile: PetProfile | null
  urgency: UrgencyLevel
  systems: QuestionSystem[]
  questions: Question[]
  answers: Record<string, string>
}

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  watch: '🟢 관찰 (집에서 지켜봐도 괜찮음)',
  caution: '🟡 주의 (가까운 시일 내 병원 방문 권장)',
  emergency: '🔴 긴급 (즉시 응급 병원 방문 필요)',
}

const SYSTEM_LABEL: Partial<Record<QuestionSystem, string>> = {
  respiratory: '호흡기계',
  neurological: '신경계',
  urinary: '비뇨기계',
  digestive: '소화기계',
  general: '전반적',
}

const PLAN: Record<UrgencyLevel, string> = {
  watch: '보호자 모니터링 지속. 증상 악화 시 내원 권고. 24~48시간 내 호전 없으면 재평가 권장.',
  caution: '빠른 시일 내 진료 필요. 추가 검사(혈액, 방사선, 초음파) 고려. 증상 악화 시 즉시 응급 내원.',
  emergency: '즉각 응급 처치 및 입원 평가 필요. 산소 공급, 정맥 수액, 모니터링 준비 요망.',
}

export default function SOAPReport({ onClose, symptomText, profile, urgency, systems, questions, answers }: Props) {
  const [copied, setCopied] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const petInfo = profile
    ? [
        profile.name && `환자명: ${profile.name}`,
        profile.breed && `견종/품종: ${profile.breed}`,
        (profile.ageYears || profile.ageMonths) && `나이: ${profile.ageYears ? profile.ageYears + '살' : ''}${profile.ageMonths ? ' ' + profile.ageMonths + '개월' : ''}`.trim(),
        profile.weight && `체중: ${profile.weight}kg`,
        profile.conditions.length > 0 && `기저질환: ${profile.conditions.join(', ')}`,
        profile.notes && `특이사항: ${profile.notes}`,
      ].filter(Boolean).join('\n')
    : '반려동물 정보 미등록'

  const qaLines = questions
    .filter(q => answers[q.id])
    .map(q => `  • ${q.text}\n    → ${answers[q.id]}`)
    .join('\n')

  const systemLabel = systems.map(s => SYSTEM_LABEL[s]).filter(Boolean).join(', ')

  const reportText = [
    '═══════════════════════════════',
    'PawCare AI 수의사용 SOAP 리포트',
    `생성일시: ${dateStr}`,
    '═══════════════════════════════',
    '',
    '[S — 주관적 (Subjective)]',
    `보호자 설명: ${symptomText}`,
    '',
    '[O — 객관적 (Objective)]',
    petInfo,
    '',
    '보호자 답변:',
    qaLines || '  (답변 없음)',
    '',
    '[A — 판단 (Assessment)]',
    `긴급도: ${URGENCY_LABEL[urgency]}`,
    `관련 계통: ${systemLabel || '전반적'}`,
    '',
    '[P — 계획 (Plan)]',
    PLAN[urgency],
    '',
    '───────────────────────────────',
    '※ 본 리포트는 AI 분석 결과이며 수의사 진료를 대체하지 않습니다.',
    'PawCare AI — 반려동물 AI 증상 상담 서비스',
  ].join('\n')

  function copyToClipboard() {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-800">📋 수의사용 SOAP 리포트</h2>
            <p className="text-xs text-gray-400 mt-0.5">수의사에게 전달하거나 복사해서 사용하세요</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* S */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center justify-center">S</span>
              <span className="text-xs font-semibold text-gray-600">주관적 (Subjective)</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">보호자 설명</p>
              <p className="text-sm text-gray-800">{symptomText}</p>
            </div>
          </section>

          {/* O */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg flex items-center justify-center">O</span>
              <span className="text-xs font-semibold text-gray-600">객관적 (Objective)</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              {profile ? (
                <>
                  {[
                    ['환자명', profile.name],
                    ['견종/품종', profile.breed],
                    ['나이', `${profile.ageYears ? profile.ageYears + '살' : ''}${profile.ageMonths ? ' ' + profile.ageMonths + '개월' : ''}`.trim()],
                    ['체중', profile.weight ? profile.weight + 'kg' : ''],
                    ['기저질환', profile.conditions.join(', ')],
                    ['특이사항', profile.notes],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{k}</span>
                      <span className="text-xs text-gray-800">{v}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-xs text-gray-400">반려동물 정보 미등록</p>
              )}
              {qaLines && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <p className="text-xs text-gray-400 mb-1">보호자 답변</p>
                    {questions.filter(q => answers[q.id]).map(q => (
                      <div key={q.id} className="mb-1.5">
                        <p className="text-xs text-gray-500">{q.text}</p>
                        <p className="text-xs text-gray-800 font-medium">→ {answers[q.id]}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* A */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center justify-center">A</span>
              <span className="text-xs font-semibold text-gray-600">판단 (Assessment)</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="flex gap-2">
                <span className="text-xs text-gray-400 w-16 flex-shrink-0">긴급도</span>
                <span className="text-xs font-medium text-gray-800">{URGENCY_LABEL[urgency]}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-gray-400 w-16 flex-shrink-0">관련 계통</span>
                <span className="text-xs text-gray-800">{systemLabel || '전반적'}</span>
              </div>
            </div>
          </section>

          {/* P */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center justify-center">P</span>
              <span className="text-xs font-semibold text-gray-600">계획 (Plan)</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-800 leading-relaxed">{PLAN[urgency]}</p>
            </div>
          </section>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed pb-2">
            ※ 본 리포트는 AI 분석 결과이며 수의사 진료를 대체하지 않습니다.<br />
            생성일시: {dateStr}
          </p>
        </div>

        {/* 복사 버튼 */}
        <div className="px-5 pb-6 pt-2 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            {copied ? <><Check size={16} /> 복사됐어요!</> : <><Copy size={16} /> 클립보드에 복사</>}
          </button>
        </div>
      </div>
    </div>
  )
}
