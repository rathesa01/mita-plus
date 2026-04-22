/**
 * Shopee Thailand Public Search
 * ดึงสินค้า trending/ขายดี per niche สำหรับ MITA+ product pool
 *
 * ข้อมูลที่ได้: ชื่อ, ราคา, รูป, rating, ยอดขาย
 * refresh ทุก Sunday 02:00 (ไทย) ผ่าน cron job
 */

// ── Types ─────────────────────────────────────────────────

export interface ShopeeProduct {
  id: string
  name: string
  price: number          // THB
  price_min: number
  price_max: number
  currency: string
  image_url: string
  product_url: string
  rating: number         // 0-5
  sold: number           // ยอดขายรวม (สำหรับ rank ความนิยม)
  shop_name: string
  niche: string          // niche ที่ดึงมา
  tags: string[]
  platform: 'shopee'
}

// ── Niche → Keywords (ภาษาไทย ตรงกับที่คนค้นบน Shopee) ──

export const NICHE_KEYWORDS: Record<string, string[]> = {
  // Beauty / Skincare
  'ความงาม':     ['เซรั่มหน้า', 'ครีมกันแดด SPF50', 'มอยเจอร์ไรเซอร์', 'วิตามินซีหน้า', 'คลีนเซอร์'],
  'สกินแคร์':   ['เซรั่มหน้า', 'ครีมบำรุงผิวหน้า', 'มาส์กหน้า', 'โทนเนอร์', 'อายครีม'],
  'แต่งหน้า':   ['ลิปสติก', 'รองพื้น', 'คอนซีลเลอร์', 'บลัชออน', 'มาสคาร่า'],
  'beauty':      ['เซรั่มหน้า', 'ครีมกันแดด', 'ลิปสติก', 'มอยเจอร์ไรเซอร์'],
  'skincare':    ['เซรั่มหน้า', 'ครีมบำรุงผิว', 'มาส์กหน้า'],

  // Food / Cooking
  'อาหาร':      ['อุปกรณ์ทำขนม', 'วัตถุดิบขนม', 'เครื่องปรุงรส', 'หม้อทอดอากาศ', 'กระทะไม่ติด'],
  'ทำอาหาร':   ['อุปกรณ์ครัว', 'หม้อ กระทะ', 'วัตถุดิบอาหาร', 'เครื่องปรุง'],
  'เบเกอรี่':   ['แม่พิมพ์เค้ก', 'วัตถุดิบขนม', 'อุปกรณ์ทำเบเกอรี่', 'เตาอบขนม'],
  'food':        ['อุปกรณ์ครัว', 'วัตถุดิบทำอาหาร', 'หม้อทอดอากาศ'],

  // Fashion
  'แฟชั่น':     ['เสื้อผ้าผู้หญิงเกาหลี', 'กระเป๋าสะพายข้าง', 'รองเท้าผู้หญิง', 'เดรสแฟชั่น'],
  'เสื้อผ้า':   ['เสื้อผ้าแฟชั่น', 'ชุดเดรส', 'เสื้อครอป', 'กางเกงขาบาน'],
  'fashion':     ['เสื้อผ้าผู้หญิง', 'กระเป๋า', 'รองเท้า'],

  // Tech / Electronics
  'เทคโนโลยี': ['หูฟังบลูทูธ', 'สมาร์ทวอทช์', 'power bank', 'ลำโพงบลูทูธ', 'ring light'],
  'กล้อง':      ['กล้องมิเรอร์เลส', 'ring light', 'ไมโครโฟนไร้สาย', 'statbilizer กล้อง'],
  'tech':        ['หูฟังบลูทูธ', 'สมาร์ทวอทช์', 'power bank'],
  'gadgets':     ['แกดเจ็ต', 'อุปกรณ์ไอที', 'ของเล่นเทคโนโลยี'],

  // Home Decor
  'ของแต่งบ้าน': ['ของแต่งบ้าน', 'ไฟตกแต่ง LED', 'กระถางต้นไม้', 'ผ้าม่าน', 'หมอนอิง'],
  'บ้าน':        ['เฟอร์นิเจอร์', 'ของแต่งบ้าน', 'โคมไฟ', 'ชั้นวางของ'],
  'home':        ['ของแต่งบ้าน', 'ไฟตกแต่ง', 'กระถางต้นไม้'],

  // Fitness / Sports
  'ฟิตเนส':         ['อุปกรณ์ออกกำลังกาย', 'โปรตีนเชค', 'ชุดออกกำลังกาย', 'resistance band', 'โยคะแมท'],
  'ออกกำลังกาย':   ['ดัมเบล', 'resistance band', 'โยคะแมท', 'ชุดกีฬา'],
  'fitness':         ['อุปกรณ์ออกกำลังกาย', 'โปรตีน', 'ชุดกีฬา'],
  'sports':          ['อุปกรณ์กีฬา', 'ชุดกีฬา', 'รองเท้ากีฬา'],

  // Travel
  'ท่องเที่ยว': ['กระเป๋าเดินทาง', 'travel organizer', 'หมอนรองคอเดินทาง', 'travel adapter'],
  'travel':      ['กระเป๋าเดินทาง', 'travel adapter', 'travel organizer'],

  // Education / Books
  'การศึกษา':   ['หนังสือ', 'เครื่องเขียน', 'สมุดโน้ต', 'ปากกา'],
  'หนังสือ':    ['หนังสือพัฒนาตัวเอง', 'หนังสือการเงิน', 'หนังสือธุรกิจ'],
  'education':   ['หนังสือ', 'เครื่องเขียน', 'อุปกรณ์เรียน'],

  // Pets
  'สัตว์เลี้ยง': ['อาหารแมว', 'อาหารสุนัข', 'ของเล่นแมว', 'ทรายแมว', 'บ้านแมว'],
  'แมว':          ['อาหารแมว', 'ของเล่นแมว', 'ทรายแมว', 'ที่นอนแมว'],
  'สุนัข':        ['อาหารสุนัข', 'ของเล่นสุนัข', 'สายจูงสุนัข', 'ที่นอนสุนัข'],
  'pets':          ['อาหารแมว', 'อาหารสุนัข', 'ของเล่นสัตว์เลี้ยง'],

  // Jewelry
  'เครื่องประดับ': ['สร้อยคอ', 'ต่างหู', 'แหวน', 'กำไลข้อมือ', 'จี้สร้อย'],
  'jewelry':        ['สร้อยคอ', 'ต่างหู', 'แหวน'],
}

