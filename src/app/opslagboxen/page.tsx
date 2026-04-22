'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle, ArrowRight, MapPin, Shield, Home, Phone, Mail, Users, Car, Calendar, Lock, Zap, Grid, List, Map, Share2, Copy, Facebook, Twitter, Link as LinkIcon, Search } from 'lucide-react';
import InteractiveFloorplan from '../../components/InteractiveFloorplan';

// Unit type from API
interface Unit {
  id: string;
  name: string;
  type: string;
  unit_number: string;
  type_number: number;
  gross_area: number;
  net_area: number;
  sale_price: number;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  location: string;
  description: string;
  parking_spaces: number;
  slug: string;
  units_count?: number;
  unit_numbers?: string[];
  available_units_in_type?: number;
  reserved_units_in_type?: number;
  sold_units_in_type?: number;
}

// Search aliases for better search matching
const SEARCH_ALIASES: Record<string, string[]> = {
  'opslagbox': ['opslag', 'box', 'garage', 'garagebox', 'berging', 'storage', 'loods', 'opslagruimte'],
  'bedrijfsunit': ['unit', 'kantoor', 'kantoorunit', 'bedrijfsruimte', 'werkruimte', 'werkplek', 'office'],
  'almere': ['de steiger', 'steiger', 'flevoland'],
};

// Helper function for enhanced search matching
const matchesSearchTerm = (unit: Unit, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase().trim();
  const searchTerms = term.split(/\s+/); // Split on whitespace for multi-word search
  
  // Check each search term
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
      // If search term matches an alias, check if unit relates to that key
      if (aliases.some(alias => alias.includes(singleTerm) || singleTerm.includes(alias))) {
        if (key === 'opslagbox' && unit.type === 'opslagbox') return true;
        if (key === 'bedrijfsunit' && unit.type === 'bedrijfsunit') return true;
        if (key === 'almere' && unit.location?.toLowerCase().includes('almere')) return true;
      }
      // If search term matches the key, check aliases in unit fields
      if (key.includes(singleTerm) || singleTerm.includes(key)) {
        const unitText = `${unit.name} ${unit.location} ${unit.description} ${unit.type}`.toLowerCase();
        if (aliases.some(alias => unitText.includes(alias))) return true;
      }
    }
    
    return false;
  });
};

