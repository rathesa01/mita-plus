import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * GET /api/auth/line/callback
 * รับ code จาก LINE → แลก access_token → ดึง profile → บันทึก Supabase → set cookie → redirect
 */
export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mitaplus.com'
  const { searchParams } = new URL(req.url)

  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // User กด Cancel
  if (error || !code) {
    return NextResponse.redirect(`${origin}/?line_error=cancelled`)
  }

  // decode state → redirect path
  let redirectTo = '/'
  try {
    const decoded = JSON.parse(Buffer.from(state ?? '', 'base64url').toString())
    redirectTo = decoded.redirect ?? '/'
  } catch {}

  try {
    // 1. แลก code → access_token
    const callbackUrl = `${origin}/api/auth/line/callback`
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  callbackUrl,
        client_id:     process.env.LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    })

    if (!tokenRes.ok) {
      console.error('[LINE callback] token error:', await tokenRes.text())
      return NextResponse.redirect(`${origin}/?line_error=token_failed`)
    }

    const { access_token } = await tokenRes.json()

    // 2. ดึง profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!profileRes.ok) {
      console.error('[LINE callback] profile error:', await profileRes.text())
      return NextResponse.redirect(`${origin}/?line_error=profile_failed`)
    }

    const profile = await profileRes.json()
    // profile = { userId, displayName, pictureUrl, statusMessage }

    // 3. Upsert ลง Supabase
    const { data: lineUser, error: dbErr } = await supabase
      .from('line_users')
      .upsert({
        line_user_id:    profile.userId,
        display_name:    profile.displayName,
        picture_url:     profile.pictureUrl ?? null,
        last_login_at:   new Date().toISOString(),
      }, { onConflict: 'line_user_id' })
      .select('id')
      .single()

    if (dbErr) {
      console.error('[LINE callback] db error:', dbErr)
      return NextResponse.redirect(`${origin}/?line_error=db_failed`)
    }

    // 4. Set cookie session (simple — httpOnly, 30 วัน)
    const sessionData = JSON.stringify({
      id:          lineUser.id,
      lineUserId:  profile.userId,
      displayName: profile.displayName,
      pictureUrl:  profile.pictureUrl ?? null,
    })

    // 5. ถ้า redirect มาจาก /result?id=xxx → link line_user_id เข้า audit_results
    const resultIdMatch = redirectTo.match(/[?&]id=([0-9a-f-]{36})/)
    if (resultIdMatch) {
      const auditId = resultIdMatch[1]
      void supabase
        .from('audit_results')
        .update({
          line_user_id: profile.userId,
          consented: true,
        })
        .eq('id', auditId)
        .is('line_user_id', null) // link เฉพาะที่ยังไม่มีเจ้าของ
    }

    const response = NextResponse.redirect(`${origin}${redirectTo}`)
    response.cookies.set('mita_line_session', sessionData, {
      httpOnly: true,
      secure:   true,
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 30, // 30 วัน
      path:     '/',
    })

    return response

  } catch (err) {
    console.error('[LINE callback] unexpected error:', err)
    return NextResponse.redirect(`${origin}/?line_error=unknown`)
  }
}
