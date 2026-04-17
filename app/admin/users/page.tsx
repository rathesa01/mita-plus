'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react'
import { COLORS, CARD } from '@/lib/tokens'
import { getSupabaseClient, type UserProfile } from '@/lib/db/supabaseClient'

const PLAN_COLOR: Record<string, string> = {
  none: 'rgba(255,255,255,0.25)',
  starter: '#7B61FF',
  pro: '#FF9F1C',
}

const PLAN_LABEL: Record<string, string> = {
  none: 'รอ approve',
  starter: 'Starter ✅',
  pro: 'Pro ✅',
}

export default function AdminUsersPage() {
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)

  const login = () => {
    if (adminKey === process.env.NEXT_PUBLIC_ADMIN_HINT || adminKey.length > 6) {
      setAuthed(true)
      fetchUsers()
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) { setLoading(false); return }

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    setUsers((data as UserProfile[]) ?? [])
    setLoading(false)
  }

  const approve = async (userId: string, plan: 'starter' | 'pro') => {
    setApproving(userId)
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan, adminKey }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
      }
    } finally {
      setApproving(null)
    }
  }

  if (!authed) {
    return (
      <div style={{
        background: COLORS.bg, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 900, color: '#fff' }}>
            🔐 Admin
          </p>
          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Admin key..."
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', marginBottom: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', fontSize: '15px', color: '#fff',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={login}
            style={{
              width: '100%', padding: '14px', background: '#7B61FF', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            เข้าระบบ
          </button>
        </div>
      </div>
    )
  }

  const pending = users.filter(u => u.plan === 'none')
  const approved = users.filter(u => u.plan !== 'none')

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>👥 User Management</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            {pending.length} รอ approve · {approved.length} active
          </p>
        </div>
        <button
          onClick={fetchUsers}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '8px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 size={24} style={{ color: '#7B61FF', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🔔 รอ Approve ({pending.length})
          </p>
          {pending.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                ...CARD.orange,
                padding: '14px 16px', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  {u.name || '—'}
                </p>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{u.email}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {u.platform && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{u.platform}</span>}
                  {u.niche && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{u.niche}</span>}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                    {new Date(u.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => approve(u.id, 'starter')}
                  disabled={approving === u.id}
                  style={{
                    padding: '8px 14px', background: '#7B61FF', color: '#fff',
                    border: 'none', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  {approving === u.id
                    ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    : <CheckCircle2 size={12} />
                  }
                  Starter
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => approve(u.id, 'pro')}
                  disabled={approving === u.id}
                  style={{
                    padding: '8px 14px', background: '#FF9F1C', color: '#fff',
                    border: 'none', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700,
                  }}
                >
                  Pro
                </motion.button>
              </div>
            </motion.div>
          ))}
        </>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <>
          <p style={{ margin: '20px 0 10px', fontSize: '11px', fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ✅ Active ({approved.length})
          </p>
          {approved.map((u, i) => (
            <div
              key={u.id}
              style={{
                ...CARD.base,
                padding: '12px 16px', marginBottom: '6px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>{u.name || '—'}</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{u.email}</p>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: PLAN_COLOR[u.plan],
                background: `${PLAN_COLOR[u.plan]}15`,
                padding: '4px 10px', borderRadius: '99px',
              }}>
                {PLAN_LABEL[u.plan]}
              </span>
            </div>
          ))}
        </>
      )}

      {!loading && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}>
          <Clock size={32} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0 }}>ยังไม่มี user ค่ะ</p>
        </div>
      )}
    </div>
  )
}
