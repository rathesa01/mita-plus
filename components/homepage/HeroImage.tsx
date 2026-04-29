'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

// ── SmallCard chip — Apple near-black adapted for cream theme ─────────────────
// bg: rgba(18,18,36,→29,29,31) · shadow opacity: 0.25→0.15 · no layout change
function SmallCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-xl backdrop-blur-md"
      style={{
        ...style,
        padding: '8px 12px',
        background: 'rgba(29,29,31,0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
// z-index layer order (same as original HeroVisual):
//   3  — analytics cards (peek from behind main image)
//   4  — creator bubbles (slightly above cards, still behind image)
//   20 — main hero image
//   25 — SmallCard chips + coins (float in front of everything)
export function HeroImage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >

      {/* Soft glow — coral tint instead of purple for cream bg */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '60%', height: '60%', top: '20%', left: '20%',
          background: 'radial-gradient(circle, rgba(216,90,48,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── Analytics card LEFT (TikTok) — z:3, peeks behind image ──────── */}
      <div
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: '110px', top: '14%', left: '0px',
          transform: 'rotateZ(-5deg)',
          zIndex: 3, opacity: 0.85,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          background: 'rgba(29,29,31,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
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
          {([['Followers','52.3K','#7B61FF'],['Views','1.2M','#FF9F1C'],['Eng.','3.2%','#22c55e']] as const).map(([l,v,c]) => (
            <div key={l} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              <p className="font-bold" style={{ fontSize: '9px', color: c }}>{v}</p>
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

      {/* ── Analytics card RIGHT (Instagram) — z:3 ───────────────────────── */}
      <div
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: '108px', top: '10%', right: '0px',
          transform: 'rotateZ(5deg)',
          zIndex: 3, opacity: 0.85,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          background: 'rgba(29,29,31,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
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
            {([['Reach','89K'],['Saves','2.4K']] as const).map(([l,v]) => (
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

      {/* ── Creator bubble — Cooking — z:4 ───────────────────────────────── */}
      <div className="absolute" style={{ top: '12%', left: '2px', zIndex: 4, opacity: 0.70, transform: 'scale(0.85)', transformOrigin: 'left top' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(255,159,28,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Image src="/influ-cooking.png" alt="Food creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: 'rgba(29,29,31,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            🍳 ทำอาหาร
          </span>
        </div>
      </div>

      {/* ── Creator bubble — Lifestyle — z:4 ─────────────────────────────── */}
      <div className="absolute" style={{ top: '6%', right: '5px', zIndex: 4, opacity: 0.70, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(123,97,255,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Image src="/influ-lifestyle.png" alt="Lifestyle creator" width={48} height={48} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: 'rgba(29,29,31,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ☕ ไลฟ์สไตล์
          </span>
        </div>
      </div>

      {/* ── Creator bubble — Fitness — z:4 ───────────────────────────────── */}
      <div className="absolute" style={{ top: '58%', right: '3px', zIndex: 4, opacity: 0.70, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(34,197,94,0.5)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Image src="/influ-fitness.png" alt="Fitness creator" width={56} height={56} className="w-full h-full object-cover object-top" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-bold whitespace-nowrap rounded-full px-2 py-0.5"
            style={{ fontSize: '7px', background: 'rgba(29,29,31,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            💪 ออกกำลัง
          </span>
        </div>
      </div>

      {/* ── Main image — z:20 (above cards & bubbles, below chips) ────────── */}
      <div className="relative w-full" style={{ zIndex: 20 }}>
        <Image
          src="/hero-composite.png"
          alt="Creator using MITA+ to track revenue"
          width={1024}
          height={1024}
          priority
          unoptimized
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* ── SmallCard — PROFIT +200% — z:25 ──────────────────────────────── */}
      <SmallCard style={{ top: '22%', left: '-5px', transform: 'rotateZ(-5deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>PROFIT</p>
        <p className="font-extrabold" style={{ fontSize: '18px', color: '#22c55e', lineHeight: 1 }}>+200%</p>
      </SmallCard>

      {/* ── SmallCard — เงินที่หายไป — z:25 ──────────────────────────────── */}
      <SmallCard style={{ top: '50%', left: '8px', transform: 'rotateZ(-3deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,77,79,0.85)', marginBottom: '2px' }}>เงินที่หายไป</p>
        <p className="font-black" style={{ fontSize: '16px', color: '#FF4D4F', lineHeight: 1 }}>-฿28,500</p>
        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>/เดือน</p>
      </SmallCard>

      {/* ── SmallCard — SALES +400% — z:25 ───────────────────────────────── */}
      <SmallCard style={{ top: '52%', right: '5px', transform: 'rotateZ(4deg)', zIndex: 25 }}>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>SALES</p>
        <p className="font-bold" style={{ fontSize: '16px', color: '#22c55e', lineHeight: 1 }}>+400%</p>
      </SmallCard>

      {/* ── Coins — z:25 ─────────────────────────────────────────────────── */}
      <span className="absolute pointer-events-none select-none"
        style={{ top: '8%', left: '22%', zIndex: 25, fontSize: '1.1rem', transform: 'rotateZ(-18deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>🪙</span>
      <span className="absolute pointer-events-none select-none"
        style={{ top: '62%', right: '16%', zIndex: 25, fontSize: '1rem', transform: 'rotateZ(14deg)', filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.5))' }}>🪙</span>

    </motion.div>
  )
}
