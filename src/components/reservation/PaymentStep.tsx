'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Lock, Check, AlertCircle, XCircle, Clock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentStepProps {
  project: any;
  reservationData: any;
  updateData: (data: any) => void;
  onPrev: () => void;
}

function PaymentForm({ project, reservationData, updateData, onPrev }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const selectedUnit = project.details?.unitDetails?.find(
    (unit: any) => unit.unitNumber === reservationData.unitNumber
  );

  // Calculate reservation fee pricing
  const isOpslagbox = project.slug.includes('opslagbox');
  const reservationFee = isOpslagbox ? 50 : 250; // €50 for opslagbox, €250 for bedrijfsunit
  const btw = Math.round(reservationFee * 0.21);
  const totalPrice = reservationFee + btw;

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
        return_url: `${window.location.origin}/betaling-bevestiging/success`,
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
      
      // Save reservation
      await saveReservation(paymentIntent.id);
      
      // Redirect to success page
      setTimeout(() => {
        router.push(`/betaling-bevestiging/${paymentIntent.id}`);
      }, 2000);
    }
  };

  const saveReservation = async (paymentIntentId: string) => {
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reservationData,
          paymentIntentId,
          totalAmount: totalPrice,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error saving reservation:', error);
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
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Veilige betaling
          </h2>
          <p className="text-gray-600">
            Voltooi uw reservering met een veilige betaling
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Overzicht reservering
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm text-gray-600">Unit {reservationData.unitNumber}</div>
                  <div className="text-sm text-gray-600">{project.location}</div>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserveringskosten</span>
                  <span className="font-medium">€{reservationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BTW (21%)</span>
                  <span className="font-medium">€{btw.toLocaleString()}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Totaal</span>
                  <span>€{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Reserveringskosten</div>
                    <div>Dit is een eenmalige betaling voor het reserveren van uw {project.slug.includes('opslagbox') ? 'opslagbox' : 'bedrijfsunit'}. De volledige koopprijs wordt later afgehandeld.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-green-600" />
              Betalingsgegevens
            </h3>

            {paymentError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{paymentError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betaalmethode
                </label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500">
                  <PaymentElement
                    options={{
                      layout: 'accordion',
                      paymentMethodOrder: ['ideal', 'card', 'bancontact', 'sofort'],
                    }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Lock className="h-4 w-4 mr-2 text-green-600" />
                  Uw betaling wordt veilig verwerkt door Stripe. Wij bewaren geen kaartgegevens.
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={onPrev}
                  className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium px-6 py-3 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Vorige stap
                </button>

                <button
                  type="submit"
                  disabled={!stripe || isProcessing}
                  className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verwerken...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Betaal €{totalPrice.toLocaleString()}
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create payment intent for Elements
    const createIntent = async () => {
      try {
        setLoading(true);
        setError('');
        
        const isOpslagbox = props.project.slug.includes('opslagbox');
        const reservationFee = isOpslagbox ? 50 : 250;
        const btw = Math.round(reservationFee * 0.21);
        const totalPrice = reservationFee + btw;

        console.log('Creating payment intent with amount:', totalPrice * 100);

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice * 100,
            currency: 'eur',
            metadata: {
              projectSlug: props.project.slug,
              unitNumber: props.reservationData.unitNumber,
              customerEmail: props.reservationData.customerInfo?.email || '',
              customerName: `${props.reservationData.customerInfo?.firstName || ''} ${props.reservationData.customerInfo?.lastName || ''}`
            }
          }),
        });

        console.log('Payment intent response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Payment intent data:', data);
          if (data.client_secret) {
            setClientSecret(data.client_secret);
          } else {
            throw new Error('No client secret received');
          }
        } else {
          const errorData = await response.json();
          console.error('Payment intent error:', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(error.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, []);

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
          <p className="text-gray-600">Betaling voorbereiden...</p>
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
            Betaling kan niet worden geladen
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
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
            Een moment geduld terwijl we uw betaling voorbereiden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
}
