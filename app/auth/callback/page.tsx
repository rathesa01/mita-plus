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

      // Parse hash fragment manually (#access_token=...&refresh_token=...)
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')

      if (access_token && refresh_token) {
        // ตั้ง session โดยตรง — ข้าม auto-detection ทั้งหมด
        await supabase.auth.setSession({ access_token, refresh_token })
        router.replace(next)
        return
      }

      // fallback: ฟัง onAuthStateChange
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe()
          router.replace(next)
        } else if (event === 'INITIAL_SESSION') {
          subscription.unsubscribe()
          router.replace('/login')
        }
      })

      return () => subscription.unsubscribe()
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
