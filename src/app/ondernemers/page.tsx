'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Wifi, Zap, Shield, Users, ArrowLeft, CheckCircle, Clock, Car, Award, Target } from 'lucide-react';
import Link from 'next/link';

export default function OndernemersPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/images/up/Image8.png',
    '/images/up/Image9.png',
    '/images/up/Image10.png'
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
                Voor Ondernemers
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Vind de perfecte bedrijfsruimte voor uw onderneming in het hart van Almere
              </p>
              
              {/* Statistics Grid - Mobile Friendly */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">79</div>
                  <div className="text-white/80 text-sm sm:text-base">Bedrijfsunits</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">247</div>
                  <div className="text-white/80 text-sm sm:text-base">Opslagboxen</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">15 min</div>
                  <div className="text-white/80 text-sm sm:text-base">Van Amsterdam</div>
                </div>
              </div>
              
              {/* Action Buttons - Hidden on Mobile */}
              <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <a
                  href="#ruimtes"
                  className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Bekijk Ruimtes
                </a>
                <Link
                  href="/contact"
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Plan Bezichtiging
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

      {/* Business Spaces Section */}
      <section id="ruimtes" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Onze Bedrijfsruimtes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Van kleine opslagboxen tot grote bedrijfsunits - wij hebben de perfecte ruimte voor uw bedrijf
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <img 
                src="/images/up/Image1.png" 
                alt="Bedrijfsunits voor ondernemers" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Bedrijfsunits</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Moderne bedrijfsunits van 90m² tot 400m² met alle faciliteiten die u nodig heeft. 
                Perfect voor productie, opslag, kantoor of een combinatie daarvan.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">90m² - 400m² flexibele ruimtes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Inclusief 2 parkeerplaatsen</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">3.70m vrije hoogte</span>
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
                Veilige opslagboxen van 14m² tot 49m² voor al uw opslagbehoeften. 
                Ideaal voor seizoensartikelen, voorraden of archivering.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">14m² - 49m² verschillende maten</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">24/7 toegang via app</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">2.70m vrije hoogte</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Beveiligd complex</span>
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
                src="/images/up/opslagbox3.png" 
                alt="Opslagboxen voor ondernemers" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Waarom kiezen voor De Steiger?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Alles wat u nodig heeft om uw bedrijf te laten groeien
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <img 
                src="/images/up/Image4.png" 
                alt="Strategische locatie Almere" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute bottom-4 left-4 bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                15 min naar Amsterdam
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Strategische Locatie</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                De Steiger ligt strategisch in Almere, op slechts 15 minuten van Amsterdam. 
                Perfecte bereikbaarheid voor u, uw medewerkers en klanten.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Directe toegang tot A6 en A27
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  NS-station binnen 10 minuten
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  158 gratis parkeerplaatsen
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Moderne Faciliteiten</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Alle units zijn volledig uitgerust met moderne faciliteiten en technologie 
                om uw bedrijf optimaal te ondersteunen.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Glasvezelinternet (1Gbps)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Moderne elektra-installatie
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  24/7 beveiligingssysteem
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <img 
                src="/images/up/Image5.png" 
                alt="Moderne faciliteiten" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Energielabel A+
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/images/up/Image2.png" 
                alt="Flexibele bedrijfsruimtes" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 left-4 bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Flexibel Huren
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Flexibiliteit & Service</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Wij begrijpen dat elk bedrijf uniek is. Daarom bieden wij flexibele 
                huurvoorwaarden en persoonlijke service.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Flexibele huurcontracten
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Persoonlijk accountmanagement
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Snelle onderhoudsdienst
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Onze Services
            </h2>
            <p className="text-xl text-gray-600">
              Meer dan alleen verhuur - wij ondersteunen uw bedrijf volledig
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <Building2 className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ruimte Advies</h3>
              <p className="text-gray-600 leading-relaxed">
                Persoonlijk advies om de perfecte ruimte voor uw bedrijf te vinden.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <Users className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Dedicated accountmanager voor al uw vragen en wensen.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Beveiliging</h3>
              <p className="text-gray-600 leading-relaxed">
                Professioneel beveiligingssysteem met camera's en toegangscontrole.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                <Clock className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Snelle Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Snel onderhoud en technische ondersteuning wanneer u het nodig heeft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Wat Onze Huurders Zeggen
            </h2>
            <p className="text-xl text-gray-600">
              Ontdek waarom ondernemers kiezen voor De Steiger
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Perfect gelegen en uitstekende faciliteiten. Onze logistieke operatie draait hier optimaal. 
                Het team van De Steiger denkt altijd mee."
              </p>
              <div className="flex items-center">
                <div className="bg-slate-200 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mark van der Berg</div>
                  <div className="text-gray-600 text-sm">CEO, LogiFlow B.V.</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "De flexibiliteit en service zijn uitstekend. We konden snel opschalen toen ons bedrijf groeide. 
                Aanrader voor elke ondernemer!"
              </p>
              <div className="flex items-center">
                <div className="bg-slate-200 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sandra Jansen</div>
                  <div className="text-gray-600 text-sm">Founder, TechStart Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Moderne faciliteiten, goede bereikbaarheid en een professioneel team. 
                Precies wat we zochten voor onze productielocatie."
              </p>
              <div className="flex items-center">
                <div className="bg-slate-200 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Peter Koopmans</div>
                  <div className="text-gray-600 text-sm">Director, Craft & Co</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar om uw bedrijf te laten groeien?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Plan een bezichtiging of neem contact op voor meer informatie over onze beschikbare ruimtes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
            >
              Plan Bezichtiging
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
