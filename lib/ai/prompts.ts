import type { AuditFormData, RevenueLeak, RevenueEstimation, MonetizationScore, CreatorStage } from '@/types'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const PLATFORM_TH: Record<string, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', multi: 'หลายแพลตฟอร์ม',
}
const NICHE_TH: Record<string, string> = {
  lifestyle: 'ไลฟ์สไตล์', education: 'การศึกษา', finance: 'การเงิน', entertainment: 'ความบันเทิง',
  beauty: 'ความงาม', fitness: 'ออกกำลังกาย', business: 'ธุรกิจ', food: 'อาหาร', travel: 'ท่องเที่ยว', other: 'อื่นๆ',
}
const INCOME_TH: Record<string, string> = {
  zero: '0 บาท', under_5k: 'น้อยกว่า 5,000 บาท', '5k_20k': '5,000–20,000 บาท',
  '20k_50k': '20,000–50,000 บาท', '50k_100k': '50,000–100,000 บาท', over_100k: 'มากกว่า 100,000 บาท',
}

export function buildSystemPrompt(): string {
  return `You are an elite creator monetization strategist.

You are NOT here to give advice.
You are here to show the creator how much money they are losing.

IRON RULES:
- Always quantify money in THB/month — no vague statements
- Always identify the biggest revenue leak first — by name, by amount
- Speak directly. Zero fluff. Zero encouragement.
- Every sentence must create urgency or quantify loss
- Reference the creator's actual data — never generic
- If the creator only "understands" but does not feel urgency, you failed

Response language: Thai (ภาษาไทย)
Tone: Elite business consultant — sharp, direct, numbers-driven
NOT: online coach, motivational speaker, generic content creator advice`
}

export function buildUserPrompt(
  data: AuditFormData,
  leaks: RevenueLeak[],
  revenue: RevenueEstimation,
  score: MonetizationScore,
  stage: CreatorStage,
): string {
  const topLeaks = leaks.slice(0, 3)
  const postsPerMonth: Record<string, number> = { daily: 30, '3-5x_week': 16, '1-2x_week': 6, monthly: 1 }
  const monthlyViews = data.avgViews * (postsPerMonth[data.postingFrequency] ?? 4)

  const totalLeak = leaks.reduce((s, l) => s + l.missedPerMonth, 0)
  const worstLeak = leaks[0]

  return `=== CREATOR DATA ===
Name: ${data.name}
Platform: ${PLATFORM_TH[data.platform] ?? data.platform} | Niche: ${NICHE_TH[data.niche] ?? data.niche}
Followers: ${data.followers.toLocaleString('th-TH')} | Avg Views/Post: ${data.avgViews.toLocaleString('th-TH')}
Monthly Views: ${fmt(monthlyViews)} | Engagement: ${data.engagementRate}%
Current Income: ${INCOME_TH[data.monthlyIncome] ?? data.monthlyIncome}/month
Monetization Score: ${score.total}/100

Systems:
- Own Product: ${data.hasProduct ? 'YES' : 'NO ← MISSING'}
- Sales Funnel: ${data.hasFunnel ? 'YES' : 'NO ← MISSING'}
- Affiliate: ${data.hasAffiliate ? 'YES' : 'NO ← MISSING'}
- Closing System: ${data.hasClosingSystem ? 'YES' : 'NO ← MISSING'}

=== REVENUE LEAKS FOUND ===
${topLeaks.map((l, i) => `${i + 1}. [${l.severity.toUpperCase()}] ${l.title}: -฿${fmt(l.missedPerMonth)}/month`).join('\n')}
TOTAL MONTHLY LOSS: -฿${fmt(totalLeak)}/month = -฿${fmt(totalLeak * 12)}/year

Biggest Leak: ${worstLeak ? `${worstLeak.title} (-฿${fmt(worstLeak.missedPerMonth)}/month)` : 'N/A'}

=== REVENUE POTENTIAL ===
Current: ฿${fmt(revenue.currentIncome)}/month
Realistic potential: ฿${fmt(revenue.realistic)}/month
Gap: ฿${fmt(revenue.totalMissed)}/month uncaptured

Creator's goal: ${data.goalIn90Days || 'not specified'}
Creator's problem: ${data.biggestProblem || 'not specified'}

---

Respond ONLY with valid JSON. No text outside JSON. 4 fields exactly:

{
  "shock": "1–2 sentences ONLY. State exactly how much ฿/month ${data.name} is losing right now. Name the biggest leak. Make it hurt. No softening.",
  "whyItHappens": "Root cause analysis of the biggest revenue leak. Why does this happen specifically for ${data.name}'s niche/platform/situation? What is the compounding effect over time? Reference actual numbers.",
  "topActions": "Exactly 1–2 high-impact actions ONLY. Not 5. Not a roadmap. The ONE or TWO things that will move the most money in 30 days for ${data.name} specifically. Be specific enough that they can start today.",
  "upside": "Quantify exactly how much ${data.name} can make if the top leak is fixed. Use the realistic/aggressive numbers. Make it feel achievable AND exciting. This is the close — they should feel: I need to do this now."
}

CRITICAL: Every field must reference ${data.name}'s actual data. Zero generic statements.`
}
