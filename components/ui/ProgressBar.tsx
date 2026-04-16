'use client'
import { motion } from 'framer-motion'
import { COLORS, RADIUS } from '@/lib/tokens'

interface ProgressBarProps {
  value: number          // 0–100
  height?: number        // px, default 6
  showLabel?: boolean
  color?: 'orange' | 'purple' | 'green' | 'gradient'
}

const COLOR_MAP = {
  orange:   COLORS.ctaOrange,
  purple:   COLORS.accentPurple,
  green:    COLORS.success,
  gradient: `linear-gradient(to right, ${COLORS.accentPurple}, ${COLORS.ctaOrange})`,
}

export function ProgressBar({ value, height = 6, showLabel = false, color = 'gradient' }: ProgressBarProps) {
  const bg = COLOR_MAP[color]
  const isGradient = color === 'gradient'

  return (
    <div>
      <div
        style={{
          height: `${height}px`,
          borderRadius: RADIUS.button,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: RADIUS.button,
            background: bg,
            ...(isGradient ? {} : {}),
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {showLabel && (
        <p style={{ fontSize: '12px', color: COLORS.accentPurple, fontWeight: 700, marginTop: '4px', textAlign: 'right' }}>
          {Math.round(value)}%
        </p>
      )}
    </div>
  )
}
