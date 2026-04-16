'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring, animate } from 'framer-motion'
import {
  AlertTriangle, TrendingUp, Target, Zap, ArrowRight,
  CheckCircle2, Clock, Phone, ChevronDown, ChevronUp, Flame
} from 'lucide-react'
import type { AuditResult, RevenueLeak, LeakSeverity } from '@/types'

// ── Utilities ──────────────────────────────────────────────
function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const SEVERITY_CONFIG: Record<LeakSeverity, { label: string; color: string; bg: string; border: string; dot: string }> = {
  critical: { label: '🔴 วิกฤต', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-500/40', dot: 'bg-red-500' },
  high:     { label: '🟠 สูง',   color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-500/30', dot: 'bg-orange-500' },
  medium:   { label: '🟡 กลาง', color: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  low:      { label: '🔵 ต่ำ',   color: 'text-blue-400',   bg: 'bg-blue-950/30',   border: 'border-blue-500/20',   dot: 'bg-blue-500' },
}

// ── Animated Counter ────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '', className = '', duration = 1.5 }: {
  target: number; prefix?: string; suffix?: string; className?: string; duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const hasRun = useRef(false)
  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    const ctrl = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [target, duration])
  return <span className={className}>{prefix}{Math.round(display).toLocaleString('th-TH')}{suffix}</span>
}

// ── Live Bleeding Counter (เงินที่หายไปทุกวินาที) ──────────
function BleedingCounter({ perMonth }: { perMonth: number }) {
  const perSecond = perMonth / (30 * 24 * 3600)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 100)
    return () => clearInterval(id)
  }, [])
  const lost = perSecond * elapsed
  return (
    <div className="text-red-400 font-black tabular-nums">
      ฿{lost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  )
}

// ── Score Arc ───────────────────────────────────────────────
function ScoreArc({ score }: { score: number }) {
  const r = 54; const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <motion.circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <text x="70" y="65" textAnchor="middle" fill="white" fontSize="26" fontWeight="900">{score}</text>
      <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">จาก 100</text>
    </svg>
  )
}

