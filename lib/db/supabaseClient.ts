'use client'
/**
 * Supabase browser client — P-DEBUG-LOGIN-AGGRESSIVE Layer 2
 *
 * Migrated from @supabase/supabase-js createClient → @supabase/ssr createBrowserClient
 *
 * Key differences:
 *  - createBrowserClient stores PKCE code_verifier in COOKIES (not localStorage)
 *  - Cookies are scoped to domain (www + non-www share via .mitaplus.com)
 *  - Works with createServerClient in /api/auth/callback for server-side exchange
 *  - No need to specify flowType: 'pkce' — it's the default in @supabase/ssr
 */
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Explicit return type preserves the same SupabaseClient shape as the old
// createClient singleton — consuming code (auth/callback, starter, login)
// gets identical TypeScript inference as before.
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  _client = createBrowserClient(url, key) as SupabaseClient
  return _client
}

// ── Types ──────────────────────────────────────────
export type Plan = 'none' | 'starter' | 'pro'

export interface UserProfile {
  id: string
  email: string
  name: string
  plan: Plan
  paid_at: string | null
  approved_at: string | null
  niche: string | null
  platform: string | null
  line_id: string | null
  created_at: string
  stripe_customer_id: string | null
  audit_data: Record<string, unknown> | null
  channel_data: Record<string, unknown> | null
  monetization_plan: Record<string, unknown> | null
  affiliate_products: Record<string, unknown> | null
  content_example: Record<string, unknown> | null
  weekly_checkins: { checkins: Array<{ week_no: number; income_range: string; income_approx: number; clips: number; date: string; mood?: string; obstacle?: string }> } | null
}
