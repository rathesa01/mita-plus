/**
 * MITA+ Affiliate Product Catalog
 * Products organized by niche — used by Claude to match creator's audience
 */

export interface AffiliateProduct {
  id: string
  name: string
  nameEn: string
  icon: string
  price: number        // THB
  commission: number   // percent
  platform: 'shopee' | 'lazada' | 'clickbank' | 'other'
  platformLabel: string
  affiliateUrl: string // template URL — replace {ref} with user's ref code
  category: string
  tags: string[]       // niche tags for matching
  hot: boolean
  description: string  // short Thai description for why to promote
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // ─── ความงาม / Beauty ───────────────────────────────
  {
    id: 'beauty_001',
    name: 'เซรั่มวิตามินซี 30ml',
    nameEn: 'Vitamin C Serum',
    icon: '✨',
    price: 390,
    commission: 12,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=vitamin-c-serum',
    category: 'beauty',
    tags: ['beauty', 'skincare', 'ความงาม', 'ผิวหน้า', 'lifestyle', 'หญิง'],
    hot: true,
    description: 'ขายดีอันดับ 1 หมวด skincare — คนดูสาวๆ ซื้อง่าย',
  },
  {
    id: 'beauty_002',
    name: 'แปรงแต่งหน้า 12 ชิ้น Set',
    nameEn: 'Makeup Brush Set',
    icon: '💄',
    price: 299,
    commission: 10,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=makeup-brush-set',
    category: 'beauty',
    tags: ['beauty', 'makeup', 'แต่งหน้า', 'ความงาม', 'หญิง'],
    hot: false,
    description: 'ราคาต่ำ conversion สูง เหมาะทำคลิป unbox',
  },
  {
    id: 'beauty_003',
    name: 'ครีมกันแดด SPF50+ PA++++',
    nameEn: 'Sunscreen SPF50+',
    icon: '🌞',
    price: 320,
    commission: 11,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=sunscreen-spf50',
    category: 'beauty',
    tags: ['beauty', 'skincare', 'ผิวหน้า', 'ความงาม', 'lifestyle', 'outdoor'],
    hot: true,
    description: 'ทุกเพศทุกวัยต้องใช้ — conversion ดีมากบน TikTok',
  },

  // ─── อาหาร / Food & Cooking ──────────────────────────
  {
    id: 'food_001',
    name: 'พิมพ์ซิลิโคน Nordic 6 แบบ',
    nameEn: 'Nordic Silicone Mold Set',
    icon: '🧁',
    price: 290,
    commission: 8,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=nordic-mold',
    category: 'food',
    tags: ['food', 'baking', 'ทำขนม', 'เบเกอรี', 'อาหาร', 'cooking'],
    hot: true,
    description: 'สินค้า trending สำหรับช่องทำขนม — ซื้อซ้ำบ่อย',
  },
  {
    id: 'food_002',
    name: 'เครื่องชั่งดิจิตอล 0.1g ความแม่น',
    nameEn: 'Digital Kitchen Scale',
    icon: '⚖️',
    price: 180,
    commission: 10,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=kitchen-scale',
    category: 'food',
    tags: ['food', 'baking', 'cooking', 'ทำขนม', 'ทำอาหาร', 'เบเกอรี'],
    hot: true,
    description: 'ของใช้จำเป็นสำหรับคนทำขนม — ราคาถูก ขายง่าย',
  },
  {
    id: 'food_003',
    name: 'หม้อทอดไร้น้ำมัน 5L Xiaomi',
    nameEn: 'Air Fryer 5L',
    icon: '🍳',
    price: 1890,
    commission: 6,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=air-fryer-5l',
    category: 'food',
    tags: ['food', 'cooking', 'ทำอาหาร', 'kitchen', 'lifestyle', 'tech'],
    hot: true,
    description: 'สินค้า high-ticket — commission สูงต่อชิ้น แม้ขายได้น้อยชิ้น',
  },
  {
    id: 'food_004',
    name: 'สีผสมอาหาร Set 12 สี',
    nameEn: 'Food Coloring Set',
    icon: '🎨',
    price: 220,
    commission: 7,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=food-coloring',
    category: 'food',
    tags: ['food', 'baking', 'ทำขนม', 'เบเกอรี', 'อาหาร'],
    hot: false,
    description: 'แสดงในคลิปง่าย — ดูใช้แล้วอยากซื้อตาม',
  },

