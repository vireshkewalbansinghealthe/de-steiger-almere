'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Check, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface Reservation {
  id: string
  reservation_number: string
  status: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string | null
  customer_company: string | null
  reservation_fee_amount: number
  total_property_price: number
  created_at: string
  properties: {
    name: string
    type: string
    unit_number: string
    images: any
  }
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('ideal')
  const [idealBank, setIdealBank] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            properties (
              name,
              type,
              unit_number,
              images
            )
          `)
          .eq('id', params.reservationId)
          .single()

        if (error) throw error
        setReservation(data)
      } catch (error) {
        console.error('Error fetching reservation:', error)
        setError('Reservering niet gevonden')
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [params.reservationId, supabase])

  const handlePayment = async () => {
    if (!reservation) return

    setProcessing(true)
    setError('')

    try {
      // Create payment intent with Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: reservation.reservation_fee_amount,
          paymentMethod,
          idealBank: paymentMethod === 'ideal' ? idealBank : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to Stripe Checkout or handle payment
      if (data.url) {
        window.location.href = data.url
      } else {
        // Handle other payment methods
        router.push(`/betaling-bevestiging/${reservation.id}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Er is een fout opgetreden bij de betaling')
    } finally {
      setProcessing(false)
    }
  }

  const idealBanks = [
    { id: 'abn_amro', name: 'ABN AMRO' },
    { id: 'asn_bank', name: 'ASN Bank' },
    { id: 'bunq', name: 'bunq' },
    { id: 'handelsbanken', name: 'Handelsbanken' },
    { id: 'ing', name: 'ING' },
    { id: 'knab', name: 'Knab' },
    { id: 'rabobank', name: 'Rabobank' },
    { id: 'regiobank', name: 'RegioBank' },
    { id: 'revolut', name: 'Revolut' },
    { id: 'sns_bank', name: 'SNS Bank' },
    { id: 'triodos_bank', name: 'Triodos Bank' },
    { id: 'van_lanschot', name: 'Van Lanschot' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Fout</h1>
          <p className="text-center text-gray-600 mb-6">{error || 'Er is een onbekende fout opgetreden'}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Terug naar Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Terug
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Betaling</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Betaling Voltooien</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Te betalen bedrag</h3>
                <div className="text-3xl font-bold text-green-600">
                  € {reservation.reservation_fee_amount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Reserveringskosten
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kies een betaalmethode</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50">
                    <input
                      type="radio"
                      name="payment"
                      value="ideal"
                      checked={paymentMethod === 'ideal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">iDEAL</div>
                      <div className="text-sm text-gray-500">Betaal direct via uw bank</div>
                    </div>
                  </label>

                  {paymentMethod === 'ideal' && (
                    <div className="ml-7 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kies uw bank
                      </label>
                      <select
                        value={idealBank}
                        onChange={(e) => setIdealBank(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      >
                        <option value="">Selecteer uw bank</option>
                        {idealBanks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50">
                    <input
                      type="radio"
                      name="payment"
                      value="banktransfer"
                      checked={paymentMethod === 'banktransfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">Bankoverschrijving</div>
                      <div className="text-sm text-gray-500">Handmatige overschrijving (1-3 werkdagen)</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || (paymentMethod === 'ideal' && !idealBank)}
                className="w-full px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verwerken...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Betaal € {reservation.reservation_fee_amount.toLocaleString()}
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 text-center">
                Door op "Betaal" te klikken gaat u akkoord met onze voorwaarden en bevestigt u de reservering.
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Reservering Overzicht</h3>
            
            {reservation.properties.images && reservation.properties.images.length > 0 && (
              <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                <Image
                  src={reservation.properties.images[0]}
                  alt={reservation.properties.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{reservation.properties.name}</h4>
                <p className="text-gray-600">Unit {reservation.properties.unit_number}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Klantgegevens</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Naam:</span>
                    <span>{reservation.customer_first_name} {reservation.customer_last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{reservation.customer_email}</span>
                  </div>
                  {reservation.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefoon:</span>
                      <span>{reservation.customer_phone}</span>
                    </div>
                  )}
                  {reservation.customer_company && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrijf:</span>
                      <span>{reservation.customer_company}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Prijsinformatie</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verkoopprijs:</span>
                    <span className="font-medium">€ {reservation.total_property_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reserveringskosten:</span>
                    <span className="font-medium">€ {reservation.reservation_fee_amount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Nu te betalen:</span>
                      <span className="text-green-600">€ {reservation.reservation_fee_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Veilige betaling:</strong> Uw betaling wordt veilig verwerkt via gecodeerde verbindingen.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
