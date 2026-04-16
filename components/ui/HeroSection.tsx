'use client'

import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #13102b 0%, #0d0d1a 60%, #080810 100%)',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute pointer-events-none"
        style={{ top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(123,97,255,0.22) 0%, transparent 65%)', filter: 'blur(40px)' }} />

      {/* Mobile: visual top → text bottom (1 screen) | Desktop: text left | visual right */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 flex flex-col lg:flex-row lg:items-center lg:gap-12 lg:min-h-[100svh] lg:py-0 pt-16 pb-4">

        {/* TEXT BLOCK */}
        <div className="lg:w-[46%] flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 mt-3 lg:mt-0">

          {/* Label — plain colored text, no pill */}
          <p className="font-bold mb-3 tracking-wide"
            style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: '#a78bfa' }}>
            ● วิเคราะห์รายได้ Creator ทุกช่องทาง
          </p>

          {/* Headline */}
          <h1 className="font-black leading-[1.08] tracking-tight mb-2"
            style={{ fontSize: 'clamp(2.2rem, 7vw, 4.2rem)' }}>
            <span className="text-white">Follower และ View<br />ของคุณ ทำเงินได้</span>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #7B61FF 0%, #FF9F1C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              เท่าไหร่จริงๆ?
            </span>
          </h1>

          {/* Sub — short & punchy */}
          <p className="mb-5"
            style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            กรอกตัวเลขแค่ 3 อย่าง รู้ผลใน 3 นาที
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Link href="/audit" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-14 px-10 rounded-full text-lg font-black transition-all hover:scale-105 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                  color: '#fff',
                  boxShadow: '0 0 32px rgba(123,97,255,0.4)',
                  letterSpacing: '0.01em',
                }}
              >
                เช็กตัวเลขของฉัน →
              </button>
            </Link>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ boxShadow: '0 0 6px #22c55e' }} />
              ฟรี 100% · ไม่ต้องสมัคร
            </p>
          </div>

          {/* Stats — desktop only */}
          <div className="hidden lg:flex gap-8 mt-10">
            {[
              { n: '฿40K+',  label: 'รายได้ที่หาย/เดือน'  },
              { n: '3 นาที', label: 'ได้ผลวิเคราะห์'       },
              { n: '100%',   label: 'ฟรี ไม่มีเงื่อนไข'   },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-black text-lg" style={{
                  background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{s.n}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VISUAL BLOCK */}
        <div className="lg:w-[54%] order-1 lg:order-2 flex items-center justify-center">
          <HeroVisual />
        </div>

      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    /* ── Container wider than image so cards can peek from sides ── */
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: '560px', height: '300px' }}>

      {/* Soft glow center */}
      <div className="absolute pointer-events-none rounded-full"
        style={{ width: '300px', height: '300px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(123,97,255,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* ── Analytics card LEFT (TikTok) — behind main image ── */}
      {/* Card: 155px. Image covers rightmost 35% = ~54px. Visible: 65% = ~101px sticking out left */}
      <div className="absolute rounded-2xl overflow-hidden"
        style={{
          width: '110px', top: '80px', left: '0px',
          transform: 'rotateZ(-5deg)',
          zIndex: 3, opacity: 0.55,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          background: '#16162a', border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#FF9F1C)' }}>👩</div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: '9px' }}>@mita_creator</p>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>TikTok · 52.3K</p>
          </div>
        </div>
        <div className="p-3 grid grid-cols-3 gap-1">
          {[['Followers','52.3K','#7B61FF'],['Views','1.2M','#FF9F1C'],['Eng.','3.2%','#22c55e']].map(([l,v,c]) => (
            <div key={l} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              <p className="font-bold" style={{ fontSize: '9px', color: c as string }}>{v}</p>
            </div>
          ))}
        </div>
        <div className="px-3 pb-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Revenue / Week</p>
            <div className="flex items-end gap-0.5" style={{ height: '26px' }}>
              {[30,50,38,70,55,85,75].map((h,i) => (
                <div key={i} className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, background: 'rgba(123,97,255,0.55)' }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg p-2 mt-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)' }}>Top Content</p>
            <p className="text-white" style={{ fontSize: '8px', marginTop: '2px' }}>🎵 รีวิวสกินแคร์ — 340K views</p>
            <p className="text-white" style={{ fontSize: '8px' }}>🎵 วิธีแต่งหน้า — 210K views</p>
          </div>
        </div>
      </div>

      {/* ── Analytics card RIGHT (Instagram) — behind main image ── */}
      <div className="absolute rounded-2xl overflow-hidden"
        style={{
          width: '108px', top: '60px', right: '0px',
          transform: 'rotateZ(5deg)',
          zIndex: 3, opacity: 0.55,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          background: '#16162a', border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{ background: 'linear-gradient(135deg,#f09433,#cc2366)' }}>📸</div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: '9px' }}>@lifestyle.th</p>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>Instagram · 48.5K</p>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="grid grid-cols-2 gap-1">
            {[['Reach','89K'],['Saves','2.4K']].map(([l,v]) => (
              <div key={l} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>{l}</p>
                <p className="font-bold text-white" style={{ fontSize: '9px' }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Engagement Rate</p>
            <div className="w-full rounded-full" style={{ height: '5px', background: 'rgba(255,255,255,0.08)' }}>
              <div className="rounded-full" style={{ width: '68%', height: '100%', background: 'linear-gradient(to right,#f09433,#cc2366)' }} />
            </div>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>2.1% — ดีกว่าค่าเฉลี่ย</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.2)' }}>
            <p className="font-black" style={{ fontSize: '13px', color: '#FF9F1C' }}>฿12,400 / เดือน</p>
            <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)' }}>Estimated Income</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="font-bold" style={{ fontSize: '11px', color: '#FF9F1C' }}>⭐ 72/100</p>
          </div>
        </div>
      </div>

      {/* ── Creator bubbles — faded ── */}
      <div className="absolute" style={{ top: '60px', left: '2px', zIndex: 4, opacity: 0.45, transform: 'scale(0.85)', transformOrigin: 'left top' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(255,159,28,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <Image src="/influ-cooking.png" alt="Food creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            🍳 ทำอาหาร
          </span>
        </div>
      </div>

      <div className="absolute" style={{ top: '20px', right: '5px', zIndex: 4, opacity: 0.45, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(123,97,255,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <Image src="/influ-lifestyle.png" alt="Lifestyle creator" width={48} height={48} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            ☕ ไลฟ์สไตล์
          </span>
        </div>
      </div>

      <div className="absolute" style={{ top: '210px', right: '3px', zIndex: 4, opacity: 0.45, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(34,197,94,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <Image src="/influ-fitness.png" alt="Fitness creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            💪 ออกกำลัง
          </span>
        </div>
      </div>

      {/* ── Floating chips (all within 420px height) ── */}
      <SmallCard style={{ top: '85px', left: '-5px', transform: 'rotateZ(-5deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>PROFIT</p>
        <p className="font-extrabold" style={{ fontSize: '18px', color: '#22c55e', lineHeight: 1 }}>+200%</p>
      </SmallCard>

      <SmallCard style={{ top: '180px', left: '8px', transform: 'rotateZ(-3deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,77,79,0.85)', marginBottom: '2px' }}>เงินที่หายไป</p>
        <p className="font-black" style={{ fontSize: '16px', color: '#FF4D4F', lineHeight: 1 }}>-฿28,500</p>
        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>/เดือน</p>
      </SmallCard>

      <SmallCard style={{ top: '185px', right: '5px', transform: 'rotateZ(4deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>SALES</p>
        <p className="font-bold" style={{ fontSize: '16px', color: '#22c55e', lineHeight: 1 }}>+400%</p>
      </SmallCard>

      {/* ── Main composite image — 90% wide, z-index highest ── */}
      <div className="absolute z-[20]"
        style={{ left: '50%', top: '52%', transform: 'translate(-50%,-50%)', width: '130%' }}>
        <Image
          src="/hero-composite.png"
          alt="Creator monetization"
          width={480} height={480}
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 24px 56px rgba(123,97,255,0.3)) drop-shadow(0 4px 24px rgba(0,0,0,0.6))' }}
          priority
        />
      </div>

      {/* 2 coins */}
      <span className="absolute pointer-events-none select-none"
        style={{ top: '12%', left: '20%', zIndex: 25, fontSize: '1.1rem', transform: 'rotateZ(-18deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>🪙</span>
      <span className="absolute pointer-events-none select-none"
        style={{ top: '60%', right: '14%', zIndex: 25, fontSize: '1rem', transform: 'rotateZ(14deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>🪙</span>
    </div>
  )
}

function SmallCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="absolute rounded-xl backdrop-blur-md"
      style={{
        ...style,
        padding: '8px 12px',
        background: 'rgba(18,18,36,0.88)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
      {children}
    </div>
  )
}
