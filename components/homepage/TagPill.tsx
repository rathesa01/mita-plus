import { COLORS, RADIUS } from '@/lib/design-tokens'

interface TagPillProps {
  text: string
}

export function TagPill({ text }: TagPillProps) {
  return (
    <span
      aria-label={text}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: COLORS.bg.accent,
        color: COLORS.text.onAccent,
        padding: '5px 11px',
        borderRadius: RADIUS.pill,
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.1px',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: COLORS.brand.coral,
          flexShrink: 0,
        }}
      />
      {text}
    </span>
  )
}
