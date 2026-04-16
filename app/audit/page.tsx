'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { AuditFormData, Platform, Niche, PostingFrequency, MonthlyIncomeRange, IncomeSource } from '@/types'

// ── Loading Screen ──────────────────────────────────────────
const LOADING_STEPS = [
  { text: 'กำลังวิเคราะห์ Audience & Reach...', pct: 15 },
  { text: 'ตรวจหา Revenue Leak ในระบบ...', pct: 35 },
  { text: 'คำนวณเงินที่หายไปต่อเดือน...', pct: 55 },
  { text: 'AI กำลัง Generate แผนทำเงิน...', pct: 75 },
  { text: 'เตรียม Result สำหรับคุณโดยเฉพาะ...', pct: 92 },
]

function AnalyzingScreen({ name }: { name: string }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const intervals: ReturnType<typeof setTimeout>[] = []
    LOADING_STEPS.forEach((s, i) => {
      intervals.push(setTimeout(() => {
        setStepIdx(i)
        setPct(s.pct)
      }, i * 1400))
    })
    return () => intervals.forEach(clearTimeout)
  }, [])

  return (
    <div className="bg-[#080810] min-h-screen text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Pulsing orb */}
        <div className="relative mx-auto w-24 h-24 mb-10">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-amber-500/30 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-amber-500/50 flex items-center justify-center text-2xl">⚡</div>
        </div>

        <h2 className="text-2xl font-black mb-2">กำลังวิเคราะห์ {name}</h2>
        <p className="text-white/40 text-sm mb-10">AI กำลังคำนวณว่าคุณเสียเงินไปเท่าไหร่</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-white/60 text-sm h-5"
          >
            {LOADING_STEPS[stepIdx]?.text}
          </motion.p>
        </AnimatePresence>

        <p className="text-amber-500 font-black text-lg mt-6">{pct}%</p>
      </div>
    </div>
  )
}

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

function SelectCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-amber-500 bg-amber-500/10 text-white'
          : 'border-white/10 bg-white/3 text-white/60 hover:border-white/25 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function YesNoCard({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-white/80 text-sm mb-3">{label}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${value ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400' : 'border border-white/10 text-white/40 hover:border-white/25'}`}>มี ✓</button>
        <button type="button" onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!value ? 'bg-red-500/20 border border-red-500 text-red-400' : 'border border-white/10 text-white/40 hover:border-white/25'}`}>ไม่มี ✗</button>
      </div>
    </div>
  )
}

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

  const progress = (step / TOTAL_STEPS) * 100

  // Show analyzing screen while waiting for API
  if (loading) return <AnalyzingScreen name={form.name || 'Creator'} />

  return (
    <main className="bg-[#080810] min-h-screen text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/')} className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="gradient-text font-bold">MITA+</span>
        <div className="ml-auto text-white/40 text-sm">{step}/{TOTAL_STEPS}</div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: PROFILE ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h1 className="text-3xl font-black mb-2">เริ่มต้นที่ตัวคุณ</h1>
                <p className="text-white/50 mb-8">บอกเราว่าคุณเป็น Creator แบบไหน</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">ชื่อ / ชื่อแชนแนล</label>
                    <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="ชื่อของคุณ..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors" />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Platform หลัก</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORMS.map((p) => (
                        <SelectCard key={p.value} selected={form.platform === p.value} onClick={() => update('platform', p.value)}>
                          <div className="text-xl mb-1">{p.emoji}</div>
                          <div className="text-xs font-medium">{p.label}</div>
                        </SelectCard>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Niche / หมวดหมู่</label>
                    <div className="grid grid-cols-2 gap-2">
                      {NICHES.map((n) => (
                        <SelectCard key={n.value} selected={form.niche === n.value} onClick={() => update('niche', n.value)}>
                          <span className="text-sm">{n.label}</span>
                        </SelectCard>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: PERFORMANCE ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h1 className="text-3xl font-black mb-2">ตัวเลข Performance</h1>
                <p className="text-white/50 mb-8">ข้อมูลนี้ใช้คำนวณว่าคุณเสียเงินไปเท่าไหร่จริงๆ</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">จำนวน Followers / Subscribers</label>
                    <input type="number" value={form.followers || ''} onChange={(e) => update('followers', Number(e.target.value))} placeholder="เช่น 50000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors" />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">ยอดวิวเฉลี่ยต่อโพสต์ / วิดีโอ</label>
                    <input type="number" value={form.avgViews || ''} onChange={(e) => update('avgViews', Number(e.target.value))} placeholder="เช่น 15000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors" />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">โพสต์บ่อยแค่ไหน?</label>
                    <div className="space-y-2">
                      {FREQUENCIES.map((f) => (
                        <SelectCard key={f.value} selected={form.postingFrequency === f.value} onClick={() => update('postingFrequency', f.value)}>
                          <span className="text-sm">{f.label}</span>
                        </SelectCard>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">
                      Engagement Rate โดยประมาณ: <span className="text-amber-400 font-bold">{form.engagementRate}%</span>
                    </label>
                    <input type="range" min="0.5" max="15" step="0.5" value={form.engagementRate} onChange={(e) => update('engagementRate', Number(e.target.value))} className="w-full accent-amber-500" />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>0.5% (ต่ำ)</span><span>15% (สูงมาก)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: MONETIZATION ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h1 className="text-3xl font-black mb-2">ระบบทำเงินปัจจุบัน</h1>
                <p className="text-white/50 mb-8">ตอบตรงๆ — นี่คือที่มาของ Revenue Leak ที่แม่นยำ</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">รายได้จากที่ไหนบ้าง? (เลือกได้หลายอย่าง)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {INCOME_SOURCES.map((src) => (
                        <SelectCard key={src.value} selected={form.currentIncomeSources.includes(src.value)} onClick={() => toggleIncomeSource(src.value)}>
                          <span className="text-sm">{src.label}</span>
                        </SelectCard>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">รายได้จาก Content ต่อเดือนโดยประมาณ</label>
                    <div className="space-y-2">
                      {INCOME_RANGES.map((r) => (
                        <SelectCard key={r.value} selected={form.monthlyIncome === r.value} onClick={() => update('monthlyIncome', r.value)}>
                          <span className="text-sm">{r.label}</span>
                        </SelectCard>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <YesNoCard label="มีสินค้า/บริการของตัวเอง?" value={form.hasProduct} onChange={(v) => update('hasProduct', v)} />
                    <YesNoCard label="มี Funnel / Landing Page?" value={form.hasFunnel} onChange={(v) => update('hasFunnel', v)} />
                    <YesNoCard label="มี Affiliate / พาร์ทเนอร์?" value={form.hasAffiliate} onChange={(v) => update('hasAffiliate', v)} />
                    <YesNoCard label="มีระบบปิดการขาย / DM Closing?" value={form.hasClosingSystem} onChange={(v) => update('hasClosingSystem', v)} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: GOALS ── */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h1 className="text-3xl font-black mb-2">เป้าหมายและปัญหา</h1>
                <p className="text-white/50 mb-8">ส่วนนี้ช่วยให้ AI วิเคราะห์ได้ตรงกับสถานการณ์คุณมากที่สุด</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">ปัญหาหลักในตอนนี้คืออะไร?</label>
                    <textarea value={form.biggestProblem} onChange={(e) => update('biggestProblem', e.target.value)} placeholder="เช่น: มีคนดูเยอะแต่ไม่รู้จะขายอะไร หรือ มีสินค้าแต่ปิดการขายไม่ได้..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors resize-none" />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">อยากได้อะไรใน 90 วันนับจากนี้?</label>
                    <textarea value={form.goalIn90Days} onChange={(e) => update('goalIn90Days', e.target.value)} placeholder="เช่น: รายได้ 50,000 บาท/เดือน หรือ เปิดคอร์สแรก หรือ Passive income 20K..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors resize-none" />
                  </div>

                  <div className="glass rounded-2xl p-5 border border-amber-500/20">
                    <p className="text-amber-400 font-semibold text-sm mb-1">กำลังจะรู้แล้วว่าคุณเสียเงินไปเท่าไหร่</p>
                    <p className="text-white/50 text-xs">AI จะวิเคราะห์ข้อมูลทั้งหมดและแสดง Revenue Leak + แผนทำเงินที่ทำได้จริงทันที</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all">
                <ArrowLeft size={16} /> ย้อนกลับ
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button onClick={() => canNext() && setStep(s => s + 1)} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${canNext() ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
                ถัดไป <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-lg transition-all disabled:opacity-70">
                วิเคราะห์ Revenue ของฉัน <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
