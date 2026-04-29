'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MitaLogo from '@/app/components/MitaLogo'
import { COLORS, RADIUS } from '@/lib/design-tokens'

export function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkStyle: React.CSSProperties = {
    fontSize: '12px',
    color: COLORS.text.primary,
    textDecoration: 'none',
    transition: 'opacity 0.15s',
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
            style={{ alignItems: 'center', gap: '22px' }}
          >
            <Link href="#how-it-works" style={linkStyle}>how it works</Link>
            <Link href="/pricing" style={linkStyle}>pricing</Link>
            <Link href="/login" style={linkStyle}>เข้าสู่ระบบ</Link>

            <Link
              href="/audit"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: COLORS.text.inverse,
                background: COLORS.text.primary,
                padding: '8px 18px',
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

          {/* Mobile hamburger — className controls visibility, NO display in inline style */}
          <button
            type="button"
            className="flex md:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              flexDirection: 'column',
              gap: '4px',
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
                  transition: 'opacity 0.15s',
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            zIndex: 49,
            background: 'rgba(255,250,245,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${COLORS.border}`,
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {[
            { href: '#how-it-works', label: 'how it works' },
            { href: '/pricing',      label: 'pricing' },
            { href: '/login',        label: 'เข้าสู่ระบบ' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{ ...linkStyle, fontSize: '15px' }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/audit"
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: COLORS.text.inverse,
              background: COLORS.text.primary,
              padding: '13px 24px',
              borderRadius: RADIUS.pill,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            เริ่มฟรี →
          </Link>
        </div>
      )}
    </>
  )
}
