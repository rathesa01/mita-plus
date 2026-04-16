import type { AuditFormData, RevenueEstimation } from '@/types'

const NICHE_CTR: Record<string, number> = {
  finance: 0.08,
  business: 0.07,
  education: 0.06,
  beauty: 0.05,
  fitness: 0.05,
  lifestyle: 0.04,
  food: 0.04,
  travel: 0.04,
  entertainment: 0.03,
  other: 0.04,
}

const PLATFORM_MULTIPLIER: Record<string, number> = {
  youtube: 1.5,
  tiktok: 0.8,
  instagram: 1.0,
  facebook: 0.9,
  multi: 1.2,
}

const FREQUENCY_POSTS_PER_MONTH: Record<string, number> = {
  daily: 30,
  '3-5x_week': 16,
  '1-2x_week': 6,
  monthly: 1,
}

const INCOME_MIDPOINT: Record<string, number> = {
  zero: 0,
  under_5k: 2500,
  '5k_20k': 12000,
  '20k_50k': 35000,
  '50k_100k': 75000,
  over_100k: 150000,
}

function getAOV(data: AuditFormData): number {
  if (!data.hasProduct) return 490 // affiliate baseline
  const income = data.monthlyIncome
  if (income === 'over_100k' || income === '50k_100k') return 4990
  if (income === '20k_50k') return 1990
  return 990
}

export function estimateRevenue(data: AuditFormData): RevenueEstimation {
  const postsPerMonth = FREQUENCY_POSTS_PER_MONTH[data.postingFrequency] ?? 4
  const monthlyViews = data.avgViews * postsPerMonth

  const baseCTR = NICHE_CTR[data.niche] ?? 0.04
  const platformMult = PLATFORM_MULTIPLIER[data.platform] ?? 1.0
  const ctr = baseCTR * platformMult

  const aov = getAOV(data)

  const conservative = Math.round(monthlyViews * ctr * 0.01 * aov)
  const realistic = Math.round(monthlyViews * ctr * 0.02 * aov)
  const aggressive = Math.round(monthlyViews * ctr * 0.04 * aov)

  const currentIncome = INCOME_MIDPOINT[data.monthlyIncome] ?? 0
  const totalMissed = Math.max(realistic - currentIncome, 0)

  return {
    conservative,
    realistic,
    aggressive,
    totalMissed,
    currentIncome,
    formula: {
      monthlyViews,
      ctr,
      conversionRate: 0.02,
      avgOrderValue: aov,
    },
  }
}
