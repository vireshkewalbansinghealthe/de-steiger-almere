import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, interest, message, formType = 'bedrijfsunits' } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Naam en e-mail zijn verplicht' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    await sendContactFormEmails({ name, email, interest, message, formType });

    return NextResponse.json({
      success: true,
      message: 'Uw aanvraag is succesvol verzonden. We nemen binnen 24 uur contact met u op.',
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
