import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/viewing-locks
 * Create or update a viewing lock when user visits property detail page
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

    const { property_id, session_id } = await request.json();

    console.log('🔒 Lock request - Property:', property_id, 'Session:', session_id, 'User:', user.id);

    if (!property_id || !session_id) {
      return NextResponse.json(
        { error: 'property_id and session_id are required' },
        { status: 400 }
      );
    }

    // Use standard client for RPC call
    // Since the RPC is SECURITY DEFINER, it will run with admin privileges
    const { error: rpcError } = await supabase.rpc('cleanup_expired_viewing_locks');
    
    if (rpcError) {
      console.error('Error cleaning up locks via RPC:', rpcError);
    }

    // Check if there are other active locks on this property using RPC
    const { data: activeLocks } = await supabase
      .rpc('check_active_viewing_locks', {
        p_property_id: property_id,
        p_session_id: session_id
      });

    console.log('🔍 Active locks found:', activeLocks?.length || 0);

    if (activeLocks && activeLocks.length > 0) {
      const lock = activeLocks[0];
      const secondsLeft = Math.ceil((new Date(lock.expires_at).getTime() - Date.now()) / 1000);

      console.log('❌ Property locked by session:', lock.viewer_session_id);
      return NextResponse.json({
        locked: true,
        message: `Een andere klant is deze unit momenteel aan het bekijken. Probeer het over enkele ogenblikken opnieuw.`,
        seconds_left: secondsLeft,
        expires_at: lock.expires_at
      });
    }

    console.log('✅ No active locks, proceeding to acquire');

    // Create or update the lock
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Try to insert the lock
    // If a lock already exists for this property+session, update it
    const { data: lock, error: lockError } = await supabase
      .from('viewing_locks')
      .upsert(
        {
          property_id,
          viewer_id: user.id,
          viewer_session_id: session_id,
          last_heartbeat: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
        {
          onConflict: 'property_id,viewer_session_id',
        }
      )
      .select()
      .single();

    console.log('✅ Lock created/updated:', lock?.id);

    if (lockError) {
      console.error('Error creating lock:', lockError);
      return NextResponse.json(
        { error: 'Failed to create lock' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      locked: false,
      lock,
      message: 'Lock acquired successfully'
    });
  } catch (error: any) {
    console.error('Error in viewing-locks:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/viewing-locks
 * Heartbeat to keep the lock alive
 */
export async function PATCH(request: NextRequest) {
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

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // Extend by 2 minutes

    const { error } = await supabase
      .from('viewing_locks')
      .update({
        last_heartbeat: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('viewer_session_id', session_id)
      .eq('viewer_id', user.id);

    if (error) {
      console.error('Error updating heartbeat:', error);
      return NextResponse.json(
        { error: 'Failed to update heartbeat' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Heartbeat updated'
    });
  } catch (error: any) {
    console.error('Error in heartbeat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/viewing-locks
 * Release the lock when user leaves the page
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    console.log('🔓 Release lock request - Session:', session_id, 'User:', user.id);

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const { data: deletedLocks, error } = await supabase
      .from('viewing_locks')
      .delete()
      .eq('viewer_session_id', session_id)
      .eq('viewer_id', user.id)
      .select();

    if (error) {
      console.error('❌ Error deleting lock:', error);
      return NextResponse.json(
        { error: 'Failed to delete lock' },
        { status: 500 }
      );
    }

    console.log('✅ Locks released:', deletedLocks?.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Lock released',
      deleted_count: deletedLocks?.length || 0
    });
  } catch (error: any) {
    console.error('Error releasing lock:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

