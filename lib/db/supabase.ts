import { createClient } from '@supabase/supabase-js'

// ── Supabase client (server-side only) ─────────
// ต้องใส่ใน Vercel env vars:
//   SUPABASE_URL=https://xxx.supabase.co
//   SUPABASE_SERVICE_KEY=eyJ... (service_role key)

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null  // ถ้าไม่มี env → ข้ามไม่ error
  return createClient(url, key)
}

// ── SQL schema (รันใน Supabase dashboard) ──────
// CREATE TABLE leads (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   name TEXT,
//   email TEXT,
//   phone TEXT,
//   plan TEXT,
//   score INT,
//   revenue_gap INT,
//   platform TEXT,
//   niche TEXT,
//   followers INT,
//   report_price INT,
//   premium_price INT,
//   type TEXT  -- 'audit' | 'contact'
// );

export interface LeadInsert {
  name?: string
  email?: string
  phone?: string
  plan?: string
  score?: number
  revenue_gap?: number
  platform?: string
  niche?: string
  followers?: number
  report_price?: number
  premium_price?: number
  type: 'audit' | 'contact'
}

export async function saveLead(data: LeadInsert): Promise<void> {
  const db = getClient()
  if (!db) return  // Supabase ไม่ได้ setup → ข้ามเงียบๆ

  try {
    const { error } = await db.from('leads').insert(data)
    if (error) console.error('[MITA+] Supabase insert error:', error.message)
  } catch (e) {
    console.error('[MITA+] Supabase error:', e)
  }
}
