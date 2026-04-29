'use client'
// ── P-010-fix1 · Legacy Plan-tab extras ──────────────────────────────────────
// Ported from app/starter/page.legacy.tsx
// Components: IncomeGraph · FirstVisitBanner · QuickWinSection

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import type { CheckinEntry } from '@/types'

// Re-export so existing imports from this file keep working
export type { CheckinEntry }

// ── Income Graph ─────────────────────────────────────────────────────────────
const INCOME_RANGE_COLORS: Record<string, string> = {
  zero: '#FF6B6B', low: '#FF9F1C', mid: '#7B61FF', high: '#22C55E',
}
const INCOME_RANGE_LABELS: Record<string, string> = {
  zero: '฿0', low: '฿1–500', mid: '฿500–2K', high: '฿2K+',
}

export function IncomeGraph({ checkins, weekNo }: { checkins: CheckinEntry[]; weekNo: number }) {
  if (checkins.length === 0) return null
  const maxApprox = 3000
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      style={{ marginBottom: '16px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={14} style={{ color: '#22C55E' }} />
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#fff' }}>รายได้รายสัปดาห์</p>
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>สัปดาห์ที่ {weekNo}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '60px' }}>
        {[1, 2, 3, 4].map(wk => {
          const entry = checkins.find(c => c.week_no === wk)
          const h = entry ? Math.max((entry.income_approx / maxApprox) * 60, 6) : 0
          const color = entry ? (INCOME_RANGE_COLORS[entry.income_range] ?? '#7B61FF') : 'rgba(255,255,255,0.08)'
          const label = entry ? (INCOME_RANGE_LABELS[entry.income_range] ?? '?') : '—'
          const isCurrentWeek = wk === weekNo
          return (
            <div key={wk} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px', color: entry ? color : 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{label}</span>
              <motion.div
                initial={{ height: 0 }} animate={{ height: h > 0 ? h : 4 }}
                transition={{ duration: 0.6, delay: wk * 0.1 }}
                style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: h > 0 ? color : 'rgba(255,255,255,0.05)',
                  opacity: entry ? 1 : 0.4,
                  outline: isCurrentWeek ? `2px solid ${color}` : 'none',
                }}
              />
              <span style={{ fontSize: '9px', color: isCurrentWeek ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: isCurrentWeek ? 700 : 400 }}>W{wk}</span>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
        {Object.entries(INCOME_RANGE_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: INCOME_RANGE_COLORS[key] }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── First Visit Banner ────────────────────────────────────────────────────────
export function FirstVisitBanner({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          position: 'relative', padding: '24px 20px', marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(123,97,255,0.2), rgba(34,197,94,0.1))',
          border: '1px solid rgba(123,97,255,0.4)',
          borderRadius: '20px', textAlign: 'center', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(123,97,255,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '44px', marginBottom: '12px' }}
        >
          💰
        </motion.div>
        <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
          เงินอยู่ในอากาศ
        </p>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          ยินดีต้อนรับ {name} ค่ะ 👋<br />
          MITA+ พร้อมช่วยให้คุณ<br />
          <strong style={{ color: '#a78bfa' }}>จับเงินนั้นให้ได้ค่ะ</strong>
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDismiss}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          เริ่มเลยค่ะ →
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Quick Win Section ─────────────────────────────────────────────────────────
interface QuickWinItem {
  id:        string
  emoji:     string
  label:     string
  action:    string
  ctaText:   string
  ctaUrl?:   string
  copyText?: string
  isLink:    boolean
}

const AFFILIATE_BY_NICHE: Record<string, Array<{ name: string; url: string; commission: string; emoji: string }>> = {
  food:      [{ name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–15%', emoji: '🛒' }, { name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }],
  beauty:    [{ name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–20%', emoji: '🛒' }, { name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }],
  fitness:   [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'Lazada Affiliate', url: 'https://www.lazada.co.th/affiliate/', commission: '3–8%', emoji: '🔵' }],
  fashion:   [{ name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–15%', emoji: '🛒' }, { name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }],
  travel:    [{ name: 'Agoda Affiliate', url: 'https://partners.agoda.com/', commission: '5–6%', emoji: '🏨' }, { name: 'Klook Affiliate', url: 'https://affiliate.klook.com/', commission: '3–5%', emoji: '🎟️' }],
  finance:   [{ name: 'Rabbit Care', url: 'https://www.rabbitcare.com/', commission: 'ตามแพ็กเกจ', emoji: '🐰' }, { name: 'MoneyGuru TH', url: 'https://www.moneyguru.co.th/', commission: 'ตามแพ็กเกจ', emoji: '💸' }],
  tech:      [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'Lazada Affiliate', url: 'https://www.lazada.co.th/affiliate/', commission: '3–8%', emoji: '🔵' }],
  gaming:    [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–15%', emoji: '🛒' }],
  education: [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'Coursera Affiliate', url: 'https://www.coursera.org/about/partners', commission: '10–45%', emoji: '📚' }],
  lifestyle: [{ name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–15%', emoji: '🛒' }, { name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }],
  mom_baby:  [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'Lazada Affiliate', url: 'https://www.lazada.co.th/affiliate/', commission: '3–8%', emoji: '🔵' }],
  cafe:      [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–15%', emoji: '🛒' }],
  business:  [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'Canva Affiliate', url: 'https://www.canva.com/affiliates/', commission: '$36/ครั้ง', emoji: '🎨' }],
  general:   [{ name: 'Shopee Affiliate', url: 'https://affiliate.shopee.co.th/', commission: '3–10%', emoji: '🟠' }, { name: 'TikTok Shop Affiliate', url: 'https://seller.tiktok.com/th/', commission: '5–15%', emoji: '🛒' }],
}

const CAPTION_BY_NICHE: Record<string, string> = {
  food:      `🍳 ทดสอบแล้ว! เมนูนี้ทำง่ายมาก แค่ [เวลา] นาที วัตถุดิบหาได้ใน Shopee ลิงก์ใน bio นะคะ ✨ #อาหาร #ทำอาหาร`,
  beauty:    `✨ เปลี่ยนผิวใน 7 วัน! ครีมตัวนี้ดีเกินคาดจริงๆ ราคาไม่แพง ลิงก์ซื้อใน bio นะคะ 💄 #สกินแคร์ #ความงาม`,
  fitness:   `💪 ท้าใจ! ออกกำลังกาย 15 นาทีต่อวัน ทำมาแล้ว [X] วัน อุปกรณ์ลิงก์ใน bio 🔥 #ออกกำลังกาย`,
  fashion:   `👗 Outfit วันนี้! ชุดนี้ใส่ได้หลายโอกาสมากค่ะ ลิงก์ช็อปใน bio เลย ✨ #แฟชั่น #ootd`,
  travel:    `✈️ [จังหวัด] ครั้งนี้ไม่ผิดหวัง! ที่พักลิงก์จองใน bio ราคาดีกว่านี้ไม่มีแล้วค่ะ 🏖️ #ท่องเที่ยว`,
  finance:   `💰 ทำอะไรให้เงินทำงานแทน? ลองทำแบบนี้มา 3 เดือน ผลลัพธ์ที่ได้คือ... #การเงิน #ออมเงิน`,
  gaming:    `🎮 เล่น [ชื่อเกม] เทคนิคนี้ทำให้เก่งขึ้นเร็วมาก สอนฟรีในคลิป link gear ใน bio 🕹️ #gaming`,
  tech:      `📱 เปรียบเทียบ [A] vs [B] หลังใช้ทั้งคู่มาเดือนกว่า! ราคาและลิงก์ซื้อใน bio ค่ะ 🔧 #tech`,
  education: `📚 [ทักษะ] ที่คนส่วนใหญ่ยังไม่รู้ — สอนฟรีในคลิปนี้เลยค่ะ! คอร์สเรียนต่อลิงก์ใน bio 🎓`,
  lifestyle: `🌿 เปลี่ยน routine แบบนี้ รู้สึกดีขึ้นชัดเจน! ของที่ใช้ทั้งหมดลิงก์ใน bio ✨ #ไลฟ์สไตล์`,
  mom_baby:  `👶 แม่ๆ ต้องดู! [สินค้า/เคล็ดลับ] ช่วยได้มากมายเลยค่ะ ลิงก์สั่งซื้อใน bio 💕 #แม่และเด็ก`,
  cafe:      `☕ คาเฟ่ใหม่ที่มาต้องลอง! บรรยากาศดีมาก พิกัด + ลิงก์จองใน bio 📍 #คาเฟ่ #กาแฟ`,
  business:  `💼 เริ่มธุรกิจด้วยงบน้อย? บทเรียนที่ได้จากการทำ [X] เดือน แชร์ฟรีทั้งหมดในคลิปนี้ค่ะ 🚀`,
  general:   `✨ วันนี้มาแชร์ [หัวข้อ] ที่คิดว่าเป็นประโยชน์กับทุกคน ถ้าชอบกด Like + Follow ด้วยนะคะ 💕`,
}

const FIRST_ACTION_BY_NICHE: Record<string, string> = {
  food:      'ถ่ายรีวิวอาหารหรือเมนูที่ทำวันนี้ แล้วใส่ link Shopee Affiliate ของวัตถุดิบนั้นๆ ใน bio',
  beauty:    'รีวิวผลิตภัณฑ์ที่ใช้อยู่แล้วในบ้าน 1 ชิ้น แล้วใส่ affiliate link ใน bio ก่อนโพสต์',
  fitness:   'ถ่ายคลิปออกกำลังกาย routine วันนี้ แล้วใส่ link อุปกรณ์ที่ใช้จาก Shopee Affiliate ใน bio',
  fashion:   'แต่งชุดที่ชอบที่สุด ถ่ายคลิป OOTD แล้วใส่ link ชุดหรือ accessories จาก Shopee/TikTok Shop ใน bio',
  travel:    'โพสต์รูปหรือคลิปสถานที่ที่เคยไป แล้วใส่ affiliate link ที่พักจาก Agoda/Klook ใน bio',
  finance:   'แชร์ความรู้การเงิน 1 เรื่องที่คนถามบ่อย แล้วใส่ link RabbitCare/MoneyGuru ใน bio',
  gaming:    'สตรีมหรือคลิปเกม แล้วใส่ link อุปกรณ์ gaming จาก Shopee ใน bio',
  tech:      'รีวิว gadget ที่ใช้อยู่แล้ว แล้วใส่ affiliate link ใน bio ก่อนโพสต์',
  education: 'สอนทักษะ 1 เรื่องที่ถนัด 60 วินาที แล้วใส่ link คอร์สเรียน ใน bio',
  lifestyle: 'ถ่าย morning routine หรือ daily vlog แล้วใส่ link สินค้าที่ใช้จาก Shopee ใน bio',
  mom_baby:  'แชร์ tips เลี้ยงลูก 1 เรื่อง แล้วใส่ link สินค้าเด็กจาก Shopee ใน bio',
  cafe:      'ไปคาเฟ่ รีวิว ถ่ายบรรยากาศ แล้วใส่ link จองหรือ affiliate ที่พักใน bio',
  business:  'แชร์บทเรียนธุรกิจ 1 เรื่อง แล้วใส่ link เครื่องมือทำธุรกิจจาก Canva/Shopee ใน bio',
  general:   'โพสต์คอนเทนต์ที่ถนัดที่สุด แล้วใส่ Shopee Affiliate link สินค้าที่เกี่ยวข้องใน bio',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QuickWinSection({ audit, hasChannel, onConnectChannel }: { audit: any; hasChannel: boolean; onConnectChannel: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>('affiliate')

  const niche: string = (audit?.input?.niche ?? 'general').toLowerCase()
  const platform: string = (audit?.input?.platform ?? '').toLowerCase()
  const normNiche = AFFILIATE_BY_NICHE[niche] ? niche : 'general'

  const affiliates = AFFILIATE_BY_NICHE[normNiche] ?? AFFILIATE_BY_NICHE.general
  const caption    = CAPTION_BY_NICHE[normNiche]    ?? CAPTION_BY_NICHE.general
  const firstAction = FIRST_ACTION_BY_NICHE[normNiche] ?? FIRST_ACTION_BY_NICHE.general

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const platformLabel = platform === 'tiktok' ? 'TikTok' : platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : platform === 'facebook' ? 'Facebook' : platform || 'Social'

  const items: QuickWinItem[] = [
    {
      id: 'affiliate',
      emoji: '🔗',
      label: `สมัคร ${affiliates[0].name}`,
      action: `รับ commission ${affiliates[0].commission} ทุกครั้งที่มีคนซื้อผ่าน link ของคุณ — ฟรี ไม่มีค่าสมัคร สมัครใช้เวลา 5 นาทีค่ะ`,
      ctaText: `สมัครเลย →`,
      ctaUrl: affiliates[0].url,
      isLink: true,
    },
    {
      id: 'caption',
      emoji: '📝',
      label: `Caption สำเร็จรูป (Copy ได้เลย)`,
      action: `ปรับ [วงเล็บ] ให้ตรงกับ content ของคุณ แล้วโพสต์ใน ${platformLabel} วันนี้เลยค่ะ`,
      ctaText: copiedId === 'caption' ? '✅ Copy แล้ว!' : '📋 Copy Caption',
      copyText: caption,
      isLink: false,
    },
    {
      id: 'action',
      emoji: '⚡',
      label: `Action วันนี้ — ทำเดี๋ยวนี้เลย`,
      action: firstAction,
      ctaText: `✓ เข้าใจแล้ว`,
      isLink: false,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
      style={{ marginBottom: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#FF9F1C' }}>Quick Wins — ทำได้ทันที</p>
        </div>
        {!hasChannel && (
          <span style={{ fontSize: '10px', color: 'rgba(255,159,28,0.7)', background: 'rgba(255,159,28,0.1)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
            Tier 1 • Audit only
          </span>
        )}
      </div>

      {items.map((item, i) => {
        const isOpen = expanded === item.id
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 + i * 0.06 }}
            style={{ marginBottom: '8px' }}
          >
            <div style={{
              borderRadius: '14px', overflow: 'hidden',
              border: isOpen ? '1.5px solid rgba(255,159,28,0.5)' : '1px solid rgba(255,255,255,0.08)',
              background: isOpen ? 'rgba(255,159,28,0.07)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}>
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, background: isOpen ? 'rgba(255,159,28,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {item.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: isOpen ? '#FF9F1C' : '#fff' }}>{item.label}</p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, flexShrink: 0, color: isOpen ? '#FF9F1C' : 'rgba(255,255,255,0.3)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </button>

              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ padding: '0 14px 14px' }}>
                  {item.id === 'caption' && (
                    <div style={{ padding: '10px 12px', marginBottom: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {caption}
                    </div>
                  )}
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{item.action}</p>
                  {item.id === 'affiliate' && item.ctaUrl && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={item.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '10px 14px', background: 'linear-gradient(135deg, #FF9F1C, #22C55E)', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                        {item.ctaText}
                      </a>
                      {affiliates[1] && (
                        <a href={affiliates[1].url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          {affiliates[1].emoji} {affiliates[1].name.split(' ')[0]}
                        </a>
                      )}
                    </div>
                  )}
                  {item.id === 'caption' && item.copyText && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleCopy(item.copyText!, 'caption')} style={{ width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', background: copiedId === 'caption' ? 'rgba(34,197,94,0.2)' : 'rgba(255,159,28,0.15)', color: copiedId === 'caption' ? '#22C55E' : '#FF9F1C', fontSize: '13px', fontWeight: 700, border: `1px solid ${copiedId === 'caption' ? 'rgba(34,197,94,0.3)' : 'rgba(255,159,28,0.3)'}` }}>
                      {item.ctaText}
                    </motion.button>
                  )}
                  {item.id === 'action' && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setExpanded(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      {item.ctaText}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}

      {!hasChannel && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={onConnectChannel} style={{ width: '100%', padding: '11px 14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, rgba(62,207,255,0.08), rgba(123,97,255,0.06))', border: '1px dashed rgba(62,207,255,0.3)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>🤖</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 1px', fontSize: '12px', fontWeight: 700, color: '#3ECFFF' }}>Tier 2: เชื่อมช่อง → Quick Win แม่นขึ้น 95%</p>
            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>MITA+ จะรู้ว่าคลิปไหนดีที่สุด แนะนำ affiliate ที่ตรงกับ content จริงๆ</p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#3ECFFF', flexShrink: 0 }}>→</span>
        </motion.button>
      )}
    </motion.div>
  )
}
