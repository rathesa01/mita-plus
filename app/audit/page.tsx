'use client'

// ── P-008-adapt · AuditFormV2 from Lovable.dev → adapted for MITA+ Next.js ──
// Source: Lovable "Mita AI Studio" 2026-04-29 · adapted by มะนาว Claude Code
// Changes vs Lovable original:
//   - Added 'use client' directive
//   - Import types: @/types/audit → @/types
//   - DEFAULT_FORM_DATA: @/lib/forms/auditDefaults (extracted from old page.tsx)
//   - Logo: text span → <MitaLogo size="sm" />
//   - ReactNode: imported from react (not React.ReactNode)
//   - globals.css: --color-brand-purple alias added for text-brand-purple
// P-008-fix1 (2026-04-29):
//   - outer wrapper: bg-background → inline style #FFFAF5 + data-theme="light"
//   - globals.css: [data-theme="light"] overrides Tailwind tokens → cream palette
//   - scoped to /audit only — does not affect other dark pages

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Heart,
  GraduationCap,
  Wallet,
  Smile,
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  Mail,
  User,
  Loader2,
  Check,
  Plus,
} from 'lucide-react'
import { type AuditFormData } from '@/types'
import { DEFAULT_FORM_DATA } from '@/lib/forms/auditDefaults'
import { SUB_NICHES } from '@/lib/forms/subNiches'
import MitaLogo from '@/app/components/MitaLogo'

const STORAGE_KEY = 'mita_audit_draft'

const PLATFORMS: Array<{ value: AuditFormData['platform']; label: string }> = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'multi', label: 'หลายแพลตฟอร์ม' },
]

const POPULAR_NICHES: Array<{
  value: AuditFormData['niche']
  label: string
  Icon: typeof Heart
}> = [
  { value: 'lifestyle', label: 'Lifestyle', Icon: Heart },
  { value: 'education', label: 'Education', Icon: GraduationCap },
  { value: 'finance', label: 'Finance', Icon: Wallet },
  { value: 'entertainment', label: 'Entertainment', Icon: Smile },
  { value: 'fitness', label: 'Fitness', Icon: Dumbbell },
]

const ALL_NICHES: Array<{ value: AuditFormData['niche']; label: string }> = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'business', label: 'Business' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'mom_baby', label: 'แม่และเด็ก' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'health', label: 'Health' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'อื่นๆ' },
]

// P-008-fix5: AUDIENCE_TYPES removed — audienceType field hidden (0 references in lib/*)
// audienceType stays in AuditFormData type + schema for backward compat; default = 'general'

const POSTING_FREQ: Array<{ value: AuditFormData['postingFrequency']; label: string }> = [
  { value: 'daily', label: 'ทุกวัน' },
  { value: '3-5x_week', label: '3–5 ครั้ง/สัปดาห์' },
  { value: '1-2x_week', label: '1–2 ครั้ง/สัปดาห์' },
  { value: 'monthly', label: 'เดือนละไม่กี่ครั้ง' },
]

const INCOME_SOURCES: Array<{
  value: AuditFormData['currentIncomeSources'][number]
  label: string
}> = [
  { value: 'ads_revenue', label: 'Ads Revenue' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'own_product', label: 'ขายของเอง' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'merchandise', label: 'Merch' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'none', label: 'ยังไม่มี' },
]

const CONTENT_DURATION: Array<{ value: AuditFormData['contentDuration']; label: string }> = [
  { value: 'under_3months', label: '< 3 เดือน' },
  { value: '3-12months', label: '3–12 เดือน' },
  { value: '1-2years', label: '1–2 ปี' },
  { value: 'over_2years', label: '> 2 ปี' },
]

const TRIED_FAILED: Array<{ value: AuditFormData['triedAndFailed'][number]; label: string }> = [
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'own_product', label: 'ขายของเอง' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'live_selling', label: 'Live ขายของ' },
  { value: 'none_tried', label: 'ยังไม่ได้ลอง' },
]

