import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateContractPdf, generateInvoicePdf } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reservations/download?reservation_id=xxx&type=contract|invoice
 * Returns a PDF download for the authenticated user's reservation.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservation_id');
    const docType = searchParams.get('type') || 'contract'; // 'contract' | 'invoice'

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservation_id' }, { status: 400 });
    }

    // Fetch reservation (only the owner can download)
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('*, properties(*)')
      .eq('id', reservationId)
      .eq('customer_id', user.id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const property = reservation.properties;
    const unitTypeLabel = property.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
    const invoiceNumber = `INV-${reservation.reservation_number}`;

    let pdfBuffer: Buffer;
    let fileName: string;

    if (docType === 'invoice') {
      pdfBuffer = await generateInvoicePdf(reservation, property);
      fileName = `Factuur-${invoiceNumber}.pdf`;
    } else {
      pdfBuffer = await generateContractPdf(reservation, property);
      fileName = `Reserveringsovereenkomst-${unitTypeLabel}-${property.unit_number}.pdf`;
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF download:', error);
    return NextResponse.json(
      { error: 'Failed to generate document', details: error.message },
      { status: 500 }
    );
  }
}
