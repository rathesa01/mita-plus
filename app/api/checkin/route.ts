import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

let client: Anthropic | null = null
function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  if (!client) client = new Anthropic({ apiKey: key })
  return client
}

const NICHE_TH: Record<string, string> = {
  food:          'อาหาร/ทำอาหาร',
  beauty:        'ความงาม/สกินแคร์',
  fitness:       'ฟิตเนส/สุขภาพ',
  lifestyle:     'ไลฟ์สไตล์',
  finance:       'การเงิน/ลงทุน',
  business:      'ธุรกิจ',
  education:     'การศึกษา',
  travel:        'ท่องเที่ยว',
  entertainment: 'บันเทิง',
  other:         'ทั่วไป',
}

const MOOD_TH: Record<string, string> = {
  great: '🔥 ดีมาก — ทำได้เกินเป้า',
  ok:    '😊 พอใช้ — ทำได้ตามแผน',
  hard:  '😅 ยากหน่อย — มีอุปสรรค',
}

// ── Coaching response ──────────────────────────────
function buildCoachingPrompt(p: {
  mood: string; clips: number; income: number; obstacle: string
  weekNo: number; creatorName: string; niche: string; platform: string; targetIncome: number
}) {
  const nicheTH = NICHE_TH[p.niche] ?? p.niche
  const moodTH  = MOOD_TH[p.mood]   ?? p.mood

  return `คุณคือ "โค้ช MITA+" โค้ชคอนเทนต์ครีเอเตอร์ไทยที่เข้าใจคน ใจดี และให้ feedback ที่ actionable จริงๆ

ข้อมูลครีเอเตอร์:
- ชื่อ: ${p.creatorName}
- Platform: ${p.platform}
- Niche: ${nicheTH}
- สัปดาห์ที่: ${p.weekNo} / 4
- เป้าหมายรายได้เดือนนี้: ฿${p.targetIncome.toLocaleString('th-TH')}

ผลงานสัปดาห์นี้:
- ความรู้สึกโดยรวม: ${moodTH}
- จำนวนคลิปที่ทำ: ${p.clips} คลิป
- รายได้ affiliate: ฿${p.income.toLocaleString('th-TH')}
- อุปสรรค: ${p.obstacle?.trim() ? p.obstacle : 'ไม่มี'}

เขียน feedback ส่วนตัวสั้นๆ 3-4 ประโยค:
1. ยืนยันว่าได้ยินและเข้าใจ (acknowledge สิ่งที่ทำ)
2. ชมสิ่งที่ทำได้ดี — เจาะจงกับตัวเลขที่รายงาน
3. แนะนำ 1 อย่างที่ควรโฟกัสสัปดาห์หน้า (เจาะจง ทำได้จริง เหมาะกับ niche)
4. ให้กำลังใจสั้นๆ

กฎ: ภาษาไทยเป็นกันเอง ใช้ "นะคะ"/"ค่ะ" emoji 1-2 ตัว ไม่ขึ้นต้น "สวัสดี"`
}

// ── Script suggestion ──────────────────────────────
function buildScriptPrompt(p: {
  niche: string; platform: string; clips: number; income: number; obstacle: string
}) {
  const nicheTH   = NICHE_TH[p.niche] ?? p.niche
  const platformTH = p.platform === 'tiktok' ? 'TikTok' : p.platform === 'youtube' ? 'YouTube' : p.platform === 'instagram' ? 'Instagram' : p.platform

  return `คุณคือผู้เชี่ยวชาญด้านคอนเทนต์ไทยที่รู้ว่า format ไหน viral ใน ${platformTH}

ครีเอเตอร์ niche: ${nicheTH}
สัปดาห์ที่ผ่านมา: ทำ ${p.clips} คลิป ได้ ฿${p.income}
ปัญหาที่เจอ: ${p.obstacle || 'ไม่มีพิเศษ'}

แนะนำ **1 ไอเดียคลิปถัดไป** ที่น่าจะ perform ดีสุดสำหรับ niche นี้:

ตอบในรูปแบบ:
🎬 **ชื่อคลิป (hook):** [hook สั้นๆ น่าคลิก]
📝 **โครงสร้าง:** [3 ขั้นตอนสั้นๆ]
💡 **ทำไมถึงได้ผล:** [1 ประโยค]
🛍 **สินค้า affiliate ที่แนะนำให้ใส่:** [ชื่อสินค้า + เหตุผลสั้น]

ภาษาไทยเป็นกันเอง กระชับ ไม่เกิน 8 บรรทัด`
}

