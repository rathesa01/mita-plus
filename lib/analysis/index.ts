import type { AuditFormData, AuditResult, PricingRecommendation } from '@/types'
import { calculateScore } from './score'
import { classifyStage } from './stage'
import { estimateRevenue } from './revenue'
import { detectLeaks } from './leaks'
import { buildRecommendations } from './recommendations'
import { buildActionPlan } from './actionPlan'

function fmt(n: number) {
  return n.toLocaleString('th-TH')
}

function getPricing(
  score: number,
  monthlyIncome: number,
  totalMissed: number,
): PricingRecommendation {
  if (monthlyIncome >= 100_000) {
    return {
      tier: 'revenue_share',
      reportPrice: 0,
      premiumPrice: 0,
      urgencyMessage: `คุณมีรายได้ระดับนี้แล้ว — Revenue Share คือโมเดลที่ถูกที่สุด เพราะคุณจ่ายเมื่อได้เงินเท่านั้น`,
      valueProposition: 'เราช่วย Scale รายได้คุณ แล้วรับ % เฉพาะเงินที่เพิ่มขึ้น',
    }
  }
  if (score >= 55 || monthlyIncome >= 50_000) {
    return {
      tier: 'premium',
      reportPrice: 999,
      premiumPrice: 29900,
      urgencyMessage: `คุณกำลังเสียเงิน ฿${fmt(totalMissed)}/เดือน — ลงทุน 29,900 บาทวันนี้คืนทุนใน 1 เดือน`,
      valueProposition: 'เราวางระบบ Funnel + Monetization ให้ครบ ใน 30 วัน',
    }
  }
  if (score >= 35 || monthlyIncome >= 20_000) {
    return {
      tier: 'growth',
      reportPrice: 599,
      premiumPrice: 14900,
      urgencyMessage: `Report เต็มช่วยให้คุณหาเงินเพิ่ม ฿${fmt(totalMissed)}/เดือน — คุ้มค่ากว่าราคา 599 บาทมาก`,
      valueProposition: 'รายงานเต็ม + แผนจริง + script ปิดการขาย',
    }
  }
  return {
    tier: 'starter',
    reportPrice: 299,
    premiumPrice: 5900,
    urgencyMessage: `เริ่มต้นด้วยแผน 299 บาท — คุ้มค่าถ้าคุณจริงจังกับการทำเงินจากคอนเทนต์`,
    valueProposition: 'แผนทำเงินเฉพาะตัว + roadmap 90 วัน',
  }
}

export function analyzeAudit(data: AuditFormData): Omit<AuditResult, 'id' | 'createdAt' | 'aiInsights'> {
  const score = calculateScore(data)
  const stage = classifyStage(data, score)
  // Pass score.total so high-scoring creators get a realistic (smaller) gap
  const revenueEstimation = estimateRevenue(data, score.total)
  const rawLeaks = detectLeaks(data, revenueEstimation)

  // ── Normalize leak amounts ─────────────────────────────────────────
  // Total leaks must not exceed the actual revenue gap (totalMissed).
  // Raw multipliers are calibrated for large accounts — without this cap,
  // a 5K-follower account can show ฿43K in "leaks" against a ฿3K potential,
  // which destroys credibility.
  const leaks = normalizeLeaks(rawLeaks, revenueEstimation.totalMissed)

  const recommendations = buildRecommendations(data)
  const actionPlan = buildActionPlan(data, leaks, recommendations)
  const pricing = getPricing(score.total, data.monthlyIncome, revenueEstimation.totalMissed)

  return { input: data, stage, score, leaks, revenueEstimation, recommendations, actionPlan, pricing }
}

function normalizeLeaks(
  leaks: ReturnType<typeof detectLeaks>,
  totalMissed: number,
): ReturnType<typeof detectLeaks> {
  if (leaks.length === 0 || totalMissed <= 0) return leaks

  const rawTotal = leaks.reduce((s, l) => s + l.missedPerMonth, 0)
  if (rawTotal <= 0) return leaks

  // Scale so total = totalMissed (cap only — don't inflate if rawTotal < totalMissed)
  const scale = rawTotal > totalMissed ? totalMissed / rawTotal : 1

  return leaks.map(l => {
    const normalized = Math.round(l.missedPerMonth * scale)
    const fmtN = normalized.toLocaleString('th-TH')
    return {
      ...l,
      missedPerMonth: normalized,
      missedPerYear: normalized * 12,
      impact: `฿${fmtN}/เดือน ที่หายไปจาก "${l.title}"`,
    }
  })
}