const BUYING_POWER: Array<{ value: AuditFormData['audienceBuyingPower']; label: string }> = [
  { value: 'student', label: 'นักเรียน/นักศึกษา' },
  { value: 'worker', label: 'วัยทำงาน' },
  { value: 'homemaker', label: 'แม่บ้าน' },
  { value: 'business_owner', label: 'เจ้าของกิจการ' },
  { value: 'mixed', label: 'ผสม' },
]

const STEP_META = [
  {
    title: 'ตั้งค่าช่องของคุณ',
    subtitle: 'บอกเราแค่นี้ — AI จะสร้างแผนเฉพาะคุณค่ะ',
    eta: 'เหลืออีก ~1 นาที',
  },
  {
    title: 'ตัวเลขช่องคุณ',
    subtitle: 'ใช้แค่ 4 ตัวเลข — ไม่เชื่อมบัญชีจริง',
    eta: 'เหลืออีก ~45 วินาที',
  },
  {
    title: 'รายได้ตอนนี้',
    subtitle: 'ตอบตามจริง · ข้อมูลของคุณ ไม่ส่งใคร',
    eta: 'เหลืออีก ~30 วินาที',
  },
  {
    title: 'เป้าหมาย 90 วัน',
    subtitle: 'ตั้งเป้าให้ AI ปรับแผนให้คุณ',
    eta: 'เหลืออีก ~15 วินาที',
  },
]

const LOADING_MESSAGES = [
  'กำลังวิเคราะห์ niche ของคุณ...',
  'เปรียบเทียบกับ creator ใน benchmark...',
  'คำนวณ revenue gap...',
  'เลือกช่องทางที่เหมาะกับคุณ...',
  'สร้างแผนปฏิบัติ 90 วัน...',
]

type Errors = Partial<Record<keyof AuditFormData, string>>

function validateStep(step: number, data: AuditFormData): Errors {
  const e: Errors = {}
  if (step === 0) {
    if (!data.name.trim()) e.name = 'กรอกชื่อหน่อยค่ะ'
    if (!data.email.trim()) e.email = 'กรอกอีเมลด้วยนะคะ'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง'
  }
  if (step === 1) {
    if (data.followers < 0) e.followers = 'ตัวเลขต้องไม่ติดลบ'
    if (data.avgViews < 0) e.avgViews = 'ตัวเลขต้องไม่ติดลบ'
    if (data.engagementRate < 0 || data.engagementRate > 100)
      e.engagementRate = '0–100 เท่านั้น'
  }
  if (step === 2) {
    if (data.monthlyIncome < 0) e.monthlyIncome = 'ตัวเลขต้องไม่ติดลบ'
    if (data.currentIncomeSources.length === 0)
      e.currentIncomeSources = "เลือกอย่างน้อย 1 ข้อ (หรือ 'ยังไม่มี')"
  }
  if (step === 3) {
    // P-008-fix5: subNiche validation removed — now optional structured chip in Step 1
    if (!data.goalIn90Days.trim()) e.goalIn90Days = 'ตั้งเป้า 90 วันด้วยนะคะ'
  }
  return e
}

