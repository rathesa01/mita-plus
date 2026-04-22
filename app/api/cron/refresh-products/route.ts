/**
 * GET /api/cron/refresh-products
 *
 * Weekly cron job — refresh product pool ทุก niche จาก Shopee
 * Schedule: ทุกวันอาทิตย์ 02:00 (Thai time) = 19:00 UTC Saturday
 *
 * Protected by CRON_SECRET header
 * Vercel cron config: vercel.json → crons
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildProductPool, ALL_NICHES } from '@/lib/shopeeSearch'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min — ต้องการ Vercel Pro (Hobby = 10s)

export async function GET(req: NextRequest) {
  // ── Auth: ต้องมี CRON_SECRET header หรือ query param ──
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')

  if (cronSecret) {
    const provided = authHeader?.replace('Bearer ', '') ?? querySecret ?? ''
    if (provided !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // force=true → refresh ทุก niche แม้ยังไม่ครบอาทิตย์ (สำหรับ manual trigger)
  const force = req.nextUrl.searchParams.get('force') === 'true'
  // niche=xxx → refresh เฉพาะ niche นั้น (สำหรับ test)
  const onlyNiche = req.nextUrl.searchParams.get('niche')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const nichesToRefresh = onlyNiche ? [onlyNiche] : ALL_NICHES
  const results: Record<string, { count: number; status: string }> = {}
  const startTime = Date.now()

  console.log(`[cron/refresh-products] Starting refresh for ${nichesToRefresh.length} niches | force=${force}`)

  for (const niche of nichesToRefresh) {
    try {
      // Check if pool still fresh (< 6 days) — skip unless force
      if (!force) {
        const { data: existing } = await supabase
          .from('niche_products')
          .select('refreshed_at')
          .eq('niche', niche)
          .single()

        if (existing?.refreshed_at) {
          const age = Date.now() - new Date(existing.refreshed_at).getTime()
          const sixDays = 6 * 24 * 60 * 60 * 1000
          if (age < sixDays) {
            console.log(`[cron] "${niche}" still fresh (${Math.round(age / 86400000)}d old) — skipping`)
            results[niche] = { count: 0, status: 'skipped (fresh)' }
            continue
          }
        }
      }

      // Fetch product pool from Shopee
      console.log(`[cron] Fetching pool for "${niche}"...`)
      const products = await buildProductPool(niche, 200)

      if (products.length === 0) {
        results[niche] = { count: 0, status: 'error: 0 products' }
        continue
      }

      // Save to Supabase (upsert)
      const { error } = await supabase
        .from('niche_products')
        .upsert({
          niche,
          products,
          product_count: products.length,
          keywords_used: [...new Set(products.map(p => p.niche))],
          refreshed_at: new Date().toISOString(),
        })

      if (error) {
        console.error(`[cron] DB error for "${niche}":`, error)
        results[niche] = { count: 0, status: `db error: ${error.message}` }
      } else {
        results[niche] = { count: products.length, status: 'ok' }
        console.log(`[cron] "${niche}" → ${products.length} products saved ✅`)
      }

      // delay ระหว่าง niches เพื่อไม่ให้ Shopee rate limit
      await new Promise(r => setTimeout(r, 1000))

    } catch (err) {
      console.error(`[cron] Error for "${niche}":`, err)
      results[niche] = { count: 0, status: `error: ${String(err)}` }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const totalProducts = Object.values(results).reduce((sum, r) => sum + r.count, 0)

  console.log(`[cron/refresh-products] Done in ${elapsed}s | total products: ${totalProducts}`)

  return NextResponse.json({
    success: true,
    elapsed_seconds: elapsed,
    total_products_fetched: totalProducts,
    niches: results,
    timestamp: new Date().toISOString(),
  })
}
