'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Building, 
  Package, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Euro,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface DashboardStats {
  total_properties: number
  bedrijfsunits: number
  opslagboxen: number
  available: number
  reserved: number
  sold: number
  total_reservations: number
  pending_reservations: number
  confirmed_reservations: number
  total_revenue_reserved: number
  total_potential_revenue: number
  recent_inquiries: number
  unresponded_inquiries: number
}

interface Reservation {
  id: string
  reservation_number: string
  status: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  reservation_fee_amount: number
  created_at: string
  properties: {
    name: string
    type: string
    unit_number: string
  }
}

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
  properties?: {
    name: string
    type: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setStats(data.statistics)
        setRecentReservations(data.recentReservations)
        setRecentInquiries(data.recentInquiries)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overzicht van De Steiger</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bedrijfsunits
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.bedrijfsunits || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Opslagboxen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.opslagboxen || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reserveringen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.total_reservations || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Omzet Reserveringen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats?.total_revenue_reserved || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Property Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Beschikbaar</span>
                <span className="text-sm font-medium text-green-600">
                  {stats?.available || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gereserveerd</span>
                <span className="text-sm font-medium text-yellow-600">
                  {stats?.reserved || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Verkocht</span>
                <span className="text-sm font-medium text-red-600">
                  {stats?.sold || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Reservering Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In behandeling</span>
                <span className="text-sm font-medium text-yellow-600">
                  {stats?.pending_reservations || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bevestigd</span>
                <span className="text-sm font-medium text-green-600">
                  {stats?.confirmed_reservations || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Onbeantwoorde berichten</span>
                <span className="text-sm font-medium text-red-600">
                  {stats?.unresponded_inquiries || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recente Reserveringen
            </h3>
            <div className="space-y-4">
              {recentReservations.length > 0 ? (
                recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(reservation.status)}
                        <p className="text-sm font-medium text-gray-900">
                          {reservation.customer_first_name} {reservation.customer_last_name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {reservation.properties.name} • {formatCurrency(reservation.reservation_fee_amount)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(reservation.created_at)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Geen recente reserveringen</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recente Berichten
            </h3>
            <div className="space-y-4">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-gray-900">
                          {inquiry.first_name} {inquiry.last_name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {inquiry.subject || 'Algemene vraag'}
                        {inquiry.properties && ` • ${inquiry.properties.name}`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(inquiry.created_at)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Geen recente berichten</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
