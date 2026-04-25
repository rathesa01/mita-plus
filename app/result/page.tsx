'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { Sparkles, CheckCircle2, Clock, Phone, ArrowRight, Share2, Copy, Check as CheckIcon, Lock } from 'lucide-react'
import type { AuditResult } from '@/types'

import { COLORS, CARD, RADIUS, GLOW, SPACE } from '@/lib/tokens'
import MitaLogo from '@/app/components/MitaLogo'
import { CTAButton }      from '@/components/ui/CTAButton'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { SectionLabel }   from '@/components/ui/SectionLabel'
import { MoneyHero }      from '@/components/ui/MoneyHero'
import { LeakCard }       from '@/components/ui/LeakCard'
import { ActionCard }     from '@/components/ui/ActionCard'

// ── Utilities ─────────────────────────────────
function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Animated Number ────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '', style = {} }: {
  target: number; prefix?: string; suffix?: string; style?: React.CSSProperties
}) {
  const [display, setDisplay] = useState(0)
  const hasRun = useRef(false)
  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    const ctrl = animate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [target])
  return <span style={style}>{prefix}{Math.round(display).toLocaleString('th-TH')}{suffix}</span>
}

// ── Score Arc ──────────────────────────────────
function ScoreArc({ score }: { score: number }) {
  const r = 44; const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? COLORS.success : score >= 45 ? COLORS.ctaOrange : COLORS.accentPurple
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
      <motion.circle
        cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <text x="54" y="50" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">{score}</text>
      <text x="54" y="66" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">จาก 100</text>
    </svg>
  )
}

