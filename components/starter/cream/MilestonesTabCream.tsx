'use client'
// ── P-013-adapt · MilestonesTabCream — Lovable design, logic fixes applied ────
// Visual: MANAO_LOVABLE_CODE_P013.tsx (Lovable.dev, 2026-04-30)
// Logic fixes: hasPlan = !!monPlan · milestone 3 threshold = target * 0.2

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Bot,
  Calendar,
  Camera,
  Check,
  ClipboardList,
  Crown,
  Flame,
  Lock,
  Rocket,
  Wallet,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CREAM      = '#FFFAF5'
const TEXT       = '#1D1D1F'
const MUTED      = '#6B6B6B'
const SUBTLE     = '#8A8A8A'
const BODY       = '#4A4A4A'
const CORAL      = '#D85A30'
const PURPLE     = '#7F77DD'
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04)'
const CARD_BORDER = '1px solid rgba(0,0,0,0.06)'

export interface MonPlan {
  audience_insight?: string
}

export interface MilestonesTabCreamProps {
  monPlan?: MonPlan | null
  currentEarned: number
  displayName: string
  targetIncome: number
  streak: number
  hasChannel: boolean
  onConnectChannel?: () => void
  onUploadInsight?: () => void
}

interface MilestoneDef {
  key: string
  label: string
  icon: LucideIcon
  target: number
  unit: string
}

function formatTHB(n: number) {
  if (n >= 1000) return `฿${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
  return `฿${n}`
}

/* ──────────────── CircleProgress ──────────────── */
export function CircleProgress({ earned, target }: { earned: number; target: number }) {
  const pct      = target > 0 ? Math.min(100, Math.round((earned / target) * 100)) : 0
  const reached  = pct >= 100
  const ringColor = reached ? CORAL : PURPLE
  const size = 110, stroke = 9
  const r    = (size - stroke) / 2
  const c    = 2 * Math.PI * r
  const dash = (pct / 100) * c

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke='rgba(0,0,0,0.06)' strokeWidth={stroke} fill='none' />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={ringColor} strokeWidth={stroke} strokeLinecap='round' fill='none'
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ color: ringColor, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {formatTHB(earned)}
        </div>
        <div style={{ color: SUBTLE, fontSize: 9, marginTop: 2 }}>/ {formatTHB(target)}</div>
      </div>
    </div>
  )
}

/* ──────────────── StreakCalendar ──────────────── */
export function StreakCalendar({ streak }: { streak: number }) {
  const labels     = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const jsDow      = new Date().getDay()       // 0=Sun..6=Sat
  const todayIdx   = (jsDow + 6) % 7          // Mon=0..Sun=6
  const safeStreak = Math.max(0, Math.min(7, streak))
  const activeStart = todayIdx - safeStreak + 1

  return (
    <div style={{ background: 'white', boxShadow: CARD_SHADOW, border: CARD_BORDER, borderRadius: 16, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} color={CORAL} />
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>7 วันนี้</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Flame size={12} color={CORAL} />
          <span style={{ fontSize: 11, fontWeight: 700, color: CORAL }}>{streak} วัน</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
        {labels.map((l, i) => {
          const isToday  = i === todayIdx
          const isActive = i >= activeStart && i < todayIdx
          return (
            <div key={l + i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <span style={{ fontSize: 9, color: isToday ? TEXT : SUBTLE, fontWeight: isToday ? 700 : 400 }}>
                {l}
              </span>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...(isToday
                    ? { background: `linear-gradient(135deg, ${PURPLE}, ${CORAL})`, border: '2px solid rgba(127,119,221,0.5)' }
                    : isActive
                    ? { background: 'rgba(127,119,221,0.18)', border: '1px solid rgba(127,119,221,0.3)' }
                    : { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }),
                }}
              >
                {isToday ? <Zap size={12} color='white' /> : isActive ? <Check size={12} color={PURPLE} /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────── Section 1: Channel Hub ──────────────── */
function ChannelHub({ onConnectChannel, onUploadInsight }: { onConnectChannel?: () => void; onUploadInsight?: () => void }) {
  return (
    <div style={{ background: 'white', boxShadow: CARD_SHADOW, border: CARD_BORDER, borderRadius: 20, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertCircle size={18} color={CORAL} />
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>ช่อง MITA+ จะวิเคราะห์ได้แม่นขึ้น</span>
      </div>
      <p style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
        ตอนนี้ใช้ข้อมูลจาก Audit อย่างเดียว — เชื่อมช่อง/อัปโหลด insight
        แล้ว AI วิเคราะห์ได้แม่นขึ้นจาก 30% → 85%
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
        <div style={{ flex: 1, background: 'rgba(216,90,48,0.06)', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>ตอนนี้</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CORAL }}>30%</div>
          <div style={{ fontSize: 11, color: MUTED }}>ข้อมูลจาก Audit</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(127,119,221,0.06)', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>หลังเชื่อม</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: PURPLE }}>85%</div>
          <div style={{ fontSize: 11, color: MUTED }}>ข้อมูลจริง + insight</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        <button
          type='button'
          onClick={onConnectChannel}
          style={{
            background: CORAL, color: 'white', fontSize: 14, fontWeight: 700, padding: 14,
            borderRadius: 12, border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, cursor: 'pointer',
          }}
        >
          <Zap size={16} />
          เชื่อม API (เร็วที่สุด)
        </button>
        <button
          type='button'
          onClick={onUploadInsight ?? onConnectChannel}
          style={{
            background: 'white', color: TEXT, fontSize: 14, fontWeight: 600, padding: 14,
            borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
          }}
        >
          <Camera size={16} />
          อัปโหลดรูป insight แทน
        </button>
      </div>
    </div>
  )
}

/* ──────────────── Section 2: Hero Progress ──────────────── */
function HeroProgress({ earned, target, streak }: { earned: number; target: number; streak: number }) {
  const pct       = target > 0 ? Math.min(100, Math.round((earned / target) * 100)) : 0
  const remaining = Math.max(0, target - earned)
  const reached   = pct >= 100

  return (
    <div style={{ background: 'white', boxShadow: CARD_SHADOW, border: CARD_BORDER, borderRadius: 20, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
      <CircleProgress earned={earned} target={target} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: SUBTLE, fontWeight: 600 }}>ความคืบหน้า</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', marginTop: 2 }}>
          {pct}%
        </div>
        {reached ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: CORAL, marginTop: 2 }}>ถึงเป้าแล้ว 🎉</div>
        ) : (
          <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>
            เหลืออีก ฿{remaining.toLocaleString()} ค่ะ
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.25)',
            borderRadius: 99, padding: '4px 12px', color: CORAL, fontSize: 12, fontWeight: 700,
          }}>
            <Flame size={12} color={CORAL} />
            {streak} วัน streak
          </span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────── Section 4: Milestones List ──────────────── */
function MilestonesList({ earned, target, hasPlan }: { earned: number; target: number; hasPlan: boolean }) {
  const milestones: Array<MilestoneDef & { current: number; done: boolean }> = [
    {
      key: 'plan', label: 'สร้างแผนหาเงิน', icon: ClipboardList, target: 1, unit: 'แผน',
      // Fix 1: done = hasPlan (= !!monPlan), NOT earned >= 1
      current: hasPlan ? 1 : 0,
      done: hasPlan,
    },
    {
      key: 'first', label: 'รายได้แรก', icon: Wallet, target: 100, unit: 'บาท',
      current: Math.min(earned, 100),
      done: earned >= 100,
    },
    {
      key: 'mid',
      // Fix 2: threshold = target * 0.2 (NOT target / 2)
      label: `รายได้ ฿${Math.round(target * 0.2).toLocaleString()}`,
      icon: Rocket, target: Math.round(target * 0.2), unit: 'บาท',
      current: Math.min(earned, Math.round(target * 0.2)),
      done: earned >= Math.round(target * 0.2),
    },
    {
      key: 'goal', label: `รายได้ ฿${target.toLocaleString()}`, icon: Crown, target, unit: 'บาท',
      current: Math.min(earned, target),
      done: earned >= target,
    },
  ]

  return (
    <div>
      <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, marginBottom: 10 }}>Milestones</div>
      {milestones.map((m, i) => {
        const pct  = m.target > 0 ? Math.min(100, Math.round((m.current / m.target) * 100)) : 0
        const Icon = m.done ? m.icon : Lock
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
            style={{
              background: m.done ? 'rgba(216,90,48,0.06)' : 'white',
              boxShadow: CARD_SHADOW,
              border: m.done ? '1px solid rgba(216,90,48,0.25)' : CARD_BORDER,
              borderRadius: 18, padding: '14px 16px', marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <Icon size={24} color={m.done ? CORAL : SUBTLE} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.done ? CORAL : TEXT }}>
                    {m.label}
                  </span>
                  {m.done && (
                    <span style={{
                      fontSize: 10, color: CORAL, background: 'rgba(216,90,48,0.12)',
                      padding: '1px 8px', borderRadius: 99, fontWeight: 700,
                    }}>
                      ปลดล็อกแล้ว
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: SUBTLE, marginTop: 2 }}>
                  {m.current.toLocaleString()} / {m.target.toLocaleString()} {m.unit}
                </div>
              </div>
              {!m.done && (
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, color: PURPLE, background: 'rgba(127,119,221,0.1)',
                    padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                  }}>
                    {pct}%
                  </span>
                </div>
              )}
            </div>
            {!m.done && (
              <div style={{ marginTop: 10, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${PURPLE}, ${CORAL})` }}
                />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ──────────────── Section 5: Coach Card ──────────────── */
