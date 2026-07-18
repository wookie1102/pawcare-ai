'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMapInstance, Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

export default function LeafletMap({ lat, lng, hospitals }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMapInstance | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then(L => {
      const map = L.map(containerRef.current!).setView([lat, lng], 14)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      // 내 위치 마커
      const myIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([lat, lng], { icon: myIcon }).addTo(map).bindPopup('내 위치')
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [lat, lng])

  // 병원 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || hospitals.length === 0) return

    import('leaflet').then(L => {
      const map = mapRef.current
      if (!map) return

      // 기존 마커 제거
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const hospitalIcon = L.divIcon({
        html: `<div style="width:22px;height:22px;background:#22C55E;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.3)">병</div>`,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      hospitals.forEach(h => {
        const marker = L.marker([Number(h.y), Number(h.x)], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(
            `<b style="font-size:13px">${h.place_name}</b><br>` +
            `<span style="font-size:11px;color:#555">${h.road_address_name || h.address_name}</span>` +
            (h.phone ? `<br><span style="font-size:11px">📞 ${h.phone}</span>` : '')
          )
        markersRef.current.push(marker)
      })
    })
  }, [hospitals])

  return <div ref={containerRef} className="w-full h-full" />
}
