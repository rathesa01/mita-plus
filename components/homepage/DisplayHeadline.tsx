import { COLORS } from '@/lib/design-tokens'

interface DisplayHeadlineProps {
  lines: string[]
  accentLine?: number   // index of line with coral accent (default: last line)
}

export function DisplayHeadline({ lines, accentLine }: DisplayHeadlineProps) {
  const accentIdx = accentLine ?? lines.length - 1

  return (
    <h1
      style={{
        margin: 0,
        color: COLORS.text.primary,
        fontSize: 'clamp(28px, 4.5vw, 40px)',
        lineHeight: '1.05',
        fontWeight: 600,
        letterSpacing: 'clamp(-0.8px, -0.15vw, -1.2px)',
      }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            color: i === accentIdx ? COLORS.brand.coral : COLORS.text.primary,
          }}
        >
          {line}
        </span>
      ))}
    </h1>
  )
}
