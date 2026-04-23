/**
 * MITA+ Revenue Estimation — Market-Based Model
 *
 * แทน multiplier สุ่ม ด้วยข้อมูลตลาดจริงจาก:
 * - ConvertCake Thai Influencer Rate Guide 2025
 * - Nation Thailand influencer income report
 * - FluxNote YouTube SEA RPM 2026
 * - InfluenceFlow TikTok Creator Earnings 2026
 *
 * 3 Income Streams:
 *   1. Sponsorship  — ตาม follower tier × Thai market rate × posting frequency
 *   2. Affiliate    — views × CTR จริง × CVR จริง × AOV ตาม niche
 *   3. Platform Ads — YouTube RPM จริง (TikTok/FB = ฿0 สำหรับ creator ไทย)
 */

import type { AuditFormData, RevenueEstimation } from '@/types'

// ─────────────────────────────────────────────
// 1. SPONSORSHIP
// ─────────────────────────────────────────────

/**
 * Thai market sponsorship rate per post (midpoint ฿)
 * Source: ConvertCake 2025, NationThailand
 */
function getSponsorshipRate(followers: number): {
  ratePerPost: number   // ฿ per sponsored post
  dealsPerMonth: number // realistic deals for this tier
} {
  if (followers >= 1_000_000) return { ratePerPost: 150_000, dealsPerMonth: 8 }
  if (followers >= 500_000)   return { ratePerPost: 80_000,  dealsPerMonth: 6 }
  if (followers >= 100_000)   return { ratePerPost: 40_000,  dealsPerMonth: 4 }
  if (followers >= 50_000)    return { ratePerPost: 15_000,  dealsPerMonth: 3 }
  if (followers >= 10_000)    return { ratePerPost: 7_000,   dealsPerMonth: 2 }
  if (followers >= 3_000)     return { ratePerPost: 4_000,   dealsPerMonth: 1 }
  // < 3K followers: sponsorship deals are rare, ฿0 baseline
  return { ratePerPost: 0, dealsPerMonth: 0 }
}

/**
 * Niche premium multiplier on sponsorship rate
 * Finance/beauty/fitness brands pay more for niche audiences
 */
const NICHE_SPONSOR_MULT: Record<string, number> = {
  finance:       1.5,
  business:      1.4,
  beauty:        1.3,
  fitness:       1.2,
  education:     1.1,
  lifestyle:     1.0,
  travel:        1.0,
  food:          0.9,
  entertainment: 0.8,
  other:         0.9,
}

/**
 * Platform premium for sponsorship
 * Brands prefer Instagram/YouTube over TikTok for TH market
 */
const PLATFORM_SPONSOR_MULT: Record<string, number> = {
  youtube:   1.3,
  instagram: 1.2,
  multi:     1.2,
  facebook:  0.9,
  tiktok:    0.8,
}

function estimateSponsorshipIncome(data: AuditFormData): number {
  const { ratePerPost, dealsPerMonth } = getSponsorshipRate(data.followers)
  if (ratePerPost === 0) return 0

  const nicheMult     = NICHE_SPONSOR_MULT[data.niche] ?? 1.0
  const platformMult  = PLATFORM_SPONSOR_MULT[data.platform] ?? 1.0

  return Math.round(ratePerPost * nicheMult * platformMult * dealsPerMonth)
}

// ─────────────────────────────────────────────
// 2. AFFILIATE / PRODUCT SALES
// ─────────────────────────────────────────────

/**
 * Click-through rate from content to affiliate/product link
 * Based on real industry data — conservative end of range
 * Source: industry benchmarks, Thailand affiliate market data 2024
 */
const NICHE_CTR: Record<string, number> = {
  finance:       0.030,  // 3.0% — high-intent, trust-based
  business:      0.025,  // 2.5%
  education:     0.022,  // 2.2% — course links
  beauty:        0.020,  // 2.0% — product links
  fitness:       0.018,  // 1.8%
  lifestyle:     0.015,  // 1.5%
  food:          0.012,  // 1.2% — lower intent to buy
  travel:        0.012,  // 1.2%
  entertainment: 0.008,  // 0.8% — lowest intent
  other:         0.015,
}

/**
 * Conversion rate of people who click → actually buy
 * Source: Shopee/Lazada affiliate benchmark, global affiliate CVR data
 */
const NICHE_CVR: Record<string, number> = {
  finance:       0.025, // 2.5% — high trust, high intent product
  business:      0.022,
  education:     0.030, // 3.0% — digital products convert better
  beauty:        0.020, // 2.0% — impulse buy
  fitness:       0.018,
  lifestyle:     0.015,
  food:          0.015,
  travel:        0.012,
  entertainment: 0.010,
  other:         0.015,
}

/**
 * Average Order Value (AOV) in ฿
 * Based on typical affiliate/product in each niche in Thailand
 */
const NICHE_AOV: Record<string, number> = {
  finance:       1_500, // คอร์ส/โปรแกรม การลงทุน
  business:      1_200,
  education:     990,   // คอร์สออนไลน์
  beauty:        590,   // ครีม/เครื่องสำอาง
  fitness:       690,   // อาหารเสริม/อุปกรณ์
  lifestyle:     490,
  food:          390,   // อาหาร delivery/สินค้า
  travel:        1_200, // ทัวร์/โรงแรม (commission)
  entertainment: 299,
  other:         490,
}

/**
 * Platform multiplier on affiliate conversion
 * YouTube audience has highest purchase intent (longer watch = more trust)
 * TikTok impulse-buy is lower for non-shopping content
 */
const PLATFORM_AFFILIATE_MULT: Record<string, number> = {
  youtube:   1.4,
  instagram: 1.1,
  multi:     1.2,
  facebook:  1.0,
  tiktok:    0.7,  // short form = lower trust = lower CVR
}

