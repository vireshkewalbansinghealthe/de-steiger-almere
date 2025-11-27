import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reservations/release-lock
 * Release a payment lock when user leaves the reservation flow
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For beacon requests, we might not have auth header
      // Try to get session_id from body
      const body = await request.json();
      const { session_id } = body;

      if (!session_id) {
        return NextResponse.json(
          { error: 'Authentication or session_id required' },
          { status: 401 }
        );
      }

      // Use standard client with RPC for deletion by session_id
      // This avoids using service role key in the client
      const supabaseAnon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      console.log('🔓 Release payment lock (beacon) - Session:', session_id);

      const { error } = await supabaseAnon.rpc('release_payment_lock_by_session', {
        p_session_id: session_id
      });

      if (error) {
        console.error('❌ Error deleting payment lock via RPC:', error);
        return NextResponse.json(
          { error: 'Failed to delete payment lock' },
          { status: 500 }
        );
      }

      console.log('✅ Payment lock released (beacon)');

      return NextResponse.json({
        success: true,
        message: 'Payment lock released',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const { session_id } = await request.json();

    console.log('🔓 Release payment lock request - Session:', session_id, 'User:', user.id);

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Use standard client for deletion (RLS should allow delete for own rows)
    const { data: deletedLocks, error } = await supabase
      .from('payment_locks')
      .delete()
      .eq('session_id', session_id)
      .eq('customer_id', user.id)
      .select();

    if (error) {
      console.error('❌ Error deleting payment lock:', error);
      return NextResponse.json(
        { error: 'Failed to delete payment lock' },
        { status: 500 }
      );
    }

    console.log('✅ Payment locks released:', deletedLocks?.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Payment lock released',
      deleted_count: deletedLocks?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in release-lock:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

