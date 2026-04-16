'use client'
import { ArrowRight } from 'lucide-react'
import { COLORS, RADIUS, GLOW } from '@/lib/tokens'

interface CTAButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  showArrow?: boolean
  className?: string
  disabled?: boolean
}

export function CTAButton({
  label,
  onClick,
  variant = 'primary',
  showArrow = true,
  className = '',
  disabled = false,
}: CTAButtonProps) {
  const base: React.CSSProperties = {
    width: '100%',
    height: '56px',
    borderRadius: RADIUS.button,
    fontWeight: 900,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'opacity 0.15s, transform 0.15s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    outline: 'none',
  }

  const styles: Record<string, React.CSSProperties> = {
    primary: {
      ...base,
      background: COLORS.ctaOrange,
      color: '#000000',
      boxShadow: GLOW.orange,
    },
    secondary: {
      ...base,
      background: 'transparent',
      color: COLORS.textPrimary,
      border: `1px solid rgba(255,255,255,0.15)`,
    },
    ghost: {
      ...base,
      background: 'transparent',
      color: COLORS.textSecondary,
      border: `1px solid rgba(255,255,255,0.08)`,
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={styles[variant]}
      className={`active:scale-[0.98] hover:opacity-90 ${className}`}
    >
      {label}
      {showArrow && <ArrowRight size={16} />}
    </button>
  )
}
