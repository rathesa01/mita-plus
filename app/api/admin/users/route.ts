import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAdminUsersFromDB, createAdminUser, deleteAdminUser, COOKIE } from '@/lib/admin/auth'
import type { AdminRole } from '@/lib/admin/auth'

// ── Guard: owner only ─────────────────────────
async function requireOwner(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return null
  const user = await verifyToken(token)
  if (!user || user.role !== 'owner') return null
  return user
}

// ── GET /api/admin/users — list all ──────────
export async function GET(req: NextRequest) {
  const me = await requireOwner(req)
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const users = await getAdminUsersFromDB()
  // Never return passwords to client
  const safe = users.map(({ password: _p, ...u }) => u)
  return NextResponse.json({ ok: true, users: safe })
}

// ── POST /api/admin/users — create ───────────
export async function POST(req: NextRequest) {
  const me = await requireOwner(req)
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: { username?: string; password?: string; role?: AdminRole; name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { username, password, role, name } = body
  if (!username?.trim() || !password || !role || !name?.trim()) {
    return NextResponse.json({ error: 'กรอกข้อมูลให้ครบค่ะ' }, { status: 400 })
  }
  if (!['owner', 'manager', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Role ไม่ถูกต้อง' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
  }

  const result = await createAdminUser(
    { username: username.trim(), password, role, name: name.trim() },
    me.username
  )
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// ── DELETE /api/admin/users?id=xxx ───────────
export async function DELETE(req: NextRequest) {
  const me = await requireOwner(req)
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ต้องระบุ id' }, { status: 400 })

  const result = await deleteAdminUser(id)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
