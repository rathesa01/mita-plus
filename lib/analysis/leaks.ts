import type { AuditFormData, RevenueLeak, RevenueEstimation } from '@/types'

function fmt(n: number) {
  return n.toLocaleString('th-TH')
}

export function detectLeaks(data: AuditFormData, revenue: RevenueEstimation): RevenueLeak[] {
  const leaks: RevenueLeak[] = []
  const { avgViews, postingFrequency } = data

  const postsPerMonth: Record<string, number> = {
    daily: 30,
    '3-5x_week': 16,
    '1-2x_week': 6,
    monthly: 1,
  }
  const monthlyViews = avgViews * (postsPerMonth[postingFrequency] ?? 4)

  // ── 1. NO PRODUCT ──────────────────────────────────────────────────
  if (!data.hasProduct) {
    const missed = Math.round(monthlyViews * 0.005 * 0.02 * 990)
    leaks.push({
      id: 'no_product',
      severity: data.followers > 50_000 ? 'critical' : 'high',
      title: 'ไม่มีสินค้าเป็นของตัวเอง',
      painLine: 'คุณสร้างคอนเทนต์ฟรีให้คนอื่นขายของ',
      explanation:
        'ทุก view ที่ได้มาคือโอกาสขายสินค้าที่หายไปตลอดกาล คนที่ดูคอนเทนต์คุณพร้อมซื้อ แต่ไม่มีอะไรให้ซื้อ',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: `ทุกเดือนที่ไม่มีสินค้า คุณสูญเสียโอกาสทำเงิน ฿${fmt(missed)} — นั่นคือ ฿${fmt(missed * 12)} ต่อปีที่ไม่มีวันได้คืน`,
      impact: `฿${fmt(missed)}/เดือน หายไปเพราะไม่มีอะไรให้คนซื้อ`,
    })
  }

  // ── 2. NO FUNNEL ──────────────────────────────────────────────────
  if (!data.hasFunnel) {
    const missed = data.hasProduct
      ? Math.round(revenue.realistic * 0.4)
      : Math.round(monthlyViews * 0.001 * 499)
    leaks.push({
      id: 'no_funnel',
      severity: data.hasProduct ? 'critical' : 'high',
      title: 'ไม่มี Funnel ดักลูกค้า',
      painLine: 'คนดูแล้วออกไป คุณจับพวกเขาไม่ได้เลย',
      explanation:
        'Funnel คือระบบที่เปลี่ยนคนดูเป็นลูกค้า ถ้าไม่มี คนดู 10,000 คนก็ไม่มีความหมาย เพราะพวกเขาดูแล้วก็หายไปตลอดกาล',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: `ไม่มี Funnel = ทุกคนที่เข้ามาดูแล้วออกไปคือเงินที่หาย ฿${fmt(missed)}/เดือน`,
      impact: `฿${fmt(missed)}/เดือน ที่ดักไม่ได้เพราะไม่มีระบบ`,
    })
  }

  // ── 3. NO CLOSING SYSTEM ─────────────────────────────────────────
  if (!data.hasClosingSystem) {
    const missed = Math.round(monthlyViews * 0.0008 * 1990)
    leaks.push({
      id: 'no_closing',
      severity: 'high',
      title: 'ไม่มีระบบปิดการขาย',
      painLine: 'ลูกค้าสนใจแล้วหาย เพราะไม่มีคนปิด',
      explanation:
        'คนดูคอนเทนต์คุณ สนใจแล้ว แต่ไม่รู้จะซื้อยังไง ไม่มีช่องทาง ไม่มีคนตอบ ก็เลยไปซื้อที่อื่นแทน',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: `ไม่มีระบบปิดการขาย = ฿${fmt(missed)}/เดือน ที่ไหลออกไปหาคู่แข่ง`,
      impact: `฿${fmt(missed)}/เดือน หายไปเพราะปิดการขายไม่ได้`,
    })
  }

  // ── 4. NO AFFILIATE ───────────────────────────────────────────────
  if (!data.hasAffiliate) {
    const missed = Math.round(monthlyViews * 0.001 * 500)
    leaks.push({
      id: 'no_affiliate',
      severity: 'medium',
      title: 'ไม่มี Affiliate / พาร์ทเนอร์',
      painLine: 'คุณแนะนำของฟรี ทั้งๆ ที่รับค่าคอมได้',
      explanation:
        'ทุกครั้งที่คุณพูดถึงสินค้าหรือบริการโดยไม่มี affiliate link คุณทิ้งค่าคอมไว้บนโต๊ะโดยเปล่าประโยชน์',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: `คุณแนะนำของให้คนอื่นฟรีมาตลอด ทั้งที่ควรได้ ฿${fmt(missed)}/เดือน จากค่าคอม`,
      impact: `฿${fmt(missed)}/เดือน ค่าคอมที่ไม่ได้รับ`,
    })
  }

  // ── 5. WEAK CTA / LOW FREQUENCY ───────────────────────────────────
  if (data.postingFrequency === 'monthly' || data.engagementRate < 2) {
    const missed = Math.round(monthlyViews * 0.002 * 990)
    leaks.push({
      id: data.postingFrequency === 'monthly' ? 'low_frequency' : 'weak_cta',
      severity: 'medium',
      title: data.postingFrequency === 'monthly' ? 'โพสต์น้อยเกินไป' : 'Engagement ต่ำเกินไป',
      painLine: 'Algorithm กำลังลงโทษคุณอยู่ทุกวัน',
      explanation:
        data.postingFrequency === 'monthly'
          ? 'คอนเทนต์น้อย = Algorithm ไม่ดัน = คนเห็นน้อย = รายได้น้อย วงจรนี้ทำลายการเติบโตทุกวัน'
          : 'Engagement ต่ำบอกว่า Algorithm จะไม่ดันคอนเทนต์คุณ ต่อให้โพสต์บ่อยแค่ไหน',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: `Algorithm ดันคุณน้อยลงทุกวัน = ฿${fmt(missed)}/เดือน ที่หายไปเงียบๆ`,
      impact: `฿${fmt(missed)}/เดือน เพราะ reach ต่ำกว่าที่ควรเป็น`,
    })
  }

  // ── 6. NO BACKEND / TRACKING ──────────────────────────────────────
  if (!data.hasFunnel && data.monthlyIncome !== 'zero') {
    const missed = Math.round(
      (['5k_20k', '20k_50k', '50k_100k', 'over_100k'].includes(data.monthlyIncome)
        ? 15000
        : 5000),
    )
    leaks.push({
      id: 'no_tracking',
      severity: 'low',
      title: 'ไม่รู้ว่าเงินมาจากไหน',
      painLine: 'ทำได้ดีก็ไม่รู้จะ Scale ยังไง',
      explanation:
        'ถ้าคุณไม่รู้ว่าโพสต์ไหนสร้างรายได้ คุณก็ Scale ไม่ได้ นั่นคือเหตุผลที่รายได้คุณยังคงอยู่ที่เดิม',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: `ไม่มี tracking = Scale ไม่ได้ = รายได้ติดเพดาน ฿${fmt(missed)}/เดือน`,
      impact: `฿${fmt(missed)}/เดือน potential ที่ไม่สามารถ scale ได้`,
    })
  }

  // Sort by severity
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  return leaks.sort((a, b) => order[a.severity] - order[b.severity])
}
