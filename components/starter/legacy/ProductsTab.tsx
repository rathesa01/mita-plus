'use client'
// ── P-010-fix1 · ProductsTab (legacy port) ────────────────────────────────────
// Ported from app/starter/page.legacy.tsx lines 131–172, 174–196, 498–1104
// Exports: ProductsTab (default), IAOfferCard, IAOffer interface

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { CARD, RADIUS } from '@/lib/tokens'

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number): string { return n.toLocaleString('th-TH') }

function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const offset = 7 * 60 * 60 * 1000
  const d = new Date(new Date(dateStr).getTime() + offset)
  const n = new Date(Date.now() + offset)
  return d.toISOString().slice(0, 10) === n.toISOString().slice(0, 10)
}

const COMMISSION_MAP: Record<string, number> = {
  ความงาม: 8, สกินแคร์: 8, แต่งหน้า: 8, beauty: 8, skincare: 8,
  แฟชั่น: 6, เสื้อผ้า: 6, fashion: 6,
  เครื่องประดับ: 7, jewelry: 7,
  สัตว์เลี้ยง: 6, แมว: 6, สุนัข: 6, pets: 6,
  ฟิตเนส: 6, ออกกำลังกาย: 6, fitness: 6, sports: 6,
  แม่และเด็ก: 6, mom_baby: 6,
  ของแต่งบ้าน: 5, บ้าน: 5, home: 5,
  อาหาร: 5, ทำอาหาร: 5, เบเกอรี่: 5, food: 5, คาเฟ่: 5, cafe: 5,
  ท่องเที่ยว: 5, travel: 5,
  สุขภาพ: 5, health: 5,
  การศึกษา: 4, หนังสือ: 4, education: 4,
  เทคโนโลยี: 4, กล้อง: 4, tech: 4, gadgets: 4,
  เกม: 4, gaming: 4,
  รถยนต์: 4, automotive: 4,
}
function lookupCommission(niche: string): number {
  return COMMISSION_MAP[niche] ?? COMMISSION_MAP[niche?.toLowerCase()] ?? 5
}
function calcCommThb(price: number, rate: number): number {
  return Math.round(price * rate / 100)
}

// ── IAOffer type ───────────────────────────────────────────────────────────────
export interface IAOffer {
  offer_id:          number
  offer_name:        string
  logo:              string
  category:          string
  category_th:       string
  commission:        string
  directory_page:    string
  preview_url:       string
  is_match:          boolean
  requires_approval: boolean
}

// ── IAOfferCard ────────────────────────────────────────────────────────────────
export function IAOfferCard({ offer }: { offer: IAOffer }) {
  const handleJoin = () => {
    const url = offer.directory_page || `https://app.involve.asia/publisher/offers`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...CARD.base, padding: '12px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {offer.logo
          ? <img src={offer.logo} alt={offer.offer_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          : <span style={{ fontSize: '20px' }}>🛍️</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '13px' }}>{offer.offer_name}</p>
          {offer.requires_approval && (
            <span style={{ fontSize: '9px', color: 'rgba(255,159,28,0.8)', background: 'rgba(255,159,28,0.1)', padding: '1px 6px', borderRadius: '99px', fontWeight: 600 }}>ต้องขออนุมัติ</span>
          )}
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          {offer.category_th}
          <span style={{ marginLeft: 8, color: '#22C55E', fontWeight: 700 }}>{offer.commission}</span>
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleJoin}
        style={{ flexShrink: 0, padding: '8px 12px', background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: '9px', color: '#7B61FF', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        ไปสมัคร →
      </motion.button>
    </motion.div>
  )
}

