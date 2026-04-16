import type { AuditFormData, AIInsights, RevenueLeak, RevenueEstimation } from '@/types'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const NICHE_TOP_ACTION: Record<string, string> = {
  finance:       'สร้าง Paid Community LINE OA ราคา 499 บาท/เดือน — แค่ 50 คนก็ได้ 25,000 บาท/เดือน recurring โดยไม่ต้องทำ content เพิ่ม',
  business:      'Pitch 3 แบรนด์ใน niche เดียวกันด้วย Media Kit วันนี้ — sponsorship ต่อดีล 5,000–30,000 บาท ใช้เวลาส่งอีเมล 20 นาที',
  education:     'สร้าง PDF guide หรือ Notion template ราคา 299 บาท แล้วโปรโมทใน story 3 วัน — digital product ที่ขายซ้ำได้ไม่จำกัด',
  lifestyle:     'เปิด Affiliate Lazada/Shopee วันนี้แล้วแปะ link ใน bio — ทุก view ที่ได้อยู่แล้วจะเริ่มกลายเป็นเงิน',
  beauty:        'สร้าง affiliate stack: ตั้ง 5 link สินค้าที่ใช้จริงใน bio ทำทันที ไม่เสียเงิน — ค่าคอม 5–15% ต่อยอดขาย',
  fitness:       'ประกาศรับ Online Coaching 5 คนแรก ราคา 3,000 บาท/เดือน ใน story วันนี้ — 5 คน = 15,000 บาท/เดือน recurring',
  food:          'สร้าง Recipe Pack PDF 10 สูตร ราคา 199 บาท ขายผ่าน LINE — ต้นทุน 0 บาท กำไร 100%',
  travel:        'เปิด Travel Consulting 1 ชั่วโมง ราคา 990 บาท — แค่ 10 session ต่อเดือน = 9,900 บาท extra ไม่ต้องทำ content เพิ่ม',
  entertainment: 'เปิด Patreon หรือ Fanclub LINE ราคา 99–199 บาท/เดือน — 100 คนจาก fanbase ที่มีอยู่ = 10,000–20,000 บาท/เดือน',
  other:         'สมัคร Affiliate program ที่ตรง niche แล้วใส่ link ใน bio และ caption ทุกโพสต์วันนี้เลย — ไม่มีต้นทุน เริ่มได้ใน 30 นาที',
}

const NICHE_UPSIDE: Record<string, string> = {
  finance:       'นัก Finance Creator ที่วางระบบถูกต้องสร้าง 80,000–200,000 บาท/เดือน จาก Paid Community + Course — audience ใน niche นี้ยินดีจ่ายสูงถ้าเชื่อถือ',
  business:      'Business Creator ที่มีระบบ Funnel + Closing สร้างได้ 100,000–300,000 บาท/เดือน — B2B deals มูลค่าสูงกว่า B2C 10x',
  education:     'Education Creator ที่มี Course + Membership รายได้ 50,000–150,000 บาท/เดือน — Passive income ที่ scale ได้ไม่จำกัด',
  lifestyle:     'Lifestyle Creator ที่ optimize affiliate + brand deals รายได้ 40,000–120,000 บาท/เดือน จาก audience เดิม ไม่ต้องโตต่อ',
  beauty:        'Beauty Creator ที่มี affiliate + Masterclass รายได้ 50,000–180,000 บาท/เดือน — conversion rate ใน niche นี้สูงที่สุดใน platform',
  fitness:       'Fitness Creator ที่มี Online Coaching + Program รายได้ 60,000–200,000 บาท/เดือน — recurring revenue ที่ predictable ที่สุด',
  food:          'Food Creator ที่ขาย Digital Product + Workshop รายได้ 30,000–100,000 บาท/เดือน — margin สูง ต้นทุนต่ำมาก',
  travel:        'Travel Creator ที่มี Consulting + Guide รายได้ 40,000–120,000 บาท/เดือน — audience พร้อมจ่าย premium สำหรับ expert advice',
  entertainment: 'Entertainment Creator ที่มี Membership + Merch รายได้ 30,000–150,000 บาท/เดือน — fan loyalty แปลงเป็นเงินได้ตลอด',
  other:         'Creator ที่วางระบบ affiliate + product ถูกต้องรายได้เพิ่มขึ้น 3–5x ใน 90 วัน จาก audience เดิมที่มีอยู่แล้ว',
}

