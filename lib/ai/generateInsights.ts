import OpenAI from 'openai'
import type { AuditFormData, AIInsights, RevenueLeak, RevenueEstimation, MonetizationScore, CreatorStage } from '@/types'
import { generateMockInsights } from './mockInsights'
import { buildSystemPrompt, buildUserPrompt } from './prompts'

let client: OpenAI | null = null

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === 'sk-your-key-here' || key.trim() === '') return null
  if (!client) client = new OpenAI({ apiKey: key })
  return client
}

export async function generateInsights(
  data: AuditFormData,
  leaks: RevenueLeak[],
  revenue: RevenueEstimation,
  score: MonetizationScore,
  stage: CreatorStage,
): Promise<AIInsights> {
  const openai = getClient()

  // ── No API key → fall back to mock ──────────────────────
  if (!openai) {
    console.log('[MITA+] No OpenAI key — using mock insights')
    return generateMockInsights(data, leaks, revenue)
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(data, leaks, revenue, score, stage) },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)

    // Validate all 4 fields exist
    const required = ['shock', 'whyItHappens', 'topActions', 'upside']
    const missing = required.filter((k) => !parsed[k] || typeof parsed[k] !== 'string')

    if (missing.length > 0) {
      console.warn('[MITA+] OpenAI response missing fields:', missing, '— using mock fallback')
      return generateMockInsights(data, leaks, revenue)
    }

    return {
      shock: parsed.shock,
      whyItHappens: parsed.whyItHappens,
      topActions: parsed.topActions,
      upside: parsed.upside,
    }
  } catch (err) {
    console.error('[MITA+] OpenAI error — falling back to mock:', err)
    return generateMockInsights(data, leaks, revenue)
  }
}
