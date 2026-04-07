import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendReservationConfirmationEmails } from '@/lib/email';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * POST /api/reservations/confirm-payment
 * Confirm payment and update reservation status
 * This is a fallback for when webhooks don't work (e.g., local development)
 */
export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id, reservation_id } = await request.json();

    if (!payment_intent_id && !reservation_id) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id or reservation_id' },
        { status: 400 }
      );
    }

    // Get auth token from request header
    const authHeader = request.headers.get('authorization');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!anonKey) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!');
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase key' },
        { status: 500 }
      );
    }
    
    // Create supabase client with user's auth token if provided
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey,
      authHeader ? {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      } : undefined
    );
    
    console.log('🔐 Using', authHeader ? 'authenticated' : 'anonymous', 'Supabase client');

    // Find reservation first (to verify payment with Stripe)
    let reservation;
    if (reservation_id) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservation_id)
        .single();
      
      if (error || !data) {
        console.error('Reservation not found by ID:', error);
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        );
      }
      reservation = data;
    } else {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('stripe_payment_intent_id', payment_intent_id)
        .single();
      
      if (error || !data) {
        console.error('Reservation not found by payment intent:', error);
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        );
      }
      reservation = data;
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(reservation.stripe_payment_intent_id);
    
    if (paymentIntent.status !== 'succeeded') {
      console.log('Payment not yet succeeded, status:', paymentIntent.status);
      return NextResponse.json({
        success: false,
        message: 'Payment not yet completed',
        payment_status: paymentIntent.status
      });
    }

    // Check if already processed
    if (reservation.payment_status === 'completed' && reservation.status === 'reservation_paid') {
      console.log('Reservation already confirmed:', reservation.reservation_number);
      return NextResponse.json({
        success: true,
        message: 'Reservation already confirmed',
        reservation
      });
    }

    // Use RPC function to confirm payment (SECURITY DEFINER function)
    console.log('📞 Calling confirm_reservation_payment RPC for:', reservation.id);
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('confirm_reservation_payment', {
        p_reservation_id: reservation.id,
        p_payment_intent_id: null
      });

    if (rpcError) {
      console.error('❌ RPC failed:', rpcError);
      return NextResponse.json(
        { error: 'Unable to confirm payment - please contact support', details: rpcError.message },
        { status: 500 }
      );
    }

    if (!rpcResult?.success) {
      console.error('❌ RPC returned failure:', rpcResult);
      return NextResponse.json(
        { error: rpcResult?.message || 'Failed to confirm payment' },
        { status: 500 }
      );
    }

    console.log('✅ Payment confirmed via RPC:', rpcResult);

    // Send confirmation emails with signed contract PDF
    try {
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', reservation.property_id)
        .single();

      if (property) {
        await sendReservationConfirmationEmails(reservation, property);
        console.log('📧 Confirmation emails sent to', reservation.customer_email);
      }
    } catch (emailErr) {
      // Don't fail the request if email fails — just log it
      console.error('⚠️ Email sending failed (non-blocking):', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: rpcResult.message,
      reservation: {
        ...reservation,
        status: 'reservation_paid',
        payment_status: 'completed',
        paid_at: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in confirm-payment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
