import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/line/session
 * คืน LINE user จาก cookie (ถ้า login แล้ว)
 */
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('mita_line_session')?.value
  if (!cookie) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = JSON.parse(cookie)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}

/**
 * DELETE /api/auth/line/session
 * Logout — clear cookie
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('mita_line_session', '', {
    maxAge: 0,
    path: '/',
  })
  return response
}
