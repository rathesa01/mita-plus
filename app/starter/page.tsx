'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Lock, ChevronRight, Flame, Target, TrendingUp, Star, Bell, Loader2 } from 'lucide-react'
import { COLORS, CARD, RADIUS, GLOW } from '@/lib/tokens'
import CheckInModal from './CheckInModal'
import { getSupabaseClient, type UserProfile } from '@/lib/db/supabaseClient'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Mock Data ───────────────────────────────────
const CREATOR = {
  name: 'น้องมิ้ว',
  platform: 'TikTok',
  followers: 12400,
  targetIncome: 8500,
  currentEarned: 340,
  streak: 5,
  weekNo: 2,
}

const WEEKS = [
  {
    week: 1, label: 'สัปดาห์ 1', sublabel: 'วางแผน', done: true,
    earned: 0, color: '#22C55E',
    tasks: [
      { text: 'สมัคร Shopee Affiliate', done: true },
      { text: 'เลือกสินค้า 5 อย่างจาก MITA+', done: true },
      { text: 'ทำคลิปแรก + แปะ link', done: true },
    ],
    coachMsg: 'เยี่ยมมากค่ะ! เริ่มต้นได้เร็วมาก สัปดาห์หน้าเน้นทำคลิปให้ครบ 3 อันนะคะ',
  },
  {
    week: 2, label: 'สัปดาห์ 2', sublabel: 'เช็คอิน', done: false,
    earned: 340, color: '#7B61FF',
    tasks: [
      { text: 'ทำคลิปที่ 2 — เปลี่ยนสินค้าใหม่', done: true },
      { text: 'ทำคลิปที่ 3 — format outfit reveal', done: false },
      { text: 'เช็คยอด affiliate dashboard', done: false },
      { text: 'ตอบ comment ที่ถามเรื่องสินค้า', done: false },
    ],
    coachMsg: null,
  },
  {
    week: 3, label: 'สัปดาห์ 3', sublabel: 'ปรับแผน', done: false,
    earned: null, color: '#FF9F1C',
    tasks: [
      { text: 'ดู analytics คลิปไหนดีสุด', done: false },
      { text: 'ทำซ้ำ format ที่ได้ผล × 2 คลิป', done: false },
      { text: 'เพิ่มสินค้าใหม่จาก MITA+', done: false },
      { text: 'แจ้งยอดรายได้ให้โค้ช', done: false },
    ],
    coachMsg: null,
  },
  {
    week: 4, label: 'สัปดาห์ 4', sublabel: 'สรุปเดือน', done: false,
    earned: null, color: '#3ECFFF',
    tasks: [
      { text: 'สรุปยอด affiliate รวมเดือน', done: false },
      { text: 'รับแผนเดือน 2 จาก MITA+', done: false },
      { text: 'ตั้งเป้าหมายเดือนหน้า', done: false },
    ],
    coachMsg: null,
  },
]

const PRODUCTS = [
  { name: 'พิมพ์ซิลิโคน Nordic', price: 290, commission: 8, img: '🧁', hot: true },
  { name: 'ชุดอุปกรณ์แต่งเค้ก', price: 450, commission: 6, img: '🎂', hot: false },
  { name: 'เครื่องชั่งดิจิตอล', price: 180, commission: 10, img: '⚖️', hot: true },
  { name: 'ถุงบีบครีม 50 ชิ้น', price: 120, commission: 9, img: '🍦', hot: false },
  { name: 'สีผสมอาหาร Set 12 สี', price: 220, commission: 7, img: '🎨', hot: false },
]

const MILESTONES = [
  { label: 'คลิปแรก', target: 1, current: 2, unit: 'คลิป', icon: '🎬', done: true },
  { label: 'รายได้แรก', target: 100, current: 340, unit: '฿', icon: '💰', done: true },
  { label: 'รายได้ ฿1,000', target: 1000, current: 340, unit: '฿', icon: '🚀', done: false },
  { label: 'รายได้ ฿5,000', target: 5000, current: 340, unit: '฿', icon: '👑', done: false },
]

// ── Components ──────────────────────────────────

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
      <div style={{ marginBottom: '4px' }}>{icon}</div>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
    </div>
  )
}

