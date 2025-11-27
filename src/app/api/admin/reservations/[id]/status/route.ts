import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PATCH /api/admin/reservations/[id]/status
 * Update reservation status (admin only)
 * 
 * Body:
 * - status: 'pending' | 'reservation_paid' | 'fully_paid' | 'transferred' | 'cancelled'
 * - notes?: string (optional admin notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth token and verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses = ['pending', 'reservation_paid', 'fully_paid', 'transferred', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const reservationId = params.id;

    // Get current reservation
    const { data: currentReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*, properties(*)')
      .eq('id', reservationId)
      .single();

    if (fetchError || !currentReservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Update reservation status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add admin notes if provided
    if (notes) {
      updateData.notes = currentReservation.notes 
        ? `${currentReservation.notes}\n\n[${new Date().toISOString()}] Admin: ${notes}`
        : `[${new Date().toISOString()}] Admin: ${notes}`;
    }

    // If status is reservation_paid, update payment status
    if (status === 'reservation_paid' && currentReservation.payment_status !== 'completed') {
      updateData.payment_status = 'completed';
      updateData.paid_at = new Date().toISOString();
    }

    // Update property status based on reservation status
    let propertyStatus = currentReservation.properties.status;
    
    if (status === 'reservation_paid' || status === 'fully_paid') {
      propertyStatus = 'reserved';
    } else if (status === 'transferred') {
      propertyStatus = 'sold';
    } else if (status === 'cancelled') {
      propertyStatus = 'available';
    }

    // Update reservation
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId)
      .select('*, properties(*)')
      .single();

    if (updateError) {
      console.error('Error updating reservation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update reservation status' },
        { status: 500 }
      );
    }

    // Update property status if needed
    if (propertyStatus !== currentReservation.properties.status) {
      await supabase
        .from('properties')
        .update({ 
          status: propertyStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentReservation.property_id);
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: `Reservation status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Error in admin reservation status update:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

