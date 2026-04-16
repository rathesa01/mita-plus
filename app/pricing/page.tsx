'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowLeft, ArrowRight, Zap, Star, Crown } from 'lucide-react'

// ── Config ───────────────────────────────────────────────
const LINE_OA_URL = process.env.NEXT_PUBLIC_LINE_OA_URL ?? ''

function planUrl(plan: 'starter' | 'pro') {
  // ถ้ามี LINE OA → ส่งไป LINE ได้เลย
  if (LINE_OA_URL && !LINE_OA_URL.includes('YOUR_LINE')) {
    const msg = plan === 'starter'
      ? 'สวัสดีค่ะ ต้องการสมัคร Starter Plan ฿199/เดือน'
      : 'สวัสดีค่ะ ต้องการสมัคร Pro Plan ฿499/เดือน'
    return `https://line.me/R/msg/text/?${encodeURIComponent(msg)}`
  }
  // fallback → contact form
  return `/contact?plan=${plan}`
}

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
    ctaStyle: 'border',
    features: [
      'Monetization Score 0–100',
      'Revenue Blocker ที่ใหญ่ที่สุด 1 ตัว',
      '1 วิธีแก้ที่เริ่มได้เลยวันนี้',
      'Affiliate ที่เหมาะกับ niche ของคุณ',
      'Revenue Gap โดยประมาณ',
    ],
    locked: [
      'Revenue Blocker ทั้งหมด',
      'แผน 90 วัน',
    ],
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
    ctaText: 'สมัคร Starter Plan',
    ctaHref: planUrl('starter'),
    ctaStyle: 'purple',
    popular: false,
    features: [
      'ทุกอย่างใน Free +',
      'Revenue Blocker ทั้งหมด (2–5 ตัว)',
      'วิธีแก้ทุกจุด พร้อม action ชัดเจน',
      'แผน 90 วัน แบบเต็ม',
      'Revenue Breakdown ทุกช่องทาง',
      'รายงานรายเดือน (ส่งทาง LINE)',
      'Milestone unlock ตาม progress',
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
    gradient: 'linear-gradient(135deg, rgba(255,159,28,0.18), rgba(255,159,28,0.06))',
    border: 'rgba(255,159,28,0.40)',
    ctaText: 'สมัคร Pro Plan',
    ctaHref: planUrl('pro'),
    ctaStyle: 'orange',
    popular: true,
    features: [
      'ทุกอย่างใน Starter +',
      'แผน 30 วัน ปรับใหม่ทุกเดือน',
      'Priority LINE Support ตลอดเดือน',
      'Strategy Call 1 ครั้ง/เดือน',
      'Template Funnel + Script ปิดการขาย',
      'ติดตาม Revenue Gap รายสัปดาห์',
      'รับก่อนเมื่อ feature ใหม่ออก',
    ],
    locked: [],
  },
]

const FAQ = [
  {
    q: 'ชำระเงินยังไง?',
    a: 'กด "สมัครผ่าน LINE" แล้วทีมเราจะส่งลิงก์ชำระเงินให้ทาง LINE OA ค่ะ ใช้เวลาไม่เกิน 10 นาที',
  },
  {
    q: 'ยกเลิกได้ไหม?',
    a: 'ยกเลิกได้ทุกเดือนค่ะ ไม่มีสัญญา — แค่แจ้งทีมทาง LINE ก่อนวันต่ออายุ',
  },
  {
    q: 'ต่างจากการทำ audit ฟรียังไง?',
    a: 'Audit ฟรีให้เห็นจุดใหญ่ที่สุดจุดเดียว Starter/Pro ปลดล็อกทุก blocker + แผนทำงานจริง + ทีมช่วยติดตาม เหมาะกับคนที่อยากดึงเงินกลับมาจริงๆ ค่ะ',
  },
  {
    q: 'Pro เหมาะกับใคร?',
    a: 'เหมาะกับ Creator ที่มี Followers 10K+ และอยากมีทีมช่วยวางระบบ ไม่ต้องทำคนเดียวค่ะ',
  },
]

