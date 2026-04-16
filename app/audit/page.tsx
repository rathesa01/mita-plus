'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { AuditFormData, Platform, Niche, PostingFrequency, MonthlyIncomeRange, IncomeSource, ContentDuration, TriedAndFailed, AudienceBuyingPower } from '@/types'

// ── Loading Screen ─────────────────────────────────────────
const LOADING_STEPS = [
  { text: 'กำลังวิเคราะห์ Audience & Reach...', pct: 15 },
  { text: 'ตรวจหา Revenue Blocker ในระบบ...', pct: 35 },
  { text: 'คำนวณ Revenue Gap ต่อเดือน...', pct: 55 },
  { text: 'AI กำลัง Generate แผนทำเงิน...', pct: 75 },
  { text: 'เตรียม Report สำหรับคุณโดยเฉพาะ...', pct: 92 },
]

function AnalyzingScreen({ name, done }: { name: string; done: boolean }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [pct, setPct] = useState(0)
  const [longWait, setLongWait] = useState(false)

  // Cycle through steps on a fixed schedule
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    LOADING_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => { setStepIdx(i); setPct(s.pct) }, i * 1600))
    })
    // After 10s show "still working" message if API hasn't returned yet
    timers.push(setTimeout(() => setLongWait(true), 10_000))
    return () => timers.forEach(clearTimeout)
  }, [])

  // When API is done → jump to 100% immediately
  useEffect(() => {
    if (done) {
      setStepIdx(LOADING_STEPS.length - 1)
      setPct(100)
      setLongWait(false)
    }
  }, [done])

  const displayText = done
    ? '✅ วิเคราะห์เสร็จแล้ว!'
    : longWait
    ? 'ยังวิเคราะห์อยู่... AI กำลังทำงานค่ะ'
    : LOADING_STEPS[stepIdx]?.text

  return (
    <div className="bg-[#08080f] min-h-screen text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Spinner / done icon */}
        <div className="relative mx-auto w-16 h-16 mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          {done ? (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 flex items-center justify-center">
              <span className="text-emerald-400 text-2xl">✓</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              </div>
            </>
          )}
        </div>

        <h2 className="text-xl font-black mb-1.5">
          {done ? 'ผลวิเคราะห์พร้อมแล้ว!' : `กำลังวิเคราะห์ ${name}`}
        </h2>
        <p className="text-white/35 text-sm mb-10">
          {done
            ? 'กำลังพาคุณไปดูผลค่ะ...'
            : 'AI กำลังประเมิน Monetization Score และ Revenue Gap ของคุณ'}
        </p>

        {/* Progress bar */}
        <div className="h-px bg-white/8 rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: done ? 0.4 : 0.9, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={done ? 'done' : longWait ? 'wait' : stepIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className={`text-sm h-5 ${done ? 'text-emerald-400 font-semibold' : longWait ? 'text-amber-400' : 'text-white/38'}`}
          >
            {displayText}
          </motion.p>
        </AnimatePresence>

        <p className={`font-black text-base mt-5 ${done ? 'text-emerald-400' : 'text-violet-400'}`}>{pct}%</p>
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
  { value: 'food', label: 'อาหาร' },
  { value: 'travel', label: 'ท่องเที่ยว' },
  { value: 'other', label: 'อื่นๆ' },
]

