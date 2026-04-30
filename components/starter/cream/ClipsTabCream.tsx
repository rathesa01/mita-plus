'use client'
// ── P-012-adapt · ClipsTabCream — Lovable design + legacy business logic ────
// Visual: MANAO_LOVABLE_CODE_P012.tsx (Lovable.dev, 2026-04-30)
// Logic:  components/starter/legacy/ContentExampleTab.tsx (P-010-fix1)

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Camera,
  Clapperboard,
  Clock,
  Film,
  Lightbulb,
  Loader2,
  PenLine,
  Play,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react'

// ---------- Types ----------
export interface ClipVideo {
  id: string
  title: string
  thumbnail?: string
  channelTitle: string
  url: string
}
export interface ClipScript {
  hook: string
  middle: string[]
  cta: string
  product_tip?: string
  best_time: string
  why?: string
}
export interface ClipsData {
  videos: ClipVideo[]
  script: ClipScript
  niche?: string
  platform?: string
  generated_at?: string
  cached?: boolean
}
// 2F: Cleaned props — loading/error/onRetry/onGenerate removed (now internal)
export interface ClipsTabCreamProps {
  userId?: string | null
  cachedData: ClipsData | null
  niche?: string
  hasChannel: boolean
  onConnectChannel?: () => void
  onRefresh?: () => Promise<void> | void
}

// ---------- Design tokens ----------
const CREAM  = '#FFFAF5'
const TEXT   = '#1D1D1F'
const MUTED  = '#6B6B6B'
const SUBTLE = '#8A8A8A'
const BODY   = '#4A4A4A'
const CORAL  = '#D85A30'
const PURPLE = '#7F77DD'
const cardShadow = '0 1px 3px rgba(0,0,0,0.04)'
const cardBorder = '1px solid rgba(0,0,0,0.06)'

// ---------- Helpers ----------
// 2A: isToday (port from legacy lines 11-17)
function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const offset = 7 * 60 * 60 * 1000
  const d = new Date(new Date(dateStr).getTime() + offset)
  const n = new Date(Date.now() + offset)
  return d.toISOString().slice(0, 10) === n.toISOString().slice(0, 10)
}

// ---------- Main component ----------
export default function ClipsTabCream({
  userId,
  cachedData,
  niche,
  hasChannel,
  onConnectChannel,
  onRefresh,
}: ClipsTabCreamProps) {
  // 2A: Internal state (port from legacy lines 39-43)
  const [data, setData]                       = useState<ClipsData | null>(cachedData)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed]     = useState<Date | null>(null)
  const [refreshedToday, setRefreshedToday]   = useState(() => isToday(cachedData?.generated_at))

  // 2D: timeAgo helper (port from legacy lines 45-50)
  function timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60)   return 'เมื่อสักครู่'
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  }

  // 2B: Full generate() logic (port from legacy lines 52-66)
  const generate = async (force = false) => {
    if (!userId) return
    if (force && refreshedToday && process.env.NODE_ENV !== 'development') return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/content/example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, force, dev: process.env.NODE_ENV === 'development' }),
      })
      const json = await res.json()
      if (json.rateLimited) { setRefreshedToday(true); setLoading(false); return }
      if (!res.ok) throw new Error(json.error ?? 'เกิดข้อผิดพลาด')
      setData(json)
      if (force) { setLastRefreshed(new Date()); setRefreshedToday(true) }
      onRefresh?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  // 2C: Load on first mount if no cache (port from legacy lines 69-72)
  useEffect(() => {
    if (!data && userId) generate(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // 2G: Refresh button handler — calls generate(true)
  const handleRefresh = () => { generate(true) }

  // 2E: Error hint text (special case for YOUTUBE_API_KEY)
  const errorHint = error?.includes('YOUTUBE_API_KEY')
    ? 'ต้องใส่ YOUTUBE_API_KEY ก่อนค่ะ'
    : null

  return (
    <div
      className='min-h-screen w-full'
      style={{
        background: CREAM,
        color: TEXT,
        fontFamily: 'Inter, "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        letterSpacing: '-0.01em',
      }}
    >
      <div className='mx-auto w-full max-w-[420px] px-4 py-5 space-y-4'>

        {/* SECTION 1 — Channel Hub */}
        {!hasChannel && <ChannelHub onConnect={onConnectChannel} />}

        {/* SECTION 2 — Header */}
        <Header
          refreshing={loading}
          locked={refreshedToday}
          lastRefreshed={lastRefreshed}
          timeAgo={timeAgo}
          onRefresh={handleRefresh}
        />

        {/* Content states */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} hint={errorHint} onRetry={() => generate(false)} />
        ) : !data ? (
          <EmptyState onGenerate={() => generate(false)} />
        ) : (
          <>
            {/* SECTION 3 — Videos */}
            <VideoList videos={data.videos} />
            {/* SECTION 4 — Script */}
            <ScriptCard script={data.script} />
            {/* SECTION 5 — Why it works */}
            {data.script.why && <WhyCard text={data.script.why} />}
          </>
        )}

        <div className='h-6' />
      </div>
    </div>
  )
}

