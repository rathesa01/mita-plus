// middleware.ts — P-DEBUG-LOGIN-AGGRESSIVE Layer 4
//
// Combined middleware:
//  1. Non-www → www redirect (301) — prevents PKCE code_verifier origin mismatch
//  2. Supabase session refresh via @supabase/ssr createServerClient — keeps auth
//     cookies fresh on every request (auto-refresh tokens before expiry)
//  3. Admin route guard (JWT cookie) — unchanged from original

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = () => new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? 'mita-dev-secret-change-in-prod'
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''

  // ── Layer 1 backup: non-www → www ─────────────────────────────────────
  // Belt-and-suspenders: next.config.ts also has this redirect.
  // This catches requests that reach middleware before Next.js config runs.
  if (host === 'mitaplus.com') {
    const url = req.nextUrl.clone()
    url.host = 'www.mitaplus.com'
    return NextResponse.redirect(url, { status: 301 })
  }

  // ── Layer 4: Supabase session refresh ─────────────────────────────────
  // createServerClient reads auth cookies from req, refreshes tokens if
  // needed, and writes updated cookies to the response. This keeps Supabase
  // sessions alive without requiring a client-side call on every page.
  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to both request (for downstream) and response (for browser)
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          )
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Triggers token refresh if the current token is near expiry
  await supabase.auth.getUser()

  // ── Admin route guard ──────────────────────────────────────────────────
  if (!pathname.startsWith('/admin')) return response
  if (pathname === '/admin/login') return response

  const token = req.cookies.get('mita_admin_session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    await jwtVerify(token, SECRET())
    return response
  } catch {
    const res = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.delete('mita_admin_session')
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
