// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_KEY is not set')

    const stripe = new Stripe(secretKey, { apiVersion: '2026-03-25.dahlia' })
    const supabaseAdmin = createClient(supabaseUrl, serviceKey)
    const { priceId, userId, email, plan } = await req.json()

    if (!priceId || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create Stripe customer
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

    const origin = req.headers.get('origin') ?? 'https://www.mitaplus.com'

    // ── One-time payment: Card + PromptPay QR ──
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card', 'promptpay'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        supabase_uid: userId,
        plan: plan ?? 'starter',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe create-checkout error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
