import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params
  const size = parseInt(sizeStr) || 192
  const radius = size * 0.22

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: size * 0.42,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            letterSpacing: '-2px',
            display: 'flex',
          }}
        >
          P
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
