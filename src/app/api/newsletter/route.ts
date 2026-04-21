import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, locationName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
    }

    // API Key from environment or hardcoded fallback as provided by user
    const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

    // Add contact to Brevo
    // If the contact already exists, this might throw a 400 unless updateEnabled is true
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        updateEnabled: true, // Update if contact already exists
        // Optional: you can assign them to specific lists if you know the listIds
        // listIds: [2], 
        attributes: {
          OPT_IN: true,
          LOCATION_INTEREST: locationName || 'General',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', data);
      // If error is duplicate contact, we can treat it as success or tell the user
      if (data.code === 'duplicate_parameter') {
        return NextResponse.json({ message: 'Je bent al ingeschreven!' }, { status: 200 });
      }
      throw new Error(data.message || 'Failed to subscribe via Brevo API');
    }

    return NextResponse.json({ success: true, message: 'Succesvol ingeschreven' });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inschrijven.' },
      { status: 500 }
    );
  }
}