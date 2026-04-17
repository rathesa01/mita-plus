import Anthropic from '@anthropic-ai/sdk'
import type { AuditFormData, AIInsights, RevenueLeak, RevenueEstimation, MonetizationScore, CreatorStage } from '@/types'
import { generateMockInsights } from './mockInsights'
import { buildSystemPrompt, buildUserPrompt } from './prompts'

let client: Anthropic | null = null

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.trim() === '') return null
  if (!client) client = new Anthropic({ apiKey: key })
  return client
}

export async function generateInsights(
  data: AuditFormData,
  leaks: RevenueLeak[],
  revenue: RevenueEstimation,
  score: MonetizationScore,
  stage: CreatorStage,
): Promise<AIInsights> {
  const anthropic = getClient()

  // ── No API key → fall back to mock ──────────────────────
  if (!anthropic) {
    console.log('[MITA+] No Anthropic key — using mock insights')
    return generateMockInsights(data, leaks, revenue)
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1200,
      temperature: 0.7,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(data, leaks, revenue, score, stage),
        },
        {
          // prefill เพื่อบังคับ JSON output
          role: 'assistant',
          content: '{',
        },
      ],
    })

    // รวม prefill กลับเข้าไป
    const raw = '{' + (response.content[0]?.type === 'text' ? response.content[0].text : '')
    const parsed = JSON.parse(raw)

    // Validate all 4 fields exist
    const required = ['shock', 'whyItHappens', 'topActions', 'upside']
    const missing = required.filter((k) => !parsed[k] || typeof parsed[k] !== 'string')

    if (missing.length > 0) {
      console.warn('[MITA+] Claude response missing fields:', missing, '— using mock fallback')
      return generateMockInsights(data, leaks, revenue)
    }

    return {
      shock: parsed.shock,
      whyItHappens: parsed.whyItHappens,
      topActions: parsed.topActions,
      upside: parsed.upside,
    }
  } catch (err) {
    console.error('[MITA+] Claude error — falling back to mock:', err)
    return generateMockInsights(data, leaks, revenue)
  }
}
