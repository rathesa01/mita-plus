import { NextRequest, NextResponse } from 'next/server'
import { analyzeAudit } from '@/lib/analysis'
import { generateInsights } from '@/lib/ai/generateInsights'
import type { AuditFormData, AuditResult } from '@/types'

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

    return NextResponse.json(result)
  } catch (err) {
    console.error('[MITA+] Analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
