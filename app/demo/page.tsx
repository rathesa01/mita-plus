'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, CARD, RADIUS, GLOW } from '@/lib/tokens'

// ── ตัวอย่าง data ช่องสมมติ ──────────────────────
const CREATOR = {
  name: 'น้องมิ้ว',
  platform: 'TikTok',
  niche: 'สอนทำขนม',
  followers: 12400,
  avgViews: 3200,
  engagement: 4.2,
  audience: { gender: 'หญิง 72%', age: '25–34 ปี', location: 'กรุงเทพ 61%' },
  targetIncome: 8500,
}

const PRODUCTS = [
  { name: 'พิมพ์ซิลิโคน Nordic', price: 290, commission: 8, img: '🧁' },
  { name: 'ชุดอุปกรณ์แต่งเค้ก', price: 450, commission: 6, img: '🎂' },
  { name: 'วัดส่วนผสม Digital', price: 180, commission: 10, img: '⚖️' },
  { name: 'ถุงบีบครีม 50 ชิ้น', price: 120, commission: 9, img: '🍦' },
  { name: 'สีผสมอาหาร Set 12 สี', price: 220, commission: 7, img: '🎨' },
]

const STEPS = [
  {
    day: 'วันที่ 1', time: '15 นาที', color: '#7B61FF',
    title: 'สมัคร Shopee Affiliate',
    detail: 'เข้า affiliate.shopee.co.th → กรอกข้อมูล → รอ approve 1 วัน → ได้ dashboard พร้อมสร้าง link ทันที',
    earn: null,
  },
  {
    day: 'วันที่ 2', time: '20 นาที', color: '#FF9F1C',
    title: 'คัดลอก 5 link จาก MITA+',
    detail: 'กลับมาที่ MITA+ → กด "คัดลอก link" ทีละอัน → บันทึกไว้ใน Notes → ได้ 5 link พร้อมแปะ',
    earn: null,
  },
  {
    day: 'วันที่ 3', time: '30 นาที', color: '#22C55E',
    title: 'ทำคลิป "เปิดกล่องอุปกรณ์ทำขนม"',
    detail: 'ถ่ายวิดีโอ 20–30 วิ → แสดงสินค้าชัดๆ → พูดสั้นว่า "ลิงค์อยู่ใน comment" → โพสต์ → แปะ link ใน comment แรก',
    earn: '฿200–500 จากคลิปแรก',
  },
  {
    day: 'วันที่ 7', time: '1 ชั่วโมง', color: '#3ECFFF',
    title: 'เช็คผล + ทำซ้ำ',
    detail: 'เข้า Shopee Affiliate Dashboard → ดูว่า link ไหน click มากสุด → ทำคลิปเพิ่มในแบบเดียวกัน → ตั้งเป้า 3 คลิป/สัปดาห์',
    earn: '฿1,500–3,000/เดือน',
  },
]

// ── Diagram Node Component ──────────────────────
function DiagramNode({
  icon, label, sub, color, delay = 0
}: { icon: string; label: string; sub: string; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '6px', minWidth: '90px',
      }}
    >
      <div style={{
        width: '64px', height: '64px', borderRadius: '16px',
        background: `${color}18`,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px',
        boxShadow: `0 0 16px ${color}40`,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textAlign: 'center', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '10px', color: color, textAlign: 'center', margin: 0, lineHeight: 1.3 }}>{sub}</p>
    </motion.div>
  )
}

// ── Arrow ───────────────────────────────────────
function Arrow({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '20px', paddingBottom: '20px' }}
    >
      →
    </motion.div>
  )
}

