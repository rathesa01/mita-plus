// @ts-nocheck
/**
 * Weekly Affiliate Products Refresh Cron
 * Runs every Monday 08:00 Thailand time (01:00 UTC)
 * Schedule: "0 1 * * 1" in vercel.json
 *
 * Refreshes affiliate_products for ALL active subscribers
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min for batch processing (Vercel Pro)

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (or admin)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET ?? process.env.ADMIN_SECRET_KEY
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.mitaplus.com'

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Get all users who have audit_data (did the audit) — active users
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id')
    .not('audit_data', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userIds: string[] = (users ?? []).map((u: any) => u.id)
  console.log(`[cron/affiliate-refresh] Starting weekly refresh for ${userIds.length} users`)

  let success = 0
  let failed = 0
  const errors: string[] = []

  // Process users sequentially to avoid rate limits
  for (const userId of userIds) {
    try {
      const res = await fetch(`${appUrl}/api/affiliate/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        success++
        console.log(`[cron] ✅ refreshed ${userId}`)
      } else {
        failed++
        const data = await res.json().catch(() => ({}))
        errors.push(`${userId}: ${data.error ?? res.status}`)
        console.warn(`[cron] ❌ failed ${userId}:`, data.error)
      }
      // Small delay between users to avoid hammering APIs
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      failed++
      errors.push(`${userId}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const result = {
    refreshed_at: new Date().toISOString(),
    total_users: userIds.length,
    success,
    failed,
    errors: errors.slice(0, 10), // max 10 errors in response
  }

  console.log('[cron/affiliate-refresh] Done:', result)
  return NextResponse.json(result)
}
