// GET /api/auth/callback
// URL นี้ถูก whitelist ใน Supabase แล้ว
//
// กรณี PKCE flow (code ใน query param): exchange code → redirect โดยตรง
// กรณี Implicit flow (token ใน hash): server ไม่ได้ hash → ส่ง HTML กลับ
//   browser อ่าน hash เอง แล้ว JS redirect ไป /auth/callback พร้อม hash ติดไปด้วย
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  // ── PKCE flow: มี code ใน URL ──────────────────────────────────────────
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
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

  // ── Implicit flow: ไม่มี code → token อยู่ใน hash ──────────────────────
  // Server ไม่ได้ hash fragment เลย ต้องให้ browser จัดการ
  // ส่ง HTML กลับ: JS อ่าน window.location.hash แล้ว redirect ไป /auth/callback
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>กำลังเข้าสู่ระบบ...</title></head>
<body style="margin:0;background:#0B0B0F;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<p style="color:rgba(255,255,255,0.4);font-family:sans-serif;font-size:14px;">กำลังเข้าสู่ระบบ...</p>
<script>
  // นำ hash fragment (access_token, refresh_token ฯลฯ) ไปให้ client-side page จัดการ
  var hash = window.location.hash;
  if (hash && hash.length > 1) {
    window.location.replace('/auth/callback' + hash);
  } else {
    window.location.replace('/login?error=auth_failed');
  }
</script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
