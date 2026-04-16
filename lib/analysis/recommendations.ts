import type { AuditFormData, MonetizationRecommendation } from '@/types'

export function buildRecommendations(data: AuditFormData): MonetizationRecommendation[] {
  const all: MonetizationRecommendation[] = []

  const platformLabel = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
    multi: 'ทุกแพลตฟอร์ม',
  }[data.platform]

  // ── AFFILIATE ──────────────────────────────────────────────────
  if (!data.hasAffiliate) {
    all.push({
      type: 'affiliate',
      title: 'เปิด Affiliate ทันที',
      rationale: `คุณมี ${data.followers.toLocaleString('th-TH')} followers บน ${platformLabel} — คนพวกนี้เชื่อถือคุณอยู่แล้ว แค่ลิงก์ Affiliate ที่ถูก Niche ก็เปลี่ยนเป็นเงินได้เลย`,
      estimatedRevenueLow: Math.round(data.avgViews * 0.001 * 300),
      estimatedRevenueHigh: Math.round(data.avgViews * 0.003 * 800),
      timeToRevenue: '1–2 สัปดาห์',
      difficulty: 'easy',
      priority: 1,
      exampleAction: `สมัคร Lazada Affiliate หรือ Shopee Affiliate วันนี้ แล้วแปะ link ใน Bio และ caption ทุกโพสต์ที่เกี่ยวกับ ${data.niche}`,
    })
  }

  // ── OWN PRODUCT ────────────────────────────────────────────────
  if (!data.hasProduct) {
    const productIdea = {
      education: 'mini-course ออนไลน์',
      finance: 'คอร์ส/ebook วางแผนการเงิน',
      business: 'คอร์ส/workshop บริหารธุรกิจ',
      lifestyle: 'preset/template หรือ membership',
      beauty: 'คอร์สสอนแต่งหน้า หรือ ebook',
      fitness: 'โปรแกรม workout หรือ meal plan',
      food: 'cookbook ดิจิทัล หรือ recipe pack',
      travel: 'travel guide ดิจิทัล',
      entertainment: 'merchandise หรือ membership',
      other: 'digital product หรือ e-book',
    }[data.niche] ?? 'digital product'

    all.push({
      type: 'own_product',
      title: `สร้าง ${productIdea} ของตัวเอง`,
      rationale: `Audience ของคุณมาดูเรื่อง ${data.niche} อยู่แล้ว พวกเขาพร้อมจ่ายเงินถ้ามีสินค้าที่แก้ปัญหาได้จริง`,
      estimatedRevenueLow: Math.round(data.avgViews * 0.002 * 690),
      estimatedRevenueHigh: Math.round(data.avgViews * 0.005 * 1990),
      timeToRevenue: '2–4 สัปดาห์',
      difficulty: 'medium',
      priority: data.hasAffiliate ? 1 : 2,
      exampleAction: `สร้าง PDF/Notion template เกี่ยวกับ ${data.niche} ราคา 299–990 บาท ขายผ่าน Gumroad หรือ LINE OA แล้วโปรโมทใน story ทุกวัน`,
    })
  }

  // ── SPONSORSHIP ────────────────────────────────────────────────
  if (data.followers >= 5000 && !data.currentIncomeSources.includes('sponsorship')) {
    all.push({
      type: 'sponsorship',
      title: 'Pitch แบรนด์ขอ Sponsorship',
      rationale: `${data.followers.toLocaleString('th-TH')} followers ใน niche ${data.niche} มีมูลค่าต่อแบรนด์มาก — แต่แบรนด์จะไม่มาหาคุณเอง คุณต้องเป็นฝ่าย pitch`,
      estimatedRevenueLow: 3000,
      estimatedRevenueHigh: data.followers > 50000 ? 30000 : 8000,
      timeToRevenue: '2–6 สัปดาห์',
      difficulty: 'medium',
      priority: 3,
      exampleAction: `สร้าง Media Kit 1 หน้า (Canva) ระบุ: followers / avg views / engagement rate / audience demographic แล้วส่งให้แบรนด์ใน niche ของคุณ 5 แบรนด์วันนี้เลย`,
    })
  }

  // ── COACHING / CONSULTING ─────────────────────────────────────
  if (['education', 'finance', 'business', 'fitness'].includes(data.niche)) {
    all.push({
      type: 'coaching',
      title: 'เปิด 1-on-1 Coaching',
      rationale: `ใน niche ${data.niche} คนยอมจ่ายแพงกว่ามากเพื่อคุยกับ expert โดยตรง คุณมี credibility อยู่แล้ว`,
      estimatedRevenueLow: 5000,
      estimatedRevenueHigh: 30000,
      timeToRevenue: '1–2 สัปดาห์',
      difficulty: 'easy',
      priority: data.hasProduct ? 2 : 3,
      exampleAction: `โพสต์ใน story ว่า "รับ consultation 1 ชั่วโมง ราคา 1,500 บาท" แล้วดู response — ถ้ามีคนสนใจ 3+ คนภายใน 24 ชั่วโมง คุณมี service แล้ว`,
    })
  }

  // ── SUBSCRIPTION / MEMBERSHIP ─────────────────────────────────
  if (data.hasProduct && data.hasFunnel) {
    all.push({
      type: 'subscription',
      title: 'เปิด Membership / Subscription',
      rationale: `คุณมีสินค้าและ funnel อยู่แล้ว ขั้นต่อไปคือสร้าง recurring revenue ที่ไม่ต้องทำงานใหม่ทุกเดือน`,
      estimatedRevenueLow: 10000,
      estimatedRevenueHigh: 80000,
      timeToRevenue: '4–8 สัปดาห์',
      difficulty: 'hard',
      priority: 4,
      exampleAction: `เปิด Patreon หรือ LINE OA Premium ในราคา 299–499 บาท/เดือน แล้วให้ exclusive content ที่ไม่มีในที่อื่น เช่น Q&A รายเดือน, ไฟล์ template, หรือ community private`,
    })
  }

  // Return top 3 sorted by priority
  return all.sort((a, b) => a.priority - b.priority).slice(0, 3)
}
