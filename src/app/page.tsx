'use client';

import { useState, useEffect } from 'react';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Project } from '../types';
import { Filter, Search, ArrowDown, Play, Grid, List, Share2, Link as LinkIcon, Copy, Facebook, Twitter } from 'lucide-react';

export default function HomePage() {

  const [filter, setFilter] = useState<'all' | 'nu-in-verkoop' | 'coming-soon' | 'uitverkocht'>('all');
  const [category, setCategory] = useState<'bedrijfsunits' | 'opslagboxen'>('bedrijfsunits');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'beschikbaar' | 'gereserveerd' | 'verkocht'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'area' | 'location'>('name');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const [priceMin, setPriceMin] = useState(200);
  const [priceMax, setPriceMax] = useState(900);
  const [areaMin, setAreaMin] = useState(90);
  const [areaMax, setAreaMax] = useState(400);

  // Dynamic filter ranges based on category
  const getFilterRanges = () => {
    if (category === 'opslagboxen') {
      return {
        priceMin: 30,
        priceMax: 110,
        areaMin: 14,
        areaMax: 49
      };
    }
    return {
      priceMin: 200,
      priceMax: 900,
      areaMin: 90,
      areaMax: 400
    };
  };

  const currentRanges = getFilterRanges();
  const currentLocation = 'Almere';
  const businessUnitTypesCount = 12;
  const storageBoxTypesCount = 16;

  const heroImages = [
    '/images/Image1.png',
    '/images/Image2.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Parse URL parameters on mount to restore shared state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('category')) setCategory(params.get('category') as any);
      if (params.get('filter')) setFilter(params.get('filter') as any);
      if (params.get('status')) setStatusFilter(params.get('status') as any);
      if (params.get('sort')) setSortBy(params.get('sort') as any);
      if (params.get('search')) setSearchTerm(params.get('search') || '');
      if (params.get('view')) setViewMode(params.get('view') as any);
      
      if (params.get('types')) {
        setSelectedTypes(params.get('types')?.split(',') || []);
      }
      
      if (params.get('area')) {
        const [min, max] = params.get('area')?.split('-').map(Number) || [90, 400];
        setAreaMin(min);
        setAreaMax(max);
      }
      
      if (params.get('price')) {
        const [min, max] = params.get('price')?.split('-').map(Number) || [200, 900];
        setPriceMin(min);
        setPriceMax(max);
      }
    }
  }, []);

  // Reset filters when category changes
  useEffect(() => {
    const ranges = getFilterRanges();
    setPriceMin(ranges.priceMin);
    setPriceMax(ranges.priceMax);
    setAreaMin(ranges.areaMin);
    setAreaMax(ranges.areaMax);
    setSelectedTypes([]);
    setStatusFilter('all');
    setSearchTerm('');
  }, [category]);

  const categoryProjects = projects.filter(project => {
    if (category === 'bedrijfsunits') {
      return (project.units || 0) > 0;
    }
    // For opslagboxen, check for garageBoxes property or opslagbox in name
    return (project.garageBoxes || 0) > 0 || project.name.toLowerCase().includes('opslagbox');
  }).filter(p => p.location === currentLocation);

  const totalUnitsAtLocation = projects
    .filter(p => p.location === currentLocation)
    .reduce((sum, p) => sum + (p.units || 0), 0);
  const totalBoxesAtLocation = projects
    .filter(p => p.location === currentLocation)
    .reduce((sum, p) => sum + (p.garageBoxes || 0), 0);

  const getFilteredAndSortedProjects = () => {
    let filtered = categoryProjects.filter(project => {
    const matchesFilter = filter === 'all' || 
      (filter === 'nu-in-verkoop' && project.status === 'NU IN DE VERKOOP') ||
      (filter === 'coming-soon' && project.status === 'COMING SOON') ||
      (filter === 'uitverkocht' && project.status === 'UITVERKOCHT');

    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter - for projects, we'll use the project status
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'beschikbaar' && project.status === 'NU IN DE VERKOOP') ||
        (statusFilter === 'verkocht' && project.status === 'UITVERKOCHT');

      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(project.name);

      // Area range filter - check if any unit in the project falls within the range
      let matchesAreaRange = true;
      if (project.details?.unitDetails && project.details.unitDetails.length > 0) {
        matchesAreaRange = project.details.unitDetails.some(unit => {
          const area = unit.netArea || unit.grossArea || 0;
          return area >= currentRanges.areaMin && area <= currentRanges.areaMax;
        });
      }

      // Price range filter - check if any unit in the project falls within the range
      let matchesPriceRange = true;
      if (project.details?.unitDetails && project.details.unitDetails.length > 0) {
        matchesPriceRange = project.details.unitDetails.some(unit => {
          const price = parseFloat(unit.price.replace(/[€,.\s]/g, '')) / 1000;
          return price >= currentRanges.priceMin && price <= currentRanges.priceMax;
        });
      }

      // Area filter - based on project units/garageBoxes count as proxy for size
      let matchesArea = true;
      if (areaFilter !== 'all') {
        const unitCount = project.units || project.garageBoxes || 0;
        if (areaFilter === 'small') matchesArea = unitCount < 5;
        else if (areaFilter === 'medium') matchesArea = unitCount >= 5 && unitCount <= 10;
        else if (areaFilter === 'large') matchesArea = unitCount > 10;
      }

      return matchesFilter && matchesSearch && matchesStatus && matchesType && 
             matchesAreaRange && matchesPriceRange && matchesArea;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          // Extract type numbers for numerical sorting
          const getTypeNumber = (name: string) => {
            const match = name.match(/Type (\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          const typeA = getTypeNumber(a.name);
          const typeB = getTypeNumber(b.name);
          return typeA - typeB;
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

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const generateShareUrl = () => {
    const params = new URLSearchParams();
    if (category !== 'bedrijfsunits') params.set('category', category);
    if (filter !== 'all') params.set('filter', filter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (areaMin !== 90 || areaMax !== 400) params.set('area', `${areaMin}-${areaMax}`);
    if (priceMin !== 200 || priceMax !== 900) params.set('price', `${priceMin}-${priceMax}`);
    if (searchTerm) params.set('search', searchTerm);
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
      // Fallback for older browsers
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
                  {project.units || project.garageBoxes || 0}
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
                  <a
                    href={category === 'bedrijfsunits' ? `/bedrijfsunit/${project.slug}` : `/opslagbox/${project.slug}`}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1e293b;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1e293b;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider-thumb::-webkit-slider-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }

        .slider-thumb::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Images with Ken Burns Effect */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-110 animate-ken-burns"
              style={{
                backgroundImage: `url(${image})`,
                animationDuration: '6s',
                animationIterationCount: 'infinite',
                animationDirection: index % 2 === 0 ? 'normal' : 'reverse'
              }}
            />
          </div>
        ))}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-end justify-start">
          <div className="max-w-4xl px-8 sm:px-12 lg:px-16 pb-16 text-left ml-0">
            <div className="animate-fade-in-up">
              {/* Main Headline */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-tight tracking-wide">
                <span className="block font-serif animate-slide-in-left">Welkom</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 animate-slide-in-right font-serif">
                  bij De Steiger
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl lg:text-3xl text-slate-100 mb-12 max-w-3xl font-light leading-relaxed animate-fade-in delay-300 tracking-wide">
                duurzame bedrijfsruimtes<br />
                <span className="text-white font-normal">voor ondernemers en beleggers</span>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-8 animate-fade-in delay-700">
                <button
                  onClick={scrollToProjects}
                  className="group bg-white text-slate-800 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                >
                  <span className="flex items-center">
                    Ontdek Onze Units
                    <ArrowDown className="ml-3 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
                  </span>
                </button>
                
                <button className="group bg-transparent border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-slate-800 transform hover:scale-105 transition-all duration-300">
                  <span className="flex items-center">
                    <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Bekijk Video
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToProjects}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors duration-300"
          >
            <ArrowDown className="h-6 w-6 mb-2" />
            <span className="text-sm">Scroll Down</span>
          </button>
        </div>
      </div>

            {/* About De Steiger Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Left Column - Narrower */}
            <div className="lg:col-span-2">
              {/* Call to Action Box */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Blijf op de hoogte!
                </h3>
                <p className="text-slate-200 mb-6 leading-relaxed">
                  Ontvang als eerste informatie over nieuwe projecten, beschikbare units en exclusieve aanbiedingen.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="je@email.nl"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-slate-300 transition-all duration-300"
                  />
                  <button className="w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-100 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    Inschrijven
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Wider */}
            <div className="lg:col-span-3">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Een bedrijfsunit of opslagbox kopen?
                </h2>
                <h3 className="text-2xl md:text-3xl font-light text-gray-600 mb-8 leading-relaxed">
                  Ontdek de duurzame oplossingen van De Steiger
                </h3>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-700 leading-relaxed mb-6">
                    Op zoek naar een <strong>modern, toekomstbestendig bedrijfsunit</strong> of een <strong>flexibele opslagbox</strong>? De Steiger ontwikkelt duurzame, koppelbare en multifunctionele werkruimtes op toplocaties in Nederland.
                  </p>
                  
                  <p className="text-xl text-gray-700 leading-relaxed mb-6">
                    Onze bedrijfsunits staan voor <strong>duurzaamheid, kwaliteit en veelzijdigheid</strong>, en vormen daarmee de perfecte basis voor een inspirerende werkomgeving met alle ruimte voor lef, creativiteit en rendement.
                  </p>
                  
                  <p className="text-xl text-gray-700 leading-relaxed">
                    Of je nu een bedrijfsunit wilt kopen voor eigen gebruik of een bedrijfsunit als belegging, bij ons vind je <strong>zakelijke huisvesting die meegroeit met jouw ambities</strong>.
                  </p>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={scrollToProjects}
                    className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Bekijk Onze Units
                  </button>
                  <button className="bg-white text-gray-900 border-2 border-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-300">
                    Meer Over De Steiger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          {/* Category Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden">
              <button
                onClick={() => setCategory('bedrijfsunits')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  category === 'bedrijfsunits'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bedrijfsunits (12 types)
              </button>
              <button
                onClick={() => setCategory('opslagboxen')}
                className={`px-6 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${
                  category === 'opslagboxen'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Opslagboxen (16 types)
              </button>
            </div>
          </div>

          {/* Enhanced Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              <Filter className="inline h-4 w-4 mr-2" />
              Alle types
            </button>
            <button
              onClick={() => setFilter('nu-in-verkoop')}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                filter === 'nu-in-verkoop'
                  ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              Nu in verkoop
            </button>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Zoek op locatie of projectnaam..."
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
                    {Array.from(new Set(categoryProjects.map(p => p.name))).map(type => (
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
                        min={currentRanges.areaMin}
                        max={currentRanges.areaMax}
                        step="5"
                        value={areaMin}
                        onChange={(e) => setAreaMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{currentRanges.areaMin}m²</span>
                        <span>{currentRanges.areaMax}m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min={currentRanges.areaMin}
                        max={currentRanges.areaMax}
                        step="5"
                        value={areaMax}
                        onChange={(e) => setAreaMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{currentRanges.areaMin}m²</span>
                        <span>{currentRanges.areaMax}m²</span>
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
                        min={currentRanges.priceMin}
                        max={currentRanges.priceMax}
                        step="10"
                        value={priceMin}
                        onChange={(e) => setPriceMin(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€{currentRanges.priceMin}k</span>
                        <span>€{currentRanges.priceMax}k</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="range"
                        min={currentRanges.priceMin}
                        max={currentRanges.priceMax}
                        step="10"
                        value={priceMax}
                        onChange={(e) => setPriceMax(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€{currentRanges.priceMin}k</span>
                        <span>€{currentRanges.priceMax}k</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    const ranges = getFilterRanges();
                    setStatusFilter('all');
                    setSelectedTypes([]);
                    setAreaMin(ranges.areaMin);
                    setAreaMax(ranges.areaMax);
                    setPriceMin(ranges.priceMin);
                    setPriceMax(ranges.priceMax);
                    setSortBy('name');
                    setSearchTerm('');
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
                        className={`px-3 py-1 text-sm rounded-l ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 text-sm rounded-r ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
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

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                  <strong>{filteredProjects.length}</strong> van {categoryProjects.length} types gevonden
                </div>

                          {/* Projects Grid/Table */}
                {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
                ) : (
                  <div className="mb-16">
                    {renderTableView()}
                  </div>
                )}

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen projecten gevonden</h3>
              <p className="text-gray-600 mb-6">Probeer je zoekopdracht aan te passen of kies een ander filter.</p>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition-colors"
              >
                Toon alle projecten
              </button>
            </div>
          )}
              </div>
            </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div id="contact" className="bg-gradient-to-br from-blue-600 to-blue-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Blijf op de hoogte!
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Ontvang als eerste informatie over nieuwe projecten, beschikbare units en exclusieve aanbiedingen.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="je@email.nl"
                className="flex-1 px-6 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Inschrijven
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              Geen spam, je kunt je altijd uitschrijven. Zie ons privacybeleid.
            </p>
          </div>
        </div>
      </div>

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
              Deel deze gefilterde weergave van {filteredProjects.length} {category} met anderen.
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
                      text: `Bekijk deze ${filteredProjects.length} bedrijfsunits op De Steiger in Almere`,
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

    </>
  );
}