// ── ProductsTab (default export) ───────────────────────────────────────────────
export default function ProductsTab({
  affiliateData,
  userId,
  niche,
  onRefresh,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  affiliateData: any
  userId: string | null
  niche: string
  platform: string
  onRefresh: () => void
}) {
  const [generating, setGenerating]         = useState(false)
  const [genError, setGenError]             = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed]   = useState<Date | null>(null)
  const [refreshedToday, setRefreshedToday] = useState(() => isToday(affiliateData?.generated_at))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localData, setLocalData]           = useState<any>(null)
  const displayData = localData ?? affiliateData

  const [iaOffers, setIaOffers]   = useState<IAOffer[]>([])
  const [iaLoading, setIaLoading] = useState(true)
  const [iaError, setIaError]     = useState<string | null>(null)

  useEffect(() => {
    const n = niche || 'general'
    fetch(`/api/affiliate/involve-asia?niche=${encodeURIComponent(n)}`)
      .then(r => r.json())
      .then(json => { if (json.success) setIaOffers(json.data ?? []); else setIaError(json.error ?? 'โหลดไม่ได้') })
      .catch(() => setIaError('ไม่สามารถโหลดโปรแกรมได้'))
      .finally(() => setIaLoading(false))
  }, [niche])

  const isOldFormat = (affiliateData?.products?.length ?? 0) > 0 && affiliateData?.data_source !== 'ai_product_types'
  useEffect(() => {
    if (!isOldFormat || !userId) return
    const upgrade = async () => {
      setGenerating(true)
      try {
        const res  = await fetch('/api/affiliate/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, force: false }) })
        const json = await res.json().catch(() => ({}))
        if (json.data?.products?.length > 0) setLocalData(json.data)
        if (json.success && !json.cached) { setLastRefreshed(new Date()); Promise.resolve(onRefresh()).catch(() => {}) }
      } catch { /* silent */ } finally { setGenerating(false) }
    }
    upgrade()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOldFormat, userId])

  function timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60)   return 'เมื่อสักครู่'
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  }

  const generate = async (forceOverride = false) => {
    const isDev = process.env.NODE_ENV === 'development'
    const hasProducts = (displayData?.products?.length ?? 0) > 0
    if (!userId || (refreshedToday && hasProducts && !isDev && !forceOverride)) return
    setGenerating(true); setGenError(null)
    try {
      const res  = await fetch('/api/affiliate/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, force: hasProducts, dev: isDev }) })
      const json = await res.json().catch(() => ({}))
      if (json.rateLimited)  { setRefreshedToday(true); return }
      if (!res.ok)           throw new Error(json.error ?? `API error ${res.status}`)
      if (json.cached && !(json.data?.products?.length > 0)) {
        const res2  = await fetch('/api/affiliate/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, force: true, dev: isDev }) })
        const json2 = await res2.json().catch(() => ({}))
        if (json2.data?.products?.length > 0) setLocalData(json2.data)
        setLastRefreshed(new Date()); Promise.resolve(onRefresh()).catch(() => {}); return
      }
      if (json.data?.products?.length > 0) {
        setLocalData(json.data)
      } else if (!json.data?.products?.length) {
        setGenError('AI ไม่สามารถสร้างสินค้าได้ ลองใหม่อีกครั้งค่ะ'); return
      }
      setLastRefreshed(new Date())
      if (hasProducts) setRefreshedToday(true)
      Promise.resolve(onRefresh()).catch(() => {})
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด ลองใหม่อีกครั้งค่ะ')
    } finally { setGenerating(false) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = displayData?.products as Array<any> | null
  const isAiProductTypes = displayData?.data_source === 'ai_product_types'

  if (!products || products.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ padding: '28px 20px', textAlign: 'center', background: 'rgba(123,97,255,0.06)', border: '1px dashed rgba(123,97,255,0.3)', borderRadius: RADIUS.card, marginBottom: '16px' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🛍️</span>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#fff' }}>ยังไม่มีสินค้าแนะนำ</p>
          <p style={{ margin: '0 0 18px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
            MITA+ จะวิเคราะห์ช่องของคุณแล้วเลือกสินค้าที่ควรโปรโมต<br />พร้อม link และรายได้ต่อชิ้นค่ะ
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => generate()}
            disabled={generating || !userId}
            style={{ padding: '13px 28px', background: generating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #7B61FF, #22C55E)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            {generating
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> MITA+ กำลังวิเคราะห์...</>
              : <>✨ ให้ MITA+ เลือกสินค้าให้</>
            }
          </motion.button>
          {genError && <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#FF6B6B', textAlign: 'center', lineHeight: 1.5 }}>⚠️ {genError}</p>}
        </div>
      </motion.div>
    )
  }

  const nicheKey     = displayData?.based_on_niche ?? niche ?? 'general'
  const baseRate     = lookupCommission(nicheKey)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computedMonthly = (products ?? []).reduce((sum: number, p: any) => {
    const rate     = p.commission_rate > 0 ? p.commission_rate : baseRate
    const priceAvg = ((p.price_min ?? 200) + (p.price_max ?? 800)) / 2
    const commThb  = p.commission_thb > 0 ? p.commission_thb : calcCommThb(priceAvg, rate)
    return sum + commThb * 0.3
  }, 0)
  const earnPerMonth = (displayData?.total_monthly_min ?? 0) > 0 ? displayData.total_monthly_min : Math.round(computedMonthly * 0.5)
  const earnMax      = (displayData?.total_monthly_max ?? 0) > 0 ? displayData.total_monthly_max : Math.round(computedMonthly * 2)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* How-to note */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(123,97,255,0.07)', border: '1px solid rgba(123,97,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '15px', flexShrink: 0 }}>🛍️</span>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(200,185,255,0.9)', lineHeight: 1.5 }}>
          MITA+ เลือก<strong>ประเภทสินค้า</strong>ที่เหมาะกับช่องคุณ — กดปุ่มค้นหาแล้วสร้าง affiliate link ของตัวเองได้เลยค่ะ
        </p>
      </motion.div>

      {/* Summary banner */}
      <div style={{ padding: '14px 16px', marginBottom: '14px', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(123,97,255,0.08))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            MITA+ คัด {products.length} ประเภทสินค้าตาม niche ของคุณ
            {isAiProductTypes && <span style={{ marginLeft: 6, color: '#22C55E', fontWeight: 700 }}>● AI วิเคราะห์แล้ว</span>}
          </p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#22C55E' }}>฿{fmt(earnPerMonth)} – ฿{fmt(earnMax)}/เดือน</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {lastRefreshed && !refreshedToday && <p style={{ margin: 0, fontSize: '9px', color: 'rgba(34,197,94,0.7)', fontWeight: 600 }}>✨ อัปเดต{timeAgo(lastRefreshed)}</p>}
          {refreshedToday
            ? <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'right', lineHeight: 1.4 }}>🔒 รีเฟรชแล้ววันนี้<br />มาใหม่พรุ่งนี้ค่ะ</p>
            : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => generate()}
                disabled={generating}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: generating ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${generating ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', color: generating ? '#22C55E' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                <RefreshCw size={11} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                {generating ? 'กำลังอัปเดต...' : 'รีเฟรช'}
              </motion.button>
            )
          }
        </div>
      </div>

      {displayData?.tip && (
        <div style={{ padding: '10px 14px', marginBottom: '14px', background: 'rgba(255,159,28,0.07)', border: '1px solid rgba(255,159,28,0.2)', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            <span style={{ color: '#FF9F1C', fontWeight: 700 }}>💡 เคล็ดลับ: </span>{displayData.tip}
          </p>
        </div>
      )}

      {/* Product cards */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {products.map((p: any, i: number) => {
        const nameTh    = p.name_th || p.name_display?.split(' / ')?.[0] || p.name || ''
        const nameEn    = p.name_en || p.name_display?.split(' / ')?.[1] || ''
        const catTh     = p.category_th || p.category || ''
        const rate      = p.commission_rate > 0 ? p.commission_rate : baseRate
        const priceAvg  = p.price_min != null ? ((p.price_min) + (p.price_max ?? p.price_min * 2)) / 2 : p.price ?? 500
        const commThb   = p.commission_thb > 0 ? p.commission_thb : calcCommThb(priceAvg, rate)
        const priceLabel = p.price_display || (p.price_min != null ? `฿${p.price_min.toLocaleString('th-TH')} – ฿${(p.price_max ?? 0).toLocaleString('th-TH')}` : p.price ? `฿${p.price.toLocaleString('th-TH')}` : '')
        const kw        = encodeURIComponent(nameEn || nameTh || '')
        const shopeeUrl = p.shopee_search || p.product_url || (kw ? `https://shopee.co.th/search?keyword=${kw}` : '')
        const lazadaUrl = p.lazada_search  || (kw ? `https://www.lazada.co.th/catalog/?q=${kw}` : '')
        return (
          <motion.div
            key={p.id ?? i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ ...CARD.base, padding: '14px', marginBottom: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '99px', background: 'linear-gradient(135deg, #7B61FF, #22C55E)', fontSize: '11px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                {p.rank || i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 1px', fontWeight: 800, color: '#fff', fontSize: '14px', lineHeight: 1.3 }}>{nameTh || '—'}</p>
                {nameEn ? <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{nameEn}</p> : null}
              </div>
              {catTh && <span style={{ flexShrink: 0, fontSize: '9px', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: '99px', fontWeight: 600 }}>{catTh}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', marginBottom: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px' }}>
              <div>
                <p style={{ margin: '0 0 1px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>ช่วงราคา</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{priceLabel || '—'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 1px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>ได้รับต่อชิ้น</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#22C55E' }}>~฿{commThb} <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(34,197,94,0.7)' }}>({rate}%)</span></p>
              </div>
            </div>
            {p.why_fits    && <p style={{ margin: '0 0 4px',  fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>🎯 {p.why_fits}</p>}
            {p.content_idea && <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(123,97,255,0.8)', lineHeight: 1.5, fontStyle: 'italic' }}>💡 {p.content_idea}</p>}
            <div style={{ display: 'flex', gap: '6px' }}>
              {shopeeUrl && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.open(shopeeUrl, '_blank', 'noopener,noreferrer')} style={{ flex: 1, padding: '9px 6px', background: 'rgba(255,87,34,0.1)', border: '1px solid rgba(255,87,34,0.25)', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#FF6B3D', fontSize: '11px', fontWeight: 700 }}>
                  🟠 ค้นหาใน Shopee
                </motion.button>
              )}
              {lazadaUrl && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.open(lazadaUrl, '_blank', 'noopener,noreferrer')} style={{ flex: 1, padding: '9px 6px', background: 'rgba(0,105,255,0.08)', border: '1px solid rgba(0,105,255,0.2)', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#4D8EFF', fontSize: '11px', fontWeight: 700 }}>
                  🔵 ค้นหาใน Lazada
                </motion.button>
              )}
            </div>
          </motion.div>
        )
      })}

      {/* Affiliate signup guide */}
      <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.2)', borderRadius: RADIUS.card }}>
        <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#FF9F1C' }}>💰 วิธีรับเงิน — สมัคร Affiliate ก่อน</p>
        <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>1) สมัคร Shopee/Lazada Affiliate  2) ค้นหาสินค้าด้านบน  3) สร้าง link ของตัวเอง  4) เงินเข้าตรงไม่ผ่านใคร</p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <a href="https://affiliate.shopee.co.th" target="_blank" rel="noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '9px', background: '#FF5722', color: '#fff', borderRadius: '9px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>🟠 Shopee Affiliate</a>
          <a href="https://affiliate.lazada.co.th" target="_blank" rel="noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '9px', background: '#0066FF', color: '#fff', borderRadius: '9px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>🔵 Lazada Affiliate</a>
        </div>
      </div>

      <div style={{ marginTop: '8px', padding: '12px 14px', background: 'rgba(123,97,255,0.05)', border: '1px solid rgba(123,97,255,0.12)', borderRadius: RADIUS.card, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>🔄 MITA+ อัพเดทประเภทสินค้าให้ทุกวันตาม niche ของคุณค่ะ</p>
      </div>

      {/* Involve Asia Premium Programs */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>โปรแกรม Affiliate พรีเมียม</p>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          แบรนด์จริงในไทย — สมัครฟรีที่ Involve Asia แล้วได้ link ตัวเองมาแชร์ได้เลย commission เข้าคุณโดยตรงค่ะ
        </p>
        {iaLoading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} />
            กำลังโหลด...
          </div>
        )}
        {!iaLoading && iaError && (
          <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.2)' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#FF6B6B' }}>⚠️ {iaError}</p>
          </div>
        )}
        {!iaLoading && !iaError && (
          <>
            {iaOffers.filter(o => o.is_match).length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '10px', color: '#7B61FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⭐ ตรง niche ของคุณ</p>
                {iaOffers.filter(o => o.is_match).map(offer => <IAOfferCard key={offer.offer_id} offer={offer} />)}
              </div>
            )}
            {iaOffers.filter(o => !o.is_match).length > 0 && (
              <div>
                {iaOffers.filter(o => o.is_match).length > 0 && (
                  <p style={{ margin: '12px 0 8px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>โปรแกรมอื่นๆ</p>
                )}
                {iaOffers.filter(o => !o.is_match).map(offer => <IAOfferCard key={offer.offer_id} offer={offer} />)}
              </div>
            )}
            <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
                💡 สมัครฟรีที่ Involve Asia → รับ affiliate link ของตัวเองมา → แชร์ใน bio/คลิป → commission เข้าคุณตรงค่ะ ไม่ผ่านใคร
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
