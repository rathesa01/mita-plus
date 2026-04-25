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

// ── Income range helpers ─────────────────────────────
type IncomeRange = 'zero' | 'low' | 'mid' | 'high'

function incomeRangeToTH(r: IncomeRange): string {
  return { zero: '฿0 (ยังไม่มีรายได้)', low: '฿1–500', mid: '฿500–2,000', high: '฿2,000+' }[r]
}

function incomeRangeToNumber(r: IncomeRange): number {
  return { zero: 0, low: 250, mid: 1250, high: 3000 }[r]
}

const NICHE_TH: Record<string, string> = {
  food: 'อาหาร/ทำอาหาร', beauty: 'ความงาม/สกินแคร์', fitness: 'ฟิตเนส/สุขภาพ',
  lifestyle: 'ไลฟ์สไตล์', finance: 'การเงิน/ลงทุน', business: 'ธุรกิจ',
  education: 'การศึกษา', travel: 'ท่องเที่ยว', entertainment: 'บันเทิง', other: 'ทั่วไป',
  fashion: 'แฟชั่น', review: 'รีวิวสินค้า', gaming: 'เกม', tech: 'เทคโนโลยี',
  pets: 'สัตว์เลี้ยง', mom_baby: 'แม่และเด็ก', cafe: 'คาเฟ่/กาแฟ',
}
const MOOD_TH: Record<string, string> = {
  great: '🔥 ดีมาก — ทำได้เกินเป้า',
  ok: '😊 พอใช้ — ทำได้ตามแผน',
  hard: '😅 ยากหน่อย — มีอุปสรรค',
}

// ── Build coaching prompt ────────────────────────────
function buildCoachingPrompt(p: {
  mood: string; clips: number; incomeRange: IncomeRange; obstacle: string
  weekNo: number; creatorName: string; niche: string; platform: string; targetIncome: number
  followers?: number | null; views28d?: number | null; avgViews?: number | null
  completionRate?: number | null; peakHours?: number[]; bestFormat?: string | null
  femalePct?: number | null; topAge?: string | null
  prevIncome?: IncomeRange | null  // last week's income range
}) {
  const nicheTH = NICHE_TH[p.niche] ?? p.niche
  const moodTH  = MOOD_TH[p.mood] ?? p.mood
  const incomeTH = incomeRangeToTH(p.incomeRange)

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

  const prevContext = p.prevIncome
    ? `รายได้สัปดาห์ที่แล้ว: ${incomeRangeToTH(p.prevIncome)}`
    : ''

  return `คุณคือ "โค้ช MITA+" โค้ชคอนเทนต์ครีเอเตอร์ไทยที่เข้าใจคน ใจดี และให้ feedback ที่ actionable จริงๆ

ข้อมูลช่อง:
- ชื่อ: ${p.creatorName}
- Platform: ${p.platform}  Niche: ${nicheTH}
- สัปดาห์ที่: ${p.weekNo} / 4
- เป้าหมายรายได้เดือนนี้: ฿${p.targetIncome.toLocaleString('th-TH')}
${channelContext ? channelContext : '- ยังไม่ได้เชื่อมช่อง'}

ผลงานสัปดาห์นี้:
- ความรู้สึก: ${moodTH}
- คลิปที่ทำ: ${p.clips} คลิป
- รายได้ affiliate: ${incomeTH}
${prevContext}
- อุปสรรค: ${p.obstacle?.trim() ? p.obstacle : 'ไม่มี'}

เขียน feedback ส่วนตัว 3 ประโยค:
1. acknowledge สิ่งที่ทำ — อ้างอิงตัวเลขรายได้จริง
2. ชมหรือให้มุมมองใหม่กับรายได้ที่รายงาน
3. แนะนำ 1 action สัปดาห์หน้าที่เจาะจงกับ niche + รายได้ระดับนี้

กฎ: ภาษาไทยเป็นกันเอง "นะคะ"/"ค่ะ" emoji ≤2 ตัว ไม่ขึ้นต้น "สวัสดี"`
}

