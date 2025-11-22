import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, interest, message, formType = 'bedrijfsunits' } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Naam en e-mail zijn verplicht' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // TODO: Here you would typically:
    // 1. Send email to the business team
    // 2. Save to database
    // 3. Add to CRM system
    // 4. Send confirmation email to customer

    // For now, we'll just log the submission
    console.log('Contact form submission:', {
      name,
      email,
      interest,
      message,
      formType,
      timestamp: new Date().toISOString(),
    });

    // You can integrate with your email service here (SendGrid, Mailgun, etc.)
    // or save to Supabase database
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Uw aanvraag is succesvol verzonden. We nemen binnen 24 uur contact met u op.'
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
