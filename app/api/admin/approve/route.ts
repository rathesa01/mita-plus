/**
 * Admin approve user plan
 * POST /api/admin/approve
 * Body: { userId, plan, adminKey }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, adminKey } = await req.json()

    // ตรวจ admin key
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!userId || !plan) {
      return NextResponse.json({ error: 'userId and plan required' }, { status: 400 })
    }

    const db = getAdminClient()
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const { error } = await db
      .from('user_profiles')
      .update({
        plan,
        approved_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[approve]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
