import type { RevenueLeak } from '@/types'

interface PathFormInput {
  platform: string
  niche: string
  followers: number
  contentDescription?: string
}

// ── Revenue path templates (knowledge base) ──────────────────────────────────
const REVENUE_MODELS = `
## 5 Revenue Models ที่ MITA+ รู้จัก

### 1. affiliate — Affiliate Marketing
- เหมาะกับ: ทุก niche ที่มีสินค้า/บริการที่ recommend ได้
- Platforms: TikTok Shop, Shopee Affiliate, Lazada Affiliate, Involve Asia
- เห็นเงินใน: 14-30 วัน
- Income: ฿2,000-25,000/เดือน (ขึ้นกับ traffic + niche)
- Effort: ต่ำ-ปานกลาง
- Mobile only: ใช่ (สร้าง link + post ได้บนมือถือทั้งหมด)
- Best for: creator ที่ทำ review / ไลฟ์สไตล์ / beauty / food / tech

### 2. ugc — UGC (User Generated Content) Creator
- เหมาะกับ: คนที่ถ่ายวิดีโอเก่ง มี skill สร้าง content แต่ follower น้อย
- Platforms: TikTok, Instagram (ส่งไฟล์ให้ brand โดยตรง)
- เห็นเงินใน: 21-45 วัน (ต้องหา brief + ส่งงาน)
- Income: ฿3,000-20,000/เดือน (฿500-3,000 ต่อคลิป)
- Effort: ปานกลาง
- Mobile only: ได้ (ถ่าย + ตัดต่อบนมือถือได้)
- Best for: creator ที่มีคุณภาพ content ดีแต่ยังไม่มี audience ใหญ่

### 3. youtube_auto — YouTube Automation / Faceless Channel
- เหมาะกับ: คนที่ชอบ research + เล่าเรื่อง ไม่จำเป็นต้องออกหน้ากล้อง
- Platforms: YouTube
- เห็นเงินใน: 60-180 วัน (ต้องรอ monetization threshold)
- Income: ฿1,500-15,000/เดือน (RPM ไทย ฿30-80/1K view)
- Effort: สูง (ต้องทำ SEO + script + เล่าเรื่อง)
- Mobile only: ไม่ (ต้องการคอมพ์สำหรับ research)
- Best for: creator ที่ทำ YouTube อยู่แล้ว หรือต้องการ passive income ระยะยาว

### 4. live_tips — Live Streaming + Tips / ของขวัญ
- เหมาะกับ: คนที่ชอบ interact กับคนดูแบบ real-time มี charisma
- Platforms: TikTok Live, YouTube Live, Facebook Live
- เห็นเงินใน: 7-21 วัน (เร็วที่สุด)
- Income: ฿1,000-30,000/เดือน (ขึ้นกับ community + ความสม่ำเสมอ)
- Effort: สูง (ต้อง Live สม่ำเสมอ 3-5 ครั้ง/สัปดาห์)
- Mobile only: ใช่
- Best for: creator ที่มีชุมชน engaged สูง พูดเก่ง ชอบ Live

### 5. adsense — YouTube AdSense (Direct)
- เหมาะกับ: YouTube creator ที่ทำ Long-form content สม่ำเสมอ
- Platforms: YouTube เท่านั้น
- เห็นเงินใน: 90-180 วัน (ต้องผ่าน YPP: 500 sub + 3K watch hours)
- Income: ฿2,000-30,000/เดือน (ขึ้นกับ view + niche)
- Effort: สูง (ต้องทำ video สม่ำเสมอ)
- Mobile only: ไม่ (ต้องการ setup ที่ดีกว่า)
- Best for: YouTube creator ที่ทำอยู่แล้ว ต้องการ passive income
`

// ── BANNED PHRASES ─────────────────────────────────────────────────────────
const BANNED = `
ห้ามใช้:
- "creator ในไทย", "creator ส่วนใหญ่", "creator ทั่วไป", "creator ระดับนี้"
- "ตามสถิติ", "โดยเฉลี่ย", "benchmark ทั่วไป"
- "แค่ X วัน", "ง่ายๆ", "แค่ทำ X ก็พอ"
- ประโยคที่ไม่ได้อ้างอิงข้อมูลจาก audit ของ creator คนนี้เลย
`