// niche ทั้งหมดที่ cron job ต้อง refresh ทุกอาทิตย์
export const ALL_NICHES = [
  'ความงาม', 'อาหาร', 'แฟชั่น', 'เทคโนโลยี',
  'ของแต่งบ้าน', 'ฟิตเนส', 'ท่องเที่ยว',
  'การศึกษา', 'สัตว์เลี้ยง', 'เครื่องประดับ',
]

// ── Shopee Search ──────────────────────────────────────────

const SHOPEE_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://shopee.co.th/',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
  'X-Requested-With': 'XMLHttpRequest',
}

export async function searchShopeeByKeyword(
  keyword: string,
  limit = 50
): Promise<ShopeeProduct[]> {
  const params = new URLSearchParams({
    keyword,
    limit:       String(Math.min(limit, 50)),
    sort_type:   '2',   // 2 = ขายดีที่สุด (most sold)
    newest:      '0',
    by:          'relevancy',
    match_id:    '0',
    page_type:   'search',
    scenario:    'PAGE_GLOBAL_SEARCH',
    version:     '2',
  })

  const url = `https://shopee.co.th/api/v4/search/search_items?${params}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)

  let res: Response
  try {
    res = await fetch(url, {
      headers: SHOPEE_HEADERS,
      signal:  controller.signal,
      cache:   'no-store',
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    console.warn(`[shopeeSearch] "${keyword}" → HTTP ${res.status}`)
    return []
  }

  let json: any
  try { json = await res.json() } catch { return [] }

  const items: any[] = json?.data?.items ?? []
  if (items.length === 0) {
    console.warn(`[shopeeSearch] "${keyword}" → 0 items`)
    return []
  }

  const products = items
    .map(item => normalizeShopeeItem(item, keyword))
    .filter(p => p.name.length > 0 && p.price > 0 && p.image_url)

  console.log(`[shopeeSearch] "${keyword}" → ${products.length} products`)
  return products
}

// ── Normalize raw Shopee item ──────────────────────────────

function normalizeShopeeItem(item: any, niche: string): ShopeeProduct {
  const b = item?.item_basic ?? item

  const itemId  = b.itemid  ?? b.item_id  ?? 0
  const shopId  = b.shopid  ?? b.shop_id  ?? 0
  const imageId = b.image   ?? b.images?.[0] ?? ''

  // Shopee ราคาหน่วย cents (หาร 100000 = บาท)
  const toThb = (v: number) => Math.round((v ?? 0) / 100000)

  const price    = toThb(b.price ?? b.price_min ?? 0)
  const priceMin = toThb(b.price_min ?? b.price ?? 0)
  const priceMax = toThb(b.price_max ?? b.price ?? 0)

  return {
    id:          `sh_${shopId}_${itemId}`,
    name:        String(b.name ?? '').trim(),
    price,
    price_min:   priceMin,
    price_max:   priceMax,
    currency:    'THB',
    image_url:   imageId ? `https://down-th.img.susercontent.com/file/${imageId}` : '',
    product_url: `https://shopee.co.th/product/${shopId}/${itemId}`,
    rating:      parseFloat((b.item_rating?.rating_star ?? b.rating_star ?? 0).toFixed(1)),
    sold:        b.historical_sold ?? b.sold ?? 0,
    shop_name:   b.shop_name ?? '',
    niche,
    tags:        [niche, b.shop_name ?? ''].filter(Boolean),
    platform:    'shopee',
  }
}

