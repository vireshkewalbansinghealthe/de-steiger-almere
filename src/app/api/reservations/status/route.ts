import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reservations/status
 * Check if a property is locked (public access for guests)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const property_id = searchParams.get('property_id');

  if (!property_id) {
    return NextResponse.json({ error: 'property_id required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Use a dummy UUID for guest check to ensure we see all locks
  const dummyUserId = '00000000-0000-0000-0000-000000000000';
  const dummySessionId = 'guest_check';

  // Call RPC to check for locks
  const { data: activeLocks, error } = await supabase.rpc('check_active_payment_locks', {
    p_property_id: property_id,
    p_session_id: dummySessionId,
    p_user_id: dummyUserId
  });

  if (error) {
    console.error('Error checking lock status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (activeLocks && activeLocks.length > 0) {
    const lock = activeLocks[0];
    return NextResponse.json({
      locked: true,
      expires_at: lock.expires_at
    });
  }

  return NextResponse.json({ locked: false });
}

