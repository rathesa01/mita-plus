/**
 * MITA+ Notification API
 *
 * ส่งแจ้งเตือนผ่าน LINE Notify
 * - เช็คอินประจำสัปดาห์
 * - สินค้า trending ใหม่
 * - milestone ที่ทำได้
 *
 * ใช้ LINE Notify เพราะ:
 * - ฟรี ไม่มีค่า API
 * - คนไทยใช้ LINE เกือบ 100%
 * - ส่งข้อความ + รูปได้
 */

import { NextRequest, NextResponse } from 'next/server'

const LINE_NOTIFY_URL = 'https://notify-api.line.me/api/notify'

// Template messages
function getCheckInMessage(name: string, weekNo: number): string {
  const emojis = ['🌱', '🔥', '💪', '👑']
  const emoji = emojis[Math.min(weekNo - 1, 3)]
  return `\n${emoji} สวัสดีค่ะ ${name}!\n\nสัปดาห์ที่ ${weekNo} มาแล้วค่ะ\nโค้ช MITA+ รอฟังผลงานของคุณอยู่นะคะ ✨\n\n📋 กดเช็คอินได้เลยค่ะ:\nhttps://mita-app.vercel.app/starter\n\nทำแค่ 2 นาที → รับ feedback + ไอเดียคลิปถัดไปทันทีค่ะ 🎯`
}

function getMilestoneMessage(name: string, milestone: string, amount: number): string {
  return `\n🎉 ยินดีด้วยค่ะ ${name}!\n\nคุณเพิ่งปลดล็อก: ${milestone}\n💰 รายได้สะสม ฿${amount.toLocaleString('th-TH')}\n\nทำได้เยี่ยมมากค่ะ! ทำต่อไปนะคะ 💪\nhttps://mita-app.vercel.app/starter`
}

function getTrendingMessage(name: string, productName: string, commission: number): string {
  return `\n📦 สินค้า trending ใหม่มาแล้วค่ะ ${name}!\n\n"${productName}"\nCommission ${commission}% — ลูกค้ากำลังหาสินค้านี้เยอะมากค่ะ\n\n🛍 ดูรายละเอียดได้ที่:\nhttps://mita-app.vercel.app/starter`
}

async function sendLineNotify(token: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(LINE_NOTIFY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, lineToken, name, weekNo, milestone, amount, productName, commission } = body

    if (!lineToken) {
      return NextResponse.json({ error: 'LINE token required' }, { status: 400 })
    }

    let message = ''
    switch (type) {
      case 'checkin':
        message = getCheckInMessage(name, weekNo ?? 1)
        break
      case 'milestone':
        message = getMilestoneMessage(name, milestone, amount ?? 0)
        break
      case 'trending':
        message = getTrendingMessage(name, productName, commission ?? 0)
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const sent = await sendLineNotify(lineToken, message)
    return NextResponse.json({ success: sent })
  } catch (err) {
    console.error('[notify]', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