  // ─── ฟิตเนส / Health & Fitness ──────────────────────
  {
    id: 'fitness_001',
    name: 'Resistance Band Set 5 ระดับ',
    nameEn: 'Resistance Band Set',
    icon: '💪',
    price: 350,
    commission: 12,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=resistance-band',
    category: 'fitness',
    tags: ['fitness', 'gym', 'workout', 'health', 'ออกกำลังกาย', 'สุขภาพ'],
    hot: true,
    description: 'กำลังเทรนด์ — เห็นในคลิปออกกำลังกายแล้วซื้อทันที',
  },
  {
    id: 'fitness_002',
    name: 'โปรตีน Whey 1kg (Vanilla)',
    nameEn: 'Whey Protein 1kg',
    icon: '🥤',
    price: 890,
    commission: 9,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=whey-protein',
    category: 'fitness',
    tags: ['fitness', 'gym', 'workout', 'health', 'nutrition', 'สุขภาพ'],
    hot: true,
    description: 'ซื้อซ้ำทุกเดือน — passive income จากคนที่ subscribe brand',
  },
  {
    id: 'fitness_003',
    name: 'เสื่อโยคะ 6mm Non-slip',
    nameEn: 'Yoga Mat 6mm',
    icon: '🧘',
    price: 450,
    commission: 10,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=yoga-mat',
    category: 'fitness',
    tags: ['fitness', 'yoga', 'workout', 'health', 'ออกกำลังกาย', 'หญิง'],
    hot: false,
    description: 'เหมาะช่อง yoga และ home workout — visual appeal สูง',
  },

  // ─── แฟชั่น / Fashion ───────────────────────────────
  {
    id: 'fashion_001',
    name: 'กระเป๋า Canvas ผ้า Tote Bag',
    nameEn: 'Canvas Tote Bag',
    icon: '👜',
    price: 199,
    commission: 9,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=canvas-tote',
    category: 'fashion',
    tags: ['fashion', 'แฟชั่น', 'ของแต่งตัว', 'lifestyle', 'หญิง', 'outfit'],
    hot: false,
    description: 'ราคาต่ำ impulse buy สูง เห็นในคลิป OOTD ซื้อตาม',
  },
  {
    id: 'fashion_002',
    name: 'รองเท้าผ้าใบ Minimal สีขาว',
    nameEn: 'White Sneakers',
    icon: '👟',
    price: 590,
    commission: 8,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=white-sneakers',
    category: 'fashion',
    tags: ['fashion', 'แฟชั่น', 'ของแต่งตัว', 'outfit', 'streetwear'],
    hot: true,
    description: 'ของใส่ได้ทุกวัน — ดูดีในรูปพร้อม link ซื้อได้เลย',
  },

  // ─── เทคโนโลยี / Tech & Gadgets ─────────────────────
  {
    id: 'tech_001',
    name: 'Ring Light LED 10 นิ้ว + ขาตั้ง',
    nameEn: 'Ring Light 10" with Stand',
    icon: '💡',
    price: 690,
    commission: 10,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=ring-light-10',
    category: 'tech',
    tags: ['tech', 'creator', 'streaming', 'youtube', 'tiktok', 'photography', 'content creator'],
    hot: true,
    description: 'ใช้ในคลิปของตัวเองได้เลย — social proof สูงมาก',
  },
  {
    id: 'tech_002',
    name: 'ไมโครโฟน Wireless Clip-on',
    nameEn: 'Wireless Lavalier Mic',
    icon: '🎙️',
    price: 890,
    commission: 11,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=wireless-mic',
    category: 'tech',
    tags: ['tech', 'creator', 'youtube', 'podcast', 'content creator', 'vlog'],
    hot: true,
    description: 'ทุก content creator ต้องการ — review ใน B-roll ได้เลย',
  },
  {
    id: 'tech_003',
    name: 'Tripod มือถือ 170cm ปรับได้',
    nameEn: 'Phone Tripod 170cm',
    icon: '📱',
    price: 450,
    commission: 9,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=phone-tripod',
    category: 'tech',
    tags: ['tech', 'creator', 'tiktok', 'youtube', 'content creator', 'vlog', 'photography'],
    hot: false,
    description: 'ของที่ creator ทุกคนต้องใช้ — recommend ได้ทุกคลิป',
  },

  // ─── การเดินทาง / Travel ─────────────────────────────
  {
    id: 'travel_001',
    name: 'กระเป๋าเดินทาง 24" Hardcase',
    nameEn: 'Hardcase Luggage 24"',
    icon: '🧳',
    price: 1590,
    commission: 7,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=luggage-24',
    category: 'travel',
    tags: ['travel', 'ท่องเที่ยว', 'vlog', 'lifestyle', 'outdoor'],
    hot: false,
    description: 'สินค้า high-ticket สำหรับช่อง travel — commission ดีต่อชิ้น',
  },
  {
    id: 'travel_002',
    name: 'กล้อง Action Camera 4K Waterproof',
    nameEn: '4K Action Camera',
    icon: '📷',
    price: 2490,
    commission: 6,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=action-cam-4k',
    category: 'travel',
    tags: ['travel', 'ท่องเที่ยว', 'outdoor', 'adventure', 'photography', 'vlog'],
    hot: true,
    description: 'ใช้ถ่ายในคลิปตัวเองได้ — review แล้วขาย conversion สูง',
  },

