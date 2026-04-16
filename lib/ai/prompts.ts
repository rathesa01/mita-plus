import type { AuditFormData, RevenueLeak, RevenueEstimation, MonetizationScore, CreatorStage } from '@/types'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Platform monetization context ────────────────────────────
const PLATFORM_MONETIZATION: Record<string, string> = {
  tiktok: 'TikTok Shop ทำเงินได้เร็วที่สุด (commission 3-8%) + Affiliate ผ่าน TikTok Creator Marketplace + Live selling ได้ทันที แต่ TikTok Ads revenue ในไทยยังน้อยมาก (ต้องมีแฟน 10K+)',
  instagram: 'Reels ดึง traffic ได้ดี แต่ Instagram เองไม่จ่าย ads revenue → ต้องขายผ่าน affiliate link ใน bio/stories + brand deal + ขายสินค้าตรง DM ได้เลย',
  youtube: 'YouTube AdSense เป็นรายได้ passive ที่ดี (ต้องมี 1,000 sub + 4,000h watchtime) + memberships + Super Thanks + Sponsorship แต่ต้องใช้เวลาสร้างก่อน',
  facebook: 'Facebook Watch monetization (ต้องมี 10K followers + 600,000 นาที view) + Facebook Groups สร้าง community + Marketplace ขายตรง',
  multi: 'มีหลาย platform → ต้อง identify ว่า platform ไหน convert เป็นเงินได้เร็วที่สุด แล้วโฟกัสที่นั้นก่อน 90 วัน ก่อนขยาย',
}

