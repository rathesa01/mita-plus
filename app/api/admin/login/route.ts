import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, signToken, COOKIE } from '@/lib/admin/auth'

export async function POST(req: NextRequest) {
  let username: string, password: string
  try {
    const body = await req.json()
    username = body.username?.trim()
    password = body.password
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'กรุณากรอก username และ password' }, { status: 400 })
  }

  const user = validateCredentials(username, password)
  if (!user) {
    return NextResponse.json({ error: 'Username หรือ Password ไม่ถูกต้อง' }, { status: 401 })
  }

  const token = await signToken(user)

  const res = NextResponse.json({ ok: true, user })
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
