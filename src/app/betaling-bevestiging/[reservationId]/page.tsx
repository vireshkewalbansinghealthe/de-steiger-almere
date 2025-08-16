'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Mail, Calendar, MapPin, Building2, Home, User } from 'lucide-react';

export default function PaymentConfirmationPage() {
  const params = useParams();
  const reservationId = params.reservationId as string;
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  const fetchReservation = async () => {
    try {
      // In a real implementation, you'd fetch from your API
      // For now, we'll simulate the data
      setTimeout(() => {
        setReservation({
          id: reservationId,
          propertyName: 'De Steiger Bedrijfsunit Type 1',
          unitNumber: 15,
          location: 'Almere',
          customerName: 'Jan de Vries',
          email: 'jan@example.com',
          totalAmount: 257352,
          status: 'confirmed',
          paymentDate: new Date().toISOString(),
          moveInDate: '2024-03-01'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Reservering wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reservering niet gevonden</h1>
          <Link href="/" className="text-yellow-600 hover:text-yellow-700">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/up/Image2.png)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Reservering bevestigd!
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Bedankt voor uw reservering. Wij hebben uw betaling ontvangen en uw reservering is bevestigd.
            </p>
          </div>

          {/* Confirmation Details */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Reservering #{reservation.id}</h2>
              <p className="text-green-100">Bevestigd op {new Date(reservation.paymentDate).toLocaleDateString('nl-NL')}</p>
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
                        <span className="font-medium">{reservation.propertyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit nummer:</span>
                        <span className="font-medium">#{reservation.unitNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locatie:</span>
                        <span className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {reservation.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingangsdatum:</span>
                        <span className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(reservation.moveInDate).toLocaleDateString('nl-NL')}
                        </span>
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
                        <span className="text-gray-600">Totaalbedrag:</span>
                        <span className="font-bold text-lg">€{reservation.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Betaalmethode:</span>
                        <span className="font-medium">Creditcard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Betaald
                        </span>
                      </div>
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
                        <span className="font-medium">{reservation.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">E-mail:</span>
                        <span className="font-medium">{reservation.email}</span>
                      </div>
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
                          <div className="text-sm text-blue-700">U ontvangt binnen enkele minuten een bevestigingsmail met alle details.</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-yellow-900">Contact opname</div>
                          <div className="text-sm text-yellow-700">Onze medewerkers nemen binnen 24 uur contact met u op voor de verdere afhandeling.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="h-5 w-5 mr-2" />
                    Download bevestiging
                  </button>
                  
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