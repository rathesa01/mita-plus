// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// ── Platform-specific Vision Prompts ──────────────────────────────────────────

const BASE_RULES = `
Rules:
- Extract numbers exactly as shown (do NOT round or estimate)
- Thai numbers: "1.2แสน" = 120000, "5.6หมื่น" = 56000, "1.5พัน" = 1500
- K/M suffix: 12.5K = 12500, 1.2M = 1200000
- Return ONLY valid JSON, no explanation, no markdown
- Use null for any field not visible in the screenshots`

const PROMPTS: Record<string, string> = {
  tiktok: `You are analyzing TikTok Studio analytics screenshots from a Thai content creator.
Extract ALL visible numbers and data carefully.
Return ONLY a valid JSON object:
{
  "overview": {
    "followers": <number>,
    "followers_growth_28d": <number or null>,
    "views_28d": <number or null>,
    "views_7d": <number or null>,
    "profile_views_28d": <number or null>,
    "likes_28d": <number or null>,
    "comments_28d": <number or null>,
    "shares_28d": <number or null>,
    "views_trend": "<growing|declining|stable>"
  },
  "content": {
    "top_videos": [
      { "rank": 1, "views": <number>, "likes": <number or null>, "comments": <number or null>, "shares": <number or null>, "topic_guess": "<topic>" }
    ],
    "avg_views_per_video": <number or null>,
    "total_videos": <number or null>,
    "best_format": "<short|long|live or null>"
  },
  "audience": {
    "gender_female_pct": <number 0-100 or null>,
    "gender_male_pct": <number 0-100 or null>,
    "age_13_17_pct": <number or null>,
    "age_18_24_pct": <number or null>,
    "age_25_34_pct": <number or null>,
    "age_35_44_pct": <number or null>,
    "age_45_plus_pct": <number or null>,
    "top_country": "<country or null>",
    "top_city": "<city or null>",
    "peak_days": ["<day>"],
    "peak_hours": ["<HH:00>"]
  },
  "watch_time": {
    "avg_watch_time_sec": <number or null>,
    "avg_completion_rate_pct": <number or null>,
    "traffic_source_top": "<source or null>"
  }
}
${BASE_RULES}`,

  youtube: `You are analyzing YouTube Studio analytics screenshots from a Thai content creator.
Extract ALL visible numbers and data carefully.
Return ONLY a valid JSON object:
{
  "overview": {
    "subscribers": <number>,
    "subscribers_growth_28d": <number or null>,
    "views_28d": <number or null>,
    "watch_time_hours_28d": <number or null>,
    "impressions_28d": <number or null>,
    "ctr_pct": <number or null>,
    "estimated_revenue_28d_usd": <number or null>,
    "views_trend": "<growing|declining|stable>"
  },
  "content": {
    "top_videos": [
      { "rank": 1, "views": <number>, "impressions": <number or null>, "ctr_pct": <number or null>, "watch_time_hours": <number or null>, "topic_guess": "<topic>" }
    ],
    "avg_views_per_video": <number or null>,
    "total_videos": <number or null>,
    "best_format": "<shorts|long|live or null>"
  },
  "audience": {
    "gender_female_pct": <number 0-100 or null>,
    "gender_male_pct": <number 0-100 or null>,
    "age_13_17_pct": <number or null>,
    "age_18_24_pct": <number or null>,
    "age_25_34_pct": <number or null>,
    "age_35_44_pct": <number or null>,
    "age_45_plus_pct": <number or null>,
    "top_country": "<country or null>",
    "top_city": "<city or null>",
    "peak_days": ["<day>"],
    "peak_hours": ["<HH:00>"],
    "returning_viewers_pct": <number or null>
  },
  "monetization": {
    "enabled": <true|false|null>,
    "rpm_usd": <number or null>,
    "cpm_usd": <number or null>
  }
}
${BASE_RULES}`,

  instagram: `You are analyzing Instagram Professional Dashboard screenshots from a Thai content creator.
Extract ALL visible numbers and data carefully.
Return ONLY a valid JSON object:
{
  "overview": {
    "followers": <number>,
    "followers_growth_30d": <number or null>,
    "accounts_reached_30d": <number or null>,
    "accounts_engaged_30d": <number or null>,
    "profile_visits_30d": <number or null>,
    "reach_trend": "<growing|declining|stable>"
  },
  "content": {
    "top_posts": [
      { "rank": 1, "type": "<reel|post|story>", "reach": <number>, "likes": <number or null>, "comments": <number or null>, "saves": <number or null>, "shares": <number or null>, "topic_guess": "<topic>" }
    ],
    "avg_reach_per_post": <number or null>,
    "best_format": "<reel|carousel|photo or null>"
  },
  "audience": {
    "gender_female_pct": <number 0-100 or null>,
    "gender_male_pct": <number 0-100 or null>,
    "age_13_17_pct": <number or null>,
    "age_18_24_pct": <number or null>,
    "age_25_34_pct": <number or null>,
    "age_35_44_pct": <number or null>,
    "age_45_plus_pct": <number or null>,
    "top_country": "<country or null>",
    "top_city": "<city or null>",
    "peak_days": ["<day>"],
    "peak_hours": ["<HH:00>"]
  }
}
${BASE_RULES}`,

  facebook: `You are analyzing Facebook Page Insights screenshots from a Thai content creator.
Extract ALL visible numbers and data carefully.
Return ONLY a valid JSON object:
{
  "overview": {
    "followers": <number>,
    "page_likes": <number or null>,
    "followers_growth_28d": <number or null>,
    "reach_28d": <number or null>,
    "post_engagement_28d": <number or null>,
    "reach_trend": "<growing|declining|stable>"
  },
  "content": {
    "top_posts": [
      { "rank": 1, "type": "<video|photo|text|link>", "reach": <number>, "engagement": <number or null>, "reactions": <number or null>, "comments": <number or null>, "shares": <number or null>, "topic_guess": "<topic>" }
    ],
    "avg_reach_per_post": <number or null>,
    "best_format": "<video|photo|live or null>"
  },
  "audience": {
    "gender_female_pct": <number 0-100 or null>,
    "gender_male_pct": <number 0-100 or null>,
    "age_13_17_pct": <number or null>,
    "age_18_24_pct": <number or null>,
    "age_25_34_pct": <number or null>,
    "age_35_44_pct": <number or null>,
    "age_45_plus_pct": <number or null>,
    "top_country": "<country or null>",
    "top_city": "<city or null>",
    "peak_days": ["<day>"],
    "peak_hours": ["<HH:00>"]
  }
}
${BASE_RULES}`,

  x: `You are analyzing X (Twitter) Analytics screenshots from a Thai content creator.
Extract ALL visible numbers and data carefully.
Return ONLY a valid JSON object:
{
  "overview": {
    "followers": <number>,
    "followers_growth_28d": <number or null>,
    "impressions_28d": <number or null>,
    "engagements_28d": <number or null>,
    "engagement_rate_pct": <number or null>,
    "profile_visits_28d": <number or null>,
    "impressions_trend": "<growing|declining|stable>"
  },
  "content": {
    "top_tweets": [
      { "rank": 1, "impressions": <number>, "engagements": <number or null>, "likes": <number or null>, "retweets": <number or null>, "topic_guess": "<topic>" }
    ],
    "avg_impressions_per_tweet": <number or null>,
    "best_format": "<text|image|video|thread or null>"
  },
  "audience": {
    "gender_female_pct": <number 0-100 or null>,
    "gender_male_pct": <number 0-100 or null>,
    "top_country": "<country or null>",
    "top_interests": ["<interest>"],
    "peak_days": ["<day>"],
    "peak_hours": ["<HH:00>"]
  }
}
${BASE_RULES}`,

  lemon8: `You are analyzing Lemon8 Creator analytics screenshots from a Thai content creator.
Extract ALL visible numbers and data carefully.
Return ONLY a valid JSON object:
{
  "overview": {
    "followers": <number>,
    "followers_growth_30d": <number or null>,
    "total_views": <number or null>,
    "total_likes": <number or null>,
    "engagement_rate_pct": <number or null>,
    "views_trend": "<growing|declining|stable>"
  },
  "content": {
    "top_posts": [
      { "rank": 1, "views": <number>, "likes": <number or null>, "comments": <number or null>, "saves": <number or null>, "topic_guess": "<topic>" }
    ],
    "avg_views_per_post": <number or null>,
    "best_format": "<photo|video or null>"
  },
  "audience": {
    "gender_female_pct": <number 0-100 or null>,
    "gender_male_pct": <number 0-100 or null>,
    "age_13_17_pct": <number or null>,
    "age_18_24_pct": <number or null>,
    "age_25_34_pct": <number or null>,
    "age_35_44_pct": <number or null>,
    "age_45_plus_pct": <number or null>,
    "top_country": "<country or null>",
    "top_city": "<city or null>",
    "peak_hours": ["<HH:00>"]
  }
}
${BASE_RULES}`,
}

