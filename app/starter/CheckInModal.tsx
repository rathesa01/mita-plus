'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Sparkles, ChevronRight, RotateCcw, Clock, TrendingUp, Video } from 'lucide-react'
import { COLORS, RADIUS } from '@/lib/tokens'

// ── Types ──────────────────────────────────────────────
type Mood = 'great' | 'ok' | 'hard'

interface AffiliateProduct {
  id: string
  name: string
  price: number
  commission_rate: number
  commission_thb: number
  merchant_name: string
  product_url: string
  why_fits?: string
}

interface CheckinResult {
  message: string
  script: string
  peakHours: number[]
  peakDays: string[]
  affiliateProducts: AffiliateProduct[]
  channelSummary?: { followers: number; views28d: number | null; bestFormat: string | null } | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onComplete: (msg: string) => void
  weekNo: number
  creatorName: string
  niche: string
  platform: string
  targetIncome: number
  userId?: string | null   // ← NEW: ใช้โหลด real channel data
}

// ── Constants ──────────────────────────────────────────
const MOODS = [
  { key: 'great' as Mood, emoji: '🔥', label: 'ดีมาก',    sub: 'ทำได้เกินเป้า', color: '#22C55E' },
  { key: 'ok'    as Mood, emoji: '😊', label: 'พอใช้',    sub: 'ทำได้ตามแผน',  color: '#7B61FF' },
  { key: 'hard'  as Mood, emoji: '😅', label: 'ยากหน่อย', sub: 'มีอุปสรรค',    color: '#FF9F1C' },
]
const CLIP_OPTIONS = [0, 1, 2, 3, 4, 5]

// ── Static timing fallback ─────────────────────────────
const STATIC_TIMING: Record<string, { hours: string; days: string[] }> = {
  tiktok:    { hours: '19:00–22:00', days: ['อังคาร', 'พฤหัส', 'ศุกร์', 'เสาร์'] },
  youtube:   { hours: '15:00–20:00', days: ['เสาร์', 'อาทิตย์', 'พุธ'] },
  instagram: { hours: '11:00–13:00 และ 20:00–22:00', days: ['อังคาร', 'พุธ', 'ศุกร์'] },
  facebook:  { hours: '13:00–16:00 และ 20:00–22:00', days: ['พุธ', 'พฤหัส', 'ศุกร์'] },
}

// ── Shared UI ──────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === step ? '20px' : '6px', opacity: i <= step ? 1 : 0.25 }}
          transition={{ duration: 0.3 }}
          style={{ height: '6px', borderRadius: '99px', background: '#7B61FF' }}
        />
      ))}
    </div>
  )
}

function NextBtn({ onClick, disabled, label = 'ถัดไป →' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '14px',
        background: disabled ? 'rgba(255,255,255,0.06)' : '#7B61FF',
        color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
        border: 'none', borderRadius: '14px',
        fontSize: '15px', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', marginTop: '20px',
      }}
    >
      {label}
    </motion.button>
  )
}

// ── Steps ──────────────────────────────────────────────
function Step1Mood({ onSelect }: { onSelect: (m: Mood) => void }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>สัปดาห์นี้เป็นยังไงบ้าง?</p>
      <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>บอกตรงๆ ได้เลยนะคะ โค้ชรับฟังทุกอย่างค่ะ</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MOODS.map(m => (
          <motion.button
            key={m.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(m.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px', background: `${m.color}10`,
              border: `1.5px solid ${m.color}30`,
              borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{m.emoji}</span>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>{m.label}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{m.sub}</p>
            </div>
            <ChevronRight size={16} style={{ color: m.color, marginLeft: 'auto', flexShrink: 0 }} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function Step2Clips({ value, onChange, onNext }: { value: number | null; onChange: (n: number) => void; onNext: () => void }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>ทำคลิปไปกี่คลิป?</p>
      <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>นับเฉพาะคลิปที่โพสต์จริงแล้วนะคะ</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {CLIP_OPTIONS.map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(n)}
            style={{
              padding: '20px 0',
              background: value === n ? '#7B61FF' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${value === n ? '#7B61FF' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '16px', cursor: 'pointer',
              fontSize: '22px', fontWeight: 900,
              color: value === n ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
          >
            {n === 5 ? '5+' : n}
          </motion.button>
        ))}
      </div>
      <NextBtn onClick={onNext} disabled={value === null} />
    </div>
  )
}

function Step3Income({ value, onChange, onNext }: { value: string; onChange: (s: string) => void; onNext: () => void }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>ได้รายได้ affiliate เท่าไหร่?</p>
      <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>ดูจาก Shopee/Lazada dashboard ค่ะ ถ้ายังไม่มีใส่ 0 ได้เลย</p>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: 900, color: '#7B61FF' }}>฿</span>
        <input
          type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder="0" min="0" inputMode="numeric"
          style={{
            width: '100%', padding: '18px 16px 18px 36px',
            background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(123,97,255,0.4)',
            borderRadius: '16px', fontSize: '24px', fontWeight: 900,
            color: '#fff', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
      {Number(value) > 0 && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '10px 0 0', fontSize: '13px', color: '#22C55E', fontWeight: 700 }}>
          🎉 เยี่ยมมาก! มีรายได้เข้ามาแล้วค่ะ
        </motion.p>
      )}
      <NextBtn onClick={onNext} />
    </div>
  )
}

