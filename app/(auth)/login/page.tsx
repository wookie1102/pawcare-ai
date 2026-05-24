'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, AlertCircle, ExternalLink } from 'lucide-react'

function detectWebView(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  const isIOSWebView = /iPhone|iPad|iPod/.test(ua) && !/Safari\//.test(ua)
  const isAndroidWebView = /Android/.test(ua) && /wv/.test(ua)
  const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|KAKAOTALK|Snapchat|Twitter/.test(ua)
  return isIOSWebView || isAndroidWebView || isInAppBrowser
}

function openInExternalBrowser() {
  const url = window.location.href
  const ua = navigator.userAgent

  // Android: Chrome intent URL
  if (/Android/.test(ua)) {
    const scheme = url.startsWith('https') ? 'https' : 'http'
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`
    return
  }

  // iOS: try Chrome scheme, fall back to copy
  if (/iPhone|iPad/.test(ua)) {
    const chromeUrl = url.replace(/^https?:\/\//, 'googlechrome://')
    window.location.href = chromeUrl
  }
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isWebView, setIsWebView] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsWebView(detectWebView())
  }, [])

  const handleKakaoLogin = async () => {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError('카카오 로그인 중 오류가 발생했습니다.')
  }

  const handleGoogleLogin = async () => {
    if (isWebView) {
      openInExternalBrowser()
      return
    }
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError('구글 로그인 중 오류가 발생했습니다.')
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else {
      router.push('/home')
      router.refresh()
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-5">
      {/* 로고 */}
      <div className="mb-6 text-center">
        <div className="text-6xl mb-3">🐾</div>
        <h1 className="text-2xl font-bold text-green-800">PawCare AI</h1>
        <p className="text-green-600 text-sm mt-1">반려동물 AI 증상 상담</p>
      </div>

      {/* WebView 경고 배너 */}
      {isWebView && (
        <div className="w-full bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 mb-1">⚠️ 구글 로그인 사용 불가</p>
          <p className="text-xs text-amber-700 mb-3 leading-relaxed">
            현재 앱 내부 브라우저에서는 구글 정책상 구글 로그인이 차단돼요.
            <br />아래 중 하나를 선택해 주세요.
          </p>
          <div className="space-y-2">
            <button
              onClick={openInExternalBrowser}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              <ExternalLink size={15} />
              Chrome / Safari로 열기
            </button>
            <button
              onClick={copyUrl}
              className="w-full bg-white border border-amber-300 text-amber-700 font-medium py-2 rounded-xl text-xs"
            >
              {copied ? '✓ 링크 복사됨! Chrome에 붙여넣기 하세요' : '링크 복사하기'}
            </button>
          </div>
          <p className="text-[10px] text-amber-500 mt-2 text-center">
            또는 아래 이메일 로그인을 사용하세요 (WebView에서도 작동해요)
          </p>
        </div>
      )}

      <div className="w-full bg-white rounded-2xl shadow-sm p-6">

        {/* 이메일 폼 — WebView이면 맨 위로 */}
        {isWebView && (
          <>
            <p className="text-xs font-semibold text-gray-500 mb-3 text-center">이메일로 로그인</p>
            <form onSubmit={handleEmailLogin} className="space-y-3 mb-6">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={13} />{error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] disabled:bg-green-300 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">소셜 로그인 (Chrome/Safari 전용)</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          </>
        )}

        {/* 카카오 로그인 */}
        <button
          onClick={handleKakaoLogin}
          className={`w-full flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#FADA0A] active:scale-[0.98] text-[#3C1E1E] font-semibold py-3.5 rounded-xl transition-all mb-3 text-sm ${isWebView ? 'opacity-50' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.07 1.37 3.89 3.44 4.95l-.88 3.28 3.56-2.34c.44.07.9.11 1.38.11 4.14 0 7.5-2.69 7.5-6S13.14 1.5 9 1.5z" fill="#3C1E1E" />
          </svg>
          카카오로 로그인{isWebView ? ' ⚠️' : ''}
        </button>

        {/* 구글 로그인 */}
        <button
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-semibold py-3.5 rounded-xl transition-all mb-6 text-sm ${isWebView ? 'opacity-50' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.61-.05-1.22-.16-1.8H9v3.4h4.84a4.14 4.14 0 01-1.8 2.73v2.27h2.9c1.7-1.56 2.7-3.87 2.7-6.6z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.27c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.71H.96v2.34A9 9 0 009 18z" fill="#34A853"/>
            <path d="M3.95 10.7A5.41 5.41 0 013.66 9c0-.59.1-1.17.29-1.7V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l2.99-2.34z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96L3.95 7.3C4.66 5.18 6.65 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {isWebView ? 'Chrome으로 열어서 구글 로그인' : '구글로 로그인'}
        </button>

        {/* 이메일 폼 — 일반 브라우저일 때 */}
        {!isWebView && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">또는 이메일로 로그인</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={13} />{error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] disabled:bg-green-300 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-green-600 font-semibold hover:underline">회원가입</Link>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-5 text-center leading-relaxed">
        로그인 시 서비스 이용약관 및<br />개인정보처리방침에 동의하게 됩니다.
      </p>
    </div>
  )
}