// ── Step Card ───────────────────────────────────
function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ ...CARD.base, overflow: 'hidden', marginBottom: '10px' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 16px', background: 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}
      >
        <span style={{
          background: step.color, color: '#000', fontWeight: 800,
          fontSize: '11px', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
        }}>{step.day}</span>
        <span style={{
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
          fontSize: '10px', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap',
        }}>⏱ {step.time}</span>
        <p style={{ flex: 1, margin: 0, fontWeight: 700, color: '#fff', fontSize: '14px' }}>{step.title}</p>
        {step.earn && (
          <span style={{ fontSize: '11px', color: '#22C55E', whiteSpace: 'nowrap', fontWeight: 700 }}>{step.earn}</span>
        )}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p style={{ margin: '12px 0 0', fontSize: '13px', color: COLORS.textSecondary, lineHeight: 1.65 }}>
            {step.detail}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Product Card ────────────────────────────────
function ProductCard({ p }: { p: typeof PRODUCTS[0] }) {
  const earn = Math.round(p.price * p.commission / 100)
  return (
    <div style={{
      ...CARD.base, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <span style={{ fontSize: '28px' }}>{p.img}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '13px' }}>{p.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: COLORS.textSecondary }}>
          ฿{p.price} · commission {p.commission}%
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>ได้/ชิ้น</p>
        <p style={{ margin: 0, fontWeight: 900, fontSize: '16px', color: '#22C55E' }}>฿{earn}</p>
      </div>
      <button style={{
        background: '#7B61FF', color: '#fff', border: 'none', borderRadius: '10px',
        padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        คัดลอก link
      </button>
    </div>
  )
}

// ── Main Page ───────────────────────────────────
export default function DemoPage() {
  const [tab, setTab] = useState<'diagram' | 'cards'>('diagram')

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', background: '#7B61FF22', color: '#7B61FF', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
            ✦ MITA+ Starter
          </span>
        </div>
        <h1 style={{ margin: '8px 0 2px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
          แผนหาเงินของ{CREATOR.name}
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: COLORS.textSecondary }}>
          {CREATOR.platform} · {CREATOR.niche} · {CREATOR.followers.toLocaleString('th-TH')} followers
        </p>

        {/* Target */}
        <div style={{
          marginTop: '16px', padding: '14px 16px',
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: RADIUS.card,
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#22C55E', fontWeight: 700 }}>เป้าหมาย 90 วัน</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
              ฿{CREATOR.targetIncome.toLocaleString('th-TH')}
            </span>
            <span style={{ fontSize: '13px', color: COLORS.textSecondary }}>/เดือน</span>
          </div>
          <div style={{ marginTop: '8px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '8%' }}
              transition={{ delay: 0.5, duration: 1 }}
              style={{ height: '100%', background: '#22C55E', borderRadius: '99px' }}
            />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>ตอนนี้ ฿0 → ฿8,500</p>
        </div>
      </motion.div>

      {/* Tab Switch */}
      <div style={{
        display: 'flex', gap: '8px', marginTop: '20px', marginBottom: '20px',
        background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px',
      }}>
        {(['diagram', 'cards'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px',
              background: tab === t ? '#7B61FF' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {t === 'diagram' ? '🗺 ภาพรวมระบบ' : '📋 แผนทีละขั้น'}
          </button>
        ))}
      </div>

      {/* ── TAB: DIAGRAM ─────────────────────────── */}
      {tab === 'diagram' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Flow Diagram */}
          <div style={{ ...CARD.base, padding: '20px 16px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              ระบบหาเงินของช่องคุณ
            </p>

            {/* Row 1: Channel → Analysis */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <DiagramNode icon="📱" label="ช่องของคุณ" sub={`${CREATOR.followers.toLocaleString('th-TH')} followers`} color="#7B61FF" delay={0.1} />
              <Arrow delay={0.2} />
              <DiagramNode icon="🔍" label="MITA+ วิเคราะห์" sub="AI อ่านข้อมูลจริง" color="#3ECFFF" delay={0.3} />
            </div>

            {/* Down arrow */}
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '20px', margin: '4px 0' }}>↓</div>

            {/* Row 2: Audience */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                padding: '12px 14px', borderRadius: '14px',
                background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.2)',
                marginBottom: '8px',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#FF9F1C' }}>👥 คนดูของคุณ</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: CREATOR.audience.gender, icon: '💁‍♀️' },
                  { label: CREATOR.audience.age, icon: '🎂' },
                  { label: CREATOR.audience.location, icon: '📍' },
                ].map(t => (
                  <span key={t.label} style={{
                    fontSize: '11px', color: '#fff',
                    background: 'rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: '20px',
                  }}>
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>
            </motion.div>

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '20px', margin: '4px 0' }}>↓</div>

            {/* Row 3: Products → Content */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <DiagramNode icon="🛍" label="สินค้าที่เหมาะ" sub="15 อย่าง คัดมาให้" color="#22C55E" delay={0.5} />
              <Arrow delay={0.6} />
              <DiagramNode icon="🎬" label="ไอเดียคลิป" sub="5 แบบที่น่าจะปัง" color="#FF9F1C" delay={0.7} />
            </div>

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '20px', margin: '4px 0' }}>↓</div>

            {/* Row 4: Revenue */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                padding: '16px', borderRadius: '14px', textAlign: 'center',
                background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)',
                boxShadow: GLOW.green,
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#22C55E', fontWeight: 700 }}>💰 รายได้ที่คาดได้</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 900, color: '#fff' }}>
                ฿{CREATOR.targetIncome.toLocaleString('th-TH')}
                <span style={{ fontSize: '14px', fontWeight: 400, color: COLORS.textSecondary }}>/เดือน</span>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                ถ้าทำตามแผน 90 วัน
              </p>
            </motion.div>
          </div>

          {/* Calculation breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{ ...CARD.base, padding: '16px', marginTop: '12px' }}
          >
            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
              คำนวณจากช่องของคุณ
            </p>
            {[
              { label: 'คนดูเฉลี่ย/คลิป', value: '3,200 คน' },
              { label: 'คลิก link ประมาณ 2%', value: '64 คน' },
              { label: 'ซื้อจริง 30%', value: '19 คน/คลิป' },
              { label: '× commission ฿23 เฉลี่ย', value: '฿437/คลิป' },
              { label: '× 3 คลิป/สัปดาห์ × 4', value: '= ฿5,244/เดือน' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>{r.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: i === 4 ? '#22C55E' : '#fff' }}>{r.value}</span>
              </div>
            ))}
          </motion.div>

          {/* MITA+ message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              marginTop: '12px', padding: '16px',
              background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)',
              borderRadius: RADIUS.card,
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              💌 <strong style={{ color: '#7B61FF' }}>จาก MITA+</strong><br />
              คุณมีคนดูที่ไว้ใจคุณอยู่แล้ว 12,400 คน<br />
              แค่ยังไม่รู้ว่าจะเปลี่ยนมันเป็นเงินยังไง<br />
              MITA+ จะอัพเดทแผนให้ทุกเดือน จนกว่าคุณจะถึงเป้าค่ะ 🎯
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* ── TAB: CARDS ───────────────────────────── */}
      {tab === 'cards' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Products */}
          <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            🛍 สินค้าที่เหมาะกับช่องคุณ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {PRODUCTS.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <ProductCard p={p} />
              </motion.div>
            ))}
          </div>

          {/* Steps */}
          <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            📋 ทำตามนี้เลย ทีละขั้น
          </p>
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}

          {/* MITA+ message */}
          <div style={{
            marginTop: '16px', padding: '16px',
            background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)',
            borderRadius: RADIUS.card,
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              💌 <strong style={{ color: '#7B61FF' }}>จาก MITA+</strong><br />
              คุณมีคนดูที่ไว้ใจคุณอยู่แล้ว 12,400 คน<br />
              แค่ยังไม่รู้ว่าจะเปลี่ยนมันเป็นเงินยังไง<br />
              MITA+ จะอัพเดทแผนให้ทุกเดือน จนกว่าคุณจะถึงเป้าค่ะ 🎯
            </p>
          </div>
        </motion.div>
      )}

      <div style={{ height: '48px' }} />
    </div>
  )
}
