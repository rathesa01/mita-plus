'use client'

import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #13102b 0%, #0d0d1a 60%, #080810 100%)',
        minHeight: '100svh',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute pointer-events-none"
        style={{ top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(123,97,255,0.25) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: '0', right: '0', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,159,28,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-20 pb-16 flex flex-col lg:flex-row lg:items-center lg:gap-12 min-h-[100svh]">

        {/* ── LEFT: Text (desktop: 45%) ── */}
        <div className="lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 mt-10 lg:mt-0">

          {/* Label pill */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#a78bfa' }}>
              Creator Revenue Analysis
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-black leading-[1.08] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}>
            <span className="text-white">Follower และ View<br />ของคุณ ทำเงินได้</span>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #7B61FF 0%, #FF9F1C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              เท่าไหร่จริงๆ?
            </span>
          </h1>

          {/* Sub */}
          <p className="text-sm sm:text-base mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            กรอกตัวเลขช่องของคุณแค่ 3 อย่าง — แล้วรู้เลยว่า
            เงินหายไปที่ไหน และต้องเริ่มจากตรงไหนก่อน
          </p>

          {/* Platform badges */}
          <div className="flex gap-2 mb-7 justify-center lg:justify-start flex-wrap">
            {[
              { icon: '🎵', name: 'TikTok', color: 'rgba(255,255,255,0.15)' },
              { icon: '📸', name: 'Instagram', color: 'rgba(193,53,132,0.2)' },
              { icon: '▶️', name: 'YouTube', color: 'rgba(255,0,0,0.15)' },
              { icon: 'f', name: 'Facebook', color: 'rgba(24,119,242,0.15)' },
            ].map((p) => (
              <span key={p.name} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: p.color, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}>
                <span>{p.icon}</span>{p.name}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/audit">
              <button
                className="h-14 px-8 rounded-2xl text-base font-black transition-all hover:scale-105 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                  color: '#fff',
                  boxShadow: '0 0 32px rgba(123,97,255,0.4)',
                }}
              >
                เช็กตัวเลขของฉัน →
              </button>
            </Link>
            <p className="text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ boxShadow: '0 0 6px #22c55e' }} />
              ฟรี 100% · ไม่ต้องสมัคร
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-10 justify-center lg:justify-start">
            {[
              { n: '฿40K+', label: 'รายได้ที่หาย/เดือน' },
              { n: '3 นาที', label: 'ได้ผลวิเคราะห์' },
              { n: '100%', label: 'ฟรี ไม่มีเงื่อนไข' },
            ].map((s) => (
              <div key={s.n} className="text-center lg:text-left">
                <p className="font-black text-lg" style={{
                  background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{s.n}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Visual (desktop: 55%) ── */}
        <div className="lg:w-[55%] flex items-center justify-center order-1 lg:order-2">
          <HeroVisual />
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── */
/*  Hero Visual — Kollective-style 3D scatter  */
/* ─────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative w-full mx-auto"
      style={{ maxWidth: '560px', height: '540px', perspective: '1200px' }}>

      {/* ── Glow behind main image ── */}
      <div className="absolute pointer-events-none rounded-full"
        style={{ width: '320px', height: '320px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(123,97,255,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* ── Analytics card — TikTok (top-left, tilted) ── */}
      <div className="absolute rounded-2xl overflow-hidden"
        style={{ width: '200px', top: '10px', left: '0px', transform: 'rotateZ(-8deg) rotateY(12deg) rotateX(4deg)', zIndex: 2, opacity: 0.9, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', background: '#16162a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-6 h-6 rounded-full text-xs flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#FF9F1C)' }}>👩</div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: '9px' }}>@mita_creator</p>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>TikTok · 52.3K</p>
          </div>
        </div>
        <div className="p-3 grid grid-cols-3 gap-1">
          {[['Views','1.2M','#7B61FF'],['Eng.','3.2%','#FF9F1C'],['Score','84','#22c55e']].map(([l,v,c]) => (
            <div key={l} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              <p className="font-bold" style={{ fontSize: '10px', color: c }}>{v}</p>
            </div>
          ))}
        </div>
        <div className="px-3 pb-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Revenue Trend</p>
            <div className="flex items-end gap-0.5" style={{ height: '28px' }}>
              {[30,50,38,70,55,85,75].map((h,i) => (
                <div key={i} className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, background: `rgba(123,97,255,${0.4 + i*0.07})` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytics card — Instagram (top-right, tilted) ── */}
      <div className="absolute rounded-2xl overflow-hidden"
        style={{ width: '185px', top: '0px', right: '0px', transform: 'rotateZ(7deg) rotateY(-10deg) rotateX(3deg)', zIndex: 2, opacity: 0.88, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', background: '#16162a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-6 h-6 rounded-full text-xs flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f09433,#cc2366)' }}>📸</div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: '9px' }}>@lifestyle.th</p>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>Instagram · 48.5K</p>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Engagement Rate</p>
            <div className="w-full rounded-full" style={{ height: '5px', background: 'rgba(255,255,255,0.08)' }}>
              <div className="rounded-full" style={{ width: '68%', height: '100%', background: 'linear-gradient(to right,#f09433,#cc2366)' }} />
            </div>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>2.1% · ดีกว่าค่าเฉลี่ย</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.2)' }}>
            <p className="font-black" style={{ fontSize: '14px', color: '#FF9F1C' }}>฿12,400</p>
            <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>รายได้ประมาณการ/เดือน</p>
          </div>
        </div>
      </div>

      {/* ── Revenue Gap card (bottom-left) ── */}
      <div className="absolute rounded-xl"
        style={{ bottom: '80px', left: '10px', transform: 'rotateZ(-5deg)', zIndex: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: '#16162a', border: '1px solid rgba(255,77,79,0.3)', padding: '10px 14px', minWidth: '148px' }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>รายได้ที่หายไป</p>
        <p className="font-black" style={{ fontSize: '20px', color: '#FF4D4F', lineHeight: 1 }}>-฿28,500</p>
        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>/เดือน ที่ยังไม่ได้ดึงออกมา</p>
      </div>

      {/* ── Floating small cards ── */}
      <SmallCard style={{ top: '18px', left: '55px', transform: 'rotateZ(-10deg)', zIndex: 8 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>PROFIT</p>
        <p className="font-extrabold" style={{ fontSize: '16px', color: '#22c55e' }}>+200%</p>
      </SmallCard>

      <SmallCard style={{ bottom: '45px', left: '58px', transform: 'rotateZ(-4deg)', zIndex: 8 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>SALES</p>
        <p className="font-bold" style={{ fontSize: '14px', color: '#22c55e' }}>+400%</p>
      </SmallCard>

      <SmallCard style={{ top: '170px', right: '5px', transform: 'rotateZ(6deg)', zIndex: 8 }}>
        <p className="font-semibold text-white" style={{ fontSize: '10px' }}>❤️ 3.2%</p>
        <p style={{ fontSize: '7px', color: '#22c55e' }}>สูงกว่าค่าเฉลี่ย</p>
      </SmallCard>

      <SmallCard style={{ bottom: '60px', right: '5px', transform: 'rotateZ(4deg)', zIndex: 8 }}>
        <div className="flex items-center gap-1">
          <IGIcon /><YTIcon /><TTIcon />
        </div>
      </SmallCard>

      {/* ── Creator bubbles ── */}
      <CreatorBubble src="/influ-cooking.png" label="🍳 ทำอาหาร" size={60}
        borderColor="rgba(255,159,28,0.6)"
        style={{ top: '80px', left: '-8px', zIndex: 9 }} />

      <CreatorBubble src="/influ-lifestyle.png" label="☕ ไลฟ์สไตล์" size={52}
        borderColor="rgba(123,97,255,0.6)"
        style={{ top: '28px', right: '28px', zIndex: 9 }} />

      <CreatorBubble src="/influ-fitness.png" label="💪 ออกกำลัง" size={58}
        borderColor="rgba(34,197,94,0.6)"
        style={{ bottom: '60px', right: '-4px', zIndex: 9 }} />

      {/* ── Coins ── */}
      {[
        { style: { top: '30px', left: '110px' }, rotate: '-20deg', size: '1.5rem' },
        { style: { top: '60px', right: '55px' }, rotate: '15deg', size: '1.2rem' },
        { style: { top: '145px', left: '12px' }, rotate: '-30deg', size: '1rem' },
        { style: { bottom: '120px', right: '35px' }, rotate: '20deg', size: '1.4rem' },
        { style: { bottom: '50px', left: '115px' }, rotate: '-8deg', size: '1.1rem' },
      ].map((c, i) => (
        <span key={i} className="absolute pointer-events-none select-none"
          style={{ ...c.style, zIndex: 15, fontSize: c.size, transform: `rotateZ(${c.rotate})`, filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>
          🪙
        </span>
      ))}

      {/* ── Main composite image ── */}
      <div className="absolute z-[10]"
        style={{ left: '50%', top: '50%', transform: 'translate(-46%, -48%)', width: '88%' }}>
        <Image
          src="/hero-composite.png"
          alt="Creator monetization dashboard"
          width={540} height={540}
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 24px 60px rgba(123,97,255,0.25)) drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
          priority
        />
      </div>

    </div>
  )
}

/* ──── Reusable small components ──── */

function SmallCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="absolute rounded-xl backdrop-blur-md"
      style={{
        ...style,
        padding: '8px 12px',
        background: 'rgba(22,22,42,0.85)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
      {children}
    </div>
  )
}

function CreatorBubble({ src, label, size, borderColor, style }: {
  src: string; label: string; size: number; borderColor: string; style?: React.CSSProperties
}) {
  return (
    <div className="absolute" style={style}>
      <div className="relative">
        <div className="rounded-full overflow-hidden"
          style={{ width: size, height: size, border: `2.5px solid ${borderColor}`, boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)` }}>
          <Image src={src} alt={label} width={size} height={size} className="w-full h-full object-cover object-top" />
        </div>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
          style={{ fontSize: '7px', background: 'rgba(22,22,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

function YTIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white" />
    </svg>
  )
}

function IGIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig3" x1="0" y1="24" x2="24" y2="0">
          <stop stopColor="#FFDC80" /><stop offset="0.5" stopColor="#F77737" /><stop offset="1" stopColor="#C13584" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig3)" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="7" r="1" fill="white" />
    </svg>
  )
}

function TTIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="black" />
      <path d="M16.5 6.5c-.6-.5-1-1.3-1-2.2h-2.2v10.4a2.1 2.1 0 1 1-1.4-2v-2.2a4.3 4.3 0 1 0 3.6 4.2V9.4c.8.5 1.7.8 2.7.8V8a3.6 3.6 0 0 1-1.7-1.5z" fill="white" />
    </svg>
  )
}
