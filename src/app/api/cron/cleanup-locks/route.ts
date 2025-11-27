import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/cleanup-locks
 * Cleanup expired payment locks
 * This should be called periodically (e.g., every 5 minutes) via a cron job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use Anon key because RPC handles security (SECURITY DEFINER)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Delete expired locks via RPC
    const { error } = await supabase.rpc('cleanup_expired_payment_locks');

    if (error) {
      console.error('Error cleaning up locks:', error);
      return NextResponse.json(
        { error: 'Failed to cleanup locks', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Cleaned up expired payment locks via RPC`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Unexpected error in lock cleanup:', error);
    return NextResponse.json(
      { error: 'Unexpected error', details: error.message },
      { status: 500 }
    );
  }
}