// ── Build income-focused weekly plan prompt ──────────
function buildWeeklyPlanPrompt(p: {
  incomeRange: IncomeRange; niche: string; platform: string
  clips: number; obstacle: string; weekNo: number; targetIncome: number
  bestFormat?: string | null; topProductNames?: string[]
  channelFollowers?: number | null; avgViews?: number | null
  prevCheckins?: Array<{ week_no: number; income_range: string; clips: number }>
}) {
  const nicheTH   = NICHE_TH[p.niche] ?? p.niche
  const incomeTH  = incomeRangeToTH(p.incomeRange)

  // Income-level strategy
  const strategyMap: Record<IncomeRange, { goal: string; focus: string; tactic: string }> = {
    zero: {
      goal: 'ทำยอดขายแรก ฿1 ขึ้นไปภายในสัปดาห์หน้า',
      focus: 'เน้นใส่ affiliate link ให้ชัดเจนในทุกคลิป และพูดถึงสินค้าตรงๆ อย่างน้อย 1 คลิป/สัปดาห์',
      tactic: 'สร้าง 1 คลิป review สินค้าตรง ใส่ link ใน bio + description ให้ครบ',
    },
    low: {
      goal: 'เพิ่มรายได้ 2x จากสัปดาห์นี้ — เป้า ฿500-1,000',
      focus: 'scale สิ่งที่ work แล้ว ทำคลิปแบบเดิมที่ทำให้มียอดขายอีก 2-3 คลิป',
      tactic: 'identify คลิปที่ทำให้ขายได้ ทำซ้ำ format นั้น เพิ่ม CTAs ให้ชัด',
    },
    mid: {
      goal: 'เพิ่มแหล่งรายได้ที่ 2 — หรือเพิ่ม commission rate ด้วยสินค้าใหม่',
      focus: 'ลอง affiliate program ที่ 2 หรือ product tier สูงขึ้นที่ commission ดีกว่า',
      tactic: 'เปรียบเทียบสินค้า 2 ตัวในคลิปเดียว — คนดูได้ข้อมูล คุณได้ 2 affiliate link',
    },
    high: {
      goal: 'สร้าง recurring — ทำให้รายได้มาทุกสัปดาห์ ไม่ใช่แค่สัปดาห์ดีๆ',
      focus: 'สร้าง content series ที่ link กัน — คนดูตอนที่ 1 ต้องตามดูตอนที่ 2',
      tactic: 'วางแผน 3-4 คลิปที่เป็น series ใน niche เดียว ทำ 1 คลิป/วัน',
    },
  }

  const strategy = strategyMap[p.incomeRange]
  const prevHistory = p.prevCheckins?.length
    ? `ประวัติ: ${p.prevCheckins.map(c => `W${c.week_no}: ${incomeRangeToTH(c.income_range as IncomeRange)} (${c.clips} คลิป)`).join(' → ')}`
    : ''

  const channelCtx = [
    p.channelFollowers && `Followers: ${p.channelFollowers.toLocaleString('th-TH')}`,
    p.avgViews && `Avg views: ${p.avgViews.toLocaleString('th-TH')}`,
    p.bestFormat && `Format ที่ดีสุด: ${p.bestFormat}`,
  ].filter(Boolean).join(' | ')

  const productHint = p.topProductNames?.length
    ? `สินค้าที่ MITA+ แนะนำ: ${p.topProductNames.slice(0, 3).join(', ')}`
    : ''

  return `คุณคือผู้เชี่ยวชาญด้านรายได้ creator ไทย สร้างแผนประจำสัปดาห์ที่ focus เรื่องรายได้จริงๆ

Creator:
- Niche: ${nicheTH}  Platform: ${p.platform}
- สัปดาห์นี้รายได้: ${incomeTH}  ทำ ${p.clips} คลิป
- เป้าหมายรายได้: ฿${p.targetIncome.toLocaleString('th-TH')}/เดือน
- ปัญหา: ${p.obstacle || 'ไม่มี'}
${channelCtx ? `- ช่อง: ${channelCtx}` : ''}
${prevHistory}
${productHint}

กลยุทธ์สำหรับ income level นี้:
- เป้าสัปดาห์หน้า: ${strategy.goal}
- โฟกัส: ${strategy.focus}
- Tactic หลัก: ${strategy.tactic}

สร้าง "แผนรายได้สัปดาห์หน้า" ในรูปแบบ:

💰 **เป้าหมาย:** [ตัวเลขรายได้ที่ควรทำได้สัปดาห์หน้า]

📅 **แผน 3 วันสำคัญ:**
วันที่ 1-2: [action เจาะจง — ทำอะไร กับสินค้าไหน]
วันที่ 3-4: [action เจาะจง]
วันที่ 5-7: [action เจาะจง]

🎯 **คลิป priority สัปดาห์นี้:** [ชื่อคลิป hook 1 คลิปที่ควรทำก่อน]

🛍 **สินค้าที่ควรโปรโมต:** [ชื่อสินค้า + เหตุผลสั้น]

⚡ **เคล็ดลับ income ระดับนี้:** [1 tip เจาะจงกับรายได้ระดับ ${incomeTH}]

ภาษาไทยเป็นกันเอง กระชับ ไม่เกิน 12 บรรทัด`
}

