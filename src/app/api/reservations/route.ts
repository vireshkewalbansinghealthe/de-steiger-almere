import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reservations
 * Fetch user's reservations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('reservations')
      .select('*, properties(*)')
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reservations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reservations', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservations: data || [],
      total: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/reservations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
