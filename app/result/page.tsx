'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, animate } from 'framer-motion'
import {
  TrendingUp, Target, Zap, ArrowRight,
  CheckCircle2, Clock, ChevronDown, ChevronUp,
  BarChart3, Sparkles, Phone
} from 'lucide-react'
import type { AuditResult, RevenueLeak, LeakSeverity } from '@/types'

// ── Utilities ─────────────────────────────────────────────
function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const SEVERITY_CONFIG: Record<LeakSeverity, { label: string; color: string; bg: string; border: string; dot: string }> = {
  critical: { label: 'Critical', color: 'text-rose-400',   bg: 'bg-rose-950/20',   border: 'border-rose-500/25',   dot: 'bg-rose-500' },
  high:     { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-950/15', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   color: 'text-amber-400',  bg: 'bg-amber-950/10',  border: 'border-amber-500/18',  dot: 'bg-amber-500' },
  low:      { label: 'Low',      color: 'text-blue-400',   bg: 'bg-blue-950/10',   border: 'border-blue-500/15',   dot: 'bg-blue-500' },
}

// ── Animated Number ────────────────────────────────────────
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

// ── Score Arc ─────────────────────────────────────────────
function ScoreArc({ score }: { score: number }) {
  const r = 52; const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#818cf8'
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
      <motion.circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <text x="65" y="61" textAnchor="middle" fill="white" fontSize="24" fontWeight="900">{score}</text>
      <text x="65" y="77" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">จาก 100</text>
    </svg>
  )
}

