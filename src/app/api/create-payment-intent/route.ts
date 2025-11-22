import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Stripe configuration is missing' },
        { status: 500 }
      );
    }

    // Initialize Stripe with error handling
    let stripe: Stripe;
    try {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-11-20.acacia',
      });
    } catch (stripeError: any) {
      console.error('Error initializing Stripe:', stripeError);
      return NextResponse.json(
        { error: 'Stripe initialization failed' },
        { status: 500 }
      );
    }

    const { amount, currency = 'eur', metadata } = await request.json();

    // Validate required parameters
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    console.log('Creating payment intent:', { amount, currency, metadata });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    return NextResponse.json({ 
      client_secret: paymentIntent.client_secret 
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}