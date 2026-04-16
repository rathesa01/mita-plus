import { NextRequest, NextResponse } from 'next/server'

// ── Discord webhook helper ──────────────────────
async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) return  // ถ้าไม่มี webhook ก็ข้ามไป (ไม่ error)
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  } catch (e) {
    console.error('[MITA+] Discord notify failed:', e)
  }
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, phone, plan,
      score, revenueGap, platform, niche, followers,
    } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planEmoji = PLAN_EMOJI[plan] ?? '📋'
    const planLabel: Record<string, string> = {
      report:        'Paid Report',
      premium:       'Premium Setup',
      revenue_share: 'Revenue Share',
    }

    // ── Discord notification ─────────────────────
    const msg = [
      `${planEmoji} **INTENT TO PAY — ${planLabel[plan] ?? plan}**`,
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
      ``,
      `⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
    ].filter(Boolean).join('\n')

    await notifyDiscord(msg)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[MITA+] Contact API error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
