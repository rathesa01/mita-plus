import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = () => new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? 'mita-dev-secret-change-in-prod'
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''

  // Redirect non-www to www (ensures consistent localStorage for Supabase auth)
  if (host === 'mitaplus.com') {
    const url = req.nextUrl.clone()
    url.host = 'www.mitaplus.com'
    return NextResponse.redirect(url, { status: 301 })
  }

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  // Login page is always accessible
  if (pathname === '/admin/login') return NextResponse.next()

  const token = req.cookies.get('mita_admin_session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    await jwtVerify(token, SECRET())
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.delete('mita_admin_session')
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
