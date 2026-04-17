'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react'
import { COLORS, CARD, RADIUS } from '@/lib/tokens'
import { NON_SUBSCRIBERS, SUBSCRIBERS } from './personas'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// ── Types ──────────────────────────────────────────
interface NonSubResult {
  revenueEstimation: { conservative: number; realistic: number; aggressive: number; totalMissed: number }
  stage: { label: string; emoji: string; shockLine: string }
  score: { total: number }
  pricing: { tier: string; reportPrice: number; urgencyMessage: string }
  aiInsights?: { summary: string; topOpportunity: string; urgentWarning: string }
}

interface SubResult {
  message: string
  script: string
}

// ── Sub-components ─────────────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontSize: '9px', fontWeight: 700, color,
      background: `${color}15`, padding: '2px 8px', borderRadius: '99px',
      border: `1px solid ${color}30`,
    }}>{text}</span>
  )
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#FF9F1C' : '#FF4D4F'
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: '99px',
      border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '13px', fontWeight: 900, color }}>{score}</span>
    </div>
  )
}

// ── Non-subscriber card ────────────────────────────
function NonSubCard({ persona, index }: { persona: typeof NON_SUBSCRIBERS[0]; index: number }) {
  const [result, setResult] = useState<NonSubResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const generate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona.input),
      })
      const json = await res.json()
      setResult(json)
      setExpanded(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [persona.input])

  const tierColor: Record<string, string> = {
    starter: '#7B61FF', growth: '#3ECFFF', premium: '#FF9F1C', revenue_share: '#22C55E',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ ...CARD.base, padding: '16px', marginBottom: '10px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: result ? '12px' : '0' }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{persona.avatar}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{persona.label}</p>
            <Badge text={`${fmt(persona.input.followers)} followers`} color="#7B61FF" />
            <Badge text={persona.input.platform} color="#3ECFFF" />
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{persona.desc}</p>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            "{persona.input.biggestProblem}"
          </p>
        </div>
        {result
          ? <ScoreRing score={result.score.total} />
          : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={generate}
              disabled={loading}
              style={{
                padding: '8px 14px', background: '#7B61FF', color: '#fff',
                border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px', fontWeight: 700, flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
              {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์'}
            </motion.button>
          )
        }
      </div>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Stage + Revenue row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              flex: 1, padding: '10px 12px',
              background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.15)',
              borderRadius: '12px',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Stage</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {result.stage.emoji} {result.stage.label}
              </p>
            </div>
            <div style={{
              flex: 1, padding: '10px 12px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '12px',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>ศักยภาพ/เดือน</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#22C55E' }}>
                ฿{fmt(result.revenueEstimation.aggressive)}
              </p>
            </div>
          </div>

          {/* Shock line */}
          <div style={{
            padding: '10px 12px', marginBottom: '10px',
            background: 'rgba(255,77,79,0.06)', border: '1px solid rgba(255,77,79,0.2)',
            borderRadius: '12px',
          }}>
            <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#FF4D4F', fontWeight: 700 }}>⚡ MITA+ บอก</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              {result.stage.shockLine}
            </p>
          </div>

          {/* Pricing */}
          <div style={{
            padding: '10px 12px', marginBottom: '10px',
            background: `${tierColor[result.pricing.tier] ?? '#7B61FF'}08`,
            border: `1px solid ${tierColor[result.pricing.tier] ?? '#7B61FF'}25`,
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: tierColor[result.pricing.tier] ?? '#7B61FF' }}>
                💰 แผนที่แนะนำ: {result.pricing.tier.toUpperCase()}
              </p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#fff' }}>
                ฿{result.pricing.reportPrice}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              {result.pricing.urgencyMessage}
            </p>
          </div>

          {/* AI Insights (expandable) */}
          {result.aiInsights && (
            <>
              <button
                onClick={() => setExpanded(e => !e)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', color: 'rgba(255,255,255,0.4)', fontSize: '12px',
                }}
              >
                <span>🤖 AI Insights</span>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: '12px', overflow: 'hidden',
                      background: 'rgba(123,97,255,0.05)',
                      border: '1px solid rgba(123,97,255,0.15)',
                      borderRadius: '12px',
                    }}
                  >
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#7B61FF' }}>📝 สรุปภาพรวม</p>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
                      {result.aiInsights.summary}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#22C55E' }}>🚀 โอกาสที่ดีที่สุด</p>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
                      {result.aiInsights.topOpportunity}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#FF9F1C' }}>⚠️ ต้องแก้ด่วน</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
                      {result.aiInsights.urgentWarning}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Re-generate */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', fontSize: '11px',
              display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: 0,
            }}
          >
            <RefreshCw size={10} /> generate ใหม่
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Subscriber card ────────────────────────────────
function SubCard({ persona, index }: { persona: typeof SUBSCRIBERS[0]; index: number }) {
  const [result, setResult] = useState<SubResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'coach' | 'script'>('coach')

  const generate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: persona.mood,
          clips: persona.clips,
          income: persona.income,
          obstacle: persona.obstacle,
          weekNo: persona.weekNo,
          creatorName: persona.label,
          niche: 'beauty',
          platform: persona.platform,
          targetIncome: persona.targetIncome,
        }),
      })
      const json = await res.json()
      setResult(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [persona])

  const moodColor = { great: '#22C55E', ok: '#7B61FF', hard: '#FF9F1C' }[persona.mood]
  const moodEmoji = { great: '🔥', ok: '😊', hard: '😅' }[persona.mood]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ ...CARD.base, padding: '16px', marginBottom: '10px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: result ? '14px' : '0' }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{persona.avatar}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{persona.label}</p>
            <Badge text={`สัปดาห์ ${persona.weekNo}`} color="#7B61FF" />
            <Badge text={`${moodEmoji} ${persona.mood}`} color={moodColor} />
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{persona.desc}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>📹 {persona.clips} คลิป</span>
            <span style={{ fontSize: '11px', color: persona.income > 0 ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
              💰 ฿{fmt(persona.income)}
            </span>
          </div>
          {persona.obstacle && (
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,159,28,0.8)', fontStyle: 'italic' }}>
              "{persona.obstacle}"
            </p>
          )}
        </div>
        {!result && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generate}
            disabled={loading}
            style={{
              padding: '8px 14px', background: moodColor, color: '#fff',
              border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px', fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
            {loading ? 'กำลังคิด...' : 'โค้ช'}
          </motion.button>
        )}
      </div>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '12px',
            background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '10px',
          }}>
            {([
              { key: 'coach' as const, label: '💬 โค้ชพูดว่า' },
              { key: 'script' as const, label: '🎬 ไอเดียคลิป' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '7px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '11px',
                  background: tab === t.key ? moodColor : 'transparent',
                  color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'coach' && (
              <motion.div key="coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{
                  padding: '12px',
                  background: `${moodColor}08`,
                  border: `1px solid ${moodColor}25`,
                  borderRadius: '12px',
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {result.message}
                  </p>
                </div>
              </motion.div>
            )}
            {tab === 'script' && (
              <motion.div key="script" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{
                  padding: '12px',
                  background: 'rgba(62,207,255,0.06)',
                  border: '1px solid rgba(62,207,255,0.2)',
                  borderRadius: '12px',
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {result.script}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={generate}
            disabled={loading}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', fontSize: '11px',
              display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', padding: 0,
            }}
          >
            <RefreshCw size={10} /> generate ใหม่
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────
export default function ShowcasePage() {
  const [tab, setTab] = useState<'nonsub' | 'sub'>('nonsub')
  const [genAllLoading, setGenAllLoading] = useState(false)

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${COLORS.bg}ee`, backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Beauty Showcase</span>
            <span style={{ marginLeft: '8px', fontSize: '10px', color: '#FF4D4F', background: 'rgba(255,77,79,0.12)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
              💄 beauty niche
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>20 personas · real Claude</span>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '6px',
          background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px',
        }}>
          {([
            { key: 'nonsub' as const, label: '🔓 ยังไม่สมัคร Starter (10)' },
            { key: 'sub'    as const, label: '⭐ สมัครแล้ว (10)' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 4px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                fontWeight: 700, fontSize: '11px',
                background: tab === t.key ? '#7B61FF' : 'transparent',
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '16px' }}>

        {/* Info banner */}
        <div style={{
          padding: '12px 14px', marginBottom: '14px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            {tab === 'nonsub'
              ? '🔓 ทั้ง 10 คนอยู่ใน niche beauty เหมือนกัน แต่ต่าง stage, platform, follower — กด "วิเคราะห์" เพื่อดู AI output จริงจาก Claude ค่ะ'
              : '⭐ ทั้ง 10 คนสมัคร Starter แล้ว แต่ต่างกันที่ week, mood, รายได้, และปัญหา — กด "โค้ช" เพื่อดู coaching + script จาก Claude จริงๆ ค่ะ'
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'nonsub' && (
            <motion.div key="nonsub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {NON_SUBSCRIBERS.map((p, i) => (
                <NonSubCard key={p.label} persona={p} index={i} />
              ))}
            </motion.div>
          )}
          {tab === 'sub' && (
            <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {SUBSCRIBERS.map((p, i) => (
                <SubCard key={p.label} persona={p} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
