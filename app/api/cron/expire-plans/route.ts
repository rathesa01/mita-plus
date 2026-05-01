// ── app/api/cron/expire-plans/route.ts · P-STRIPE-EXPIRY-COMPLETE ────────────
// Daily cron: revert plan='free' for users past grace period (expires + 3 days)
// Runs daily at 01:00 UTC (08:00 Bangkok) via vercel.json
// Auth: Bearer CRON_SECRET (Vercel sets this automatically for cron jobs)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const GRACE_DAYS = 3

export async function POST(req: NextRequest) {
  // Verify cron secret — Vercel passes this automatically for scheduled jobs
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('expire-plans: unauthorized attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!,
  )

  // Grace cutoff = now - 3 days
  // Users whose plan_expires_at < grace cutoff AND still on paid plan → revert to free
  const graceCutoff = new Date()
  graceCutoff.setDate(graceCutoff.getDate() - GRACE_DAYS)

  const { data: expiredUsers, error } = await supabase
    .from('user_profiles')
    .select('id, plan, plan_expires_at')
    .in('plan', ['starter', 'pro'])
    .lt('plan_expires_at', graceCutoff.toISOString())

  if (error) {
    console.error('expire-plans cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!expiredUsers || expiredUsers.length === 0) {
    console.log('expire-plans: no expired users found')
    return NextResponse.json({ revoked: 0, checkedAt: new Date().toISOString() })
  }

  const ids = expiredUsers.map((u) => u.id)

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ plan: 'free' })
    .in('id', ids)

  if (updateError) {
    console.error('expire-plans update error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  console.log(`✅ expire-plans: reverted ${ids.length} users to free`, {
    userIds: ids,
    graceCutoff: graceCutoff.toISOString(),
  })

  // TODO Phase 2: send LINE Notify / email reminder before grace ends

  return NextResponse.json({
    revoked: ids.length,
    userIds: ids,
    checkedAt: new Date().toISOString(),
  })
}
