import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('audit_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Map DB columns → AuditResult shape ที่ frontend ใช้
  const result = {
    id:                data.id,
    createdAt:         data.created_at,
    score:             { total: data.score_total, breakdown: data.score_breakdown },
    leaks:             data.leaks,
    revenueEstimation: data.revenue_estimation,
    aiInsights:        data.ai_insights,
    recommendations:   data.recommendations,
    actionPlan:        data.action_plan,
    pricing:           data.pricing,
    stage:             data.stage,
    input:             data.input,
    lineUserId:        data.line_user_id,
  }

  return NextResponse.json(result, {
    headers: {
      // cache 5 นาที — ผล audit ไม่เปลี่ยน
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
