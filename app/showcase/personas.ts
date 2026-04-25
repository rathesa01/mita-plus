import type { AuditFormData } from '@/types'

// ── 10 Non-subscribers — beauty niche ─────────────
// ต่างกันที่: follower tier, platform, income, posting freq, monetization stage
export const NON_SUBSCRIBERS: Array<{
  avatar: string
  label: string
  desc: string
  input: AuditFormData
}> = [
  {
    avatar: '🌸',
    label: 'น้องออย',
    desc: 'มือใหม่ TikTok เพิ่งเริ่ม',
    input: {
      name: 'น้องออย', email: 'aoy@test.com',
      platform: 'tiktok', niche: 'beauty', audienceType: 'general',
      followers: 820, avgViews: 180, postingFrequency: '1-2x_week', engagementRate: 4.2,
      currentIncomeSources: ['none'], monthlyIncome: 0,
      hasProduct: false, hasFunnel: false, hasAffiliate: false, hasClosingSystem: false,
      contentDuration: 'under_3months', triedAndFailed: ['none_tried'],
      audienceBuyingPower: 'student', subNiche: 'skincare',
      contentDescription: 'รีวิว skincare ราคาประหยัด ใช้เองจริง',
      biggestProblem: 'ไม่รู้จะหาเงินจากคอนเทนต์ยังไง ยอดวิวน้อย',
      goalIn90Days: 'อยากมีรายได้จาก affiliate สักเดือนละ 2,000 บาท',
    },
  },
  {
    avatar: '💄',
    label: 'พี่นุ่น',
    desc: 'Instagram micro-creator',
    input: {
      name: 'พี่นุ่น', email: 'nun@test.com',
      platform: 'instagram', niche: 'beauty', audienceType: 'niche',
      followers: 4800, avgViews: 1200, postingFrequency: '3-5x_week', engagementRate: 5.8,
      currentIncomeSources: ['affiliate'], monthlyIncome: 2500,
      hasProduct: false, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: '3-12months', triedAndFailed: ['none_tried'],
      audienceBuyingPower: 'worker', subNiche: 'makeup',
      contentDescription: 'สอนแต่งหน้าสำหรับคนทำงาน ลุคออฟฟิศสวย',
      biggestProblem: 'ทำ affiliate อยู่แต่ได้น้อยมาก ไม่รู้จะเพิ่มยังไง',
      goalIn90Days: 'อยากได้รายได้จาก affiliate เดือนละ 8,000 บาท',
    },
  },
  {
    avatar: '✨',
    label: 'มายด์',
    desc: 'TikTok viral แต่ไม่ได้เงิน',
    input: {
      name: 'มายด์', email: 'mind@test.com',
      platform: 'tiktok', niche: 'beauty', audienceType: 'general',
      followers: 15200, avgViews: 8500, postingFrequency: 'daily', engagementRate: 6.1,
      currentIncomeSources: ['none'], monthlyIncome: 0,
      hasProduct: false, hasFunnel: false, hasAffiliate: false, hasClosingSystem: false,
      contentDuration: '3-12months', triedAndFailed: ['affiliate'],
      audienceBuyingPower: 'student', subNiche: 'skincare routine',
      contentDescription: 'คลิป skincare routine เช้า-เย็น เน้น glass skin',
      biggestProblem: 'วิวเยอะมากแต่ไม่มีรายได้เลย ไม่รู้ทำยังไง',
      goalIn90Days: 'อยากเปลี่ยน views ให้เป็นเงินได้จริงๆ สัก 10,000 บาท/เดือน',
    },
  },
  {
    avatar: '🪄',
    label: 'แพรว',
    desc: 'Instagram กำลังโต มีรายได้บ้างแล้ว',
    input: {
      name: 'แพรว', email: 'praew@test.com',
      platform: 'instagram', niche: 'beauty', audienceType: 'niche',
      followers: 32000, avgViews: 5500, postingFrequency: '3-5x_week', engagementRate: 4.5,
      currentIncomeSources: ['affiliate', 'sponsorship'], monthlyIncome: 12000,
      hasProduct: false, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: '1-2years', triedAndFailed: ['own_product'],
      audienceBuyingPower: 'worker', subNiche: 'luxury skincare',
      contentDescription: 'รีวิว luxury skincare คนไทย budget 500+ ต่อชิ้น',
      biggestProblem: 'รายได้ไม่แน่นอน บางเดือนดีมาก บางเดือนแทบไม่มี',
      goalIn90Days: 'อยากสร้างรายได้ passive ให้มั่นคงกว่านี้',
    },
  },
  {
    avatar: '🎬',
    label: 'น้องพลอย',
    desc: 'YouTube beauty สอนละเอียด',
    input: {
      name: 'น้องพลอย', email: 'ploy@test.com',
      platform: 'youtube', niche: 'beauty', audienceType: 'niche',
      followers: 18500, avgViews: 12000, postingFrequency: '1-2x_week', engagementRate: 7.2,
      currentIncomeSources: ['ads_revenue', 'affiliate'], monthlyIncome: 12000,
      hasProduct: false, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: '1-2years', triedAndFailed: ['own_product', 'coaching'],
      audienceBuyingPower: 'homemaker', subNiche: 'anti-aging skincare',
      contentDescription: 'สอนดูแลผิวสำหรับคุณแม่อายุ 35+ เน้น anti-aging',
      biggestProblem: 'ยอด subscriber โตช้า และ AdSense ได้น้อย',
      goalIn90Days: 'อยากได้รายได้รวม 20,000 บาท/เดือน จาก YouTube',
    },
  },
  {
    avatar: '💅',
    label: 'แก้ว',
    desc: 'TikTok 50K แต่ไม่เคย monetize',
    input: {
      name: 'แก้ว', email: 'kaew@test.com',
      platform: 'tiktok', niche: 'beauty', audienceType: 'general',
      followers: 52000, avgViews: 22000, postingFrequency: 'daily', engagementRate: 5.3,
      currentIncomeSources: ['none'], monthlyIncome: 0,
      hasProduct: false, hasFunnel: false, hasAffiliate: false, hasClosingSystem: false,
      contentDuration: '1-2years', triedAndFailed: ['none_tried'],
      audienceBuyingPower: 'mixed', subNiche: 'nail art',
      contentDescription: 'สอนทำเล็บเองที่บ้าน ลวดลายต่างๆ ทำได้ไม่ยาก',
      biggestProblem: 'ทำคอนเทนต์มา 2 ปีไม่เคยได้เงินเลย ไม่รู้จะเริ่มยังไง',
      goalIn90Days: 'อยากได้เงินจริงๆ ซักที เป้าแรก 15,000 บาท/เดือน',
    },
  },
  {
    avatar: '👑',
    label: 'พี่แพท',
    desc: 'Instagram pro มีสปอนเซอร์แล้ว',
    input: {
      name: 'พี่แพท', email: 'pat@test.com',
      platform: 'instagram', niche: 'beauty', audienceType: 'niche',
      followers: 88000, avgViews: 15000, postingFrequency: '3-5x_week', engagementRate: 3.8,
      currentIncomeSources: ['sponsorship', 'affiliate'], monthlyIncome: 35000,
      hasProduct: false, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: 'over_2years', triedAndFailed: ['own_product'],
      audienceBuyingPower: 'worker', subNiche: 'K-beauty',
      contentDescription: 'รีวิวและสอนแต่งหน้า K-beauty style เน้น glow look',
      biggestProblem: 'รายได้ค้างอยู่ที่ 35K มาสองปีแล้ว ไม่รู้จะ scale ยังไง',
      goalIn90Days: 'อยากเพิ่มรายได้เป็น 60,000 บาท/เดือน',
    },
  },
  {
    avatar: '🌟',
    label: 'นิ้ง',
    desc: 'Multi-platform มีสินค้าตัวเอง',
    input: {
      name: 'นิ้ง', email: 'ning@test.com',
      platform: 'multi', niche: 'beauty', audienceType: 'niche',
      followers: 135000, avgViews: 25000, postingFrequency: '3-5x_week', engagementRate: 4.1,
      currentIncomeSources: ['own_product', 'sponsorship', 'affiliate'], monthlyIncome: 75000,
      hasProduct: true, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: 'over_2years', triedAndFailed: ['coaching'],
      audienceBuyingPower: 'worker', subNiche: 'organic skincare',
      contentDescription: 'สอน skincare ธรรมชาติ + ขายครีมแบรนด์ตัวเอง',
      biggestProblem: 'ขายสินค้าตัวเองอยู่แต่ conversion rate ต่ำมาก Funnel ยังไม่มี',
      goalIn90Days: 'อยากสร้าง sales funnel ให้สินค้าตัวเอง เพิ่มยอดขาย 3x',
    },
  },
  {
    avatar: '🦋',
    label: 'ปุ้ย',
    desc: 'TikTok 200K ทำเงินได้ดีแต่ไม่ stable',
    input: {
      name: 'ปุ้ย', email: 'pui@test.com',
      platform: 'tiktok', niche: 'beauty', audienceType: 'general',
      followers: 215000, avgViews: 45000, postingFrequency: '3-5x_week', engagementRate: 5.7,
      currentIncomeSources: ['sponsorship', 'affiliate'], monthlyIncome: 75000,
      hasProduct: false, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: 'over_2years', triedAndFailed: ['own_product'],
      audienceBuyingPower: 'mixed', subNiche: 'drugstore beauty',
      contentDescription: 'รีวิว beauty สินค้าราคาถูก เน้น value for money',
      biggestProblem: 'รายได้ขึ้นลงแรงมาก ขึ้นกับสปอนเซอร์ เดือนไหนไม่มีดีล แทบไม่มีรายได้',
      goalIn90Days: 'อยากสร้าง passive income ที่ไม่ขึ้นกับสปอนเซอร์',
    },
  },
  {
    avatar: '🔮',
    label: 'เฟิร์น',
    desc: 'YouTube ดัง แต่เงินยังไม่ถึงศักยภาพ',
    input: {
      name: 'เฟิร์น', email: 'fern@test.com',
      platform: 'youtube', niche: 'beauty', audienceType: 'niche',
      followers: 485000, avgViews: 90000, postingFrequency: '1-2x_week', engagementRate: 6.8,
      currentIncomeSources: ['ads_revenue', 'sponsorship', 'affiliate'], monthlyIncome: 150000,
      hasProduct: false, hasFunnel: false, hasAffiliate: true, hasClosingSystem: false,
      contentDuration: 'over_2years', triedAndFailed: ['own_product', 'coaching'],
      audienceBuyingPower: 'worker', subNiche: 'premium skincare review',
      contentDescription: 'รีวิว skincare premium ละเอียดยิบ วิเคราะห์ส่วนผสมทุกตัว',
      biggestProblem: 'มีคนดูเยอะมากแต่ไม่ได้ใช้ leverage นี้ทำเงินให้ถึงศักยภาพ',
      goalIn90Days: 'อยาก launch คอร์สออนไลน์หรือ own product ให้ได้ภายใน 30 วัน',
    },
  },
]

