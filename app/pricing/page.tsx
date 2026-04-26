'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowLeft, ArrowRight, Zap, Star, Crown, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import MitaLogo from '@/app/components/MitaLogo'

// ── Stripe Price IDs (set in Vercel env vars) ────────────
const PRICE_STARTER = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? ''
const PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? ''

// ── Data ─────────────────────────────────────────────────
const TIERS = [
  {
    id: 'free',
    icon: Zap,
    name: 'Free',
    price: '0',
    period: 'ตลอดไป',
    tagline: 'เริ่มรู้จักรายได้ที่หายไป',
    color: '#9CA3AF',
    gradient: 'linear-gradient(135deg, rgba(156,163,175,0.15), rgba(156,163,175,0.05))',
    border: 'rgba(156,163,175,0.20)',
    ctaText: 'เช็กฟรีเลย',
    ctaHref: '/audit',
    ctaStyle: 'border' as const,
    priceId: null,
    planKey: null,
    features: [
      'Monetization Score 0–100',
      'Revenue Blocker ที่ใหญ่ที่สุด 1 ตัว',
      '1 วิธีแก้ที่เริ่มได้เลยวันนี้',
      'Affiliate ที่เหมาะกับแนวช่องของคุณ',
      'Revenue Gap โดยประมาณ',
    ],
    locked: ['Revenue Blocker ทั้งหมด', 'แผน 30 วัน'],
  },
  {
    id: 'starter',
    icon: Star,
    name: 'Starter',
    price: '199',
    period: '/เดือน',
    tagline: 'ดูเต็มทุกจุดที่เสียเงิน',
    color: '#7B61FF',
    gradient: 'linear-gradient(135deg, rgba(123,97,255,0.18), rgba(123,97,255,0.06))',
    border: 'rgba(123,97,255,0.35)',
    ctaText: 'สมัคร Starter — ฿199/เดือน',
    ctaHref: null,
    ctaStyle: 'purple' as const,
    priceId: PRICE_STARTER,
    planKey: 'starter' as const,
    popular: false,
    features: [
      'ทุกอย่างใน Free +',
      '🔗 เชื่อมช่อง TikTok / YouTube / IG / FB / X / Lemon8',
      '🤖 AI วิเคราะห์ช่องจริง — demographics, peak hours',
      '💰 แผนหาเงินส่วนตัว สร้างจากข้อมูลช่องจริง',
      '📅 Roadmap รายสัปดาห์ เดือนแรก',
      '🛍 สินค้า Affiliate คัดตามแนวช่อง พร้อม link',
      '💬 Weekly Coach 4 ครั้ง/เดือน',
      '🏆 Progress tracker + milestones',
    ],
    locked: [],
  },
  {
    id: 'pro',
    icon: Crown,
    name: 'Pro',
    price: '499',
    period: '/เดือน',
    tagline: 'มีทีมช่วยวางระบบให้',
    color: '#FF9F1C',
    gradient: 'linear-gradient(135deg, rgba(255,159,28,0.08), rgba(255,159,28,0.02))',
    border: 'rgba(255,159,28,0.20)',
    ctaText: 'Coming Soon',
    ctaHref: null,
    ctaStyle: 'orange' as const,
    priceId: PRICE_PRO,
    planKey: 'pro' as const,
    popular: false,
    comingSoon: true,
    features: [
      'ทุกอย่างใน Starter +',
      '🔄 แผนหาเงิน ปรับใหม่ทุกเดือนตามผลจริง',
      '📞 Strategy Call 1 ครั้ง/เดือน กับทีม MITA+',
      '💬 Priority LINE Support ตลอดเดือน',
      '📝 Template Script + Funnel ปิดการขาย',
      '📊 ติดตาม Revenue Gap รายสัปดาห์',
      '⚡ รับ feature ใหม่ก่อนใคร',
    ],
    locked: [],
  },
]

const FAQ = [
  { q: 'ชำระเงินยังไง?', a: 'ชำระผ่าน Stripe ได้เลยค่ะ รองรับบัตรเครดิต/เดบิต, PromptPay, Apple Pay — ปลอดภัย 100% ใช้เวลาไม่กี่วินาที' },
  { q: 'ยกเลิกได้ไหม?', a: 'ยกเลิกได้ทุกเดือนค่ะ ไม่มีสัญญา — ยกเลิกผ่านระบบได้เลย plan จะหมดอายุตอนสิ้นรอบบิล' },
  { q: 'ต่างจากการทำ audit ฟรียังไง?', a: 'Audit ฟรีให้เห็นจุดใหญ่สุดจุดเดียว Starter/Pro ปลดล็อกทุก blocker + แผนทำงานจริง + ทีมช่วยติดตาม' },
  { q: 'Pro เหมาะกับใคร?', a: 'เหมาะกับ Creator ที่มี Followers 10K+ และอยากมีทีมช่วยวางระบบ ไม่ต้องทำคนเดียวค่ะ' },
]

