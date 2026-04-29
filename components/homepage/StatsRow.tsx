'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { COLORS, TYPOGRAPHY } from '@/lib/design-tokens'

interface Stat {
  value: string    // display string e.g. '฿40K+'
  label: string
  countTo: number
  prefix?: string
  suffix?: string
}

interface StatsRowProps {
  stats: Stat[]
}

function CountUp({
  countTo,
  prefix = '',
  suffix = '',
  duration = 1.2,
}: {
  countTo: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(countTo * eased))
      if (progress < 1) requestAnimationFrame(step)
      else setCurrent(countTo)
    }

    requestAnimationFrame(step)
  }, [isInView, countTo, duration])

  return (
    <span ref={ref}>
      {prefix}{current}{suffix}
    </span>
  )
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        paddingTop: '24px',
        borderTop: `1px solid ${COLORS.border}`,
      }}
    >
      {stats.map((stat, i) => {
        const isCenter = i > 0 && i < stats.length - 1
        return (
          <div
            key={stat.value}
            style={{
              textAlign: 'center',
              padding: '0 16px',
              borderLeft: isCenter ? `1px solid ${COLORS.border}` : undefined,
              borderRight: isCenter ? `1px solid ${COLORS.border}` : undefined,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: TYPOGRAPHY.statNumber.size,
                fontWeight: TYPOGRAPHY.statNumber.weight,
                letterSpacing: TYPOGRAPHY.statNumber.letterSpacing,
                color: COLORS.text.primary,
                fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
              }}
            >
              <CountUp
                countTo={stat.countTo}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </p>
            <p
              style={{
                margin: '3px 0 0',
                fontSize: TYPOGRAPHY.statLabel.size,
                fontWeight: TYPOGRAPHY.statLabel.weight,
                color: COLORS.text.secondary,
                lineHeight: 1.4,
              }}
            >
              {stat.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
