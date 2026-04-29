'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { COLORS } from '@/lib/design-tokens'
import { TagPill } from './TagPill'
import { DisplayHeadline } from './DisplayHeadline'
import { PrimaryButton } from './PrimaryButton'
import { TrustSignals } from './TrustSignals'
import { StatsRow } from './StatsRow'
import { HeroImage } from './HeroImage'

// ── Copy (per spec) ─────────────────────────────────────────────────────────
const HERO_COPY = {
  tag:          'วิเคราะห์รายได้ creator',
  headline:     ['follower กับ view', 'ของคุณ ทำเงินได้', 'เท่าไหร่จริงๆ?'],
  sub:          'กรอกตัวเลขแค่ 3 อย่าง รู้ผลใน 3 นาที',
  primaryCta:   'เริ่มฟรี · 3 นาที →',
  secondaryCta: 'ดูตัวอย่างผล',
}

const STATS = [
  { value: '฿40K+', label: 'ศักยภาพ benchmark/เดือน', countTo: 40, prefix: '฿', suffix: 'K+' },
  { value: '3 นาที', label: 'วิเคราะห์ครบทุกมิติ',      countTo: 3,  prefix: '',  suffix: ' นาที' },
  { value: '100%',   label: 'ฟรี · ไม่ต้องบัตร',        countTo: 100, prefix: '', suffix: '%' },
]

// ── Animation variants ───────────────────────────────────────────────────────
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const item: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ── Component ────────────────────────────────────────────────────────────────
export function HomepageHero() {
  return (
    <section
      style={{
        background: COLORS.bg.primary,
        padding: '0 0 32px',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 32px',
        }}
        className="px-5 lg:px-8"
      >

        {/* ── Desktop: 2-col grid | Mobile: vertical stack ─── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '32px',
            alignItems: 'center',
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
          className="lg:grid-cols-[1.05fr_1fr] lg:pt-[56px] lg:pb-[56px]"
        >

          {/* ── LEFT / TEXT ─── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Tag pill */}
            <motion.div variants={item}>
              <TagPill text={HERO_COPY.tag} />
            </motion.div>

            {/* Headline */}
            <motion.div variants={item}>
              <DisplayHeadline lines={HERO_COPY.headline} />
            </motion.div>

            {/* Sub copy */}
            <motion.p
              variants={item}
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: COLORS.text.secondary,
              }}
            >
              {HERO_COPY.sub}
            </motion.p>

            {/* CTA group */}
            <motion.div
              variants={item}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
            >
              <Link href="/audit" style={{ textDecoration: 'none' }}>
                <PrimaryButton fullWidth={false}>
                  {HERO_COPY.primaryCta}
                </PrimaryButton>
              </Link>
              <Link
                href="/demo"
                style={{
                  fontSize: '13px',
                  color: COLORS.text.secondary,
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                {HERO_COPY.secondaryCta}
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={item}>
              <TrustSignals />
            </motion.div>

          </motion.div>

          {/* ── RIGHT / IMAGE ─── */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroImage />
          </div>
        </div>

        {/* Stats — single row below grid, always visible (no duplicate) */}
        <div style={{ marginTop: '8px' }}>
          <StatsRow stats={STATS} />
        </div>

      </div>
    </section>
  )
}
