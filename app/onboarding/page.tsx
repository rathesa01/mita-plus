'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, Upload, Pencil, ArrowLeft } from 'lucide-react'
import { COLORS, CARD, RADIUS } from '@/lib/tokens'

// ── Types ──────────────────────────────────────────
interface OnboardingData {
  name: string
  platform: string
  niche: string
  targetIncome: number
  followers: string
  avgViews: string
  connectMethod: 'screenshot' | 'manual' | null
}

// ── Constants ──────────────────────────────────────
const PLATFORMS = [
  { key: 'tiktok',    label: 'TikTok',     emoji: '🎵', color: '#FF2D55' },
  { key: 'instagram', label: 'Instagram',  emoji: '📸', color: '#E1306C' },
  { key: 'youtube',   label: 'YouTube',    emoji: '▶️', color: '#FF0000' },
  { key: 'facebook',  label: 'Facebook',   emoji: '👥', color: '#1877F2' },
  { key: 'multi',     label: 'หลาย platform', emoji: '🌐', color: '#7B61FF' },
]

const NICHES = [
  { key: 'food',          label: 'อาหาร',      emoji: '🍳' },
  { key: 'beauty',        label: 'ความงาม',    emoji: '💄' },
  { key: 'fitness',       label: 'ฟิตเนส',    emoji: '💪' },
  { key: 'lifestyle',     label: 'ไลฟ์สไตล์', emoji: '✨' },
  { key: 'finance',       label: 'การเงิน',    emoji: '💰' },
  { key: 'education',     label: 'ความรู้',    emoji: '📚' },
  { key: 'travel',        label: 'ท่องเที่ยว', emoji: '✈️' },
  { key: 'entertainment', label: 'บันเทิง',   emoji: '🎬' },
  { key: 'business',      label: 'ธุรกิจ',    emoji: '💼' },
  { key: 'other',         label: 'อื่นๆ',     emoji: '🌟' },
]

const INCOME_GOALS = [
  { value: 1000,   label: '฿1,000',  sub: 'เริ่มต้น',         emoji: '🌱' },
  { value: 5000,   label: '฿5,000',  sub: 'ค่าใช้จ่ายรายวัน', emoji: '☕' },
  { value: 10000,  label: '฿10,000', sub: 'เสริมรายได้',       emoji: '🎯' },
  { value: 30000,  label: '฿30,000', sub: 'รายได้หลัก',        emoji: '🚀' },
  { value: 50000,  label: '฿50,000', sub: 'Full-time creator',  emoji: '👑' },
]

// ── Shared UI ──────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100
  return (
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', marginBottom: '32px' }}>
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ height: '100%', background: 'linear-gradient(to right, #7B61FF, #3ECFFF)', borderRadius: '99px' }}
      />
    </div>
  )
}

function PrimaryBtn({ onClick, disabled, children }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '16px',
        background: disabled ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
        color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
        border: 'none', borderRadius: '16px',
        fontSize: '16px', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </motion.button>
  )
}

// ── Step 0: Welcome ────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        >
          <span style={{
            fontSize: '48px', fontWeight: 900,
            background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            MITA+
          </span>
        </motion.div>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Starter Plan</p>
      </div>

      <h1 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>
        ยินดีต้อนรับค่ะ 🎉
      </h1>
      <p style={{ margin: '0 0 32px', fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
        MITA+ จะเป็นโค้ชส่วนตัวให้คุณ<br />
        ตั้งแต่คลิปแรกจนถึงรายได้จริงค่ะ
      </p>

      {/* Value props */}
      {[
        { emoji: '📋', title: 'แผนรายอาทิตย์', desc: 'รู้เลยว่าต้องทำอะไรแต่ละวัน' },
        { emoji: '🤖', title: 'โค้ช AI 24/7',   desc: 'feedback + ไอเดียคลิปทุกสัปดาห์' },
        { emoji: '🛍', title: 'สินค้า trending', desc: 'คัดมาเฉพาะตามแนวช่องของคุณ' },
        { emoji: '⏰', title: 'เวลาที่ดีสุด',   desc: 'โพสต์ถูกเวลา view เพิ่มขึ้นได้เลย' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.08 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 16px', marginBottom: '8px',
            ...CARD.base,
          }}
        >
          <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.emoji}</span>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{item.title}</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
          </div>
        </motion.div>
      ))}

      <div style={{ marginTop: '28px' }}>
        <PrimaryBtn onClick={onNext}>เริ่มเลย → ใช้เวลา 2 นาทีค่ะ</PrimaryBtn>
        <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
          ไม่ต้องผูกบัตรเครดิต — ทดลองฟรี 7 วันค่ะ
        </p>
      </div>
    </motion.div>
  )
}

