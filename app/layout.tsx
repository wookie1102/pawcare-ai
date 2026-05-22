import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PawCare AI — 반려동물 AI 증상 상담',
  description: '수의사 교수님의 1,839개 실제 상담 데이터를 학습한 AI가 반려동물 증상을 분석해드립니다.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PawCare AI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased max-w-md mx-auto min-h-screen">
        {children}
      </body>
    </html>
  )
}
