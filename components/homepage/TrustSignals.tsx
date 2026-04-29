import Link from 'next/link'
import { COLORS } from '@/lib/design-tokens'

interface TrustSignalsProps {
  trustText?: string
  loginHref?: string
  loginLabel?: string
  centered?: boolean
}

export function TrustSignals({
  trustText = 'ฟรี · ไม่ต้องสมัคร',
  loginHref = '/login',
  loginLabel = 'มีบัญชีแล้ว? login',
  centered = false,
}: TrustSignalsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: centered ? 'center' : 'flex-start',
      }}
    >
      {/* Green dot + trust text */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: COLORS.text.secondary,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#1D9E75',
            flexShrink: 0,
            boxShadow: '0 0 5px rgba(29,158,117,0.5)',
          }}
        />
        {trustText}
      </span>

      {/* Divider */}
      <span style={{ width: 1, height: 12, background: COLORS.border, flexShrink: 0 }} />

      {/* Login link */}
      <Link
        href={loginHref}
        style={{
          fontSize: '12px',
          color: COLORS.text.secondary,
          textDecoration: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = COLORS.text.primary)}
        onMouseLeave={e => (e.currentTarget.style.color = COLORS.text.secondary)}
      >
        {loginLabel}
      </Link>
    </div>
  )
}
