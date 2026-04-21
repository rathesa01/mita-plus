// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// ── YouTube Analytics: helper fetch ────────────────────────────────────────────
async function ytAnalytics(token: string, metrics: string, dimensions?: string, extra?: string) {
  const today = new Date()
  const end = today.toISOString().slice(0, 10)
  const start = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: start,
    endDate: end,
    metrics,
    ...(dimensions ? { dimensions } : {}),
  })
  if (extra) extra.split('&').forEach(p => { const [k, v] = p.split('='); params.set(k, v) })

  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

async function ytData(token: string, path: string) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mitaplus.com'

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      return NextResponse.redirect(`${origin}/starter/connect?error=google_denied`)
    }
    if (!code || !state) {
      return NextResponse.redirect(`${origin}/starter/connect?error=missing_params`)
    }

    // Decode state
    let userId: string
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
      userId = decoded.userId
    } catch {
      return NextResponse.redirect(`${origin}/starter/connect?error=invalid_state`)
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = (process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
    const redirectUri = `${origin}/api/auth/youtube/callback`

    // Exchange code → tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('Failed to get access token')
    const accessToken = tokens.access_token

    // ── 1. Channel basic info (subscribers, total views) ──
    const channelRes = await ytData(accessToken, 'channels?part=statistics,snippet&mine=true')
    const ch = channelRes?.items?.[0]
    const stats = ch?.statistics ?? {}

    // ── 2. 28-day aggregate metrics ──
    const overviewRes = await ytAnalytics(
      accessToken,
      'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,impressions,impressionClickThroughRate'
    )
    const overviewRow = overviewRes?.rows?.[0] ?? []
    const overviewCols: string[] = overviewRes?.columnHeaders?.map((h: any) => h.name) ?? []
    const ov: Record<string, number> = {}
    overviewCols.forEach((col, i) => { ov[col] = Number(overviewRow[i] ?? 0) })

    // ── 3. Demographics: age + gender ──
    const demoRes = await ytAnalytics(
      accessToken,
      'viewerPercentage',
      'ageGroup,gender'
    )
    const demoRows: [string, string, number][] = demoRes?.rows ?? []

    // Aggregate gender
    let femalePct = 0
    let malePct = 0
    const agePct: Record<string, number> = {}
    demoRows.forEach(([age, gender, pct]) => {
      if (gender === 'female') femalePct += pct
      if (gender === 'male') malePct += pct
      // age format: "age13-17", "age18-24", etc.
      const ageKey = age.replace('age', '').replace('-', '_') // "13_17"
      agePct[ageKey] = (agePct[ageKey] ?? 0) + pct
    })

    // ── 4. Top country ──
    const geoRes = await ytAnalytics(accessToken, 'views', 'country', 'sort=-views&maxResults=1')
    const topCountry = geoRes?.rows?.[0]?.[0] ?? null

    // ── 5. Audience activity (day-of-week + hour) ──
    const activityRes = await ytAnalytics(accessToken, 'views', 'day')
    // Note: YouTube Analytics doesn't expose hour-of-day directly in free tier
    // We'll use null for peak_hours when not available

    // ── 6. Top 5 videos ──
    const searchRes = await ytData(
      accessToken,
      `search?part=id,snippet&channelId=${ch?.id}&order=viewCount&type=video&maxResults=5`
    )
    const videoIds = searchRes?.items?.map((v: any) => v.id?.videoId).filter(Boolean).join(',')
    let topVideos: any[] = []
    if (videoIds) {
      const videosRes = await ytData(accessToken, `videos?part=statistics,snippet&id=${videoIds}`)
      topVideos = (videosRes?.items ?? []).map((v: any, i: number) => ({
        rank: i + 1,
        views: Number(v.statistics?.viewCount ?? 0),
        likes: v.statistics?.likeCount ? Number(v.statistics.likeCount) : null,
        comments: v.statistics?.commentCount ? Number(v.statistics.commentCount) : null,
        shares: null,
        topic_guess: v.snippet?.title?.slice(0, 60) ?? null,
      }))
    }

    // ── 7. Revenue (if monetized) ──
    const revenueRes = await ytAnalytics(accessToken, 'estimatedRevenue,cpm,playbackBasedCpm')
    const revRow = revenueRes?.rows?.[0] ?? []
    const revCols: string[] = revenueRes?.columnHeaders?.map((h: any) => h.name) ?? []
    const rev: Record<string, number> = {}
    revCols.forEach((col, i) => { rev[col] = Number(revRow[i] ?? 0) })

    // ── Build structured data (same schema as screenshot analysis) ──────────
    const platformData = {
      source: 'api',
      analyzed_at: new Date().toISOString(),
      channel_id: ch?.id ?? null,
      channel_name: ch?.snippet?.title ?? null,
      overview: {
        subscribers: Number(stats.subscriberCount ?? 0),
        subscribers_growth_28d: ov.subscribersGained ? Math.round(ov.subscribersGained - (ov.subscribersLost ?? 0)) : null,
        views_28d: ov.views ? Math.round(ov.views) : null,
        watch_time_hours_28d: ov.estimatedMinutesWatched ? Math.round(ov.estimatedMinutesWatched / 60) : null,
        impressions_28d: ov.impressions ? Math.round(ov.impressions) : null,
        ctr_pct: ov.impressionClickThroughRate ? Math.round(ov.impressionClickThroughRate * 10) / 10 : null,
        estimated_revenue_28d_usd: rev.estimatedRevenue > 0 ? Math.round(rev.estimatedRevenue * 100) / 100 : null,
        avg_view_duration_sec: ov.averageViewDuration ? Math.round(ov.averageViewDuration) : null,
        avg_completion_rate_pct: ov.averageViewPercentage ? Math.round(ov.averageViewPercentage * 10) / 10 : null,
        views_trend: 'stable', // would need day-by-day to calc trend
      },
      content: {
        top_videos: topVideos,
        total_videos: Number(stats.videoCount ?? 0),
        avg_views_per_video: stats.videoCount && stats.viewCount
          ? Math.round(Number(stats.viewCount) / Number(stats.videoCount))
          : null,
        best_format: null, // can't determine without Shorts vs Long data
      },
      audience: {
        gender_female_pct: femalePct > 0 ? Math.round(femalePct * 10) / 10 : null,
        gender_male_pct: malePct > 0 ? Math.round(malePct * 10) / 10 : null,
        age_13_17_pct: agePct['13_17'] ? Math.round(agePct['13_17'] * 10) / 10 : null,
        age_18_24_pct: agePct['18_24'] ? Math.round(agePct['18_24'] * 10) / 10 : null,
        age_25_34_pct: agePct['25_34'] ? Math.round(agePct['25_34'] * 10) / 10 : null,
        age_35_44_pct: agePct['35_44'] ? Math.round(agePct['35_44'] * 10) / 10 : null,
        age_45_plus_pct: agePct['45_'] ? Math.round(agePct['45_'] * 10) / 10 : null,
        top_country: topCountry,
        top_city: null,
        peak_days: [],
        peak_hours: [], // YouTube Analytics free tier doesn't expose hourly breakdown
        returning_viewers_pct: null,
      },
      monetization: {
        enabled: rev.estimatedRevenue > 0,
        rpm_usd: rev.playbackBasedCpm > 0 ? Math.round(rev.playbackBasedCpm * 100) / 100 : null,
        cpm_usd: rev.cpm > 0 ? Math.round(rev.cpm * 100) / 100 : null,
      },
    }

    // ── Save to Supabase (merge with existing) ────────────────────────────────
    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('channel_data')
      .eq('id', userId)
      .single()

    const existingData = (existing?.channel_data ?? {}) as Record<string, any>
    // Handle old flat format
    const isOldFormat = existingData.platform && existingData.overview && !existingData.youtube
    const merged = isOldFormat
      ? { [existingData.platform]: existingData, youtube: platformData }
      : { ...existingData, youtube: platformData }

    await supabase.from('user_profiles').update({ channel_data: merged }).eq('id', userId)

    console.log(`[youtube/callback] ✅ Connected YouTube for user ${userId} (${ch?.snippet?.title})`)
    return NextResponse.redirect(`${origin}/starter?connected=youtube`)

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[youtube/callback] error:', msg)
    return NextResponse.redirect(`${origin}/starter/connect?error=${encodeURIComponent(msg)}`)
  }
}
