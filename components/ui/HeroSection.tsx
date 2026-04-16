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

      {/* ΓöÇΓöÇ MOBILE layout: text ΓåÆ visual (all in 1 screen) ΓöÇΓöÇ */}
      {/* ΓöÇΓöÇ DESKTOP layout: text left | visual right ΓöÇΓöÇ */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 flex flex-col lg:flex-row lg:items-center lg:gap-12 lg:min-h-[100svh] lg:py-0 pt-20 pb-6">

        {/* ΓöÇΓöÇ TEXT BLOCK ΓöÇΓöÇ */}
        <div className="lg:w-[46%] flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 mt-6 lg:mt-0">

          {/* Label */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
            style={{ background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#a78bfa' }}>
              α╕¬α╕│α╕½α╕úα╕▒α╕Ü Creator α╕ùα╕╕α╕üα╕èα╣êα╕¡α╕çα╕ùα╕▓α╕ç
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-black leading-[1.1] tracking-tight mb-3"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 3.4rem)' }}>
            <span className="text-white">Follower α╣üα╕Ñα╕░ View<br />α╕éα╕¡α╕çα╕äα╕╕α╕ô α╕ùα╕│α╣Çα╕çα╕┤α╕Öα╣äα╕öα╣ë</span>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #7B61FF 0%, #FF9F1C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              α╣Çα╕ùα╣êα╕▓α╣äα╕½α╕úα╣êα╕êα╕úα╕┤α╕çα╣å?
            </span>
          </h1>

          {/* Sub */}
          <p className="text-sm mb-5 max-w-xs mx-auto lg:mx-0 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            α╕üα╕úα╕¡α╕üα╕òα╕▒α╕ºα╣Çα╕Ñα╕éα╣üα╕äα╣ê 3 α╕¡α╕óα╣êα╕▓α╕ç ΓÇö α╣üα╕Ñα╣ëα╕ºα╕úα╕╣α╣ëα╣Çα╕Ñα╕óα╕ºα╣êα╕▓α╣Çα╕çα╕┤α╕Öα╕½α╕▓α╕óα╣äα╕¢α╕ùα╕╡α╣êα╣äα╕½α╕Ö
            α╣üα╕Ñα╕░α╕òα╣ëα╕¡α╕çα╣Çα╕úα╕┤α╣êα╕íα╕êα╕▓α╕üα╕òα╕úα╕çα╣äα╕½α╕Öα╕üα╣êα╕¡α╕Ö
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Link href="/audit" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-black transition-all hover:scale-105 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7B61FF, #FF9F1C)',
                  color: '#fff',
                  boxShadow: '0 0 28px rgba(123,97,255,0.35)',
                }}
              >
                α╣Çα╕èα╣çα╕üα╕òα╕▒α╕ºα╣Çα╕Ñα╕éα╕éα╕¡α╕çα╕ëα╕▒α╕Ö ΓåÆ
              </button>
            </Link>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ boxShadow: '0 0 6px #22c55e' }} />
              α╕ƒα╕úα╕╡ 100% ┬╖ α╣äα╕íα╣êα╕òα╣ëα╕¡α╕çα╕¬α╕íα╕▒α╕äα╕ú
            </p>
          </div>

          {/* Stats ΓÇö desktop only */}
          <div className="hidden lg:flex gap-8 mt-10">
            {[
              { n: 'α╕┐40K+', label: 'α╕úα╕▓α╕óα╣äα╕öα╣ëα╕ùα╕╡α╣êα╕½α╕▓α╕ó/α╣Çα╕öα╕╖α╕¡α╕Ö' },
              { n: '3 α╕Öα╕▓α╕ùα╕╡', label: 'α╣äα╕öα╣ëα╕£α╕Ñα╕ºα╕┤α╣Çα╕äα╕úα╕▓α╕░α╕½α╣î' },
              { n: '100%', label: 'α╕ƒα╕úα╕╡ α╣äα╕íα╣êα╕íα╕╡α╣Çα╕çα╕╖α╣êα╕¡α╕Öα╣äα╕é' },
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

        {/* ΓöÇΓöÇ VISUAL BLOCK ΓöÇΓöÇ */}
        <div className="lg:w-[54%] order-1 lg:order-2 flex items-center justify-center">
          <HeroVisual />
        </div>

      </div>
    </section>
  )
}

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
/*  Hero Visual                        */
/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
function HeroVisual() {
  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: '480px' }}>

      {/* Soft glow */}
      <div className="absolute pointer-events-none"
        style={{ inset: '10%', background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%' }} />

      {/* ΓöÇΓöÇ Main image ΓöÇΓöÇ */}
      <Image
        src="/hero-composite.png"
        alt="Creator monetization"
        width={480} height={480}
        className="relative z-10 w-full h-auto"
        style={{ filter: 'drop-shadow(0 24px 56px rgba(123,97,255,0.28)) drop-shadow(0 4px 24px rgba(0,0,0,0.55))' }}
        priority
      />

      {/* ΓöÇΓöÇ Floating chips (3 only ΓÇö clean) ΓöÇΓöÇ */}
      <SmallCard style={{ top: '6%', left: '-2%', transform: 'rotateZ(-7deg)', zIndex: 20 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>PROFIT</p>
        <p className="font-extrabold" style={{ fontSize: '18px', color: '#22c55e', lineHeight: 1 }}>+200%</p>
      </SmallCard>

      <SmallCard style={{ top: '5%', right: '-2%', transform: 'rotateZ(6deg)', zIndex: 20 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,77,79,0.85)', marginBottom: '2px' }}>α╣Çα╕çα╕┤α╕Öα╕ùα╕╡α╣êα╕½α╕▓α╕óα╣äα╕¢</p>
        <p className="font-black" style={{ fontSize: '16px', color: '#FF4D4F', lineHeight: 1 }}>-α╕┐28,500</p>
        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>/α╣Çα╕öα╕╖α╕¡α╕Ö</p>
      </SmallCard>

      <SmallCard style={{ bottom: '8%', left: '3%', transform: 'rotateZ(-4deg)', zIndex: 20 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>SALES</p>
        <p className="font-bold" style={{ fontSize: '16px', color: '#22c55e', lineHeight: 1 }}>+400%</p>
      </SmallCard>

      {/* ΓöÇΓöÇ 2 coins ΓöÇΓöÇ */}
      <span className="absolute pointer-events-none select-none"
        style={{ top: '18%', left: '10%', zIndex: 25, fontSize: '1.3rem', transform: 'rotateZ(-18deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>≡ƒ¬Ö</span>
      <span className="absolute pointer-events-none select-none"
        style={{ bottom: '16%', right: '6%', zIndex: 25, fontSize: '1.1rem', transform: 'rotateZ(14deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>≡ƒ¬Ö</span>
    </div>
  )
}

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
/*  Reusable                           */
/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
