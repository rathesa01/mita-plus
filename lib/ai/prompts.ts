import type { AuditFormData, RevenueLeak, RevenueEstimation, MonetizationScore, CreatorStage } from '@/types'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const PLATFORM_TH: Record<string, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', multi: 'หลายแพลตฟอร์ม',
}
const NICHE_TH: Record<string, string> = {
  lifestyle: 'ไลฟ์สไตล์', education: 'การศึกษา', finance: 'การเงิน', entertainment: 'ความบันเทิง',
  beauty: 'ความงาม', fitness: 'ออกกำลังกาย', business: 'ธุรกิจ', food: 'อาหาร', travel: 'ท่องเที่ยว', other: 'อื่นๆ',
}
const INCOME_TH: Record<string, string> = {
  zero: '0 บาท', under_5k: 'น้อยกว่า 5,000 บาท', '5k_20k': '5,000–20,000 บาท',
  '20k_50k': '20,000–50,000 บาท', '50k_100k': '50,000–100,000 บาท', over_100k: 'มากกว่า 100,000 บาท',
}

export function buildSystemPrompt(): string {
  return `คุณคือนักวางระบบทำเงินสำหรับ Creator ที่เก่งที่สุด

งานของคุณคือบอก Creator ว่า:
1. ตอนนี้เสียเงินไปเท่าไหร่ และทำไม
2. ต้องทำอะไรก่อน เพื่อให้เริ่มเห็นเงินภายใน 7 วัน

กฎเหล็ก:
- ใช้ภาษาที่คนอ่านแล้วเข้าใจทันที ไม่ต้องคิดซ้ำ
- ห้ามใช้คำว่า Revenue, Funnel, Conversion, ROI, Monetize, CTR, AOV ในการอธิบาย — ถ้าจำเป็นต้องใช้ให้อธิบายความหมายด้วย
- ทุกประโยคต้องบอก "ทำอะไร" หรือ "เสียเท่าไหร่" — ห้ามพูดลอยๆ
- 1 ประโยค = 1 ความหมาย
- ระบุตัวเลขเป็นบาทเสมอ ห้ามพูดเป็น % หรือคำกว้างๆ
- ดึงข้อมูลจริงของ Creator มาใส่ทุก field — ห้าม generic
- ทุก insight ต้องจบด้วย "สิ่งที่ต้องทำต่อ" ที่ทำได้วันนี้เลย

สำคัญมาก — ห้ามตอบเหมือนกันทุกครั้ง:
- เน้นคนละจุด แม้ข้อมูลจะคล้ายกัน
- เลือกมุมที่ต่างกัน เช่น บางครั้งเน้น platform, บางครั้งเน้น niche, บางครั้งเน้น behavior ของ audience
- ใช้ประโยคเปิดที่ต่างกันทุกครั้ง — ห้ามขึ้นต้นเหมือนเดิม

ภาษา: ไทย เข้าใจได้ระดับมัธยมปลาย
โทน: เพื่อนที่รู้เรื่องธุรกิจ — พูดตรง อบอุ่น ไม่ตัดสิน`
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
  const worstLeak = leaks[0]

  return `=== CREATOR DATA ===
Name: ${data.name}
Platform: ${PLATFORM_TH[data.platform] ?? data.platform} | Niche: ${NICHE_TH[data.niche] ?? data.niche}
Followers: ${data.followers.toLocaleString('th-TH')} | Avg Views/Post: ${data.avgViews.toLocaleString('th-TH')}
Monthly Views: ${fmt(monthlyViews)} | Engagement: ${data.engagementRate}%
Current Income: ${INCOME_TH[data.monthlyIncome] ?? data.monthlyIncome}/month
Monetization Score: ${score.total}/100

Systems:
- Own Product: ${data.hasProduct ? 'YES' : 'NO ← MISSING'}
- Sales Funnel: ${data.hasFunnel ? 'YES' : 'NO ← MISSING'}
- Affiliate: ${data.hasAffiliate ? 'YES' : 'NO ← MISSING'}
- Closing System: ${data.hasClosingSystem ? 'YES' : 'NO ← MISSING'}

=== REVENUE LEAKS FOUND ===
${topLeaks.map((l, i) => `${i + 1}. [${l.severity.toUpperCase()}] ${l.title}: -฿${fmt(l.missedPerMonth)}/month`).join('\n')}
TOTAL MONTHLY LOSS: -฿${fmt(totalLeak)}/month = -฿${fmt(totalLeak * 12)}/year

Biggest Leak: ${worstLeak ? `${worstLeak.title} (-฿${fmt(worstLeak.missedPerMonth)}/month)` : 'N/A'}

=== REVENUE POTENTIAL ===
Current: ฿${fmt(revenue.currentIncome)}/month
Realistic potential: ฿${fmt(revenue.realistic)}/month
Gap: ฿${fmt(revenue.totalMissed)}/month uncaptured

Creator's goal: ${data.goalIn90Days || 'not specified'}
Creator's problem: ${data.biggestProblem || 'not specified'}

---

ตอบเป็น JSON เท่านั้น ห้ามมีข้อความนอก JSON ต้องมีครบ 4 field นี้:

{
  "shock": "1–2 ประโยค บอกชื่อ ${data.name} และตัวเลขเงินที่ยังไม่ได้รับต่อเดือน บอกว่าสาเหตุหลักคืออะไร ใช้ภาษาชาวบ้าน ห้ามใช้คำทางธุรกิจ",
  "whyItHappens": "อธิบายว่าทำไม ${data.name} ถึงพลาดเงินก้อนนี้ — เน้นพฤติกรรมและสถานการณ์จริง ไม่ใช่ทฤษฎี ใช้ตัวอย่างที่เห็นภาพได้ จบด้วย 'สิ่งที่ต้องทำต่อ: [วิธีแก้ที่ทำได้วันนี้]'",
  "topActions": "1–2 วิธีที่จะทำให้ ${data.name} เริ่มเห็นเงินเพิ่มภายใน 7 วัน บอกเป็นขั้นตอนที่ทำได้เลย ระบุตัวเลขที่คาดว่าจะได้รับ จบด้วย 'ทำวันนี้ได้เลย: [step แรก]'",
  "upside": "บอกว่าถ้า ${data.name} แก้จุดนี้ได้ จะได้เงินเพิ่มเดือนละเท่าไหร่ และภายใน 90 วันจะเป็นยังไง ทำให้รู้สึกว่าทำได้จริง ไม่ใช่แค่ฝัน"
}

สำคัญ: ทุก field ต้องดึงข้อมูลจริงของ ${data.name} มาอ้างอิง ห้ามตอบแบบ template ที่ใครๆ ก็ได้รับเหมือนกัน`
}
