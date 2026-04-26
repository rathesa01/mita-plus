// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
  )

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
    const obj = event.data.object as any

    switch (event.type) {

      // ✅ One-time payment หรือ subscription สำเร็จ → activate plan 30 วัน
      case 'checkout.session.completed': {
        const uid = obj.metadata?.supabase_uid
        const plan = (obj.metadata?.plan ?? 'starter') as 'starter' | 'pro'

        if (uid) {
          // plan_expires_at = วันนี้ + 30 วัน
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          await supabaseAdmin.from('user_profiles').update({
            plan,
            approved_at: new Date().toISOString(),
            plan_expires_at: expiresAt.toISOString(),
            stripe_customer_id: obj.customer,
          }).eq('id', uid)

          console.log(`✅ Plan activated: ${uid} → ${plan} (expires: ${expiresAt.toISOString()})`)
        }
        break
      }

      // ✅ Subscription renewed (legacy — เผื่อมี subscription เก่า)
      case 'invoice.payment_succeeded': {
        const subId = obj.subscription ?? obj.parent?.subscription_details?.subscription
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          const uid = sub.metadata?.supabase_uid
          if (uid) {
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            await supabaseAdmin.from('user_profiles').update({
              approved_at: new Date().toISOString(),
              plan_expires_at: expiresAt.toISOString(),
            }).eq('id', uid)

            console.log(`✅ Subscription renewed: ${uid}`)
          }
        }
        break
      }

      // ❌ Subscription cancelled → revoke (legacy)
      case 'customer.subscription.deleted': {
        const uid = obj.metadata?.supabase_uid
        if (uid) {
          await supabaseAdmin.from('user_profiles').update({
            plan: 'none',
            approved_at: null,
            plan_expires_at: null,
          }).eq('id', uid)
          console.log(`❌ Subscription cancelled: ${uid}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const subId = obj.subscription ?? obj.parent?.subscription_details?.subscription
        console.warn(`⚠️ Payment failed for subscription: ${subId}`)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
