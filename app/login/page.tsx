'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import MitaLogo from '@/app/components/MitaLogo'

export default function LoginPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [mode, setMode] = useState<'choose' | 'magic' | 'sent'>('choose')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── ถ้า login อยู่แล้ว redirect ─────────────────
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) redirectAfterLogin(data.session.user.id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const redirectAfterLogin = async (userId: string) => {
    if (!supabase) { router.replace('/starter'); return }
    const { data } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', userId)
      .single() as { data: { plan: string } | null, error: unknown }
    if (data?.plan === 'starter' || data?.plan === 'pro') {
      router.replace('/starter')
    } else {
      router.replace('/pricing')
    }
  }

  // ── Google OAuth ──────────────────────────────
  const loginWithGoogle = async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  // ── Magic Link ────────────────────────────────
  const sendMagicLink = async () => {
    if (!supabase || !email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMode('sent')
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#0B0B0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <MitaLogo size="lg" />
          </a>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            เข้าสู่ระบบเพื่อดู dashboard ของคุณ
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── SENT ─────────────────────────── */}
          {mode === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '32px 24px', borderRadius: '20px', textAlign: 'center',
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              <CheckCircle2 size={40} style={{ color: '#22C55E', margin: '0 auto 16px' }} />
              <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                ส่ง Link ไปแล้วค่ะ!
              </p>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                เช็กอีเมล <strong style={{ color: '#fff' }}>{email}</strong><br />
                กด Link ในเมลเพื่อเข้าสู่ระบบได้เลยค่ะ
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                ไม่เจอ? เช็ก Spam หรือ{' '}
                <button
                  onClick={() => setMode('magic')}
                  style={{ background: 'none', border: 'none', color: '#7B61FF', cursor: 'pointer', fontSize: '11px', padding: 0, textDecoration: 'underline' }}
                >
                  ส่งใหม่
                </button>
              </p>
            </motion.div>
          )}

          {/* ── CHOOSE / MAGIC ───────────────── */}
          {mode !== 'sent' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '28px 24px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Google */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={loginWithGoogle}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  background: '#fff', border: 'none', borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                  เข้าสู่ระบบด้วย Google
                </span>
              </motion.button>

              {/* LINE Login */}
              <motion.a
                href="/api/auth/line?redirect=/api/auth/line/smart-redirect"
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '14px', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  background: '#06C755', border: 'none', borderRadius: '12px',
                  cursor: 'pointer', textDecoration: 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  เข้าสู่ระบบด้วย LINE
                </span>
              </motion.a>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>หรือ</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Magic Link */}
              <AnimatePresence mode="wait">
                {mode === 'choose' ? (
                  <motion.button
                    key="magic-btn"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('magic')}
                    style={{
                      width: '100%', padding: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', cursor: 'pointer',
                    }}
                  >
                    <Mail size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                      เข้าด้วย Email (Magic Link)
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="magic-form"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                      placeholder="อีเมลของคุณ"
                      autoFocus
                      style={{
                        width: '100%', padding: '13px 14px', marginBottom: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px', fontSize: '14px', color: '#fff', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={sendMagicLink}
                      disabled={loading || !email.trim()}
                      style={{
                        width: '100%', padding: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: email.trim() ? 'linear-gradient(135deg, #7B61FF, #3ECFFF)' : 'rgba(255,255,255,0.06)',
                        border: 'none', borderRadius: '12px',
                        cursor: email.trim() && !loading ? 'pointer' : 'not-allowed',
                        color: email.trim() ? '#fff' : 'rgba(255,255,255,0.25)',
                        fontSize: '14px', fontWeight: 700,
                      }}
                    >
                      {loading
                        ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        : <><Mail size={15} />&nbsp;ส่ง Magic Link <ArrowRight size={14} /></>
                      }
                    </motion.button>
                    <button
                      onClick={() => setMode('choose')}
                      style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ← ย้อนกลับ
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#FF6B6B', textAlign: 'center' }}>
                  {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
          ยังไม่มีบัญชี?{' '}
          <a href="/audit" style={{ color: '#7B61FF', textDecoration: 'none' }}>
            เริ่มต้นฟรีที่นี่ →
          </a>
        </p>
      </motion.div>
    </main>
  )
}
