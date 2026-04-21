/**
 * Involve Asia Publisher API Client
 * Docs: https://developers.involve.asia/
 *
 * ตั้งค่า env: INVOLVE_ASIA_API_KEY (ได้จาก dashboard → Settings → API)
 * Account status: Pending approval (MITA+) — ใช้งานได้หลัง approve
 */

const BASE_URL = 'https://api.involve.asia/publisher'

// ── Types ────────────────────────────────────────────────

export interface InvolveProduct {
  id: string
  name: string
  brand: string           // merchant/brand name
  price: number           // THB
  original_price?: number
  currency: string        // THB
  commission_rate: number // percent
  commission_thb: number  // estimated THB per sale
  product_url: string     // deep link to product page
  image_url: string
  category: string
  category_th: string     // Thai category name
  merchant_name: string
  merchant_id: string
  platform: string        // shopee / lazada / brand / etc.
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

// ── Category → Thai niche mapping ───────────────────────
const NICHE_TO_CATEGORIES: Record<string, string[]> = {
  // Thai niche keywords → Involve Asia category slugs
  beauty:       ['beauty', 'skincare', 'makeup', 'health-beauty'],
  ความงาม:     ['beauty', 'skincare', 'makeup'],
  skincare:     ['skincare', 'beauty'],
  แต่งหน้า:    ['makeup', 'beauty'],
  food:         ['food-beverage', 'kitchen', 'cooking'],
  อาหาร:       ['food-beverage', 'kitchen'],
  เบเกอรี:     ['kitchen', 'food-beverage', 'baking'],
  ทำขนม:       ['kitchen', 'food-beverage', 'baking'],
  ทำอาหาร:    ['food-beverage', 'kitchen'],
  fitness:      ['sports', 'health', 'fitness'],
  ออกกำลังกาย: ['sports', 'fitness', 'health'],
  gym:          ['sports', 'fitness'],
  สุขภาพ:      ['health', 'sports'],
  fashion:      ['fashion', 'clothing', 'shoes', 'bags'],
  แฟชั่น:      ['fashion', 'clothing'],
  เสื้อผ้า:    ['clothing', 'fashion'],
  travel:       ['travel', 'luggage', 'outdoor'],
  ท่องเที่ยว:  ['travel', 'hotel', 'outdoor'],
  tech:         ['electronics', 'gadgets', 'tech'],
  เทคโนโลยี:  ['electronics', 'gadgets'],
  gaming:       ['gaming', 'electronics'],
  pets:         ['pets', 'pet-supplies'],
  สัตว์เลี้ยง: ['pets', 'pet-supplies'],
  home:         ['home', 'furniture', 'decor'],
  ของแต่งบ้าน:  ['home', 'decor', 'furniture'],
  education:    ['education', 'books', 'courses'],
  การศึกษา:    ['education', 'books'],
  finance:      ['finance', 'insurance'],
  การเงิน:     ['finance', 'insurance'],
}

// ── API Client ───────────────────────────────────────────

// Involve Asia auth: Bearer token = api_secret (หรือ api_key ถ้าไม่มี secret)
function getHeaders(apiKey: string, apiSecret?: string): HeadersInit {
  const token = apiSecret ?? apiKey
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

/**
 * Get list of active campaigns (merchants) for Thailand
 */
export async function getCampaigns(apiKey: string, apiSecret?: string): Promise<InvolveCampaign[]> {
  const url = `${BASE_URL}/campaigns?country=TH&status=active&limit=100`
  const res = await fetch(url, { headers: getHeaders(apiKey, apiSecret), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Involve Asia campaigns error: ${res.status}`)
  const json = await res.json()

  // Involve Asia wraps in data.campaigns or data.items depending on version
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

/**
 * Search product feeds by keyword
 * Returns real products with prices and commissions
 */
export async function searchProducts(
  apiKey: string,
  keywords: string[],
  options: { limit?: number; country?: string; apiSecret?: string } = {}
): Promise<InvolveProduct[]> {
  const { limit = 30, country = 'TH', apiSecret } = options

  // ── ลอง 3 endpoints ตามลำดับ ──────────────────────────
  const endpoints = [
    // 1. Offers API (Latest Offers จาก dashboard)
    `${BASE_URL}/offers?country=${country}&status=active&limit=${limit}`,
    // 2. Product Feed / Shopee Commissions Xtra
    `${BASE_URL}/product-feed?country=${country}&limit=${limit}`,
    // 3. Campaigns list (fallback)
    `${BASE_URL}/campaigns?country=${country}&status=active&limit=${limit}`,
  ]

  for (const url of endpoints) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      let res: Response
      try {
        res = await fetch(url, { headers: getHeaders(apiKey, apiSecret), signal: controller.signal, cache: 'no-store' })
      } finally {
        clearTimeout(timer)
      }

      if (!res!.ok) {
        console.warn(`[involveAsia] ${url} → ${res!.status}`)
        continue // ลอง endpoint ถัดไป
      }

      const json = await res!.json()
      console.log(`[involveAsia] ${url} → OK | keys:`, Object.keys(json))

      // รองรับทุก response shape ที่เป็นไปได้
      const raw: any[] = (
        json.data?.products ?? json.data?.offers ?? json.data?.items ??
        json.data?.campaigns ?? json.products ?? json.offers ?? json.items ??
        (Array.isArray(json.data) ? json.data : [])
      )

      if (raw.length > 0) {
        console.log(`[involveAsia] Got ${raw.length} items from ${url}`)
        // กรอง keyword ถ้ามีข้อมูล
        const kwLower = keywords.map(k => k.toLowerCase())
        const filtered = raw.filter((p: any) => {
          const text = [p.name, p.category, p.title, p.description, ...(p.tags ?? [])].join(' ').toLowerCase()
          return kwLower.some(k => text.includes(k))
        })
        const result = (filtered.length > 0 ? filtered : raw).slice(0, limit)
        return result.map((p: any): InvolveProduct => normalizeProduct(p))
      }
    } catch (err) {
      console.warn(`[involveAsia] endpoint failed:`, err)
    }
  }

  return [] // ทุก endpoint ไม่ return data → caller จะใช้ FALLBACK_PRODUCTS
}

/**
 * Get products from a specific campaign/merchant
 */
export async function getCampaignProducts(
  apiKey: string,
  campaignId: string,
  options: { limit?: number; category?: string } = {}
): Promise<InvolveProduct[]> {
  const { limit = 20, category } = options
  const params = new URLSearchParams({ limit: String(limit) })
  if (category) params.set('category', category)

  const url = `${BASE_URL}/campaigns/${campaignId}/product-feed?${params}`
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

  // Add mapped categories
  for (const [key, cats] of Object.entries(NICHE_TO_CATEGORIES)) {
    if (nicheLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nicheLower)) {
      keywords.push(...cats.slice(0, 2))
    }
  }

  // Add platform-specific keyword
  if (platform === 'tiktok' || platform === 'instagram') {
    keywords.push('trending')
  }

  return [...new Set(keywords)].slice(0, 5)
}

// ── Normalizer ───────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(p: any): InvolveProduct {
  const price = parseFloat(p.price ?? p.sale_price ?? p.retail_price ?? 0)
  const commissionRate = parseFloat(p.commission_rate ?? p.commission ?? 0)
  const commissionThb = commissionRate > 0 ? Math.round(price * commissionRate / 100) : 0

  // Detect platform from URL or merchant name
  const url: string = p.product_url ?? p.url ?? p.deeplink ?? ''
  const platform = url.includes('shopee') ? 'Shopee'
    : url.includes('lazada') ? 'Lazada'
    : url.includes('central') ? 'Central Online'
    : url.includes('watsons') ? 'Watsons'
    : p.merchant_name ?? p.advertiser_name ?? 'Involve Asia'

  const category: string = p.category ?? p.vertical ?? p.sub_category ?? 'general'

  return {
    id: String(p.id ?? p.product_id ?? Math.random()),
    name: p.name ?? p.product_name ?? p.title ?? '',
    brand: p.brand ?? p.advertiser_name ?? p.merchant ?? '',
    price,
    original_price: parseFloat(p.original_price ?? p.mrp ?? price),
    currency: 'THB',
    commission_rate: commissionRate,
    commission_thb: commissionThb,
    product_url: url,
    image_url: p.image_url ?? p.image ?? p.thumbnail ?? '',
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
    education: 'การศึกษา', books: 'หนังสือ',
  }
  return map[cat.toLowerCase()] ?? cat
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTags(p: any): string[] {
  const tags: string[] = []
  if (p.category) tags.push(p.category.toLowerCase())
  if (p.sub_category) tags.push(p.sub_category.toLowerCase())
  if (p.brand) tags.push(p.brand.toLowerCase())
  if (p.tags && Array.isArray(p.tags)) tags.push(...p.tags)
  if (p.keywords) tags.push(...String(p.keywords).split(',').map((k: string) => k.trim()))
  return [...new Set(tags)].filter(Boolean)
}
