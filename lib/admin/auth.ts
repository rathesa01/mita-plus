import { SignJWT, jwtVerify } from 'jose'

export type AdminRole = 'owner' | 'manager' | 'staff'

export interface AdminUser {
  username: string
  role: AdminRole
  name: string
}

export interface AdminUserWithPass extends AdminUser {
  password: string
}

const COOKIE = 'mita_admin_session'
const getSecret = () => new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? 'mita-dev-secret-change-in-prod'
)

// ── Parse users from env ──────────────────────
export function getAdminUsers(): AdminUserWithPass[] {
  try {
    const raw = process.env.ADMIN_USERS ?? '[]'
    return JSON.parse(raw)
  } catch { return [] }
}

// ── Validate login ────────────────────────────
export function validateCredentials(username: string, password: string): AdminUser | null {
  const users = getAdminUsers()
  const user = users.find(u => u.username === username && u.password === password)
  if (!user) return null
  return { username: user.username, role: user.role, name: user.name }
}

// ── Sign JWT ──────────────────────────────────
export async function signToken(user: AdminUser): Promise<string> {
  return new SignJWT({ username: user.username, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

// ── Verify JWT ────────────────────────────────
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
