// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const buildPrompt = (auditData: any, channelData: any) => {
  // ── Extract audit context ──
  const platform  = auditData?.input?.platform ?? 'tiktok'
  const niche     = auditData?.input?.niche ?? 'general'
  const followers = auditData?.input?.followers ?? 0
  const targetIncome = auditData?.revenueEstimation?.realistic ?? 5000

  // ── Extract channel context (multi-platform, pick best available) ──
  const platforms = Object.keys(channelData ?? {})
  const primaryPlatform = platforms[0] ?? platform
  const pd = channelData?.[primaryPlatform] ?? channelData ?? {}
  const ov  = pd.overview  ?? {}
  const aud = pd.audience  ?? {}
  const con = pd.content   ?? {}

  const realFollowers = ov.followers ?? ov.subscribers ?? followers
  const views28d      = ov.views_28d ?? ov.impressions_28d ?? null
  const femalePct     = aud.gender_female_pct ?? null
  const malePct       = aud.gender_male_pct ?? null
  const peakHours     = aud.peak_hours?.join(', ') ?? null
  const topAgeGroup   = (() => {
    const ages = [
      { key: 'age_13_17_pct', label: '13-17' },
      { key: 'age_18_24_pct', label: '18-24' },
      { key: 'age_25_34_pct', label: '25-34' },
      { key: 'age_35_44_pct', label: '35-44' },
      { key: 'age_45_plus_pct', label: '45+' },
    ]
    let top = ages[0]
    for (const ag of ages) if ((aud[ag.key] ?? 0) > (aud[top.key] ?? 0)) top = ag
    return aud[top.key] ? top.label : null
  })()
  const bestFormat    = con.best_format ?? null
  const avgViews      = con.avg_views_per_video ?? null
  const topVideo      = con.top_videos?.[0]?.views ?? null
  const watchTimeSec  = pd.watch_time?.avg_watch_time_sec ?? null
  const completionPct = pd.watch_time?.avg_completion_rate_pct ?? null
  const ytRevenue     = pd.monetization?.enabled ? pd.overview?.estimated_revenue_28d_usd : null

  return `You are MITA+ AI, a Thai social media monetization expert. Analyze this creator's real channel data and create a HIGHLY PERSONALIZED monetization plan in Thai language.

CREATOR CHANNEL DATA:
- Platform: ${primaryPlatform} (+ ${platforms.join(', ') || 'none'})
- Niche/Content: ${niche}
- Followers/Subscribers: ${realFollowers?.toLocaleString() ?? 'unknown'}
- Views last 28 days: ${views28d?.toLocaleString() ?? 'unknown'}
- Avg views/video: ${avgViews?.toLocaleString() ?? 'unknown'}
- Top video views: ${topVideo?.toLocaleString() ?? 'unknown'}
- Watch time avg: ${watchTimeSec ? Math.round(watchTimeSec) + ' sec' : 'unknown'}
- Completion rate: ${completionPct ?? 'unknown'}%
- Audience gender: ${femalePct != null ? `หญิง ${femalePct}% / ชาย ${malePct}%` : 'unknown'}
- Top age group: ${topAgeGroup ?? 'unknown'}
- Peak active hours: ${peakHours ?? 'unknown'}
- Best performing format: ${bestFormat ?? 'unknown'}
- YouTube monetized revenue: ${ytRevenue != null ? `$${ytRevenue} USD/month` : 'not monetized or N/A'}
- Target monthly income: ฿${targetIncome?.toLocaleString()}

IMPORTANT RULES:
- All amounts in THB (฿) per month
- Be SPECIFIC to this creator's niche, audience, and platform
- Recommend strategies based on REAL follower count and engagement
- Small channels (<10K): focus on affiliate + digital products
- Mid channels (10K-100K): add brand deals + workshops
- Large channels (100K+): add memberships + premium content
- Use casual Thai language (ภาษาคนทั่วไป ระดับ ม.ปลาย)
- Every recommendation must reference their specific niche/audience

Return ONLY valid JSON (no markdown):
{
  "headline": "<one-line hook about this creator's biggest opportunity — mention their niche/audience specifically>",
  "total_potential_min": <number THB/month>,
  "total_potential_max": <number THB/month>,
  "primary_strategy": "<affiliate|brand_deal|digital_product|adsense|membership|workshop>",
  "primary_strategy_reason": "<why this strategy fits THIS channel specifically — 1-2 sentences>",
  "revenue_streams": [
    {
      "id": "<unique id>",
      "type": "<affiliate|brand_deal|digital_product|adsense|membership|workshop|live_gift>",
      "name": "<specific platform or product name e.g. Shopee Affiliate>",
      "icon": "<single emoji>",
      "monthly_min": <THB>,
      "monthly_max": <THB>,
      "difficulty": "<easy|medium|hard>",
      "weeks_to_first_income": <number>,
      "why_fits": "<1 sentence specific to their channel data>",
      "first_action": "<concrete first step — start with a verb>"
    }
  ],
  "roadmap": [
    {
      "week": 1,
      "theme": "<focus theme e.g. ตั้งต้น>",
      "target_thb": <number — realistic for week 1, can be 0>,
      "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
    },
    {
      "week": 2,
      "theme": "<focus theme e.g. ลงมือทำ>",
      "target_thb": <number>,
      "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
    },
    {
      "week": 3,
      "theme": "<focus theme e.g. ปรับ + เพิ่ม>",
      "target_thb": <number>,
      "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
    },
    {
      "week": 4,
      "theme": "<focus theme e.g. เก็บผล>",
      "target_thb": <number — should approach monthly_min of primary stream>,
      "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
    }
  ],
  "quick_wins": [
    "<thing to do in next 7 days — specific and actionable>",
    "<thing 2>",
    "<thing 3>"
  ],
  "content_tip": "<specific posting tip based on their peak hours and best format>",
  "audience_insight": "<key insight about their audience demographics that affects monetization>"
}`
}

export async function POST(req: NextRequest) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey   = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not set')
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase env missing')

    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Load user profile
    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('audit_data, channel_data')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const auditData   = profile.audit_data   as any
    const channelData = profile.channel_data as any

    // Build prompt with real data
    const prompt = buildPrompt(auditData, channelData)

    // Call Claude Haiku
    const client = new Anthropic({ apiKey: anthropicKey })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    let plan: Record<string, unknown>
    try {
      const match = rawText.match(/\{[\s\S]*\}/)
      plan = match ? JSON.parse(match[0]) : {}
    } catch {
      throw new Error('Failed to parse plan JSON')
    }

    plan.generated_at = new Date().toISOString()
    plan.based_on_platforms = Object.keys(channelData ?? {})

    // Save to DB
    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({ monetization_plan: plan })
      .eq('id', userId)

    if (dbError) throw new Error(`DB: ${dbError.message}`)

    console.log(`[monetization/plan] ✅ Generated plan for user ${userId}`)
    return NextResponse.json({ success: true, plan })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[monetization/plan] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