/* ──────────────── Section 1: Channel Hub ──────────────── */
function ChannelHub({ onConnect }: { onConnect?: () => void }) {
  return (
    <div
      className='w-full'
      style={{
        background: '#FFFFFF',
        border: cardBorder,
        boxShadow: cardShadow,
        borderRadius: 20,
        padding: 20,
      }}
    >
      <div className='flex items-start gap-2'>
        <AlertCircle size={18} color={CORAL} className='mt-[2px]' />
        <div style={{ color: TEXT, fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>
          ช่อง MITA+ จะวิเคราะห์ได้แม่นขึ้น
        </div>
      </div>
      <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.55, marginTop: 8 }}>
        ตอนนี้ใช้ข้อมูลจาก Audit อย่างเดียว — เชื่อมช่อง/อัปโหลด insight แล้ว AI
        วิเคราะห์ได้แม่นขึ้นจาก 30% → 85%
      </p>
      <div className='grid grid-cols-2 gap-3 mt-3'>
        <div style={{ background: 'rgba(216,90,48,0.06)', borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>ตอนนี้</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CORAL, marginTop: 2 }}>30%</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>ข้อมูลจาก Audit</div>
        </div>
        <div style={{ background: 'rgba(127,119,221,0.06)', borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>หลังเชื่อม</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: PURPLE, marginTop: 2 }}>85%</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>ข้อมูลจริง + insight</div>
        </div>
      </div>
      <div className='flex flex-col gap-2 mt-4'>
        <button
          type='button'
          onClick={onConnect}
          className='flex w-full items-center justify-center gap-2 transition-opacity active:opacity-80'
          style={{
            background: CORAL, color: '#FFFFFF',
            fontSize: 14, fontWeight: 700, padding: '14px',
            borderRadius: 12, border: 'none',
          }}
        >
          <Zap size={16} />
          เชื่อม API (เร็วที่สุด)
        </button>
        <button
          type='button'
          onClick={onConnect}
          className='flex w-full items-center justify-center gap-2 transition-opacity active:opacity-80'
          style={{
            background: '#FFFFFF', color: TEXT,
            fontSize: 14, fontWeight: 600, padding: '14px',
            borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Camera size={16} />
          อัปโหลดรูป insight แทน
        </button>
      </div>
    </div>
  )
}

/* ──────────────── Section 2: Header ──────────────── */
function Header({
  refreshing,
  locked,
  lastRefreshed,
  timeAgo,
  onRefresh,
}: {
  refreshing: boolean
  locked: boolean
  lastRefreshed: Date | null
  timeAgo: (d: Date) => string
  onRefresh: () => void
}) {
  const label = locked
    ? 'อัปเดตแล้ววันนี้'
    : refreshing
    ? 'กำลังอัปเดต...'
    : 'อัปเดตคลิป'

  return (
    <div className='flex items-start justify-between' style={{ marginBottom: 14 }}>
      <div className='min-w-0'>
        <div className='flex items-center gap-1.5'>
          <Clapperboard size={16} color={CORAL} />
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
            คลิปตัวอย่างสัปดาห์นี้
          </span>
        </div>
        <div style={{ fontSize: 11, color: SUBTLE, marginTop: 2 }}>
          MITA+ คัด 10 คลิปสำหรับคุณโดยเฉพาะ
        </div>
        {/* 2D: lastRefreshed display */}
        {lastRefreshed && !locked && (
          <div style={{ fontSize: 9, color: SUBTLE, marginTop: 2 }}>
            ✨ อัปเดต {timeAgo(lastRefreshed)}
          </div>
        )}
      </div>
      <button
        type='button'
        onClick={onRefresh}
        disabled={refreshing || locked}
        className='flex items-center gap-1.5 transition-opacity active:opacity-80 disabled:opacity-60'
        style={{
          background: locked ? 'rgba(0,0,0,0.04)' : '#FFFFFF',
          color: locked ? SUBTLE : TEXT,
          fontSize: 11, fontWeight: 600,
          padding: '7px 10px', borderRadius: 10,
          border: cardBorder, boxShadow: cardShadow,
          whiteSpace: 'nowrap',
        }}
      >
        <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} color={locked ? SUBTLE : CORAL} />
        {label}
      </button>
    </div>
  )
}

/* ──────────────── Section 3: Video List ──────────────── */
function VideoList({ videos }: { videos: ClipVideo[] }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: SUBTLE, fontWeight: 600, marginBottom: 8 }}>
        ตัวอย่างคลิปดังในแนวช่องนี้
      </div>
      <div className='flex flex-col gap-2'>
        {videos.map((v, i) => (
          <motion.a
            key={v.id}
            href={v.url}
            target='_blank'
            rel='noreferrer noopener'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: 'easeOut' }}
            className='flex items-center gap-2.5'
            style={{
              background: '#FFFFFF', border: cardBorder, boxShadow: cardShadow,
              borderRadius: 14, padding: 10, textDecoration: 'none', color: 'inherit',
            }}
          >
            <div
              className='relative shrink-0 overflow-hidden'
              style={{ width: 80, height: 52, borderRadius: 8, background: 'rgba(0,0,0,0.05)' }}
            >
              {v.thumbnail ? (
                <img
                  src={v.thumbnail}
                  alt=''
                  className='h-full w-full object-cover'
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <Film size={18} color={SUBTLE} />
                </div>
              )}
              {/* YT badge */}
              <div
                className='absolute left-1 top-1'
                style={{
                  background: '#FF0000', color: '#FFFFFF',
                  fontSize: 8, fontWeight: 700, padding: '1px 4px',
                  borderRadius: 3, lineHeight: 1.2,
                }}
              >
                YT
              </div>
              {/* Play overlay */}
              <div
                className='absolute left-1/2 top-1/2 flex items-center justify-center'
                style={{
                  width: 22, height: 22, borderRadius: 999,
                  background: 'rgba(0,0,0,0.55)',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Play size={10} color='#FFFFFF' fill='#FFFFFF' />
              </div>
            </div>
            <div className='min-w-0 flex-1'>
              <div
                style={{
                  fontSize: 12, fontWeight: 700, color: TEXT, lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {i + 1}. {v.title}
              </div>
              <div style={{ fontSize: 10, color: SUBTLE, marginTop: 3 }}>{v.channelTitle}</div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  )
}

/* ──────────────── Section 4: Script Card ──────────────── */
function ScriptCard({ script }: { script: ClipScript }) {
  return (
    <div
      style={{
        background: 'rgba(127,119,221,0.05)',
        border: '1px solid rgba(127,119,221,0.18)',
        borderRadius: 18, padding: 18,
      }}
    >
      <div className='flex items-center gap-1.5'>
        <PenLine size={14} color={PURPLE} />
        <span style={{ color: PURPLE, fontSize: 13, fontWeight: 700 }}>Script คลิปของคุณ</span>
        <span style={{ color: SUBTLE, fontSize: 11 }}>(ปรับจากตัวอย่างด้านบน)</span>
      </div>

      {/* Hook */}
      <div className='mt-4'>
        <TinyLabel color={CORAL}>Hook (3 วินาทีแรก)</TinyLabel>
        <p style={{ fontStyle: 'italic', fontSize: 14, color: TEXT, lineHeight: 1.6, marginTop: 6 }}>
          &ldquo;{script.hook}&rdquo;
        </p>
      </div>

      {/* Middle */}
      <div className='mt-4'>
        <TinyLabel color={PURPLE}>เนื้อหากลาง</TinyLabel>
        <ol className='flex flex-col gap-2 mt-2 list-none p-0'>
          {script.middle.map((item, i) => (
            <li key={i} className='flex items-start gap-2'>
              <span
                className='flex shrink-0 items-center justify-center'
                style={{
                  width: 18, height: 18, borderRadius: 999,
                  background: 'rgba(127,119,221,0.15)',
                  color: PURPLE, fontSize: 10, fontWeight: 700, marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 12, color: BODY, lineHeight: 1.5 }}>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className='mt-4'>
        <TinyLabel color={CORAL}>CTA ท้ายคลิป</TinyLabel>
        <p style={{ fontSize: 13, color: CORAL, lineHeight: 1.6, marginTop: 6 }}>
          {script.cta}
        </p>
      </div>

      {/* Product tip (conditional) */}
      {script.product_tip && (
        <div className='mt-4'>
          <TinyLabel color={CORAL}>สินค้าที่โปรโมตในคลิป</TinyLabel>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 6 }}>
            {script.product_tip}
          </p>
        </div>
      )}

      {/* Best time chip */}
      <div className='mt-4'>
        <span
          className='inline-flex items-center gap-1.5'
          style={{ background: 'rgba(0,0,0,0.04)', padding: '8px 12px', borderRadius: 10 }}
        >
          <Clock size={14} color={CORAL} />
          <span style={{ color: TEXT, fontWeight: 700, fontSize: 12 }}>โพสต์:</span>
          <span style={{ color: MUTED, fontSize: 12 }}>{script.best_time}</span>
        </span>
      </div>
    </div>
  )
}

function TinyLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: 0 }}>{children}</div>
  )
}

