'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Mail, Calendar, MapPin, Building2, Home, User, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function PaymentConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.reservationId as string;
  const [reservation, setReservation] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  // Confirm payment and update status as fallback (for when webhooks don't work)
  useEffect(() => {
    const confirmPayment = async () => {
      if (reservation && reservation.payment_status !== 'completed') {
        try {
          // Get the current session for auth token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.error('No session available for payment confirmation');
            return;
          }

          // Call the confirm-payment API with auth token
          const res = await fetch('/api/reservations/confirm-payment', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ reservation_id: reservationId }),
          });
          const data = await res.json();
          if (data.success) {
            console.log('✅ Payment confirmed on confirmation page:', data);
            // Refresh the reservation data
            fetchReservation();
          } else {
            console.error('Payment confirmation failed:', data);
          }
        } catch (err) {
          console.error('Error confirming payment:', err);
        }
      }
    };
    confirmPayment();
  }, [reservation?.id]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/betaling-bevestiging/' + reservationId);
        return;
      }

      // Fetch reservation details
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .select('*, properties(*)')
        .eq('id', reservationId)
        .eq('customer_id', session.user.id)
        .single();

      if (reservationError) {
        console.error('Error fetching reservation:', reservationError);
        setError('Reservering niet gevonden');
        setLoading(false);
        return;
      }

      if (!reservationData) {
        setError('Reservering niet gevonden');
        setLoading(false);
        return;
      }

      console.log('Reservation data:', reservationData);
      setReservation(reservationData);
      setProperty(reservationData.properties);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setError('Er is een fout opgetreden bij het ophalen van de reservering');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Reservering wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Reservering niet gevonden'}</h1>
          <p className="text-gray-600 mb-6">
            De reservering kon niet worden gevonden of u heeft geen toegang tot deze reservering.
          </p>
          <Link href="/profiel" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Ga naar mijn profiel
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = reservation.status === 'confirmed' || reservation.payment_status === 'paid';

  return (
    <div className="min-h-screen relative overflow-hidden pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: property?.images?.[0] ? `url(${property.images[0]})` : 'url(/images/up/Image2.png)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isConfirmed ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <CheckCircle className={`w-12 h-12 ${isConfirmed ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {isConfirmed ? 'Reservering bevestigd!' : 'Reservering aangemaakt!'}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {isConfirmed 
                ? 'Bedankt voor uw reservering. Wij hebben uw betaling ontvangen en uw reservering is bevestigd.'
                : 'Uw reservering is aangemaakt. Voltooi de betaling om uw reservering te bevestigen.'
              }
            </p>
          </div>

          {/* Confirmation Details */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`bg-gradient-to-r px-8 py-6 ${
              isConfirmed ? 'from-green-500 to-green-600' : 'from-yellow-500 to-yellow-600'
            }`}>
              <h2 className="text-2xl font-bold text-white">Reservering #{reservation.reservation_number}</h2>
              <p className={isConfirmed ? 'text-green-100' : 'text-yellow-100'}>
                {isConfirmed 
                  ? `Bevestigd op ${new Date(reservation.confirmed_at || reservation.created_at).toLocaleDateString('nl-NL')}`
                  : `Aangemaakt op ${new Date(reservation.created_at).toLocaleDateString('nl-NL')}`
                }
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Property Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-yellow-500" />
                      Eigendom Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Eigendom:</span>
                        <span className="font-medium">{property?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit nummer:</span>
                        <span className="font-medium">#{property?.unit_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{property?.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locatie:</span>
                        <span className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property?.location || 'Almere'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Oppervlakte:</span>
                        <span className="font-medium">{property?.net_area}m² (netto)</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Betaling Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reserveringskosten:</span>
                        <span className="font-medium">€{(reservation.reservation_fee_amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Koopprijs eigendom:</span>
                        <span className="font-bold text-lg">€{reservation.total_property_price?.toLocaleString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isConfirmed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isConfirmed ? 'Betaald' : 'In behandeling'}
                        </span>
                      </div>
                      {reservation.reservation_expires_at && !isConfirmed && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vervalt op:</span>
                          <span className="font-medium flex items-center text-red-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(reservation.reservation_expires_at).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-yellow-500" />
                      Contact Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Naam:</span>
                        <span className="font-medium">
                          {reservation.customer_first_name} {reservation.customer_last_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">E-mail:</span>
                        <span className="font-medium">{reservation.customer_email}</span>
                      </div>
                      {reservation.customer_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefoon:</span>
                          <span className="font-medium">{reservation.customer_phone}</span>
                        </div>
                      )}
                      {reservation.customer_company && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bedrijf:</span>
                          <span className="font-medium">{reservation.customer_company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Volgende stappen
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-900">Bevestigingsmail</div>
                          <div className="text-sm text-blue-700">
                            U ontvangt binnen enkele minuten een bevestigingsmail met alle details.
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-yellow-900">Contact opname</div>
                          <div className="text-sm text-yellow-700">
                            Onze medewerkers nemen binnen 24 uur contact met u op voor de verdere afhandeling.
                          </div>
                        </div>
                      </div>

                      {!isConfirmed && (
                        <div className="flex items-start p-3 bg-red-50 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-red-900">Let op</div>
                            <div className="text-sm text-red-700">
                              Voltooi de betaling om uw reservering definitief te bevestigen.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/profiel"
                    className="inline-flex items-center justify-center bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Naar mijn profiel
                  </Link>
                  
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Terug naar home
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Vragen over uw reservering?</h3>
            <p className="text-white/80 mb-4">
              Ons team staat klaar om u te helpen met eventuele vragen.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Neem contact op
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
