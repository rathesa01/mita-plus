'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { COLORS } from '@/lib/tokens'
import { getSupabaseClient } from '@/lib/db/supabaseClient'

type Step = 'choose' | 'email' | 'sent'

export default function LoginPage() {
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('/starter')
  const [step, setStep] = useState<Step>('choose')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('redirect')
    if (r) setRedirectTo(r)
  }, [])

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await supabase.from('user_profiles').upsert(
          {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? session.user.email?.split('@')[0],
            plan: 'none',
          } as never,
          { onConflict: 'id', ignoreDuplicates: true }
        )
        router.replace(redirectTo)
      }
    })
    return () => subscription.unsubscribe()
  }, [router, redirectTo])

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })
  }

  const sendMagicLink = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('ระบบยังไม่พร้อมค่ะ กรุณาลองใหม่อีกครั้ง')
      setLoading(false)
      return
    }
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
        shouldCreateUser: true,
      },
    })
    setLoading(false)
    if (err) {
      setError('ส่งลิงก์ไม่ได้ค่ะ กรุณาลองใหม่')
    } else {
      setStep('sent')
    }
  }

  return (
    <div style={{
      background: COLORS.bg, minHeight: '100vh',
      maxWidth: '480px', margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '24px 20px',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <span style={{
          fontSize: '40px', fontWeight: 900,
          background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          MITA+
        </span>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          เข้าสู่ระบบเพื่อดูแผนของคุณค่ะ
        </p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* Step: เลือกวิธี login */}
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
            }}>
              <p style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 900, color: '#fff', textAlign: 'center' }}>
                เลือกวิธีเข้าสู่ระบบค่ะ
              </p>

              {/* Google */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={signInWithGoogle}
                disabled={googleLoading}
                style={{
                  width: '100%', padding: '14px 16px', marginBottom: '12px',
                  background: '#fff', color: '#1a1a1a',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
              >
                {googleLoading ? (
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.4 5.6-5 7.3v6h8.1c4.8-4.4 7.2-10.9 7.2-17.4z"/>
                    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8.1-6c-2.1 1.4-4.8 2.2-7.8 2.2-6 0-11.1-4-12.9-9.5H2.8v6.2C6.8 42.8 14.9 48 24 48z"/>
                    <path fill="#FBBC05" d="M11.1 28.9c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4v-6.2H2.8C1 17.5 0 20.6 0 24s1 6.5 2.8 9.1l8.3-4.2z"/>
                    <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.4l6.5-6.5C35.9 2.4 30.4 0 24 0 14.9 0 6.8 5.2 2.8 12.9l8.3 6.2c1.8-5.5 6.9-9.6 12.9-9.6z"/>
                  </svg>
                )}
                เข้าสู่ระบบด้วย Google
              </motion.button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>หรือ</p>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email magic link */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('email')}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'rgba(123,97,255,0.12)',
                  border: '1.5px solid rgba(123,97,255,0.3)',
                  borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700, color: '#a78bfa',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
              >
                <Mail size={18} />
                เข้าสู่ระบบด้วย Email
              </motion.button>

              <p style={{ margin: '16px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                ไม่ต้องจำรหัสผ่านค่ะ ✨
              </p>
            </div>

            <button
              onClick={() => router.back()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.25)', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '6px',
                margin: '16px auto 0', padding: '8px',
              }}
            >
              <ArrowLeft size={14} /> กลับ
            </button>
          </motion.div>
        )}

        {/* Step: กรอก email */}
        {step === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: 'rgba(123,97,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mail size={20} style={{ color: '#7B61FF' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff' }}>Magic Link</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>ไม่ต้องจำรหัสผ่านค่ะ</p>
                </div>
              </div>

              <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                อีเมลของคุณ
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                placeholder="you@email.com"
                autoFocus
                style={{
                  width: '100%', padding: '14px 16px', marginBottom: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: email ? '1.5px solid #7B61FF' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', fontSize: '16px', color: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />

              {error && (
                <p style={{ margin: '-8px 0 12px', fontSize: '12px', color: '#FF4D4F' }}>{error}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={sendMagicLink}
                disabled={loading || !email.trim()}
                style={{
                  width: '100%', padding: '15px',
                  background: email.trim() ? 'linear-gradient(135deg, #7B61FF, #3ECFFF)' : 'rgba(255,255,255,0.06)',
                  color: email.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700,
                  cursor: email.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> กำลังส่ง...</>
                  : '📩 ส่ง Magic Link ให้ฉัน'
                }
              </motion.button>
            </div>

            <button
              onClick={() => setStep('choose')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.25)', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '6px',
                margin: '16px auto 0', padding: '8px',
              }}
            >
              <ArrowLeft size={14} /> เลือกวิธีอื่น
            </button>
          </motion.div>
        )}

        {/* Step: ส่งแล้ว */}
        {step === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              style={{ fontSize: '64px', lineHeight: 1, marginBottom: '20px' }}
            >
              📩
            </motion.div>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
              เช็คอีเมลได้เลยค่ะ!
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              ส่ง Magic Link ไปที่<br />
              <span style={{ color: '#7B61FF', fontWeight: 700 }}>{email}</span><br />
              แล้วค่ะ
            </p>
            <div style={{
              padding: '16px 20px',
              background: 'rgba(123,97,255,0.06)',
              border: '1px solid rgba(123,97,255,0.2)',
              borderRadius: '16px', marginBottom: '20px', textAlign: 'left',
            }}>
              {['1. เปิดอีเมลของคุณ', '2. หาเมลจาก MITA+', '3. กด "เข้าสู่ระบบ" ในเมล', '4. กลับมาที่นี่โดยอัตโนมัติค่ะ ✨'].map((s, i) => (
                <p key={i} style={{ margin: i === 3 ? '0' : '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{s}</p>
              ))}
            </div>
            <button
              onClick={() => { setStep('choose'); setEmail('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}
            >
              กลับหน้าหลัก
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
