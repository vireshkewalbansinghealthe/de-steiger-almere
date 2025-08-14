'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, MapPin, Zap, Shield, Calendar, Grid, List, Share2, Copy, Facebook, Twitter, Link as LinkIcon, Users, Phone, Mail, Search } from 'lucide-react';
import { projects } from '../../data/projects';
import ProjectCard from '../../components/ProjectCard';

export default function BedrijfsunitsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'beschikbaar' | 'gereserveerd' | 'verkocht'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'area' | 'location'>('name');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [priceMin, setPriceMin] = useState(200);
  const [priceMax, setPriceMax] = useState(900);
  const [areaMin, setAreaMin] = useState(90);
  const [areaMax, setAreaMax] = useState(400);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects to show only business units (exclude garage boxes)
  const businessUnits = projects.filter(project => project.units > 0 && project.location === 'Almere');
  const businessUnitTypesCount = 12;
  const totalUnitsAtLocation = 79;

  const getFilteredAndSortedProjects = () => {
    let filtered = businessUnits.filter(project => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'beschikbaar' && project.status === 'NU IN DE VERKOOP') ||
        (statusFilter === 'gereserveerd' && project.status === 'NU IN DE VERKOOP') ||
        (statusFilter === 'verkocht' && project.status === 'UITVERKOCHT');

      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(project.name);

      // Area range filter - check if any unit in the project falls within the range
      let matchesAreaRange = true;
      if (project.details?.unitDetails && project.details.unitDetails.length > 0) {
        matchesAreaRange = project.details.unitDetails.some(unit => {
          const area = unit.netArea || unit.grossArea || 0;
          return area >= areaMin && area <= areaMax;
        });
      }

      // Price range filter - check if any unit in the project falls within the range
      let matchesPriceRange = true;
      if (project.details?.unitDetails && project.details.unitDetails.length > 0) {
        matchesPriceRange = project.details.unitDetails.some(unit => {
          const price = parseFloat(unit.price.replace(/[€,.\s]/g, '')) / 1000;
          return price >= priceMin && price <= priceMax;
        });
      }

      // Area filter - based on project units count
      let matchesArea = true;
      if (areaFilter !== 'all') {
        const unitCount = project.units || 0;
        if (areaFilter === 'small') matchesArea = unitCount < 5;
        else if (areaFilter === 'medium') matchesArea = unitCount >= 5 && unitCount <= 10;
        else if (areaFilter === 'large') matchesArea = unitCount > 10;
      }

      return matchesSearch && matchesStatus && matchesType && matchesAreaRange && matchesPriceRange && matchesArea;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = parseFloat(a.startPrice?.replace(/[€,.\s]/g, '') || '0');
          const priceB = parseFloat(b.startPrice?.replace(/[€,.\s]/g, '') || '0');
          return priceA - priceB;
        case 'area':
          return (b.units || 0) - (a.units || 0);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
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
    if (areaMin !== 90 || areaMax !== 400) params.set('area', `${areaMin}-${areaMax}`);
    if (priceMin !== 200 || priceMax !== 900) params.set('price', `${priceMin}-${priceMax}`);
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
                Units
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parkeerplaatsen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vanaf Prijs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actie
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={project.images[0]}
                      alt={project.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.description.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.units}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.parkingSpaces || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.startPrice || 'Op aanvraag'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'NU IN DE VERKOOP' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'UITVERKOCHT'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/bedrijfsunit/${project.slug}`}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Details
                  </Link>
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
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&auto=format)'
          }}
        />
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
                <div className="text-white/80">Beschikbare Units</div>
                <div className="text-2xl font-bold text-white">
                  {businessUnits.reduce((total, project) => total + project.units, 0)}+
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
                <div className="text-2xl font-bold text-white">€ 212,520</div>
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
      <section className="py-12 bg-gray-50">
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
                placeholder="Zoek op type of beschrijving..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-lg"
              />
            </div>
          </div>
          
          {/* Content Area with Sidebar */}
          <div className="flex gap-6">
              {/* Filter Sidebar - Always visible */}
              <div className="w-80 bg-white rounded-lg shadow-sm border p-6 space-y-6 shrink-0">
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
                        min="90"
                        max="400"
                        step="5"
                        value={areaMin}
                        onChange={(e) => setAreaMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>90m²</span>
                        <span>400m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min="90"
                        max="400"
                        step="5"
                        value={areaMax}
                        onChange={(e) => setAreaMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>90m²</span>
                        <span>400m²</span>
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
                        max="900"
                        step="10"
                        value={priceMin}
                        onChange={(e) => setPriceMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€200k</span>
                        <span>€900k</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min="200"
                        max="900"
                        step="10"
                        value={priceMax}
                        onChange={(e) => setPriceMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€200k</span>
                        <span>€900k</span>
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
                    setAreaMin(90);
                    setAreaMax(400);
                    setPriceMin(200);
                    setPriceMax(900);
                    setSortBy('name');
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>

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
                        className={`px-3 py-1 text-sm rounded-r ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
          </div>
        </div>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Delen
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  {filteredProjects.length} van {businessUnits.length} bedrijfsunit types gevonden
          </div>

                {/* Units Grid/Table */}
                {viewMode === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                      />
                    ))}
                  </div>
                ) : (
                  renderTableView()
                )}
              </div>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section id="investeren" className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Waarom Investeren in Bedrijfsunits?
            </h2>
            <p className="text-xl text-slate-100 max-w-3xl mx-auto">
              Stabiel rendement, groeiende vraag, professioneel beheer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Groeiende Vraag</h3>
              <p className="text-slate-100">
                Steeds meer ondernemers zoeken flexibele werkruimte. De vraag naar bedrijfsunits groeit jaar op jaar.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Stabiel Rendement</h3>
              <p className="text-slate-100">
                Verwacht rendement van 6,5% - 8,2% per jaar. Minimaal onderhoudsrisico door professioneel beheer.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Duurzaam & Modern</h3>
              <p className="text-slate-100">
                Energielabel A+, zonnepanelen, slimme systemen. Klaar voor de toekomst en aantrekkelijk voor kopers en gebruikers.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Toplocaties</h3>
              <p className="text-slate-100">
                Strategisch gelegen nabij Amsterdam, Rotterdam en andere economische centra met uitstekende bereikbaarheid.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Volledig Beheer</h3>
              <p className="text-slate-100">
                 De Steiger zorgt voor verkoop, onderhoud en administratie. Passief investeren zonder zorgen.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Easy Exit</h3>
              <p className="text-slate-100">
                Liquide investering met goede doorverkoopbaarheid. Flexibel in- en uitstappen mogelijk.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="#contact"
              className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
            >
              Start je investering
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interesse in Bedrijfsunits?
            </h2>
            <p className="text-xl text-gray-600">
              Neem contact met ons op voor een persoonlijk adviesgesprek
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact informatie</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-slate-600" />
                  <div>
                    <div className="font-medium text-gray-900">Telefoon</div>
                    <div className="text-gray-600">+31 (0)20 123 4567</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-slate-600" />
                  <div>
                    <div className="font-medium text-gray-900">E-mail</div>
                    <div className="text-gray-600">bedrijfsunits@desteiger.nl</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-slate-600" />
                  <div>
                    <div className="font-medium text-gray-900">Kantooruren</div>
                    <div className="text-gray-600">Ma-vr: 09:00 - 17:00</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vraag informatie aan</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Je volledige naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="je@email.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interesse in
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option>Kopen voor eigen gebruik</option>
                    <option>Investeren</option>
                    <option>Algemene informatie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bericht
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Vertel ons meer over je interesse..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-slate-900 transition-colors duration-200"
                >
                  Verstuur aanvraag
                </button>
              </form>
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