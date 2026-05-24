import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') ?? '37.5665'
  const lng = searchParams.get('lng') ?? '126.9780'

  const res = await fetch(
    `https://dapi.kakao.com/v2/maps/staticmap?center=${lng},${lat}&level=5&w=400&h=200&marker=pos(${lng} ${lat})`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error('[map-image] Kakao error:', res.status, text)
    return NextResponse.json({ error: res.status, detail: text }, { status: res.status })
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
