/**
 * Best Time to Post — Static lookup by platform + niche
 * Based on Thai social media behavior data 2024-2025
 */

interface BestTimeData {
  days: string[]       // วันที่ดีสุด
  hours: string        // ช่วงเวลา
  audience: string     // กลุ่มคนดูหลัก
  tip: string          // เคล็ดลับเพิ่มเติม
}

const PLATFORM_BASE: Record<string, { hours: string; days: string[] }> = {
  tiktok: {
    hours: '19:00–22:00',
    days: ['อังคาร', 'พฤหัส', 'ศุกร์', 'เสาร์'],
  },
  instagram: {
    hours: '11:00–13:00 และ 20:00–22:00',
    days: ['อังคาร', 'พุธ', 'ศุกร์'],
  },
  youtube: {
    hours: '15:00–20:00',
    days: ['เสาร์', 'อาทิตย์', 'พุธ'],
  },
  facebook: {
    hours: '13:00–16:00 และ 20:00–22:00',
    days: ['พุธ', 'พฤหัส', 'ศุกร์'],
  },
  multi: {
    hours: '19:00–21:00',
    days: ['อังคาร', 'พฤหัส', 'เสาร์'],
  },
}

const NICHE_AUDIENCE: Record<string, string> = {
  food:          'หญิง 25–40 ปี ชอบทำอาหารและรีวิวร้าน',
  beauty:        'หญิง 18–35 ปี สนใจสกินแคร์และเครื่องสำอาง',
  fitness:       'ชาย-หญิง 20–35 ปี ใส่ใจสุขภาพ',
  lifestyle:     'หญิง 22–38 ปี ชอบไลฟ์สไตล์และแรงบันดาลใจ',
  finance:       'ชาย-หญิง 25–45 ปี สนใจลงทุนและออมเงิน',
  business:      'ชาย-หญิง 28–45 ปี เป็นเจ้าของกิจการหรืออยากทำธุรกิจ',
  education:     'นักศึกษาและวัยทำงาน 18–35 ปี',
  travel:        'หญิง-ชาย 22–40 ปี ชอบท่องเที่ยว',
  entertainment: 'ทุกเพศทุกวัย 15–35 ปี',
  other:         'กลุ่มผสม 20–40 ปี',
}

const NICHE_TIP: Record<string, Record<string, string>> = {
  food: {
    tiktok:    'คลิปขั้นตอนทำอาหารสั้น 30-60 วิ ได้ผลดีสุดค่ะ ใส่เสียงครัวช่วยได้มาก',
    instagram: 'ภาพ plating สวยและ Reels สั้นๆ ดึงดูด save ได้ดีมากค่ะ',
    youtube:   'สูตรละเอียด step-by-step กับ vlog ไปตลาด/ร้าน ได้ watch time สูงค่ะ',
    default:   'เน้น visual อาหารน่ากินและ process ที่ดูง่ายนะคะ',
  },
  beauty: {
    tiktok:    'Before/After และ "Get Ready With Me" ได้ view สูงมากค่ะ',
    instagram: 'Carousel สูตร skincare routine ได้ save เยอะ — ช่วย reach มากค่ะ',
    youtube:   'Review ละเอียด 10-15 นาทีกับ Haul วีดีโอ ได้ subscriber ดีค่ะ',
    default:   'เน้นความ authentic — คนชอบเห็นผลจริงมากกว่าแบบ perfect ค่ะ',
  },
  fitness: {
    tiktok:    'Workout ท่า 60 วิ หรือ transformation ได้ follow สูงมากค่ะ',
    instagram: 'Quote + tip สุขภาพสั้นๆ ได้ share เยอะ ช่วยขยาย reach ค่ะ',
    youtube:   'Full workout routine 20-30 นาทีกับ meal prep ได้ retention ดีค่ะ',
    default:   'แชร์ progress จริงของตัวเองดึงดูดคนได้มากค่ะ',
  },
  default: {
    default: 'โพสต์สม่ำเสมอสำคัญกว่าความสมบูรณ์แบบนะคะ — ทำให้ครบก่อน ค่อยปรับทีหลังค่ะ',
  },
}

function getNicheTip(niche: string, platform: string): string {
  const nicheTips = NICHE_TIP[niche] ?? NICHE_TIP.default
  return nicheTips[platform] ?? nicheTips.default ?? NICHE_TIP.default.default
}

export function getBestTime(platform: string, niche: string): BestTimeData {
  const base = PLATFORM_BASE[platform] ?? PLATFORM_BASE.tiktok
  const audience = NICHE_AUDIENCE[niche] ?? NICHE_AUDIENCE.other
  const tip = getNicheTip(niche, platform)

  return {
    days: base.days,
    hours: base.hours,
    audience,
    tip,
  }
}
