/**
 * Involve Asia Publisher API Client — Fixed & Correct Implementation
 *
 * Involve Asia API structure (api.involve.asia/publisher):
 *   POST /authenticate  → get Bearer token (expires 2h)
 *   GET  /offers/all    → joined campaigns + data feed URLs
 *   POST /deeplink/generate → create affiliate tracking link
 *   NO product-feed REST endpoint — product data comes from downloadable CSV/XML feeds
 *
 * Campaigns with Data Feed enabled (joined):
 *   Banggood, Sephora TH, Lotus's TH, HomePro TH,
 *   Xiaomi TH, Studio7 TH, Shein Global, B2S TH,
 *   Trip.com, Chow Sang Sang
 */

const BASE = 'https://api.involve.asia/publisher'

// ── Types ─────────────────────────────────────────────────────

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

export interface InvolveOffer {
  id: string
  name: string
  merchant_name: string
  category: string
  commission_rate: number
  status: string
  tracking_url_base: string
  data_feed_url?: string
  country: string
}

// ── Token cache (server-side module-level) ────────────────────

let _tokenCache: { token: string; expires: number } | null = null

async function getAuthToken(apiKey: string, apiSecret: string): Promise<string | null> {
  const now = Date.now()

  // Return cached token if still valid (expire 10 min early for safety)
  if (_tokenCache && _tokenCache.expires > now + 10 * 60 * 1000) {
    return _tokenCache.token
  }

  try {
    console.log('[involveAsia] authenticating...')
    const res = await fetch(`${BASE}/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret }),
      cache: 'no-store',
    })

    const text = await res.text()
    console.log('[involveAsia] auth response:', res.status, text.slice(0, 300))

    if (!res.ok) {
      console.error('[involveAsia] auth failed:', res.status, text)
      return null
    }

    let json: any
    try { json = JSON.parse(text) } catch { return null }

    // Involve Asia wraps token in data.token or just token
    const token: string = json?.data?.token ?? json?.token ?? json?.access_token ?? ''
    if (!token) {
      console.error('[involveAsia] no token in response:', json)
      return null
    }

    _tokenCache = { token, expires: now + 1.8 * 60 * 60 * 1000 } // 1h48m
    console.log('[involveAsia] auth success, token cached for 1h48m')
    return token

  } catch (err) {
    console.error('[involveAsia] auth error:', err)
    return null
  }
}

function authHeader(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// ── Get joined offers (campaigns) ────────────────────────────

export async function getOffers(apiKey: string, apiSecret: string): Promise<InvolveOffer[]> {
  const token = await getAuthToken(apiKey, apiSecret)
  if (!token) return []

  try {
    const res = await fetch(`${BASE}/offers/all`, {
      headers: authHeader(token),
      cache: 'no-store',
    })
    const text = await res.text()
    console.log('[involveAsia] /offers/all:', res.status, text.slice(0, 500))

    if (!res.ok) return []

    const json = JSON.parse(text)
    const raw: any[] = json?.data?.offers ?? json?.data ?? json?.offers ?? []

    return raw.map((o: any): InvolveOffer => ({
      id: String(o.id ?? o.offer_id ?? ''),
      name: o.name ?? o.offer_name ?? '',
      merchant_name: o.advertiser_name ?? o.merchant ?? o.name ?? '',
      category: o.category ?? o.vertical ?? 'general',
      commission_rate: parseFloat(o.commission_rate ?? o.rate ?? 0),
      status: o.status ?? 'active',
      tracking_url_base: o.tracking_url ?? o.deeplink ?? '',
      data_feed_url: o.feed_url ?? o.data_feed_url ?? o.product_feed_url,
      country: o.country ?? 'TH',
    }))
  } catch (err) {
    console.error('[involveAsia] getOffers error:', err)
    return []
  }
}

// ── Download & parse data feed (CSV or XML) ──────────────────

interface RawFeedProduct {
  id: string
  name: string
  price: number
  original_price: number
  image_url: string
  product_url: string
  brand: string
  category: string
  merchant: string
  in_stock: boolean
}

async function downloadDataFeed(feedUrl: string, token?: string): Promise<RawFeedProduct[]> {
  try {
    const headers: HeadersInit = { 'Accept': 'text/csv, application/xml, text/xml, */*' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    let res: Response
    try {
      res = await fetch(feedUrl, { headers, signal: controller.signal, cache: 'no-store' })
    } finally {
      clearTimeout(timer)
    }

    if (!res.ok) {
      console.warn('[involveAsia] feed download failed:', feedUrl, res.status)
      return []
    }

    const contentType = res.headers.get('content-type') ?? ''
    const text = await res.text()
    console.log('[involveAsia] feed downloaded:', feedUrl, 'bytes:', text.length, 'type:', contentType)

    if (contentType.includes('xml') || text.trim().startsWith('<')) {
      return parseXMLFeed(text)
    } else {
      return parseCSVFeed(text)
    }
  } catch (err) {
    console.warn('[involveAsia] downloadDataFeed error:', feedUrl, err)
    return []
  }
}

function parseCSVFeed(csv: string): RawFeedProduct[] {
  const lines = csv.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Parse header
  const header = splitCSVLine(lines[0]).map(h => h.toLowerCase().trim())
  const products: RawFeedProduct[] = []

  for (let i = 1; i < lines.length; i++) {
    const vals = splitCSVLine(lines[i])
    const row: Record<string, string> = {}
    header.forEach((h, idx) => { row[h] = vals[idx] ?? '' })

    // Common CSV column name patterns across different merchants
    const name = row['name'] ?? row['product_name'] ?? row['title'] ?? row['product title'] ?? ''
    if (!name) continue

    const price = parseFloat(row['price'] ?? row['sale_price'] ?? row['selling_price'] ?? row['saleprice'] ?? '0')
    const origPrice = parseFloat(row['original_price'] ?? row['regular_price'] ?? row['regular price'] ?? row['mrp'] ?? String(price))
    const productUrl = row['product_url'] ?? row['link'] ?? row['url'] ?? row['affiliate_url'] ?? ''
    const imageUrl = row['image_url'] ?? row['image_link'] ?? row['image link'] ?? row['image'] ?? row['imgurl'] ?? ''
    const category = row['category'] ?? row['google_product_category'] ?? row['product_type'] ?? 'general'
    const brand = row['brand'] ?? row['manufacturer'] ?? row['advertiser'] ?? ''
    const merchant = row['merchant'] ?? row['advertiser'] ?? row['source'] ?? ''
    const inStock = (row['availability'] ?? row['in_stock'] ?? 'in stock').toLowerCase() !== 'out of stock'
    const id = row['id'] ?? row['product_id'] ?? row['sku'] ?? `${name}-${price}`

    products.push({ id, name, price, original_price: origPrice, image_url: imageUrl, product_url: productUrl, brand, category, merchant, in_stock: inStock })
  }

  console.log('[involveAsia] CSV parsed:', products.length, 'products')
  return products
}

function parseXMLFeed(xml: string): RawFeedProduct[] {
  // Simple XML product feed parser (RSS/Atom/Google Shopping format)
  const products: RawFeedProduct[] = []

  // Match <item> or <entry> blocks
  const itemRegex = /<(?:item|entry|product)>([\s\S]*?)<\/(?:item|entry|product)>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]

    const extract = (tag: string): string => {
      const m = block.match(new RegExp(`<(?:g:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:g:)?${tag}>`, 'i'))
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : ''
    }

    const name = extract('title') || extract('name') || extract('product_name')
    if (!name) continue

    const priceStr = extract('price') || extract('sale_price') || '0'
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
    const origStr = extract('regular_price') || extract('original_price') || priceStr
    const origPrice = parseFloat(origStr.replace(/[^0-9.]/g, '')) || price

    products.push({
      id: extract('id') || extract('product_id') || extract('sku') || `${name}-${price}`,
      name,
      price,
      original_price: origPrice,
      image_url: extract('image_link') || extract('image_url') || extract('image'),
      product_url: extract('link') || extract('product_url') || extract('url'),
      brand: extract('brand') || extract('manufacturer'),
      category: extract('product_type') || extract('google_product_category') || extract('category'),
      merchant: extract('merchant') || extract('advertiser'),
      in_stock: !/out.of.stock/i.test(extract('availability')),
    })
  }

  console.log('[involveAsia] XML parsed:', products.length, 'products')
  return products
}

// Basic CSV line splitter (handles quoted commas)
function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += ch }
  }
  result.push(current)
  return result.map(s => s.replace(/^"|"$/g, '').trim())
}

// ── Main product search function ──────────────────────────────

/**
 * Fetch products from Involve Asia data feeds.
 *
 * Strategy:
 * 1. Authenticate with Involve Asia API
 * 2. Try environment-variable feed URLs (per campaign)
 * 3. Try to discover feed URLs from /offers/all response
 * 4. Filter by niche keywords
 * Returns [] if nothing found (caller should use fallback)
 */
export async function searchProducts(
  apiKey: string,
  keywords: string[],
  options: {
    limit?: number
    country?: string
    apiSecret?: string
    niche?: string
  } = {}
): Promise<InvolveProduct[]> {
  const { limit = 200, apiSecret, niche = '' } = options
  const kwLower = keywords.map(k => k.toLowerCase())
  const nicheLower = niche.toLowerCase()

  // ── Step 1: Get auth token ──────────────────────────────────
  const token = await getAuthToken(apiKey, apiSecret ?? apiKey)

  // ── Step 2: Collect data feed URLs ─────────────────────────
  // Priority: env vars → API offers response → empty
  const feedUrls: Array<{ url: string; merchant: string }> = []

  // Feed URLs from environment variables (set manually from dashboard)
  const envFeeds: Array<{ env: string; merchant: string }> = [
    { env: 'INVOLVE_FEED_BANGGOOD',   merchant: 'Banggood' },
    { env: 'INVOLVE_FEED_SEPHORA',    merchant: 'Sephora' },
    { env: 'INVOLVE_FEED_LOTUS',      merchant: "Lotus's" },
    { env: 'INVOLVE_FEED_HOMEPRO',    merchant: 'HomePro' },
    { env: 'INVOLVE_FEED_XIAOMI',     merchant: 'Xiaomi' },
    { env: 'INVOLVE_FEED_STUDIO7',    merchant: 'Studio7' },
    { env: 'INVOLVE_FEED_SHEIN',      merchant: 'Shein' },
    { env: 'INVOLVE_FEED_B2S',        merchant: 'B2S' },
    { env: 'INVOLVE_FEED_TRIP',       merchant: 'Trip.com' },
    { env: 'INVOLVE_FEED_CHOW',       merchant: 'Chow Sang Sang' },
    { env: 'INVOLVE_FEED_LAZADA',     merchant: 'Lazada' },
  ]

  for (const { env, merchant } of envFeeds) {
    const url = process.env[env]
    if (url) feedUrls.push({ url, merchant })
  }

  // Try to discover feed URLs from /offers/all
  if (feedUrls.length === 0 && token) {
    const offers = await getOffers(apiKey, apiSecret ?? apiKey)
    for (const offer of offers) {
      if (offer.data_feed_url) {
        feedUrls.push({ url: offer.data_feed_url, merchant: offer.merchant_name })
      }
    }
    console.log('[involveAsia] discovered', feedUrls.length, 'feed URLs from /offers/all')
  }

  if (feedUrls.length === 0) {
    console.warn('[involveAsia] no data feed URLs found — set INVOLVE_FEED_* env vars from dashboard')
    return []
  }

  // ── Step 3: Download feeds, filter by niche ─────────────────
  // Select feeds relevant to this niche
  const relevantFeeds = selectFeedsForNiche(feedUrls, nicheLower, kwLower)
  console.log('[involveAsia] selected feeds for niche', nicheLower, ':', relevantFeeds.map(f => f.merchant))

  const allProducts: InvolveProduct[] = []

  for (const { url, merchant } of relevantFeeds) {
    const raw = await downloadDataFeed(url, token ?? undefined)
    const normalized = raw.map(p => normalizeProduct(p, merchant))
    allProducts.push(...normalized)

    if (allProducts.length >= limit * 2) break // got enough, stop downloading
  }

  if (allProducts.length === 0) return []

  // ── Step 4: Filter and rank by keyword relevance ────────────
  const scored = allProducts.map(p => {
    const text = [p.name, p.category, p.brand, p.merchant_name, ...p.tags].join(' ').toLowerCase()
    const score = kwLower.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0)
    return { p, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const result = scored.map(x => x.p).slice(0, limit)
  console.log('[involveAsia] returning', result.length, 'products for niche:', nicheLower)
  return result
}

// ── Niche → merchant mapping ──────────────────────────────────

const NICHE_MERCHANTS: Record<string, string[]> = {
  beauty: ['sephora', 'banggood'],
  ความงาม: ['sephora', 'banggood'],
  skincare: ['sephora'],
  สกินแคร์: ['sephora'],
  makeup: ['sephora'],
  แต่งหน้า: ['sephora'],
  food: ['lotus', "lotus's"],
  อาหาร: ["lotus's", 'lotus'],
  เบเกอรี: ["lotus's"],
  ทำอาหาร: ["lotus's"],
  home: ['homepro'],
  ของแต่งบ้าน: ['homepro'],
  บ้าน: ['homepro'],
  diy: ['homepro'],
  tech: ['xiaomi', 'studio7', 'banggood'],
  เทคโนโลยี: ['xiaomi', 'studio7'],
  electronics: ['xiaomi', 'studio7', 'banggood'],
  gadgets: ['banggood'],
  กล้อง: ['studio7'],
  camera: ['studio7'],
  apple: ['studio7'],
  fashion: ['shein'],
  แฟชั่น: ['shein'],
  clothing: ['shein'],
  เสื้อผ้า: ['shein'],
  travel: ['trip.com'],
  ท่องเที่ยว: ['trip.com'],
  education: ['b2s'],
  การศึกษา: ['b2s'],
  books: ['b2s'],
  หนังสือ: ['b2s'],
  jewelry: ['chow sang sang'],
  เครื่องประดับ: ['chow sang sang'],
  fitness: ['banggood'],
  ออกกำลังกาย: ['banggood'],
  sports: ['banggood'],
  pets: ['banggood'],
}

function selectFeedsForNiche(
  feedUrls: Array<{ url: string; merchant: string }>,
  niche: string,
  keywords: string[]
): Array<{ url: string; merchant: string }> {
  // Find relevant merchants for this niche
  const relevantMerchants = new Set<string>()
  for (const [key, merchants] of Object.entries(NICHE_MERCHANTS)) {
    const k = key.toLowerCase()
    if (niche.includes(k) || k.includes(niche) || keywords.some(kw => kw.includes(k) || k.includes(kw))) {
      merchants.forEach(m => relevantMerchants.add(m.toLowerCase()))
    }
  }

  // Match feed URLs to relevant merchants
  const matched = feedUrls.filter(f => {
    const mLower = f.merchant.toLowerCase()
    return [...relevantMerchants].some(rm => mLower.includes(rm) || rm.includes(mLower))
  })

  // Return matched first, then all (so we always have something)
  const rest = feedUrls.filter(f => !matched.includes(f))
  return matched.length > 0 ? [...matched, ...rest] : feedUrls
}

// ── Normalizer ────────────────────────────────────────────────

function normalizeProduct(p: RawFeedProduct, fallbackMerchant: string): InvolveProduct {
  const commRate = 0 // Data feed doesn't include commission; that's per campaign
  const url = p.product_url

  const platform = url?.includes('shopee') ? 'Shopee'
    : url?.includes('lazada') ? 'Lazada'
    : url?.includes('banggood') ? 'Banggood'
    : url?.includes('sephora') ? 'Sephora'
    : url?.includes('homepro') ? 'HomePro'
    : url?.includes('lotus') ? "Lotus's"
    : url?.includes('mi.com') || url?.includes('xiaomi') ? 'Xiaomi'
    : url?.includes('studio7') ? 'Studio7'
    : url?.includes('shein') ? 'Shein'
    : url?.includes('b2s') ? 'B2S'
    : url?.includes('trip.com') ? 'Trip.com'
    : p.merchant || fallbackMerchant

  const category = p.category || 'general'

  return {
    id: p.id || String(Math.random()),
    name: p.name,
    brand: p.brand || fallbackMerchant,
    price: p.price,
    original_price: p.original_price,
    currency: 'THB',
    commission_rate: commRate,
    commission_thb: 0,
    product_url: url,
    image_url: p.image_url || '',
    category,
    category_th: categoryToThai(category),
    merchant_name: p.merchant || fallbackMerchant,
    merchant_id: '',
    platform,
    tags: [category.toLowerCase(), (p.brand || '').toLowerCase(), fallbackMerchant.toLowerCase()].filter(Boolean),
    in_stock: p.in_stock,
  }
}

function categoryToThai(cat: string): string {
  const map: Record<string, string> = {
    beauty: 'ความงาม', skincare: 'สกินแคร์', makeup: 'แต่งหน้า',
    food: 'อาหาร', 'food-beverage': 'อาหารและเครื่องดื่ม', kitchen: 'ของใช้ครัว',
    sports: 'กีฬา', fitness: 'ฟิตเนส', health: 'สุขภาพ',
    fashion: 'แฟชั่น', clothing: 'เสื้อผ้า', shoes: 'รองเท้า',
    electronics: 'อิเล็กทรอนิกส์', gadgets: 'แกดเจ็ต', tech: 'เทคโนโลยี',
    travel: 'ท่องเที่ยว', hotel: 'โรงแรม',
    pets: 'สัตว์เลี้ยง',
    home: 'ของแต่งบ้าน', furniture: 'เฟอร์นิเจอร์',
    education: 'การศึกษา', books: 'หนังสือ',
    jewelry: 'เครื่องประดับ',
  }
  return map[cat.toLowerCase()] ?? cat
}

// ── Keyword helper ────────────────────────────────────────────

export function nicheToKeywords(niche: string, platform: string): string[] {
  const nicheLower = niche.toLowerCase()
  const keywords: string[] = [niche]

  const categoryKeywords: Record<string, string[]> = {
    beauty: ['beauty', 'skincare', 'makeup'], ความงาม: ['beauty', 'skincare'],
    food: ['food', 'cooking', 'kitchen'], อาหาร: ['food', 'kitchen'],
    fitness: ['fitness', 'sports', 'health'], fashion: ['fashion', 'clothing'],
    tech: ['electronics', 'gadgets', 'tech'], home: ['home', 'furniture'],
    education: ['education', 'books'], travel: ['travel', 'hotel'],
    pets: ['pets', 'pet-supplies'],
  }

  for (const [key, cats] of Object.entries(categoryKeywords)) {
    if (nicheLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nicheLower)) {
      keywords.push(...cats.slice(0, 2))
    }
  }

  if (platform === 'tiktok' || platform === 'instagram') keywords.push('trending')
  return [...new Set(keywords)].slice(0, 5)
}

// ── Legacy alias for backward compatibility ───────────────────
export const getCampaigns = getOffers
