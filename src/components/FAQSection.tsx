'use client';

import React, { useState } from 'react';

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-200 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
      >
        <span className="font-bold text-gray-900">{question}</span>
        <span className={`text-gray-400 ml-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-1 text-sm text-gray-600 bg-white">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Veelgestelde vragen
          </h2>
          <p className="text-lg text-gray-600">
            Hier vindt u de antwoorden op de meest gestelde vragen over De Steiger.
          </p>
        </div>

        <div className="space-y-3">
          <FAQItem 
            question="Wat is de minimale huurtermijn?" 
            answer="De units worden uitsluitend verkocht, niet verhuurd door De Steiger. Na aankoop bent u vrij om de unit zelf te verhuren." 
          />
          <FAQItem 
            question="Is er 100% financiering mogelijk?" 
            answer="Ja, via onze partners is 100% financiering mogelijk. U heeft geen eigen vermogen nodig. Neem contact met ons op voor de specifieke voorwaarden en mogelijkheden." 
          />
          <FAQItem 
            question="Wat zijn de servicekosten (VvE)?" 
            answer="De indicatieve VvE bijdrage wordt binnenkort vastgesteld en dekt onder andere de opstalverzekering, buitenonderhoud, en reservering voor groot onderhoud." 
          />
          <FAQItem 
            question="Wanneer is de oplevering?" 
            answer="De verwachte oplevering van het project is medio 2028." 
          />
          <FAQItem 
            question="Zijn de units voorzien van nutsvoorzieningen?" 
            answer="Ja, de bedrijfsunits worden standaard opgeleverd met een meterkast voorzien van water- en elektra-aansluiting (krachtstroom is mogelijk als optie). De opslagboxen zijn voorzien van een elektra-aansluiting en verlichting." 
          />
          <FAQItem 
            question="Kan ik meerdere units koppelen?" 
            answer="Ja, het is mogelijk om meerdere units te koppelen om zo een grotere ruimte te creëren. Dit kan zowel naast elkaar als achter elkaar, afhankelijk van de beschikbaarheid. Vraag naar de mogelijkheden tijdens een gesprek." 
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Staat uw vraag er niet bij? Neem gerust contact met ons op.
          </p>
        </div>
      </div>
    </section>
  );
}
