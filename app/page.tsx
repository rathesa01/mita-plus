'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, Zap, BarChart3, Target } from 'lucide-react'
import MitaLogo from '@/app/components/MitaLogo'

// ── P-006 homepage components ─────────────────────────────────────────────
import { TopNav }       from '@/components/homepage/TopNav'
import { HomepageHero } from '@/components/homepage/HeroSection'

// ── How it works ─────────────────────────────────
const STEPS = [
  { n: '1', icon: BarChart3, title: 'กรอกตัวเลขช่องของคุณ', desc: 'แค่ Platform · ยอด Follow · ยอดวิวเฉลี่ย · และรายได้ตอนนี้' },
  { n: '2', icon: Zap,       title: 'MITA+ คำนวณให้ใน 3 นาที', desc: 'วิเคราะห์ว่าตัวเลขที่มีอยู่ ควรสร้างเงินได้เท่าไหร่จริงๆ' },
  { n: '3', icon: Target,    title: 'รู้ทันทีว่าต้องทำอะไร', desc: 'แผนเฉพาะตัวที่บอกว่า "เริ่มจากตรงไหน" เพื่อเพิ่มรายได้เร็วที่สุด' },
]

// ── Testimonials ─────────────────────────────────
// หมายเหตุ: ตัวอย่างสมมติเพื่อแสดงประเภทปัญหาที่พบบ่อย
// ผลลัพธ์จริงขึ้นอยู่กับช่อง แพลตฟอร์ม และความสม่ำเสมอของ creator แต่ละคน
const TESTIMONIALS = [
  {
    name: 'มินท์', handle: '@mint.beauty', platform: 'TikTok · 280K',
    avatar: 'M', avatarBg: 'linear-gradient(135deg,#f093fb,#f5576c)',
    quote: 'ไม่รู้เลยว่าไม่มีลิงก์รับเงิน เป็น Revenue Blocker ใหญ่ที่สุด พอ MITA+ ชี้จุดปุ๊บ เริ่มแก้ได้เลยโดยไม่ต้องเพิ่ม follower',
    gain: 'แก้ Revenue Blocker',
  },
  {
    name: 'บอส', handle: '@boss.finance', platform: 'YouTube · 156K',
    avatar: 'บ', avatarBg: 'linear-gradient(135deg,#4facfe,#00f2fe)',
    quote: 'มี subscriber เยอะมาก แต่คะแนนได้แค่ 34/100 MITA+ บอกว่าขาด funnel รับ subscriber เก่า — จุดที่ไม่เคยนึกถึงเลย',
    gain: 'เจอ blind spot สำคัญ',
  },
  {
    name: 'แตงโม', handle: '@tangmo.life', platform: 'Instagram · 95K',
    avatar: 'ต', avatarBg: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    quote: 'ทำ Affiliate 6 เดือน แต่เลือกสินค้าผิด niche มาตลอด MITA+ แนะนำประเภทสินค้าที่ตรง audience จริงๆ — ต่างกันมาก',
    gain: 'เลือกสินค้าถูก niche',
  },
]