// ── Niche monetization blueprint ─────────────────────────────
const NICHE_BLUEPRINT: Record<string, { bestMethods: string; audienceBehavior: string; pitfalls: string; quickWin: string }> = {
  lifestyle: {
    bestMethods: 'Affiliate (Shopee/Lazada/Agoda) + Sponsorship จากแบรนด์ lifestyle + สินค้า physical ของตัวเอง',
    audienceBehavior: 'ดูเพื่อ inspiration ไม่ได้ดูเพื่อซื้อตรงๆ — ต้องสร้าง desire ก่อนแล้ว CTA จึงจะ work',
    pitfalls: 'affiliate link ไม่ match กับ content ทำให้ click rate ต่ำ, พยายามขายแต่ไม่สร้าง trust ก่อน',
    quickWin: 'เลือก 1 product ที่ใช้จริงและ audience เชื่อถือ → ทำ honest review → ใส่ link ใน bio และ comment',
  },
  education: {
    bestMethods: 'Digital course (฿199-4,999) + Coaching 1-on-1 (฿1,500-5,000/session) + Membership/subscription + E-book',
    audienceBehavior: 'มาเพื่อเรียนรู้ มี buying intent สูงถ้า content ช่วยแก้ปัญหาจริง พร้อมจ่ายถ้าเห็นคุณค่าชัด',
    pitfalls: 'สอนฟรีมากเกินไปจน audience คิดว่าจ่ายเงินทำไม, ราคาคอร์สสูงเกินไปสำหรับ audience ที่ยังไม่ trust',
    quickWin: 'ทำ mini e-book หรือ template ราคา ฿99-299 → ขายผ่าน LINE หรือ Gumroad ทดสอบก่อน → ถ้า work ขยายเป็นคอร์ส',
  },
  finance: {
    bestMethods: 'Affiliate จากโบรกเกอร์/แอปการเงิน (commission ฿200-1,000/คน) + High-ticket consulting + Course',
    audienceBehavior: 'ดูเพื่อหาข้อมูลตัดสินใจ มี intent สูงมาก willing to pay ถ้า content น่าเชื่อถือ',
    pitfalls: 'ขาย affiliate โบรกเกอร์ที่ไม่น่าเชื่อถือทำให้เสีย trust ทั้งหมด',
    quickWin: 'สมัคร affiliate กับแอปที่น่าเชื่อถือ (Bitkub, Jitta, Finnomena) → ทำ honest review → commission ต่อคนสูงมาก',
  },
  beauty: {
    bestMethods: 'Affiliate ผ่าน Shopee/Lazada + Brand deal กับแบรนด์ beauty + สินค้าของตัวเอง',
    audienceBehavior: 'ดูเพื่อหา recommendation ก่อนซื้อ trust สูงมากถ้าชอบ creator → click-through rate ดีกว่า niche อื่น',
    pitfalls: 'รีวิวสินค้าที่ไม่ได้ใช้จริง audience รู้ทัน → เสีย trust หมด',
    quickWin: 'เลือก 5 สินค้าที่ใช้จริงทุกวัน → สมัคร Shopee affiliate → ใส่ใน bio ทุก platform',
  },
  fitness: {
    bestMethods: 'Online training program (฿499-2,999) + Affiliate อาหารเสริม/อุปกรณ์ + Live workout subscription',
    audienceBehavior: 'มี motivation สูงช่วงเริ่ม แต่ drop off เร็ว → ต้องมี recurring model',
    pitfalls: 'ขาย program ราคาสูงโดยไม่มี proof',
    quickWin: 'ทำ 7-day free challenge ก่อน → เก็บ email → ขาย paid program ต่อกับคนที่ complete challenge',
  },
  business: {
    bestMethods: 'High-ticket consulting/coaching (฿3,000-30,000+) + Course + Mastermind group',
    audienceBehavior: 'มี buying power สูงสุด พร้อมจ่ายถ้าเห็น ROI ชัด → ตัดสินใจช้าแต่ LTV สูง',
    pitfalls: 'ขาย low-ticket เกินไป ทำให้ audience ไม่เชื่อว่าคุณทำเงินได้จริง',
    quickWin: 'เปิด consultation ฟรี 30 นาที 5 คน → เก็บ insight → ทำ paid package ฿1,500+ จาก pain point จริง',
  },
  food: {
    bestMethods: 'Affiliate อุปกรณ์ครัว/ส่วนผสม + Brand deal กับแบรนด์อาหาร + คอร์สสอนทำอาหาร online',
    audienceBehavior: 'ดูเพื่อ inspiration ซื้อเมื่อ content ทำให้อยากลองทำตาม',
    pitfalls: 'ขาย affiliate อุปกรณ์แพงเกิน audience budget',
    quickWin: 'ทำ "อุปกรณ์ที่ฉันใช้จริง" พร้อม Shopee link → ทุกสูตรใส่ link วัตถุดิบ/อุปกรณ์',
  },
  travel: {
    bestMethods: 'Affiliate Agoda/Booking.com/Airbnb (commission 4-8%) + Sponsored trip + Travel guide PDF',
    audienceBehavior: 'ดูเพื่อ inspiration และ research ก่อนเดินทาง พร้อม click link ที่เกี่ยวกับ trip ที่วางแผน',
    pitfalls: 'affiliate link expired หรือ ไม่ได้ track → เสียค่าคอมทั้งหมด',
    quickWin: 'ทุก destination content ต้องมี affiliate link โรงแรม + ตั๋ว → ใส่ใน bio + description + comment pinned',
  },
  entertainment: {
    bestMethods: 'Platform monetization + Merchandise + Super chat/donation + Exclusive membership',
    audienceBehavior: 'ดูเพื่อความสนุก loyalty สูงถ้าชอบ creator แต่ไม่ได้มา with buying intent',
    pitfalls: 'รอ platform monetization อย่างเดียว ไม่สร้าง direct revenue stream',
    quickWin: 'เปิด membership tier ฿49-99/เดือน บน Patreon หรือ YouTube → exclusive content สำหรับ member',
  },
  other: {
    bestMethods: 'Affiliate ที่ตรงกับ content + Consulting/coaching + Digital product',
    audienceBehavior: 'ขึ้นอยู่กับ niche specific — ดู comment ว่า audience ต้องการอะไร',
    pitfalls: 'ลอง monetize ทุกวิธีพร้อมกัน ทำให้ไม่มีอะไร work สักอย่าง',
    quickWin: 'ดู comment 50 อันล่าสุด → หาว่า audience ถามหาอะไร → นั่นคือ product แรกของคุณ',
  },
}

