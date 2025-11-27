'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  CreditCard, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Euro, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  ExternalLink,
  Home,
  Ruler,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ReservationDetails {
  id: string;
  reservation_number: string;
  status: 'pending' | 'reservation_paid' | 'fully_paid' | 'transferred' | 'cancelled';
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string | null;
  customer_address: string;
  customer_city: string;
  customer_postal_code: string;
  customer_country: string;
  total_property_price: number;
  reservation_fee_amount: number;
  payment_status: string;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  contract_signed_at: string | null;
  notes: string | null;
  intended_use: string | null;
  reservation_expires_at: string;
  created_at: string;
  updated_at: string;
  properties: {
    id: string;
    name: string;
    type: string;
    unit_number: string;
    location: string;
    gross_area: number | null;
    net_area: number | null;
    sale_price: number;
    images: string[];
    features: string[];
    specifications: any;
    ceiling_height: number | null;
    parking_spaces: number | null;
  };
}

export default function ReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  // Get correct images based on property type
  const getPropertyImages = (property: any) => {
    if (!property) return [];

    if (property.type === 'bedrijfsunit') {
      // Use bedrijfsunit images from /up folder - variety based on unit number
      const baseImages = [
        '/images/up/beide1.png',
        '/images/up/beide2.png', 
        '/images/up/Image1.png',
        '/images/up/Image2.png',
        '/images/up/Image4.png',
        '/images/up/Image5.png',
        '/images/up/Image8.png',
        '/images/up/Image9.png',
        '/images/up/Image10.png',
        '/images/up/Image11.png',
        '/images/up/Image12.png',
        '/images/up/Image13.png',
        '/images/up/Image14.png',
        '/images/up/Image15.png',
        '/images/up/Image16.png',
        '/images/up/Image17.png'
      ];
      
      // Rotate images based on unit number for variety
      const unitNum = parseInt(property.unit_number) || 1;
      const startIndex = (unitNum - 1) * 2;
      return [
        ...baseImages.slice(startIndex % baseImages.length, startIndex % baseImages.length + 8),
        ...baseImages.slice(0, Math.max(0, 8 - (baseImages.length - startIndex % baseImages.length)))
      ].slice(0, 12);
      
    } else if (property.type === 'opslagbox') {
      // Use opslagbox images
      return [
        '/images/up/opslagbox3.png',
        '/images/up/opslagbox4.png',
        '/images/opslagbox1.png',
        '/images/opslagbox2.png',
        '/images/up/Image1.png',
        '/images/up/Image2.png',
        '/images/up/Image4.png',
        '/images/up/Image5.png',
        '/images/up/Image8.png',
        '/images/up/Image9.png'
      ];
    }

    // Fallback to default images
    return [
      '/images/up/Image1.png',
      '/images/up/Image2.png',
      '/images/up/Image4.png',
      '/images/up/Image5.png'
    ];
  };

  // Get reservation progress steps
  const getProgressSteps = (reservation: ReservationDetails) => {
    const steps = [
      {
        id: 1,
        name: 'Reservering Gemaakt',
        description: 'Reservering is aangemaakt',
        completed: true,
        completedDate: reservation.created_at,
        icon: CheckCircle
      },
      {
        id: 2,
        name: 'Reservering Betaald',
        description: 'Reserveringskosten betaald',
        completed: reservation.status === 'reservation_paid' || reservation.status === 'fully_paid' || reservation.status === 'transferred',
        completedDate: reservation.paid_at,
        icon: CreditCard
      },
      {
        id: 3,
        name: 'Contract Getekend',
        description: 'Koopcontract ondertekend met handtekening',
        completed: reservation.status === 'reservation_paid' || reservation.status === 'fully_paid' || reservation.status === 'transferred',
        completedDate: reservation.contract_signed_at || reservation.paid_at, // Use contract signed date or payment date as fallback
        icon: FileText
      },
      {
        id: 4,
        name: 'Volledig Betaald',
        description: 'Volledige koopsom betaald (wordt ingesteld door admin)',
        completed: reservation.status === 'fully_paid' || reservation.status === 'transferred',
        completedDate: null,
        icon: Euro
      },
      {
        id: 5,
        name: 'Overgedragen',
        description: 'Unit is officieel overgedragen (wordt ingesteld door admin)',
        completed: reservation.status === 'transferred',
        completedDate: null,
        icon: Building2
      }
    ];

    return steps;
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        // Check if user is authenticated
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (!currentUser) {
          router.push('/login');
          return;
        }

        // Fetch reservation details
        const { data: reservationData, error: reservationError } = await supabase
          .from('reservations')
          .select(`
            *,
            properties!inner (
              id,
              name,
              type,
              unit_number,
              location,
              gross_area,
              net_area,
              sale_price,
              images,
              features,
              specifications,
              ceiling_height,
              parking_spaces
            )
          `)
          .eq('id', params.id)
          .eq('customer_id', currentUser.id) // Ensure user can only see their own reservations
          .single();

        if (reservationError) {
          console.error('Error fetching reservation:', reservationError);
          setError('Reservering niet gevonden of geen toegang');
          return;
        }

        setReservation(reservationData);
      } catch (error) {
        console.error('Error:', error);
        setError('Er is een fout opgetreden bij het ophalen van de reservering');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReservationDetails();
    }
  }, [params.id, router, supabase]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        styles: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md',
        label: 'In behandeling',
        icon: <Clock className="h-4 w-4" />
      },
      reservation_paid: {
        styles: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md',
        label: 'Reservering betaald',
        icon: <CheckCircle className="h-4 w-4" />
      },
      fully_paid: {
        styles: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md',
        label: 'Volledig betaald',
        icon: <CheckCircle className="h-4 w-4" />
      },
      transferred: {
        styles: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md',
        label: 'Overgedragen',
        icon: <CheckCircle className="h-4 w-4" />
      },
      cancelled: {
        styles: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md',
        label: 'Geannuleerd',
        icon: <AlertCircle className="h-4 w-4" />
    }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${config.styles}`}>
        {config.icon}
        <span className="ml-2">{config.label}</span>
      </span>
    );
  };

  const tabs = [
    { id: 'overview', name: 'Overzicht', icon: Building2 },
    { id: 'property', name: 'Object Details', icon: Home },
    { id: 'customer', name: 'Klantgegevens', icon: User },
    { id: 'payment', name: 'Financieel', icon: CreditCard },
    { id: 'documents', name: 'Documenten', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Reservering details laden...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservering Niet Gevonden</h1>
          <p className="text-gray-600 mb-6">{error || 'De reservering kan niet worden weergegeven'}</p>
          <button
            onClick={() => router.push('/profiel')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300"
          >
            Terug naar Profiel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/images/up/Image1.png')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/profiel')}
              className="flex items-center text-white hover:text-yellow-400 transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Terug naar Profiel
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                {reservation.properties.name}
              </h1>
                {getStatusBadge(reservation.status)}
              </div>
              <p className="text-slate-300 text-lg mb-2">
                Unit {reservation.properties.unit_number} • Reservering #{reservation.reservation_number}
              </p>
              <p className="text-slate-400 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Gereserveerd op {format(new Date(reservation.created_at), 'dd MMMM yyyy', { locale: nl })}
              </p>
            </div>
            <div className="text-right ml-6">
              <p className="text-slate-300 text-sm">Totale waarde</p>
              <p className="text-3xl font-bold text-white">
                €{reservation.total_property_price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium transition-all duration-300 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Progress Steps */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <Clock className="h-6 w-6 text-yellow-400 mr-3" />
                      Reservering Voortgang
                    </h3>
                    <p className="text-slate-300 text-sm mt-1">Volg de status van uw reservering</p>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      {getProgressSteps(reservation).map((step, index) => (
                        <div key={step.id} className="relative flex items-start pb-8 last:pb-0">
                          {/* Connecting Line */}
                          {index < getProgressSteps(reservation).length - 1 && (
                            <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-200"></div>
                          )}
                          
                          <div className="flex-shrink-0 mr-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                              step.completed 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                : index === 0 || getProgressSteps(reservation)[index - 1]?.completed 
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900'
                                  : 'bg-gray-200 text-gray-400'
                            }`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-lg font-bold ${
                                step.completed ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {step.name}
                              </h4>
                              {step.completed && step.completedDate && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  {format(new Date(step.completedDate), 'dd MMM yyyy', { locale: nl })}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                            {step.completed && (
                              <div className="flex items-center mt-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm text-green-600 font-semibold">Voltooid</span>
                              </div>
                            )}
                            {!step.completed && (index === 0 || getProgressSteps(reservation)[index - 1]?.completed) && (
                              <div className="flex items-center mt-2">
                                <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                                <span className="text-sm text-yellow-600 font-semibold">In behandeling</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Property Summary */}
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Building2 className="h-6 w-6 text-yellow-500 mr-3" />
                      Object Overzicht
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Naam:</span>
                        <span className="font-semibold">{reservation.properties.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold capitalize">
                          {reservation.properties.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit nummer:</span>
                        <span className="font-semibold">{reservation.properties.unit_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locatie:</span>
                        <span className="font-semibold">{reservation.properties.location}</span>
                      </div>
                      {reservation.properties.gross_area && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Oppervlakte:</span>
                          <span className="font-semibold">{reservation.properties.gross_area} m²</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reservation Summary */}
                  <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-6 w-6 text-yellow-500 mr-3" />
                      Reservering Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reserveringsnummer:</span>
                        <span className="font-semibold">{reservation.reservation_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vervaldatum:</span>
                        <span className="font-semibold">
                          {format(new Date(reservation.reservation_expires_at), 'dd MMM yyyy', { locale: nl })}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-yellow-200">
                        <span>Reserveringskosten:</span>
                        <span className="text-yellow-600">€{(reservation.reservation_fee_amount / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Images */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <h3 className="text-xl font-bold text-gray-900 p-6 border-b border-gray-100 flex items-center">
                    <Package className="h-6 w-6 text-yellow-500 mr-3" />
                    Object Foto's
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({reservation.properties.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'} Type {reservation.properties.unit_number})
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                    {getPropertyImages(reservation.properties).map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                        <img
                          src={image}
                          alt={`${reservation.properties.name} - Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to a default image if the image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/up/Image1.png';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="px-6 pb-6">
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <strong>💡 Let op:</strong> Deze foto's zijn representatief voor {reservation.properties.type === 'bedrijfsunit' ? 'bedrijfsunits' : 'opslagboxen'} 
                      op De Steiger. De exacte indeling en afwerking kunnen per unit verschillen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Property Details Tab */}
            {activeTab === 'property' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Home className="h-6 w-6 text-yellow-500 mr-3" />
                      Basisgegevens
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          Object naam:
                        </span>
                        <span className="font-semibold">{reservation.properties.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Locatie:
                        </span>  
                        <span className="font-semibold">{reservation.properties.location}</span>
                      </div>
                      {reservation.properties.gross_area && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center">
                            <Ruler className="h-4 w-4 mr-2" />
                            Bruto oppervlakte:
                          </span>
                          <span className="font-semibold">{reservation.properties.gross_area} m²</span>
                        </div>
                      )}
                      {reservation.properties.net_area && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center">
                            <Ruler className="h-4 w-4 mr-2" />
                            Netto oppervlakte:
                          </span>
                          <span className="font-semibold">{reservation.properties.net_area} m²</span>
                        </div>
                      )}
                      {reservation.properties.ceiling_height && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Plafondhoogte:</span>
                          <span className="font-semibold">{reservation.properties.ceiling_height}m</span>
                        </div>
                      )}
                      {reservation.properties.parking_spaces && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Parkeerplaatsen:</span>
                          <span className="font-semibold">{reservation.properties.parking_spaces}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Euro className="h-6 w-6 text-blue-500 mr-3" />
                      Financiële Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verkoopprijs:</span>
                        <span className="font-bold text-lg text-blue-600">
                          €{reservation.properties.sale_price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reserveringskosten:</span>
                        <span className="font-semibold text-yellow-600">
                          €{(reservation.reservation_fee_amount / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-blue-200">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Totaal gereserveerd:</span>
                          <span className="text-blue-600">
                            €{reservation.total_property_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {reservation.properties.features && reservation.properties.features.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Kenmerken</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {reservation.properties.features.map((feature: string, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Details Tab */}
            {activeTab === 'customer' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <User className="h-6 w-6 text-yellow-500 mr-3" />
                      Persoonlijke Gegevens
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Naam:</span>
                        <span className="font-semibold">
                          {reservation.customer_first_name} {reservation.customer_last_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          E-mail:
                        </span>
                        <span className="font-semibold">{reservation.customer_email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Telefoon:
                        </span>
                        <span className="font-semibold">{reservation.customer_phone}</span>
                      </div>
                      {reservation.customer_company && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Bedrijf:</span>
                          <span className="font-semibold">{reservation.customer_company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <MapPin className="h-6 w-6 text-green-500 mr-3" />
                      Adresgegevens
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adres:</span>
                        <span className="font-semibold text-right">{reservation.customer_address || 'Niet opgegeven'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Postcode:</span>
                        <span className="font-semibold text-right">{reservation.customer_postal_code || 'Niet opgegeven'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stad:</span>
                        <span className="font-semibold text-right">{reservation.customer_city || 'Niet opgegeven'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Land:</span>
                        <span className="font-semibold text-right">{reservation.customer_country || 'Nederland'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(reservation.notes || reservation.intended_use) && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Aanvullende Informatie</h3>
                    <div className="space-y-4">
                      {reservation.intended_use && (
                        <div>
                          <span className="text-gray-600 font-medium">Beoogd gebruik:</span>
                          <p className="mt-1 text-gray-900">{reservation.intended_use}</p>
                        </div>
                      )}
                      {reservation.notes && (
                        <div>
                          <span className="text-gray-600 font-medium">Opmerkingen:</span>
                          <p className="mt-1 text-gray-900">{reservation.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="h-6 w-6 text-yellow-500 mr-3" />
                      Betalingsoverzicht
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Betalingsstatus:</span>
                        <span className={`font-semibold ${
                          reservation.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {reservation.payment_status === 'completed' ? 'Betaald' : 'Openstaand'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reserveringskosten:</span>
                        <span className="font-semibold">€{(reservation.reservation_fee_amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Totale objectwaarde:</span>
                        <span className="font-semibold">€{reservation.total_property_price.toLocaleString()}</span>
                      </div>
                      {reservation.paid_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Betaald op:</span>
                          <span className="font-semibold">
                            {format(new Date(reservation.paid_at), 'dd MMM yyyy', { locale: nl })}
                          </span>
                        </div>
                      )}
                      {reservation.stripe_payment_intent_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transactie ID:</span>
                          <span className="font-mono text-sm">{reservation.stripe_payment_intent_id}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Clock className="h-6 w-6 text-yellow-500 mr-3" />
                      Belangrijke Datums
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reservering gemaakt:</span>
                        <span className="font-semibold">
                          {format(new Date(reservation.created_at), 'dd MMM yyyy', { locale: nl })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vervaldatum:</span>
                        <span className="font-semibold">
                          {format(new Date(reservation.reservation_expires_at), 'dd MMM yyyy', { locale: nl })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Laatst bijgewerkt:</span>
                        <span className="font-semibold">
                          {format(new Date(reservation.updated_at), 'dd MMM yyyy', { locale: nl })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Actions */}
                {reservation.payment_status === 'pending' && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-6 w-6 text-orange-500 mr-3 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Betaling Vereist</h4>
                        <p className="text-gray-700 mb-4">
                          Uw reservering is nog niet betaald. Voltooiing van de betaling is vereist om uw reservering te bevestigen.
                        </p>
                        <button
                          onClick={() => router.push(`/betaling/${reservation.id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-500 transition-all duration-300 shadow-md"
                        >
                          Nu Betalen
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-8">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Documenten</h3>
                  <p className="text-gray-600 mb-6">
                    Hier vindt u alle documenten gerelateerd aan uw reservering zodra deze beschikbaar zijn.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                    >
                      <Download className="h-4 w-4 mr-2 inline" />
                      Contract (Binnenkort beschikbaar)
                    </button>
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                    >
                      <Download className="h-4 w-4 mr-2 inline" />
                      Betalingsbewijs (Binnenkort beschikbaar)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Hulp nodig?</h4>
                <p className="text-gray-600 text-sm">Neem contact op voor vragen over uw reservering</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/contact')}
                className="px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-slate-800 transition-all duration-300 shadow-md"
              >
                Contact Opnemen
              </button>
              <button
                onClick={() => router.push('/profiel')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 shadow-md"
              >
                Terug naar Profiel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
