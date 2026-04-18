'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [debugMsg, setDebugMsg] = useState('กำลังเข้าสู่ระบบค่ะ...')

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
      setDebugMsg('กำลังตรวจสอบ session...')

      // getSession() awaits initializePromise which includes detectSessionFromUrl()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (done) return

      if (error) {
        setDebugMsg(`getSession error: ${error.message}`)
        setTimeout(() => { cleanup(); router.replace('/login') }, 3000)
        return
      }

      if (session) {
        setDebugMsg(`มี session แล้ว! → ไป ${next}`)
        setTimeout(() => { cleanup(); router.replace(next) }, 500)
        return
      }

      // No session yet — wait for SIGNED_IN via onAuthStateChange
      setDebugMsg('รอ SIGNED_IN event...')

      timer = setTimeout(() => {
        if (!done) {
          setDebugMsg('timeout 8s — ไม่พบ session → ไป /login')
          setTimeout(() => { cleanup(); router.replace('/login') }, 2000)
        }
      }, 8000)

      const { data } = supabase.auth.onAuthStateChange((event, sess) => {
        if (done) return
        setDebugMsg(`event: ${event} | session: ${sess ? 'YES' : 'NO'}`)
        if (sess || event === 'SIGNED_IN') {
          cleanup()
          router.replace(next)
        }
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
      <p style={{
        color: '#7B61FF', fontSize: '11px', fontFamily: 'monospace',
        maxWidth: '360px', textAlign: 'center', padding: '0 16px',
      }}>{debugMsg}</p>
    </div>
  )
}
