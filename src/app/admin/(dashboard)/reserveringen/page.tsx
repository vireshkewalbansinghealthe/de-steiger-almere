'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface Reservation {
  id: string
  created_at: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string | null
  customer_company: string | null
  property_id: string
  reservation_fee_amount: number
  total_property_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string | null
  properties?: {
    name: string
    unit_number: string
    type: string
  }
}

export default function ReserveringenPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          properties:property_id (
            name,
            unit_number,
            type
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      
      setReservations(prev => 
        prev.map(res => res.id === id ? { ...res, status: status as any } : res)
      )
    } catch (error) {
      console.error('Error updating reservation:', error)
    }
  }

  const filteredReservations = reservations.filter(res => 
    statusFilter === 'all' || res.status === statusFilter
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      pending: 'In behandeling',
      confirmed: 'Bevestigd',
      cancelled: 'Geannuleerd'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reserveringen</h1>
        <p className="text-gray-600">Beheer alle reserveringen voor bedrijfsunits en opslagboxen</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          >
            <option value="all">Alle statussen</option>
            <option value="pending">In behandeling</option>
            <option value="confirmed">Bevestigd</option>
            <option value="cancelled">Geannuleerd</option>
          </select>
        </div>
        
        <div className="ml-auto text-sm text-gray-500">
          {filteredReservations.length} van {reservations.length} reserveringen
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prijs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reservation.customer_first_name} {reservation.customer_last_name}</div>
                      <div className="text-sm text-gray-500">{reservation.customer_email}</div>
                      <div className="text-sm text-gray-500">{reservation.customer_phone || 'Geen telefoon'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reservation.properties?.name || 'Onbekend'}</div>
                      <div className="text-sm text-gray-500">Unit {reservation.properties?.unit_number || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">€ {reservation.total_property_price.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Reservering: € {reservation.reservation_fee_amount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(reservation.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reservation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors"
                    >
                      Details
                    </button>
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Bevestigen
                        </button>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Annuleren
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Geen reserveringen gevonden</div>
            <p className="text-gray-400 mt-2">Er zijn nog geen reserveringen geplaatst.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reservering Details</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Klantgegevens</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Naam</label>
                      <p className="text-gray-900">{selectedReservation.customer_first_name} {selectedReservation.customer_last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">E-mail</label>
                      <p className="text-gray-900">{selectedReservation.customer_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefoon</label>
                      <p className="text-gray-900">{selectedReservation.customer_phone || 'Niet opgegeven'}</p>
                    </div>
                    {selectedReservation.customer_company && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bedrijf</label>
                        <p className="text-gray-900">{selectedReservation.customer_company}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-gray-900">{selectedReservation.properties?.name || 'Onbekend'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Unit Nummer</label>
                      <p className="text-gray-900">{selectedReservation.properties?.unit_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Verkoopprijs</label>
                      <p className="text-gray-900 text-xl font-bold">€ {selectedReservation.total_property_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reserveringskosten</label>
                      <p className="text-gray-900">€ {selectedReservation.reservation_fee_amount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500">Reserveringsdatum</label>
                <p className="text-gray-900">
                  {format(new Date(selectedReservation.created_at), 'EEEE dd MMMM yyyy \'om\' HH:mm', { locale: nl })}
                </p>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-2">
                  {getStatusBadge(selectedReservation.status)}
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">Opmerkingen</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedReservation.notes}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-3">
                {selectedReservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'confirmed')
                        setSelectedReservation(null)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Bevestigen
                    </button>
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'cancelled')
                        setSelectedReservation(null)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Annuleren
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
