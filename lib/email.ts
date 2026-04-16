// ── Resend email sender ─────────────────────────
// ต้องใส่ใน Vercel env vars:
//   RESEND_API_KEY=re_xxx
//   EMAIL_FROM=MITA+ <noreply@mitaplus.com>
//   EMAIL_OWNER=your@email.com  (รับ notification)

import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function fmt(n: number) { return Math.round(n).toLocaleString('th-TH') }

interface ResultEmailData {
  name: string
  email: string
  score: number
  revenueGap: number
  platform: string
  niche: string
}

// ── ส่งผลวิเคราะห์ให้ user ─────────────────────
export async function sendResultEmail(data: ResultEmailData): Promise<void> {
  const resend = getResend()
  if (!resend || !data.email) return

  const from   = process.env.EMAIL_FROM ?? 'MITA+ <noreply@mitaplus.com>'
  const annual = data.revenueGap * 12

  try {
    await resend.emails.send({
      from,
      to: data.email,
      subject: `${data.name} — ผลวิเคราะห์ MITA+ ของคุณ (Score: ${data.score}/100)`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0B0B0F;color:#fff;font-family:sans-serif;margin:0;padding:0;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">

    <h1 style="font-size:24px;font-weight:900;margin-bottom:4px;">MITA+ 💰</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:32px;">ผลวิเคราะห์ Monetization ของ ${data.name}</p>

    <!-- Score -->
    <div style="background:rgba(123,97,255,0.1);border:1px solid rgba(123,97,255,0.25);border-radius:16px;padding:24px;margin-bottom:16px;">
      <p style="font-size:12px;color:rgba(255,255,255,0.4);margin:0 0 4px;">Monetization Score</p>
      <p style="font-size:48px;font-weight:900;color:#a78bfa;margin:0;">${data.score}<span style="font-size:18px;color:rgba(255,255,255,0.3)">/100</span></p>
    </div>

    <!-- Revenue Gap -->
    <div style="background:rgba(255,77,79,0.08);border:1px solid rgba(255,77,79,0.2);border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="font-size:12px;color:rgba(255,255,255,0.4);margin:0 0 4px;">รายได้ที่ควรได้แต่ยังไม่ได้</p>
      <p style="font-size:36px;font-weight:900;color:#FF4D4F;margin:0;">-฿${fmt(data.revenueGap)}<span style="font-size:14px;font-weight:400;color:rgba(255,255,255,0.3)">/เดือน</span></p>
      <p style="font-size:13px;color:rgba(255,255,255,0.3);margin:8px 0 0;">= ฿${fmt(annual)}/ปี ที่ยังรออยู่</p>
    </div>

    <!-- CTA -->
    <a href="https://www.mitaplus.com/result" style="display:block;text-align:center;background:#FF9F1C;color:#000;font-weight:900;font-size:16px;padding:16px;border-radius:16px;text-decoration:none;margin-bottom:24px;">
      ดูแผนทำเงินฉบับเต็ม →
    </a>

    <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;">
      MITA+ — Money In The Air · <a href="https://www.mitaplus.com/privacy" style="color:rgba(255,255,255,0.3);">Privacy</a>
    </p>
  </div>
</body>
</html>
      `.trim(),
    })
  } catch (e) {
    console.error('[MITA+] Send result email failed:', e)
  }
}

// ── Notify owner เมื่อมี lead ใหม่ ─────────────
export async function sendOwnerNotification(subject: string, body: string): Promise<void> {
  const resend = getResend()
  const ownerEmail = process.env.EMAIL_OWNER
  if (!resend || !ownerEmail) return

  const from = process.env.EMAIL_FROM ?? 'MITA+ <noreply@mitaplus.com>'

  try {
    await resend.emails.send({
      from,
      to: ownerEmail,
      subject,
      html: `<pre style="font-family:monospace;white-space:pre-wrap;">${body}</pre>`,
    })
  } catch (e) {
    console.error('[MITA+] Owner notification failed:', e)
  }
}
