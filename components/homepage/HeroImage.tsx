'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

// Wrapper intentionally has no overflow:hidden / borderRadius / boxShadow
// so the floating analytics cards at image corners are never clipped.
export function HeroImage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      style={{
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
    </motion.div>
  )
}
