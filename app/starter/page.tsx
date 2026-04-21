'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ChevronRight, Flame, Target, TrendingUp, Star, Bell, Loader2, RefreshCw } from 'lucide-react'
import { COLORS, CARD, RADIUS } from '@/lib/tokens'
import CheckInModal from './CheckInModal'
import { getSupabaseClient, type UserProfile } from '@/lib/db/supabaseClient'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Mock fallbacks (used only when no real data) ─────────
const MOCK_CREATOR = {
  name: 'คุณ',
  platform: 'TikTok',
  followers: 0,
  targetIncome: 5000,
  currentEarned: 0,
  streak: 1,
  weekNo: 1,
}

const MOCK_MILESTONES = [
  { label: 'คลิปแรก',     target: 1,    current: 0, unit: 'คลิป', icon: '🎬' },
  { label: 'รายได้แรก',   target: 100,  current: 0, unit: '฿',   icon: '💰' },
  { label: 'รายได้ ฿1,000', target: 1000, current: 0, unit: '฿', icon: '🚀' },
  { label: 'รายได้ ฿5,000', target: 5000, current: 0, unit: '฿', icon: '👑' },
]

// ── Components ───────────────────────────────────────────

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
      <div style={{ marginBottom: '4px' }}>{icon}</div>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
    </div>
  )
}