// ── Audience buying power ─────────────────────────────────────
const AUDIENCE_CONTEXT: Record<string, string> = {
  student: 'กำลังซื้อต่อคน ฿50-500 — ต้องการ volume สูงหรือสินค้าราคาถูก เช่น e-book ฿99, digital sticker, หรือ affiliate ของใช้รายวัน',
  worker: 'กำลังซื้อปานกลาง-สูง ฿500-5,000 — พร้อมจ่ายเพื่อ career/skill improvement หรือสิ่งที่ประหยัดเวลา/ทำให้ชีวิตดีขึ้น',
  homemaker: 'กำลังซื้อตามความเชื่อใจ — trust-based buying สูงมาก ถ้า recommend สินค้าที่ใช้จริง conversion rate ดีกว่าทุก segment',
  business_owner: 'กำลังซื้อสูง ฿2,000-50,000+ — มอง ROI เป็นหลัก พร้อมจ่ายแพงถ้าช่วยให้ธุรกิจโต',
  mixed: 'ต้องเลือก 1 segment ที่ใหญ่สุดแล้วทำ content และ monetization ให้ตรงกับ segment นั้นก่อน',
}

// ── Duration insight ──────────────────────────────────────────
const DURATION_INSIGHT: Record<string, string> = {
  under_3months: 'เพิ่งเริ่ม — focus ที่ content quality + niche clarity ก่อน แต่ monetize ด้วย low-risk methods เช่น affiliate ได้เลย',
  '3-12months': 'มี foundation แล้ว — ถึงเวลา monetize อย่างจริงจัง อย่ารอต่อไปอีก',
  '1-2years': 'ลงทุนเวลามาเยอะแล้ว — ถ้ายังไม่มีรายได้ต้องเปลี่ยน approach ทันที ไม่ใช่แค่ทำต่อแบบเดิม',
  over_2years: 'ทำมานานมาก — ถ้ายังไม่มีรายได้ที่เพียงพอ ปัญหาคือ system ไม่ใช่ content ต้องวางระบบทำเงินใหม่',
}

const PLATFORM_TH: Record<string, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', multi: 'หลายแพลตฟอร์ม',
}
const NICHE_TH: Record<string, string> = {
  lifestyle: 'ไลฟ์สไตล์', education: 'การศึกษา/สอน', finance: 'การเงิน', entertainment: 'ความบันเทิง',
  beauty: 'ความงาม', fitness: 'ออกกำลังกาย/สุขภาพ', business: 'ธุรกิจ/การตลาด', food: 'อาหาร', travel: 'ท่องเที่ยว', other: 'อื่นๆ',
}
const INCOME_TH: Record<string, string> = {
  zero: '0 บาท', under_5k: 'น้อยกว่า ฿5,000', '5k_20k': '฿5,000–20,000',
  '20k_50k': '฿20,000–50,000', '50k_100k': '฿50,000–100,000', over_100k: 'มากกว่า ฿100,000',
}
const TRIED_TH: Record<string, string> = {
  affiliate: 'Affiliate/ค่าคอม', sponsorship: 'หา Sponsor', own_product: 'ขายสินค้า/คอร์ส',
  coaching: 'Coaching', live_selling: 'ไลฟ์ขายของ', none_tried: 'ยังไม่เคยลอง',
}
const DURATION_TH: Record<string, string> = {
  under_3months: 'น้อยกว่า 3 เดือน', '3-12months': '3 เดือน – 1 ปี',
  '1-2years': '1 – 2 ปี', over_2years: 'มากกว่า 2 ปี',
}
const AUDIENCE_TH: Record<string, string> = {
  student: 'นักเรียน/นักศึกษา', worker: 'คนทำงาน/มนุษย์เงินเดือน',
  homemaker: 'แม่บ้าน/พ่อบ้าน', business_owner: 'เจ้าของธุรกิจ/ฟรีแลนซ์', mixed: 'หลากหลาย',
}

