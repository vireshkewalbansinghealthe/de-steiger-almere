import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReservationConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  reservationNumber: string;
  unitName: string;
  unitNumber: string;
  totalPrice: number;
  reservationFee: number;
  reservationExpiresAt: string;
}

interface ReservationReminderEmailData {
  customerName: string;
  customerEmail: string;
  reservationNumber: string;
  unitName: string;
  unitNumber: string;
  totalPrice: number;
  remainingAmount: number;
  expiresAt: string;
  daysRemaining: number;
}

export async function sendReservationConfirmationEmail(data: ReservationConfirmationEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'De Steiger <noreply@desteiger.nl>',
      to: [data.customerEmail],
      subject: `Reservering bevestigd - ${data.reservationNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reservering Bevestigd</title>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reservering Bevestigd! 🎉</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Beste ${data.customerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Uw reservering is succesvol bevestigd! Hartelijk dank voor uw vertrouwen in De Steiger.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Reserveringsdetails</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Reserveringsnummer:</td>
                  <td style="padding: 12px 0; text-align: right;">${data.reservationNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Unit:</td>
                  <td style="padding: 12px 0; text-align: right;">${data.unitName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Unit nummer:</td>
                  <td style="padding: 12px 0; text-align: right;">#${data.unitNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Verkoopprijs:</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 18px; color: #059669;">
                    € ${data.totalPrice.toLocaleString('nl-NL')}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Betaalde reservering:</td>
                  <td style="padding: 12px 0; text-align: right;">€ ${data.reservationFee.toLocaleString('nl-NL')}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 600;">Restbedrag:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold;">
                    € ${(data.totalPrice - data.reservationFee).toLocaleString('nl-NL')}
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e;"><strong>⚠️ Belangrijk:</strong></p>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                U heeft tot <strong>${new Date(data.reservationExpiresAt).toLocaleDateString('nl-NL', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</strong> (6 weken) om het restbedrag te voldoen. U ontvangt herinneringen voor deze deadline.
              </p>
            </div>
            
            <h3 style="color: #1e293b; margin-top: 30px;">Volgende stappen:</h3>
            <ol style="color: #4b5563; line-height: 1.8;">
              <li>U ontvangt binnenkort de aankoopovereenkomst per e-mail</li>
              <li>Regel uw financiering indien nodig</li>
              <li>Binnen 6 weken dient het restbedrag te zijn voldaan</li>
              <li>Na volledige betaling wordt de eigendomsoverdracht geregeld</li>
            </ol>
            
            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; margin: 0;">Heeft u vragen? Neem gerust contact met ons op:</p>
              <p style="color: #1e293b; margin: 10px 0 0 0;">
                <strong>Email:</strong> info@desteiger.nl<br>
                <strong>Telefoon:</strong> +31 (0)20 123 4567
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
              Met vriendelijke groet,<br>
              <strong>Het team van De Steiger</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>De Steiger 74/77, Almere</p>
            <p>© ${new Date().getFullYear()} De Steiger. Alle rechten voorbehouden.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      return { success: false, error };
    }

    console.log('✅ Confirmation email sent:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendReservationReminderEmail(data: ReservationReminderEmailData) {
  try {
    const urgency = data.daysRemaining <= 7 ? 'urgent' : 'normal';
    const { data: emailData, error } = await resend.emails.send({
      from: 'De Steiger <noreply@desteiger.nl>',
      to: [data.customerEmail],
      subject: `${urgency === 'urgent' ? '🚨 URGENT: ' : ''}Herinnering: Reservering verloopt ${data.daysRemaining === 1 ? 'morgen' : `over ${data.daysRemaining} dagen`}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reservering Herinnering</title>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${urgency === 'urgent' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
              ${urgency === 'urgent' ? '🚨 Laatste Herinnering' : '⏰ Reservering Herinnering'}
            </h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Beste ${data.customerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Dit is een ${urgency === 'urgent' ? 'dringende ' : ''}herinnering dat uw reservering binnenkort verloopt.
            </p>
            
            <div style="background: ${urgency === 'urgent' ? '#fee2e2' : '#fef3c7'}; border-left: 4px solid ${urgency === 'urgent' ? '#dc2626' : '#f59e0b'}; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${urgency === 'urgent' ? '#991b1b' : '#92400e'};">
                Nog ${data.daysRemaining} ${data.daysRemaining === 1 ? 'dag' : 'dagen'} tot vervaldatum!
              </p>
              <p style="margin: 10px 0 0 0; color: ${urgency === 'urgent' ? '#991b1b' : '#92400e'};">
                Verloopt op: <strong>${new Date(data.expiresAt).toLocaleDateString('nl-NL', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</strong>
              </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Reserveringsdetails</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Reserveringsnummer:</td>
                  <td style="padding: 12px 0; text-align: right;">${data.reservationNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Unit:</td>
                  <td style="padding: 12px 0; text-align: right;">${data.unitName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Unit nummer:</td>
                  <td style="padding: 12px 0; text-align: right;">#${data.unitNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600;">Totaalprijs:</td>
                  <td style="padding: 12px 0; text-align: right;">€ ${data.totalPrice.toLocaleString('nl-NL')}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 600;">Nog te betalen:</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: bold; color: #dc2626;">
                    € ${data.remainingAmount.toLocaleString('nl-NL')}
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af;"><strong>ℹ️ Wat gebeurt er als u niet op tijd betaalt?</strong></p>
              <p style="margin: 10px 0 0 0; color: #1e40af;">
                Als het restbedrag niet voor de vervaldatum is ontvangen, vervalt uw reservering automatisch en komt de unit weer beschikbaar voor anderen. De betaalde reserveringskosten worden <strong>niet</strong> terugbetaald.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:info@desteiger.nl?subject=Reservering%20${data.reservationNumber}" 
                 style="display: inline-block; background: #059669; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Neem Contact Op
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; margin: 0;">Heeft u vragen of hulp nodig?</p>
              <p style="color: #1e293b; margin: 10px 0 0 0;">
                <strong>Email:</strong> info@desteiger.nl<br>
                <strong>Telefoon:</strong> +31 (0)20 123 4567
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
              Met vriendelijke groet,<br>
              <strong>Het team van De Steiger</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>De Steiger 74/77, Almere</p>
            <p>© ${new Date().getFullYear()} De Steiger. Alle rechten voorbehouden.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error };
    }

    console.log('✅ Reminder email sent:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error };
  }
}

export async function sendReservationExpiredEmail(data: {
  customerName: string;
  customerEmail: string;
  reservationNumber: string;
  unitName: string;
  unitNumber: string;
}) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'De Steiger <noreply@desteiger.nl>',
      to: [data.customerEmail],
      subject: `Reservering Verlopen - ${data.reservationNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reservering Verlopen</title>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reservering Verlopen</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Beste ${data.customerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Helaas moeten wij u mededelen dat uw reservering is verlopen omdat het restbedrag niet binnen de gestelde termijn is ontvangen.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Reserveringsdetails</h2>
              <p style="margin: 5px 0;"><strong>Reserveringsnummer:</strong> ${data.reservationNumber}</p>
              <p style="margin: 5px 0;"><strong>Unit:</strong> ${data.unitName}</p>
              <p style="margin: 5px 0;"><strong>Unit nummer:</strong> #${data.unitNumber}</p>
            </div>
            
            <p style="font-size: 16px; margin: 20px 0;">
              De unit is weer beschikbaar voor nieuwe reserveringen. Indien u nog steeds geïnteresseerd bent, kunt u opnieuw een reservering plaatsen via onze website.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://desteiger.nl/bedrijfsunits" 
                 style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Bekijk Beschikbare Units
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; margin: 0;">Voor vragen kunt u contact met ons opnemen:</p>
              <p style="color: #1e293b; margin: 10px 0 0 0;">
                <strong>Email:</strong> info@desteiger.nl<br>
                <strong>Telefoon:</strong> +31 (0)20 123 4567
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
              Met vriendelijke groet,<br>
              <strong>Het team van De Steiger</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>De Steiger 74/77, Almere</p>
            <p>© ${new Date().getFullYear()} De Steiger. Alle rechten voorbehouden.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending expired email:', error);
      return { success: false, error };
    }

    console.log('✅ Expired email sent:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending expired email:', error);
    return { success: false, error };
  }
}


