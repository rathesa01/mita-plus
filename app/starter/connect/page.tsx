'use client'
// ── P-014-adapt · /starter/connect page — Lovable cream design + real upload/OAuth/router ──

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Bot,
  AlertCircle,
  Music2,
  PlayCircle,
  Image as ImageIcon,
  Globe,
  Hash,
  Citrus,
  Zap,
  Camera,
  Star,
  Check,
  ChevronRight,
  Construction,
  XCircle,
  Info,
  BarChart3,
  Video,
  Users,
  Activity,
  DollarSign,
  Upload,
  CheckCircle2,
  Lightbulb,
  X,
  Loader2,
  ShieldCheck,
  PartyPopper,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/db/supabaseClient'

// ---------- Types ----------
type ApiSupport = 'live' | 'soon' | 'none'
type StepIcon =
  | 'overview'
  | 'content'
  | 'audience'
  | 'followers_demo'
  | 'followers_activity'
  | 'top_video'
  | 'top_tweets'
  | 'revenue'

interface Step {
  key: string
  label: string
  desc: string
  icon: StepIcon
  required: boolean
  tip: string
}

interface Platform {
  id: string
  name: string
  color: string
  icon: typeof Music2
  apiSupport: ApiSupport
  apiNote: string
  steps: Step[]
}

interface UploadedFile {
  stepId: string
  file: File
  preview: string
}