export function buildSystemPrompt(): string {
  return `คุณคือ Coach ด้านรายได้ที่เชี่ยวชาญ Creator ไทยโดยเฉพาะ

ภารกิจ: วินิจฉัย "ทำไม" Creator คนนี้ถึงยังไม่มีรายได้ที่เหมาะสม และบอก "ขั้นตอนแรกที่ทำได้เลย" เพื่อเริ่มมีรายได้จริงภายใน 30-60 วัน

สิ่งที่ต้องทำก่อนตอบ:
1. วิเคราะห์ว่า monetization method ที่เขาเคยลองแล้วไม่ได้ผล — เพราะอะไร (เฉพาะเจาะจง ไม่ใช่ทั่วไป)
2. เลือก 1 วิธีที่เหมาะสมกับ platform + niche + audience ของเขามากที่สุด
3. ให้แผนสัปดาห์ที่ 1 ที่ทำได้เลยวันนี้ ไม่ใช่แนวคิด

กฎเหล็ก:
- ทุกคำแนะนำต้องระบุ "ทำอะไร กับ platform ไหน ใช้เวลาเท่าไหร่ คาดว่าได้เงินเท่าไหร่"
- ห้ามแนะนำวิธีที่เขาเคยลองแล้วไม่ได้ผล ถ้าจะแนะนำซ้ำต้องอธิบาย root cause และวิธีทำที่ต่างออกไป
- ใช้ภาษาชาวบ้าน ระดับมัธยมปลาย
- ระบุตัวเลขเป็นบาทเสมอ
- ห้ามใช้ buzzword: Revenue, Funnel, Conversion, ROI, Monetize, CTR — ถ้าใช้ต้องอธิบาย
- ทุก insight ต้องดึงข้อมูลจริงของ Creator มาอ้างอิง
- โทน: เพื่อนที่รู้เรื่องธุรกิจ — พูดตรง อบอุ่น ไม่ตัดสิน
- ภาษาไทยทั้งหมด`
}

