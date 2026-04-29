'use client'
// ── P-010-adapt · StarterDashboardV2 — Lovable → MITA+ adapted ──────────────
// P-010-fix1: Restored Products / Clips / Milestones tabs from legacy
// Source: Lovable.dev "Mita AI Studio" · 29 Apr 2026

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Settings,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Link2,
  Calendar,
  ShoppingBag,
  Film,
  Trophy,
} from 'lucide-react'
import type { DashboardV2Props, DashboardTab, WeekPlan } from '@/types'

// ── Legacy tab components (P-010-fix1) ────────────────────────────────────────
import ProductsTab            from '@/components/starter/legacy/ProductsTab'
import ContentExampleTab      from '@/components/starter/legacy/ContentExampleTab'
import MilestonesTab          from '@/components/starter/legacy/MilestonesTab'
import { IncomeGraph, FirstVisitBanner, QuickWinSection } from '@/components/starter/legacy/LegacyPlanExtras'
import type { ContentExampleData } from '@/components/starter/legacy/ContentExampleTab'

/* ───────────────── Helpers ───────────────── */

function formatTHB(n: number): string {
  return new Intl.NumberFormat('th-TH').format(Math.round(n))
}

function useCountUp(target: number, durationMs = 1500, start = true): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) {
      setVal(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p     = Math.min(1, (now - t0) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs, start])
  return val
}

const WEEK_THEMES: Record<number, { color: string; bg: string; label: string }> = {
  1: { color: 'var(--success)',       bg: 'color-mix(in oklab, var(--success) 14%, transparent)',       label: 'Setup'    },
  2: { color: 'var(--brand-purple)',  bg: 'color-mix(in oklab, var(--brand-purple) 14%, transparent)',  label: 'Build'    },
  3: { color: 'var(--coral)',         bg: 'var(--coral-bg)',                                             label: 'Scale'    },
  4: { color: 'oklch(0.55 0.15 240)', bg: 'oklch(0.94 0.04 240)',                                       label: 'Compound' },
}

/* ───────────────── Top Nav ───────────────── */

