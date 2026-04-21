/**
 * Involve Asia Publisher API Client
 * Docs: https://developers.involve.asia/
 *
 * Campaigns with Product Feed (joined):
 * - Banggood (Global)   → Electronics, Gadgets, Fitness, Pets, General
 * - Sephora TH          → Beauty, Skincare, Makeup
 * - Lotus's TH          → Food, Grocery, Kitchen
 * - HomePro TH          → Home, DIY, Furniture
 * - Xiaomi TH           → Tech, Electronics, Gadgets
 * - Studio7 TH          → Tech, Camera, Apple
 * - Shein Global        → Fashion, Clothing
 * - B2S TH              → Education, Books, Stationery
 * - Trip.com            → Travel, Hotel, Flight
 * - Chow Sang Sang      → Jewelry, Accessories
 * + Lazada TH (pending) → General (all categories)
 */

const BASE_URL = 'https://api.involve.asia/publisher'

// ── Types ────────────────────────────────────────────────

export interface InvolveProduct {
  id: string
  name: string
  brand: string
  price: number
  original_price?: number
  currency: string
  commission_rate: number
  commission_thb: number
  product_url: string
  image_url: string
  category: string
  category_th: string
  merchant_name: string
  merchant_id: string
  platform: string
  tags: string[]
  in_stock: boolean
}

export interface InvolveCampaign {
  id: string
  name: string
  merchant_name: string
  category: string
  commission_rate: number
  status: 'active' | 'paused' | 'ended'
  tracking_url_base: string
  country: string
}

// ── Niche → Campaign mapping ─────────────────────────────

// Map niche keywords → campaign name patterns (lowercase)
const NICHE_TO_CAMPAIGNS: Record<string, string[]> = {
  // Beauty / Skincare
  beauty:       ['sephora', 'banggood'],
  ความงาม:     ['sephora', 'banggood'],
  skincare:     ['sephora'],
  สกินแคร์:    ['sephora'],
  makeup:       ['sephora'],
  แต่งหน้า:    ['sephora'],

  // Food / Kitchen
  food:         ['lotus', "lotus's"],
  อาหาร:       ['lotus', "lotus's"],
  เบเกอรี:     ['lotus', "lotus's"],
  ทำอาหาร:    ['lotus', "lotus's"],
  ทำขนม:       ['lotus', "lotus's"],

  // Home / DIY
  home:         ['homepro'],
  ของแต่งบ้าน: ['homepro'],
  บ้าน:        ['homepro'],
  diy:          ['homepro'],
  furniture:    ['homepro'],

  // Tech / Electronics
  tech:         ['xiaomi', 'studio7', 'banggood'],
  เทคโนโลยี:  ['xiaomi', 'studio7', 'banggood'],
  electronics:  ['xiaomi', 'studio7', 'banggood'],
  อิเล็กทรอนิกส์: ['xiaomi', 'studio7'],
  gadgets:      ['banggood', 'xiaomi'],
  กล้อง:       ['studio7'],
  camera:       ['studio7'],
  apple:        ['studio7'],

  // Fashion
  fashion:      ['shein'],
  แฟชั่น:      ['shein'],
  clothing:     ['shein'],
  เสื้อผ้า:    ['shein'],

  // Travel
  travel:       ['trip'],
  ท่องเที่ยว:  ['trip'],
  hotel:        ['trip'],
  โรงแรม:      ['trip'],
  flight:       ['trip'],

  // Education / Books
  education:    ['b2s'],
  การศึกษา:    ['b2s'],
  books:        ['b2s'],
  หนังสือ:      ['b2s'],
  stationery:   ['b2s'],
  เครื่องเขียน: ['b2s'],

  // Jewelry
  jewelry:      ['chow'],
  เครื่องประดับ: ['chow'],
  gold:         ['chow'],
  ทอง:         ['chow'],

  // Fitness / Sports / Pets / General → Banggood
  fitness:      ['banggood'],
  ออกกำลังกาย: ['banggood'],
  sports:       ['banggood'],
  กีฬา:        ['banggood'],
  pets:         ['banggood'],
  สัตว์เลี้ยง: ['banggood'],
}

