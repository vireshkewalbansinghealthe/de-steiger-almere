'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User, Mail, Phone, Building, MapPin, Calendar, CreditCard, FileText, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company_name: string | null
  role: string
  created_at: string
  updated_at: string
}

interface Reservation {
  id: string
  reservation_number: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
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

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company_name: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)
        setEditForm({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          company_name: profileData.company_name || ''
        })

        // Get user reservations
        const { data: reservationsData, error: reservationsError } = await supabase
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
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (reservationsError) throw reservationsError
        setReservations(reservationsData || [])

      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [router, supabase])

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          company_name: editForm.company_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
        company_name: editForm.company_name
      } : null)

      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Er is een fout opgetreden bij het opslaan van uw profiel.')
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    
    const labels = {
      pending: 'In behandeling',
      confirmed: 'Bevestigd',
      cancelled: 'Geannuleerd',
      completed: 'Voltooid'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profiel niet gevonden</h1>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Inloggen
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
            <h1 className="text-xl font-semibold text-gray-900">Mijn Profiel</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white rounded-full mb-4">
                  <User className="h-10 w-10 text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-center text-white">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-center text-yellow-100 mt-1">{profile.email}</p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Persoonlijke Gegevens</h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="p-2 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setEditForm({
                            first_name: profile.first_name || '',
                            last_name: profile.last_name || '',
                            phone: profile.phone || '',
                            company_name: profile.company_name || ''
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">E-mail</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Naam</p>
                      {editing ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Voornaam"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Achternaam"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <p className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Telefoon</p>
                      {editing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Telefoonnummer"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-medium">{profile.phone || 'Niet opgegeven'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Bedrijf</p>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.company_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                          placeholder="Bedrijfsnaam"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-medium">{profile.company_name || 'Niet opgegeven'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Lid sinds</p>
                      <p className="font-medium">
                        {format(new Date(profile.created_at), 'MMMM yyyy', { locale: nl })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reservations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Mijn Reserveringen</h3>
              </div>

              <div className="p-6">
                {reservations.length > 0 ? (
                  <div className="space-y-6">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {reservation.properties.name}
                            </h4>
                            <p className="text-gray-600">Unit {reservation.properties.unit_number}</p>
                            <p className="text-sm text-gray-500">
                              Reservering #{reservation.reservation_number}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Reserveringsdatum</p>
                            <p className="font-medium">
                              {format(new Date(reservation.created_at), 'dd MMM yyyy', { locale: nl })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Verkoopprijs</p>
                            <p className="font-bold text-lg">€ {reservation.total_property_price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Reserveringskosten</p>
                            <p className="font-medium text-yellow-600">€ {reservation.reservation_fee_amount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            Type: {reservation.properties.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/reservering/${reservation.id}`)}
                              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                            >
                              Details
                            </button>
                            {reservation.status === 'pending' && (
                              <button
                                onClick={() => router.push(`/betaling/${reservation.id}`)}
                                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                Betalen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Geen reserveringen</h4>
                    <p className="text-gray-500 mb-6">U heeft nog geen reserveringen geplaatst.</p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Bekijk Beschikbare Units
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
