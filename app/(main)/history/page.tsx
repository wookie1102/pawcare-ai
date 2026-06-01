'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { getConsultations, type ConsultationRecord } from '@/lib/storage'

const URGENCY_COLORS: Record<string, string> = {
  emergency: 'bg-red-50 border-red-200',
  caution: 'bg-yellow-50 border-yellow-200',
  watch: 'bg-green-50 border-green-200',
}

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function UrgencyBadge({ record }: { record: ConsultationRecord }) {
  if (record.mode === 'behavior') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
        행동분석
      </span>
    )
  }
  const map = { emergency: ['bg-red-100 text-red-600', '긴급'], caution: ['bg-yellow-100 text-yellow-700', '주의'], watch: ['bg-green-100 text-green-600', '관찰'] } as const
  const [cls, label] = map[record.urgency]
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function DetailView({ record, onBack }: { record: ConsultationRecord; onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto flex flex-col h-screen">
      <div className="px-4 pt-6 pb-3 bg-gray-50 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 mb-2 hover:text-gray-700"
        >
          <ChevronLeft size={16} />
          상담 기록
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">{record.mode === 'behavior' ? '🐾' : '🩺'}</span>
          <span className="text-sm font-bold text-gray-800">{record.petName}</span>
          <UrgencyBadge record={record} />
          <span className="text-xs text-gray-400 ml-auto">{formatFullDate(record.date)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-8">
        {!record.messages || record.messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-12">
            <MessageCircle size={32} className="text-gray-200 mx-auto mb-3" />
            대화 내용이 저장되지 않은 기록이에요.
          </div>
        ) : (
          record.messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'ai' ? (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    🐾
                  </div>
                  <div className="max-w-[85%]">
                    {msg.isResult ? (
                      <div className={`rounded-2xl rounded-tl-sm border p-4 ${URGENCY_COLORS[msg.urgency || 'watch']}`}>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                          {msg.content}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3.5">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    )}
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
          ))
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([])
  const [selected, setSelected] = useState<ConsultationRecord | null>(null)

  useEffect(() => {
    setConsultations(getConsultations())
  }, [])

  if (selected) {
    return <DetailView record={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">상담 기록</h1>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <MessageCircle size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-1">아직 상담 기록이 없어요.</p>
          <p className="text-gray-400 text-sm">첫 상담을 시작해보세요! 🐾</p>
        </div>
      ) : (
        <div className="space-y-2">
          {consultations.map(record => (
            <button
              key={record.id}
              onClick={() => setSelected(record)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="text-lg mt-0.5">{record.mode === 'behavior' ? '🐾' : '🩺'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{record.petName}</span>
                    <UrgencyBadge record={record} />
                    <span className="text-xs text-gray-300 ml-auto">{formatRelativeDate(record.date)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{record.symptomText}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
