// ══════════════════════════════════════════════
//  MITA+ Types — Money In The Air
// ══════════════════════════════════════════════

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'multi'
export type Niche =
  | 'lifestyle'
  | 'education'
  | 'finance'
  | 'entertainment'
  | 'beauty'
  | 'fitness'
  | 'business'
  | 'food'
  | 'travel'
  | 'other'
export type AudienceType = 'general' | 'niche' | 'professional' | 'mixed'
export type PostingFrequency = 'daily' | '3-5x_week' | '1-2x_week' | 'monthly'
export type MonthlyIncomeRange =
  | 'zero'
  | 'under_5k'
  | '5k_20k'
  | '20k_50k'
  | '50k_100k'
  | 'over_100k'
export type IncomeSource =
  | 'ads_revenue'
  | 'sponsorship'
  | 'affiliate'
  | 'own_product'
  | 'coaching'
  | 'merchandise'
  | 'subscription'
  | 'none'
export type ContentDuration = 'under_3months' | '3-12months' | '1-2years' | 'over_2years'
export type TriedAndFailed = 'affiliate' | 'sponsorship' | 'own_product' | 'coaching' | 'live_selling' | 'none_tried'
export type AudienceBuyingPower = 'student' | 'worker' | 'homemaker' | 'business_owner' | 'mixed'
export type SubNiche = string // free string — values come from the SUB_NICHES map

// ── INPUT ──────────────────────────────────────
export interface AuditFormData {
  // Step 1 — Profile
  name: string
  email: string
  platform: Platform
  niche: Niche
  audienceType: AudienceType

  // Step 2 — Performance
  followers: number
  avgViews: number
  postingFrequency: PostingFrequency
  engagementRate: number // %

  // Step 3 — Monetization
  currentIncomeSources: IncomeSource[]
  monthlyIncome: MonthlyIncomeRange
  hasProduct: boolean
  hasFunnel: boolean
  hasAffiliate: boolean
  hasClosingSystem: boolean

  // Step 4 — Goals
  contentDuration: ContentDuration
  triedAndFailed: TriedAndFailed[]
  audienceBuyingPower: AudienceBuyingPower
  subNiche: string
  biggestProblem: string
  goalIn90Days: string
}

// ── CREATOR STAGE ──────────────────────────────
export type CreatorStageId =
  | 'audience_only'
  | 'monetizable'
  | 'early_revenue'
  | 'conversion_ready'
  | 'revenue_engine'

export interface CreatorStage {
  id: CreatorStageId
  label: string         // ภาษาคนทั่วไป
  emoji: string
  shockLine: string     // ประโยคที่ทำให้เจ็บ
  color: string         // tailwind color class
}

// ── MONETIZATION SCORE ────────────────────────
export interface MonetizationScore {
  total: number
  breakdown: {
    reach: number        // 0–25
    monetization: number // 0–25
    funnel: number       // 0–25
    conversion: number   // 0–15
    product: number      // 0–10
  }
}

// ── REVENUE LEAK ──────────────────────────────
export type LeakType =
  | 'no_product'
  | 'no_funnel'
  | 'weak_cta'
  | 'no_affiliate'
  | 'no_backend'
  | 'no_tracking'
  | 'low_frequency'
  | 'no_closing'
  | 'wrong_monetization_model'
  | 'duration_no_income'

export type LeakSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface RevenueLeak {
  id: LeakType
  severity: LeakSeverity
  title: string
  painLine: string          // ประโยคเจ็บๆ
  explanation: string       // อธิบายว่าทำไมถึงเสียเงิน
  missedPerMonth: number    // บาท/เดือน
  missedPerYear: number     // บาท/ปี
  shockSentence: string     // "ทุกเดือนที่ไม่มี X คุณสูญเสีย..."
  impact: string            // one-liner
}

// ── REVENUE ESTIMATION ────────────────────────
export interface RevenueEstimation {
  conservative: number  // บาท/เดือน (ต่ำ)
  realistic: number     // บาท/เดือน (จริง)
  aggressive: number    // บาท/เดือน (โอกาส)
  totalMissed: number   // เงินที่เสียไปแล้วต่อเดือน
  currentIncome: number // จากที่กรอกมา
  breakdown: {
    sponsorship: number  // รายได้จาก Sponsorship
    affiliate: number    // รายได้จาก Affiliate/Product
    platformAds: number  // รายได้จาก Platform Ads
  }
  formula: {
    monthlyViews: number
    ctr: number
    conversionRate: number
    avgOrderValue: number
  }
}

// ── RECOMMENDATION ────────────────────────────
export interface MonetizationRecommendation {
  type: IncomeSource
  title: string
  rationale: string
  estimatedRevenueLow: number
  estimatedRevenueHigh: number
  timeToRevenue: string
  difficulty: 'easy' | 'medium' | 'hard'
  priority: number
  exampleAction: string  // ตัวอย่างจริง
}

// ── ACTION PLAN ───────────────────────────────
export interface ActionItem {
  action: string
  example: string         // ตัวอย่างทำได้เลย
  expectedOutcome: string
  revenueImpact: number
}

export interface ActionPlan {
  day30: ActionItem[]
  day60: ActionItem[]
  day90: ActionItem[]
}

// ── AI INSIGHTS — 4-Part Framework ───────────
// SHOCK → WHY IT HAPPENS → WHAT FIRST → UPSIDE
export interface AIInsights {
  shock: string          // 1–2 sentences: เงินที่เสียอยู่ตอนนี้ ฿X/เดือน
  whyItHappens: string   // biggest leak — ทำไมถึงเสียเงิน root cause
  topActions: string     // 1–2 high-impact actions ทำได้เลยวันนี้
  upside: string         // ถ้าแก้แล้วจะได้เงินเท่าไหร่ เฉพาะตัวเขา
}

// ── PRICING ───────────────────────────────────
export interface PricingRecommendation {
  tier: 'starter' | 'growth' | 'premium' | 'revenue_share'
  reportPrice: number
  premiumPrice: number
  urgencyMessage: string
  valueProposition: string
}

// ── FULL RESULT ───────────────────────────────
export interface AuditResult {
  id: string
  createdAt: string
  input: AuditFormData

  stage: CreatorStage
  score: MonetizationScore
  leaks: RevenueLeak[]
  revenueEstimation: RevenueEstimation
  recommendations: MonetizationRecommendation[]
  actionPlan: ActionPlan
  aiInsights: AIInsights
  pricing: PricingRecommendation
}
