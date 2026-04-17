'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) { router.replace('/starter'); return }

    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') ?? '/starter'

    // Implicit flow: Supabase อ่าน #access_token hash อัตโนมัติตอน client init
    // ฟัง onAuthStateChange — เมื่อ SIGNED_IN หรือ INITIAL_SESSION แสดงว่า session พร้อมแล้ว
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // มี session แล้ว → ไปต่อ
        subscription.unsubscribe()
        router.replace(next)
      } else if (event === 'INITIAL_SESSION') {
        // ไม่มี session เลย → กลับ login
        subscription.unsubscribe()
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
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
