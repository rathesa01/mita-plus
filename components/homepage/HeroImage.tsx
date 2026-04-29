'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { COLORS, RADIUS } from '@/lib/design-tokens'

// ── Floating analytics card (light-theme glass) ──────────────────────────────
function FloatCard({
  style,
  children,
}: {
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: RADIUS.md,
        padding: '7px 11px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.9)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        zIndex: 10,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
// Wrapper has position:relative so absolute cards are anchored to the image.
// No overflow:hidden / borderRadius / boxShadow — nothing clips the corners.
export function HeroImage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <Image
        src="/hero-composite.png"
        alt="Creator using MITA+ to track revenue"
        width={1024}
        height={1024}
        priority
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />

      {/* ── Top-left: PROFIT +200% ─── */}
      <FloatCard style={{ top: '13%', left: '-2%', transform: 'rotate(-4deg)' }}>
        <p style={{ fontSize: '8px', color: COLORS.text.tertiary, marginBottom: '3px' }}>PROFIT</p>
        <p style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', letterSpacing: '-0.5px' }}>+200%</p>
      </FloatCard>

      {/* ── Top-right: Reach 89K · Saves 2.4K ─── */}
      <FloatCard style={{ top: '7%', right: '-2%', transform: 'rotate(3deg)' }}>
        <p style={{ fontSize: '8px', color: COLORS.text.tertiary, marginBottom: '3px' }}>@lifestyle_th</p>
        <p style={{ fontSize: '12px', fontWeight: 700, color: COLORS.text.primary }}>
          Reach <span style={{ color: COLORS.brand.coral }}>89K</span>
        </p>
        <p style={{ fontSize: '10px', color: COLORS.text.secondary, marginTop: '3px' }}>Saves 2.4K</p>
      </FloatCard>

      {/* ── Right-middle: SALES +400% ─── */}
      <FloatCard style={{ top: '52%', right: '-3%', transform: 'rotate(3deg)' }}>
        <p style={{ fontSize: '8px', color: COLORS.text.tertiary, marginBottom: '3px' }}>SALES</p>
        <p style={{ fontSize: '17px', fontWeight: 800, color: '#16a34a', letterSpacing: '-0.5px' }}>+400%</p>
      </FloatCard>

      {/* ── Bottom-right: Score 72/100 ─── */}
      <FloatCard style={{ bottom: '10%', right: '0%', transform: 'rotate(2deg)' }}>
        <p style={{ fontSize: '8px', color: COLORS.text.tertiary, marginBottom: '3px' }}>คะแนนทำเงิน</p>
        <p style={{ fontSize: '18px', fontWeight: 800, color: COLORS.brand.coral, letterSpacing: '-0.5px' }}>
          72<span style={{ fontSize: '11px', fontWeight: 500, color: COLORS.text.tertiary }}>/100</span>
        </p>
      </FloatCard>
    </motion.div>
  )
}