// ── Upgrade Gate ───────────────────────────────
function UpgradeGate({ lockedCount, lockedLossTotal, variant = 'leaks' }: {
  lockedCount: number
  lockedLossTotal: number
  variant?: 'leaks' | 'plan'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: 'linear-gradient(135deg, rgba(123,97,255,0.10), rgba(255,159,28,0.08))',
        border: '1px solid rgba(123,97,255,0.30)',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
        marginTop: '8px',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'rgba(123,97,255,0.15)',
        border: '1px solid rgba(123,97,255,0.30)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        <Lock size={16} style={{ color: '#a78bfa' }} />
      </div>

      {variant === 'leaks' ? (
        <>
          <p style={{ fontWeight: 900, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
            อีก {lockedCount} Revenue Blocker ที่ยังปิดไม่ได้
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', marginBottom: '4px' }}>
            กำลังเสีย{' '}
            <span style={{ color: '#FF4D4F', fontWeight: 700 }}>
              -฿{Math.round(lockedLossTotal).toLocaleString('th-TH')}/เดือน
            </span>
            {' '}เพิ่มเติมอยู่
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)', marginBottom: '16px' }}>
            = -฿{Math.round(lockedLossTotal * 12).toLocaleString('th-TH')}/ปี
          </p>
        </>
      ) : (
        <>
          <p style={{ fontWeight: 900, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
            แผน 30 วัน + วิธีแก้ทุกจุด
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', marginBottom: '16px' }}>
            ปลดล็อกแผนทำงานจริงพร้อมตัวเลข เริ่มได้เลยวันนี้
          </p>
        </>
      )}

      {/* Primary CTA → contact form (ไม่ต้องตั้ง LINE OA ก็ใช้ได้) */}
      <a
        href="/pricing"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          height: '48px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
          color: '#fff',
          fontWeight: 900, fontSize: '14px',
          textDecoration: 'none',
          marginBottom: '10px',
        }}
      >
        ⭐ ปลดล็อก Starter ฿199/เดือน
      </a>

      <a
        href="/pricing"
        style={{
          display: 'block',
          fontSize: '12px', color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none',
        }}
      >
        ดูรายละเอียดแผนทั้งหมด →
      </a>
    </motion.div>
  )
}

// ── Locked Leak Card ───────────────────────────
// Shows blocker name + severity, but blurs the financial amount
function LockedLeakCard({ leak, index }: {
  leak: { id: string; severity: string; title: string; missedPerMonth: number }
  index: number
}) {
  const severityMeta: Record<string, { label: string; color: string }> = {
    critical: { label: '🔴 Critical', color: '#FF4D4F' },
    high:     { label: '🟠 High',     color: '#FF9F1C' },
    medium:   { label: '🟣 Medium',   color: '#a78bfa' },
    low:      { label: '⚪ Low',      color: 'rgba(255,255,255,0.3)' },
  }
  const { label: sevLabel, color: sevColor } = severityMeta[leak.severity] ?? severityMeta.medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${sevColor}55`,
        borderRadius: '12px',
        padding: '12px 14px',
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      {/* Left: severity + name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          color: sevColor, background: `${sevColor}18`,
          padding: '2px 8px', borderRadius: '99px',
          display: 'inline-block', marginBottom: '6px',
        }}>
          {sevLabel}
        </span>
        <p style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.3 }}>
          {leak.title}
        </p>
      </div>

      {/* Right: blurred amount + lock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <p style={{
          fontWeight: 900, fontSize: '15px', color: '#FF4D4F',
          filter: 'blur(5px)', userSelect: 'none',
        }}>
          -฿{Math.round(leak.missedPerMonth).toLocaleString('th-TH')}
        </p>
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: 'rgba(123,97,255,0.10)',
          border: '1px solid rgba(123,97,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Lock size={11} style={{ color: '#a78bfa' }} />
        </div>
      </div>
    </motion.div>
  )
}

// ── High Earner Redirect ───────────────────────
function HighEarnerRedirect({ income, score, name }: { income: number; score: number; name: string }) {
  // insight ที่เหมาะกับระดับ score
  const insights =
    score >= 70
      ? [
          'ระบบของคุณครบมากแล้ว — โอกาสใหญ่ต่อไปคือ Delegation ให้ทีมช่วย scale แทนการทำทุกอย่างคนเดียว',
          'Creator ที่รายได้ระดับนี้มักติดเพดานเพราะ "ทำคนเดียวไม่ไหว" ไม่ใช่เพราะไม่รู้ — ลอง outsource content editing ก่อนเป็นขั้นแรก',
        ]
      : score >= 50
      ? [
          'Score ของคุณดีมาก แต่ยังมีช่องว่างด้านระบบ — ลองเพิ่ม email list หรือ LINE OA เพื่อ own audience โดยไม่พึ่ง algorithm',
          'รายได้ระดับนี้มักโตได้เร็วกว่าด้วย Recurring revenue เช่น membership หรือ retainer sponsorship แทน one-off deal',
        ]
      : [
          'รายได้ดีแล้ว แต่ฐานระบบยังขาดบางจุด — ลอง audit ว่า traffic ส่วนไหนแปลงเป็นเงินได้มากที่สุด แล้ว double down ตรงนั้น',
          'Creator ที่รายได้เกิน 50K มักเสียโอกาสเพราะไม่มี funnel รับ audience เก่า — ทำแค่ lead magnet ง่ายๆ ก็ช่วยได้มาก',
        ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '0 16px 24px', maxWidth: '420px', margin: '0 auto' }}
    >
      {/* Celebration card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,159,28,0.06))',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: '20px',
        padding: '24px 20px',
        textAlign: 'center',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
        <p style={{ fontWeight: 900, fontSize: '19px', color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>
          {name} ทำมาได้ดีมากเลย!
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '16px' }}>
          รายได้ <span style={{ color: '#22C55E', fontWeight: 700 }}>฿{Math.round(income).toLocaleString('th-TH')}/เดือน</span>{' '}
          คือระดับที่ creator ส่วนใหญ่ใฝ่ฝันถึง — คุณทำมันได้แล้ว
        </p>
        {/* Score badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '99px', padding: '6px 16px', fontSize: '13px',
          color: '#22C55E', fontWeight: 700,
        }}>
          Score {score}/100 — ดีกว่า creator มือใหม่ส่วนใหญ่
        </div>
      </div>

      {/* Honest note */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
      }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
          หมายเหตุจาก MITA+
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
          MITA+ ออกแบบมาสำหรับ creator ที่เพิ่งเริ่มต้น — ผลวิเคราะห์ด้านล่างอาจไม่ตรงกับระดับที่คุณอยู่
          แต่เราอยากให้กำลังใจและแชร์สิ่งที่อาจเป็นประโยชน์ในฐานะที่เรารู้
        </p>
      </div>

      {/* Actual useful insights */}
      <div style={{
        background: 'rgba(123,97,255,0.05)',
        border: '1px solid rgba(123,97,255,0.18)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Sparkles size={12} style={{ color: '#a78bfa' }} />
          <p style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            สิ่งที่น่าคิดต่อสำหรับคุณ
          </p>
        </div>
        {insights.map((txt, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < insights.length - 1 ? '12px' : 0, alignItems: 'flex-start' }}>
            <span style={{
              background: 'rgba(123,97,255,0.15)', color: '#a78bfa',
              width: '20px', height: '20px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 900, flexShrink: 0, marginTop: '1px',
            }}>{i + 1}</span>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65 }}>{txt}</p>
          </div>
        ))}
      </div>

      {/* Encouragement + audit link */}
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', textAlign: 'center', lineHeight: 1.6, marginBottom: '12px' }}>
        ทำต่อไปนะ — สิ่งที่คุณทำอยู่มันใช่แล้ว 💪
      </p>
      <a
        href="/audit"
        style={{
          display: 'block', textAlign: 'center',
          fontSize: '13px', color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none',
        }}
      >
        ← แก้ไขคำตอบ
      </a>
    </motion.div>
  )
}

// ── AI Block ───────────────────────────────────
function AIBlock({ text }: { text: string }) {
  return (
    <div style={{
      background: 'rgba(123,97,255,0.06)',
      border: '1px solid rgba(123,97,255,0.18)',
      borderRadius: '14px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      {/* AI badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Sparkles size={11} style={{ color: '#a78bfa' }} />
        <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          MITA+ วิเคราะห์เฉพาะคุณ
        </span>
      </div>
      {/* render newlines properly */}
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </div>
  )
}

// ── Step Card ──────────────────────────────────
function StepCard({ step, index }: { step: { day: string; time: string; title: string; detail: string; earn: string | null }; index: number }) {
  const colors = ['#7B61FF', '#FF9F1C', '#22C55E']
  const color = colors[index % colors.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '14px',
        padding: '14px 16px',
        marginBottom: '10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{
          background: `${color}22`, color, fontSize: '11px', fontWeight: 900,
          padding: '3px 10px', borderRadius: '99px', whiteSpace: 'nowrap',
        }}>
          {step.day}
        </span>
        <span style={{
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)',
          fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', whiteSpace: 'nowrap',
        }}>
          ⏱ {step.time}
        </span>
        {step.earn && (
          <span style={{
            marginLeft: 'auto', color: '#22C55E', fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap',
          }}>
            {step.earn}
          </span>
        )}
      </div>

      {/* Title */}
      <p style={{ fontWeight: 800, fontSize: '14px', color: '#fff', marginBottom: '6px' }}>
        {step.title}
      </p>

      {/* Detail */}
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
        {step.detail}
      </p>
    </motion.div>
  )
}

// ── Phase Card ─────────────────────────────────
function PhaseCard({ label, items, color, accent }: {
  label: string
  items: Array<{ action: string; example: string; expectedOutcome: string; revenueImpact: number }>
  color: string
  accent: string
}) {
  const total = items.reduce((s, i) => s + i.revenueImpact, 0)
  return (
    <div style={{ ...CARD.base, marginBottom: '8px', overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }} />
          <p style={{ fontWeight: 900, fontSize: '14px', color }}>{label}</p>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 700, color: COLORS.success }}>+฿{fmt(total)}/เดือน</p>
      </div>
      <div style={{ padding: '12px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ ...CARD.base, padding: '12px', marginBottom: i < items.length - 1 ? '8px' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={13} style={{ color, flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: COLORS.textPrimary }}>{item.action}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{item.expectedOutcome}</p>
              </div>
              <p style={{ fontWeight: 900, fontSize: '13px', color, flexShrink: 0 }}>+฿{fmt(item.revenueImpact)}</p>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', borderLeft: `2px solid rgba(255,255,255,0.08)` }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{item.example}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Share Section ──────────────────────────────
function ShareSection({ score, revenueGap, name, resultId }: { score: number; revenueGap: number; name: string; resultId?: string }) {
  const [copied, setCopied] = useState(false)
  const url = resultId ? `https://mitaplus.com/r/${resultId}` : 'https://mitaplus.com'
  const gap = Math.round(revenueGap).toLocaleString('th-TH')

  const shareText = `Monetization Score ของฉัน: ${score}/100 🎯\nRevenue Gap: -฿${gap}/เดือน 💸\n\nลองเช็กของคุณที่ mitaplus.com`
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + url)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <SectionWrapper>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Share2 size={18} style={{ color: COLORS.accentPurple, marginBottom: '8px' }} />
        <p style={{ fontWeight: 900, fontSize: '16px', color: COLORS.textPrimary, marginBottom: '4px' }}>
          แชร์ผลให้เพื่อน Creator
        </p>
        <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
          ชวนเพื่อนมาเช็ก Revenue Gap ของตัวเองด้วย
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* LINE */}
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            height: '50px', borderRadius: RADIUS.button,
            background: 'rgba(6,199,85,0.10)', border: '1px solid rgba(6,199,85,0.25)',
            color: '#06C755', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          แชร์ใน LINE
        </a>

        {/* Twitter/X */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            height: '50px', borderRadius: RADIUS.button,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
            color: COLORS.textPrimary, fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          }}
        >
          <span style={{ fontWeight: 900, fontSize: '15px' }}>𝕏</span>
          แชร์บน X / Twitter
        </a>

        {/* Copy link */}
        <button
          onClick={copyLink}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            height: '44px', borderRadius: RADIUS.button,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
            color: COLORS.textSecondary, fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}
        >
          {copied
            ? <><CheckIcon size={14} style={{ color: COLORS.success }} /> คัดลอกแล้ว!</>
            : <><Copy size={14} /> คัดลอกลิงก์</>
          }
        </button>
      </div>
    </SectionWrapper>
  )
}

