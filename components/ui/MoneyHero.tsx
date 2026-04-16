'use client'
import { motion } from 'framer-motion'
import { COLORS, CARD, GLOW } from '@/lib/tokens'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

interface MoneyHeroProps {
  perMonth: number
  label?: string
  type?: 'loss' | 'gain'
}

export function MoneyHero({ perMonth, label = 'รายได้ที่คุณเพิ่มได้ทันที', type = 'gain' }: MoneyHeroProps) {
  // Always show as positive/opportunity framing
  const color = '#a78bfa'
  const glow = GLOW.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(255,159,28,0.05))',
        border: '1px solid rgba(123,97,255,0.25)',
        borderRadius: '16px',
        boxShadow: '0 0 32px rgba(123,97,255,0.12)',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '6px' }}>{label}</p>
      <p
        className="font-black leading-none"
        style={{ fontSize: '40px', color, marginBottom: '4px' }}
      >
        +฿{fmt(perMonth)}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '13px' }}>
        /เดือน = <span style={{ color, fontWeight: 700 }}>+฿{fmt(perMonth * 12)}/ปี</span>
      </p>
    </motion.div>
  )
}
