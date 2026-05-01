// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PartyPopper, CheckCircle2, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/db/supabaseClient'

export default function SubscribeSuccess() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseClient()
      let userId: string | null = null
      let userEmail: string | null = null

      try {
        // Link audit data to user account if available in localStorage
        const auditRaw = localStorage.getItem('mitaplus_audit')
        const { data: { session } } = await (supabase?.auth.getSession() ?? Promise.resolve({ data: { session: null } }))
        userId = session?.user?.id ?? null
        userEmail = session?.user?.email ?? null

        if (userId && supabase && auditRaw) {
          await supabase.from('user_profiles').update({
            audit_data: JSON.parse(auditRaw),
          } as any).eq('id', userId)
          localStorage.removeItem('mitaplus_audit')
        }
      } catch (e) {
        console.error('Failed to save audit data:', e)
      }

      setReady(true)

      // After 2.5s: check if user has done an audit — if not, force onboarding
      setTimeout(async () => {
        if (!supabase || !userId) { router.replace('/starter'); return }

        try {
          const orFilter = [
            userId ? `user_id.eq.${userId}` : null,
            userEmail ? `input->>email.eq.${userEmail}` : null,
          ].filter(Boolean).join(',')

          const { count } = await supabase
            .from('audit_results')
            .select('*', { count: 'exact', head: true })
            .or(orFilter)

          if (count && count > 0) {
            router.replace('/starter')
          } else {
            // Paid but no audit — force onboarding
            router.replace('/audit?onboarding=1')
          }
        } catch {
          router.replace('/starter')
        }
      }, 2500)
    }

    // Give webhook a moment to process payment first
    const t = setTimeout(run, 1000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div style={{
      background: '#FFFAF5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      gap: '0',
    }}>
      {/* Icon circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(216,90,48,0.12) 0%, rgba(216,90,48,0.06) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <PartyPopper size={44} color='#D85A30' strokeWidth={1.6} />
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{
          margin: '0 0 12px',
          fontSize: 22,
          fontWeight: 800,
          color: '#1D1D1F',
          textAlign: 'center',
          letterSpacing: '-0.3px',
          lineHeight: 1.3,
        }}
      >
        ยินดีต้อนรับสู่ MITA+!
      </motion.h1>

      {/* Check + status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 28,
        }}
      >
        <CheckCircle2 size={15} color='#D85A30' strokeWidth={2} />
        <span style={{ fontSize: 14, color: '#D85A30', fontWeight: 600 }}>
          ชำระเงินสำเร็จค่ะ
        </span>
      </motion.div>

      {/* Loading spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0.4 }}
        transition={{ delay: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <Loader2
          size={16}
          color='#D85A30'
          strokeWidth={2}
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <span style={{ fontSize: 13, color: 'rgba(29,29,31,0.45)', fontWeight: 500 }}>
          {ready ? 'กำลังพาไปหน้าแผนของคุณ...' : 'กำลังเตรียมแผนของคุณ...'}
        </span>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
