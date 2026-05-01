import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { buildRevenuePathsSystemPrompt, buildRevenuePathsUserPrompt } from '@/lib/ai/revenuePathsPrompt'
import type { RevenuePathDetail, RevenuePathsCache } from '@/types/revenuePath'

const LOCK_DAYS = 14
const MAX_PATHS = 3

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Supabase env missing')
  return createClient(url, key)
}

// ── Check if cache is still valid (14-day lock) ──────────────────────────────
function isCacheValid(cache: RevenuePathsCache | null): boolean {
  if (!cache?.generated_at) return false
  const generated = new Date(cache.generated_at).getTime()
  const ageMs = Date.now() - generated
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  return ageDays < LOCK_DAYS
}

// ── Fetch cached paths from user_profiles ────────────────────────────────────
async function getCachedPaths(userId: string): Promise<RevenuePathsCache | null> {
  const db = getDb()
  const { data, error } = await db
    .from('user_profiles')
    .select('revenue_paths')
    .eq('id', userId)
    .single()

  if (error || !data?.revenue_paths) return null
  return data.revenue_paths as RevenuePathsCache
}

// ── Fetch latest audit for this user ─────────────────────────────────────────
async function getLatestAudit(userId: string) {
  const db = getDb()

  // Step 1: Resolve user email via Supabase Admin API
  const { data: { user }, error: userErr } = await db.auth.admin.getUserById(userId)
  if (userErr || !user?.email) {
    console.warn('[MITA+] revenue/recommend: cannot fetch user email', userErr?.message)
    return null
  }

  // Step 2: Query latest audit_results by email stored in input JSONB
  const { data: audits, error: auditErr } = await db
    .from('audit_results')
    .select('input, score_total, leaks, ai_insights, createdAt')
    .filter('input->>email', 'eq', user.email)
    .order('createdAt', { ascending: false })
    .limit(1)

  if (auditErr) {
    console.warn('[MITA+] revenue/recommend: audit query failed', auditErr.message)
    return null
  }

  return audits?.[0] ?? null
}

// ── Call Claude Haiku to generate paths ──────────────────────────────────────
async function generatePaths(audit: {
  input: Record<string, unknown>
  score_total: number
  leaks: unknown[]
}): Promise<RevenuePathDetail[]> {
  const client = new Anthropic()

  const formData = {
    platform:           String(audit.input.platform ?? 'tiktok'),
    niche:              String(audit.input.niche ?? 'general'),
    followers:          Number(audit.input.followers ?? 1000),
    contentDescription: String(audit.input.contentDescription ?? ''),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leaks = Array.isArray(audit.leaks) ? (audit.leaks as any[]) : []

  const systemPrompt = buildRevenuePathsSystemPrompt()
  const userPrompt   = buildRevenuePathsUserPrompt(formData, leaks, audit.score_total)

  const response = await client.messages.create({
    model:      'claude-haiku-4-5',
    max_tokens: 4000,
    temperature: 0.7,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userPrompt }],
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''

  // Parse JSON — strip markdown fences if present
  let jsonStr = raw.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  let parsed: { paths?: unknown[] }
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    console.error('[MITA+] revenue/recommend: JSON parse failed', jsonStr.slice(0, 200))
    throw new Error('AI returned invalid JSON')
  }

  if (!Array.isArray(parsed.paths) || parsed.paths.length === 0) {
    throw new Error('AI returned no paths')
  }

  return parsed.paths.slice(0, MAX_PATHS) as RevenuePathDetail[]
}

// ── Save paths to user_profiles ───────────────────────────────────────────────
async function savePaths(userId: string, cache: RevenuePathsCache) {
  const db = getDb()
  await db
    .from('user_profiles')
    .update({ revenue_paths: cache })
    .eq('id', userId)
}

// ── POST /api/revenue/recommend ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth: require userId in body (passed from client-side session)
  let userId: string
  try {
    const body = await req.json()
    userId = body?.userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1'

  try {
    // 1. Check cache
    const cached = await getCachedPaths(userId)
    if (cached && isCacheValid(cached) && !forceRefresh) {
      return NextResponse.json({
        paths:        cached.paths,
        generated_at: cached.generated_at,
        from_cache:   true,
        refresh_count: cached.refresh_count,
      })
    }

    // 2. Fetch audit data
    const audit = await getLatestAudit(userId)
    if (!audit) {
      return NextResponse.json({ error: 'No audit found — complete audit first' }, { status: 404 })
    }

    // 3. Generate via Claude
    const paths = await generatePaths(audit)

    // 4. Save to cache
    const refreshCount = cached ? (cached.refresh_count + 1) : 1
    const newCache: RevenuePathsCache = {
      paths,
      generated_at:  new Date().toISOString(),
      refresh_count: refreshCount,
    }
    await savePaths(userId, newCache)

    return NextResponse.json({
      paths,
      generated_at:  newCache.generated_at,
      from_cache:    false,
      refresh_count: refreshCount,
    })

  } catch (err) {
    console.error('[MITA+] revenue/recommend error:', err)
    return NextResponse.json({ error: 'Failed to generate revenue paths' }, { status: 500 })
  }
}

// ── GET /api/revenue/recommend?userId=xxx ─────────────────────────────────────
// Read-only — returns cache or 404 if no cache yet
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const cached = await getCachedPaths(userId)
    if (!cached) {
      return NextResponse.json({ error: 'No paths cached yet' }, { status: 404 })
    }
    return NextResponse.json({
      paths:         cached.paths,
      generated_at:  cached.generated_at,
      from_cache:    true,
      refresh_count: cached.refresh_count,
    })
  } catch (err) {
    console.error('[MITA+] revenue/recommend GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch paths' }, { status: 500 })
  }
}
