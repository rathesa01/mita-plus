// ── lib/access/checkPlan.ts · P-STRIPE-EXPIRY-COMPLETE ──────────────────────
// Plan state helper: reads plan + expiry · computes grace period · client + server safe

import type { SupabaseClient } from '@supabase/supabase-js'

export type PlanState = {
  plan: 'free' | 'starter' | 'pro' | 'none'
  expiresAt: Date | null
  isActive: boolean       // true while within grace period (paid + not past grace cutoff)
  daysLeft: number        // positive = days until expiry · negative = days since expiry
  inGracePeriod: boolean  // expired but within 3-day soft grace
}

const GRACE_DAYS = 3

export async function getPlanState(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanState> {
  const { data } = await supabase
    .from('user_profiles')
    .select('plan, plan_expires_at')
    .eq('id', userId)
    .single()

  const plan = (data?.plan ?? 'free') as PlanState['plan']
  const expiresAt = data?.plan_expires_at ? new Date(data.plan_expires_at) : null

  // Free / none plans have no expiry
  if (!expiresAt || plan === 'free' || plan === 'none') {
    return {
      plan: 'free',
      expiresAt: null,
      isActive: false,
      daysLeft: 0,
      inGracePeriod: false,
    }
  }

  const now = Date.now()
  const expMs = expiresAt.getTime()
  const graceCutoffMs = expMs + GRACE_DAYS * 24 * 60 * 60 * 1000
  const daysLeft = Math.ceil((expMs - now) / (1000 * 60 * 60 * 24))

  return {
    plan,
    expiresAt,
    isActive: now < graceCutoffMs,                    // still usable within grace
    daysLeft,                                          // negative once expired
    inGracePeriod: now > expMs && now < graceCutoffMs, // past expiry but within grace
  }
}
