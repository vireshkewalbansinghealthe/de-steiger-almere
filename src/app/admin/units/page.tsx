'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Building2, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Unit } from '@/hooks/useUnits';

// Search aliases for better search matching
const SEARCH_ALIASES: Record<string, string[]> = {
  'bedrijfsunit': ['unit', 'kantoor', 'kantoorunit', 'bedrijfsruimte', 'werkruimte', 'werkplek', 'office'],
  'opslagbox': ['opslag', 'box', 'garage', 'garagebox', 'berging', 'storage', 'loods', 'opslagruimte'],
  'almere': ['de steiger', 'steiger', 'flevoland'],
};

// Helper function for enhanced search matching
const matchesSearchTerm = (unit: Unit, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase().trim();
  const searchTerms = term.split(/\s+/);
  
  return searchTerms.every(singleTerm => {
    // Direct field matches
    const directMatch = 
      unit.name?.toLowerCase().includes(singleTerm) ||
      unit.location?.toLowerCase().includes(singleTerm) ||
      unit.description?.toLowerCase().includes(singleTerm) ||
      unit.unit_number?.toLowerCase().includes(singleTerm) ||
      unit.type?.toLowerCase().includes(singleTerm) ||
      `type ${unit.type_number}`.toLowerCase().includes(singleTerm);
    
    if (directMatch) return true;
    
    // Check aliases
    for (const [key, aliases] of Object.entries(SEARCH_ALIASES)) {
      if (aliases.some(alias => alias.includes(singleTerm) || singleTerm.includes(alias))) {
        if (key === 'bedrijfsunit' && unit.type === 'bedrijfsunit') return true;
        if (key === 'opslagbox' && unit.type === 'opslagbox') return true;
        if (key === 'almere' && unit.location?.toLowerCase().includes('almere')) return true;
      }
    }
    
    return false;
  });
};

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bedrijfsunit' | 'opslagbox'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchUnits();
  }, [filter, statusFilter]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .order('type_number', { ascending: true })
        .order('unit_number', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze unit wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchUnits();
      alert('Unit succesvol verwijderd');
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Er is een fout opgetreden bij het verwijderen');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      fetchUnits();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Er is een fout opgetreden bij het bijwerken van de status');
    }
  };

  // Enhanced filtering with search aliases
  const filteredUnits = units.filter(unit => matchesSearchTerm(unit, searchTerm));

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-red-100 text-red-800',
      maintenance: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      available: 'Beschikbaar',
      reserved: 'Gereserveerd',
      sold: 'Verkocht',
      maintenance: 'Onderhoud'
    };

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Unit Beheer
              </h1>
              <p className="text-gray-600 mt-1">Beheer alle bedrijfsunits en opslagboxen</p>
            </div>
            <button
              onClick={() => window.location.href = '/admin/units/create'}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nieuwe Unit
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Zoek op naam, locatie, garage, kantoor, unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle types</option>
              <option value="bedrijfsunit">Bedrijfsunits</option>
              <option value="opslagbox">Opslagboxen</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle statussen</option>
              <option value="available">Beschikbaar</option>
              <option value="reserved">Gereserveerd</option>
              <option value="sold">Verkocht</option>
            </select>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>Totaal: {filteredUnits.length} units</span>
            <span className="text-green-600">Beschikbaar: {filteredUnits.filter(u => u.status === 'available').length}</span>
            <span className="text-yellow-600">Gereserveerd: {filteredUnits.filter(u => u.status === 'reserved').length}</span>
            <span className="text-red-600">Verkocht: {filteredUnits.filter(u => u.status === 'sold').length}</span>
          </div>
        </div>

        {/* Units Table */}
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
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oppervlakte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prijs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                        <div className="text-sm text-gray-500">Unit #{unit.unit_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          unit.type === 'bedrijfsunit' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {unit.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.net_area}m² / {unit.gross_area}m²
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        € {unit.sale_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={unit.status}
                          onChange={(e) => handleStatusChange(unit.id, e.target.value)}
                          className="text-sm border-0 bg-transparent font-semibold focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          <option value="available">Beschikbaar</option>
                          <option value="reserved">Gereserveerd</option>
                          <option value="sold">Verkocht</option>
                          <option value="maintenance">Onderhoud</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => window.location.href = `/admin/units/edit/${unit.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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