export function buildUserPrompt(
  data: AuditFormData,
  leaks: RevenueLeak[],
  revenue: RevenueEstimation,
  score: MonetizationScore,
  stage: CreatorStage,
): string {
  const topLeaks = leaks.slice(0, 3)
  const postsPerMonth: Record<string, number> = { daily: 30, '3-5x_week': 16, '1-2x_week': 6, monthly: 1 }
  const monthlyViews = data.avgViews * (postsPerMonth[data.postingFrequency] ?? 4)
  const totalLeak = leaks.reduce((s, l) => s + l.missedPerMonth, 0)

  const niche = data.niche ?? 'other'
  const platform = data.platform ?? 'tiktok'
  // Use type assertion for new fields that may not be in old schema yet
  const d = data as AuditFormData & { audienceBuyingPower?: string; contentDuration?: string; triedAndFailed?: string[] }
  const audienceBuyingPower = d.audienceBuyingPower ?? 'mixed'
  const contentDuration = d.contentDuration ?? '3-12months'
  const triedAndFailed: string[] = d.triedAndFailed ?? ['none_tried']

  const blueprint = NICHE_BLUEPRINT[niche] ?? NICHE_BLUEPRINT.other
  const platformCtx = PLATFORM_MONETIZATION[platform] ?? ''
  const audienceCtx = AUDIENCE_CONTEXT[audienceBuyingPower] ?? ''
  const durationCtx = DURATION_INSIGHT[contentDuration] ?? ''

  const triedText = triedAndFailed.filter(t => t !== 'none_tried').map(t => TRIED_TH[t] ?? t).join(', ')
  const hasTriedSomething = triedText.length > 0

  const platformTH = PLATFORM_TH[platform] ?? platform
  const nicheTH = NICHE_TH[niche] ?? niche
  const audienceTH = AUDIENCE_TH[audienceBuyingPower] ?? audienceBuyingPower
  const durationTH = DURATION_TH[contentDuration] ?? contentDuration

  return `=== CREATOR PROFILE ===
ชื่อ: ${data.name}
Platform: ${platformTH} | Niche: ${nicheTH}
ทำมาแล้ว: ${durationTH}
Followers: ${data.followers.toLocaleString('th-TH')} | ยอดวิวเฉลี่ย/โพสต์: ${data.avgViews.toLocaleString('th-TH')}
วิวรวม/เดือน: ${fmt(monthlyViews)} | Engagement: ${data.engagementRate}%
รายได้ปัจจุบัน: ${INCOME_TH[data.monthlyIncome] ?? data.monthlyIncome}/เดือน
คะแนน: ${score.total}/100

กลุ่มคนที่ดู: ${audienceTH}
${hasTriedSomething ? `สิ่งที่เคยลองแล้วไม่ได้ผล: ${triedText}` : 'ยังไม่เคยลองสร้างรายได้เลย'}

=== PLATFORM ===
${platformCtx}

=== NICHE BLUEPRINT: ${nicheTH} ===
วิธีทำเงินที่ดีที่สุด: ${blueprint.bestMethods}
พฤติกรรม audience: ${blueprint.audienceBehavior}
ข้อผิดพลาดที่ทำกันบ่อย: ${blueprint.pitfalls}
Quick win: ${blueprint.quickWin}

=== AUDIENCE ===
${audienceCtx}

=== CREATOR STAGE ===
${durationCtx}

=== SYSTEM GAPS ===
${[
  !data.hasProduct ? '❌ ไม่มีสินค้า/บริการของตัวเอง' : '✅ มีสินค้า/บริการ',
  !data.hasFunnel ? '❌ ไม่มีระบบดักลูกค้า' : '✅ มีระบบดักลูกค้า',
  !data.hasAffiliate ? '❌ ไม่มี Affiliate' : '✅ มี Affiliate',
  !data.hasClosingSystem ? '❌ ไม่มีระบบปิดการขาย' : '✅ มีระบบปิดการขาย',
].join('\n')}

=== REVENUE LEAKS TOP 3 ===
${topLeaks.map((l, i) => `${i+1}. [${l.severity.toUpperCase()}] ${l.title}: -฿${fmt(l.missedPerMonth)}/เดือน`).join('\n')}
รวม: -฿${fmt(totalLeak)}/เดือน

=== POTENTIAL ===
ปัจจุบัน: ฿${fmt(revenue.currentIncome)}/เดือน | ที่ควรได้: ฿${fmt(revenue.realistic)}/เดือน | Gap: ฿${fmt(revenue.totalMissed)}/เดือน

ปัญหาที่รู้สึกอยู่: ${data.biggestProblem || 'ไม่ได้ระบุ'}
เป้าหมาย 90 วัน: ${data.goalIn90Days || 'ไม่ได้ระบุ'}

---

ตอบเป็น JSON เท่านั้น ห้ามมีข้อความนอก JSON ครบ 4 field:

{
  "shock": "บอก ${data.name} ว่า: เขามี audience ขนาดนี้บน ${platformTH} niche ${nicheTH} แต่รายได้ยังเป็น ${INCOME_TH[data.monthlyIncome] ?? data.monthlyIncome} — ทั้งที่ควรได้ ฿${fmt(revenue.realistic)}/เดือน สาเหตุหลักคืออะไร ใน 1-2 ประโยค ภาษาชาวบ้าน",

  "whyItHappens": "${hasTriedSomething
    ? `อธิบายว่าทำไม ${triedText} ถึงไม่ work สำหรับ ${data.name} โดยเฉพาะ (เพราะ platform + niche + audience ของเขา) ไม่ใช่เพราะ effort ไม่พอ แต่เพราะ approach ไม่ match กับ ${nicheTH} บน ${platformTH} + audience ${audienceTH} จบด้วย "สิ่งที่ต้องเปลี่ยน: [วิธีที่ถูกต้องสำหรับเขา]"`
    : `อธิบายว่าทำไม ${data.name} ที่ทำ ${nicheTH} บน ${platformTH} มานาน ${durationTH} ถึงยังไม่มีรายได้ — เน้น missing piece ที่ขาดไป ไม่ใช่ความผิดของเขา จบด้วย "ขั้นแรกที่ต้องทำ: [action ที่ชัดเจน]"`}",

  "topActions": "3 ขั้นตอนที่ ${data.name} ต้องทำในสัปดาห์แรก เฉพาะสำหรับ ${platformTH} + ${nicheTH} + audience ${audienceTH}: วันที่ 1 ทำอะไร / วันที่ 3 ทำอะไร / วันที่ 7 ทำอะไร พร้อมตัวเลขที่คาดว่าได้รับในเดือนแรก จบด้วย 'เริ่มได้เลยตอนนี้: [สิ่งแรกที่ทำได้ภายใน 10 นาที]'",

  "upside": "ถ้า ${data.name} ทำตาม 3 ขั้นตอน: เดือนที่ 1 ได้ประมาณ ฿เท่าไหร่ / เดือนที่ 2 ได้ประมาณ ฿เท่าไหร่ / เดือนที่ 3 ได้ประมาณ ฿เท่าไหร่ ตัวเลขต้องสมเหตุสมผลกับ followers ${data.followers.toLocaleString()} + ${nicheTH} ปิดด้วยประโยคที่ทำให้รู้สึกว่า 'ฉันทำได้จริงๆ'"
}

สำคัญ: ห้าม generic ห้าม buzzword ทุก field ต้องอ้างอิงข้อมูลจริงของ ${data.name}`
}
