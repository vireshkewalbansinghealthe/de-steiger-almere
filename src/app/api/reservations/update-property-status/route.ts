import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reservations/update-property-status
 * Update property status after successful payment (fallback for webhook)
 */
export async function POST(request: NextRequest) {
  try {
    const { reservation_id } = await request.json();

    if (!reservation_id) {
      return NextResponse.json(
        { error: 'Missing reservation_id' },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('property_id, status, payment_status')
      .eq('id', reservation_id)
      .single();

    if (reservationError || !reservation) {
      console.error('Reservation not found:', reservationError);
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Only update if payment is completed and status is reservation_paid
    if (reservation.payment_status === 'completed' || reservation.status === 'reservation_paid') {
      // Update property status to reserved
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          status: 'reserved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservation.property_id);

      if (updateError) {
        console.error('Error updating property status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update property status' },
          { status: 500 }
        );
      }

      // Remove payment lock
      await supabase
        .from('payment_locks')
        .delete()
        .eq('property_id', reservation.property_id);

      console.log('✅ Property status updated to reserved for reservation:', reservation_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Payment not completed yet' 
    });

  } catch (error: any) {
    console.error('Unexpected error in update-property-status:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}

