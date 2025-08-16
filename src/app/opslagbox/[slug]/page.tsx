'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Building2, CheckCircle, Home, ArrowRight, Shield, Zap, Users, Phone, Mail, Grid, List, Filter, Lock, Download } from 'lucide-react';
import { projects } from '../../../data/projects';
import ImageGallery from '../../../components/ImageGallery';

export default function OpslagboxDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'floorplan' | 'contact'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'beschikbaar' | 'gereserveerd' | 'verkocht'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'unitNumber' | 'price' | 'area'>('unitNumber');

  const project = projects.find(p => p.slug === slug);

  if (!project) {
    notFound();
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter and sort units
  const getFilteredAndSortedUnits = () => {
    let unitDetails = project.details?.unitDetails || [];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      unitDetails = unitDetails.filter(unit => unit.status === statusFilter);
    }
    
    // Apply area filter (using bruto area for opslagboxen)
    if (areaFilter !== 'all') {
      unitDetails = unitDetails.filter(unit => {
        if (areaFilter === 'small') return unit.grossArea < 25;
        if (areaFilter === 'medium') return unit.grossArea >= 25 && unit.grossArea < 40;
        if (areaFilter === 'large') return unit.grossArea >= 40;
        return true;
      });
    }
    
    // Apply sorting
    unitDetails = [...unitDetails].sort((a, b) => {
      if (sortBy === 'unitNumber') return a.unitNumber - b.unitNumber;
      if (sortBy === 'price') {
        const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
        const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
        return priceA - priceB;
      }
      if (sortBy === 'area') return a.grossArea - b.grossArea;
      return 0;
    });
    
    return unitDetails;
  };

  // Get unit details for modal
  const getUnitDetails = (unitNumber: number) => {
    return project.details?.unitDetails?.find(unit => unit.unitNumber === unitNumber);
  };

  // Format price consistently for server and client
  const formatPrice = (price: string) => {
    const numPrice = parseInt(price);
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculate size groups for available formats section
  const sizeGroups = (() => {
    const unitDetails = project.details?.unitDetails || [];
    const groups: { [key: string]: { count: number; minPrice: number; maxPrice: number } } = {};
    
    unitDetails.forEach(unit => {
      let size = 'Klein';
      if (unit.grossArea >= 25 && unit.grossArea < 40) size = 'Middel';
      else if (unit.grossArea >= 40) size = 'Groot';
      
      if (!groups[size]) {
        groups[size] = { count: 0, minPrice: Infinity, maxPrice: 0 };
      }
      
      const price = parseInt(unit.price);
      groups[size].count++;
      groups[size].minPrice = Math.min(groups[size].minPrice, price);
      groups[size].maxPrice = Math.max(groups[size].maxPrice, price);
    });
    
    return groups;
  })();

  const renderGridView = () => {
    const unitDetails = getFilteredAndSortedUnits();
    if (unitDetails.length === 0) {
      return <div className="text-center text-gray-600">Geen opslagboxen gevonden met de huidige filters</div>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {unitDetails.map((unit) => {
          const isAvailable = unit.status === 'beschikbaar';
          const isReserved = unit.status === 'gereserveerd';
          
          return (
            <div
              key={unit.unitNumber}
              onClick={() => setSelectedUnit(unit.unitNumber)}
              className={`h-24 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                isAvailable 
                  ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200' 
                  : isReserved
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200'
              }`}
            >
              <div className="font-bold">Box {unit.unitNumber}</div>
              <div className="text-xs mt-1">
                {isAvailable ? 'Vrij' : isReserved ? 'Gereserveerd' : 'Verkocht'}
              </div>
              {isAvailable && (
                <div className="text-xs font-semibold mt-1 text-green-700">
                  €{formatPrice(unit.price)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTableView = () => {
    const unitDetails = getFilteredAndSortedUnits();
    if (unitDetails.length === 0) {
      return <div className="text-center text-gray-600">Geen opslagboxen gevonden met de huidige filters</div>;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Box
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bruto m²
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prijs
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
              {unitDetails.map((unit) => (
                <tr 
                  key={unit.unitNumber} 
                  onClick={() => setSelectedUnit(unit.unitNumber)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Box {unit.unitNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unit.grossArea}m²
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{formatPrice(unit.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      unit.status === 'beschikbaar' 
                        ? 'bg-green-100 text-green-800'
                        : unit.status === 'gereserveerd'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {unit.status === 'beschikbaar' ? 'Beschikbaar' : 
                       unit.status === 'gereserveerd' ? 'Gereserveerd' : 'Verkocht'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="text-slate-600">
                      Klik voor details
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background extends behind header */}
        <div className="absolute inset-0 -top-16 md:top-0 h-[calc(100vh+4rem)] md:h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${project.images[0]})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        
        {/* Content positioned below header */}
        <div className="relative z-10 h-[calc(100vh-4rem)] md:h-screen flex items-center justify-center pt-16 md:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            <div className="max-w-4xl mx-auto">

              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                {project.name}
              </h1>
              
              <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
                {project.description}
              </p>
              
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 text-center">
                  <div className="text-white/80 text-xs md:text-sm mb-2">Totaal</div>
                  <div className="text-xl md:text-3xl font-bold text-white">{project.garageBoxes}</div>
                  <div className="text-white/60 text-xs mt-1">Opslagboxen</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 text-center">
                  <div className="text-white/80 text-xs md:text-sm mb-2">Vanaf</div>
                  <div className="text-xl md:text-3xl font-bold text-white">{project.startPrice?.split(' ')[0] || 'Op aanvraag'}</div>
                  <div className="text-white/60 text-xs mt-1">v.o.n. ex. BTW</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 text-center">
                  <div className="text-white/80 text-xs md:text-sm mb-2">Locaties</div>
                  <div className="text-xl md:text-3xl font-bold text-white">1</div>
                  <div className="text-white/60 text-xs mt-1">Beschikbaar</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 text-center">
                  <div className="text-white/80 text-xs md:text-sm mb-2">Status</div>
                  <div className="text-xl md:text-3xl font-bold text-white">✓</div>
                  <div className="text-white/60 text-xs mt-1">Beschikbaar</div>
                </div>
              </div>
              
              {/* Action Buttons - Hidden on Mobile */}
              <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => scrollToSection('opslagboxen')}
                  className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Bekijk Beschikbaarheid
                </button>
                <Link
                  href={`/reserveren/${project.slug}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-flex items-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Reserveer Nu
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator - Desktop Only */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={() => scrollToSection('opslagboxen')}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors duration-300"
          >
            <ArrowRight className="h-6 w-6 mb-2 rotate-90" />
            <span className="text-sm">Scroll Down</span>
          </button>
        </div>
      </div>

      {/* Image Gallery Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Foto's van {project.name}
            </h2>
            <p className="text-gray-600">
              Bekijk de ruimtes en faciliteiten van deze opslagboxen
            </p>
          </div>
          
          <ImageGallery 
            images={project.images} 
            projectName={project.name}
          />
        </div>
      </section>

      {/* Available Opslagboxen Section */}
      <section id="opslagboxen" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Beschikbare Opslagboxen
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Toont alle {project.details?.unitDetails?.length || 0} opslagboxen van {project.name}
            </p>
          </div>

          {/* View Toggle and Filters */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
                Tabel
              </button>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="all">Alle statussen</option>
              <option value="beschikbaar">Beschikbaar</option>
              <option value="gereserveerd">Gereserveerd</option>
              <option value="verkocht">Verkocht</option>
            </select>

            {/* Area Filter */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="all">Alle groottes</option>
                              <option value="small">Klein (&lt; 25m²)</option>
                <option value="medium">Middel (25-40m²)</option>
                <option value="large">Groot (&gt; 40m²)</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="unitNumber">Sorteer op box nummer</option>
              <option value="price">Sorteer op prijs</option>
              <option value="area">Sorteer op oppervlakte</option>
            </select>

            {/* Results Count */}
            <div className="ml-auto text-sm text-gray-600">
              {getFilteredAndSortedUnits().length} van {project.details?.unitDetails?.length || 0} opslagboxen
            </div>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {viewMode === 'grid' ? 'Klik op een opslagbox voor meer details' : 'Klik op "Details" voor meer informatie'}
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
              <span>Vrij (Beschikbaar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
              <span>Gereserveerd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
              <span>Verkocht</span>
            </div>
          </div>
          
          {/* Render Grid or Table View */}
          {viewMode === 'grid' ? renderGridView() : renderTableView()}
        </div>
      </section>

      {/* Photos & Specifications Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Foto's & Specificaties
            </h2>
            <p className="text-xl text-gray-600">
              Bekijk de ruimtes en technische details van {project.name}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image Gallery */}
            <div>
              <ImageGallery 
                images={project.images} 
                projectName={project.name}
              />
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Technische specificaties</h3>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Hoogte</span>
                    <span className="text-gray-600">{project.details?.specifications?.ceiling}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Vloer</span>
                    <span className="text-gray-600">{project.details?.specifications?.floors}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Elektra</span>
                    <span className="text-gray-600">{project.details?.specifications?.electricity}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Internet</span>
                    <span className="text-gray-600">{project.details?.specifications?.internet}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Toegang</span>
                    <span className="text-gray-600">{project.details?.specifications?.access}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-900">Beveiliging</span>
                    <span className="text-gray-600">{project.details?.specifications?.security}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interesse in een opslagbox?
            </h2>
            <p className="text-xl text-slate-100">
              Neem contact met ons op voor meer informatie
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6">Contact informatie</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-slate-400" />
                  <div>
                    <div className="font-medium">Telefoon</div>
                    <div className="text-slate-300">+31 (0)20 123 4567</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-slate-400" />
                  <div>
                    <div className="font-medium">E-mail</div>
                    <div className="text-slate-300">opslagboxen@desteiger.nl</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">Vraag informatie aan</h3>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Bedankt voor je bericht!</h4>
                  <p className="text-slate-300">We nemen zo snel mogelijk contact met je op.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Je naam"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="je@email.nl"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Telefoonnummer"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={4}
                      placeholder="Vertel ons meer over je interesse..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-white text-slate-800 py-4 px-8 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
                  >
                    Verstuur aanvraag
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Unit Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-none sm:rounded-lg max-w-6xl w-full h-full sm:h-auto max-h-full sm:max-h-[90vh] flex flex-col animate-zoom-in overflow-hidden">
            {/* Fixed Header with Close Button */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                Opslagbox {selectedUnit} - {project.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedUnit(null);
                    setModalTab('overview'); // Reset tab when closing
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setModalTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      modalTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overzicht
                  </button>
                  <button
                    onClick={() => setModalTab('floorplan')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      modalTab === 'floorplan'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Vloerplan
                  </button>
                  <button
                    onClick={() => setModalTab('contact')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      modalTab === 'contact'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Contact
                  </button>
                </nav>
              </div>
              
              {(() => {
                const details = getUnitDetails(selectedUnit);
                if (!details) return <div>Geen details beschikbaar</div>;
                
                return (
                  <div>
                    {/* Overview Tab */}
                    {modalTab === 'overview' && (
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Image and Gallery */}
                        <div>
                          <div className="mb-4">
                            <img 
                              src={project.images[0]} 
                              alt={`${project.name} - Box ${selectedUnit}`}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* Image Gallery Thumbnails */}
                          {project.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                              {project.images.slice(1, 5).map((image, index) => (
                                <img 
                                  key={index}
                                  src={image} 
                                  alt={`${project.name} - ${index + 2}`}
                                  className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              ))}
                              {project.images.length > 5 && (
                                <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs font-medium">
                                  +{project.images.length - 4} meer
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Right Column - Details */}
                        <div className="space-y-6">
                          {/* Status and Area */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">Bruto Oppervlakte</div>
                              <div className="text-2xl font-bold text-gray-900">{details.grossArea}m²</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">Status</div>
                              <div className={`text-xl font-bold ${
                                details.status === 'beschikbaar' ? 'text-green-600' :
                                details.status === 'gereserveerd' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {details.status === 'beschikbaar' ? 'Vrij' : 
                                 details.status === 'gereserveerd' ? 'Gereserveerd' : 'Verkocht'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 mb-1">Koopprijs</div>
                            <div className="text-3xl font-bold text-blue-900">€{formatPrice(details.price)}</div>
                            <div className="text-sm text-blue-600">v.o.n. ex. BTW</div>
                          </div>
                          
                          {/* Features */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Kenmerken</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {[
                                `${details.grossArea}m² bruto oppervlakte`,
                                '24/7 toegang via app',
                                'Beveiligingssysteem',
                                'Energielabel A+',
                                '2.70m vrije hoogte',
                                'Betonvloer'
                              ].map((feature: string, index: number) => (
                                <div key={index} className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  <span className="text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="pt-4 border-t border-gray-200">
                            {details.status === 'beschikbaar' ? (
                              <div className="space-y-3">
                                <Link
                                  href={`/reserveren/${project.slug}?unit=${selectedUnit}`}
                                  className="block w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg text-center"
                                >
                                  Reserveer Nu - €1,500
                                </Link>
                                <button
                                  onClick={() => setModalTab('contact')}
                                  className="w-full bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
                                >
                                  Meer informatie
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setModalTab('contact')}
                                className="w-full bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
                              >
                                Interesse? Neem contact op
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Floor Plan Tab */}
                    {modalTab === 'floorplan' && (
                      <div className="py-4">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Vloerplan Opslagbox {selectedUnit}</h3>
                              <p className="text-gray-600 text-sm">{details.grossArea}m² bruto oppervlakte</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => window.open(project.images[0], '_blank')}
                                className="flex items-center px-3 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm"
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                Volledig scherm
                              </button>
                              <a
                                href="/pdf/verkoop_bedrijfsunit.pdf"
                                download
                                className="flex items-center px-3 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </a>
                            </div>
                          </div>
                          
                          {/* Interactive Floorplan Viewer */}
                          <div className="bg-white rounded-lg shadow-inner overflow-hidden">
                            <div className="relative">
                              <img
                                src={project.images[0]}
                                alt={`Vloerplan Opslagbox ${selectedUnit}`}
                                className="w-full h-auto max-h-[600px] object-contain cursor-zoom-in"
                                onClick={() => window.open(project.images[0], '_blank')}
                              />
                              
                              {/* Overlay with unit info */}
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                                <div className="text-sm">
                                  <p className="font-semibold text-gray-900">Opslagbox {selectedUnit}</p>
                                  <p className="text-gray-600">{details.grossArea}m² bruto</p>
                                  <p className="text-gray-600">Hoogte: 2.40m</p>
                                </div>
                              </div>
                              
                              {/* Zoom hint */}
                              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
                                Klik voor vergroten
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-xs mt-3 text-center">
                            Schematische weergave van opslagbox {selectedUnit}. 
                            Exacte afmetingen en indeling kunnen afwijken van de werkelijkheid.
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Afmetingen</h4>
                            <p className="text-blue-700">{details.grossArea}m² bruto</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Hoogte</h4>
                            <p className="text-green-700">2.70m vrije hoogte</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Vloer</h4>
                            <p className="text-gray-700">Betonvloer</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Tab */}
                    {modalTab === 'contact' && (
                      <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Contact Illustration */}
                        <div>
                          <img
                            src="https://riskid.nl/app/uploads/2022/10/Contact-Us-1800x1093.jpg"
                            alt="Contact ons serviceteam"
                            className="w-full h-56 object-cover rounded-xl shadow mb-4"
                          />
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Service Team</h4>
                          <p className="text-sm text-gray-600">Ons team staat klaar om u te helpen</p>
                        </div>

                        {/* Contact Form */}
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-4">
                            Neem contact met ons op
                          </h4>
                          <p className="text-gray-600 mb-6">
                            Heeft u vragen over opslagbox {selectedUnit}? Vul het formulier in en wij nemen zo snel mogelijk contact met u op.
                          </p>
                          
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Naam *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail *
                              </label>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telefoon
                              </label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bericht
                              </label>
                              <textarea
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder={`Ik ben geïnteresseerd in opslagbox ${selectedUnit}...`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Verstuur bericht
                            </button>
                          </form>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">
                            Contactgegevens
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <Phone className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">Telefoon</p>
                                <p className="text-gray-600">+31 (0)20 123 4567</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">E-mail</p>
                                <p className="text-gray-600">opslagboxen@desteiger.nl</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">Adres</p>
                                <p className="text-gray-600">
                                  De Steiger 74/77<br />
                                  1234 AB Almere
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h5 className="font-medium text-gray-900 mb-2">Openingstijden</h5>
                            <div className="text-sm text-gray-600">
                              <p>Maandag - Vrijdag: 9:00 - 17:00</p>
                              <p>Zaterdag: 10:00 - 16:00</p>
                              <p>Zondag: Gesloten</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            {/* Fixed Footer with Action Buttons */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  href={`/reserveren/${project.slug}?unit=${selectedUnit}`}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors duration-200 inline-flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reserveer Opslagbox
                </Link>
                <button
                  onClick={() => setModalTab('contact')}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Meer informatie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
