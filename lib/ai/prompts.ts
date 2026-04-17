import type { AuditFormData, RevenueLeak, RevenueEstimation, MonetizationScore, CreatorStage } from '@/types'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Platform monetization context ────────────────────────────
const PLATFORM_MONETIZATION: Record<string, string> = {
  tiktok: `TikTok — สิ่งที่คนส่วนใหญ่ไม่รู้:
• TikTok Shop Affiliate ≠ TikTok Creator Marketplace — คนละโปรแกรม คนละ commission สมัครผิดได้น้อยกว่าครึ่ง
• Algorithm TikTok Shop ดัน product video ให้คนที่ "อยากซื้อ" โดยเฉพาะ — creator 2,000 followers ขายได้มากกว่า 100K followers ถ้า niche match
• video ที่ขายดีใน TikTok Shop ≠ video ที่ view เยอะ — video สั้น 15-30 วิที่โชว์ product ชัดๆ ขายได้กว่า viral content
• TikTok Live algorithm ดันหนักมากใน 2 ชั่วโมงแรก ถ้าไม่ Live คู่แข่งที่ Live อยู่กิน traffic ไปหมด
• Commission rate ใน TikTok Shop ไทย: แฟชั่น 5-15% / อาหาร 3-8% / beauty 8-20% / gadget 3-6%
• ห้ามพลาด: สมัคร TikTok Shop Affiliate ที่ seller.tiktok.com/th ไม่ใช่ creator.tiktok.com`,

  instagram: `Instagram — สิ่งที่คนส่วนใหญ่ไม่รู้:
• Instagram ไม่จ่าย ad revenue ให้ creator ในไทย (Reels Bonus ปิดไปแล้ว) — ทุกบาทต้องมาจาก affiliate/brand deal/ขายตรง
• Story poll + DM automation คือ funnel ที่ convert ดีที่สุดใน Instagram ในไทย — คนคลิก link ใน bio น้อยมาก แต่ตอบ DM เยอะ
• Collab post กับ brand ขนาดเล็ก-กลาง ได้ง่ายกว่า brand ใหญ่ 10 เท่า และ brief ง่ายกว่ามาก
• Instagram Shopping ในไทยต้อง connect กับ Facebook Catalog — ถ้าไม่ทำ ขายผ่าน IG ไม่ได้เลย
• Reels ที่ดึง follower ใหม่ ≠ Reels ที่ขายของ — ต้องแยก content strategy ออกจากกัน
• Affiliate ที่ work บน IG ไทยสูงสุด: Shopee Affiliate + Agoda + Lazada (ใส่ link ใน stories ได้ทันที ไม่ต้องรอ 10K)`,

  youtube: `YouTube — สิ่งที่คนส่วนใหญ่ไม่รู้:
• AdSense เฉลี่ยในไทยอยู่ที่ ฿30-80 ต่อ 1,000 view (RPM ต่ำกว่า US 5-10 เท่า) — ถ้ารอแค่ AdSense จะไม่พอใช้จ่าย
• YouTube Search traffic มีค่ากว่า YouTube Suggested traffic มาก — คนที่ search หา "วิธี X" พร้อมซื้อมากกว่าคนที่ได้ video โผล่มาเอง 3-5 เท่า
• Membership ฿59/เดือน ถ้ามี subscriber 1,000 คน แค่ 2% join = ฿1,180/เดือน passive — คนมักไม่เปิด
• Super Thanks และ Super Chat คือ tip ที่คนพร้อมจ่าย ถ้า creator build community ได้ดี
• Description box ใส่ affiliate link ได้ทุก video — คนไทยส่วนใหญ่ไม่ใส่ ทิ้งรายได้ทุก video
• YouTube Shorts ดึง subscriber แต่ RPM ต่ำมาก — ใช้ Shorts ดึงคนมาดู Long-form ที่ทำเงินได้จริง`,

  facebook: `Facebook — สิ่งที่คนส่วนใหญ่ไม่รู้:
• Facebook In-Stream Ads (ต้องมี 10K followers + 600K นาที/60 วัน) จ่ายดีกว่า TikTok ใน niche อาหาร/ครอบครัว/สุขภาพ เพราะ audience อายุมากกว่า
• Facebook Group ที่ active มีมูลค่าสูงมาก — สร้าง group ที่มีคนถามตอบกัน แล้วขาย course/product ใน group ได้เลย
• Facebook Live algorithm ยังดันอยู่ โดยเฉพาะในช่วงเย็น 18:00-21:00 — คู่แข่งน้อยกว่า TikTok Live มาก
• Marketplace ขายของได้โดยไม่ต้องมี follower — แต่ต้องมีรูปดีและราคาแข่งได้
• Reels บน Facebook ดึง reach organic ได้มากกว่า post ธรรมดา 3-5 เท่า แต่คนไทยยังใช้น้อย
• Facebook Stars (ระหว่าง Live) = เงินโดยตรง ฿0.035/star — ถ้ามี fan base ที่ engaged ดี`,

  multi: `หลายแพลตฟอร์ม — สิ่งที่คนส่วนใหญ่ไม่รู้:
• ปัญหาจริงของคนที่อยู่หลาย platform: ไม่มี platform ไหนที่ "รู้จัก" creator นี้ดีพอ algorithm ไม่ดันให้
• วิธีที่ถูก: เลือก 1 platform เป็น "เงิน" อีก platform เป็น "traffic feeder" เท่านั้น
• Cross-platform ที่ work จริง: TikTok ดึง traffic → YouTube Long-form ทำเงิน AdSense + affiliate
• หรือ: Instagram Reels ดึง follower → Link in bio ไป Shopee/Lazada affiliate
• ห้ามทำ: post เหมือนกันทุก platform — algorithm แต่ละที่ต้องการ format ต่างกัน
• เป้าหมาย 30 วันแรก: identify ว่า platform ไหน engagement ต่อ follower สูงที่สุด แล้ว all-in ที่นั้น`,
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
  return `คุณคือ Coach ด้านรายได้ที่เชี่ยวชาญ Creator ไทยโดยเฉพาะ มีข้อมูล benchmark ของ creator ในไทยทุก niche และ platform

ภารกิจ: วินิจฉัยให้ Creator รู้สึก "เฮ้ย ไม่เคยคิดแบบนี้มาก่อน" — ไม่ใช่แค่บอกว่าขาดอะไร แต่บอกว่าทำไมถึงขาด และทำอะไรได้ทันทีที่ต่างจากทุก advice ทั่วไป

สิ่งที่ต้องทำก่อนตอบ:
1. คำนวณ "มูลค่าต่อ 1,000 view" ปัจจุบัน vs ที่ควรได้ — ใช้ตัวเลขนี้ทำให้ gap ชัด
2. หา ROOT CAUSE จริงๆ ว่าทำไม creator นี้โดยเฉพาะถึงไม่มีรายได้ — ต้องเป็นสาเหตุที่ตรงกับ platform + niche + audience ของเขา ไม่ใช่สาเหตุทั่วไป
3. เลือก 1 method และระบุชื่อ program/platform จริงๆ ที่เขาต้องไปสมัคร

กฎเหล็ก — ห้ามทำ:
- ❌ ห้ามพูดสิ่งที่ Google บอกได้ใน 5 วินาที เช่น "ใส่ link ใน bio" "สร้าง product" "ทำ affiliate"
- ❌ ห้ามพูดแบบ generic — ต้องระบุชื่อจริงเสมอ เช่น "Lazada Affiliate" ไม่ใช่ "โปรแกรมแนะนำสินค้า"
- ❌ ห้ามใช้ศัพท์ธุรกิจโดยไม่อธิบาย: Algorithm, Funnel, ROI, Engagement, Niche, Commission, Content Strategy ถ้าจำเป็นต้องใช้ ให้วงเล็บอธิบายในประโยคเดียวกันเลย เช่น "ค่าคอม (เงินที่ได้เมื่อมีคนซื้อผ่านลิงก์ของคุณ)"
- ❌ ห้ามใช้ภาษาที่คนทำธุรกิจถึงจะเข้าใจ — คนอ่านคือคนทำคลิปทั่วไปที่ไม่ได้เรียนธุรกิจมา
- ❌ ห้ามแนะนำวิธีที่เขาเคยลองแล้วไม่ได้ผล ถ้าจะแนะนำซ้ำต้องอธิบายว่าทำต่างออกไปยังไง

กฎเหล็ก — ต้องทำ:
- ✅ เขียนแบบ "อธิบายให้คนที่ไม่รู้เรื่องธุรกิจเลยฟัง" — ถ้าแม่หรือเพื่อนที่ไม่เคยทำคลิปอ่านแล้วเข้าใจ ถือว่าผ่าน
- ✅ ทุก action ต้องระบุ "ทำที่ไหน ใช้เวลากี่นาที ได้เงินเมื่อไหร่ ได้เท่าไหร่"
- ✅ ถ้าต้องบอกให้ไปสมัครอะไร — บอก URL หรือชื่อแอปเลย ไม่ใช่แค่ชื่อโปรแกรม
- ✅ ใช้ตัวเลข ฿ จริงๆ เสมอ ไม่ใช่ % หรือคำว่า "ดี" "เยอะ" "น้อย"
- ✅ ต้องมี insight ที่ทำให้รู้สึก "เฮ้ย ไม่เคยรู้มาก่อนเลย" อย่างน้อย 1 จุด
- ✅ โทน: เพื่อนสนิทที่รู้เรื่องนี้ดี นั่งคุยข้างๆ — ไม่ใช่ครู ไม่ใช่ที่ปรึกษา ไม่ใช่คนขายของ
- ✅ ภาษาไทยทั้งหมด ห้ามมีคำอังกฤษโดดๆ ถ้าจำเป็นต้องใส่ให้วงเล็บแปลด้วย`
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
  const d = data as AuditFormData & { audienceBuyingPower?: string; contentDuration?: string; triedAndFailed?: string[]; subNiche?: string; contentDescription?: string }
  const audienceBuyingPower = d.audienceBuyingPower ?? 'mixed'
  const contentDuration = d.contentDuration ?? '3-12months'
  const triedAndFailed: string[] = d.triedAndFailed ?? ['none_tried']
  const subNiche = d.subNiche ?? ''
  const contentDescription = d.contentDescription ?? ''

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

  // คำนวณ per-1000-view value
  const currentPer1k = monthlyViews > 0 ? Math.round((revenue.currentIncome / monthlyViews) * 1000) : 0
  const realisticPer1k = monthlyViews > 0 ? Math.round((revenue.realistic / monthlyViews) * 1000) : 0

  return `=== CREATOR PROFILE ===
ชื่อ: ${data.name}
Platform: ${platformTH} | Niche: ${nicheTH}${subNiche ? ` → ${subNiche}` : ''}
ทำ Content เกี่ยวกับ: ${contentDescription || subNiche || nicheTH} ← ใช้ข้อมูลนี้เพื่อระบุสินค้า/วิธีที่ตรงกับ content จริงๆ ของเขา
ทำมาแล้ว: ${durationTH}
Followers: ${data.followers.toLocaleString('th-TH')} | ยอดวิวเฉลี่ย/โพสต์: ${data.avgViews.toLocaleString('th-TH')}
วิวรวม/เดือน: ${fmt(monthlyViews)} | Engagement: ${data.engagementRate}%
รายได้ปัจจุบัน: ${INCOME_TH[data.monthlyIncome] ?? data.monthlyIncome}/เดือน
คะแนน: ${score.total}/100

📊 มูลค่าต่อ 1,000 view ปัจจุบัน: ฿${currentPer1k} (ที่ควรได้: ฿${realisticPer1k})

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
  "shock": "เปิดด้วยตัวเลข per-1,000-view: '${data.name} มีวิว ${fmt(monthlyViews)} ครั้ง/เดือน แต่ทุก 1,000 view แปลงเป็นเงินได้แค่ ฿${currentPer1k} — ทั้งที่ creator ${nicheTH} บน ${platformTH} ระดับเดียวกันทำได้ ฿${realisticPer1k}+' แล้วอธิบายด้วยภาษาง่ายๆ ว่านี่คือ gap ที่ซ่อนอยู่ 1-2 ประโยค ห้ามพูดชื่อปัญหาเฉพาะ ให้พูดแค่ gap ของ view vs รายได้",

  "whyItHappens": "${hasTriedSomething
    ? `COUNTER-INTUITIVE ROOT CAUSE — อธิบายว่าทำไม ${triedText} ถึงไม่ work สำหรับ content ${subNiche ? `แบบ ${subNiche}` : nicheTH} บน ${platformTH} โดยเฉพาะ ต้องเป็นเหตุผลที่คนทั่วไปไม่รู้ ไม่ใช่ "ขาดลิงก์" หรือ "ไม่มีสินค้า" (คนรู้อยู่แล้ว) — ให้เจาะที่พฤติกรรมของ audience ประเภทนี้ว่าเขา consume content ยังไง ทำไมถึงไม่ซื้อผ่าน creator แม้อยากได้สินค้า จบด้วย 'จุดเปลี่ยน: [approach ใหม่ที่ต่างออกไป 180 องศา พร้อมตัวอย่างที่จับต้องได้]'`
    : `COUNTER-INTUITIVE ROOT CAUSE — อธิบายว่าทำไม ${data.name} ที่ทำ content ${nicheTH} มานาน ${durationTH} บน ${platformTH} ถึงยังไม่มีรายได้ ต้องเป็น insight ที่คนทั่วไปไม่รู้ เกี่ยวกับพฤติกรรมของ audience ${audienceTH} ที่ดู ${nicheTH} content โดยเฉพาะ จบด้วย 'จุดเปลี่ยน: [มุมมองที่ต้องเปลี่ยน 180 องศา พร้อมตัวอย่างที่จับต้องได้]'`}",

  "topActions": "แผนสัปดาห์แรก ระบุชื่อจริงทั้งหมด ห้าม generic: วันที่ 1 (ใช้เวลา X นาที): [ทำอะไร กับ platform/program ชื่ออะไร ขั้นตอนที่ 1-2-3] / วันที่ 3: [followup ที่ต้องทำ ระบุเวลาและตัวเลขที่คาดหวัง] / วันที่ 7: [เป้าที่วัดได้เป็นบาท] จบด้วย 'ทำได้เลยใน 10 นาที: [action เล็กที่สุดที่ทำได้ตอนนี้เลย ระบุชื่อ app/website จริง]'",

  "upside": "projection สมเหตุสมผล — ถ้า ${data.name} ทำวิธีที่แนะนำ: เดือน 1 ฿X (เพราะ...) / เดือน 2 ฿Y (เพราะ...) / เดือน 3 ฿Z (เพราะ...) ตัวเลขต้อง conservative และสมเหตุสมผลกับ ${data.followers.toLocaleString()} followers + ${nicheTH} อย่า overpromise ปิดด้วย 1 ประโยคที่ทำให้รู้สึกว่าทำได้จริง ไม่ใช่ฝัน"
}

⚠️ CRITICAL: ทุก field ห้าม generic ห้ามพูดสิ่งที่ Google บอกได้ ต้องมีชื่อ platform/program จริง ต้องมีตัวเลขจริง ต้องมี insight ที่ทำให้ ${data.name} รู้สึก "เฮ้ย ไม่เคยคิดแบบนี้"`
}