// ── TierCard ─────────────────────────────────────────────
function TierCard({
  tier, index, onCheckout, loadingPlan,
}: {
  tier: typeof TIERS[0]
  index: number
  onCheckout: (priceId: string, plan: 'starter' | 'pro') => void
  loadingPlan: string | null
}) {
  const Icon = tier.icon
  const isLoading = loadingPlan === tier.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        background: tier.gradient,
        border: `1px solid ${tier.border}`,
        borderRadius: '20px',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        ...('popular' in tier && tier.popular ? { boxShadow: `0 0 40px rgba(255,159,28,0.15)` } : {}),
      }}
    >
      {'popular' in tier && tier.popular && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #FF9F1C, #ff6b35)',
          color: '#000', fontSize: '11px', fontWeight: 900,
          padding: '5px 18px', borderRadius: '20px', whiteSpace: 'nowrap',
        }}>⭐ แนะนำ</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: tier.color }} />
        </div>
        <div>
          <p style={{ fontWeight: 900, fontSize: '18px', color: '#fff', lineHeight: 1 }}>{tier.name}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{tier.tagline}</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
          {tier.price !== '0' && <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>฿</span>}
          <span style={{ fontWeight: 900, fontSize: '42px', lineHeight: 1, color: '#fff' }}>
            {tier.price === '0' ? 'ฟรี' : tier.price}
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{tier.period}</span>
        </div>
      </div>

      <div style={{ flex: 1, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tier.features.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: `${tier.color}22`, border: `1px solid ${tier.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '1px',
            }}>
              <Check size={9} style={{ color: tier.color }} />
            </div>
            <p style={{
              fontSize: '13px', lineHeight: 1.5,
              color: (f === 'ทุกอย่างใน Free +' || f === 'ทุกอย่างใน Starter +') ? tier.color : 'rgba(255,255,255,0.70)',
              fontWeight: (f === 'ทุกอย่างใน Free +' || f === 'ทุกอย่างใน Starter +') ? 700 : 400,
            }}>{f}</p>
          </div>
        ))}
        {tier.locked.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', opacity: 0.35 }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
            }}>
              <span style={{ fontSize: '8px' }}>🔒</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      {'comingSoon' in tier && tier.comingSoon ? (
        // ── Coming Soon button (disabled) ──
        <button disabled style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          height: '52px', borderRadius: '14px', border: '1px solid rgba(255,159,28,0.25)',
          background: 'rgba(255,159,28,0.06)', color: 'rgba(255,255,255,0.30)',
          fontWeight: 700, fontSize: '14px', cursor: 'not-allowed', letterSpacing: '0.05em',
        }}>
          🔒 Coming Soon
        </button>
      ) : tier.ctaStyle === 'border' ? (
        <Link href={tier.ctaHref!} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          height: '48px', borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.70)', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
        }}>
          {tier.ctaText} <ArrowRight size={14} />
        </Link>
      ) : (
        <button
          onClick={() => tier.priceId && tier.planKey && onCheckout(tier.priceId, tier.planKey)}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            height: '52px', borderRadius: '14px', border: 'none', cursor: isLoading ? 'wait' : 'pointer',
            background: tier.ctaStyle === 'orange'
              ? 'linear-gradient(135deg, #FF9F1C, #FF6B35)'
              : 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
            color: tier.ctaStyle === 'orange' ? '#000' : '#fff',
            fontWeight: 900, fontSize: '15px',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> กำลังเปิดหน้าชำระเงิน...</>
            : <><span>💳</span>{tier.ctaText}</>
          }
        </button>
      )}

      {tier.id !== 'free' && !('comingSoon' in tier && tier.comingSoon) && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.22)', marginTop: '10px' }}>
          ยกเลิกได้ทุกเดือน · ไม่มีสัญญา
        </p>
      )}
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? '' })
    })
  }, [])

  const handleCheckout = async (priceId: string, plan: 'starter' | 'pro') => {
    if (!priceId) { alert('ระบบยังไม่พร้อมค่ะ กรุณาลองใหม่อีกครั้ง'); return }

    // ถ้ายังไม่ login → ไปหน้า login ก่อน
    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    const tierId = plan
    setLoadingPlan(tierId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email, plan }),
      })
      let data: { url?: string; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        const text = await res.text().catch(() => '(no body)')
        throw new Error(`HTTP ${res.status} — response not JSON: ${text.slice(0, 200)}`)
      }
      if (data.error || !data.url) throw new Error(data.error ?? 'No URL returned')
      window.location.href = data.url
    } catch (err) {
      console.error('[checkout error]', err)
      alert(`เกิดข้อผิดพลาดค่ะ:\n${err instanceof Error ? err.message : String(err)}`)
      setLoadingPlan(null)
    }
  }

  return (
    <main style={{ background: '#08080f', minHeight: '100vh', color: '#fff' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,15,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '14px' }}>
          <ArrowLeft size={16} />
        </Link>
        <MitaLogo size="sm" />
        {user && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            {user.email}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(123,97,255,0.10)', border: '1px solid rgba(123,97,255,0.25)',
            borderRadius: '20px', padding: '6px 16px', marginBottom: '20px',
            fontSize: '12px', fontWeight: 600, color: '#a78bfa',
          }}>
            เลือกแผนที่เหมาะกับ Creator แบบคุณ
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2, marginBottom: '12px' }}>
            เริ่มฟรี แล้วอัปเกรด<br />
            <span style={{ background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              เมื่อพร้อมดึงเงินกลับมา
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '440px', margin: '0 auto' }}>
            ชำระผ่าน Stripe — บัตรเครดิต, PromptPay, Apple Pay ✅
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '64px', alignItems: 'start' }}>
          {TIERS.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} onCheckout={handleCheckout} loadingPlan={loadingPlan} />
          ))}
        </div>

        {/* Trust */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 32px', marginBottom: '64px' }}>
          {['✓ ยกเลิกได้ทุกเดือน', '✓ ชำระผ่าน Stripe ปลอดภัย 100%', '✓ PromptPay / บัตรเครดิต / Apple Pay', '✓ เริ่มได้ฟรีตอนนี้เลย'].map((t) => (
            <span key={t} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{t}</span>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginBottom: '64px' }}>
          <h2 style={{ fontWeight: 900, fontSize: '22px', textAlign: 'center', marginBottom: '28px' }}>เปรียบเทียบแผน</h2>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Feature</span>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, textAlign: 'center' }}>Free</span>
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700, textAlign: 'center' }}>Starter</span>
              <span style={{ fontSize: '12px', color: '#FF9F1C', fontWeight: 700, textAlign: 'center' }}>Pro</span>
            </div>
            {[
              { label: 'Monetization Score 0–100',           free: true,  starter: true,  pro: true  },
              { label: 'Revenue Blocker ที่ 1',              free: true,  starter: true,  pro: true  },
              { label: 'Revenue Blocker ทั้งหมด',            free: false, starter: true,  pro: true  },
              { label: 'เชื่อมช่อง 6 platforms (AI วิเคราะห์)', free: false, starter: true,  pro: true  },
              { label: 'แผนหาเงินส่วนตัว (จากข้อมูลจริง)',  free: false, starter: true,  pro: true  },
              { label: 'Roadmap รายสัปดาห์',                 free: false, starter: true,  pro: true  },
              { label: 'สินค้า Affiliate พร้อม link',        free: false, starter: true,  pro: true  },
              { label: 'Weekly Coach 4 ครั้ง/เดือน',         free: false, starter: true,  pro: true  },
              { label: 'Progress tracker + milestones',      free: false, starter: true,  pro: true  },
              { label: 'แผนหาเงิน ปรับใหม่ทุกเดือน',        free: false, starter: false, pro: true  },
              { label: 'Strategy Call 1 ครั้ง/เดือน',        free: false, starter: false, pro: true  },
              { label: 'Priority LINE Support',              free: false, starter: false, pro: true  },
              { label: 'Template Script + Funnel',           free: false, starter: false, pro: true  },
            ].map((row, i) => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px', padding: '13px 20px', borderBottom: i < 10 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.60)' }}>{row.label}</span>
                <span style={{ textAlign: 'center', fontSize: '15px' }}>{row.free ? <span style={{ color: '#9CA3AF' }}>✓</span> : <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>}</span>
                <span style={{ textAlign: 'center', fontSize: '15px' }}>{row.starter ? <span style={{ color: '#a78bfa' }}>✓</span> : <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>}</span>
                <span style={{ textAlign: 'center', fontSize: '15px' }}>{row.pro ? <span style={{ color: '#FF9F1C' }}>✓</span> : <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ maxWidth: '680px', margin: '0 auto 64px' }}>
          <h2 style={{ fontWeight: 900, fontSize: '22px', textAlign: 'center', marginBottom: '28px' }}>คำถามที่พบบ่อย</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ.map((item) => (
              <div key={item.q} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px' }}>
                <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '8px' }}>{item.q}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.65 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.40)', marginBottom: '16px' }}>ยังไม่แน่ใจ? เริ่มจาก Free ก่อนได้เลยค่ะ</p>
          <Link href="/audit" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '52px', padding: '0 32px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
            color: '#fff', fontWeight: 900, fontSize: '15px', textDecoration: 'none',
          }}>
            เช็กตัวเลขของฉัน (ฟรี) <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <MitaLogo size="sm" />
        <span style={{ opacity: 0.4 }}>— Money In The Air</span>
      </footer>
    </main>
  )
}
