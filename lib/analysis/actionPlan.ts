import type { AuditFormData, ActionPlan, ActionItem, RevenueLeak, MonetizationRecommendation } from '@/types'

function fmt(n: number) {
  return n.toLocaleString('th-TH')
}

export function buildActionPlan(
  data: AuditFormData,
  leaks: RevenueLeak[],
  recs: MonetizationRecommendation[],
): ActionPlan {
  const topLeak = leaks[0]
  const topRec = recs[0]
  const secondRec = recs[1]
  const thirdRec = recs[2]

  const day30: ActionItem[] = []
  const day60: ActionItem[] = []
  const day90: ActionItem[] = []

  // ── DAY 1–30: FIX THE BIGGEST LEAK ───────────────────────────
  if (topLeak) {
    day30.push({
      action: `แก้ Leak หลัก: ${topLeak.title}`,
      example:
        topLeak.id === 'no_product'
          ? `สร้าง Digital Product ง่ายๆ เช่น PDF guide เกี่ยวกับ ${data.niche} ราคา 299 บาท ขายผ่าน LINE OA ภายใน 7 วัน`
          : topLeak.id === 'no_funnel'
          ? `ตั้ง Landing Page ใน Carrd.co หรือ Notion ให้คนลงทะเบียน email ก่อนรับ freebie แล้วโปรโมทใน bio`
          : topLeak.id === 'no_closing'
          ? `เพิ่ม CTA ชัดเจนทุกโพสต์ เช่น "DM มาพูดคุยได้เลย" พร้อม auto-reply บน LINE OA`
          : `เพิ่ม Affiliate link ใน bio และ caption ทุกโพสต์ที่เกี่ยวกับ ${data.niche}`,
      expectedOutcome: `ลด Revenue Leak ${topLeak.severity === 'critical' ? 'หลัก' : 'สำคัญ'} — เพิ่มโอกาสทำเงินทันที`,
      revenueImpact: topLeak.missedPerMonth,
    })
  }

  // ── DAY 1–30: START TOP REC ───────────────────────────────────
  if (topRec) {
    day30.push({
      action: topRec.title,
      example: topRec.exampleAction,
      expectedOutcome: `เริ่มสร้างรายได้จาก ${topRec.type} ภายใน ${topRec.timeToRevenue}`,
      revenueImpact: topRec.estimatedRevenueLow,
    })
  }

  day30.push({
    action: 'สร้าง Content Calendar 30 วัน',
    example: `โพสต์อย่างน้อย 3x/สัปดาห์ใน ${data.platform === 'multi' ? 'ทุกแพลตฟอร์ม' : data.platform} — วันจันทร์ value, พุธ behind-scene, ศุกร์ CTA/promotion`,
    expectedOutcome: 'Algorithm เริ่ม push content มากขึ้น — reach เพิ่ม 20–40%',
    revenueImpact: Math.round(data.avgViews * 0.001 * 500),
  })

  // ── DAY 31–60: BUILD SYSTEM ────────────────────────────────────
  if (secondRec) {
    day60.push({
      action: secondRec.title,
      example: secondRec.exampleAction,
      expectedOutcome: `เพิ่ม revenue stream ที่ 2 — ฿${fmt(secondRec.estimatedRevenueLow)}–${fmt(secondRec.estimatedRevenueHigh)}/เดือน`,
      revenueImpact: secondRec.estimatedRevenueLow,
    })
  }

  day60.push({
    action: 'ตั้ง Email/LINE List และ Welcome Sequence',
    example: `ให้คน DM คำว่า "[ชื่อ Freebie]" แล้วส่ง freebie ผ่าน LINE OA พร้อม sequence 5 วันที่โปรโมท product หรือ service`,
    expectedOutcome: 'มี list ที่ own เอง — ไม่พึ่ง algorithm อย่างเดียว',
    revenueImpact: Math.round(data.avgViews * 0.0005 * 990),
  })

  day60.push({
    action: 'Optimize Pricing — ทดสอบราคาใหม่',
    example: `ถ้าขายอยู่ที่ 299 บาท ลอง 490 บาท พร้อม bonus เพิ่ม ถ้า conversion ไม่ลด แสดงว่าคุณ underpricing อยู่`,
    expectedOutcome: 'Revenue ต่อ transaction เพิ่ม 30–60% โดยไม่ต้องเพิ่ม traffic',
    revenueImpact: Math.round(data.avgViews * 0.001 * 200),
  })

  // ── DAY 61–90: SCALE ───────────────────────────────────────────
  if (thirdRec) {
    day90.push({
      action: thirdRec.title,
      example: thirdRec.exampleAction,
      expectedOutcome: `Revenue stream ที่ 3 — ฿${fmt(thirdRec.estimatedRevenueLow)}–${fmt(thirdRec.estimatedRevenueHigh)}/เดือน`,
      revenueImpact: thirdRec.estimatedRevenueLow,
    })
  }

  day90.push({
    action: 'Analyze และ Double Down บน Content ที่ได้เงินสูงสุด',
    example: `ดูว่าโพสต์ไหน convert เป็นเงินได้ดีที่สุดในช่วง 60 วันที่ผ่านมา แล้วทำซ้ำ pattern นั้น 3–4 ครั้ง/สัปดาห์`,
    expectedOutcome: 'Revenue เพิ่ม 40–80% โดยไม่ต้องหา traffic ใหม่',
    revenueImpact: Math.round(data.avgViews * 0.003 * 990),
  })

  day90.push({
    action: 'วาง System ให้รันได้โดยไม่ต้อง active ตลอด',
    example: `ตั้ง automated funnel: content → landing page → email sequence → upsell — ให้ระบบทำงานแทนตอนที่คุณนอนหลับ`,
    expectedOutcome: 'Passive income เริ่มเกิด — รายได้ไม่ขึ้นอยู่กับจำนวนชั่วโมงทำงาน',
    revenueImpact: Math.round(data.avgViews * 0.002 * 1990),
  })

  return { day30, day60, day90 }
}
