import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * POST /api/reservations/confirm
 * Confirm a reservation after successful payment
 * 
 * Body:
 * - payment_intent_id: string
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use service role key if available, otherwise use anon key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey && serviceRoleKey.length > 50 ? serviceRoleKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const { payment_intent_id } = body;

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id' },
        { status: 400 }
      );
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed', status: paymentIntent.status },
        { status: 400 }
      );
    }

    // Find reservation by payment intent ID
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('*, properties(*)')
      .eq('stripe_payment_intent_id', payment_intent_id)
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Update reservation status
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', reservation.id);

    if (updateError) {
      console.error('Error updating reservation:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm reservation' },
        { status: 500 }
      );
    }

    // Update property status to reserved
    const { error: propertyError } = await supabase
      .from('properties')
      .update({ status: 'reserved' })
      .eq('id', reservation.property_id);

    if (propertyError) {
      console.error('Error updating property status:', propertyError);
    }

    // TODO: Send confirmation email (will be implemented in email notifications task)

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Reservation confirmed successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/reservations/confirm:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}