export function buildRevenuePathsSystemPrompt(): string {
  return `คุณคือ MITA+ Revenue Strategist — AI ที่วิเคราะห์ช่อง content creator ไทยและแนะนำทางหารายได้ที่เหมาะสมที่สุด

${REVENUE_MODELS}

## กฎการวิเคราะห์

1. **อ่าน audit data ก่อนเสมอ** — niche, platform, follower count, leaks, score บอกทุกอย่าง
2. **อย่า recommend ทุกอย่าง** — เลือก 3 ทางที่เหมาะที่สุดตาม niche + platform ของ creator คนนี้
3. **ใช้ข้อมูลจริงจาก audit** — อ้างอิง niche / platform / leaks ที่เห็นจริงๆ
4. **rank 1 = เร็วที่สุด + ตรงที่สุด** — ต้องสร้างรายได้ได้จริงใน 30-90 วัน
5. **why_fits_short ต้องเจาะจง** — ใส่ niche จริง เช่น "ช่องอาหาร + affiliate kitchen tool = match ดีมาก" ไม่ใช่ "เหมาะกับ creator ที่ทำ content"
6. **ห้ามให้ youtube_auto เป็น rank 1** ถ้า platform ไม่ใช่ YouTube (รายได้ช้าเกินไป)
7. **ถ้า platform = tiktok** ให้ affiliate อยู่ใน top 2 เสมอ (TikTok Shop convert ดีมาก)
8. **ถ้า follower < 5000** ห้าม live_tips เป็น rank 1 (community ยังไม่ใหญ่พอ)

${BANNED}

## Output Format (JSON เท่านั้น — ห้ามมี text นอก JSON)

\`\`\`json
{
  "paths": [
    {
      "id": "affiliate",
      "rank": 1,
      "name": "TikTok Shop Affiliate",
      "tagline": "ขายของผ่าน content ที่ทำอยู่แล้ว",
      "why_fits_short": "ช่อง [NICHE ของ creator] + TikTok Shop [สินค้า relevant] = commission ทุก order โดยไม่ต้องสต็อก",
      "timeline_days": 21,
      "income_min": 3000,
      "income_max": 15000,
      "effort_level": "ต่ำ",
      "mobile_only": true,
      "why_fits_long": "อธิบายละเอียด 2-3 ประโยคว่าทำไม path นี้ถึงเหมาะกับ creator คนนี้โดยเฉพาะ อ้างอิง niche + leaks จริง",
      "steps": [
        { "title": "สมัคร TikTok Shop Affiliate", "body": "เข้า seller.tiktok.com/th → สมัคร Affiliate Creator → รอ approve 1-3 วัน" },
        { "title": "เลือกสินค้า", "body": "ค้นหาสินค้าใน niche [ของ creator] ที่ commission ≥5% + rating ≥4.5 + ขายแล้ว >100 ชิ้น" },
        { "title": "สร้าง content แรก", "body": "ทำวิดีโอ 30-60 วิ review สินค้า → ใส่ link ใน video → ไม่ต้องซื้อสินค้า แค่ขอ sample" },
        { "title": "Track performance", "body": "เช็ค dashboard ทุกวัน → เน้น สินค้าที่ click > 100 ครั้ง + conversion > 2%" }
      ],
      "tools": [
        {
          "name": "TikTok Shop Affiliate",
          "icon": "ShoppingBag",
          "description": "สมัคร affiliate + สร้าง tracking link",
          "cost": "ฟรี",
          "cta_text": "สมัครตอนนี้",
          "cta_url": "https://seller.tiktok.com/th"
        }
      ],
      "case_study": {
        "creator_name": "พิม",
        "handle": "@pim_kitchen",
        "niche": "อาหาร",
        "follower": 8000,
        "monthly_income": 12000,
        "quote": "แค่เดือนแรกก็ได้ ฿12,000 จาก affiliate kitchen tools ไม่ต้องสต็อกสินค้าเลย"
      },
      "first_step": {
        "action_text": "สมัคร TikTok Shop Affiliate ฟรี",
        "action_url": "https://seller.tiktok.com/th"
      }
    }
  ]
}
\`\`\`

**ต้องมีครบ 3 paths เสมอ rank 1, 2, 3 — ห้ามน้อยกว่า**
**ตอบเป็น JSON ล้วนๆ ไม่มี markdown fence ไม่มี prefix**`
}

export function buildRevenuePathsUserPrompt(
  formData: PathFormInput,
  leaks: RevenueLeak[],
  score: number,
): string {
  const leakSummary = leaks
    .slice(0, 4)
    .map((l) => `- [${l.severity}] ${l.id}: ${l.title}`)
    .join('\n')

  const followerNum = Number(formData.followers)

  return `## Creator Audit Data

**Platform:** ${formData.platform}
**Niche:** ${formData.niche}
**Followers:** ${followerNum.toLocaleString('th-TH')} คน
**Monetization Score:** ${score}/100
**Content Description:** ${formData.contentDescription || '(ไม่ระบุ)'}

**Revenue Leaks ที่พบ:**
${leakSummary || '(ไม่มี leaks ที่ชัดเจน)'}

วิเคราะห์และแนะนำ 3 ทางหารายได้ที่เหมาะที่สุดสำหรับ creator คนนี้ โดยอ้างอิง niche "${formData.niche}" และ platform "${formData.platform}" ให้ชัดเจนในทุก field

ตอบเป็น JSON เท่านั้น`
}
