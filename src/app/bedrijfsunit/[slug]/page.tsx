'use client';

import React, { useState, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Car, Building2, CheckCircle, Home, ArrowRight, Shield, Zap, Users, Phone, Mail, Grid, List, Filter, ChevronLeft, ChevronRight, CreditCard, Download } from 'lucide-react';
import ReservationModal from '../../../components/ReservationModal';
import { projects } from '../../../data/projects';

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'beschikbaar' | 'gereserveerd' | 'verkocht'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'unitNumber' | 'price' | 'area'>('unitNumber');
  const [modalTab, setModalTab] = useState<'overview' | 'floorplan' | 'contact'>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const project = projects.find(p => p.slug === resolvedParams.slug);

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

  // Image gallery navigation
  const nextImage = () => {
    if (project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  };

  const openImageGallery = (index: number = 0) => {
    setCurrentImageIndex(index);
    setShowImageGallery(true);
  };

  const closeImageGallery = () => {
    setShowImageGallery(false);
  };

  // Filter and sort units
  const getFilteredAndSortedUnits = () => {
    let unitDetails = project.details?.unitDetails || [];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      unitDetails = unitDetails.filter(unit => unit.status === statusFilter);
    }
    
    // Apply area filter
    if (areaFilter !== 'all') {
      unitDetails = unitDetails.filter(unit => {
        if (areaFilter === 'small') return unit.netArea < 100;
        if (areaFilter === 'medium') return unit.netArea >= 100 && unit.netArea < 150;
        if (areaFilter === 'large') return unit.netArea >= 150;
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
      if (sortBy === 'area') return a.netArea - b.netArea;
      return 0;
    });
    
    return unitDetails;
  };

  const renderGridView = () => {
    const unitDetails = getFilteredAndSortedUnits();
    if (unitDetails.length === 0) {
      return <div className="text-center text-gray-600">Geen units gevonden met de huidige filters</div>;
    }

    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3 max-w-6xl mx-auto">
        {unitDetails.map((unit) => {
          const isAvailable = unit.status === 'beschikbaar';
          const isReserved = unit.status === 'gereserveerd';
          
          return (
            <div
              key={unit.unitNumber}
              onClick={() => setSelectedUnit(unit.unitNumber)}
              className={`h-16 sm:h-20 md:h-24 rounded border-2 flex flex-col items-center justify-center text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                isAvailable 
                  ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200' 
                  : isReserved
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">{unit.unitNumber}</div>
              <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 leading-tight">
                {isAvailable ? 'Vrij' : isReserved ? 'Res.' : 'Verkocht'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTableView = () => {
    const unitDetails = getFilteredAndSortedUnits();
    if (unitDetails.length === 0) {
      return <div className="text-center text-gray-600">Geen units gevonden met de huidige filters</div>;
    }

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Netto m²</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Bruto m²</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Industrie</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Kantoor</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Prijs</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actie</th>
            </tr>
          </thead>
          <tbody>
            {unitDetails.map((unit, index) => (
              <tr 
                key={unit.unitNumber} 
                onClick={() => setSelectedUnit(unit.unitNumber)}
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-slate-50`}
              >
                <td className="py-3 px-4 font-medium text-gray-900">#{unit.unitNumber}</td>
                <td className="py-3 px-4 text-gray-700">{unit.netArea}m²</td>
                <td className="py-3 px-4 text-gray-700">{unit.grossArea}m²</td>
                <td className="py-3 px-4 text-gray-600 text-xs">
                  {unit.industrieNetto ? `${unit.industrieNetto}m²` : '-'}
                </td>
                <td className="py-3 px-4 text-gray-600 text-xs">
                  {unit.kantoorNetto ? `${unit.kantoorNetto}m²` : '-'}
                </td>
                <td className="py-3 px-4 text-gray-900 font-medium">{unit.price}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    unit.status === 'beschikbaar' 
                      ? 'bg-green-100 text-green-800'
                      : unit.status === 'gereserveerd'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {unit.status === 'beschikbaar' ? 'Vrij' : 
                     unit.status === 'gereserveerd' ? 'Gereserveerd' : 'Verkocht'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-600 font-medium text-sm">
                    Klik voor details
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getUnitDetails = (unitNumber: number) => {
    // Find the real unit data from project details
    const unitData = project.details?.unitDetails?.find(unit => unit.unitNumber === unitNumber);
    
    if (!unitData) {
      return null;
    }
    
    return {
      unitNumber: unitData.unitNumber,
      size: `${unitData.netArea}m²`,
      grossSize: `${unitData.grossArea}m²`,
      price: unitData.price,
      available: unitData.status === 'beschikbaar',
      status: unitData.status,
      industrieNetto: unitData.industrieNetto || 0,
      industrieBruto: unitData.industrieBruto || 0,
      kantoorNetto: unitData.kantoorNetto || 0,
      kantoorBruto: unitData.kantoorBruto || 0,
      features: [
        project.details?.specifications?.ceiling || '3.70 meter vrije hoogte',
        project.details?.specifications?.floors || 'Vloeropbouw Monolitische afwerking',
        project.details?.specifications?.electricity || '3x25A aansluiting',
        '2 eigen parkeerplaatsen',
      ]
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background extends behind header */}
        <div className="absolute inset-0 -top-16 md:top-0 h-[calc(100vh+4rem)] md:h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage: project.images && project.images.length > 0 
                ? `url(${project.images[0]})` 
                : 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&auto=format)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        
        {/* Content positioned below header */}
        <div className="relative z-10 h-[calc(100vh-4rem)] md:h-screen flex items-center justify-center pt-16 md:pt-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">


            <div className="max-w-4xl">

              
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                {project.name}
              </h1>
              
              <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-12 leading-relaxed max-w-3xl px-2">
                {project.description}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg p-4 mb-2">
                    <Home className="h-8 w-8 mx-auto text-white" />
                  </div>
                  <div className="text-white/80">Units</div>
                  <div className="text-2xl font-bold text-white">{project.units}</div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg p-4 mb-2">
                    <Car className="h-8 w-8 mx-auto text-white" />
                  </div>
                  <div className="text-white/80">Parkeerplaatsen</div>
                  <div className="text-2xl font-bold text-white">158</div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg p-4 mb-2">
                    <Calendar className="h-8 w-8 mx-auto text-white" />
                  </div>
                  <div className="text-white/80">Bouwstart</div>
                  <div className="text-2xl font-bold text-white">{project.buildingStart || 'TBD'}</div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg p-4 mb-2">
                    <Building2 className="h-8 w-8 mx-auto text-white" />
                  </div>
                  <div className="text-white/80">Vanaf</div>
                  <div className="text-2xl font-bold text-white">€ 212,520</div>
                </div>
              </div>
              

              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSection('plattegrond')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Plattegrond
                </button>
                <button 
                  onClick={() => scrollToSection('locatie')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Locatie
                </button>
                <button 
                  onClick={() => scrollToSection('specificaties')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Specificaties
                </button>
                <button 
                  onClick={() => scrollToSection('beleggers')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Voor beleggers
                </button>
                <Link
                  href={`/reserveren/${project.slug}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Reserveer Nu
                </Link>
              </div>
              
              {/* Mobile CTA Buttons */}
              <div className="md:hidden flex flex-col gap-3">
                <button 
                  onClick={() => scrollToSection('plattegrond')}
                  className="bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
                >
                  Bekijk Units
                </button>
                <Link
                  href={`/reserveren/${project.slug}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center justify-center"
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
            onClick={() => scrollToSection('plattegrond')}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors duration-300"
          >
            <ArrowRight className="h-6 w-6 mb-2 rotate-90" />
            <span className="text-sm">Scroll Down</span>
          </button>
        </div>
      </div>



      {/* Floor Plan Section */}
      <section id="plattegrond" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plattegrond & Beschikbaarheid
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bekijk welke units nog beschikbaar zijn in {project.name}
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 sm:p-8">
            {/* View Controls - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-slate-800 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Tabel
                </button>
              </div>
            </div>

            {/* Filters - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
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
                <option value="small">Klein (&lt; 100m²)</option>
                <option value="medium">Middel (100-150m²)</option>
                <option value="large">Groot (&gt; 150m²)</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="unitNumber">Sorteer op unit nummer</option>
                <option value="price">Sorteer op prijs</option>
                <option value="area">Sorteer op oppervlakte</option>
              </select>

              {/* Results Count */}
              <div className="ml-auto text-sm text-gray-600">
                {getFilteredAndSortedUnits().length} van {project.details?.unitDetails?.length || 0} units
              </div>
            </div>
            
            {/* Grid/Table and Reserve Button Side by Side */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Grid/Table View */}
              <div className="flex-1">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    {viewMode === 'grid' ? 'Klik op een unit voor meer details' : 'Klik op "Details" voor meer informatie'}
                  </p>
                </div>
                {viewMode === 'grid' ? renderGridView() : renderTableView()}
              </div>
              
              {/* Reserve Button - Same Height Container */}
              <div className="lg:w-48 flex lg:flex-col justify-center items-center lg:items-stretch">
                <Link
                  href={`/reserveren/${project.slug}`}
                  className="inline-flex items-center justify-center bg-slate-800 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200 w-full lg:h-32 text-sm sm:text-base"
                >
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Reserveer nu
                </Link>
              </div>
            </div>

            {/* Legend Below */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-3 bg-green-100 border-2 border-green-400 rounded mr-2"></div>
                <span className="text-xs sm:text-sm text-gray-600">Beschikbaar</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-3 bg-yellow-100 border-2 border-yellow-400 rounded mr-2"></div>
                <span className="text-xs sm:text-sm text-gray-600">Gereserveerd</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-3 bg-red-100 border-2 border-red-400 rounded mr-2"></div>
                <span className="text-xs sm:text-sm text-gray-600">Verkocht</span>
              </div>
            </div>
          </div>

          {project.details?.specifications && (
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Beschikbare formaten</h3>
                <div className="space-y-3">
                  {project.details?.unitDetails && 
                   Array.from(new Set(project.details.unitDetails.map(unit => unit.netArea)))
                   .sort((a, b) => a - b)
                   .map((size, index) => {
                     const unitsWithSize = project.details?.unitDetails?.filter(unit => unit.netArea === size) || [];
                     const priceRange = unitsWithSize.length > 0 ? unitsWithSize[0].price : project.startPrice;
                     return (
                       <div key={index} className="flex items-center justify-between">
                         <span className="text-gray-700">{size}m² netto ({unitsWithSize.length} units)</span>
                         <span className="font-medium text-slate-800">{priceRange}</span>
                       </div>
                     );
                   })
                  }
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Unit specificaties</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Plafondhoogte</span>
                    <span className="font-medium text-slate-800">{project.details.specifications.ceiling}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Vloer</span>
                    <span className="font-medium text-slate-800">{project.details.specifications.floors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Internet</span>
                    <span className="font-medium text-slate-800">{project.details.specifications.internet}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section id="locatie" className="hidden md:block py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Locatie & Bereikbaarheid
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {project.location} - Een unieke locatie met uitstekende bereikbaarheid
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Locatie</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {project.details?.location}
              </p>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Bereikbaarheid</h4>
              <p className="text-gray-700 mb-8 leading-relaxed">
                {project.details?.accessibility}
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Car className="h-5 w-5 mr-3 text-slate-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Met de auto</div>
                    <div className="text-gray-600">Eigen parkeerplaats per unit</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-3 text-slate-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Openbaar vervoer</div>
                    <div className="text-gray-600">Binnen 15 minuten in het centrum</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact & Bezichtiging</h3>
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
                    <div className="text-gray-600">info@unity-units.nl</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-slate-600" />
                  <div>
                    <div className="font-medium text-gray-900">Adres</div>
                    <div className="text-gray-600">{project.location}</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => scrollToSection('inschrijven')}
                className="w-full mt-6 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
              >
                Plan een bezichtiging
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specificaties" className="hidden md:block py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specificaties & Voorzieningen
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Moderne, duurzame bedrijfsunits met alle voorzieningen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="bg-slate-800 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Duurzaamheid</h3>
              <p className="text-gray-700 mb-4 text-center">
                {project.details?.sustainability}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="bg-slate-800 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Beveiliging</h3>
              <p className="text-gray-700 mb-4 text-center">
                24/7 toegang met app en camera beveiliging
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="bg-slate-800 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Flexibiliteit</h3>
              <p className="text-gray-700 mb-4 text-center">
                Units zijn koppelbaar en uitbreidbaar naar behoefte
              </p>
            </div>
          </div>

          {project.details?.facilities && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Alle voorzieningen</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {project.details.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Investor Section */}
      {project.details?.investorInfo && (
        <section id="beleggers" className="hidden md:block py-20 bg-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Voor Beleggers
              </h2>
              <p className="text-xl text-slate-100 max-w-3xl mx-auto">
                Investeer in {project.name} - Stabiel rendement in een groeiende markt
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {project.details.investorInfo.expectedReturn.split(' ')[0]}
                </div>
                <div className="text-slate-300">Verwacht rendement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Minimaal</div>
                <div className="text-slate-300">Onderhoudsrisico</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">200+</div>
                <div className="text-slate-300">Wachtlijst ondernemers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">De Steiger</div>
                <div className="text-slate-300">Volledig beheer</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">Waarom investeren?</h3>
                <div className="space-y-4">
                  {project.details.investorInfo.whyInvest.map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-400 mt-1" />
                      <span className="text-slate-100">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Investering Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Verwacht rendement:</span>
                    <span className="font-semibold">{project.details.investorInfo.expectedReturn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Onderhoudsrisico:</span>
                    <span className="font-semibold">{project.details.investorInfo.maintenanceRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Verhuurpotentieel:</span>
                    <span className="font-semibold">{project.details.investorInfo.rentalPotential}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Vanaf:</span>
                    <span className="font-semibold text-white">{project.startPrice}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => scrollToSection('inschrijven')}
                  className="w-full mt-6 bg-white text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
                >
                  Investeer nu
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact/Registration Section */}
      <section id="inschrijven" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interesse in {project.name}?
            </h2>
            <p className="text-xl text-gray-600">
              Vul het formulier in en wij nemen contact met je op
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bedankt!</h3>
                <p className="text-gray-600">We nemen zo snel mogelijk contact met je op.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Naam *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Je volledige naam"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="je@email.nl"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="+31 6 12345678"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Bericht
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
            )}
          </div>
        </div>
      </section>

      {/* Unit Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-none sm:rounded-xl max-w-5xl w-full h-full sm:h-auto max-h-full sm:max-h-[90vh] flex flex-col relative animate-zoom-in overflow-hidden">
            {/* Fixed Header with Close Button */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Unit {selectedUnit} Details</h3>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
            
            {(() => {
              const unitDetails = getUnitDetails(selectedUnit);
              if (!unitDetails) {
                return <div className="text-center text-gray-600">Unit details niet gevonden</div>;
              }
              
              return (
                <>
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setModalTab('overview')}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        modalTab === 'overview'
                          ? 'border-slate-800 text-slate-800'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Overzicht
                    </button>
                    <button
                      onClick={() => setModalTab('floorplan')}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        modalTab === 'floorplan'
                          ? 'border-slate-800 text-slate-800'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Vloerplan
                    </button>
                    <button
                      onClick={() => setModalTab('contact')}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        modalTab === 'contact'
                          ? 'border-slate-800 text-slate-800'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Contact
                    </button>
                  </div>

                  {/* Overview Tab */}
                  {modalTab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-4">
                      {/* Left Column - Image Gallery */}
                      <div>
                        {project.images && project.images.length > 0 ? (
                          <div className="relative group cursor-pointer" onClick={() => openImageGallery(currentImageIndex)}>
                            <img
                              src={project.images[currentImageIndex]}
                              alt={`Unit ${unitDetails.unitNumber}`}
                              className="w-full h-32 object-cover rounded-lg mb-2 transition-transform duration-200 group-hover:scale-105"
                            />
                            
                            {/* Navigation Arrows - only show if multiple images */}
                            {project.images.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                  }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                                
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                  {currentImageIndex + 1} / {project.images.length}
                                </div>
                              </>
                            )}
                            
                            {/* Click to expand indicator */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-2">
                                <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-lg h-32 mb-2 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="text-center text-xs text-gray-600">
                          Foto's van Unit {unitDetails.unitNumber}
                          {project.images && project.images.length > 1 && (
                            <span className="text-blue-600 ml-1">(Klik om te vergroten)</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right Column - Details */}
                      <div>
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Unit {unitDetails.unitNumber}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              unitDetails.status === 'beschikbaar' 
                                ? 'bg-green-100 text-green-800'
                                : unitDetails.status === 'gereserveerd'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {unitDetails.status === 'beschikbaar' ? 'Vrij' : 
                               unitDetails.status === 'gereserveerd' ? 'Gereserveerd' : 'Verkocht'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Price Section */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-900 mb-1">
                              {unitDetails.price}
                            </div>
                            <div className="text-xs text-blue-700">v.o.n. ex. BTW</div>
                          </div>
                        </div>
                        
                        {/* Area Details - PRESERVED DATA */}
                        <div className="space-y-2 mb-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Oppervlakte Details</h4>
                            <div className="space-y-2">
                              {/* Total Areas */}
                              <div className="pb-2 border-b border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-1">Totaal</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Netto:</span>
                                    <span className="font-semibold">{unitDetails.size}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Bruto:</span>
                                    <span className="font-semibold">{unitDetails.grossSize}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Industrie Areas - PRESERVED DATA */}
                              <div className="pb-3 border-b border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-2">Industrie Functie</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Netto:</span>
                                    <span className="font-semibold">{unitDetails.industrieNetto}m²</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Bruto:</span>
                                    <span className="font-semibold">{unitDetails.industrieBruto}m²</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Kantoor Areas - PRESERVED DATA */}
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Kantoor Functie</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Netto:</span>
                                    <span className="font-semibold">{unitDetails.kantoorNetto}m²</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Bruto:</span>
                                    <span className="font-semibold">{unitDetails.kantoorBruto}m²</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Specifications - PRESERVED DATA */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Specificaties:</h4>
                          <div className="space-y-2">
                            {unitDetails.features?.map((feature, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </div>
                            )) || (
                              <div className="text-gray-500 text-sm">Geen specificaties beschikbaar</div>
                            )}
                          </div>
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
                            <h3 className="text-lg font-semibold text-gray-900">Vloerplan Unit {selectedUnit}</h3>
                            <p className="text-gray-600 text-sm">{unitDetails.size} • {unitDetails.grossSize}</p>
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
                              alt={`Vloerplan Unit ${selectedUnit}`}
                              className="w-full h-auto max-h-[600px] object-contain cursor-zoom-in"
                              onClick={() => window.open(project.images[0], '_blank')}
                            />
                            
                            {/* Overlay with unit info */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                              <div className="text-sm">
                                <p className="font-semibold text-gray-900">Unit {selectedUnit}</p>
                                <p className="text-gray-600">{unitDetails.size}</p>
                                <p className="text-gray-600">{unitDetails.grossSize} bruto</p>
                              </div>
                            </div>
                            
                            {/* Zoom hint */}
                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
                              Klik voor vergroten
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs mt-3 text-center">
                          Schematische weergave van Unit {selectedUnit}. 
                          Exacte afmetingen en indeling kunnen afwijken van de werkelijkheid.
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Afmetingen</h4>
                          <p className="text-blue-700">{unitDetails.size}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Hoogte</h4>
                          <p className="text-green-700">3.70m vrije hoogte</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Vloer</h4>
                          <p className="text-gray-700">Monolitische afwerking</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Tab */}
                  {modalTab === 'contact' && (
                    <div className="py-6">
                      <div className="max-w-4xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-6 items-center">
                          {/* Left Column - Contact Illustration */}
                          <div>
                            <img
                              src="https://riskid.nl/app/uploads/2022/10/Contact-Us-1800x1093.jpg"
                              alt="Contact ons serviceteam"
                              className="w-full h-48 object-cover rounded-xl shadow mb-4"
                            />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Service Team</h4>
                            <p className="text-sm text-gray-600">Ons team staat klaar om u te helpen</p>
                          </div>
                          
                          {/* Right Column - Contact Details */}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact & Bezichtiging</h3>
                            <div className="bg-gray-50 rounded-xl p-6 shadow-lg">
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
                                    <div className="text-gray-600">info@desteiger.nl</div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-5 w-5 mr-3 text-slate-600" />
                                  <div>
                                    <div className="font-medium text-gray-900">Adres</div>
                                    <div className="text-gray-600">De Steiger 74/77, Almere</div>
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => {
                                  setSelectedUnit(null);
                                  scrollToSection('inschrijven');
                                }}
                                className="w-full mt-6 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
                              >
                                Plan een bezichtiging
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            </div>
            
            {/* Fixed Footer with Action Buttons */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
              {(() => {
                const unitDetails = getUnitDetails(selectedUnit);
                if (!unitDetails) return null;
                
                return unitDetails.status === 'beschikbaar' ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Link
                      href={`/reserveren/${project.slug}?unit=${selectedUnit}`}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors duration-200 inline-flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reserveer Nu - €1,500
                    </Link>
                    <button
                      onClick={() => setModalTab('contact')}
                      className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Meer informatie
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => setModalTab('contact')}
                      className="flex-1 bg-slate-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
                    >
                      Meer informatie
                    </button>
                    <button
                      onClick={() => setSelectedUnit(null)}
                      className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Sluiten
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => scrollToSection('inschrijven')}
          className="bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-900 transition-colors duration-200"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>

      {/* Full-Screen Image Gallery Modal */}
      {showImageGallery && project.images && project.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-5xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={closeImageGallery}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 z-10"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main Image */}
            <div className="relative">
              <img
                src={project.images[currentImageIndex]}
                alt={`Unit foto ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {/* Navigation Arrows */}
              {project.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {project.images.length}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {project.images.length > 1 && (
              <div className="flex justify-center mt-4 gap-2 overflow-x-auto max-w-full">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-white' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 