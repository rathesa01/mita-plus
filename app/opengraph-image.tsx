import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MITA+ — Creator ควรได้เงินเท่าไหร่?'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0B0B0F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '200px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,159,28,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            MITA+
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.3)',
              paddingLeft: '12px',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Money In The Air
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '800px',
          }}
        >
          Creator ควรได้เงิน
          <br />
          <span style={{ color: '#FF9F1C' }}>เท่าไหร่จริงๆ?</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '56px',
            maxWidth: '640px',
            lineHeight: 1.5,
          }}
        >
          วิเคราะห์ Revenue Gap จาก Audience ที่มีอยู่แล้ว
          — ฟรี · ผลออกใน 3 นาที
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { value: '฿40K+', label: 'เงินที่เสียต่อเดือน' },
            { value: '7 วัน', label: 'เริ่มเห็นเงิน' },
            { value: 'ฟรี', label: '100% ไม่มีค่าใช้จ่าย' },
          ].map((s) => (
            <div
              key={s.value}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FF9F1C', marginBottom: '4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.2)',
            fontWeight: 600,
          }}
        >
          mitaplus.com
        </div>
      </div>
    ),
    { ...size },
  )
}
