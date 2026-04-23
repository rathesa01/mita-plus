import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { data } = await supabase
    .from('audit_results')
    .select('score_total, input, revenue_estimation')
    .eq('id', params.id)
    .single()

  const score = data?.score_total ?? 0
  const name  = data?.input?.name ?? 'Creator'
  const gap   = Math.round(data?.revenue_estimation?.totalMissed ?? 0)
  const ogUrl = `https://mitaplus.com/api/og/${params.id}`

  return {
    title: `${name} — Score ${score}/100 | MITA+`,
    description: `Revenue Gap ฿${gap.toLocaleString('th-TH')}/เดือน วิเคราะห์ช่องของคุณฟรีที่ mitaplus.com`,
    openGraph: {
      title: `Monetization Score: ${score}/100`,
      description: `Revenue Gap -฿${gap.toLocaleString('th-TH')}/เดือน`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Monetization Score: ${score}/100 | MITA+`,
      description: `Revenue Gap -฿${gap.toLocaleString('th-TH')}/เดือน`,
      images: [ogUrl],
    },
  }
}