// ── Week 3 diagnosis prompt ──────────────────────────
function buildDiagnosisPrompt(p: {
  niche: string; platform: string; checkins: Array<{ clips: number; income_range: string; obstacle: string; mood: string }>
  targetIncome: number; channelFollowers?: number | null; topProductNames?: string[]
}) {
  const nicheTH = NICHE_TH[p.niche] ?? p.niche
  const history = p.checkins.map((c, i) =>
    `W${i + 1}: รายได้ ${incomeRangeToTH(c.income_range as IncomeRange)}, ${c.clips} คลิป, mood: ${MOOD_TH[c.mood] ?? c.mood}${c.obstacle ? `, ปัญหา: ${c.obstacle}` : ''}`
  ).join('\n')

  const productCtx = p.topProductNames?.length
    ? `สินค้าที่มีอยู่: ${p.topProductNames.join(', ')}`
    : 'ยังไม่มีสินค้าแนะนำ'

  return `คุณคือหมอวินิจฉัยรายได้ creator ไทย

Creator ทำ 3 สัปดาห์แล้ว ยังไม่มีรายได้เลย:
- Niche: ${nicheTH}  Platform: ${p.platform}
- เป้า: ฿${p.targetIncome.toLocaleString('th-TH')}/เดือน
${p.channelFollowers ? `- Followers: ${p.channelFollowers.toLocaleString('th-TH')}` : ''}
- ${productCtx}

ประวัติ 3 สัปดาห์:
${history}

วินิจฉัยสาเหตุที่แท้จริงว่าทำไมถึงไม่มีรายได้ และให้แผนแก้ไขเฉพาะบุคคล:

🔍 **วินิจฉัย:** [สาเหตุหลัก 1-2 ประโยค — เจาะจง อ้างอิงข้อมูลจริง]

🚨 **สิ่งที่ต้องแก้ทันที (ภายใน 48 ชม):**
• [action 1 — ทำได้ในวันนี้]
• [action 2 — ทำได้ในวันนี้]

🎯 **แผนเร่งด่วน 7 วัน:**
[3-4 ขั้นตอนที่ focus เรื่องยอดขายแรก]

💡 **สิ่งที่คนส่วนใหญ่ในช่วงนี้ทำผิด:** [insight 1 ประโยค]

ภาษาไทยตรงๆ ไม่ปลอบใจเกินไป แต่ยังให้กำลังใจปิดท้าย ≤12 บรรทัด`
}

