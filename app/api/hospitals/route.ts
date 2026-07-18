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

  // Kakao가 에러(예: 키 만료·잘못된 키)를 응답하면 documents 필드가 없어서
  // 클라이언트가 "주변 동물병원이 없어요"로 오인할 수 있다 — 응급 상황에서
  // 실제로는 검색 실패인데 "진짜 병원이 없다"고 잘못 안내하면 안 되므로
  // 상태 코드를 그대로 전달해서 클라이언트가 에러로 구분할 수 있게 한다.
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json(data)
}
