import type { AuditFormData, MonetizationRecommendation } from '@/types'

// Sub-niche → specific product idea + example action
const SUBNICHE_PRODUCT: Record<string, { idea: string; action: string }> = {
  // food
  eating_mukbang:     { idea: 'รีวิวอุปกรณ์กิน + Affiliate ร้านอาหาร', action: 'สมัคร Wongnai หรือ LINE MAN affiliate แล้วรีวิวร้านที่ไปกินจริง ใส่ link ใน bio' },
  restaurant_review:  { idea: 'Affiliate แพ็กเกจร้านอาหาร + sponsored review', action: 'เข้าหาร้านที่รีวิวบ่อยๆ ขอทำ sponsored post ราคา 2,000–5,000 บาท/โพสต์' },
  cooking_tutorial:   { idea: 'Recipe Pack PDF หรือ สอน workshop ออนไลน์', action: 'รวม 10 สูตรยอดนิยมเป็น PDF ราคา 199 บาท ขายผ่าน LINE Pay ทดสอบวันนี้' },
  street_food_guide:  { idea: 'Street Food Map ดิจิทัล + Affiliate Grab/Foodpanda', action: 'ทำ Notion map ร้านอร่อยพร้อม link delivery ราคา 99 บาท โปรโมทใน story' },
  food_science:       { idea: 'คอร์สออนไลน์ Food Science สำหรับคนสนใจ', action: 'เปิด Zoom session "ทำไมอาหารถึงอร่อย" ราคา 490 บาท รับ 10 คน ทดสอบใน 7 วัน' },
  healthy_food:       { idea: 'Meal Plan PDF + Affiliate อาหารเสริม', action: 'สมัคร Amway หรือ Giffarine affiliate แล้วทำ "7-day meal plan" ขาย 299 บาท' },
  // lifestyle
  daily_vlog:         { idea: 'Affiliate สินค้า lifestyle + Sponsored story', action: 'เลือก 5 สินค้าที่ใช้ทุกวัน สมัคร Shopee affiliate แล้วใส่ใน bio ทุก platform' },
  travel_lifestyle:   { idea: 'Travel checklist PDF + Affiliate Agoda', action: 'ทำ "Packing list" PDF ราคา 99 บาท พร้อมลิงก์สินค้าที่ใช้จริง ขายผ่าน LINE' },
  home_decor:         { idea: 'Interior moodboard service + Affiliate IKEA/HomePro', action: 'สมัคร HomePro affiliate แล้วทำ "ห้องสวยงบ 5,000 บาท" พร้อมลิงก์สินค้าทุกชิ้น' },
  minimalism:         { idea: 'Declutter guide + Affiliate กล่องจัดเก็บ', action: 'ทำ "30-day declutter challenge" แจกฟรี แล้วขาย premium version 199 บาท' },
  productivity:       { idea: 'Notion template pack + คอร์ส productivity', action: 'ทำ Notion template 1 ชุด ราคา 149 บาท ขายผ่าน Gumroad ทดสอบกับ story วันนี้' },
  // education
  academic_tutor:     { idea: 'คอร์สติวออนไลน์ + ชีทสรุป PDF', action: 'ทำชีทสรุป 1 วิชา ราคา 99 บาท ขายใน LINE group ของกลุ่มเป้าหมาย' },
  skill_tutorial:     { idea: 'คอร์สสอน skill ออนไลน์ + 1-on-1 mentoring', action: 'เปิด pre-sale คอร์ส 10 slot ราคา 499 บาท โพสต์ story วันนี้ ถ้าเต็มใน 48h = validate แล้ว' },
  language_learning:  { idea: 'Flashcard PDF + Grammar guide ราคา 199 บาท', action: 'ทำ "100 คำที่ใช้บ่อยที่สุด" PDF ขาย 99 บาท ทดสอบกับ audience ก่อนทำคอร์สเต็ม' },
  exam_prep:          { idea: 'Mock exam + เฉลยอธิบาย PDF subscription', action: 'ทำข้อสอบ 20 ข้อพร้อมเฉลย ราคา 149 บาท ขายผ่าน LINE ก่อน deploy ระบบเต็ม' },
  // fitness
  workout_routine:    { idea: 'โปรแกรม workout 30 วัน + Affiliate อุปกรณ์', action: 'ทำ "30-day challenge PDF" ราคา 299 บาท พร้อม link อุปกรณ์ที่ใช้จริงใน Lazada' },
  diet_nutrition:     { idea: 'Meal prep guide + Affiliate อาหารเสริม commission สูง', action: 'สมัคร Herbalife หรือ Amway affiliate แล้วทำ review ซื่อสัตย์ บอก pros/cons จริงๆ' },
  yoga_meditation:    { idea: 'คอร์ส yoga online + Affiliate เสื่อ/อุปกรณ์', action: 'เปิด "Beginner yoga 7 วัน" ผ่าน Zoom ราคา 490 บาท รับ 5 คน ทดสอบใน 1 สัปดาห์' },
  // beauty
  makeup_tutorial:    { idea: 'Affiliate เครื่องสำอาง Shopee + sponsored review', action: 'สมัคร Shopee affiliate เลือก 10 สินค้าที่ใช้จริง ใส่ link ใน bio ทุก platform วันนี้' },
  skincare_routine:   { idea: 'Skincare routine PDF + Affiliate iHerb/Shopee', action: 'ทำ "Routine สำหรับผิว [ประเภท]" PDF ราคา 149 บาท ขายผ่าน LINE พร้อม affiliate link' },
  hair_tutorial:      { idea: 'Hair care guide + Affiliate ผลิตภัณฑ์ดูแลผม', action: 'สมัคร Lazada affiliate แนะนำ 5 สินค้าดูแลผมที่ใช้จริง ทำ honest review + link' },
  // finance
  investing_basics:   { idea: 'คอร์สลงทุนเบื้องต้น + Affiliate โบรกเกอร์', action: 'สมัคร Bitkub หรือ Jitta affiliate commission ฿200-500/คน แล้วทำ honest comparison review' },
  saving_tips:        { idea: 'Budget template + คอร์สออมเงิน', action: 'ทำ Google Sheet budget template ราคา 149 บาท ขายผ่าน Gumroad ทดสอบในสัปดาห์นี้' },
  // business
  marketing_tips:     { idea: 'คอร์ส marketing สำหรับ SME + consulting', action: 'เปิด consultation 1 ชั่วโมง ราคา 1,500 บาท โพสต์ใน story ดูว่ามีคนสนใจไหม' },
  entrepreneur_story: { idea: 'Mastermind group + ขาย case study ดิจิทัล', action: 'เปิด LINE group "Founder Club" ราคา 499 บาท/เดือน exclusive สำหรับเจ้าของธุรกิจ' },
  // travel
  destination_guide:  { idea: 'Travel guide PDF + Affiliate Agoda/Booking.com', action: 'ทำ "คู่มือเที่ยว [จังหวัด]" PDF ราคา 149 บาท พร้อม affiliate link โรงแรม/ตั๋ว' },
  budget_travel:      { idea: 'Budget trip planner + Affiliate Hostelworld', action: 'ทำ "เที่ยว 3 วัน งบ 3,000 บาท" PDF พร้อมทุก link ราคา 99 บาท ขายผ่าน LINE' },
  // entertainment
  gaming:             { idea: 'Gaming setup affiliate + tournament hosting', action: 'สมัคร affiliate gear gaming ที่ใช้จริง ทำ "setup ราคา 5,000 บาท" video พร้อม link ทุกชิ้น' },
  comedy_meme:        { idea: 'Merchandise (สติ๊กเกอร์ LINE, เสื้อ) + Fanclub', action: 'เปิด LINE sticker pack ราคา 35 บาท ใช้ตัวละคร/มุกที่คนจำได้ ทำวันนี้ได้เลย' },
  // other
  review_general:     { idea: 'Affiliate สินค้าที่รีวิว + Sponsored review', action: 'เลือก 1 หมวดสินค้าที่รีวิวบ่อย สมัคร affiliate แล้วใส่ link ทุก video/โพสต์' },
  interview_podcast:  { idea: 'Sponsorship + Premium podcast subscription', action: 'ทำ sponsor package สำหรับ podcast ราคา 5,000-15,000/episode ส่ง pitch ให้แบรนด์ 3 เจ้าวันนี้' },
}

