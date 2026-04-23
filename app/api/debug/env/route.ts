import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ⚠️ DEBUG ONLY — remove after diagnosis
export async function GET() {
  return NextResponse.json({
    LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID
      ? `SET:${process.env.LINE_CHANNEL_ID.substring(0, 4)}***`
      : 'NOT_SET',
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET
      ? `SET:${process.env.LINE_CHANNEL_SECRET.substring(0, 4)}***`
      : 'NOT_SET',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV ?? 'NOT_SET',
  })
}
