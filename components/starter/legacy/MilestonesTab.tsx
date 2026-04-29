'use client'
// ── P-010-fix1 · MilestonesTab (legacy port) ──────────────────────────────────
// Ported from app/starter/page.legacy.tsx lines 1106–1315
// Exports: MilestonesTab (default), CircleProgress, StreakCalendar

import { motion } from 'framer-motion'
import { CARD, RADIUS } from '@/lib/tokens'

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number): string { return n.toLocaleString('th-TH') }

// ── CircleProgress ─────────────────────────────────────────────────────────────
export function CircleProgress({
  pct, size = 120, strokeWidth = 10, color = '#7B61FF', label, subLabel,
}: {
  pct: number; size?: number; strokeWidth?: number; color?: string; label: string; subLabel: string
}) {
  const r    = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color, lineHeight: 1 }}>{label}</p>
        <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{subLabel}</p>
      </div>
    </div>
  )
}

// ── StreakCalendar ─────────────────────────────────────────────────────────────
export function StreakCalendar({ streak }: { streak: number }) {
  const days    = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const today   = new Date().getDay() // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
      {days.map((d, i) => {
        const isToday  = i === todayIdx
        const isActive = streak > 0 && i <= todayIdx && i >= Math.max(0, todayIdx - streak + 1)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: isToday ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: isToday ? 700 : 400 }}>{d}</span>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: isToday ? 'linear-gradient(135deg, #7B61FF, #3ECFFF)' : isActive ? 'rgba(123,97,255,0.35)' : 'rgba(255,255,255,0.05)',
              border: isToday ? '2px solid rgba(123,97,255,0.7)' : isActive ? '1px solid rgba(123,97,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isActive && <span style={{ fontSize: '12px' }}>{isToday ? '⚡' : '✓'}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── MilestonesTab (default export) ────────────────────────────────────────────
export default function MilestonesTab({
  monPlan,
  currentEarned,
  displayName,
  targetIncome,
  streak,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monPlan:       any
  currentEarned: number
  displayName:   string
  targetIncome:  number
  streak:        number
}) {
  const milestones = [
    { label: 'สร้างแผนหาเงิน',                        target: 1,                           current: monPlan ? 1 : 0,   unit: 'แผน', icon: '📋', done: !!monPlan },
    { label: 'รายได้แรก',                              target: 100,                         current: currentEarned,     unit: '฿',   icon: '💰', done: currentEarned >= 100 },
    { label: `รายได้ ฿${fmt(Math.round(targetIncome * 0.2))}`, target: Math.round(targetIncome * 0.2), current: currentEarned, unit: '฿',   icon: '🚀', done: currentEarned >= targetIncome * 0.2 },
    { label: `รายได้ ฿${fmt(targetIncome)}`,            target: targetIncome,                current: currentEarned,     unit: '฿',   icon: '👑', done: currentEarned >= targetIncome },
  ]

  const progressPct = targetIncome > 0 ? Math.min((currentEarned / targetIncome) * 100, 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Circular Progress Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: '20px 18px', marginBottom: '14px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(62,207,255,0.06))', border: '1px solid rgba(123,97,255,0.25)', display: 'flex', alignItems: 'center', gap: '16px' }}
      >
        <CircleProgress
          pct={progressPct}
          size={110}
          strokeWidth={9}
          color={progressPct >= 100 ? '#22C55E' : '#7B61FF'}
          label={`฿${currentEarned >= 1000 ? (currentEarned / 1000).toFixed(1) + 'K' : Math.round(currentEarned).toLocaleString()}`}
          subLabel={`/ ฿${targetIncome >= 1000 ? (targetIncome / 1000).toFixed(0) + 'K' : targetIncome}`}
        />
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ความคืบหน้า</p>
          <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{Math.round(progressPct)}%</p>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            {progressPct >= 100 ? '🎉 ถึงเป้าแล้ว!' : `เหลืออีก ฿${fmt(Math.max(0, targetIncome - currentEarned))} ค่ะ`}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,159,28,0.12)', border: '1px solid rgba(255,159,28,0.25)', borderRadius: '99px', padding: '3px 10px' }}>
            <span style={{ fontSize: '13px' }}>🔥</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF9F1C' }}>{streak} วัน streak</span>
          </div>
        </div>
      </motion.div>

      {/* 7-Day Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: '14px 16px', marginBottom: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#fff' }}>📅 7 วันนี้</p>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF9F1C' }}>🔥 {streak} วัน</span>
        </div>
        <StreakCalendar streak={streak} />
      </motion.div>

      {/* Milestone Cards */}
      <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Milestones
      </p>
      {milestones.map((m, i) => {
        const pct = Math.min((m.current / m.target) * 100, 100)
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              ...CARD.base,
              padding: '14px 16px', marginBottom: '8px',
              background: m.done ? 'rgba(34,197,94,0.06)' : CARD.base.background,
              border:     m.done ? '1px solid rgba(34,197,94,0.2)' : CARD.base.border,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: m.done ? '0' : '10px' }}>
              <span style={{ fontSize: '24px', filter: m.done ? 'none' : 'grayscale(80%)' }}>
                {m.done ? m.icon : '🔒'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: m.done ? '#22C55E' : '#fff' }}>{m.label}</p>
                  {m.done && (
                    <span style={{ fontSize: '10px', color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '1px 8px', borderRadius: '99px', fontWeight: 700 }}>✓ ปลดล็อกแล้ว!</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                  {m.current.toLocaleString('th-TH')} / {m.target.toLocaleString('th-TH')} {m.unit}
                </p>
              </div>
              {!m.done && (
                <span style={{ fontSize: '10px', color: 'rgba(123,97,255,0.7)', background: 'rgba(123,97,255,0.1)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700, flexShrink: 0 }}>
                  {Math.round(pct)}%
                </span>
              )}
            </div>
            {!m.done && (
              <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #7B61FF, #3ECFFF)' }}
                />
              </div>
            )}
          </motion.div>
        )
      })}

      {/* MITA+ Coach Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ marginTop: '6px', padding: '16px', background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(62,207,255,0.06))', border: '1px solid rgba(123,97,255,0.2)', borderRadius: RADIUS.card }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🤖</div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#a78bfa' }}>MITA+ Coach</p>
            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>ส่วนตัวสำหรับ {displayName} ค่ะ</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
          {monPlan?.audience_insight
            ? monPlan.audience_insight
            : `${displayName} เริ่มได้เลยนะคะ ทุก creator ที่ประสบความสำเร็จก็เริ่มจากศูนย์เหมือนกันค่ะ 🎯`
          }
        </p>
      </motion.div>
    </motion.div>
  )
}
