import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reservations/create-lock
 * Create a payment lock when user enters the reservation flow
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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

    const { property_id, session_id, expires_at } = await request.json();

    console.log('🔒 Create payment lock request - Property:', property_id, 'Session:', session_id, 'User:', user.id);

    if (!property_id || !session_id || !expires_at) {
      return NextResponse.json(
        { error: 'property_id, session_id, and expires_at are required' },
        { status: 400 }
      );
    }

    // Use standard client for cleanup (via RPC) and insert
    // First, cleanup expired locks via RPC
    const { error: cleanupError } = await supabase.rpc('cleanup_expired_payment_locks');
    
    if (cleanupError) {
      console.error('Error cleaning up payment locks via RPC:', cleanupError);
    }

    // Check if there are other active locks on this property via RPC
    const { data: otherLocks } = await supabase
      .rpc('check_active_payment_locks', {
        p_property_id: property_id,
        p_session_id: session_id,
        p_user_id: user.id
      });

    console.log('🔍 Active payment locks found:', otherLocks?.length || 0);

    if (otherLocks && otherLocks.length > 0) {
      const lock = otherLocks[0];
      const minutesLeft = Math.ceil((new Date(lock.expires_at).getTime() - Date.now()) / (1000 * 60));

      console.log('❌ Property locked by another session');
      return NextResponse.json(
        {
          error: `Deze unit wordt momenteel door een andere klant gereserveerd. Probeer het over ongeveer ${minutesLeft} minuten opnieuw.`,
          locked_until: lock.expires_at,
          minutes_remaining: minutesLeft,
        },
        { status: 409 } // Conflict status
      );
    }

    console.log('✅ No active locks by other users, creating/restoring lock');

    // Check if user ALREADY has a valid lock on this property
    const { data: existingOwnLock } = await supabase
      .from('payment_locks')
      .select('*')
      .eq('property_id', property_id)
      .eq('customer_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingOwnLock) {
      console.log('♻️ Existing lock found for user, returning it:', existingOwnLock.id);
      // Optional: Extend the lock slightly if needed, but for now we keep the original expiry
      // to enforce the 10 minute limit strictly.
      return NextResponse.json({
        success: true,
        lock: existingOwnLock,
        message: 'Existing payment lock restored',
        restored: true
      });
    }

    // Clean up any old/invalid locks for this user on this property just in case
    await supabase
      .from('payment_locks')
      .delete()
      .eq('property_id', property_id)
      .eq('customer_id', user.id);

    // Create the lock using standard client (RLS should allow insert for authenticated user)
    const { data: lock, error: lockError } = await supabase
      .from('payment_locks')
      .insert({
        property_id,
        customer_id: user.id,
        session_id,
        expires_at,
      })
      .select()
      .single();

    if (lockError) {
      console.error('❌ Error creating payment lock:', lockError);
      return NextResponse.json(
        { error: 'Failed to create payment lock' },
        { status: 500 }
      );
    }

    console.log('✅ Payment lock created:', lock.id);

    return NextResponse.json({
      success: true,
      lock,
      message: 'Payment lock acquired successfully'
    });
  } catch (error: any) {
    console.error('❌ Error in create-lock:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

