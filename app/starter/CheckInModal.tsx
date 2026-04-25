'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Sparkles, ChevronRight, RotateCcw, Clock, TrendingUp, Video, AlertTriangle } from 'lucide-react'

// ── Types ──────────────────────────────────────────────
type Mood = 'great' | 'ok' | 'hard'
type IncomeRange = 'zero' | 'low' | 'mid' | 'high'

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
  weeklyPlan: string | null
  script: string | null
  diagnosis: string | null
  peakHours: number[]
  peakDays: string[]
  affiliateProducts: AffiliateProduct[]
  channelSummary?: { followers: number; views28d: number | null; bestFormat: string | null } | null
  incomeRange: IncomeRange
  allCheckins: Array<{ week_no: number; income_range: string; income_approx: number; clips: number; date: string }>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onComplete: (msg: string, result?: CheckinResult) => void
  weekNo: number
  creatorName: string
  niche: string
  platform: string
  targetIncome: number
  userId?: string | null
  isFirstCheckin?: boolean  // ← show honest data framing
}

// ── Constants ──────────────────────────────────────────
const MOODS = [
  { key: 'great' as Mood, emoji: '🔥', label: 'ดีมาก',    sub: 'ทำได้เกินเป้า', color: '#22C55E' },
  { key: 'ok'    as Mood, emoji: '😊', label: 'พอใช้',    sub: 'ทำได้ตามแผน',  color: '#7B61FF' },
  { key: 'hard'  as Mood, emoji: '😅', label: 'ยากหน่อย', sub: 'มีอุปสรรค',    color: '#FF9F1C' },
]
const CLIP_OPTIONS = [0, 1, 2, 3, 4, 5]

const INCOME_RANGES: { key: IncomeRange; label: string; sub: string; color: string }[] = [
  { key: 'zero', label: '฿0',        sub: 'ยังไม่มีรายได้เลย',  color: '#FF6B6B' },
  { key: 'low',  label: '฿1 – 500',  sub: 'เริ่มมีรายได้บ้างแล้ว', color: '#FF9F1C' },
  { key: 'mid',  label: '฿500 – 2K', sub: 'เห็นผลชัดขึ้นเรื่อยๆ', color: '#7B61FF' },
  { key: 'high', label: '฿2,000+',   sub: 'รายได้ดีมากค่ะ!',   color: '#22C55E' },
]

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

// ── Step 0: Honest data intro (first check-in only) ────
function StepIntro({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌟</div>
        <p style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
          เงินอยู่ในอากาศ
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          คุณต้องการเพียงแค่รู้ว่า<br />
          <strong style={{ color: '#7B61FF' }}>ขั้นตอนไหนที่ยังขาดอยู่</strong>
        </p>
      </div>
      <div style={{
        padding: '16px', borderRadius: '16px',
        background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)',
        marginBottom: '20px',
      }}>
        <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#7B61FF' }}>
          💡 เช็คอินนี้ทำเพื่อคุณค่ะ
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75 }}>
          MITA+ ใช้ข้อมูลที่คุณกรอก เพื่อสร้างแผนรายได้ที่แม่นยำขึ้นเรื่อยๆ
          ทุกสัปดาห์ — <strong style={{ color: '#fff' }}>กรอกตามความจริงเพื่อตัวคุณเองนะคะ</strong>
          ไม่มีถูกหรือผิด มีแค่ข้อมูลที่ช่วยให้แผนดีขึ้นค่ะ
        </p>
      </div>
      <NextBtn onClick={onNext} label='เริ่มเช็คอิน →' />
    </div>
  )
}

// ── Step 1: Mood ───────────────────────────────────────
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

// ── Step 2: Clips ──────────────────────────────────────
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

// ── Step 3: Income Range ───────────────────────────────
function Step3Income({ value, onChange, onNext }: {
  value: IncomeRange | null; onChange: (r: IncomeRange) => void; onNext: () => void
}) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>รายได้ affiliate สัปดาห์นี้</p>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        ดูจาก Shopee / Lazada / Involve Asia dashboard ค่ะ
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {INCOME_RANGES.map(r => (
          <motion.button
            key={r.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(r.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 18px',
              background: value === r.key ? `${r.color}15` : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${value === r.key ? r.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: value === r.key ? r.color : 'rgba(255,255,255,0.2)',
              flexShrink: 0, transition: 'all 0.2s',
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: value === r.key ? r.color : '#fff' }}>
                {r.label}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{r.sub}</p>
            </div>
            {value === r.key && <ChevronRight size={16} style={{ color: r.color, flexShrink: 0 }} />}
          </motion.button>
        ))}
      </div>
      {value === 'high' && (
        <motion.p
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          style={{ margin: '12px 0 0', fontSize: '13px', color: '#22C55E', fontWeight: 700, textAlign: 'center' }}
        >
          🎉 ยอดเยี่ยมมากค่ะ! MITA+ จะวางแผนให้ scale ต่อไปค่ะ
        </motion.p>
      )}
      <NextBtn onClick={onNext} disabled={value === null} />
    </div>
  )
}