// ---------- Platform data ----------
const PLATFORMS: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    color: 'rgba(255,45,85,0.6)',
    icon: Music2,
    apiSupport: 'soon',
    apiNote:
      'TikTok Analytics API ยังไม่เปิดให้สาธารณะค่ะ — ระหว่างนี้อัปโหลดรูปจาก TikTok Studio จะได้ข้อมูลครบกว่ามากค่ะ',
    steps: [
      { key: 'overview', label: 'ภาพรวม 28 วัน', desc: 'Views · Likes · Comments · Shares', icon: 'overview', required: true, tip: 'เปิด TikTok Studio → Analytics → Overview แล้ว screenshot ทั้งหน้า' },
      { key: 'content', label: 'Content Performance', desc: 'Top videos + watch time', icon: 'content', required: true, tip: 'Analytics → Content → เลือกช่วง 28 วัน' },
      { key: 'followers_demo', label: 'Followers Demographics', desc: 'อายุ · เพศ · ประเทศ', icon: 'followers_demo', required: true, tip: 'Analytics → Followers → Demographics' },
      { key: 'followers_activity', label: 'Followers Activity', desc: 'ช่วงเวลาที่ followers active', icon: 'followers_activity', required: true, tip: 'Analytics → Followers → Activity (heatmap)' },
      { key: 'top_video', label: 'Top Video Detail', desc: 'วิดีโอที่ดีที่สุด 1 ตัว', icon: 'top_video', required: false, tip: 'เลือกวิดีโอที่ views สูงสุด → screenshot insight' },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: 'rgba(255,0,0,0.7)',
    icon: PlayCircle,
    apiSupport: 'live',
    apiNote: '',
    steps: [
      { key: 'overview', label: 'Channel Overview', desc: 'Subscribers · Views · Watch time', icon: 'overview', required: true, tip: 'YouTube Studio → Analytics → Overview' },
      { key: 'content', label: 'Content Performance', desc: 'Top videos 28 วัน', icon: 'content', required: true, tip: 'Analytics → Content tab' },
      { key: 'audience', label: 'Audience Insights', desc: 'Demographics + watch time', icon: 'audience', required: true, tip: 'Analytics → Audience' },
      { key: 'revenue', label: 'Revenue (ถ้ามี)', desc: 'AdSense + memberships', icon: 'revenue', required: false, tip: 'Analytics → Revenue (ถ้า monetized)' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'rgba(225,48,108,0.6)',
    icon: ImageIcon,
    apiSupport: 'soon',
    apiNote:
      'Instagram Graph API ต้องเป็น Business Account + ผูก Facebook Page ค่ะ — ระหว่างนี้ใช้ screenshot จาก Insights ได้เลย',
    steps: [
      { key: 'overview', label: 'Insights Overview', desc: 'Reach · Impressions · Profile visits', icon: 'overview', required: true, tip: 'เปิด Instagram → Insights (โปรไฟล์)' },
      { key: 'audience', label: 'Audience', desc: 'Top locations · Age · Gender · Active hours', icon: 'audience', required: true, tip: 'Insights → Audience tab' },
      { key: 'content', label: 'Top Content 28 วัน', desc: 'Posts + Reels ที่ engage สูงสุด', icon: 'content', required: true, tip: 'Insights → Content You Shared' },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: 'rgba(24,119,242,0.7)',
    icon: Globe,
    apiSupport: 'soon',
    apiNote:
      'Facebook Page API กำลังเปิดให้ผู้ใช้ MITA+ เร็วๆ นี้ค่ะ — ระหว่างนี้อัปโหลดจาก Meta Business Suite ได้เลย',
    steps: [
      { key: 'overview', label: 'Page Insights', desc: 'Reach · Engagement · Followers', icon: 'overview', required: true, tip: 'Meta Business Suite → Insights → Overview' },
      { key: 'audience', label: 'Audience', desc: 'Demographics + active times', icon: 'audience', required: true, tip: 'Insights → Audience' },
      { key: 'content', label: 'Top Posts', desc: 'โพสต์ที่ดีที่สุด 28 วัน', icon: 'content', required: true, tip: 'Insights → Content' },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    color: 'rgba(0,0,0,0.6)',
    icon: Hash,
    apiSupport: 'none',
    apiNote:
      'X ปิด Analytics API ฟรีตั้งแต่ปี 2023 ค่ะ — ใช้วิธีอัปโหลดรูปจาก analytics.twitter.com แทนได้เลย',
    steps: [
      { key: 'overview', label: 'Account Overview 28 วัน', desc: 'Tweets · Impressions · Profile visits', icon: 'overview', required: true, tip: 'เปิด analytics.twitter.com → Home' },
      { key: 'audience', label: 'Audience Insights', desc: 'Followers + interests', icon: 'audience', required: true, tip: 'Analytics → Audiences' },
      { key: 'top_tweets', label: 'Top Tweets', desc: 'Tweet ที่ engage สูงสุด', icon: 'top_tweets', required: false, tip: 'Tweets tab → sort by impressions' },
    ],
  },
  {
    id: 'lemon8',
    name: 'Lemon8',
    color: 'rgba(255,200,0,0.7)',
    icon: Citrus,
    apiSupport: 'none',
    apiNote:
      'Lemon8 ยังไม่มี public Analytics API ค่ะ — อัปโหลด screenshot จากแอปได้เลย MITA+ จะอ่านให้ค่ะ',
    steps: [
      { key: 'overview', label: 'Profile Insights', desc: 'Followers · Views · Likes', icon: 'overview', required: true, tip: 'เปิด Lemon8 → Profile → Insights' },
      { key: 'content', label: 'Top Posts', desc: 'โพสต์ที่ดีที่สุด 28 วัน', icon: 'content', required: true, tip: 'Insights → Content' },
      { key: 'audience', label: 'Audience (ถ้ามี)', desc: 'Demographics', icon: 'audience', required: false, tip: 'Insights → Audience (ถ้าเปิดให้)' },
    ],
  },
]

// ---------- Constants ----------
const CREAM = '#FFFAF5'
const TEXT = '#1D1D1F'
const MUTED = '#6B6B6B'
const SUBTLE = '#8A8A8A'
const BODY = '#4A4A4A'
const CORAL = '#D85A30'
const PURPLE = '#7F77DD'
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04)'
const CARD_BORDER = '1px solid rgba(0,0,0,0.06)'

const STEP_ICON_MAP: Record<StepIcon, typeof BarChart3> = {
  overview: BarChart3,
  content: Video,
  audience: Users,
  followers_demo: Users,
  followers_activity: Activity,
  top_video: Star,
  top_tweets: Star,
  revenue: DollarSign,
}

// ---------- Inner Component ----------
function ConnectChannelInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedId, setSelectedId] = useState<string>('tiktok')
  const [method, setMethod] = useState<'api' | 'upload'>('upload')
  const [uploads, setUploads] = useState<Record<string, UploadedFile[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)
  const [donePlatform, setDonePlatform] = useState<string>('')
  const [apiLoading, setApiLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // 2A: Resolve session userId on mount
  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id)
    })
  }, [])

  // 2A: Show OAuth error from query param
  useEffect(() => {
    const err = searchParams.get('error')
    if (err) setError(decodeURIComponent(err))
  }, [searchParams])

  const platform = useMemo(
    () => PLATFORMS.find((p) => p.id === selectedId)!,
    [selectedId],
  )

  // 2B: Derived helpers using UploadedFile[]
  const platformUploads = uploads[selectedId] ?? []
  const uploadedIds = platformUploads.map((u) => u.stepId)
  const requiredSteps = platform.steps.filter((s) => s.required)
  const requiredDone = requiredSteps.every((s) => uploadedIds.includes(s.key))
  const missing = requiredSteps.filter((s) => !uploadedIds.includes(s.key)).length

  function handleSelectPlatform(id: string) {
    setSelectedId(id)
    setError(null)
    const p = PLATFORMS.find((x) => x.id === id)!
    setMethod(p.apiSupport === 'live' ? 'api' : 'upload')
  }

  // 2C: Real file select — image only, creates object URL preview
  const handleFileSelect = useCallback(
    (stepKey: string, files: FileList | null, platformId: string) => {
      if (!files || files.length === 0) return
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ')
        return
      }
      const preview = URL.createObjectURL(file)
      setUploads((prev) => {
        const curr = prev[platformId] ?? []
        return {
          ...prev,
          [platformId]: [
            ...curr.filter((u) => u.stepId !== stepKey),
            { stepId: stepKey, file, preview },
          ],
        }
      })
      setError(null)
    },
    [],
  )

  const removeUpload = (stepKey: string, platformId: string) => {
    setUploads((prev) => ({
      ...prev,
      [platformId]: (prev[platformId] ?? []).filter((u) => u.stepId !== stepKey),
    }))
  }

  // 2D: Real FormData POST to /api/channel/analyze
  const handleAnalyze = async () => {
    if (!requiredDone) {
      setError(`ยังขาดอีก ${missing} ภาพ — กรุณาอัปโหลดให้ครบเพื่อให้ MITA+ วิเคราะห์ได้แม่นยำค่ะ`)
      return
    }
    if (!userId) {
      setError('กรุณา login ก่อนค่ะ')
      return
    }
    setAnalyzing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('platform', selectedId)
      platformUploads.forEach((u) => formData.append('screenshots', u.file))
      const res = await fetch('/api/channel/analyze', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'วิเคราะห์ไม่สำเร็จ')
      setDonePlatform(platform.name)
      setDone(true)
      setTimeout(() => router.push('/starter'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค่ะ')
    } finally {
      setAnalyzing(false)
    }
  }

  // 2E: Real OAuth redirect
  const handleApiConnect = () => {
    if (!userId) {
      setError('กรุณา login ก่อนค่ะ')
      return
    }
    setApiLoading(true)
    setError(null)
    window.location.href = `/api/auth/${selectedId}?userId=${userId}`
  }

  if (done) return <DoneState platformName={donePlatform} />

  return (
    <div style={{ background: CREAM, minHeight: '100vh', color: TEXT }}>
      {/* SECTION 1: Sticky Nav */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#FFFFFF',
          borderBottom: CARD_BORDER,
          boxShadow: CARD_SHADOW,
        }}
      >
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 2H: Wire back button */}
          <button
            type='button'
            aria-label='ย้อนกลับ'
            onClick={() => router.back()}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} color={MUTED} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>
            เชื่อมช่อง Social Media
          </h1>
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>
        {/* SECTION 2: Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              margin: '0 auto 14px',
              background: `linear-gradient(135deg, ${PURPLE}26, ${CORAL}26)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={36} color={CORAL} strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            MITA+ วิเคราะห์ช่องของคุณ
          </h2>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            เลือก platform แล้วเชื่อมต่อเพื่อให้ MITA+ อ่านข้อมูลค่ะ
          </p>
        </motion.div>

        {/* SECTION 3: Why Connect */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            padding: '18px 20px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertCircle size={16} color={CORAL} />
            <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>ทำไมต้องเชื่อมช่อง</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ background: 'rgba(216,90,48,0.06)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>ตอนนี้</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: CORAL, lineHeight: 1, marginBottom: 4 }}>30%</div>
              <div style={{ fontSize: 11, color: MUTED }}>ข้อมูลจาก Audit</div>
            </div>
            <div style={{ background: 'rgba(127,119,221,0.06)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>หลังเชื่อม</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: PURPLE, lineHeight: 1, marginBottom: 4 }}>85%</div>
              <div style={{ fontSize: 11, color: MUTED }}>ข้อมูลจริง + insight</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            MITA+ จะวิเคราะห์ช่องคุณแม่นขึ้น — แนะนำสินค้า/คลิป/แผนที่เหมาะสุดได้ตรง
          </p>
        </motion.div>

        {/* SECTION 4: Platform Selector */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: SUBTLE, fontWeight: 600, marginBottom: 8, letterSpacing: '0.01em' }}>
            เลือก Platform
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
            {PLATFORMS.map((p) => {
              const Icon = p.icon
              const isSelected = selectedId === p.id
              const hasUploads = (uploads[p.id]?.length ?? 0) > 0
              return (
                <button
                  key={p.id}
                  type='button'
                  onClick={() => handleSelectPlatform(p.id)}
                  style={{
                    position: 'relative',
                    background: isSelected ? 'rgba(216,90,48,0.08)' : '#FFFFFF',
                    border: isSelected ? `1.5px solid ${CORAL}` : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: CARD_SHADOW,
                    borderRadius: 14,
                    padding: '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {isSelected && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: CORAL }} />
                  )}
                  {hasUploads && !isSelected && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 999, background: CORAL }} />
                  )}
                  <Icon size={20} color={p.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? TEXT : MUTED }}>
                    {p.name}
                  </span>
                  {p.apiSupport === 'live' && (
                    <span style={{ fontSize: 9, color: CORAL, background: 'rgba(216,90,48,0.12)', padding: '1px 5px', borderRadius: 99, fontWeight: 700 }}>
                      API ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* SECTION 5: Method Selector */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            padding: 4,
            display: 'flex',
            gap: 4,
            marginBottom: 12,
          }}
        >
          <MethodButton
            active={method === 'api'}
            disabled={platform.apiSupport === 'none'}
            onClick={() => platform.apiSupport !== 'none' && setMethod('api')}
            variant='api'
            apiSupport={platform.apiSupport}
          />
          <MethodButton
            active={method === 'upload'}
            onClick={() => setMethod('upload')}
            variant='upload'
          />
        </div>

        {/* SECTION 6: Comparison Banner */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            padding: '12px 14px',
            display: 'flex',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <Zap size={11} color={CORAL} />
              <span style={{ fontSize: 11, fontWeight: 700, color: CORAL }}>เชื่อม API</span>
            </div>
            <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.5 }}>สะดวก อัตโนมัติ · ข้อมูลพื้นฐาน</div>
          </div>
          <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <Camera size={11} color={PURPLE} />
              <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE }}>อัปโหลดรูป</span>
              <Star size={9} color={CORAL} fill={CORAL} />
              <span style={{ fontSize: 9, color: CORAL, background: 'rgba(216,90,48,0.12)', padding: '1px 5px', borderRadius: 99, fontWeight: 700 }}>
                แนะนำ
              </span>
            </div>
            <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.5 }}>
              ข้อมูลลึกกว่ามาก · Watch time · Heatmap · Traffic source
            </div>
          </div>
        </div>

        {/* SECTION 7: Mode Content */}
        <AnimatePresence mode='wait'>
          {method === 'api' ? (
            <motion.div
              key={`api-${platform.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {platform.apiSupport === 'live' && (
                <ApiLiveCard platform={platform} loading={apiLoading} onConnect={handleApiConnect} />
              )}
              {platform.apiSupport === 'soon' && (
                <ApiSoonCard platform={platform} onSwitch={() => setMethod('upload')} />
              )}
              {platform.apiSupport === 'none' && (
                <ApiNoneCard platform={platform} onSwitch={() => setMethod('upload')} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`upload-${platform.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {/* 2G: onUpload + onRemove replacing mock onToggle */}
              <UploadMode
                platform={platform}
                platformUploads={platformUploads}
                onUpload={(stepKey, files) => handleFileSelect(stepKey, files, selectedId)}
                onRemove={(stepKey) => removeUpload(stepKey, selectedId)}
                requiredCount={requiredSteps.length}
              />

              {/* Progress */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: CARD_BORDER,
                  boxShadow: CARD_SHADOW,
                  padding: '11px 14px',
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: MUTED }}>อัปโหลดแล้ว</span>
                  {requiredDone ? (
                    <span style={{ fontSize: 11, color: CORAL, fontWeight: 700 }}>
                      {platformUploads.length} ✓ ครบขั้นต่ำ
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: SUBTLE }}>
                      {platformUploads.length}/{platform.steps.length} (ต้องอีก {missing})
                    </span>
                  )}
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (platformUploads.length / platform.steps.length) * 100)}%`,
                      background: `linear-gradient(90deg, ${PURPLE}, ${CORAL})`,
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  style={{
                    background: 'rgba(216,90,48,0.08)',
                    border: '1px solid rgba(216,90,48,0.25)',
                    borderRadius: 10,
                    padding: '10px 13px',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <AlertCircle size={12} color={CORAL} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: CORAL, lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              {/* Analyze CTA */}
              <button
                type='button'
                onClick={handleAnalyze}
                disabled={!requiredDone || analyzing}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: 'none',
                  background: requiredDone
                    ? `linear-gradient(135deg, ${PURPLE}, ${CORAL})`
                    : 'rgba(0,0,0,0.06)',
                  color: requiredDone ? '#FFFFFF' : SUBTLE,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: requiredDone && !analyzing ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  letterSpacing: '-0.01em',
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={14} className='animate-spin' />
                    MITA+ กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <Bot size={14} />
                    ให้ MITA+ วิเคราะห์ช่อง {platform.name} ของฉัน
                    <ChevronRight size={14} />
                  </>
                )}
              </button>

              {/* Privacy footer */}
              <div style={{ marginTop: 10, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <ShieldCheck size={10} color={CORAL} />
                <span style={{ fontSize: 10, color: SUBTLE }}>
                  ข้อมูลของคุณปลอดภัย — ใช้แค่เพื่อสร้างแผนส่วนตัวเท่านั้นค่ะ
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------- Sub: Method Button ----------
function MethodButton({
  active,
  disabled,
  onClick,
  variant,
  apiSupport,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  variant: 'api' | 'upload'
  apiSupport?: ApiSupport
}) {
  const isApi = variant === 'api'
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        height: 38,
        borderRadius: 11,
        border: 'none',
        background: active
          ? isApi
            ? `linear-gradient(135deg, ${CORAL}, #b94a26)`
            : 'rgba(0,0,0,0.04)'
          : 'transparent',
        color: active ? (isApi ? '#FFFFFF' : TEXT) : MUTED,
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 150ms ease',
      }}
    >
      {isApi ? <Zap size={13} /> : <Camera size={13} />}
      {isApi ? 'เชื่อม API' : 'อัปโหลดรูป'}
      {!isApi && (
        <Star size={10} color={active ? CORAL : MUTED} fill={active ? CORAL : 'transparent'} />
      )}
      {!isApi && (
        <span style={{ fontSize: 10, color: active ? CORAL : MUTED, fontWeight: 700 }}>แนะนำ</span>
      )}
      {isApi && apiSupport === 'soon' && (
        <span style={{ fontSize: 10, background: 'rgba(216,90,48,0.12)', color: CORAL, padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
          เร็วๆ นี้
        </span>
      )}
    </button>
  )
}

