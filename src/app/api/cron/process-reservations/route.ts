import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendReservationReminderEmail, sendReservationExpiredEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/cron/process-reservations
 * Cron job endpoint to process reservations:
 * 1. Send reminder emails for reservations expiring soon
 * 2. Expire reservations that have passed their deadline
 * 3. Clean up expired payment locks
 * 
 * This should be called by a cron service (e.g., Vercel Cron, GitHub Actions, or similar)
 * Recommended schedule: Every day at 9:00 AM
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const results = {
      reminders_sent: 0,
      reservations_expired: 0,
      payment_locks_cleaned: 0,
      errors: [] as string[],
    };

    // 1. Clean up expired payment locks (older than 15 minutes)
    try {
      const { error: lockError } = await supabase
        .from('payment_locks')
        .delete()
        .lt('expires_at', now.toISOString());

      if (lockError) {
        console.error('Error cleaning payment locks:', lockError);
        results.errors.push(`Payment locks cleanup: ${lockError.message}`);
      } else {
        results.payment_locks_cleaned++;
        console.log('✅ Payment locks cleaned up');
      }
    } catch (error: any) {
      console.error('Error cleaning payment locks:', error);
      results.errors.push(`Payment locks cleanup: ${error.message}`);
    }

    // 2. Find and expire reservations past their deadline
    try {
      const { data: expiredReservations, error: expiredError } = await supabase
        .from('reservations')
        .select('*, properties(name, type, unit_number)')
        .eq('status', 'confirmed')
        .lt('reservation_expires_at', now.toISOString());

      if (expiredError) {
        console.error('Error fetching expired reservations:', expiredError);
        results.errors.push(`Fetch expired: ${expiredError.message}`);
      } else if (expiredReservations && expiredReservations.length > 0) {
        for (const reservation of expiredReservations) {
          try {
            // Update reservation status to cancelled
            const { error: updateError } = await supabase
              .from('reservations')
              .update({
                status: 'cancelled',
                notes: `Automatisch geannuleerd - reservering verlopen op ${now.toISOString()}`,
              })
              .eq('id', reservation.id);

            if (updateError) {
              console.error(`Error updating reservation ${reservation.id}:`, updateError);
              results.errors.push(`Update ${reservation.reservation_number}: ${updateError.message}`);
              continue;
            }

            // Update property status back to available
            await supabase
              .from('properties')
              .update({ status: 'available' })
              .eq('id', reservation.property_id);

            // Send expiration email
            await sendReservationExpiredEmail({
              customerName: `${reservation.customer_first_name} ${reservation.customer_last_name}`,
              customerEmail: reservation.customer_email,
              reservationNumber: reservation.reservation_number,
              unitName: reservation.properties.name,
              unitNumber: reservation.properties.unit_number,
            });

            results.reservations_expired++;
            console.log(`✅ Reservation ${reservation.reservation_number} expired and email sent`);
          } catch (error: any) {
            console.error(`Error processing expired reservation ${reservation.id}:`, error);
            results.errors.push(`Process ${reservation.reservation_number}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error processing expired reservations:', error);
      results.errors.push(`Process expired: ${error.message}`);
    }

    // 3. Send reminder emails for reservations expiring within 7, 14, 21 days
    const reminderDays = [7, 14, 21, 28, 35]; // Days before expiry to send reminders

    for (const days of reminderDays) {
      try {
        const reminderDate = new Date(now);
        reminderDate.setDate(reminderDate.getDate() + days);
        
        // Find reservations expiring on this date (within 1 day window)
        const startDate = new Date(reminderDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(reminderDate);
        endDate.setHours(23, 59, 59, 999);

        const { data: upcomingReservations, error: upcomingError } = await supabase
          .from('reservations')
          .select('*, properties(name, type, unit_number)')
          .eq('status', 'confirmed')
          .gte('reservation_expires_at', startDate.toISOString())
          .lte('reservation_expires_at', endDate.toISOString());

        if (upcomingError) {
          console.error(`Error fetching ${days}-day reminders:`, upcomingError);
          results.errors.push(`Fetch ${days}-day reminders: ${upcomingError.message}`);
          continue;
        }

        if (upcomingReservations && upcomingReservations.length > 0) {
          for (const reservation of upcomingReservations) {
            try {
              const remainingAmount = reservation.total_property_price - reservation.reservation_fee_amount;

              await sendReservationReminderEmail({
                customerName: `${reservation.customer_first_name} ${reservation.customer_last_name}`,
                customerEmail: reservation.customer_email,
                reservationNumber: reservation.reservation_number,
                unitName: reservation.properties.name,
                unitNumber: reservation.properties.unit_number,
                totalPrice: reservation.total_property_price,
                remainingAmount,
                expiresAt: reservation.reservation_expires_at!,
                daysRemaining: days,
              });

              results.reminders_sent++;
              console.log(`✅ ${days}-day reminder sent for ${reservation.reservation_number}`);
            } catch (error: any) {
              console.error(`Error sending ${days}-day reminder for ${reservation.id}:`, error);
              results.errors.push(`Reminder ${reservation.reservation_number}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        console.error(`Error processing ${days}-day reminders:`, error);
        results.errors.push(`Process ${days}-day reminders: ${error.message}`);
      }
    }

    console.log('🎉 Cron job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error: any) {
    console.error('Fatal error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Cron endpoint is active. Use POST with proper authentication to trigger the job.',
    info: {
      purpose: 'Process reservations, send reminders, and expire old reservations',
      schedule: 'Should be called daily at 9:00 AM',
      auth: 'Requires Bearer token with CRON_SECRET',
    },
  });
}


