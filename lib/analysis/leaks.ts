import type { AuditFormData, RevenueLeak, RevenueEstimation } from '@/types'

// ── Severity matrix — context-aware ──────────────────────────────────────────
function determineSeverity(
  blockerType: string,
  ctx: {
    hasAffiliate: boolean
    hasProduct: boolean
    hasFunnel: boolean
    hasClosingSystem: boolean
    monthlyIncome: number
    followers: number
    triedAndFailed: string[]
    currentIncomeSources: string[]
  }
): 'critical' | 'high' | 'medium' | 'low' {
  const hasAnyMonetization =
    ctx.hasAffiliate ||
    ctx.hasProduct ||
    ctx.monthlyIncome > 0 ||
    (ctx.currentIncomeSources?.length ?? 0) > 0

  switch (blockerType) {
    case 'no_product':
      if (ctx.hasAffiliate) return 'low'       // affiliate covers monetization need
      if (ctx.followers > 50_000) return 'critical'
      return 'high'

    case 'no_affiliate':
      if (ctx.hasProduct) return 'low'          // own product covers monetization
      if (ctx.followers > 10_000) return 'high'
      return 'medium'

    case 'no_funnel':
      if (ctx.hasAffiliate && !ctx.hasProduct) return 'low'  // affiliate is its own funnel
      if (ctx.hasProduct && ctx.followers > 30_000) return 'critical'
      if (ctx.hasProduct) return 'high'
      return 'medium'

    case 'no_closing':
      if (!ctx.hasProduct && !ctx.hasAffiliate) return 'low'
      if (ctx.monthlyIncome === 0 && (ctx.hasProduct || ctx.hasAffiliate)) return 'high'
      return 'medium'

    case 'low_frequency':
      return 'medium'

    case 'weak_cta':
      if (hasAnyMonetization && ctx.monthlyIncome === 0) return 'high'
      return 'medium'

    case 'no_tracking':
      return 'low'

    default:
      return 'medium'
  }
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

  // ── Shared context object ─────────────────────────────────────────────────
  const ctx = {
    hasAffiliate:      data.hasAffiliate,
    hasProduct:        data.hasProduct,
    hasFunnel:         data.hasFunnel,
    hasClosingSystem:  data.hasClosingSystem,
    monthlyIncome:     data.monthlyIncome,
    followers:         data.followers,
    triedAndFailed:    data.triedAndFailed ?? [],
    currentIncomeSources: data.currentIncomeSources ?? [],
  }

  // ── 1. NO PRODUCT ──────────────────────────────────────────────────
  if (!data.hasProduct) {
    const baseAmount = Math.round(monthlyViews * 0.005 * 0.02 * 990)
    // Cap missed amount when user already has monetization via affiliate
    const missed = data.hasAffiliate ? Math.round(baseAmount / 5) : baseAmount

    // Context-aware title
    const triedProduct = (data.triedAndFailed ?? []).includes('own_product')
    const title = triedProduct
      ? 'เคยลองสินค้าตัวเองแต่ไม่ work — ปัญหาที่ลึกกว่า'
      : data.hasAffiliate
        ? 'ยังไม่มีสินค้าตัวเอง — โอกาสเพิ่มกำไรต่อวิว'
        : 'ไม่มีสินค้าเป็นของตัวเอง'

    const painLine = data.hasAffiliate
      ? 'Affiliate ทำงานอยู่ แต่กำไรต่อวิวน้อยกว่าสินค้าตัวเอง 5-10 เท่า'
      : 'คุณสร้างคอนเทนต์ฟรีให้คนอื่นขายของ'

    const explanation = data.hasAffiliate
      ? 'Affiliate เป็น passive income ที่ดี แต่ margin ต่อ conversion น้อยกว่าสินค้าตัวเองมาก ถ้ามีสินค้าตัวเองแม้แค่ 1 อย่าง รายได้ต่อวิวจะกระโดดขึ้น 5-10 เท่า'
      : 'ทุก view ที่ได้มาคือโอกาสขายสินค้าที่หายไปตลอดกาล คนที่ดูคอนเทนต์คุณพร้อมซื้อ แต่ไม่มีอะไรให้ซื้อ'

    leaks.push({
      id: 'no_product',
      severity: determineSeverity('no_product', ctx),
      title,
      painLine,
      explanation,
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: '',  // AI writes shock — see generateInsights
      impact: data.hasAffiliate
        ? 'โอกาสเพิ่ม margin ต่อวิว 5-10 เท่า'
        : 'หายไปเพราะไม่มีสินค้าให้คนซื้อ',
    })
  }

  // ── 2. NO FUNNEL ──────────────────────────────────────────────────
  if (!data.hasFunnel) {
    const baseMissed = data.hasProduct
      ? Math.round(revenue.realistic * 0.4)
      : Math.round(monthlyViews * 0.001 * 499)
    // Reduce impact when affiliate is self-contained funnel
    const missed = (data.hasAffiliate && !data.hasProduct)
      ? Math.round(baseMissed / 4)
      : baseMissed

    const title = (data.hasAffiliate && !data.hasProduct)
      ? 'ไม่มีระบบดัก Lead — Affiliate ยังขาด follow-up'
      : 'ไม่มี Funnel ดักลูกค้า'

    const painLine = (data.hasAffiliate && !data.hasProduct)
      ? 'มีคนคลิก link แต่ไม่มีระบบติดตามว่าใครซื้อจริง ใครแค่ดู'
      : 'คนดูแล้วออกไป คุณจับพวกเขาไม่ได้เลย'

    leaks.push({
      id: 'no_funnel',
      severity: determineSeverity('no_funnel', ctx),
      title,
      painLine,
      explanation:
        'Funnel คือระบบที่เปลี่ยนคนดูเป็นลูกค้า ถ้าไม่มี คนดู 10,000 คนก็ไม่มีความหมาย เพราะพวกเขาดูแล้วก็หายไปตลอดกาล',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: '',
      impact: 'หายไปเพราะไม่มีระบบดักลูกค้า',
    })
  }

  // ── 3. NO CLOSING SYSTEM ─────────────────────────────────────────
  if (!data.hasClosingSystem) {
    const baseMissed = Math.round(monthlyViews * 0.0008 * 1990)
    const missed = (!data.hasProduct && !data.hasAffiliate)
      ? Math.round(baseMissed / 3)  // lower impact when nothing to close
      : baseMissed

    const title = (data.hasAffiliate && !data.hasProduct)
      ? 'ไม่มีระบบติดตาม Conversion — Affiliate อาจ Leak'
      : 'ไม่มีระบบปิดการขาย'

    leaks.push({
      id: 'no_closing',
      severity: determineSeverity('no_closing', ctx),
      title,
      painLine: 'ลูกค้าสนใจแล้วหาย เพราะไม่มีคนปิด',
      explanation:
        'คนดูคอนเทนต์คุณ สนใจแล้ว แต่ไม่รู้จะซื้อยังไง ไม่มีช่องทาง ไม่มีคนตอบ ก็เลยไปซื้อที่อื่นแทน',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: '',
      impact: 'หายไปเพราะไม่มีระบบปิดการขาย',
    })
  }

  // ── 4. NO AFFILIATE ───────────────────────────────────────────────
  if (!data.hasAffiliate) {
    const missed = Math.round(monthlyViews * 0.001 * 500)
    leaks.push({
      id: 'no_affiliate',
      severity: determineSeverity('no_affiliate', ctx),
      title: 'ไม่มี Affiliate / พาร์ทเนอร์',
      painLine: 'คุณแนะนำของฟรี ทั้งๆ ที่รับค่าคอมได้',
      explanation:
        'ทุกครั้งที่คุณพูดถึงสินค้าหรือบริการโดยไม่มี affiliate link คุณทิ้งค่าคอมไว้บนโต๊ะโดยเปล่าประโยชน์',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: '',
      impact: 'ค่าคอมที่ทิ้งไปทุกโพสต์',
    })
  }

  // ── 5. WEAK CTA / LOW FREQUENCY ───────────────────────────────────
  const isVeryLowFreq = data.postingFrequency === 'monthly'
  const isLowFreqForReach = data.postingFrequency === '1-2x_week' &&
    (data.followers > 10_000 || data.avgViews > 3_000)
  const isLowEngagement = data.engagementRate < 2

  if (isVeryLowFreq || isLowFreqForReach || isLowEngagement) {
    const missed = Math.round(monthlyViews * 0.002 * 990)
    const isFreqIssue = isVeryLowFreq || isLowFreqForReach
    leaks.push({
      id: isFreqIssue ? 'low_frequency' : 'weak_cta',
      severity: isFreqIssue
        ? (isVeryLowFreq ? 'high' : determineSeverity('low_frequency', ctx))
        : determineSeverity('weak_cta', ctx),
      title: isFreqIssue ? 'โพสต์น้อยเกินไปสำหรับ Reach ที่มีอยู่' : 'Engagement ต่ำเกินไป',
      painLine: isFreqIssue
        ? 'คุณมี audience แต่ไม่ได้ใช้ให้คุ้ม — คู่แข่งกำลังกิน traffic ของคุณไปทุกวันที่ไม่ได้โพสต์'
        : 'Algorithm กำลังลงโทษคุณอยู่ทุกวัน',
      explanation: isFreqIssue
        ? `โพสต์ ${data.postingFrequency === 'monthly' ? 'แค่เดือนละครั้ง' : 'แค่สัปดาห์ละ 1-2 ครั้ง'} ทั้งที่มี audience ระดับนี้ — ถ้าโพสต์ 3-5 ครั้ง/สัปดาห์ views รวมต่อเดือนจะเพิ่มขึ้น 2.5-3 เท่าทันที ซึ่งตรงมาเป็นรายได้เลย`
        : 'Engagement ต่ำบอกว่า Algorithm จะไม่ดันคอนเทนต์คุณ ต่อให้โพสต์บ่อยแค่ไหน',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: '',
      impact: isFreqIssue ? 'Views หายไปจากการโพสต์น้อยเกินไป' : 'Reach ต่ำกว่าที่ควรเป็น',
    })
  }

  // ── 6. NO BACKEND / TRACKING ──────────────────────────────────────
  if (!data.hasFunnel && data.monthlyIncome > 0) {
    const missed = Math.round(data.monthlyIncome >= 5000 ? 15000 : 5000)
    leaks.push({
      id: 'no_tracking',
      severity: determineSeverity('no_tracking', ctx),
      title: 'ไม่รู้ว่าเงินมาจากไหน',
      painLine: 'ทำได้ดีก็ไม่รู้จะ Scale ยังไง',
      explanation:
        'ถ้าคุณไม่รู้ว่าโพสต์ไหนสร้างรายได้ คุณก็ Scale ไม่ได้ นั่นคือเหตุผลที่รายได้คุณยังคงอยู่ที่เดิม',
      missedPerMonth: missed,
      missedPerYear: missed * 12,
      shockSentence: '',
      impact: 'Scale ไม่ได้เพราะไม่มีข้อมูล',
    })
  }

  // ── Sort by severity ──────────────────────────────────────────────
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = leaks.sort((a, b) => order[a.severity] - order[b.severity])

  // ── Suppress conflicting leaks for affiliate-only creators ────────
  // If user has affiliate but no product: no_funnel + no_closing are already
  // low severity (affiliate is its own funnel) — suppress them as separate cards
  // to avoid overwhelming with low-value blockers
  if (data.hasAffiliate && !data.hasProduct) {
    return sorted.filter(l => !['no_funnel', 'no_closing'].includes(l.id))
  }

  return sorted
}
