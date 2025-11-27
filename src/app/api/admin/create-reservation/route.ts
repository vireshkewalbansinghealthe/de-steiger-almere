import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, unitType = 'bedrijfsunit' } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use service role to create user and reservation
    const supabase = createClient();
    
    console.log(`Creating reservation for: ${email}`);

    // Step 1: Get or create user
    let userId: string;
    
    // Try to find existing user by email in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
      console.log(`✓ Found existing user: ${userId}`);
    } else {
      // Create new user via auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          last_name: 'User'
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return NextResponse.json(
          { error: `Failed to create user: ${authError.message}` },
          { status: 500 }
        );
      }

      userId = authUser.user!.id;
      console.log(`✓ Created new user: ${userId}`);

      // Create profile
      await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: email,
          first_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          last_name: 'User',
          role: 'customer'
        }]);
    }

    // Step 2: Get first available property of the specified type
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('type', unitType)
      .eq('status', 'available')
      .limit(1);
      
    if (propError) {
      console.error('Property error:', propError);
      return NextResponse.json(
        { error: `Failed to get properties: ${propError.message}` },
        { status: 500 }
      );
    }
    
    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { error: `No available ${unitType} properties found` },
        { status: 404 }
      );
    }

    const selectedProperty = properties[0];
    console.log(`✓ Selected property: ${selectedProperty.name} (Unit ${selectedProperty.unit_number})`);

    // Step 3: Create reservation
    const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const firstName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    
    const reservationData = {
      property_id: selectedProperty.id,
      customer_id: userId,
      reservation_number: reservationNumber,
      status: 'confirmed',
      customer_first_name: firstName,
      customer_last_name: 'User',
      customer_email: email,
      customer_phone: '+31 6 12345678',
      customer_company: email.includes('flexy') ? 'Flexy App B.V.' : null,
      customer_address: 'Teststraat 123',
      customer_city: 'Amsterdam',
      customer_postal_code: '1012 AB',
      customer_country: 'Nederland',
      reservation_fee_amount: 1500.00,
      total_property_price: selectedProperty.sale_price || 300000,
      payment_status: 'completed',
      paid_at: new Date().toISOString(),
      notes: 'Reservation created via admin API for demonstration purposes',
      intended_use: 'Business operations',
      financing_confirmed: false,
      reservation_expires_at: new Date(Date.now() + (4 * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select(`
        *,
        properties!inner (
          id, name, type, unit_number, location, gross_area, net_area, sale_price
        )
      `)
      .single();

    if (resError) {
      console.error('Reservation error:', resError);
      return NextResponse.json(
        { error: `Failed to create reservation: ${resError.message}` },
        { status: 500 }
      );
    }

    console.log('✓ Reservation created successfully!');

    // Step 4: Update property status
    await supabase
      .from('properties')
      .update({ 
        status: 'reserved',
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedProperty.id);

    console.log('✓ Property status updated to reserved');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Reservation created successfully',
      data: {
        user: {
          id: userId,
          email: email,
          firstName: firstName
        },
        reservation: {
          id: reservation.id,
          reservationNumber: reservation.reservation_number,
          status: reservation.status,
          paymentStatus: reservation.payment_status
        },
        property: {
          id: selectedProperty.id,
          name: selectedProperty.name,
          unitNumber: selectedProperty.unit_number,
          type: selectedProperty.type,
          price: selectedProperty.sale_price
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}


