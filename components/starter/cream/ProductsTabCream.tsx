'use client'
// ── P-011-adapt · ProductsTabCream — Lovable design + legacy business logic ────
// Visual: MANAO_LOVABLE_CODE_P011.tsx (Lovable.dev, 2026-04-30)
// Logic:  components/starter/legacy/ProductsTab.tsx (P-010-fix1)

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Sparkles,
  RotateCw,
  Lightbulb,
  Target,
  Search,
  DollarSign,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ---------- Types ----------
export interface AffiliateProduct {
  rank?: number
  name_th?: string
  name_en?: string
  name_display?: string
  name?: string
  category_th?: string
  category?: string
  price_min?: number
  price_max?: number
  price?: number
  price_display?: string
  commission_rate?: number
  commission_thb?: number
  why_fits?: string
  content_idea?: string
  shopee_search?: string
  lazada_search?: string
  product_url?: string
  id?: string | number
}
export interface InvolveAsiaOffer {
  offer_id: number
  offer_name: string
  logo: string
  category?: string
  category_th: string
  commission: string
  directory_page: string
  preview_url?: string
  is_match?: boolean
  requires_approval?: boolean
}
export interface AffiliateData {
  products: AffiliateProduct[]
  total_monthly_min: number
  total_monthly_max: number
  data_source?: 'ai_product_types' | 'fallback' | string
  tip?: string
  generated_at?: string
  based_on_niche?: string
}
export interface ProductsTabCreamProps {
  affiliateData: AffiliateData | null
  userId?: string | null
  niche?: string
  onRefresh?: () => Promise<void> | void
  hasChannel: boolean
  onConnectChannel?: () => void
}

// ---------- Brand tokens (Apple warm minimal) ----------
const C = {
  cream: '#FFFAF5',
  ink: '#1D1D1F',
  muted: '#6B6B6B',
  subtle: '#8A8A8A',
  body: '#4A4A4A',
  coral: '#D85A30',
  purple: '#7F77DD',
  shopee: '#FF5722',
  lazada: '#0066FF',
  border: 'rgba(0,0,0,0.06)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.04)',
}
const cardBase: React.CSSProperties = {
  background: '#FFFFFF',
  border: `1px solid ${C.border}`,
  boxShadow: C.cardShadow,
  borderRadius: 18,
}
const fmtBaht = (n: number) => `฿${n.toLocaleString('th-TH')}`

// ---------- Helpers ----------
function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const offset = 7 * 60 * 60 * 1000
  const d = new Date(new Date(dateStr).getTime() + offset)
  const n = new Date(Date.now() + offset)
  return d.toISOString().slice(0, 10) === n.toISOString().slice(0, 10)
}

// 2D: Commission map fallback
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
  return Math.round((price * rate) / 100)
}

