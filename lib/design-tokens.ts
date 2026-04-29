// ── MITA+ Design Tokens — P-006 Apple-style warm palette ──────────────────
// Source: MANAO_PROMPTS.md P-006

export const COLORS = {
  bg: {
    primary:   '#FFFAF5',
    secondary: '#F5F5F7',
    accent:    '#FAECE7',
  },
  text: {
    primary:   '#1D1D1F',
    secondary: '#6B6B6B',
    tertiary:  '#999999',
    inverse:   '#FFFFFF',
    accent:    '#D85A30',
    onAccent:  '#993C1D',
  },
  brand: {
    coral:     '#D85A30',
    coralBg:   '#FAECE7',
    coralText: '#993C1D',
    purple:    '#7F77DD',
    success:   '#1D9E75',
  },
  border: 'rgba(0,0,0,0.08)',
}

export const TYPOGRAPHY = {
  fontFamily: 'Inter, -apple-system, "SF Pro Text", system-ui, sans-serif',
  hero: {
    size: '40px', lineHeight: '1.05', weight: 600,
    letterSpacing: '-1.2px',
  },
  heroMobile: {
    size: '28px', lineHeight: '1.1', weight: 600,
    letterSpacing: '-0.8px',
  },
  body:  { size: '15px', lineHeight: '1.5',  weight: 400 },
  small: { size: '12px', lineHeight: '1.4',  weight: 400 },
  micro: {
    size: '10px', lineHeight: '1.4', weight: 500,
    letterSpacing: '1px', textTransform: 'uppercase' as const,
  },
  statNumber: { size: '28px', weight: 600, letterSpacing: '-0.8px' },
  statLabel:  { size: '11px', weight: 400 },
}

export const RADIUS = {
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  pill: '100px',
}

export const SHADOW = {
  card:  '0 1px 3px rgba(0,0,0,0.06)',
  float: '0 4px 12px rgba(0,0,0,0.10)',
}
