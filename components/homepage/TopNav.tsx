'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import MitaLogo from '@/app/components/MitaLogo'
import { COLORS, RADIUS } from '@/lib/design-tokens'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'วิธีใช้งาน' },
  { href: '/pricing',      label: 'แพ็คเกจ' },
  { href: '/login',        label: 'เข้าสู่ระบบ' },
]

export function TopNav() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const linkStyle: React.CSSProperties = {
    fontSize: '13px',
    color: COLORS.text.primary,
    textDecoration: 'none',
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
  }

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: scrolled ? 'rgba(255,250,245,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: `1px solid ${scrolled ? COLORS.border : 'transparent'}`,
          transition: 'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 32px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <MitaLogo size="sm" />
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden md:flex"
            style={{ alignItems: 'center', gap: '28px' }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={linkStyle}>{label}</Link>
            ))}

            <Link
              href="/audit"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: COLORS.text.inverse,
                background: COLORS.text.primary,
                padding: '8px 20px',
                borderRadius: RADIUS.pill,
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              เริ่มฟรี
            </Link>
          </div>

          {/* Mobile hamburger — NO display in inline style (Tailwind handles it) */}
          <button
            type="button"
            className="flex md:hidden"
            aria-label="เปิดเมนู"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '18px',
                  height: '1.5px',
                  background: COLORS.text.primary,
                  borderRadius: '2px',
                  transition: 'opacity 0.15s, transform 0.2s',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                  transform: menuOpen && i === 0 ? 'translateY(6.5px) rotate(45deg)' :
                             menuOpen && i === 2 ? 'translateY(-6.5px) rotate(-45deg)' :
                             'none',
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer with framer-motion ─────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 48,
                background: 'rgba(0,0,0,0.30)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />

            {/* Drawer panel — slides in from right */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 49,
                width: 'min(300px, 82vw)',
                background: 'rgba(255,250,245,0.97)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
                display: 'flex',
                flexDirection: 'column',
                padding: '80px 28px 36px',
                gap: '4px',
              }}
            >
              {/* Close × */}
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="ปิดเมนู"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: COLORS.text.secondary,
                  lineHeight: 1,
                  padding: '6px',
                }}
              >
                ✕
              </button>

              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: '16px',
                    color: COLORS.text.primary,
                    textDecoration: 'none',
                    padding: '15px 0',
                    borderBottom: `1px solid ${COLORS.border}`,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/audit"
                onClick={() => setMenuOpen(false)}
                style={{
                  marginTop: '20px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: COLORS.text.inverse,
                  background: COLORS.text.primary,
                  padding: '14px 24px',
                  borderRadius: RADIUS.pill,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                เริ่มฟรี →
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