// ── Step 1: Name + Platform ────────────────────────
function StepProfile({
  data, onChange, onNext,
}: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void; onNext: () => void }) {
  const canNext = data.name.trim().length > 0 && data.platform !== ''
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>ขั้นที่ 1/4</p>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, color: '#fff' }}>แนะนำตัวก่อนนะคะ</h2>
      <p style={{ margin: '0 0 28px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>จะได้วางแผนได้เหมาะกับคุณจริงๆ ค่ะ</p>

      {/* Name input */}
      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>ชื่อที่ต้องการให้โค้ชเรียก</p>
      <input
        value={data.name}
        onChange={e => onChange('name', e.target.value)}
        placeholder="เช่น น้องมิ้ว, นุ่น, PalmPalm"
        maxLength={30}
        style={{
          width: '100%', padding: '14px 16px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.05)',
          border: data.name ? '1.5px solid #7B61FF' : '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: '14px', fontSize: '16px', fontWeight: 700,
          color: '#fff', outline: 'none', boxSizing: 'border-box',
        }}
      />

      {/* Platform select */}
      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Platform หลักของคุณ</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {PLATFORMS.map(p => (
          <motion.button
            key={p.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange('platform', p.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
              background: data.platform === p.key ? `${p.color}15` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${data.platform === p.key ? p.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '14px', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '20px' }}>{p.emoji}</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', flex: 1 }}>{p.label}</span>
            {data.platform === p.key && <Check size={16} style={{ color: p.color, flexShrink: 0 }} />}
          </motion.button>
        ))}
      </div>
      <PrimaryBtn onClick={onNext} disabled={!canNext}>ถัดไป →</PrimaryBtn>
    </motion.div>
  )
}

// ── Step 2: Niche ──────────────────────────────────
function StepNiche({
  data, onChange, onNext,
}: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>ขั้นที่ 2/4</p>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, color: '#fff' }}>คอนเทนต์ของคุณเกี่ยวกับอะไร?</h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        MITA+ จะคัดสินค้าและ script ให้ตรงแนวช่องค่ะ
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
        {NICHES.map(n => (
          <motion.button
            key={n.key}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange('niche', n.key)}
            style={{
              padding: '16px 12px',
              background: data.niche === n.key ? 'rgba(123,97,255,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${data.niche === n.key ? '#7B61FF' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '26px' }}>{n.emoji}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: data.niche === n.key ? '#7B61FF' : 'rgba(255,255,255,0.7)' }}>
              {n.label}
            </span>
            {data.niche === n.key && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ position: 'absolute', top: '8px', right: '8px' }}
              />
            )}
          </motion.button>
        ))}
      </div>
      <PrimaryBtn onClick={onNext} disabled={!data.niche}>ถัดไป →</PrimaryBtn>
    </motion.div>
  )
}

