// @ts-nocheck
/**
 * POST /api/affiliate/recommend
 *
 * Flow:
 * 1. Check user cache (affiliate_products) — ถ้า < 7 วัน return cached
 * 2. Load product pool จาก niche_products table (Shopee trending, refresh ทุกอาทิตย์)
 * 3. ถ้าไม่มี pool → fetch จาก Shopee ทันที (และ save pool)
 * 4. Claude เลือก 10 สินค้าที่เหมาะกับ creator คนนี้ unique
 * 5. Save ลง user_profiles.affiliate_products (cache 7 วัน)
 *
 * Rate limit: refresh ได้วันละ 1 ครั้ง (Thai timezone UTC+7)
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { buildProductPool, canonicalNiche, type ShopeeProduct } from '@/lib/shopeeSearch'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── Thai timezone helper ──────────────────────────────────

function thaiDateStr(date = new Date()): string {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// ── Main Handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey   = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not set')
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase env missing')

    const { userId, force, dev } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const supabase = createClient(supabaseUrl, serviceKey)

    // ── Load user profile ──────────────────────────────
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('audit_data, channel_data, affiliate_products')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const cached = profile.affiliate_products as any

    // ── Rate limit: 1 refresh per day ─────────────────
    if (cached?.generated_at) {
      const lastDay = thaiDateStr(new Date(cached.generated_at))
      const today   = thaiDateStr()

      if (lastDay === today && !dev) {
        if (force) {
          return NextResponse.json({ rateLimited: true, message: 'รีเฟรชได้วันละ 1 ครั้งค่ะ มาใหม่พรุ่งนี้' })
        }
        // not force → return cached
        return NextResponse.json({ success: true, data: cached, cached: true })
      }
    }

    // ── Extract creator context ────────────────────────
    const audit   = profile.audit_data   as any
    const channel = profile.channel_data as any

    const rawNiche   = audit?.input?.niche ?? audit?.niche ?? 'ทั่วไป'
    const platform   = audit?.input?.platform ?? 'tiktok'
    const followers  = audit?.input?.followers ?? 0
    const niche      = canonicalNiche(rawNiche)

    const platforms    = Object.keys(channel ?? {})
    const primaryPlat  = platforms[0] ?? platform
    const pd           = channel?.[primaryPlat] ?? {}
    const aud          = pd.audience ?? {}
    const femalePct    = aud.gender_female_pct ?? null
    const topAge       = getTopAge(aud)
    const bestFormat   = pd.content?.best_format ?? pd.overview?.best_format ?? ''

    console.log(`[affiliate/recommend] userId=${userId} niche="${niche}" platform=${primaryPlat}`)

    // ── Load product pool ──────────────────────────────
    let productPool: ShopeeProduct[] = []
    let poolSource = 'shopee_live'

    // 1. Try niche_products table (cached pool, refresh weekly)
    const { data: nicheRow } = await supabase
      .from('niche_products')
      .select('products, refreshed_at, product_count')
      .eq('niche', niche)
      .single()

    if (nicheRow?.products && Array.isArray(nicheRow.products) && nicheRow.products.length > 0) {
      const ageMs = Date.now() - new Date(nicheRow.refreshed_at).getTime()
      const sevenDays = 7 * 24 * 60 * 60 * 1000

      if (ageMs < sevenDays) {
        productPool = nicheRow.products as ShopeeProduct[]
        poolSource = 'niche_cache'
        console.log(`[affiliate/recommend] Using cached pool: ${productPool.length} products (${Math.round(ageMs / 86400000)}d old)`)
      }
    }

    // 2. No cache → fetch from Shopee now + save pool
    if (productPool.length === 0) {
      console.log(`[affiliate/recommend] No cache for "${niche}" — fetching from Shopee...`)
      productPool = await buildProductPool(niche, 200)

      if (productPool.length > 0) {
        // Save pool for future users with same niche
        await supabase
          .from('niche_products')
          .upsert({
            niche,
            products: productPool,
            product_count: productPool.length,
            refreshed_at: new Date().toISOString(),
          })
        console.log(`[affiliate/recommend] Pool saved: ${productPool.length} products`)
      }
    }

    // 3. Fallback ถ้า Shopee ไม่ตอบ
    if (productPool.length === 0) {
      return NextResponse.json({
        error: 'ขณะนี้ระบบไม่สามารถดึงข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้งค่ะ',
        retry: true,
      }, { status: 503 })
    }

    // ── Claude picks 10 ───────────────────────────────
    // สร้าง product summary สำหรับ Claude (ไม่เกิน 200 ชิ้น)
    const pool200 = productPool.slice(0, 200)
    const productSummary = pool200.map((p, i) =>
      `[${i}] ${p.name} | ฿${p.price} | ⭐${p.rating} | ขายแล้ว ${p.sold.toLocaleString()} ชิ้น`
    ).join('\n')

    const audienceDesc = [
      femalePct != null ? `หญิง ${femalePct}% / ชาย ${100 - femalePct}%` : null,
      topAge ? `อายุหลัก ${topAge} ปี` : null,
    ].filter(Boolean).join(', ') || 'ไม่ทราบ'

    const prompt = `คุณคือ MITA+ AI ผู้เชี่ยวชาญด้านการเลือกสินค้าสำหรับ creator ไทย

ข้อมูล Creator:
- แนวคลิป/Niche: ${rawNiche}
- Platform หลัก: ${primaryPlat}
- Followers: ${followers.toLocaleString()}
- ผู้ชม: ${audienceDesc}
- รูปแบบคอนเทนต์: ${bestFormat || 'Short-form video'}

สินค้า trending บน Shopee ขณะนี้ (${pool200.length} ชิ้น):
${productSummary}

เลือก index (0-${pool200.length - 1}) ของสินค้า 10 ชิ้นที่เหมาะกับ creator นี้มากที่สุด โดยพิจารณา:
1. ตรง niche และสไตล์คลิปของช่อง
2. เหมาะกับ audience (เพศ อายุ)
3. ราคาสมเหตุสมผล — ช่องเล็กเน้นสินค้าราคาต่ำ (conversion ง่าย)
4. Mix สินค้า: ง่ายขาย + มูลค่าสูง
5. ใช้ใน content ได้จริง ไม่ดูเป็น ad โจ่งแจ้ง

ตอบ JSON เท่านั้น:
{
  "selected_indexes": [<0-${pool200.length - 1}>, ...10 ตัวเลข],
  "picks": {
    "<index>": {
      "rank": <1-10>,
      "why_fits": "<เหตุผล 1 ประโยค ภาษาไทย>",
      "content_idea": "<ไอเดียทำคลิป 1 ประโยค>"
    }
  },
  "tip": "<เทคนิค affiliate สำหรับ creator นี้ 1 ประโยค>"
}`

    const client = new Anthropic({ apiKey: anthropicKey })
    const response = await client.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 1200,
      messages:   [{ role: 'user', content: prompt }],
    })

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''

    let aiResult: any = {}
    try {
      const stripped = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      const match = stripped.match(/\{[\s\S]*\}/)
      if (match) aiResult = JSON.parse(match[0])
    } catch (e) {
      console.error('[affiliate/recommend] JSON parse error:', e)
    }

    // ── Build enriched products ───────────────────────
    const selectedIndexes: number[] = aiResult.selected_indexes ?? []
    const picks: Record<string, any> = aiResult.picks ?? {}

    let enriched = selectedIndexes
      .map(idx => {
        const p = pool200[idx]
        if (!p) return null
        const pick = picks[String(idx)] ?? {}
        return {
          ...p,
          rank:         pick.rank ?? selectedIndexes.indexOf(idx) + 1,
          why_fits:     pick.why_fits ?? '',
          content_idea: pick.content_idea ?? '',
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank)

    // Fallback ถ้า Claude ไม่ได้ pick อะไร
    if (enriched.length === 0) {
      console.warn('[affiliate/recommend] Claude returned no valid picks — using top 10 from pool')
      enriched = pool200.slice(0, 10).map((p, i) => ({
        ...p,
        rank: i + 1,
        why_fits: 'สินค้า trending บน Shopee ที่เหมาะกับช่องของคุณค่ะ',
        content_idea: 'ลองรีวิวสินค้านี้ในคอนเทนต์ของคุณค่ะ',
      }))
    }

    // ── Save result ───────────────────────────────────
    const result = {
      products:          enriched,
      tip:               aiResult.tip ?? '',
      data_source:       poolSource,
      pool_size:         pool200.length,
      based_on_niche:    rawNiche,
      based_on_platform: primaryPlat,
      generated_at:      new Date().toISOString(),
    }

    await supabase
      .from('user_profiles')
      .update({ affiliate_products: result })
      .eq('id', userId)

    console.log(`[affiliate/recommend] ✅ ${enriched.length} products (${poolSource}) for user ${userId}`)
    return NextResponse.json({ success: true, data: result })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[affiliate/recommend] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ── Helpers ───────────────────────────────────────────────

function getTopAge(aud: any): string | null {
  const ages = [
    { key: 'age_13_17_pct', label: '13-17' },
    { key: 'age_18_24_pct', label: '18-24' },
    { key: 'age_25_34_pct', label: '25-34' },
    { key: 'age_35_44_pct', label: '35-44' },
    { key: 'age_45_plus_pct', label: '45+' },
  ]
  let top = ages[0]
  for (const ag of ages) {
    if ((aud[ag.key] ?? 0) > (aud[top.key] ?? 0)) top = ag
  }
  return aud[top.key] ? top.label : null
}