// ── Script prompt ────────────────────────────────────
function buildScriptPrompt(p: {
  niche: string; platform: string; clips: number; incomeRange: IncomeRange; obstacle: string
  bestFormat?: string | null; peakHours?: number[]; avgViews?: number | null
  topProductNames?: string[]
}) {
  const nicheTH   = NICHE_TH[p.niche] ?? p.niche
  const platformTH = { tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', x: 'X (Twitter)' }[p.platform] ?? p.platform

  const channelHints = [
    p.bestFormat && `Format ที่ได้ผลดีในช่องนี้: ${p.bestFormat}`,
    p.peakHours?.length && `เวลาโพสต์ที่ดีที่สุด: ${p.peakHours.slice(0, 2).join('-')} น.`,
    p.avgViews && `Avg views/คลิปปัจจุบัน: ${p.avgViews.toLocaleString('th-TH')}`,
  ].filter(Boolean).join(' | ')

  const productHint = p.topProductNames?.length
    ? `สินค้าที่ AI แนะนำ: ${p.topProductNames.slice(0, 3).join(', ')}`
    : ''

  return `คุณคือผู้เชี่ยวชาญด้านคอนเทนต์ไทยที่รู้ว่า format ไหน viral ใน ${platformTH}

ครีเอเตอร์ niche: ${nicheTH}
สัปดาห์ที่ผ่านมา: ทำ ${p.clips} คลิป รายได้: ${incomeRangeToTH(p.incomeRange)}
ปัญหา: ${p.obstacle || 'ไม่มีพิเศษ'}
${channelHints ? `ข้อมูลช่อง: ${channelHints}` : ''}
${productHint}

แนะนำ **1 ไอเดียคลิปถัดไป** ที่ทำให้ได้รายได้จาก affiliate จริงๆ:

🎬 **ชื่อคลิป (hook):** [hook สั้น น่าคลิก]
📝 **โครงสร้าง:** [3 ขั้นตอน]
💡 **ทำไมถึงได้ผล:** [1 ประโยค]
🛍 **สินค้า affiliate แนะนำ:** [ชื่อ + เหตุผล]

ภาษาไทยเป็นกันเอง ≤8 บรรทัด`
}

// ── Fallbacks ────────────────────────────────────────
function getMockCoaching(mood: string, clips: number, incomeRange: IncomeRange, weekNo: number): string {
  const incomeTH = incomeRangeToTH(incomeRange)
  if (incomeRange === 'zero' && weekNo >= 2) {
    return `${clips} คลิปสัปดาห์นี้ดีค่ะ แต่ยังไม่มีรายได้เข้ามา — สัปดาห์หน้าลอง focus ที่การใส่ affiliate link ในทุกคลิปให้ชัดขึ้นนะคะ อย่าลืม CTA ตอนท้ายคลิปด้วยค่ะ 💪`
  }
  if (incomeRange !== 'zero') {
    return `ยอดเยี่ยมมากค่ะ! มีรายได้ ${incomeTH} แล้ว — สัปดาห์ที่ ${weekNo} นี้เริ่มเห็นผลแล้วค่ะ สัปดาห์หน้าทำซ้ำ format ที่ทำให้ขายได้อีกนะคะ 🎯`
  }
  return `${clips} คลิปสัปดาห์นี้ดีค่ะ ยังไม่มีรายได้ไม่เป็นไร — affiliate ใช้เวลา 1-2 อาทิตย์กว่าจะ convert นะคะ สัปดาห์หน้าเน้นใส่ link ให้ชัดขึ้นค่ะ`
}

function getMockScript(niche: string): string {
  const scripts: Record<string, string> = {
    food:    `🎬 **ชื่อคลิป:** "ทำ Nordic Cake ครั้งแรก...พังมั้ย? 😅"\n📝 **โครงสร้าง:** เปิดด้วยผลลัพธ์ก่อน → process → reveal สำเร็จ\n💡 **ทำไมถึงได้ผล:** Curiosity gap + happy ending\n🛍 **สินค้าแนะนำ:** พิมพ์ซิลิโคน Nordic — แสดงในคลิปได้เลย`,
    beauty:  `🎬 **ชื่อคลิป:** "ใช้ครีมนี้ 7 วัน ผิวเปลี่ยนไหม?"\n📝 **โครงสร้าง:** Before → Day 1-3 → After 7 วัน\n💡 **ทำไมถึงได้ผล:** Time-lapse transformation = save สูง\n🛍 **สินค้าแนะนำ:** เซรั่มวิตามินซี — visual ชัด`,
    default: `🎬 **ชื่อคลิป:** "สิ่งที่ฉันทำแล้วชีวิตเปลี่ยน..."\n📝 **โครงสร้าง:** Hook → เล่าเรื่อง → tip actionable → CTA\n💡 **ทำไมถึงได้ผล:** Personal story + value = engagement สูง\n🛍 **สินค้าแนะนำ:** สินค้าที่ใช้ใน story จริงๆ ดูน่าเชื่อถือ`,
  }
  return scripts[niche] ?? scripts.default
}

function getMockWeeklyPlan(incomeRange: IncomeRange, niche: string): string {
  const plans: Record<IncomeRange, string> = {
    zero: `💰 **เป้าหมาย:** ยอดขายแรกภายใน 7 วัน\n\n📅 **แผน 3 วันสำคัญ:**\nวันที่ 1-2: ทำคลิป review สินค้า 1 ตัวตรงๆ ใส่ link ใน bio\nวันที่ 3-4: ทำ Stitch/Duet กับ trend ใน niche — ใส่สินค้าใน description\nวันที่ 5-7: ทบทวน คลิปไหนวิวมากที่สุด — ทำซ้ำ format นั้น\n\n🎯 **คลิป priority:** "[ลองใช้ {niche} นี้ 7 วัน...ผลลัพธ์จะเป็นยังไง?]"\n\n🛍 **สินค้าที่ควรโปรโมต:** เลือก 1 สินค้าจากรายการ affiliate ของคุณที่ราคาไม่แพง\n\n⚡ **เคล็ดลับ:** พูดถึงสินค้าตรงๆ ใน 30 วิแรก — อย่ารอจนจบคลิปค่ะ`,
    low:  `💰 **เป้าหมาย:** เพิ่มรายได้ 2x จากสัปดาห์นี้\n\n📅 **แผน 3 วันสำคัญ:**\nวันที่ 1-2: identify คลิปที่ทำให้ขายได้ — ทำซ้ำ format นั้นทันที\nวันที่ 3-4: เพิ่ม CTA ให้ชัดขึ้นในทุกคลิป ("link in bio" ต้องพูดทุกคลิป)\nวันที่ 5-7: ลอง product tier สูงขึ้น — commission ดีกว่า\n\n🎯 **คลิป priority:** ทำซ้ำคลิปที่ขายได้ แต่ angle ใหม่\n\n🛍 **สินค้าที่ควรโปรโมต:** สินค้าที่เคยมีคนคลิก link แล้ว — scale ตัวนั้นก่อน\n\n⚡ **เคล็ดลับ:** อย่าเปลี่ยนสินค้าบ่อย — ลึกกับตัวเดิมก่อนค่ะ`,
    mid:  `💰 **เป้าหมาย:** เพิ่มแหล่งรายได้ใหม่ — เป้า ฿2,000+\n\n📅 **แผน 3 วันสำคัญ:**\nวันที่ 1-2: เปิด affiliate program ใหม่ 1 ตัว (Involve Asia / Lazada)\nวันที่ 3-4: ทำคลิป compare 2 สินค้า — 2 affiliate links ในคลิปเดียว\nวันที่ 5-7: วิเคราะห์ commission — เลือก 2-3 สินค้าที่ดีที่สุด focus ต่อ\n\n🎯 **คลิป priority:** "เปรียบ [สินค้า A] vs [สินค้า B] — อันไหนคุ้มกว่า?"\n\n🛍 **สินค้าที่ควรโปรโมต:** ลอง product ราคาสูงขึ้น commission ดีกว่า\n\n⚡ **เคล็ดลับ:** Review + Comparison = conversion rate สูงที่สุดค่ะ`,
    high: `💰 **เป้าหมาย:** สร้าง recurring income — ให้รายได้มาทุกสัปดาห์\n\n📅 **แผน 3 วันสำคัญ:**\nวันที่ 1-2: วางแผน content series 4 คลิปที่ link กัน\nวันที่ 3-4: ทำ Ep.1 ของ series + tease Ep.2 ปลายคลิป\nวันที่ 5-7: ดู analytics — คลิปไหน conversion ดีสุด scale ตัวนั้น\n\n🎯 **คลิป priority:** "Series: [niche topic] Part 1 — เริ่มจากศูนย์จนถึง..."\n\n🛍 **สินค้าที่ควรโปรโมต:** สินค้า subscription หรือ bundle — recurring commission\n\n⚡ **เคล็ดลับ:** Series = คนติดตามดู → algorithm ดันอัตโนมัติค่ะ`,
  }
  return plans[incomeRange] ?? plans.zero
}

// ── Main handler ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      mood, clips,
      incomeRange = 'zero',  // NEW: range selector value
      income,                 // legacy fallback (number)
      obstacle,
      weekNo, creatorName, niche, platform, targetIncome,
    } = body

    // Normalize income range
    const incomeRangeVal: IncomeRange = (() => {
      if (incomeRange && ['zero', 'low', 'mid', 'high'].includes(incomeRange)) return incomeRange as IncomeRange
      // fallback: convert old numeric income
      const num = Number(income) || 0
      if (num === 0) return 'zero'
      if (num <= 500) return 'low'
      if (num <= 2000) return 'mid'
      return 'high'
    })()

    // ── Load real data from Supabase ──────────────────
    let channelContext: Record<string, any> = {}
    let affiliateProducts: any[] = []
    let peakHoursReal: number[] = []
    let peakDaysReal: string[] = []
    let prevCheckins: Array<{ week_no: number; income_range: string; clips: number; obstacle: string; mood: string }> = []
    let prevIncomeRange: IncomeRange | null = null

    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey   = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    let supabase: ReturnType<typeof createClient> | null = null

    if (userId && supabaseUrl && serviceKey) {
      supabase = createClient(supabaseUrl, serviceKey)
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('channel_data, affiliate_products, monetization_plan, weekly_checkins')
          .eq('id', userId)
          .single()

        if (profile) {
          // Channel data
          const raw = profile.channel_data as any
          const channelData: Record<string, any> = (() => {
            if (!raw) return {}
            if (raw.platform && raw.overview && !raw.tiktok) return { [raw.platform]: raw }
            return raw
          })()
          const platforms = Object.keys(channelData)
          const primaryPlatform = platforms[0] ?? platform
          const pd = channelData[primaryPlatform] ?? {}
          const ov = pd.overview ?? {}
          const aud = pd.audience ?? {}
          const con = pd.content ?? {}
          channelContext = {
            followers: ov.followers ?? ov.subscribers ?? null,
            views28d: ov.views_28d ?? ov.impressions_28d ?? null,
            avgViews: con.avg_views_per_video ?? null,
            completionRate: pd.watch_time?.avg_completion_rate_pct ?? null,
            peakHours: aud.peak_hours ?? [],
            peakDays: aud.peak_days ?? [],
            bestFormat: con.best_format ?? null,
            femalePct: aud.gender_female_pct ?? null,
            topAge: (() => {
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

          // Affiliate products
          const ap = profile.affiliate_products as any
          affiliateProducts = ap?.products ?? []

          // Previous check-ins
          const wc = profile.weekly_checkins as any
          prevCheckins = (wc?.checkins ?? []) as typeof prevCheckins
          if (prevCheckins.length > 0) {
            prevIncomeRange = prevCheckins[prevCheckins.length - 1].income_range as IncomeRange
          }
        }
      } catch (err) {
        console.warn('[checkin] Failed to load profile:', err)
      }
    }

    const topProductNames = affiliateProducts.slice(0, 3).map((p: any) => p.name).filter(Boolean)

    // ── Week 3 diagnosis trigger ──────────────────────
    // if weekNo >= 3 AND all check-ins so far have income_range = 'zero'
    const allZeroSoFar = prevCheckins.every(c => c.income_range === 'zero')
    const needsDiagnosis = weekNo >= 3 && incomeRangeVal === 'zero' && allZeroSoFar && prevCheckins.length >= 2

    // ── Save check-in to Supabase ─────────────────────
    const newCheckin = {
      week_no: weekNo,
      date: new Date().toISOString().slice(0, 10),
      mood,
      clips: clips ?? 0,
      income_range: incomeRangeVal,
      income_approx: incomeRangeToNumber(incomeRangeVal),
      obstacle: obstacle ?? '',
    }

    if (supabase && userId) {
      try {
        const updatedCheckins = [...prevCheckins.filter(c => c.week_no !== weekNo), newCheckin]
        await supabase
          .from('user_profiles')
          .update({ weekly_checkins: { checkins: updatedCheckins } })
          .eq('id', userId)
        console.log(`[checkin] ✅ Saved check-in W${weekNo} for user ${userId}`)
      } catch (err) {
        console.warn('[checkin] Failed to save check-in:', err)
      }
    }

    // ── Build all check-in history for plan context ───
    const allCheckins = [...prevCheckins.filter(c => c.week_no !== weekNo), newCheckin]

    const ai = getClient()

    if (!ai) {
      return NextResponse.json({
        message: getMockCoaching(mood, clips, incomeRangeVal, weekNo),
        script:  getMockScript(niche),
        weeklyPlan: getMockWeeklyPlan(incomeRangeVal, niche),
        diagnosis: needsDiagnosis ? 'ขอบคุณที่รายงานนะคะ — โค้ชจะวิเคราะห์และส่งแผนเร่งด่วนให้ค่ะ' : null,
        peakHours: peakHoursReal,
        peakDays: peakDaysReal,
        affiliateProducts: affiliateProducts.slice(0, 3),
        incomeRange: incomeRangeVal,
        allCheckins,
      })
    }

    // ── Call Claude (parallel) ────────────────────────
    const promisesToRun: Promise<any>[] = [
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildCoachingPrompt({
          mood, clips, incomeRange: incomeRangeVal, obstacle,
          weekNo, creatorName, niche, platform, targetIncome,
          prevIncome: prevIncomeRange,
          ...channelContext,
        })}],
      }),
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        messages: [{ role: 'user', content: buildWeeklyPlanPrompt({
          incomeRange: incomeRangeVal, niche, platform, clips, obstacle,
          weekNo, targetIncome,
          bestFormat: channelContext.bestFormat,
          topProductNames,
          channelFollowers: channelContext.followers,
          avgViews: channelContext.avgViews,
          prevCheckins: prevCheckins.map(c => ({ week_no: c.week_no, income_range: c.income_range, clips: c.clips })),
        })}],
      }),
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildScriptPrompt({
          niche, platform, clips, incomeRange: incomeRangeVal, obstacle,
          bestFormat: channelContext.bestFormat,
          peakHours: channelContext.peakHours,
          avgViews: channelContext.avgViews,
          topProductNames,
        })}],
      }),
    ]

    // Week 3 diagnosis — add 4th parallel call
    if (needsDiagnosis) {
      promisesToRun.push(
        ai.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 500,
          messages: [{ role: 'user', content: buildDiagnosisPrompt({
            niche, platform, targetIncome,
            checkins: allCheckins,
            channelFollowers: channelContext.followers,
            topProductNames,
          })}],
        })
      )
    }

    const results = await Promise.all(promisesToRun)

    const getText = (r: any) => r.content[0]?.type === 'text' ? r.content[0].text.trim() : null

    const message     = getText(results[0]) ?? getMockCoaching(mood, clips, incomeRangeVal, weekNo)
    const weeklyPlan  = getText(results[1]) ?? getMockWeeklyPlan(incomeRangeVal, niche)
    const script      = getText(results[2]) ?? getMockScript(niche)
    const diagnosis   = needsDiagnosis ? (getText(results[3]) ?? null) : null

    console.log(`[checkin] ✅ W${weekNo} for user ${userId ?? 'anon'} | income: ${incomeRangeVal} | diagnosis: ${!!diagnosis}`)

    return NextResponse.json({
      message,
      weeklyPlan,
      script,
      diagnosis,
      peakHours: peakHoursReal,
      peakDays: peakDaysReal,
      affiliateProducts: affiliateProducts.slice(0, 3),
      channelSummary: channelContext.followers ? {
        followers: channelContext.followers,
        views28d: channelContext.views28d,
        bestFormat: channelContext.bestFormat,
      } : null,
      incomeRange: incomeRangeVal,
      allCheckins,
    })

  } catch (err) {
    console.error('[checkin]', err)
    return NextResponse.json({
      message: 'ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪',
      weeklyPlan: null,
      script: null,
      diagnosis: null,
      peakHours: [],
      peakDays: [],
      affiliateProducts: [],
      incomeRange: 'zero',
      allCheckins: [],
    })
  }
}
