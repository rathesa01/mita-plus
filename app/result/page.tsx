'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { Sparkles, CheckCircle2, Clock, Phone, ArrowRight, Share2, Copy, Check as CheckIcon, Lock } from 'lucide-react'
import type { AuditResult } from '@/types'

import { COLORS, CARD, RADIUS, GLOW, SPACE } from '@/lib/tokens'
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
            แผน 90 วัน + วิธีแก้ทุกจุด
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', marginBottom: '16px' }}>
            ปลดล็อกแผนทำงานจริงพร้อมตัวเลข เริ่มได้เลยวันนี้
          </p>
        </>
      )}

      {/* Primary CTA → contact form (ไม่ต้องตั้ง LINE OA ก็ใช้ได้) */}
      <a
        href="/contact?plan=starter"
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

// ── AI Block ───────────────────────────────────
function AIBlock({ text, accent = COLORS.textSecondary }: { text: string; accent?: string }) {
  return (
    <div style={{ ...CARD.base, padding: '16px', marginBottom: '12px' }}>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, lineHeight: 1.7 }}>{text}</p>
    </div>
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
function ShareSection({ score, revenueGap, name }: { score: number; revenueGap: number; name: string }) {
  const [copied, setCopied] = useState(false)
  const url = 'https://www.mitaplus.com'
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
export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<AuditResult | null>(null)
  const [showSticky, setShowSticky] = useState(false)
  const [showScore, setShowScore] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('mita_result')
    if (!raw) { router.push('/audit'); return }
    setResult(JSON.parse(raw))
  }, [router])

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
  const revenueGap        = revenueEstimation.realistic - revenueEstimation.currentIncome
  const dailyLoss         = Math.round(totalLeakPerMonth / 30)

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
        <span className="gradient-purple-blue font-black text-lg">MITA+</span>
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
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, lineHeight: 1.6, maxWidth: '320px', margin: '0 auto' }}>
            {stage.shockLine}
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          ① เงินที่เสีย
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="①" label="เงินที่เสีย" />
        <MoneyHero perMonth={totalLeakPerMonth} type="loss" />

        {/* Progress: current vs potential */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>
              ปัจจุบัน ฿{fmt(revenueEstimation.currentIncome)}/เดือน
            </span>
            <span style={{ fontSize: '12px', color: COLORS.success, fontWeight: 700 }}>
              ควรได้ ฿{fmt(revenueEstimation.realistic)}/เดือน
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(to right, ${COLORS.danger}, ${COLORS.ctaOrange})` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((revenueEstimation.currentIncome / Math.max(revenueEstimation.realistic, 1)) * 100, 100)}%` }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>
            คุณดึงรายได้ได้ {Math.round((revenueEstimation.currentIncome / Math.max(revenueEstimation.realistic, 1)) * 100)}% ของที่ควรได้
          </p>
        </div>

        {/* AI Shock */}
        <div style={{ marginTop: '16px' }}>
          <AIBlock text={aiInsights.shock} />
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════
          ② สาเหตุ
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="②" label="สาเหตุ" />
        <AIBlock text={aiInsights.whyItHappens} />
        <div style={{ marginTop: '8px' }}>
          {/* Leak 1 — free, fully visible */}
          {leaks[0] && <LeakCard leak={leaks[0]} index={0} />}

          {/* Leaks 2+ — 1 blurred ghost → fade → gate */}
          {leaks.length > 1 && (() => {
            const lockedLeaks = leaks.slice(1)
            const lockedTotal = lockedLeaks.reduce((s, l) => s + l.missedPerMonth, 0)
            return (
              <>
                {/* One blurred ghost fading out */}
                {leaks[1] && (
                  <div style={{ position: 'relative', overflow: 'hidden', maxHeight: '90px', marginTop: '8px' }}>
                    <div style={{ filter: 'blur(4px)', opacity: 0.55, pointerEvents: 'none', userSelect: 'none' }}>
                      <LeakCard leak={leaks[1]} index={1} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '64px', background: 'linear-gradient(transparent, #08080f)' }} />
                  </div>
                )}
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
        <SectionLabel n="③" label="วิธีแก้" />
        <AIBlock text={aiInsights.topActions} />
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
        <SectionLabel n="④" label="โอกาส" />

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
                { label: 'Reach & Audience',    val: score.breakdown.reach,        max: 25 },
                { label: 'Monetization Setup',  val: score.breakdown.monetization,  max: 25 },
                { label: 'Funnel & System',     val: score.breakdown.funnel,        max: 25 },
                { label: 'Closing & Affiliate', val: score.breakdown.conversion,    max: 15 },
                { label: 'Product Quality',     val: score.breakdown.product,       max: 10 },
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
          ⑤ แผน 90 วัน — gated for free
      ══════════════════════════════════════ */}
      <SectionWrapper>
        <SectionLabel n="⑤" label="แผน 90 วัน" />
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
      <ShareSection score={score.total} revenueGap={revenueGap} name={input.name} />

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

          {['Revenue Blocker ทั้งหมด (2–5 ตัว)', 'วิธีแก้ทุกจุด พร้อม action ชัดเจน', 'แผน 90 วัน แบบเต็ม', 'รายงานรายเดือน (ส่งทาง LINE)', 'Milestone unlock ตาม progress'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={12} style={{ color: '#a78bfa', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{f}</p>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
            <CTAButton label="สมัคร Starter — ฿199/เดือน" variant="primary" href="/contact?plan=starter" />
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
            <CTAButton label="สมัคร Pro — ฿499/เดือน" variant="secondary" href="/contact?plan=pro" />
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
              <CTAButton label="สมัคร Starter ฿199/เดือน" href="/contact?plan=starter" />
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
        <span><span className="gradient-purple-blue font-black">MITA+</span> — Money In The Air</span>
        <a href="/privacy" style={{ color: 'rgba(255,255,255,0.22)', textDecoration: 'none' }}>Privacy Policy</a>
      </footer>
    </main>
  )
}
