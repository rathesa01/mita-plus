'use client'

// ── P-009-adapt · ResultPageV2 from Lovable.dev → adapted for MITA+ Next.js ──
// Source: Lovable.dev "Mita AI Studio" 2026-04-29 · adapted by มะนาว Claude Code
// Changes vs Lovable original:
//   - Added 'use client' directive
//   - Import: @/types/result → @/types (Leak→RevenueLeak, + ShareChannel added)
//   - PhaseCard: ActionStep[] → ActionItem[] (MITA+ uses action/example/revenueImpact)
//   - outer wrapper: data-theme="light" + inline style cream override
//   - globals.css: --coral/--coral-bg/--coral-text/--brand-purple/--success added
//   - React.ReactNode: imported directly from react

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Sparkles,
  Lock,
  TrendingDown,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Mail,
  AlertTriangle,
  AlertCircle,
  Info,
  Circle,
  Target,
  Zap,
  Crown,
  ShieldCheck,
} from 'lucide-react'
import type {
  AuditResult,
  RevenueLeak,
  LeakSeverity,
  ShareChannel,
  ActionItem,
} from '@/types'

const HIGH_EARNER_THRESHOLD = 50000
const FREE_REVEAL_PERCENT = 30

interface ResultPageV2Props {
  result: AuditResult
  isLoggedIn: boolean
  onLineLogin: () => void
  onEmailLogin: () => void
  onShare: (channel: ShareChannel) => void
  onUpgrade?: () => void
}

/* ───────────────── Helpers ───────────────── */

function formatTHB(n: number): string {
  return new Intl.NumberFormat('th-TH').format(Math.round(n))
}

function useCountUp(target: number, durationMs = 1200, start = true): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs, start])
  return val
}

function scoreColor(score: number): { fg: string; bg: string; label: string } {
  if (score >= 70) return { fg: 'var(--success)', bg: 'color-mix(in oklab, var(--success) 14%, transparent)', label: 'ดี' }
  if (score >= 45) return { fg: 'oklch(0.72 0.15 70)', bg: 'oklch(0.95 0.05 80)', label: 'พอใช้' }
  return { fg: 'var(--coral)', bg: 'var(--coral-bg)', label: 'ต้องปรับ' }
}

const SEVERITY_META: Record<LeakSeverity, { dot: string; label: string; Icon: typeof AlertTriangle; bg: string }> = {
  critical: { dot: '🔴', label: 'Critical', Icon: AlertTriangle, bg: 'oklch(0.95 0.05 30)' },
  high:     { dot: '🟠', label: 'High',     Icon: AlertCircle,  bg: 'oklch(0.95 0.05 60)' },
  medium:   { dot: '🟣', label: 'Medium',   Icon: Info,         bg: 'oklch(0.95 0.04 290)' },
  low:      { dot: '⚪', label: 'Low',      Icon: Circle,       bg: 'oklch(0.96 0 0)' },
}

/* ───────────────── Sections ───────────────── */

function StickyTopNav({ name, score, onUpgrade }: { name: string; score: number; onUpgrade: () => void }) {
  return (
    <div className='sticky top-0 z-40 border-b border-black/5 bg-[#FFFAF5]/85 backdrop-blur-md'>
      <div className='mx-auto flex max-w-3xl items-center justify-between px-5 py-3'>
        <div className='text-[15px] font-semibold tracking-tight'>
          MITA<span className='text-[var(--brand-purple)]'>+</span>
        </div>
        <div className='hidden items-center gap-2 text-xs text-muted-foreground sm:flex'>
          <span className='font-medium text-foreground'>{name}</span>
          <span className='rounded-full bg-foreground/5 px-2 py-0.5 font-mono'>{score}/100</span>
        </div>
        <button
          onClick={onUpgrade}
          className='rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90'
        >
          ดูแพ็คเกจ
        </button>
      </div>
    </div>
  )
}

