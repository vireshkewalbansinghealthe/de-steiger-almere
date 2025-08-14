'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { 
  Calendar, 
  MapPin, 
  Euro, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Download,
  Eye
} from 'lucide-react'

interface Reservation {
  id: string
  reservation_number: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_company: string
  reservation_fee_amount: number
  total_property_price: number
  payment_status: string
  paid_at: string | null
  notes: string
  intended_use: string
  reservation_expires_at: string
  created_at: string
  properties: {
    id: string
    name: string
    type: string
    unit_number: string
    type_number: number
    sale_price: number
    images: string[]
    gross_area: number
    net_area: number
  }
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndFetchReservations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Fetch reservations
        const response = await fetch(`/api/reservations?customer_id=${user.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservations')
        }

        const data = await response.json()
        setReservations(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchReservations()
  }, [router, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Bevestigd
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In behandeling
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Geannuleerd
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 2 && diffDays > 0
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mijn Reserveringen</h1>
              <p className="text-gray-600">Overzicht van je reserveringen bij De Steiger</p>
            </div>
            <Link
              href="/"
              className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Terug naar website
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Geen reserveringen</h3>
            <p className="mt-1 text-sm text-gray-500">
              Je hebt nog geen reserveringen gemaakt.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900"
              >
                Bekijk beschikbare units
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {reservation.properties.images && reservation.properties.images.length > 0 ? (
                          <img
                            src={reservation.properties.images[0]}
                            alt={reservation.properties.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            {reservation.properties.type === 'bedrijfsunit' ? (
                              <Building className="h-6 w-6 text-gray-400" />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {reservation.properties.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Reservering #{reservation.reservation_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(reservation.status)}
                      {reservation.status === 'pending' && isExpiringSoon(reservation.reservation_expires_at) && (
                        <span className="text-xs text-red-600 font-medium">
                          Verloopt binnenkort
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Unit {reservation.properties.unit_number} • {reservation.properties.gross_area}m²
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Euro className="h-4 w-4 mr-2" />
                      {formatCurrency(reservation.reservation_fee_amount)} betaald
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(reservation.created_at)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Totale koopprijs:</span>
                        <span className="ml-2 text-gray-600">
                          {formatCurrency(reservation.total_property_price)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Betalingsstatus:</span>
                        <span className={`ml-2 ${reservation.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {reservation.payment_status === 'paid' ? 'Betaald' : 'In behandeling'}
                        </span>
                      </div>
                      {reservation.status === 'pending' && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-900">Reservering verloopt:</span>
                          <span className={`ml-2 ${isExpired(reservation.reservation_expires_at) ? 'text-red-600' : isExpiringSoon(reservation.reservation_expires_at) ? 'text-orange-600' : 'text-gray-600'}`}>
                            {formatDate(reservation.reservation_expires_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(reservation.intended_use || reservation.notes) && (
                    <div className="border-t pt-4 mt-4">
                      {reservation.intended_use && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-900">Beoogd gebruik:</span>
                          <p className="text-sm text-gray-600 mt-1">{reservation.intended_use}</p>
                        </div>
                      )}
                      {reservation.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-900">Opmerkingen:</span>
                          <p className="text-sm text-gray-600 mt-1">{reservation.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 mt-4 border-t">
                    <div className="flex space-x-3">
                      <Link
                        href={`/${reservation.properties.type}/${reservation.properties.type === 'bedrijfsunit' ? 'bedrijfsunit' : 'opslagbox'}-type-${reservation.properties.type_number}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijk Property
                      </Link>
                    </div>
                    
                    {reservation.status === 'confirmed' && (
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                        <Download className="h-4 w-4 mr-2" />
                        Download Contract
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
