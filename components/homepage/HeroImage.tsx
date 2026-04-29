'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { RADIUS, SHADOW } from '@/lib/design-tokens'

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
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        boxShadow: SHADOW.float,
      }}
    >
      <Image
        src="/hero-composite.png"
        alt="Creator using MITA+ to track revenue"
        width={600}
        height={600}
        priority
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </motion.div>
  )
}
