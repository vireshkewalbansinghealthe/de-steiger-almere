'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Image, Map, Building2, Package, Users, Eye, Calendar } from 'lucide-react';

export default function DownloadsPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/images/Image1.png',
    '/images/Image2.png',
    '/images/Image3.png',
    '/images/Image12.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const downloadCategories = [
    {
      id: 'brochures',
      title: 'Brochures & Overzichten',
      icon: FileText,
      description: 'Algemene informatie en projectoverzichten',
      items: [
        {
          name: 'De Steiger - Projectbrochure',
          description: 'Complete overzicht van alle bedrijfsunits en opslagboxen',
          type: 'PDF',
          size: '2.8 MB',
          date: '2024-01-15'
        },
        {
          name: 'Bedrijfsunits Overzicht',
          description: 'Gedetailleerde informatie over alle 12 typen bedrijfsunits',
          type: 'PDF',
          size: '1.9 MB',
          date: '2024-01-10'
        },
        {
          name: 'Opslagboxen Catalogus',
          description: 'Alle 16 typen opslagboxen met specificaties en prijzen',
          type: 'PDF',
          size: '1.5 MB',
          date: '2024-01-10'
        },
        {
          name: 'Beleggingsinformatie',
          description: 'Informatie voor potentiële investeerders en beleggers',
          type: 'PDF',
          size: '1.2 MB',
          date: '2024-01-08'
        }
      ]
    },
    {
      id: 'floorplans',
      title: 'Plattegronden & Schematics',
      icon: Map,
      description: 'Technische tekeningen en plattegronden',
      items: [
        {
          name: 'Masterplan De Steiger',
          description: 'Overzichtstekening van het gehele complex',
          type: 'PDF',
          size: '3.2 MB',
          date: '2024-01-12'
        },
        {
          name: 'Bedrijfsunits Plattegronden',
          description: 'Gedetailleerde plattegronden van alle bedrijfsunit typen',
          type: 'ZIP',
          size: '8.5 MB',
          date: '2024-01-12'
        },
        {
          name: 'Opslagboxen Layouts',
          description: 'Schematische weergave van alle opslagbox configuraties',
          type: 'PDF',
          size: '2.1 MB',
          date: '2024-01-12'
        },
        {
          name: 'Parkeerplaatsen Indeling',
          description: 'Overzicht van alle 158 parkeerplaatsen',
          type: 'PDF',
          size: '1.8 MB',
          date: '2024-01-12'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technische Specificaties',
      icon: Building2,
      description: 'Technische documenten en specificaties',
      items: [
        {
          name: 'Bouwkundige Specificaties',
          description: 'Gedetailleerde bouwkundige en technische specificaties',
          type: 'PDF',
          size: '2.9 MB',
          date: '2024-01-14'
        },
        {
          name: 'Installatie Overzicht',
          description: 'Elektra, water, internet en beveiligingsinstallaties',
          type: 'PDF',
          size: '1.7 MB',
          date: '2024-01-14'
        },
        {
          name: 'Duurzaamheidsrapport',
          description: 'Energielabel A+ certificering en duurzaamheidsmaatregelen',
          type: 'PDF',
          size: '1.4 MB',
          date: '2024-01-13'
        },
        {
          name: 'Onderhoudshandleiding',
          description: 'Informatie over onderhoud en faciliteiten',
          type: 'PDF',
          size: '2.2 MB',
          date: '2024-01-11'
        }
      ]
    },
    {
      id: 'images',
      title: 'Foto\'s & Visualisaties',
      icon: Image,
      description: 'Hoogresolutie foto\'s en 3D visualisaties',
      items: [
        {
          name: 'Exterieur Foto\'s',
          description: 'Professionele foto\'s van het gebouw en omgeving',
          type: 'ZIP',
          size: '15.2 MB',
          date: '2024-01-16'
        },
        {
          name: 'Interieur Bedrijfsunits',
          description: 'Foto\'s van verschillende bedrijfsunit configuraties',
          type: 'ZIP',
          size: '12.8 MB',
          date: '2024-01-16'
        },
        {
          name: 'Opslagboxen Foto\'s',
          description: 'Overzichtsfoto\'s van alle opslagbox typen',
          type: 'ZIP',
          size: '8.9 MB',
          date: '2024-01-16'
        },
        {
          name: '3D Visualisaties',
          description: 'Hoogresolutie 3D renders en visualisaties',
          type: 'ZIP',
          size: '22.1 MB',
          date: '2024-01-15'
        }
      ]
    }
  ];

  const handleDownload = (fileName: string) => {
    // Simulate download
    console.log(`Downloading: ${fileName}`);
    // In a real application, this would trigger the actual download
    alert(`Download gestart: ${fileName}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transform scale-105"
              style={{
                backgroundImage: `url(${image})`
              }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <Link 
                href="/"
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar home
              </Link>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Downloads & Documenten
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Download alle informatie, plattegronden, specificaties en foto's van De Steiger
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#downloads"
                  className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Bekijk Downloads
                </a>
                <a
                  href="#contact"
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Hulp Nodig?
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Downloads Section */}
      <section id="downloads" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Download Centrum
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Alle documenten, plattegronden en informatie over De Steiger op één plek
            </p>
          </div>

          <div className="space-y-16">
            {downloadCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
                    <div className="flex items-center">
                      <div className="bg-white/20 rounded-lg p-3 mr-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                        <p className="text-slate-200">{category.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {category.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {item.name}
                              </h4>
                              <p className="text-gray-600 text-sm mb-3">
                                {item.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="bg-slate-100 px-2 py-1 rounded">
                                  {item.type}
                                </span>
                                <span>{item.size}</span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(item.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleDownload(item.name)}
                              className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors duration-200 text-sm font-medium"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium">
                              <Eye className="h-4 w-4 mr-2" />
                              Bekijk
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Populaire Downloads
            </h2>
            <p className="text-xl text-gray-600">
              De meest gedownloade documenten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Projectbrochure</h3>
              <p className="text-gray-600 mb-4">
                Alle informatie over De Steiger in één document
              </p>
              <button
                onClick={() => handleDownload('Complete Projectbrochure')}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
              >
                Download PDF
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Map className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alle Plattegronden</h3>
              <p className="text-gray-600 mb-4">
                Complete set van alle units en opslagboxen
              </p>
              <button
                onClick={() => handleDownload('Alle Plattegronden')}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
              >
                Download ZIP
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Image className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Foto Collectie</h3>
              <p className="text-gray-600 mb-4">
                Hoogresolutie foto's van alle ruimtes
              </p>
              <button
                onClick={() => handleDownload('Foto Collectie')}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
              >
                Download ZIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section id="contact" className="py-20 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hulp Nodig?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Kunt u niet vinden wat u zoekt? Ons team helpt u graag verder.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
            >
              <Users className="h-5 w-5 mr-2 inline" />
              Neem Contact Op
            </Link>
            <a
              href="tel:+31201234567"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Bel Direct: +31 (0)20 123 4567
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
