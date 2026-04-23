import { z } from 'zod'

// ── AuditFormData schema ───────────────────────
export const AuditFormSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().default('').transform(v => {
    const t = v.trim()
    // ถ้าไม่ใช่ email ถูกต้อง → ส่งเป็น '' แทน (ไม่ block การ submit)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : ''
  }),
  platform: z.enum(['tiktok', 'instagram', 'youtube', 'facebook', 'multi']),
  niche: z.enum(['lifestyle', 'education', 'finance', 'entertainment', 'beauty', 'fitness', 'business', 'food', 'travel', 'other', 'mom_baby', 'gaming', 'cafe', 'health', 'automotive']),
  audienceType: z.enum(['general', 'niche', 'professional', 'mixed']),
  followers: z.number().min(0).max(100_000_000),
  avgViews: z.number().min(0).max(100_000_000),
  postingFrequency: z.enum(['daily', '3-5x_week', '1-2x_week', 'monthly']),
  engagementRate: z.number().min(0).max(100),
  currentIncomeSources: z.array(
    z.enum(['ads_revenue', 'sponsorship', 'affiliate', 'own_product', 'coaching', 'merchandise', 'subscription', 'none'])
  ).min(1).max(8),
  monthlyIncome: z.number().min(0).max(100_000_000),
  hasProduct: z.boolean(),
  hasFunnel: z.boolean(),
  hasAffiliate: z.boolean(),
  hasClosingSystem: z.boolean(),
  biggestProblem: z.string().max(1000).optional().default(''),
  goalIn90Days: z.string().max(1000).optional().default(''),
  contentDuration: z.enum(['under_3months', '3-12months', '1-2years', 'over_2years']).default('3-12months'),
  triedAndFailed: z.array(z.enum(['affiliate', 'sponsorship', 'own_product', 'coaching', 'live_selling', 'none_tried'])).min(1).max(6).default(['none_tried']),
  audienceBuyingPower: z.enum(['student', 'worker', 'homemaker', 'business_owner', 'mixed']).default('mixed'),
  subNiche: z.string().max(100).default(''),
  contentDescription: z.string().max(500).optional().default(''),
})

// ── Contact form schema ────────────────────────
export const ContactSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional().or(z.literal('')),
  plan: z.enum(['free', 'starter', 'pro', 'report', 'premium', 'revenue_share']).default('starter'),
  score: z.number().min(0).max(100).optional(),
  revenueGap: z.number().min(0).optional(),
  platform: z.string().max(50).optional(),
  niche: z.string().max(50).optional(),
  followers: z.number().min(0).optional(),
  reportPrice: z.number().min(0).optional(),
  premiumPrice: z.number().min(0).optional(),
})

export type ValidatedAuditForm = z.infer<typeof AuditFormSchema>
export type ValidatedContact = z.infer<typeof ContactSchema>
