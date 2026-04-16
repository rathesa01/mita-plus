import { SPACE } from '@/lib/tokens'

interface SectionWrapperProps {
  children: React.ReactNode
  id?: string
  className?: string
  noPadTop?: boolean
}

export function SectionWrapper({ children, id, className = '', noPadTop = false }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={className}
      style={{
        paddingLeft: SPACE.sm,
        paddingRight: SPACE.sm,
        paddingTop: noPadTop ? 0 : SPACE.lg,
        paddingBottom: SPACE.lg,
      }}
    >
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}
