import Link from 'next/link';
import { Building, Leaf, Users, TrendingUp, Award, Target, Lightbulb, Shield, Wallet } from 'lucide-react';
import ContactSection from '@/components/ContactSection';
import FAQSection from '@/components/FAQSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage: 'url(/images/Image12.png)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Over De Steiger
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Duurzame bedrijfsruimtes die de toekomst van werk vormgeven in Almere
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/aanbod"
                className="bg-yellow-400 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-yellow-400/20"
              >
                Bekijk Aanbod & Reserveer
              </Link>
              <a
                href="tel:0685727480"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                06 - 857 27 480
              </a>
            </div>
    </div>
        </div>
      </div>

      {/* Mission Section */}
      <div id="missie" className="bg-gradient-to-br from-slate-50 to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Onze Missie
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                De Steiger ontwikkelt duurzame, koppelbare en multifunctionele werkruimtes op toplocaties in Almere op 15 minuten van Amsterdam.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Onze bedrijfspanden staan voor duurzaamheid, kwaliteit en veelzijdigheid, en vormen daarmee de perfecte 
                basis voor een inspirerende werkomgeving met alle ruimte voor lef, creativiteit en rendement.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/images/Image2.png" 
                alt="De Steiger bedrijfspand" 
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-800 mb-1">79</div>
                    <div className="text-xs text-slate-600">Bedrijfsunits</div>
                  </div>
                  <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-800 mb-1">247</div>
                    <div className="text-xs text-slate-600">Opslagboxen</div>
        </div>
            </div>
          </div>
            </div>
            </div>
          </div>
        </div>

      {/* Professional Features Section */}
      <div id="waarden" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Wat maakt De Steiger uniek?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ontdek de voordelen van onze moderne bedrijfsruimtes en opslagfaciliteiten
            </p>
        </div>

          {/* Financing Section */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden mb-20 shadow-2xl">
            <div className="grid lg:grid-cols-2 items-center">
              <div className="p-12 lg:p-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl mb-8">
                  <Wallet className="h-8 w-8 text-slate-900" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  100% Financiering Mogelijk
                </h3>
                <p className="text-xl text-slate-300 leading-relaxed mb-8">
                  Bij De Steiger maken we het ondernemers makkelijk. In samenwerking met onze partners bieden we de mogelijkheid tot 100% financiering van uw bedrijfsruimte.
                </p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center text-slate-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Geen eigen vermogen nodig
                  </div>
                  <div className="flex items-center text-slate-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Scherpe rentetarieven
                  </div>
                  <div className="flex items-center text-slate-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Snel en transparant proces
                  </div>
                </div>
                <a
                  href="https://clarencefinance.nl/desteiger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Bereken uw Financiering
                </a>
              </div>
              <div className="relative h-full min-h-[400px]">
                <img 
                  src="/images/up/Image10.png" 
                  alt="Financiering mogelijkheden" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
        </div>
      </div>
    </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <img 
                src="/images/Image10.png" 
                alt="Duurzame bedrijfsruimtes" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Energielabel A+
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Duurzaam & Toekomstbestendig</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Alle units zijn voorzien van energielabel A+ en moderne, milieuvriendelijke technologieën. 
                Investeer in de toekomst met ruimtes die meegroeien met veranderende behoeften.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Zonnepanelen (optie) en LED-verlichting
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Hoogwaardige isolatie
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Smart building technologie
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Strategische Locatie</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Almere biedt de perfecte balans tussen bereikbaarheid en betaalbaarheid. 
                Op slechts 15 minuten van Amsterdam, met uitstekende verbindingen.
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
                  Ruime parkeerfaciliteiten (158 plaatsen)
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <img 
                src="/images/Image4.png" 
                alt="Locatie Almere" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute bottom-4 left-4 bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                15 min naar Amsterdam
              </div>
          </div>
        </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/images/Image11.png" 
                alt="Moderne faciliteiten" 
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 right-4 bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                24/7 Toegang
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Moderne Faciliteiten</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Van kleine opslagboxen tot grote bedrijfsunits - alle ruimtes zijn uitgerust 
                met moderne faciliteiten en hoogwaardige afwerking.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Glasvezelinternet en moderne elektra
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Beveiligingssysteem met toegangscontrole
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3"></div>
                  Flexibele ruimte-indeling mogelijk
                </li>
              </ul>
            </div>
          </div>
          </div>
        </div>

      {/* Why Choose Section */}
      <div className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Waarom De Steiger?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              De perfecte combinatie van locatie, duurzaamheid en rendement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Strategische Locatie</h3>
              <p className="text-slate-300 leading-relaxed">
                Almere, op slechts 15 minuten van Amsterdam. Uitstekende bereikbaarheid en groeiende economie.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-white" />
                      </div>
              <h3 className="text-xl font-bold mb-4">Veilige Investering</h3>
              <p className="text-slate-300 leading-relaxed">
                Stabiele waardegroei in een groeiende markt met bewezen track record en solide fundamenten.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-6">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Toekomstbestendig</h3>
              <p className="text-slate-300 leading-relaxed">
                Energielabel A+, moderne technieken en flexibele ruimtes die meegroeien met de tijd.
              </p>
            </div>
          </div>
              </div>
            </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <ContactSection />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Klaar om te groeien met De Steiger?
          </h2>
          <p className="text-xl mb-10 text-slate-300 max-w-2xl mx-auto">
            Ontdek onze bedrijfsunits en opslagboxen en vind de perfecte ruimte voor jouw onderneming
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/aanbod?tab=bedrijfsunits" 
              className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
            >
              Bedrijfsunits
            </Link>
            <Link 
              href="/aanbod?tab=opslagboxen" 
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Opslagboxen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