const FEATURES = [
  'คะแนนทำเงิน 0–100 ใน 5 ด้าน',
  'บอกว่ารายได้หายไปที่ไหนบ้าง',
  'เหตุที่รายได้ยังไม่โตเต็มที่',
  'MITA+ วิเคราะห์เฉพาะคุณ',
  '3 วิธีเพิ่มเงิน เริ่มได้เลยวันนี้',
  'แผน 30 วัน พร้อมตัวเลขจริง',
]

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden min-h-screen">

      {/* ══ LIGHT HERO ZONE ══════════════════════════════════════════════════ */}
      <div style={{ background: '#FFFAF5' }}>
        <TopNav />
        <HomepageHero />
      </div>

      {/* ══ TRANSITION GRADIENT (cream → dark) ══════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          height: '80px',
          flexShrink: 0,
          background: 'linear-gradient(180deg, #FFFAF5 0%, #08080f 100%)',
        }}
      />

      {/* ══ DARK SECTIONS (unchanged — remark: P-007 will update these) ════ */}
      <div className="bg-[#08080f] text-white">

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section id="how-it-works" className="py-16 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(251,191,36,0.6)' }}>วิธีใช้งาน</p>
              <h2 className="text-2xl sm:text-4xl font-black">
                แค่ <span style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>3 ขั้นตอน</span> รู้เลยว่ารายได้หายไปที่ไหน
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="text-6xl font-black leading-none mb-4"
                    style={{ color: 'rgba(255,255,255,0.04)' }}>{s.n}</div>
                  <s.icon size={20} className="mb-3" style={{ color: '#fbbf24' }} />
                  <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ──────────────────────────── */}
        <section className="py-16 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(123,97,255,0.7)' }}>ผลที่ได้รับ</p>
                <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-snug">
                  บอกตัวเลขจริง<br />
                  <span className="gradient-brand">ไม่ใช่คำแนะนำกว้างๆ</span>
                </h2>
                <p className="text-white/45 text-sm leading-relaxed mb-6">
                  ทุกอย่างอ้างอิงจากข้อมูลของคุณ — Platform, แนวช่อง, Followers
                  และรายได้ที่มีอยู่ ผลที่ได้จะไม่เหมือนกับใคร
                </p>
                <div className="flex flex-col gap-2.5">
                  {FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <CheckCircle size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
                      <span className="text-white/60 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-auto md:min-w-[260px]">
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>คะแนนทำเงิน</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                      <p style={{ fontWeight: 900, fontSize: '40px', color: '#a78bfa', lineHeight: 1 }}>47</p>
                      <p style={{ color: 'rgba(255,255,255,0.25)', marginBottom: '6px' }}>/100</p>
                    </div>
                  </div>
                  {[
                    { label: 'Reach',      val: 18, max: 25, color: '#a78bfa' },
                    { label: 'ระบบทำเงิน', val: 8,  max: 25, color: '#FF9F1C' },
                    { label: 'Funnel',     val: 5,  max: 25, color: '#FF4D4F' },
                    { label: 'Conversion', val: 10, max: 15, color: '#22C55E' },
                    { label: 'สินค้า',     val: 6,  max: 10, color: '#3ECFFF' },
                  ].map((row) => (
                    <div key={row.label} style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: row.color }}>{row.val}/{row.max}</span>
                      </div>
                      <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(row.val / row.max) * 100}%`, background: row.color, borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────── */}
        <section className="py-16 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(34,197,94,0.6)' }}>ตัวอย่างจริง</p>
              <h2 className="text-2xl sm:text-4xl font-black">
                Creator ที่เช็กแล้ว<br />
                <span style={{
                  background: 'linear-gradient(135deg, #22C55E, #06b6d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>รายได้เพิ่มขึ้นเท่าไหร่</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                      style={{ background: t.avatarBg }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white leading-tight">{t.name}</p>
                      <p className="text-white/30 text-xs">{t.platform}</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <TrendingUp size={13} style={{ color: '#22C55E', flexShrink: 0 }} />
                    <span className="font-black text-sm" style={{ color: '#22C55E' }}>{t.gain}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-4 text-white/20 text-xs leading-relaxed">
              * ตัวอย่างสมมติเพื่อแสดงประเภทปัญหาที่พบบ่อยใน creator ไทย · ผลลัพธ์จริงขึ้นอยู่กับช่อง แพลตฟอร์ม และความสม่ำเสมอของ creator แต่ละคน
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────── */}
        <section className="py-20 px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #2e1065 0%, #1e3a8a 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 60%)' }} />
              <div className="relative">
                <p className="text-white/50 text-sm mb-3">เริ่มได้เลยตอนนี้ · ฟรี 100%</p>
                <h2 className="text-2xl sm:text-4xl font-black mb-2 leading-snug">
                  เช็กว่า Follower ของคุณ<br />
                  <span style={{
                    background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>ทำเงินได้เท่าไหร่</span>
                </h2>
                <p className="text-white/40 text-sm mb-8">ไม่ต้องสมัคร · กรอก 3 นาที · รู้ผลทันที</p>
                <Link
                  href="/audit"
                  className="group w-full flex items-center justify-center gap-2 text-black font-black text-lg h-14 rounded-2xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', boxShadow: '0 0 40px rgba(251,191,36,0.25)' }}
                >
                  เริ่มต้นฟรี — วิเคราะห์ช่องของฉัน
                </Link>
                <div className="mt-5 flex items-center justify-center gap-4 text-white/25 text-xs">
                  <span>✓ ฟรี 100%</span>
                  <span>✓ 3 นาที</span>
                  <span>✓ แผนเฉพาะตัว</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/8">
                  <Link href="/login" className="text-white/35 hover:text-white/60 text-sm transition-colors">
                    มีบัญชีอยู่แล้ว? <span className="underline underline-offset-2">เข้าสู่ระบบ →</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ──────────────────────────────── */}
        <footer className="py-6 px-5 border-t border-white/5 text-center text-white/18 text-xs flex flex-col gap-2 items-center">
          <span className="flex items-center gap-2">
            <MitaLogo size="sm" />
            <span className="opacity-40">— Money In The Air</span>
          </span>
          <a href="/privacy" className="text-white/22 hover:text-white/40 transition-colors" style={{ textDecoration: 'none' }}>
            Privacy Policy
          </a>
        </footer>

      </div>{/* end dark sections */}
    </main>
  )
}
