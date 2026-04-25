'use client'
/**
 * Supabase client-side auth client
 * ใช้ NEXT_PUBLIC_ keys เพื่อให้ browser เข้าถึงได้
 */
import { createClient } from '@supabase/supabase-js'

let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  _client = createClient(url, key, {
    auth: {
      flowType: 'pkce', // PKCE flow — ใช้ code exchange ผ่าน /auth/callback (client-side)
    },
  })
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
