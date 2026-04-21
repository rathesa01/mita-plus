'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, RefreshCw, ChevronRight, Zap, TrendingUp, Clock } from 'lucide-react'
import { getSupabaseClient, type UserProfile } from '@/lib/db/supabaseClient'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  easy:   { label: 'เริ่มได้เลย', color: '#22C55E' },
  medium: { label: 'ใช้เวลานิดหน่อย', color: '#FF9F1C' },
  hard:   { label: 'ต้องเตรียมตัว', color: '#f87171' },
}

export default function PlanPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'no_auth' | 'no_plan'>('loading')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStream, setActiveStream] = useState<number | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) { setAuthState('ok'); return }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setAuthState('no_auth'); return }

      const { data } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single()
      if (!data) { setAuthState('no_plan'); return }
      const p = data as UserProfile
      setProfile(p)
      setAuthState(p.plan === 'starter' || p.plan === 'pro' ? 'ok' : 'no_plan')
    }
    init()
  }, [])

  const handleGenerate = async () => {
    if (!profile) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/monetization/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'ไม่สามารถสร้างแผนได้')
      // Reload profile with new plan
      const supabase = getSupabaseClient()
      const { data: updated } = await supabase!.from('user_profiles').select('*').eq('id', profile.id).single()
      if (updated) setProfile(updated as UserProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดค่ะ')
    } finally {
      setGenerating(false)
    }
  }

  // ── Loading ──
  if (authState === 'loading') {
    return (
      <div style={{ background: '#0B0B0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (authState === 'no_auth') {
    router.replace('/login?redirect=/starter/plan')
    return null
  }
  if (authState === 'no_plan') {
    router.replace('/pricing')
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = (profile as any)?.monetization_plan as any
  const channelData = (profile as any)?.channel_data
  const hasChannel = !!channelData && Object.keys(channelData).length > 0
  const displayName = profile?.name ?? profile?.email?.split('@')[0] ?? 'คุณ'

  return (
    <div style={{ background: '#0B0B0F', minHeight: '100vh', color: '#fff', paddingBottom: 100 }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontWeight: 900, fontSize: 16 }}>แผนหาเงินของ{displayName}</span>
        </div>
        {plan && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <RefreshCw size={11} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
            รีเฟรชแผน
          </button>
        )}
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* No plan yet */}
        {!plan && !generating && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>สร้างแผนหาเงินส่วนตัว</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
              MITA+ AI จะอ่านข้อมูลช่องจริงของคุณ<br />
              แล้วสร้างแผนที่เหมาะกับคุณโดยเฉพาะค่ะ
            </p>

            {!hasChannel && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.2)', borderRadius: 12 }}>
                <p style={{ fontSize: 12, color: '#FF9F1C', margin: '0 0 8px', fontWeight: 700 }}>⚠️ ยังไม่ได้เชื่อมช่องค่ะ</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.6 }}>
                  เชื่อมช่องก่อนจะได้แผนที่แม่นยำกว่ามากค่ะ
                </p>
                <button
                  onClick={() => router.push('/starter/connect')}
                  style={{ padding: '8px 16px', background: 'rgba(255,159,28,0.15)', border: '1px solid rgba(255,159,28,0.3)', borderRadius: 8, color: '#FF9F1C', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  เชื่อมช่องก่อน →
                </button>
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              style={{ width: '100%', height: 54, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)', color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Zap size={16} /> สร้างแผนหาเงินของฉัน
            </motion.button>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>ใช้เวลาประมาณ 10-15 วินาทีค่ะ</p>
          </motion.div>
        )}

        {/* Generating */}
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 20px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 48, display: 'inline-block', marginBottom: 20 }}
            >
              🤖
            </motion.div>
            <p style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>MITA+ กำลังวิเคราะห์ช่องของคุณ...</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              อ่าน channel data จริง → เปรียบเทียบแนวช่อง → คำนวณรายได้<br />
              รอสักครู่นะคะ ⏳
            </p>
          </motion.div>
        )}

        {/* Plan ready */}
        {plan && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 20, padding: '18px 16px', background: 'linear-gradient(135deg, rgba(123,97,255,0.15), rgba(62,207,255,0.08))', border: '1px solid rgba(123,97,255,0.3)', borderRadius: 16 }}
            >
              <p style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🤖 MITA+ วิเคราะห์แล้วค่ะ</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.6, margin: '0 0 14px' }}>{plan.headline}</p>

              {/* Total potential */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>รายได้ขั้นต่ำ</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#22C55E' }}>฿{fmt(plan.total_potential_min)}</p>
                </div>
                <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>รายได้สูงสุด</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#a78bfa' }}>฿{fmt(plan.total_potential_max)}</p>
                </div>
              </div>
            </motion.div>

            {/* Audience insight */}
            {plan.audience_insight && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(62,207,255,0.06)', border: '1px solid rgba(62,207,255,0.18)', borderRadius: 12 }}
              >
                <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: '#3ECFFF' }}>👥 Insight จากผู้ชมของคุณ</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{plan.audience_insight}</p>
              </motion.div>
            )}

            {/* Revenue Streams */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                💰 ช่องทางหาเงิน — เรียงตามความเหมาะสม
              </p>

              {(plan.revenue_streams ?? []).map((stream: any, i: number) => {
                const diff = DIFFICULTY_LABEL[stream.difficulty] ?? DIFFICULTY_LABEL.medium
                const isActive = activeStream === i
                return (
                  <motion.div
                    key={stream.id ?? i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ marginBottom: 8 }}
                  >
                    <button
                      onClick={() => setActiveStream(isActive ? null : i)}
                      style={{
                        width: '100%', textAlign: 'left', background: isActive ? 'rgba(123,97,255,0.10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? 'rgba(123,97,255,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: '13px 14px', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Rank */}
                        <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: i === 0 ? 'rgba(255,159,28,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? 'rgba(255,159,28,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                          {i === 0 ? '⭐' : `${i + 1}`}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 16 }}>{stream.icon}</span>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{stream.name}</span>
                            {i === 0 && <span style={{ fontSize: 9, color: '#FF9F1C', background: 'rgba(255,159,28,0.12)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>แนะนำก่อน</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>฿{fmt(stream.monthly_min)}–{fmt(stream.monthly_max)}/เดือน</span>
                            <span style={{ fontSize: 10, color: diff.color, background: `${diff.color}15`, padding: '1px 6px', borderRadius: 99 }}>{diff.label}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <Clock size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{stream.weeks_to_first_income}w</span>
                          <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)', transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '12px 14px', background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)', borderTop: 'none', borderRadius: '0 0 14px 14px', marginTop: -4 }}>
                            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                              💡 {stream.why_fits}
                            </p>
                            <div style={{ padding: '10px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
                              <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: '#22C55E' }}>🚀 เริ่มต้นด้วยการ...</p>
                              <p style={{ margin: 0, fontSize: 12, color: '#fff', fontWeight: 600 }}>{stream.first_action}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* 4-Week Roadmap */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                📅 Roadmap เดือนแรก — ทีละสัปดาห์
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(plan.roadmap ?? []).map((w: any, i: number) => {
                  const colors = ['#22C55E', '#7B61FF', '#FF9F1C', '#3ECFFF']
                  const c = colors[i % colors.length]
                  const isCurrentWeek = i === 0 // week 1 = current
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      style={{ padding: '13px 14px', background: `${c}0A`, border: `1px solid ${c}${isCurrentWeek ? '50' : '25'}`, borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}
                    >
                      {/* Week badge */}
                      <div style={{ flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c}18`, border: `1.5px solid ${c}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 8, color: c, fontWeight: 700, lineHeight: 1 }}>สัปดาห์</span>
                          <span style={{ fontSize: 16, color: c, fontWeight: 900, lineHeight: 1 }}>{w.week}</span>
                        </div>
                        {isCurrentWeek && (
                          <span style={{ fontSize: 8, color: c, fontWeight: 700, marginTop: 3, display: 'block' }}>● ตอนนี้</span>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>{w.theme}</p>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: c, flexShrink: 0 }}>
                            {w.target_thb > 0 ? `฿${fmt(w.target_thb)}` : 'เตรียมตัว'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {(w.actions ?? []).map((action: string, j: number) => (
                            <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                              <span style={{ fontSize: 9, color: c, marginTop: 2, flexShrink: 0 }}>▸</span>
                              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Total month target */}
              {plan.roadmap?.length > 0 && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>เป้าสิ้นเดือน</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#22C55E' }}>
                    ฿{fmt(plan.roadmap[plan.roadmap.length - 1]?.target_thb ?? 0)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Wins */}
            {plan.quick_wins?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginBottom: 20, padding: '14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 14 }}
              >
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#22C55E' }}>⚡ Quick Wins — ทำได้ใน 7 วันนี้เลย</p>
                {plan.quick_wins.map((win: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#22C55E', flexShrink: 0 }}>{i + 1}</span>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{win}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Content tip */}
            {plan.content_tip && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ padding: '12px 14px', background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.18)', borderRadius: 12 }}
              >
                <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: '#FF9F1C' }}>📱 เคล็ดลับ Content สำหรับช่องคุณ</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{plan.content_tip}</p>
              </motion.div>
            )}

            {/* Generated at */}
            {plan.generated_at && (
              <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 16 }}>
                วิเคราะห์เมื่อ {new Date(plan.generated_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