function CoachCard({ monPlan, displayName }: { monPlan?: MonPlan | null; displayName: string }) {
  const message =
    monPlan?.audience_insight ??
    `${displayName} เริ่มได้เลยนะคะ ทุก creator ที่ประสบความสำเร็จก็เริ่มจากศูนย์เหมือนกันค่ะ 🎯`

  return (
    <div style={{ background: 'white', boxShadow: CARD_SHADOW, border: CARD_BORDER, borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${PURPLE}, ${CORAL})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Bot size={18} color='white' />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: PURPLE }}>MITA+ Coach</div>
          <div style={{ fontSize: 10, color: SUBTLE }}>ส่วนตัวสำหรับ {displayName} ค่ะ</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: BODY, lineHeight: 1.7, margin: 0 }}>{message}</p>
    </div>
  )
}

/* ──────────────── Main Component ──────────────── */
export default function MilestonesTabCream({
  monPlan,
  currentEarned,
  displayName,
  targetIncome,
  streak,
  hasChannel,
  onConnectChannel,
  onUploadInsight,
}: MilestonesTabCreamProps) {
  // Fix 1: hasPlan = !!monPlan (not earned >= 1)
  const hasPlan = !!monPlan

  return (
    <div style={{ background: CREAM, minHeight: '100vh', padding: '16px 14px 40px' }}>
      <div style={{ maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!hasChannel && (
          <ChannelHub onConnectChannel={onConnectChannel} onUploadInsight={onUploadInsight} />
        )}
        <HeroProgress earned={currentEarned} target={targetIncome} streak={streak} />
        <StreakCalendar streak={streak} />
        <MilestonesList earned={currentEarned} target={targetIncome} hasPlan={hasPlan} />
        <CoachCard monPlan={monPlan} displayName={displayName} />
      </div>
    </div>
  )
}
