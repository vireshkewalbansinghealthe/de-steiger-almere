import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get dashboard statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_property_statistics')

    if (statsError) {
      console.error('Stats error:', statsError)
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    // Get recent reservations
    const { data: recentReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        *,
        properties (
          name,
          type,
          unit_number
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (reservationsError) {
      console.error('Reservations error:', reservationsError)
      return NextResponse.json({ error: reservationsError.message }, { status: 500 })
    }

    // Get recent inquiries
    const { data: recentInquiries, error: inquiriesError } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        properties (
          name,
          type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (inquiriesError) {
      console.error('Inquiries error:', inquiriesError)
      return NextResponse.json({ error: inquiriesError.message }, { status: 500 })
    }

    // Get properties by status
    const { data: propertiesByStatus, error: propertiesError } = await supabase
      .from('properties')
      .select('status, type')

    if (propertiesError) {
      console.error('Properties error:', propertiesError)
      return NextResponse.json({ error: propertiesError.message }, { status: 500 })
    }

    // Process properties by status and type
    const statusBreakdown = propertiesByStatus?.reduce((acc, property) => {
      const key = `${property.type}_${property.status}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      statistics: stats,
      recentReservations,
      recentInquiries,
      statusBreakdown,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
