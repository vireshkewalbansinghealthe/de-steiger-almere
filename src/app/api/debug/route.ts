import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      timestamp: new Date().toISOString(),
    };

    console.log('Environment check:', envCheck);

    return NextResponse.json({
      status: 'API route working',
      environment: envCheck,
      message: 'This endpoint helps debug environment variable configuration'
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


