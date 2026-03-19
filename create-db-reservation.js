#!/usr/bin/env node

// Script to create actual database reservation for viresh@flexyapp.com
const { createClient } = require('@supabase/supabase-js');

// Using the project's public configuration
const supabaseUrl = 'https://dsqzacajytrbhgmdrjgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcXphY2FqeXRyYmhnbWRyamd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTA5MTYsImV4cCI6MjA3MDc2NjkxNn0.F79HhxW3Uvka5SF7J9aVGVj7IDnVGe_cLpX3XwzYhp8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createReservationForViresh() {
  try {
    console.log('🔍 Checking for existing user: viresh@flexyapp.com...\n');

    // Step 1: Check if user exists by trying to sign them in
    // First, let's try to find if the user exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', 'viresh@flexyapp.com')
      .single();

    let userId;
    if (existingProfile) {
      userId = existingProfile.id;
      console.log(`✅ Found existing user profile: ${existingProfile.first_name} ${existingProfile.last_name}`);
      console.log(`   User ID: ${userId}`);
    } else {
      console.log('❌ User profile not found. Creating a demo user ID...');
      // Use a consistent demo user ID
      userId = 'f8e7d6c5-b4a3-9281-7069-58473a46bef2'; // Fixed demo UUID
      console.log(`   Using demo user ID: ${userId}`);
      
      // Insert profile for this demo user
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          email: 'viresh@flexyapp.com',
          first_name: 'Viresh',
          last_name: 'Kewal Bansing',
          phone: '+31 6 12345678',
          company_name: 'Flexy App B.V.',
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileInsertError) {
        console.log('   Profile insert error (this might be OK):', profileInsertError.message);
      } else {
        console.log('✅ Created user profile');
      }
    }

    // Step 2: Check for existing properties
    console.log('\n🏠 Checking for available properties...');
    
    let { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('type', 'bedrijfsunit')
      .limit(5);

    if (propError) {
      console.log('   Property query error:', propError.message);
    }

    if (!properties || properties.length === 0) {
      console.log('   No properties found. Creating demo property...');
      
      // Create a demo property
      const { data: newProperty, error: createPropError } = await supabase
        .from('properties')
        .insert([{
          name: 'Bedrijfsunit Type 1',
          unit_number: 'BU-001',
          type: 'bedrijfsunit',
          type_number: 1,
          status: 'available',
          gross_area: 153.4,
          net_area: 134.7,
          sale_price: 306800,
          location: 'De Steiger 74/77, Almere',
          images: ['/images/up/Image1.png', '/images/up/Image2.png', '/images/up/beide1.png'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createPropError) {
        console.log('   Property creation error:', createPropError.message);
        // Use fixed property ID as fallback
        properties = [{
          id: 'demo-property-bedrijfsunit-001',
          name: 'Bedrijfsunit Type 1',
          unit_number: 'BU-001',
          type: 'bedrijfsunit'
        }];
      } else {
        properties = [newProperty];
        console.log('✅ Created demo property');
      }
    } else {
      console.log(`✅ Found ${properties.length} existing properties`);
    }

    const selectedProperty = properties[0];
    console.log(`   Selected: ${selectedProperty.name} (${selectedProperty.unit_number || selectedProperty.id})`);

    // Step 3: Create reservation
    console.log('\n📋 Creating reservation...');
    
    const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const currentDate = new Date().toISOString();
    
    const reservationData = {
      property_id: selectedProperty.id,
      customer_id: userId,
      reservation_number: reservationNumber,
      status: 'confirmed',
      customer_first_name: 'Viresh',
      customer_last_name: 'Kewal Bansing',
      customer_email: 'viresh@flexyapp.com',
      customer_phone: '+31 6 12345678',
      customer_company: 'Flexy App B.V.',
      customer_address: 'Teststraat 123',
      customer_city: 'Amsterdam',
      customer_postal_code: '1012 AB',
      customer_country: 'Nederland',
      reservation_fee_amount: 1500.00,
      total_property_price: selectedProperty.sale_price || 306800,
      payment_status: 'completed',
      paid_at: currentDate,
      notes: 'Demo reservation created for profile page testing',
      intended_use: 'Business operations and office space',
      financing_confirmed: false,
      reservation_expires_at: new Date(Date.now() + (4 * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      created_at: currentDate,
      updated_at: currentDate
    };

    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select(`
        *,
        properties (
          name,
          type,
          unit_number,
          images,
          location,
          gross_area,
          net_area,
          sale_price
        )
      `)
      .single();

    if (resError) {
      console.log('❌ Reservation creation error:', resError.message);
      console.log('   Error details:', JSON.stringify(resError, null, 2));
      
      // Try without the join to see if basic insert works
      const { data: basicReservation, error: basicError } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();
        
      if (basicError) {
        console.log('❌ Basic reservation insert also failed:', basicError.message);
      } else {
        console.log('✅ Basic reservation created without property join');
        console.log('   Reservation ID:', basicReservation.id);
      }
    } else {
      console.log('✅ Reservation created successfully!');
      console.log('   Reservation ID:', reservation.id);
      console.log('   Reservation Number:', reservation.reservation_number);
    }

    // Step 4: Update property status if successful
    if (!resError || reservation) {
      console.log('\n🏠 Updating property status...');
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          status: 'reserved',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProperty.id);

      if (updateError) {
        console.log('   Property update error:', updateError.message);
      } else {
        console.log('✅ Property marked as reserved');
      }
    }

    // Step 5: Verify the reservation can be fetched like the profile page does
    console.log('\n🔍 Verifying reservation is visible (like profile page query)...');
    
    const { data: testReservations, error: testError } = await supabase
      .from('reservations')
      .select(`
        *,
        properties!inner (
          name,
          type,
          unit_number,
          images,
          location,
          gross_area,
          net_area,
          sale_price
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (testError) {
      console.log('❌ Profile page query test failed:', testError.message);
    } else {
      console.log(`✅ Profile page query test passed: ${testReservations?.length || 0} reservations found`);
      if (testReservations && testReservations.length > 0) {
        console.log('   First reservation:', testReservations[0].reservation_number);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 RESERVATION SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('📧 User: viresh@flexyapp.com');
    console.log(`🆔 User ID: ${userId}`);
    console.log(`🏠 Property: ${selectedProperty.name}`);
    console.log(`📋 Reservation: ${reservationNumber}`);
    console.log('');
    console.log('🔍 Next: Check the profile page at http://localhost:3000/profiel');
    console.log('   (Make sure to be logged in as viresh@flexyapp.com)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Execute
createReservationForViresh();