const SUB_NICHES: Record<string, { value: string; label: string; desc: string }[]> = {
  lifestyle: [
    { value: 'daily_vlog', label: 'Vlog ชีวิตประจำวัน', desc: 'ชีวิต กิจวัตร เดลี่' },
    { value: 'home_deco', label: 'แต่งบ้าน / Minimalism', desc: 'ตกแต่งพื้นที่ จัดบ้าน' },
    { value: 'productivity', label: 'Productivity / พัฒนาตัวเอง', desc: 'ระบบชีวิต นิสัยดี' },
    { value: 'fashion', label: 'แฟชั่น / การแต่งตัว', desc: 'Outfit OOTD สไตล์' },
    { value: 'relationship', label: 'ความสัมพันธ์ / ครอบครัว', desc: 'คู่รัก ครอบครัว' },
    { value: 'lifestyle_other', label: 'ไลฟ์สไตล์อื่นๆ', desc: 'ไม่มีใน list' },
  ],
  education: [
    { value: 'language', label: 'สอนภาษา', desc: 'อังกฤษ ญี่ปุ่น จีน ฯลฯ' },
    { value: 'coding_tech', label: 'Coding / Tech', desc: 'โปรแกรม AI เทคโนโลยี' },
    { value: 'career_skill', label: 'ทักษะอาชีพ', desc: 'ทำงาน ทักษะมืออาชีพ' },
    { value: 'exam_prep', label: 'ติว / เตรียมสอบ', desc: 'GAT PAT TOEIC สอบต่างๆ' },
    { value: 'general_knowledge', label: 'ความรู้ทั่วไป / สาระ', desc: 'วิทยาศาสตร์ ประวัติ ฯลฯ' },
    { value: 'education_other', label: 'การศึกษาอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  finance: [
    { value: 'stock_invest', label: 'หุ้น / กองทุน', desc: 'ลงทุนในตลาด SET กองทุน' },
    { value: 'crypto', label: 'Crypto / DeFi', desc: 'Bitcoin Ethereum Web3' },
    { value: 'saving', label: 'ออมเงิน / วางแผนการเงิน', desc: 'งบ ออม FIRE' },
    { value: 'credit_bank', label: 'รีวิวบัตรเครดิต / ธนาคาร', desc: 'บัตรเครดิต สิทธิประโยชน์' },
    { value: 'side_income', label: 'สร้างรายได้เสริม', desc: 'งาน part-time freelance online' },
    { value: 'finance_other', label: 'การเงินอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  beauty: [
    { value: 'makeup_tutorial', label: 'สอนแต่งหน้า', desc: 'Tutorial look step-by-step' },
    { value: 'skincare', label: 'Skincare / รีวิวสกินแคร์', desc: 'routine ครีม เซรั่ม' },
    { value: 'beauty_review', label: 'รีวิวสินค้าความงาม', desc: 'haul รีวิวรวม ซื้อของ' },
    { value: 'haircare', label: 'เส้นผม / Hair care', desc: 'ทรงผม ดูแลผม' },
    { value: 'nail', label: 'เล็บ / Nail art', desc: 'ทาเล็บ ออกแบบเล็บ' },
    { value: 'beauty_other', label: 'ความงามอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  fitness: [
    { value: 'workout', label: 'Workout / ออกกำลังกาย', desc: 'ท่าออกกำลัง gym home workout' },
    { value: 'yoga_pilates', label: 'Yoga / Pilates', desc: 'ยืดเหยียด mindful' },
    { value: 'nutrition', label: 'โภชนาการ / อาหารสุขภาพ', desc: 'clean eating แคลอรี่ diet' },
    { value: 'running_sport', label: 'วิ่ง / กีฬา', desc: 'วิ่ง ปั่นจักรยาน กีฬา' },
    { value: 'mental_health', label: 'Mental health / สุขภาพจิต', desc: 'stress จิตใจ mindfulness' },
    { value: 'fitness_other', label: 'สุขภาพอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  business: [
    { value: 'startup_sme', label: 'เริ่มต้นธุรกิจ / SME', desc: 'เปิดร้าน ธุรกิจใหม่' },
    { value: 'marketing_social', label: 'Marketing / Social Media', desc: 'โฆษณา content strategy' },
    { value: 'freelance', label: 'Freelance / WFH', desc: 'งานฟรีแลนซ์ remote work' },
    { value: 'ecommerce', label: 'E-commerce / ขายออนไลน์', desc: 'Shopee Lazada TikTok Shop' },
    { value: 'career', label: 'Career / สมัครงาน', desc: 'resume interview พัฒนาอาชีพ' },
    { value: 'business_other', label: 'ธุรกิจอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  food: [
    { value: 'eating_mukbang', label: 'กินรีวิว / Mukbang', desc: 'นั่งกิน ลองกิน กินเล่น' },
    { value: 'restaurant_review', label: 'รีวิวร้านอาหาร', desc: 'แนะนำร้าน ออกไปกิน' },
    { value: 'cooking_tutorial', label: 'สอนทำอาหาร / สูตรอาหาร', desc: 'สูตร ขั้นตอนทำอาหาร' },
    { value: 'healthy_food', label: 'อาหารสุขภาพ / คลีน', desc: 'clean food สุขภาพ diet' },
    { value: 'street_food', label: 'สตรีทฟู้ด / ของกิน', desc: 'ของกินแปลก ตลาด street' },
    { value: 'food_other', label: 'อาหารอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  travel: [
    { value: 'domestic_travel', label: 'ท่องเที่ยวในไทย', desc: 'จังหวัด ที่เที่ยวไทย' },
    { value: 'international_travel', label: 'ท่องเที่ยวต่างประเทศ', desc: 'เที่ยวนอก ประเทศต่างๆ' },
    { value: 'budget_travel', label: 'Budget travel / เที่ยวประหยัด', desc: 'เที่ยวถูก backpack' },
    { value: 'luxury_travel', label: 'Luxury travel', desc: 'โรงแรมหรู business class' },
    { value: 'solo_travel', label: 'Solo travel / เดี่ยว', desc: 'เที่ยวคนเดียว ผู้หญิงเดินทาง' },
    { value: 'travel_other', label: 'ท่องเที่ยวอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  entertainment: [
    { value: 'comedy', label: 'ตลก / Comedy', desc: 'สเก็ตช์ ตลก ขำขัน' },
    { value: 'reaction', label: 'รีแอค / Commentary', desc: 'react video comment' },
    { value: 'gaming', label: 'เกม / Gaming', desc: 'เล่นเกม review เกม' },
    { value: 'music', label: 'ดนตรี / ร้องเพลง', desc: 'cover ร้องเพลง ดนตรี' },
    { value: 'movie_series', label: 'รีวิวหนัง / ซีรีส์', desc: 'วิจารณ์ recap เนื้อเรื่อง' },
    { value: 'entertainment_other', label: 'ความบันเทิงอื่นๆ', desc: 'ไม่มีใน list' },
  ],
  other: [
    { value: 'pet', label: 'สัตว์เลี้ยง', desc: 'หมา แมว นก กระต่าย' },
    { value: 'diy_craft', label: 'งานฝีมือ / DIY', desc: 'ทำของ ประดิษฐ์ handmade' },
    { value: 'car_motor', label: 'รถยนต์ / มอเตอร์ไซค์', desc: 'รีวิวรถ ดูแลรถ' },
    { value: 'gadget_tech', label: 'Gadget / Tech review', desc: 'รีวิวมือถือ อุปกรณ์ tech' },
    { value: 'parenting', label: 'Parenting / เลี้ยงลูก', desc: 'พ่อแม่ พัฒนาการเด็ก' },
    { value: 'other_other', label: 'อื่นๆ ที่ไม่ใน list', desc: 'บอกใน "ปัญหาหลัก"' },
  ],
}

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

const CONTENT_DURATIONS: { value: ContentDuration; label: string }[] = [
  { value: 'under_3months', label: 'น้อยกว่า 3 เดือน' },
  { value: '3-12months', label: '3 เดือน – 1 ปี' },
  { value: '1-2years', label: '1 – 2 ปี' },
  { value: 'over_2years', label: 'มากกว่า 2 ปี' },
]

const TRIED_AND_FAILED: { value: TriedAndFailed; label: string }[] = [
  { value: 'affiliate', label: 'Affiliate / ลิงก์ค่าคอม' },
  { value: 'sponsorship', label: 'หา Sponsor / ติดต่อแบรนด์' },
  { value: 'own_product', label: 'ขายสินค้า / คอร์สตัวเอง' },
  { value: 'coaching', label: 'Coaching / ให้คำปรึกษา' },
  { value: 'live_selling', label: 'ไลฟ์ขายของ' },
  { value: 'none_tried', label: 'ยังไม่เคยลองเลย' },
]

const AUDIENCE_BUYING_POWERS: { value: AudienceBuyingPower; label: string; desc: string }[] = [
  { value: 'student', label: 'นักเรียน / นักศึกษา', desc: 'อายุ 15-22 ปี' },
  { value: 'worker', label: 'คนทำงาน / มนุษย์เงินเดือน', desc: 'มีรายได้ประจำ' },
  { value: 'homemaker', label: 'แม่บ้าน / พ่อบ้าน', desc: 'ดูแลบ้านและครอบครัว' },
  { value: 'business_owner', label: 'เจ้าของธุรกิจ / ฟรีแลนซ์', desc: 'รายได้ไม่แน่นอน' },
  { value: 'mixed', label: 'หลากหลาย / ไม่แน่ใจ', desc: 'มีหลายกลุ่ม' },
]

const defaultForm: AuditFormData = {
  name: '',
  email: '',
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
  contentDuration: '3-12months' as ContentDuration,
  triedAndFailed: ['none_tried'] as TriedAndFailed[],
  audienceBuyingPower: 'mixed' as AudienceBuyingPower,
  subNiche: '',
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
  const [apiDone, setApiDone] = useState(false)
  const [apiError, setApiError] = useState<string | false>(false)

  const update = <K extends keyof AuditFormData>(key: K, val: AuditFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const toggleIncomeSource = (src: IncomeSource) => {
    if (src === 'none') { update('currentIncomeSources', ['none']); return }
    const current = form.currentIncomeSources.filter((s) => s !== 'none')
    update('currentIncomeSources', current.includes(src) ? current.filter((s) => s !== src) : [...current, src])
  }

  const toggleTriedAndFailed = (item: TriedAndFailed) => {
    if (item === 'none_tried') { update('triedAndFailed', ['none_tried']); return }
    const current = form.triedAndFailed.filter(s => s !== 'none_tried')
    const next = current.includes(item) ? current.filter(s => s !== item) : [...current, item]
    // ถ้า unselect จนหมด → fallback เป็น none_tried (Zod ต้องการ min 1)
    update('triedAndFailed', next.length === 0 ? ['none_tried'] : next)
  }

  const canNext = () => {
    if (step === 1) return form.name.trim().length > 0
    if (step === 2) return form.followers > 0 && form.avgViews > 0
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setApiDone(false)
    setApiError(false)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: (form.email ?? '').trim() }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = errBody?.error ?? errBody?.details ? JSON.stringify(errBody.details) : `HTTP ${res.status}`
        console.error('[MITA+] API error', res.status, errBody)
        throw new Error(msg)
      }
      const result = await res.json()
      sessionStorage.setItem('mita_result', JSON.stringify(result))
      // Signal loading screen → 100%, then navigate after brief celebration moment
      setApiDone(true)
      setTimeout(() => router.push('/result'), 800)
    } catch (err) {
      console.error('[MITA+] Submit error:', err)
      setLoading(false)
      setApiError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (loading) return <AnalyzingScreen name={form.name || 'Creator'} done={apiDone} />

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
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                      อีเมล <span className="text-white/20 normal-case font-normal">(รับผลวิเคราะห์ก่อนใคร)</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="your@email.com"
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
                        <Chip
                          key={n.value}
                          selected={form.niche === n.value}
                          onClick={() => {
                            update('niche', n.value)
                            update('subNiche' as any, '')
                          }}
                        >
                          {n.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Sub-niche — dynamic ตาม niche ที่เลือก */}
                  {SUB_NICHES[form.niche] && (
                    <div>
                      <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                        ทำ Content เกี่ยวกับอะไรโดยเฉพาะ?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(SUB_NICHES[form.niche] ?? []).map((s) => (
                          <Chip
                            key={s.value}
                            selected={(form as any).subNiche === s.value}
                            onClick={() => update('subNiche' as any, s.value)}
                          >
                            <div className="font-semibold text-xs leading-tight">{s.label}</div>
                            <div className="text-white/35 text-xs mt-0.5 leading-tight">{s.desc}</div>
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
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
                      inputMode="numeric"
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
                      inputMode="numeric"
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

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                      คนที่ดูคอนเทนต์คุณส่วนใหญ่คือ?
                    </label>
                    <div className="space-y-2">
                      {AUDIENCE_BUYING_POWERS.map((a) => (
                        <Chip key={a.value} selected={form.audienceBuyingPower === a.value} onClick={() => update('audienceBuyingPower', a.value)}>
                          <span className="font-semibold">{a.label}</span>
                          <span className="text-white/38 text-xs ml-2">— {a.desc}</span>
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

                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                      เคยลองสร้างรายได้วิธีไหนบ้าง แต่ไม่ได้ผล? <span className="text-white/20 normal-case font-normal">(เลือกได้หลายอย่าง)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TRIED_AND_FAILED.map((t) => (
                        <Chip key={t.value} selected={form.triedAndFailed.includes(t.value)} onClick={() => toggleTriedAndFailed(t.value)}>
                          {t.label}
                        </Chip>
                      ))}
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
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                      ทำ Content มาแล้วนานแค่ไหน?
                    </label>
                    <div className="space-y-2">
                      {CONTENT_DURATIONS.map((d) => (
                        <Chip key={d.value} selected={form.contentDuration === d.value} onClick={() => update('contentDuration', d.value)}>
                          {d.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

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

          {/* API Error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/8 px-4 py-3 flex items-start gap-3"
            >
              <span className="text-rose-400 text-base shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="text-rose-300 font-semibold text-sm">วิเคราะห์ไม่สำเร็จ</p>
                <p className="text-white/40 text-xs mt-0.5">เกิดข้อผิดพลาดกับ AI — ลองใหม่อีกครั้งได้เลยค่ะ</p>
                {typeof apiError === 'string' && apiError !== 'true' && (
                  <p className="text-rose-400/60 text-xs mt-1 font-mono break-all">{apiError}</p>
                )}
              </div>
            </motion.div>
          )}

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
