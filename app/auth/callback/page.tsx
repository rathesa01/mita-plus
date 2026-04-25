'use client'
// /auth/callback — handles both PKCE (?code=) and implicit (#access_token) flows
// Supabase JS v2 SDK exchanges PKCE code automatically via onAuthStateChange
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

async function redirectByPlan(supabase: NonNullable<ReturnType<typeof getSupabaseClient>>, userId: string, replace: (url: string) => void) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('id', userId)
    .single() as { data: { plan: string } | null, error: unknown }

  if (profile?.plan === 'starter' || profile?.plan === 'pro') {
    replace('/starter')
  } else {
    replace('/pricing')
  }
}

function CallbackInner() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) { setStatus('error'); return }

    // ตรวจ error ใน URL hash (e.g. #error=server_error)
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const desc = params.get('error_description') ?? params.get('error') ?? 'เข้าสู่ระบบไม่สำเร็จ'
      setErrMsg(decodeURIComponent(desc.replace(/\+/g, ' ')))
      setStatus('error')
      setTimeout(() => router.replace('/login?error=auth_failed'), 3000)
      return
    }

    // ── PKCE: Supabase SDK จัดการ code exchange อัตโนมัติผ่าน onAuthStateChange ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await redirectByPlan(supabase, session.user.id, router.replace)
      } else if (event === 'SIGNED_OUT') {
        setStatus('error')
        setTimeout(() => router.replace('/login?error=auth_failed'), 2000)
      }
    })

    // Fallback: session อาจมีอยู่แล้ว (INITIAL_SESSION fired ก่อน subscribe)
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        await redirectByPlan(supabase, data.session.user.id, router.replace)
      }
    })

    // Timeout 15 วินาที — ถ้ายังไม่ได้ session เลย ให้กลับ login
    const timeout = setTimeout(() => {
      setStatus('error')
      router.replace('/login?error=timeout')
    }, 15000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main style={{
      minHeight: '100vh', background: '#0B0B0F',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      {status === 'loading' ? (
        <>
          <Loader2 size={32} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            กำลังเข้าสู่ระบบ...
          </p>
        </>
      ) : (
        <>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <p style={{ margin: 0, fontSize: '14px', color: '#FF6B6B', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
            {errMsg ?? 'เข้าสู่ระบบไม่สำเร็จ'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>กำลังกลับไปหน้า Login...</p>
        </>
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    }>
      <CallbackInner />
    </Suspense>
  )
}
