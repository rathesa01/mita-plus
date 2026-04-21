// GET /api/auth/callback
// รับ code จาก Google OAuth หรือ Magic Link → exchange → redirect ไป /starter หรือ /pricing
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/starter'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // ตรวจว่ามี plan แล้วไหม
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()

      const destination = (profile?.plan === 'starter' || profile?.plan === 'pro')
        ? '/starter'
        : '/pricing'

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // Error → กลับ login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
