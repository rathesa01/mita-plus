import { SignJWT, jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export type AdminRole = 'owner' | 'manager' | 'staff'

export interface AdminUser {
  id?: string
  username: string
  role: AdminRole
  name: string
}

export interface AdminUserWithPass extends AdminUser {
  password: string
  created_at?: string
  created_by?: string
}

const COOKIE = 'mita_admin_session'
const getSecret = () => new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? 'mita-dev-secret-change-in-prod'
)

// ── Supabase client ───────────────────────────
function getDB() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// ── Get all admin users from DB ───────────────
export async function getAdminUsersFromDB(): Promise<AdminUserWithPass[]> {
  const db = getDB()
  if (!db) return []
  const { data } = await db
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: true })
  return (data ?? []) as AdminUserWithPass[]
}

// ── Validate login (DB first, env fallback) ───
export async function validateCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  // 1) Try Supabase
  const db = getDB()
  if (db) {
    const { data } = await db
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()
    if (data) return { id: data.id, username: data.username, role: data.role, name: data.name }
  }

  // 2) Fallback to ADMIN_USERS env var
  try {
    const users: AdminUserWithPass[] = JSON.parse(process.env.ADMIN_USERS ?? '[]')
    const user = users.find(u => u.username === username && u.password === password)
    if (user) return { username: user.username, role: user.role, name: user.name }
  } catch { /* ignore */ }

  return null
}

// ── Create user ───────────────────────────────
export async function createAdminUser(
  data: { username: string; password: string; role: AdminRole; name: string },
  createdBy: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDB()
  if (!db) return { ok: false, error: 'Supabase ไม่ได้ตั้งค่าค่ะ' }

  const { error } = await db.from('admin_users').insert({
    username: data.username,
    password: data.password,
    role: data.role,
    name: data.name,
    created_by: createdBy,
  })

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Username นี้มีอยู่แล้วค่ะ' }
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

// ── Delete user ───────────────────────────────
export async function deleteAdminUser(id: string): Promise<{ ok: boolean; error?: string }> {
  const db = getDB()
  if (!db) return { ok: false, error: 'Supabase ไม่ได้ตั้งค่าค่ะ' }
  const { error } = await db.from('admin_users').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ── Sign / Verify JWT ─────────────────────────
export async function signToken(user: AdminUser): Promise<string> {
  return new SignJWT({ username: user.username, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      username: payload.username as string,
      role: payload.role as AdminRole,
      name: payload.name as string,
    }
  } catch { return null }
}

export { COOKIE }
