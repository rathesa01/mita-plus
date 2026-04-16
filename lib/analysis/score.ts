import type { AuditFormData, MonetizationScore } from '@/types'

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

/** Reach Score 0–25 */
function calcReach(data: AuditFormData): number {
  const followerScore = (Math.log10(Math.max(data.followers, 10)) / Math.log10(10_000_000)) * 15
  const engBonus = clamp((data.engagementRate / 5) * 5, 0, 5)
  const platformBonus = { youtube: 5, tiktok: 3, instagram: 2, facebook: 1, multi: 4 }[data.platform] ?? 2
  return clamp(followerScore + engBonus + platformBonus, 0, 25)
}

/** Monetization Score 0–25 */
function calcMonetization(data: AuditFormData): number {
  const sources = data.currentIncomeSources.filter((s) => s !== 'none')
  const sourceScore = Math.min(sources.length * 5, 15)
  const incomeBonus: Record<string, number> = {
    zero: 0,
    under_5k: 2,
    '5k_20k': 5,
    '20k_50k': 8,
    '50k_100k': 11,
    over_100k: 15,
  }
  return clamp(sourceScore + (incomeBonus[data.monthlyIncome] ?? 0), 0, 25)
}

/** Funnel Score 0–25 */
function calcFunnel(data: AuditFormData): number {
  const productScore = data.hasProduct ? 10 : 0
  const funnelScore = data.hasFunnel ? 10 : 0
  const freqBonus: Record<string, number> = {
    daily: 5,
    '3-5x_week': 3,
    '1-2x_week': 1,
    monthly: 0,
  }
  return clamp(productScore + funnelScore + (freqBonus[data.postingFrequency] ?? 0), 0, 25)
}

/** Conversion Score 0–15 */
function calcConversion(data: AuditFormData): number {
  const closing = data.hasClosingSystem ? 8 : 0
  const affiliate = data.hasAffiliate ? 7 : 0
  return clamp(closing + affiliate, 0, 15)
}

/** Product Score 0–10 */
function calcProduct(data: AuditFormData): number {
  if (!data.hasProduct) return 0
  return data.hasFunnel ? 10 : 7
}

export function calculateScore(data: AuditFormData): MonetizationScore {
  const reach = Math.round(calcReach(data))
  const monetization = Math.round(calcMonetization(data))
  const funnel = Math.round(calcFunnel(data))
  const conversion = Math.round(calcConversion(data))
  const product = Math.round(calcProduct(data))
  const total = reach + monetization + funnel + conversion + product

  return { total, breakdown: { reach, monetization, funnel, conversion, product } }
}
