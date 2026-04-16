import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url  = process.env.SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const supabaseOk  = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  const discordOk   = !!process.env.DISCORD_WEBHOOK_URL

  if (!supabaseOk) {
    return NextResponse.json({
      ok: false,
      setup: true,
      supabaseOk: false,
      discordOk,
      leads: [],
      total: 0,
    })
  }

  try {
    const db = getClient()!
    const { data, error, count } = await db
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({
      ok: true,
      supabaseOk: true,
      discordOk,
      leads: data ?? [],
      total: count ?? 0,
    })
  } catch (err) {
    console.error('[MITA+] Admin leads error:', err)
    return NextResponse.json(
      { ok: false, error: 'Supabase error', supabaseOk, discordOk, leads: [], total: 0 },
      { status: 500 }
    )
  }
}