function WeekCard({ week, isActive, onClick }: { week: typeof WEEKS[0]; isActive: boolean; onClick: () => void }) {
  const doneCount = week.tasks.filter(t => t.done).length
  const pct = Math.round((doneCount / week.tasks.length) * 100)

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '10px',
      }}
    >
      <div style={{
        ...CARD.base,
        border: isActive ? `1px solid ${week.color}` : CARD.base.border,
        boxShadow: isActive ? `0 0 20px ${week.color}30` : 'none',
        padding: '14px 16px',
        opacity: !week.done && week.week > CREATOR.weekNo + 1 ? 0.4 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Week indicator */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: week.done ? `${week.color}20` : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${week.done || isActive ? week.color : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {week.done
              ? <CheckCircle2 size={18} style={{ color: week.color }} />
              : week.week > CREATOR.weekNo
              ? <Lock size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              : <span style={{ fontSize: '13px', fontWeight: 900, color: week.color }}>{week.week}</span>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{week.label}</span>
              <span style={{ fontSize: '10px', color: week.color, background: `${week.color}15`, padding: '1px 8px', borderRadius: '99px' }}>
                {week.sublabel}
              </span>
              {week.week === CREATOR.weekNo && (
                <span style={{ fontSize: '10px', color: '#FF9F1C', background: 'rgba(255,159,28,0.15)', padding: '1px 8px', borderRadius: '99px', fontWeight: 700 }}>
                  ● ตอนนี้
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ height: '100%', borderRadius: '99px', background: week.color }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                {doneCount}/{week.tasks.length}
              </span>
            </div>
          </div>

          {week.earned !== null && week.earned > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#22C55E' }}>฿{fmt(week.earned)}</p>
              <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>ได้รับ</p>
            </div>
          )}
          <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        </div>
      </div>
    </motion.button>
  )
}

function TaskList({ week, onCheckIn }: { week: typeof WEEKS[0]; onCheckIn?: () => void }) {
  const [tasks, setTasks] = useState(week.tasks)
  const toggle = (i: number) => {
    const updated = [...tasks]
    updated[i] = { ...updated[i], done: !updated[i].done }
    setTasks(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...CARD.base, padding: '16px', marginBottom: '10px' }}
    >
      <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        สิ่งที่ต้องทำสัปดาห์นี้
      </p>
      {tasks.map((task, i) => (
        <motion.button
          key={i}
          onClick={() => toggle(i)}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0',
            borderBottom: i < tasks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            textAlign: 'left',
          }}
        >
          {task.done
            ? <CheckCircle2 size={20} style={{ color: week.color, flexShrink: 0 }} />
            : <Circle size={20} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          }
          <span style={{
            fontSize: '13px', color: task.done ? 'rgba(255,255,255,0.4)' : '#fff',
            textDecoration: task.done ? 'line-through' : 'none',
            fontWeight: task.done ? 400 : 600,
            transition: 'all 0.2s',
          }}>
            {task.text}
          </span>
        </motion.button>
      ))}

      {/* Coach message */}
      {week.coachMsg && (
        <div style={{
          marginTop: '12px', padding: '12px',
          background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#7B61FF' }}>💬 โค้ช MITA+ พูดว่า</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{week.coachMsg}</p>
        </div>
      )}

      {/* Check-in CTA for current week */}
      {week.week === CREATOR.weekNo && !week.coachMsg && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCheckIn}
          style={{
            width: '100%', marginTop: '14px', padding: '12px',
            background: `${week.color}15`, border: `1px solid ${week.color}40`,
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <Bell size={14} style={{ color: week.color }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: week.color }}>
            แจ้งผลงานให้โค้ช → รับ feedback ทันที
          </span>
        </motion.button>
      )}
    </motion.div>
  )
}

