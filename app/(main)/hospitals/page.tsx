'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Phone, AlertTriangle, Loader2, RefreshCw, Navigation, ExternalLink } from 'lucide-react'
import LegalDisclaimer from '@/components/LegalDisclaimer'

const KakaoMap = dynamic(() => import('@/components/KakaoMap'), { ssr: false })

type KakaoPlace = {
  id: string
  place_name: string
  distance: string
  phone: string
  road_address_name: string
  address_name: string
  x: string
  y: string
  place_url: string
}

export default function HospitalsPage() {
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)

  const fetchHospitals = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}`)
      const data = await res.json()
      if (!res.ok) {
        // 검색 자체가 실패한 것이라 "병원이 없다"가 아니라 명확한 오류로 안내한다.
        setError('병원 검색에 실패했어요. 잠시 후 다시 시도하거나, 급하다면 포털에서 "동물병원"을 직접 검색해주세요.')
        setPlaces([])
        return
      }
      setPlaces(data.documents ?? [])
    } catch {
      setError('병원 정보를 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [])

  const requestLocation = useCallback(() => {
    setLoading(true)
    setError('')
    setLocationDenied(false)
    setPlaces([])

    if (!navigator.geolocation) {
      const fallback = { lat: 37.5665, lng: 126.9780 }
      setCoords(fallback)
      fetchHospitals(fallback.lat, fallback.lng)
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCoords({ lat, lng })
        fetchHospitals(lat, lng)
      },
      err => {
        if (err.code === 1) {
          setLocationDenied(true)
          setError('위치 권한이 거부됐어요. 아래 방법으로 허용해주세요.')
          setLoading(false)
        } else {
          const fallback = { lat: 37.5665, lng: 126.9780 }
          setCoords(fallback)
          setError('위치를 가져오지 못했어요. 서울 기준으로 표시합니다.')
          fetchHospitals(fallback.lat, fallback.lng)
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [fetchHospitals])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const sorted = [...places].sort((a, b) =>
    sortBy === 'distance'
      ? Number(a.distance) - Number(b.distance)
      : a.place_name.localeCompare(b.place_name)
  )

  return (
    <div className="max-w-md mx-auto pb-4">
      {/* 지도 영역 */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {coords ? (
          <KakaoMap lat={coords.lat} lng={coords.lng} hospitals={places} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-green-400" size={24} />
          </div>
        )}
      </div>

      <div className="px-4 pt-3">
        {/* 에러 안내 */}
        {error && (
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-1">
              <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">{error}</p>
            </div>
            {locationDenied && (
              <div className="text-xs text-amber-600 space-y-1 pl-5">
                <p>📱 <b>Android Chrome:</b> 주소창 자물쇠 → 위치 → 허용</p>
                <p>🍎 <b>iPhone Safari:</b> 설정 → Safari → 위치 → 허용</p>
                <button
                  onClick={requestLocation}
                  className="mt-2 w-full bg-amber-500 text-white text-xs font-semibold py-2 rounded-lg"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        )}

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">
            {loading ? '검색 중...' : places.length > 0 ? `주변 동물병원 ${places.length}개` : '주변 동물병원'}
          </p>
          <div className="flex items-center gap-1">
            {([['distance', '거리순'], ['name', '이름순']] as const).map(([s, label]) => (
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
            <button
              onClick={requestLocation}
              disabled={loading}
              className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center py-10 gap-2">
            <Loader2 className="animate-spin text-green-400" size={24} />
            <p className="text-xs text-gray-400">주변 동물병원 검색 중...</p>
          </div>
        )}

        {/* 병원 리스트 */}
        {!loading && (
          <div className="space-y-2.5">
            {sorted.map(place => (
              <div key={place.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-gray-800 flex-1 min-w-0 pr-2 leading-snug">
                    {place.place_name}
                  </h3>
                  {place.phone ? (
                    <a
                      href={`tel:${place.phone}`}
                      className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors flex-shrink-0"
                    >
                      <Phone size={11} />
                      전화
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-300 flex-shrink-0 pt-1">번호 없음</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {place.distance && (
                    <span className="flex items-center gap-0.5 font-medium text-green-600 flex-shrink-0">
                      <Navigation size={10} />
                      {Number(place.distance) >= 1000
                        ? `${(Number(place.distance) / 1000).toFixed(1)}km`
                        : `${place.distance}m`}
                    </span>
                  )}
                  <span className="truncate">{place.road_address_name || place.address_name}</span>
                  {place.place_url && (
                    <a href={place.place_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <ExternalLink size={10} className="text-gray-300 hover:text-gray-500" />
                    </a>
                  )}
                </div>
              </div>
            ))}

            {places.length === 0 && !loading && !error && (
              <p className="text-sm text-gray-400 text-center py-8">주변 동물병원이 없어요.</p>
            )}
          </div>
        )}

        {/* 응급 안내 */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex gap-2">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-0.5">응급 상황이라면?</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                즉시 가장 가까운 동물병원으로 이동하세요.<br />
                이동 중 전화로 상태를 미리 알려주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <LegalDisclaimer />
    </div>
  )
}
