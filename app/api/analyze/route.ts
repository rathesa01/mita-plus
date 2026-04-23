import { NextRequest, NextResponse } from 'next/server'
import { analyzeAudit } from '@/lib/analysis'
import { generateInsights } from '@/lib/ai/generateInsights'
import { AuditFormSchema } from '@/lib/validation/schemas'
import { checkRateLimit } from '@/lib/rateLimit'
import { saveLead } from '@/lib/db/supabase'
import { sendResultEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'
import type { AuditResult } from '@/types'

// ── Discord helper ──────────────────────────────
async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  } catch { /* fire-and-forget */ }
}

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Save full result ลง audit_results table ────
async function saveAuditResult(result: AuditResult): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null

  try {
    const db = createClient(url, key)
    const { data, error } = await db
      .from('audit_results')
      .insert({
        id:                  result.id,
        platform:            result.input.platform,
        niche:               result.input.niche,
        followers:           result.input.followers,
        name:                result.input.name,
        score_total:         result.score.total,
        score_breakdown:     result.score.breakdown,
        leaks:               result.leaks,
        revenue_estimation:  result.revenueEstimation,
        ai_insights:         result.aiInsights,
        recommendations:     result.recommendations,
        action_plan:         result.actionPlan,
        pricing:             result.pricing,
        stage:               result.stage,
        input:               result.input,
        consented:           false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[MITA+] saveAuditResult error:', error.message)
      return null
    }
    return data?.id ?? null
  } catch (e) {
    console.error('[MITA+] saveAuditResult unexpected:', e)
    return null
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Rate limit ─────────────────────────────
  const { allowed, resetIn } = checkRateLimit(req, 5, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests — ลองใหม่ในอีก 1 นาทีค่ะ' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // ── 2. Parse + validate input ─────────────────
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = AuditFormSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid form data', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const data = parsed.data

  try {
    // ── 3. Deterministic analysis ─────────────────
    const analysis = analyzeAudit(data)

    // ── 4. AI insights ────────────────────────────
    const aiInsights = await generateInsights(
      data,
      analysis.leaks,
      analysis.revenueEstimation,
      analysis.score,
      analysis.stage,
    )

    const result: AuditResult = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      aiInsights,
      ...analysis,
    }

    // ── 5. Save full result ลง DB (await — ต้องการ id) ──
    await saveAuditResult(result)

    // ── 6. Lead + notify (fire-and-forget) ────────
    const gap = analysis.revenueEstimation.totalMissed
    const hasEmail = !!(data.email && data.email.length > 0)

    void Promise.all([
      saveLead({
        type: 'audit',
        name: data.name,
        email: data.email || undefined,
        platform: data.platform,
        niche: data.niche,
        followers: data.followers,
        score: result.score.total,
        revenue_gap: Math.round(gap),
        report_price: Math.round(analysis.pricing.reportPrice),
        premium_price: Math.round(analysis.pricing.premiumPrice),
      }),

      (data.email || data.name) && notifyDiscord([
        `🔍 **Audit Completed**`,
        ``,
        `👤 **ชื่อ:** ${data.name || '(ไม่ระบุ)'}`,
        hasEmail ? `📧 **อีเมล:** ${data.email}` : null,
        `📊 **Score:** ${result.score.total}/100`,
        `💸 **Revenue Gap:** ฿${fmt(gap)}/เดือน`,
        `🎵 **Platform:** ${data.platform}  |  🎯 **Niche:** ${data.niche}`,
        `👥 **Followers:** ${Number(data.followers).toLocaleString('th-TH')}`,
        `🔗 **Result:** mitaplus.com/r/${result.id}`,
        `⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
      ].filter(Boolean).join('\n')),

      hasEmail && sendResultEmail({
        name: data.name,
        email: data.email!,
        score: result.score.total,
        revenueGap: Math.round(gap),
        platform: data.platform,
        niche: data.niche,
      }),
    ].filter(Boolean))

    // ── 7. Return result พร้อม id ─────────────────
    return NextResponse.json(result)

  } catch (err) {
    console.error('[MITA+] Analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
