'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RefreshCw, Users, TrendingUp, AlertCircle, Copy, Check, LogOut, Crown, Shield, User, UserPlus, Trash2, X, Eye, EyeOff } from 'lucide-react'
import type { AdminRole } from '@/lib/admin/auth'

// ── Role config ───────────────────────────────────────────
const ROLE_CONFIG: Record<AdminRole, { label: string; color: string; icon: typeof Crown }> = {
  owner:   { label: 'Owner',   color: '#FF9F1C', icon: Crown  },
  manager: { label: 'Manager', color: '#a78bfa', icon: Shield },
  staff:   { label: 'Staff',   color: '#22C55E', icon: User   },
}

// ── Types ─────────────────────────────────────────────────
interface Lead {
  id: string
  created_at: string
  name?: string
  email?: string
  phone?: string
  plan?: string
  score?: number
  revenue_gap?: number
  platform?: string
  niche?: string
  followers?: number
  type: string
}

interface AdminData {
  ok: boolean
  leads?: Lead[]
  total?: number
  error?: string
  setup?: boolean
  supabaseOk?: boolean
  discordOk?: boolean
}

// ── Helpers ───────────────────────────────────────────────
function fmt(n?: number) {
  if (!n) return '—'
  return Math.round(n).toLocaleString('th-TH')
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'เมื่อกี้'
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  return `${Math.floor(h / 24)} วันที่แล้ว`
}

const PLAN_COLOR: Record<string, string> = {
  starter: '#a78bfa',
  pro: '#FF9F1C',
  free: '#6b7280',
  premium: '#FF9F1C',
  report: '#9CA3AF',
  revenue_share: '#22C55E',
}

const PLAN_EMOJI: Record<string, string> = {
  starter: '⭐',
  pro: '👑',
  free: '🆓',
  premium: '🚀',
  report: '📄',
  revenue_share: '💰',
}

// ── Setup Guide ───────────────────────────────────────────
function SetupGuide({ supabaseOk, discordOk }: { supabaseOk: boolean; discordOk: boolean }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const envContent = `# เพิ่มใน .env.local (ใน Vercel → Settings → Environment Variables)

# Supabase — เก็บ leads
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Discord Webhook — แจ้งเตือนทันที
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy`

  return (
    <div style={{
      background: 'rgba(255,159,28,0.06)',
      border: '1px solid rgba(255,159,28,0.25)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <AlertCircle size={18} style={{ color: '#FF9F1C', flexShrink: 0 }} />
        <p style={{ fontWeight: 900, fontSize: '15px', color: '#fff' }}>
          ต้องตั้งค่าก่อนเพื่อดู leads ค่ะ
        </p>
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <StatusChip label="Supabase" ok={supabaseOk} />
        <StatusChip label="Discord" ok={discordOk} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {!supabaseOk && (
          <Step n="1" title="สร้าง Supabase table">
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '10px' }}>
              ไปที่ <a href="https://supabase.com" target="_blank" rel="noopener" style={{ color: '#a78bfa' }}>supabase.com</a> → SQL Editor → รัน:
            </p>
            <CodeBlock
              code={`CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT, email TEXT, phone TEXT,
  plan TEXT, score INT, revenue_gap INT,
  platform TEXT, niche TEXT, followers INT,
  report_price INT, premium_price INT,
  type TEXT
);`}
              onCopy={() => copy('CREATE TABLE leads (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  name TEXT, email TEXT, phone TEXT,\n  plan TEXT, score INT, revenue_gap INT,\n  platform TEXT, niche TEXT, followers INT,\n  report_price INT, premium_price INT,\n  type TEXT\n);', 'sql')}
              copied={copied === 'sql'}
            />
          </Step>
        )}

        {!discordOk && (
          <Step n={supabaseOk ? '1' : '2'} title="สร้าง Discord Webhook (แจ้งเตือนทุก lead)">
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
              Discord Server → Channel Settings → Integrations → Webhooks → New Webhook → Copy URL
            </p>
          </Step>
        )}

        <Step n={(!supabaseOk && !discordOk) ? '3' : (!supabaseOk || !discordOk) ? '2' : '1'} title="เพิ่ม Environment Variables">
          <CodeBlock
            code={envContent}
            onCopy={() => copy(envContent, 'env')}
            copied={copied === 'env'}
          />
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
            Vercel → Project → Settings → Environment Variables → แล้ว Redeploy
          </p>
        </Step>
      </div>
    </div>
  )
}

function StatusChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px',
      background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(255,77,79,0.1)',
      border: `1px solid ${ok ? 'rgba(34,197,94,0.3)' : 'rgba(255,77,79,0.3)'}`,
    }}>
      <span style={{ fontSize: '10px' }}>{ok ? '✅' : '❌'}</span>
      <span style={{ fontSize: '12px', fontWeight: 700, color: ok ? '#22C55E' : '#FF4D4F' }}>{label}</span>
    </div>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'rgba(255,159,28,0.2)', border: '1px solid rgba(255,159,28,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 900, color: '#FF9F1C', flexShrink: 0,
        }}>{n}</div>
        <p style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{title}</p>
      </div>
      <div style={{ paddingLeft: '30px' }}>{children}</div>
    </div>
  )
}

function CodeBlock({ code, onCopy, copied }: { code: string; onCopy: () => void; copied: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.65)',
        overflowX: 'auto',
        lineHeight: 1.6,
        margin: 0,
      }}>{code}</pre>
      <button
        onClick={onCopy}
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 8px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px',
          color: copied ? '#22C55E' : 'rgba(255,255,255,0.5)',
          fontSize: '11px',
        }}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'copied!' : 'copy'}
      </button>
    </div>
  )
}

// ── Lead Row ──────────────────────────────────────────────
function LeadRow({ lead, showApprove }: { lead: Lead; showApprove?: boolean }) {
  const plan = lead.plan ?? 'free'
  const color = PLAN_COLOR[plan] ?? '#9CA3AF'
  const emoji = PLAN_EMOJI[plan] ?? '📋'
  const [approving, setApproving] = useState<string | null>(null)
  const [approveResult, setApproveResult] = useState<'ok' | 'not_found' | null>(null)

  const approve = async (targetPlan: 'starter' | 'pro') => {
    if (!lead.email) return
    setApproving(targetPlan)
    setApproveResult(null)
    try {
      const res = await fetch('/api/admin/approve-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lead.email, plan: targetPlan }),
      })
      const json = await res.json()
      if (res.ok) {
        setApproveResult('ok')
      } else if (json.error === 'not_found') {
        setApproveResult('not_found')
      }
    } finally {
      setApproving(null)
      setTimeout(() => setApproveResult(null), 4000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
        <div>
          {/* Name + plan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
              {lead.name ?? '—'}
            </p>
            <span style={{
              fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: '20px',
              background: `${color}18`, border: `1px solid ${color}40`,
            }}>
              {emoji} {plan}
            </span>
          </div>

          {/* Email */}
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>
            {lead.email ?? '—'}{lead.phone ? ` · ${lead.phone}` : ''}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {lead.score !== undefined && (
              <Tag label="Score" value={`${lead.score}/100`} color="#a78bfa" />
            )}
            {lead.revenue_gap !== undefined && (
              <Tag label="Gap" value={`-฿${fmt(lead.revenue_gap)}/เดือน`} color="#FF4D4F" />
            )}
            {lead.platform && (
              <Tag label="Platform" value={lead.platform} color="#9CA3AF" />
            )}
            {lead.followers && (
              <Tag label="Followers" value={fmt(lead.followers)} color="#9CA3AF" />
            )}
          </div>
        </div>

        {/* Time + type */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)', marginBottom: '4px' }}>
            {timeAgo(lead.created_at)}
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.20)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {lead.type}
          </p>
        </div>
      </div>

      {/* Approve buttons (contact leads only) */}
      {showApprove && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {approveResult === 'ok' && (
            <p style={{ fontSize: '12px', color: '#22C55E', fontWeight: 700 }}>✅ Approve สำเร็จแล้วค่ะ!</p>
          )}
          {approveResult === 'not_found' && (
            <p style={{ fontSize: '12px', color: '#FF9F1C' }}>⚠️ ยังไม่ได้ login เข้าระบบค่ะ — ส่ง magic link ให้ก่อนนะคะ</p>
          )}
          {!approveResult && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => approve('starter')}
                disabled={!!approving}
                style={{
                  padding: '7px 16px', background: '#7B61FF', color: '#fff',
                  border: 'none', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 700, cursor: approving ? 'not-allowed' : 'pointer',
                  opacity: approving === 'pro' ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {approving === 'starter' ? '⏳' : '⭐'} Approve Starter
              </button>
              <button
                onClick={() => approve('pro')}
                disabled={!!approving}
                style={{
                  padding: '7px 16px', background: '#FF9F1C', color: '#fff',
                  border: 'none', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 700, cursor: approving ? 'not-allowed' : 'pointer',
                  opacity: approving === 'starter' ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {approving === 'pro' ? '⏳' : '👑'} Approve Pro
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function Tag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{
      fontSize: '11px', color,
      background: `${color}12`,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      padding: '2px 8px',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.30)', marginRight: '4px' }}>{label}:</span>
      {value}
    </span>
  )
}

// ── User Management (owner only) ─────────────────────────
interface AdminUserRow { id: string; username: string; role: AdminRole; name: string; created_at?: string; created_by?: string }

function UserManagement({ currentUser }: { currentUser: string }) {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({ username: '', password: '', role: 'staff' as AdminRole, name: '' })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formOk, setFormOk] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    setUsers(json.users ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setFormError(''); setFormOk(false)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setFormError(json.error); return }
    setFormOk(true)
    setForm({ username: '', password: '', role: 'staff', name: '' })
    setTimeout(() => { setFormOk(false); setShowForm(false) }, 1200)
    load()
  }

  const deleteUser = async (id: string, username: string) => {
    if (!confirm(`ลบ user "${username}" ใช่ไหมคะ?`)) return
    setDeleting(id)
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontWeight: 900, fontSize: '15px', color: '#FF9F1C' }}>
          👥 จัดการ User ({users.length})
        </h2>
        <button
          onClick={() => { setShowForm(s => !s); setFormError(''); setFormOk(false) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: showForm ? 'rgba(255,77,79,0.10)' : 'rgba(123,97,255,0.12)',
            border: `1px solid ${showForm ? 'rgba(255,77,79,0.30)' : 'rgba(123,97,255,0.35)'}`,
            borderRadius: '8px', padding: '6px 14px',
            color: showForm ? '#FF4D4F' : '#a78bfa',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {showForm ? <><X size={12} /> ยกเลิก</> : <><UserPlus size={12} /> สร้าง User ใหม่</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={createUser}
          style={{
            background: 'rgba(123,97,255,0.06)',
            border: '1px solid rgba(123,97,255,0.25)',
            borderRadius: '14px', padding: '18px',
            marginBottom: '14px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '13px', color: '#a78bfa', marginBottom: '2px' }}>สร้าง User ใหม่</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>ชื่อ</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="เช่น ทีมการตลาด" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Username</label>
              <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="เช่น marketing1" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input required type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="อย่างน้อย 6 ตัว" style={{ ...inputStyle, paddingRight: '36px' }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminRole }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="staff">Staff — ดู leads (ปิด email)</option>
                <option value="manager">Manager — ดู leads + email</option>
                <option value="owner">Owner — สิทธิ์เต็ม</option>
              </select>
            </div>
          </div>

          {formError && <p style={{ fontSize: '12px', color: '#FF4D4F' }}>{formError}</p>}
          {formOk && <p style={{ fontSize: '12px', color: '#22C55E' }}>✅ สร้าง user สำเร็จแล้วค่ะ!</p>}

          <button type="submit" disabled={saving}
            style={{
              height: '42px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7B61FF, #9B6BFF)',
              color: '#fff', fontWeight: 900, fontSize: '13px',
              border: 'none', cursor: saving ? 'wait' : 'pointer',
            }}>
            {saving ? 'กำลังสร้าง...' : '+ สร้าง User'}
          </button>
        </motion.form>
      )}

      {/* Users table */}
      {loading ? (
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.30)' }}>กำลังโหลด...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map(u => {
            const cfg = ROLE_CONFIG[u.role]
            const Icon = cfg.icon
            const isSelf = u.username === currentUser
            return (
              <div key={u.id} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{u.name}</p>
                    {isSelf && <span style={{ fontSize: '10px', color: '#22C55E', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', padding: '2px 8px', borderRadius: '20px' }}>คุณ</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.40)' }}>@{u.username}</p>
                </div>

                {/* Role badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '20px',
                  background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                </div>

                {/* Delete */}
                {!isSelf && (
                  <button
                    onClick={() => deleteUser(u.id, u.username)}
                    disabled={deleting === u.id}
                    style={{
                      background: 'rgba(255,77,79,0.08)', border: '1px solid rgba(255,77,79,0.20)',
                      borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                      color: '#FF4D4F', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}

          {users.length === 0 && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.30)', textAlign: 'center', padding: '20px' }}>
              ยังไม่มี user ในระบบค่ะ — กด "สร้าง User ใหม่" ได้เลย
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700,
  color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: '40px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '10px',
  color: '#fff', padding: '0 12px',
  fontSize: '13px', outline: 'none',
  boxSizing: 'border-box',
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<{ username: string; role: AdminRole; name: string } | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [leadsRes, meRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/me'),
      ])
      const json = await leadsRes.json()
      const meJson = await meRes.json()
      setData(json)
      setMe(meJson.user)
    } catch {
      setData({ ok: false, error: 'ดึงข้อมูลไม่ได้' })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoggingOut(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  useEffect(() => { load() }, [])

  const needsSetup = !data?.supabaseOk
  const role = me?.role ?? 'staff'
  // Staff cannot see full email/phone
  const canSeeContact = role === 'owner' || role === 'manager'
  const canSeeSetup   = role === 'owner'

  const maskEmail = (e?: string) => {
    if (!e) return '—'
    if (canSeeContact) return e
    const [u, d] = e.split('@')
    return `${u.slice(0, 2)}***@${d}`
  }
  const maskPhone = (p?: string) => {
    if (!p) return null
    if (canSeeContact) return p
    return p.slice(0, 3) + '***' + p.slice(-2)
  }

  const contactLeads = data?.leads?.filter(l => l.type === 'contact') ?? []
  const auditLeads = data?.leads?.filter(l => l.type === 'audit') ?? []

  return (
    <main style={{ background: '#08080f', minHeight: '100vh', color: '#fff' }}>

      {/* Nav */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,15,0.92)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontWeight: 900, fontSize: '16px',
            background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MITA+</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>Admin</span>

          {/* Role badge */}
          {me && (() => {
            const cfg = ROLE_CONFIG[me.role]
            const Icon = cfg.icon
            return (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '20px',
                background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
              }}>
                <Icon size={11} style={{ color: cfg.color }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.40)' }}>· {me.name}</span>
              </div>
            )
          })()}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={load}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '6px 12px',
              color: 'rgba(255,255,255,0.45)', fontSize: '12px', cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={logout}
            disabled={loggingOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,77,79,0.08)',
              border: '1px solid rgba(255,77,79,0.20)',
              borderRadius: '8px', padding: '6px 12px',
              color: '#FF4D4F', fontSize: '12px', cursor: 'pointer',
            }}
          >
            <LogOut size={12} />
            ออก
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Setup Guide — owner only */}
        {!loading && needsSetup && canSeeSetup && (
          <SetupGuide
            supabaseOk={data?.supabaseOk ?? false}
            discordOk={data?.discordOk ?? false}
          />
        )}
        {!loading && needsSetup && !canSeeSetup && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.30)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</p>
            <p style={{ fontSize: '14px' }}>รอ Owner ตั้งค่าระบบก่อนนะคะ</p>
          </div>
        )}

        {/* User Management — owner only */}
        {!loading && role === 'owner' && (
          <UserManagement currentUser={me?.username ?? ''} />
        )}

        {/* Stats */}
        {!needsSetup && data?.leads && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Leads ทั้งหมด',        value: data.total ?? 0,            color: '#a78bfa', icon: Users },
              { label: 'Intent to Pay',          value: contactLeads.length,        color: '#FF9F1C', icon: TrendingUp },
              { label: 'Audit ที่ทำ',            value: auditLeads.length,          color: '#22C55E', icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{s.label}</p>
                <p style={{ fontWeight: 900, fontSize: '28px', color: s.color, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Intent to Pay (contact type) */}
        {!needsSetup && contactLeads.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontWeight: 900, fontSize: '15px', color: '#FF9F1C', marginBottom: '12px' }}>
              🔥 Intent to Pay ({contactLeads.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {contactLeads.map(l => (
                <LeadRow key={l.id} showApprove={canSeeContact} lead={{
                  ...l,
                  email: canSeeContact ? l.email : maskEmail(l.email),
                  phone: maskPhone(l.phone) ?? undefined,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Audit leads */}
        {!needsSetup && auditLeads.length > 0 && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '15px', color: '#a78bfa', marginBottom: '12px' }}>
              📊 Audit ล่าสุด ({auditLeads.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {auditLeads.slice(0, 20).map(l => (
                <LeadRow key={l.id} lead={{
                  ...l,
                  email: maskEmail(l.email),
                  phone: maskPhone(l.phone) ?? undefined,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !needsSetup && (data?.leads?.length ?? 0) === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.30)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
            <p style={{ fontSize: '14px' }}>ยังไม่มี leads ค่ะ</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '2px solid rgba(123,97,255,0.2)', borderTopColor: '#7B61FF',
              animation: 'spin 0.8s linear infinite', margin: '0 auto',
            }} />
          </div>
        )}
      </div>
    </main>
  )
}
