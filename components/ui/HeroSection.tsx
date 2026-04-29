'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section
      style={{ background: '#faf9f6', minHeight: '100svh' }}
      className="flex flex-col"
    >
      {/* ── Mobile/Desktop layout ── */}
      <div className="relative flex-1 max-w-6xl mx-auto w-full px-5
                      flex flex-col
                      lg:flex-row lg:items-center lg:gap-14
                      pt-24 pb-10 lg:pt-0 lg:min-h-[100svh]">

        {/* ─────────── TEXT BLOCK ─────────── */}
        <div className="lg:w-[44%] flex flex-col items-start order-1 lg:order-1">

          {/* Tag pill */}
          <div
            className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.35)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400e' }}>
              วิเคราะห์รายได้ creator
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black leading-[1.2] mb-4"
            style={{ fontSize: 'clamp(2rem, 6.5vw, 3.6rem)', color: '#0d0d0d' }}
          >
            follower กับ view<br />
            ของคุณ ทำเงินได้<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #f97316 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              เท่าไหร่จริงๆ?
            </span>
          </h1>

          {/* Sub — desktop only (above image) */}
          <p
            className="hidden lg:block mb-7"
            style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.42)', lineHeight: 1.65 }}
          >
            กรอกตัวเลขแค่ 3 อย่าง รู้ผลใน 3 นาที
          </p>

          {/* CTA — desktop */}
          <div className="hidden lg:flex flex-col gap-3 w-full">
            <Link href="/audit">
              <button
                className="h-14 px-8 rounded-full font-black text-base transition-all
                           hover:opacity-85 active:scale-95 w-full sm:w-auto"
                style={{ background: '#0d0d0d', color: '#fff', fontSize: '16px' }}
              >
                เริ่มฟรี · 3 นาที →
              </button>
            </Link>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(0,0,0,0.38)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
                  style={{ boxShadow: '0 0 6px #22c55e' }} />
                ฟรี · ไม่ต้องสมัคร
              </span>
              <span>|</span>
              <Link href="/pricing" style={{ color: '#f97316', textDecoration: 'underline' }}>
                ดูแพ็คเกจ →
              </Link>
            </div>

            {/* Stats — desktop */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-black/[0.06]">
              {[
                { n: '฿40K+', label: 'ศักยภาพรายได้/เดือน', sub: 'ตาม benchmark อุตสาหกรรม' },
                { n: '3 นาที', label: 'ได้ผลวิเคราะห์', sub: 'ไม่ต้องรอ' },
                { n: '100%', label: 'ฟรี', sub: 'ไม่มีเงื่อนไข' },
              ].map((s) => (
                <div key={s.n}>
                  <p className="font-black text-xl" style={{ color: '#0d0d0d' }}>{s.n}</p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.28)' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────── VISUAL BLOCK ─────────── */}
        <div className="lg:w-[56%] order-2 w-full my-6 lg:my-0">
          <HeroVisual />
        </div>

        {/* ─────────── MOBILE: sub + CTA + stats ─────────── */}
        <div className="lg:hidden order-3 flex flex-col gap-4 w-full">

          {/* Sub */}
          <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.42)', lineHeight: 1.65 }}>
            กรอกตัวเลขแค่ 3 อย่าง รู้ผลใน 3 นาที
          </p>

          {/* CTA */}
          <Link href="/audit" className="w-full">
            <button
              className="w-full h-14 rounded-full font-black text-base transition-all active:scale-95"
              style={{ background: '#0d0d0d', color: '#fff', fontSize: '16px' }}
            >
              เริ่มฟรี · 3 นาที →
            </button>
          </Link>

          {/* Trust */}
          <div className="flex items-center justify-center gap-3 text-xs" style={{ color: 'rgba(0,0,0,0.38)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
                style={{ boxShadow: '0 0 5px #22c55e' }} />
              ฟรี · ไม่ต้องสมัคร
            </span>
            <span>|</span>
            <Link href="/pricing" style={{ color: 'rgba(0,0,0,0.5)', textDecoration: 'underline' }}>
              ดูแพ็คเกจ
            </Link>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-2 mt-1 pt-4"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            {[
              { n: '฿40K+', label: 'ศักยภาพรายได้', sub: 'ตาม benchmark' },
              { n: '3 นาที', label: 'ได้ผลวิเคราะห์', sub: 'ไม่ต้องรอ' },
              { n: '100%', label: 'ฟรี', sub: 'ไม่มีเงื่อนไข' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <p className="font-black" style={{ fontSize: '20px', color: '#0d0d0d' }}>{s.n}</p>
                <p style={{ fontSize: '10px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.3 }}>{s.label}</p>
                <p style={{ fontSize: '9px', color: 'rgba(0,0,0,0.28)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */
/*  HeroVisual — รูปภาพ + floating cards เหมือนเดิม           */
/* ─────────────────────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: '460px' }}>

      {/* Soft glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '60%', height: '60%', top: '20%', left: '20%',
          background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Analytics card LEFT (TikTok) */}
      <div
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: '110px', top: '14%', left: '0px',
          transform: 'rotateZ(-5deg)',
          zIndex: 3, opacity: 0.7,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          background: '#16162a', border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
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

      {/* Analytics card RIGHT (Instagram) */}
      <div
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: '108px', top: '10%', right: '0px',
          transform: 'rotateZ(5deg)',
          zIndex: 3, opacity: 0.7,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          background: '#16162a', border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
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

      {/* Creator bubbles */}
      <div className="absolute" style={{ top: '12%', left: '2px', zIndex: 4, opacity: 0.55, transform: 'scale(0.85)', transformOrigin: 'left top' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(255,159,28,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Image src="/influ-cooking.png" alt="Food creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            🍳 ทำอาหาร
          </span>
        </div>
      </div>

      <div className="absolute" style={{ top: '6%', right: '5px', zIndex: 4, opacity: 0.55, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(123,97,255,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Image src="/influ-lifestyle.png" alt="Lifestyle creator" width={48} height={48} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            ☕ ไลฟ์สไตล์
          </span>
        </div>
      </div>

      <div className="absolute" style={{ top: '58%', right: '3px', zIndex: 4, opacity: 0.55, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(34,197,94,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Image src="/influ-fitness.png" alt="Fitness creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            💪 ออกกำลัง
          </span>
        </div>
      </div>

      {/* Floating chips */}
      <SmallCard style={{ top: '22%', left: '-5px', transform: 'rotateZ(-5deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>PROFIT</p>
        <p className="font-extrabold" style={{ fontSize: '18px', color: '#22c55e', lineHeight: 1 }}>+200%</p>
      </SmallCard>

      <SmallCard style={{ top: '50%', left: '8px', transform: 'rotateZ(-3deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,77,79,0.85)', marginBottom: '2px' }}>เงินที่หายไป</p>
        <p className="font-black" style={{ fontSize: '16px', color: '#FF4D4F', lineHeight: 1 }}>-฿28,500</p>
        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>/เดือน</p>
      </SmallCard>

      <SmallCard style={{ top: '52%', right: '5px', transform: 'rotateZ(4deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>SALES</p>
        <p className="font-bold" style={{ fontSize: '16px', color: '#22c55e', lineHeight: 1 }}>+400%</p>
      </SmallCard>

      {/* Main image */}
      <div className="relative z-[20] w-full">
        <Image
          src="/hero-composite.png"
          alt="Creator monetization"
          width={480} height={480}
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.15)) drop-shadow(0 4px 20px rgba(123,97,255,0.15))' }}
          priority
        />
      </div>

      {/* Coins */}
      <span className="absolute pointer-events-none select-none"
        style={{ top: '8%', left: '22%', zIndex: 25, fontSize: '1.1rem', transform: 'rotateZ(-18deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>🪙</span>
      <span className="absolute pointer-events-none select-none"
        style={{ top: '62%', right: '16%', zIndex: 25, fontSize: '1rem', transform: 'rotateZ(14deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>🪙</span>
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
        boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
      {children}
    </div>
  )
}
