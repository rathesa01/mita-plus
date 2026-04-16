import type { AuditFormData, AIInsights, RevenueLeak, RevenueEstimation } from '@/types'

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

// วิธีทำเงินเร็วสุด ราย niche — ภาษาชาวบ้าน ไม่มีศัพท์ธุรกิจ
const NICHE_FIRST_MOVE: Record<string, string> = {
  finance:       'เปิดกลุ่ม LINE OA แบบเสียเงิน 499 บาท/เดือน สอนเรื่องการเงินที่คุณรู้อยู่แล้ว — แค่ 50 คนก็ได้ 25,000 บาท/เดือนโดยไม่ต้องทำคลิปเพิ่ม ทำวันนี้ได้เลย: สร้างกลุ่ม LINE → โพสต์ใน story → รับ 10 คนแรก',
  business:      'ส่งข้อเสนอหาแบรนด์ที่ขายของ niche เดียวกัน 3 เจ้า ขอรีวิวโพสต์ละ 5,000–15,000 บาท — ใช้เวลาแค่ส่งข้อความ 20 นาที ทำวันนี้ได้เลย: หา 3 แบรนด์ใน Instagram → ส่ง DM ขอ collab',
  education:     'สร้าง PDF สอน 10 เรื่องที่คนถามบ่อย ราคา 299 บาท ขายผ่าน LINE — ทำครั้งเดียวขายได้ไม่จำกัด ทำวันนี้ได้เลย: เขียน PDF ใน Google Docs → ลง story "มี PDF สรุปแล้ว"',
  lifestyle:     'สมัครระบบแนะนำสินค้าของ Lazada หรือ Shopee วันนี้ แล้วใส่ลิงก์สินค้าที่คุณใช้จริงใน bio — ทุกคนที่คลิกแล้วซื้อ คุณได้ค่าคอม ทำวันนี้ได้เลย: เข้า affiliate.lazada.com → สมัคร → copy link สินค้า 3 อัน',
  beauty:        'ใส่ลิงก์แนะนำสินค้าที่ใช้จริง 5 อัน ไว้ใน bio — ทุกคนที่คลิกแล้วซื้อคุณได้ค่าคอม 5–15% ฟรีไม่เสียเงิน ทำวันนี้ได้เลย: สมัคร Shopee Affiliate → copy link ครีม/เซรัม ที่ใช้จริง → วาง bio',
  fitness:       'โพสต์ใน story ว่ารับสอนออนไลน์ 5 คนแรก 3,000 บาท/เดือน — 5 คนก็ได้ 15,000 บาท/เดือนทำซ้ำได้ ทำวันนี้ได้เลย: โพสต์ใน story "รับลูกศิษย์ 5 คน" → รับ DM → นัดคุย',
  food:          'รวม 10 สูตรที่คนขอบ่อยเป็น PDF ราคา 199 บาท ขายผ่าน LINE Pay — ต้นทุน 0 บาท กำไร 100% ทำวันนี้ได้เลย: พิมพ์สูตรลง Google Docs → ทำ PDF → โพสต์ story "PDF สูตรลับ"',
  travel:        'เปิดรับปรึกษาเรื่องทริป 1 ชั่วโมง 990 บาท ผ่านวิดีโอคอล — แค่ 10 คน/เดือน = 9,900 บาทพิเศษ ทำวันนี้ได้เลย: โพสต์ใน story "รับปรึกษาทริป" → รับ booking ผ่าน DM',
  entertainment: 'เปิด Fanclub ใน LINE 99–199 บาท/เดือน ให้สิทธิพิเศษเช่นดูก่อน หรือคุยส่วนตัว — 100 คนจาก fanbase ที่มีอยู่ = 10,000–20,000 บาท/เดือน ทำวันนี้ได้เลย: สร้างกลุ่ม LINE → กำหนดสิทธิพิเศษ → โพสต์ story ชวน',
  other:         'สมัครระบบแนะนำสินค้าที่ตรงกับสิ่งที่คุณพูดถึงในคลิป แล้วใส่ลิงก์ใน bio และคำอธิบายทุกโพสต์ — ไม่มีต้นทุน เริ่มได้ใน 30 นาที ทำวันนี้ได้เลย: หาโปรแกรม affiliate ที่ตรง niche → copy link → ใส่ bio',
}

