'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronRight, RotateCcw, FileText, MapPin } from 'lucide-react'
import LegalDisclaimer from '@/components/LegalDisclaimer'
import SOAPReport from '@/components/SOAPReport'
import {
  detectEmergency,
  detectSystems,
  buildQuestionQueue,
  checkAnswerForEmergency,
  assessUrgency,
  makeResultMessage,
  detectBehaviorType,
  buildBehaviorQuestions,
  makeBehaviorResultMessage,
  getBehaviorTypeName,
  answerFollowUp,
  generateOpener,
  reorderByChiefComplaint,
  type Question,
  type QuestionSystem,
  type UrgencyLevel,
  type BehaviorType,
} from '@/lib/chatLogic'
import { getActivePet, saveConsultation, type PetProfile, type ConsultationMessage } from '@/lib/storage'

type Step = 'intro' | 'symptom' | 'questioning' | 'result'

type Message = {
  id: string
  role: 'ai' | 'user'
  content: string
  options?: string[]
  isResult?: boolean
  urgency?: UrgencyLevel
}

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  emergency: 'bg-red-50 border-red-200',
  caution: 'bg-yellow-50 border-yellow-200',
  watch: 'bg-green-50 border-green-200',
}

export default function ChatPage() {
  const [step, setStep] = useState<Step>('intro')
  const [mode, setMode] = useState<'symptom' | 'behavior'>('symptom')
  const [symptomText, setSymptomText] = useState('')
  const [profile, setProfile] = useState<PetProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [systems, setSystems] = useState<QuestionSystem[]>([])
  const [urgency, setUrgency] = useState<UrgencyLevel>('watch')
  const [emergencyStop, setEmergencyStop] = useState(false)
  const [behaviorType, setBehaviorType] = useState<BehaviorType>('general_behavior')
  const [showSOAP, setShowSOAP] = useState(false)
  const [followUpText, setFollowUpText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const savedRef = useRef(false)

  useEffect(() => {
    setProfile(getActivePet())
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (step === 'result' && messages.length > 0 && !savedRef.current) {
      savedRef.current = true
      saveConsultation({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        petName: profile?.name || '반려동물',
        petId: profile?.id,
        mode,
        symptomText,
        urgency,
        behaviorType,
        systems,
        messages: messages.map(({ id, role, content, isResult, urgency: u }): ConsultationMessage => ({
          id, role, content, isResult, urgency: u,
        })),
      })
    }
  }, [step, messages, profile, mode, symptomText, urgency, behaviorType, systems])

  function reset() {
    setStep('intro')
    setSymptomText('')
    setMessages([])
    setQuestions([])
    setQIndex(0)
    setAnswers({})
    setSystems([])
    setUrgency('watch')
    setEmergencyStop(false)
    setBehaviorType('general_behavior')
    setShowSOAP(false)
    setFollowUpText('')
    savedRef.current = false
  }

  function addAiMessage(content: string, opts?: Partial<Message>) {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content, ...opts }])
  }

  function addUserMessage(content: string) {
    setMessages(prev => [...prev, { id: Date.now().toString() + 'u', role: 'user', content }])
  }

  function startQuestioning(text: string) {
    // 행동 분석 모드
    if (mode === 'behavior') {
      const bType = detectBehaviorType(text)
      setBehaviorType(bType)
      const queue = buildBehaviorQuestions(bType)
      setQuestions(queue)
      setQIndex(0)
      setStep('questioning')
      const petLabel = profile?.name ? `${profile.name}의 ` : ''
      addAiMessage(`${petLabel}${getBehaviorTypeName(bType)} 행동에 대해 더 파악해볼게요. 몇 가지 여쭤볼게요.`)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'q_' + queue[0].id,
          role: 'ai',
          content: queue[0].text,
          options: queue[0].options,
        }])
      }, 400)
      return
    }

    // 증상 상담 모드
    if (detectEmergency(text)) {
      addAiMessage(makeResultMessage('emergency', ['general'], profile?.name || '반려동물'), {
        isResult: true,
        urgency: 'emergency',
      })
      setUrgency('emergency')
      setEmergencyStop(true)
      setStep('result')
      return
    }

    const detectedSystems = detectSystems(text)
    setSystems(detectedSystems)
    const rawQueue = buildQuestionQueue(detectedSystems, profile)
    const queue = reorderByChiefComplaint(text, rawQueue)
    setQuestions(queue)
    setQIndex(0)
    setStep('questioning')

    const petName = profile?.name || '반려동물'
    addAiMessage(generateOpener(text, petName))

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 'q_' + queue[0].id,
        role: 'ai',
        content: queue[0].text,
        options: queue[0].options,
      }])
    }, 400)
  }

  function handleSymptomSubmit() {
    if (!symptomText.trim()) return
    addUserMessage(symptomText.trim())
    startQuestioning(symptomText.trim())
  }

  function handleOptionSelect(question: Question, answer: string) {
    addUserMessage(answer)
    const newAnswers = { ...answers, [question.id]: answer }
    setAnswers(newAnswers)

    if (checkAnswerForEmergency(question, answer)) {
      setTimeout(() => {
        const msg = makeResultMessage('emergency', systems, profile?.name || '반려동물')
        addAiMessage(msg, { isResult: true, urgency: 'emergency' })
        setUrgency('emergency')
        setEmergencyStop(true)
        setStep('result')
      }, 300)
      return
    }

    const nextIndex = qIndex + 1

    if (nextIndex >= questions.length) {
      if (mode === 'behavior') {
        setTimeout(() => {
          addAiMessage('분석이 끝났어요. 결과를 알려드릴게요.')
          setTimeout(() => {
            const msg = makeBehaviorResultMessage(behaviorType, profile?.name || '반려동물')
            addAiMessage(msg, { isResult: true, urgency: 'watch' })
            setStep('result')
          }, 400)
        }, 300)
      } else {
        const finalUrgency = assessUrgency(questions, newAnswers)
        setUrgency(finalUrgency)
        setTimeout(() => {
          addAiMessage('확인이 끝났어요. 결과를 알려드릴게요.')
          setTimeout(() => {
            const msg = makeResultMessage(finalUrgency, systems, profile?.name || '반려동물')
            addAiMessage(msg, { isResult: true, urgency: finalUrgency })
            setStep('result')
          }, 400)
        }, 300)
      }
    } else {
      setQIndex(nextIndex)
      const nextQ = questions[nextIndex]
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'q_' + nextQ.id,
          role: 'ai',
          content: nextQ.text,
          options: nextQ.options,
        }])
      }, 300)
    }
  }

  function handleFollowUp() {
    if (!followUpText.trim()) return
    const text = followUpText.trim()
    setFollowUpText('')
    addUserMessage(text)
    setTimeout(() => {
      addAiMessage(answerFollowUp(text))
    }, 300)
  }

  const petLabel = profile ? `${profile.name} (${profile.breed})` : null

  return (
    <div className="max-w-md mx-auto flex flex-col h-screen">
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI 증상 상담</h1>
            {petLabel && <p className="text-xs text-green-600 mt-0.5">🐾 {petLabel}</p>}
          </div>
          {step !== 'intro' && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw size={13} />
              다시 시작
            </button>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {step === 'intro' && (
          <div className="space-y-3">
            {!profile && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-sm text-green-700 font-medium mb-1">💡 반려동물 정보를 등록하면</p>
                <p className="text-xs text-green-600 mb-3">견종, 기저질환에 맞는 맞춤 질문을 드릴 수 있어요.</p>
                <Link href="/profile">
                  <span className="text-xs text-green-700 font-semibold underline">프로필 등록하러 가기 →</span>
                </Link>
              </div>
            )}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              {/* 모드 선택 탭 */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMode('symptom')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    mode === 'symptom' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  🩺 증상 상담
                </button>
                <button
                  onClick={() => setMode('behavior')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    mode === 'behavior' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  🐾 행동 분석
                </button>
              </div>

              {mode === 'symptom' ? (
                <>
                  <p className="text-sm font-semibold text-gray-800 mb-1">어떤 증상이 있나요?</p>
                  <p className="text-xs text-gray-400 mb-4">
                    증상을 자세히 설명해 주실수록 더 정확한 안내가 가능해요.<br />
                    예: &quot;어제부터 기침을 많이 하고 밥을 안 먹어요&quot;
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-800 mb-1">어떤 행동이 걱정되나요?</p>
                  <p className="text-xs text-gray-400 mb-4">
                    행동을 자세히 설명해주시면 심리적 원인과 개선 방법을 알려드려요.<br />
                    예: &quot;혼자 두면 계속 짖어요&quot;, &quot;다른 개를 보면 달려들어요&quot;
                  </p>
                </>
              )}
              <textarea
                value={symptomText}
                onChange={e => setSymptomText(e.target.value)}
                placeholder={mode === 'symptom' ? '증상을 입력해주세요...' : '행동을 설명해주세요...'}
                rows={4}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
              <button
                onClick={handleSymptomSubmit}
                disabled={!symptomText.trim()}
                className={`mt-3 w-full disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors text-sm ${
                  mode === 'behavior' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {mode === 'symptom' ? '상담 시작하기' : '행동 분석 시작하기'}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-600 mb-2">긴급도 안내</p>
              <div className="space-y-1.5">
                {[
                  { color: 'bg-green-500', label: '관찰', desc: '집에서 지켜봐도 괜찮아요' },
                  { color: 'bg-yellow-400', label: '주의', desc: '가까운 시일 내 병원 방문 권장' },
                  { color: 'bg-red-500', label: '긴급', desc: '즉시 병원에 가세요' },
                ].map(({ color, label, desc }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                    <span className="text-xs font-medium text-gray-700 w-8">{label}</span>
                    <span className="text-xs text-gray-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step !== 'intro' && messages.map(msg => (
          <div key={msg.id}>
            {msg.role === 'ai' ? (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  🐾
                </div>
                <div className="max-w-[85%]">
                  {msg.isResult ? (
                    <div className={`rounded-2xl rounded-tl-sm border p-4 ${URGENCY_COLORS[msg.urgency || 'watch']}`}>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</pre>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3.5">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}
                  {msg.options && (() => {
                    // msg.id가 'q_{questionId}' 형태일 때 해당 질문을 찾음
                    const qId = msg.id.startsWith('q_') ? msg.id.slice(2) : null
                    const question = qId ? questions.find(q => q.id === qId) : null
                    const isAnswered = question ? answers[question.id] !== undefined : false
                    return (
                      <div className="mt-2 space-y-1.5">
                        {msg.options.map(opt => {
                          const isSelected = question ? answers[question.id] === opt : false
                          return (
                            <button
                              key={opt}
                              disabled={isAnswered}
                              onClick={() => {
                                if (question && !isAnswered) handleOptionSelect(question, opt)
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm border transition-all ${
                                isSelected
                                  ? 'bg-green-500 text-white border-green-500'
                                  : isAnswered
                                  ? 'bg-gray-50 text-gray-300 border-gray-100'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50 active:scale-[0.98]'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-green-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {step === 'result' && (
          <div className="space-y-3 mt-2">
            {urgency === 'emergency' && mode === 'symptom' && (
              <div className="bg-red-500 text-white rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle size={20} className="flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">지금 바로 병원으로 가세요!</p>
                    <p className="text-xs text-red-100 mt-0.5">응급 증상이 감지되었습니다</p>
                  </div>
                </div>
                <Link href="/hospitals">
                  <div className="bg-white text-red-500 font-bold py-2.5 rounded-xl text-sm text-center flex items-center justify-center gap-1.5">
                    <MapPin size={14} />
                    근처 동물병원 찾기
                  </div>
                </Link>
              </div>
            )}
            {urgency === 'caution' && mode === 'symptom' && (
              <Link href="/hospitals">
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 font-semibold py-3 rounded-xl text-sm text-center flex items-center justify-center gap-1.5 hover:bg-yellow-100 transition-colors">
                  <MapPin size={14} />
                  가까운 시일 내 병원 방문을 권장해요 →
                </div>
              </Link>
            )}
            <div className="space-y-2">
              <button
                onClick={() => setShowSOAP(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold py-3 rounded-xl text-sm hover:bg-blue-100 transition-colors"
              >
                <FileText size={15} />
                수의사용 SOAP 리포트 보기
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={reset}
                  className="bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm"
                >
                  새 상담 시작
                </button>
                <Link href="/history">
                  <div className="bg-green-500 text-white font-semibold py-3 rounded-xl text-sm text-center flex items-center justify-center gap-1">
                    기록 보기 <ChevronRight size={14} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 결과 후 추가 질문 입력창 */}
      {step === 'result' && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-1.5">💬 더 궁금한 점이 있으신가요?</p>
          <div className="flex gap-2">
            <input
              value={followUpText}
              onChange={e => setFollowUpText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && followUpText.trim()) handleFollowUp() }}
              placeholder="궁금한 점을 입력해주세요..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleFollowUp}
              disabled={!followUpText.trim()}
              className="px-4 py-2 bg-green-500 disabled:bg-green-200 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      )}

      <LegalDisclaimer />

      {showSOAP && (
        <SOAPReport
          onClose={() => setShowSOAP(false)}
          symptomText={symptomText}
          profile={profile}
          urgency={urgency}
          systems={systems}
          questions={questions}
          answers={answers}
        />
      )}
    </div>
  )
}
