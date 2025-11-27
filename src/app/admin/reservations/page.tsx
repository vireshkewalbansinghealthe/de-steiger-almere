'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, Eye, CheckCircle, XCircle, Clock, DollarSign, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Reservation {
  id: string;
  reservation_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_company?: string;
  total_property_price: number;
  reservation_fee_amount: number;
  status: 'pending' | 'reservation_paid' | 'fully_paid' | 'transferred' | 'cancelled';
  payment_status: string;
  created_at: string;
  paid_at?: string;
  reservation_expires_at?: string;
  properties: {
    name: string;
    type: string;
    unit_number: string;
    location?: string;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reservation_paid' | 'fully_paid' | 'transferred' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reservations')
        .select(`
          *,
          properties!inner (
            name,
            type,
            unit_number,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'In behandeling',
      reservation_paid: 'Reservering betaald',
      fully_paid: 'Volledig betaald',
      transferred: 'Overgedragen',
      cancelled: 'Geannuleerd'
    };

    if (!confirm(`Weet u zeker dat u de status wilt wijzigen naar "${statusLabels[newStatus] || newStatus}"?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('U bent niet ingelogd');
        return;
      }

      const response = await fetch(`/api/admin/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status bijgewerkt door admin naar ${statusLabels[newStatus] || newStatus}`
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      fetchReservations();
      alert('Status succesvol bijgewerkt');
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Fout: ${error.message || 'Er is een fout opgetreden bij het bijwerken van de status'}`);
    }
  };

  const filteredReservations = reservations.filter(res => 
    res.reservation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${res.customer_first_name} ${res.customer_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reservation_paid: 'bg-blue-100 text-blue-800',
      fully_paid: 'bg-green-100 text-green-800',
      transferred: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'In behandeling',
      reservation_paid: 'Reservering betaald',
      fully_paid: 'Volledig betaald',
      transferred: 'Overgedragen',
      cancelled: 'Geannuleerd'
    };

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getExpiryWarning = (expiresAt?: string) => {
    if (!expiresAt) return null;

    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <span className="text-red-600 text-sm font-medium">Verlopen</span>;
    } else if (daysUntilExpiry <= 7) {
      return <span className="text-orange-600 text-sm font-medium">Verloopt over {daysUntilExpiry} dagen</span>;
    } else {
      return <span className="text-gray-600 text-sm">Verloopt over {daysUntilExpiry} dagen</span>;
    }
  };

  // Calculate statistics
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    reservation_paid: reservations.filter(r => r.status === 'reservation_paid').length,
    fully_paid: reservations.filter(r => r.status === 'fully_paid').length,
    transferred: reservations.filter(r => r.status === 'transferred').length,
    totalRevenue: reservations
      .filter(r => r.status === 'transferred')
      .reduce((sum, r) => sum + r.total_property_price, 0),
    pendingRevenue: reservations
      .filter(r => ['reservation_paid', 'fully_paid'].includes(r.status))
      .reduce((sum, r) => sum + r.total_property_price, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                Reserveringen Beheer
              </h1>
              <p className="text-gray-600 mt-1">Overzicht en beheer van alle reserveringen</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Totaal</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">In behandeling</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Overgedragen</p>
                  <p className="text-2xl font-bold text-green-900">{stats.transferred}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Omzet</p>
                  <p className="text-lg font-bold text-purple-900">€{(stats.totalRevenue / 1000).toFixed(0)}k</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Zoek op reserveringsnummer, naam, email of unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle statussen</option>
              <option value="pending">In behandeling</option>
              <option value="reservation_paid">Reservering betaald</option>
              <option value="fully_paid">Volledig betaald</option>
              <option value="transferred">Overgedragen</option>
              <option value="cancelled">Geannuleerd</option>
            </select>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservering
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bedrag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verloopt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reservation.reservation_number}</div>
                        <div className="text-sm text-gray-500">
                          Reservering: €{reservation.reservation_fee_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.customer_first_name} {reservation.customer_last_name}
                        </div>
                        <div className="text-sm text-gray-500">{reservation.customer_email}</div>
                        {reservation.customer_company && (
                          <div className="text-sm text-gray-500">{reservation.customer_company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reservation.properties.name}</div>
                        <div className="text-sm text-gray-500">Unit #{reservation.properties.unit_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          €{reservation.total_property_price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservation.payment_status === 'paid' ? '✓ Betaald' : 'Niet betaald'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(reservation.created_at), 'dd MMM yyyy', { locale: nl })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                          className="text-sm border-0 bg-transparent font-semibold focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          <option value="pending">In behandeling</option>
                          <option value="reservation_paid">Reservering betaald</option>
                          <option value="fully_paid">Volledig betaald</option>
                          <option value="transferred">Overgedragen</option>
                          <option value="cancelled">Geannuleerd</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getExpiryWarning(reservation.reservation_expires_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => window.location.href = `/admin/reservations/${reservation.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


