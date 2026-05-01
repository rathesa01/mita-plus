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

// ── Personalization helpers ───────────────────────────────────────────────────

/** Extract meaningful keywords from contentDescription (words > 2 chars) */
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length < 3) return []
  return text
    .replace(/[.,!?·""]/g, ' ')
    .split(/\s+/)
    .map(w => w.toLowerCase().trim())
    .filter(w => w.length > 2)
    .slice(0, 12)
}

/** Banned template phrases that signal AI ignored contentDescription */
const BANNED_PHRASES = [
  'มี.*คนติดตาม แต่รายได้ยังอยู่ที่',
  'ทั้งที่ follower ระดับนี้ควรได้',
  'นั่นคือ gap ที่ยังปิดไม่ได้',
  'ทุก 1,000 view ทำให้เงินแค่',
  'creator คนอื่นได้.*ต่อ 1,000 view เดียวกัน',
  'นี่คือ gap ที่ซ่อนอยู่',
]

/** Returns true if output contains personalized keywords from description */
function hasPersonalization(parsed: Record<string, unknown>, contentDescription: string): boolean {
  // Skip check if no description provided
  if (!contentDescription || contentDescription.trim().length < 5) return true

  const keywords = extractKeywords(contentDescription)
  if (keywords.length === 0) return true

  const outputText = (
    String(parsed.shock ?? '') + ' ' + String(parsed.whyItHappens ?? '')
  ).toLowerCase()

  // Must contain at least 1 keyword from description in shock+whyItHappens
  return keywords.some(kw => outputText.includes(kw))
}

/** Returns true if output contains a banned template phrase */
function hasBannedPhrase(parsed: Record<string, unknown>): boolean {
  const shockText = String(parsed.shock ?? '')
  return BANNED_PHRASES.some(pattern => new RegExp(pattern).test(shockText))
}

/** Parse and validate a raw JSON response string */
function parseResponse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Extract AIInsights from a parsed object, with safe defaults */
function extractInsights(parsed: Record<string, unknown>): Omit<AIInsights, 'actionSteps'> & { actionSteps: AIInsights['actionSteps'] } {
  const actionSteps = Array.isArray(parsed.actionSteps)
    ? parsed.actionSteps.filter((s: unknown) =>
        s && typeof s === 'object' &&
        typeof (s as Record<string, unknown>).day === 'string' &&
        typeof (s as Record<string, unknown>).title === 'string'
      )
    : []

  return {
    shock: String(parsed.shock ?? ''),
    whyItHappens: String(parsed.whyItHappens ?? ''),
    topActions: String(parsed.topActions ?? ''),
    actionSteps,
    upside: String(parsed.upside ?? ''),
  }
}

// ── Main function ─────────────────────────────────────────────────────────────

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

  const userPrompt = buildUserPrompt(data, leaks, revenue, score, stage)
  const systemPrompt = buildSystemPrompt()
  const contentDescription = data.contentDescription ?? ''

  try {
    // ── First attempt ────────────────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2800,
      temperature: 0.9,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: '{' },
      ],
    })

    const raw = '{' + (response.content[0]?.type === 'text' ? response.content[0].text : '')
    let parsed = parseResponse(raw)

    // ── Validate required fields ─────────────────────────────
    if (!parsed) {
      console.warn('[MITA+] Claude JSON parse failed — using mock')
      return generateMockInsights(data, leaks, revenue)
    }

    const required = ['shock', 'whyItHappens', 'topActions', 'upside']
    const missing = required.filter(k => !parsed![k] || typeof parsed![k] !== 'string')
    if (missing.length > 0) {
      console.warn('[MITA+] Claude missing fields:', missing, '— using mock')
      return generateMockInsights(data, leaks, revenue)
    }

    // ── Personalization check ────────────────────────────────
    const personalized = hasPersonalization(parsed, contentDescription)
    const hasBanned    = hasBannedPhrase(parsed)

    if (!personalized || hasBanned) {
      console.warn(
        `[MITA+] Output quality check failed — personalized:${personalized} banned:${hasBanned} · retrying`
      )

      // ── Retry with stricter instruction + higher temperature ─
      try {
        const retrySystem = systemPrompt +
          `\n\n🚨 RETRY — ครั้งก่อน output ใช้ template เกินไปและ/หรือมี banned phrase ·` +
          ` ครั้งนี้บังคับ: (1) ดึงคำจาก "${contentDescription}" ใส่ใน keywordsExtracted` +
          ` (2) shock ต้องมีคำจาก keywordsExtracted อย่างน้อย 2 คำ` +
          ` (3) ห้ามใช้ pattern "X มี follower Y แต่รายได้ Z" หรือ "ทั้งที่ follower ระดับนี้ควรได้"`

        const retryResponse = await anthropic.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 2800,
          temperature: 1.0,
          system: retrySystem,
          messages: [
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: '{' },
          ],
        })

        const retryRaw = '{' + (retryResponse.content[0]?.type === 'text' ? retryResponse.content[0].text : '')
        const retryParsed = parseResponse(retryRaw)

        if (retryParsed) {
          const retryPersonalized = hasPersonalization(retryParsed, contentDescription)
          const retryBanned       = hasBannedPhrase(retryParsed)
          console.log(`[MITA+] Retry result — personalized:${retryPersonalized} banned:${retryBanned}`)

          // Validate retry required fields
          const retryMissing = required.filter(k => !retryParsed[k] || typeof retryParsed[k] !== 'string')
          if (retryMissing.length === 0) {
            parsed = retryParsed  // use retry output
          }
          // If retry also missing fields → fall through to use first attempt
        }
      } catch (retryErr) {
        console.warn('[MITA+] Retry failed:', retryErr, '— using first attempt')
        // Fall through: use first attempt result (functional, just template-y)
      }
    } else {
      console.log('[MITA+] Output personalization check passed ✅')
    }

    return extractInsights(parsed)

  } catch (err) {
    console.error('[MITA+] Claude error — falling back to mock:', err)
    return generateMockInsights(data, leaks, revenue)
  }
}