// ── Blocker Card ──────────────────────────────────────────
function BlockerCard({ leak, index }: { leak: RevenueLeak; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const cfg = SEVERITY_CONFIG[leak.severity]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      <button onClick={() => setOpen(o => !o)} className="w-full p-5 text-left flex items-start gap-4">
        <div className="shrink-0 mt-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} block`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold ${cfg.color} uppercase tracking-wider`}>{cfg.label}</span>
          <h3 className="font-bold text-white text-sm mt-0.5">{leak.title}</h3>
          <p className={`text-xs ${cfg.color} mt-0.5 opacity-80`}>{leak.painLine}</p>
        </div>
        <div className="shrink-0 text-right ml-3">
          <div className="text-amber-400 font-black text-lg leading-none">฿{fmt(leak.missedPerMonth)}</div>
          <div className="text-white/25 text-xs">/เดือน missed</div>
        </div>
        <div className="shrink-0 text-white/25 ml-1 mt-1">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="px-5 pb-5 border-t border-white/5"
        >
          <p className="text-white/52 text-sm leading-relaxed mt-4 mb-4">{leak.explanation}</p>
          <div className={`rounded-xl p-3.5 border ${cfg.border}`} style={{ background: 'rgba(0,0,0,0.2)' }}>
            <p className={`text-sm font-medium ${cfg.color} leading-relaxed`}>{leak.shockSentence}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<AuditResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('mita_result')
    if (!raw) { router.push('/audit'); return }
    setResult(JSON.parse(raw))
  }, [router])

  if (!result) return (
    <div className="bg-[#08080f] min-h-screen flex items-center justify-center">
      <div className="text-white/30 text-sm">กำลังโหลด...</div>
    </div>
  )

  const { stage, score, leaks, revenueEstimation, recommendations, actionPlan, aiInsights, pricing, input } = result
  const totalLeakPerMonth = leaks.reduce((s, l) => s + l.missedPerMonth, 0)
  const dailyLoss = Math.round(totalLeakPerMonth / 30)
  const revenueGap = revenueEstimation.realistic - revenueEstimation.currentIncome

  return (
    <main className="bg-[#08080f] min-h-screen text-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#08080f]/90 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <span className="gradient-brand font-black text-lg">MITA+</span>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-white/35 text-xs">
            <Sparkles size={11} className="text-violet-400" />
            Report สำหรับ {input.name}
          </div>
          <button
            onClick={() => document.getElementById('upgrade')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-full transition-all"
          >
            ดูแผนทั้งหมด
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1: SCORE HERO
      ══════════════════════════════════════════ */}
      <section className="relative px-6 pt-14 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Report label */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2 text-white/28 text-xs border border-white/8 px-3 py-1.5 rounded-full">
              รายงาน MITA+ · {input.name} · {new Date().toLocaleDateString('th-TH')}
            </div>
          </motion.div>

          {/* Score + Stage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-6 mb-6">
              <ScoreArc score={score.total} />
              <div className="text-left">
                <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-1">Monetization Score</p>
                <p className="text-white font-black text-2xl">{score.total}<span className="text-white/30 font-normal text-base">/100</span></p>
                <p className="text-white/50 text-sm mt-1">{stage.emoji} {stage.label}</p>
              </div>
            </div>
            <p className="text-white/45 text-base max-w-lg mx-auto leading-relaxed">{stage.shockLine}</p>
          </motion.div>

          {/* Revenue Gap highlight */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="max-w-2xl mx-auto">
            <div className="card rounded-2xl p-7 text-center border-violet-500/15" style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}>
              <p className="text-white/38 text-sm mb-2">Revenue Gap ของคุณ</p>
              <div className="text-4xl md:text-5xl font-black mb-1">
                <AnimatedNumber target={revenueGap} prefix="฿" suffix="/เดือน" className="gradient-money" duration={2} />
              </div>
              <p className="text-white/30 text-sm">
                รายได้ปัจจุบัน ฿{fmt(revenueEstimation.currentIncome)} → ควรได้ ฿{fmt(revenueEstimation.realistic)}/เดือน
              </p>
              <div className="mt-5 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((revenueEstimation.currentIncome / Math.max(revenueEstimation.realistic, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
              <p className="text-white/25 text-xs mt-2">
                คุณดึงรายได้ได้ {Math.round((revenueEstimation.currentIncome / Math.max(revenueEstimation.realistic, 1)) * 100)}% ของที่ควรได้
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2: SCORE BREAKDOWN
      ══════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-5">
            <BarChart3 className="text-violet-400" size={18} />
            <h2 className="text-lg font-black">Score Breakdown</h2>
          </div>
          <div className="card rounded-2xl p-6">
            <div className="space-y-4">
              {[
                { label: 'Reach & Audience', val: score.breakdown.reach, max: 25, hint: 'views & follower quality' },
                { label: 'Monetization Setup', val: score.breakdown.monetization, max: 25, hint: 'income streams active' },
                { label: 'Funnel & System', val: score.breakdown.funnel, max: 25, hint: 'conversion infrastructure' },
                { label: 'Closing & Affiliate', val: score.breakdown.conversion, max: 15, hint: 'sales closing rate' },
                { label: 'Product Quality', val: score.breakdown.product, max: 10, hint: 'AOV & margin' },
              ].map((item) => {
                const pct = (item.val / item.max) * 100
                return (
                  <div key={item.label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-white/60 text-sm">{item.label}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-white/25 text-xs">{item.hint}</span>
                        <span className="text-white/50 text-xs font-mono">{item.val}/{item.max}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#818cf8' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3: AI VERDICT — 4-Part Framework
      ══════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-1">
            <Zap className="text-amber-400" size={18} />
            <h2 className="text-lg font-black">AI Verdict</h2>
          </div>
          <p className="text-white/25 text-xs mb-5 uppercase tracking-wider">วิเคราะห์โดย Monetization AI · เฉพาะสำหรับ {input.name}</p>

          <div className="space-y-3">
            {[
              {
                n: '1', label: 'สถานการณ์ปัจจุบัน', sublabel: 'Revenue Gap',
                color: 'text-rose-300', border: 'rgba(244,63,94,0.18)', bg: 'rgba(244,63,94,0.05)',
                text: aiInsights.shock,
              },
              {
                n: '2', label: 'ทำไมถึงเกิดขึ้น', sublabel: 'Root Cause',
                color: 'text-orange-300', border: 'rgba(249,115,22,0.15)', bg: 'rgba(249,115,22,0.04)',
                text: aiInsights.whyItHappens,
              },
              {
                n: '3', label: 'ทำอะไรก่อน', sublabel: 'First Move',
                color: 'text-amber-300', border: 'rgba(245,158,11,0.18)', bg: 'rgba(245,158,11,0.04)',
                text: aiInsights.topActions,
              },
              {
                n: '4', label: 'ถ้าแก้แล้วจะได้อะไร', sublabel: 'Upside',
                color: 'text-emerald-300', border: 'rgba(16,185,129,0.18)', bg: 'rgba(16,185,129,0.04)',
                text: aiInsights.upside,
              },
            ].map((item, i) => (
              <motion.div
                key={item.n}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5"
                style={{ border: `1px solid ${item.border}`, background: item.bg }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                    <span className={item.color}>{item.n}</span>
                  </span>
                  <span className={`text-xs font-black uppercase tracking-wider ${item.color}`}>{item.label}</span>
                  <span className="text-white/20 text-xs">· {item.sublabel}</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4: REVENUE BLOCKERS
      ══════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Total loss hero */}
          <div className="card rounded-2xl p-5 mb-5 border-rose-500/18" style={{ borderColor: 'rgba(244,63,94,0.18)', background: 'rgba(244,63,94,0.04)' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/40 text-xs mb-1">เงินที่ยังไม่ได้รับต่อเดือน</p>
                <p className="text-rose-400 font-black text-3xl">-฿{fmt(totalLeakPerMonth)}<span className="text-rose-400/50 font-normal text-base">/เดือน</span></p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs mb-1">ต่อปี (ถ้าไม่แก้ตอนนี้)</p>
                <p className="text-rose-300/70 font-black text-2xl">-฿{fmt(totalLeakPerMonth * 12)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-white/35 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              พบ {leaks.length} จุดที่ดึงเงินออก — {leaks.filter(l => l.severity === 'critical' || l.severity === 'high').length} จุดหลักที่ต้องแก้ก่อน
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black">Revenue Blockers</h2>
            </div>
          </div>
          <p className="text-white/25 text-xs mb-4">คลิกแต่ละจุดเพื่อดูว่าเสียเงินไปยังไง และต้องแก้ยังไง</p>
          <div className="space-y-2.5">
            {leaks.map((leak, i) => <BlockerCard key={leak.id} leak={leak} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5: REVENUE POTENTIAL
      ══════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-5">
            <TrendingUp className="text-emerald-400" size={18} />
            <h2 className="text-lg font-black">Revenue Potential</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Conservative', sublabel: 'ทำขั้นต่ำ', value: revenueEstimation.conservative, color: 'text-blue-400', border: 'border-blue-500/15' },
              { label: 'Realistic', sublabel: 'วางระบบถูก', value: revenueEstimation.realistic, color: 'text-amber-400', border: 'border-amber-500/25', highlight: true },
              { label: 'Aggressive', sublabel: 'Optimize เต็ม', value: revenueEstimation.aggressive, color: 'text-emerald-400', border: 'border-emerald-500/20' },
            ].map((t) => (
              <div key={t.label} className={`card rounded-xl p-4 border text-center ${t.border} ${t.highlight ? 'ring-1 ring-amber-500/20' : ''}`}>
                <p className="text-white/35 text-xs mb-0.5 font-semibold">{t.label}</p>
                <p className="text-white/20 text-xs mb-2">{t.sublabel}</p>
                <p className={`font-black text-xl ${t.color}`}>฿{fmt(t.value)}</p>
                <p className="text-white/20 text-xs">/เดือน</p>
              </div>
            ))}
          </div>

          <div className="card rounded-xl p-4 text-center border-amber-500/12" style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
            <p className="text-amber-400 font-black">
              Revenue Gap = ฿{fmt(revenueGap)}/เดือน
              <span className="text-white/30 font-normal text-sm"> · ฿{fmt(revenueGap * 12)}/ปี</span>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6: TOP MOVES
      ══════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-1">
            <Target className="text-amber-400" size={18} />
            <h2 className="text-lg font-black">Top Moves สำหรับคุณ</h2>
          </div>
          <p className="text-white/25 text-xs mb-5">เลือกตาม Profile ของคุณ ไม่ใช่ formula ทั่วไป</p>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.type}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-white text-sm">{rec.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                        rec.difficulty === 'easy'
                          ? 'text-emerald-400 border-emerald-500/25 bg-emerald-950/15'
                          : rec.difficulty === 'medium'
                          ? 'text-amber-400 border-amber-500/25 bg-amber-950/10'
                          : 'text-rose-400 border-rose-500/25 bg-rose-950/10'
                      }`}>
                        {rec.difficulty === 'easy' ? 'เริ่มง่าย' : rec.difficulty === 'medium' ? 'ปานกลาง' : 'ท้าทาย'}
                      </span>
                      <span className="text-white/22 text-xs">{rec.timeToRevenue}</span>
                    </div>
                    <p className="text-white/45 text-xs leading-relaxed mb-3">{rec.rationale}</p>
                    <div className="bg-emerald-950/15 border border-emerald-500/12 rounded-xl p-3">
                      <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">ทำได้เลยตอนนี้</p>
                      <p className="text-white/60 text-xs leading-relaxed">{rec.exampleAction}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-emerald-400 font-black text-base">฿{fmt(rec.estimatedRevenueLow)}</div>
                    <div className="text-white/22 text-xs">–฿{fmt(rec.estimatedRevenueHigh)}/เดือน</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7: ACTION PLAN 30/60/90
      ══════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-1">
            <Clock className="text-violet-400" size={18} />
            <h2 className="text-lg font-black">แผน 90 วัน</h2>
          </div>
          <p className="text-white/25 text-xs mb-5">ดึง Revenue Gap กลับมาทีละก้าว — พร้อมตัวเลขต่อขั้น</p>

          {[
            { label: '30 วันแรก', items: actionPlan.day30, color: 'text-amber-400', border: 'border-amber-500/18', accent: 'bg-amber-500' },
            { label: 'วันที่ 31–60', items: actionPlan.day60, color: 'text-violet-400', border: 'border-violet-500/18', accent: 'bg-violet-500' },
            { label: 'วันที่ 61–90', items: actionPlan.day90, color: 'text-emerald-400', border: 'border-emerald-500/18', accent: 'bg-emerald-500' },
          ].map((phase, pi) => (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: pi * 0.08 }}
              className={`card rounded-2xl border ${phase.border} mb-3 overflow-hidden`}
            >
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${phase.accent}`} />
                  <h3 className={`font-black text-sm ${phase.color}`}>{phase.label}</h3>
                </div>
                <span className="text-emerald-400 text-xs font-semibold">
                  +฿{fmt(phase.items.reduce((s, i) => s + i.revenueImpact, 0))}/เดือน
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {phase.items.map((item, i) => (
                  <div key={i} className="bg-white/2 rounded-xl p-4 border border-white/4">
                    <div className="flex items-start gap-3 mb-2.5">
                      <CheckCircle2 className={`${phase.color} shrink-0 mt-0.5`} size={13} />
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{item.action}</p>
                        <p className="text-white/30 text-xs mt-0.5">{item.expectedOutcome}</p>
                      </div>
                      <span className={`${phase.color} font-black text-sm shrink-0`}>+฿{fmt(item.revenueImpact)}</span>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2.5 border-l-2 border-white/8">
                      <p className="text-white/25 text-xs font-bold uppercase tracking-wider mb-1">ตัวอย่าง</p>
                      <p className="text-white/55 text-xs leading-relaxed">{item.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8: CTA / UPGRADE
      ══════════════════════════════════════════ */}
      <section id="upgrade" className="px-6 py-16">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/18 text-emerald-400 text-xs px-4 py-2 rounded-full mb-5 font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Creator ที่วางระบบแล้ว เริ่มเห็นเงินเพิ่มภายใน 7 วัน
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              ดึง<span className="gradient-money"> ฿{fmt(revenueGap)} </span>กลับมา
            </h2>
            <p className="text-white/38 text-base mb-2">{pricing.valueProposition}</p>
            <p className="text-white/25 text-sm">
              ฿{fmt(revenueGap)}/เดือน = <span className="text-rose-400/70 font-semibold">฿{fmt(revenueGap * 12)}/ปี</span> ที่ยังรออยู่
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {/* REPORT */}
            <div className="card rounded-2xl p-6">
              <p className="text-white/25 text-xs uppercase tracking-wider mb-2">Paid Report</p>
              <div className="text-3xl font-black text-white mb-0.5">฿{fmt(pricing.reportPrice)}</div>
              <p className="text-white/25 text-xs mb-5">จ่ายครั้งเดียว · รายงานฉบับเต็ม</p>
              <ul className="space-y-2 mb-6">
                {['Revenue Leak ฉบับเต็มพร้อมวิธีแก้', 'แผน 90 วันแบบละเอียด', 'Script ปิดการขาย DM', 'Template Funnel สำเร็จรูป', 'Affiliate strategy ทำได้ทันที'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-white/48 text-xs">
                    <CheckCircle2 className="text-white/25 shrink-0 mt-0.5" size={12} />{item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:border-white/22 hover:text-white/80 transition-all text-sm font-semibold">
                รับ Report ฉบับเต็ม →
              </button>
            </div>

            {/* PREMIUM — FEATURED */}
            <div className="card rounded-2xl p-6 border-amber-500/35 relative overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.35)' }}>
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-400" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                แนะนำ
              </div>
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2 mt-2">Premium Setup</p>
              <div className="text-3xl font-black text-white mb-0.5">฿{fmt(pricing.premiumPrice)}</div>
              <p className="text-white/25 text-xs mb-5">วางระบบให้จบใน 30 วัน</p>
              <ul className="space-y-2 mb-6">
                {[
                  'ทุกอย่างใน Report +',
                  'วาง Funnel ดักลูกค้า 24 ชม.',
                  'ตั้ง Affiliate + Closing system',
                  'สร้าง/ปรับ product ให้ขายได้',
                  'Support ตลอด 30 วัน',
                  'ประกันผล: คืนทุนหรือ refund',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-white/70 text-xs">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={12} />{item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black transition-all flex items-center justify-center gap-2 text-sm">
                เริ่มวางระบบ <ArrowRight size={14} />
              </button>
              <p className="text-center text-white/22 text-xs mt-3">คืนทุนใน 30 วัน · เริ่มเห็นเงินใน 7 วัน</p>
              <div className="mt-3 p-3 rounded-xl bg-black/20 border border-amber-500/10 text-center">
                <p className="text-white/30 text-xs">Revenue Gap ของคุณ</p>
                <p className="text-amber-400 font-black text-sm">฿{fmt(revenueGap)}/เดือน = ฿{fmt(revenueGap * 12)}/ปี</p>
              </div>
            </div>

            {/* REVENUE SHARE */}
            <div className="card rounded-2xl p-6">
              <p className="text-white/25 text-xs uppercase tracking-wider mb-2">Revenue Share</p>
              <div className="text-3xl font-black text-white mb-0.5">10–30%</div>
              <p className="text-white/25 text-xs mb-5">ของรายได้ที่เพิ่มขึ้น</p>
              <ul className="space-y-2 mb-6">
                {['ไม่มีค่าใช้จ่ายล่วงหน้า', 'ทีมเราทำทุกอย่างให้', 'แบ่ง % เฉพาะเงินที่เพิ่ม', 'สำหรับ Creator 50K+/เดือน', 'Long-term partnership'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-white/48 text-xs">
                    <CheckCircle2 className="text-white/25 shrink-0 mt-0.5" size={12} />{item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:border-white/22 hover:text-white/80 transition-all text-sm font-semibold flex items-center justify-center gap-2">
                <Phone size={13} /> นัดคุยกับทีม
              </button>
            </div>

          </div>

          <div className="mt-8 text-center text-white/20 text-xs">
            ทุก ฿{fmt(dailyLoss)} ที่ไม่ได้รับ คือ gap ที่ยังปิดไม่ได้ — ไม่ใช่เงินที่หายไป
          </div>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-white/5 text-center text-white/18 text-xs">
        <span className="gradient-brand font-black">MITA+</span> — Money In The Air · ผลการวิเคราะห์อิงจากข้อมูลที่คุณกรอก
      </footer>
    </main>
  )
}
