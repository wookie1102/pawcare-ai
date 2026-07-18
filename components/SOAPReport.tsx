'use client'

import { useRef, useState } from 'react'
import { X, Copy, Check, Download, Share2 } from 'lucide-react'
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
  imageDataUrl?: string
}

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  watch: '🟢 관찰 (집에서 지켜봐도 괜찮음)',
  caution: '🟡 주의 (가까운 시일 내 병원 방문 권장)',
  emergency: '🔴 긴급 (즉시 응급 병원 방문 필요)',
}

const SYSTEM_LABEL: Record<QuestionSystem, string> = {
  respiratory: '호흡기계',
  neurological: '신경계',
  urinary: '비뇨기계',
  digestive: '소화기계',
  skin: '피부계',
  eye: '안과',
  ear: '이과(귀)',
  orthopedic: '정형외과(근골격계)',
  dental: '구강/치과',
  lump: '혹/종괴',
  endocrine: '내분비계',
  general: '전반적',
}

const PLAN: Record<UrgencyLevel, string> = {
  watch: '보호자 모니터링 지속. 증상 악화 시 내원 권고. 24~48시간 내 호전 없으면 재평가 권장.',
  caution: '빠른 시일 내 진료 필요. 추가 검사(혈액, 방사선, 초음파) 고려. 증상 악화 시 즉시 응급 내원.',
  emergency: '즉각 응급 처치 및 입원 평가 필요. 산소 공급, 정맥 수액, 모니터링 준비 요망.',
}

export default function SOAPReport({ onClose, symptomText, profile, urgency, systems, questions, answers, imageDataUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const [imageBusy, setImageBusy] = useState<'save' | 'share' | null>(null)
  const [actionError, setActionError] = useState('')
  const captureRef = useRef<HTMLDivElement>(null)

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
    ...(imageDataUrl ? ['(보호자가 첨부한 사진 1장 — 이미지로 저장/공유 시 함께 포함돼요)'] : []),
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

  async function captureReportImage(): Promise<Blob | null> {
    if (!captureRef.current) return null
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // 사진으로 저장/공유했을 때 글씨가 뭉개지지 않도록 고해상도로 캡처
    })
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  }

  async function saveAsImage() {
    setActionError('')
    setImageBusy('save')
    try {
      const blob = await captureReportImage()
      if (!blob) throw new Error('capture failed')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pawcare-soap-${profile?.name || '반려동물'}-${now.toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setActionError('이미지 저장에 실패했어요. 다시 시도해주세요.')
    } finally {
      setImageBusy(null)
    }
  }

  async function shareReport() {
    setActionError('')
    setImageBusy('share')
    try {
      const blob = await captureReportImage()
      const fileName = `pawcare-soap-${now.toISOString().split('T')[0]}.png`
      const file = blob ? new File([blob], fileName, { type: 'image/png' }) : null

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'PawCare AI SOAP 리포트',
          text: `${profile?.name || '반려동물'}의 상담 리포트예요.`,
        })
      } else if (navigator.share) {
        // 파일 공유를 지원하지 않는 브라우저: 텍스트로라도 공유
        await navigator.share({ title: 'PawCare AI SOAP 리포트', text: reportText })
      } else {
        // Web Share API 자체가 없는 환경(주로 데스크톱): 클립보드 복사로 대체
        await navigator.clipboard.writeText(reportText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      // 사용자가 공유 시트를 취소한 경우(AbortError)는 에러로 취급하지 않는다
      if (err instanceof Error && err.name !== 'AbortError') {
        setActionError('공유에 실패했어요. 다시 시도해주세요.')
      }
    } finally {
      setImageBusy(null)
    }
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
        <div ref={captureRef} className="space-y-4 bg-white">
          {/* S */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center justify-center">S</span>
              <span className="text-xs font-semibold text-gray-600">주관적 (Subjective)</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">보호자 설명</p>
              <p className="text-sm text-gray-800">{symptomText}</p>
              {imageDataUrl && (
                <img
                  src={imageDataUrl}
                  alt="보호자가 첨부한 사진"
                  className="mt-2 max-h-40 rounded-lg border border-gray-200 object-cover"
                />
              )}
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
        </div>

        {/* 액션 버튼 */}
        <div className="px-5 pb-6 pt-2 border-t border-gray-100 flex-shrink-0 space-y-2">
          {actionError && <p className="text-xs text-red-500 text-center">{actionError}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveAsImage}
              disabled={imageBusy !== null}
              className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Download size={15} />
              {imageBusy === 'save' ? '저장 중...' : '이미지로 저장'}
            </button>
            <button
              onClick={shareReport}
              disabled={imageBusy !== null}
              className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Share2 size={15} />
              {imageBusy === 'share' ? '공유 중...' : '공유하기'}
            </button>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            {copied ? <><Check size={16} /> 복사됐어요!</> : <><Copy size={16} /> 클립보드에 텍스트로 복사</>}
          </button>
        </div>
      </div>
    </div>
  )
}
