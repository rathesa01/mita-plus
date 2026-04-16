'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { AuditFormData, Platform, Niche, PostingFrequency, MonthlyIncomeRange, IncomeSource } from '@/types'

// ── Loading Screen ─────────────────────────────────────────
const LOADING_STEPS = [
  { text: 'กำลังวิเคราะห์ Audience & Reach...', pct: 15 },
  { text: 'ตรวจหา Revenue Blocker ในระบบ...', pct: 35 },
  { text: 'คำนวณ Revenue Gap ต่อเดือน...', pct: 55 },
  { text: 'AI กำลัง Generate แผนทำเงิน...', pct: 75 },
  { text: 'เตรียม Report สำหรับคุณโดยเฉพาะ...', pct: 92 },
]

function AnalyzingScreen({ name }: { name: string }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    LOADING_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => { setStepIdx(i); setPct(s.pct) }, i * 1400))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="bg-[#08080f] min-h-screen text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Spinner */}
        <div className="relative mx-auto w-16 h-16 mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-black mb-1.5">กำลังวิเคราะห์ {name}</h2>
        <p className="text-white/35 text-sm mb-10">AI กำลังประเมิน Monetization Score และ Revenue Gap ของคุณ</p>

        {/* Progress bar */}
        <div className="h-px bg-white/8 rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-white/38 text-sm h-5"
          >
            {LOADING_STEPS[stepIdx]?.text}
          </motion.p>
        </AnimatePresence>

        <p className="text-violet-400 font-black text-base mt-5">{pct}%</p>
      </div>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────
const TOTAL_STEPS = 4

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { value: 'instagram', label: 'Instagram', emoji: '📸' },
  { value: 'youtube', label: 'YouTube', emoji: '▶️' },
  { value: 'facebook', label: 'Facebook', emoji: '📘' },
  { value: 'multi', label: 'หลายแพลตฟอร์ม', emoji: '🌐' },
]

const NICHES: { value: Niche; label: string }[] = [
  { value: 'lifestyle', label: 'ไลฟ์สไตล์' },
  { value: 'education', label: 'การศึกษา / สอน' },
  { value: 'finance', label: 'การเงิน / ลงทุน' },
  { value: 'entertainment', label: 'ความบันเทิง' },
  { value: 'beauty', label: 'ความงาม' },
  { value: 'fitness', label: 'ออกกำลังกาย / สุขภาพ' },
  { value: 'business', label: 'ธุรกิจ / การตลาด' },
  { value: 'food', label: 'อาหาร / การทำอาหาร' },
  { value: 'travel', label: 'ท่องเที่ยว' },
  { value: 'other', label: 'อื่นๆ' },
]

const FREQUENCIES: { value: PostingFrequency; label: string }[] = [
  { value: 'daily', label: 'ทุกวัน (30+/เดือน)' },
  { value: '3-5x_week', label: '3–5 ครั้ง/สัปดาห์' },
  { value: '1-2x_week', label: '1–2 ครั้ง/สัปดาห์' },
  { value: 'monthly', label: 'ไม่สม่ำเสมอ / น้อยมาก' },
]

const INCOME_RANGES: { value: MonthlyIncomeRange; label: string }[] = [
  { value: 'zero', label: 'ยังไม่มีรายได้' },
  { value: 'under_5k', label: 'น้อยกว่า 5,000 บาท/เดือน' },
  { value: '5k_20k', label: '5,000–20,000 บาท/เดือน' },
  { value: '20k_50k', label: '20,000–50,000 บาท/เดือน' },
  { value: '50k_100k', label: '50,000–100,000 บาท/เดือน' },
  { value: 'over_100k', label: 'มากกว่า 100,000 บาท/เดือน' },
]

const INCOME_SOURCES: { value: IncomeSource; label: string }[] = [
  { value: 'ads_revenue', label: 'ค่า Ads จากแพลตฟอร์ม' },
  { value: 'sponsorship', label: 'Sponsorship / รีวิว' },
  { value: 'affiliate', label: 'Affiliate / ค่าคอม' },
  { value: 'own_product', label: 'สินค้า/คอร์สของตัวเอง' },
  { value: 'coaching', label: 'Coaching / Consulting' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'subscription', label: 'Membership / Subscription' },
  { value: 'none', label: 'ยังไม่มีรายได้' },
]

const defaultForm: AuditFormData = {
  name: '',
  platform: 'tiktok',
  niche: 'lifestyle',
  audienceType: 'general',
  followers: 0,
  avgViews: 0,
  postingFrequency: '3-5x_week',
  engagementRate: 3,
  currentIncomeSources: ['none'],
  monthlyIncome: 'zero',
  hasProduct: false,
  hasFunnel: false,
  hasAffiliate: false,
  hasClosingSystem: false,
  biggestProblem: '',
  goalIn90Days: '',
}

