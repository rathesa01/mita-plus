import { NextResponse } from 'next/server'

const MODELS_TO_TEST = [
  'claude-haiku-4-5',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20241022',
  'claude-3-7-sonnet-20250219',
  'claude-sonnet-4-5',
]

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? ''
  const hasKey = key.trim().length > 0
  const keyPreview = hasKey ? `${key.slice(0, 14)}...${key.slice(-4)}` : '(not set)'

  if (!hasKey) {
    return NextResponse.json({ hasKey, keyPreview, results: [] })
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: key })

  const results: Record<string, string> = {}

  for (const model of MODELS_TO_TEST) {
    try {
      await client.messages.create({
        model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }],
      })
      results[model] = '✅ SUCCESS'
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const short = msg.includes('not_found') ? '❌ not_found' :
                    msg.includes('invalid') ? '❌ invalid_key' :
                    msg.includes('permission') ? '❌ no_permission' :
                    `❌ ${msg.slice(0, 60)}`
      results[model] = short
    }
  }

  return NextResponse.json({
    hasKey,
    keyPreview,
    nodeEnv: process.env.NODE_ENV,
    results,
  })
}