// ภาพอนาคต ราย niche — เข้าใจง่าย ไม่มีศัพท์ธุรกิจ
const NICHE_FUTURE: Record<string, string> = {
  finance:       'Creator สายการเงินที่มีระบบที่ดีทำได้ 80,000–200,000 บาท/เดือน จากกลุ่ม LINE + คอร์ส — คนใน niche นี้ยินดีจ่ายถ้าเชื่อว่าช่วยได้จริง',
  business:      'Creator สายธุรกิจที่ขายให้กับเจ้าของร้านและ SME ทำได้ 100,000–300,000 บาท/เดือน — เพราะดีลกับธุรกิจใหญ่กว่าดีลกับคนทั่วไป 10 เท่า',
  education:     'Creator สายสอนที่มีคอร์สและกลุ่มสมาชิก ทำได้ 50,000–150,000 บาท/เดือน — ขายครั้งเดียวแต่ได้เงินซ้ำเรื่อยๆ',
  lifestyle:     'Creator ไลฟ์สไตล์ที่เชื่อมลิงก์สินค้าและมีดีลกับแบรนด์ ทำได้ 40,000–120,000 บาท/เดือน จาก follower เดิมที่มีอยู่',
  beauty:        'Creator ความงามที่มีลิงก์สินค้าและสอน masterclass ทำได้ 50,000–180,000 บาท/เดือน — คน niche นี้ซื้อตามที่เห็นในคลิปสูงที่สุด',
  fitness:       'Creator ฟิตเนสที่สอนออนไลน์และขายโปรแกรม ทำได้ 60,000–200,000 บาท/เดือน — รายได้คาดเดาได้และโตขึ้นเรื่อยๆ',
  food:          'Creator อาหารที่ขาย PDF สูตรและสอน workshop ทำได้ 30,000–100,000 บาท/เดือน — ต้นทุนต่ำ กำไรสูงมาก',
  travel:        'Creator ท่องเที่ยวที่รับปรึกษาและขายคู่มือทริป ทำได้ 40,000–120,000 บาท/เดือน — คนยอมจ่ายเพื่อไม่ต้องเสียเวลาวางแผนเอง',
  entertainment: 'Creator ความบันเทิงที่มี fanclub และขายของที่ระลึก ทำได้ 30,000–150,000 บาท/เดือน — fan ที่ชอบจริงพร้อมจ่ายเพื่อใกล้ชิดคุณ',
  other:         'Creator ที่วางระบบลิงก์สินค้าและสร้าง product ของตัวเอง รายได้เพิ่มขึ้น 3–5 เท่าใน 90 วัน โดยใช้ผู้ติดตามที่มีอยู่แล้ว',
}

// สาเหตุที่พลาดเงิน ราย niche — อ่านแล้วเห็นภาพทันที
const NICHE_WHY: Record<string, string> = {
  finance:       'คนดูคลิปคุณแล้วอยากได้ความรู้เพิ่ม แต่ไม่มีที่ให้ไป เขาเลยออกไปหาคนอื่นที่มีคอร์สหรือกลุ่มแทน',
  business:      'แบรนด์ที่ขายของให้ SME มองหา creator อยู่ตลอด แต่ถ้าคุณไม่มี media kit หรือราคาชัดเจน เขาก็จะไปหาคนที่พร้อมกว่า',
  education:     'คนดูเรียนฟรีจากคุณแล้วอยากได้เพิ่ม แต่คุณไม่มีอะไรขาย เขาเลยไปจ่ายให้คนอื่นแทน',
  lifestyle:     'คนดูสินค้าที่คุณแนะนำแล้วออกไปซื้อเอง แต่ถ้าคุณมีลิงก์ คุณจะได้ค่าคอมทุกครั้ง',
  beauty:        'คนดูวิดีโอรีวิวครีม แล้วออกไปหาซื้อเองใน Google แต่ถ้าคุณมีลิงก์ในคลิปและ bio คุณจะได้เงินทุกครั้งที่เขาซื้อ',
  fitness:       'คนดูท่าออกกำลังกายของคุณแล้วอยากได้โปรแกรมที่เป็นระบบ แต่คุณไม่มีขาย เขาเลยไปจ่ายให้โค้ชคนอื่น',
  food:          'คนดูสูตรอาหารของคุณแล้วอยากได้สูตรเพิ่ม แต่ไม่มีที่ซื้อ เขาเลยออกไปซื้อหนังสือสูตรของคนอื่น',
  travel:        'คนดูคลิปทริปของคุณแล้วอยากไปบ้าง แต่ไม่รู้จะถามใคร เขาเลยจ่ายเงินให้ทัวร์แทน ทั้งที่คุณรู้ดีกว่า',
  entertainment: 'fan ของคุณอยากสนับสนุนคุณ แต่ไม่มีช่องทาง เขาเลยแค่ดูฟรีแล้วก็จบ',
  other:         'คนดูคอนเทนต์ของคุณแล้วออกไปซื้อสินค้าที่คุณพูดถึงเอง แต่คุณไม่ได้ค่าคอมเพราะไม่มีลิงก์',
}

// ตัวเลือกสลับเพื่อสร้าง variation — ป้องกันตอบซ้ำ
const SHOCK_OPENERS = [
  (name: string, total: number, leak: string, perMonth: number) =>
    `${name} มีคนดูอยู่แล้ว แต่ทุกเดือนปล่อยให้ ฿${fmt(total)} ผ่านมือไปเฉยๆ — ปัญหาหลักคือ${leak} ที่ดึงเงินออกไป ฿${fmt(perMonth)} ทุกเดือน`,
  (name: string, total: number, leak: string, perMonth: number) =>
    `ทุกเดือนที่ผ่านไป ${name} ขาดรายได้ ฿${fmt(total)} — ส่วนใหญ่มาจาก${leak} ที่ยังไม่ได้แก้ คิดเป็น ฿${fmt(perMonth)}/เดือน`,
  (name: string, total: number, leak: string, perMonth: number) =>
    `${name} สร้าง content ทุกวัน แต่เงิน ฿${fmt(total)}/เดือนยังไม่เข้ากระเป๋า — สาเหตุหลักคือ${leak} ซึ่งคิดเป็น ฿${fmt(perMonth)}/เดือน`,
]

