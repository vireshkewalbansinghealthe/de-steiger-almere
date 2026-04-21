import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('polygons')
    .select('unit_number, type, points')
    .order('unit_number');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { polygons } = body as { polygons: { unit_number: string; type: string; points: string }[] };

  if (!Array.isArray(polygons)) {
    return NextResponse.json({ error: 'polygons array required' }, { status: 400 });
  }

  // Upsert all polygons (insert or update based on unit_number + type)
  const { error } = await supabase
    .from('polygons')
    .upsert(
      polygons.map(p => ({ unit_number: p.unit_number, type: p.type || 'bedrijfsunit', points: p.points })),
      { onConflict: 'unit_number,type' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
