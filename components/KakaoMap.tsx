'use client'

import { useEffect, useRef, useState } from 'react'

// Kakao Maps JS SDK에는 공식 타입 정의가 없어서, 실제로 쓰는 API 표면만 최소한으로 선언한다.
type KakaoLatLng = { getLat(): number; getLng(): number }
type KakaoMapInstance = { setCenter(latlng: KakaoLatLng): void }
type KakaoMarker = { setMap(map: KakaoMapInstance | null): void }
type KakaoInfoWindow = { open(map: KakaoMapInstance, marker: KakaoMarker): void }

interface KakaoMapsNamespace {
  load(callback: () => void): void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance
  CustomOverlay: new (options: { map: KakaoMapInstance; position: KakaoLatLng; content: string; zIndex?: number }) => unknown
  Marker: new (options: { map: KakaoMapInstance; position: KakaoLatLng }) => KakaoMarker
  InfoWindow: new (options: { content: string }) => KakaoInfoWindow
  event: {
    addListener(target: KakaoMarker, type: string, handler: () => void): void
  }
}

declare global {
  interface Window { kakao: { maps: KakaoMapsNamespace } }
}

type Hospital = {
  id: string
  place_name: string
  x: string
  y: string
  phone: string
  road_address_name: string
  address_name: string
}

type Props = {
  lat: number
  lng: number
  hospitals: Hospital[]
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY

export default function KakaoMap({ lat, lng, hospitals }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const markersRef = useRef<KakaoMarker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // SDK 로드 + 지도 초기화
  useEffect(() => {
    const initMap = () => {
      if (!containerRef.current) return
      window.kakao.maps.load(() => {
        if (!containerRef.current) return
        const center = new window.kakao.maps.LatLng(lat, lng)
        const map = new window.kakao.maps.Map(containerRef.current, { center, level: 5 })
        mapRef.current = map

        new window.kakao.maps.CustomOverlay({
          map,
          position: center,
          content: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>',
          zIndex: 10,
        })

        setMapReady(true)
      })
    }

    if (window.kakao?.maps) {
      initMap()
      return
    }

    const existing = document.getElementById('kakao-sdk')
    if (existing) {
      const interval = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(interval); initMap() }
      }, 100)
      return () => clearInterval(interval)
    }

    const script = document.createElement('script')
    script.id = 'kakao-sdk'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`
    script.setAttribute('referrerpolicy', 'no-referrer')
    script.onload = initMap
    script.onerror = () => console.error('Kakao Maps SDK 로드 실패')
    document.head.appendChild(script)
  }, [lat, lng])

  // 병원 마커 — 지도 준비 후에만 실행
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    // hospitals가 바뀔 때마다(새로고침 등) 이전 마커를 먼저 지워야 지도에 마커가 계속 쌓이지 않는다.
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    if (hospitals.length === 0) return

    hospitals.forEach(h => {
      const pos = new window.kakao.maps.LatLng(Number(h.y), Number(h.x))
      const marker = new window.kakao.maps.Marker({ map, position: pos })
      markersRef.current.push(marker)
      const iw = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;white-space:nowrap">${h.place_name}</div>`,
      })
      window.kakao.maps.event.addListener(marker, 'click', () => iw.open(map, marker))
    })
  }, [mapReady, hospitals])

  return <div ref={containerRef} className="w-full h-full" />
}