// ── Leak Card ───────────────────────────────────────────────
function LeakCard({ leak, index }: { leak: RevenueLeak; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const cfg = SEVERITY_CONFIG[leak.severity]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.08 }}
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      <button onClick={() => setOpen(o => !o)} className="w-full p-5 text-left flex items-start gap-4">
        <div className="shrink-0 mt-1">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} block`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>
          <h3 className="font-black text-white text-base">{leak.title}</h3>
          <p className={`text-sm font-semibold ${cfg.color} mt-0.5`}>{leak.painLine}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-red-400 font-black text-xl leading-none">-฿{fmt(leak.missedPerMonth)}</div>
          <div className="text-white/30 text-xs">/เดือน</div>
          <div className="text-white/20 text-xs">-฿{fmt(leak.missedPerYear)}/ปี</div>
        </div>
        <div className="shrink-0 text-white/30 ml-2 mt-1">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 pb-5 border-t border-white/5">
          <p className="text-white/60 text-sm leading-relaxed mt-4 mb-4">{leak.explanation}</p>
          <div className={`rounded-xl p-4 border ${cfg.border} bg-black/30`}>
            <p className={`text-sm font-bold ${cfg.color} leading-relaxed`}>{leak.shockSentence}</p>
          </div>
          <div className="mt-3 bg-white/3 rounded-xl p-3">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">ผลกระทบ</p>
            <p className="text-white/60 text-sm">{leak.impact}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<AuditResult | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('mita_result')
    if (!raw) { router.push('/audit'); return }
    setResult(JSON.parse(raw))
    setTimeout(() => setRevealed(true), 300)
  }, [router])

  if (!result) return (
    <div className="bg-[#080810] min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-sm">กำลังโหลด...</div>
    </div>
  )

  const { stage, score, leaks, revenueEstimation, recommendations, actionPlan, aiInsights, pricing, input } = result
  const totalLeakPerMonth = leaks.reduce((s, l) => s + l.missedPerMonth, 0)
  const dailyLoss = Math.round(totalLeakPerMonth / 30)
  const roi = Math.round((revenueEstimation.realistic - revenueEstimation.currentIncome) / pricing.premiumPrice * 100)

  return (
    <main className="bg-[#080810] min-h-screen text-white">

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080810]/90 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <span className="gradient-text font-black text-lg">MITA+</span>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            คุณกำลังเสียเงินอยู่ขณะนี้
          </div>
          <button
            onClick={() => document.getElementById('upgrade')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-full transition-all"
          >
            แก้ไขตอนนี้ →
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          SECTION 1: THE SHOCK HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-14 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Label */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-white/40 text-xs border border-white/10 px-3 py-1.5 rounded-full">
              รายงาน MITA+ สำหรับ {input.name} · {new Date().toLocaleDateString('th-TH')}
            </div>
          </motion.div>

          {/* HEADLINE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
            <p className="text-white/50 text-lg mb-3">{stage.emoji} {stage.label}</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
              คุณกำลังสูญเสีย<br />
              <span className="text-red-400">
                <AnimatedNumber target={totalLeakPerMonth} prefix="฿" suffix="/เดือน" duration={2} />
              </span><br />
              <span className="text-white/60 text-3xl md:text-4xl">โดยไม่รู้ตัว</span>
            </h1>
            <p className="text-red-300/80 text-xl font-semibold">{stage.shockLine}</p>
          </motion.div>

          {/* LIVE BLEEDING CLOCK */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto mb-6">
            <div className="rounded-3xl border border-red-500/30 bg-red-950/20 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
              <Flame className="text-red-500/60 mx-auto mb-3" size={28} />
              <p className="text-white/50 text-sm mb-2">นับตั้งแต่คุณเปิดหน้านี้ คุณเสียเงินไปแล้ว</p>
              <div className="text-4xl md:text-5xl font-black mb-2">
                <BleedingCounter perMonth={totalLeakPerMonth} />
              </div>
              <p className="text-white/30 text-xs">≈ ฿{fmt(dailyLoss)} ต่อวัน · ฿{fmt(totalLeakPerMonth)} ต่อเดือน · ฿{fmt(totalLeakPerMonth * 12)} ต่อปี</p>
            </div>
          </motion.div>

          {/* FOUND X LEAKS */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <AlertTriangle size={14} className="text-red-400" />
            พบ {leaks.length} จุดรั่วในระบบของคุณ
            <span className="text-red-400 font-bold">{leaks.filter(l => l.severity === 'critical' || l.severity === 'high').length} จุดวิกฤต</span>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2: SCORE BREAKDOWN (เงินที่ได้คืน = f(score))
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Monetization Score</p>
                <p className="text-white font-bold mb-4">
                  ระบบของคุณได้คะแนน{' '}
                  <span className={score.total >= 70 ? 'text-emerald-400' : score.total >= 45 ? 'text-amber-400' : 'text-red-400'}>
                    {score.total}/100
                  </span>
                  {' '}— ยังมีช่องว่าง <span className="text-white font-black">{100 - score.total} คะแนน</span> ที่เป็นเงินรออยู่
                </p>
                <div className="flex justify-center md:justify-start">
                  <ScoreArc score={score.total} />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Reach & Audience', val: score.breakdown.reach, max: 25, miss: 'ถ้าได้เต็ม = views เพิ่ม 2–3x' },
                  { label: 'Monetization Setup', val: score.breakdown.monetization, max: 25, miss: 'ถ้าได้เต็ม = income sources เพิ่ม' },
                  { label: 'Funnel & System', val: score.breakdown.funnel, max: 25, miss: 'ถ้าได้เต็ม = conversion เพิ่ม 4x' },
                  { label: 'Closing & Affiliate', val: score.breakdown.conversion, max: 15, miss: 'ถ้าได้เต็ม = ปิดการขายได้ทุก lead' },
                  { label: 'Product Quality', val: score.breakdown.product, max: 10, miss: 'ถ้าได้เต็ม = AOV เพิ่ม 3x' },
                ].map((item) => {
                  const pct = (item.val / item.max) * 100
                  const gap = item.max - item.val
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{item.label}</span>
                        <span className="text-white/40">{item.val}/{item.max}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }}
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
                      </div>
                      {gap > 0 && <p className="text-white/25 text-xs mt-0.5">{item.miss}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3: AI VERDICT — 4-Part Framework
          SHOCK → WHY → WHAT FIRST → UPSIDE
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-amber-400" size={20} />
            <h2 className="text-xl font-black">AI Strategist Verdict</h2>
          </div>
          <p className="text-white/30 text-xs mb-6 uppercase tracking-wider">วิเคราะห์โดย Elite Monetization AI · เฉพาะสำหรับ {input.name}</p>

          <div className="space-y-3">

            {/* 1. SHOCK */}
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl border border-red-500/35 bg-red-950/25 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xs font-black shrink-0">1</span>
                <p className="text-red-400 text-xs font-black uppercase tracking-widest">SHOCK — เงินที่เสียอยู่ตอนนี้</p>
              </div>
              <p className="text-white text-base leading-relaxed font-medium">{aiInsights.shock}</p>
            </motion.div>

            {/* 2. WHY IT HAPPENS */}
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="rounded-2xl border border-orange-500/25 bg-orange-950/15 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-xs font-black shrink-0">2</span>
                <p className="text-orange-400 text-xs font-black uppercase tracking-widest">WHY IT HAPPENS — ทำไมถึงเสียเงิน</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{aiInsights.whyItHappens}</p>
            </motion.div>

            {/* 3. WHAT FIRST */}
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
              className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-black shrink-0">3</span>
                <p className="text-amber-400 text-xs font-black uppercase tracking-widest">WHAT FIRST — ทำอะไรก่อน ทำได้เลยวันนี้</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{aiInsights.topActions}</p>
            </motion.div>

            {/* 4. UPSIDE */}
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0">4</span>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">UPSIDE — เงินที่จะได้กลับมา</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{aiInsights.upside}</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4: REVENUE LEAKS (แผลที่กำลังเลือดออก)
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={20} />
              <h2 className="text-xl font-black">จุดที่กำลังเลือดออกอยู่ตอนนี้</h2>
            </div>
            <div className="text-red-400 font-black text-lg">-฿{fmt(totalLeakPerMonth)}/เดือน</div>
          </div>
          <p className="text-white/35 text-xs mb-5">คลิกแต่ละจุดเพื่อดูตัวเลขที่หายไปและวิธีอุดทันที</p>
          <div className="space-y-3">
            {leaks.map((leak, i) => <LeakCard key={leak.id} leak={leak} index={i} />)}
          </div>

          {/* Total damage */}
          <div className="mt-5 p-5 rounded-2xl bg-black/40 border border-red-500/20 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-white/40 text-xs mb-1">ความเสียหายรวมต่อเดือน</p>
              <p className="text-red-400 font-black text-3xl">-฿{fmt(totalLeakPerMonth)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-1">ต่อปี (ที่ไม่มีวันได้คืน)</p>
              <p className="text-red-300 font-black text-2xl">-฿{fmt(totalLeakPerMonth * 12)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5: WHAT YOU COULD HAVE (เงินที่ควรได้)
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-emerald-400" size={20} />
            <h2 className="text-xl font-black">เงินที่ควรเข้ากระเป๋าคุณทุกเดือน</h2>
          </div>
          <p className="text-white/35 text-xs mb-6">คำนวณจาก {fmt(revenueEstimation.formula.monthlyViews)} views/เดือน × CTR {(revenueEstimation.formula.ctr * 100).toFixed(1)}% × Conversion Rate</p>

          {/* Current vs Potential */}
          <div className="glass rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/40 text-xs mb-1">รายได้ปัจจุบัน</p>
                <p className="text-white font-black text-2xl">฿{fmt(revenueEstimation.currentIncome)}<span className="text-white/30 text-sm font-normal">/เดือน</span></p>
              </div>
              <ArrowRight className="text-white/20" size={24} />
              <div className="text-right">
                <p className="text-emerald-400 text-xs mb-1 font-bold">ที่ควรได้จริง (Realistic)</p>
                <p className="text-emerald-400 font-black text-2xl">฿{fmt(revenueEstimation.realistic)}<span className="text-emerald-400/60 text-sm font-normal">/เดือน</span></p>
              </div>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: `${Math.min((revenueEstimation.currentIncome / revenueEstimation.realistic) * 100, 100)}%` }} />
            </div>
            <p className="text-white/30 text-xs mt-2">
              คุณดึงรายได้ได้แค่ {Math.round((revenueEstimation.currentIncome / Math.max(revenueEstimation.realistic, 1)) * 100)}% ของที่ควรได้
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ต่ำสุด', sublabel: 'แม้ทำแค่ขั้นต่ำ', value: revenueEstimation.conservative, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-950/15' },
              { label: 'ที่ควรได้จริง', sublabel: 'ถ้าวางระบบถูก', value: revenueEstimation.realistic, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/15', highlight: true },
              { label: 'โอกาสสูงสุด', sublabel: 'ถ้า optimize เต็มที่', value: revenueEstimation.aggressive, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/15' },
            ].map((t) => (
              <div key={t.label} className={`rounded-xl p-4 border ${t.border} ${t.bg} text-center ${t.highlight ? 'ring-1 ring-amber-500/30' : ''}`}>
                <p className="text-white/40 text-xs mb-0.5">{t.label}</p>
                <p className="text-white/30 text-xs mb-2">{t.sublabel}</p>
                <p className={`font-black text-xl ${t.color}`}>฿{fmt(t.value)}</p>
                <p className="text-white/25 text-xs">/เดือน</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
            <p className="text-amber-400 font-black text-center">
              ช่องว่างรายได้ = ฿{fmt(revenueEstimation.realistic - revenueEstimation.currentIncome)}/เดือน
              <span className="text-white/40 font-normal text-sm"> · ฿{fmt((revenueEstimation.realistic - revenueEstimation.currentIncome) * 12)}/ปี</span>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6: TOP MOVES (3 วิธีที่เอาเงินกลับมาได้เร็วที่สุด)
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-amber-400" size={20} />
            <h2 className="text-xl font-black">3 วิธีที่เอาเงินกลับมาได้เร็วที่สุด</h2>
          </div>
          <p className="text-white/35 text-xs mb-6">เลือกตาม profile ของคุณ — ไม่ใช่สูตรสำเร็จจากอินเทอร์เน็ต</p>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <motion.div key={rec.type} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-colors"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 font-black shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black text-white text-base">{rec.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${rec.difficulty === 'easy' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' : rec.difficulty === 'medium' ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' : 'text-red-400 border-red-500/30 bg-red-950/20'}`}>
                        {rec.difficulty === 'easy' ? '✓ เริ่มง่าย' : rec.difficulty === 'medium' ? '~ ปานกลาง' : '! ท้าทาย'}
                      </span>
                      <span className="text-white/30 text-xs">{rec.timeToRevenue}</span>
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed">{rec.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-emerald-400 font-black text-lg leading-none">฿{fmt(rec.estimatedRevenueLow)}</div>
                    <div className="text-white/30 text-xs">–฿{fmt(rec.estimatedRevenueHigh)}</div>
                    <div className="text-white/20 text-xs">/เดือน</div>
                  </div>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-4">
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1.5">ทำได้เลยตอนนี้:</p>
                  <p className="text-white/70 text-sm leading-relaxed">{rec.exampleAction}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7: ACTION PLAN — cost of waiting
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Cost of waiting header */}
          <div className="mb-6 p-5 rounded-2xl border border-red-500/20 bg-red-950/15">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-red-400" size={18} />
              <p className="text-red-400 font-black text-sm uppercase tracking-wider">ต้นทุนของการรอ</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'รอ 30 วัน', cost: totalLeakPerMonth },
                { label: 'รอ 3 เดือน', cost: totalLeakPerMonth * 3 },
                { label: 'รอ 1 ปี', cost: totalLeakPerMonth * 12 },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-white/40 text-xs mb-1">{item.label}</p>
                  <p className="text-red-400 font-black text-lg">-฿{fmt(item.cost)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <h2 className="text-xl font-black">แผน 90 วัน — ดึงเงินกลับมาทีละก้าว</h2>
          </div>

          {[
            { label: '30 วันแรก', sublabel: `เป้าหมาย: +฿${fmt(actionPlan.day30.reduce((s,i)=>s+i.revenueImpact,0))}/เดือน`, items: actionPlan.day30, color: 'text-amber-400', border: 'border-amber-500/20', accent: 'bg-amber-500' },
            { label: 'วันที่ 31–60', sublabel: `เป้าหมาย: +฿${fmt(actionPlan.day60.reduce((s,i)=>s+i.revenueImpact,0))}/เดือน`, items: actionPlan.day60, color: 'text-blue-400', border: 'border-blue-500/20', accent: 'bg-blue-500' },
            { label: 'วันที่ 61–90', sublabel: `เป้าหมาย: +฿${fmt(actionPlan.day90.reduce((s,i)=>s+i.revenueImpact,0))}/เดือน`, items: actionPlan.day90, color: 'text-emerald-400', border: 'border-emerald-500/20', accent: 'bg-emerald-500' },
          ].map((phase, pi) => (
            <motion.div key={phase.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: pi * 0.1 }}
              className={`glass rounded-2xl border ${phase.border} mb-4 overflow-hidden`}
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className={`font-black text-base ${phase.color}`}>{phase.label}</h3>
                  <p className="text-emerald-400 text-sm font-semibold">{phase.sublabel}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${phase.accent}`} />
              </div>
              <div className="p-4 space-y-3">
                {phase.items.map((item, i) => (
                  <div key={i} className="bg-white/3 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className={`${phase.color} shrink-0 mt-0.5`} size={15} />
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{item.action}</p>
                        <p className="text-white/35 text-xs mt-0.5">{item.expectedOutcome}</p>
                      </div>
                      <span className={`${phase.color} font-black text-sm shrink-0`}>+฿{fmt(item.revenueImpact)}</span>
                    </div>
                    <div className="bg-black/25 rounded-lg p-3 border-l-2 border-white/10">
                      <p className="text-white/35 text-xs font-bold uppercase tracking-wider mb-1">ตัวอย่างทำได้เลย:</p>
                      <p className="text-white/65 text-xs leading-relaxed">{item.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 8: UPGRADE CTA — THE CLOSER
      ══════════════════════════════════════════════════════ */}
      <section id="upgrade" className="px-6 py-16">
        <div className="max-w-4xl mx-auto">

          {/* THE DECISION FRAME */}
          <div className="text-center mb-10">
            <p className="text-white/40 text-sm mb-3">ตอนนี้คุณมีทางเลือก 2 ทาง</p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <div className="rounded-2xl border border-red-500/20 bg-red-950/15 p-5 text-left">
                <p className="text-red-400 font-black mb-2">ทางที่ 1: ไม่ทำอะไร</p>
                <ul className="space-y-1 text-sm text-white/50">
                  <li>• เสีย ฿{fmt(totalLeakPerMonth)} ต่อไปทุกเดือน</li>
                  <li>• เสีย ฿{fmt(totalLeakPerMonth * 12)} ปีนี้</li>
                  <li>• คู่แข่งวางระบบก่อนคุณ</li>
                  <li>• Algorithm เปลี่ยน คุณพลาดหมด</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 text-left">
                <p className="text-emerald-400 font-black mb-2">ทางที่ 2: วางระบบตอนนี้</p>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• ดึง ฿{fmt(revenueEstimation.realistic)}/เดือนกลับมา</li>
                  <li>• คืนทุนใน 30 วัน (ROI {roi}%)</li>
                  <li>• ระบบทำงานแม้คุณนอนหลับ</li>
                  <li>• เริ่มต้นตอนนี้ก่อนสายเกินไป</li>
                </ul>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              เลือก<span className="gradient-text">ดึงเงิน ฿{fmt(revenueEstimation.totalMissed)}</span>กลับมา
            </h2>
            <p className="text-white/50">{pricing.urgencyMessage}</p>
          </div>

          {/* PRICING CARDS */}
          <div className="grid md:grid-cols-3 gap-4">

            {/* STARTER */}
            <div className="glass rounded-2xl p-6">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Paid Report</p>
              <div className="text-3xl font-black text-white mb-0.5">฿{fmt(pricing.reportPrice)}</div>
              <p className="text-white/30 text-xs mb-5">จ่ายครั้งเดียว · ได้รายงานฉบับเต็ม</p>
              <ul className="space-y-2 mb-6 text-sm">
                {['Revenue Leak ฉบับเต็มพร้อมวิธีแก้', 'แผน 90 วันแบบละเอียด', 'Script ปิดการขาย DM', 'Template Funnel สำเร็จรูป', 'Affiliate strategy ที่ทำได้ทันที'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-white/55">
                    <CheckCircle2 className="text-amber-400/70 shrink-0 mt-0.5" size={14} />{item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all text-sm font-bold">รับ Report ฉบับเต็ม →</button>
            </div>

            {/* PREMIUM — HERO */}
            <div className="glass rounded-2xl p-6 border border-amber-500/50 relative overflow-hidden">
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                คืนทุนใน 30 วัน
              </div>
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2 mt-2">Premium Setup</p>
              <div className="text-3xl font-black text-white mb-0.5">฿{fmt(pricing.premiumPrice)}</div>
              <p className="text-white/30 text-xs mb-1">วางระบบให้จบใน 30 วัน</p>
              <p className="text-emerald-400 text-xs font-semibold mb-5">ROI {roi}% ใน 30 วัน</p>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  `ทุกอย่างใน Report +`,
                  `วาง Funnel ให้ดักลูกค้า 24 ชม.`,
                  `ตั้ง Affiliate + Closing system`,
                  `สร้าง/ปรับ product ให้ขายได้`,
                  `Support ตลอด 30 วัน`,
                  `ประกันผล: คืนทุนหรือ refund`,
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-white/75">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={14} />{item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black transition-all flex items-center justify-center gap-2 text-base">
                เริ่มวางระบบตอนนี้ <ArrowRight size={16} />
              </button>
              <p className="text-center text-white/25 text-xs mt-3">ทุกวันที่รอ = -฿{fmt(dailyLoss)} เพิ่ม</p>
            </div>

            {/* REVENUE SHARE */}
            <div className="glass rounded-2xl p-6">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Revenue Share</p>
              <div className="text-3xl font-black text-white mb-0.5">10–30%</div>
              <p className="text-white/30 text-xs mb-5">ของรายได้ที่เพิ่มขึ้น · จ่ายเมื่อได้เงิน</p>
              <ul className="space-y-2 mb-6 text-sm">
                {['ไม่มีค่าใช้จ่ายล่วงหน้า', 'ทีมเราทำทุกอย่างให้', 'แบ่ง % เฉพาะเงินที่เพิ่ม', 'สำหรับ Creator 50K+/เดือน', 'Long-term partnership'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-white/55">
                    <CheckCircle2 className="text-emerald-400/70 shrink-0 mt-0.5" size={14} />{item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:border-white/25 hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2">
                <Phone size={14} /> คุยกับทีม
              </button>
            </div>
          </div>

          {/* FINAL URGENCY LINE */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-red-400/70 text-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              ทุกวันที่ผ่านไปโดยไม่วางระบบ คุณเสีย ฿{fmt(dailyLoss)} — ไม่มีวันได้คืน
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5 text-center text-white/20 text-xs">
        <span className="gradient-text font-bold">MITA+</span> — Money In The Air · ผลการวิเคราะห์นี้อิงจากข้อมูลที่คุณกรอก
      </footer>
    </main>
  )
}
