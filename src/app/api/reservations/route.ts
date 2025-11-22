import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const reservationData = await request.json();
    const supabase = createClient();
    
    console.log('Received reservation data:', reservationData);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Generate reservation number
    const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Calculate total property price and reservation fee
    const totalPropertyPrice = reservationData.totalAmount || 0;
    const reservationFeeAmount = 1500.00; // Standard reservation fee per unit

    // For now, we'll handle single unit reservations
    // TODO: Handle multiple units in the future
    const firstUnit = reservationData.selectedUnits?.[0];
    
    if (!firstUnit) {
      return NextResponse.json(
        { error: 'No units selected for reservation' },
        { status: 400 }
      );
    }

    // Find the property in the database based on unit number and type
    const { data: property } = await supabase
      .from('properties')
      .select('id')
      .eq('unit_number', firstUnit.unitNumber.toString())
      .eq('type', firstUnit.type)
      .single();

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Prepare reservation data for database insertion
    const dbReservationData = {
      property_id: property.id,
      customer_id: user.id,
      reservation_number: reservationNumber,
      customer_first_name: reservationData.customerInfo?.firstName || '',
      customer_last_name: reservationData.customerInfo?.lastName || '',
      customer_email: reservationData.customerInfo?.email || user.email || '',
      customer_phone: reservationData.customerInfo?.phone || '',
      customer_company: reservationData.customerInfo?.company || '',
      customer_address: reservationData.customerInfo?.address || '',
      customer_city: reservationData.customerInfo?.city || '',
      customer_postal_code: reservationData.customerInfo?.postalCode || '',
      customer_country: reservationData.customerInfo?.country || 'Netherlands',
      total_property_price: totalPropertyPrice,
      reservation_fee_amount: reservationFeeAmount,
      stripe_payment_intent_id: reservationData.paymentIntentId || null,
      status: reservationData.status || 'pending',
      payment_status: reservationData.paymentIntentId ? 'completed' : 'pending',
      notes: `Reservation created via Enhanced Reservation Modal. Selected units: ${reservationData.selectedUnits?.map(u => `${u.name} (${u.type})`).join(', ')}`,
      intended_use: 'Business use', // Default value
      reservation_expires_at: new Date(Date.now() + (4 * 7 * 24 * 60 * 60 * 1000)).toISOString(), // 4 weeks from now
      created_at: reservationData.createdAt || new Date().toISOString()
    };

    console.log('Inserting reservation data:', dbReservationData);

    // Insert reservation into Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([dbReservationData])
      .select();

    if (error) {
      console.error('Database error saving reservation:', error);
      return NextResponse.json(
        { error: `Failed to save reservation: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Reservation saved successfully:', data[0]);

    // Update property status to reserved
    await supabase
      .from('properties')
      .update({ status: 'reserved' })
      .eq('id', property.id);

    return NextResponse.json({ 
      success: true, 
      reservation: data[0],
      message: 'Reservation saved successfully'
    });
  } catch (error: any) {
    console.error('Error processing reservation:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: data });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}