export function generateMockInsights(
  data: AuditFormData,
  leaks: RevenueLeak[],
  revenue: RevenueEstimation,
): AIInsights {
  const topLeak = leaks[0]
  const secondLeak = leaks[1]
  const totalLeak = leaks.reduce((s, l) => s + l.missedPerMonth, 0)

  // เลือก opener แบบ rotate ตาม follower เพื่อ variation
  const openerIdx = data.followers % SHOCK_OPENERS.length
  const openerFn = SHOCK_OPENERS[openerIdx]

  // SHOCK — ชื่อ + ตัวเลข + สาเหตุหลัก ภาษาชาวบ้าน
  const shock = topLeak
    ? openerFn(data.name, totalLeak, topLeak.title, topLeak.missedPerMonth)
    : `${data.name} ยังมีรายได้จาก content น้อยกว่าที่ควรได้ ฿${fmt(totalLeak)}/เดือน — เพราะยังไม่มีระบบที่เปลี่ยนคนดูให้เป็นรายได้`

  // WHY — อธิบายภาษาชาวบ้าน + สิ่งที่ต้องทำต่อ
  const nicheWhy = NICHE_WHY[data.niche] ?? NICHE_WHY.other
  const whyItHappens = topLeak
    ? `${nicheWhy} ${data.name} มีผู้ติดตาม ${data.followers.toLocaleString('th-TH')} คนบน${data.platform === 'tiktok' ? 'TikTok' : data.platform === 'instagram' ? 'Instagram' : data.platform === 'youtube' ? 'YouTube' : 'แพลตฟอร์ม'} ทุกคนดูแล้วก็ออกไปโดยไม่มีอะไรให้ซื้อ — นั่นคือ ฿${fmt(topLeak.missedPerMonth)}/เดือนที่หายไป${secondLeak ? ` บวกกับ "${secondLeak.title}" อีก ฿${fmt(secondLeak.missedPerMonth)}/เดือน` : ''} สิ่งที่ต้องทำต่อ: เริ่มแก้จุด "${topLeak.title}" ก่อน ทำแค่จุดนี้จุดเดียวก็ได้เงินเพิ่มทันที`
    : `คนดู content ของ ${data.name} แล้วออกไปโดยไม่ได้ทำอะไร เพราะไม่มีที่ให้ซื้อหรือสนับสนุน สิ่งที่ต้องทำต่อ: เลือกวิธีทำเงิน 1 วิธีแล้วเริ่มภายใน 7 วัน`

  // TOP ACTIONS — ทำได้วันนี้ + ตัวเลขที่จะได้
  const firstMove = NICHE_FIRST_MOVE[data.niche] ?? NICHE_FIRST_MOVE.other
  const secondMove = !data.hasProduct
    ? `สร้างของที่ขายได้ชิ้นแรก ราคา 299–990 บาท ภายใน 7 วัน — ขายครั้งเดียวแต่ขายซ้ำได้ตลอด ทำวันนี้: เลือกสิ่งที่คนถามบ่อยที่สุด แล้วทำออกมาเป็น PDF หรือวิดีโอ`
    : !data.hasFunnel
    ? `ตั้งหน้าเว็บหรือ LINE สำหรับเก็บข้อมูลลูกค้า — คน ${data.avgViews.toLocaleString('th-TH')} วิว/โพสต์ผ่านมาแล้วหายไปหมด ถ้ามีที่เก็บ LINE เราจะเรียกกลับได้ ทำวันนี้: ตั้ง LINE OA → ใส่ลิงก์ใน bio`
    : `ตั้งระบบตอบ DM อัตโนมัติ — ทุก comment ที่มีคือโอกาสขาย ถ้าไม่มีคนตอบ ลูกค้าก็ไป ทำวันนี้: ตั้ง quick reply ใน LINE หรือ IG`

  const topActions = `วิธีที่ 1: ${firstMove}\n\nวิธีที่ 2: ${secondMove}`

  // UPSIDE — ตัวเลขชัดเจน + ทำให้รู้สึกว่าทำได้จริง
  const future = NICHE_FUTURE[data.niche] ?? NICHE_FUTURE.other
  const upside = `ถ้า ${data.name} แก้ "${topLeak?.title ?? 'จุดหลัก'}" ได้ก่อน รายได้จะขึ้นมาที่ ฿${fmt(revenue.realistic)}/เดือน ซึ่งสูงกว่าตอนนี้ ฿${fmt(revenue.totalMissed)}/เดือน — ${future} ภายใน 90 วัน เป้าหมาย ฿${fmt(revenue.aggressive)}/เดือน ทำได้ถ้าเริ่มตอนนี้ ไม่ใช่แค่ฝัน`

  return { shock, whyItHappens, topActions, upside }
}