// Fallback for unknown platforms
const DEFAULT_PROMPT = PROMPTS.tiktok

export async function POST(req: NextRequest) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY is not set')
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase env vars missing')

    const formData = await req.formData()
    const userId = formData.get('userId') as string
    const platform = (formData.get('platform') as string) || 'tiktok'
    const files = formData.getAll('screenshots') as File[]

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    if (!files || files.length === 0) return NextResponse.json({ error: 'No screenshots provided' }, { status: 400 })
    if (files.length > 8) return NextResponse.json({ error: 'Maximum 8 screenshots' }, { status: 400 })

    // Convert images to base64
    const imageContents = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
        return {
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: mediaType, data: base64 },
        }
      })
    )

    // Pick prompt for platform
    const prompt = PROMPTS[platform] ?? DEFAULT_PROMPT

    // Call Claude Haiku Vision
    const client = new Anthropic({ apiKey: anthropicKey })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContents,
            { type: 'text', text: prompt },
          ],
        },
      ],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON
    let platformData: Record<string, unknown>
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      platformData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      throw new Error('Failed to parse Claude response as JSON')
    }

    platformData.analyzed_at = new Date().toISOString()
    platformData.screenshot_count = files.length

    // Load existing channel_data to merge (multi-platform support)
    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('channel_data')
      .eq('id', userId)
      .single()

    // Merge: keep existing platforms, add/update current one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingData = (existing?.channel_data ?? {}) as Record<string, any>

    // Handle old flat format (v1) → wrap it under its platform key
    const isOldFormat = existingData.platform && existingData.overview && !existingData.tiktok
    const mergedChannelData = isOldFormat
      ? { [existingData.platform as string]: existingData, [platform]: platformData }
      : { ...existingData, [platform]: platformData }

    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({ channel_data: mergedChannelData })
      .eq('id', userId)

    if (dbError) throw new Error(`DB error: ${dbError.message}`)

    console.log(`[channel/analyze] ✅ ${platform} analyzed (${files.length} screenshots) for user ${userId}`)
    return NextResponse.json({ success: true, platform, data: platformData })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[channel/analyze] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
