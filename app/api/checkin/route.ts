// @ts-nocheck
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

let anthropic: Anthropic | null = null
function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  if (!anthropic) anthropic = new Anthropic({ apiKey: key })
  return anthropic
}

const NICHE_TH: Record<string, string> = {
  food: 'อาหาร/ทำอาหาร', beauty: 'ความงาม/สกินแคร์', fitness: 'ฟิตเนส/สุขภาพ',
  lifestyle: 'ไลฟ์สไตล์', finance: 'การเงิน/ลงทุน', business: 'ธุรกิจ',
  education: 'การศึกษา', travel: 'ท่องเที่ยว', entertainment: 'บันเทิง', other: 'ทั่วไป',
}
const MOOD_TH: Record<string, string> = {
  great: '🔥 ดีมาก — ทำได้เกินเป้า',
  ok: '😊 พอใช้ — ทำได้ตามแผน',
  hard: '😅 ยากหน่อย — มีอุปสรรค',
}

// ── Build coaching prompt with real channel data ─────
function buildCoachingPrompt(p: {
  mood: string; clips: number; income: number; obstacle: string
  weekNo: number; creatorName: string; niche: string; platform: string; targetIncome: number
  // Real channel data
  followers?: number | null; views28d?: number | null; avgViews?: number | null
  completionRate?: number | null; peakHours?: number[]; bestFormat?: string | null
  femalePct?: number | null; topAge?: string | null
}) {
  const nicheTH = NICHE_TH[p.niche] ?? p.niche
  const moodTH  = MOOD_TH[p.mood] ?? p.mood

  const channelContext = [
    p.followers   != null && `- Followers/Subscribers: ${p.followers.toLocaleString('th-TH')}`,
    p.views28d    != null && `- Views 28 วันล่าสุด: ${p.views28d.toLocaleString('th-TH')}`,
    p.avgViews    != null && `- Avg views/คลิป: ${p.avgViews.toLocaleString('th-TH')}`,
    p.completionRate != null && `- Completion rate: ${p.completionRate}%`,
    p.peakHours?.length  && `- Peak posting hours: ${p.peakHours.join(', ')} น.`,
    p.bestFormat  != null && `- Format ที่ดีสุด: ${p.bestFormat}`,
    p.femalePct   != null && `- ผู้ชมหลัก: หญิง ${p.femalePct}% ชาย ${100 - p.femalePct}%`,
    p.topAge      != null && `- ช่วงอายุหลัก: ${p.topAge} ปี`,
  ].filter(Boolean).join('\n')

  return `คุณคือ "โค้ช MITA+" โค้ชคอนเทนต์ครีเอเตอร์ไทยที่เข้าใจคน ใจดี และให้ feedback ที่ actionable จริงๆ

ข้อมูลช่อง (จาก analytics จริง):
- ชื่อ: ${p.creatorName}
- Platform: ${p.platform}
- Niche: ${nicheTH}
- สัปดาห์ที่: ${p.weekNo} / 4
- เป้าหมายรายได้เดือนนี้: ฿${p.targetIncome.toLocaleString('th-TH')}
${channelContext ? channelContext : '- ยังไม่ได้เชื่อมช่อง'}

ผลงานสัปดาห์นี้:
- ความรู้สึกโดยรวม: ${moodTH}
- จำนวนคลิปที่ทำ: ${p.clips} คลิป
- รายได้ affiliate: ฿${p.income.toLocaleString('th-TH')}
- อุปสรรค: ${p.obstacle?.trim() ? p.obstacle : 'ไม่มี'}

เขียน feedback ส่วนตัว 3-4 ประโยค โดยอ้างอิงตัวเลขจากช่องจริงด้วย:
1. ยืนยันว่าได้ยินและเข้าใจ (acknowledge สิ่งที่ทำ)
2. ชมสิ่งที่ทำได้ดี — เจาะจงกับตัวเลขที่รายงาน
3. แนะนำ 1 อย่างที่ควรโฟกัสสัปดาห์หน้า (เจาะจง ทำได้จริง เหมาะกับ niche + ตัวเลขช่องที่มี)
4. ให้กำลังใจสั้นๆ

กฎ: ภาษาไทยเป็นกันเอง ใช้ "นะคะ"/"ค่ะ" emoji 1-2 ตัว ไม่ขึ้นต้น "สวัสดี"`
}

