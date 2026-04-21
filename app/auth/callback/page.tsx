'use client'
// /auth/callback — client-side page สำหรับ implicit flow
// Browser Supabase client อ่าน hash fragment (#access_token=...) อัตโนมัติ
// Server-side API route ไม่ได้ hash fragment — ต้องจัดการฝั่ง client เท่านั้น
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setStatus('error')
      return
    }

    // Supabase client อ่าน hash/code จาก URL อัตโนมัติ
    // รอ onAuthStateChange event แรก
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // ตรวจ plan แล้ว redirect
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single() as { data: { plan: string } | null, error: unknown }

        if (profile?.plan === 'starter' || profile?.plan === 'pro') {
          router.replace('/starter')
        } else {
          router.replace('/pricing')
        }
      } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        setStatus('error')
        setTimeout(() => router.replace('/login?error=auth_failed'), 2000)
      }
    })

    // Fallback: ถ้า session มีอยู่แล้ว (e.g. magic link INITIAL_SESSION)
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', data.session.user.id)
          .single() as { data: { plan: string } | null, error: unknown }

        if (profile?.plan === 'starter' || profile?.plan === 'pro') {
          router.replace('/starter')
        } else {
          router.replace('/pricing')
        }
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0B0B0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      {status === 'loading' ? (
        <>
          <Loader2
            size={32}
            style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }}
          />
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            กำลังเข้าสู่ระบบ...
          </p>
        </>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: '14px', color: '#FF6B6B' }}>
            เข้าสู่ระบบไม่สำเร็จ กำลังกลับไปหน้า Login...
          </p>
        </>
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