export default function AuditFormV2() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<AuditFormData>(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<Errors>({})
  const [showAllNiches, setShowAllNiches] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadingIdx, setLoadingIdx] = useState(0)
  const hydrated = useRef(false)

  // Hydrate from localStorage (resume draft)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setData({ ...DEFAULT_FORM_DATA, ...JSON.parse(raw) })
    } catch {
      /* ignore */
    }
    hydrated.current = true
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [data])

  // Cycle loading messages while submitting
  useEffect(() => {
    if (!submitting) return
    setLoadingIdx(0)
    const id = window.setInterval(() => {
      setLoadingIdx((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1))
    }, 2000)
    return () => window.clearInterval(id)
  }, [submitting])

  const update = <K extends keyof AuditFormData>(key: K, value: AuditFormData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleArr = <K extends 'currentIncomeSources' | 'triedAndFailed'>(
    key: K,
    value: AuditFormData[K][number],
  ) => {
    setData((d) => {
      const arr = d[key] as AuditFormData[K]
      const has = (arr as readonly string[]).includes(value as string)
      const next = has
        ? (arr as readonly string[]).filter((v) => v !== value)
        : [...(arr as readonly string[]), value]
      return { ...d, [key]: next as AuditFormData[K] }
    })
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const next = () => {
    const e = validateStep(step, data)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (step < 3) setStep(step + 1)
    else void submit()
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
  }

  const submit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.status === 429) {
        setSubmitError('ลองอีกครั้งใน 1 นาที')
        setSubmitting(false)
        return
      }
      if (!res.ok) throw new Error('เกิดข้อผิดพลาด ลองใหม่อีกครั้งค่ะ')
      const json = (await res.json()) as { id: string }
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      window.location.href = `/result?id=${encodeURIComponent(json.id)}`
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      setSubmitting(false)
    }
  }

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step])
  const meta = STEP_META[step]

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#FFFAF5', color: '#1D1D1F' }}
      data-theme="light"
    >
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-14">

        {/* ── Logo ── */}
        <div className="mb-8 flex items-center justify-center">
          <MitaLogo size="sm" />
        </div>

        {/* ── Progress bar ── */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium tracking-tight text-foreground">{step + 1}/4</span>
            <span>{meta.eta}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-coral"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── Step header ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{meta.title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{meta.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* ── Step card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-7"
          >
            {step === 0 && (
              <Step1
                data={data}
                errors={errors}
                update={update}
                showAll={showAllNiches}
                setShowAll={setShowAllNiches}
              />
            )}
            {step === 1 && <Step2 data={data} errors={errors} update={update} />}
            {step === 2 && (
              <Step3 data={data} errors={errors} update={update} toggle={toggleArr} />
            )}
            {step === 3 && (
              <Step4 data={data} errors={errors} update={update} toggle={toggleArr} />
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <p className="mt-4 text-center text-sm text-destructive">{submitError}</p>
        )}

        {/* ── Navigation ── */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || submitting}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            ย้อนกลับ
          </button>
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังประมวลผล...
              </>
            ) : step === 3 ? (
              <>
                วิเคราะห์ฟรี
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ข้อมูลของคุณถูกเก็บอัตโนมัติ · กลับมาทำต่อได้ทุกเมื่อ
        </p>
      </div>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          >
            <div className="mx-5 max-w-sm text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-bg">
                <Sparkles className="h-7 w-7 text-coral-text" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">AI กำลังวิเคราะห์</h2>
              <div className="mt-4 h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-sm text-muted-foreground"
                  >
                    {LOADING_MESSAGES[loadingIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   Reusable primitives
══════════════════════════════════════════════════ */

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="mb-1.5 block text-sm font-medium tracking-tight">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}

function inputCls(hasError?: boolean) {
  return [
    'w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors',
    'placeholder:text-muted-foreground',
    'focus:border-coral focus:ring-2 focus:ring-coral/20',
    hasError ? 'border-destructive' : 'border-border',
  ].join(' ')
}

function ChipGrid<T extends string>({
  value,
  options,
  onChange,
  cols = 2,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
  cols?: 2 | 3
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-foreground hover:border-foreground/40',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function MultiChipGrid<T extends string>({
  values,
  options,
  onToggle,
  cols = 2,
}: {
  values: readonly T[]
  options: Array<{ value: T; label: string }>
  onToggle: (v: T) => void
  cols?: 2 | 3
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((opt) => {
        const active = values.includes(opt.value)
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={[
              'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all',
              active
                ? 'border-coral bg-coral-bg text-coral-text'
                : 'border-border bg-background text-foreground hover:border-foreground/40',
            ].join(' ')}
          >
            <span>{opt.label}</span>
            {active && <Check className="h-4 w-4 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

// P-008-fix5: Sub-niche chip with label + desc two-line layout
function SubNicheChipGrid({
  value,
  options,
  onChange,
}: {
  value: string
  options: Array<{ value: string; label: string; desc: string }>
  onChange: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(active ? '' : opt.value)}
            className={[
              'rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
              active
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-foreground hover:border-foreground/40',
            ].join(' ')}
          >
            <div className="font-medium leading-tight">{opt.label}</div>
            <div
              className={`mt-0.5 text-xs leading-tight ${
                active ? 'text-background/60' : 'text-muted-foreground'
              }`}
            >
              {opt.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   Step components
══════════════════════════════════════════════════ */

function Step1({
  data,
  errors,
  update,
  showAll,
  setShowAll,
}: {
  data: AuditFormData
  errors: Errors
  update: <K extends keyof AuditFormData>(k: K, v: AuditFormData[K]) => void
  showAll: boolean
  setShowAll: (v: boolean) => void
}) {
  const nicheList = showAll ? ALL_NICHES : null
  return (
    <>
      <Field label="ชื่อของคุณ" error={errors.name}>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${inputCls(!!errors.name)} pl-10`}
            placeholder="พิมพ์ชื่อ..."
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
      </Field>
      <Field label="อีเมล" hint="ใช้ส่งผลให้คุณ — ไม่ส่ง spam" error={errors.email}>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            className={`${inputCls(!!errors.email)} pl-10`}
            placeholder="you@email.com"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
      </Field>
      <Field label="แพลตฟอร์มหลัก">
        <ChipGrid
          value={data.platform}
          options={PLATFORMS}
          onChange={(v) => update('platform', v)}
          cols={3}
        />
      </Field>
      <Field label="Niche ของคุณ">
        {!showAll ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {POPULAR_NICHES.map(({ value, label, Icon }) => {
              const active = data.niche === value
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => { update('niche', value); update('subNiche', '') }}
                  className={[
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground/40',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              ดูทั้งหมด
            </button>
          </div>
        ) : (
          <ChipGrid
            value={data.niche}
            options={nicheList!}
            onChange={(v) => { update('niche', v); update('subNiche', '') }}
            cols={3}
          />
        )}
      </Field>
      {/* P-008-fix5: Sub-niche structured selector — shows only when niche has sub-options */}
      {SUB_NICHES[data.niche] && (
        <Field
          label="แนว Content เพิ่มเติม"
          hint="เลือกแนว content เพื่อให้ AI วิเคราะห์ได้ละเอียดขึ้น"
        >
          <SubNicheChipGrid
            value={data.subNiche}
            options={SUB_NICHES[data.niche]!}
            onChange={(v) => update('subNiche', v)}
          />
        </Field>
      )}
    </>
  )
}

function Step2({
  data,
  errors,
  update,
}: {
  data: AuditFormData
  errors: Errors
  update: <K extends keyof AuditFormData>(k: K, v: AuditFormData[K]) => void
}) {
  return (
    <>
      <Field label="จำนวน follower" error={errors.followers}>
        <input
          type="number"
          min={0}
          className={inputCls(!!errors.followers)}
          placeholder="เช่น 5000"
          value={data.followers || ''}
          onChange={(e) => update('followers', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="ยอด view เฉลี่ย/คลิป" error={errors.avgViews}>
        <input
          type="number"
          min={0}
          className={inputCls(!!errors.avgViews)}
          placeholder="เช่น 1200"
          value={data.avgViews || ''}
          onChange={(e) => update('avgViews', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="โพสต์บ่อยแค่ไหน">
        <ChipGrid
          value={data.postingFrequency}
          options={POSTING_FREQ}
          onChange={(v) => update('postingFrequency', v)}
        />
      </Field>
      <Field
        label="Engagement rate (%)"
        hint="like + comment + share หารด้วย view × 100"
        error={errors.engagementRate}
      >
        <input
          type="number"
          step="0.1"
          min={0}
          max={100}
          className={inputCls(!!errors.engagementRate)}
          placeholder="เช่น 3.5"
          value={data.engagementRate || ''}
          onChange={(e) => update('engagementRate', Number(e.target.value) || 0)}
        />
      </Field>
    </>
  )
}

function Step3({
  data,
  errors,
  update,
  toggle,
}: {
  data: AuditFormData
  errors: Errors
  update: <K extends keyof AuditFormData>(k: K, v: AuditFormData[K]) => void
  toggle: <K extends 'currentIncomeSources' | 'triedAndFailed'>(
    k: K,
    v: AuditFormData[K][number],
  ) => void
}) {
  const checks: Array<{ key: keyof AuditFormData; label: string }> = [
    { key: 'hasProduct', label: 'มีสินค้าหรือบริการของตัวเอง' },
    { key: 'hasFunnel', label: 'มี funnel หรือ landing page' },
    { key: 'hasAffiliate', label: 'เคยทำ affiliate' },
    { key: 'hasClosingSystem', label: 'มีระบบปิดการขาย' },
  ]
  return (
    <>
      <Field
        label="ช่องทางรายได้ตอนนี้ (เลือกได้หลายข้อ)"
        error={errors.currentIncomeSources}
      >
        <MultiChipGrid
          values={data.currentIncomeSources}
          options={INCOME_SOURCES}
          onToggle={(v) => toggle('currentIncomeSources', v)}
        />
      </Field>
      <Field label="รายได้ต่อเดือน (บาท)" error={errors.monthlyIncome}>
        <input
          type="number"
          min={0}
          className={inputCls(!!errors.monthlyIncome)}
          placeholder="เช่น 15000"
          value={data.monthlyIncome || ''}
          onChange={(e) => update('monthlyIncome', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="คุณมีอะไรอยู่บ้าง?">
        <div className="space-y-2">
          {checks.map((c) => {
            const v = data[c.key] as boolean
            return (
              <button
                type="button"
                key={c.key}
                onClick={() => update(c.key, !v as never)}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                  v
                    ? 'border-coral bg-coral-bg text-coral-text'
                    : 'border-border bg-background hover:border-foreground/40',
                ].join(' ')}
              >
                <span>{c.label}</span>
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
                    v ? 'border-coral bg-coral text-white' : 'border-border',
                  ].join(' ')}
                >
                  {v && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            )
          })}
        </div>
      </Field>
    </>
  )
}

function Step4({
  data,
  errors,
  update,
  toggle,
}: {
  data: AuditFormData
  errors: Errors
  update: <K extends keyof AuditFormData>(k: K, v: AuditFormData[K]) => void
  toggle: <K extends 'currentIncomeSources' | 'triedAndFailed'>(
    k: K,
    v: AuditFormData[K][number],
  ) => void
}) {
  return (
    <>
      <Field label="ทำคอนเทนต์มานานแค่ไหน">
        <ChipGrid
          value={data.contentDuration}
          options={CONTENT_DURATION}
          onChange={(v) => update('contentDuration', v)}
        />
      </Field>
      <Field label="เคยลองแล้วยังไม่เวิร์ก (เลือกได้หลายข้อ)">
        <MultiChipGrid
          values={data.triedAndFailed}
          options={TRIED_FAILED}
          onToggle={(v) => toggle('triedAndFailed', v)}
        />
      </Field>
      <Field label="ฐานคนดูส่วนใหญ่">
        <ChipGrid
          value={data.audienceBuyingPower}
          options={BUYING_POWER}
          onChange={(v) => update('audienceBuyingPower', v)}
        />
      </Field>
      {/* P-008-fix5: sub-niche free-text removed — moved to structured chip grid in Step 1 */}
      <Field label="คอนเทนต์ของคุณเป็นยังไง" hint="ไม่ต้องยาว 2–3 ประโยคพอ">
        <textarea
          rows={3}
          className={`${inputCls()} resize-none`}
          placeholder="เล่าให้ฟังหน่อย..."
          value={data.contentDescription}
          onChange={(e) => update('contentDescription', e.target.value)}
        />
      </Field>
      <Field label="ปัญหาใหญ่ที่สุดตอนนี้">
        <textarea
          rows={2}
          className={`${inputCls()} resize-none`}
          placeholder="เช่น ยอด view นิ่ง, หาวิธีหาเงินไม่เจอ"
          value={data.biggestProblem}
          onChange={(e) => update('biggestProblem', e.target.value)}
        />
      </Field>
      <Field label="เป้าหมายใน 90 วัน" error={errors.goalIn90Days}>
        <textarea
          rows={2}
          className={`${inputCls()} resize-none`}
          placeholder="เช่น มีรายได้จาก affiliate 5000/เดือน"
          value={data.goalIn90Days}
          onChange={(e) => update('goalIn90Days', e.target.value)}
        />
      </Field>
    </>
  )
}
