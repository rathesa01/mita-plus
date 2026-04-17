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
      if (!supabase) { router.replace('/starter'); return }

      // รับ code จาก URL query
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const next = params.get('next') ?? '/starter'

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      router.replace(next)
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
