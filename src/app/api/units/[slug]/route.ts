import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/units/[slug]
 * Fetch a single unit by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { slug } = params;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Unit not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching unit:', error);
      return NextResponse.json(
        { error: 'Failed to fetch unit', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unit: data,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/units/[slug]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}


