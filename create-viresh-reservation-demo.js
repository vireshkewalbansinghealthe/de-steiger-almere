#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function createVireshReservationDemo() {
  try {
    console.log('🚀 Creating demo reservation for viresh@flexyapp.com...\n');

    // Generate demo data
    const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const currentDate = new Date().toISOString();
    
    const demoReservation = {
      // Reservation Details
      id: `reservation-${Date.now()}`,
      reservation_number: reservationNumber,
      status: 'confirmed',
      payment_status: 'completed',
      created_at: currentDate,
      updated_at: currentDate,
      paid_at: currentDate,
      
      // Customer Information
      customer_id: 'demo-user-viresh-flexyapp',
      customer_first_name: 'Viresh',
      customer_last_name: 'Kewal Bansing',
      customer_email: 'viresh@flexyapp.com',
      customer_phone: '+31 6 12345678',
      customer_company: 'Flexy App B.V.',
      customer_address: 'Teststraat 123',
      customer_city: 'Amsterdam',
      customer_postal_code: '1012 AB',
      customer_country: 'Nederland',
      
      // Property Information  
      property_id: 'bedrijfsunit-type-1-unit-01',
      property_details: {
        name: 'Bedrijfsunit Type 1',
        unit_number: 'BU-001',
        type: 'bedrijfsunit',
        status: 'reserved',
        gross_area: 153.4,
        net_area: 134.7,
        location: 'De Steiger 74/77, Almere',
        features: ['134.7m² netto', '153.4m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+']
      },
      
      // Financial Details
      reservation_fee_amount: 1500.00,
      total_property_price: 306800,
      total_including_btw: Math.round(306800 * 1.21),
      
      // Additional Information
      notes: 'Demo reservation created via MCP script for viresh@flexyapp.com',
      intended_use: 'Business operations and office space',
      financing_confirmed: false,
      reservation_expires_at: new Date(Date.now() + (4 * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      
      // Contract Status
      contract_signed: false,
      contract_generated_at: null,
      docusign_envelope_id: null
    };

    // Save to JSON file
    const outputPath = path.join(__dirname, 'demo-reservations.json');
    let existingReservations = [];
    
    // Try to read existing reservations
    if (fs.existsSync(outputPath)) {
      try {
        const data = fs.readFileSync(outputPath, 'utf8');
        existingReservations = JSON.parse(data);
      } catch (e) {
        console.log('Creating new reservations file...');
      }
    }
    
    // Add new reservation
    existingReservations.push(demoReservation);
    
    // Write back to file
    fs.writeFileSync(outputPath, JSON.stringify(existingReservations, null, 2));

    // Display success message
    console.log('='.repeat(60));
    console.log('🎉 DEMO RESERVATION CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`👤 Customer: ${demoReservation.customer_first_name} ${demoReservation.customer_last_name}`);
    console.log(`📧 Email: ${demoReservation.customer_email}`);
    console.log(`🏢 Company: ${demoReservation.customer_company}`);
    console.log(`📍 Address: ${demoReservation.customer_address}, ${demoReservation.customer_postal_code} ${demoReservation.customer_city}`);
    console.log('');
    console.log(`🏠 Property: ${demoReservation.property_details.name}`);
    console.log(`🏷️  Unit Number: ${demoReservation.property_details.unit_number}`);
    console.log(`📐 Area: ${demoReservation.property_details.net_area}m² netto / ${demoReservation.property_details.gross_area}m² bruto`);
    console.log(`📍 Location: ${demoReservation.property_details.location}`);
    console.log(`✨ Features: ${demoReservation.property_details.features.join(', ')}`);
    console.log('');
    console.log(`📋 Reservation: ${demoReservation.reservation_number}`);
    console.log(`✅ Status: ${demoReservation.status.toUpperCase()}`);
    console.log(`💳 Payment: ${demoReservation.payment_status.toUpperCase()}`);
    console.log(`💰 Property Price: €${demoReservation.total_property_price.toLocaleString('nl-NL')}`);
    console.log(`💰 Total incl. BTW: €${demoReservation.total_including_btw.toLocaleString('nl-NL')}`);
    console.log(`💰 Reservation Fee: €${demoReservation.reservation_fee_amount.toLocaleString('nl-NL')}`);
    console.log('');
    console.log(`📅 Created: ${new Date(demoReservation.created_at).toLocaleString('nl-NL')}`);
    console.log(`⏰ Expires: ${new Date(demoReservation.reservation_expires_at).toLocaleString('nl-NL')}`);
    console.log('');
    console.log(`💼 Intended Use: ${demoReservation.intended_use}`);
    console.log(`📝 Notes: ${demoReservation.notes}`);
    console.log('');
    console.log('='.repeat(60));
    console.log(`📄 Reservation saved to: ${outputPath}`);
    console.log('='.repeat(60));
    
    // Show next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('1. ✅ Unit assigned to viresh@flexyapp.com');
    console.log('2. 📧 Send confirmation email to customer');
    console.log('3. 📋 Generate digital contract');  
    console.log('4. ✍️  Collect digital signature via DocuSign');
    console.log('5. 💰 Process remaining payment within 3 months');
    console.log('6. 🏠 Schedule property handover');

    return demoReservation;

  } catch (error) {
    console.error('❌ Error creating demo reservation:', error.message);
    process.exit(1);
  }
}

// Execute the function
createVireshReservationDemo();


