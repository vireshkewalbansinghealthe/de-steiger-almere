import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Email service configuration (use your preferred email service)
const EMAIL_SERVICE = {
  provider: 'resend', // or 'sendgrid', 'nodemailer', etc.
  apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'noreply@desteigeralmere.nl',
  fromName: 'De Steiger'
};

interface ReminderEmailData {
  customerEmail: string;
  customerName: string;
  reservationId: string;
  units: Array<{
    name: string;
    unitNumber: number;
    price: string;
  }>;
  reservationFee: number;
  expiryDate: string;
  paymentLink?: string;
}

export async function POST(request: NextRequest) {
  try {
    const reminderData: ReminderEmailData = await request.json();
    
    // Validate required data
    if (!reminderData.customerEmail || !reminderData.reservationId) {
      return NextResponse.json(
        { error: 'Ontbrekende e-mail gegevens' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = serviceRoleKey && serviceRoleKey.length > 50 ? serviceRoleKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if reservation still exists and needs payment
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reminderData.reservationId)
      .eq('status', 'pending_payment')
      .single();
    
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservering niet gevonden of al betaald' },
        { status: 404 }
      );
    }

    // Generate email content
    const emailContent = generateReminderEmailContent(reminderData);
    
    // Send email using your preferred service
    const emailResult = await sendReminderEmail({
      to: reminderData.customerEmail,
      subject: `Reminder: Betaling reservering De Steiger - ${reminderData.reservationId}`,
      html: emailContent,
      text: emailContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    if (emailResult.success) {
      // Log reminder sent
      await supabase.from('email_logs').insert({
        reservation_id: reminderData.reservationId,
        email_type: 'payment_reminder',
        recipient_email: reminderData.customerEmail,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });

      return NextResponse.json({
        success: true,
        message: 'Reminder email verzonden'
      });
    } else {
      throw new Error(emailResult.error || 'Email versturen mislukt');
    }

  } catch (error) {
    console.error('Email reminder error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het versturen van de reminder' },
      { status: 500 }
    );
  }
}

// Cron job endpoint to automatically send reminders
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Verify cron job authentication
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = serviceRoleKey && serviceRoleKey.length > 50 ? serviceRoleKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Find reservations that need payment reminders (12 hours after creation, still pending)
    const reminderCutoff = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
    const expiryCheck = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    const { data: pendingReservations } = await supabase
      .from('reservations')
      .select(`
        *,
        customers (*),
        reservation_units (
          unit_number,
          unit_type,
          price
        )
      `)
      .eq('status', 'pending_payment')
      .lt('created_at', reminderCutoff.toISOString())
      .gt('created_at', expiryCheck.toISOString());

    let remindersSent = 0;
    let reservationsExpired = 0;

    if (pendingReservations) {
      for (const reservation of pendingReservations) {
        const createdAt = new Date(reservation.created_at);
        const hoursElapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        
        // If more than 24 hours, expire the reservation
        if (hoursElapsed >= 24) {
          await supabase
            .from('reservations')
            .update({ 
              status: 'expired',
              expired_at: new Date().toISOString()
            })
            .eq('id', reservation.id);
          
          // Release units back to available
          await supabase
            .from('properties')
            .update({ status: 'beschikbaar' })
            .in('unit_number', reservation.reservation_units.map((ru: any) => ru.unit_number));
          
          reservationsExpired++;
          continue;
        }

        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from('email_logs')
          .select('id')
          .eq('reservation_id', reservation.id)
          .eq('email_type', 'payment_reminder')
          .single();

        if (!existingReminder) {
          // Send reminder
          const reminderData: ReminderEmailData = {
            customerEmail: reservation.customers.email,
            customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
            reservationId: reservation.id,
            units: reservation.reservation_units.map((ru: any) => ({
              name: ru.unit_type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox',
              unitNumber: ru.unit_number,
              price: ru.price
            })),
            reservationFee: reservation.reservation_fee,
            expiryDate: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
            paymentLink: `${process.env.NEXT_PUBLIC_BASE_URL}/betaling/${reservation.id}`
          };

          await sendReminderEmail({
            to: reminderData.customerEmail,
            subject: `Urgent: Betaling reservering vervalt binnenkort - ${reminderData.reservationId}`,
            html: generateUrgentReminderEmailContent(reminderData),
            text: generateUrgentReminderEmailContent(reminderData).replace(/<[^>]*>/g, '')
          });

          remindersSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      reservationsExpired,
      message: `${remindersSent} reminders sent, ${reservationsExpired} reservations expired`
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

function generateReminderEmailContent(data: ReminderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Betalingsherinnering - De Steiger</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .unit-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #eab308; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); color: #1e293b; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Betalingsherinnering</h1>
          <p>Reservering: ${data.reservationId}</p>
        </div>
        
        <div class="content">
          <p>Beste ${data.customerName},</p>
          
          <p>Dit is een vriendelijke herinnering dat uw reservering bij De Steiger nog wacht op betaling.</p>
          
          <div class="unit-list">
            <h3>Uw gereserveerde units:</h3>
            ${data.units.map(unit => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <strong>${unit.name} ${unit.unitNumber}</strong><br>
                <span style="color: #059669; font-weight: bold;">${unit.price}</span>
              </div>
            `).join('')}
            <div style="padding-top: 15px; font-size: 18px; font-weight: bold;">
              Reserveringskosten: €${data.reservationFee.toLocaleString('nl-NL')}
            </div>
          </div>

          <div class="warning">
            <strong>⏰ Belangrijk:</strong> Uw reservering vervalt op ${data.expiryDate} om 23:59 als er niet wordt betaald.
          </div>

          <div style="text-align: center;">
            ${data.paymentLink ? `
              <a href="${data.paymentLink}" class="cta-button">Nu Betalen</a>
            ` : `
              <p>Ga naar uw account op onze website om te betalen.</p>
            `}
          </div>

          <p>Heeft u vragen? Neem dan contact met ons op via:</p>
          <p>
            📧 info@desteiger.nl<br>
            📞 036-123-4567
          </p>

          <p>Met vriendelijke groet,<br>Het team van De Steiger</p>
        </div>
        
        <div class="footer">
          <p>De Steiger B.V. | Almere | www.desteiger.nl</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateUrgentReminderEmailContent(data: ReminderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>URGENT: Reservering vervalt binnenkort - De Steiger</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .urgent-warning { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 20px 0; }
        .unit-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 URGENT: Reservering vervalt binnenkort</h1>
          <p>Reservering: ${data.reservationId}</p>
        </div>
        
        <div class="content">
          <div class="urgent-warning">
            <h2 style="color: #dc2626; margin-top: 0;">⏰ Uw reservering vervalt vandaag!</h2>
            <p style="font-size: 16px; margin-bottom: 0;">
              U heeft nog maar enkele uren om uw reservering te behouden door de reserveringskosten te betalen.
            </p>
          </div>
          
          <p>Beste ${data.customerName},</p>
          
          <p><strong>Dit is uw laatste kans!</strong> Uw reservering bij De Steiger vervalt vandaag om 23:59 als er niet wordt betaald.</p>
          
          <div class="unit-list">
            <h3>Uw gereserveerde units die u kunt verliezen:</h3>
            ${data.units.map(unit => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <strong>${unit.name} ${unit.unitNumber}</strong><br>
                <span style="color: #059669; font-weight: bold;">${unit.price}</span>
              </div>
            `).join('')}
            <div style="padding-top: 15px; font-size: 20px; font-weight: bold; color: #dc2626;">
              Te betalen: €${data.reservationFee.toLocaleString('nl-NL')}
            </div>
          </div>

          <div style="text-align: center;">
            ${data.paymentLink ? `
              <a href="${data.paymentLink}" class="cta-button">🚀 NU DIRECT BETALEN</a>
            ` : `
              <p style="font-weight: bold; color: #dc2626;">Ga DIRECT naar uw account om te betalen!</p>
            `}
          </div>

          <p><strong>Waarom zo urgent?</strong></p>
          <ul>
            <li>Na vervall zijn deze units weer beschikbaar voor anderen</li>
            <li>De reserveringskosten worden niet gerestitueerd</li>
            <li>U verliest uw claim op deze gewilde locaties</li>
          </ul>

          <p><strong>Hulp nodig?</strong> Bel ons direct: 06-85727480</p>

          <p>Met vriendelijke groet,<br>Het team van De Steiger</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendReminderEmail(emailData: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Implementation depends on your email service provider
    // Example for Resend:
    if (EMAIL_SERVICE.provider === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EMAIL_SERVICE.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${EMAIL_SERVICE.fromName} <${EMAIL_SERVICE.fromEmail}>`,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    }

    // For other providers (SendGrid, Nodemailer, etc.), implement accordingly
    return { success: false, error: 'Email service not configured' };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
