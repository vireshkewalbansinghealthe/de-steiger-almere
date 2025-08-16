import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const reservationData = await request.json();
    const supabase = createClient();

    // Insert reservation into Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          property_slug: reservationData.propertySlug,
          unit_number: reservationData.unitNumber,
          customer_info: reservationData.customerInfo,
          preferences: reservationData.preferences,
          terms_accepted: reservationData.termsAccepted,
          signature_data: reservationData.signatureData,
          payment_intent_id: reservationData.paymentIntentId,
          total_amount: reservationData.totalAmount,
          status: reservationData.status,
          created_at: reservationData.createdAt
        }
      ])
      .select();

    if (error) {
      console.error('Error saving reservation:', error);
      return NextResponse.json(
        { error: 'Failed to save reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      reservation: data[0] 
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