// GET /api/auth/callback — P-DEBUG-LOGIN-AGGRESSIVE Layer 2
//
// Server-side OAuth callback handler using @supabase/ssr createServerClient.
//
// Why server-side is more reliable:
//  - createServerClient reads PKCE code_verifier from request COOKIES
//  - No localStorage cross-origin issues (was the root cause of the timeout bug)
//  - Hardcoded redirectTo 'https://www.mitaplus.com/api/auth/callback' in login
//    page ensures code ALWAYS arrives here (no non-www mismatch)
//  - Handles both PKCE OAuth (code=) and magic link (token_hash=) flows
//
// Session cookies are set in the response → middleware can refresh them on
// subsequent requests.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code      = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type      = searchParams.get('type') as 'magiclink' | 'email' | null

  // canonical origin — always www
  const origin = 'https://www.mitaplus.com'

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll may throw in read-only contexts; safe to ignore here
            // since the session will be set via the response headers
          }
        },
      },
    }
  )

  // ── PKCE / OAuth flow: ?code= ──────────────────────────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', user.id)
          .single() as { data: { plan: string } | null; error: unknown }

        const dest = (profile?.plan === 'starter' || profile?.plan === 'pro')
          ? '/starter'
          : '/pricing'

        return NextResponse.redirect(`${origin}${dest}`)
      }
    }

    console.error('[MITA+] exchangeCodeForSession error:', error?.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // ── Magic link / OTP flow: ?token_hash= ───────────────────────────────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', user.id)
          .single() as { data: { plan: string } | null; error: unknown }

        const dest = (profile?.plan === 'starter' || profile?.plan === 'pro')
          ? '/starter'
          : '/pricing'

        return NextResponse.redirect(`${origin}${dest}`)
      }
    }

    console.error('[MITA+] verifyOtp error:', error?.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // ── Fallback: no code, no token_hash ──────────────────────────────────
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
