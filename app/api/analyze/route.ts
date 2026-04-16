import { NextRequest, NextResponse } from 'next/server'
import { analyzeAudit } from '@/lib/analysis'
import { generateInsights } from '@/lib/ai/generateInsights'
import type { AuditFormData, AuditResult } from '@/types'

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
  } catch { /* ไม่ block main flow */ }
}

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

export async function POST(req: NextRequest) {
  try {
    const data: AuditFormData = await req.json()

    // 1. Run deterministic analysis engine (always fast, no AI needed)
    const analysis = analyzeAudit(data)

    // 2. Generate AI insights (OpenAI if key exists, mock fallback automatically)
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

    // 3. Notify Discord — lead completed audit ────
    if (data.email || data.name) {
      const gap = analysis.revenueEstimation.totalMissed
      const msg = [
        `🔍 **Audit Completed**`,
        ``,
        `👤 **ชื่อ:** ${data.name || '(ไม่ระบุ)'}`,
        data.email ? `📧 **อีเมล:** ${data.email}` : null,
        `📊 **Score:** ${result.score.total}/100`,
        `💸 **Revenue Gap:** ฿${fmt(gap)}/เดือน`,
        `🎵 **Platform:** ${data.platform}  |  🎯 **Niche:** ${data.niche}`,
        `👥 **Followers:** ${Number(data.followers).toLocaleString('th-TH')}`,
        `⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
      ].filter(Boolean).join('\n')
      void notifyDiscord(msg)  // fire-and-forget
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[MITA+] Analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
