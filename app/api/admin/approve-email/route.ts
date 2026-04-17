/**
 * Approve user plan by email
 * POST /api/admin/approve-email
 * Body: { email, plan }
 * Auth: admin cookie
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken, COOKIE } from '@/lib/admin/auth'

function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  // ตรวจ admin session
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await verifyToken(token)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, plan } = await req.json()
  if (!email || !plan) {
    return NextResponse.json({ error: 'email and plan required' }, { status: 400 })
  }

  const db = getAdminClient()
  if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // หา user ใน user_profiles ตาม email
  const { data: profiles, error: findErr } = await db
    .from('user_profiles')
    .select('id, email, plan')
    .eq('email', email.toLowerCase().trim())
    .limit(1)

  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 })
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // อัพเดท plan
  const { error: updateErr } = await db
    .from('user_profiles')
    .update({ plan, approved_at: new Date().toISOString() })
    .eq('id', profiles[0].id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, userId: profiles[0].id })
}