// ── Main Page ───────────────────────────────────
export default function StarterPage() {
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'no_auth' | 'no_plan' | 'ok'>('loading')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [activeWeek, setActiveWeek] = useState(CREATOR.weekNo - 1)
  const [tab, setTab] = useState<'plan' | 'products' | 'milestones'>('plan')
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [coachReply, setCoachReply] = useState<string | null>(null)
  const [lineConnected, setLineConnected] = useState(false)
  const [showLineSetup, setShowLineSetup] = useState(false)
  const [lineToken, setLineToken] = useState('')
  const [lineLoading, setLineLoading] = useState(false)

  // ── Auth check ──────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) { setAuthState('ok'); return } // dev mode

    const checkProfile = async (userId: string) => {
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('user_profiles').upsert(
        {
          id: userId,
          email: userData.user?.email,
          name: userData.user?.user_metadata?.full_name
            ?? userData.user?.user_metadata?.name
            ?? userData.user?.email?.split('@')[0],
          plan: 'none',
        } as never,
        { onConflict: 'id', ignoreDuplicates: true }
      )
      const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single()
      if (!data) { setAuthState('no_plan'); return }
      const p = data as UserProfile
      setProfile(p)
      setAuthState(p.plan === 'starter' || p.plan === 'pro' ? 'ok' : 'no_plan')
    }

    let sub: { unsubscribe: () => void } | null = null

    const init = async () => {
      // 1️⃣ getSession() — อ่านจาก localStorage (session ถูกเก็บโดย /auth/callback แล้ว)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await checkProfile(session.user.id)
        return
      }

      // 2️⃣ fallback: ฟัง event (กรณี magic link หรือ session ยังไม่ sync)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
        if (sess?.user) {
          sub?.unsubscribe()
          await checkProfile(sess.user.id)
        } else if (event === 'INITIAL_SESSION') {
          setAuthState('no_auth')
        }
      })
      sub = subscription
    }

    init()
    return () => sub?.unsubscribe()
  }, [])

  // ── Loading ──────────────────────────────────────
  if (authState === 'loading') {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  // ── ยังไม่ login ─────────────────────────────────
  if (authState === 'no_auth') {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</span>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>เข้าสู่ระบบก่อนนะคะ</h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.7 }}>
          ต้อง login ก่อนเพื่อเข้าดูแผนของคุณค่ะ
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/login?redirect=/starter')}
          style={{
            padding: '14px 32px', background: '#7B61FF', color: '#fff',
            border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          เข้าสู่ระบบ →
        </motion.button>
      </div>
    )
  }

  // ── รอ approve ───────────────────────────────────
  if (authState === 'no_plan') {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: '56px', marginBottom: '20px' }}
        >
          ⏳
        </motion.div>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>รอยืนยันการชำระเงินอยู่ค่ะ</h2>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.75 }}>
          ทีม MITA+ จะเปิด access ให้ภายใน 24 ชั่วโมงค่ะ<br />
          ถ้าจ่ายแล้วยังไม่ได้รับ กรุณาทักที่ LINE OA ค่ะ
        </p>
        <div style={{
          padding: '14px 20px', width: '100%',
          background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)',
          borderRadius: '14px', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Login ด้วย</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#7B61FF' }}>
            {profile?.email ?? '—'}
          </p>
        </div>
        <p style={{ margin: '20px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
          ยังไม่ได้สมัคร? <a href="/" style={{ color: '#7B61FF' }}>กลับไปดูแผนค่ะ</a>
        </p>
      </div>
    )
  }

  const progressPct = Math.min((CREATOR.currentEarned / CREATOR.targetIncome) * 100, 100)

  const connectLine = async () => {
    if (!lineToken.trim()) return
    setLineLoading(true)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkin', lineToken,
          name: CREATOR.name, weekNo: CREATOR.weekNo,
        }),
      })
      const json = await res.json()
      if (json.success) { setLineConnected(true); setShowLineSetup(false) }
    } finally { setLineLoading(false) }
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* ── NAV ──────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${COLORS.bg}ee`, backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span className="gradient-purple-blue font-black text-lg">MITA+</span>
          <span style={{ marginLeft: '8px', fontSize: '10px', color: '#7B61FF', background: 'rgba(123,97,255,0.12)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
            Starter
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={14} style={{ color: '#FF9F1C' }} />
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#FF9F1C' }}>{CREATOR.streak} วันติด</span>
        </div>
      </nav>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ── HEADER ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: '12px', color: COLORS.textSecondary }}>
            สัปดาห์ที่ {CREATOR.weekNo} · เดือน 1
          </p>
          <h1 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
            แผนของ{CREATOR.name} 🎯
          </h1>
        </motion.div>

        {/* ── REVENUE PROGRESS ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            padding: '16px', marginBottom: '16px',
            background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(34,197,94,0.08))',
            border: '1px solid rgba(123,97,255,0.25)',
            borderRadius: RADIUS.card,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>รายได้เดือนนี้</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 900, color: '#22C55E', lineHeight: 1 }}>
                ฿{fmt(CREATOR.currentEarned)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>เป้าหมาย</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                ฿{fmt(CREATOR.targetIncome)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '6px' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(to right, #7B61FF, #22C55E)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              {Math.round(progressPct)}% ของเป้าหมาย
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#22C55E', fontWeight: 700 }}>
              ยังขาดอีก ฿{fmt(CREATOR.targetIncome - CREATOR.currentEarned)}
            </p>
          </div>
        </motion.div>

        {/* ── STATS ROW ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}
        >
          <StatPill icon={<Target size={14} style={{ color: '#7B61FF' }} />} label="ทำแล้ว" value="6/10" color="#7B61FF" />
          <StatPill icon={<TrendingUp size={14} style={{ color: '#22C55E' }} />} label="โตขึ้น" value="+฿340" color="#22C55E" />
          <StatPill icon={<Star size={14} style={{ color: '#FF9F1C' }} />} label="ระดับ" value="เริ่มต้น" color="#FF9F1C" />
        </motion.div>

        {/* ── LINE NOTIFICATION BANNER ─────────────── */}
        {!lineConnected && !showLineSetup && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLineSetup(true)}
            style={{
              width: '100%', marginBottom: '16px', padding: '12px 14px',
              background: 'rgba(6,199,85,0.08)', border: '1px solid rgba(6,199,85,0.25)',
              borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>💬</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#06C755' }}>เชื่อม LINE รับแจ้งเตือนทุกสัปดาห์</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>โค้ชจะ ping ตรง LINE ของคุณเลยค่ะ — กันลืม</p>
            </div>
            <ChevronRight size={14} style={{ color: '#06C755', flexShrink: 0 }} />
          </motion.button>
        )}

        {lineConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              marginBottom: '16px', padding: '12px 14px',
              background: 'rgba(6,199,85,0.06)', border: '1px solid rgba(6,199,85,0.2)',
              borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '22px' }}>✅</span>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#06C755' }}>เชื่อม LINE แล้วค่ะ!</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>โค้ชจะแจ้งเตือนทุกอาทิตย์ผ่าน LINE ค่ะ</p>
            </div>
          </motion.div>
        )}

        {/* LINE Setup Modal */}
        {showLineSetup && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '16px', padding: '16px',
              background: 'rgba(6,199,85,0.06)', border: '1px solid rgba(6,199,85,0.2)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#06C755' }}>💬 เชื่อม LINE Notify</p>
              <button onClick={() => setShowLineSetup(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>

            {/* Steps */}
            {[
              { n: '1', text: 'ไปที่ notify-bot.line.me/th แล้ว Login' },
              { n: '2', text: 'กด "Generate token" → ตั้งชื่อว่า "MITA+"' },
              { n: '3', text: 'Copy token มาวางด้านล่างนี้ค่ะ' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '99px', flexShrink: 0,
                  background: 'rgba(6,199,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#06C755',
                }}>
                  {s.n}
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}

            <a
              href="https://notify-bot.line.me/th"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block', textAlign: 'center', padding: '10px',
                background: '#06C755', color: '#fff',
                borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none', marginBottom: '12px', marginTop: '4px',
              }}
            >
              ไปหน้า LINE Notify →
            </a>

            <input
              value={lineToken}
              onChange={e => setLineToken(e.target.value)}
              placeholder="วาง Token ที่นี่ค่ะ..."
              style={{
                width: '100%', padding: '12px 14px', marginBottom: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', fontSize: '13px', color: '#fff',
                outline: 'none', boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={connectLine}
              disabled={!lineToken.trim() || lineLoading}
              style={{
                width: '100%', padding: '12px',
                background: lineToken.trim() ? '#06C755' : 'rgba(255,255,255,0.06)',
                color: lineToken.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: lineToken.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {lineLoading ? 'กำลังทดสอบ...' : 'ยืนยัน + รับแจ้งเตือนทันที'}
            </motion.button>
          </motion.div>
        )}

        {/* ── TABS ────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '6px', marginBottom: '16px',
          background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px',
        }}>
          {([
            { key: 'plan', label: '📅 แผนรายอาทิตย์' },
            { key: 'products', label: '🛍 สินค้า' },
            { key: 'milestones', label: '🏆 เป้าหมาย' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 4px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                fontWeight: 700, fontSize: '11px',
                background: tab === t.key ? '#7B61FF' : 'transparent',
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: PLAN ───────────────────────────── */}
        {tab === 'plan' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Coach nudge / reply */}
            {coachReply ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px',
                  padding: '14px',
                  background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)',
                  borderRadius: '14px',
                }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>💬</span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#7B61FF' }}>โค้ช MITA+ พูดว่า</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{coachReply}</p>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCheckInOpen(true)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
                  padding: '12px 14px', cursor: 'pointer',
                  background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.2)',
                  borderRadius: '14px', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '24px', flexShrink: 0 }}>🔔</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#FF9F1C' }}>โค้ช MITA+ รอฟังผลงานคุณอยู่</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>กดเช็คอิน → รับ feedback ทันทีค่ะ</p>
                </div>
                <ChevronRight size={14} style={{ color: '#FF9F1C', flexShrink: 0 }} />
              </motion.button>
            )}

            {/* Week cards */}
            {WEEKS.map((week, i) => (
              <div key={i}>
                <WeekCard week={week} isActive={activeWeek === i} onClick={() => setActiveWeek(i)} />
                {activeWeek === i && (
                  <TaskList week={week} onCheckIn={() => setCheckInOpen(true)} />
                )}
              </div>
            ))}

            {/* Monthly projection */}
            <div style={{
              ...CARD.base, padding: '16px', marginTop: '8px',
              background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)',
            }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#22C55E' }}>
                📈 ถ้าทำครบทุกอาทิตย์จะได้...
              </p>
              {[
                { label: 'สัปดาห์ 1', value: '฿340', done: true },
                { label: 'สัปดาห์ 2', value: '฿680', done: false },
                { label: 'สัปดาห์ 3', value: '฿1,200', done: false },
                { label: 'สัปดาห์ 4', value: '฿2,000', done: false },
                { label: 'เดือน 3', value: '฿8,500', done: false },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{ fontSize: '12px', color: row.done ? '#22C55E' : 'rgba(255,255,255,0.4)' }}>
                    {row.done ? '✅' : '○'} {row.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: row.done ? '#22C55E' : 'rgba(255,255,255,0.5)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TAB: PRODUCTS ───────────────────────── */}
        {tab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              MITA+ คัดมาเพราะคนดูของคุณ (หญิง 25-34 ชอบทำขนม) มีแนวโน้มซื้อสูงค่ะ
            </p>
            {PRODUCTS.map((p, i) => {
              const earn = Math.round(p.price * p.commission / 100)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ ...CARD.base, padding: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{p.img}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '13px' }}>{p.name}</p>
                      {p.hot && <span style={{ fontSize: '9px', color: '#FF4D4F', background: 'rgba(255,77,79,0.12)', padding: '1px 6px', borderRadius: '99px', fontWeight: 700 }}>HOT</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: COLORS.textSecondary }}>
                      ฿{p.price} · commission {p.commission}% · ได้ ฿{earn}/ชิ้น
                    </p>
                  </div>
                  <button style={{
                    background: '#7B61FF', color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                    คัดลอก link
                  </button>
                </motion.div>
              )
            })}

            <div style={{
              marginTop: '8px', padding: '14px',
              background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.15)',
              borderRadius: RADIUS.card, textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#7B61FF' }}>
                🔄 สินค้าอัพเดทใหม่ทุกอาทิตย์
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                MITA+ จะคัดสินค้า trending ตาม niche ของคุณให้ตลอดค่ะ
              </p>
            </div>
          </motion.div>
        )}

        {/* ── TAB: MILESTONES ─────────────────────── */}
        {tab === 'milestones' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              ปลดล็อกเป้าหมายทีละขั้น — ทำได้ทุกอันแน่นอนค่ะ
            </p>
            {MILESTONES.map((m, i) => {
              const pct = Math.min((m.current / m.target) * 100, 100)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    ...CARD.base,
                    padding: '16px', marginBottom: '10px',
                    background: m.done ? 'rgba(34,197,94,0.06)' : CARD.base.background,
                    border: m.done ? '1px solid rgba(34,197,94,0.2)' : CARD.base.border,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: m.done ? '0' : '10px' }}>
                    <span style={{ fontSize: '28px', filter: m.done ? 'none' : 'grayscale(80%)' }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: m.done ? '#22C55E' : '#fff' }}>
                          {m.label}
                        </p>
                        {m.done && (
                          <span style={{ fontSize: '10px', color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '1px 8px', borderRadius: '99px', fontWeight: 700 }}>
                            ✓ ทำแล้ว!
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                        {m.current.toLocaleString('th-TH')} / {m.target.toLocaleString('th-TH')} {m.unit}
                      </p>
                    </div>
                  </div>
                  {!m.done && (
                    <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ height: '100%', borderRadius: '99px', background: '#7B61FF' }}
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}

            {/* Motivation box */}
            <div style={{
              marginTop: '8px', padding: '16px',
              background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)',
              borderRadius: RADIUS.card,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#7B61FF' }}>
                💌 จาก MITA+
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                คุณเริ่มได้แล้ว ฿340 จากสัปดาห์แรก<br />
                ถ้าทำต่อเนื่องอีก 3 เดือน<br />
                เราจะไปถึง ฿8,500 ด้วยกันค่ะ 🎯
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── CHECK-IN MODAL ───────────────────────── */}
      <CheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onComplete={(msg) => {
          setCoachReply(msg)
          setCheckInOpen(false)
        }}
        weekNo={CREATOR.weekNo}
        creatorName={CREATOR.name}
        niche="food"
        platform={CREATOR.platform.toLowerCase()}
        targetIncome={CREATOR.targetIncome}
      />
    </div>
  )
}