  // ─── สัตว์เลี้ยง / Pets ──────────────────────────────
  {
    id: 'pets_001',
    name: 'น้ำพุ Cat Fountain อัตโนมัติ',
    nameEn: 'Cat Water Fountain',
    icon: '🐱',
    price: 590,
    commission: 10,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=cat-fountain',
    category: 'pets',
    tags: ['pets', 'cat', 'แมว', 'สัตว์เลี้ยง', 'pet care'],
    hot: true,
    description: 'ตลาดสัตว์เลี้ยงโตเร็ว — คนรักแมวซื้อไม่ลังเล',
  },
  {
    id: 'pets_002',
    name: 'เบาะที่นอนสุนัข Memory Foam',
    nameEn: 'Dog Memory Foam Bed',
    icon: '🐶',
    price: 890,
    commission: 9,
    platform: 'lazada',
    platformLabel: 'Lazada',
    affiliateUrl: 'https://www.lazada.co.th/affiliate?pid={ref}&item=dog-bed-foam',
    category: 'pets',
    tags: ['pets', 'dog', 'หมา', 'สัตว์เลี้ยง', 'pet care'],
    hot: false,
    description: 'เจ้าของสุนัขลงทุนเพื่อสัตว์เลี้ยงไม่ลังเล — AOV สูง',
  },

  // ─── การศึกษา / Education & Self-Dev ─────────────────
  {
    id: 'edu_001',
    name: 'คอร์สออนไลน์ Canva Pro (Udemy)',
    nameEn: 'Canva Pro Course',
    icon: '🎨',
    price: 499,
    commission: 30,
    platform: 'other',
    platformLabel: 'Udemy',
    affiliateUrl: 'https://www.udemy.com/affiliate?pid={ref}&course=canva-pro-th',
    category: 'education',
    tags: ['education', 'design', 'creator', 'freelance', 'digital', 'content creator', 'self-dev'],
    hot: false,
    description: 'Commission สูงสุด 30% — digital product margin ดีมาก',
  },
  {
    id: 'edu_002',
    name: 'หนังสือ "รวยด้วยหุ้น" Thai Version',
    nameEn: 'Stock Investment Book',
    icon: '📚',
    price: 299,
    commission: 8,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=stock-book-th',
    category: 'education',
    tags: ['education', 'finance', 'การเงิน', 'การลงทุน', 'self-dev', 'หุ้น'],
    hot: false,
    description: 'คนดูช่องการเงินซื้อหนังสือสูง — trust ของ creator สำคัญ',
  },

  // ─── ของตกแต่งบ้าน / Home & Decor ───────────────────
  {
    id: 'home_001',
    name: 'เทียนหอม Soy Wax Set 3 กลิ่น',
    nameEn: 'Soy Candle Gift Set',
    icon: '🕯️',
    price: 390,
    commission: 11,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=soy-candle-set',
    category: 'home',
    tags: ['home', 'decor', 'ของแต่งบ้าน', 'lifestyle', 'gift', 'aesthetic'],
    hot: true,
    description: 'Visual สวย — ขึ้นรูปดีในคลิป aesthetic lifestyle',
  },
  {
    id: 'home_002',
    name: 'ชุดจัดระเบียบ Closet 8 ชิ้น',
    nameEn: 'Closet Organizer Set',
    icon: '🗂️',
    price: 350,
    commission: 8,
    platform: 'shopee',
    platformLabel: 'Shopee',
    affiliateUrl: 'https://s.shopee.co.th/affiliate?pid={ref}&item=closet-organizer',
    category: 'home',
    tags: ['home', 'organization', 'จัดบ้าน', 'lifestyle', 'minimalist', 'aesthetic'],
    hot: false,
    description: 'คลิป "จัดบ้าน + ลิ้งค์สินค้า" ดูดีและ convert สูง',
  },
]

// ── Helper: Get products by tags ─────────────────────────
export function getProductsByTags(tags: string[], limit = 8): AffiliateProduct[] {
  const normalizedTags = tags.map(t => t.toLowerCase())

  const scored = AFFILIATE_PRODUCTS.map(p => {
    const score = p.tags.filter(t => normalizedTags.some(nt => t.includes(nt) || nt.includes(t))).length
    return { product: p, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => {
      // Sort by match score DESC, then hot products first, then commission DESC
      if (b.score !== a.score) return b.score - a.score
      if (a.product.hot !== b.product.hot) return a.product.hot ? -1 : 1
      return b.product.commission - a.product.commission
    })
    .slice(0, limit)
    .map(s => s.product)
}

// ── Helper: Get all categories ───────────────────────────
export function getAllCategories(): string[] {
  return [...new Set(AFFILIATE_PRODUCTS.map(p => p.category))]
}
