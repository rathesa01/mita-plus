import { COLORS } from '@/lib/tokens'

interface SectionLabelProps {
  n: string
  label: string
}

export function SectionLabel({ n, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="flex items-center justify-center shrink-0 font-black text-[10px]"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          color: COLORS.textSecondary,
        }}
      >
        {n}
      </span>
      <span
        className="font-semibold uppercase tracking-widest"
        style={{ fontSize: '11px', color: 'rgba(156,163,175,0.7)', letterSpacing: '0.1em' }}
      >
        {label}
      </span>
    </div>
  )
}
