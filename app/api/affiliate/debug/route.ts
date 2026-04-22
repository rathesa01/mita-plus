/**
 * GET /api/affiliate/debug
 *
 * Diagnostic endpoint — tests Involve Asia API connection and shows:
 * 1. Auth token status
 * 2. Available offers and feed URLs from /offers/all
 * 3. Which INVOLVE_FEED_* env vars are set
 * 4. Sample product download from first available feed
 *
 * Usage: curl http://localhost:3001/api/affiliate/debug
 * Or: visit in browser (GET request)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOffers } from '@/lib/involveAsia'

export const dynamic = 'force-dynamic'

// Internal: test auth token (re-implements the POST since getAuthToken is not exported)
async function testAuth(apiKey: string, apiSecret: string) {
  try {
    const res = await fetch('https://api.involve.asia/publisher/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret }),
      cache: 'no-store',
    })
    const text = await res.text()
    let json: any = {}
    try { json = JSON.parse(text) } catch { /* ignore */ }
    return {
      status: res.status,
      ok: res.ok,
      response: json,
      raw: text.slice(0, 500),
    }
  } catch (err) {
    return { status: 0, ok: false, error: String(err) }
  }
}

// Test downloading a feed URL
async function testFeedDownload(url: string, token?: string) {
  try {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    let res: Response
    try {
      res = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' })
    } finally {
      clearTimeout(timer)
    }

    const text = await res.text()
    return {
      status: res.status,
      ok: res.ok,
      content_type: res.headers.get('content-type'),
      bytes: text.length,
      preview: text.slice(0, 300),
    }
  } catch (err) {
    return { status: 0, ok: false, error: String(err) }
  }
}

export async function GET(req: NextRequest) {
  const apiKey    = process.env.INVOLVE_ASIA_API_KEY    ?? ''
  const apiSecret = process.env.INVOLVE_ASIA_API_SECRET ?? ''

  const report: Record<string, any> = {
    timestamp: new Date().toISOString(),
    credentials: {
      api_key:    apiKey    ? `${apiKey.slice(0, 8)}...` : '❌ not set',
      api_secret: apiSecret ? `${apiSecret.slice(0, 12)}...` : '❌ not set',
    },
  }

  // ── 1. Test Authentication ───────────────────────────────────
  report.auth = await testAuth(apiKey, apiSecret)

  // ── 2. Check INVOLVE_FEED_* env vars ────────────────────────
  const feedEnvVars = [
    'INVOLVE_FEED_BANGGOOD', 'INVOLVE_FEED_SEPHORA', 'INVOLVE_FEED_LOTUS',
    'INVOLVE_FEED_HOMEPRO', 'INVOLVE_FEED_XIAOMI', 'INVOLVE_FEED_STUDIO7',
    'INVOLVE_FEED_SHEIN', 'INVOLVE_FEED_B2S', 'INVOLVE_FEED_TRIP',
    'INVOLVE_FEED_CHOW', 'INVOLVE_FEED_LAZADA',
  ]
  report.feed_env_vars = {}
  const setFeedUrls: Array<{ key: string; url: string }> = []
  for (const envKey of feedEnvVars) {
    const val = process.env[envKey]
    report.feed_env_vars[envKey] = val ? `✅ ${val.slice(0, 60)}...` : '❌ not set'
    if (val) setFeedUrls.push({ key: envKey, url: val })
  }

  report.feed_urls_set = setFeedUrls.length

  // ── 3. Try /offers/all to discover feed URLs ─────────────────
  if (apiKey && apiSecret) {
    try {
      const offers = await getOffers(apiKey, apiSecret)
      report.offers = {
        count: offers.length,
        items: offers.map(o => ({
          id: o.id,
          name: o.name,
          merchant: o.merchant_name,
          data_feed_url: o.data_feed_url ?? '❌ none in API response',
          commission_rate: o.commission_rate,
        })),
      }
    } catch (err) {
      report.offers = { error: String(err) }
    }
  }

  // ── 4. Test first available feed URL ─────────────────────────
  const token = report.auth?.ok ? report.auth?.response?.data?.token : undefined

  if (setFeedUrls.length > 0) {
    report.feed_sample = {}
    // Test first 2 feed URLs
    for (const { key, url } of setFeedUrls.slice(0, 2)) {
      report.feed_sample[key] = await testFeedDownload(url, token)
    }
  } else {
    report.feed_sample = '⚠️ No INVOLVE_FEED_* env vars set — cannot test feed download'
  }

  // ── 5. Instructions ──────────────────────────────────────────
  report.instructions = [
    '1. ถ้า auth.ok = false → API key/secret ผิด หรือยังไม่ approved',
    '2. ถ้า auth.ok = true แต่ offers ว่าง → ยังไม่ได้ join campaign หรือ status ไม่ active',
    '3. ถ้า auth.ok = true แต่ไม่มี data_feed_url → ไป dashboard กด campaign ที่มี ✅ ฟีดข้อมูล แล้วหา Feed URL/Download Guide',
    '4. เอา feed URL มาใส่ใน .env.local เช่น INVOLVE_FEED_SEPHORA=https://...',
    '5. จากนั้น products จะ load จาก data feed จริงได้เลยค่ะ',
    '',
    'ตัวอย่าง .env.local:',
    'INVOLVE_FEED_BANGGOOD=https://datafeed.involve.asia/publisher/xxxxx/banggood/feed.csv',
    'INVOLVE_FEED_SEPHORA=https://datafeed.involve.asia/publisher/xxxxx/sephora/feed.csv',
  ]

  return NextResponse.json(report, { status: 200 })
}
