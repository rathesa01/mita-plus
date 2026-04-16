'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'เข้าสู่ระบบไม่สำเร็จ')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('เกิดข้อผิดพลาด ลองใหม่อีกครั้งค่ะ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      background: '#08080f', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '380px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7B61FF22, #FF9F1C22)',
            border: '1px solid rgba(123,97,255,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <Lock size={22} style={{ color: '#a78bfa' }} />
          </div>
          <p style={{
            fontWeight: 900, fontSize: '20px',
            background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MITA+ Admin</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            เฉพาะทีมงานเท่านั้นค่ะ
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Username
            </label>
            <input
              required
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="กรอก username"
              style={{
                width: '100%', height: '48px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '12px',
                color: '#fff', padding: '0 16px',
                fontSize: '15px', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.50)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="กรอก password"
                style={{
                  width: '100%', height: '48px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '12px',
                  color: '#fff', padding: '0 44px 0 16px',
                  fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.50)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', display: 'flex',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(255,77,79,0.08)', border: '1px solid rgba(255,77,79,0.25)',
            }}>
              <p style={{ color: '#FF4D4F', fontSize: '13px' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            style={{
              width: '100%', height: '50px', borderRadius: '12px',
              background: loading || !username.trim() || !password
                ? 'rgba(123,97,255,0.30)'
                : 'linear-gradient(135deg, #7B61FF, #9B6BFF)',
              color: '#fff', fontWeight: 900, fontSize: '15px',
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.18)', marginTop: '24px' }}>
          MITA+ Internal · ห้ามแชร์รหัสผ่าน
        </p>
      </motion.div>
    </main>
  )
}
