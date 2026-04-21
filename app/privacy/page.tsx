import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | MITA+',
  description: 'นโยบายความเป็นส่วนตัวของ MITA+ — Money In The Air',
}

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '10px' }}>{title}</h2>
    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.8 }}>{children}</div>
  </div>
)

export default function PrivacyPage() {
  return (
    <main style={{ background: '#0B0B0F', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back */}
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none', marginBottom: '40px' }}
        >
          ← กลับหน้าแรก
        </Link>

        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7B61FF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Legal
          </span>
        </div>
        <h1 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '8px' }}>นโยบายความเป็นส่วนตัว</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '40px' }}>
          อัปเดตล่าสุด: เมษายน 2026
        </p>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '40px' }} />

        <SECTION title="1. ข้อมูลที่เราเก็บรวบรวม">
          <p style={{ marginBottom: '8px' }}>MITA+ เก็บข้อมูลที่คุณกรอกในแบบฟอร์มวิเคราะห์ ได้แก่:</p>
          <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '4px' }}>ชื่อ และอีเมล (ถ้ากรอก)</li>
            <li style={{ marginBottom: '4px' }}>ข้อมูล Platform: จำนวน Followers, ยอดวิว, แนวช่อง</li>
            <li style={{ marginBottom: '4px' }}>ข้อมูลรายได้ปัจจุบัน และเป้าหมาย</li>
            <li style={{ marginBottom: '4px' }}>ข้อมูลการใช้งานเว็บไซต์ทั่วไป (เช่น browser type)</li>
          </ul>
        </SECTION>

        <SECTION title="2. วัตถุประสงค์การใช้ข้อมูล">
          <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '4px' }}>วิเคราะห์ Revenue Gap และสร้างแผนเฉพาะบุคคล</li>
            <li style={{ marginBottom: '4px' }}>ติดต่อกลับเพื่อนำเสนอบริการ (เฉพาะที่ได้รับความยินยอม)</li>
            <li style={{ marginBottom: '4px' }}>ปรับปรุงระบบวิเคราะห์ให้แม่นยำยิ่งขึ้น</li>
          </ul>
        </SECTION>

        <SECTION title="3. การจัดเก็บและความปลอดภัย">
          <p>ข้อมูลผลวิเคราะห์ถูกเก็บใน sessionStorage ของ browser คุณเท่านั้น — ไม่มีการบันทึกผลลัพธ์บนเซิร์ฟเวอร์โดยอัตโนมัติ เว้นแต่คุณจะส่งข้อมูลติดต่อมาหาทีมงาน</p>
        </SECTION>

        <SECTION title="4. การแบ่งปันข้อมูล">
          <p>เราไม่ขาย ให้เช่า หรือแบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลภายนอก ยกเว้นกรณีที่กฎหมายกำหนด</p>
        </SECTION>

        <SECTION title="5. สิทธิ์ของคุณ">
          <p style={{ marginBottom: '8px' }}>คุณมีสิทธิ์:</p>
          <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '4px' }}>ขอดู แก้ไข หรือลบข้อมูลของคุณได้ทุกเมื่อ</li>
            <li style={{ marginBottom: '4px' }}>ยกเลิกการรับการติดต่อจากทีมงานได้ทันที</li>
          </ul>
          <p style={{ marginTop: '12px' }}>ติดต่อเราผ่าน LINE OA หรืออีเมลที่ระบุบนเว็บไซต์</p>
        </SECTION>

        <SECTION title="6. Cookies">
          <p>MITA+ ใช้ cookie พื้นฐานเพื่อการทำงานของเว็บไซต์เท่านั้น ไม่มีการใช้ tracking cookie เพื่อโฆษณา</p>
        </SECTION>

        <SECTION title="7. การเปลี่ยนแปลงนโยบาย">
          <p>เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว โดยจะแจ้งวันที่อัปเดตล่าสุดไว้ที่ด้านบนเสมอ</p>
        </SECTION>

        <div style={{ marginTop: '48px', padding: '20px', background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.15)', borderRadius: '16px' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7 }}>
            มีคำถามเกี่ยวกับนโยบายนี้? ติดต่อทีมงานผ่าน{' '}
            <a href="/" style={{ color: '#7B61FF', textDecoration: 'none' }}>หน้าแรก</a>
          </p>
        </div>
      </div>
    </main>
  )
}
