'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, AlertTriangle, Zap, Target, BarChart3, ChevronRight } from 'lucide-react'

const PAIN_STATS = [
  { label: 'Creator ที่มี 100K+ followers ยังไม่มีรายได้ที่ consistent', value: '73%' },
  { label: 'รายได้เฉลี่ยต่ำกว่าที่ควรได้เพราะระบบไม่ครบ', value: '5x' },
  { label: 'เงินที่ Creator เสียไปต่อเดือนโดยไม่รู้ตัว', value: '฿47K' },
]
const HOW_IT_WORKS = [
  { step: '01', icon: BarChart3, title: 'กรอกข้อมูล Creator ของคุณ', desc: 'ใช้เวลา 3 นาที — platform, followers, รายได้ปัจจุบัน' },
  { step: '02', icon: Zap, title: 'AI วิเคราะห์ Revenue Leak', desc: 'ระบบตรวจจับว่าคุณเสียเงินตรงไหน และเท่าไหร่ต่อเดือน' },
  { step: '03', icon: Target, title: 'รับแผนทำเงินเฉพาะตัว', desc: 'แผน 30/60/90 วัน พร้อมตัวเลขจริง ทำได้เลยวันนี้' },
]
const SOCIAL_PROOF = [
  { name: 'มินท์ — Beauty Creator', followers: '280K TikTok', quote: 'ไม่เคยรู้เลยว่าเสียเงินไป 42,000 บาท/เดือนเพราะไม่มี Funnel รายได้เพิ่มจาก 8K เป็น 35K', revenue: '+27,000 บาท/เดือน' },
  { name: 'บอส — Finance Creator', followers: '156K YouTube', quote: 'มี audience ที่ดี แต่ไม่รู้จะ monetize ยังไง ตอนนี้ recurring revenue 65K/เดือน', revenue: '+65,000 บาท/เดือน' },
  { name: 'แตงโม — Lifestyle IG', followers: '95K Instagram', quote: 'ทำ affiliate มา 6 เดือนได้แค่ 3K/เดือน พอ optimize เดือนเดียวขึ้นเป็น 18K', revenue: '+15,000 บาท/เดือน' },
]
const PAIN_ITEMS = [
  { icon: '🪣', title: 'ไม่มี Funnel ดักลูกค้า', desc: 'คนดูล้านวิว แต่พวกเขาดูแล้วก็หายไปตลอดกาล' },
  { icon: '🔇', title: 'ไม่มีระบบปิดการขาย', desc: 'มีคนสนใจแต่ไม่มีใครชวนซื้อ เขาเลยไปซื้อที่อื่น' },
  { icon: '🎁', title: 'แนะนำของฟรีทั้งที่รับค่าคอมได้', desc: 'พูดถึงสินค้าทุกโพสต์แต่ไม่มี affiliate link — ค่าคอมหายเปล่า' },
  { icon: '🏗️', title: 'ไม่มีสินค้าเป็นของตัวเอง', desc: 'สร้างคอนเทนต์สอนคน แต่เงินได้แค่ค่า ads จากแพลตฟอร์ม' },
]

export default function LandingPage() {
  return (
    <main className="bg-[#080810] min-h-screen text-white overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">MITA+</span>
          <Link href="/audit" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-5 py-2 rounded-full transition-all">
            วิเคราะห์ฟรี <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Creator ส่วนใหญ่เสียเงินไป 3-10x ต่อเดือนโดยไม่รู้ตัว
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black leading-tight mb-6">
            เงินอยู่รอบตัวคุณ<br /><span className="gradient-text">แต่ยังหลุดมือ</span><br />ทุกวัน
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            MITA+ วิเคราะห์ว่าคุณกำลัง<span className="text-red-400 font-semibold">เสียเงินเท่าไหร่ต่อเดือน</span> และบอกแผนที่ทำได้จริง
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/audit" className="group flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-2xl transition-all glow-amber">
              วิเคราะห์ Revenue ฟรี <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />ใช้เวลา 3 นาที
            </div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAIN_STATS.map((s) => (
            <div key={s.value} className="glass rounded-2xl p-6 text-center">
              <div className="text-4xl font-black gradient-text mb-2">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-red-400 mb-4">
              <AlertTriangle size={18} />
              <span className="text-sm font-semibold uppercase tracking-wider">สิ่งที่คุณกำลังเสียอยู่ทุกเดือน</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black">Content คุณดี แต่<br /><span className="text-red-400">เงินไม่ดีตาม</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {PAIN_ITEMS.map((item) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-6 flex gap-4">
                <span className="text-3xl">{item.icon}</span>
                <div><h3 className="font-bold text-white mb-1">{item.title}</h3><p className="text-white/50 text-sm">{item.desc}</p></div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-center">
            <TrendingDown className="text-red-400 mx-auto mb-3" size={32} />
            <p className="text-red-300 text-lg font-semibold">ทุกเดือนที่ผ่านไปโดยไม่แก้ระบบ = เงินที่ไม่มีวันได้คืน</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black mb-4">ใช้เวลา <span className="gradient-text-green">3 นาที</span><br />รู้ว่าเสียเงินไปเท่าไหร่</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6">
                <div className="text-4xl font-black text-white/10 mb-4">{item.step}</div>
                <item.icon className="text-amber-400 mb-3" size={24} />
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Creator ที่วางระบบแล้ว<br /><span className="gradient-text-green">รายได้เปลี่ยนยังไง</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SOCIAL_PROOF.map((s) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-black">{s.name[0]}</div>
                  <div><div className="font-semibold text-sm">{s.name}</div><div className="text-white/40 text-xs">{s.followers}</div></div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{s.quote}&rdquo;</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
                  <span className="text-emerald-400 font-bold text-sm">{s.revenue}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-10 md:p-16 glow-amber">
            <div className="text-6xl mb-6">💰</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">หยุดเสียเงิน<br /><span className="gradient-text">เริ่มทำเงินแทน</span></h2>
            <p className="text-white/50 text-lg mb-10">วิเคราะห์ฟรี ไม่ต้องสมัครสมาชิก ใช้เวลา 3 นาที</p>
            <Link href="/audit" className="group inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-10 py-5 rounded-2xl transition-all">
              วิเคราะห์ Revenue ของฉันฟรี <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </Link>
            <div className="mt-6 flex items-center justify-center gap-6 text-white/30 text-sm">
              <span>✓ ฟรี 100%</span><span>✓ ผลออกทันที</span><span>✓ แผนเฉพาะตัว</span>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5 text-center text-white/30 text-sm">
        <span className="gradient-text font-bold">MITA+</span> — Money In The Air
      </footer>
    </main>
  )
}
