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

    const go = (path: string) => {
      if (done) return
      done = true
      router.replace(path)
    }

    const handle = async () => {
      // Step 1: parse hash manually
      const hash = window.location.hash.substring(1)
      const hp = new URLSearchParams(hash)
      const at = hp.get('access_token')
      const rt = hp.get('refresh_token')
      const hashError = hp.get('error_description') ?? hp.get('error')

      if (hashError) {
        setDebugMsg(`hash error: ${hashError}`)
        setTimeout(() => go('/login'), 3000)
        return
      }

      setDebugMsg(`hash: AT=${at ? 'YES' : 'NO'} RT=${rt ? 'YES' : 'NO'}`)

      // Step 2: if tokens in hash → setSession directly
      if (at && rt) {
        setDebugMsg('กำลัง setSession...')
        const { data, error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
        if (done) return
        if (error) {
          setDebugMsg(`setSession error: ${error.message}`)
          setTimeout(() => go('/login'), 4000)
          return
        }
        if (data.session) {
          setDebugMsg(`setSession OK ✅ → ${next}`)
          setTimeout(() => go(next), 500)
          return
        }
        setDebugMsg('setSession: session null??')
        setTimeout(() => go('/login'), 3000)
        return
      }

      // Step 3: no hash tokens → try getSession (handles PKCE code in ?code=)
      setDebugMsg('ไม่มี hash tokens → getSession...')
      const { data: { session }, error } = await supabase.auth.getSession()
      if (done) return
      if (error) {
        setDebugMsg(`getSession error: ${error.message}`)
        setTimeout(() => go('/login'), 3000)
        return
      }
      if (session) {
        setDebugMsg(`getSession OK ✅ → ${next}`)
        setTimeout(() => go(next), 500)
        return
      }
      setDebugMsg('ไม่มี session เลย → /login')
      setTimeout(() => go('/login'), 2000)
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
      <p style={{
        color: '#7B61FF', fontSize: '11px', fontFamily: 'monospace',
        maxWidth: '360px', textAlign: 'center', padding: '0 16px',
      }}>{debugMsg}</p>
    </div>
  )
}
