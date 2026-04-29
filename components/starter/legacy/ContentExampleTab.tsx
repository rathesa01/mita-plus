'use client'
// ── P-010-fix1 · ContentExampleTab (legacy port) ──────────────────────────────
// Ported from app/starter/page.legacy.tsx lines 1317–1573
// Exports: ContentExampleTab (default), ContentExampleData interface

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { RADIUS } from '@/lib/tokens'

function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const offset = 7 * 60 * 60 * 1000
  const d = new Date(new Date(dateStr).getTime() + offset)
  const n = new Date(Date.now() + offset)
  return d.toISOString().slice(0, 10) === n.toISOString().slice(0, 10)
}

// ── ContentExampleData ─────────────────────────────────────────────────────────
export interface ContentExampleData {
  videos: Array<{ id: string; title: string; thumbnail: string; channelTitle: string; url: string }>
  script: { hook: string; middle: string[]; cta: string; product_tip: string; best_time: string; why: string }
  niche: string
  platform: string
  generated_at: string
  cached?: boolean
}

// ── ContentExampleTab (default export) ────────────────────────────────────────
export default function ContentExampleTab({
  userId,
  cachedData,
  niche,
}: {
  userId: string | null
  cachedData: ContentExampleData | null
  niche: string
}) {
  const [data, setData]               = useState<ContentExampleData | null>(cachedData)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [refreshedToday, setRefreshedToday] = useState(() => isToday(cachedData?.generated_at))

  function timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60)   return 'เมื่อสักครู่'
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  }

  const generate = async (force = false) => {
    if (!userId) return
    if (force && refreshedToday && process.env.NODE_ENV !== 'development') return
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/content/example', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, force, dev: process.env.NODE_ENV === 'development' }) })
      const json = await res.json()
      if (json.rateLimited) { setRefreshedToday(true); setLoading(false); return }
      if (!res.ok) throw new Error(json.error ?? 'เกิดข้อผิดพลาด')
      setData(json)
      if (force) { setLastRefreshed(new Date()); setRefreshedToday(true) }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  // Load on first mount if no cache
  useEffect(() => {
    if (!data && userId) generate(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
        <Loader2 size={28} style={{ color: '#7F77DD', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          MITA+ กำลังหาคลิปตัวอย่างและเขียน script...
        </p>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#FF6B6B' }}>{error}</p>
        <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          {error.includes('YOUTUBE_API_KEY') ? 'ต้องใส่ YOUTUBE_API_KEY ก่อนค่ะ' : 'ลองใหม่อีกครั้งค่ะ'}
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => generate(false)}
          style={{ padding: '10px 24px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          ลองใหม่
        </motion.button>
      </motion.div>
    )
  }

  if (!data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#fff' }}>คลิปตัวอย่างสัปดาห์นี้</p>
        <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          MITA+ จะหาคลิป viral ในแนวช่องของคุณ<br />แล้วเขียน script พร้อมถ่ายให้เลยค่ะ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
          {['🔍 ค้นหาคลิปดังในแนวช่องของคุณ', '✍️ MITA+ เขียน Hook + Script + CTA', '⏰ บอกเวลาที่ควรโพสต์', '🛍️ แนะนำสินค้าที่โปรโมตในคลิป'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px' }}>{t}</span>
            </div>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => generate(false)}
          disabled={!userId}
          style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', cursor: userId ? 'pointer' : 'not-allowed', background: userId ? 'linear-gradient(135deg, #7F77DD, #D85A30)' : 'rgba(255,255,255,0.06)', color: userId ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 800 }}
        >
          {userId ? '✨ สร้างคลิปตัวอย่างของฉัน' : 'กรุณา Login ก่อนค่ะ'}
        </motion.button>
        <p style={{ margin: '10px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
          อัพเดตอัตโนมัติทุก 7 วัน · ฟรีสำหรับ Starter
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 800, color: '#fff' }}>🎬 คลิปตัวอย่างสัปดาห์นี้</p>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>MITA+ คัด 10 คลิปสำหรับคุณโดยเฉพาะ</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {lastRefreshed && !refreshedToday && <p style={{ margin: 0, fontSize: '9px', color: 'rgba(127,119,221,0.8)', fontWeight: 600 }}>✨ อัปเดต{timeAgo(lastRefreshed)}</p>}
          {refreshedToday
            ? <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'right', lineHeight: 1.4 }}>🔒 รีเฟรชแล้ววันนี้<br />มาใหม่พรุ่งนี้ค่ะ</p>
            : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => generate(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', background: loading ? 'rgba(127,119,221,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${loading ? 'rgba(127,119,221,0.3)' : 'rgba(255,255,255,0.1)'}`, color: loading ? '#7F77DD' : 'rgba(255,255,255,0.5)' }}
              >
                <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? 'กำลังอัปเดต...' : 'รีเฟรช'}
              </motion.button>
            )
          }
        </div>
      </div>

      {/* YouTube Videos */}
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        ตัวอย่างคลิปดังในแนวช่องนี้
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {data.videos.map((v, i) => (
          <motion.a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.98 }}
            style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', borderRadius: '12px', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(127,119,221,0.12)' }}
          >
            <div style={{ position: 'relative', flexShrink: 0, width: '80px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a2e' }}>
              {v.thumbnail
                ? <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div>
              }
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', marginLeft: '2px' }}>▶</span>
                </div>
              </div>
              <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#FF0000', color: '#fff', fontSize: '8px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px' }}>YT</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {i + 1}. {v.title}
              </p>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{v.channelTitle}</p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Script */}
      <div style={{ background: 'rgba(123,97,255,0.07)', border: '1px solid rgba(123,97,255,0.2)', borderRadius: RADIUS.card, padding: '16px', marginBottom: '12px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 800, color: '#7F77DD' }}>
          📝 Script คลิปของคุณ (ปรับจากตัวอย่างด้านบน)
        </p>

        {/* Hook */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF9F1C', textTransform: 'uppercase' }}>Hook (3 วิแรก)</span>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#fff', lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{data.script.hook}&rdquo;
          </p>
        </div>

        {/* Middle */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#7F77DD', textTransform: 'uppercase' }}>เนื้อหากลาง</span>
          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.script.middle.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(127,119,221,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#7F77DD' }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#22C55E', textTransform: 'uppercase' }}>CTA ท้ายคลิป</span>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#22C55E', lineHeight: 1.6 }}>{data.script.cta}</p>
        </div>

        {/* Product tip */}
        {data.script.product_tip && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF9F1C', textTransform: 'uppercase' }}>สินค้าที่โปรโมตในคลิป</span>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{data.script.product_tip}</p>
          </div>
        )}

        {/* Best time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
          <span style={{ fontSize: '14px' }}>⏰</span>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            <strong style={{ color: '#fff' }}>โพสต์:</strong> {data.script.best_time}
          </p>
        </div>
      </div>

      {/* Why it works */}
      {data.script.why && (
        <div style={{ padding: '12px 14px', background: 'rgba(127,119,221,0.04)', border: '1px solid rgba(127,119,221,0.12)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#7F77DD' }}>💡 ทำไม script นี้ถึง work</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{data.script.why}</p>
        </div>
      )}
    </motion.div>
  )
}