// ── Build script prompt with real channel data ───────
function buildScriptPrompt(p: {
  niche: string; platform: string; clips: number; income: number; obstacle: string
  bestFormat?: string | null; peakHours?: number[]; avgViews?: number | null
  topProductNames?: string[]
}) {
  const nicheTH = NICHE_TH[p.niche] ?? p.niche
  const platformTH = p.platform === 'tiktok' ? 'TikTok' : p.platform === 'youtube' ? 'YouTube'
    : p.platform === 'instagram' ? 'Instagram' : p.platform === 'facebook' ? 'Facebook'
    : p.platform === 'x' ? 'X (Twitter)' : p.platform

  const channelHints = [
    p.bestFormat && `Format ที่ได้ผลดีในช่องนี้: ${p.bestFormat}`,
    p.peakHours?.length && `เวลาโพสต์ที่ดีที่สุด: ${p.peakHours.slice(0, 2).join('-')} น.`,
    p.avgViews && `Avg views/คลิปปัจจุบัน: ${p.avgViews.toLocaleString('th-TH')}`,
  ].filter(Boolean).join(' | ')

  const productHint = p.topProductNames?.length
    ? `สินค้าที่ AI แนะนำให้โปรโมต: ${p.topProductNames.slice(0, 3).join(', ')}`
    : ''

  return `คุณคือผู้เชี่ยวชาญด้านคอนเทนต์ไทยที่รู้ว่า format ไหน viral ใน ${platformTH}

ครีเอเตอร์ niche: ${nicheTH}
สัปดาห์ที่ผ่านมา: ทำ ${p.clips} คลิป ได้ ฿${p.income}
ปัญหาที่เจอ: ${p.obstacle || 'ไม่มีพิเศษ'}
${channelHints ? `ข้อมูลช่อง: ${channelHints}` : ''}
${productHint}

แนะนำ **1 ไอเดียคลิปถัดไป** ที่เหมาะกับ format และ audience ของช่องนี้:

ตอบในรูปแบบ:
🎬 **ชื่อคลิป (hook):** [hook สั้นๆ น่าคลิก]
📝 **โครงสร้าง:** [3 ขั้นตอนสั้นๆ]
💡 **ทำไมถึงได้ผล:** [1 ประโยค — อ้างอิง format ที่ดีของช่องนี้ถ้ามี]
🛍 **สินค้า affiliate แนะนำ:** [ชื่อสินค้าจากรายการด้านบน + เหตุผลสั้น]

ภาษาไทยเป็นกันเอง กระชับ ไม่เกิน 8 บรรทัด`
}

// ── Fallbacks ────────────────────────────────────────
function getMockCoaching(mood: string, clips: number, income: number, obstacle: string, weekNo: number): string {
  if (mood === 'hard' && obstacle) {
    return `รับทราบแล้วนะคะ สัปดาห์นี้ดูเหนื่อยนิดหน่อย แต่ที่ทำ ${clips} คลิปได้ก็ถือว่าไม่น้อยนะคะ เรื่อง "${obstacle}" ลองแก้โดยทำคลิปสั้นลงครึ่งนึงก่อนดูค่ะ 💪`
  }
  if (income > 0) {
    return `สัปดาห์ที่ ${weekNo} ทำ ${clips} คลิปและได้ ฿${income.toLocaleString('th-TH')} — เริ่มเห็น result แล้วค่ะ! สัปดาห์หน้าลองทำซ้ำ format ที่ได้ผลดีนะคะ 🎯`
  }
  return `${clips} คลิปสัปดาห์นี้ดีค่ะ ยังไม่เห็นรายได้ไม่เป็นไร — affiliate ใช้เวลา 1-2 อาทิตย์กว่าจะ convert นะคะ สัปดาห์หน้าเน้นใส่ link ให้ชัดขึ้นค่ะ`
}

function getMockScript(niche: string): string {
  const scripts: Record<string, string> = {
    food:    `🎬 **ชื่อคลิป:** "ทำ Nordic Cake ครั้งแรก...พังมั้ย? 😅"\n📝 **โครงสร้าง:** เปิดด้วยผลลัพธ์ก่อน → process → reveal สำเร็จ\n💡 **ทำไมถึงได้ผล:** Curiosity gap + happy ending ได้ save เยอะ\n🛍 **สินค้าแนะนำ:** พิมพ์ซิลิโคน Nordic — แสดงในคลิปได้เลย`,
    beauty:  `🎬 **ชื่อคลิป:** "ใช้ครีมนี้ 7 วัน ผิวเปลี่ยนไหม?"\n📝 **โครงสร้าง:** Before → Day 1-3 → After 7 วัน\n💡 **ทำไมถึงได้ผล:** Time-lapse transformation = save & share สูง\n🛍 **สินค้าแนะนำ:** เซรั่มวิตามินซี — visual เห็นผลชัด`,
    fitness: `🎬 **ชื่อคลิป:** "ออกกำลังกาย 15 นาทีที่บ้าน ไม่ต้องอุปกรณ์"\n📝 **โครงสร้าง:** Hook ท่าแรก → 5 ท่า → motivation ending\n💡 **ทำไมถึงได้ผล:** Low barrier — คนดูทำตามได้จริง = save สูง\n🛍 **สินค้าแนะนำ:** Resistance Band — ใส่ optional challenge ท้ายคลิป`,
    default: `🎬 **ชื่อคลิป:** "สิ่งที่ฉันทำแล้วชีวิตเปลี่ยน..."\n📝 **โครงสร้าง:** Hook 3 วิ → เล่าเรื่องสั้น → tip actionable → CTA\n💡 **ทำไมถึงได้ผล:** Personal story + value = engagement สูง\n🛍 **สินค้าแนะนำ:** เลือกสินค้าที่ใช้ใน story จริงๆ ดูน่าเชื่อถือกว่า`,
  }
  return scripts[niche] ?? scripts.default
}

