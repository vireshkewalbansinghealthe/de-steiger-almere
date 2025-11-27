import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * POST /api/reservations/create
 * Create a reservation with 15-minute payment lock
 * 
 * Body:
 * - property_id: UUID
 * - customer_details: { first_name, last_name, email, phone, company, address, city, postal_code }
 * - intended_use: string
 * - notes?: string
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Authentication required - no auth header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    // Create Supabase client with the user's access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('❌ Auth verification failed:', authError);
      return NextResponse.json(
        { error: 'Authentication required - invalid token', details: authError?.message },
        { status: 401 }
      );
    }

    console.log('✅ Authenticated user:', user.id, user.email);

    const body = await request.json();
    const {
      property_id,
      customer_details,
      intended_use,
      notes,
      signature_data,
    } = body;

    // Validate required fields
    if (!property_id || !customer_details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Check if property exists and is available
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .eq('status', 'available')
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or not available' },
        { status: 404 }
      );
    }

    // Step 2: Clean up expired locks first (optional - requires service role key)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey && serviceRoleKey.length > 50) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
      
      await supabaseAdmin
        .from('payment_locks')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } else {
      // Try cleanup with user's client (may be limited by RLS)
      await supabase
        .from('payment_locks')
        .delete()
        .lt('expires_at', new Date().toISOString());
    }

    // Check for existing payment locks (not expired) from OTHER users
    // We allow the SAME user to proceed (they already have the lock)
    const { data: existingLocks, error: lockError } = await supabase
      .from('payment_locks')
      .select('*')
      .eq('property_id', property_id)
      .neq('customer_id', user.id) // Exclude locks from the current user
      .gt('expires_at', new Date().toISOString());

    if (lockError) {
      console.error('Error checking payment locks:', lockError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    if (existingLocks && existingLocks.length > 0) {
      return NextResponse.json(
        { 
          error: 'Property is currently being reserved by another customer',
          locked_until: existingLocks[0].expires_at
        },
        { status: 409 }
      );
    }
    
    // Delete user's existing lock for this property (we'll create a new one below)
    await supabase
      .from('payment_locks')
      .delete()
      .eq('property_id', property_id)
      .eq('customer_id', user.id);

    // Step 3: Create payment lock (10 minutes)
    const sessionId = Math.random().toString(36).substring(7);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: lockCreateError } = await supabase
      .from('payment_locks')
      .insert({
        property_id,
        customer_id: user.id,
        session_id: sessionId,
        expires_at: expiresAt.toISOString(),
      });

    if (lockCreateError) {
      console.error('Error creating payment lock:', lockCreateError);
      return NextResponse.json(
        { error: 'Failed to create reservation lock' },
        { status: 500 }
      );
    }

    // Step 4: Create Stripe customer if not exists
    let stripeCustomerId: string | undefined;
    
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: customer_details.email,
        name: `${customer_details.first_name} ${customer_details.last_name}`,
        phone: customer_details.phone,
        metadata: {
          user_id: user.id,
          company: customer_details.company || '',
        },
      });
      stripeCustomerId = stripeCustomer.id;

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Step 5: Create Stripe Payment Intent for reservation fee
    // Reservation fee is €1.00 (100 cents)
    const reservationFee = parseInt(process.env.RESERVATION_FEE_AMOUNT || '100', 10);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: reservationFee, // Already in cents
      currency: 'eur',
      customer: stripeCustomerId,
      metadata: {
        property_id,
        user_id: user.id,
        session_id: sessionId,
        unit_number: property.unit_number,
        type: property.type,
      },
      description: `Reservation fee for ${property.name} (Unit ${property.unit_number})`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Step 6: Create reservation record
    const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const reservationExpiresAt = new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000); // 6 weeks

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        property_id,
        customer_id: user.id,
        reservation_number: reservationNumber,
        customer_first_name: customer_details.first_name,
        customer_last_name: customer_details.last_name,
        customer_email: customer_details.email,
        customer_phone: customer_details.phone,
        customer_company: customer_details.company,
        customer_address: customer_details.address,
        customer_city: customer_details.city,
        customer_postal_code: customer_details.postal_code,
        customer_country: customer_details.country || 'Netherlands',
        total_property_price: property.sale_price,
        reservation_fee_amount: reservationFee,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: stripeCustomerId,
        intended_use,
        notes,
        signature_data,
        contract_signed_at: signature_data ? new Date().toISOString() : null,
        status: 'pending',
        payment_status: 'pending',
        reservation_expires_at: reservationExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (reservationError) {
      console.error('Error creating reservation:', reservationError);
      
      // Clean up payment lock
      await supabase
        .from('payment_locks')
        .delete()
        .eq('session_id', sessionId);
      
      // Cancel payment intent
      await stripe.paymentIntents.cancel(paymentIntent.id);

      return NextResponse.json(
        { error: 'Failed to create reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation,
      payment_intent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
      session_id: sessionId,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/reservations/create:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}