// ── Step 3: Income goal ────────────────────────────
function StepGoal({
  data, onChange, onNext,
}: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: number) => void; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>ขั้นที่ 3/4</p>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, color: '#fff' }}>ตั้งเป้าหมายรายได้</h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        โค้ชจะวางแผนให้ถึงเป้านี้ใน 30 วันค่ะ
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {INCOME_GOALS.map(g => (
          <motion.button
            key={g.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange('targetIncome', g.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
              background: data.targetIncome === g.value ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${data.targetIncome === g.value ? '#22C55E' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '14px', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{g.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#fff' }}>{g.label}<span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>/เดือน</span></p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{g.sub}</p>
            </div>
            {data.targetIncome === g.value && <Check size={16} style={{ color: '#22C55E', flexShrink: 0 }} />}
          </motion.button>
        ))}
      </div>
      <PrimaryBtn onClick={onNext} disabled={!data.targetIncome}>ถัดไป →</PrimaryBtn>
    </motion.div>
  )
}

// ── Step 4: Connect data ───────────────────────────
function StepConnect({
  data, onChange, onNext,
}: {
  data: OnboardingData
  onChange: (k: keyof OnboardingData, v: string | null) => void
  onNext: () => void
}) {
  const isTikTok   = data.platform === 'tiktok'
  const canNext    = data.connectMethod !== null
  const isManual   = data.connectMethod === 'manual'
  const isUpload   = data.connectMethod === 'screenshot'
  const canSubmit  = canNext && (isUpload || (isManual && data.followers && data.avgViews))

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>ขั้นที่ 4/4</p>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, color: '#fff' }}>เชื่อมข้อมูล account</h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        ใช้วางแผนให้เหมาะกับ account คุณจริงๆ ค่ะ
      </p>

      {/* Method A: Screenshot (TikTok recommended) */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange('connectMethod', 'screenshot')}
        style={{
          width: '100%', padding: '16px', marginBottom: '10px', textAlign: 'left',
          background: isUpload ? 'rgba(123,97,255,0.12)' : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${isUpload ? '#7B61FF' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>📸</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                แคปหน้าจอ {isTikTok ? 'TikTok' : 'platform'} ให้โค้ช
              </p>
              <span style={{ fontSize: '10px', color: '#7B61FF', background: 'rgba(123,97,255,0.15)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700, flexShrink: 0 }}>
                แนะนำ
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              โค้ชจะเห็นข้อมูลจริง → วางแผนได้แม่นขึ้นมาก
            </p>
          </div>
          {isUpload && <Check size={16} style={{ color: '#7B61FF', flexShrink: 0, marginTop: '2px' }} />}
        </div>

        {/* Screenshot guide (expanded) */}
        {isUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>วิธีแคปหน้าจอ (3 รูป):</p>
            {[
              { step: '1', desc: 'Creator Studio → Overview → แคป Dashboard หลัก', img: '📊' },
              { step: '2', desc: 'กด "รายได้" → แคปหน้า Earnings', img: '💰' },
              { step: '3', desc: 'กด "Analytics" → แคปหน้า Follower ข้อมูล', img: '👥' },
            ].map(s => (
              <div key={s.step} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 0',
                borderBottom: s.step !== '3' ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '99px',
                  background: 'rgba(123,97,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#7B61FF', flexShrink: 0,
                }}>
                  {s.step}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{s.desc}</span>
              </div>
            ))}
            <div style={{
              marginTop: '12px', padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Upload size={16} style={{ color: '#7B61FF', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>อัปโหลดได้ในขั้นตอนถัดไปค่ะ</span>
            </div>
          </motion.div>
        )}
      </motion.button>

      {/* Method B: Manual input */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange('connectMethod', 'manual')}
        style={{
          width: '100%', padding: '16px', marginBottom: '20px', textAlign: 'left',
          background: isManual ? 'rgba(62,207,255,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${isManual ? '#3ECFFF' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}><Pencil size={20} style={{ color: '#3ECFFF', marginTop: '2px' }} /></span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700, color: '#fff' }}>กรอกข้อมูลเองเลย</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              กรอก follower + views โดยประมาณก็ได้ค่ะ
            </p>
          </div>
          {isManual && <Check size={16} style={{ color: '#3ECFFF', flexShrink: 0, marginTop: '2px' }} />}
        </div>

        {/* Manual fields (expanded) */}
        {isManual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ marginBottom: '10px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>จำนวน Followers</p>
              <input
                value={data.followers}
                onChange={e => onChange('followers', e.target.value)}
                placeholder="เช่น 12400"
                type="number"
                inputMode="numeric"
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                  color: '#fff', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Views เฉลี่ยต่อโพสต์</p>
              <input
                value={data.avgViews}
                onChange={e => onChange('avgViews', e.target.value)}
                placeholder="เช่น 5000"
                type="number"
                inputMode="numeric"
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                  color: '#fff', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.button>

      <PrimaryBtn onClick={onNext} disabled={!canSubmit}>
        {isUpload ? 'ถัดไป — อัปโหลดรูป →' : 'เริ่มได้เลย 🚀'}
      </PrimaryBtn>
    </motion.div>
  )
}

// ── Step 5: Launching ──────────────────────────────
function StepLaunching({ name, niche, platform, targetIncome }: {
  name: string; niche: string; platform: string; targetIncome: number
}) {
  const nicheEmoji = NICHES.find(n => n.key === niche)?.emoji ?? '✨'
  const nicheLabel = NICHES.find(n => n.key === niche)?.label ?? niche
  const platformLabel = PLATFORMS.find(p => p.key === platform)?.label ?? platform

  const items = [
    '✅ วิเคราะห์แนวช่องของคุณ',
    '✅ คัดสินค้าที่เหมาะกับ audience',
    '✅ วางแผน 4 อาทิตย์แรก',
    '✅ ตั้งเวลาโค้ชประจำสัปดาห์',
    '✅ เตรียม script คลิปแรกให้',
  ]

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
      <motion.div
        animate={{ rotate: [0, 10, -10, 10, 0] }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ fontSize: '60px', lineHeight: 1, marginBottom: '16px' }}
      >
        {nicheEmoji}
      </motion.div>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, color: '#fff' }}>
        โค้ชกำลัง setup ให้{name}อยู่ค่ะ!
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        {nicheLabel} · {platformLabel} · เป้า ฿{targetIncome.toLocaleString('th-TH')}/เดือน
      </p>

      <div style={{ textAlign: 'left', marginBottom: '28px' }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            style={{
              padding: '12px 14px', marginBottom: '6px',
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '12px',
              fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500,
            }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div style={{
          padding: '16px', marginBottom: '20px',
          background: 'rgba(123,97,255,0.08)',
          border: '1px solid rgba(123,97,255,0.2)',
          borderRadius: '14px',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#7B61FF' }}>💌 จาก MITA+</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
            พร้อมแล้วค่ะ {name}! แผนแรกของคุณรออยู่ข้างใน<br />
            โค้ชจะ check-in ทุกอาทิตย์นะคะ 💪
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────
const TOTAL_STEPS = 6 // 0=welcome, 1=profile, 2=niche, 3=goal, 4=connect, 5=launching

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '', platform: '', niche: '', targetIncome: 0,
    followers: '', avgViews: '', connectMethod: null,
  })

  const update = (key: keyof OnboardingData, value: string | number | null) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const next = () => {
    if (step === 4) {
      setStep(5)
      // Auto-redirect after launch animation
      setTimeout(() => router.push('/starter'), 2800)
    } else {
      setStep(s => s + 1)
    }
  }

  const back = () => setStep(s => Math.max(0, s - 1))

  return (
    <div style={{
      background: COLORS.bg, minHeight: '100vh',
      maxWidth: '480px', margin: '0 auto',
      padding: '0 0 40px',
    }}>
      {/* Progress bar */}
      {step > 0 && step < 5 && (
        <div style={{ padding: '16px 20px 0' }}>
          <ProgressBar step={step - 1} total={4} />
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < 5 && (
        <button
          onClick={back}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', padding: '0 20px 8px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px',
          }}
        >
          <ArrowLeft size={14} /> ย้อนกลับ
        </button>
      )}

      {/* Content */}
      <div style={{ padding: step === 0 ? '40px 20px 0' : '8px 20px 0' }}>
        <AnimatePresence mode="wait">
          {step === 0 && <StepWelcome key="s0" onNext={next} />}
          {step === 1 && <StepProfile key="s1" data={data} onChange={update} onNext={next} />}
          {step === 2 && <StepNiche   key="s2" data={data} onChange={update} onNext={next} />}
          {step === 3 && <StepGoal    key="s3" data={data} onChange={update} onNext={next} />}
          {step === 4 && <StepConnect key="s4" data={data} onChange={update} onNext={next} />}
          {step === 5 && (
            <StepLaunching
              key="s5"
              name={data.name}
              niche={data.niche}
              platform={data.platform}
              targetIncome={data.targetIncome}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
