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

// ── Inner (needs useSearchParams — must be wrapped in Suspense) ──────────────
function ResultPageInner() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const resultId      = searchParams.get('id')

  const [result,      setResult]      = useState<AuditResult | null>(null)
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Auth check (LINE session) ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/line/session')
      .then(r => r.json())
      .then(({ user }) => setIsLoggedIn(!!user))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setAuthLoading(false))
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
    <ResultPageV2
      result={result}
      isLoggedIn={isLoggedIn}
      onLineLogin={handleLineLogin}
      onEmailLogin={handleEmailLogin}
      onShare={handleShare}
      onUpgrade={handleUpgrade}
    />
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
