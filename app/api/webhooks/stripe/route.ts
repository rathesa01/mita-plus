import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // ✅ Payment success → activate plan
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const uid = session.metadata?.supabase_uid
        const plan = (session.metadata?.plan ?? 'starter') as 'starter' | 'pro'

        if (uid) {
          await supabaseAdmin.from('user_profiles').update({
            plan,
            approved_at: new Date().toISOString(),
            stripe_customer_id: session.customer as string,
          }).eq('id', uid)
          console.log(`✅ Plan activated: ${uid} → ${plan}`)
        }
        break
      }

      // ✅ Subscription renewed
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const uid = sub.metadata?.supabase_uid

        if (uid) {
          await supabaseAdmin.from('user_profiles').update({
            approved_at: new Date().toISOString(),
          }).eq('id', uid)
          console.log(`✅ Subscription renewed: ${uid}`)
        }
        break
      }

      // ❌ Payment failed / subscription cancelled → revoke plan
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const uid = sub.metadata?.supabase_uid

        if (uid) {
          await supabaseAdmin.from('user_profiles').update({
            plan: 'none',
            approved_at: null,
          }).eq('id', uid)
          console.log(`❌ Subscription cancelled: ${uid}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const uid = sub.metadata?.supabase_uid
        console.warn(`⚠️ Payment failed for user: ${uid}`)
        // ยังไม่ revoke ทันที — รอ Stripe retry ก่อน
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