// ── Plan Tab (from real monetization plan roadmap) ───────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlanTab({ monPlan, displayName, onCheckIn, coachReply }: { monPlan: any; displayName: string; onCheckIn: () => void; coachReply: string | null }) {
  const [activeWeek, setActiveWeek] = useState(0)

  // Use real roadmap from monetization plan, or show CTA to generate
  const roadmap = monPlan?.roadmap as Array<{
    week: number; theme: string; target_thb: number; actions: string[]
  }> | null

  if (!roadmap || roadmap.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* No plan yet — CTA */}
        <div style={{
          padding: '24px 20px', textAlign: 'center',
          background: 'rgba(123,97,255,0.06)', border: '1px dashed rgba(123,97,255,0.3)',
          borderRadius: RADIUS.card, marginBottom: '16px',
        }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📅</span>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#fff' }}>
            ยังไม่มีแผนรายสัปดาห์
          </p>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
            ไปสร้างแผนหาเงินก่อน แล้ว AI จะสร้าง Roadmap 4 สัปดาห์ให้คุณค่ะ
          </p>
          <a
            href="/starter/plan"
            style={{
              display: 'inline-block', padding: '12px 24px',
              background: 'linear-gradient(135deg, #7B61FF, #22C55E)',
              color: '#fff', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            สร้างแผนหาเงิน →
          </a>
        </div>
      </motion.div>
    )
  }

  const weekColors = ['#22C55E', '#7B61FF', '#FF9F1C', '#3ECFFF']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Coach nudge / reply */}
      {coachReply ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px',
            padding: '14px',
            background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)',
            borderRadius: '14px',
          }}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>💬</span>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#7B61FF' }}>โค้ช MITA+ พูดว่า</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{coachReply}</p>
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCheckIn}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
            padding: '12px 14px', cursor: 'pointer',
            background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.2)',
            borderRadius: '14px', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '24px', flexShrink: 0 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#FF9F1C' }}>โค้ช MITA+ รอฟังผลงานคุณอยู่</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>กดเช็คอิน → รับ feedback ทันทีค่ะ</p>
          </div>
          <ChevronRight size={14} style={{ color: '#FF9F1C', flexShrink: 0 }} />
        </motion.button>
      )}

      {/* Week cards */}
      {roadmap.map((week, i) => {
        const color = weekColors[i] ?? '#7B61FF'
        const isActive = activeWeek === i
        return (
          <div key={week.week}>
            <motion.button
              onClick={() => setActiveWeek(isActive ? -1 : i)}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', textAlign: 'left', background: 'transparent',
                border: 'none', cursor: 'pointer', padding: 0, marginBottom: '8px',
              }}
            >
              <div style={{
                ...CARD.base,
                border: isActive ? `1px solid ${color}` : CARD.base.border,
                boxShadow: isActive ? `0 0 20px ${color}30` : 'none',
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: `${color}20`, border: `1.5px solid ${isActive ? color : color + '50'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 900, color,
                  }}>
                    {week.week}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>สัปดาห์ {week.week}</span>
                      <span style={{ fontSize: '10px', color, background: `${color}15`, padding: '1px 8px', borderRadius: '99px' }}>
                        {week.theme}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {week.actions.length} งานที่ต้องทำ
                    </span>
                  </div>
                  {week.target_thb > 0 && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#22C55E' }}>฿{fmt(week.target_thb)}</p>
                      <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>เป้า</p>
                    </div>
                  )}
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>
            </motion.button>

            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ ...CARD.base, padding: '16px', marginBottom: '10px' }}
              >
                <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  สิ่งที่ต้องทำสัปดาห์นี้
                </p>
                {week.actions.map((action, ai) => (
                  <ActionItem key={ai} text={action} color={color} isLast={ai === week.actions.length - 1} />
                ))}
                {week.week === 1 && !coachReply && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onCheckIn}
                    style={{
                      width: '100%', marginTop: '14px', padding: '12px',
                      background: `${color}15`, border: `1px solid ${color}40`,
                      borderRadius: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    <Bell size={14} style={{ color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color }}>
                      แจ้งผลงานให้โค้ช → รับ feedback ทันที
                    </span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        )
      })}

      {/* Content tip from plan */}
      {monPlan?.content_tip && (
        <div style={{
          marginTop: '8px', padding: '14px',
          background: 'rgba(62,207,255,0.06)', border: '1px solid rgba(62,207,255,0.2)',
          borderRadius: RADIUS.card,
        }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#3ECFFF' }}>💡 เคล็ดลับโพสต์</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
            {monPlan.content_tip}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function ActionItem({ text, color, isLast }: { text: string; color: string; isLast: boolean }) {
  const [done, setDone] = useState(false)
  return (
    <motion.button
      onClick={() => setDone(!done)}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0',
        borderBottom: !isLast ? '1px solid rgba(255,255,255,0.04)' : 'none',
        textAlign: 'left',
      }}
    >
      {done
        ? <CheckCircle2 size={20} style={{ color, flexShrink: 0 }} />
        : <Circle size={20} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
      }
      <span style={{
        fontSize: '13px', color: done ? 'rgba(255,255,255,0.4)' : '#fff',
        textDecoration: done ? 'line-through' : 'none',
        fontWeight: done ? 400 : 600, transition: 'all 0.2s',
      }}>
        {text}
      </span>
    </motion.button>
  )
}

// ── Products Tab ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProductsTab({ affiliateData, userId, niche, onRefresh }: { affiliateData: any; userId: string | null; niche: string; platform: string; onRefresh: () => void }) {
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const generate = async () => {
    if (!userId) return
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/affiliate/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `API error ${res.status}`)
      }
      await onRefresh()
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด ลองใหม่อีกครั้งค่ะ')
    } finally {
      setGenerating(false)
    }
  }

  // Involve Asia product shape
  const products = affiliateData?.products as Array<{
    id: string; name: string; brand: string; image_url: string;
    price: number; commission_rate: number; commission_thb: number;
    product_url: string; merchant_name: string; platform: string;
    category_th: string; why_fits: string; content_idea: string; rank: number;
  }> | null

  const isRealData = affiliateData?.data_source === 'involve_asia'

  if (!products || products.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{
          padding: '28px 20px', textAlign: 'center',
          background: 'rgba(123,97,255,0.06)', border: '1px dashed rgba(123,97,255,0.3)',
          borderRadius: RADIUS.card, marginBottom: '16px',
        }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🛍️</span>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#fff' }}>
            ยังไม่มีสินค้าแนะนำ
          </p>
          <p style={{ margin: '0 0 18px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
            AI จะวิเคราะห์ช่องของคุณแล้วเลือกสินค้าที่ควรโปรโมต<br />พร้อม link และรายได้ต่อชิ้นค่ะ
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={generate}
            disabled={generating || !userId}
            style={{
              padding: '13px 28px',
              background: generating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #7B61FF, #22C55E)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
            }}
          >
            {generating
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> AI กำลังวิเคราะห์...</>
              : <>✨ ให้ AI เลือกสินค้าให้</>
            }
          </motion.button>
          {genError && (
            <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#FF6B6B', textAlign: 'center', lineHeight: 1.5 }}>
              ⚠️ {genError}
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  const earnPerMonth = affiliateData.total_monthly_min ?? 0
  const earnMax = affiliateData.total_monthly_max ?? 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Summary banner */}
      <div style={{
        padding: '14px 16px', marginBottom: '14px',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(123,97,255,0.08))',
        border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            AI คัด {products.length} สินค้า · แนวช่อง: {niche}
            {isRealData && <span style={{ marginLeft: 6, color: '#22C55E', fontWeight: 700 }}>● สินค้าจริง</span>}
          </p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#22C55E' }}>
            ฿{fmt(earnPerMonth)} – ฿{fmt(earnMax)}/เดือน
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={generate}
          disabled={generating}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 12px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <RefreshCw size={11} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
          รีเฟรช
        </motion.button>
      </div>

      {affiliateData.tip && (
        <div style={{
          padding: '10px 14px', marginBottom: '14px',
          background: 'rgba(255,159,28,0.07)', border: '1px solid rgba(255,159,28,0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            <span style={{ color: '#FF9F1C', fontWeight: 700 }}>💡 เคล็ดลับ: </span>
            {affiliateData.tip}
          </p>
        </div>
      )}

      {/* Product cards */}
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{ ...CARD.base, padding: '14px', marginBottom: '8px' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Rank badge + product image */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden',
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  : <span style={{ fontSize: '22px' }}>🛍️</span>
                }
              </div>
              <span style={{
                position: 'absolute', top: -5, left: -5,
                width: '18px', height: '18px', borderRadius: '99px',
                background: '#7B61FF', fontSize: '10px', fontWeight: 900, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {p.rank}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name + platform badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '13px', lineHeight: 1.3 }}>{p.name}</p>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '99px', flexShrink: 0 }}>
                  {p.merchant_name || p.platform}
                </span>
              </div>

              {/* Price + commission */}
              <p style={{ margin: '0 0 5px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                ฿{p.price.toLocaleString('th-TH')}
                <span style={{ marginLeft: 6, color: '#22C55E', fontWeight: 700 }}>
                  · ได้ ฿{p.commission_thb}/ชิ้น ({p.commission_rate}%)
                </span>
              </p>

              {/* Why fits */}
              {p.why_fits && (
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  🎯 {p.why_fits}
                </p>
              )}

              {/* Content idea */}
              {p.content_idea && (
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(123,97,255,0.8)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  💡 {p.content_idea}
                </p>
              )}
            </div>
          </div>

          {/* CTA: ดูสินค้า */}
          {p.product_url && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => window.open(p.product_url, '_blank', 'noopener,noreferrer')}
              style={{
                width: '100%', marginTop: '12px', padding: '10px',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: '#22C55E', fontSize: '12px', fontWeight: 700,
              }}
            >
              ดูสินค้า → {p.merchant_name || p.platform}
            </motion.button>
          )}
        </motion.div>
      ))}

      {/* Shopee Affiliate guide */}
      <div style={{
        marginTop: '12px', padding: '14px',
        background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.2)',
        borderRadius: RADIUS.card,
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#FF9F1C' }}>
          💰 รับ commission โดยตรงจาก Shopee
        </p>
        <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          สมัคร Shopee Affiliate → สร้าง tracking link ของตัวเอง → เงินเข้าบัญชีคุณตรงๆ ไม่ผ่านใคร
        </p>
        <a
          href="https://affiliate.shopee.co.th"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'block', textAlign: 'center', padding: '9px',
            background: '#FF9F1C', color: '#fff', borderRadius: '9px',
            fontSize: '12px', fontWeight: 700, textDecoration: 'none',
          }}
        >
          สมัคร Shopee Affiliate →
        </a>
      </div>

      <div style={{
        marginTop: '8px', padding: '12px 14px',
        background: 'rgba(123,97,255,0.05)', border: '1px solid rgba(123,97,255,0.12)',
        borderRadius: RADIUS.card, textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          🔄 MITA+ อัพเดทสินค้าให้อัตโนมัติทุกสัปดาห์ตามแนวช่องของคุณค่ะ
        </p>
      </div>
    </motion.div>
  )
}

// ── Milestones Tab ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MilestonesTab({ monPlan, currentEarned, displayName, targetIncome }: { monPlan: any; currentEarned: number; displayName: string; targetIncome: number }) {
  const quickWins = monPlan?.quick_wins as string[] | null

  const milestones = [
    { label: 'สร้างแผนหาเงิน', target: 1, current: monPlan ? 1 : 0, unit: 'แผน', icon: '📋', done: !!monPlan },
    { label: 'รายได้แรก', target: 100, current: currentEarned, unit: '฿', icon: '💰', done: currentEarned >= 100 },
    { label: `รายได้ ฿${fmt(Math.round(targetIncome * 0.2))}`, target: Math.round(targetIncome * 0.2), current: currentEarned, unit: '฿', icon: '🚀', done: currentEarned >= targetIncome * 0.2 },
    { label: `รายได้ ฿${fmt(targetIncome)}`, target: targetIncome, current: currentEarned, unit: '฿', icon: '👑', done: currentEarned >= targetIncome },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
        ปลดล็อกเป้าหมายทีละขั้น — ทำได้ทุกอันแน่นอนค่ะ
      </p>

      {milestones.map((m, i) => {
        const pct = Math.min((m.current / m.target) * 100, 100)
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              ...CARD.base,
              padding: '16px', marginBottom: '10px',
              background: m.done ? 'rgba(34,197,94,0.06)' : CARD.base.background,
              border: m.done ? '1px solid rgba(34,197,94,0.2)' : CARD.base.border,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: m.done ? '0' : '10px' }}>
              <span style={{ fontSize: '28px', filter: m.done ? 'none' : 'grayscale(80%)' }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: m.done ? '#22C55E' : '#fff' }}>
                    {m.label}
                  </p>
                  {m.done && (
                    <span style={{ fontSize: '10px', color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '1px 8px', borderRadius: '99px', fontWeight: 700 }}>
                      ✓ ทำแล้ว!
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                  {m.current.toLocaleString('th-TH')} / {m.target.toLocaleString('th-TH')} {m.unit}
                </p>
              </div>
            </div>
            {!m.done && (
              <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  style={{ height: '100%', borderRadius: '99px', background: '#7B61FF' }}
                />
              </div>
            )}
          </motion.div>
        )
      })}

      {/* Quick wins from plan */}
      {quickWins && quickWins.length > 0 && (
        <div style={{
          marginTop: '8px', padding: '16px',
          background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.2)',
          borderRadius: RADIUS.card,
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#FF9F1C' }}>
            ⚡ Quick Wins — ทำได้ใน 7 วัน
          </p>
          {quickWins.map((qw, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              paddingBottom: i < quickWins.length - 1 ? '10px' : 0,
              borderBottom: i < quickWins.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              marginBottom: i < quickWins.length - 1 ? '10px' : 0,
            }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '99px', flexShrink: 0,
                background: 'rgba(255,159,28,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#FF9F1C',
              }}>
                {i + 1}
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{qw}</p>
            </div>
          ))}
        </div>
      )}

      {/* Motivation box */}
      <div style={{
        marginTop: '10px', padding: '16px',
        background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)',
        borderRadius: RADIUS.card,
      }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#7B61FF' }}>
          💌 จาก MITA+
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
          {monPlan?.audience_insight
            ? monPlan.audience_insight
            : `${displayName} เริ่มได้เลยนะคะ ทุก creator ที่ประสบความสำเร็จก็เริ่มจากศูนย์เหมือนกันค่ะ 🎯`
          }
        </p>
      </div>
    </motion.div>
  )
}

// ── Content Example Tab (YouTube + Claude Script) ────────
interface ContentExampleData {
  videos: Array<{ id: string; title: string; thumbnail: string; channelTitle: string; url: string }>
  script: { hook: string; middle: string[]; cta: string; product_tip: string; best_time: string; why: string }
  niche: string
  platform: string
  generated_at: string
  cached?: boolean
}

function ContentExampleTab({ userId, cachedData, niche }: { userId: string | null; cachedData: ContentExampleData | null; niche: string }) {
  const [data, setData] = useState<ContentExampleData | null>(cachedData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/content/example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'เกิดข้อผิดพลาด')
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  // โหลดครั้งแรกถ้าไม่มี cache
  useEffect(() => {
    if (!data && userId) generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
        <Loader2 size={28} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          AI กำลังหาคลิปตัวอย่างและเขียน script...
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
        <motion.button whileTap={{ scale: 0.97 }} onClick={generate}
          style={{ padding: '10px 24px', background: '#7B61FF', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          ลองใหม่
        </motion.button>
      </motion.div>
    )
  }

  if (!data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#fff' }}>
          คลิปตัวอย่างสัปดาห์นี้
        </p>
        <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          AI จะหาคลิป viral ในแนวช่องของคุณ<br/>แล้วเขียน script พร้อมถ่ายให้เลยค่ะ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
          {['🔍 ค้นหาคลิปดังในแนวช่องของคุณ', '✍️ AI เขียน Hook + Script + CTA', '⏰ บอกเวลาที่ควรโพสต์', '🛍️ แนะนำสินค้าที่โปรโมตในคลิป'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px' }}>{t}</span>
            </div>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={generate}
          disabled={!userId}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '12px', cursor: userId ? 'pointer' : 'not-allowed',
            background: userId ? 'linear-gradient(135deg, #7B61FF, #3ECFFF)' : 'rgba(255,255,255,0.06)',
            color: userId ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 800,
          }}
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
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            แนวช่อง: {niche} · อัพเดตทุก 7 วัน
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={generate}
          style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', cursor: 'pointer' }}>
          <RefreshCw size={11} style={{ marginRight: '4px', display: 'inline' }} />
          รีเฟรช
        </motion.button>
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
            style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              padding: '10px', borderRadius: '12px', textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Thumbnail */}
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
            {/* Info */}
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
        <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 800, color: '#7B61FF' }}>
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
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#3ECFFF', textTransform: 'uppercase' }}>เนื้อหากลาง</span>
          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.script.middle.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(62,207,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#3ECFFF' }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#22C55E', textTransform: 'uppercase' }}>CTA ท้ายคลิป</span>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#22C55E', lineHeight: 1.6 }}>
            {data.script.cta}
          </p>
        </div>

        {/* Product tip */}
        {data.script.product_tip && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF9F1C', textTransform: 'uppercase' }}>สินค้าที่โปรโมตในคลิป</span>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              {data.script.product_tip}
            </p>
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
        <div style={{ padding: '12px 14px', background: 'rgba(62,207,255,0.04)', border: '1px solid rgba(62,207,255,0.12)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#3ECFFF' }}>💡 ทำไม script นี้ถึง work</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{data.script.why}</p>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────
export default function StarterPage() {
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'no_auth' | 'no_plan' | 'ok'>('loading')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tab, setTab] = useState<'plan' | 'products' | 'milestones' | 'clips'>('plan')
  const [activePlatformKey, setActivePlatformKey] = useState<string>('tiktok')
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [coachReply, setCoachReply] = useState<string | null>(null)
  const [lineConnected, setLineConnected] = useState(false)
  const [showLineSetup, setShowLineSetup] = useState(false)
  const [lineToken, setLineToken] = useState('')
  const [lineLoading, setLineLoading] = useState(false)

  const supabase = getSupabaseClient()

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single()
    if (!data) { setAuthState('no_plan'); return }
    const p = data as UserProfile
    setProfile(p)
    setAuthState(p.plan === 'starter' || p.plan === 'pro' ? 'ok' : 'no_plan')
  }, [supabase])

  useEffect(() => {
    if (!supabase) { setAuthState('ok'); return }

    const checkProfile = async (userId: string) => {
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('user_profiles').upsert(
        {
          id: userId,
          email: userData.user?.email,
          name: userData.user?.user_metadata?.full_name
            ?? userData.user?.user_metadata?.name
            ?? userData.user?.email?.split('@')[0],
          plan: 'none',
        } as never,
        { onConflict: 'id', ignoreDuplicates: true }
      )
      await loadProfile(userId)
    }

    let sub: { unsubscribe: () => void } | null = null
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { await checkProfile(session.user.id); return }
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
        if (sess?.user) { sub?.unsubscribe(); await checkProfile(sess.user.id) }
        else if (event === 'INITIAL_SESSION') setAuthState('no_auth')
      })
      sub = subscription
    }
    init()
    return () => sub?.unsubscribe()
  }, [supabase, loadProfile])

  // ── Loading ──────────────────────────────────────────
  if (authState === 'loading') {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (authState === 'no_auth') {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</span>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>เข้าสู่ระบบก่อนนะคะ</h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.7 }}>
          ต้อง login ก่อนเพื่อเข้าดูแผนของคุณค่ะ
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/login?redirect=/starter')}
          style={{ padding: '14px 32px', background: '#7B61FF', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
        >
          เข้าสู่ระบบ →
        </motion.button>
      </div>
    )
  }

  if (authState === 'no_plan') {
    router.replace('/pricing')
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  // ── Real data ────────────────────────────────────────
  const displayName = profile?.name ?? profile?.email?.split('@')[0] ?? MOCK_CREATOR.name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audit = profile?.audit_data as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monPlan = profile?.monetization_plan as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const affiliateData = profile?.affiliate_products as any

  const liveCreator = {
    name: displayName,
    platform: audit?.input?.platform ?? MOCK_CREATOR.platform,
    followers: audit?.input?.followers ?? MOCK_CREATOR.followers,
    targetIncome: Math.round(audit?.revenueEstimation?.realistic ?? monPlan?.total_potential_max ?? MOCK_CREATOR.targetIncome),
    currentEarned: Math.round(audit?.revenueEstimation?.currentIncome ?? 0),
    streak: MOCK_CREATOR.streak,
    weekNo: MOCK_CREATOR.weekNo,
  }

  const progressPct = liveCreator.targetIncome > 0
    ? Math.min((liveCreator.currentEarned / liveCreator.targetIncome) * 100, 100)
    : 0

  // ── Channel Data ─────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawChannelData = profile?.channel_data as any
  const channelData: Record<string, any> = (() => {
    if (!rawChannelData) return {}
    if (rawChannelData.platform && rawChannelData.overview && !rawChannelData.tiktok) {
      return { [rawChannelData.platform]: rawChannelData }
    }
    return rawChannelData
  })()

  const PLATFORM_META: Record<string, { name: string; icon: string; color: string }> = {
    tiktok:    { name: 'TikTok',    icon: '🎵', color: '#FF2D55' },
    youtube:   { name: 'YouTube',   icon: '▶️', color: '#FF0000' },
    instagram: { name: 'Instagram', icon: '📸', color: '#E1306C' },
    facebook:  { name: 'Facebook',  icon: '👤', color: '#1877F2' },
    x:         { name: 'X',         icon: '✖️', color: '#888888' },
    lemon8:    { name: 'Lemon8',    icon: '🍋', color: '#FFD600' },
  }

  const connectedPlatforms = Object.keys(channelData).filter(k => channelData[k]?.overview || channelData[k]?.followers)
  const hasChannel = connectedPlatforms.length > 0

  const connectLine = async () => {
    if (!lineToken.trim()) return
    setLineLoading(true)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkin', lineToken,
          name: displayName, weekNo: liveCreator.weekNo,
        }),
      })
      const json = await res.json()
      if (json.success) { setLineConnected(true); setShowLineSetup(false) }
    } finally { setLineLoading(false) }
  }

  const refreshProfile = async () => {
    const { data: { session } } = await supabase!.auth.getSession()
    if (session?.user) await loadProfile(session.user.id)
  }

  const niche = audit?.input?.niche ?? 'general'
  const userId = profile?.id ?? null

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>

      {/* ── NAV ─────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${COLORS.bg}f0`, backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo + plan badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="gradient-purple-blue font-black text-lg">MITA+</span>
          <span style={{ fontSize: '10px', color: '#7B61FF', background: 'rgba(123,97,255,0.12)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
            Starter
          </span>
        </div>

        {/* Right side: streak + support */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Streak pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,159,28,0.10)', border: '1px solid rgba(255,159,28,0.22)',
            borderRadius: '99px', padding: '4px 10px',
          }}>
            <Flame size={12} style={{ color: '#FF9F1C' }} />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FF9F1C' }}>{liveCreator.streak}</span>
          </div>

          {/* LINE Admin */}
          <a
            href="https://lin.ee/WHWLZ7W"
            target="_blank" rel="noopener noreferrer"
            title="ติดต่อแอดมิน"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              background: 'rgba(6,199,85,0.10)', border: '1px solid rgba(6,199,85,0.22)',
              borderRadius: '99px', textDecoration: 'none', flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#06C755">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.085.922.26 1.057.597.12.303.079.771.038 1.087l-.164 1.026c-.045.303-.24 1.192 1.049.649 1.291-.542 6.916-4.073 9.436-6.972C23.176 14.393 24 12.458 24 10.304zm-17.548 2.572h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .627.285.627.63v3.511h1.756c.348 0 .629.283.629.63 0 .344-.281.627-.629.627zm2.115-.629c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.139zm4.943 0c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.139zm3.856-2.772c.349 0 .63.283.63.63 0 .344-.281.629-.63.629H16.11v1.127h1.756c.349 0 .63.283.63.63 0 .344-.281.627-.63.627h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H16.11v1.127h1.756z"/>
            </svg>
          </a>

          {/* Logout icon */}
          <button
            onClick={async () => {
              if (supabase) await supabase.auth.signOut()
              router.replace('/login')
            }}
            title="ออกจากระบบ"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '99px', cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ── HEADER ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 3px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
            สวัสดี {displayName} 👋 · สัปดาห์ที่ {liveCreator.weekNo}
          </p>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
            {audit ? (monPlan ? monPlan.headline ?? 'แผนหาเงินของคุณพร้อมแล้ว' : 'เริ่มสร้างรายได้จากช่องของคุณ') : 'ยินดีต้อนรับสู่ MITA+! 🎉'}
          </h1>
        </motion.div>

        {/* ── REVENUE HERO CARD ───────────────────── */}
        {audit ? (
          /* ── มี audit: แสดง revenue progress จริง ── */
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '20px 18px 18px', marginBottom: '12px',
              background: 'linear-gradient(135deg, rgba(123,97,255,0.15) 0%, rgba(34,197,94,0.07) 100%)',
              border: '1px solid rgba(123,97,255,0.28)', borderRadius: RADIUS.card,
            }}
          >
            <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>รายได้เดือนนี้</p>
                <p style={{ margin: 0, fontSize: '38px', fontWeight: 900, color: '#22C55E', lineHeight: 1, letterSpacing: '-0.02em' }}>฿{fmt(liveCreator.currentEarned)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>เป้า/เดือน</p>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.55)' }}>฿{fmt(liveCreator.targetIncome)}</p>
                {monPlan && <span style={{ fontSize: '10px', color: '#7B61FF', background: 'rgba(123,97,255,0.12)', padding: '1px 8px', borderRadius: '99px', fontWeight: 700 }}>สูงสุด ฿{fmt(monPlan.total_potential_max)}/เดือน</span>}
              </div>
            </div>
            <div style={{ height: '7px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: '8px' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(to right, #7B61FF, #22C55E)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{Math.round(progressPct)}% ของเป้า</p>
              <p style={{ margin: 0, fontSize: '11px', color: liveCreator.currentEarned > 0 ? '#22C55E' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                {liveCreator.currentEarned > 0 ? `ขาดอีก ฿${fmt(liveCreator.targetIncome - liveCreator.currentEarned)}` : 'ยังไม่มีรายได้ — เริ่มเลยค่ะ 🚀'}
              </p>
            </div>
          </motion.div>
        ) : (
          /* ── ไม่มี audit: Hero locked — แสดง potential ── */
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '20px 18px 18px', marginBottom: '12px',
              background: 'linear-gradient(135deg, rgba(123,97,255,0.18) 0%, rgba(255,159,28,0.08) 100%)',
              border: '1px solid rgba(123,97,255,0.35)', borderRadius: RADIUS.card,
            }}
          >
            {/* Glow */}
            <div style={{ position: 'absolute', top: '-20px', right: '-10px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
            {/* Lock badge */}
            <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,159,28,0.15)', border: '1px solid rgba(255,159,28,0.3)', borderRadius: '99px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF9F1C" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF9F1C' }}>รอปลดล็อก</span>
            </div>

            <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ศักยภาพช่องของคุณ</p>
            {/* Blurred potential numbers */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '38px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', filter: 'blur(8px)', userSelect: 'none', color: '#22C55E' }}>฿X,XXX</p>
              <p style={{ margin: '0 0 6px', fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>–</p>
              <p style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, filter: 'blur(8px)', userSelect: 'none', color: 'rgba(255,255,255,0.5)' }}>฿XX,XXX</p>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>/เดือน</p>
            </div>

            {/* Fake progress bar (half-filled, blurred) */}
            <div style={{ height: '7px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ width: '45%', height: '100%', borderRadius: '99px', background: 'linear-gradient(to right, #7B61FF80, #22C55E80)', filter: 'blur(2px)' }} />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/audit')}
              style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
                color: '#fff', fontSize: '14px', fontWeight: 800, letterSpacing: '0.01em',
              }}
            >
              ✨ ทำ Audit เพื่อดูตัวเลขจริงของคุณ
            </motion.button>
          </motion.div>
        )}

        {/* ── ONBOARDING CHECKLIST (เฉพาะเมื่อไม่มี audit) ── */}
        {!audit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            style={{
              padding: '16px', marginBottom: '16px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: RADIUS.card,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#fff' }}>🔓 ปลดล็อก 2 ขั้นตอน</p>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '99px' }}>0/2</span>
            </div>

            {/* Step 1 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/audit')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', marginBottom: '8px',
                background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(62,207,255,0.06))',
                border: '1px solid rgba(123,97,255,0.3)', borderRadius: '12px', cursor: 'pointer',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'rgba(123,97,255,0.15)', border: '1.5px solid rgba(123,97,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📋</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 800, color: '#fff' }}>ทำ Audit (2 นาที)</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>unlock แผนหาเงิน 4 สัปดาห์ + Script คลิป AI</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>เริ่ม →</div>
            </motion.button>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', opacity: 0.6 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'rgba(34,197,94,0.10)', border: '1.5px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📊</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>เชื่อม Social Media</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>unlock สินค้า AI คัด + Analytics จริง</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
          </motion.div>
        )}

        {/* ── STATS ROW (เฉพาะเมื่อมี audit) ────────── */}
        {audit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}
          >
            <StatPill icon={<Target size={13} style={{ color: '#7B61FF' }} />} label="แหล่งรายได้" value={`${monPlan?.revenue_streams?.length ?? 0}`} color="#7B61FF" />
            <StatPill icon={<TrendingUp size={13} style={{ color: '#22C55E' }} />} label="สินค้า AI คัด" value={`${affiliateData?.products?.length ?? 0}`} color="#22C55E" />
            <StatPill icon={<Star size={13} style={{ color: '#FF9F1C' }} />} label="Platforms" value={`${connectedPlatforms.length}/6`} color="#FF9F1C" />
          </motion.div>
        )}

        {/* ── AI PERSONALIZATION SCORE (แสดงเมื่อทำ audit แต่ยังไม่เชื่อม social) ── */}
        {audit && !hasChannel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
            style={{
              marginBottom: '14px', borderRadius: '16px', overflow: 'hidden',
              border: '1.5px solid rgba(255,159,28,0.45)',
              background: 'linear-gradient(135deg, rgba(255,159,28,0.08), rgba(255,80,80,0.06))',
            }}
          >
            {/* Header */}
            <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '22px' }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 900, color: '#FF9F1C' }}>
                  AI รู้จักช่องคุณแค่ 30%
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  สินค้าที่แนะนำอาจไม่ตรงช่องของคุณถึง 70%
                </p>
              </div>
              <div style={{
                background: 'rgba(255,159,28,0.15)', border: '1px solid rgba(255,159,28,0.3)',
                borderRadius: '10px', padding: '6px 10px', textAlign: 'center', flexShrink: 0,
              }}>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#FF9F1C', lineHeight: 1 }}>30%</p>
                <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,159,28,0.7)' }}>แม่นยำ</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ padding: '0 16px 10px' }}>
              <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ duration: 1, delay: 0.4 }}
                  style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #FF9F1C, #FF6B6B)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,159,28,0.7)' }}>ตอนนี้: 30% (Audit อย่างเดียว)</span>
                <span style={{ fontSize: '10px', color: 'rgba(34,197,94,0.8)', fontWeight: 700 }}>หลังเชื่อม: 85% 🎯</span>
              </div>
            </div>

            {/* What's missing */}
            <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                AI ยังไม่รู้จักช่องคุณใน 5 เรื่องนี้:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {['👥 Demographics จริง', '📈 Engagement rate', '🎬 Topics ที่ดี', '📍 ผู้ชมอยู่ที่ไหน', '⏰ เวลาที่ active'].map(item => (
                  <span key={item} style={{ fontSize: '10px', background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '99px', padding: '3px 8px', color: 'rgba(255,255,255,0.5)' }}>
                    {item}
                  </span>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/starter/connect')}
                style={{
                  width: '100%', padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FF9F1C, #22C55E)',
                  color: '#fff', fontSize: '13px', fontWeight: 800,
                }}
              >
                🔗 เชื่อม Social → เพิ่มความแม่นยำเป็น 85%
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── FEATURE #2: แผนหาเงิน CTA ──────────── */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/starter/plan')}
          style={{
            width: '100%', marginBottom: '14px', padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(123,97,255,0.15), rgba(34,197,94,0.08))',
            border: '1px solid rgba(123,97,255,0.30)',
            borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}
        >
          <span style={{ fontSize: '26px', flexShrink: 0 }}>💰</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 900, color: '#a78bfa' }}>
              {monPlan ? 'ดูแผนหาเงินของคุณ' : 'สร้างแผนหาเงินส่วนตัว'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              {monPlan
                ? `${monPlan.primary_strategy} · ฿${fmt(monPlan.total_potential_min)}–฿${fmt(monPlan.total_potential_max)}/เดือน`
                : 'AI วิเคราะห์ช่องจริง → บอกว่าทำอะไรก่อนถึงจะได้เงิน'
              }
            </p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #7B61FF, #22C55E)', borderRadius: '10px', padding: '7px 12px', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {monPlan ? 'ดูแผน →' : 'สร้างเลย →'}
          </div>
        </motion.button>

        {/* ── CHANNEL CONNECT / DATA ──────────────── */}
        {!hasChannel ? (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/starter/connect')}
            style={{
              width: '100%', marginBottom: '16px', padding: '16px',
              background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(62,207,255,0.08))',
              border: '1px solid rgba(123,97,255,0.35)',
              borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            <span style={{ fontSize: '28px', flexShrink: 0 }}>🤖</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 900, color: '#a78bfa' }}>
                เชื่อมช่อง Social Media ของคุณ
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                TikTok · YouTube · Instagram · Facebook · X · Lemon8
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
              borderRadius: '10px', padding: '8px 14px',
              fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              เริ่มเลย →
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ marginBottom: '16px' }}
          >
            {/* Platform tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: 2 }}>
              {connectedPlatforms.map(pid => {
                const meta = PLATFORM_META[pid] ?? { name: pid, icon: '📊', color: '#7B61FF' }
                const isActive = (activePlatformKey === pid) || (connectedPlatforms.length === 1)
                return (
                  <button
                    key={pid}
                    onClick={() => setActivePlatformKey(pid)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                      padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
                      background: isActive ? `${meta.color}22` : 'rgba(255,255,255,0.05)',
                      outline: isActive ? `1.5px solid ${meta.color}60` : '1.5px solid transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                    }}
                  >
                    <span>{meta.icon}</span> {meta.name}
                  </button>
                )
              })}
              <button
                onClick={() => router.push('/starter/connect')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  padding: '6px 10px', borderRadius: 99, border: '1px dashed rgba(255,255,255,0.15)',
                  background: 'transparent', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600,
                }}
              >
                + เพิ่ม
              </button>
            </div>

            {/* Data card */}
            {(() => {
              const pid = connectedPlatforms.length === 1 ? connectedPlatforms[0] : activePlatformKey
              const pd = channelData[pid] ?? {}
              const meta = PLATFORM_META[pid] ?? { name: pid, icon: '📊', color: '#7B61FF' }
              const ov = pd.overview ?? {}
              const aud = pd.audience ?? {}
              const followers = ov.followers ?? ov.subscribers ?? null
              const primaryViews = ov.views_28d ?? ov.impressions_28d ?? ov.accounts_reached_30d ?? null
              const viewsLabel = pid === 'youtube' ? 'Views 28 วัน' : pid === 'x' ? 'Impressions 28 วัน' : pid === 'instagram' ? 'Reached 30 วัน' : 'Views 28 วัน'

              const fmtNum = (n: number | null) => {
                if (n == null) return '—'
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
                return n.toLocaleString('th-TH')
              }

              const topAge = (() => {
                const ages = [
                  { key: 'age_13_17_pct', label: '13-17' }, { key: 'age_18_24_pct', label: '18-24' },
                  { key: 'age_25_34_pct', label: '25-34' }, { key: 'age_35_44_pct', label: '35-44' },
                  { key: 'age_45_plus_pct', label: '45+' },
                ]
                let top = ages[0]
                for (const ag of ages) if ((aud[ag.key] ?? 0) > (aud[top.key] ?? 0)) top = ag
                return aud[top.key] ? `${top.label} ปี` : '—'
              })()

              return (
                <div style={{ padding: '14px', borderRadius: '14px', background: `${meta.color}10`, border: `1px solid ${meta.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{meta.icon}</span>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#fff' }}>{meta.name} Analytics</p>
                      {pd.analyzed_at && (
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 99 }}>
                          {new Date(pd.analyzed_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => router.push('/starter/connect')}
                      style={{ background: 'none', border: `1px solid ${meta.color}40`, borderRadius: '7px', padding: '3px 9px', fontSize: '10px', fontWeight: 700, color: `${meta.color}cc`, cursor: 'pointer' }}
                    >
                      อัปเดต
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {[
                      { label: pid === 'youtube' ? 'Subscribers' : 'Followers', value: fmtNum(followers), color: meta.color },
                      { label: viewsLabel, value: fmtNum(primaryViews), color: '#3ECFFF' },
                      { label: 'ผู้ชมหลัก', value: aud.gender_female_pct != null ? (aud.gender_female_pct >= 50 ? `หญิง ${aud.gender_female_pct}%` : `ชาย ${aud.gender_male_pct}%`) : '—', color: '#FF9F1C' },
                      { label: 'ช่วงอายุหลัก', value: topAge, color: '#22C55E' },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {aud.peak_hours?.length > 0 && (
                    <div style={{ padding: '7px 10px', background: 'rgba(62,207,255,0.07)', borderRadius: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      ⏰ ออนไลน์มากสุดช่วง{' '}
                      <span style={{ color: '#3ECFFF', fontWeight: 700 }}>{aud.peak_hours.slice(0, 2).join(', ')} น.</span>
                      {aud.peak_days?.length > 0 && <> · <span style={{ color: '#a78bfa', fontWeight: 700 }}>{aud.peak_days.slice(0, 2).join(', ')}</span></>}
                    </div>
                  )}
                  {pd.content?.best_format && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                      🏆 Format ที่ดีที่สุด: <span style={{ color: '#fff', fontWeight: 700 }}>{pd.content.best_format}</span>
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>
        )}

        {/* ── LINE NOTIFICATION BANNER ─────────────── */}
        {!lineConnected && !showLineSetup && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLineSetup(true)}
            style={{
              width: '100%', marginBottom: '16px', padding: '12px 14px',
              background: 'rgba(6,199,85,0.08)', border: '1px solid rgba(6,199,85,0.25)',
              borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>💬</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#06C755' }}>เชื่อม LINE รับแจ้งเตือนทุกสัปดาห์</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>โค้ชจะ ping ตรง LINE ของคุณเลยค่ะ — กันลืม</p>
            </div>
            <ChevronRight size={14} style={{ color: '#06C755', flexShrink: 0 }} />
          </motion.button>
        )}

        {lineConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(6,199,85,0.06)', border: '1px solid rgba(6,199,85,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span style={{ fontSize: '22px' }}>✅</span>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#06C755' }}>เชื่อม LINE แล้วค่ะ!</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>โค้ชจะแจ้งเตือนทุกอาทิตย์ผ่าน LINE ค่ะ</p>
            </div>
          </motion.div>
        )}

        {showLineSetup && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '16px', padding: '16px', background: 'rgba(6,199,85,0.06)', border: '1px solid rgba(6,199,85,0.2)', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#06C755' }}>💬 เชื่อม LINE Notify</p>
              <button onClick={() => setShowLineSetup(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
            {[
              { n: '1', text: 'ไปที่ notify-bot.line.me/th แล้ว Login' },
              { n: '2', text: 'กด "Generate token" → ตั้งชื่อว่า "MITA+"' },
              { n: '3', text: 'Copy token มาวางด้านล่างนี้ค่ะ' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '99px', flexShrink: 0, background: 'rgba(6,199,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#06C755' }}>
                  {s.n}
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}
            <a href="https://notify-bot.line.me/th" target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#06C755', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', marginBottom: '12px', marginTop: '4px' }}>
              ไปหน้า LINE Notify →
            </a>
            <input
              value={lineToken}
              onChange={e => setLineToken(e.target.value)}
              placeholder="วาง Token ที่นี่ค่ะ..."
              style={{ width: '100%', padding: '12px 14px', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '13px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={connectLine}
              disabled={!lineToken.trim() || lineLoading}
              style={{ width: '100%', padding: '12px', background: lineToken.trim() ? '#06C755' : 'rgba(255,255,255,0.06)', color: lineToken.trim() ? '#fff' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: lineToken.trim() ? 'pointer' : 'not-allowed' }}
            >
              {lineLoading ? 'กำลังทดสอบ...' : 'ยืนยัน + รับแจ้งเตือนทันที'}
            </motion.button>
          </motion.div>
        )}

        {/* ── SECTION TITLE ────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#fff' }}>
            {tab === 'plan' && '📅 แผนประจำสัปดาห์'}
            {tab === 'products' && '🛍️ สินค้า Affiliate ที่ AI เลือก'}
            {tab === 'clips' && '🎬 คลิปตัวอย่าง + Script'}
            {tab === 'milestones' && '🏆 เป้าหมายของคุณ'}
          </p>
        </div>

        {/* ── TAB CONTENT ─────────────────────────── */}
        {tab === 'plan' && (
          <PlanTab
            monPlan={monPlan}
            displayName={displayName}
            onCheckIn={() => setCheckInOpen(true)}
            coachReply={coachReply}
          />
        )}

        {tab === 'products' && (
          !audit ? (
            /* ── Feature Gate: สินค้า ── */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Blurred preview cards */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', marginBottom: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34,197,94,0.2)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '12px', width: '70%', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', marginBottom: '6px' }} />
                      <div style={{ height: '10px', width: '45%', background: 'rgba(34,197,94,0.2)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ height: '28px', width: '60px', background: 'rgba(34,197,94,0.15)', borderRadius: '8px' }} />
                  </div>
                ))}
                {/* Overlay lock */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: 'linear-gradient(to bottom, transparent 0%, rgba(11,11,15,0.85) 50%)' }}>
                  <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '20px 24px', textAlign: 'center', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 3 }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛍️</div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 900, color: '#fff' }}>สินค้า AI คัด 5 ชิ้น</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#22C55E', fontWeight: 700 }}>Creator แนวนี้ทำ ฿2,400–฿8,000/เดือน</p>
                    <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>ทำ Audit เพื่อให้ AI เลือกสินค้า<br/>ที่ตรงกับช่องของคุณจริงๆ</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/audit')} style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #22C55E, #7B61FF)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', position: 'relative', zIndex: 4 }}>
                      ทำ Audit เพื่อ unlock →
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ⚠️ Accuracy warning banner — ถ้ายังไม่เชื่อม social */}
              {!hasChannel && (
                <motion.button
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/starter/connect')}
                  style={{
                    width: '100%', marginBottom: '12px', padding: '11px 14px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'linear-gradient(135deg, rgba(255,159,28,0.12), rgba(255,80,80,0.08))',
                    border: '1.5px solid rgba(255,159,28,0.35)', borderRadius: '12px',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 1px', fontSize: '12px', fontWeight: 800, color: '#FF9F1C' }}>
                      สินค้าเหล่านี้แม่นยำแค่ 30%
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                      เชื่อม Social → AI รู้จักช่องจริง → แม่น 85% ทันที
                    </p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #FF9F1C, #22C55E)', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    เชื่อมเลย →
                  </div>
                </motion.button>
              )}
              <ProductsTab
                affiliateData={affiliateData}
                userId={userId}
                niche={niche}
                platform={liveCreator.platform}
                onRefresh={refreshProfile}
              />
            </>
          )
        )}

        {tab === 'clips' && (
          !audit ? (
            /* ── Feature Gate: คลิป ── */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                {/* Blurred script preview */}
                <div style={{ padding: '16px', background: 'rgba(62,207,255,0.07)', border: '1px solid rgba(62,207,255,0.15)', borderRadius: '14px', filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
                  <div style={{ height: '11px', width: '40%', background: 'rgba(255,159,28,0.3)', borderRadius: '4px', marginBottom: '10px' }} />
                  <div style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', marginBottom: '6px' }} />
                  <div style={{ height: '14px', width: '75%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '14px' }} />
                  <div style={{ height: '11px', width: '30%', background: 'rgba(62,207,255,0.3)', borderRadius: '4px', marginBottom: '8px' }} />
                  {[85, 70, 90].map((w, i) => <div key={i} style={{ height: '11px', width: `${w}%`, background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '5px' }} />)}
                </div>
                {/* Overlay lock */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, transparent 0%, rgba(11,11,15,0.88) 45%)' }}>
                  <div style={{ background: 'rgba(62,207,255,0.10)', border: '1px solid rgba(62,207,255,0.25)', borderRadius: '16px', padding: '20px 24px', textAlign: 'center', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 3 }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 900, color: '#fff' }}>Script คลิปส่วนตัว</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#3ECFFF', fontWeight: 700 }}>Hook + เนื้อหา + CTA ที่ตรงช่องคุณ</p>
                    <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>AI จะเขียน script จากคลิป viral<br/>ในแนวช่องของคุณโดยเฉพาะ</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/audit')} style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #3ECFFF, #7B61FF)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', position: 'relative', zIndex: 4 }}>
                      ทำ Audit เพื่อ unlock →
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <ContentExampleTab
              userId={userId}
              cachedData={profile?.content_example as ContentExampleData | null}
              niche={niche}
            />
          )
        )}

        {tab === 'milestones' && (
          <MilestonesTab
            monPlan={monPlan}
            currentEarned={liveCreator.currentEarned}
            displayName={displayName}
            targetIncome={liveCreator.targetIncome}
          />
        )}
      </div>

      {/* ── BOTTOM NAV ──────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', zIndex: 50,
        background: `${COLORS.bg}f5`, backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {([
          { key: 'plan',       label: 'แผน',   activeColor: '#7B61FF',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#7B61FF' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            ),
          },
          { key: 'products',  label: 'สินค้า',  activeColor: '#22C55E',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#22C55E' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            ),
          },
          { key: 'clips',     label: 'คลิป',   activeColor: '#3ECFFF',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#3ECFFF' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            ),
          },
          { key: 'milestones', label: 'เป้าหมาย', activeColor: '#FF9F1C',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF9F1C' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            ),
          },
        ] as const).map(t => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '3px', padding: '10px 4px 12px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%',
                    height: '2px', borderRadius: '0 0 2px 2px',
                    background: t.activeColor,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <div style={{
                width: '36px', height: '36px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? `${t.activeColor}15` : 'transparent',
                transition: 'background 0.2s',
              }}>
                {t.icon(active)}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: active ? 800 : 500,
                color: active ? t.activeColor : 'rgba(255,255,255,0.3)',
                transition: 'color 0.2s',
              }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* ── CHECK-IN MODAL ───────────────────────── */}
      <CheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onComplete={(msg) => { setCoachReply(msg); setCheckInOpen(false) }}
        weekNo={liveCreator.weekNo}
        creatorName={displayName}
        niche={(audit?.input?.niche ?? 'food') as string}
        platform={(audit?.input?.platform ?? liveCreator.platform).toLowerCase() as string}
        targetIncome={liveCreator.targetIncome}
        userId={userId}
      />
    </div>
  )
}
