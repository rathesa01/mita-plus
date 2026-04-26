'use client'
// ── MITA+ Logo — SVG stroke-based, matches original logo design
// M I T A(with dot) + — horizontal gradient purple→blue-grey
// Usage: <MitaLogo size="lg" /> | size: 'sm' | 'md' | 'lg'

import { useId } from 'react'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// viewBox: 0 0 200 56  (stroke-drawn letters, baseline y=50, top y=10)
const WIDTHS: Record<string, number> = { sm: 108, md: 150, lg: 240 }

export default function MitaLogo({ size = 'md', className }: Props) {
  const uid = useId()
  const gid = `mg${uid.replace(/:/g, '')}`

  const w = WIDTHS[size]
  const h = Math.round((w * 56) / 200)

  return (
    <svg
      viewBox="0 0 200 56"
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MITA+"
      style={{ display: 'inline-block', flexShrink: 0, userSelect: 'none' }}
    >
      <defs>
        {/* Left: purple  →  Right: blue-grey  (matches logo image) */}
        <linearGradient id={gid} x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6E5BA0" />
          <stop offset="100%" stopColor="#7A96B8" />
        </linearGradient>
      </defs>

      <g
        stroke={`url(#${gid})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* ── M ── left post → left diagonal → right diagonal → right post */}
        <polyline points="5,50 5,10 24,32 43,10 43,50" />

        {/* ── I ── single vertical stroke */}
        <line x1="53" y1="10" x2="53" y2="50" />

        {/* ── T ── crossbar + stem */}
        <line x1="63" y1="10" x2="97" y2="10" />
        <line x1="80" y1="10" x2="80" y2="50" />

        {/* ── A ── two legs, NO crossbar */}
        <polyline points="107,50 127,10 147,50" />

        {/* ── + ── horizontal arm + vertical arm */}
        <line x1="158" y1="30" x2="194" y2="30" />
        <line x1="176" y1="15" x2="176" y2="45" />
      </g>

      {/* ── A dot ── filled circle at crossbar position */}
      <circle cx="127" cy="34" r="4" fill={`url(#${gid})`} />
    </svg>
  )
}
