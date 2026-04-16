'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Zap, Target, TrendingUp, CheckCircle, Sparkles } from 'lucide-react'

const OUTCOMES = [
  { value: '฿5K–20K', label: 'ต่อเดือนที่เพิ่มได้จาก Affiliate อย่างเดียว', sub: 'โดยไม่ต้องสร้าง content เพิ่ม' },
  { value: '฿40K+', label: 'เงินเฉลี่ยที่ Creator ยังไม่ได้ดึงออกมา', sub: 'ต่อเดือน จาก audience ที่มีอยู่แล้ว' },
  { value: '7 วัน', label: 'เริ่มเห็นเงินเพิ่มครั้งแรก', sub: 'หลังวางระบบตามแผนที่ได้รับ' },
]

const STEPS = [
  { n: '01', icon: BarChart3, title: 'กรอก Creator Profile', desc: 'Platform, Niche, Followers, รายได้ปัจจุบัน และระบบ Monetization ที่มีอยู่' },
  { n: '02', icon: Zap, title: 'AI วิเคราะห์ 5 มิติ', desc: 'Reach, Funnel, Product, Conversion, Affiliate — คะแนนจาก 100' },
  { n: '03', icon: Target, title: 'รับแผนเฉพาะตัวคุณ', desc: 'Revenue Gap + 3 วิธีทำเงินที่เหมาะกับ Niche และ Platform ของคุณ' },
]

const FEATURES = [
  'Monetization Score 5 มิติ (0–100)',
  'Revenue Gap — เงินที่ยังไม่ได้ดึงออกมา',
  'Revenue Blockers — สาเหตุที่รายได้ไม่โต',
  'AI Verdict โดย Monetization AI',
  'Top 3 Actions — เริ่มได้เลยวันนี้',
  'แผน 30/60/90 วัน พร้อมตัวเลขจริง',
]

const TESTIMONIALS = [
  {
    name: 'มินท์', handle: '@mint.beauty', platform: 'TikTok · 280K',
    quote: 'ไม่เคยคิดว่าแค่ไม่มี Funnel จะทำให้รายได้ขาด 42,000 บาท/เดือน พอวางระบบปุ๊บ จาก 8K ขึ้น 35K เดือนเดียว',
    gain: '+27,000 บาท/เดือน',
  },
  {
    name: 'บอส', handle: '@boss.finance', platform: 'YouTube · 156K',
    quote: 'Monetization Score บอกว่าได้แค่ 34/100 ทั้งๆ ที่มี subscriber เยอะมาก ตอนนี้ recurring 65K/เดือน',
    gain: '+65,000 บาท/เดือน',
  },
  {
    name: 'แตงโม', handle: '@tangmo.life', platform: 'Instagram · 95K',
    quote: 'Affiliate ที่ทำมา 6 เดือนได้แค่ 3K พอรู้ว่า setup ผิดจุดไหน optimize เดือนเดียวขึ้น 18K',
    gain: '+15,000 บาท/เดือน',
  },
]

export default function LandingPage() {
  return (
    <main className="bg-[#08080f] min-h-screen text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-black gradient-brand">MITA+</span>
          <Link
            href="/audit"
            className="flex items-center gap-1.5 bg-white text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-white/90 transition-all"
          >
            เริ่มวิเคราะห์ฟรี <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-violet-600/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 border border-violet-500/20 bg-violet-500/6 text-violet-300 text-xs px-3 py-1.5 rounded-full mb-8 font-medium">
              <Sparkles size={11} />
              AI Revenue Analysis for Creators
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl md:text-7xl font-black leading-[1.08] tracking-tight mb-6"
          >
            เข้าใจว่า Audience<br />
            ที่มีอยู่แล้ว ควรสร้าง<br />
            <span className="gradient-brand">รายได้เท่าไหร่</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            MITA+ วิเคราะห์ Revenue Gap ของคุณใน 5 มิติ — บอกว่า content ที่ทำอยู่แล้ว
            ควรสร้างรายได้ได้เท่าไหร่ และต้องทำอะไรเพื่อไปถึงตรงนั้น
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="flex flex-col gap-3 justify-center items-center sm:flex-row"
          >
            <Link
              href="/audit"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-base px-7 h-14 rounded-2xl transition-all"
            >
              เอาเงินกลับมา
              <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={16} />
            </Link>
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              3 นาที · เห็นเงินใน 7 วัน · ฟรี 100%
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="max-w-3xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {OUTCOMES.map((o) => (
            <div key={o.value} className="card rounded-2xl p-5 text-center">
              <div className="text-3xl font-black gradient-money mb-1">{o.value}</div>
              <div className="text-white/65 text-sm font-semibold leading-snug">{o.label}</div>
              <div className="text-white/28 text-xs mt-1">{o.sub}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-violet-400/55 text-xs font-semibold uppercase tracking-widest mb-3">สิ่งที่คุณจะได้รับ</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Report ที่บอกตัวเลขจริง<br />
              <span className="gradient-brand">ไม่ใช่แค่คำแนะนำทั่วไป</span>
            </h2>
            <p className="text-white/35 text-base max-w-md mx-auto">
              ทุกส่วนอ้างอิงจากข้อมูลของคุณ — Platform, Niche, Followers และระบบที่มีอยู่แล้ว
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {FEATURES.map((f) => (
              <div key={f} className="card rounded-xl px-4 py-3 flex items-center gap-3">
                <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">
              <span className="gradient-money">3 ขั้นตอน</span> เข้าใจ Monetization ของคุณ
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card rounded-2xl p-6"
              >
                <div className="text-5xl font-black text-white/5 mb-4 leading-none">{s.n}</div>
                <s.icon className="text-amber-400 mb-3" size={18} />
                <h3 className="font-bold text-white text-base mb-1.5">{s.title}</h3>
                <p className="text-white/38 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">
              Creator ที่ใช้ MITA+ แล้ว<br />
              <span className="gradient-growth">รายได้เปลี่ยนไปยังไง</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white leading-tight">{t.name}</div>
                    <div className="text-white/28 text-xs">{t.platform}</div>
                  </div>
                </div>
                <p className="text-white/52 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2 bg-emerald-500/7 border border-emerald-500/14 rounded-xl px-3 py-2">
                  <TrendingUp className="text-emerald-400 shrink-0" size={13} />
                  <span className="text-emerald-400 font-black text-sm">{t.gain}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="card rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-600/4 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black mb-3">
                Revenue Gap ของคุณ<br />
                <span className="gradient-money">รออยู่แล้ว</span>
              </h2>
              <p className="text-white/35 mb-8 text-base">
                วิเคราะห์ฟรี · ไม่ต้องสมัคร · ผลออกทันที
              </p>
              <Link
                href="/audit"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 h-14 rounded-2xl transition-all"
              >
                เอาเงินกลับมา
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={18} />
              </Link>
              <div className="mt-6 flex items-center justify-center gap-5 text-white/20 text-sm">
                <span>✓ ฟรี 100%</span>
                <span>✓ 3 นาที</span>
                <span>✓ แผนเฉพาะตัว</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-6 px-6 border-t border-white/5 text-center text-white/18 text-xs">
        <span className="gradient-brand font-black">MITA+</span> — Money In The Air
      </footer>
    </main>
  )
}
