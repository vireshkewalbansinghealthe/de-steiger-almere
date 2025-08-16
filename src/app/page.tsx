'use client';

import { useState, useEffect } from 'react';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Project } from '../types';
import { Filter, Search, ArrowDown, Play, Grid, List, Share2, Link as LinkIcon, Copy, Facebook, Twitter, X } from 'lucide-react';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Countdown timer for November 1, 2025
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const targetDate = new Date('2025-11-01T00:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Smooth scroll tracking with Apple-style rubber band effect
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      setScrollY(currentScrollY);
      setScrollDirection(direction);
      setIsScrolling(true);
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set scrolling to false after scroll ends (rubber band effect)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollDirection(null);
      }, 150);
      
      lastScrollY = currentScrollY;
    };

    // Smooth scrolling behavior with rubber band
    document.documentElement.style.scrollBehavior = 'smooth';
    document.body.style.overscrollBehavior = 'contain'; // Enable bounce effect
    
    // Throttled scroll listener for performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollListener);
      clearTimeout(scrollTimeout);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Intersection Observer for scroll-to-reveal animations (one-time only)
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '-10% 0px -20% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Only animate if not already revealed
          if (!entry.target.classList.contains('animate-reveal')) {
            entry.target.classList.add('animate-reveal');
            entry.target.classList.remove('animate-hide');
            // Mark as revealed so it doesn't animate again
            entry.target.setAttribute('data-revealed', 'true');
          }
        }
        // Don't remove the reveal class when scrolling up - let it stay revealed
      });
    }, observerOptions);

    // Observe only sections (not cards)
    const sections = document.querySelectorAll('.scroll-reveal-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

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
    '/images/up/Image1.png',
    '/images/up/Image2.png'
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
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      // Custom smooth scroll with enhanced easing
      const startPosition = window.pageYOffset;
      const targetPosition = projectsSection.offsetTop - 80; // Offset for header
      const distance = targetPosition - startPosition;
      const duration = 1200; // 1.2 seconds
      let start: number | null = null;

      // Easing function - cubic-bezier(0.4, 0, 0.2, 1)
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * easedProgress);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
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
              <tr 
                key={project.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  window.location.href = category === 'bedrijfsunits' ? `/bedrijfsunit/${project.slug}` : `/opslagbox/${project.slug}`;
                }}
              >
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = category === 'bedrijfsunits' ? `/bedrijfsunit/${project.slug}` : `/opslagbox/${project.slug}`;
                    }}
                    className="text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Details →
                  </button>
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
        /* Apple-Style Rubber Band Scrolling */
        html {
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        
        body {
          overscroll-behavior-y: contain;
          -webkit-overflow-scrolling: touch;
        }
        
        * {
          scroll-behavior: smooth;
        }
        
        @media (prefers-reduced-motion: no-preference) {
          html {
            scroll-behavior: smooth;
          }
        }
        
        /* Enhanced Smooth Scrolling with Rubber Band Effect */
        .smooth-scroll {
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .rubber-band-scroll {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .parallax-slow {
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Scroll-to-Reveal Animations - Subtle fade-up effect for sections only */
        .scroll-reveal-section {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, opacity;
        }
        
        .scroll-reveal-section.animate-reveal {
          opacity: 1;
          transform: translateY(0px);
        }
        
        /* Once revealed, stay revealed */
        .scroll-reveal-section[data-revealed="true"] {
          opacity: 1;
          transform: translateY(0px);
        }
        
        .fade-in-scroll {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .slide-in-left {
          animation: slideInLeft 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .slide-in-right {
          animation: slideInRight 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .ken-burns {
          animation: kenBurns 8s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        
        @keyframes kenBurns {
          0% {
            transform: scale(1) translateX(0) translateY(0);
          }
          100% {
            transform: scale(1.1) translateX(-20px) translateY(-10px);
          }
        }
        
        /* Enhanced Hover Effects with Rubber Band */
        .rubber-band-hover {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* Disable rubber-band on mobile to prevent click interference */
        @media (hover: hover) and (pointer: fine) {
          .rubber-band-hover:hover {
            transform: scale(1.05);
          }
          
          .rubber-band-hover:active {
            transform: scale(0.95);
            transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
        }
        
        /* Disable hover effects on touch devices for specific classes */
        @media (hover: none) and (pointer: coarse) {
          .hover\\:bg-blue-50:hover,
          .hover\\:bg-white:hover,
          .hover\\:text-slate-800:hover,
          .hover\\:shadow-3xl:hover,
          .group-hover\\:translate-y-1,
          .group-hover\\:scale-110 {
            background-color: inherit !important;
            color: inherit !important;
            box-shadow: inherit !important;
            transform: none !important;
          }
        }
        
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
        {/* Background Images with Ken Burns Effect and Parallax */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-110 ken-burns parallax-slow"
              style={{
                backgroundImage: `url(${image})`,
                transform: `scale(1.1) translateY(${scrollY * 0.5}px)`,
                animationDuration: '8s',
                animationIterationCount: 'infinite',
                animationDirection: index % 2 === 0 ? 'normal' : 'reverse'
              }}
            />
          </div>
        ))}
        
        {/* Gradient Overlays with Parallax */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 parallax-slow" 
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent parallax-slow"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-black/70 via-black/30 to-transparent parallax-slow"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        
        {/* Mobile-Optimized Hero Content */}
        <div className="relative z-10 h-full flex items-center sm:items-end justify-start">
          <div className="max-w-4xl px-4 sm:px-8 lg:px-16 pb-4 sm:pb-16 text-left ml-0 w-full mt-16 sm:mt-0">
            <div className="animate-fade-in-up">
              {/* Mobile-Optimized Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 sm:mb-6 leading-tight tracking-wide">
                <span className="block font-serif animate-slide-in-left">Welkom</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 animate-slide-in-right font-serif">
                  bij De Steiger
                </span>
              </h1>
              
              {/* Mobile-Optimized Subtitle */}
              <p className="text-base sm:text-lg md:text-2xl lg:text-3xl text-slate-100 mb-8 sm:mb-12 max-w-3xl font-light leading-relaxed animate-fade-in delay-300 tracking-wide">
                duurzame bedrijfsruimtes<br />
                <span className="text-white font-normal">voor ondernemers en beleggers</span>
              </p>
              
              {/* Mobile-Optimized CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-stretch sm:items-start animate-fade-in delay-700 max-w-lg sm:max-w-none">
                <button
                  onClick={scrollToProjects}
                  className="group bg-white text-slate-800 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:hover:bg-blue-50 shadow-2xl md:hover:shadow-3xl w-full sm:w-auto touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="flex items-center justify-center">
                    <span className="truncate">Ontdek Onze Units</span>
                    <ArrowDown className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-y-1 transition-transform duration-300 flex-shrink-0" />
                  </span>
                </button>
                
                <button className="group bg-transparent border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:hover:bg-white md:hover:text-slate-800 w-full sm:w-auto touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="flex items-center justify-center">
                    <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                    <span className="truncate">Bekijk Video</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Countdown Timer - Bottom Right (Rechtonder) with Parallax */}
        <div 
          className="absolute bottom-20 right-12 z-20 animate-fade-in delay-500 hidden lg:block parallax-slow"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30 shadow-2xl min-w-[450px] rubber-band-hover hover:shadow-3xl transition-all duration-700 ease-out">
            <div className="text-center mb-6">
              <div className="text-white font-bold text-xl mb-2">Eerste Fase Verkoop</div>
              <div className="text-yellow-400 font-semibold text-base">1 November 2025</div>
            </div>
            
            {/* Timer Display - Bigger with Smooth Animations */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center bg-white/10 rounded-xl py-5 px-3 border border-yellow-400/20 smooth-scroll hover:bg-white/20 transition-all duration-500">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-300 mb-2 smooth-scroll">{timeLeft.days}</div>
                <div className="text-white/80 text-sm uppercase font-semibold tracking-wide">Dagen</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl py-5 px-3 border border-yellow-400/20 smooth-scroll hover:bg-white/20 transition-all duration-500">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-300 mb-2 smooth-scroll">{timeLeft.hours}</div>
                <div className="text-white/80 text-sm uppercase font-semibold tracking-wide">Uren</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl py-5 px-3 border border-yellow-400/20 smooth-scroll hover:bg-white/20 transition-all duration-500">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-300 mb-2 smooth-scroll">{timeLeft.minutes}</div>
                <div className="text-white/80 text-sm uppercase font-semibold tracking-wide">Min</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl py-5 px-3 border border-yellow-400/20 smooth-scroll hover:bg-white/20 transition-all duration-500">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-300 mb-2 smooth-scroll">{timeLeft.seconds}</div>
                <div className="text-white/80 text-sm uppercase font-semibold tracking-wide">Sec</div>
              </div>
            </div>
            
            <div className="text-center mt-5">
              <p className="text-white/70 text-sm">Tot de lancering</p>
            </div>
          </div>
        </div>
        

        
        {/* Scroll Indicator with Enhanced Animation */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce parallax-slow"
          style={{ 
            transform: `translateX(-50%) translateY(${scrollY * -0.1}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.002)
          }}
        >
          <button 
            onClick={scrollToProjects}
            className="flex flex-col items-center text-white/70 hover:text-white rubber-band-hover"
          >
            <ArrowDown className="h-6 w-6 mb-2 transform hover:translate-y-1 transition-transform duration-300" />
            <span className="text-sm font-medium tracking-wide">Scroll Down</span>
          </button>
        </div>
      </div>



            {/* About De Steiger Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 scroll-reveal-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Left Column - Narrower - Hide the newsletter on mobile, show on desktop */}
            <div className="lg:col-span-2 hidden lg:block">
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
            
            {/* Right Column - Wider - Full width on mobile */}
            <div className="lg:col-span-3 col-span-full">
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
      <div id="projects" className="bg-gray-50 py-12 pb-6 lg:pb-12">
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

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters & Sortering
              {(statusFilter !== 'all' || selectedTypes.length > 0 || sortBy !== 'name') && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {[
                    statusFilter !== 'all' ? 1 : 0,
                    selectedTypes.length,
                    sortBy !== 'name' ? 1 : 0
                  ].reduce((a, b) => a + b)}
                </span>
              )}
            </button>
          </div>

          {/* Content Area with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
              {/* Desktop Filter Sidebar - Hidden on mobile */}
              <div className="hidden lg:block w-80 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6 shrink-0 h-fit">
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
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
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
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
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
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
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
                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider-thumb"
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
              <div className="flex-1 min-w-0 w-full lg:w-auto">
                {/* Top Controls */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-sm font-medium text-gray-700">Weergave:</span>
                    <div className="flex bg-white rounded border">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 text-sm rounded-l ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 text-sm rounded-r ${viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-16">
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="rubber-band-hover">
                <ProjectCard
                  project={project}
                />
              </div>
            ))}
          </div>
                ) : (
                  <div className="mb-8 lg:mb-16">
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

      {/* Interactive Location Map Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10 scroll-reveal-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Vind De Steiger bij jou in de buurt
            </h2>
            <p className="text-xl text-gray-700">
              Ontdek onze strategische locatie in Almere en plan je bezoek.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left Column - Map */}
            <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-80 md:h-96 relative bg-gray-100">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2430.1234567890123!2d5.2647!3d52.3676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609c3b9b1c3c3%3A0x1234567890123456!2sAlmere%2C%20Netherlands!5e0!3m2!1sen!2snl!4v1234567890123"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                      />
                      
                      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1 animate-pulse"></div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">De Steiger Almere</h3>
                            <p className="text-gray-600 text-xs mb-2">Hoofdlocatie</p>
                            <div className="space-y-1 text-xs text-gray-500">
                              <p>🏢 28 Bedrijfsunits</p>
                              <p>📦 16 Opslagboxen types</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
            </div>
            
            {/* Right Column - Contact Form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-3">
                  Interesse in een unit?
                </h3>
                <p className="text-slate-200 mb-5 leading-relaxed text-sm">
                  Maak een afspraak voor een bezichtiging of ontvang meer informatie over beschikbare units.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Uw naam"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-slate-300 transition-all duration-300 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="uw@email.nl"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-slate-300 transition-all duration-300 text-sm"
                  />
                  <button className="w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm">
                    Plan Bezichtiging
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  We nemen binnen 24 uur contact met u op.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Newsletter Section - Only visible on mobile */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-2 pb-6 lg:hidden scroll-reveal-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-3">
              Blijf op de hoogte!
            </h3>
            <p className="text-slate-200 mb-4 leading-relaxed">
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

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
            
            {/* Modal Panel */}
            <div className="relative transform overflow-hidden rounded-t-xl sm:rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-lg">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters & Sortering</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6 max-h-96 overflow-y-auto">
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
                  <div className="space-y-2 max-h-32 overflow-y-auto">
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
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSelectedTypes([]);
                    setSortBy('name');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Toepassen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
