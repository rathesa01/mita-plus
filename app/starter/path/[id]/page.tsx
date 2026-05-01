'use client'
// ── Revenue Path Detail Page ─────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/db/supabaseClient'
import RevenuePathDetailPage from '@/components/starter/cream/RevenuePathDetailPage'
import type { RevenuePathDetail, RevenuePathsCache } from '@/types/revenuePath'

export default function PathDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const pathId  = params?.id as string

  const [path,  setPath]  = useState<RevenuePathDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient()
      if (!supabase) { setError('no_client'); return }

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      // 2. Fetch cached revenue_paths from user_profiles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('revenue_paths')
        .eq('id', user.id)
        .single()

      const cache = profile?.revenue_paths as RevenuePathsCache | null
      if (!cache?.paths?.length) {
        setError('no_paths')
        return
      }

      // 3. Find the path by id
      const found = cache.paths.find((p) => p.id === pathId)
      if (!found) {
        setError('not_found')
        return
      }

      setPath(found)
    }

    load()
  }, [pathId, router])

  if (error === 'no_paths' || error === 'not_found') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FFFAF5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
        }}
      >
        <p style={{ fontSize: 15, color: '#1D1D1F', fontWeight: 600 }}>
          {error === 'not_found' ? 'ไม่พบ Revenue Path นี้' : 'ยังไม่มีแผนหารายได้'}
        </p>
        <p style={{ fontSize: 13, color: '#6B6B6B' }}>
          {error === 'not_found'
            ? 'กลับไปหน้าหลักและเลือกทางใหม่'
            : 'กลับไปหน้าแผนเพื่อสร้างแผนหารายได้ก่อนค่ะ'}
        </p>
        <button
          type='button'
          onClick={() => router.push('/starter')}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            background: '#D85A30',
            color: '#fff',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          กลับหน้าหลัก
        </button>
      </div>
    )
  }

  if (!path) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FFFAF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2 size={28} color='#D85A30' className='animate-spin' />
      </div>
    )
  }

  return (
    <RevenuePathDetailPage
      path={path}
      onBack={() => router.push('/starter')}
    />
  )
}
