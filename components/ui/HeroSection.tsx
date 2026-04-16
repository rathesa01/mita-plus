'use client'

import Link from 'next/link'
import Image from 'next/image'

const platforms = [
  { icon: '🎵', name: 'TikTok' },
  { icon: '📸', name: 'Instagram' },
  { icon: '▶️', name: 'YouTube' },
]

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(123,97,255,0.35) 0%, #0d0d1a 70%)',
        minHeight: '100svh',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'rgba(123,97,255,0.3)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-[-40px] right-[-40px] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'rgba(123,97,255,0.12)', filter: 'blur(100px)' }} />

      {/* ── INNER — responsive layout ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-24 pb-12 flex flex-col md:flex-row md:items-center md:gap-16 min-h-[100svh]">

        {/* ── LEFT: Text + CTA ── */}
        <div className="flex-1 flex flex-col items-start md:max-w-[480px]">

          {/* Platform badges */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}>
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] leading-[1.1] font-extrabold text-white mb-4">
            Follower และ View<br />
            ของคุณ ทำเงินได้<br />
            <span style={{ color: '#7B61FF' }}>เท่าไหร่จริงๆ?</span>
          </h1>

          <p className="text-sm sm:text-base font-medium mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            วิเคราะห์ Revenue Gap ฟรี ใน 3 นาที — AI คำนวณให้เห็นว่าเงินหายไปที่ไหน และต้องแก้อะไรก่อน
          </p>

          {/* CTA */}
          <Link href="/audit">
            <button
              className="h-12 px-8 rounded-xl text-base font-black transition-opacity hover:opacity-90"
              style={{ background: '#FF9F1C', color: '#000' }}
            >
              เช็กตัวเลขของฉัน →
            </button>
          </Link>

          <p className="mt-3 text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ boxShadow: '0 0 6px #22c55e' }} />
            ฟรี 100% · ไม่ต้องสมัคร · ผลออกใน 3 นาที
          </p>
        </div>

        {/* ── RIGHT: Visual ── */}
        <div className="flex-1 mt-12 md:mt-0 flex items-center justify-center md:justify-end">
          <div className="w-full max-w-[420px] md:max-w-[520px]">
            <HeroVisual />
          </div>
        </div>

      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative w-full mx-auto" style={{ height: '520px', perspective: '1000px' }}>

      {/* Ambient glow center */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: '280px', height: '280px', background: 'rgba(123,97,255,0.12)', filter: 'blur(80px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

      {/* Left screen — TikTok analytics */}
      <div className="absolute rounded-xl overflow-hidden"
        style={{ width: '190px', height: '270px', top: '15px', left: '0px', transform: 'rotateZ(-6deg) rotateY(8deg)', zIndex: 0, opacity: 0.75, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)' }}>👩</div>
            <div>
              <p className="font-bold text-white" style={{ fontSize: '10px' }}>@mita_creator</p>
              <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>TikTok • Creator</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[['Followers','52.3K'],['Views','1.2M'],['Eng.','3.2%']].map(([label, val]) => (
              <div key={label} className="rounded-md p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                <p className="font-bold text-white" style={{ fontSize: '10px' }}>{val}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Revenue / Week</p>
            <div className="flex items-end gap-0.5" style={{ height: '32px' }}>
              {[40,55,35,65,50,80,70].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: 'rgba(123,97,255,0.6)' }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>Top Content</p>
            <p className="text-white font-medium" style={{ fontSize: '9px', marginTop: '2px' }}>🎵 รีวิวสกินแคร์ — 340K</p>
            <p className="text-white" style={{ fontSize: '9px' }}>🎵 วิธีแต่งหน้า — 210K</p>
          </div>
        </div>
      </div>

      {/* Right screen — Instagram analytics */}
      <div className="absolute rounded-xl overflow-hidden"
        style={{ width: '180px', height: '255px', top: '5px', right: '0px', transform: 'rotateZ(5deg) rotateY(-6deg)', zIndex: 0, opacity: 0.7, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>📸</div>
            <div>
              <p className="font-bold text-white" style={{ fontSize: '10px' }}>@lifestyle.th</p>
              <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>Instagram • 48.5K</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[['Reach','89K'],['Saves','2.4K']].map(([label, val]) => (
              <div key={label} className="rounded-md p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                <p className="font-bold text-white" style={{ fontSize: '10px' }}>{val}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Engagement Rate</p>
            <div className="w-full rounded-full" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
              <div className="rounded-full" style={{ width: '68%', height: '100%', background: 'linear-gradient(to right, #f09433, #cc2366)' }} />
            </div>
            <p className="text-white" style={{ fontSize: '8px', marginTop: '4px' }}>2.1% — ดีกว่าค่าเฉลี่ย</p>
          </div>
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>Estimated Income</p>
            <p className="font-bold text-white" style={{ fontSize: '10px' }}>฿12,400 / เดือน</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p className="font-bold" style={{ fontSize: '11px', color: '#FF9F1C' }}>⭐ 72/100</p>
          </div>
        </div>
      </div>

      {/* Floating data cards */}
      <FloatingCard style={{ top: '8px', left: '30px', transform: 'rotateZ(-8deg)', zIndex: 5 }}>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>PROFIT</p>
        <p className="font-extrabold" style={{ fontSize: '14px', color: '#22c55e' }}>+200%</p>
      </FloatingCard>

      <FloatingCard style={{ top: '5px', right: '20px', transform: 'rotateZ(6deg)', zIndex: 5 }}>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FF4D4F' }} />
          <span className="font-bold" style={{ fontSize: '10px', color: '#FF4D4F' }}>-฿28,500/เดือน</span>
        </div>
      </FloatingCard>

      <FloatingCard style={{ top: '185px', left: '0px', transform: 'rotateZ(-5deg)', zIndex: 5 }}>
        <p className="font-semibold text-white" style={{ fontSize: '10px' }}>❤️ 3.2%</p>
        <p style={{ fontSize: '8px', color: '#22c55e' }}>สูงกว่าค่าเฉลี่ย</p>
      </FloatingCard>

      <FloatingCard style={{ bottom: '30px', left: '15px', transform: 'rotateZ(-3deg)', zIndex: 5 }}>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>SALES</p>
        <p className="font-bold" style={{ fontSize: '12px', color: '#22c55e' }}>+400%</p>
      </FloatingCard>

      <FloatingCard style={{ bottom: '55px', right: '10px', transform: 'rotateZ(4deg)', zIndex: 5 }}>
        <div className="flex items-center gap-1.5">
          <IGIcon /><YTIcon /><TTIcon />
        </div>
      </FloatingCard>

      {/* Coins */}
      {[
        { top: '20px', left: '90px', rotate: '-20deg', size: '1.4rem' },
        { top: '50px', right: '50px', rotate: '15deg', size: '1.2rem' },
        { top: '130px', left: '20px', rotate: '-35deg', size: '1rem' },
        { bottom: '130px', right: '30px', rotate: '25deg', size: '1.4rem' },
        { bottom: '60px', left: '50px', rotate: '-10deg', size: '1rem' },
      ].map((coin, i) => (
        <span key={i} className="absolute" style={{ ...coin, zIndex: 15, fontSize: coin.size, filter: 'drop-shadow(0 0 6px rgba(255,200,50,0.4))' }}>🪙</span>
      ))}

      {/* Creator bubbles */}
      <div className="absolute z-[12]" style={{ top: '5px', left: '5px' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: '2px solid rgba(255,159,28,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <Image src="/influ-cooking.png" alt="Food creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5 shadow"
            style={{ fontSize: '8px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            🍳 ทำอาหาร
          </span>
        </div>
      </div>

      <div className="absolute z-[12]" style={{ top: '30px', right: '5px' }}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden" style={{ border: '2px solid rgba(123,97,255,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <Image src="/influ-lifestyle.png" alt="Lifestyle creator" width={48} height={48} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5 shadow"
            style={{ fontSize: '8px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            ☕ ไลฟ์สไตล์
          </span>
        </div>
      </div>

      <div className="absolute z-[12]" style={{ bottom: '55px', right: '0px' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: '2px solid rgba(34,197,94,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <Image src="/influ-fitness.png" alt="Fitness creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5 shadow"
            style={{ fontSize: '8px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            💪 ออกกำลังกาย
          </span>
        </div>
      </div>

      {/* Main composite image */}
      <div className="absolute z-10" style={{ left: '50%', top: '52%', transform: 'translate(-50%, -50%)', width: '100%' }}>
        <Image src="/hero-composite.png" alt="Creator monetization" width={520} height={520} className="w-full h-auto drop-shadow-2xl" priority />
      </div>
    </div>
  )
}

function FloatingCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="absolute rounded-xl p-2.5 shadow-lg backdrop-blur-md"
      style={{ ...style, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)', transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}

function YTIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white" />
    </svg>
  )
}

function IGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig2" x1="0" y1="24" x2="24" y2="0">
          <stop stopColor="#FFDC80" /><stop offset="0.5" stopColor="#F77737" /><stop offset="1" stopColor="#C13584" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig2)" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="7" r="1" fill="white" />
    </svg>
  )
}

function TTIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="black" />
      <path d="M16.5 6.5c-.6-.5-1-1.3-1-2.2h-2.2v10.4a2.1 2.1 0 1 1-1.4-2v-2.2a4.3 4.3 0 1 0 3.6 4.2V9.4c.8.5 1.7.8 2.7.8V8a3.6 3.6 0 0 1-1.7-1.5z" fill="white" />
    </svg>
  )
}
