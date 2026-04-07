import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendReservationConfirmationEmails } from '@/lib/email';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Evaluate env variables INSIDE the function to ensure they are read at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseKey = serviceRoleKey && serviceRoleKey.length > 50 ? serviceRoleKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!serviceRoleKey || serviceRoleKey.length < 50) {
    console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing or invalid in the runtime environment. Webhook is using ANON key. RLS policies will likely block database updates!');
  } else {
    console.log('✅ Using Service Role Key for webhook database operations.');
  }

  // Use service role key to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find reservation
        const { data: reservation, error: findError } = await supabase
          .from('reservations')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (findError || !reservation) {
          console.error('Reservation not found for payment intent:', paymentIntent.id);
          return NextResponse.json({ received: true });
        }

        // Update reservation
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            status: 'reservation_paid',
            payment_status: 'completed',
            paid_at: now,
            contract_signed_at: now, // Mark contract as signed when payment succeeds
          })
          .eq('id', reservation.id);

        if (updateError) {
          console.error('Error updating reservation:', updateError);
        }

        // Update property status
        await supabase
          .from('properties')
          .update({ status: 'reserved' })
          .eq('id', reservation.property_id);

        // Remove payment lock
        await supabase
          .from('payment_locks')
          .delete()
          .eq('property_id', reservation.property_id);

        console.log('✅ Payment succeeded for reservation:', reservation.reservation_number);
        
        // Fetch full property details for the email
        const { data: propertyData } = await supabase
          .from('properties')
          .select('*')
          .eq('id', reservation.property_id)
          .single();

        if (propertyData) {
          try {
            await sendReservationConfirmationEmails(reservation, propertyData);
            console.log('✅ Confirmation email triggered for:', reservation.customer_email);
          } catch (emailErr) {
            console.error('⚠️ Email sending failed (non-blocking):', emailErr);
          }
        } else {
          console.error('❌ Could not send confirmation email: property details not found');
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find reservation
        const { data: reservation } = await supabase
          .from('reservations')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (reservation) {
          // Update reservation status
          await supabase
            .from('reservations')
            .update({
              payment_status: 'failed',
              notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
            })
            .eq('id', reservation.id);

          // Remove payment lock
          await supabase
            .from('payment_locks')
            .delete()
            .eq('property_id', reservation.property_id);
          
          console.log('❌ Payment failed for reservation:', reservation.reservation_number);
        }
        
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find reservation
        const { data: reservation } = await supabase
          .from('reservations')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (reservation) {
          // Update reservation status
          await supabase
            .from('reservations')
            .update({
              status: 'cancelled',
              payment_status: 'cancelled',
            })
            .eq('id', reservation.id);

          // Remove payment lock
          await supabase
            .from('payment_locks')
            .delete()
            .eq('property_id', reservation.property_id);
          
          console.log('⚠️ Payment canceled for reservation:', reservation.reservation_number);
        }
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}


