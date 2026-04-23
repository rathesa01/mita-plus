import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { data } = await supabase
    .from('audit_results')
    .select('score_total, revenue_estimation, input, stage')
    .eq('id', id)
    .single()

  const score       = data?.score_total ?? 0
  const gap         = Math.round(data?.revenue_estimation?.totalMissed ?? 0)
  const name        = data?.input?.name ?? 'Creator'
  const platform    = data?.input?.platform ?? ''
  const niche       = data?.input?.niche ?? ''
  const stageLabel  = data?.stage?.label ?? ''
  const stageEmoji  = data?.stage?.emoji ?? '📊'

  const scoreColor  = score >= 70 ? '#22C55E' : score >= 45 ? '#FF9F1C' : '#a78bfa'
  const platformMap: Record<string, string> = {
    tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube',
    facebook: 'Facebook', multi: 'Multi-platform',
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          background: 'linear-gradient(135deg, #08080f 0%, #12112a 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif', position: 'relative',
          padding: '60px',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,159,28,0.10) 0%, transparent 70%)',
        }} />

        {/* MITA+ badge */}
        <div style={{
          position: 'absolute', top: '40px', left: '60px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#7B61FF' }}>MITA+</span>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Score Card</span>
        </div>

        {/* Platform + name */}
        <div style={{
          position: 'absolute', top: '44px', right: '60px',
          fontSize: '14px', color: 'rgba(255,255,255,0.35)', display: 'flex', gap: '8px',
        }}>
          <span>{platformMap[platform] ?? platform}</span>
          <span>·</span>
          <span>{niche}</span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '80px', marginBottom: '40px' }}>

          {/* Score circle */}
          <div style={{
            width: '200px', height: '200px', borderRadius: '50%',
            border: `6px solid ${scoreColor}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <span style={{ fontSize: '72px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>จาก 100</span>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>
              {stageEmoji} {stageLabel}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>
              {name}
            </div>

            {/* Revenue gap */}
            <div style={{
              background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)',
              borderRadius: '12px', padding: '16px 24px',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Revenue Gap ต่อเดือน</span>
              <span style={{ fontSize: '36px', fontWeight: 900, color: '#FF4D4F' }}>
                -฿{gap.toLocaleString('th-TH')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.25)',
          borderRadius: '16px', padding: '16px 40px',
          fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span>🚀</span>
          <span>วิเคราะห์ช่องของคุณฟรีที่</span>
          <span style={{ color: '#a78bfa', fontWeight: 900 }}>mitaplus.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
