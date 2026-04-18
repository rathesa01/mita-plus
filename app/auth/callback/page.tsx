'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()
    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') ?? '/starter'

    if (!supabase) { router.replace(next); return }

    let done = false
    let sub: { unsubscribe: () => void } | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    const cleanup = () => {
      done = true
      if (timer) clearTimeout(timer)
      sub?.unsubscribe()
    }

    const handle = async () => {
      // ── getSession() awaits initializePromise ──────────────────────────────
      // Supabase auto-detects hash tokens (#access_token=...) during init.
      // Calling getSession() AFTER init guarantees we get the session.
      const { data: { session } } = await supabase.auth.getSession()

      if (done) return

      if (session) {
        cleanup()
        router.replace(next)
        return
      }

      // ── Fallback: listen for SIGNED_IN (magic link / delayed detection) ───
      timer = setTimeout(() => {
        if (!done) { cleanup(); router.replace('/login') }
      }, 8000)

      const { data } = supabase.auth.onAuthStateChange((event, sess) => {
        if (done) return
        if (sess || event === 'SIGNED_IN') {
          cleanup()
          router.replace(next)
        }
        // ❌ Don't redirect to /login on INITIAL_SESSION
      })
      sub = data.subscription
    }

    handle()
    return cleanup
  }, [router])

  return (
    <div style={{
      background: '#0F0F13', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <Loader2 size={32} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>กำลังเข้าสู่ระบบค่ะ...</p>
    </div>
  )
}
