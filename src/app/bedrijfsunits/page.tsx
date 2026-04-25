'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, MapPin, Zap, Shield, Calendar, Grid, List, Map, Share2, Copy, Facebook, Twitter, Link as LinkIcon, Users, Phone, Mail, Search, Loader2 } from 'lucide-react';
import InteractiveFloorplan from '../../components/InteractiveFloorplan';

interface Unit {
  id: string;
  name: string;
  type: 'bedrijfsunit' | 'opslagbox';
  unit_number: string;
  type_number?: number;
  gross_area: number;
  net_area: number;
  sale_price: number;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  location: string;
  description?: string;
  features?: string[];
  units_count?: number;
}

// Search aliases for better search matching
const SEARCH_ALIASES: Record<string, string[]> = {
  'bedrijfsunit': ['unit', 'kantoor', 'kantoorunit', 'bedrijfsruimte', 'werkruimte', 'werkplek', 'office'],
  'opslagbox': ['opslag', 'box', 'garage', 'garagebox', 'berging', 'storage', 'loods'],
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
        if (key === 'bedrijfsunit' && unit.type === 'bedrijfsunit') return true;
        if (key === 'opslagbox' && unit.type === 'opslagbox') return true;
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

export default function BedrijfsunitsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'beschikbaar' | 'gereserveerd' | 'verkocht'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'area' | 'location' | 'unit_number'>('price');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [priceMin, setPriceMin] = useState(200);
  const [priceMax, setPriceMax] = useState(1000);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(500);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Backend data state
  const [businessUnits, setBusinessUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: 'Kopen voor eigen gebruik',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const heroImages = [
    '/images/up/Image1.png',
    '/images/up/Image2.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch bedrijfsunits from backend (grouped by type)
  useEffect(() => {
    const fetchUnits = async () => {
      setIsLoading(true);
      try {
        // Fetch GROUPED by type - shows 1 card per type (12 types)
        const response = await fetch('/api/units?type=bedrijfsunit&status=&group_by_type=true');
        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }
        const response_data = await response.json();
        const units_array = response_data.units || [];
        console.log('✅ Fetched', units_array.length, 'bedrijfsunit TYPES');
        setBusinessUnits(units_array);
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

  const businessUnitTypesCount = businessUnits.length; // Number of TYPES
  const totalUnitsAtLocation = businessUnits.reduce((sum, unit) => sum + (unit.units_count || 1), 0); // Total individual units

  const getFilteredAndSortedProjects = () => {
    let filtered = businessUnits.filter(unit => {
      // Search filter with enhanced matching
      const matchesSearch = matchesSearchTerm(unit, searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'beschikbaar' && unit.status === 'available') ||
        (statusFilter === 'gereserveerd' && unit.status === 'reserved') ||
        (statusFilter === 'verkocht' && unit.status === 'sold');

      // Type filter — always include all types in grid (grey-out handled in render)
      const matchesType = true;

      // Area range filter
      const area = unit.net_area || unit.gross_area || 0;
      const matchesAreaRange = area >= areaMin && area <= areaMax;

      // Price range filter (convert price from euros to thousands)
      const priceInThousands = parseFloat(unit.sale_price.toString()) / 1000;
      const matchesPriceRange = priceInThousands >= priceMin && priceInThousands <= priceMax;

      // Area filter - based on unit area
      let matchesArea = true;
      if (areaFilter !== 'all') {
        if (areaFilter === 'small') matchesArea = area < 150;
        else if (areaFilter === 'medium') matchesArea = area >= 150 && area <= 250;
        else if (areaFilter === 'large') matchesArea = area > 250;
      }

      return matchesSearch && matchesStatus && matchesType && matchesAreaRange && matchesPriceRange && matchesArea;
    });

    // Sort units
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'unit_number':
          // Sorteer numeriek op type_number (Type 1 → Type 12)
          const typeA = a.type_number || 0;
          const typeB = b.type_number || 0;
          return typeA - typeB;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = parseFloat(a.sale_price.toString());
          const priceB = parseFloat(b.sale_price.toString());
          return priceA - priceB;
        case 'area':
          const areaA = a.net_area || a.gross_area || 0;
          const areaB = b.net_area || b.gross_area || 0;
          return areaA - areaB;
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        default:
          // Fallback: sorteer op type_number
          const defaultTypeA = a.type_number || 0;
          const defaultTypeB = b.type_number || 0;
          return defaultTypeA - defaultTypeB;
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredAndSortedProjects();



  const generateShareUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (areaMin !== 0 || areaMax !== 500) params.set('area', `${areaMin}-${areaMax}`);
    if (priceMin !== 200 || priceMax !== 1000) params.set('price', `${priceMin}-${priceMax}`);
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
    const text = encodeURIComponent(`Bekijk deze geweldige bedrijfsunits op De Steiger in Almere! ${filteredProjects.length} types gevonden.`);
    
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formType: 'bedrijfsunits'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        // Reset form
        setFormData({
          name: '',
          email: '',
          interest: 'Kopen voor eigen gebruik',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Er is een fout opgetreden');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Er is een fout opgetreden bij het verzenden van uw bericht');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locatie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oppervlakte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parkeerplaatsen
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
              <tr key={unit.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/bedrijfsunit/bedrijfsunit-type-${unit.type_number}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={unit.images?.[0] || '/images/placeholder.jpg'}
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
                  {unit.location || 'Almere'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unit.gross_area} m²
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2 parkeerplaatsen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  €{unit.sale_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    unit.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : unit.status === 'reserved'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {unit.status === 'available' ? 'Beschikbaar' : unit.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {heroImages.map((image, index) => (
        <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transform scale-105 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
              backgroundImage: `url(${image})`,
          }}
        />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Bedrijfsunits
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              {businessUnitTypesCount} types, {totalUnitsAtLocation} units op De Steiger 74/77 in Almere. Elke unit inclusief 2 parkeerplaatsen.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-4 mb-2">
                  <Building2 className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80">Totaal Units</div>
                <div className="text-2xl font-bold text-white">
                  {totalUnitsAtLocation}
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-4 mb-2">
                  <MapPin className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80">Locaties</div>
                <div className="text-2xl font-bold text-white">1</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-4 mb-2">
                  <Zap className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80">Energielabel</div>
                <div className="text-2xl font-bold text-white">A+</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-4 mb-2">
                  <Users className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-white/80">Vanaf</div>
                <div className="text-2xl font-bold text-white">
                  {businessUnits.length > 0
                    ? `€ ${Math.min(...businessUnits.map(u => Number(u.sale_price))).toLocaleString('nl-NL')}`
                    : '—'}
                </div>
                <div className="text-sm text-white/60">v.o.n. ex. BTW</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#units"
                className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Bekijk Units
              </a>
              <a
                href="#investeren"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Waarom Investeren?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Units Section */}
      <section id="units" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vind Jouw Perfecte Unit</h2>
            <p className="text-xl text-gray-600">{businessUnitTypesCount} types, {totalUnitsAtLocation} units — De Steiger 74/77, Almere</p>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Zoek op locatie, type, kantoor, unit..."
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
              <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border p-6 space-y-6 shrink-0">
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
                    <option value="unit_number">Op type nummer (Type 1 → 12)</option>
                    <option value="name">Op naam</option>
                    <option value="price">Op prijs (laag → hoog)</option>
                    <option value="area">Op oppervlakte (groot → klein)</option>
                    <option value="location">Op locatie</option>
              </select>
            </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Types</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Array.from(new Set(businessUnits.map(p => p.name))).map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
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
                        min="0"
                        max="500"
                        step="5"
                        value={areaMin}
                        onChange={(e) => setAreaMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0m²</span>
                        <span>500m²</span>
                  </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="5"
                        value={areaMax}
                        onChange={(e) => setAreaMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0m²</span>
                        <span>500m²</span>
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
                        min="200"
                        max="1000"
                        step="10"
                        value={priceMin}
                        onChange={(e) => setPriceMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€200k</span>
                        <span>€1.000k</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min="200"
                        max="1000"
                        step="10"
                        value={priceMax}
                        onChange={(e) => setPriceMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€200k</span>
                        <span>€1.000k</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSelectedTypes([]);
                    setAreaMin(0);
                    setAreaMax(500);
                    setPriceMin(200);
                    setPriceMax(1000);
                    setSortBy('name');
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

                  <button
                    onClick={() => setViewMode('map')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <Map className="w-4 h-4" />
                    Bekijk virtuele map
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Delen
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  {selectedTypes.length > 0 ? selectedTypes.length : filteredProjects.length} van {businessUnits.length} bedrijfsunit types geselecteerd
          </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    <span className="ml-3 text-gray-600">Laden...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Fout bij het laden van units</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Geen bedrijfsunits gevonden</p>
                    <p className="text-sm">Probeer andere filters</p>
                  </div>
                ) : (
                  <>
                {/* Units Grid/Table */}
                {viewMode === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((unit) => {
                          const isGreyedOut = selectedTypes.length > 0 && !selectedTypes.includes(unit.name);
                          return (
                          <div key={unit.id} className={`relative transition-all duration-300 ${isGreyedOut ? 'opacity-30 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                            {/* Unit Card - Clickable Link to TYPE detail page */}
                            <Link 
                              href={`/bedrijfsunit/bedrijfsunit-type-${unit.type_number}`}
                              className="block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
                          >
                              {/* Status Badge */}
                              <div className="absolute top-4 right-4 z-10">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  unit.status === 'available' 
                                    ? 'bg-green-500 text-white' 
                                    : unit.status === 'reserved' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-gray-500 text-white'
                                }`}>
                                  {unit.status === 'available' ? 'Beschikbaar' : unit.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
                                </span>
                        </div>
                              
                              {/* Image */}
                              <img 
                                src={unit.images?.[0] || '/images/placeholder.jpg'} 
                                alt={unit.name}
                                className="w-full h-48 object-cover"
                              />
                              
                              {/* Content */}
                              <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{unit.name}</h3>
                                <p className="text-sm text-gray-600 mb-1">
                                  {unit.units_count ? `${unit.units_count} ${unit.units_count === 1 ? 'unit' : 'units'} beschikbaar` : `Unit: ${unit.unit_number}`}
                                </p>
                                <p className="text-sm text-gray-600 mb-3">{unit.location || 'Almere'}</p>
                                
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <p className="text-xs text-gray-500">Oppervlakte</p>
                                    <p className="text-sm font-semibold">{unit.gross_area} m²</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Prijs</p>
                                    <p className="text-lg font-bold text-yellow-600">€{unit.sale_price.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                      </div>
                          );
                        })}
                  </div>
                ) : viewMode === 'map' ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <InteractiveFloorplan />
                  </div>
                ) : (
                  renderTableView()
                    )}
                  </>
                )}
              </div>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      {/* Compact Contact Card */}
      <section id="investeren" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Interesse in een unit?</h2>
            <p className="text-slate-300 mb-6">
              Maak een afspraak voor een bezichtiging of ontvang meer informatie over beschikbare units.
            </p>

            {submitStatus === 'success' && (
              <div className="mb-5 p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-200 text-sm">
                ✓ {submitMessage}
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-5 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm">
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="Uw naam"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                placeholder="uw@email.nl"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                    Verzenden...
                  </>
                ) : 'Plan Bezichtiging'}
              </button>
            </form>
            <p className="text-slate-500 text-xs mt-4 text-center">We nemen binnen 24 uur contact met u op.</p>
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
              Deel deze gefilterde weergave van {filteredProjects.length} bedrijfsunit types met anderen.
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

            {/* Native Share API (if available) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigator.share({
                      title: 'De Steiger - Bedrijfsunits',
                      text: `Bekijk deze ${filteredProjects.length} bedrijfsunit types op De Steiger in Almere`,
                      url: shareUrl,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Share2 className="h-4 w-4" />
                  Meer opties...
                </button>
              </div>
            )}
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