import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand + contact */}
          <div className="md:col-span-2">
            <Link href="/" className="text-lg font-bold text-yellow-400 mb-1 block">
              A6 Bedrijfsunits en Opslagboxen
            </Link>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Moderne bedrijfsunits en opslagboxen op een toplocatie in Almere.
            </p>
            <div className="space-y-2.5 text-sm text-slate-300">
              <a href="mailto:info@desteigeralmere.nl" className="flex items-center gap-2.5 hover:text-yellow-400 transition-colors">
                <Mail className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                info@desteigeralmere.nl
              </a>
              <a href="tel:0685727480" className="flex items-center gap-2.5 hover:text-yellow-400 transition-colors">
                <Phone className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                06-85727480
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>De Steiger 74/77, 1317 AZ Almere</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Aanbod</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/aanbod?tab=bedrijfsunits" className="hover:text-yellow-400 transition-colors">
                  Bedrijfsunits
                </Link>
              </li>
              <li>
                <Link href="/aanbod?tab=opslagboxen" className="hover:text-yellow-400 transition-colors">
                  Opslagboxen
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-yellow-400 transition-colors">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-yellow-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700/60 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} A6 Bedrijfsunits en Opslagboxen. Alle rechten voorbehouden.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/algemene-voorwaarden" className="hover:text-slate-300 transition-colors">Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
