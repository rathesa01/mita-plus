'use client'

// ── P-009-adapt · Result page wrapper — wires Supabase + auth → ResultPageV2 ──
// Replaces old dark-theme result page. Backup: page.legacy.tsx
// Auth: /api/auth/line/session (existing LINE OAuth flow)
// Data: /api/results/[id] → sessionStorage fallback

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { AuditResult, ShareChannel } from '@/types'
import ResultPageV2 from '@/components/result/ResultPageV2'
import { getSupabaseClient } from '@/lib/db/supabaseClient'

// ── Inner (needs useSearchParams — must be wrapped in Suspense) ──────────────
function ResultPageInner() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const resultId      = searchParams.get('id')

  const [result,      setResult]      = useState<AuditResult | null>(null)
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)
  const [isPaid,      setIsPaid]      = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Auth check: LINE session OR paid Supabase plan ───────────────────────
  useEffect(() => {
    let done = false

    // Check LINE session (existing)
    fetch('/api/auth/line/session')
      .then(r => r.json())
      .then(({ user }) => { if (!done) setIsLoggedIn(!!user) })
      .catch(() => {})

    // Check Supabase paid plan
    const supabase = getSupabaseClient()
    if (supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session?.user) { if (!done) setAuthLoading(false); return }
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
        if (!done) {
          setIsPaid(profile?.plan === 'starter' || profile?.plan === 'pro')
          setAuthLoading(false)
        }
      }).catch(() => { if (!done) setAuthLoading(false) })
    } else {
      setAuthLoading(false)
    }

    return () => { done = true }
  }, [])

  // ── Load result: DB → sessionStorage fallback ────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (resultId) {
        try {
          const res = await fetch(`/api/results/${resultId}`)
          if (res.ok) {
            const data: AuditResult = await res.json()
            setResult(data)
            sessionStorage.setItem('mita_result', JSON.stringify(data))
            return
          }
        } catch { /* fallthrough */ }
      }
      const raw = sessionStorage.getItem('mita_result')
      if (!raw) { router.push('/audit'); return }
      setResult(JSON.parse(raw))
    }
    load()
  }, [resultId, router])

  // ── Loading state ────────────────────────────────────────────────────────
  if (!result || authLoading) {
    return (
      <div
        className='flex min-h-screen items-center justify-center font-sans'
        style={{ backgroundColor: '#FFFAF5' }}
        data-theme='light'
      >
        <p className='text-sm text-muted-foreground'>กำลังโหลด...</p>
      </div>
    )
  }

  // ── Share handler ────────────────────────────────────────────────────────
  const shareUrl  = resultId ? `${window.location.origin}/r/${resultId}` : window.location.href
  const score     = result.score.total
  const gap       = Math.round(result.revenueEstimation.totalMissed).toLocaleString('th-TH')
  const shareText = `Monetization Score ของฉัน: ${score}/100 🎯\nRevenue Gap: -฿${gap}/เดือน 💸\n\nลองเช็กของคุณที่ mitaplus.com`

  const handleShare = (channel: ShareChannel) => {
    if (channel === 'line') {
      const url = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + shareUrl)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } else if (channel === 'x') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    // 'copy' is handled inside ShareSection component itself
  }

  // ── Auth redirect handlers ────────────────────────────────────────────────
  const handleLineLogin  = () => {
    // preserve result id in return URL so we come back to this result
    const returnUrl = resultId ? `/result?id=${resultId}` : '/result'
    router.push(`/api/auth/line?returnUrl=${encodeURIComponent(returnUrl)}`)
  }
  const handleEmailLogin = () => router.push('/login')
  const handleUpgrade    = () => router.push('/pricing')

  return (
    <>
      {/* Sticky back-to-dashboard button for paid users */}
      {isPaid && (
        <div style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 50,
        }}>
          <button
            type='button'
            onClick={() => router.push('/starter')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#1D1D1F',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            ← กลับ Dashboard
          </button>
        </div>
      )}
      <ResultPageV2
        result={result}
        isLoggedIn={isLoggedIn || isPaid}
        onLineLogin={handleLineLogin}
        onEmailLogin={handleEmailLogin}
        onShare={handleShare}
        onUpgrade={handleUpgrade}
      />
    </>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div
          className='flex min-h-screen items-center justify-center font-sans'
          style={{ backgroundColor: '#FFFAF5' }}
          data-theme='light'
        >
          <p className='text-sm' style={{ color: '#6B6B6B' }}>กำลังโหลด...</p>
        </div>
      }
    >
      <ResultPageInner />
    </Suspense>
  )
}
