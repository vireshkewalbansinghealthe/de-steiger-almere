import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { reservationId, amount, paymentMethod, idealBank } = await request.json()

    if (!reservationId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verify the reservation exists and belongs to the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .eq('customer_id', user.id)
      .single()

    if (reservationError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json({ error: 'Reservation already processed' }, { status: 400 })
    }

    // For demo purposes, we'll simulate different payment methods
    // In a real implementation, you would integrate with Stripe, Mollie, or another payment provider

    let paymentResponse: any = {}

    switch (paymentMethod) {
      case 'ideal':
        if (!idealBank) {
          return NextResponse.json({ error: 'Bank selection required for iDEAL' }, { status: 400 })
        }
        // Simulate iDEAL payment
        paymentResponse = {
          method: 'ideal',
          bank: idealBank,
          status: 'pending',
          redirectUrl: `/betaling-bevestiging/${reservationId}?method=ideal&bank=${idealBank}`
        }
        break

      case 'card':
        // Simulate card payment
        paymentResponse = {
          method: 'card',
          status: 'pending',
          redirectUrl: `/betaling-bevestiging/${reservationId}?method=card`
        }
        break

      case 'banktransfer':
        // For bank transfer, we'll provide payment instructions
        paymentResponse = {
          method: 'banktransfer',
          status: 'pending',
          instructions: {
            iban: 'NL91 ABNA 0417 1643 00',
            bic: 'ABNANL2A',
            recipient: 'De Steiger B.V.',
            reference: `REF-${reservation.reservation_number}`,
            amount: amount
          },
          redirectUrl: `/betaling-bevestiging/${reservationId}?method=banktransfer`
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    // Update reservation with payment intent information
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        payment_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)

    if (updateError) {
      console.error('Error updating reservation:', updateError)
      return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
    }

    // For this demo, we'll redirect directly to the confirmation page
    // In a real implementation, you would redirect to the payment provider
    return NextResponse.json({
      success: true,
      url: paymentResponse.redirectUrl,
      paymentDetails: paymentResponse
    })

  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