export default function OpslagboxenPage() {
  const router = useRouter();
  const [storageUnits, setStorageUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'beschikbaar' | 'gereserveerd' | 'verkocht'>('all');
  const [sortBy, setSortBy] = useState<'type_number'>('type_number');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMin, setPriceMin] = useState(30);
  const [priceMax, setPriceMax] = useState(110);
  const [areaMin, setAreaMin] = useState(14);
  const [areaMax, setAreaMax] = useState(49);

  // Fetch opslagboxen from API (grouped by type)
  useEffect(() => {
    const fetchUnits = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/units?type=opslagbox&status=&group_by_type=true');
        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }
        const response_data = await response.json();
        const units_array = response_data.units || [];
        console.log('✅ Fetched', units_array.length, 'opslagbox types (grouped)');
        setStorageUnits(units_array);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching units:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUnits();
  }, []);

  const getFilteredAndSortedProjects = () => {
    let filtered = storageUnits.filter(unit => {
      // Search filter with enhanced matching
      const matchesSearch = matchesSearchTerm(unit, searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'beschikbaar' && unit.status === 'available') ||
        (statusFilter === 'gereserveerd' && unit.status === 'reserved') ||
        (statusFilter === 'verkocht' && unit.status === 'sold');

      // Area range filter
      const area = unit.gross_area || 0;
      const matchesAreaRange = area >= areaMin && area <= areaMax;

      // Price range filter
      const price = (unit.sale_price || 0) / 1000;
      const matchesPriceRange = price >= priceMin && price <= priceMax;

      return matchesSearch && matchesStatus && matchesAreaRange && matchesPriceRange;
    });

    // Sort units
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'type_number':
          const typeA = a.type_number || 0;
          const typeB = b.type_number || 0;
          return typeA - typeB;
        default:
          const defaultTypeA = a.type_number || 0;
          const defaultTypeB = b.type_number || 0;
          return defaultTypeA - defaultTypeB;
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredAndSortedProjects();

  const opslagboxTypesCount = storageUnits.length; // Number of TYPES
  const totalUnitsAtLocation = storageUnits.reduce((sum, unit) => sum + (unit.units_count || 1), 0); // Total individual units

  const generateShareUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sortBy !== 'type_number') params.set('sort', sortBy);
    if (areaMin !== 14 || areaMax !== 49) params.set('area', `${areaMin}-${areaMax}`);
    if (priceMin !== 30 || priceMax !== 110) params.set('price', `${priceMin}-${priceMax}`);
    if (viewMode !== 'grid') params.set('view', viewMode);
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    return baseUrl + (params.toString() ? '?' + params.toString() : '');
  };

  const handleShare = () => {
    const url = generateShareUrl();
    setShareUrl(url);
    setShowShareModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link gekopieerd naar klembord!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link gekopieerd naar klembord!');
    }
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`Bekijk deze geweldige opslagboxen op De Steiger in Almere! ${filteredProjects.length} types gevonden.`);
    
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'available') return 'bg-green-100 text-green-800';
    if (status === 'reserved') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    if (status === 'available') return 'Beschikbaar';
    if (status === 'reserved') return 'Gereserveerd';
    return 'Verkocht';
  };

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locatie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opslagboxen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grootte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prijs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((unit) => (
              <tr 
                key={unit.id} 
                className="hover:bg-gray-50 cursor-pointer" 
                onClick={() => router.push(`/opslagbox/${unit.slug}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={unit.images[0] || '/images/placeholder.png'}
                      alt={unit.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {unit.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {unit.units_count ? `${unit.units_count} units` : `Unit: ${unit.unit_number}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unit.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unit.units_count || 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(unit.gross_area)}m² bruto
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  € {unit.sale_price?.toLocaleString('nl-NL')} v.o.n.
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                    {getStatusText(unit.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Opslagboxen laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">❌ Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background extends behind header */}
        <div className="absolute inset-0 -top-16 md:top-0 h-[calc(100vh+4rem)] md:h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage: 'url(/images/Image23.png)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        
        {/* Content positioned below header */}
        <div className="relative z-10 h-[calc(100vh-4rem)] md:h-screen flex items-center justify-center pt-16 md:pt-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Opslagboxen
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
              {opslagboxTypesCount} types, {totalUnitsAtLocation} opslagboxen — De Steiger 74/77, Almere.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8 md:mb-12">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                  <Archive className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80 text-xs sm:text-base">Totaal Units</div>
                <div className="text-lg sm:text-2xl font-bold text-white">{totalUnitsAtLocation}</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80 text-xs sm:text-base">Locaties</div>
                <div className="text-lg sm:text-2xl font-bold text-white">1</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80 text-xs sm:text-base">Beveiliging</div>
                <div className="text-lg sm:text-2xl font-bold text-white">24/7</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80 text-xs sm:text-base">Vanaf</div>
                <div className="text-base sm:text-xl font-bold text-white">€ 31.240</div>
                <div className="text-white/60 text-xs mt-1">v.o.n. ex. BTW</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#opslagboxen"
                className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg md:hover:bg-slate-50 transition-colors duration-200 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Bekijk Opslagboxen
              </a>
              <a
                href="#voordelen"
                className="bg-white/20 md:hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Waarom De Steiger?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect voor Elke Opslag Behoefte
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Van kleine persoonlijke spullen tot grote bedrijfsinventaris
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-slate-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Particulieren</h3>
              <p className="text-gray-600">
                Seizoensopslag, verhuizing, overtollige spullen - altijd een veilige plek voor je bezittingen.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bedrijven</h3>
              <p className="text-gray-600">
                Archief, inventaris, seizoensartikelen - flexibele opslagruimte die meegroeit met je bedrijf.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-slate-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Voertuigen</h3>
              <p className="text-gray-600">
                Veilige stalling voor auto&apos;s, motoren, campers en andere voertuigen in droge garageboxen.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-slate-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Beleggers</h3>
              <p className="text-gray-600">
                Investeer in opslagboxen - stabiel rendement door constante vraag naar opslagruimte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Storage Section */}
      <section id="opslagboxen" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vind Jouw Perfecte Opslagbox</h2>
            <p className="text-xl text-gray-600">{opslagboxTypesCount} types, {totalUnitsAtLocation} opslagboxen — De Steiger 74/77, Almere</p>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Zoek op locatie, garage, box, opslag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-lg"
              />
            </div>
          </div>

          {/* Content Area with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
              {/* Filter Sidebar */}
              {viewMode !== 'map' && (
              <div className="hidden lg:block w-full lg:w-80 bg-white rounded-lg shadow-sm border p-6 space-y-6 shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle statussen</option>
                    <option value="beschikbaar">Beschikbaar</option>
                    <option value="gereserveerd">Gereserveerd</option>
                    <option value="verkocht">Verkocht</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sorteren</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="type_number">Op type nummer (Type 1 → 16)</option>
                  </select>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Oppervlakte: {areaMin}m² - {areaMax}m²
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                      <input
                        type="range"
                        min="14"
                        max="49"
                        step="1"
                        value={areaMin}
                        onChange={(e) => setAreaMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>14m²</span>
                        <span>49m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min="14"
                        max="49"
                        step="1"
                        value={areaMax}
                        onChange={(e) => setAreaMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>14m²</span>
                        <span>49m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Prijs: €{priceMin}k - €{priceMax}k
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                      <input
                        type="range"
                        min="30"
                        max="110"
                        step="5"
                        value={priceMin}
                        onChange={(e) => setPriceMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€30k</span>
                        <span>€110k</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min="30"
                        max="110"
                        step="5"
                        value={priceMax}
                        onChange={(e) => setPriceMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€30k</span>
                        <span>€110k</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setAreaMin(14);
                    setAreaMax(49);
                    setPriceMin(30);
                    setPriceMax(110);
                    setSortBy('type_number');
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
              )}

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Top Controls */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-sm font-medium text-gray-700">Weergave:</span>
                    <div className="flex bg-white rounded border">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 text-sm rounded-l ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 text-sm border-l border-r border-gray-200 ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1 text-sm rounded-r ${viewMode === 'map' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Map className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      {viewMode === 'map' ? (
                        <>
                          <Grid className="w-4 h-4" />
                          Bekijk Types
                        </>
                      ) : (
                        <>
                          <Map className="w-4 h-4" />
                          Bekijk plattegrond
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Delen
                    </button>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  {filteredProjects.length} van {storageUnits.length} opslagbox types gevonden
                </div>

                {/* Opslagboxen Grid/Table */}
                {viewMode === 'map' ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <InteractiveFloorplan />
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredProjects.map((unit) => (
                      <Link href={`/opslagbox/${unit.slug}`} key={unit.id}>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer">
                          <div className="relative">
                            <img
                              src={unit.images[0] || '/images/placeholder.png'}
                              alt={unit.name}
                              className="w-full h-64 object-cover"
                            />
                            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(unit.status)}`}>
                              {getStatusText(unit.status)}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{unit.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              {unit.units_count ? `${unit.units_count} ${unit.units_count === 1 ? 'unit' : 'units'} beschikbaar` : `Unit: ${unit.unit_number}`}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">{unit.location || 'Almere'}</p>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Bruto oppervlakte:</span>
                                <span className="font-semibold text-gray-900">{Math.round(unit.gross_area)}m²</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Prijs:</span>
                                <span className="font-bold text-slate-800">€ {unit.sale_price?.toLocaleString('nl-NL')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  renderTableView()
                )}
              </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="voordelen" className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Waarom Kiezen voor De Steiger Opslagboxen?
            </h2>
            <p className="text-xl text-slate-100 max-w-3xl mx-auto">
              Veiligheid, toegankelijkheid en service staan bij ons voorop
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Maximale Beveiliging</h3>
              <p className="text-slate-100">
                24/7 toegangscontrole, alarmsysteem en inbraakdetectie voor volledige gemoedsrust.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Toegang</h3>
              <p className="text-slate-100">
                Wanneer jij wilt, toegang tot je opslagruimte. Geen wachttijden, altijd beschikbaar.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Droog & Klimaatbestendig</h3>
              <p className="text-slate-100">
                Geïsoleerde boxen met ventilatie. Je spullen blijven droog en in perfecte conditie.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Makkelijk Bereikbaar</h3>
              <p className="text-slate-100">
                Directe toegang met de auto, brede gangen en laadperrons voor gemakkelijk laden en lossen.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Flexibele Contracten</h3>
              <p className="text-slate-100">
                Kort en lang huren mogelijk. Upgrade of downgrade je opslagruimte wanneer nodig.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Persoonlijke Service</h3>
              <p className="text-slate-100">
                Lokaal beheer, snelle service en altijd een aanspreekpunt voor al je vragen.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Deel deze zoekresultaten</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Deel deze gefilterde weergave van {filteredProjects.length} opslagbox types met anderen.
            </p>

            {/* URL Display and Copy */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                >
                  <Copy className="h-4 w-4" />
                  Kopieer
                </button>
              </div>
            </div>

            {/* Social Sharing Buttons */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Delen via:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <span className="text-lg">💬</span>
                  WhatsApp
                </button>
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </button>
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
                >
                  <LinkIcon className="h-4 w-4" />
                  LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