export function generateMockInsights(
  data: AuditFormData,
  leaks: RevenueLeak[],
  revenue: RevenueEstimation,
): AIInsights {
  const topLeak = leaks[0]
  const secondLeak = leaks[1]
  const totalLeak = leaks.reduce((s, l) => s + l.missedPerMonth, 0)

  const platformLabel: Record<string, string> = {
    tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube',
    facebook: 'Facebook', multi: 'หลายแพลตฟอร์ม',
  }

  const platform = platformLabel[data.platform] ?? data.platform

  // SHOCK — 1–2 sentences, name + number + leak name
  const shock = topLeak
    ? `${data.name} กำลังสูญเสีย ฿${fmt(totalLeak)}/เดือน (฿${fmt(totalLeak * 12)}/ปี) จาก ${leaks.length} จุดรั่ว — ที่หนักที่สุดคือ "${topLeak.title}" ซึ่งกินเงินออกไป ฿${fmt(topLeak.missedPerMonth)} ทุกเดือน ขณะที่ ${data.followers.toLocaleString('th-TH')} followers บน ${platform} ยังดูอยู่โดยไม่มีอะไรให้ซื้อ`
    : `${data.name} กำลังสูญเสียโอกาสทำเงิน ฿${fmt(totalLeak)}/เดือน — ทุกวันที่ผ่านไปโดยไม่วางระบบคือเงินที่ไม่มีวันได้คืน`

  // WHY IT HAPPENS — root cause, compounding effect
  const whyItHappens = topLeak
    ? `สาเหตุหลักคือ ${topLeak.explanation} นี่ไม่ใช่ปัญหาชั่วคราว — ทุกเดือนที่ไม่แก้ ${topLeak.title} คือการสูญเสีย ฿${fmt(topLeak.missedPerMonth)} ซ้อนทับกันไปเรื่อยๆ และยิ่ง ${data.followers.toLocaleString('th-TH')} followers เพิ่มขึ้น ความเสียหายก็ยิ่งใหญ่ขึ้นตาม${secondLeak ? ` นอกจากนี้ "${secondLeak.title}" ยังดึงเงินออกไปอีก ฿${fmt(secondLeak.missedPerMonth)}/เดือน ทำให้ gap รวมอยู่ที่ ฿${fmt(totalLeak)}/เดือน` : ''}`
    : `ระบบ monetization ขาดการ optimize ทำให้รายได้ที่แท้จริงต่ำกว่าที่ควรได้มาก`

  // WHAT FIRST — 1–2 specific actions for this niche
  const topActions = `อันดับ 1: ${NICHE_TOP_ACTION[data.niche] ?? NICHE_TOP_ACTION.other} อันดับ 2: ${!data.hasProduct ? `สร้าง Digital Product แรกใน niche ${data.niche} ราคา 299–990 บาท ภายใน 7 วัน — ขายได้ตลอดโดยไม่ต้องทำงานเพิ่ม` : !data.hasFunnel ? `ตั้ง Landing Page เพื่อดักเก็บ email/LINE ก่อน — คนดู ${data.avgViews.toLocaleString('th-TH')} views/โพสต์ที่ผ่านมาโดยไม่ได้อะไรกลับมาเลย` : `ตั้ง Auto DM closing system — ทุก comment ที่มีให้ convert เป็นลูกค้าอัตโนมัติ`}`

  // UPSIDE — specific numbers, achievable
  const upside = `ถ้า ${data.name} แก้ "${topLeak?.title ?? 'Revenue Leak หลัก'}" ได้ในเดือนนี้ — รายได้ที่ควรได้คือ ฿${fmt(revenue.realistic)}/เดือน ซึ่งสูงกว่าตอนนี้ ฿${fmt(revenue.totalMissed)}/เดือน ${NICHE_UPSIDE[data.niche] ?? NICHE_UPSIDE.other} ภายใน 90 วันที่เป้าหมาย ฿${fmt(revenue.aggressive)}/เดือน ทำได้จริงถ้าวางระบบตั้งแต่วันนี้`

  return { shock, whyItHappens, topActions, upside }
}
