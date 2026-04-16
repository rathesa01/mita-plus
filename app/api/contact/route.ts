import { NextRequest, NextResponse } from 'next/server'
import { ContactSchema } from '@/lib/validation/schemas'
import { saveLead } from '@/lib/db/supabase'

// ── Discord helper ──────────────────────────────
async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  } catch { /* fire-and-forget */ }
}

function fmt(n?: number) {
  if (!n) return '?'
  return Math.round(n).toLocaleString('th-TH')
}

const PLAN_EMOJI: Record<string, string> = {
  report:        '📄',
  premium:       '🚀',
  revenue_share: '💰',
}

const PLAN_LABEL: Record<string, string> = {
  report:        'Paid Report',
  premium:       'Premium Setup',
  revenue_share: 'Revenue Share',
}

export async function POST(req: NextRequest) {
  // ── Parse + validate ──────────────────────────
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ContactSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const {
    name, email, phone, plan,
    score, revenueGap, platform, niche, followers,
    reportPrice, premiumPrice,
  } = parsed.data

  const planEmoji = PLAN_EMOJI[plan] ?? '📋'
  const planLabel = PLAN_LABEL[plan] ?? plan

  try {
    // ── Supabase + Discord (parallel) ─────────────
    await Promise.all([
      saveLead({
        type: 'contact',
        name, email, phone: phone || undefined,
        plan, score, revenue_gap: revenueGap,
        platform, niche, followers,
        report_price: reportPrice,
        premium_price: premiumPrice,
      }),

      notifyDiscord([
        `${planEmoji} **INTENT TO PAY — ${planLabel}**`,
        ``,
        `👤 **ชื่อ:** ${name}`,
        `📧 **อีเมล:** ${email}`,
        phone ? `📱 **โทร:** ${phone}` : null,
        ``,
        `📊 **Score:** ${score ?? '?'}/100`,
        `💸 **Revenue Gap:** ฿${fmt(revenueGap)}/เดือน`,
        platform ? `🎵 **Platform:** ${platform}` : null,
        niche ? `🎯 **Niche:** ${niche}` : null,
        followers ? `👥 **Followers:** ${Number(followers).toLocaleString('th-TH')}` : null,
        reportPrice ? `📄 **Report Price:** ฿${fmt(reportPrice)}` : null,
        premiumPrice ? `🚀 **Premium Price:** ฿${fmt(premiumPrice)}` : null,
        ``,
        `⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
      ].filter(Boolean).join('\n')),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[MITA+] Contact API error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
