'use client'
import { motion } from 'framer-motion'
import { COLORS, CARD, GLOW } from '@/lib/tokens'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

interface MoneyHeroProps {
  perMonth: number
  label?: string
  type?: 'loss' | 'gain'
}

export function MoneyHero({ perMonth, label = 'ยังไม่ได้รับต่อเดือน', type = 'loss' }: MoneyHeroProps) {
  const isLoss = type === 'loss'
  const color = isLoss ? COLORS.danger : COLORS.success
  const cardStyle = isLoss ? CARD.danger : CARD.success
  const glow = isLoss ? GLOW.danger : GLOW.green
  const prefix = isLoss ? '-' : '+'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ ...cardStyle, boxShadow: glow, padding: '20px', textAlign: 'center' }}
    >
      <p style={{ color: COLORS.textSecondary, fontSize: '13px', marginBottom: '6px' }}>{label}</p>
      <p
        className="font-black leading-none"
        style={{ fontSize: '40px', color, marginBottom: '4px' }}
      >
        {prefix}฿{fmt(perMonth)}
      </p>
      <p style={{ color: COLORS.textSecondary, fontSize: '13px' }}>
        /เดือน = <span style={{ color, fontWeight: 700 }}>{prefix}฿{fmt(perMonth * 12)}/ปี</span>
      </p>
    </motion.div>
  )
}
