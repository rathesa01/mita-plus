'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { RevenueLeak, LeakSeverity } from '@/types'
import { COLORS, CARD, RADIUS } from '@/lib/tokens'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const SEVERITY: Record<LeakSeverity, { label: string; color: string; dot: string }> = {
  critical: { label: 'วิกฤต',   color: '#FF4D4F', dot: '#FF4D4F' },
  high:     { label: 'สูง',     color: '#FF9F1C', dot: '#FF9F1C' },
  medium:   { label: 'ปานกลาง', color: '#FBBF24', dot: '#FBBF24' },
  low:      { label: 'ต่ำ',     color: '#60A5FA', dot: '#60A5FA' },
}

interface LeakCardProps {
  leak: RevenueLeak
  index: number
}

export function LeakCard({ leak, index }: LeakCardProps) {
  const [open, setOpen] = useState(index === 0)
  const sev = SEVERITY[leak.severity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      style={{
        ...CARD.base,
        overflow: 'hidden',
        marginBottom: '8px',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left"
        style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
      >
        {/* Severity dot */}
        <span
          className="shrink-0 mt-1"
          style={{ width: '8px', height: '8px', borderRadius: '50%', background: sev.dot, marginTop: '5px' }}
        />

        {/* Title + pain */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: sev.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {sev.label}
            </span>
          </div>
          <p style={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '14px', marginBottom: '2px' }}>{leak.title}</p>
          <p style={{ fontSize: '12px', color: sev.color }}>{leak.painLine}</p>
        </div>

        {/* Money + chevron */}
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '80px' }}>
          <p style={{ fontWeight: 900, fontSize: '18px', color: COLORS.danger, lineHeight: 1 }}>
            -฿{fmt(leak.missedPerMonth)}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>/เดือน</p>
          <div style={{ marginTop: '6px', color: 'rgba(255,255,255,0.25)' }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p style={{ color: COLORS.textSecondary, fontSize: '13px', lineHeight: 1.65, marginTop: '12px', marginBottom: '12px' }}>
            {leak.explanation}
          </p>
          <div
            style={{
              padding: '12px',
              borderRadius: RADIUS.card,
              background: 'rgba(0,0,0,0.2)',
              border: `1px solid rgba(255,77,79,0.12)`,
            }}
          >
            <p style={{ fontSize: '12px', color: sev.color, lineHeight: 1.6 }}>{leak.shockSentence}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
