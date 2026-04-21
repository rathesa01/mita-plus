'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, ArrowLeft, Loader2, X, ChevronRight, Zap, Camera, Info } from 'lucide-react'
import { getSupabaseClient } from '@/lib/db/supabaseClient'

// ── Platform definitions ──────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#FF2D55',
    bg: 'rgba(255,45,85,0.10)',
    border: 'rgba(255,45,85,0.30)',
    apiSupport: 'soon',      // 'live' | 'soon' | 'none'
    apiNote: 'TikTok ยังไม่เปิด Analytics API สาธารณะค่ะ',
    steps: [
      { id: 'overview',          icon: '📊', label: 'Overview 28 วัน',         desc: 'TikTok Studio → Analytics → Overview',                            tip: 'เลือกช่วง 28 วัน แล้วแคปให้เห็น Views, Followers, Likes ครบ',                    required: true  },
      { id: 'content',           icon: '🎬', label: 'Top Videos',               desc: 'TikTok Studio → Analytics → Content',                             tip: 'แคปให้เห็นรายการวิดีโอและยอด Views ของแต่ละคลิป',                                  required: true  },
      { id: 'followers_demo',    icon: '👥', label: 'Followers Demographics',   desc: 'TikTok Studio → Analytics → Followers → Demographics',             tip: 'แคปให้เห็น เพศ และ อายุ ของ followers',                                            required: true  },
      { id: 'followers_activity',icon: '🕐', label: 'Followers Activity',       desc: 'TikTok Studio → Analytics → Followers → Activity',                tip: 'แคป heatmap วันและเวลาที่ followers online',                                       required: true  },
      { id: 'top_video',         icon: '⭐', label: 'คลิป Top 1',              desc: 'คลิกเข้าคลิปที่ views สูงสุด → ดู Analytics',                     tip: 'แคปให้เห็น Watch Time และ Traffic Source',                                          required: false },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.10)',
    border: 'rgba(255,0,0,0.30)',
    apiSupport: 'live',
    apiNote: null,
    steps: [
      { id: 'overview',  icon: '📊', label: 'Channel Overview',        desc: 'YouTube Studio → Analytics → Overview',     tip: 'เลือก 28 วัน แคปให้เห็น Views, Watch time, Subscribers, Revenue', required: true  },
      { id: 'content',   icon: '🎬', label: 'Top Content',             desc: 'YouTube Studio → Analytics → Content',      tip: 'แคปรายการวิดีโอ Top ให้เห็น Views และ Impressions แต่ละคลิป',       required: true  },
      { id: 'audience',  icon: '👥', label: 'Audience Demographics',   desc: 'YouTube Studio → Analytics → Audience',     tip: 'แคปให้เห็น Age, Gender, Geography และ When viewers are on YouTube',  required: true  },
      { id: 'revenue',   icon: '💰', label: 'Revenue (ถ้ามี)',         desc: 'YouTube Studio → Analytics → Revenue',      tip: 'แคป estimated revenue หากช่องคุณเปิดใช้ monetization แล้ว',         required: false },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.10)',
    border: 'rgba(225,48,108,0.30)',
    apiSupport: 'soon',
    apiNote: 'Instagram API ต้องการ Business account + Meta app review ค่ะ',
    steps: [
      { id: 'overview',  icon: '📊', label: 'Account Overview',    desc: "Instagram → Professional Dashboard → Overview",              tip: 'แคปให้เห็น Accounts reached, Accounts engaged, Total followers', required: true  },
      { id: 'content',   icon: '🖼',  label: 'Top Content',        desc: "Professional Dashboard → Content you've shared → ดู All",    tip: 'แคปรายการ Reel/Post ที่ได้ reach สูงสุดใน 30 วัน',                required: true  },
      { id: 'audience',  icon: '👥', label: 'Audience Insights',   desc: 'Professional Dashboard → Total followers → ดู All',          tip: 'แคปให้เห็น Age, Gender, Top locations และ Most active times',     required: true  },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👤',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.10)',
    border: 'rgba(24,119,242,0.30)',
    apiSupport: 'soon',
    apiNote: 'Facebook API ต้องผ่าน Meta Business Verification ก่อนค่ะ',
    steps: [
      { id: 'overview',  icon: '📊', label: 'Page Overview',       desc: 'Facebook Page → Insights → Overview',  tip: 'แคปให้เห็น Reach, Engagement, Followers ใน 28 วัน',    required: true  },
      { id: 'content',   icon: '📝', label: 'Post Insights',       desc: 'Insights → Posts',                     tip: 'แคปรายการโพสต์และ reach ของแต่ละโพสต์',                required: true  },
      { id: 'audience',  icon: '👥', label: 'Audience (People)',   desc: 'Insights → People',                    tip: 'แคปให้เห็น Age, Gender, Country ของ fans',              required: true  },
    ],
  },
  {
    id: 'x',
    name: 'X / Twitter',
    icon: '✖️',
    color: '#555555',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.15)',
    apiSupport: 'none',
    apiNote: 'X API ต้องเสียเงิน $100+/เดือน ไม่คุ้มค่ะ — ใช้แคปหน้าจอแทนนะคะ',
    steps: [
      { id: 'overview',    icon: '📊', label: 'Analytics Overview', desc: 'analytics.twitter.com → Home',       tip: 'แคป 28-day summary ให้เห็น Impressions, Engagements, Followers', required: true  },
      { id: 'top_tweets',  icon: '🐦', label: 'Top Tweets',         desc: 'analytics.twitter.com → Tweets',    tip: 'แคปรายการ tweet ที่ impression สูงสุด พร้อม engagement rate',      required: true  },
      { id: 'audience',    icon: '👥', label: 'Audience Insights',  desc: 'analytics.twitter.com → Audiences', tip: 'แคปให้เห็น Demographics ของ followers (ถ้ามี)',                     required: false },
    ],
  },
  {
    id: 'lemon8',
    name: 'Lemon8',
    icon: '🍋',
    color: '#FFD600',
    bg: 'rgba(255,214,0,0.10)',
    border: 'rgba(255,214,0,0.30)',
    apiSupport: 'none',
    apiNote: 'Lemon8 ยังไม่มี Analytics API เปิดให้ใช้ค่ะ',
    steps: [
      { id: 'overview',  icon: '📊', label: 'Creator Overview', desc: 'Lemon8 → Profile → Creator Data',  tip: 'แคปให้เห็น Followers, Total views, Engagement rate',              required: true  },
      { id: 'content',   icon: '📷', label: 'Top Posts',        desc: 'Creator Data → Content',           tip: 'แคปรายการโพสต์ที่ views สูงสุด ให้เห็น Likes, Comments, Saves', required: true  },
      { id: 'audience',  icon: '👥', label: 'Audience',         desc: 'Creator Data → Audience',          tip: 'แคปข้อมูล Age, Gender ของผู้ติดตาม',                              required: false },
    ],
  },
]

