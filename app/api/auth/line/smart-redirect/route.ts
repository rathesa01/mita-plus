import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/line/smart-redirect
 * หลัง LINE login จาก /login page:
 *   - มี audit result ที่ผูกกับ LINE นี้ → ไป /r/[id] ล่าสุด
 *   - ไม่มี → ไป /audit
 */
export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mitaplus.com'

  // อ่าน LINE session cookie
  const cookie = req.cookies.get('mita_line_session')?.value
  if (!cookie) {
    return NextResponse.redirect(`${origin}/audit`)
  }

  let lineUserId: string | null = null
  try {
    const session = JSON.parse(cookie)
    lineUserId = session.lineUserId ?? null
  } catch { /* ไป /audit */ }

  if (!lineUserId) {
    return NextResponse.redirect(`${origin}/audit`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  // หา result ล่าสุดของ LINE user นี้
  const { data } = await supabase
    .from('audit_results')
    .select('id')
    .eq('line_user_id', lineUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (data?.id) {
    return NextResponse.redirect(`${origin}/r/${data.id}`)
  }

  return NextResponse.redirect(`${origin}/audit`)
}
