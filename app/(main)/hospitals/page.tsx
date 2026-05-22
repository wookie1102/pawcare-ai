'use client'

import { useState } from 'react'
import { Phone, Clock, MapPin, Star, AlertTriangle } from 'lucide-react'
import LegalDisclaimer from '@/components/LegalDisclaimer'

type Hospital = {
  id: string
  name: string
  distance: string
  distanceNum: number
  status: 'open' | 'emergency' | 'closed'
  openHours: string
  phone: string
  rating: number
  reviewCount: number
  address: string
  specialties: string[]
}

const HOSPITALS: Hospital[] = [
  {
    id: '1', name: '서울동물의료센터', distance: '0.3km', distanceNum: 0.3,
    status: 'emergency', openHours: '24시간 운영', phone: '02-1234-5678',
    rating: 4.9, reviewCount: 312, address: '강남구 역삼동 123',
    specialties: ['응급', '외과', '내과', '심장'],
  },
  {
    id: '2', name: '그린동물병원', distance: '0.8km', distanceNum: 0.8,
    status: 'open', openHours: '09:00 – 21:00', phone: '02-2345-6789',
    rating: 4.8, reviewCount: 187, address: '강남구 논현동 45',
    specialties: ['내과', '피부', '치과'],
  },
  {
    id: '3', name: '행복한동물병원', distance: '1.2km', distanceNum: 1.2,
    status: 'open', openHours: '09:00 – 20:00', phone: '02-3456-7890',
    rating: 4.7, reviewCount: 94, address: '서초구 반포동 88',
    specialties: ['내과', '외과', '안과'],
  },
  {
    id: '4', name: '골든동물의료원', distance: '1.9km', distanceNum: 1.9,
    status: 'emergency', openHours: '24시간 운영', phone: '02-4567-8901',
    rating: 4.6, reviewCount: 241, address: '서초구 잠원동 17',
    specialties: ['응급', '신경', '종양', '외과'],
  },
  {
    id: '5', name: '미래동물병원', distance: '2.3km', distanceNum: 2.3,
    status: 'closed', openHours: '09:00 – 18:00 (토요일만)', phone: '02-5678-9012',
    rating: 4.5, reviewCount: 58, address: '강남구 신사동 209',
    specialties: ['내과', '소동물'],
  },
  {
    id: '6', name: '한강동물병원', distance: '2.8km', distanceNum: 2.8,
    status: 'open', openHours: '10:00 – 19:00', phone: '02-6789-0123',
    rating: 4.4, reviewCount: 73, address: '용산구 이촌동 55',
    specialties: ['내과', '피부', '재활'],
  },
]

type Filter = 'all' | 'open' | 'emergency'

const STATUS_CONFIG = {
  open: { label: '영업중', bg: 'bg-green-100', text: 'text-green-700' },
  emergency: { label: '24시 응급', bg: 'bg-red-100', text: 'text-red-600' },
  closed: { label: '마감', bg: 'bg-gray-100', text: 'text-gray-400' },
}

export default function HospitalsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')

  const filtered = HOSPITALS
    .filter(h => {
      if (filter === 'open') return h.status === 'open' || h.status === 'emergency'
      if (filter === 'emergency') return h.status === 'emergency'
      return true
    })
    .sort((a, b) => sortBy === 'distance' ? a.distanceNum - b.distanceNum : b.rating - a.rating)

  return (
    <div className="max-w-md mx-auto pb-4">
      {/* 지도 영역 (더미) */}
      <div className="relative h-44 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
        {/* 지도 격자 패턴 */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#166534" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* 도로 */}
          <line x1="0" y1="90" x2="400" y2="90" stroke="#166534" strokeWidth="3" opacity="0.4"/>
          <line x1="180" y1="0" x2="180" y2="180" stroke="#166534" strokeWidth="2" opacity="0.3"/>
          <line x1="80" y1="0" x2="80" y2="180" stroke="#166534" strokeWidth="1.5" opacity="0.2"/>
          <line x1="0" y1="40" x2="400" y2="40" stroke="#166534" strokeWidth="1" opacity="0.2"/>
          <line x1="0" y1="140" x2="400" y2="140" stroke="#166534" strokeWidth="1" opacity="0.2"/>
        </svg>
        {/* 내 위치 */}
        <div className="absolute" style={{ left: '50%', top: '55%', transform: 'translate(-50%,-50%)' }}>
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
          <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping" />
        </div>
        {/* 병원 핀 */}
        {[
          { x: '35%', y: '30%', emergency: true },
          { x: '65%', y: '45%', emergency: false },
          { x: '25%', y: '65%', emergency: false },
          { x: '72%', y: '20%', emergency: true },
        ].map((pin, i) => (
          <div key={i} className="absolute" style={{ left: pin.x, top: pin.y, transform: 'translate(-50%,-100%)' }}>
            <div className={`w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold ${pin.emergency ? 'bg-red-500' : 'bg-green-500'}`}>
              {pin.emergency ? '응' : '병'}
            </div>
          </div>
        ))}
        {/* 지도 안내 */}
        <div className="absolute bottom-2 right-2 bg-white/80 rounded-lg px-2 py-1">
          <p className="text-[9px] text-gray-500">현재 위치 기반 더미 데이터</p>
        </div>
        <div className="absolute bottom-2 left-2 bg-white/80 rounded-lg px-2 py-1 flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-[9px] text-gray-600">내 위치</span>
          <div className="w-2 h-2 bg-red-500 rounded-full ml-1" />
          <span className="text-[9px] text-gray-600">24시 응급</span>
          <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
          <span className="text-[9px] text-gray-600">일반</span>
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* 필터 + 정렬 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            {([['all', '전체'], ['open', '영업중'], ['emergency', '24시 응급']] as const).map(([f, label]) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {([['distance', '거리순'], ['rating', '평점순']] as const).map(([s, label]) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  sortBy === s ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 병원 리스트 */}
        <div className="space-y-2.5">
          {filtered.map(h => {
            const status = STATUS_CONFIG[h.status]
            return (
              <div key={h.id} className={`bg-white rounded-2xl p-4 shadow-sm ${h.status === 'closed' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-800">{h.name}</h3>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                        {h.status === 'emergency' && '🚨 '}{status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} />
                        {h.distance}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {h.rating} ({h.reviewCount})
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${h.phone}`}
                    className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors flex-shrink-0 ml-2"
                  >
                    <Phone size={11} />
                    전화
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  <Clock size={11} />
                  <span>{h.openHours}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {h.specialties.map(s => (
                    <span key={s} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex gap-2">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-0.5">응급 상황이라면?</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                즉시 가장 가까운 24시 응급 동물병원으로 이동하세요.<br />
                이동 중 전화로 상태를 미리 알려주세요.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-300 text-center mt-3">
          병원 정보는 데모용 더미 데이터입니다. 카카오맵/구글맵 API 연동 시 실제 정보가 표시됩니다.
        </p>
      </div>

      <LegalDisclaimer />
    </div>
  )
}