// ---------- Sub: API Live Card ----------
function ApiLiveCard({
  platform,
  loading,
  onConnect,
}: {
  platform: Platform
  loading: boolean
  onConnect: () => void
}) {
  const features: { icon: typeof Check; color: string; label: string; muted?: boolean }[] = [
    { icon: Check, color: CORAL, label: 'Subscribers + Growth' },
    { icon: Check, color: CORAL, label: 'Views + Watch Time 28 วัน' },
    { icon: Check, color: CORAL, label: 'Impressions + CTR' },
    { icon: Check, color: CORAL, label: 'Demographics (Age/Gender)' },
    { icon: Check, color: CORAL, label: 'Top Videos' },
    { icon: Check, color: CORAL, label: 'Revenue (ถ้า monetized)' },
    { icon: AlertCircle, color: SUBTLE, label: 'Peak hours (จำกัดจาก API)', muted: true },
    { icon: AlertCircle, color: SUBTLE, label: 'Traffic source (ใช้รูปดีกว่า)', muted: true },
  ]
  return (
    <div>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 18,
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
          padding: 22,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: 'rgba(255,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <PlayCircle size={32} color='rgba(255,0,0,0.85)' />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>
          เชื่อม {platform.name} Account
        </h3>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: '0 0 16px' }}>
          MITA+ จะขอสิทธิ์อ่านข้อมูลแบบ read-only ค่ะ — ไม่มีการโพสต์หรือแก้ไขข้อมูลใดๆ
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18, textAlign: 'left' }}>
          {features.map((f, i) => {
            const Ic = f.icon
            return (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Ic size={11} color={f.color} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: f.muted ? SUBTLE : BODY, lineHeight: 1.4 }}>{f.label}</span>
              </div>
            )
          })}
        </div>
        <button
          type='button'
          onClick={onConnect}
          disabled={loading}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 13,
            border: 'none',
            background: `linear-gradient(135deg, ${CORAL}, #b94a26)`,
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              กำลังเชื่อมต่อ...
            </>
          ) : (
            <>
              <PlayCircle size={14} />
              เชื่อม Google Account
              <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>
      {/* Tip nudge */}
      <div
        style={{
          background: 'rgba(127,119,221,0.05)',
          border: '1px solid rgba(127,119,221,0.2)',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <Info size={14} color={PURPLE} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: BODY, lineHeight: 1.5 }}>
          <span style={{ color: PURPLE, fontWeight: 700 }}>เคล็ดลับ: </span>
          เชื่อม API แล้วยังอัปโหลดรูปเพิ่มได้ค่ะ — จะได้ข้อมูล heatmap และ traffic source ที่ API ให้ไม่ได้
        </div>
      </div>
    </div>
  )
}

