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
      flowType: 'implicit', // ใช้ implicit flow — tokens ใน hash fragment ไม่ใช่ PKCE code
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
  audit_data: Record<string, unknown> | null
}
