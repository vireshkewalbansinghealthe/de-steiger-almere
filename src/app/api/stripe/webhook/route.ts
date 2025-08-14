import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const reservationId = paymentIntent.metadata.reservation_id

        if (reservationId) {
          // Update reservation status
          const { error } = await supabase
            .from('reservations')
            .update({
              payment_status: 'paid',
              paid_at: new Date().toISOString(),
              status: 'confirmed',
            })
            .eq('id', reservationId)

          if (error) {
            console.error('Failed to update reservation:', error)
          } else {
            console.log(`Reservation ${reservationId} confirmed and paid`)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const reservationId = paymentIntent.metadata.reservation_id

        if (reservationId) {
          // Update reservation status
          const { error } = await supabase
            .from('reservations')
            .update({
              payment_status: 'failed',
            })
            .eq('id', reservationId)

          if (error) {
            console.error('Failed to update reservation:', error)
          } else {
            console.log(`Reservation ${reservationId} payment failed`)
          }
        }
        break
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        console.log(`New Stripe customer created: ${customer.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
