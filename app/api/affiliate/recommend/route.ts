// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { searchProducts, nicheToKeywords, type InvolveProduct } from '@/lib/involveAsia'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // allow up to 30s (needs Vercel Pro; Hobby caps at 10s automatically)

// ── Fallback catalog (used when Involve Asia API not ready) ─
// Simple static products — replaced by real API once INVOLVE_ASIA_API_KEY is set
const FALLBACK_PRODUCTS: InvolveProduct[] = [
  { id: 'f1', name: 'เซรั่มวิตามินซี', brand: 'Skinsista', price: 390, commission_rate: 12, commission_thb: 47, product_url: 'https://shopee.co.th/search?keyword=serum+vitamin+c', image_url: '', category: 'beauty', category_th: 'ความงาม', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['beauty', 'skincare', 'ความงาม'], in_stock: true, currency: 'THB' },
  { id: 'f2', name: 'ครีมกันแดด SPF50+', brand: 'Banana Boat', price: 320, commission_rate: 10, commission_thb: 32, product_url: 'https://shopee.co.th/search?keyword=sunscreen+spf50', image_url: '', category: 'beauty', category_th: 'ความงาม', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['beauty', 'skincare', 'outdoor'], in_stock: true, currency: 'THB' },
  { id: 'f3', name: 'Resistance Band Set', brand: 'Fit & Flex', price: 350, commission_rate: 12, commission_thb: 42, product_url: 'https://shopee.co.th/search?keyword=resistance+band+set', image_url: '', category: 'fitness', category_th: 'กีฬา', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['fitness', 'gym', 'ออกกำลังกาย'], in_stock: true, currency: 'THB' },
  { id: 'f4', name: 'Ring Light LED 10 นิ้ว', brand: 'Godox', price: 690, commission_rate: 10, commission_thb: 69, product_url: 'https://shopee.co.th/search?keyword=ring+light+10+inch', image_url: '', category: 'electronics', category_th: 'อิเล็กทรอนิกส์', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['tech', 'creator', 'tiktok', 'youtube'], in_stock: true, currency: 'THB' },
  { id: 'f5', name: 'หม้อทอดไร้น้ำมัน 5L', brand: 'Xiaomi', price: 1890, commission_rate: 6, commission_thb: 113, product_url: 'https://shopee.co.th/search?keyword=air+fryer+5l', image_url: '', category: 'kitchen', category_th: 'ของใช้ครัว', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['food', 'cooking', 'kitchen', 'ทำอาหาร'], in_stock: true, currency: 'THB' },
  { id: 'f6', name: 'Whey Protein 1kg Vanilla', brand: 'Optimum Nutrition', price: 890, commission_rate: 9, commission_thb: 80, product_url: 'https://shopee.co.th/search?keyword=whey+protein+vanilla', image_url: '', category: 'fitness', category_th: 'สุขภาพ', merchant_name: 'Lazada', merchant_id: '', platform: 'Lazada', tags: ['fitness', 'gym', 'สุขภาพ', 'nutrition'], in_stock: true, currency: 'THB' },
  { id: 'f7', name: 'กระเป๋า Canvas Tote Bag', brand: 'MUJI', price: 199, commission_rate: 9, commission_thb: 18, product_url: 'https://shopee.co.th/search?keyword=canvas+tote+bag', image_url: '', category: 'fashion', category_th: 'แฟชั่น', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['fashion', 'แฟชั่น', 'lifestyle'], in_stock: true, currency: 'THB' },
  { id: 'f8', name: 'เทียนหอม Soy Wax Set', brand: 'Karmakamet', price: 390, commission_rate: 11, commission_thb: 43, product_url: 'https://shopee.co.th/search?keyword=soy+wax+candle+set', image_url: '', category: 'home', category_th: 'ของแต่งบ้าน', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['home', 'decor', 'lifestyle', 'aesthetic'], in_stock: true, currency: 'THB' },
  { id: 'f9', name: 'น้ำพุแมว Cat Fountain', brand: 'Petkit', price: 590, commission_rate: 10, commission_thb: 59, product_url: 'https://shopee.co.th/search?keyword=cat+fountain+automatic', image_url: '', category: 'pets', category_th: 'สัตว์เลี้ยง', merchant_name: 'Shopee', merchant_id: '', platform: 'Shopee', tags: ['pets', 'cat', 'แมว'], in_stock: true, currency: 'THB' },
  { id: 'f10', name: 'ไมโครโฟน Wireless Clip', brand: 'DJI', price: 2490, commission_rate: 8, commission_thb: 199, product_url: 'https://shopee.co.th/search?keyword=wireless+mic+clip+on', image_url: '', category: 'electronics', category_th: 'อิเล็กทรอนิกส์', merchant_name: 'Lazada', merchant_id: '', platform: 'Lazada', tags: ['tech', 'creator', 'youtube', 'podcast'], in_stock: true, currency: 'THB' },
]

