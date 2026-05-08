'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, Clock, AlertCircle, Download,
  Building2, Calendar, FileText, Euro, MapPin, Phone, Mail,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Reservation {
  id: string;
  reservation_number: string;
  status: 'pending' | 'reservation_paid' | 'fully_paid' | 'transferred' | 'cancelled';
  payment_status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string | null;
  customer_address: string;
  customer_city: string;
  customer_postal_code: string;
  total_property_price: number;
  reservation_fee_amount: number;
  paid_at: string | null;
  reservation_expires_at: string;
  created_at: string;
  properties: {
    name: string;
    type: string;
    unit_number: string;
    gross_area: number | null;
    sale_price: number;
    location: string;
  };
}

const STATUS = {
  pending: { label: 'In behandeling', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reservation_paid: { label: 'Reservering bevestigd', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  fully_paid: { label: 'Volledig betaald', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  transferred: { label: 'Overgedragen', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  cancelled: { label: 'Geannuleerd', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<'contract' | 'invoice' | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('reservations')
        .select(`*, properties!inner(name, type, unit_number, gross_area, sale_price, location)`)
        .eq('id', params.id)
        .eq('customer_id', user.id)
        .single();

      if (error || !data) {
        setError('Reservering niet gevonden of geen toegang.');
      } else {
        setReservation(data);
      }
      setLoading(false);
    };
    load();
  }, [params.id]);

  const downloadDoc = async (type: 'contract' | 'invoice') => {
    if (!reservation) return;
    setDownloading(type);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `/api/reservations/download?reservation_id=${reservation.id}&type=${type}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) { alert('Download mislukt.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const unitLabel = reservation.properties.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
      a.download = type === 'invoice'
        ? `Factuur-${reservation.reservation_number}.pdf`
        : `Reserveringsovereenkomst-${unitLabel}-${reservation.properties.unit_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
    </div>
  );

  if (error || !reservation) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error || 'Niet gevonden'}</p>
        <Link href="/profiel" className="text-yellow-600 underline">Terug naar profiel</Link>
      </div>
    </div>
  );

  const st = STATUS[reservation.status] ?? STATUS.pending;
  const StatusIcon = st.icon;
  const isPaid = ['reservation_paid', 'fully_paid', 'transferred'].includes(reservation.status);
  const typeLabel = reservation.properties.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      {/* Top bar */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-13 flex items-center gap-3 py-3">
          <Link href="/profiel" className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Mijn reserveringen</span>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-16 space-y-4">

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{reservation.reservation_number}</p>
              <h1 className="text-xl font-bold text-gray-900">
                {typeLabel} · Unit {reservation.properties.unit_number}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{reservation.properties.name}</p>
            </div>
            <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${st.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {st.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>Steiger 74–77, Almere</span>
            <span className="mx-1">·</span>
            <Calendar className="h-3 w-3" />
            <span>Gereserveerd {format(new Date(reservation.created_at), 'd MMM yyyy', { locale: nl })}</span>
          </div>
        </div>

        {/* Unit specs */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" /> Object
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Type" value={typeLabel} />
            <Stat label="Unit" value={`#${reservation.properties.unit_number}`} />
            {reservation.properties.gross_area && (
              <Stat label="Oppervlakte" value={`${reservation.properties.gross_area} m²`} />
            )}
            <Stat label="Koopprijs" value={`€ ${reservation.properties.sale_price.toLocaleString('nl-NL')}`} highlight />
          </div>
        </div>

        {/* Reservation info */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" /> Reservering
          </h2>
          <div className="space-y-2.5 text-sm">
            <Row label="Reserveringsnummer" value={reservation.reservation_number} />
            <Row label="Reserveringskosten" value={`€ ${(reservation.reservation_fee_amount / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`} />
            <Row label="Betaalstatus" value={
              <span className={reservation.payment_status === 'completed' ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                {reservation.payment_status === 'completed' ? 'Betaald' : 'Openstaand'}
              </span>
            } />
            {reservation.paid_at && (
              <Row label="Betaald op" value={format(new Date(reservation.paid_at), 'd MMMM yyyy', { locale: nl })} />
            )}
            <Row label="Reservering geldig tot" value={format(new Date(reservation.reservation_expires_at), 'd MMMM yyyy', { locale: nl })} />
          </div>
        </div>

        {/* Pending payment CTA */}
        {reservation.payment_status === 'pending' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 text-sm">Betaling nog niet ontvangen</p>
              <p className="text-orange-700 text-xs mt-0.5 mb-3">Voltooi de betaling om uw reservering te bevestigen.</p>
              <button
                onClick={() => router.push(`/betaling/${reservation.id}`)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Nu betalen
              </button>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Download className="h-4 w-4 text-gray-400" /> Documenten
          </h2>
          {isPaid ? (
            <div className="grid grid-cols-2 gap-3">
              <DocButton
                label="Reserveringscontract"
                sub="PDF"
                loading={downloading === 'contract'}
                onClick={() => downloadDoc('contract')}
                icon={<FileText className="h-5 w-5" />}
              />
              <DocButton
                label="Factuur"
                sub="PDF"
                loading={downloading === 'invoice'}
                onClick={() => downloadDoc('invoice')}
                icon={<Euro className="h-5 w-5" />}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400">Beschikbaar nadat de betaling is bevestigd.</p>
          )}
        </div>

        {/* Contact */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <p className="font-semibold mb-1">Vragen over uw reservering?</p>
          <p className="text-slate-400 text-sm mb-4">Neem contact op met VVS Projectontwikkeling.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:administratie@vvsbouw.nl" className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300">
              <Mail className="h-4 w-4" /> administratie@vvsbouw.nl
            </a>
            <a href="tel:0685727480" className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300">
              <Phone className="h-4 w-4" /> 06 – 857 27 480
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50'}`}>
      <p className={`text-xs mb-0.5 ${highlight ? 'text-yellow-600' : 'text-gray-400'}`}>{label}</p>
      <p className={`font-bold text-sm ${highlight ? 'text-yellow-900' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function DocButton({ label, sub, loading, onClick, icon }: {
  label: string; sub: string; loading: boolean; onClick: () => void; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 text-center"
    >
      <div className="text-gray-500">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{loading ? 'Laden...' : sub}</p>
      </div>
    </button>
  );
}