function TopNav({ score }: { score: number }) {
  return (
    <div className='sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_oklab,var(--background)_85%,transparent)] border-b border-black/5'>
      <div className='mx-auto flex max-w-2xl items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-2'>
          <span className='text-lg font-semibold tracking-tight text-foreground'>MITA</span>
          <span className='text-lg font-semibold' style={{ color: 'var(--brand-purple)' }}>+</span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            className='rounded-full px-2.5 py-1 text-[11px] font-semibold'
            style={{ background: 'var(--coral-bg)', color: 'var(--coral-text)' }}
          >
            Score {score}
          </div>
          <button
            type='button'
            className='rounded-full p-2 text-muted-foreground hover:bg-black/5'
            aria-label='Settings'
          >
            <Settings className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───────────────── Smart Hero KPI ───────────────── */

function ConfettiBurst() {
  const pieces = Array.from({ length: 24 })
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {pieces.map((_, i) => {
        const angle  = (Math.PI * 2 * i) / pieces.length
        const dist   = 80 + Math.random() * 80
        const x      = Math.cos(angle) * dist
        const y      = Math.sin(angle) * dist
        const colors = ['var(--coral)', 'var(--brand-purple)', 'var(--success)', 'oklch(0.78 0.15 80)']
        return (
          <motion.span
            key={i}
            className='absolute left-1/2 top-1/2 h-2 w-2 rounded-sm'
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x, y, opacity: 0, scale: 1, rotate: 360 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

function SmartHeroKPI({
  cumulativeIncome,
  realistic,
  percentToTarget,
  hasCheckins,
  dayInJourney,
  actionsDone,
  actionsTotal,
}: {
  cumulativeIncome:  number
  realistic:         number
  percentToTarget:   number
  hasCheckins:       boolean
  dayInJourney:      number
  actionsDone:       number
  actionsTotal:      number
}) {
  const showState1 = !hasCheckins
  const showState3 = hasCheckins && percentToTarget >= 80
  const bigValue   = showState1 ? realistic : cumulativeIncome
  const animated   = useCountUp(bigValue)
  const progress   = useCountUp(percentToTarget, 1000, hasCheckins)
  const [celebrate, setCelebrate] = useState(false)
  useEffect(() => {
    if (showState3) {
      setCelebrate(true)
      const t = setTimeout(() => setCelebrate(false), 1600)
      return () => clearTimeout(t)
    }
  }, [showState3])
  const label = showState1 ? 'ศักยภาพรายได้/เดือน' : 'รายได้สะสม'
  return (
    <div className='relative overflow-hidden rounded-3xl border border-black/5 bg-card p-6 shadow-sm'>
      {celebrate && <ConfettiBurst />}
      <div className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
        {label}
      </div>
      <div className='mt-2 flex items-baseline gap-1'>
        <span className='text-5xl font-semibold tracking-tight text-foreground tabular-nums'>
          ฿{formatTHB(animated)}
        </span>
      </div>
      {showState1 && (
        <>
          <p className='mt-2 text-sm text-muted-foreground'>
            จาก benchmark creator แนวคุณ
          </p>
          <div className='mt-4'>
            <button
              type='button'
              className='inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90'
            >
              เริ่ม check-in อาทิตย์นี้ → รับ feedback AI
            </button>
          </div>
        </>
      )}
      {!showState1 && (
        <>
          <p className='mt-2 text-sm text-muted-foreground'>
            {showState3
              ? `${Math.round(percentToTarget)}% ของเป้า ฿${formatTHB(realistic)}/เดือน 🎯`
              : `ศักยภาพ ฿${formatTHB(realistic)}/เดือน · ${Math.round(percentToTarget)}% ถึงเป้า`}
          </p>
          <div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5'>
            <motion.div
              className='h-full rounded-full'
              style={{ background: 'var(--coral)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </>
      )}
      <div className='mt-4 border-t border-black/5 pt-3 text-[11px] text-muted-foreground'>
        วันที่ {dayInJourney} / 90 · ทำได้ {actionsDone}/{actionsTotal} ข้อ
      </div>
    </div>
  )
}

/* ───────────────── Coach Reply Card ───────────────── */

function CoachReplyCard({ reply, onReply }: { reply: string; onReply: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className='relative overflow-hidden rounded-2xl border border-black/5 bg-card p-5 shadow-sm'
      style={{ borderLeft: '3px solid var(--coral)' }}
    >
      <div className='flex items-start gap-3'>
        <div
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full'
          style={{ background: 'var(--coral-bg)', color: 'var(--coral-text)' }}
        >
          <Sparkles className='h-4 w-4' />
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-semibold text-foreground'>Coach feedback</span>
            <span className='text-[11px] text-muted-foreground'>2 ชั่วโมงที่แล้ว</span>
          </div>
          <p className='mt-1.5 text-[14px] leading-relaxed text-foreground/90'>{reply}</p>
          <button
            type='button'
            onClick={onReply}
            className='mt-3 inline-flex items-center gap-1 text-sm font-medium'
            style={{ color: 'var(--coral-text)' }}
          >
            ตอบกลับ <ArrowRight className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────────────── Onboarding Status ───────────────── */

function OnboardingCard({ hasAudit, hasChannel }: { hasAudit: boolean; hasChannel: boolean }) {
  if (hasAudit && hasChannel) return null
  const items = [
    { done: hasAudit,   icon: ClipboardList, label: 'ทำ Audit วิเคราะห์ช่อง',   action: 'ทำเลย →'    },
    { done: hasChannel, icon: Link2,         label: 'เชื่อมช่อง Social Media',  action: 'เชื่อมเลย →' },
  ]
  return (
    <div className='rounded-2xl border border-black/5 bg-card p-5 shadow-sm'>
      <h3 className='text-sm font-semibold text-foreground'>เสริมข้อมูลให้แผนแม่นขึ้น</h3>
      <ul className='mt-3 space-y-2'>
        {items.map((it, i) => {
          const Icon = it.icon
          return (
            <li
              key={i}
              className='flex items-center gap-3 rounded-xl border border-black/5 bg-background/40 px-3 py-2.5'
            >
              <Icon className='h-4 w-4 text-muted-foreground' />
              <span className='flex-1 text-sm text-foreground'>{it.label}</span>
              {it.done ? (
                <CheckCircle2 className='h-4 w-4' style={{ color: 'var(--success)' }} />
              ) : (
                <button type='button' className='text-xs font-medium' style={{ color: 'var(--coral-text)' }}>
                  {it.action}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ───────────────── Week Selector ───────────────── */

function WeekSelector({ weeks, active, onChange }: { weeks: WeekPlan[]; active: number; onChange: (week: number) => void }) {
  return (
    <div className='flex gap-2 overflow-x-auto pb-1'>
      {weeks.map((w) => {
        const theme    = WEEK_THEMES[w.week] ?? WEEK_THEMES[1]
        const isActive = w.week === active
        return (
          <button
            key={w.week}
            type='button'
            onClick={() => onChange(w.week)}
            className='relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors'
            style={{
              background: isActive ? theme.color : 'transparent',
              color:      isActive ? '#fff' : 'var(--muted-foreground)',
              border:     `1px solid ${isActive ? theme.color : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            {isActive && (
              <motion.span
                layoutId='weekActiveBg'
                className='absolute inset-0 rounded-full'
                style={{ background: theme.color, zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            W{w.week}
          </button>
        )
      })}
    </div>
  )
}

/* ───────────────── Action Checklist ───────────────── */

function ActionChecklist({ actions, done, onToggle }: { actions: string[]; done: Set<number>; onToggle: (idx: number) => void }) {
  return (
    <ul className='space-y-2'>
      {actions.map((a, i) => {
        const isDone = done.has(i)
        return (
          <li key={i}>
            <button
              type='button'
              onClick={() => onToggle(i)}
              className='flex w-full items-start gap-3 rounded-xl border border-black/5 bg-card px-3.5 py-3 text-left transition-all hover:border-black/10'
            >
              <motion.span whileTap={{ scale: 0.9 }} className='mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center'>
                {isDone
                  ? <CheckCircle2 className='h-5 w-5' style={{ color: 'var(--success)' }} />
                  : <Circle className='h-5 w-5 text-muted-foreground/60' />
                }
              </motion.span>
              <span className={`text-[15px] font-medium leading-snug ${isDone ? 'text-muted-foreground line-through opacity-60' : 'text-foreground'}`}>
                {a}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ───────────────── Plan Tab ───────────────── */

function PlanTab({
  plan, currentWeek, activeWeek, setActiveWeek,
  doneActions, toggleAction, coachReply, hasAudit, hasChannel, onCheckIn,
}: {
  plan:          { roadmap: WeekPlan[] } | null
  currentWeek:   number
  activeWeek:    number
  setActiveWeek: (n: number) => void
  doneActions:   Set<number>
  toggleAction:  (i: number) => void
  coachReply:    string | null
  hasAudit:      boolean
  hasChannel:    boolean
  onCheckIn:     () => void
}) {
  if (!plan || plan.roadmap.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-black/10 bg-card p-8 text-center'>
        <p className='text-sm text-muted-foreground'>ยังไม่มีแผนรายสัปดาห์ — สร้างแผนหาเงินก่อน</p>
        <button
          type='button'
          className='mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background'
          onClick={() => window.location.href = '/starter/plan'}
        >
          สร้างแผนหาเงิน <ArrowRight className='h-4 w-4' />
        </button>
      </div>
    )
  }
  const week  = plan.roadmap.find((w) => w.week === activeWeek) ?? plan.roadmap[0]
  const total = week.actions.length
  const done  = doneActions.size
  return (
    <div className='space-y-4'>
      {coachReply && <CoachReplyCard reply={coachReply} onReply={onCheckIn} />}
      <OnboardingCard hasAudit={hasAudit} hasChannel={hasChannel} />
      <div className='rounded-2xl border border-black/5 bg-card p-5 shadow-sm'>
        <WeekSelector weeks={plan.roadmap} active={activeWeek} onChange={setActiveWeek} />
        <div className='mt-4'>
          <h3 className='text-base font-semibold tracking-tight text-foreground'>{week.theme}</h3>
          <p className='text-xs text-muted-foreground'>เป้า ฿{formatTHB(week.target_thb)}</p>
        </div>
        <div className='mt-4'>
          {total === 0 ? (
            <p className='text-sm text-muted-foreground'>ยังไม่มี action ในสัปดาห์นี้</p>
          ) : (
            <ActionChecklist actions={week.actions} done={doneActions} onToggle={toggleAction} />
          )}
        </div>
        {total > 0 && (
          <div className='mt-4'>
            <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
              <span>ทำได้ {done}/{total} ข้อ</span>
              <span>{Math.round((done / total) * 100)}%</span>
            </div>
            <div className='mt-1.5 h-1 w-full overflow-hidden rounded-full bg-black/5'>
              <motion.div
                className='h-full rounded-full'
                style={{ background: 'var(--success)' }}
                animate={{ width: `${(done / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </div>
      <div className='space-y-2 pt-2'>
        <button
          type='button'
          onClick={onCheckIn}
          className='w-full rounded-full bg-foreground px-5 py-3.5 text-[15px] font-semibold text-background transition-opacity hover:opacity-90'
        >
          แจ้งผลงาน → รับ feedback ทันที
        </button>
        <p className='text-center text-xs text-muted-foreground'>อาทิตย์นี้ทำอะไรไปบ้าง?</p>
      </div>
    </div>
  )
}

/* ───────────────── Dark Tab Wrapper ───────────────── */

function DarkWrapper({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <>
      {label && (
        <div style={{ padding: '0 4px 10px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8A8A', fontWeight: 500 }}>
            {label}
          </span>
        </div>
      )}
      <div
        data-theme='dark'
        style={{
          background: 'linear-gradient(180deg, #1A1A22 0%, #0B0B0F 80px)',
          margin: '0 -4px',
          padding: '20px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(127, 119, 221, 0.12)',
          boxShadow: '0 8px 32px rgba(11, 11, 15, 0.08)',
          minHeight: '200px',
        }}
      >
        {children}
      </div>
    </>
  )
}

/* ───────────────── Feature Gates ───────────────── */

function ProductsFeatureGate() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🔒</span>
      <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#fff' }}>ทำ Audit ก่อนนะคะ</p>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
        MITA+ ต้องรู้จักช่องของคุณก่อน<br />ถึงจะแนะนำสินค้าที่ตรงที่สุดได้ค่ะ
      </p>
      <a
        href='/audit'
        style={{ display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, #7F77DD, #D85A30)', color: '#fff', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
      >
        ทำ Audit ฟรี 3 นาที →
      </a>
    </div>
  )
}

function ClipsFeatureGate() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🔒</span>
      <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#fff' }}>ทำ Audit ก่อนนะคะ</p>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
        MITA+ ต้องรู้จัก niche ของคุณก่อน<br />ถึงจะหาคลิปตัวอย่างที่ตรงได้ค่ะ
      </p>
      <a
        href='/audit'
        style={{ display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, #7F77DD, #D85A30)', color: '#fff', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
      >
        ทำ Audit ฟรี 3 นาที →
      </a>
    </div>
  )
}

function ChannelAccuracyWarning({ onConnect }: { onConnect: () => void }) {
  return (
    <div style={{ padding: '12px 14px', marginBottom: '12px', borderRadius: '12px', background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.25)' }}>
      <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#FF9F1C' }}>⚠️ เชื่อมช่องเพื่อความแม่นยำสูงขึ้น</p>
      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
        ตอนนี้ใช้ข้อมูลจาก Audit เท่านั้น —{' '}
        <button onClick={onConnect} style={{ background: 'none', border: 'none', color: '#FF9F1C', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '11px' }}>
          เชื่อมช่อง →
        </button>{' '}
        เพื่อให้ AI แนะนำสินค้าได้แม่นขึ้น
      </p>
    </div>
  )
}

/* ───────────────── Bottom Tab Switcher ───────────────── */

const TABS: { id: DashboardTab; label: string; icon: typeof Calendar }[] = [
  { id: 'plan',       label: 'แผน',     icon: Calendar    },
  { id: 'products',   label: 'สินค้า',  icon: ShoppingBag },
  { id: 'clips',      label: 'คลิป',    icon: Film        },
  { id: 'milestones', label: 'เป้าหมาย', icon: Trophy     },
]

function BottomTabSwitcher({ active, onChange }: { active: DashboardTab; onChange: (tab: DashboardTab) => void }) {
  return (
    <div
      className='sticky bottom-0 z-40 border-t border-black/5 backdrop-blur-md bg-[color-mix(in_oklab,var(--background)_92%,transparent)]'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className='mx-auto grid max-w-2xl grid-cols-4'>
        {TABS.map((t) => {
          const Icon     = t.icon
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              type='button'
              onClick={() => onChange(t.id)}
              className='relative flex flex-col items-center gap-0.5 py-2.5'
            >
              <Icon
                className='h-5 w-5'
                style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
              />
              <span
                className='text-[11px] font-medium'
                style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
              >
                {t.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId='tabActive'
                  className='absolute -top-px h-[2px] w-8 rounded-full bg-foreground'
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ───────────────── Main Component ───────────────── */

export default function StarterDashboardV2(props: DashboardV2Props) {
  const {
    user, plan, currentWeek, checkins, coachReply,
    hasAudit, hasChannel, audit, onCheckIn, onTabChange, activeTab,
    // Legacy props
    userId, niche, platform, affiliateData, contentExampleData,
    targetIncome, showFirstVisit, onDismissFirstVisit,
    currentEarned, streak, onConnectChannel,
  } = props

  const [activeWeek, setActiveWeek]   = useState(currentWeek)
  const [doneActions, setDoneActions] = useState<Set<number>>(new Set())
  useEffect(() => { setDoneActions(new Set()) }, [activeWeek])

  const cumulativeIncome = useMemo(
    () => checkins.reduce((sum, c) => sum + (c.income_approx || 0), 0),
    [checkins],
  )
  const realistic       = (audit?.revenueEstimation?.realistic ?? 0) as number
  const target          = realistic * 3
  const percentToTarget = target > 0 ? Math.min(100, (cumulativeIncome / target) * 100) : 0

  const currentWeekPlan = plan?.roadmap.find((w) => w.week === activeWeek)
  const actionsTotal    = currentWeekPlan?.actions.length ?? 0
  const actionsDone     = doneActions.size

  const toggleAction = (i: number) => {
    setDoneActions((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const handleConnectChannel = onConnectChannel ?? (() => { window.location.href = '/starter/connect' })

  // Derived legacy values with safe defaults
  const safeNiche        = niche    ?? (audit?.input?.niche    as string) ?? 'general'
  const safePlatform     = platform ?? (audit?.input?.platform as string) ?? 'tiktok'
  const safeTargetIncome = targetIncome  ?? Math.round((audit?.revenueEstimation?.realistic ?? 5000) as number)
  const safeCurrentEarned = currentEarned ?? cumulativeIncome
  const safeStreak       = streak ?? 1

  return (
    <div className='min-h-screen bg-background font-sans text-foreground'>
      <TopNav score={user.score} />
      <main className='mx-auto max-w-2xl px-4 pb-8 pt-5'>
        <div className='mb-1 text-sm text-muted-foreground'>
          สวัสดี, <span className='font-medium text-foreground'>{user.name}</span>
        </div>
        <div className='mt-4'>
          <SmartHeroKPI
            cumulativeIncome={cumulativeIncome}
            realistic={realistic}
            percentToTarget={percentToTarget}
            hasCheckins={checkins.length > 0}
            dayInJourney={user.dayInJourney}
            actionsDone={actionsDone}
            actionsTotal={actionsTotal}
          />
        </div>
        <div className='mt-6'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Plan Tab ── */}
              {activeTab === 'plan' && (
                <div className='space-y-4'>
                  {/* First Visit Banner */}
                  {showFirstVisit && (
                    <FirstVisitBanner
                      name={user.name}
                      onDismiss={onDismissFirstVisit ?? (() => {})}
                    />
                  )}

                  <PlanTab
                    plan={plan}
                    currentWeek={currentWeek}
                    activeWeek={activeWeek}
                    setActiveWeek={setActiveWeek}
                    doneActions={doneActions}
                    toggleAction={toggleAction}
                    coachReply={coachReply}
                    hasAudit={hasAudit}
                    hasChannel={hasChannel}
                    onCheckIn={onCheckIn}
                  />

                  {/* Income Graph — shown after first check-in */}
                  {checkins.length > 0 && (
                    <IncomeGraph checkins={checkins} weekNo={currentWeek} />
                  )}

                  {/* Quick Win Section — always visible */}
                  {hasAudit && (
                    <QuickWinSection
                      audit={audit}
                      hasChannel={hasChannel}
                      onConnectChannel={handleConnectChannel}
                    />
                  )}
                </div>
              )}

              {/* ── Products Tab ── */}
              {activeTab === 'products' && (
                <DarkWrapper label='สินค้าที่แนะนำสำหรับช่องคุณ'>
                  {!hasAudit
                    ? <ProductsFeatureGate />
                    : (
                      <>
                        {!hasChannel && (
                          <ChannelAccuracyWarning onConnect={handleConnectChannel} />
                        )}
                        <ProductsTab
                          affiliateData={affiliateData ?? null}
                          userId={userId ?? null}
                          niche={safeNiche}
                          platform={safePlatform}
                          onRefresh={() => {/* parent can refresh via loadProfile */}}
                        />
                      </>
                    )
                  }
                </DarkWrapper>
              )}

              {/* ── Clips Tab ── */}
              {activeTab === 'clips' && (
                <DarkWrapper label='ตัวอย่างคลิปจากนายช่องที่ทำเงินได้'>
                  {!hasAudit
                    ? <ClipsFeatureGate />
                    : (
                      <ContentExampleTab
                        userId={userId ?? null}
                        cachedData={(contentExampleData as ContentExampleData | null) ?? null}
                        niche={safeNiche}
                      />
                    )
                  }
                </DarkWrapper>
              )}

              {/* ── Milestones Tab ── */}
              {activeTab === 'milestones' && (
                <DarkWrapper label='เป้าหมายและความก้าวหน้าของคุณ'>
                  <MilestonesTab
                    monPlan={plan}
                    currentEarned={safeCurrentEarned}
                    displayName={user.name}
                    targetIncome={safeTargetIncome}
                    streak={safeStreak}
                  />
                </DarkWrapper>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomTabSwitcher active={activeTab} onChange={onTabChange} />
    </div>
  )
}
