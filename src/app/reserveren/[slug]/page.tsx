'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check, CreditCard, FileText, User, Building, Euro, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'

interface Property {
  id: string
  name: string
  type: 'bedrijfsunit' | 'opslagbox'
  unit_number: string
  gross_area: number | null
  net_area: number | null
  industrie_net_area: number | null
  industrie_gross_area: number | null
  kantoor_net_area: number | null
  kantoor_gross_area: number | null
  sale_price: number
  reservation_fee: number | null
  ceiling_height: number | null
  parking_spaces: number | null
  images: any
  features: any
  specifications: any
  location: string | null
  description: string | null
}

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  company_name?: string
}

const steps = [
  { id: 1, name: 'Property Details', icon: Building },
  { id: 2, name: 'Persoonlijke Gegevens', icon: User },
  { id: 3, name: 'Contract Details', icon: FileText },
  { id: 4, name: 'Betaling', icon: CreditCard },
]

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [property, setProperty] = useState<Property | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Nederland',
    intendedUse: '',
    financingConfirmed: false,
    agreeToTerms: false,
    agreeToPrivacy: false,
    marketingConsent: false,
    notes: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              phone: profile.phone,
              company_name: profile.company_name
            })

            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || '',
              phone: profile.phone || '',
              companyName: profile.company_name || ''
            }))
          }
        }

        // Get property details
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select('*')
          .eq('slug', params.slug)
          .single()

        if (error) throw error
        setProperty(propertyData)
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug, router, supabase])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmitReservation = async () => {
    if (!property || !user) return

    setSubmitting(true)
    try {
      const reservationData = {
        property_id: property.id,
        customer_id: user.id,
        customer_first_name: formData.firstName,
        customer_last_name: formData.lastName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_company: formData.companyName,
        customer_address: formData.address,
        customer_city: formData.city,
        customer_postal_code: formData.postalCode,
        customer_country: formData.country,
        reservation_fee_amount: property.reservation_fee || (property.type === 'opslagbox' ? 1500 : 5000),
        total_property_price: property.sale_price,
        status: 'pending',
        intended_use: formData.intendedUse,
        financing_confirmed: formData.financingConfirmed,
        notes: formData.notes
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single()

      if (error) throw error

      // Redirect to payment page
      router.push(`/betaling/${data.id}`)
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Er is een fout opgetreden bij het maken van de reservering. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!property) {
    return <div>Property not found</div>
  }

  const reservationFee = property.reservation_fee || (property.type === 'opslagbox' ? 1500 : 5000)

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
            <h1 className="text-lg font-semibold text-gray-900">Reservering</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-center space-x-8">
                {steps.map((step, index) => {
                  const isCompleted = currentStep > step.id
                  const isCurrent = currentStep === step.id
                  
                  return (
                    <li key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                            isCompleted
                              ? 'bg-yellow-400 border-yellow-400 text-white'
                              : isCurrent
                              ? 'border-yellow-400 text-yellow-400'
                              : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isCurrent ? 'text-yellow-600' : 'text-gray-500'
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="ml-8 w-16 h-0.5 bg-gray-200"></div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  {property.images && property.images.length > 0 && (
                    <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={property.images[0]}
                        alt={property.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                      <p className="text-gray-600">Unit {property.unit_number}</p>
                    </div>
                    
                    {property.description && (
                      <p className="text-gray-700">{property.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Prijsinformatie</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Verkoopprijs:</span>
                        <span className="font-bold text-xl">€ {property.sale_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Reserveringskosten:</span>
                        <span className="font-semibold text-yellow-600">€ {reservationFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Specificaties</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {property.gross_area && (
                        <div>
                          <span className="text-gray-600">Bruto oppervlakte:</span>
                          <p className="font-medium">{property.gross_area} m²</p>
                        </div>
                      )}
                      {property.net_area && (
                        <div>
                          <span className="text-gray-600">Netto oppervlakte:</span>
                          <p className="font-medium">{property.net_area} m²</p>
                        </div>
                      )}
                      {property.ceiling_height && (
                        <div>
                          <span className="text-gray-600">Plafondhoogte:</span>
                          <p className="font-medium">{property.ceiling_height}m</p>
                        </div>
                      )}
                      {property.parking_spaces && (
                        <div>
                          <span className="text-gray-600">Parkeerplaatsen:</span>
                          <p className="font-medium">{property.parking_spaces}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Volgende Stap
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Persoonlijke Gegevens</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voornaam *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achternaam *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoonnummer *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrijfsnaam
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stad *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Vorige
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode}
                  className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volgende Stap
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contract Details */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contract Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beoogd gebruik van de {property.type === 'bedrijfsunit' ? 'bedrijfsunit' : 'opslagbox'}
                  </label>
                  <textarea
                    value={formData.intendedUse}
                    onChange={(e) => handleInputChange('intendedUse', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Beschrijf waarvoor u de unit wilt gebruiken..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aanvullende opmerkingen
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Eventuele vragen of opmerkingen..."
                  />
                </div>

                {property.type === 'bedrijfsunit' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="financing"
                        checked={formData.financingConfirmed}
                        onChange={(e) => handleInputChange('financingConfirmed', e.target.checked)}
                        className="mt-1 h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                      />
                      <label htmlFor="financing" className="ml-3 text-sm text-gray-700">
                        <strong>Financiering bevestigd:</strong> Ik bevestig dat ik de financiering voor deze aankoop heb geregeld of dat ik contant kan betalen.
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                      Ik ga akkoord met de <a href="/algemene-voorwaarden" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline">algemene voorwaarden</a> *
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={formData.agreeToPrivacy}
                      onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                      className="mt-1 h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="privacy" className="ml-3 text-sm text-gray-700">
                      Ik ga akkoord met het <a href="/privacybeleid" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline">privacybeleid</a> *
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={formData.marketingConsent}
                      onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <label htmlFor="marketing" className="ml-3 text-sm text-gray-700">
                      Ik wil graag updates en aanbiedingen ontvangen van De Steiger
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservering Overzicht</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Property:</span>
                      <span className="font-medium">{property.name} - Unit {property.unit_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Verkoopprijs:</span>
                      <span className="font-bold text-xl">€ {property.sale_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Reserveringskosten:</span>
                      <span className="font-semibold text-yellow-600">€ {reservationFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Nu te betalen:</span>
                        <span className="font-bold text-xl text-yellow-600">€ {reservationFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Vorige
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!formData.agreeToTerms || !formData.agreeToPrivacy}
                  className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Naar Betaling
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Betaling</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Te betalen bedrag</h3>
                    <div className="text-3xl font-bold text-green-600">
                      € {reservationFee.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Reserveringskosten voor {property.name}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Betaalmethoden</h4>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="payment" value="ideal" defaultChecked className="h-4 w-4 text-yellow-400 focus:ring-yellow-400" />
                        <span className="ml-3 font-medium">iDEAL</span>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="payment" value="card" className="h-4 w-4 text-yellow-400 focus:ring-yellow-400" />
                        <span className="ml-3 font-medium">Credit Card</span>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="payment" value="banktransfer" className="h-4 w-4 text-yellow-400 focus:ring-yellow-400" />
                        <span className="ml-3 font-medium">Bankoverschrijving</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservering Samenvatting</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{property.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">{property.unit_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Klant:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefoon:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    {formData.companyName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bedrijf:</span>
                        <span className="font-medium">{formData.companyName}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between font-bold">
                        <span>Totaal:</span>
                        <span>€ {reservationFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Vorige
                </button>
                <button
                  onClick={handleSubmitReservation}
                  disabled={submitting}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verwerken...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Reservering Bevestigen
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