function ScoreArc({ score }: { score: number }) {
  const animated = useCountUp(score, 1500)
  const c = scoreColor(score)
  const radius = 90
  const circ = Math.PI * radius
  const offset = circ - (animated / 100) * circ
  return (
    <div className='relative mx-auto w-[240px]'>
      <svg viewBox='0 0 220 130' className='w-full'>
        <path
          d={`M 20 110 A ${radius} ${radius} 0 0 1 200 110`}
          fill='none'
          stroke='currentColor'
          strokeWidth='14'
          strokeLinecap='round'
          className='text-foreground/8'
        />
        <path
          d={`M 20 110 A ${radius} ${radius} 0 0 1 200 110`}
          fill='none'
          stroke={c.fg}
          strokeWidth='14'
          strokeLinecap='round'
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-end pb-2'>
        <div className='text-5xl font-semibold tracking-tight tabular-nums' style={{ color: c.fg }}>
          {Math.round(animated)}
        </div>
        <div className='text-xs uppercase tracking-wide text-muted-foreground'>Monetization Score</div>
      </div>
    </div>
  )
}

function HeroSection({ result }: { result: AuditResult }) {
  const dailyLoss = Math.round(result.revenueEstimation.totalMissed / 30)
  return (
    <section className='px-5 pb-8 pt-10 sm:pt-14'>
      <div className='mx-auto max-w-3xl text-center'>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-sm text-muted-foreground'
        >
          {result.input.name}, ช่องคุณตอนนี้อยู่ระดับ
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mt-2 text-[28px] font-semibold tracking-tight sm:text-[34px]'
        >
          <span className='mr-2'>{result.stage.emoji}</span>
          {result.stage.label}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='mt-8'
        >
          <ScoreArc score={result.score.total} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--coral-bg)] px-4 py-2 text-sm font-medium text-[var(--coral-text)]'
        >
          <TrendingDown className='h-4 w-4' />
          วันละ ฿{formatTHB(dailyLoss)} หาย
        </motion.div>
      </div>
    </section>
  )
}

function RevealSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

function ShockCard({ shock, totalMissed }: { shock: string; totalMissed: number }) {
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <div className='rounded-2xl border border-black/[0.06] bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'>
          <div className='flex items-start gap-3'>
            <div className='rounded-xl bg-[var(--coral-bg)] p-2 text-[var(--coral)]'>
              <Sparkles className='h-5 w-5' />
            </div>
            <div className='flex-1'>
              <p className='text-[15px] leading-relaxed text-foreground'>{shock}</p>
              <p className='mt-3 text-sm text-muted-foreground'>
                คุณกำลังเสีย <span className='font-semibold text-[var(--coral)]'>฿{formatTHB(totalMissed)}</span> ทุกเดือน — ที่นี่คือจุดที่หาย ↓
              </p>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}