// ---------- Sub: API Soon Card ----------
function ApiSoonCard({ platform, onSwitch }: { platform: Platform; onSwitch: () => void }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1.5px dashed rgba(127,119,221,0.3)',
        borderRadius: 18,
        padding: '28px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: 'rgba(216,90,48,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}
      >
        <Construction size={32} color={CORAL} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>
        {platform.name} API — เร็วๆ นี้ค่ะ
      </h3>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.65, margin: '0 0 16px' }}>
        {platform.apiNote}
      </p>
      <button
        type='button'
        onClick={onSwitch}
        style={{
          background: '#FFFFFF',
          border: `1px solid ${CORAL}`,
          color: CORAL,
          fontSize: 13,
          fontWeight: 700,
          padding: '10px 24px',
          borderRadius: 12,
          cursor: 'pointer',
        }}
      >
        ใช้วิธีอัปโหลดรูปแทนค่ะ →
      </button>
    </div>
  )
}

// ---------- Sub: API None Card ----------
function ApiNoneCard({ platform, onSwitch }: { platform: Platform; onSwitch: () => void }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1.5px dashed rgba(0,0,0,0.1)',
        borderRadius: 18,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 999,
          background: 'rgba(107,107,107,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}
      >
        <XCircle size={28} color={SUBTLE} />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>
        {platform.name} ไม่มี Analytics API ฟรีค่ะ
      </h3>
      <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, margin: '0 0 16px' }}>
        {platform.apiNote}
      </p>
      <button
        type='button'
        onClick={onSwitch}
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.1)',
          color: TEXT,
          fontSize: 12,
          fontWeight: 700,
          padding: '9px 20px',
          borderRadius: 10,
          cursor: 'pointer',
        }}
      >
        อัปโหลดรูปแทน →
      </button>
    </div>
  )
}

