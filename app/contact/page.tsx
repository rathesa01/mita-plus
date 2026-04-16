'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { AuditResult } from '@/types'
import { COLORS, CARD, RADIUS } from '@/lib/tokens'

// ── Config ─────────────────────────────────────
const LINE_OA_URL = process.env.NEXT_PUBLIC_LINE_OA_URL ?? ''
const LINE_READY  = LINE_OA_URL.length > 0 && !LINE_OA_URL.includes('YOUR_LINE')

// ── Plan labels ────────────────────────────────
const PLAN_LABELS: Record<string, { label: string; price: string; color: string; emoji: string; desc: string }> = {
  free:          { label: 'Free',            price: 'ฟรี',         color: COLORS.textSecondary, emoji: '🆓', desc: 'เช็กผลวิเคราะห์ฟรีแล้ว ต้องการปลดล็อก Revenue Blocker ทั้งหมด?' },
  starter:       { label: 'Starter',         price: '฿199/เดือน',  color: '#a78bfa',            emoji: '⭐', desc: 'ปลดล็อก Revenue Blocker ทุกตัว + แผน 90 วัน + รายงานรายเดือน' },
  pro:           { label: 'Pro',             price: '฿499/เดือน',  color: COLORS.ctaOrange,     emoji: '👑', desc: 'มีทีมช่วยวางระบบ + Priority LINE Support + Strategy Call ทุกเดือน' },
  // legacy
  report:        { label: 'Paid Report',     price: '',            color: COLORS.textSecondary, emoji: '📄', desc: 'รับรายงานฉบับเต็ม' },
  premium:       { label: 'Premium Setup',   price: '',            color: COLORS.ctaOrange,     emoji: '🚀', desc: 'วางระบบให้จบใน 30 วัน' },
  revenue_share: { label: 'Revenue Share',   price: '10–30%',      color: COLORS.success,       emoji: '💰', desc: 'ไม่มีค่าใช้จ่ายล่วงหน้า' },
}

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// useSearchParams ต้องอยู่ใน Suspense — แยก logic ออกมาเป็น ContactContent
function ContactContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') ?? 'starter'
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.starter

  const [result, setResult] = useState<AuditResult | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // โหลด result จาก sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mita_result')
      if (raw) {
        const r: AuditResult = JSON.parse(raw)
        setResult(r)
        setName(r.input.name ?? '')
        setEmail(r.input.email ?? '')
      }
    } catch { /* ignore */ }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError(false)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          plan,
          score: result?.score.total,
          revenueGap: result?.revenueEstimation.totalMissed,
          platform: result?.input.platform,
          niche: result?.input.niche,
          followers: result?.input.followers,
          reportPrice: result?.pricing.reportPrice,
          premiumPrice: result?.pricing.premiumPrice,
        }),
      })
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // ── Submitted state ───────────────────────────
  if (submitted) {
    return (
      <main style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}
        >
          {/* Success icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle2 size={32} style={{ color: COLORS.success }} />
          </div>

          <h1 style={{ fontWeight: 900, fontSize: '26px', color: COLORS.textPrimary, marginBottom: '8px' }}>
            รับทราบแล้วค่ะ!
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
            ทีมงานจะ DM คุณกลับใน <strong style={{ color: COLORS.textPrimary }}>24 ชั่วโมง</strong> ผ่านอีเมลหรือ LINE ค่ะ
          </p>

          {/* LINE button — แสดงเฉพาะถ้าตั้ง LINE OA URL แล้ว */}
          {LINE_READY && (
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', height: '56px', borderRadius: RADIUS.button,
                background: '#06C755', color: '#fff',
                fontWeight: 900, fontSize: '16px', textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              <MessageCircle size={20} />
              คุยต่อใน LINE ได้เลย
            </a>
          )}

          <button
            onClick={() => router.push('/result')}
            style={{
              width: '100%', height: '48px', borderRadius: RADIUS.button,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: COLORS.textSecondary, fontSize: '14px', cursor: 'pointer',
            }}
          >
            กลับไปดูผลวิเคราะห์
          </button>
        </motion.div>
      </main>
    )
  }

  const revenueGap = result?.revenueEstimation.totalMissed ?? 0

  return (
    <main style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.textPrimary }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        margin: '0 auto',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 900, fontSize: '15px' }} className="gradient-purple-blue">MITA+</span>
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Plan badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px', borderRadius: '20px',
          background: `${planInfo.color}18`,
          border: `1px solid ${planInfo.color}40`,
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '13px' }}>{planInfo.emoji}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: planInfo.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {planInfo.label}
          </span>
          {planInfo.price && (
            <span style={{ fontSize: '11px', color: planInfo.color, fontWeight: 600 }}>{planInfo.price}</span>
          )}
        </div>

        <h1 style={{ fontWeight: 900, fontSize: '26px', lineHeight: 1.25, marginBottom: '8px' }}>
          {plan === 'starter' || plan === 'pro'
            ? <>สมัครผ่านทีมงาน<br /><span style={{ color: planInfo.color }}>รับภายใน 24 ชั่วโมง</span></>
            : <>ทีมงานจะติดต่อกลับ<br /><span style={{ color: COLORS.ctaOrange }}>ภายใน 24 ชั่วโมง</span></>
          }
        </h1>
        <p style={{ color: COLORS.textSecondary, fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          {planInfo.desc} — กรอกข้อมูลไว้เลยค่ะ ทีมจะแจ้งรายละเอียดการชำระเงินและ onboarding ให้ครบ
        </p>

        {/* Mini result summary */}
        {result && (
          <div style={{ ...CARD.base, padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '2px' }}>Revenue Gap ของคุณ</p>
              <p style={{ fontWeight: 900, fontSize: '22px', color: COLORS.danger }}>
                -฿{fmt(revenueGap)}<span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/เดือน</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '2px' }}>Score</p>
              <p style={{ fontWeight: 900, fontSize: '22px', color: COLORS.accentPurple }}>{result.score.total}<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>/100</span></p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              ชื่อ *
            </label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
              style={{
                width: '100%', height: '48px', borderRadius: RADIUS.button,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: COLORS.textPrimary, padding: '0 16px', fontSize: '15px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              อีเมล *
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%', height: '48px', borderRadius: RADIUS.button,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: COLORS.textPrimary, padding: '0 16px', fontSize: '15px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              เบอร์โทร <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none' }}>(optional — รับสาย LINE ได้เลย)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="08X-XXX-XXXX"
              style={{
                width: '100%', height: '48px', borderRadius: RADIUS.button,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: COLORS.textPrimary, padding: '0 16px', fontSize: '15px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: RADIUS.card,
              background: 'rgba(255,77,79,0.08)', border: '1px solid rgba(255,77,79,0.2)',
            }}>
              <p style={{ color: COLORS.danger, fontSize: '13px' }}>เกิดข้อผิดพลาด ลองใหม่อีกครั้งค่ะ</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            style={{
              width: '100%', height: '56px', borderRadius: RADIUS.button,
              background: loading ? 'rgba(255,159,28,0.5)' : COLORS.ctaOrange,
              color: '#000', fontWeight: 900, fontSize: '16px',
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px', opacity: (!name.trim() || !email.trim()) ? 0.5 : 1,
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'กำลังส่ง...' : 'ส่งข้อมูล — ทีมจะติดต่อกลับ'}
          </button>
        </form>

        {/* OR LINE direct — แสดงเฉพาะถ้า LINE OA พร้อม */}
        {LINE_READY && (
          <>
            <div style={{ textAlign: 'center', margin: '20px 0 8px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
              หรือ
            </div>
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', height: '52px', borderRadius: RADIUS.button,
                background: 'rgba(6,199,85,0.1)', border: '1px solid rgba(6,199,85,0.25)',
                color: '#06C755', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
              }}
            >
              <MessageCircle size={18} />
              ทักหา LINE OA ได้เลย
            </a>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.18)', marginTop: '24px' }}>
          ไม่มีค่าใช้จ่ายในการนัดคุย · ข้อมูลของคุณปลอดภัย
        </p>
      </div>
    </main>
  )
}

// Suspense wrapper — required for useSearchParams in Next.js App Router
export default function ContactPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0B0B0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(123,97,255,0.3)', borderTopColor: '#7B61FF', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <ContactContent />
    </Suspense>
  )
}