function LeakCard({ leak, dimmed = false }: { leak: RevenueLeak; dimmed?: boolean }) {
  const meta = SEVERITY_META[leak.severity]
  const Icon = meta.Icon
  return (
    <div
      className={[
        'rounded-2xl border border-black/[0.06] bg-card p-5 transition-all',
        dimmed ? 'opacity-90' : '',
      ].join(' ')}
    >
      <div className='flex items-start gap-3'>
        <div className='rounded-lg p-2' style={{ background: meta.bg }}>
          <Icon className='h-4 w-4 text-foreground' />
        </div>
        <div className='flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide'>
              {meta.dot} {meta.label}
            </span>
          </div>
          <h3 className='mt-2 text-[16px] font-semibold tracking-tight'>{leak.title}</h3>
          <p className='mt-1 text-sm text-muted-foreground'>{leak.painLine}</p>
          {!dimmed && leak.explanation && (
            <p className='mt-3 text-sm leading-relaxed text-foreground/80'>{leak.explanation}</p>
          )}
          <div className='mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs'>
            <span className='text-muted-foreground'>หายทุกเดือน</span>
            <span className='text-base font-semibold text-[var(--coral)]'>
              ฿{formatTHB(leak.missedPerMonth)}
            </span>
            <span className='text-muted-foreground'>/ ปี</span>
            <span className='font-medium'>฿{formatTHB(leak.missedPerYear)}</span>
          </div>
          {!dimmed && leak.shockSentence && (
            <p className='mt-3 border-l-2 border-[var(--coral)] pl-3 text-sm italic text-foreground/70'>
              {leak.shockSentence}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TopBlockerSection({ leaks }: { leaks: RevenueLeak[] }) {
  const top = useMemo(() => {
    const order: LeakSeverity[] = ['critical', 'high', 'medium', 'low']
    return [...leaks].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))[0]
  }, [leaks])
  if (!top) return null
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-4'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-[20px] font-semibold tracking-tight'>จุดที่กำลังเสียเงินมากที่สุด</h2>
          <span className='text-xs text-muted-foreground'>1 of {leaks.length} blockers</span>
        </div>
        <LeakCard leak={top} />
      </div>
    </RevealSection>
  )
}

function SoftLoginGate({
  onLineLogin,
  onEmailLogin,
}: {
  onLineLogin: () => void
  onEmailLogin: () => void
}) {
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <div className='rounded-2xl border border-[var(--coral)]/30 bg-gradient-to-br from-[var(--coral-bg)] to-[#FFFAF5] p-6'>
          <div className='flex items-center justify-between text-xs font-medium text-[var(--coral-text)]'>
            <span>เห็นแล้ว 30%</span>
            <span>เหลืออีก 70%</span>
          </div>
          <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/5'>
            <div className='h-full w-[30%] rounded-full bg-[var(--coral)]' />
          </div>
          <h3 className='mt-5 text-[20px] font-semibold tracking-tight'>
            ดูจุดที่เหลือ + แผนเต็ม — login ฟรี
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            login ครั้งเดียว เก็บผลไว้ดูได้ตลอด · ไม่ post แทนคุณ · ไม่อ่าน DM
          </p>
          <div className='mt-5 grid gap-2 sm:grid-cols-2'>
            <button
              onClick={onLineLogin}
              className='flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90'
            >
              Login ผ่าน LINE
              <ChevronRight className='h-4 w-4' />
            </button>
            <button
              onClick={onEmailLogin}
              className='flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90'
            >
              <Mail className='h-4 w-4' />
              ใช้อีเมล (Magic Link)
            </button>
          </div>
          <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
            <ShieldCheck className='h-3.5 w-3.5' />
            ไม่ post แทนคุณ · ไม่อ่าน DM · ลบบัญชีได้ทุกเมื่อ
          </div>
        </div>
      </div>
    </RevealSection>
  )
}

function LockedTeasers({
  remainingCount,
  totalRemainingMissed,
  onUnlock,
}: {
  remainingCount: number
  totalRemainingMissed: number
  onUnlock: () => void
}) {
  const items = [
    { title: `อีก ${remainingCount} blockers ที่กำลังเสียเงิน`, sub: `รวม ฿${formatTHB(totalRemainingMissed)}/เดือน` },
    { title: 'แผน 30 / 60 / 90 วัน', sub: 'ทำตามได้ทันที · ใช้เวลา 15-30 นาที/ครั้ง' },
    { title: 'Why it happens — root cause', sub: 'วิเคราะห์ลึกว่าทำไมถึงเสียเงิน' },
  ]
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl space-y-3 px-5 py-4'>
        {items.map((it, i) => (
          <button
            key={i}
            onClick={onUnlock}
            className='group flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-black/15 bg-card/60 p-5 text-left transition-transform hover:scale-[1.01]'
          >
            <div className='flex items-start gap-3'>
              <div className='rounded-lg bg-foreground/5 p-2'>
                <Lock className='h-4 w-4 text-foreground/60' />
              </div>
              <div>
                <div className='text-[15px] font-medium text-foreground/80'>{it.title}</div>
                <div className='text-xs text-muted-foreground'>{it.sub}</div>
              </div>
            </div>
            <ChevronRight className='h-4 w-4 text-foreground/40 transition-transform group-hover:translate-x-0.5' />
          </button>
        ))}
      </div>
    </RevealSection>
  )
}

