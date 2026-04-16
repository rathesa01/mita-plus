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
      {/* ── BG: Hero composite image (faded, right side) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Gradient mask — fade image into BG on left */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, #13102b 0%, #13102b 30%, rgba(19,16,43,0.7) 55%, rgba(19,16,43,0.15) 100%)',
          zIndex: 2,
        }} />
        {/* Gradient mask — fade bottom */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, #080810 0%, transparent 40%)',
          zIndex: 2,
        }} />
        <Image
          src="/hero-composite.png"
          alt=""
          fill
          className="object-contain object-right"
          style={{ opacity: 0.28 }}
          priority
        />
      </div>

      {/* Ambient purple glow */}
      <div className="absolute pointer-events-none" style={{
        top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(123,97,255,0.2) 0%, transparent 65%)',
        filter: 'blur(40px)', zIndex: 1,
      }} />

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 flex flex-col justify-center min-h-[100svh] pt-20 pb-10">

        {/* Label */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 self-start"
          style={{ background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#a78bfa' }}>
            สำหรับ Creator ทุกช่องทาง
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-black leading-[1.08] tracking-tight mb-5"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', maxWidth: '640px' }}>
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
        <p className="text-sm sm:text-base mb-8 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '420px' }}>
          กรอกตัวเลขแค่ 3 อย่าง — แล้วรู้เลยว่าเงินหายไปที่ไหน
          และต้องเริ่มจากตรงไหนก่อน
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-12">
          <Link href="/audit">
            <button
              className="h-13 px-8 py-3.5 rounded-xl text-base font-black transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                color: '#fff',
                boxShadow: '0 0 32px rgba(123,97,255,0.4)',
              }}
            >
              เช็กตัวเลขของฉัน →
            </button>
          </Link>
          <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
              style={{ boxShadow: '0 0 6px #22c55e' }} />
            ฟรี 100% · ไม่ต้องสมัคร · ผลออกใน 3 นาที
          </p>
        </div>

        {/* Platform badges */}
        <div className="flex gap-2 flex-wrap">
          {[
            { icon: '🎵', name: 'TikTok',     color: 'rgba(255,255,255,0.08)' },
            { icon: '📸', name: 'Instagram',  color: 'rgba(193,53,132,0.12)'  },
            { icon: '▶️', name: 'YouTube',    color: 'rgba(255,0,0,0.10)'     },
            { icon: 'f',  name: 'Facebook',   color: 'rgba(24,119,242,0.12)'  },
          ].map((p) => (
            <span key={p.name}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: p.color, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
              <span>{p.icon}</span>{p.name}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex gap-8 mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { n: '฿40K+',   label: 'รายได้ที่หาย/เดือน'    },
            { n: '3 นาที',  label: 'ได้ผลวิเคราะห์'        },
            { n: '100%',    label: 'ฟรี ไม่มีเงื่อนไข'     },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-black text-lg sm:text-xl" style={{
                background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{s.n}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ── Floating chips ── */}
      <div className="absolute pointer-events-none" style={{ zIndex: 5 }}>
        <SmallCard style={{ top: '22%', right: '4%', transform: 'rotateZ(5deg)' }}>
          <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>PROFIT</p>
          <p className="font-extrabold" style={{ fontSize: '18px', color: '#22c55e', lineHeight: 1 }}>+200%</p>
        </SmallCard>

        <SmallCard style={{ top: '42%', right: '2%', transform: 'rotateZ(-4deg)' }}>
          <p style={{ fontSize: '8px', color: 'rgba(255,77,79,0.85)', marginBottom: '2px' }}>เงินที่หายไป</p>
          <p className="font-black" style={{ fontSize: '16px', color: '#FF4D4F', lineHeight: 1 }}>-฿28,500</p>
          <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>/เดือน</p>
        </SmallCard>

        <SmallCard style={{ bottom: '20%', right: '6%', transform: 'rotateZ(3deg)' }}>
          <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>SALES</p>
          <p className="font-bold" style={{ fontSize: '16px', color: '#22c55e', lineHeight: 1 }}>+400%</p>
        </SmallCard>
      </div>

    </section>
  )
}

function SmallCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="absolute rounded-xl backdrop-blur-md"
      style={{
        ...style,
        padding: '8px 14px',
        background: 'rgba(18,18,36,0.82)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
      {children}
    </div>
  )
}
