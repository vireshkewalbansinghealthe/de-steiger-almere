import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy initialize Resend to avoid build-time issues
const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder_build_only');
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, unitInfo } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Naam en e-mailadres zijn verplicht.' }, { status: 400 });
    }

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: 'De Steiger <noreply@desteigeralmere.nl>',
      to: ['info@desteigeralmere.nl'],
      subject: `Nieuwe Bezichtiging Aanvraag: ${name}`,
      html: `
        <h2>Nieuwe aanvraag voor bezichtiging / informatie</h2>
        <p>Er is een nieuw contactformulier ingevuld op de website:</p>
        <ul>
          <li><strong>Naam:</strong> ${name}</li>
          <li><strong>E-mailadres:</strong> ${email}</li>
          ${phone ? `<li><strong>Telefoonnummer:</strong> ${phone}</li>` : ''}
          ${unitInfo ? `<li><strong>Unit:</strong> ${unitInfo}</li>` : ''}
        </ul>
        <p>Neem zo snel mogelijk contact op met deze persoon.</p>
      `,
      replyTo: email,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: 'Fout bij het verzenden van e-mail via Resend.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Aanvraag succesvol verstuurd.' });
  } catch (error: any) {
    console.error('Bezichtiging form error:', error);
    return NextResponse.json(
      { error: 'Er is een interne serverfout opgetreden.' },
      { status: 500 }
    );
  }
}