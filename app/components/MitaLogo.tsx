'use client'
// ── MITA+ Logo — matches new brand identity ────────────
// Usage: <MitaLogo size="lg" /> or <MitaLogo size="sm" />
// size: 'sm' (nav) | 'md' (default) | 'lg' (landing/login)

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function MitaLogo({ size = 'md', className }: Props) {
  const scales = { sm: 0.72, md: 1, lg: 1.6 }
  const s = scales[size]
  const w = Math.round(100 * s)
  const h = Math.round(32 * s)

  const gradId = `mita-grad-${size}`

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <defs>
        {/* gradientUnits="userSpaceOnUse" — x1/x2 ใช้พิกัด viewBox จริง
            ทำให้ทุก stroke ได้สีตามตำแหน่งจริงใน SVG ไม่ว่าจะตั้งหรือนอน */}
        <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#7B61FF" />
          <stop offset="55%"  stopColor="#9B7FFF" />
          <stop offset="100%" stopColor="#3ECFFF" />
        </linearGradient>
      </defs>

      {/* M */}
      <path d="M3 26V6l7 10 7-10v20" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* I */}
      <line x1="25" y1="6" x2="25" y2="26" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round"/>

      {/* T */}
      <line x1="32" y1="6" x2="46" y2="6" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="39" y1="6" x2="39" y2="26" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round"/>

      {/* A — with dot decoration */}
      <path d="M50 26L57 6l7 20" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="52" y1="18" x2="62" y2="18" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round"/>
      {/* Decorative dot under A crossbar */}
      <circle cx="57" cy="22" r="1.8" fill={`url(#${gradId})`} opacity="0.7"/>

      {/* + */}
      <line x1="73" y1="11" x2="73" y2="21" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="68" y1="16" x2="78" y2="16" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round"/>

      {/* Subtle glow circle behind + */}
      <circle cx="73" cy="16" r="7" fill="#7B61FF" opacity="0.08"/>
    </svg>
  )
}
