'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Users, TrendingUp, AlertCircle, Copy, Check } from 'lucide-react'

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
function LeadRow({ lead }: { lead: Lead }) {
  const plan = lead.plan ?? 'free'
  const color = PLAN_COLOR[plan] ?? '#9CA3AF'
  const emoji = PLAN_EMOJI[plan] ?? '📋'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '12px',
        alignItems: 'center',
      }}
    >
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

// ── Main Page ─────────────────────────────────────────────
export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leads')
      const json = await res.json()
      setData(json)
    } catch {
      setData({ ok: false, error: 'ดึงข้อมูลไม่ได้' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const needsSetup = !data?.supabaseOk
  const contactLeads = data?.leads?.filter(l => l.type === 'contact') ?? []
  const auditLeads = data?.leads?.filter(l => l.type === 'audit') ?? []

  return (
    <main style={{ background: '#08080f', minHeight: '100vh', color: '#fff' }}>

      {/* Nav */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,15,0.9)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontWeight: 900, fontSize: '16px',
            background: 'linear-gradient(90deg, #7B61FF, #FF9F1C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MITA+</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)' }}>Admin</span>
        </div>
        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: 'rgba(255,255,255,0.50)',
            fontSize: '12px', cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Setup Guide */}
        {!loading && needsSetup && (
          <SetupGuide
            supabaseOk={data?.supabaseOk ?? false}
            discordOk={data?.discordOk ?? false}
          />
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
              {contactLeads.map(l => <LeadRow key={l.id} lead={l} />)}
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
              {auditLeads.slice(0, 20).map(l => <LeadRow key={l.id} lead={l} />)}
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
