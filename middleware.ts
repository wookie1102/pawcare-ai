import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const MAINTENANCE_MODE = false

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (MAINTENANCE_MODE && !pathname.startsWith('/maintenance')) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  // lib/supabase/client.ts, server.ts와 달리 여기만 fallback 없이 non-null 단언(!)을 쓰고 있어서,
  // 환경변수가 비어있거나 잘못되면(과거에 실제로 있었던 문제 — 유지보수 모드를 켰다 껐다 했던 이력 참고)
  // 모든 요청에서 미들웨어 자체가 예외를 던져 전체 사이트가 500이 된다. 자리표시자로 대체해서,
  // 최악의 경우에도 "로그인 필요"로 정상 처리되게(로그인 화면으로 리다이렉트) 한다.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    // /maintenance는 로그아웃 상태(특히 Supabase 자체가 문제일 때, 즉 아무도 로그인할 수 없을 때)에도
    // 보여야 하는 페이지라 로그인 필요 목록에서 빠져야 한다 — 안 그러면 유지보수 안내를 보려다
    // 로그인 화면으로 튕기는 상황이 된다.
    pathname.startsWith('/maintenance') ||
    // public/manifest.json이 PWA 아이콘으로 이 라우트를 직접 참조하는데, 매니페스트 아이콘은
    // 로그인 전(홈 화면에 추가하는 시점 등)에도 브라우저/OS가 요청하므로 인증을 요구하면 안 된다.
    pathname.startsWith('/api/icon')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
