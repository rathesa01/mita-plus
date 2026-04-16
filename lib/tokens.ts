// ══════════════════════════════════════════════
//  MITA+ Design Tokens
//  Single source of truth — ห้าม hardcode ใน components
// ══════════════════════════════════════════════

export const COLORS = {
  bg:            '#0B0B0F',
  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  accentPurple:  '#7B61FF',
  accentBlue:    '#3ECFFF',
  ctaOrange:     '#FF9F1C',
  danger:        '#FF4D4F',
  success:       '#22C55E',
} as const

export const SPACE = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
} as const

export const RADIUS = {
  card:   '16px',
  button: '16px',
} as const

// ── Glow shadows ──────────────────────────────
export const GLOW = {
  purple: '0 0 24px rgba(123,97,255,0.25)',
  blue:   '0 0 24px rgba(62,207,255,0.20)',
  orange: '0 0 24px rgba(255,159,28,0.25)',
  danger: '0 0 24px rgba(255,77,79,0.20)',
  green:  '0 0 24px rgba(34,197,94,0.20)',
} as const

// ── Card base styles ───────────────────────────
export const CARD = {
  base: {
    background: 'rgba(255,255,255,0.025)',
    border:     '1px solid rgba(255,255,255,0.07)',
    borderRadius: RADIUS.card,
  },
  danger: {
    background: 'rgba(255,77,79,0.06)',
    border:     '1px solid rgba(255,77,79,0.20)',
    borderRadius: RADIUS.card,
  },
  success: {
    background: 'rgba(34,197,94,0.06)',
    border:     '1px solid rgba(34,197,94,0.18)',
    borderRadius: RADIUS.card,
  },
  purple: {
    background: 'rgba(123,97,255,0.06)',
    border:     '1px solid rgba(123,97,255,0.20)',
    borderRadius: RADIUS.card,
  },
  orange: {
    background: 'rgba(255,159,28,0.06)',
    border:     '1px solid rgba(255,159,28,0.20)',
    borderRadius: RADIUS.card,
  },
} as const