// ── 10 Subscribers — check-in scenarios ───────────
export const SUBSCRIBERS: Array<{
  avatar: string
  label: string
  desc: string
  weekNo: number
  mood: 'great' | 'ok' | 'hard'
  clips: number
  income: number
  obstacle: string
  platform: string
  targetIncome: number
}> = [
  {
    avatar: '🌱', label: 'น้องออย', desc: 'อาทิตย์แรก ยังไม่มีรายได้',
    weekNo: 1, mood: 'hard', clips: 0, income: 0,
    obstacle: 'ไม่รู้จะเริ่มยังไงเลย กลัวหน้ากล้อง',
    platform: 'tiktok', targetIncome: 2000,
  },
  {
    avatar: '☕', label: 'มายด์', desc: 'อาทิตย์แรก ทำคลิปแรกได้แล้ว',
    weekNo: 1, mood: 'ok', clips: 2, income: 0,
    obstacle: 'แสงไม่ดี วิดีโอยังดูไม่โปร',
    platform: 'tiktok', targetIncome: 5000,
  },
  {
    avatar: '✨', label: 'พี่นุ่น', desc: 'อาทิตย์ 2 เริ่มเห็นรายได้',
    weekNo: 2, mood: 'great', clips: 3, income: 180,
    obstacle: '',
    platform: 'instagram', targetIncome: 8000,
  },
  {
    avatar: '😅', label: 'แก้ว', desc: 'อาทิตย์ 2 ยุ่งมากจนทำไม่ได้',
    weekNo: 2, mood: 'hard', clips: 1, income: 0,
    obstacle: 'งานประจำยุ่งมาก ไม่มีเวลาทำคลิปเลย',
    platform: 'tiktok', targetIncome: 5000,
  },
  {
    avatar: '🚀', label: 'แพรว', desc: 'อาทิตย์ 3 กำลังโตดี',
    weekNo: 3, mood: 'great', clips: 4, income: 620,
    obstacle: '',
    platform: 'instagram', targetIncome: 15000,
  },
  {
    avatar: '📉', label: 'น้องพลอย', desc: 'อาทิตย์ 3 วิวตก',
    weekNo: 3, mood: 'ok', clips: 2, income: 240,
    obstacle: 'ยอดวิวตกฮวบเลย ไม่รู้ algorithm เปลี่ยนหรือเปล่า',
    platform: 'youtube', targetIncome: 10000,
  },
  {
    avatar: '💰', label: 'พี่แพท', desc: 'อาทิตย์ 4 รายได้ดีมาก',
    weekNo: 4, clips: 5, income: 2800, mood: 'great',
    obstacle: '',
    platform: 'instagram', targetIncome: 20000,
  },
  {
    avatar: '🤔', label: 'นิ้ง', desc: 'อาทิตย์ 4 ไม่มีไอเดีย',
    weekNo: 4, mood: 'hard', clips: 2, income: 450,
    obstacle: 'ทำ skincare content มานานจนไม่รู้จะทำคลิปอะไรแล้ว เริ่มซ้ำซาก',
    platform: 'multi', targetIncome: 30000,
  },
  {
    avatar: '📈', label: 'ปุ้ย', desc: 'เดือน 2 อาทิตย์ 1 กำลัง scale',
    weekNo: 5, mood: 'ok', clips: 3, income: 3200,
    obstacle: 'มีคู่แข่งทำ content แบบเดียวกันเยอะขึ้นมาก',
    platform: 'tiktok', targetIncome: 50000,
  },
  {
    avatar: '👑', label: 'เฟิร์น', desc: 'เดือน 2 อาทิตย์ 3 ทำได้เกินเป้า',
    weekNo: 7, mood: 'great', clips: 5, income: 8500,
    obstacle: '',
    platform: 'youtube', targetIncome: 40000,
  },
]
