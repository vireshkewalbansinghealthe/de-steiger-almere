import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy initialize Resend to avoid build-time issues
const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder_build_only');
};

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Naam en e-mailadres zijn verplicht.' }, { status: 400 });
    }

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: 'De Steiger Website <onboarding@resend.dev>', // You should use a verified domain here in production if possible, or use onboarding for testing. Since the user wants to send to info@, we will use onboarding@resend.dev if they haven't verified a domain, but generally info@desteigeralmere.nl is the target. Let's assume info@desteigeralmere.nl is verified, or fallback to the onboarding sender for now to avoid hard crash if not verified.
      // Or we can use the domain if verified: "De Steiger <info@desteigeralmere.nl>"
      // Given we don't know the verified domain, let's use the requested sender format if they've set it up, otherwise it defaults to onboarding. 
      // To be safe, we'll try to send FROM info@desteigeralmere.nl if possible, but Resend requires domain verification. Let's use it as FROM but if it fails, it will fail.
      // Wait, Resend allows sending from onboarding@resend.dev to the registered email address during testing.
      // But let's just use info@desteigeralmere.nl as requested for receiving the email.
      to: ['info@desteigeralmere.nl'],
      subject: `Nieuwe Bezichtiging Aanvraag: ${name}`,
      html: `
        <h2>Nieuwe aanvraag voor bezichtiging / informatie</h2>
        <p>Er is een nieuw contactformulier ingevuld op de website:</p>
        <ul>
          <li><strong>Naam:</strong> ${name}</li>
          <li><strong>E-mailadres:</strong> ${email}</li>
        </ul>
        <p>Neem zo snel mogelijk contact op met deze persoon.</p>
      `,
      replyTo: email, // This allows replying directly to the person who filled out the form
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