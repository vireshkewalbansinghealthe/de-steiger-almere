import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = createClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update reservation status
        const { error: updateError } = await supabase
          .from('reservations')
          .update({ 
            status: 'paid',
            payment_confirmed_at: new Date().toISOString()
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating reservation:', updateError);
        }

        // Send confirmation email (you can implement this)
        await sendConfirmationEmail(paymentIntent);
        
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        // Update reservation status
        const { error: failError } = await supabase
          .from('reservations')
          .update({ status: 'payment_failed' })
          .eq('payment_intent_id', failedPayment.id);

        if (failError) {
          console.error('Error updating failed payment:', failError);
        }
        
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(paymentIntent: Stripe.PaymentIntent) {
  // Implement email sending logic here
  // You can use services like SendGrid, Mailgun, or AWS SES
  console.log('Sending confirmation email for payment:', paymentIntent.id);
}