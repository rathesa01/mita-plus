import type { AuditFormData } from '@/types'

// ── DEFAULT form state — shared between audit page and Lovable-adapted UI ──
// Source: extracted from app/audit/page.tsx defaultForm (P-008-adapt)
export const DEFAULT_FORM_DATA: AuditFormData = {
  name: '',
  email: '',
  platform: 'tiktok',
  niche: 'lifestyle',
  audienceType: 'general',
  followers: 0,
  avgViews: 0,
  postingFrequency: '3-5x_week',
  engagementRate: 3,
  currentIncomeSources: ['none'],
  monthlyIncome: 0,
  hasProduct: false,
  hasFunnel: false,
  hasAffiliate: false,
  hasClosingSystem: false,
  contentDuration: '3-12months',
  triedAndFailed: ['none_tried'],
  audienceBuyingPower: 'mixed',
  subNiche: '',
  contentDescription: '',
  biggestProblem: '',
  goalIn90Days: '',
}
