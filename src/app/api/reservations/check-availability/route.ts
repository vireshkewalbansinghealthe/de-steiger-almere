import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reservations/check-availability?property_id=xxx
 * Check if a property is available for reservation (not locked by another user)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const property_id = searchParams.get('property_id');

    if (!property_id) {
      return NextResponse.json(
        { error: 'property_id is required' },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS for checking locks
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Step 1: Clean up expired locks first
    await supabase
      .from('payment_locks')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Step 2: Check property status
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, status, name, unit_number')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { 
          available: false, 
          reason: 'not_found',
          message: 'Deze unit bestaat niet'
        },
        { status: 404 }
      );
    }

    if (property.status !== 'available') {
      return NextResponse.json({
        available: false,
        reason: 'status',
        message: property.status === 'reserved' 
          ? 'Deze unit is al gereserveerd'
          : 'Deze unit is niet meer beschikbaar'
      });
    }

    // Step 3: Check for active payment locks
    const { data: activeLocks } = await supabase
      .from('payment_locks')
      .select('expires_at, customer_id')
      .eq('property_id', property_id)
      .gt('expires_at', new Date().toISOString());

    if (activeLocks && activeLocks.length > 0) {
      const lock = activeLocks[0];
      const expiresAt = new Date(lock.expires_at);
      const minutesLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 60000);

      return NextResponse.json({
        available: false,
        reason: 'locked',
        message: `Deze unit wordt momenteel gereserveerd door een andere klant. Probeer het over ${minutesLeft} ${minutesLeft === 1 ? 'minuut' : 'minuten'} opnieuw.`,
        locked_until: lock.expires_at
      });
    }

    // Property is available
    return NextResponse.json({
      available: true,
      property: {
        id: property.id,
        name: property.name,
        unit_number: property.unit_number
      }
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { 
        available: false,
        reason: 'error',
        message: 'Er is een fout opgetreden bij het controleren van de beschikbaarheid'
      },
      { status: 500 }
    );
  }
}

