/**
 * Trending Products — Curated by niche
 * Phase 1: Static curation (manual)
 * Phase 2: Replace with Involve Asia / Lazada API
 */

export interface TrendingProduct {
  name: string
  price: number
  commission: number   // %
  emoji: string
  hot: boolean
  trendReason: string  // ทำไมถึง trending
  url?: string         // affiliate link (Phase 2)
}

const PRODUCTS_BY_NICHE: Record<string, TrendingProduct[]> = {
  food: [
    { name: 'พิมพ์ซิลิโคน Nordic', price: 290, commission: 8, emoji: '🧁', hot: true,
      trendReason: 'ค้นหาใน Lazada เพิ่ม 38% สัปดาห์นี้' },
    { name: 'เครื่องชั่งดิจิตอล', price: 180, commission: 10, emoji: '⚖️', hot: true,
      trendReason: 'คลิปอบขนมนิยมโชว์ชั่งส่วนผสม' },
    { name: 'ชุดอุปกรณ์แต่งเค้ก', price: 450, commission: 6, emoji: '🎂', hot: false,
      trendReason: 'ขายดีช่วงเทศกาล' },
    { name: 'ถุงบีบครีม 50 ชิ้น', price: 120, commission: 9, emoji: '🍦', hot: false,
      trendReason: 'Consumable — ลูกค้าซื้อซ้ำสูง' },
    { name: 'สีผสมอาหาร Set 12 สี', price: 220, commission: 7, emoji: '🎨', hot: false,
      trendReason: 'เหมาะกับคลิปแต่งขนมสีสัน' },
  ],
  beauty: [
    { name: 'เซรั่มวิตามินซี', price: 390, commission: 10, emoji: '✨', hot: true,
      trendReason: 'เทรนด์ Brightening สกินในไทยกำลังมาแรง' },
    { name: 'SPF50 Sunscreen Gel', price: 290, commission: 8, emoji: '☀️', hot: true,
      trendReason: 'หน้าร้อนนี้ทุกคนหา sunscreen' },
    { name: 'Facial Roller หยก', price: 250, commission: 12, emoji: '💚', hot: false,
      trendReason: 'Self-care content ได้ save สูง' },
    { name: 'Sheet Mask Box 10 แผ่น', price: 180, commission: 9, emoji: '🎭', hot: false,
      trendReason: 'ราคาถูก ง่ายต่อการซื้อตาม' },
    { name: 'Lip Oil Gloss', price: 150, commission: 11, emoji: '💄', hot: false,
      trendReason: 'Viral บน TikTok ต่างประเทศ กำลังมาไทย' },
  ],
  fitness: [
    { name: 'Resistance Band Set', price: 299, commission: 10, emoji: '🏋️', hot: true,
      trendReason: 'ออกกำลังกายที่บ้านยังมาแรง' },
    { name: 'โปรตีนเวย์ไทย 1kg', price: 590, commission: 8, emoji: '💪', hot: true,
      trendReason: 'แบรนด์ไทย commission ดีกว่า import' },
    { name: 'สายวัดรอบเอว', price: 89, commission: 15, emoji: '📏', hot: false,
      trendReason: 'ราคาถูก ง่ายต่อ impulse buy' },
    { name: 'Yoga Mat 8mm', price: 450, commission: 7, emoji: '🧘', hot: false,
      trendReason: 'คลิป yoga ได้ retention สูง' },
    { name: 'Shaker Bottle', price: 199, commission: 9, emoji: '🥤', hot: false,
      trendReason: 'คู่กับโปรตีน — ขายพ่วงได้ดี' },
  ],
  lifestyle: [
    { name: 'Scented Candle Set', price: 350, commission: 12, emoji: '🕯️', hot: true,
      trendReason: 'Aesthetic content เพิ่ม engagement' },
    { name: 'Planner 2025', price: 290, commission: 8, emoji: '📓', hot: true,
      trendReason: 'ต้นปียังขายได้อยู่' },
    { name: 'ไม้อบอากาศ Diffuser', price: 599, commission: 10, emoji: '🌿', hot: false,
      trendReason: 'Home & living trending' },
    { name: 'Desk Organizer', price: 250, commission: 9, emoji: '🗂️', hot: false,
      trendReason: 'Productivity content ได้ share สูง' },
    { name: 'Polaroid Film', price: 380, commission: 7, emoji: '📸', hot: false,
      trendReason: 'Y2K aesthetic กำลังกลับมา' },
  ],
  finance: [
    { name: 'หนังสือการเงิน "รวยด้วยหุ้น"', price: 279, commission: 5, emoji: '📚', hot: true,
      trendReason: 'Book review ได้ engagement ดีใน niche นี้' },
    { name: 'Notion Template ออมเงิน', price: 99, commission: 70, emoji: '📊', hot: true,
      trendReason: 'Digital product commission สูงมาก' },
    { name: 'Budget Planner Notebook', price: 189, commission: 8, emoji: '📝', hot: false,
      trendReason: 'Physical product ที่ finance creator นิยม' },
  ],
  education: [
    { name: 'iPad Pencil Gen 2', price: 2990, commission: 3, emoji: '✏️', hot: true,
      trendReason: 'Note-taking content ได้ commission สูงมูลค่า' },
    { name: 'หูฟัง Study Mode', price: 890, commission: 5, emoji: '🎧', hot: false,
      trendReason: 'Study with me content ต้องมีหูฟัง' },
    { name: 'Flashcard Set', price: 149, commission: 10, emoji: '🃏', hot: false,
      trendReason: 'ราคาเข้าถึงง่าย ซื้อตามง่าย' },
  ],
  travel: [
    { name: 'กระเป๋าเดินทาง 24"', price: 1290, commission: 5, emoji: '🧳', hot: true,
      trendReason: 'ฤดูท่องเที่ยวกำลังมา' },
    { name: 'Travel Adapter', price: 290, commission: 10, emoji: '🔌', hot: true,
      trendReason: 'ทุกทริปต้องใช้ commission ดี' },
    { name: 'Packing Cubes Set', price: 390, commission: 8, emoji: '📦', hot: false,
      trendReason: 'Packing video ได้ view เยอะ' },
  ],
  entertainment: [
    { name: 'Ring Light 10"', price: 599, commission: 8, emoji: '💡', hot: true,
      trendReason: 'Creator ทุกคนต้องใช้' },
    { name: 'Wireless Microphone', price: 890, commission: 7, emoji: '🎤', hot: true,
      trendReason: 'คุณภาพเสียงสำคัญมาก' },
    { name: 'Phone Stand', price: 199, commission: 12, emoji: '📱', hot: false,
      trendReason: 'อุปกรณ์พื้นฐานทุกคนต้องใช้' },
  ],
  other: [
    { name: 'Ring Light 10"', price: 599, commission: 8, emoji: '💡', hot: true,
      trendReason: 'Creator ทุกคนต้องใช้' },
    { name: 'Wireless Microphone', price: 890, commission: 7, emoji: '🎤', hot: true,
      trendReason: 'คุณภาพเสียงสำคัญมาก' },
    { name: 'SD Card 128GB', price: 399, commission: 6, emoji: '💾', hot: false,
      trendReason: 'ต้องการทุกคน' },
  ],
}

export function getTrendingProducts(niche: string, limit = 5): TrendingProduct[] {
  const products = PRODUCTS_BY_NICHE[niche] ?? PRODUCTS_BY_NICHE.other
  return products.slice(0, limit)
}