// ── Main handler ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      mood, clips, income, obstacle,
      weekNo, creatorName, niche, platform, targetIncome,
    } = body

    // ── Load real channel data from Supabase ──────────
    let channelContext: Record<string, any> = {}
    let affiliateProducts: any[] = []
    let peakHoursReal: number[] = []
    let peakDaysReal: string[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

    if (userId && supabaseUrl && serviceKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceKey)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('channel_data, affiliate_products, monetization_plan')
          .eq('id', userId)
          .single()

        if (profile) {
          // Extract channel data
          const raw = profile.channel_data as any
          const channelData: Record<string, any> = (() => {
            if (!raw) return {}
            if (raw.platform && raw.overview && !raw.tiktok) return { [raw.platform]: raw }
            return raw
          })()

          const platforms = Object.keys(channelData)
          const primaryPlatform = platforms[0] ?? platform
          const pd  = channelData[primaryPlatform] ?? {}
          const ov  = pd.overview ?? {}
          const aud = pd.audience ?? {}
          const con = pd.content  ?? {}

          channelContext = {
            followers:      ov.followers ?? ov.subscribers ?? null,
            views28d:       ov.views_28d ?? ov.impressions_28d ?? null,
            avgViews:       con.avg_views_per_video ?? null,
            completionRate: pd.watch_time?.avg_completion_rate_pct ?? null,
            peakHours:      aud.peak_hours ?? [],
            peakDays:       aud.peak_days ?? [],
            bestFormat:     con.best_format ?? null,
            femalePct:      aud.gender_female_pct ?? null,
            topAge:         (() => {
              const ages = [
                { key: 'age_13_17_pct', label: '13-17' }, { key: 'age_18_24_pct', label: '18-24' },
                { key: 'age_25_34_pct', label: '25-34' }, { key: 'age_35_44_pct', label: '35-44' },
                { key: 'age_45_plus_pct', label: '45+' },
              ]
              let top = ages[0]
              for (const ag of ages) if ((aud[ag.key] ?? 0) > (aud[top.key] ?? 0)) top = ag
              return aud[top.key] ? top.label : null
            })(),
          }

          peakHoursReal = channelContext.peakHours
          peakDaysReal  = channelContext.peakDays

          // Real affiliate products
          const ap = profile.affiliate_products as any
          affiliateProducts = ap?.products ?? []
        }
      } catch (err) {
        console.warn('[checkin] Failed to load profile:', err)
      }
    }

    const topProductNames = affiliateProducts
      .slice(0, 3)
      .map((p: any) => p.name)
      .filter(Boolean)

    const ai = getClient()

    if (!ai) {
      return NextResponse.json({
        message: getMockCoaching(mood, clips, income, obstacle, weekNo),
        script:  getMockScript(niche),
        peakHours: peakHoursReal,
        peakDays: peakDaysReal,
        affiliateProducts: affiliateProducts.slice(0, 3),
      })
    }

    // ── Call Claude in parallel ───────────────────────
    const [coachMsg, scriptMsg] = await Promise.all([
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        messages: [{ role: 'user', content: buildCoachingPrompt({
          mood, clips, income, obstacle, weekNo, creatorName, niche, platform, targetIncome,
          ...channelContext,
        })}],
      }),
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 350,
        messages: [{ role: 'user', content: buildScriptPrompt({
          niche, platform, clips, income, obstacle,
          bestFormat: channelContext.bestFormat,
          peakHours: channelContext.peakHours,
          avgViews: channelContext.avgViews,
          topProductNames,
        })}],
      }),
    ])

    const message = coachMsg.content[0].type === 'text'
      ? coachMsg.content[0].text.trim()
      : getMockCoaching(mood, clips, income, obstacle, weekNo)

    const script = scriptMsg.content[0].type === 'text'
      ? scriptMsg.content[0].text.trim()
      : getMockScript(niche)

    console.log(`[checkin] ✅ Coach response for user ${userId ?? 'anon'}`)

    return NextResponse.json({
      message,
      script,
      peakHours: peakHoursReal,
      peakDays: peakDaysReal,
      affiliateProducts: affiliateProducts.slice(0, 3),
      channelSummary: channelContext.followers ? {
        followers: channelContext.followers,
        views28d: channelContext.views28d,
        bestFormat: channelContext.bestFormat,
      } : null,
    })

  } catch (err) {
    console.error('[checkin]', err)
    return NextResponse.json({
      message: 'ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪',
      script: getMockScript('other'),
      peakHours: [],
      peakDays: [],
      affiliateProducts: [],
    })
  }
}
