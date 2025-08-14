'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Check, CreditCard, AlertCircle, Download, Mail, Phone } from 'lucide-react'
import Image from 'next/image'

interface Reservation {
  id: string
  reservation_number: string
  status: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string | null
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

export default function PaymentConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const paymentMethod = searchParams.get('method')
  const idealBank = searchParams.get('bank')

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

        // Simulate payment processing completion
        // In a real implementation, this would be handled by webhooks from the payment provider
        setTimeout(async () => {
          await supabase
            .from('reservations')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', params.reservationId)
          
          setReservation(prev => prev ? { ...prev, status: 'confirmed' } : null)
        }, 2000)

      } catch (error) {
        console.error('Error fetching reservation:', error)
        setError('Reservering niet gevonden')
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [params.reservationId, supabase])

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case 'ideal':
        return `iDEAL${idealBank ? ` (${idealBank})` : ''}`
      case 'card':
        return 'Credit/Debit Card'
      case 'banktransfer':
        return 'Bankoverschrijving'
      default:
        return 'Online betaling'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Betaling verwerken...</h1>
          <p className="text-gray-600">Een moment geduld terwijl we uw betaling verwerken.</p>
        </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white rounded-full mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Betaling Geslaagd!</h1>
            <p className="text-green-100 text-lg">
              Uw reservering is bevestigd
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reservation Details */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservering Details</h2>
                
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
                    <h3 className="text-lg font-semibold text-gray-900">{reservation.properties.name}</h3>
                    <p className="text-gray-600">Unit {reservation.properties.unit_number}</p>
                    <p className="text-sm text-gray-500">
                      Reservering #{reservation.reservation_number}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Status: Bevestigd</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verkoopprijs:</span>
                      <span className="font-bold">€ {reservation.total_property_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserveringskosten:</span>
                      <span className="font-medium text-green-600">€ {reservation.reservation_fee_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Betaalmethode:</span>
                      <span>{getPaymentMethodLabel(paymentMethod)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Volgende Stappen</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3">Wat gebeurt er nu?</h3>
                    <div className="space-y-3 text-sm text-blue-800">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-bold">1</span>
                        </div>
                        <p>U ontvangt binnen 24 uur een bevestigingsmail met alle details</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-bold">2</span>
                        </div>
                        <p>Onze makelaar neemt contact met u op voor de koopovereenkomst</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-bold">3</span>
                        </div>
                        <p>Na ondertekening wordt de resterende koopsom gefactureerd</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-3">Contact</h3>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>info@desteiger.nl</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>036 - 123 4567</span>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-700 mt-3">
                      Heeft u vragen over uw reservering? Neem gerust contact met ons op.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Bevestiging Printen
                    </button>
                    
                    <button
                      onClick={() => router.push('/profiel')}
                      className="w-full px-4 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Ga naar Mijn Profiel
                    </button>
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