export async function POST(req: NextRequest) {
  try {
    const anthropicKey    = process.env.ANTHROPIC_API_KEY
    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey      = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    const involveKey      = process.env.INVOLVE_ASIA_API_KEY     // api_key (e.g. "general")
    const involveSecret   = process.env.INVOLVE_ASIA_API_SECRET  // api_secret (bearer token)

    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not set')
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase env missing')

    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('audit_data, channel_data, monetization_plan')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const audit   = profile.audit_data   as any
    const channel = profile.channel_data as any

    // ── Extract creator context ──────────────────────────
    const niche    = audit?.input?.niche ?? 'general'
    const platform = audit?.input?.platform ?? 'tiktok'
    const followers = audit?.input?.followers ?? 0

    const platforms = Object.keys(channel ?? {})
    const primary   = platforms[0] ?? platform
    const pd        = channel?.[primary] ?? {}
    const aud       = pd.audience ?? {}
    const femalePct = aud.gender_female_pct ?? null
    const topAge    = (() => {
      const ages = [
        { key: 'age_13_17_pct', label: '13-17' }, { key: 'age_18_24_pct', label: '18-24' },
        { key: 'age_25_34_pct', label: '25-34' }, { key: 'age_35_44_pct', label: '35-44' },
        { key: 'age_45_plus_pct', label: '45+' },
      ]
      let top = ages[0]
      for (const ag of ages) if ((aud[ag.key] ?? 0) > (aud[top.key] ?? 0)) top = ag
      return aud[top.key] ? top.label : null
    })()

    // ── Step 1: Search real products from Involve Asia (if key ready) ──
    let productPool: InvolveProduct[] = []
    let dataSource: 'involve_asia' | 'fallback' = 'fallback'

    if (involveKey || involveSecret) {
      try {
        const keywords = nicheToKeywords(niche, platform)
        console.log(`[affiliate/recommend] Searching Involve Asia: keywords=${keywords.join(', ')} | auth=secret:${!!involveSecret}`)
        productPool = await searchProducts(
          involveKey ?? 'general',
          keywords,
          { limit: 30, apiSecret: involveSecret }
        )
        dataSource = 'involve_asia'
        console.log(`[affiliate/recommend] Got ${productPool.length} products from Involve Asia`)
      } catch (err) {
        console.warn('[affiliate/recommend] Involve Asia search failed, using fallback:', err)
        productPool = FALLBACK_PRODUCTS
      }
    } else {
      console.log('[affiliate/recommend] INVOLVE_ASIA_API_KEY/SECRET not set — using fallback catalog')
      productPool = FALLBACK_PRODUCTS
    }

    // ── Step 2: AI picks best matches ───────────────────
    const productSummary = productPool.map(p =>
      `[${p.id}] ${p.name} | ${p.merchant_name} | ฿${p.price} | commission ${p.commission_rate}% (฿${p.commission_thb}/ชิ้น) | tags: ${p.tags.slice(0,5).join(', ')}`
    ).join('\n')

    const prompt = `คุณคือ MITA+ AI ผู้เชี่ยวชาญ affiliate marketing สำหรับ creator ไทย

ข้อมูล Creator:
- Niche/เนื้อหา: ${niche}
- Platform หลัก: ${primary}
- Followers: ${followers?.toLocaleString() ?? 'unknown'}
- เพศผู้ชม: ${femalePct != null ? `หญิง ${femalePct}% / ชาย ${100 - femalePct}%` : 'ไม่ทราบ'}
- ช่วงอายุหลัก: ${topAge ?? 'ไม่ทราบ'} ปี

รายการสินค้าที่มีในระบบ:
${productSummary}

เลือก 5-6 สินค้าที่เหมาะกับ creator นี้ที่สุด โดยพิจารณา:
1. สินค้าตรง niche และ audience ของช่อง
2. ราคาและ commission เหมาะกับ follower count (ช่องเล็ก = ราคาต่ำ conversion ง่าย)
3. สินค้าที่ใช้ใน content ได้จริง ไม่ดูเป็น ad โจ่งแจ้ง
4. Mix ระหว่าง easy win (ราคาต่ำ ขายง่าย) และ high-value (commission สูงต่อชิ้น)

Return ONLY valid JSON:
{
  "selected_ids": ["<id1>", "<id2>", "<id3>", "<id4>", "<id5>"],
  "rankings": {
    "<id>": {
      "rank": <1-6>,
      "why_fits": "<1 ประโยค ภาษาไทย ว่าทำไมสินค้านี้ถึงเหมาะกับช่องนี้>",
      "content_idea": "<ไอเดียทำคลิปกับสินค้านี้ — เช่น ทำ vlog ใช้แล้วแปะลิ้งค์ใน bio>"
    }
  },
  "total_monthly_min": <number THB — ถ้าขายได้ 3-5 ชิ้น/เดือน>,
  "total_monthly_max": <number THB — ถ้าขายได้ 10-20 ชิ้น/เดือน>,
  "tip": "<เทคนิค affiliate 1 ประโยค เหมาะกับ creator niche นี้โดยเฉพาะ>"
}`

    const client = new Anthropic({ apiKey: anthropicKey })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[affiliate/recommend] raw AI response:', rawText.slice(0, 500))

    let aiResult: any = {}
    try {
      // Strip markdown code fences if present
      const stripped = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      // Extract first JSON object
      const match = stripped.match(/\{[\s\S]*\}/)
      if (match) {
        aiResult = JSON.parse(match[0])
      } else {
        console.warn('[affiliate/recommend] No JSON found in response, using empty result')
      }
    } catch (parseErr) {
      console.error('[affiliate/recommend] JSON parse failed:', parseErr, '| raw:', rawText.slice(0, 300))
      // Don't throw — fall through with empty aiResult, will use fallback products below
    }

    // ── Step 3: Build enriched result ───────────────────
    const productMap = Object.fromEntries(productPool.map(p => [p.id, p]))
    const selectedIds: string[] = aiResult.selected_ids ?? []
    const rankings: Record<string, any> = aiResult.rankings ?? {}

    let enrichedProducts = selectedIds
      .map(id => {
        const product = productMap[id]
        if (!product) return null
        const rankInfo = rankings[id] ?? {}
        return {
          ...product,
          rank: rankInfo.rank ?? selectedIds.indexOf(id) + 1,
          why_fits: rankInfo.why_fits ?? '',
          content_idea: rankInfo.content_idea ?? '',
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank)

    // Fallback: if AI returned no valid IDs, take top 5 from pool
    if (enrichedProducts.length === 0 && productPool.length > 0) {
      console.warn('[affiliate/recommend] AI selected no valid products — using top 5 from pool')
      enrichedProducts = productPool.slice(0, 5).map((p, i) => ({
        ...p, rank: i + 1, why_fits: 'เหมาะกับช่องของคุณค่ะ', content_idea: 'ลองรีวิวสินค้านี้ใน content ของคุณค่ะ'
      }))
    }

    const result = {
      products: enrichedProducts,
      total_monthly_min: aiResult.total_monthly_min ?? 0,
      total_monthly_max: aiResult.total_monthly_max ?? 0,
      tip: aiResult.tip ?? '',
      data_source: dataSource,
      generated_at: new Date().toISOString(),
      based_on_niche: niche,
      based_on_platform: primary,
    }

    // ── Step 4: Save to DB ───────────────────────────────
    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({ affiliate_products: result })
      .eq('id', userId)

    if (dbError) throw new Error(`DB: ${dbError.message}`)

    console.log(`[affiliate/recommend] ✅ ${enrichedProducts.length} products (${dataSource}) for user ${userId}`)
    return NextResponse.json({ success: true, data: result })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[affiliate/recommend] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
