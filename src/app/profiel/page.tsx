'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User, Mail, Phone, Building, MapPin, Calendar, CreditCard, FileText, Edit, Save, X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company_name: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  role: string
  created_at: string
  updated_at: string
}

interface Reservation {
  id: string
  reservation_number: string
  status: 'pending' | 'reservation_paid' | 'fully_paid' | 'transferred' | 'cancelled'
  reservation_fee_amount: number
  total_property_price: number
  created_at: string
  reservation_expires_at?: string
  properties: {
    name: string
    type: string
    unit_number: string
    images: any
    location?: string
    gross_area?: number
    net_area?: number
    sale_price?: number
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
    company_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Nederland'
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
          company_name: profileData.company_name || '',
          address: profileData.address || '',
          city: profileData.city || '',
          postal_code: profileData.postal_code || '',
          country: profileData.country || 'Nederland'
        })

        // Get user reservations with property details
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select(`
            *,
            properties!inner (
              name,
              type,
              unit_number,
              images,
              location,
              gross_area,
              net_area,
              sale_price
            )
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (reservationsError) {
          console.error('Error fetching reservations:', reservationsError)
        } else {
          console.log('Fetched reservations:', reservationsData)
        setReservations(reservationsData || [])
        }

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
          address: editForm.address,
          city: editForm.city,
          postal_code: editForm.postal_code,
          country: editForm.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
        company_name: editForm.company_name,
        address: editForm.address,
        city: editForm.city,
        postal_code: editForm.postal_code,
        country: editForm.country
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
      pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md',
      reservation_paid: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md',
      fully_paid: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md',
      transferred: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md',
      cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
    }
    
    const labels = {
      pending: 'In behandeling',
      reservation_paid: 'Reservering betaald',
      fully_paid: 'Volledig betaald',
      transferred: 'Overgedragen',
      cancelled: 'Geannuleerd'
    }

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getExpiryBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return (
        <div className="text-red-600 font-semibold flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Verlopen
        </div>
      );
    } else if (daysLeft <= 7) {
      return (
        <div className="text-red-600 font-semibold flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Verloopt over {daysLeft} {daysLeft === 1 ? 'dag' : 'dagen'}
        </div>
      );
    } else {
      return (
        <div className="text-gray-600 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Geldig tot {format(expiry, 'dd MMM yyyy', { locale: nl })}
        </div>
      );
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/images/up/Image1.png')] bg-cover bg-center opacity-10"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welkom terug, {profile.first_name || 'Gebruiker'}
              </h1>
              <p className="text-slate-300 text-lg">
                Beheer uw profiel en bekijk uw reserveringen
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-4 shadow-lg">
                  <User className="h-10 w-10 text-slate-900" />
                </div>
                <h2 className="text-xl font-bold text-center text-white">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-center text-slate-300 mt-1">{profile.email}</p>
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
                            company_name: profile.company_name || '',
                            address: profile.address || '',
                            city: profile.city || '',
                            postal_code: profile.postal_code || '',
                            country: profile.country || 'Nederland'
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
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                          />
                          <input
                            type="text"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Achternaam"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        />
                      ) : (
                        <p className="font-medium">{profile.company_name || 'Niet opgegeven'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Adres</p>
                      {editing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.address}
                            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Straat en huisnummer"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                          />
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={editForm.postal_code}
                              onChange={(e) => setEditForm(prev => ({ ...prev, postal_code: e.target.value }))}
                              placeholder="Postcode"
                              className="w-1/3 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                            />
                            <input
                              type="text"
                              value={editForm.city}
                              onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="Plaats"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                            />
                          </div>
                          <input
                            type="text"
                            value={editForm.country}
                            onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="Land"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      ) : (
                        <div className="font-medium">
                          {profile.address && profile.city ? (
                            <>
                              <p>{profile.address}</p>
                              <p>{profile.postal_code} {profile.city}</p>
                              <p>{profile.country}</p>
                            </>
                          ) : (
                            <p>Niet opgegeven</p>
                          )}
                        </div>
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 text-yellow-500 mr-3" />
                  Mijn Reserveringen
                </h3>
                <p className="text-gray-600 mt-1">Overzicht van al uw gemaakte reserveringen</p>
              </div>

              <div className="p-6">
                {reservations.length > 0 ? (
                  <div className="space-y-6">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-r from-gray-50 to-white hover:shadow-lg transition-all duration-300">
                        {/* Unit Image */}
                        {reservation.properties.images && reservation.properties.images.length > 0 && (
                          <div className="h-48 bg-gray-200 overflow-hidden">
                            <img 
                              src={reservation.properties.images[0]} 
                              alt={reservation.properties.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">
                              {reservation.properties.name}
                            </h4>
                            <p className="text-gray-600 font-medium">Unit {reservation.properties.unit_number}</p>
                            <p className="text-sm text-gray-500">
                              Reservering #{reservation.reservation_number}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                              <p className="font-medium text-yellow-600">€ {(reservation.reservation_fee_amount / 100).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Geldig tot</p>
                              {getExpiryBadge(reservation.reservation_expires_at)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            Type: {reservation.properties.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}
                          </span>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => router.push(`/reservering/${reservation.id}`)}
                              className="px-4 py-2 text-sm bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-slate-900 hover:to-slate-800 transition-all duration-300 font-medium shadow-md"
                            >
                              Details bekijken
                            </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileText className="h-10 w-10 text-slate-900" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">Geen reserveringen</h4>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      U heeft nog geen reserveringen geplaatst. Ontdek onze beschikbare bedrijfsunits en opslagboxen.
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
