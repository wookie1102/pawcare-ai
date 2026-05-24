import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') ?? '37.5665'
  const lng = searchParams.get('lng') ?? '126.9780'

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=동물병원&x=${lng}&y=${lat}&radius=5000&sort=distance`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  )

  const data = await res.json()
  return NextResponse.json(data)
}
