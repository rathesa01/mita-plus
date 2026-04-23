'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface SharedResult {
  id: string
  score: { total: number; breakdown: Record<string, number> }
  stage: { label: string; emoji: string; shockLine: string }
  revenueEstimation: { totalMissed: number; currentIncome: number; realistic: number }
  input: { name: string; platform: string; niche: string; followers: number }
  leaks: Array<{ title: string; missedPerMonth: number; severity: string }>
}

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube',
  facebook: 'Facebook', multi: 'Multi-platform',
}

export default function SharedResultPage() {
  const params = useParams()
  const id = params?.id as string

  const [result, setResult] = useState<SharedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/results/${id}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(setResult)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ background: '#08080f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #7B61FF', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (notFound || !result) return (
    <div style={{ background: '#08080f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>ไม่พบผลวิเคราะห์นี้ค่ะ</p>
      <a href="/audit" style={{ color: '#7B61FF', fontSize: '14px', textDecoration: 'none', fontWeight: 700 }}>→ วิเคราะห์ช่องของคุณ</a>
    </div>
  )

  const { score, stage, revenueEstimation, input, leaks } = result
  const scoreColor = score.total >= 70 ? '#22C55E' : score.total >= 45 ? '#FF9F1C' : '#7B61FF'
  const top3Leaks = leaks.slice(0, 3)

  return (
    <main style={{ background: '#08080f', minHeight: '100vh', color: '#fff', paddingBottom: '80px' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,15,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '420px', margin: '0 auto',
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, background: 'linear-gradient(135deg,#7B61FF,#3ECFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MITA+
          </span>
        </a>
        <a href="/audit" style={{
          background: '#FF9F1C', color: '#000', fontSize: '12px', fontWeight: 900,
          padding: '6px 14px', borderRadius: '20px', textDecoration: 'none',
        }}>
          เช็กช่องของฉัน →
        </a>
      </nav>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
            background: 'rgba(123,97,255,0.1)', border: '1px solid rgba(123,97,255,0.2)',
            borderRadius: '99px', padding: '4px 12px' }}>
            <Sparkles size={11} color="#a78bfa" />
            <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700 }}>ผลวิเคราะห์ของ {input.name}</span>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
            {PLATFORM_LABEL[input.platform]} · {Number(input.followers).toLocaleString('th-TH')} followers
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${scoreColor}33`,
            borderRadius: '20px', padding: '28px 24px', textAlign: 'center', marginBottom: '16px',
          }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Monetization Score
          </p>
          <div style={{ fontSize: '72px', fontWeight: 900, color: scoreColor, lineHeight: 1, marginBottom: '4px' }}>
            {score.total}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>จาก 100 คะแนน</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {stage.emoji} {stage.label}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{stage.shockLine}</p>
        </motion.div>

        {/* Revenue Gap */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: 'rgba(255,77,79,0.06)', border: '1px solid rgba(255,77,79,0.2)',
            borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '16px',
          }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Revenue Gap ต่อเดือน</p>
          <p style={{ fontSize: '32px', fontWeight: 900, color: '#FF4D4F' }}>
            -฿{fmt(revenueEstimation.totalMissed)}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
            = -฿{fmt(revenueEstimation.totalMissed * 12)}/ปี
          </p>
        </motion.div>

        {/* Top 3 Leaks */}
        {top3Leaks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Revenue Blocker ที่พบ
            </p>
            {top3Leaks.map((leak, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${leak.severity === 'critical' ? '#FF4D4F' : leak.severity === 'high' ? '#FF9F1C' : '#7B61FF'}`,
                borderRadius: '12px', padding: '12px 14px', marginBottom: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{leak.title}</p>
                <p style={{ fontSize: '13px', fontWeight: 900, color: '#FF4D4F', flexShrink: 0, marginLeft: '12px' }}>
                  -฿{fmt(leak.missedPerMonth)}/เดือน
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)',
            borderRadius: '20px', padding: '24px', textAlign: 'center',
          }}>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
            อยากรู้ Revenue Gap ของช่องคุณไหม?
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px', lineHeight: 1.6 }}>
            วิเคราะห์ฟรี 100% ใช้เวลาแค่ 3 นาที รู้ผลทันทีค่ะ
          </p>
          <a href="/audit" style={{
            display: 'block', padding: '14px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
            color: '#fff', fontWeight: 900, fontSize: '15px', textDecoration: 'none',
            marginBottom: '10px',
          }}>
            🚀 วิเคราะห์ช่องของฉัน — ฟรี!
          </a>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            ฟรี 100% · ไม่ต้องสมัคร · รู้ผลใน 3 นาที
          </p>
        </motion.div>

      </div>
    </main>
  )
}