// ---------- Sub: Upload Mode ----------
// 2G: Takes onUpload + onRemove instead of mock onToggle
function UploadMode({
  platform,
  platformUploads,
  onUpload,
  onRemove,
  requiredCount,
}: {
  platform: Platform
  platformUploads: UploadedFile[]
  onUpload: (stepKey: string, files: FileList | null) => void
  onRemove: (stepKey: string) => void
  requiredCount: number
}) {
  const PIcon = platform.icon
  const uploadedIds = platformUploads.map((u) => u.stepId)
  return (
    <div>
      {/* Platform header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px', marginBottom: 14 }}>
        <PIcon size={18} color={platform.color} />
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{platform.name}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: MUTED, background: 'rgba(0,0,0,0.04)', padding: '2px 8px', borderRadius: 99 }}>
          ต้องการ {requiredCount} ภาพ
        </span>
      </div>

      {/* Steps */}
      {platform.steps.map((step, i) => {
        const uploaded = uploadedIds.includes(step.key)
        const previewUrl = platformUploads.find((u) => u.stepId === step.key)?.preview
        const StepIc = STEP_ICON_MAP[step.icon]
        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            style={{
              background: uploaded ? 'rgba(216,90,48,0.05)' : '#FFFFFF',
              border: uploaded ? '1px solid rgba(216,90,48,0.25)' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: CARD_SHADOW,
              borderRadius: 13,
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div style={{ padding: '11px 13px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <StepIc size={22} color={CORAL} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{step.label}</span>
                  {step.required ? (
                    <span style={{ fontSize: 10, color: CORAL, background: 'rgba(216,90,48,0.12)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
                      จำเป็น
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: SUBTLE, background: 'rgba(0,0,0,0.04)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
                      ไม่บังคับ
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{step.desc}</div>
              </div>

              {/* 2G: CheckCircle when uploaded, file input label when not */}
              {uploaded ? (
                <CheckCircle2 size={18} color={CORAL} style={{ flexShrink: 0 }} />
              ) : (
                <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type='file'
                    accept='image/*'
                    style={{ display: 'none' }}
                    onChange={(e) => onUpload(step.key, e.target.files)}
                  />
                  <div
                    style={{
                      background: TEXT,
                      color: '#FFFFFF',
                      borderRadius: 8,
                      padding: '5px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <Upload size={10} />
                    อัปโหลด
                  </div>
                </label>
              )}
            </div>

            {/* Tip (when not uploaded) */}
            {!uploaded && (
              <div style={{ margin: '0 13px 11px', padding: '7px 10px', background: 'rgba(0,0,0,0.03)', borderRadius: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Lightbulb size={10} color={CORAL} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: MUTED, lineHeight: 1.55 }}>{step.tip}</span>
              </div>
            )}

            {/* 2F: Real image preview (when uploaded) */}
            {uploaded && previewUrl && (
              <div style={{ position: 'relative', margin: '0 13px 11px' }}>
                <img
                  src={previewUrl}
                  alt={step.label}
                  style={{
                    width: '100%',
                    maxHeight: 130,
                    objectFit: 'cover',
                    objectPosition: 'top',
                    borderRadius: 8,
                  }}
                />
                {/* 2G: Remove calls onRemove */}
                <button
                  type='button'
                  onClick={() => onRemove(step.key)}
                  aria-label='ลบรูป'
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={11} color='#FFFFFF' />
                </button>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ---------- Sub: Done State ----------
function DoneState({ platformName }: { platformName: string }) {
  return (
    <div
      style={{
        background: CREAM,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          width: 88,
          height: 88,
          borderRadius: 999,
          background: `linear-gradient(135deg, ${PURPLE}33, ${CORAL}33)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PartyPopper size={56} color={CORAL} />
      </motion.div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>
        วิเคราะห์ช่อง {platformName} สำเร็จแล้วค่ะ!
      </h2>
      <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>กำลังพาไปดูข้อมูลของคุณ...</p>
      <Loader2 size={20} color={CORAL} className='animate-spin' />
    </div>
  )
}

// ---------- Default Export ----------
export default function ConnectChannelPageCream() {
  return (
    <Suspense fallback={<div style={{ background: CREAM, minHeight: '100vh' }} />}>
      <ConnectChannelInner />
    </Suspense>
  )
}
