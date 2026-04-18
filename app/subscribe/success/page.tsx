'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/lib/db/supabaseClient'

export default function SubscribeSuccess() {
  const router = useRouter()
  const [statusText, setStatusText] = useState('กำลังเตรียมแผนของคุณ...')

  useEffect(() => {
    const run = async () => {
      try {
        // Link audit data to user account if available in localStorage
        const auditRaw = localStorage.getItem('mitaplus_audit')
        if (auditRaw) {
          const supabase = getSupabaseClient()
          const { data: { session } } = await (supabase?.auth.getSession() ?? Promise.resolve({ data: { session: null } }))
          const userId = session?.user?.id

          if (userId && supabase) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await supabase.from('user_profiles').update({
              audit_data: JSON.parse(auditRaw),
            } as any).eq('id', userId)
            localStorage.removeItem('mitaplus_audit')
          }
        }
      } catch (e) {
        console.error('Failed to save audit data:', e)
      }

      setStatusText('พร้อมแล้ว! กำลังพาไปหน้าแผนของคุณ...')
      setTimeout(() => router.replace('/starter'), 1500)
    }

    // Give webhook a moment to process payment first
    const t = setTimeout(run, 1500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div style={{
      background: '#0F0F13', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', gap: '16px',
    }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ fontSize: '72px', lineHeight: 1 }}
      >
        🎉
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#fff', textAlign: 'center' }}
      >
        ยินดีต้อนรับสู่ MITA+!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.7 }}
      >
        ชำระเงินสำเร็จค่ะ ✅<br />
        {statusText}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: '8px', padding: '3px 3px',
          background: 'rgba(123,97,255,0.15)',
          borderRadius: '99px', width: '200px',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.8, ease: 'linear', delay: 0.3 }}
          style={{ height: '4px', background: 'linear-gradient(90deg, #7B61FF, #3ECFFF)', borderRadius: '99px' }}
        />
      </motion.div>
    </div>
  )
}
