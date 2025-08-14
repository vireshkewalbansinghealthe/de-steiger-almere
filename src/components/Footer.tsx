import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-4">
              De Steiger
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Duurzame bedrijfsruimtes voor ondernemers en beleggers. 
              Ontdek onze moderne, toekomstbestendige bedrijfspanden op toplocaties in Nederland.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <a href="mailto:info@desteiger.nl" className="hover:text-blue-400 transition-colors">
                  info@desteiger.nl
                </a>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <a href="tel:+31000000000" className="hover:text-blue-400 transition-colors">
                  +31 (0)20 123 4567
                </a>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-3 text-blue-400" />
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

        {/* Newsletter Signup - Compact */}
        <div className="border-t border-gray-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="text-sm font-medium mb-1">Blijf op de hoogte</h4>
              <p className="text-gray-400 text-xs">
                Ontvang updates over nieuwe ontwikkelingen
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto max-w-sm">
              <input
                type="email"
                placeholder="Je e-mailadres"
                className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Inschrijven
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 De Steiger. Alle rechten voorbehouden.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/algemene-voorwaarden" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Algemene Voorwaarden
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 