function Step4Obstacle({ value, onChange, onSubmit, loading }: { value: string; onChange: (s: string) => void; onSubmit: () => void; loading: boolean }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>มีอะไรติดขัดไหม?</p>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>ไม่ต้องมีก็ได้ — ข้ามได้เลยค่ะ</p>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder="เช่น ไม่รู้จะทำคลิปเรื่องอะไร, ยอดวิวต่ำ, ไม่มีเวลา..."
        rows={4}
        style={{
          width: '100%', padding: '14px 16px',
          background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', fontSize: '14px', color: '#fff',
          outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6,
        }}
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={loading}
        style={{
          width: '100%', padding: '15px', marginTop: '16px',
          background: loading ? 'rgba(123,97,255,0.4)' : 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
          color: '#fff', border: 'none', borderRadius: '14px',
          fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> โค้ชกำลังวิเคราะห์...</>
          : <><Sparkles size={16} /> รับ feedback + แผนสัปดาห์หน้า</>
        }
      </motion.button>
    </div>
  )
}

// ── Result Screen ──────────────────────────────────────
function ResultScreen({ result, platform, niche, onClose }: {
  result: CheckinResult; platform: string; niche: string; onClose: () => void
}) {
  const [tab, setTab] = useState<'coach' | 'script' | 'timing' | 'products'>('coach')

  // Real timing from channel_data — fallback to static
  const hasRealHours = result.peakHours.length > 0
  const staticTiming = STATIC_TIMING[platform] ?? STATIC_TIMING.tiktok
  const displayHours = hasRealHours
    ? result.peakHours.slice(0, 2).map(h => `${h}:00`).join('–') + ' น.'
    : staticTiming.hours
  const displayDays = result.peakDays.length > 0 ? result.peakDays : staticTiming.days

  // Real affiliate products from DB
  const products = result.affiliateProducts ?? []

  const tabs = [
    { key: 'coach'    as const, label: '💬 โค้ช',  color: '#7B61FF' },
    { key: 'script'   as const, label: '🎬 คลิป',  color: '#3ECFFF' },
    { key: 'timing'   as const, label: '⏰ เวลา',  color: '#22C55E' },
    { key: 'products' as const, label: '🛍 สินค้า', color: '#FF9F1C' },
  ]

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ fontSize: '40px', lineHeight: 1, marginBottom: '8px' }}
        >
          ✅
        </motion.div>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff' }}>โค้ชวิเคราะห์เสร็จแล้ว!</p>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          {result.channelSummary ? `ใช้ข้อมูลช่องจริง · ${(result.channelSummary.followers / 1000).toFixed(1)}K followers` : '4 อย่างที่ช่วยให้รายได้เพิ่มขึ้นค่ะ'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '8px 2px', border: 'none', borderRadius: '9px', cursor: 'pointer',
              fontWeight: 700, fontSize: '10px', whiteSpace: 'nowrap',
              background: tab === t.key ? t.color : 'transparent',
              color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── 1. Coach feedback ── */}
        {tab === 'coach' && (
          <motion.div key="coach" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)', borderRadius: '16px', marginBottom: '10px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#7B61FF' }}>💬 โค้ช MITA+ พูดว่า</p>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {result.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 2. Script idea ── */}
        {tab === 'script' && (
          <motion.div key="script" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(62,207,255,0.06)', border: '1px solid rgba(62,207,255,0.2)', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Video size={14} style={{ color: '#3ECFFF' }} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#3ECFFF' }}>ไอเดียคลิปถัดไปจาก MITA+</p>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {result.script}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 3. Timing ── real data หรือ static fallback ── */}
        {tab === 'timing' && (
          <motion.div key="timing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: '#22C55E' }} />
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#22C55E' }}>เวลาที่ดีที่สุดสำหรับคุณ</p>
                </div>
                {hasRealHours && (
                  <span style={{ fontSize: '9px', color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '2px 7px', borderRadius: '99px', fontWeight: 700 }}>
                    ● ข้อมูลจริงจากช่อง
                  </span>
                )}
              </div>

              {/* Time slot */}
              <div style={{ padding: '14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', textAlign: 'center', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>ช่วงเวลาโพสต์</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#22C55E' }}>{displayHours}</p>
              </div>

              {/* Days */}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>วันที่แนะนำ</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {displayDays.slice(0, 4).map(d => (
                    <span key={d} style={{ fontSize: '12px', fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '5px 12px', borderRadius: '99px' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Channel summary if available */}
              {result.channelSummary?.bestFormat && (
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Format ที่ดีที่สุดในช่องของคุณ</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff' }}>🏆 {result.channelSummary.bestFormat}</p>
                </div>
              )}

              {!hasRealHours && (
                <p style={{ margin: '10px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                  * ข้อมูลทั่วไป — เชื่อมช่องเพื่อดูเวลาที่แม่นยำกว่านี้ค่ะ
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── 4. Products ── real affiliate data ── */}
        {tab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <TrendingUp size={14} style={{ color: '#FF9F1C' }} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#FF9F1C' }}>
                  สินค้าที่ MITA+ แนะนำสำหรับช่องคุณ
                </p>
              </div>

              {products.length > 0 ? products.map((p, i) => (
                <motion.div
                  key={p.id ?? i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', marginBottom: '8px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>{p.name}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                      {p.merchant_name} · ฿{p.price?.toLocaleString('th-TH')}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#22C55E', fontWeight: 700 }}>
                      ฿{p.commission_thb}/ชิ้น ({p.commission_rate}%)
                    </p>
                  </div>
                  {p.product_url && (
                    <button
                      onClick={() => window.open(p.product_url, '_blank', 'noopener,noreferrer')}
                      style={{
                        padding: '8px 12px', background: 'rgba(255,159,28,0.12)',
                        border: '1px solid rgba(255,159,28,0.3)', borderRadius: '10px',
                        fontSize: '11px', fontWeight: 700, color: '#FF9F1C', cursor: 'pointer', flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ดูสินค้า →
                    </button>
                  )}
                </motion.div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                    ยังไม่มีสินค้าแนะนำค่ะ
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                    ไปที่ tab 🛍 สินค้า แล้วกด "ให้ MITA+ เลือกสินค้าให้" ก่อนนะคะ
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        style={{
          width: '100%', padding: '14px', marginTop: '4px',
          background: '#7B61FF', color: '#fff',
          border: 'none', borderRadius: '14px',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        กลับไปทำต่อ 💪
      </motion.button>
    </motion.div>
  )
}

// ── Main Modal ─────────────────────────────────────────
export default function CheckInModal({
  isOpen, onClose, onComplete,
  weekNo, creatorName, niche, platform, targetIncome,
  userId,
}: Props) {
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState<Mood | null>(null)
  const [clips, setClips] = useState<number | null>(null)
  const [income, setIncome] = useState('')
  const [obstacle, setObstacle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckinResult | null>(null)

  const reset = () => {
    setStep(0); setMood(null); setClips(null)
    setIncome(''); setObstacle(''); setLoading(false); setResult(null)
  }

  const handleClose = () => { reset(); onClose() }
  const handleMood  = (m: Mood) => { setMood(m); setStep(1) }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mood, clips: clips ?? 0,
          income: Number(income) || 0,
          obstacle, weekNo, creatorName, niche, platform, targetIncome,
        }),
      })
      const json = await res.json()
      const checkinResult: CheckinResult = {
        message: json.message ?? '',
        script: json.script ?? '',
        peakHours: json.peakHours ?? [],
        peakDays: json.peakDays ?? [],
        affiliateProducts: json.affiliateProducts ?? [],
        channelSummary: json.channelSummary ?? null,
      }
      setResult(checkinResult)
      onComplete(json.message)
      setStep(4)
    } catch {
      setResult({ message: 'ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪', script: '', peakHours: [], peakDays: [], affiliateProducts: [] })
      onComplete('ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪')
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      />
      <motion.div
        key="sheet"
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
          background: '#13111A', borderRadius: '28px 28px 0 0',
          padding: '24px 20px 44px',
          maxWidth: '480px', margin: '0 auto',
          maxHeight: '92vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />

        {/* Header */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>📋 เช็คอินสัปดาห์ที่ {weekNo}</p>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {step < 4 && <StepDots step={step} total={4} />}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step1Mood onSelect={handleMood} /></motion.div>}
          {step === 1 && <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step2Clips value={clips} onChange={setClips} onNext={() => setStep(2)} /></motion.div>}
          {step === 2 && <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step3Income value={income} onChange={setIncome} onNext={() => setStep(3)} /></motion.div>}
          {step === 3 && <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step4Obstacle value={obstacle} onChange={setObstacle} onSubmit={handleSubmit} loading={loading} /></motion.div>}
          {step === 4 && result && (
            <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ResultScreen result={result} platform={platform} niche={niche} onClose={handleClose} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && step < 4 && !loading && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.25)', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '4px',
              margin: '12px auto 0', padding: '8px',
            }}
          >
            <RotateCcw size={11} /> ย้อนกลับ
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