// Buying power → price point multiplier & framing
const BUYING_POWER_PRICE: Record<string, { low: number; high: number; label: string }> = {
  student:        { low: 0.3,  high: 0.4,  label: 'ราคา 99-299 บาท (ตรงกับกำลังซื้อ นักเรียน/นักศึกษา)' },
  worker:         { low: 0.7,  high: 1.0,  label: 'ราคา 299-1,990 บาท (คนทำงานพร้อมจ่าย ถ้าเห็น value ชัด)' },
  homemaker:      { low: 0.5,  high: 0.7,  label: 'ราคา 199-990 บาท (trust-based ต้องสร้างความเชื่อใจก่อน)' },
  business_owner: { low: 1.5,  high: 3.0,  label: 'ราคา 1,500-15,000 บาท (มอง ROI เป็นหลัก ราคาสูงได้ถ้า outcome ชัด)' },
  mixed:          { low: 0.6,  high: 0.8,  label: 'ราคา 199-990 บาท (เลือก segment ใหญ่สุดก่อน)' },
}

export function buildRecommendations(data: AuditFormData): MonetizationRecommendation[] {
  const d = data as AuditFormData & { triedAndFailed?: string[]; audienceBuyingPower?: string; subNiche?: string }
  const tried = new Set(d.triedAndFailed ?? [])
  const buyingPower = d.audienceBuyingPower ?? 'mixed'
  const subNiche = d.subNiche ?? ''

  const platformLabel = {
    tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube',
    facebook: 'Facebook', multi: 'ทุกแพลตฟอร์ม',
  }[data.platform] ?? data.platform

  const priceScale = BUYING_POWER_PRICE[buyingPower] ?? BUYING_POWER_PRICE.mixed
  const subNicheHint = SUBNICHE_PRODUCT[subNiche]

  const all: MonetizationRecommendation[] = []

  // ── AFFILIATE ──────────────────────────────────────────────────
  // ถ้าลองแล้วไม่ได้ผล → เสนอ approach ใหม่ ไม่ใช่วิธีเดิม
  if (!data.hasAffiliate) {
    const triedAffiliate = tried.has('affiliate')
    all.push({
      type: 'affiliate',
      title: triedAffiliate
        ? 'Affiliate ใหม่: เปลี่ยน approach ไม่ใช่เลิกทำ'
        : (subNicheHint ? `${subNicheHint.idea}` : 'เปิด Affiliate ทันที'),
      rationale: triedAffiliate
        ? `ที่ผ่านมา affiliate ไม่ได้ผล เพราะส่วนใหญ่เลือกสินค้าผิด niche หรือไม่ match กับ ${buyingPower === 'student' ? 'budget ของ audience' : 'พฤติกรรมซื้อของ audience'} — ${priceScale.label}`
        : `${data.followers.toLocaleString('th-TH')} followers บน ${platformLabel} ที่ดู content ${subNiche || data.niche} อยู่แล้ว พร้อมคลิก link ถ้าสินค้า match`,
      estimatedRevenueLow: Math.round(data.avgViews * 0.001 * 300 * priceScale.low),
      estimatedRevenueHigh: Math.round(data.avgViews * 0.003 * 800 * priceScale.high),
      timeToRevenue: '1–2 สัปดาห์',
      difficulty: 'easy',
      priority: triedAffiliate ? 3 : 1,
      exampleAction: subNicheHint
        ? subNicheHint.action
        : `สมัคร Lazada Affiliate วันนี้ แล้วเลือก 3 สินค้าที่ตรงกับ ${data.niche} + ${priceScale.label} → แปะใน Bio + pinned comment ทุกโพสต์`,
    })
  }

  // ── OWN PRODUCT ────────────────────────────────────────────────
  if (!data.hasProduct) {
    const triedProduct = tried.has('own_product')
    const productIdeas: Record<string, string> = {
      education: 'ชีทสรุป / mini-course', finance: 'คอร์ส/template การเงิน',
      business: 'คอร์ส/workshop', lifestyle: 'preset/template/guide',
      beauty: 'สูตร/routine guide', fitness: 'โปรแกรม workout/meal plan',
      food: subNiche.includes('cooking') ? 'Recipe Pack / Workshop' : 'Food guide / Mukbang pack',
      travel: 'Travel guide ดิจิทัล', entertainment: 'Membership/Merch',
      other: 'Digital product / E-book',
    }
    const idea = subNicheHint?.idea ?? productIdeas[data.niche] ?? 'digital product'

    all.push({
      type: 'own_product',
      title: triedProduct
        ? `ลองอีกครั้ง: ${idea} แต่ปรับ format ใหม่`
        : `สร้าง ${idea}`,
      rationale: triedProduct
        ? `ครั้งที่แล้วไม่ได้ผลเพราะ format หรือราคาไม่ match กับ audience ของคุณ — ${priceScale.label} ลอง format ใหม่ที่ลงทุนน้อยกว่าก่อน`
        : `Audience ${buyingPower} ที่ดู content ${subNiche || data.niche} ของคุณ พร้อมจ่าย ${priceScale.label} ถ้าแก้ปัญหาได้จริง`,
      estimatedRevenueLow: Math.round(data.avgViews * 0.002 * 690 * priceScale.low),
      estimatedRevenueHigh: Math.round(data.avgViews * 0.005 * 1990 * priceScale.high),
      timeToRevenue: '2–4 สัปดาห์',
      difficulty: triedProduct ? 'easy' : 'medium',
      priority: data.hasAffiliate ? 1 : 2,
      exampleAction: subNicheHint
        ? subNicheHint.action
        : `สร้าง PDF/Notion template เรื่อง ${subNiche || data.niche} ${priceScale.label} ขายผ่าน LINE OA วันนี้ — ไม่ต้องรอระบบสมบูรณ์`,
    })
  }

  // ── SPONSORSHIP ────────────────────────────────────────────────
  if (data.followers >= 3000 && !data.currentIncomeSources.includes('sponsorship')) {
    const triedSponsorship = tried.has('sponsorship')
    all.push({
      type: 'sponsorship',
      title: triedSponsorship ? 'Sponsorship: เปลี่ยนวิธี pitch' : `Pitch แบรนด์ขอ Sponsorship`,
      rationale: triedSponsorship
        ? `ที่ pitch ไปแล้วไม่ได้รับ เพราะส่วนใหญ่ pitch ผิดแบรนด์หรือ media kit ไม่ชัด — ${data.followers.toLocaleString('th-TH')} followers ใน ${subNiche || data.niche} มีมูลค่าต่อแบรนด์ที่ถูกตัว`
        : `${data.followers.toLocaleString('th-TH')} followers บน ${platformLabel} ใน niche ${subNiche || data.niche} — แบรนด์จ่ายเงินสำหรับ access กับ audience แบบนี้`,
      estimatedRevenueLow: buyingPower === 'business_owner' ? 8000 : 3000,
      estimatedRevenueHigh: data.followers > 50000 ? 50000 : buyingPower === 'business_owner' ? 20000 : 10000,
      timeToRevenue: triedSponsorship ? '1–3 สัปดาห์' : '2–6 สัปดาห์',
      difficulty: 'medium',
      priority: 3,
      exampleAction: triedSponsorship
        ? `อัปเดต media kit ให้มี: audience demographic, engagement rate จริง, ราคาต่อโพสต์ชัดเจน แล้ว pitch แบรนด์ที่ match กับ ${subNiche || data.niche} โดยเฉพาะ 3 เจ้า`
        : `สร้าง media kit 1 หน้า (Canva) แล้ว DM แบรนด์ใน ${subNiche || data.niche} niche 5 เจ้าวันนี้`,
    })
  }

  // ── COACHING ──────────────────────────────────────────────────
  if (['education', 'finance', 'business', 'fitness'].includes(data.niche)) {
    const triedCoaching = tried.has('coaching')
    const sessionPrice = buyingPower === 'business_owner' ? '3,000–8,000' : buyingPower === 'student' ? '500–1,000' : '1,000–2,500'
    all.push({
      type: 'coaching',
      title: triedCoaching ? `Coaching: เปลี่ยน format เป็น Group แทน 1-on-1` : '1-on-1 Coaching',
      rationale: triedCoaching
        ? `1-on-1 coaching อาจ burnout เร็ว ลอง group session 5–10 คน ราคา ${sessionPrice} บาท/คน = รายได้เท่ากันแต่ใช้เวลาน้อยกว่า`
        : `Audience ${buyingPower} ใน niche ${data.niche} ยอมจ่าย ${sessionPrice} บาท/ชั่วโมง เพื่อคุยกับ expert โดยตรง`,
      estimatedRevenueLow: 5000,
      estimatedRevenueHigh: buyingPower === 'business_owner' ? 60000 : 20000,
      timeToRevenue: '1–2 สัปดาห์',
      difficulty: 'easy',
      priority: data.hasProduct ? 2 : 3,
      exampleAction: triedCoaching
        ? `เปลี่ยนเป็น group session 5 คน ราคา ${sessionPrice} บาท/คน ผ่าน Zoom — ทำ story "รับ 5 คน" วันนี้`
        : `โพสต์ story "รับ consultation ฟรี 3 คน" แล้วดูว่าคนถามอะไร → ทำ paid package จาก pain point จริงๆ`,
    })
  }

  // ── SUBSCRIPTION ──────────────────────────────────────────────
  if (data.hasProduct && data.hasFunnel) {
    const subPrice = buyingPower === 'student' ? '99–199' : buyingPower === 'business_owner' ? '990–2,990' : '299–499'
    all.push({
      type: 'subscription',
      title: 'เปิด Membership รายเดือน',
      rationale: `มีสินค้าและ funnel แล้ว ขั้นต่อไปคือ recurring revenue — ${priceScale.label} สำหรับ ${buyingPower} audience`,
      estimatedRevenueLow: 10000,
      estimatedRevenueHigh: 80000,
      timeToRevenue: '4–8 สัปดาห์',
      difficulty: 'hard',
      priority: 4,
      exampleAction: `เปิด LINE OA Premium ${subPrice} บาท/เดือน ให้ exclusive content ที่ไม่มีในที่อื่น ทดสอบกับ superfan 10 คนแรกก่อน`,
    })
  }

  // ── Sort: tried methods go last, untried + easy first ──────
  return all
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
}
