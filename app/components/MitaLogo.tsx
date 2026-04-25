'use client'
// ── MITA+ Logo — font-based gradient text ──────────────
// ใช้ Nunito Black (rounded font) + CSS gradient clip
// Usage: <MitaLogo size="lg" /> or <MitaLogo size="sm" />
// size: 'sm' (nav) | 'md' (default) | 'lg' (landing/login)

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function MitaLogo({ size = 'md', className }: Props) {
  const fontSizes: Record<string, string> = {
    sm: '15px',
    md: '21px',
    lg: '34px',
  }

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-nunito), "Nunito", "Varela Round", system-ui, sans-serif',
        fontSize: fontSizes[size],
        fontWeight: 900,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        // Gradient text
        background: 'linear-gradient(135deg, #7B61FF 0%, #9B7FFF 50%, #3ECFFF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        // Layout
        display: 'inline-block',
        flexShrink: 0,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      MITA+
    </span>
  )
}