type ConnectMethod = 'api' | 'upload'

interface UploadedFile { stepId: string; file: File; preview: string }

export default function ConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0])
  const [method, setMethod] = useState<ConnectMethod>('upload')
  const [uploads, setUploads] = useState<Record<string, UploadedFile[]>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [connectingApi, setConnectingApi] = useState(false)
  const [done, setDone] = useState(false)
  const [donePlatform, setDonePlatform] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get userId on mount
  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id)
    })
  }, [])

  // Handle error from OAuth callback
  useEffect(() => {
    const err = searchParams.get('error')
    if (err) setError(decodeURIComponent(err))
  }, [searchParams])

  const platformUploads = uploads[selectedPlatform.id] ?? []
  const requiredSteps = selectedPlatform.steps.filter(s => s.required)
  const uploadedIds = platformUploads.map(u => u.stepId)
  const requiredDone = requiredSteps.every(s => uploadedIds.includes(s.id))

  const handleFileSelect = useCallback((stepId: string, files: FileList | null, platformId: string) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ'); return }
    const preview = URL.createObjectURL(file)
    setUploads(prev => {
      const curr = prev[platformId] ?? []
      return { ...prev, [platformId]: [...curr.filter(u => u.stepId !== stepId), { stepId, file, preview }] }
    })
    setError(null)
  }, [])

  const removeUpload = (stepId: string, platformId: string) => {
    setUploads(prev => ({ ...prev, [platformId]: (prev[platformId] ?? []).filter(u => u.stepId !== stepId) }))
  }

  // ── API Connect (YouTube) ───────────────────────────────────────────────────
  const handleApiConnect = async () => {
    if (!userId) { setError('กรุณา login ก่อนค่ะ'); return }
    setConnectingApi(true)
    setError(null)
    // Redirect to OAuth — server handles the flow
    window.location.href = `/api/auth/${selectedPlatform.id}?userId=${userId}`
  }

  // ── Screenshot Upload + Analyze ────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!requiredDone) {
      setError(`กรุณาอัปโหลดภาพที่จำเป็นก่อนนะคะ (ยังขาดอีก ${requiredSteps.filter(s => !uploadedIds.includes(s.id)).length} ภาพ)`)
      return
    }
    if (!userId) { setError('กรุณา login ก่อนค่ะ'); return }
    setAnalyzing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('platform', selectedPlatform.id)
      platformUploads.forEach(u => formData.append('screenshots', u.file))

      const res = await fetch('/api/channel/analyze', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'วิเคราะห์ไม่สำเร็จ')

      setDonePlatform(selectedPlatform.name)
      setDone(true)
      setTimeout(() => router.push('/starter'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค่ะ')
    } finally {
      setAnalyzing(false)
    }
  }

  if (done) {
    return (
      <div style={{ background: '#0B0B0F', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} style={{ fontSize: 72 }}>🎉</motion.div>
        <p style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>วิเคราะห์ช่อง {donePlatform} สำเร็จแล้วค่ะ!</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>กำลังพาไปดูข้อมูลของคุณ...</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#0B0B0F', minHeight: '100vh', color: '#fff', paddingBottom: 120 }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontWeight: 900, fontSize: 16 }}>เชื่อมช่อง Social Media</span>
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🤖</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>MITA+ AI วิเคราะห์ช่องของคุณ</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            เลือก platform แล้วเชื่อมต่อเพื่อให้ AI อ่านข้อมูลค่ะ
          </p>
        </motion.div>

        {/* Platform Selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>เลือก Platform</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
            {PLATFORMS.map(p => {
              const isSelected = selectedPlatform.id === p.id
              const hasDoneUploads = (uploads[p.id]?.length ?? 0) > 0
              return (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { setSelectedPlatform(p); setError(null); setMethod('upload') }}
                  style={{
                    position: 'relative', padding: '11px 6px',
                    background: isSelected ? p.bg : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isSelected ? p.border : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 13, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isSelected ? '#fff' : 'rgba(255,255,255,0.35)', lineHeight: 1.2, textAlign: 'center' }}>{p.name}</span>
                  {p.apiSupport === 'live' && (
                    <span style={{ fontSize: 8, color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '1px 5px', borderRadius: 99, fontWeight: 700 }}>API ✓</span>
                  )}
                  {hasDoneUploads && (
                    <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Platform Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPlatform.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* ── Method Selector ───────────────────────── */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.04)',
                borderRadius: 12, padding: 4, gap: 4, marginBottom: 10,
              }}>
                {/* API button */}
                <button
                  onClick={() => setMethod('api')}
                  disabled={selectedPlatform.apiSupport === 'none'}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none', cursor: selectedPlatform.apiSupport === 'none' ? 'not-allowed' : 'pointer',
                    background: method === 'api' ? (selectedPlatform.apiSupport === 'live' ? '#7B61FF' : 'rgba(255,255,255,0.06)') : 'transparent',
                    color: method === 'api' ? '#fff' : 'rgba(255,255,255,0.35)',
                    fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    opacity: selectedPlatform.apiSupport === 'none' ? 0.35 : 1,
                  }}
                >
                  <Zap size={13} />
                  เชื่อม API
                  {selectedPlatform.apiSupport === 'soon' && (
                    <span style={{ fontSize: 8, background: 'rgba(255,159,28,0.2)', color: '#FF9F1C', padding: '1px 5px', borderRadius: 99 }}>เร็วๆ นี้</span>
                  )}
                </button>

                {/* Upload button */}
                <button
                  onClick={() => setMethod('upload')}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: method === 'upload' ? 'rgba(255,255,255,0.09)' : 'transparent',
                    color: method === 'upload' ? '#fff' : 'rgba(255,255,255,0.35)',
                    fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <Camera size={13} />
                  อัปโหลดรูป
                </button>
              </div>

              {/* Comparison banner */}
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: '#7B61FF', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={10} /> เชื่อม API
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                      สะดวก อัตโนมัติ<br />
                      ข้อมูลพื้นฐาน
                    </p>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Camera size={10} /> อัปโหลดรูป ⭐ แนะนำ
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                      ข้อมูลลึกกว่ามาก<br />
                      Watch time · Heatmap · Traffic source
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── API Mode ─────────────────────────────── */}
            {method === 'api' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {selectedPlatform.apiSupport === 'live' ? (
                  /* YouTube — API Live */
                  <div>
                    <div style={{ padding: 20, background: selectedPlatform.bg, border: `1px solid ${selectedPlatform.border}`, borderRadius: 16, marginBottom: 16, textAlign: 'center' }}>
                      <span style={{ fontSize: 40, display: 'block', marginBottom: 10 }}>{selectedPlatform.icon}</span>
                      <p style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>เชื่อม {selectedPlatform.name} Account</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>
                        MITA+ จะขอสิทธิ์อ่านข้อมูลแบบ read-only ค่ะ<br />
                        ไม่มีการโพสต์หรือแก้ไขข้อมูลใดๆ
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16, textAlign: 'left' }}>
                        {[
                          '✅ Subscribers + Growth',
                          '✅ Views + Watch Time 28 วัน',
                          '✅ Impressions + CTR',
                          '✅ Demographics (Age/Gender)',
                          '✅ Top Videos',
                          '✅ Revenue (ถ้า monetized)',
                          '⚠️ Peak hours (จำกัดจาก API)',
                          '⚠️ Traffic source (ใช้รูปดีกว่า)',
                        ].map((item, i) => (
                          <p key={i} style={{ margin: 0, fontSize: 11, color: item.startsWith('✅') ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)' }}>{item}</p>
                        ))}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleApiConnect}
                        disabled={connectingApi || !userId}
                        style={{
                          width: '100%', height: 50, borderRadius: 13, border: 'none',
                          background: 'linear-gradient(135deg, #FF0000, #FF6B6B)',
                          color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                      >
                        {connectingApi
                          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> กำลังเชื่อมต่อ...</>
                          : <><span>▶️</span> เชื่อม Google Account <ChevronRight size={15} /></>
                        }
                      </motion.button>
                    </div>

                    {/* Nudge to also upload for deeper data */}
                    <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Info size={14} style={{ color: '#22C55E', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        <span style={{ color: '#22C55E', fontWeight: 700 }}>เคล็ดลับ:</span> เชื่อม API แล้วยังอัปโหลดรูปเพิ่มได้ค่ะ — จะได้ข้อมูล heatmap และ traffic source ที่ API ให้ไม่ได้
                      </p>
                    </div>
                  </div>
                ) : selectedPlatform.apiSupport === 'soon' ? (
                  /* Coming Soon */
                  <div style={{ padding: 28, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
                    <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🚧</span>
                    <p style={{ fontWeight: 900, fontSize: 15, marginBottom: 6 }}>{selectedPlatform.name} API — เร็วๆ นี้ค่ะ</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 16 }}>{selectedPlatform.apiNote}</p>
                    <button
                      onClick={() => setMethod('upload')}
                      style={{
                        padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: selectedPlatform.bg, border: `1px solid ${selectedPlatform.border}`,
                        color: '#fff', fontWeight: 700, fontSize: 13,
                      }}
                    >
                      ใช้วิธีอัปโหลดรูปแทนค่ะ →
                    </button>
                  </div>
                ) : (
                  /* None */
                  <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16 }}>
                    <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>❌</span>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{selectedPlatform.name} ไม่มี Analytics API ฟรีค่ะ</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 14 }}>{selectedPlatform.apiNote}</p>
                    <button
                      onClick={() => setMethod('upload')}
                      style={{ padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 12 }}
                    >
                      อัปโหลดรูปแทน →
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Upload Mode ──────────────────────────── */}
            {method === 'upload' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {/* Platform header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 18 }}>{selectedPlatform.icon}</span>
                  <span style={{ fontWeight: 900, fontSize: 15 }}>{selectedPlatform.name}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99 }}>
                    ต้องการ {requiredSteps.length} ภาพ
                  </span>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {selectedPlatform.steps.map((step, i) => {
                    const uploaded = platformUploads.find(u => u.stepId === step.id)
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          background: uploaded ? selectedPlatform.bg : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${uploaded ? selectedPlatform.border : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 13, overflow: 'hidden',
                        }}
                      >
                        <div style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
                              <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', margin: 0 }}>{step.label}</p>
                              {step.required
                                ? <span style={{ fontSize: 9, color: '#FF9F1C', background: 'rgba(255,159,28,0.12)', padding: '1px 5px', borderRadius: 99 }}>จำเป็น</span>
                                : <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 99 }}>ไม่บังคับ</span>
                              }
                            </div>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: 0 }}>{step.desc}</p>
                          </div>
                          {uploaded ? (
                            <CheckCircle2 size={18} style={{ color: selectedPlatform.color, flexShrink: 0 }} />
                          ) : (
                            <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(step.id, e.target.files, selectedPlatform.id)} />
                              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Upload size={10} /> อัปโหลด
                              </div>
                            </label>
                          )}
                        </div>
                        {uploaded && (
                          <div style={{ position: 'relative', margin: '0 13px 11px' }}>
                            <img src={uploaded.preview} alt={step.label} style={{ width: '100%', borderRadius: 8, maxHeight: 130, objectFit: 'cover', objectPosition: 'top' }} />
                            <button onClick={() => removeUpload(step.id, selectedPlatform.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                              <X size={11} />
                            </button>
                          </div>
                        )}
                        {!uploaded && (
                          <div style={{ margin: '0 13px 11px', padding: '7px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.55, margin: 0 }}>💡 {step.tip}</p>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 14, padding: '9px 13px', background: 'rgba(255,255,255,0.03)', borderRadius: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>อัปโหลดแล้ว</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: requiredDone ? '#22C55E' : 'rgba(255,255,255,0.4)' }}>
                      {platformUploads.length}/{selectedPlatform.steps.length} {requiredDone ? '✅ ครบขั้นต่ำ' : `(ต้องอีก ${requiredSteps.filter(s => !uploadedIds.includes(s.id)).length})`}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${selectedPlatform.color}, #7B61FF)`, borderRadius: 99, width: `${Math.min(100, (platformUploads.length / selectedPlatform.steps.length) * 100)}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>

                {error && (
                  <div style={{ marginBottom: 12, padding: '10px 13px', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 10 }}>
                    <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={analyzing || !requiredDone}
                  style={{
                    width: '100%', height: 52, borderRadius: 14, border: 'none',
                    background: requiredDone ? `linear-gradient(135deg, ${selectedPlatform.color}, #7B61FF)` : 'rgba(255,255,255,0.06)',
                    color: requiredDone ? '#fff' : 'rgba(255,255,255,0.22)',
                    fontWeight: 900, fontSize: 14, cursor: requiredDone ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {analyzing
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> AI กำลังวิเคราะห์...</>
                    : <><span>🤖</span> วิเคราะห์ช่อง {selectedPlatform.name} ของฉัน <ChevronRight size={14} /></>
                  }
                </motion.button>

                <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 10 }}>
                  ข้อมูลของคุณปลอดภัย — ใช้แค่เพื่อสร้างแผนส่วนตัวเท่านั้นค่ะ
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
