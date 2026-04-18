// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Init inside try — env vars not available at module eval during build
    const secretKey = process.env.STRIPE_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('[create-checkout] env check:', {
      hasStripeKey: !!secretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
    })

    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_KEY is not set')

    const stripe = new Stripe(secretKey, { apiVersion: '2026-03-25.dahlia' })
    const supabaseAdmin = createClient(supabaseUrl, serviceKey)
    const { priceId, userId, email, plan } = await req.json()

    if (!priceId || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_uid: userId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mitaplus.com'

    const session = await (stripe.checkout.sessions.create as any)({
      customer: customerId,
      mode: 'subscription',
      automatic_payment_methods: { enabled: true },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        supabase_uid: userId,
        plan: plan ?? 'starter',
      },
      subscription_data: {
        metadata: {
          supabase_uid: userId,
          plan: plan ?? 'starter',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe create-checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
