'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Lock, Check, AlertCircle, XCircle, Clock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentStepProps {
  project: any;
  reservationData: any;
  updateData: (data: any) => void;
  onPrev: () => void;
}

function PaymentForm({ project, reservationData, updateData, onPrev, clientSecret, reservationDetails }: PaymentStepProps & { clientSecret: string, reservationDetails: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/betaling-bevestiging/${reservationDetails.id}`,
        payment_method_data: {
          billing_details: {
            name: `${reservationData.customerInfo?.firstName || ''} ${reservationData.customerInfo?.lastName || ''}`,
            email: reservationData.customerInfo?.email || '',
            phone: reservationData.customerInfo?.phone || '',
            address: {
              line1: reservationData.customerInfo?.address || '',
              city: reservationData.customerInfo?.city || '',
              postal_code: reservationData.customerInfo?.postalCode || '',
              country: 'NL',
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Er is een fout opgetreden bij de betaling.');
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      
      // Confirm payment and update reservation status
      // This is a fallback for when Stripe webhooks don't work (e.g., local development)
      try {
        const confirmResponse = await fetch('/api/reservations/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reservation_id: reservationDetails.id,
            payment_intent_id: paymentIntent.id
          }),
        });
        
        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          console.log('✅ Payment confirmed successfully:', confirmData);
        } else {
          console.warn('⚠️ Payment confirmation returned:', confirmData);
        }
      } catch (confirmError) {
        console.error('Error confirming payment:', confirmError);
        // Don't block the flow - the webhook might still handle it
      }
      
      // Redirect to success page
      setTimeout(() => {
        router.push(`/betaling-bevestiging/${reservationDetails.id}`);
      }, 2000);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Betaling geslaagd!
          </h2>
          <p className="text-gray-600 mb-6">
            Uw reservering is bevestigd. U wordt doorgestuurd naar de bevestigingspagina...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Veilige betaling
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Voltooi uw reservering met een veilige betaling
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 order-2 lg:order-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Overzicht reservering
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{reservationDetails.property_name || project.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Unit {reservationData.unitNumber || reservationDetails.unit_number}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{project.location}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Reservering: <span className="font-mono">{reservationDetails.reservation_number}</span>
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Reserveringskosten</span>
                  <span className="font-medium">€{(reservationDetails.reservation_fee_amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Totaal</span>
                  <span className="text-green-600">€{(reservationDetails.reservation_fee_amount / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-800">
                    <div className="font-medium mb-1">Reserveringskosten</div>
                    <div className="leading-relaxed">Dit is een eenmalige betaling voor het reserveren. De koopprijs (€{reservationDetails.total_property_price?.toLocaleString('nl-NL')}) wordt later afgehandeld.</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-yellow-800">
                    <div className="font-medium mb-1">⏱️ Betaal binnen 15 minuten</div>
                    <div className="leading-relaxed">Uw reservering vervalt automatisch als de betaling niet op tijd is voltooid.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 order-1 lg:order-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
              Betalingsgegevens
            </h3>

            {paymentError && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <p className="text-red-800 text-xs sm:text-sm">{paymentError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Kies betaalmethode
                </label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 overflow-hidden">
                  <PaymentElement
                    options={{
                      layout: 'accordion',
                      paymentMethodOrder: ['ideal', 'card', 'bancontact', 'sofort'],
                    }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Lock className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                  <span>Veilig verwerkt door Stripe. Wij bewaren geen gegevens.</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onPrev}
                  className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800 font-medium px-4 sm:px-6 py-3 transition-colors border border-gray-200 rounded-lg sm:border-0"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Terug
                </button>

                <button
                  type="submit"
                  disabled={!stripe || isProcessing}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verwerken...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Betaal €{(reservationDetails.reservation_fee_amount / 100).toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStep(props: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Create reservation and payment intent
    const createReservation = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Je moet ingelogd zijn om een reservering te maken');
        }

        const authHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        };

        // First, get the property ID based on the project slug and unit number
        const unitsResponse = await fetch(`/api/units?type=${props.project.slug.includes('opslagbox') ? 'opslagbox' : 'bedrijfsunit'}&unit_number=${props.reservationData.unitNumber}&status=`);
        
        if (!unitsResponse.ok) {
          throw new Error('Failed to fetch unit details');
        }

        const unitsData = await unitsResponse.json();
        
        if (!unitsData.units || unitsData.units.length === 0) {
          throw new Error('Unit niet gevonden');
        }

        const property = unitsData.units[0];

        console.log('Creating reservation for property:', property.id);

        // Create reservation with payment intent
        const response = await fetch('/api/reservations/create', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            property_id: property.id,
            customer_details: {
              first_name: props.reservationData.customerInfo.firstName,
              last_name: props.reservationData.customerInfo.lastName,
              email: props.reservationData.customerInfo.email,
              phone: props.reservationData.customerInfo.phone,
              company: props.reservationData.customerInfo.company || '',
              address: props.reservationData.customerInfo.address,
              city: props.reservationData.customerInfo.city,
              postal_code: props.reservationData.customerInfo.postalCode,
              country: props.reservationData.customerInfo.country || 'Netherlands',
            },
            intended_use: props.reservationData.preferences?.additionalRequests || 'Aankoop',
            notes: `Move-in date: ${props.reservationData.preferences?.moveInDate || 'TBD'}`,
          }),
        });

        console.log('Reservation creation response status:', response.status);

        if (response.ok) {
            const data = await response.json();
          console.log('Reservation created:', data);
          
          if (data.payment_intent?.client_secret) {
            setClientSecret(data.payment_intent.client_secret);
            setReservationDetails({
              id: data.reservation.id,
              reservation_number: data.reservation.reservation_number,
              property_name: property.name,
              unit_number: property.unit_number,
              reservation_fee_amount: data.reservation.reservation_fee_amount,
              total_property_price: data.reservation.total_property_price,
              expires_at: data.expires_at,
            });
          } else {
            throw new Error('No client secret received');
          }
        } else {
              const errorData = await response.json();
          console.error('Reservation creation error:', errorData);
          throw new Error(errorData.error || 'Failed to create reservation');
        }
      } catch (error: any) {
        console.error('Error creating reservation:', error);
        setError(error.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    createReservation();
  }, [supabase]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#eab308',
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Reservering aanmaken...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reservering kan niet worden aangemaakt
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Opnieuw proberen
          </button>
            <button
              onClick={props.onPrev}
              className="inline-flex items-center border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret || !reservationDetails) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Betaling wordt voorbereid...
          </h2>
          <p className="text-gray-600">
            Een moment geduld terwijl we uw reservering klaarmaken.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} clientSecret={clientSecret} reservationDetails={reservationDetails} />
    </Elements>
  );
}