// ---------- Component ----------
export default function ProductsTabCream({
  affiliateData,
  userId,
  niche,
  onRefresh,
  hasChannel,
  onConnectChannel,
}: ProductsTabCreamProps) {
  // --- State ---
  const [localData, setLocalData]           = useState<AffiliateData | null>(null)
  const [generating, setGenerating]         = useState(false)
  const [genError, setGenError]             = useState<string | null>(null)
  const [refreshedToday, setRefreshedToday] = useState(() => isToday(affiliateData?.generated_at))
  const [lastRefreshed, setLastRefreshed]   = useState<Date | null>(null)
  const [showOtherOffers, setShowOtherOffers] = useState(false)

  // 2A: IA offers — internal state
  const [iaOffers, setIaOffers]   = useState<InvolveAsiaOffer[]>([])
  const [iaLoading, setIaLoading] = useState(true)
  const [iaError, setIaError]     = useState<string | null>(null)

  const displayData = localData ?? affiliateData

  // 2A: Fetch IA offers on mount / niche change
  useEffect(() => {
    const n = niche || 'general'
    fetch(`/api/affiliate/involve-asia?niche=${encodeURIComponent(n)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setIaOffers(json.data ?? [])
        else setIaError(json.error ?? 'โหลดไม่ได้')
      })
      .catch(() => setIaError('ไม่สามารถโหลดโปรแกรมได้'))
      .finally(() => setIaLoading(false))
  }, [niche])

  // 2B: timeAgo helper
  function timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60)   return 'เมื่อสักครู่'
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  }

  // 2C: Full generate logic (port from legacy lines 158-185)
  const generate = async (forceOverride = false) => {
    const isDev = process.env.NODE_ENV === 'development'
    const hasProducts = (displayData?.products?.length ?? 0) > 0
    if (!userId || (refreshedToday && hasProducts && !isDev && !forceOverride)) return
    setGenerating(true)
    setGenError(null)
    try {
      const res  = await fetch('/api/affiliate/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, force: hasProducts, dev: isDev }),
      })
      const json = await res.json().catch(() => ({}))
      if (json.rateLimited) { setRefreshedToday(true); return }
      if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`)
      // 2-step retry if cached/empty
      if (json.cached && !(json.data?.products?.length > 0)) {
        const res2  = await fetch('/api/affiliate/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, force: true, dev: isDev }),
        })
        const json2 = await res2.json().catch(() => ({}))
        if (json2.data?.products?.length > 0) setLocalData(json2.data)
        setLastRefreshed(new Date())
        Promise.resolve(onRefresh?.()).catch(() => {})
        return
      }
      if (json.data?.products?.length > 0) {
        setLocalData(json.data)
      } else if (!(json.data?.products?.length > 0)) {
        setGenError('AI ไม่สามารถสร้างสินค้าได้ ลองใหม่อีกครั้งค่ะ')
        return
      }
      setLastRefreshed(new Date())
      if (hasProducts) setRefreshedToday(true)
      Promise.resolve(onRefresh?.()).catch(() => {})
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด ลองใหม่อีกครั้งค่ะ')
    } finally {
      setGenerating(false)
    }
  }

  // 2H: isOldFormat auto-upgrade (port from legacy lines 135-149)
  const isOldFormat =
    (affiliateData?.products?.length ?? 0) > 0 &&
    affiliateData?.data_source !== 'ai_product_types'
  useEffect(() => {
    if (!isOldFormat || !userId) return
    const upgrade = async () => {
      setGenerating(true)
      try {
        const res  = await fetch('/api/affiliate/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, force: false }),
        })
        const json = await res.json().catch(() => ({}))
        if (json.data?.products?.length > 0) setLocalData(json.data)
        if (json.success && !json.cached) {
          setLastRefreshed(new Date())
          Promise.resolve(onRefresh?.()).catch(() => {})
        }
      } catch { /* silent */ } finally {
        setGenerating(false)
      }
    }
    upgrade()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOldFormat, userId])

  // --- Derived values ---
  const products = displayData?.products ?? []
  const isEmpty  = !displayData || products.length === 0
  const nicheKey = displayData?.based_on_niche ?? niche ?? 'general'
  const baseRate = lookupCommission(nicheKey)

  // Compute monthly earnings with legacy fallback
  const earnPerMonth = useMemo(() => {
    if ((displayData?.total_monthly_min ?? 0) > 0) return displayData!.total_monthly_min
    const computed = products.reduce((sum, p) => {
      const rate     = (p.commission_rate ?? 0) > 0 ? p.commission_rate! : baseRate
      const priceAvg = p.price_min != null ? (p.price_min + (p.price_max ?? p.price_min * 2)) / 2 : (p.price ?? 500)
      const commThb  = (p.commission_thb ?? 0) > 0 ? p.commission_thb! : calcCommThb(priceAvg, rate)
      return sum + commThb * 0.3
    }, 0)
    return Math.round(computed * 0.5)
  }, [displayData, products, baseRate])

  const earnMax = useMemo(() => {
    if ((displayData?.total_monthly_max ?? 0) > 0) return displayData!.total_monthly_max
    const computed = products.reduce((sum, p) => {
      const rate     = (p.commission_rate ?? 0) > 0 ? p.commission_rate! : baseRate
      const priceAvg = p.price_min != null ? (p.price_min + (p.price_max ?? p.price_min * 2)) / 2 : (p.price ?? 500)
      const commThb  = (p.commission_thb ?? 0) > 0 ? p.commission_thb! : calcCommThb(priceAvg, rate)
      return sum + commThb * 0.3
    }, 0)
    return Math.round(computed * 2)
  }, [displayData, products, baseRate])

  const matchOffers = useMemo(() => iaOffers.filter((o) => o.is_match),  [iaOffers])
  const otherOffers = useMemo(() => iaOffers.filter((o) => !o.is_match), [iaOffers])

  // ---------- Render ----------
  return (
    <div
      style={{ background: C.cream, color: C.ink }}
      className='min-h-screen w-full px-4 py-5 font-sans'
    >
      <div className='mx-auto flex w-full max-w-[420px] flex-col gap-4'>

        {/* SECTION 1: Channel warning */}
        {!hasChannel && (
          <div
            style={{
              background: 'rgba(216,90,48,0.06)',
              border: '1px solid rgba(216,90,48,0.2)',
              borderRadius: 14,
              padding: '14px 16px',
            }}
            className='flex gap-3'
          >
            <AlertCircle size={16} color={C.coral} className='mt-0.5 shrink-0' />
            <div className='flex-1'>
              <div style={{ color: C.ink, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                เพิ่มความแม่นยำ
              </div>
              <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 2 }}>
                ตอนนี้ใช้ข้อมูลจาก Audit เท่านั้น —{' '}
                <button
                  type='button'
                  onClick={onConnectChannel}
                  style={{ color: C.coral, fontWeight: 600 }}
                  className='underline-offset-2 hover:underline'
                >
                  เชื่อมช่อง
                </button>{' '}
                เพื่อให้ AI แนะนำสินค้าได้แม่นขึ้น
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: How-to hint — always visible */}
        <div
          style={{
            background: 'rgba(127,119,221,0.04)',
            border: '1px solid rgba(127,119,221,0.15)',
            borderRadius: 14,
            padding: '12px 14px',
          }}
          className='flex gap-2.5'
        >
          <Sparkles size={14} color={C.purple} className='mt-0.5 shrink-0' />
          <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.55 }}>
            MITA+ เลือก{' '}
            <span style={{ color: C.ink, fontWeight: 600 }}>ประเภทสินค้า</span>{' '}
            ที่เหมาะกับช่องคุณ — กดปุ่มค้นหาแล้วสร้าง affiliate link ของตัวเองได้เลยค่ะ
          </div>
        </div>

        {/* SECTION 3: Earnings summary */}
        {!isEmpty && displayData && (
          <div style={{ ...cardBase, padding: '18px 20px' }} className='flex items-start gap-3'>
            <div className='flex-1 min-w-0'>
              <div style={{ fontSize: 11, color: C.subtle, letterSpacing: '-0.01em' }}>
                MITA+ คัด {products.length} ประเภทสินค้าตาม niche{niche ? ` "${niche}"` : ''} ของคุณ
                {displayData.data_source === 'ai_product_types' && (
                  <span
                    className='ml-1.5 inline-flex items-center align-middle'
                    style={{
                      background: 'rgba(127,119,221,0.15)',
                      color: C.purple,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: 999,
                      letterSpacing: '0.02em',
                    }}
                  >
                    AI
                  </span>
                )}
              </div>
              <div
                style={{
                  color: C.coral,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginTop: 4,
                  lineHeight: 1.15,
                }}
              >
                {fmtBaht(earnPerMonth)} – {fmtBaht(earnMax)}
                <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>/เดือน</span>
              </div>
              {/* 2G: genError in summary */}
              {genError && (
                <div style={{ marginTop: 8, fontSize: 11, color: C.coral }}>⚠️ {genError}</div>
              )}
            </div>
            <div className='flex flex-col items-end gap-1.5 shrink-0'>
              {lastRefreshed && !refreshedToday && (
                <div style={{ fontSize: 10, color: C.subtle }}>
                  ✨ อัปเดต {timeAgo(lastRefreshed)}
                </div>
              )}
              {refreshedToday ? (
                <div style={{ fontSize: 11, color: C.subtle, textAlign: 'right', lineHeight: 1.4 }}>
                  🔒 รีเฟรชแล้ววันนี้
                  <br />· มาใหม่พรุ่งนี้ค่ะ
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => generate(true)}
                  disabled={generating}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 999,
                    padding: '8px 14px',
                    color: generating ? C.coral : C.ink,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  className='inline-flex items-center gap-1.5 transition-colors'
                >
                  <RotateCw size={12} className={generating ? 'animate-spin' : ''} />
                  {generating ? 'กำลังอัปเดต...' : 'รีเฟรช'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: AI Tip */}
        {displayData?.tip && (
          <div
            style={{
              background: 'rgba(216,90,48,0.04)',
              border: '1px solid rgba(216,90,48,0.15)',
              borderRadius: 14,
              padding: '12px 14px',
            }}
            className='flex gap-2.5'
          >
            <Lightbulb size={14} color={C.coral} className='mt-0.5 shrink-0' />
            <div style={{ fontSize: 12, color: C.body, lineHeight: 1.55 }}>
              <span style={{ color: C.coral, fontWeight: 700 }}>เคล็ดลับ: </span>
              {displayData.tip}
            </div>
          </div>
        )}

        {/* SECTION 5: Product cards */}
        {!isEmpty && (
          <div className='flex flex-col gap-3'>
            {products.map((p, i) => {
              // 2E: Multi-format name parsing
              const nameTh = p.name_th || p.name_display?.split(' / ')?.[0] || p.name || ''
              const nameEn = p.name_en || p.name_display?.split(' / ')?.[1] || ''
              const catTh  = p.category_th || p.category || ''
              // 2D: lookupCommission fallback
              const rate     = (p.commission_rate ?? 0) > 0 ? p.commission_rate! : lookupCommission(catTh || nicheKey)
              const priceAvg = p.price_min != null ? (p.price_min + (p.price_max ?? p.price_min * 2)) / 2 : (p.price ?? 500)
              const commThb  = (p.commission_thb ?? 0) > 0 ? p.commission_thb! : calcCommThb(priceAvg, rate)
              const priceLabel = p.price_display || (p.price_min != null ? `฿${p.price_min.toLocaleString('th-TH')} – ฿${(p.price_max ?? 0).toLocaleString('th-TH')}` : p.price ? `฿${p.price.toLocaleString('th-TH')}` : '')
              // 2F: English name first for search URLs
              const kw       = encodeURIComponent(nameEn || nameTh || '')
              const shopeeUrl = p.shopee_search || p.product_url || (kw ? `https://shopee.co.th/search?keyword=${kw}` : '')
              const lazadaUrl = p.lazada_search  || (kw ? `https://www.lazada.co.th/catalog/?q=${kw}` : '')

              return (
                <motion.div
                  key={p.id ?? i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ ...cardBase, padding: 16 }}
                  className='flex flex-col gap-3'
                >
                  {/* Top row: rank badge + name + category */}
                  <div className='flex items-start gap-3'>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 999,
                        background: `linear-gradient(135deg, ${C.purple}, ${C.coral})`,
                        color: '#FFFFFF', fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em',
                      }}
                      className='flex shrink-0 items-center justify-center'
                    >
                      {p.rank || i + 1}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div style={{ color: C.ink, fontSize: 15, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                        {nameTh || '—'}
                      </div>
                      {nameEn && (
                        <div style={{ color: C.subtle, fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>
                          {nameEn}
                        </div>
                      )}
                    </div>
                    {catTh && (
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.04)', color: C.muted, fontSize: 10,
                          padding: '4px 10px', borderRadius: 999, fontWeight: 600, letterSpacing: '-0.005em',
                        }}
                        className='shrink-0'
                      >
                        {catTh}
                      </div>
                    )}
                  </div>

                  {/* Price/Commission row */}
                  <div
                    style={{
                      background: 'rgba(216,90,48,0.05)',
                      border: '1px solid rgba(216,90,48,0.12)',
                      borderRadius: 12, padding: '10px 14px',
                    }}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <div style={{ fontSize: 10, color: C.subtle }}>ช่วงราคา</div>
                      <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>
                        {priceLabel || '—'}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div style={{ fontSize: 10, color: C.subtle }}>ได้รับต่อชิ้น</div>
                      <div className='flex items-baseline justify-end gap-1'>
                        <span style={{ color: C.coral, fontSize: 14, fontWeight: 800 }}>
                          ~{fmtBaht(commThb)}
                        </span>
                        <span style={{ color: C.coral, opacity: 0.7, fontSize: 10 }}>
                          ({rate}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  {p.why_fits && (
                    <div className='flex gap-2'>
                      <Target size={12} color={C.coral} className='mt-1 shrink-0' />
                      <div style={{ color: C.body, fontSize: 12, lineHeight: 1.5 }}>{p.why_fits}</div>
                    </div>
                  )}
                  {p.content_idea && (
                    <div className='flex gap-2'>
                      <Lightbulb size={12} color={C.purple} className='mt-1 shrink-0' />
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {p.content_idea}
                      </div>
                    </div>
                  )}

                  {/* Shopee + Lazada CTA */}
                  <div className='flex gap-2'>
                    {shopeeUrl && (
                      <a
                        href={shopeeUrl}
                        target='_blank'
                        rel='noreferrer noopener'
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid rgba(255,87,34,0.3)',
                          color: C.shopee, borderRadius: 10, padding: 10,
                          fontSize: 12, fontWeight: 700,
                        }}
                        className='flex flex-1 items-center justify-center gap-1.5 transition-colors hover:bg-[rgba(255,87,34,0.05)]'
                      >
                        <Search size={13} />
                        ค้นหาใน Shopee
                      </a>
                    )}
                    {lazadaUrl && (
                      <a
                        href={lazadaUrl}
                        target='_blank'
                        rel='noreferrer noopener'
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid rgba(0,102,255,0.3)',
                          color: C.lazada, borderRadius: 10, padding: 10,
                          fontSize: 12, fontWeight: 700,
                        }}
                        className='flex flex-1 items-center justify-center gap-1.5 transition-colors hover:bg-[rgba(0,102,255,0.05)]'
                      >
                        <Search size={13} />
                        ค้นหาใน Lazada
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {isEmpty && (
          <EmptyState onRefresh={() => generate()} loading={generating} genError={genError} />
        )}

        {/* SECTION 6: Affiliate signup guide */}
        {!isEmpty && (
          <div style={{ ...cardBase, padding: 18 }} className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <DollarSign size={16} color={C.coral} />
              <div style={{ color: C.ink, fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
                วิธีรับเงิน — สมัคร Affiliate ก่อน
              </div>
            </div>
            <ol className='flex flex-col gap-1.5' style={{ paddingLeft: 20 }}>
              {[
                'สมัคร Shopee/Lazada Affiliate',
                'ค้นหาสินค้าด้านบน',
                'สร้าง link ของตัวเอง',
                'เงินเข้าตรงไม่ผ่านใคร',
              ].map((s, idx) => (
                <li key={idx} style={{ color: C.body, fontSize: 12, lineHeight: 1.5, listStyle: 'decimal' }}>
                  {s}
                </li>
              ))}
            </ol>
            <div className='flex gap-2 pt-1'>
              <a
                href='https://affiliate.shopee.co.th'
                target='_blank'
                rel='noreferrer noopener'
                style={{
                  background: C.shopee, color: '#FFFFFF',
                  fontSize: 14, fontWeight: 700, padding: 14, borderRadius: 12,
                }}
                className='flex flex-1 items-center justify-center transition-opacity hover:opacity-90'
              >
                Shopee Affiliate
              </a>
              <a
                href='https://affiliate.lazada.co.th'
                target='_blank'
                rel='noreferrer noopener'
                style={{
                  background: C.lazada, color: '#FFFFFF',
                  fontSize: 14, fontWeight: 700, padding: 14, borderRadius: 12,
                }}
                className='flex flex-1 items-center justify-center transition-opacity hover:opacity-90'
              >
                Lazada Affiliate
              </a>
            </div>
          </div>
        )}

        {/* SECTION 7: Auto-update note */}
        <div style={{ fontSize: 11, color: C.subtle, padding: '12px 0', textAlign: 'center' }}>
          MITA+ อัพเดทประเภทสินค้าให้ทุกวันตาม niche ของคุณค่ะ
        </div>

        {/* SECTION 8: Involve Asia premium programs */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-3'>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.10)' }} />
            <div style={{ fontSize: 11, color: C.subtle, fontWeight: 600, letterSpacing: '0.02em' }}>
              โปรแกรม Affiliate พรีเมียม
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.10)' }} />
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, textAlign: 'center' }}>
            แบรนด์จริงในไทย — สมัครฟรีที่ Involve Asia แล้วได้ link ตัวเองมาแชร์ได้เลย commission เข้าคุณโดยตรงค่ะ
          </div>

          {iaLoading && (
            <div className='flex items-center justify-center gap-2 py-6' style={{ color: C.muted }}>
              <RotateCw size={14} className='animate-spin' />
              <span style={{ fontSize: 12 }}>กำลังโหลด...</span>
            </div>
          )}
          {!iaLoading && iaError && (
            <div
              style={{
                background: 'rgba(216,90,48,0.06)',
                border: '1px solid rgba(216,90,48,0.2)',
                borderRadius: 14, padding: '12px 14px',
                color: C.body, fontSize: 12,
              }}
              className='flex gap-2'
            >
              <AlertCircle size={14} color={C.coral} className='mt-0.5 shrink-0' />
              {iaError}
            </div>
          )}
          {!iaLoading && !iaError && (
            <>
              {matchOffers.length > 0 && (
                <div className='flex flex-col gap-2'>
                  <div style={{ fontSize: 11, color: C.coral, fontWeight: 700 }}>
                    ⭐ ตรง niche ของคุณ
                  </div>
                  {matchOffers.map((o) => (
                    <OfferCard key={o.offer_id} offer={o} />
                  ))}
                </div>
              )}
              {otherOffers.length > 0 && (
                <div className='flex flex-col gap-2'>
                  <button
                    type='button'
                    onClick={() => setShowOtherOffers((s) => !s)}
                    style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}
                    className='flex items-center justify-center gap-1 py-1'
                  >
                    {showOtherOffers ? 'ซ่อนแบรนด์อื่น' : `แบรนด์อื่นๆ (${otherOffers.length})`}
                    {showOtherOffers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showOtherOffers && otherOffers.map((o) => (
                    <OfferCard key={o.offer_id} offer={o} />
                  ))}
                </div>
              )}
            </>
          )}

          <div style={{ fontSize: 12, color: C.subtle, lineHeight: 1.6, padding: '4px 2px' }}>
            💡 สมัครฟรีที่ Involve Asia → รับ affiliate link ของตัวเองมา → แชร์ใน bio/คลิป → commission เข้าคุณตรงค่ะ ไม่ผ่านใคร
          </div>
        </div>

      </div>
    </div>
  )
}

// ---------- Sub: Offer Card ----------
function OfferCard({ offer }: { offer: InvolveAsiaOffer }) {
  return (
    <div style={{ ...cardBase, borderRadius: 14, padding: '12px 14px' }} className='flex items-center gap-3'>
      <div
        style={{
          width: 44, height: 44, borderRadius: 10,
          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)',
        }}
        className='flex shrink-0 items-center justify-center overflow-hidden'
      >
        <img
          src={offer.logo}
          alt={offer.offer_name}
          className='h-full w-full object-contain p-1'
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1.5'>
          <div
            style={{ fontSize: 13, color: '#1D1D1F', fontWeight: 700, letterSpacing: '-0.01em' }}
            className='truncate'
          >
            {offer.offer_name}
          </div>
          {offer.requires_approval && (
            <span
              style={{
                color: '#D85A30', fontSize: 9, fontWeight: 700,
                background: 'rgba(216,90,48,0.08)', padding: '1px 6px', borderRadius: 999,
              }}
              className='shrink-0'
            >
              ต้องขออนุมัติ
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>
          {offer.category_th} ·{' '}
          <span style={{ color: '#D85A30', fontWeight: 700 }}>{offer.commission}</span>
        </div>
      </div>
      <a
        href={offer.directory_page}
        target='_blank'
        rel='noreferrer noopener'
        style={{
          background: 'rgba(216,90,48,0.1)',
          border: '1px solid rgba(216,90,48,0.25)',
          color: '#D85A30', fontSize: 11, fontWeight: 700,
          borderRadius: 10, padding: '8px 12px',
        }}
        className='shrink-0 transition-colors hover:bg-[rgba(216,90,48,0.18)]'
      >
        ไปสมัคร →
      </a>
    </div>
  )
}

// ---------- Sub: Empty State ----------
function EmptyState({
  onRefresh,
  loading,
  genError,
}: {
  onRefresh: () => void
  loading: boolean
  genError: string | null
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px dashed rgba(127,119,221,0.3)',
        borderRadius: 18, padding: '32px 24px',
      }}
      className='flex flex-col items-center gap-3 text-center'
    >
      <ShoppingBag size={32} color='#D85A30' />
      <div style={{ color: '#1D1D1F', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
        ยังไม่มีสินค้าแนะนำ
      </div>
      <div style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.65, maxWidth: 280 }}>
        MITA+ จะวิเคราะห์ช่องของคุณแล้วเลือกสินค้าที่ควรโปรโมต พร้อม link และรายได้ต่อชิ้นค่ะ
      </div>
      <button
        type='button'
        onClick={onRefresh}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #7F77DD, #D85A30)',
          color: '#FFFFFF', fontSize: 14, fontWeight: 700,
          padding: '14px 28px', borderRadius: 12,
        }}
        className='mt-2 inline-flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70'
      >
        {loading ? (
          <>
            <RotateCw size={14} className='animate-spin' />
            MITA+ กำลังวิเคราะห์...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            ให้ MITA+ เลือกสินค้าให้
          </>
        )}
      </button>
      {/* 2G: genError under empty state CTA */}
      {genError && (
        <div style={{ fontSize: 11, color: '#D85A30', marginTop: 4 }}>⚠️ {genError}</div>
      )}
    </div>
  )
}
