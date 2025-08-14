import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Check user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or requesting their own reservations
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role)

    let query = supabase
      .from('reservations')
      .select(`
        *,
        properties (
          id,
          name,
          type,
          unit_number,
          type_number,
          sale_price,
          images
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (!isAdmin) {
      // Regular users can only see their own reservations
      query = query.eq('customer_id', user.id)
    } else if (customerId) {
      // Admins can filter by customer
      query = query.eq('customer_id', customerId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Check user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      property_id,
      customer_first_name,
      customer_last_name,
      customer_email,
      customer_phone,
      customer_company,
      customer_address,
      customer_city,
      customer_postal_code,
      customer_country = 'Netherlands',
      notes,
      intended_use,
    } = body

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.status !== 'available') {
      return NextResponse.json({ error: 'Property is not available' }, { status: 400 })
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: customer_email,
      name: `${customer_first_name} ${customer_last_name}`,
      phone: customer_phone,
      address: customer_address ? {
        line1: customer_address,
        city: customer_city,
        postal_code: customer_postal_code,
        country: customer_country === 'Netherlands' ? 'NL' : customer_country,
      } : undefined,
      metadata: {
        property_id,
        property_name: property.name,
      }
    })

    // Create reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        property_id,
        customer_id: user.id,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        customer_company,
        customer_address,
        customer_city,
        customer_postal_code,
        customer_country,
        reservation_fee_amount: property.reservation_fee || 1500,
        total_property_price: property.sale_price,
        stripe_customer_id: stripeCustomer.id,
        notes,
        intended_use,
      })
      .select()
      .single()

    if (reservationError) {
      console.error('Reservation creation error:', reservationError)
      return NextResponse.json({ error: reservationError.message }, { status: 500 })
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((property.reservation_fee || 1500) * 100), // Convert to cents
      currency: 'eur',
      customer: stripeCustomer.id,
      metadata: {
        reservation_id: reservation.id,
        property_id,
        reservation_number: reservation.reservation_number,
      },
      description: `Reservering ${property.name} - ${reservation.reservation_number}`,
    })

    // Update reservation with payment intent ID
    await supabase
      .from('reservations')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', reservation.id)

    return NextResponse.json({
      reservation,
      client_secret: paymentIntent.client_secret,
      publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
