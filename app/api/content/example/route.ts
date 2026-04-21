// POST /api/content/example
// รับ { userId } → ค้นหา YouTube + Claude สร้าง script → save DB
// Cache: ถ้าสร้างไปแล้วไม่เกิน 7 วัน → return cached

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { searchYouTubeByNiche, type YouTubeVideo } from '@/lib/youtubeSearch'

export const dynamic = 'force-dynamic'

interface ContentExample {
  videos: YouTubeVideo[]
  script: {
    hook: string
    middle: string[]
    cta: string
    product_tip: string
    best_time: string
    why: string
  }
  niche: string
  platform: string
  generated_at: string
}

// Claude สร้าง script จากตัวอย่างคลิป + ข้อมูลช่อง
async function generateScript(
  anthropic: Anthropic,
  niche: string,
  platform: string,
  videos: YouTubeVideo[],
  channelData: Record<string, unknown> | null,
  affiliateProducts: Record<string, unknown> | null
): Promise<ContentExample['script']> {
  const videoTitles = videos.slice(0, 3).map((v, i) => `${i + 1}. "${v.title}" (${v.channelTitle})`).join('\n')

  // ดึง peak hours จาก channel_data
  let peakHours = ''
  let bestFormat = ''
  if (channelData) {
    const platforms = ['tiktok', 'youtube', 'instagram', 'facebook']
    for (const p of platforms) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pd = (channelData as any)[p]
      if (pd) {
        peakHours = pd.audience?.peak_hours ?? pd.watch_time?.peak_hours ?? ''
        bestFormat = pd.content?.best_format ?? pd.overview?.best_format ?? ''
        break
      }
    }
  }

  // ดึงสินค้า affiliate ตัวแรก
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (affiliateProducts as any)?.products ?? []
  const topProduct = products[0]?.name ?? ''

  const prompt = `คุณคือ content strategist ที่เชี่ยวชาญ content creator ไทยบน ${platform}

ข้อมูลช่องของ creator:
- Niche: ${niche}
- Platform: ${platform}
- Best format: ${bestFormat || 'Short-form video'}
- Peak hours: ${peakHours || 'ยังไม่ทราบ'}
- สินค้าที่ควรโปรโมต: ${topProduct || 'สินค้าในช่องของตัวเอง'}

คลิป viral ใน niche นี้ที่เป็นตัวอย่าง:
${videoTitles}

สร้าง script คลิปสำหรับ creator คนนี้ โดยได้แรงบันดาลใจจากคลิปตัวอย่าง แต่ปรับให้เหมาะกับ niche และช่องของเขา

ตอบเป็น JSON เท่านั้น:
{
  "hook": "ประโยคเปิด 3-5 วินาทีแรก ที่ดึงคนดูได้ทันที",
  "middle": ["จุดเนื้อหาที่ 1", "จุดเนื้อหาที่ 2", "จุดเนื้อหาที่ 3"],
  "cta": "Call to action ท้ายคลิป",
  "product_tip": "วิธีแนะนำสินค้าในคลิปนี้ (ถ้ามี)",
  "best_time": "เวลาและวันที่ควรโพสต์",
  "why": "ทำไม script นี้ถึงจะ work กับช่องนี้ (1-2 ประโยค)"
}`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = (response.content[0] as { text: string }).text.trim()
  const stripped = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const jsonMatch = stripped.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude did not return valid JSON')

  return JSON.parse(jsonMatch[0])
}

export async function POST(req: NextRequest) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseKey) return NextResponse.json({ error: 'ระบบยังไม่พร้อมค่ะ' }, { status: 500 })
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey)

    const { userId, force } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const youtubeApiKey = process.env.YOUTUBE_API_KEY
    if (!youtubeApiKey) {
      return NextResponse.json({ error: 'YOUTUBE_API_KEY not set' }, { status: 500 })
    }

    // โหลด profile จาก Supabase
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('audit_data, channel_data, affiliate_products, content_example')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // ── Cache check ──
    const cached = profile.content_example as ContentExample | null

    // Rate limit: force refresh จำกัด 1 ครั้ง/วัน (Thai timezone UTC+7)
    if (force && cached?.generated_at) {
      const offset = 7 * 60 * 60 * 1000
      const lastDay = new Date(new Date(cached.generated_at).getTime() + offset).toISOString().slice(0, 10)
      const today   = new Date(Date.now() + offset).toISOString().slice(0, 10)
      if (lastDay === today) {
        console.log('[content/example] rate limited — already refreshed today')
        return NextResponse.json({ rateLimited: true, message: 'รีเฟรชได้วันละ 1 ครั้งค่ะ มาใหม่พรุ่งนี้' })
      }
    }

    // ถ้าไม่ force และ cache ยังไม่เกิน 7 วัน → return cached
    if (!force && cached?.generated_at) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (age < sevenDays) {
        console.log('[content/example] returning cached data')
        return NextResponse.json({ ...cached, cached: true })
      }
    }
    if (force) console.log('[content/example] force refresh — bypassing cache')

    // ── ดึง niche + platform จาก audit_data ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audit = profile.audit_data as any
    const niche = audit?.input?.niche ?? audit?.niche ?? 'general'
    const platform = audit?.input?.platform ?? audit?.platform ?? 'YouTube'

    // ── ค้นหา YouTube ──
    const videos = await searchYouTubeByNiche(niche, youtubeApiKey, 10)
    if (videos.length === 0) {
      return NextResponse.json({ error: 'ไม่พบคลิปตัวอย่าง' }, { status: 404 })
    }

    // ── Claude สร้าง script ──
    const script = await generateScript(
      anthropic,
      niche,
      platform,
      videos,
      profile.channel_data as Record<string, unknown> | null,
      profile.affiliate_products as Record<string, unknown> | null
    )

    const result: ContentExample = {
      videos: videos.slice(0, 10), // แสดง 10 คลิป
      script,
      niche,
      platform,
      generated_at: new Date().toISOString(),
    }

    // ── Save to Supabase ──
    await supabase
      .from('user_profiles')
      .update({ content_example: result })
      .eq('id', userId)

    return NextResponse.json(result)

  } catch (err) {
    console.error('[/api/content/example]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
