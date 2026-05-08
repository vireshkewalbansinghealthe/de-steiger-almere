'use client';

import React from 'react';
import { Phone } from 'lucide-react';

export default function FloatingCallButton() {
  return (
    <a
      href="tel:0685727480"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group"
      aria-label="Bel ons voor advies"
    >
      <div className="bg-slate-900 rounded-full p-2 group-hover:rotate-12 transition-transform duration-300">
        <Phone className="h-5 w-5 text-yellow-400" />
      </div>
      <span className="font-bold text-sm whitespace-nowrap pr-2">
        Neem contact op voor advies
      </span>
    </a>
  );
}