// ── Category → Thai mapping ──────────────────────────────
const NICHE_TO_CATEGORIES: Record<string, string[]> = {
  beauty:       ['beauty', 'skincare', 'makeup', 'health-beauty'],
  ความงาม:     ['beauty', 'skincare', 'makeup'],
  skincare:     ['skincare', 'beauty'],
  food:         ['food-beverage', 'kitchen', 'cooking'],
  อาหาร:       ['food-beverage', 'kitchen'],
  fitness:      ['sports', 'health', 'fitness'],
  fashion:      ['fashion', 'clothing', 'shoes'],
  tech:         ['electronics', 'gadgets', 'tech'],
  home:         ['home', 'furniture', 'decor'],
  education:    ['education', 'books'],
  travel:       ['travel', 'hotel'],
  pets:         ['pets', 'pet-supplies'],
}

// ── Auth ─────────────────────────────────────────────────

function getHeaders(apiKey: string, apiSecret?: string): HeadersInit {
  const token = apiSecret ?? apiKey
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// ── Campaigns ────────────────────────────────────────────

export async function getCampaigns(apiKey: string, apiSecret?: string): Promise<InvolveCampaign[]> {
  const url = `${BASE_URL}/campaigns?country=TH&status=active&limit=100`
  const res = await fetch(url, { headers: getHeaders(apiKey, apiSecret), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Involve Asia campaigns error: ${res.status}`)
  const json = await res.json()

  const raw = json.data?.campaigns ?? json.data?.items ?? json.data ?? []
  return raw.map((c: any): InvolveCampaign => ({
    id: String(c.id ?? c.campaign_id ?? ''),
    name: c.name ?? c.campaign_name ?? '',
    merchant_name: c.advertiser_name ?? c.merchant ?? c.name ?? '',
    category: c.category ?? c.vertical ?? 'general',
    commission_rate: parseFloat(c.commission_rate ?? c.rate ?? 0),
    status: c.status ?? 'active',
    tracking_url_base: c.tracking_url ?? c.deeplink ?? '',
    country: 'TH',
  }))
}

// ── Product Search ────────────────────────────────────────

/**
 * Search products by niche — tries niche-specific campaigns first,
 * then falls back to general product feed.
 * Uses Involve Asia product-feed API (joined campaigns with data feed enabled).
 */
export async function searchProducts(
  apiKey: string,
  keywords: string[],
  options: { limit?: number; country?: string; apiSecret?: string; niche?: string } = {}
): Promise<InvolveProduct[]> {
  const { limit = 30, country = 'TH', apiSecret, niche = '' } = options

  // Build keyword string for API
  const kwString = keywords.slice(0, 3).join(',')
  const nicheLower = niche.toLowerCase()

  // Find best campaigns for this niche
  const matchedCampaigns = findCampaignsForNiche(nicheLower, keywords)

  // ── Endpoints to try (ordered by specificity) ──────────
  const endpoints: string[] = []

  // 1. Product feed with keyword search (most specific)
  if (kwString) {
    endpoints.push(
      `${BASE_URL}/product-feed?country=${country}&keyword=${encodeURIComponent(kwString)}&limit=${limit}`,
      `${BASE_URL}/product-feed?keyword=${encodeURIComponent(kwString)}&limit=${limit}`,
    )
  }

  // 2. General product feed (returns all joined campaign products)
  endpoints.push(
    `${BASE_URL}/product-feed?country=${country}&limit=${Math.min(limit, 500)}`,
    `${BASE_URL}/product-feed?limit=${Math.min(limit, 500)}`,
  )

  // 3. Offers API fallback
  endpoints.push(
    `${BASE_URL}/offers?country=${country}&status=active&limit=${limit}`,
  )

  for (const url of endpoints) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      let res: Response
      try {
        res = await fetch(url, {
          headers: getHeaders(apiKey, apiSecret),
          signal: controller.signal,
          cache: 'no-store',
        })
      } finally {
        clearTimeout(timer)
      }

      if (!res!.ok) {
        console.warn(`[involveAsia] ${url} → ${res!.status}`)
        continue
      }

      const json = await res!.json()
      console.log(`[involveAsia] ${url} → OK | keys:`, Object.keys(json))

      const raw: any[] = (
        json.data?.products ?? json.data?.offers ?? json.data?.items ??
        json.data?.campaigns ?? json.products ?? json.offers ?? json.items ??
        (Array.isArray(json.data) ? json.data : [])
      )

      if (raw.length === 0) continue

      console.log(`[involveAsia] Got ${raw.length} items from ${url}`)

      // Filter by niche-matched campaigns first
      let filtered = filterByNicheAndCampaign(raw, keywords, matchedCampaigns)

      // If no niche match, filter by keyword only
      if (filtered.length === 0) {
        const kwLower = keywords.map(k => k.toLowerCase())
        filtered = raw.filter((p: any) => {
          const text = [p.name, p.category, p.title, p.description, p.merchant_name, p.advertiser_name, ...(p.tags ?? [])]
            .join(' ').toLowerCase()
          return kwLower.some(k => text.includes(k))
        })
      }

      // If still no match, use all results (general pool)
      const result = (filtered.length > 0 ? filtered : raw).slice(0, limit)
      return result.map((p: any): InvolveProduct => normalizeProduct(p))

    } catch (err) {
      console.warn(`[involveAsia] endpoint failed:`, err)
    }
  }

  return []
}

/**
 * Find which campaigns match the given niche/keywords
 */
function findCampaignsForNiche(nicheLower: string, keywords: string[]): string[] {
  const matched = new Set<string>()

  for (const [key, campaigns] of Object.entries(NICHE_TO_CAMPAIGNS)) {
    const keyLower = key.toLowerCase()
    const isMatch = nicheLower.includes(keyLower) ||
      keyLower.includes(nicheLower) ||
      keywords.some(k => k.toLowerCase().includes(keyLower) || keyLower.includes(k.toLowerCase()))
    if (isMatch) {
      campaigns.forEach(c => matched.add(c))
    }
  }

  // Default: include banggood as catch-all
  if (matched.size === 0) matched.add('banggood')

  return [...matched]
}

/**
 * Filter products by campaign and keyword relevance
 */
function filterByNicheAndCampaign(raw: any[], keywords: string[], campaigns: string[]): any[] {
  const kwLower = keywords.map(k => k.toLowerCase())

  return raw.filter((p: any) => {
    const merchantName = (p.merchant_name ?? p.advertiser_name ?? p.source ?? '').toLowerCase()
    const campaignName = (p.campaign_name ?? p.campaign ?? '').toLowerCase()

    // Check if product is from a matched campaign
    const campaignMatch = campaigns.some(c =>
      merchantName.includes(c) || campaignName.includes(c)
    )

    // Check keyword relevance
    const text = [p.name, p.category, p.title, p.description, ...(p.tags ?? [])]
      .join(' ').toLowerCase()
    const keywordMatch = kwLower.some(k => text.includes(k))

    return campaignMatch || keywordMatch
  })
}

/**
 * Get products from a specific campaign (by campaign ID)
 */
export async function getCampaignProducts(
  apiKey: string,
  campaignId: string,
  options: { limit?: number; category?: string } = {}
): Promise<InvolveProduct[]> {
  const { limit = 20, category } = options
  const params = new URLSearchParams({ limit: String(limit) })
  if (category) params.set('category', category)

  const url = `${BASE_URL}/product-feed?campaign_id=${campaignId}&${params}`
  const res = await fetch(url, { headers: getHeaders(apiKey), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Involve Asia campaign products error: ${res.status}`)
  const json = await res.json()

  const raw: any[] = json.data?.products ?? json.data?.items ?? json.data ?? []
  return raw.map((p: any): InvolveProduct => normalizeProduct(p))
}

/**
 * Convert niche string to search keywords for Involve Asia
 */
export function nicheToKeywords(niche: string, platform: string): string[] {
  const nicheLower = niche.toLowerCase()
  const keywords: string[] = [niche]

  for (const [key, cats] of Object.entries(NICHE_TO_CATEGORIES)) {
    if (nicheLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nicheLower)) {
      keywords.push(...cats.slice(0, 2))
    }
  }

  if (platform === 'tiktok' || platform === 'instagram') {
    keywords.push('trending')
  }

  return [...new Set(keywords)].slice(0, 5)
}

// ── Normalizer ────────────────────────────────────────────

function normalizeProduct(p: any): InvolveProduct {
  const price = parseFloat(p.price ?? p.sale_price ?? p.retail_price ?? 0)
  const commissionRate = parseFloat(p.commission_rate ?? p.commission ?? 0)
  const commissionThb = commissionRate > 0 ? Math.round(price * commissionRate / 100) : 0

  const url: string = p.product_url ?? p.url ?? p.deeplink ?? p.link ?? ''

  // Detect platform from URL or merchant
  const platform = url.includes('shopee') ? 'Shopee'
    : url.includes('lazada') ? 'Lazada'
    : url.includes('banggood') ? 'Banggood'
    : url.includes('sephora') ? 'Sephora'
    : url.includes('homepro') ? 'HomePro'
    : url.includes('lotus') ? "Lotus's"
    : url.includes('mi.com') || url.includes('xiaomi') ? 'Xiaomi'
    : url.includes('studio7') ? 'Studio7'
    : url.includes('shein') ? 'Shein'
    : url.includes('b2s') ? 'B2S'
    : url.includes('trip.com') ? 'Trip.com'
    : p.merchant_name ?? p.advertiser_name ?? 'Involve Asia'

  const category: string = p.category ?? p.vertical ?? p.sub_category ?? 'general'

  return {
    id: String(p.id ?? p.product_id ?? Math.random()),
    name: p.name ?? p.product_name ?? p.title ?? '',
    brand: p.brand ?? p.advertiser_name ?? p.merchant ?? '',
    price,
    original_price: parseFloat(p.original_price ?? p.mrp ?? price),
    currency: p.currency ?? 'THB',
    commission_rate: commissionRate,
    commission_thb: commissionThb,
    product_url: url,
    image_url: p.image_url ?? p.image ?? p.thumbnail ?? p.image_link ?? '',
    category,
    category_th: categoryToThai(category),
    merchant_name: p.merchant_name ?? p.advertiser_name ?? platform,
    merchant_id: String(p.merchant_id ?? p.advertiser_id ?? ''),
    platform,
    tags: extractTags(p),
    in_stock: p.availability !== 'out_of_stock' && p.stock !== 0,
  }
}

function categoryToThai(cat: string): string {
  const map: Record<string, string> = {
    beauty: 'ความงาม', skincare: 'สกินแคร์', makeup: 'แต่งหน้า',
    food: 'อาหาร', 'food-beverage': 'อาหารและเครื่องดื่ม',
    kitchen: 'ของใช้ครัว', baking: 'เบเกอรี',
    sports: 'กีฬา', fitness: 'ฟิตเนส', health: 'สุขภาพ',
    fashion: 'แฟชั่น', clothing: 'เสื้อผ้า', shoes: 'รองเท้า',
    electronics: 'อิเล็กทรอนิกส์', gadgets: 'แกดเจ็ต', tech: 'เทคโนโลยี',
    travel: 'ท่องเที่ยว', hotel: 'โรงแรม',
    pets: 'สัตว์เลี้ยง', 'pet-supplies': 'อุปกรณ์สัตว์เลี้ยง',
    home: 'ของแต่งบ้าน', furniture: 'เฟอร์นิเจอร์', decor: 'ตกแต่งบ้าน',
    education: 'การศึกษา', books: 'หนังสือ', stationery: 'เครื่องเขียน',
    jewelry: 'เครื่องประดับ', accessories: 'เครื่องประดับ',
  }
  return map[cat.toLowerCase()] ?? cat
}

function extractTags(p: any): string[] {
  const tags: string[] = []
  if (p.category) tags.push(p.category.toLowerCase())
  if (p.sub_category) tags.push(p.sub_category.toLowerCase())
  if (p.brand) tags.push(p.brand.toLowerCase())
  if (p.merchant_name) tags.push(p.merchant_name.toLowerCase())
  if (p.tags && Array.isArray(p.tags)) tags.push(...p.tags)
  if (p.keywords) tags.push(...String(p.keywords).split(',').map((k: string) => k.trim()))
  return [...new Set(tags)].filter(Boolean)
}