// ── Components ────────────────────────────────────────────
function TierCard({ tier, index }: { tier: typeof TIERS[0]; index: number }) {
  const Icon = tier.icon

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
        ...(tier.popular ? { boxShadow: `0 0 40px rgba(255,159,28,0.15)` } : {}),
      }}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #FF9F1C, #ff6b35)',
          color: '#000',
          fontSize: '11px',
          fontWeight: 900,
          padding: '5px 18px',
          borderRadius: '20px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.03em',
        }}>
          ⭐ แนะนำ
        </div>
      )}

      {/* Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `rgba(255,255,255,0.06)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: tier.color }} />
        </div>
        <div>
          <p style={{ fontWeight: 900, fontSize: '18px', color: '#fff', lineHeight: 1 }}>{tier.name}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{tier.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
          {tier.price !== '0' && (
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>฿</span>
          )}
          <span style={{ fontWeight: 900, fontSize: '42px', lineHeight: 1, color: '#fff' }}>
            {tier.price === '0' ? 'ฟรี' : tier.price}
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
            {tier.period}
          </span>
        </div>
      </div>

      {/* Features */}
      <div style={{ flex: 1, marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tier.features.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: `${tier.color}22`,
                border: `1px solid ${tier.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '1px',
              }}>
                <Check size={9} style={{ color: tier.color }} />
              </div>
              <p style={{
                fontSize: '13px',
                color: f === 'ทุกอย่างใน Free +' || f === 'ทุกอย่างใน Starter +' ? tier.color : 'rgba(255,255,255,0.70)',
                lineHeight: 1.5,
                fontWeight: f === 'ทุกอย่างใน Free +' || f === 'ทุกอย่างใน Starter +' ? 700 : 400,
              }}>{f}</p>
            </div>
          ))}

          {/* Locked items (free only) */}
          {tier.locked.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', opacity: 0.35 }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '1px',
              }}>
                <span style={{ fontSize: '8px' }}>🔒</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      {tier.ctaStyle === 'border' ? (
        <Link
          href={tier.ctaHref}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            height: '48px', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.70)',
            fontWeight: 700, fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          {tier.ctaText}
          <ArrowRight size={14} />
        </Link>
      ) : tier.ctaStyle === 'orange' ? (
        <a
          href={tier.ctaHref}
          target={tier.ctaHref !== '#' ? '_blank' : undefined}
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #FF9F1C, #FF6B35)',
            color: '#000',
            fontWeight: 900, fontSize: '15px',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '16px' }}>💬</span>
          {tier.ctaText}
        </a>
      ) : (
        <a
          href={tier.ctaHref}
          target={tier.ctaHref !== '#' ? '_blank' : undefined}
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            height: '52px', borderRadius: '14px',
            background: 'rgba(123,97,255,0.20)',
            border: '1px solid rgba(123,97,255,0.40)',
            color: '#a78bfa',
            fontWeight: 700, fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '16px' }}>💬</span>
          {tier.ctaText}
        </a>
      )}

      {tier.id !== 'free' && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.22)', marginTop: '10px' }}>
          ยกเลิกได้ทุกเดือน · ไม่มีสัญญา
        </p>
      )}
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function PricingPage() {
  return (
    <main style={{ background: '#08080f', minHeight: '100vh', color: '#fff' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,15,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Link href="/" style={{
          color: 'rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', gap: '4px',
          textDecoration: 'none', fontSize: '14px',
        }}>
          <ArrowLeft size={16} />
        </Link>
        <span style={{
          fontWeight: 900, fontSize: '17px',
          background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>MITA+</span>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(123,97,255,0.10)',
            border: '1px solid rgba(123,97,255,0.25)',
            borderRadius: '20px',
            padding: '6px 16px',
            marginBottom: '20px',
            fontSize: '12px', fontWeight: 600,
            color: '#a78bfa',
          }}>
            เลือกแผนที่เหมาะกับ Creator แบบคุณ
          </div>

          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2, marginBottom: '12px' }}>
            เริ่มฟรี แล้วอัปเกรด
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>เมื่อพร้อมดึงเงินกลับมา</span>
          </h1>

          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '440px', margin: '0 auto' }}>
            ไม่ต้องสมัคร ไม่ต้องใส่บัตรเครดิต — เริ่มวิเคราะห์ได้เลยตอนนี้
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '64px',
          alignItems: 'start',
        }}>
          {TIERS.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} />
          ))}
        </div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px 32px',
            marginBottom: '64px',
          }}
        >
          {[
            '✓ ยกเลิกได้ทุกเดือน',
            '✓ ส่งผลทาง LINE ภายใน 24 ชม.',
            '✓ ไม่ต้องใส่บัตรเครดิต',
            '✓ เริ่มได้ฟรีตอนนี้เลย',
          ].map((t) => (
            <span key={t} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{t}</span>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '64px' }}
        >
          <h2 style={{ fontWeight: 900, fontSize: '22px', textAlign: 'center', marginBottom: '28px' }}>
            เปรียบเทียบแผน
          </h2>

          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Feature</span>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, textAlign: 'center' }}>Free</span>
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700, textAlign: 'center' }}>Starter</span>
              <span style={{ fontSize: '12px', color: '#FF9F1C', fontWeight: 700, textAlign: 'center' }}>Pro</span>
            </div>

            {[
              { label: 'Monetization Score',                   free: true,  starter: true,  pro: true },
              { label: 'Revenue Blocker ที่ 1',                free: true,  starter: true,  pro: true },
              { label: 'Revenue Blocker ทั้งหมด (2–5)',        free: false, starter: true,  pro: true },
              { label: 'วิธีแก้แบบเต็ม',                      free: false, starter: true,  pro: true },
              { label: 'แผน 90 วัน',                           free: false, starter: true,  pro: true },
              { label: 'Revenue Breakdown ทุกช่องทาง',         free: false, starter: true,  pro: true },
              { label: 'รายงานรายเดือน (LINE)',                free: false, starter: true,  pro: true },
              { label: 'แผน 30 วัน ปรับใหม่ทุกเดือน',         free: false, starter: false, pro: true },
              { label: 'Priority LINE Support',                free: false, starter: false, pro: true },
              { label: 'Strategy Call 1 ครั้ง/เดือน',         free: false, starter: false, pro: true },
              { label: 'Template Funnel + Script',             free: false, starter: false, pro: true },
            ].map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
                  padding: '13px 20px',
                  borderBottom: i < 10 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
              >
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.60)' }}>{row.label}</span>
                <span style={{ textAlign: 'center', fontSize: '15px' }}>{row.free ? '✓' : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}</span>
                <span style={{ textAlign: 'center', fontSize: '15px', color: row.starter ? '#a78bfa' : undefined }}>{row.starter ? '✓' : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}</span>
                <span style={{ textAlign: 'center', fontSize: '15px', color: row.pro ? '#FF9F1C' : undefined }}>{row.pro ? '✓' : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ maxWidth: '680px', margin: '0 auto 64px' }}
        >
          <h2 style={{ fontWeight: 900, fontSize: '22px', textAlign: 'center', marginBottom: '28px' }}>
            คำถามที่พบบ่อย
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ.map((item) => (
              <div
                key={item.q}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '8px' }}>{item.q}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.65 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.40)', marginBottom: '16px' }}>
            ยังไม่แน่ใจ? เริ่มจาก Free ก่อนได้เลยค่ะ
          </p>
          <Link
            href="/audit"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              height: '52px', padding: '0 32px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
              color: '#fff', fontWeight: 900, fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            เช็กตัวเลขของฉัน (ฟรี)
            <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: '12px', color: 'rgba(255,255,255,0.20)',
      }}>
        <span style={{
          background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontWeight: 900,
        }}>MITA+</span>
        {' '}— Money In The Air
      </footer>
    </main>
  )
}
