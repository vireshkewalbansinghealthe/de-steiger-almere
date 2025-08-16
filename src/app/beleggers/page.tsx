'use client';

import { useState, useEffect } from 'react';
import { Building2, Shield, TrendingUp, ArrowLeft, Users, Award, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function InvestorsPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/images/up/Image20.png',
    '/images/up/Image21.png',
    '/images/up/Image19.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden pt-16 md:pt-0">
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
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              {/* Breadcrumb - Hidden on Mobile */}
              <Link 
                href="/"
                className="hidden md:inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar home
              </Link>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Voor Beleggers
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Investeer in duurzame bedrijfsruimtes met stabiel rendement en groeiperspectieven
              </p>
              
              {/* Statistics Grid - Mobile Friendly */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">7.2%</div>
                  <div className="text-white/80 text-sm sm:text-base">Gemiddeld rendement</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">95%</div>
                  <div className="text-white/80 text-sm sm:text-base">Bezettingsgraad</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">€212k</div>
                  <div className="text-white/80 text-sm sm:text-base">Vanaf investering</div>
                </div>
              </div>
              
              {/* Action Buttons - Hidden on Mobile */}
              <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <a
                  href="#investering"
                  className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Bekijk Mogelijkheden
                </a>
                <Link
                  href="/contact"
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Plan een Gesprek
                </Link>
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
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Investment Opportunities Section */}
      <section id="investering" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Investeeringsmogelijkheden
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kies uit verschillende investeringsopties die passen bij uw portfolio
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <img 
                src="/images/up/Image2.png" 
                alt="Bedrijfsunits investering" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Bedrijfsunits</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Investeer in moderne bedrijfsunits van 90m² tot 400m². Ideaal voor ondernemers 
                die op zoek zijn naar flexibele werkruimtes in Almere.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Vanaf €212.520 per unit</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">7-8% verwacht jaarrendement</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Inclusief 2 parkeerplaatsen</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Energielabel A+</span>
                </div>
              </div>
              <Link 
                href="/bedrijfsunits" 
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
              >
                Bekijk Bedrijfsunits
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Opslagboxen</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Investeer in opslagboxen van 14m² tot 49m². Groeiende vraag naar 
                opslagruimte biedt stabiele inkomsten.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Vanaf €31.240 per box</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">6-7% verwacht jaarrendement</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">24/7 toegang voor huurders</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Lage onderhoudskosten</span>
                </div>
              </div>
              <Link 
                href="/opslagboxen" 
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
              >
                Bekijk Opslagboxen
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src="/images/up/opslagbox4.png" 
                alt="Opslagboxen investering" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Waarom De Steiger?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Onze investeringen bieden een unieke combinatie van stabiliteit, groei en duurzaamheid
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <TrendingUp className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stabiel Rendement</h3>
              <p className="text-gray-600 leading-relaxed">
                Bewezen track record met consistente returns door sterke vraag naar bedrijfsruimtes in de regio Almere.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lage Risico's</h3>
              <p className="text-gray-600 leading-relaxed">
                Diversificatie over verschillende unit types en huurders zorgt voor stabiele inkomsten en verminderde risico's.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <Building2 className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Toekomstbestendig</h3>
              <p className="text-gray-600 leading-relaxed">
                Moderne panden met energielabel A+ en duurzame materialen die waardegroei op lange termijn garanderen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bewezen Performance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Onze track record spreekt voor zich
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-slate-800 mb-2">7.2%</div>
              <div className="text-gray-600">Gemiddeld jaarrendement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-800 mb-2">€2.1M</div>
              <div className="text-gray-600">Totale waardecreatie</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-800 mb-2">250+</div>
              <div className="text-gray-600">Tevreden huurders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-800 mb-2">99.2%</div>
              <div className="text-gray-600">Klanttevredenheid</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om te investeren?
          </h2>
          <p className="text-xl mb-8 text-slate-100">
            Neem contact op voor een persoonlijk gesprek over de mogelijkheden
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Plan een gesprek
            </Link>
            <Link
              href="/brochure"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-slate-800 transition-colors duration-200"
            >
              Download brochure
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}