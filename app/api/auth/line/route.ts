import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/line?redirect=/result/xxx
 * สร้าง LINE OAuth URL แล้ว redirect ไปให้ user authorize
 */
export async function GET(req: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID
  if (!channelId) {
    return NextResponse.json({ error: 'LINE_CHANNEL_ID not set' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const redirect = searchParams.get('redirect') ?? '/'

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mitaplus.com'
  const callbackUrl = `${origin}/api/auth/line/callback`

  // state = เก็บ redirect path ไว้ใช้หลัง login
  const state = Buffer.from(JSON.stringify({ redirect, ts: Date.now() })).toString('base64url')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: channelId,
    redirect_uri: callbackUrl,
    state,
    scope: 'profile openid',
  })

  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