// ── UI Components ─────────────────────────────────────────
function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
        selected
          ? 'border-violet-500/60 bg-violet-500/10 text-white'
          : 'border-white/8 bg-white/2 text-white/45 hover:border-white/18 hover:text-white/75'
      }`}
    >
      {children}
    </button>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="card rounded-xl p-4">
      <p className="text-white/65 text-sm mb-3">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            value
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
              : 'border border-white/8 text-white/30 hover:border-white/18'
          }`}
        >
          มี
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            !value
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              : 'border border-white/8 text-white/30 hover:border-white/18'
          }`}
        >
          ไม่มี
        </button>
      </div>
    </div>
  )
}

const STEP_LABELS = ['Profile', 'Performance', 'Monetization', 'Goals']

export default function AuditPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<AuditFormData>(defaultForm)
  const [loading, setLoading] = useState(false)

  const update = <K extends keyof AuditFormData>(key: K, val: AuditFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const toggleIncomeSource = (src: IncomeSource) => {
    if (src === 'none') { update('currentIncomeSources', ['none']); return }
    const current = form.currentIncomeSources.filter((s) => s !== 'none')
    update('currentIncomeSources', current.includes(src) ? current.filter((s) => s !== src) : [...current, src])
  }

  const canNext = () => {
    if (step === 1) return form.name.trim().length > 0
    if (step === 2) return form.followers > 0 && form.avgViews > 0
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('API error')
      const result = await res.json()
      sessionStorage.setItem('mita_result', JSON.stringify(result))
      router.push('/result')
    } catch {
      setLoading(false)
    }
  }

  if (loading) return <AnalyzingScreen name={form.name || 'Creator'} />

  return (
    <main className="bg-[#08080f] min-h-screen text-white flex flex-col">

      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/')}
          className="text-white/30 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="gradient-brand font-black">MITA+</span>

        {/* Step dots */}
        <div className="ml-auto flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const done = n < step
            const active = n === step
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  done ? 'bg-emerald-500 text-black' : active ? 'bg-violet-500 text-white' : 'bg-white/8 text-white/25'
                }`}>
                  {done ? <Check size={10} /> : n}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-6 h-px transition-all ${done ? 'bg-emerald-500/50' : 'bg-white/8'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-amber-400"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: PROFILE ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <h1 className="text-2xl font-black mb-1">เริ่มต้นที่ตัวคุณ</h1>
                <p className="text-white/38 text-sm mb-8">บอกเราว่าคุณเป็น Creator แบบไหน</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">ชื่อ / ชื่อแชนแนล</label>
                    <input
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="ชื่อของคุณ..."
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-violet-500/40 focus:bg-white/5 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">Platform หลัก</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORMS.map((p) => (
                        <Chip key={p.value} selected={form.platform === p.value} onClick={() => update('platform', p.value)}>
                          <div className="text-lg mb-0.5">{p.emoji}</div>
                          <div className="text-xs font-medium">{p.label}</div>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">Niche / หมวดหมู่</label>
                    <div className="grid grid-cols-2 gap-2">
                      {NICHES.map((n) => (
                        <Chip key={n.value} selected={form.niche === n.value} onClick={() => update('niche', n.value)}>
                          {n.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: PERFORMANCE ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <h1 className="text-2xl font-black mb-1">ตัวเลข Performance</h1>
                <p className="text-white/38 text-sm mb-8">ใช้คำนวณ Revenue Gap ที่แม่นยำสำหรับคุณ</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">จำนวน Followers / Subscribers</label>
                    <input
                      type="number"
                      value={form.followers || ''}
                      onChange={(e) => update('followers', Number(e.target.value))}
                      placeholder="เช่น 50000"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-violet-500/40 focus:bg-white/5 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">ยอดวิวเฉลี่ยต่อโพสต์ / วิดีโอ</label>
                    <input
                      type="number"
                      value={form.avgViews || ''}
                      onChange={(e) => update('avgViews', Number(e.target.value))}
                      placeholder="เช่น 15000"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-violet-500/40 focus:bg-white/5 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">โพสต์บ่อยแค่ไหน?</label>
                    <div className="space-y-2">
                      {FREQUENCIES.map((f) => (
                        <Chip key={f.value} selected={form.postingFrequency === f.value} onClick={() => update('postingFrequency', f.value)}>
                          {f.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">คนที่ดูคอนเทนต์คุณมีปฏิกิริยายังไง?</label>
                    <div className="space-y-2">
                      {([
                        { label: 'น้อยมาก', desc: 'คนดูเฉยๆ ไม่ค่อยทำอะไร', rate: 1.5 },
                        { label: 'ปานกลาง', desc: 'มีคนกด Like บ้าง', rate: 3.5 },
                        { label: 'ดี', desc: 'มีทั้ง Like และ Comment สม่ำเสมอ', rate: 6 },
                        { label: 'สูงมาก', desc: 'คนมีส่วนร่วม แชร์ และพูดถึงเยอะ', rate: 10 },
                      ] as { label: string; desc: string; rate: number }[]).map((opt) => (
                        <Chip
                          key={opt.rate}
                          selected={form.engagementRate === opt.rate}
                          onClick={() => update('engagementRate', opt.rate)}
                        >
                          <span className="font-semibold">{opt.label}</span>
                          <span className="text-white/38 text-xs ml-2">— {opt.desc}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: MONETIZATION ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <h1 className="text-2xl font-black mb-1">ระบบทำเงินปัจจุบัน</h1>
                <p className="text-white/38 text-sm mb-8">ส่วนนี้ใช้หา Revenue Blocker ที่ทำให้รายได้ไม่โต</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">รายได้จากที่ไหนบ้าง? (เลือกได้หลายอย่าง)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {INCOME_SOURCES.map((src) => (
                        <Chip key={src.value} selected={form.currentIncomeSources.includes(src.value)} onClick={() => toggleIncomeSource(src.value)}>
                          {src.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">รายได้จาก Content ต่อเดือน</label>
                    <div className="space-y-2">
                      {INCOME_RANGES.map((r) => (
                        <Chip key={r.value} selected={form.monthlyIncome === r.value} onClick={() => update('monthlyIncome', r.value)}>
                          {r.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3 block">ระบบที่มีอยู่แล้ว</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Toggle label="มีสินค้า/บริการของตัวเอง?" value={form.hasProduct} onChange={(v) => update('hasProduct', v)} />
                      <Toggle label="มี Funnel / Landing Page?" value={form.hasFunnel} onChange={(v) => update('hasFunnel', v)} />
                      <Toggle label="มี Affiliate / พาร์ทเนอร์?" value={form.hasAffiliate} onChange={(v) => update('hasAffiliate', v)} />
                      <Toggle label="มีระบบปิดการขาย / DM?" value={form.hasClosingSystem} onChange={(v) => update('hasClosingSystem', v)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: GOALS ── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <h1 className="text-2xl font-black mb-1">เป้าหมายและสถานการณ์</h1>
                <p className="text-white/38 text-sm mb-8">ช่วยให้ AI วิเคราะห์ได้ตรงกับตัวคุณมากที่สุด</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">ปัญหาหลักในตอนนี้คืออะไร?</label>
                    <textarea
                      value={form.biggestProblem}
                      onChange={(e) => update('biggestProblem', e.target.value)}
                      placeholder="เช่น: มีคนดูเยอะแต่ไม่รู้จะขายอะไร หรือ มีสินค้าแต่ปิดการขายไม่ได้..."
                      rows={3}
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-violet-500/40 focus:bg-white/5 transition-all resize-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">อยากได้อะไรใน 90 วันนับจากนี้?</label>
                    <textarea
                      value={form.goalIn90Days}
                      onChange={(e) => update('goalIn90Days', e.target.value)}
                      placeholder="เช่น: รายได้ 50,000 บาท/เดือน หรือ เปิดคอร์สแรก หรือ Passive income 20K..."
                      rows={3}
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-violet-500/40 focus:bg-white/5 transition-all resize-none text-sm"
                    />
                  </div>

                  <div className="card rounded-xl p-4 border-violet-500/15" style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}>
                    <p className="text-violet-300 font-semibold text-sm mb-1">พร้อมวิเคราะห์แล้ว</p>
                    <p className="text-white/38 text-xs">AI จะประเมิน Monetization Score + Revenue Gap และสร้างแผนเฉพาะสำหรับคุณทันที</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation — sticky in thumb zone */}
          <div className="mt-8 flex gap-3 pb-6">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center justify-center gap-2 h-14 px-5 rounded-2xl border border-white/8 text-white/38 hover:text-white/70 hover:border-white/18 transition-all text-sm shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => canNext() && setStep(s => s + 1)}
                className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-bold text-base transition-all ${
                  canNext()
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/5 text-white/22 cursor-not-allowed'
                }`}
              >
                ถัดไป <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-base transition-all disabled:opacity-60"
              >
                วิเคราะห์ Monetization ของฉัน <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
