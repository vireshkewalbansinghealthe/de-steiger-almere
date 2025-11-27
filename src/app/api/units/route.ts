import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create a public Supabase client (no auth needed for reading units)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/units
 * Fetch all available units with optional filtering
 * Query params:
 * - type: 'bedrijfsunit' | 'opslagbox'
 * - status: 'available' | 'reserved' | 'sold'
 * - min_price: number
 * - max_price: number
 * - min_area: number
 * - max_area: number
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minArea = searchParams.get('min_area');
    const maxArea = searchParams.get('max_area');
    const unitNumber = searchParams.get('unit_number');
    const slug = searchParams.get('slug');
    const groupByType = searchParams.get('group_by_type'); // 'true' or 'false'
    const typeNumber = searchParams.get('type_number'); // Filter by type number

    // Build query
    let query = supabase
      .from('properties')
      .select('*')
      .order('type_number', { ascending: true })
      .order('unit_number', { ascending: true });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    // Only filter by status if explicitly provided (not empty string)
    if (status && status !== '') {
      query = query.eq('status', status);
    }
    // If status is empty string or not provided, show ALL statuses

    if (slug) {
      query = query.eq('slug', slug);
    }

    if (unitNumber) {
      query = query.eq('unit_number', unitNumber);
    }

    if (typeNumber) {
      query = query.eq('type_number', parseInt(typeNumber));
    }

    if (minPrice) {
      query = query.gte('sale_price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('sale_price', parseFloat(maxPrice));
    }

    if (minArea) {
      query = query.gte('net_area', parseFloat(minArea));
    }

    if (maxArea) {
      query = query.lte('net_area', parseFloat(maxArea));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching units:', error);
      return NextResponse.json(
        { error: 'Failed to fetch units', details: error.message },
        { status: 500 }
      );
    }

    // If group_by_type is requested, return only 1 representative unit per type_number
    if (groupByType === 'true' && data) {
      const typeMap = new Map<number, any>();
      
      // Group by type_number and keep first unit of each type
      data.forEach((unit) => {
        if (!typeMap.has(unit.type_number)) {
          // Add count of total units for this type
          const unitsOfSameType = data.filter(u => u.type_number === unit.type_number);
          typeMap.set(unit.type_number, {
            ...unit,
            units_count: unitsOfSameType.length,
            unit_numbers: unitsOfSameType.map(u => u.unit_number).sort((a, b) => parseInt(a) - parseInt(b)),
            // Override slug to be type-based for overview page linking
            slug: `${unit.type}-type-${unit.type_number}`
          });
        }
      });
      
      const representativeUnits = Array.from(typeMap.values());
      
      return NextResponse.json({
        success: true,
        units: representativeUnits,
        total: representativeUnits.length,
        grouped_by_type: true
      });
    }

    // Regular response: return all units
    const groupedByType: Record<string, any[]> = {};
    data?.forEach((unit) => {
      const typeName = `${unit.type}-type-${unit.type_number}`;
      if (!groupedByType[typeName]) {
        groupedByType[typeName] = [];
      }
      groupedByType[typeName].push(unit);
    });

    return NextResponse.json({
      success: true,
      units: data || [],
      grouped: groupedByType,
      total: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/units:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}

