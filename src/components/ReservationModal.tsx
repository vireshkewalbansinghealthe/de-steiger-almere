'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase'
import { X, CreditCard, User, Building, Euro } from 'lucide-react'
import { Property } from '@/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ReservationModalProps {
  property: Property
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ReservationFormData {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_company: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_country: string
  notes: string
  intended_use: string
}

const PaymentForm = ({ 
  property, 
  formData, 
  onSuccess, 
  onError 
}: { 
  property: Property
  formData: ReservationFormData
  onSuccess: () => void
  onError: (error: string) => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        onError('Je moet ingelogd zijn om een reservering te maken')
        setProcessing(false)
        return
      }

      // Create reservation
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create reservation')
      }

      const { client_secret } = await response.json()

      // Confirm payment
      const { error: paymentError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: `${formData.customer_first_name} ${formData.customer_last_name}`,
            email: formData.customer_email,
            phone: formData.customer_phone,
            address: {
              line1: formData.customer_address,
              city: formData.customer_city,
              postal_code: formData.customer_postal_code,
              country: formData.customer_country === 'Netherlands' ? 'NL' : formData.customer_country,
            },
          },
        },
      })

      if (paymentError) {
        onError(paymentError.message || 'Payment failed')
      } else {
        onSuccess()
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Betaalgegevens</h4>
        <div className="bg-white p-3 border rounded">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Je betaalt nu de reserveringskosten van {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(property.reservation_fee || 1500)}.
          De resterende koopsom wordt later afgehandeld.
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {processing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Reserveer Nu - {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(property.reservation_fee || 1500)}</span>
          </>
        )}
      </button>
    </form>
  )
}

export default function ReservationModal({ property, isOpen, onClose, onSuccess }: ReservationModalProps) {
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ReservationFormData>({
    customer_first_name: '',
    customer_last_name: '',
    customer_email: '',
    customer_phone: '',
    customer_company: '',
    customer_address: '',
    customer_city: '',
    customer_postal_code: '',
    customer_country: 'Netherlands',
    notes: '',
    intended_use: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    setError('')
    
    // Validate required fields
    const requiredFields = ['customer_first_name', 'customer_last_name', 'customer_email', 'customer_phone']
    const missingFields = requiredFields.filter(field => !formData[field as keyof ReservationFormData])
    
    if (missingFields.length > 0) {
      setError('Vul alle verplichte velden in')
      return
    }

    setStep(2)
  }

  const handleSuccess = () => {
    setSuccess(true)
    setTimeout(() => {
      onSuccess?.()
      onClose()
    }, 2000)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Reserveer {property.name}
              </h3>
              <p className="text-sm text-gray-600">
                Unit {property.unit_number} • {property.gross_area}m²
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Reservering Succesvol!</h4>
              <p className="text-gray-600">Je ontvangt een bevestiging per e-mail.</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <>
              {/* Step Indicator */}
              <div className="flex items-center mb-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  <User className="h-4 w-4" />
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Persoonlijke Gegevens</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Voornaam *
                      </label>
                      <input
                        type="text"
                        name="customer_first_name"
                        value={formData.customer_first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Achternaam *
                      </label>
                      <input
                        type="text"
                        name="customer_last_name"
                        value={formData.customer_last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mailadres *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefoonnummer *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrijfsnaam (optioneel)
                    </label>
                    <input
                      type="text"
                      name="customer_company"
                      value={formData.customer_company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <input
                      type="text"
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plaats
                      </label>
                      <input
                        type="text"
                        name="customer_city"
                        value={formData.customer_city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postcode
                      </label>
                      <input
                        type="text"
                        name="customer_postal_code"
                        value={formData.customer_postal_code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beoogd gebruik
                    </label>
                    <textarea
                      name="intended_use"
                      value={formData.intended_use}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Waarvoor wilt u deze ruimte gebruiken?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opmerkingen
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Aanvullende opmerkingen of vragen"
                    />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Doorgaan naar Betaling
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Reservering Overzicht</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Property:</span>
                        <span>{property.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unit nummer:</span>
                        <span>{property.unit_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Oppervlakte:</span>
                        <span>{property.gross_area}m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Totale koopprijs:</span>
                        <span>{new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(property.sale_price)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Reserveringskosten:</span>
                        <span>{new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(property.reservation_fee || 1500)}</span>
                      </div>
                    </div>
                  </div>

                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      property={property}
                      formData={formData}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  </Elements>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Terug naar Gegevens
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
