export type RevenuePathId = 'affiliate' | 'ugc' | 'youtube_auto' | 'live_tips' | 'adsense'

export interface RevenuePath {
  id: RevenuePathId
  rank: number  // 1, 2, 3
  name: string
  tagline: string
  why_fits_short: string
  timeline_days: number
  income_min: number
  income_max: number
  effort_level: 'ต่ำ' | 'ปานกลาง' | 'สูง'
  mobile_only: boolean
}

export interface RevenuePathDetail extends RevenuePath {
  why_fits_long: string
  steps: Array<{ title: string; body: string }>
  tools: Array<{
    name: string
    icon: string       // Lucide icon name e.g. "ShoppingBag"
    description: string
    cost: string
    cta_text: string
    cta_url: string
  }>
  case_study: {
    creator_name: string
    handle: string
    niche: string
    follower: number
    monthly_income: number
    quote: string
  }
  first_step: {
    action_text: string
    action_url: string
  }
}

export interface RevenuePathsCache {
  paths: RevenuePathDetail[]
  generated_at: string   // ISO timestamp
  refresh_count: number
}
