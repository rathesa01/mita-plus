import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? ''
  const hasKey = key.trim().length > 0
  const keyPreview = hasKey ? `${key.slice(0, 10)}...${key.slice(-4)}` : '(not set)'

  // Try a minimal Anthropic API call
  let apiStatus = 'not tested'
  let apiError = ''

  if (hasKey) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: key })
      const res = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'say hi' }],
      })
      apiStatus = 'success'
      console.log('[DEBUG] API response:', res.content[0])
    } catch (e: unknown) {
      apiStatus = 'error'
      apiError = e instanceof Error ? e.message : String(e)
      console.error('[DEBUG] API error:', e)
    }
  }

  return NextResponse.json({
    hasKey,
    keyPreview,
    apiStatus,
    apiError,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
