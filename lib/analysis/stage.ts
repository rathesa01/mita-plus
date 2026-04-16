import type { AuditFormData, CreatorStage, CreatorStageId, MonetizationScore } from '@/types'

const STAGES: Record<CreatorStageId, CreatorStage> = {
  audience_only: {
    id: 'audience_only',
    label: 'มีคนดูแต่ยังไม่มีเงิน',
    emoji: '👁️',
    shockLine: 'คุณกำลังทำงานฟรีให้แพลตฟอร์มอยู่ทุกวัน',
    color: 'text-slate-400',
  },
  monetizable: {
    id: 'monetizable',
    label: 'พร้อมทำเงินแต่ยังไม่เริ่ม',
    emoji: '🔑',
    shockLine: 'ทุกวันที่รอ = เงินหายไปเรื่อยๆ โดยไม่มีวันได้คืน',
    color: 'text-yellow-400',
  },
  early_revenue: {
    id: 'early_revenue',
    label: 'เริ่มมีเงินแต่ยังรั่วอยู่มาก',
    emoji: '🪣',
    shockLine: 'รายได้คุณต่ำกว่าที่ควรได้ถึง 3–5 เท่า เพราะระบบยังขาดอยู่',
    color: 'text-orange-400',
  },
  conversion_ready: {
    id: 'conversion_ready',
    label: 'ระบบเกือบครบ แต่ยังปิดการขายไม่ได้',
    emoji: '🎯',
    shockLine: 'ลูกค้าเข้ามาดูแล้วออกไปซื้อที่อื่น ไม่ใช่เพราะไม่สนใจ',
    color: 'text-blue-400',
  },
  revenue_engine: {
    id: 'revenue_engine',
    label: 'มีรายได้แล้ว แต่ Scale ได้อีก 10 เท่า',
    emoji: '🚀',
    shockLine: 'คุณกำลังทิ้งเงินไว้บนโต๊ะทุกเดือน ขณะที่คู่แข่ง Scale อยู่',
    color: 'text-emerald-400',
  },
}

export function classifyStage(
  data: AuditFormData,
  score: MonetizationScore,
): CreatorStage {
  const s = score.total
  const income = data.monthlyIncome

  if (s > 70 && (income === '50k_100k' || income === 'over_100k')) {
    return STAGES.revenue_engine
  }
  if (s >= 55 && data.hasProduct) {
    return STAGES.conversion_ready
  }
  if (s >= 35 && (income === '5k_20k' || income === '20k_50k')) {
    return STAGES.early_revenue
  }
  if (data.followers >= 5000 && income === 'zero') {
    return STAGES.monetizable
  }
  return STAGES.audience_only
}
