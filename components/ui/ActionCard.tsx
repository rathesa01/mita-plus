'use client'
import { motion } from 'framer-motion'
import type { MonetizationRecommendation } from '@/types'
import { COLORS, CARD, RADIUS } from '@/lib/tokens'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

interface ActionCardProps {
  rec: MonetizationRecommendation
  index: number
}

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  easy:   { label: 'เริ่มง่าย',  color: '#22C55E' },
  medium: { label: 'ปานกลาง',   color: '#FF9F1C' },
  hard:   { label: 'ท้าทาย',    color: '#FF4D4F' },
}

export function ActionCard({ rec, index }: ActionCardProps) {
  const diff = DIFFICULTY_LABEL[rec.difficulty] ?? DIFFICULTY_LABEL.medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      style={{ ...CARD.base, padding: '16px', marginBottom: '8px' }}
    >
      {/* Step + Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        {/* Step number */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(255,159,28,0.12)',
            border: '1px solid rgba(255,159,28,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '14px',
            color: COLORS.ctaOrange,
            shrink: 0,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', color: COLORS.textPrimary }}>{rec.title}</p>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: diff.color,
                padding: '2px 6px',
                borderRadius: '6px',
                background: `${diff.color}15`,
                border: `1px solid ${diff.color}30`,
              }}
            >
              {diff.label}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: 1.55 }}>{rec.rationale}</p>
        </div>

        {/* Revenue range */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '72px' }}>
          <p style={{ fontWeight: 900, fontSize: '16px', color: COLORS.success, lineHeight: 1 }}>
            ฿{fmt(rec.estimatedRevenueLow)}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>–฿{fmt(rec.estimatedRevenueHigh)}/เดือน</p>
        </div>
      </div>

      {/* Example action box */}
      <div
        style={{
          padding: '12px',
          borderRadius: RADIUS.card,
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.14)',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: COLORS.success,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}
        >
          ทำได้เลยตอนนี้
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{rec.exampleAction}</p>
      </div>
    </motion.div>
  )
}