// ── Step 4: Obstacle ───────────────────────────────────
function Step4Obstacle({ value, onChange, onSubmit, loading }: {
  value: string; onChange: (s: string) => void; onSubmit: () => void; loading: boolean
}) {
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
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> โค้ชกำลังสร้างแผนรายได้...</>
          : <><Sparkles size={16} /> รับแผนรายได้สัปดาห์หน้า</>
        }
      </motion.button>
    </div>
  )
}

// ── Loading Screen with brand message ─────────────────
function LoadingScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '48px', marginBottom: '20px' }}
      >
        💰
      </motion.div>
      <p style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
        เงินอยู่ในอากาศ
      </p>
      <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
        MITA+ กำลังวิเคราะห์ข้อมูลของคุณ<br />
        และสร้างแผนรายได้สำหรับสัปดาห์หน้าค่ะ...
      </p>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7B61FF' }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Result Screen ──────────────────────────────────────
function ResultScreen({ result, platform, niche, onClose }: {
  result: CheckinResult; platform: string; niche: string; onClose: () => void
}) {
  // Default to 'plan' tab if weeklyPlan exists, else 'coach'
  const defaultTab = result.weeklyPlan ? 'plan' : 'coach'
  const [tab, setTab] = useState<'plan' | 'coach' | 'script' | 'timing' | 'products' | 'diagnosis'>(
    result.diagnosis ? 'diagnosis' : defaultTab
  )

  const hasRealHours = result.peakHours.length > 0
  const staticTiming = STATIC_TIMING[platform] ?? STATIC_TIMING.tiktok
  const displayHours = hasRealHours
    ? result.peakHours.slice(0, 2).map(h => `${h}:00`).join('–') + ' น.'
    : staticTiming.hours
  const displayDays = result.peakDays.length > 0 ? result.peakDays : staticTiming.days
  const products = result.affiliateProducts ?? []

  const tabs = [
    result.diagnosis && { key: 'diagnosis' as const, label: '🚨 วินิจฉัย', color: '#FF6B6B' },
    result.weeklyPlan && { key: 'plan'      as const, label: '📅 แผนรายได้', color: '#22C55E' },
    { key: 'coach'    as const, label: '💬 โค้ช',    color: '#7B61FF' },
    { key: 'script'   as const, label: '🎬 คลิป',    color: '#3ECFFF' },
    { key: 'timing'   as const, label: '⏰ เวลา',    color: '#FF9F1C' },
    { key: 'products' as const, label: '🛍 สินค้า',  color: '#FF9F1C' },
  ].filter(Boolean) as Array<{ key: typeof tab; label: string; color: string }>

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ fontSize: '36px', lineHeight: 1, marginBottom: '8px' }}
        >
          {result.diagnosis ? '🔍' : '✅'}
        </motion.div>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff' }}>
          {result.diagnosis ? 'โค้ชวิเคราะห์เชิงลึกแล้วค่ะ' : 'โค้ชวิเคราะห์เสร็จแล้ว!'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          {result.channelSummary
            ? `ใช้ข้อมูลช่องจริง · ${(result.channelSummary.followers / 1000).toFixed(1)}K followers`
            : result.weeklyPlan ? 'แผนรายได้ถูก generate ให้คุณแล้วค่ะ' : '4 อย่างที่ช่วยให้รายได้เพิ่มขึ้นค่ะ'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: '0 0 auto', padding: '8px 10px', border: 'none', borderRadius: '9px', cursor: 'pointer',
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

        {/* ── Diagnosis (Week 3 zero income) ── */}
        {tab === 'diagnosis' && result.diagnosis && (
          <motion.div key="diagnosis" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertTriangle size={14} style={{ color: '#FF6B6B' }} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#FF6B6B' }}>🔍 วินิจฉัยรายได้ — สัปดาห์ที่ 3</p>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {result.diagnosis}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Weekly Income Plan ── */}
        {tab === 'plan' && result.weeklyPlan && (
          <motion.div key="plan" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <TrendingUp size={14} style={{ color: '#22C55E' }} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#22C55E' }}>แผนรายได้สัปดาห์หน้า — สร้างเฉพาะสำหรับคุณค่ะ</p>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                {result.weeklyPlan}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Coach feedback ── */}
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

        {/* ── Script idea ── */}
        {tab === 'script' && (
          <motion.div key="script" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(62,207,255,0.06)', border: '1px solid rgba(62,207,255,0.2)', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Video size={14} style={{ color: '#3ECFFF' }} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#3ECFFF' }}>ไอเดียคลิปถัดไปจาก MITA+</p>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {result.script ?? 'กำลังโหลดค่ะ...'}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Timing ── */}
        {tab === 'timing' && (
          <motion.div key="timing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '16px', background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.2)', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: '#FF9F1C' }} />
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#FF9F1C' }}>เวลาที่ดีที่สุดสำหรับคุณ</p>
                </div>
                {hasRealHours && (
                  <span style={{ fontSize: '9px', color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '2px 7px', borderRadius: '99px', fontWeight: 700 }}>
                    ● ข้อมูลจริงจากช่อง
                  </span>
                )}
              </div>
              <div style={{ padding: '14px', background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.15)', borderRadius: '12px', textAlign: 'center', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>ช่วงเวลาโพสต์</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#FF9F1C' }}>{displayHours}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>วันที่แนะนำ</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {displayDays.slice(0, 4).map(d => (
                    <span key={d} style={{ fontSize: '12px', fontWeight: 700, color: '#FF9F1C', background: 'rgba(255,159,28,0.1)', padding: '5px 12px', borderRadius: '99px' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
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

        {/* ── Products ── */}
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
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
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
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>ยังไม่มีสินค้าแนะนำค่ะ</p>
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
  userId, isFirstCheckin = false,
}: Props) {
  // step: -1 = intro (first time only), 0=mood, 1=clips, 2=income, 3=obstacle, 4=loading, 5=result
  const startStep = isFirstCheckin ? -1 : 0
  const [step, setStep]                   = useState(startStep)
  const [mood, setMood]                   = useState<Mood | null>(null)
  const [clips, setClips]                 = useState<number | null>(null)
  const [incomeRange, setIncomeRange]     = useState<IncomeRange | null>(null)
  const [obstacle, setObstacle]           = useState('')
  const [result, setResult]               = useState<CheckinResult | null>(null)

  const reset = () => {
    setStep(startStep); setMood(null); setClips(null)
    setIncomeRange(null); setObstacle(''); setResult(null)
  }

  const handleClose = () => { reset(); onClose() }
  const handleMood  = (m: Mood) => { setMood(m); setStep(1) }

  const totalSteps = 4  // mood, clips, income, obstacle (not counting intro)
  const displayStep = Math.max(0, step)  // for dot display

  const handleSubmit = async () => {
    setStep(4)  // show loading screen
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mood, clips: clips ?? 0,
          incomeRange: incomeRange ?? 'zero',
          income: 0,  // legacy
          obstacle, weekNo, creatorName, niche, platform, targetIncome,
        }),
      })
      const json = await res.json()
      const checkinResult: CheckinResult = {
        message: json.message ?? '',
        weeklyPlan: json.weeklyPlan ?? null,
        script: json.script ?? '',
        diagnosis: json.diagnosis ?? null,
        peakHours: json.peakHours ?? [],
        peakDays: json.peakDays ?? [],
        affiliateProducts: json.affiliateProducts ?? [],
        channelSummary: json.channelSummary ?? null,
        incomeRange: json.incomeRange ?? incomeRange ?? 'zero',
        allCheckins: json.allCheckins ?? [],
      }
      setResult(checkinResult)
      onComplete(json.message, checkinResult)
      setStep(5)
    } catch {
      const fallback: CheckinResult = {
        message: 'ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪',
        weeklyPlan: null, script: '', diagnosis: null,
        peakHours: [], peakDays: [], affiliateProducts: [],
        incomeRange: incomeRange ?? 'zero', allCheckins: [],
      }
      setResult(fallback)
      onComplete('ขอบคุณที่อัพเดทนะคะ! ทำต่อไปได้เลยค่ะ 💪', fallback)
      setStep(5)
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

        {/* Header — hide during loading & result */}
        {step >= 0 && step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#7B61FF' }}>📋 เช็คอินสัปดาห์ที่ {weekNo}</p>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Close button during result */}
        {step === 5 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Step dots — show only during active steps */}
        {step >= 0 && step < 4 && <StepDots step={displayStep} total={totalSteps} />}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepIntro onNext={() => setStep(0)} />
            </motion.div>
          )}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Step1Mood onSelect={handleMood} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Step2Clips value={clips} onChange={setClips} onNext={() => setStep(2)} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Step3Income value={incomeRange} onChange={setIncomeRange} onNext={() => setStep(3)} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Step4Obstacle value={obstacle} onChange={setObstacle} onSubmit={handleSubmit} loading={false} />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LoadingScreen />
            </motion.div>
          )}
          {step === 5 && result && (
            <motion.div key="s5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ResultScreen result={result} platform={platform} niche={niche} onClose={handleClose} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && step < 4 && (
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

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </AnimatePresence>
  )
}
