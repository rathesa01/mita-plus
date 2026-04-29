import { COLORS, RADIUS } from '@/lib/design-tokens'

interface PrimaryButtonProps {
  children: React.ReactNode
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

export function PrimaryButton({ children, fullWidth, type = 'button' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.text.primary,
        color: COLORS.text.inverse,
        padding: '13px 24px',
        borderRadius: RADIUS.pill,
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '-0.2px',
        border: 'none',
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'opacity 0.15s ease',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      onFocus={e => (e.currentTarget.style.outline = `2px solid ${COLORS.brand.coral}`)}
      onBlur={e => (e.currentTarget.style.outline = 'none')}
    >
      {children}
    </button>
  )
}
