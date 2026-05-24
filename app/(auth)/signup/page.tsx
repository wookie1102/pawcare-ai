'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleKakaoLogin = async () => {
    await createClient().auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleGoogleLogin = async () => {
    await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일입니다. 로그인을 시도해보세요.')
      } else {
        setError('가입 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-5">
        <div className="w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">이메일을 확인해주세요</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            <span className="font-medium text-gray-700">{email}</span>로<br />
            인증 메일을 발송했습니다.<br />
            메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <Link
            href="/login"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-5">
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🐾</div>
        <h1 className="text-2xl font-bold text-green-800">회원가입</h1>
        <p className="text-green-600 text-sm mt-1">PawCare AI에 오신 것을 환영합니다</p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm p-6">
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#FADA0A] active:scale-[0.98] text-[#3C1E1E] font-semibold py-3.5 rounded-xl transition-all mb-3 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.07 1.37 3.89 3.44 4.95l-.88 3.28 3.56-2.34c.44.07.9.11 1.38.11 4.14 0 7.5-2.69 7.5-6S13.14 1.5 9 1.5z"
              fill="#3C1E1E"
            />
          </svg>
          카카오로 시작하기
        </button>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-semibold py-3.5 rounded-xl transition-all mb-6 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.61-.05-1.22-.16-1.8H9v3.4h4.84a4.14 4.14 0 01-1.8 2.73v2.27h2.9c1.7-1.56 2.7-3.87 2.7-6.6z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.27c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.71H.96v2.34A9 9 0 009 18z" fill="#34A853"/>
            <path d="M3.95 10.7A5.41 5.41 0 013.66 9c0-.59.1-1.17.29-1.7V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l2.99-2.34z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96L3.95 7.3C4.66 5.18 6.65 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          구글로 시작하기
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">또는 이메일로 가입</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="이름 (닉네임)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            required
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent pr-11"
              minLength={6}
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
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] disabled:bg-green-300 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