function WhyItHappens({ text }: { text: string }) {
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <h2 className='mb-3 text-[20px] font-semibold tracking-tight'>ทำไมถึงเป็นแบบนี้</h2>
        <div className='rounded-2xl border border-black/[0.06] bg-card p-6'>
          <p className='text-[15px] leading-[1.75] text-foreground/85' style={{ fontFamily: "Georgia, 'Noto Serif Thai', serif" }}>
            {text}
          </p>
        </div>
      </div>
    </RevealSection>
  )
}

function AllLeaks({ leaks }: { leaks: RevenueLeak[] }) {
  const sorted = useMemo(() => {
    const order: LeakSeverity[] = ['critical', 'high', 'medium', 'low']
    return [...leaks].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))
  }, [leaks])
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <h2 className='mb-4 text-[20px] font-semibold tracking-tight'>จุดที่กำลังเสียเงินทั้งหมด</h2>
        <div className='space-y-3'>
          {sorted.map((l) => (
            <LeakCard key={l.id} leak={l} />
          ))}
        </div>
      </div>
    </RevealSection>
  )
}

function MoneyHero({ revenueGap, breakdown }: { revenueGap: number; breakdown: { conservative: number; realistic: number; aggressive: number } }) {
  const max = Math.max(breakdown.conservative, breakdown.realistic, breakdown.aggressive, 1)
  const animated = useCountUp(revenueGap, 1400)
  const bars = [
    { label: 'Conservative', v: breakdown.conservative, color: 'var(--success)' },
    { label: 'Realistic',    v: breakdown.realistic,    color: 'var(--coral)' },
    { label: 'Aggressive',   v: breakdown.aggressive,   color: 'var(--brand-purple)' },
  ]
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <div className='rounded-2xl border border-black/[0.06] bg-card p-6'>
          <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            ศักยภาพรายได้ที่หายไป
          </div>
          <div className='mt-2 text-[40px] font-semibold tracking-tight text-[var(--coral)] sm:text-[52px]'>
            ฿{formatTHB(animated)}
            <span className='ml-2 text-base font-normal text-muted-foreground'>/ เดือน</span>
          </div>
          <div className='mt-6 space-y-4'>
            {bars.map((b) => (
              <div key={b.label}>
                <div className='mb-1 flex items-baseline justify-between text-xs'>
                  <span className='font-medium text-foreground'>{b.label}</span>
                  <span className='tabular-nums text-muted-foreground'>฿{formatTHB(b.v)}/เดือน</span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-foreground/5'>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(b.v / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className='h-full rounded-full'
                    style={{ background: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className='mt-5 text-xs text-muted-foreground'>
            ประมาณการจาก benchmark · ผลจริงขึ้นอยู่กับ creator แต่ละคน
          </p>
        </div>
      </div>
    </RevealSection>
  )
}

// ── PhaseCard: adapted for MITA+ ActionItem[] (P-009-adapt)
// Lovable original used ActionStep[] (day/time/title/detail/earn)
// MITA+ uses ActionItem[] (action/example/expectedOutcome/revenueImpact)
function PhaseCard({
  phase,
  title,
  steps,
  accent,
}: {
  phase: string
  title: string
  steps: ActionItem[]
  accent: string
}) {
  return (
    <div className='rounded-2xl border border-black/[0.06] bg-card p-5'>
      <div className='mb-4 flex items-center gap-2'>
        <span
          className='inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold'
          style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
        >
          {phase}
        </span>
        <h3 className='text-[16px] font-semibold tracking-tight'>{title}</h3>
      </div>
      <ol className='space-y-3'>
        {steps.map((s, i) => (
          <li key={i} className='flex gap-3'>
            <div
              className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold'
              style={{ background: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}
            >
              {i + 1}
            </div>
            <div className='flex-1'>
              <div className='mt-0.5 text-[14px] font-medium'>{s.action}</div>
              {s.expectedOutcome && (
                <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>{s.expectedOutcome}</p>
              )}
              {s.example && (
                <p className='mt-1 text-xs text-foreground/70 italic leading-relaxed'>{s.example}</p>
              )}
              {s.revenueImpact > 0 && (
                <div className='mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--coral-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--coral-text)]'>
                  <TrendingUp className='h-3 w-3' />
                  +฿{formatTHB(s.revenueImpact)}/เดือน
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ActionPlan({ plan }: { plan: AuditResult['actionPlan'] }) {
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <div className='mb-4 flex items-center gap-2'>
          <Target className='h-5 w-5 text-[var(--coral)]' />
          <h2 className='text-[20px] font-semibold tracking-tight'>แผนหาเงินใน 90 วัน</h2>
        </div>
        <div className='grid gap-3 sm:grid-cols-1'>
          <PhaseCard phase='30 วันแรก' title='Setup'  steps={plan.day30} accent='oklch(0.58 0.13 160)' />
          <PhaseCard phase='60 วัน'    title='Build'  steps={plan.day60} accent='oklch(0.72 0.15 70)' />
          <PhaseCard phase='90 วัน'    title='Scale'  steps={plan.day90} accent='var(--coral)' />
        </div>
      </div>
    </RevealSection>
  )
}

function UpsideCard({ upside }: { upside: string }) {
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <div className='rounded-2xl border border-[var(--coral)]/25 bg-gradient-to-br from-[var(--coral-bg)] to-[#FFFAF5] p-6'>
          <div className='flex items-center gap-2 text-[var(--coral-text)]'>
            <Zap className='h-5 w-5' />
            <span className='text-xs font-semibold uppercase tracking-wide'>Upside</span>
          </div>
          <p className='mt-3 text-[16px] leading-relaxed text-foreground'>{upside}</p>
        </div>
      </div>
    </RevealSection>
  )
}

function StickyBottomCTA({ visible, onUpgrade }: { visible: boolean; onUpgrade: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className='fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-[#FFFAF5]/95 px-4 py-3 backdrop-blur-md'
        >
          <div className='mx-auto flex max-w-2xl items-center justify-between gap-3'>
            <div className='hidden text-left sm:block'>
              <div className='text-[13px] font-medium'>ปลดล็อกแผนเต็ม</div>
              <div className='text-xs text-muted-foreground'>ยกเลิกได้ทุกเดือน · ฟรี trial</div>
            </div>
            <button
              onClick={onUpgrade}
              className='flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background sm:w-auto'
            >
              ปลดล็อก Starter ฿199/เดือน
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ShareSection({ onShare, resultId }: { onShare: (c: ShareChannel) => void; resultId: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${resultId}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(url)
    }
    setCopied(true)
    onShare('copy')
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <RevealSection>
      <div className='mx-auto max-w-2xl px-5 py-6'>
        <div className='rounded-2xl border border-black/[0.06] bg-card p-6 text-center'>
          <Share2 className='mx-auto h-5 w-5 text-foreground/60' />
          <h3 className='mt-2 text-[18px] font-semibold tracking-tight'>แชร์ผลของคุณ</h3>
          <p className='mt-1 text-xs text-muted-foreground'>บอกเพื่อนว่าช่องคุณมีศักยภาพแค่ไหน</p>
          <div className='mt-4 flex flex-wrap justify-center gap-2'>
            <button
              onClick={() => onShare('line')}
              className='rounded-full bg-[#06C755] px-4 py-2 text-xs font-medium text-white'
            >
              แชร์ใน LINE
            </button>
            <button
              onClick={() => onShare('x')}
              className='rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background'
            >
              แชร์ใน X
            </button>
            <button
              onClick={handleCopy}
              className='inline-flex items-center gap-1 rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium'
            >
              {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
            </button>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}

function FooterDisclaimer() {
  return (
    <footer className='border-t border-black/5 px-5 py-8 text-center'>
      <p className='mx-auto max-w-xl text-xs text-muted-foreground'>
        ประมาณการจาก benchmark อุตสาหกรรม · ผลจริงแตกต่างกันตามผู้ใช้
      </p>
      <div className='mt-3 flex justify-center gap-4 text-xs text-muted-foreground'>
        <a href='/privacy' className='hover:text-foreground'>privacy</a>
        <a href='/terms'   className='hover:text-foreground'>terms</a>
        <a href='/contact' className='hover:text-foreground'>contact</a>
      </div>
    </footer>
  )
}

function HighEarnerBanner() {
  return (
    <div className='mx-auto max-w-3xl px-5 pt-4'>
      <div className='flex items-center gap-3 rounded-2xl border border-[var(--brand-purple)]/25 bg-[color-mix(in_oklab,var(--brand-purple)_8%,transparent)] p-4'>
        <div className='rounded-lg bg-[var(--brand-purple)]/15 p-2'>
          <Crown className='h-5 w-5 text-[var(--brand-purple)]' />
        </div>
        <div>
          <div className='text-sm font-semibold'>🎯 คุณเป็น High Earner — เห็นทุกข้อมูลฟรี</div>
          <div className='text-xs text-muted-foreground'>เพราะคุณพร้อมที่จะ scale</div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────── Main ───────────────── */

export default function ResultPageV2({
  result,
  isLoggedIn,
  onLineLogin,
  onEmailLogin,
  onShare,
  onUpgrade,
}: ResultPageV2Props) {
  const isHighEarner = result.input.monthlyIncome >= HIGH_EARNER_THRESHOLD
  const showFullContent = isLoggedIn || isHighEarner
  const handleUpgrade = onUpgrade ?? (() => { window.location.href = '/pricing' })

  const [showStickyCTA, setShowStickyCTA] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sortedLeaks = useMemo(() => {
    const order: LeakSeverity[] = ['critical', 'high', 'medium', 'low']
    return [...result.leaks].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))
  }, [result.leaks])
  const remainingLeaks = sortedLeaks.slice(1)
  const remainingMissed = remainingLeaks.reduce((sum, l) => sum + l.missedPerMonth, 0)

  return (
    <div
      className='min-h-screen font-sans antialiased'
      style={{ backgroundColor: '#FFFAF5', color: '#1D1D1F' }}
      data-theme='light'
    >
      <StickyTopNav name={result.input.name} score={result.score.total} onUpgrade={handleUpgrade} />
      {isHighEarner && <HighEarnerBanner />}
      <HeroSection result={result} />
      <ShockCard shock={result.aiInsights.shock} totalMissed={result.revenueEstimation.totalMissed} />
      <TopBlockerSection leaks={result.leaks} />
      {!showFullContent && (
        <>
          <SoftLoginGate onLineLogin={onLineLogin} onEmailLogin={onEmailLogin} />
          <LockedTeasers
            remainingCount={remainingLeaks.length}
            totalRemainingMissed={remainingMissed}
            onUnlock={onLineLogin}
          />
        </>
      )}
      {showFullContent && (
        <>
          <WhyItHappens text={result.aiInsights.whyItHappens} />
          <AllLeaks leaks={result.leaks} />
          <MoneyHero
            revenueGap={result.revenueEstimation.totalMissed}
            breakdown={{
              conservative: result.revenueEstimation.conservative,
              realistic:    result.revenueEstimation.realistic,
              aggressive:   result.revenueEstimation.aggressive,
            }}
          />
          <ActionPlan plan={result.actionPlan} />
          <UpsideCard upside={result.aiInsights.upside} />
          <ShareSection onShare={onShare} resultId={result.id} />
        </>
      )}
      <FooterDisclaimer />
      <div className='h-20' />
      <StickyBottomCTA visible={showStickyCTA} onUpgrade={handleUpgrade} />
    </div>
  )
}
