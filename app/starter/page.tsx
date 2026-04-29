'use client'
// ── P-010-adapt · Starter Dashboard wrapper — wires Supabase + auth → StarterDashboardV2 ──
// P-010-fix1: Added showFirstVisit, affiliateData, contentExampleData, streak, currentEarned

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CheckInModal from './CheckInModal'
import { getSupabaseClient, type UserProfile } from '@/lib/db/supabaseClient'
import StarterDashboardV2 from '@/components/starter/StarterDashboardV2'
import type { DashboardTab, AuditResult, WeekPlan, CheckinEntry } from '@/types'

// ── Page component ────────────────────────────────────────────────────────────
export default function StarterPage() {
  const router = useRouter()

  const [authState, setAuthState] = useState<'loading' | 'no_auth' | 'no_plan' | 'ok'>('loading')
  const [profile, setProfile]     = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('plan')
  const [checkInOpen, setCheckInOpen]       = useState(false)
  const [coachReply, setCoachReply]         = useState<string | null>(null)
  const [checkinHistory, setCheckinHistory] = useState<CheckinEntry[]>([])
  const [showFirstVisit, setShowFirstVisit] = useState(false)

  const supabase = getSupabaseClient()

  // ── Load profile from Supabase ──────────────────────────────────────────────
  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single()
    if (!data) { setAuthState('no_plan'); return }
    const p = data as UserProfile
    setProfile(p)
    setAuthState(p.plan === 'starter' || p.plan === 'pro' ? 'ok' : 'no_plan')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wc = (p as any).weekly_checkins as { checkins?: CheckinEntry[] } | null
    setCheckinHistory(wc?.checkins ?? [])
  }, [supabase])

  // ── Auth + session init ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) { setAuthState('ok'); return }

    const checkProfile = async (userId: string) => {
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('user_profiles').upsert(
        {
          id:    userId,
          email: userData.user?.email,
          name:  userData.user?.user_metadata?.full_name
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

  // ── First-visit banner (session-scoped, shows once per session) ─────────────
  useEffect(() => {
    if (authState !== 'ok') return
    const key = 'mita_first_visit_dismissed'
    if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
      setShowFirstVisit(true)
    }
  }, [authState])

  const handleDismissFirstVisit = () => {
    setShowFirstVisit(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mita_first_visit_dismissed', '1')
    }
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (authState === 'loading') {
    return (
      <div
        className='flex min-h-screen items-center justify-center font-sans'
        style={{ backgroundColor: '#FFFAF5' }}
        data-theme='light'
      >
        <Loader2 className='h-7 w-7 animate-spin' style={{ color: '#7F77DD' }} />
      </div>
    )
  }

  if (authState === 'no_auth') {
    return (
      <div
        className='flex min-h-screen flex-col items-center justify-center p-6 font-sans'
        style={{ backgroundColor: '#FFFAF5' }}
        data-theme='light'
      >
        <span className='mb-4 text-5xl'>🔐</span>
        <h2 className='mb-2 text-2xl font-semibold text-foreground'>เข้าสู่ระบบก่อนนะคะ</h2>
        <p className='mb-6 text-center text-sm text-muted-foreground leading-relaxed'>
          ต้อง login ก่อนเพื่อเข้าดูแผนของคุณค่ะ
        </p>
        <button
          onClick={() => router.push('/login?redirect=/starter')}
          className='rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background hover:opacity-90'
        >
          เข้าสู่ระบบ →
        </button>
      </div>
    )
  }

  if (authState === 'no_plan') {
    router.replace('/pricing')
    return (
      <div
        className='flex min-h-screen items-center justify-center font-sans'
        style={{ backgroundColor: '#FFFAF5' }}
        data-theme='light'
      >
        <Loader2 className='h-7 w-7 animate-spin' style={{ color: '#7F77DD' }} />
      </div>
    )
  }

  // ── Compute props for StarterDashboardV2 ────────────────────────────────────
  const displayName = profile?.name ?? profile?.email?.split('@')[0] ?? 'คุณ'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audit   = profile?.audit_data as AuditResult | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monPlan = profile?.monetization_plan as { roadmap?: WeekPlan[] } | null

  // dayInJourney: days since paid_at or created_at, capped at 90
  const dayInJourney = (() => {
    const start = profile?.paid_at || profile?.created_at
    if (!start) return 1
    const diff = Math.floor((Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return Math.min(90, Math.max(1, diff + 1))
  })()

  // currentWeek from checkin history
  const completedWeeks = checkinHistory.map(c => c.week_no)
  const currentWeek = completedWeeks.length > 0 ? Math.min(Math.max(...completedWeeks) + 1, 4) : 1

  // hasChannel: has any connected platform data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawChannelData = profile?.channel_data as Record<string, any> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelData: Record<string, any> = (() => {
    if (!rawChannelData) return {}
    if (rawChannelData.platform && rawChannelData.overview && !rawChannelData.tiktok) {
      return { [rawChannelData.platform]: rawChannelData }
    }
    return rawChannelData
  })()
  const connectedPlatforms = Object.keys(channelData).filter(k => channelData[k]?.overview || channelData[k]?.followers)
  const hasChannel = connectedPlatforms.length > 0

  // plan (WeekPlan[]) from monetization_plan.roadmap
  const plan = monPlan?.roadmap ? { roadmap: monPlan.roadmap as WeekPlan[] } : null

  // user score from audit
  const userScore = (audit?.score?.total ?? 0) as number

  // target income for CheckInModal + Milestones
  const targetIncome = Math.round((audit?.revenueEstimation?.realistic ?? 5000) as number)

  // currentEarned: sum of all check-in income_approx
  const currentEarned = checkinHistory.reduce((sum, c) => sum + (c.income_approx ?? 0), 0)

  // streak: consecutive days with check-ins (simple: count of checkin entries as proxy)
  const streak = Math.max(1, checkinHistory.length)

  // affiliate data from profile
  const affiliateData = profile?.affiliate_products ?? null

  // content example data from profile
  const contentExampleData = profile?.content_example ?? null

  // niche + platform from audit input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const niche    = ((audit as any)?.input?.niche    as string | undefined) ?? 'food'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platform = ((audit as any)?.input?.platform as string | undefined) ?? 'tiktok'

  return (
    <div style={{ backgroundColor: '#FFFAF5' }} data-theme='light'>
      <StarterDashboardV2
        user={{ name: displayName, score: userScore, dayInJourney }}
        plan={plan}
        currentWeek={currentWeek}
        checkins={checkinHistory}
        coachReply={coachReply}
        hasAudit={!!audit}
        hasChannel={hasChannel}
        audit={audit}
        activeTab={activeTab}
        onCheckIn={() => setCheckInOpen(true)}
        onTabChange={setActiveTab}
        // Legacy tab props (P-010-fix1)
        userId={profile?.id ?? null}
        niche={niche}
        platform={platform}
        affiliateData={affiliateData as Record<string, unknown> | null}
        contentExampleData={contentExampleData as Record<string, unknown> | null}
        targetIncome={targetIncome}
        showFirstVisit={showFirstVisit}
        onDismissFirstVisit={handleDismissFirstVisit}
        currentEarned={currentEarned}
        streak={streak}
        onConnectChannel={() => router.push('/starter/connect')}
      />

      {/* ── CheckInModal (reused from original) ─────────────────────────── */}
      <CheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onComplete={(msg, result) => {
          setCoachReply(msg)
          setCheckInOpen(false)
          if (result?.allCheckins) setCheckinHistory(result.allCheckins as CheckinEntry[])
        }}
        weekNo={currentWeek}
        creatorName={displayName}
        niche={niche}
        platform={platform.toLowerCase()}
        targetIncome={targetIncome}
        userId={profile?.id ?? null}
        isFirstCheckin={checkinHistory.length === 0}
      />
    </div>
  )
}