/* ──────────────── Section 5: Why Card ──────────────── */
function WhyCard({ text }: { text: string }) {
  return (
    <div
      style={{
        background: 'rgba(127,119,221,0.04)',
        border: '1px solid rgba(127,119,221,0.15)',
        borderRadius: 14, padding: '12px 14px',
      }}
    >
      <div className='flex items-center gap-1.5'>
        <Lightbulb size={14} color={PURPLE} />
        <span style={{ color: PURPLE, fontWeight: 700, fontSize: 12 }}>ทำไม script นี้ถึง work</span>
      </div>
      <p style={{ fontSize: 12, color: BODY, lineHeight: 1.6, marginTop: 6 }}>{text}</p>
    </div>
  )
}

/* ──────────────── Empty / Loading / Error ──────────────── */
function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  const bullets: { icon: React.ReactNode; text: string }[] = [
    { icon: <Search size={14} color={CORAL} />,    text: 'ค้นหาคลิปดังในแนวช่องของคุณ' },
    { icon: <PenLine size={14} color={PURPLE} />,  text: 'MITA+ เขียน Hook + Script + CTA' },
    { icon: <Clock size={14} color={CORAL} />,     text: 'บอกเวลาที่ควรโพสต์' },
    { icon: <ShoppingBag size={14} color={CORAL} />, text: 'แนะนำสินค้าที่โปรโมตในคลิป' },
  ]
  return (
    <div
      className='flex flex-col items-center text-center'
      style={{
        background: '#FFFFFF',
        border: '1px dashed rgba(127,119,221,0.3)',
        borderRadius: 18, padding: '32px 24px',
      }}
    >
      <Clapperboard size={32} color={CORAL} />
      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginTop: 10 }}>
        คลิปตัวอย่างสัปดาห์นี้
      </div>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.65, marginTop: 6, maxWidth: 280 }}>
        MITA+ จะหาคลิป viral ในแนวช่องของคุณ แล้วเขียน script พร้อมถ่ายให้เลยค่ะ
      </p>
      <div className='flex w-full flex-col gap-2 mt-4'>
        {bullets.map((b, i) => (
          <div
            key={i}
            className='flex items-center gap-2'
            style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 14px', borderRadius: 10 }}
          >
            {b.icon}
            <span style={{ fontSize: 12, color: BODY, textAlign: 'left' }}>{b.text}</span>
          </div>
        ))}
      </div>
      <button
        type='button'
        onClick={onGenerate}
        className='flex items-center justify-center gap-2 active:opacity-80 transition-opacity mt-5'
        style={{
          background: 'linear-gradient(135deg, #7F77DD, #D85A30)',
          color: '#FFFFFF', fontSize: 14, fontWeight: 700,
          padding: '14px 28px', borderRadius: 12, border: 'none',
        }}
      >
        <Sparkles size={16} />
        สร้างคลิปตัวอย่างของฉัน
      </button>
      <div style={{ fontSize: 11, color: SUBTLE, marginTop: 10 }}>
        อัพเดตอัตโนมัติทุก 7 วัน · ฟรีสำหรับ Starter
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className='flex flex-col items-center justify-center py-12 gap-3'>
      <Loader2 size={28} color={PURPLE} className='animate-spin' />
      <div style={{ fontSize: 13, color: MUTED, textAlign: 'center' }}>
        MITA+ กำลังหาคลิปตัวอย่างและเขียน script...
      </div>
    </div>
  )
}

// 2E: ErrorState with YOUTUBE_API_KEY special hint
function ErrorState({
  message,
  hint,
  onRetry,
}: {
  message: string
  hint: string | null
  onRetry: () => void
}) {
  return (
    <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
      <div style={{ fontSize: 13, color: CORAL }}>{message}</div>
      {hint && (
        <div style={{ fontSize: 11, color: MUTED }}>{hint}</div>
      )}
      <button
        type='button'
        onClick={onRetry}
        style={{
          background: '#FFFFFF', color: TEXT,
          fontSize: 13, fontWeight: 600, padding: '10px 18px',
          borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        ลองใหม่
      </button>
    </div>
  )
}