// ── Main Page ──────────────────────────────────
interface LineUser { id: string; lineUserId: string; displayName: string; pictureUrl: string | null }

function ResultPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultId = searchParams.get('id')

  const [result, setResult]           = useState<AuditResult | null>(null)
  const [showSticky, setShowSticky]   = useState(false)
  const [showScore, setShowScore]     = useState(false)
  const [lineUser, setLineUser]       = useState<LineUser | null>(null)
  const [lineLoading, setLineLoading] = useState(true)

  // เช็ค LINE session
  useEffect(() => {
    fetch('/api/auth/line/session')
      .then(r => r.json())
      .then(({ user }) => setLineUser(user))
      .finally(() => setLineLoading(false))
  }, [])

  // โหลด result: DB (ถ้ามี id) → sessionStorage fallback
  useEffect(() => {
    const loadResult = async () => {
      // ── A. โหลดจาก DB ด้วย id ────────────────
      if (resultId) {
        try {
          const res = await fetch(`/api/results/${resultId}`)
          if (res.ok) {
            const data = await res.json()
            setResult(data)
            // sync sessionStorage ด้วยเผื่อ refresh
            sessionStorage.setItem('mita_result', JSON.stringify(data))
            return
          }
        } catch { /* fallthrough to sessionStorage */ }
      }

      // ── B. Fallback: sessionStorage ──────────
      const raw = sessionStorage.getItem('mita_result')
      if (!raw) { router.push('/audit'); return }
      setResult(JSON.parse(raw))
    }

    loadResult()
  }, [resultId, router])

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 450)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!result) return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: COLORS.textSecondary, fontSize: '14px' }}>กำลังโหลด...</p>
    </div>
  )

  const { stage, score, leaks, revenueEstimation, recommendations, actionPlan, aiInsights, pricing, input } = result
  const totalLeakPerMonth = leaks.reduce((s, l) => s + l.missedPerMonth, 0)
  const dailyLoss         = Math.round(totalLeakPerMonth / 30)

  // High earner = รายได้จริงเกิน realistic estimate ของ model
  const isHighEarner = revenueEstimation.currentIncome >= revenueEstimation.realistic

  // displayTarget: สำหรับ high earner ใช้ max(aggressive, currentIncome*1.3) เพื่อแสดง growth potential ที่ไม่ negative
  const displayTarget = isHighEarner
    ? Math.max(revenueEstimation.aggressive, Math.round(revenueEstimation.currentIncome * 1.3))
    : revenueEstimation.realistic

  // displayGap: ไม่ negative เสมอ ใช้ totalMissed เป็น floor
  const displayGap = Math.max(
    displayTarget - revenueEstimation.currentIncome,
    revenueEstimation.totalMissed,
  )

  // revenueGap: ใช้ displayGap สำหรับ high earner, ใช้ totalMissed สำหรับคนทั่วไป (เพื่อ clamp negative)
  const revenueGap = isHighEarner
    ? displayGap
    : Math.max(revenueEstimation.realistic - revenueEstimation.currentIncome, revenueEstimation.totalMissed)

  // displayLeakTotal: ถ้าไม่มี leak (ครบทุกระบบ) ใช้ totalMissed แทน
  const displayLeakTotal = totalLeakPerMonth > 500 ? totalLeakPerMonth : revenueEstimation.totalMissed

  const scrollToUpgrade = () => document.getElementById('upgrade')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <main style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.textPrimary, paddingBottom: '80px' }}>

      {/* ── NAV ─────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${COLORS.bg}ee`,
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '420px',
        margin: '0 auto',
      }}>
        <MitaLogo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>
            <Sparkles size={10} style={{ display: 'inline', color: COLORS.accentPurple, marginRight: '4px' }} />
            {input.name}
          </span>
          <button
            onClick={scrollToUpgrade}
            style={{
              background: COLORS.ctaOrange,
              color: '#000',
              fontSize: '12px',
              fontWeight: 900,
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ดูแผน
          </button>
        </div>
      </nav>

      {/* ── HERO: Score + Stage ───────────────── */}
      <SectionWrapper noPadTop>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ paddingTop: SPACE.lg, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
            <ScoreArc score={score.total} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Monetization Score
              </p>
              <p style={{ fontWeight: 900, fontSize: '28px', lineHeight: 1 }}>
                {score.total}<span style={{ fontWeight: 400, fontSize: '14px', color: COLORS.textSecondary }}>/100</span>
              </p>
              <p style={{ fontSize: '13px', color: COLORS.textSecondary, marginTop: '4px' }}>{stage.emoji} {stage.label}</p>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, lineHeight: 1.6, maxWidth: '320px', margin: '0 auto 16px' }}>
            {stage.shockLine}
          </p>

          {/* Daily loss pill */}
          {isHighEarner ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,159,28,0.10)',
              border: '1px solid rgba(255,159,28,0.25)',
              borderRadius: '99px',
              padding: '8px 18px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF9F1C', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                ยังเติบโตได้อีก{' '}
                <span style={{ color: '#FF9F1C', fontWeight: 900 }}>฿{fmt(Math.max(Math.round(displayGap / 30), 1))}</span>
                {' '}ต่อวัน
              </span>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,77,79,0.10)',
              border: '1px solid rgba(255,77,79,0.25)',
              borderRadius: '99px',
              padding: '8px 18px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF4D4F', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                วันนี้คุณพลาดรายได้ไปแล้ว{' '}
                <span style={{ color: '#FF4D4F', fontWeight: 900 }}>฿{fmt(dailyLoss)}</span>
              </span>
            </div>
          )}
        </motion.div>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          HIGH EARNER GATE
          ถ้า currentIncome ≥ ฿50k → หยุดแสดงผล
          แสดง redirect card แทน
      ══════════════════════════════════════ */}
      {revenueEstimation.currentIncome >= 50_000 && (
        <HighEarnerRedirect
          income={revenueEstimation.currentIncome}
          score={score.total}
          name={input.name}
        />
      )}

      {/* ══════════════════════════════════════
          LINE LOGIN GATE + MAIN CONTENT
          แสดงเฉพาะ creator ที่ยังไม่ถึง ฿50k
      ══════════════════════════════════════ */}
      {revenueEstimation.currentIncome < 50_000 && <>

      {/* ══════════════════════════════════════
          LINE LOGIN GATE
          แสดง Hero Score ก่อน → ติด hook แล้ว
          ถ้ายังไม่ login → แสดงปุ่ม LINE
      ══════════════════════════════════════ */}
      {!lineLoading && !lineUser && (
        <div className="relative mx-auto max-w-[420px] px-4 pb-8">
          {/* teaser blur — ดูผลคร่าวๆ ก่อน */}
          <div className="pointer-events-none select-none filter blur-sm opacity-30 max-h-40 overflow-hidden">
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '8px' }}>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>① รายได้ที่หลุดมือทุกวัน</p>
              <p style={{ color: '#FF4D4F', fontWeight: 900, fontSize: '28px' }}>-฿{fmt(totalLeakPerMonth)}/เดือน</p>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>② Revenue Blocker</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>พบ {leaks.length} จุดที่ทำให้คุณเสียเงิน</p>
            </div>
          </div>

          {/* Gate Card */}
          <div className="mt-4 bg-white rounded-2xl shadow-2xl p-6 text-center border border-gray-100">
            <div className="w-14 h-14 bg-[#06C755] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>
            <h3 className="text-gray-900 font-black text-lg mb-1">ดูผลวิเคราะห์ฟรีทั้งหมด</h3>
            <p className="text-gray-500 text-sm mb-5">
              Login ด้วย LINE เพื่อดูผลการวินิจฉัยแบบเต็ม<br/>
              ฟรี 100% ไม่มีค่าใช้จ่าย
            </p>
            <a
              href={`/api/auth/line?redirect=${encodeURIComponent(resultId ? `/result?id=${resultId}` : '/result')}`}
              className="flex items-center justify-center gap-3 w-full bg-[#06C755] hover:bg-[#05b34d] text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              เข้าสู่ระบบด้วย LINE
            </a>
            <p className="text-xs text-gray-400 mt-3">เราเก็บเฉพาะชื่อและรูปโปรไฟล์ LINE เท่านั้น</p>
          </div>
        </div>
      )}

      {/* เนื้อหาหลัก — แสดงเมื่อ login แล้วเท่านั้น */}
      {(lineLoading || lineUser) && <>

      {/* ══════════════════════════════════════
          ① เงินที่เสีย
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="①" label="รายได้ที่หลุดมือทุกวัน" />
        <MoneyHero
          perMonth={displayLeakTotal}
          label="รายได้ที่คุณเพิ่มได้ ถ้าทำตามแผนนี้"
          type="gain"
        />

        {/* Progress: current vs potential */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>
              ปัจจุบัน ฿{fmt(revenueEstimation.currentIncome)}/เดือน
            </span>
            <span style={{ fontSize: '12px', color: COLORS.success, fontWeight: 700 }}>
              {isHighEarner ? 'ศักยภาพสูงสุด' : 'เป้าหมาย'} ฿{fmt(displayTarget)}/เดือน
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(to right, #7B61FF, #FF9F1C)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((revenueEstimation.currentIncome / Math.max(displayTarget, 1)) * 100, 95)}%` }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </div>
          {isHighEarner ? (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>
              รายได้คุณดีแล้ว — แต่ยังโตได้อีก {Math.round((displayGap / Math.max(revenueEstimation.currentIncome, 1)) * 100)}% ถ้าวางระบบให้ถูกต้อง
            </p>
          ) : (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>
              ยังมีโอกาสเพิ่มรายได้อีก {Math.max(Math.round((revenueGap / Math.max(displayTarget, 1)) * 100), 5)}% จากที่มีอยู่
            </p>
          )}
        </div>

        {/* Risk warning สำหรับ high earner */}
        {isHighEarner && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: '12px', padding: '14px 16px',
              background: 'rgba(255,159,28,0.06)',
              border: '1px solid rgba(255,159,28,0.20)',
              borderRadius: RADIUS.card,
            }}
          >
            <p style={{ fontSize: '13px', color: '#FF9F1C', fontWeight: 700, marginBottom: '6px' }}>
              ⚠️ รายได้คุณดี แต่มีความเสี่ยงที่คนมองข้าม
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.65, margin: 0 }}>
              รายได้ส่วนใหญ่มาจากแหล่งเดียว — ถ้า platform เปลี่ยน algorithm วันพรุ่งนี้ รายได้จะหายทันที
              MITA+ จะช่วยกระจายรายได้ออกเป็นหลายช่องทาง ให้ปลอดภัยและโตต่อได้ค่ะ
            </p>
          </motion.div>
        )}

        {/* AI Shock */}
        <div style={{ marginTop: '16px' }}>
          <AIBlock text={aiInsights.shock} />
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          ② สาเหตุ
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="②" label="ทำไมถึงยังไม่มีเงิน?" />
        <AIBlock text={aiInsights.whyItHappens} />
        <div style={{ marginTop: '8px' }}>
          {/* Leak 1 — free, fully visible */}
          {leaks[0] && <LeakCard leak={leaks[0]} index={0} />}

          {/* Leaks 2+ — show names & severity, blur amounts, gate */}
          {leaks.length > 1 && (() => {
            const lockedLeaks = leaks.slice(1)
            const lockedTotal = lockedLeaks.reduce((s, l) => s + l.missedPerMonth, 0)
            return (
              <>
                {/* Show all locked blockers: name visible, amount blurred */}
                {lockedLeaks.map((leak, i) => (
                  <LockedLeakCard key={leak.id} leak={leak} index={i} />
                ))}
                <UpgradeGate lockedCount={lockedLeaks.length} lockedLossTotal={lockedTotal} variant="leaks" />
              </>
            )
          })()}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          ③ วิธีแก้
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="③" label="ทำอะไรก่อนได้เงินเร็วที่สุด" />

        {/* Summary */}
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', marginBottom: '14px', lineHeight: 1.6 }}>
          {aiInsights.topActions}
        </p>

        {/* Step cards — show if Claude returned structured steps */}
        {aiInsights.actionSteps && aiInsights.actionSteps.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            {aiInsights.actionSteps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        )}

        <div style={{ marginTop: '8px' }}>
          {/* Rec 1 — free */}
          {recommendations[0] && <ActionCard key={recommendations[0].type} rec={recommendations[0]} index={0} />}

          {/* Recs 2+ — 1 blurred ghost → gate */}
          {recommendations.length > 1 && (() => {
            const locked = recommendations.slice(1)
            return (
              <>
                {recommendations[1] && (
                  <div style={{ position: 'relative', overflow: 'hidden', maxHeight: '80px', marginTop: '8px' }}>
                    <div style={{ filter: 'blur(4px)', opacity: 0.55, pointerEvents: 'none', userSelect: 'none' }}>
                      <ActionCard rec={recommendations[1]} index={1} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, #08080f)' }} />
                  </div>
                )}
                <UpgradeGate lockedCount={locked.length} lockedLossTotal={0} variant="plan" />
              </>
            )
          })()}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          ④ โอกาส
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="④" label="ถ้าแก้แล้วจะได้เท่าไหร่?" />

        {/* Revenue gap hero */}
        <MoneyHero perMonth={revenueGap} label="รายได้ที่ควรได้เพิ่มต่อเดือน" type="gain" />

        {/* Income Breakdown */}
        <div style={{ marginTop: '16px', marginBottom: '4px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            รายได้แยกตามช่องทาง
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                label: '💼 Sponsorship',
                sub: 'แบรนด์จ่ายค่าโพสต์',
                value: revenueEstimation.breakdown.sponsorship,
                color: COLORS.accentPurple,
                note: revenueEstimation.breakdown.sponsorship === 0 ? 'ต้องการ 3K+ followers' : undefined,
              },
              {
                label: '🔗 Affiliate / สินค้า',
                sub: 'ค่าคอม + ขายของตัวเอง',
                value: revenueEstimation.breakdown.affiliate,
                color: COLORS.ctaOrange,
              },
              {
                label: '▶️ Platform Ads',
                sub: input.platform === 'tiktok' ? 'TikTok ไม่มี Creator Fund ในไทย' : 'ค่า Ads จาก platform',
                value: revenueEstimation.breakdown.platformAds,
                color: COLORS.accentBlue,
                note: input.platform === 'tiktok' ? '฿0 — ต้อง monetize ผ่าน sponsorship แทน' : undefined,
              },
            ].map(item => (
              <div key={item.label} style={{
                ...CARD.base,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: COLORS.textPrimary }}>{item.label}</p>
                  <p style={{ fontSize: '11px', color: item.note ? COLORS.danger : COLORS.textSecondary, marginTop: '2px' }}>
                    {item.note ?? item.sub}
                  </p>
                </div>
                <p style={{ fontWeight: 900, fontSize: '18px', color: item.value > 0 ? item.color : 'rgba(255,255,255,0.2)' }}>
                  {item.value > 0 ? `฿${fmt(item.value)}` : '฿0'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 tiers stacked */}
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'ขั้นต่ำ',   sub: 'ทำแค่ขั้นต่ำ',    value: revenueEstimation.conservative, color: COLORS.accentBlue },
            { label: 'เป้าหมาย', sub: 'วางระบบถูกต้อง', value: revenueEstimation.realistic,    color: COLORS.ctaOrange, highlight: true },
            { label: 'สูงสุด',    sub: 'ทำเต็มศักยภาพ', value: revenueEstimation.aggressive,   color: COLORS.success },
          ].map((t) => (
            <div
              key={t.label}
              style={{
                ...CARD.base,
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                ...(t.highlight ? { border: `1px solid rgba(255,159,28,0.30)`, boxShadow: `0 0 16px rgba(255,159,28,0.08)` } : {}),
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: '14px', color: COLORS.textPrimary }}>{t.label}</p>
                <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>{t.sub}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 900, fontSize: '22px', color: t.color }}>฿{fmt(t.value)}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>/เดือน</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Upside */}
        <div style={{ marginTop: '12px' }}>
          <AIBlock text={aiInsights.upside} />
        </div>

        {/* Score breakdown — collapsible */}
        <button
          onClick={() => setShowScore(s => !s)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: RADIUS.card,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            color: COLORS.textSecondary,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {showScore ? 'ซ่อน' : 'ดู'} Score Breakdown
        </button>
        <AnimatePresence>
          {showScore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: '8px', ...CARD.base, padding: '16px' }}
            >
              {[
                { label: '👥 ขนาดและคุณภาพผู้ติดตาม',  val: score.breakdown.reach,        max: 25 },
                { label: '💰 ระบบทำรายได้',             val: score.breakdown.monetization,  max: 25 },
                { label: '🔄 ระบบดักลูกค้า',            val: score.breakdown.funnel,        max: 25 },
                { label: '🤝 ระบบปิดการขาย',            val: score.breakdown.conversion,    max: 15 },
                { label: '📦 สินค้า/บริการ',            val: score.breakdown.product,       max: 10 },
              ].map((item) => {
                const pct = (item.val / item.max) * 100
                const barColor = pct >= 75 ? COLORS.success : pct >= 50 ? COLORS.ctaOrange : COLORS.accentPurple
                return (
                  <div key={item.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{item.val}/{item.max}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: '99px', background: barColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          ⑤ แผน 30 วัน — gated for free
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="⑤" label="แผน 30 วัน" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Clock size={14} style={{ color: COLORS.accentPurple }} />
          <p style={{ fontSize: '13px', color: COLORS.textSecondary }}>ดึง Revenue Gap กลับมาทีละขั้น</p>
        </div>
        {/* Blurred day30 ghost fading into gate */}
        <div style={{ position: 'relative', overflow: 'hidden', maxHeight: '110px' }}>
          <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.55 }}>
            <PhaseCard label="30 วันแรก" items={actionPlan.day30} color={COLORS.ctaOrange} accent="#FF9F1C" />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', background: 'linear-gradient(transparent, #08080f)' }} />
        </div>
        <UpgradeGate lockedCount={3} lockedLossTotal={revenueGap} variant="plan" />
      </SectionWrapper>

      {/* ══════════════════════════════════════
          SHARE
      ══════════════════════════════════════ */}
      <ShareSection score={score.total} revenueGap={revenueGap} name={input.name} resultId={result.id} />

      {/* ══════════════════════════════════════
          CTA / UPGRADE
      ══════════════════════════════════════ */}
      <SectionWrapper id="upgrade">
        {/* 7-day badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.20)',
          borderRadius: '20px',
          padding: '6px 14px',
          marginBottom: '20px',
          fontSize: '12px',
          fontWeight: 600,
          color: COLORS.success,
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.success, animation: 'pulse 2s infinite' }} />
          Creator ที่วางระบบแล้วเริ่มเห็นเงินใน 7 วัน
        </div>

        <h2 style={{ fontWeight: 900, fontSize: '26px', lineHeight: 1.2, marginBottom: '8px' }}>
          ดึง <span style={{ color: COLORS.ctaOrange }}>฿{fmt(revenueGap)}</span> กลับมา
        </h2>
        <p style={{ fontSize: '13px', color: COLORS.textSecondary, marginBottom: '4px' }}>{pricing.valueProposition}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '24px' }}>
          ฿{fmt(revenueGap)}/เดือน = <span style={{ color: COLORS.danger }}>฿{fmt(revenueGap * 12)}/ปี</span> ที่ยังรออยู่
        </p>

        {/* ── Starter — featured ───────────────── */}
        <div style={{
          ...CARD.orange,
          padding: '20px',
          marginBottom: '12px',
          position: 'relative',
          overflow: 'visible',
          boxShadow: GLOW.orange,
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0', background: 'linear-gradient(to right, #7B61FF, #FF9F1C)' }} />
          {/* Badge */}
          <div style={{
            position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg,#7B61FF,#FF9F1C)', color: '#fff',
            fontSize: '11px', fontWeight: 900, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
          }}>
            ⭐ แนะนำ · เริ่มเห็นเงินใน 7 วัน
          </div>

          <p style={{ fontSize: '11px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', marginTop: '6px' }}>Starter</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
            <p style={{ fontWeight: 900, fontSize: '34px', color: COLORS.textPrimary, lineHeight: 1 }}>฿199</p>
            <p style={{ fontSize: '13px', color: COLORS.textSecondary, marginBottom: '4px' }}>/เดือน</p>
          </div>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary, marginBottom: '16px' }}>ยกเลิกได้ทุกเดือน · ไม่มีสัญญา</p>

          {['Revenue Blocker ทั้งหมด (2–5 ตัว)', 'วิธีแก้ทุกจุด พร้อม action ชัดเจน', 'แผน 30 วัน แบบเต็ม', 'รายงานรายเดือน (ส่งทาง LINE)', 'Milestone unlock ตาม progress'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={12} style={{ color: '#a78bfa', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{f}</p>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
            <CTAButton label="สมัคร Starter — ฿199/เดือน" variant="primary" href="/pricing" />
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '10px' }}>
            ฿199 vs เสีย ฿{fmt(dailyLoss)} ทุกวัน — คุ้มมากค่ะ
          </p>
        </div>

        {/* ── Pro ────────────────────────────────── */}
        <div style={{ ...CARD.base, padding: '20px', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: COLORS.ctaOrange, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>👑 Pro</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
            <p style={{ fontWeight: 900, fontSize: '34px', color: COLORS.textPrimary, lineHeight: 1 }}>฿499</p>
            <p style={{ fontSize: '13px', color: COLORS.textSecondary, marginBottom: '4px' }}>/เดือน</p>
          </div>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary, marginBottom: '16px' }}>ทีมช่วยวางระบบ + Priority Support</p>
          {['ทุกอย่างใน Starter +', 'แผน 30 วัน ปรับใหม่ทุกเดือน', 'Priority LINE Support ตลอดเดือน', 'Strategy Call 1 ครั้ง/เดือน', 'Template Funnel + Script ปิดการขาย'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={12} style={{ color: COLORS.ctaOrange, flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: COLORS.textSecondary }}>{f}</p>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
            <CTAButton label="สมัคร Pro — ฿499/เดือน" variant="secondary" href="/pricing" />
          </div>
        </div>

        {/* ── Compare link ─────────────────────── */}
        <a href="/pricing" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none', padding: '12px',
        }}>
          เปรียบเทียบแผนทั้งหมด →
        </a>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.18)', marginTop: '4px' }}>
          ทุก ฿{fmt(dailyLoss)} ที่ไม่ได้รับ คือ gap ที่ยังปิดไม่ได้
        </p>
      </SectionWrapper>

      {/* ── Sticky bottom CTA (mobile) ─────────── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              padding: '12px 16px 20px',
              background: `${COLORS.bg}f0`,
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              zIndex: 50,
            }}
            className="sm:hidden safe-bottom"
          >
            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              <CTAButton label="สมัคร Starter ฿199/เดือน" href="/pricing" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{
        textAlign: 'center', padding: '24px 16px 48px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: '11px', color: 'rgba(255,255,255,0.18)',
        display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><MitaLogo size="sm" /><span style={{ opacity: 0.4 }}>— Money In The Air</span></span>
        <a href="/privacy" style={{ color: 'rgba(255,255,255,0.22)', textDecoration: 'none' }}>Privacy Policy</a>
      </footer>

      {/* ปิด block เนื้อหาหลัก (LINE Login Gate) */}
      </>}

      {/* ปิด block High Earner Gate (<50k) */}
      </>}

    </main>
  )
}

// ── Default export — Suspense wrapper ────────
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#08080f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>กำลังโหลด...</p>
      </div>
    }>
      <ResultPageInner />
    </Suspense>
  )
}
