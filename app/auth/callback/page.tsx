'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = getSupabaseClient()
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') ?? '/starter'

      if (!supabase) { router.replace(next); return }

      // ── 1. PKCE flow: ?code=xxx ────────────────────────────────────────
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(next)
        } else {
          router.replace('/login')
        }
        return
      }

      // ── 2. Implicit flow: #access_token=...&refresh_token=... ──────────
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (!error) {
          router.replace(next)
        } else {
          router.replace('/login')
        }
        return
      }

      // ── 3. Fallback: magic link หรือ session ที่มีอยู่แล้ว ─────────────
      // ⚠️ อย่า redirect ไป /login ใน INITIAL_SESSION เพราะหน้านี้คือ callback!
      // รอ SIGNED_IN แล้วค่อย redirect — ถ้า 6 วินาทียังไม่มี ให้ไป /login
      let redirected = false
      const timer = setTimeout(() => {
        if (!redirected) {
          redirected = true
          subscription.unsubscribe()
          router.replace('/login')
        }
      }, 6000)

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && !redirected) {
          redirected = true
          clearTimeout(timer)
          subscription.unsubscribe()
          router.replace(next)
        }
        // ❌ ไม่ redirect ไป /login ใน INITIAL_SESSION — ให้รอ timer แทน
      })

      return () => {
        clearTimeout(timer)
        subscription.unsubscribe()
      }
    }

    handle()
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
