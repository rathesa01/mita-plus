// Simple in-memory rate limiter — ดีพอสำหรับ Vercel serverless
// แต่ละ function instance track แยกกัน (ไม่ global แต่ลด abuse ได้มาก)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS  = 60 * 1000  // 1 นาที
const MAX_REQ    = 5           // สูงสุด 5 requests/นาที/IP สำหรับ analyze

function getIP(req: Request): string {
  // Vercel ส่ง IP มาใน header นี้
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function checkRateLimit(
  req: Request,
  maxRequests = MAX_REQ,
  windowMs = WINDOW_MS,
): { allowed: boolean; remaining: number; resetIn: number } {
  const ip  = getIP(req)
  const now = Date.now()
  const key = ip

  // Clean expired entries
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  }
}