// ── Mock fallbacks ─────────────────────────────────
function getMockCoaching(mood: string, clips: number, income: number, obstacle: string, weekNo: number): string {
  if (mood === 'hard' && obstacle) {
    return `รับทราบแล้วนะคะ สัปดาห์นี้ดูเหนื่อยนิดหน่อย แต่ที่ทำ ${clips} คลิปได้ก็ถือว่าไม่น้อยนะคะ เรื่อง "${obstacle}" ลองแก้โดยทำคลิปสั้นลงครึ่งนึงก่อนดูค่ะ บางทีเร็วกว่า = ดีกว่าค่ะ 💪`
  }
  if (income > 0) {
    return `สัปดาห์ที่ ${weekNo} ทำ ${clips} คลิปและได้ ฿${income.toLocaleString('th-TH')} — เริ่มเห็น result แล้วค่ะ! สัปดาห์หน้าลองทำซ้ำ format คลิปที่ได้ engagement ดีสุดนะคะ ยอดจะเพิ่มขึ้นแน่นอนค่ะ 🎯`
  }
  return `${clips} คลิปสัปดาห์นี้ดีค่ะ ยังไม่เห็นรายได้ไม่เป็นไร — affiliate ใช้เวลา 1-2 อาทิตย์กว่าจะเริ่ม convert นะคะ สัปดาห์หน้าเน้นใส่ link ใน bio และ comment ให้ชัดขึ้นค่ะ`
}

function getMockScript(niche: string): string {
  const scripts: Record<string, string> = {
    food:    `🎬 **ชื่อคลิป:** "ทำ Nordic Cake ครั้งแรก...พังมั้ย? 😅"\n📝 **โครงสร้าง:** เปิดด้วยผลลัพธ์ก่อน → process step-by-step → reveal สำเร็จ\n💡 **ทำไมถึงได้ผล:** Curiosity gap + happy ending สูตรนี้ได้ save เยอะมาก\n🛍 **สินค้าแนะนำ:** พิมพ์ซิลิโคน Nordic — แสดงในคลิปได้เลยค่ะ`,
    beauty:  `🎬 **ชื่อคลิป:** "ใช้ครีมนี้ 7 วัน ผิวเปลี่ยนไหม?"\n📝 **โครงสร้าง:** Before → Day 1-3 update → After 7 วัน\n💡 **ทำไมถึงได้ผล:** Time-lapse transformation = save & share สูงสุดใน beauty niche\n🛍 **สินค้าแนะนำ:** เซรั่มวิตามินซี — visual เห็นผลชัดค่ะ`,
    fitness: `🎬 **ชื่อคลิป:** "ออกกำลังกาย 15 นาทีที่บ้าน ไม่ต้องอุปกรณ์"\n📝 **โครงสร้าง:** Hook ท่าแรกตรง 0:05 → 5 ท่า 2 นาทีต่อท่า → motivation ending\n💡 **ทำไมถึงได้ผล:** Low barrier to entry — คนดูทำตามได้จริง = save สูง\n🛍 **สินค้าแนะนำ:** Resistance Band — ใส่ optional challenge ท้ายคลิปค่ะ`,
    default: `🎬 **ชื่อคลิป:** "สิ่งที่ฉันทำแล้วชีวิตเปลี่ยน..."\n📝 **โครงสร้าง:** Hook แรก 3 วิ → เล่าเรื่องสั้น → tip actionable → CTA\n💡 **ทำไมถึงได้ผล:** Personal story + value = engagement และ follow สูง\n🛍 **สินค้าแนะนำ:** เลือกสินค้าที่ใช้ใน story จริงๆ ค่ะ ดูน่าเชื่อถือกว่า`,
  }
  return scripts[niche] ?? scripts.default
}

// ── Main handler ───────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mood, clips, income, obstacle, weekNo, creatorName, niche, platform, targetIncome } = body

    const ai = getClient()

    if (!ai) {
      return NextResponse.json({
        message: getMockCoaching(mood, clips, income, obstacle, weekNo),
        script:  getMockScript(niche),
      })
    }

    // Run coaching + script in parallel (saves ~300ms + cost)
    const [coachMsg, scriptMsg] = await Promise.all([
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 350,
        messages: [{ role: 'user', content: buildCoachingPrompt({ mood, clips, income, obstacle, weekNo, creatorName, niche, platform, targetIncome }) }],
      }),
      ai.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildScriptPrompt({ niche, platform, clips, income, obstacle }) }],
      }),
    ])

    const message = coachMsg.content[0].type === 'text'
      ? coachMsg.content[0].text.trim()
      : getMockCoaching(mood, clips, income, obstacle, weekNo)

    const script = scriptMsg.content[0].type === 'text'
      ? scriptMsg.content[0].text.trim()
      : getMockScript(niche)

    return NextResponse.json({ message, script })
  } catch (err) {
    console.error('[checkin]', err)
    return NextResponse.json({
      message: 'ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪',
      script:  getMockScript('other'),
    })
  }
}