const FREQ_POSTS_PER_MONTH: Record<string, number> = {
  daily:       30,
  '3-5x_week': 16,
  '1-2x_week': 6,
  monthly:     2,
}

function estimateAffiliateIncome(data: AuditFormData): number {
  const postsPerMonth  = FREQ_POSTS_PER_MONTH[data.postingFrequency] ?? 6
  const monthlyViews   = data.avgViews * postsPerMonth

  const ctr            = NICHE_CTR[data.niche] ?? 0.015
  const cvr            = NICHE_CVR[data.niche] ?? 0.015
  const aov            = data.hasProduct
    ? (NICHE_AOV[data.niche] ?? 490)   // own product → full price
    : (NICHE_AOV[data.niche] ?? 490) * 0.08  // affiliate commission ~8%
  const platformMult   = PLATFORM_AFFILIATE_MULT[data.platform] ?? 1.0

  return Math.round(monthlyViews * ctr * cvr * aov * platformMult)
}

// ─────────────────────────────────────────────
// 3. PLATFORM AD REVENUE
// ─────────────────────────────────────────────

/**
 * RPM (Revenue Per 1,000 views) in ฿ — Thailand creator earnings
 * Source: FluxNote YouTube SEA RPM 2026, InfluenceFlow TikTok 2026
 *
 * TikTok Creator Fund: ไม่เปิดในไทย → ฿0
 * Facebook/Instagram: RPM ต่ำมาก → ฿1/1K
 * YouTube: ขึ้นกับ niche
 */
function getPlatformRPM(platform: string, niche: string): number {
  if (platform === 'tiktok')    return 0      // ไม่มี Creator Fund ในไทย
  if (platform === 'facebook')  return 1      // ฿1 / 1K views
  if (platform === 'instagram') return 1      // Reels bonus ไม่เปิดในไทย

  if (platform === 'youtube' || platform === 'multi') {
    const youtubeRPM: Record<string, number> = {
      finance:       65,  // $1.80 × 36 ≈ ฿65/1K — highest CPM niche
      business:      55,
      education:     35,
      beauty:        20,
      fitness:       20,
      lifestyle:     15,
      travel:        18,
      food:          12,
      entertainment: 10,
      other:         12,
    }
    const rpm = youtubeRPM[niche] ?? 12
    // multi-platform: ภาพรวม diluted
    return platform === 'multi' ? Math.round(rpm * 0.5) : rpm
  }
  return 0
}

function estimatePlatformAdsIncome(data: AuditFormData): number {
  const postsPerMonth = FREQ_POSTS_PER_MONTH[data.postingFrequency] ?? 6
  const monthlyViews  = data.avgViews * postsPerMonth
  const rpm           = getPlatformRPM(data.platform, data.niche)

  return Math.round((monthlyViews / 1_000) * rpm)
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export interface RevenueBreakdown {
  sponsorship:  number  // ฿/เดือน
  affiliate:    number  // ฿/เดือน
  platformAds:  number  // ฿/เดือน
}

/**
 * scoreTotal (optional) — used to scale down totalMissed for high-scoring creators.
 * A creator with score 93 already has most systems in place, so their remaining
 * "gap" should be proportionally smaller than a beginner with score 20.
 */
export function estimateRevenue(data: AuditFormData, scoreTotal?: number): RevenueEstimation & { breakdown: RevenueBreakdown } {
  const sponsorship = estimateSponsorshipIncome(data)
  const affiliate   = estimateAffiliateIncome(data)
  const platformAds = estimatePlatformAdsIncome(data)

  // "Realistic" = weighted sum
  // Sponsorship is the reliable part; affiliate/platform are upside
  const realistic = Math.round(sponsorship * 0.8 + affiliate + platformAds)

  // Conservative = 50% of realistic (ทำได้จริงถ้าเริ่มต้น)
  const conservative = Math.round(realistic * 0.5)

  // Aggressive = ถ้าทำทุกอย่างเต็มที่ + compound effect
  const aggressive = Math.round(
    sponsorship * 1.3 + affiliate * 1.8 + platformAds * 1.2
  )

  // currentIncome = actual number from form (monthlyIncome is now ฿ not enum)
  const currentIncome = typeof data.monthlyIncome === 'number' ? data.monthlyIncome : 0

  // Score-based gap multiplier:
  // High score = creator already has most systems → smaller remaining gap
  // Low score = beginner with full upside → full gap
  const scoreMultiplier =
    scoreTotal === undefined ? 1.0
    : scoreTotal >= 86 ? 0.35
    : scoreTotal >= 71 ? 0.50
    : scoreTotal >= 51 ? 0.70
    : scoreTotal >= 31 ? 0.85
    : 1.0

  const rawGap    = Math.max(aggressive - currentIncome, 0)
  const totalMissed = Math.max(
    Math.round(rawGap * scoreMultiplier),
    Math.round(currentIncome * 0.10), // floor: at least 10% of current income
    500, // absolute minimum ฿500
  )

  const postsPerMonth = FREQ_POSTS_PER_MONTH[data.postingFrequency] ?? 6
  const monthlyViews  = data.avgViews * postsPerMonth

  return {
    conservative,
    realistic,
    aggressive,
    totalMissed,
    currentIncome,
    breakdown: {
      sponsorship,
      affiliate,
      platformAds,
    },
    formula: {
      monthlyViews,
      ctr: NICHE_CTR[data.niche] ?? 0.015,
      conversionRate: NICHE_CVR[data.niche] ?? 0.015,
      avgOrderValue:  NICHE_AOV[data.niche] ?? 490,
    },
  }
}