// ── Build Pool (200 สินค้า) per niche ─────────────────────

/**
 * ดึงสินค้า pool 200 ชิ้นสำหรับ niche นี้
 * - ใช้ keywords หลายตัว → merge → deduplicate → sort by sold
 */
export async function buildProductPool(
  niche: string,
  targetCount = 200
): Promise<ShopeeProduct[]> {
  // หา keywords ที่เหมาะกับ niche นี้
  const keywords = findKeywordsForNiche(niche)
  console.log(`[shopeeSearch] Building pool for "${niche}" | keywords: ${keywords.join(', ')}`)

  const perKeyword = Math.ceil(targetCount / keywords.length)
  const seen = new Set<string>()
  const pool: ShopeeProduct[] = []

  for (const kw of keywords) {
    try {
      const products = await searchShopeeByKeyword(kw, Math.min(perKeyword + 10, 50))
      for (const p of products) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          pool.push({ ...p, niche })
        }
      }
    } catch (err) {
      console.warn(`[shopeeSearch] keyword "${kw}" error:`, err)
    }
    // delay เล็กน้อยระหว่าง requests
    await new Promise(r => setTimeout(r, 400))
  }

  // sort โดย sold (ขายดีสุดขึ้นก่อน)
  pool.sort((a, b) => b.sold - a.sold)

  console.log(`[shopeeSearch] Pool built: ${pool.length} products for "${niche}"`)
  return pool.slice(0, targetCount)
}

// ── Keyword lookup ─────────────────────────────────────────

export function findKeywordsForNiche(niche: string): string[] {
  const nicheLower = niche.toLowerCase().trim()

  // exact match first
  for (const [key, kws] of Object.entries(NICHE_KEYWORDS)) {
    if (key.toLowerCase() === nicheLower) return kws
  }

  // partial match
  for (const [key, kws] of Object.entries(NICHE_KEYWORDS)) {
    const k = key.toLowerCase()
    if (nicheLower.includes(k) || k.includes(nicheLower)) return kws
  }

  // fallback: use niche name as keyword + general
  return [niche, 'ของขวัญ', 'สินค้าขายดี']
}

/**
 * Match user niche → canonical niche name (for pool lookup)
 * e.g. "beauty" → "ความงาม", "ทำอาหาร" → "อาหาร"
 */
export function canonicalNiche(niche: string): string {
  const n = niche.toLowerCase().trim()

  const map: Record<string, string> = {
    beauty: 'ความงาม', skincare: 'ความงาม', สกินแคร์: 'ความงาม',
    makeup: 'ความงาม', แต่งหน้า: 'ความงาม',
    food: 'อาหาร', ทำอาหาร: 'อาหาร', เบเกอรี: 'อาหาร', เบเกอรี่: 'อาหาร',
    fashion: 'แฟชั่น', เสื้อผ้า: 'แฟชั่น', clothing: 'แฟชั่น',
    tech: 'เทคโนโลยี', technology: 'เทคโนโลยี', electronics: 'เทคโนโลยี',
    gadgets: 'เทคโนโลยี', กล้อง: 'เทคโนโลยี', camera: 'เทคโนโลยี',
    home: 'ของแต่งบ้าน', บ้าน: 'ของแต่งบ้าน', 'home decor': 'ของแต่งบ้าน',
    fitness: 'ฟิตเนส', ออกกำลังกาย: 'ฟิตเนส', sports: 'ฟิตเนส', กีฬา: 'ฟิตเนส',
    travel: 'ท่องเที่ยว', ท่องเที่ยว: 'ท่องเที่ยว',
    education: 'การศึกษา', หนังสือ: 'การศึกษา', books: 'การศึกษา',
    pets: 'สัตว์เลี้ยง', แมว: 'สัตว์เลี้ยง', สุนัข: 'สัตว์เลี้ยง',
    jewelry: 'เครื่องประดับ', เครื่องประดับ: 'เครื่องประดับ',
  }

  for (const [key, canonical] of Object.entries(map)) {
    if (n.includes(key) || key.includes(n)) return canonical
  }

  return niche // return as-is ถ้าหาไม่เจอ
}
