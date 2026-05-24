'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window { kakao: any }
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
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    const initMap = () => {
      if (!containerRef.current) return
      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(lat, lng)
        const map = new window.kakao.maps.Map(containerRef.current, { center, level: 5 })
        mapRef.current = map

        // 내 위치 마커
        const myIcon = new window.kakao.maps.CustomOverlay({
          map,
          position: center,
          content: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>',
          zIndex: 10,
        })
      })
    }

    if (window.kakao?.maps) {
      initMap()
      return
    }

    if (document.getElementById('kakao-sdk')) {
      const interval = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(interval); initMap() }
      }, 100)
      return () => clearInterval(interval)
    }

    const script = document.createElement('script')
    script.id = 'kakao-sdk'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`
    script.onload = initMap
    document.head.appendChild(script)

    return () => { mapRef.current = null }
  }, [lat, lng])

  // 병원 마커
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps || hospitals.length === 0) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    hospitals.forEach(h => {
      const pos = new window.kakao.maps.LatLng(Number(h.y), Number(h.x))
      const marker = new window.kakao.maps.Marker({ map: mapRef.current, position: pos })
      const iw = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;white-space:nowrap">${h.place_name}</div>`,
      })
      window.kakao.maps.event.addListener(marker, 'click', () => iw.open(mapRef.current, marker))
      markersRef.current.push(marker)
    })
  }, [hospitals])

  return <div ref={containerRef} className="w-full h-full" />
}
