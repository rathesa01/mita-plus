import { NextRequest, NextResponse } from 'next/server'
import { analyzeAudit } from '@/lib/analysis'
import { generateInsights } from '@/lib/ai/generateInsights'
import { AuditFormSchema } from '@/lib/validation/schemas'
import { checkRateLimit } from '@/lib/rateLimit'
import { saveLead } from '@/lib/db/supabase'
import { sendResultEmail } from '@/lib/email'
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

export async function POST(req: NextRequest) {
  // ── 1. Rate limit ─────────────────────────────
  const { allowed, remaining, resetIn } = checkRateLimit(req, 5, 60_000)
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

    // ── 4. AI insights (OpenAI or mock fallback) ──
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

    // ── 5. Persist lead + notify (fire-and-forget) ─
    const gap = analysis.revenueEstimation.totalMissed
    const hasEmail = !!(data.email && data.email.length > 0)

    void Promise.all([
      // Supabase
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

      // Discord notification
      (data.email || data.name) && notifyDiscord([
        `🔍 **Audit Completed**`,
        ``,
        `👤 **ชื่อ:** ${data.name || '(ไม่ระบุ)'}`,
        hasEmail ? `📧 **อีเมล:** ${data.email}` : null,
        `📊 **Score:** ${result.score.total}/100`,
        `💸 **Revenue Gap:** ฿${fmt(gap)}/เดือน`,
        `🎵 **Platform:** ${data.platform}  |  🎯 **Niche:** ${data.niche}`,
        `👥 **Followers:** ${Number(data.followers).toLocaleString('th-TH')}`,
        `⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
      ].filter(Boolean).join('\n')),

      // Result email to user
      hasEmail && sendResultEmail({
        name: data.name,
        email: data.email!,
        score: result.score.total,
        revenueGap: Math.round(gap),
        platform: data.platform,
        niche: data.niche,
      }),
    ].filter(Boolean))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[MITA+] Analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
