import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 mb-6">
              De Steiger
            </div>
            <p className="text-slate-200 mb-8 max-w-md leading-relaxed">
              Duurzame bedrijfsruimtes voor ondernemers en beleggers. 
              Ontdek onze moderne, toekomstbestendige bedrijfspanden op toplocaties in Nederland.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center text-slate-200 hover:text-yellow-400 transition-colors group">
                <Mail className="h-5 w-5 mr-3 text-yellow-400 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@desteiger.nl" className="font-medium">
                  info@desteiger.nl
                </a>
              </div>
              <div className="flex items-center text-slate-200 hover:text-yellow-400 transition-colors group">
                <Phone className="h-5 w-5 mr-3 text-yellow-400 group-hover:scale-110 transition-transform" />
                <a href="tel:+31000000000" className="font-medium">
                  +31 (0)20 123 4567
                </a>
              </div>
              <div className="flex items-center text-slate-200">
                <MapPin className="h-5 w-5 mr-3 text-yellow-400" />
                <span>De Steiger 74/77, Almere</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Snel naar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/over-unity" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Over De Steiger
                </Link>
              </li>
              <li>
                <Link href="/beleggers" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Voor Beleggers
                </Link>
              </li>
              <li>
                <Link href="/ondernemers" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Voor Ondernemers
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Offerings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Onze Aanbiedingen</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/bedrijfsunits" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Bedrijfsunits
                </Link>
              </li>
              <li>
                <Link href="/opslagboxen" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Opslagboxen
                </Link>
              </li>
              <li>
                <Link href="/beleggers" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Beleggingsmogelijkheden
                </Link>
              </li>
              <li>
                <span className="text-gray-300">
                  158 Parkeerplaatsen
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup - Enhanced */}
        <div className="border-t border-slate-700 pt-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-2 text-yellow-400">Blijf op de hoogte</h4>
              <p className="text-slate-300 text-sm">
                Ontvang als eerste nieuws over nieuwe projecten en beschikbare units
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto max-w-sm">
              <input
                type="email"
                placeholder="je@email.nl"
                className="flex-1 px-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
              />
              <button className="px-6 py-3 text-sm bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-slate-900 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-100 transform hover:scale-105 transition-all duration-300">
                Inschrijven
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © 2025 De Steiger. Alle rechten voorbehouden.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <Link href="/privacy" className="text-slate-400 hover:text-yellow-400 text-sm transition-colors relative group">
                Privacy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/algemene-voorwaarden" className="text-slate-400 hover:text-yellow-400 text-sm transition-colors relative group">
                Algemene Voorwaarden
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-yellow-400 text-sm transition-colors relative group">
                Cookies
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 