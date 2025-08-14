'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, CheckCircle, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/images/Image1.png)`
          }}
        />
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
                Neem Contact Op
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Heeft u vragen over onze bedrijfsunits of opslagboxen? 
                Ons team staat klaar om u te helpen.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#contact-form"
                  className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Stuur een bericht
                </a>
                <a
                  href="tel:+31201234567"
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Bel ons direct
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contactgegevens
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bereik ons via onderstaande kanalen of plan een afspraak voor een bezichtiging
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Address */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">
                De Steiger 74/77<br />
                1234 AB Almere<br />
                Nederland
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Telefoon</h3>
              <p className="text-gray-600">
                <a href="tel:+31201234567" className="hover:text-slate-600 transition-colors">
                  +31 (0)20 123 4567
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ma-Vr: 9:00-17:00
              </p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">E-mail</h3>
              <p className="text-gray-600">
                <a href="mailto:info@desteiger.nl" className="hover:text-slate-600 transition-colors">
                  info@desteiger.nl
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Binnen 24 uur reactie
              </p>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Openingstijden</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>Ma-Vr: 9:00 - 17:00</p>
                <p>Zaterdag: 10:00 - 16:00</p>
                <p>Zondag: Gesloten</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stuur ons een bericht
            </h2>
            <p className="text-xl text-gray-600">
              Vul het formulier in en wij nemen zo snel mogelijk contact met u op
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Bedankt voor uw bericht!
                </h3>
                <p className="text-gray-600 mb-8">
                  We hebben uw bericht ontvangen en nemen binnen 24 uur contact met u op.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      subject: '',
                      message: '',
                      newsletter: false
                    });
                  }}
                  className="bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
                >
                  Nieuw bericht versturen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Naam *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                      placeholder="Uw volledige naam"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mailadres *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                      placeholder="uw@email.nl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefoonnummer
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Onderwerp *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                    >
                      <option value="">Selecteer een onderwerp</option>
                      <option value="bedrijfsunit">Bedrijfsunit informatie</option>
                      <option value="opslagbox">Opslagbox informatie</option>
                      <option value="bezichtiging">Bezichtiging plannen</option>
                      <option value="investering">Beleggingsmogelijkheden</option>
                      <option value="algemeen">Algemene vraag</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Bericht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                    placeholder="Vertel ons meer over uw interesse of vraag..."
                  />
                </div>

                {/* Newsletter Signup */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="newsletter"
                        name="newsletter"
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={handleInputChange}
                        className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="newsletter" className="font-medium text-gray-900">
                        Nieuwsbrief
                      </label>
                      <p className="text-gray-600 text-sm">
                        Blijf op de hoogte van nieuwe projecten, beschikbare units en exclusieve aanbiedingen.
                        U kunt zich op elk moment weer uitschrijven.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-800 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Versturen...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Verstuur bericht
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Door dit formulier te versturen gaat u akkoord met ons privacybeleid.
                  Uw gegevens worden vertrouwelijk behandeld.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Locatie
            </h2>
            <p className="text-xl text-gray-600">
              Bezoek ons op De Steiger 74/77 in Almere
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Interactieve kaart</p>
                  <p className="text-gray-400 text-sm mt-2">
                    De Steiger 74/77, 1234 AB Almere
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Goed bereikbaar met de auto en openbaar vervoer
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>• 5 minuten van A6</span>
              <span>• Gratis parkeren</span>
              <span>• NS Station Almere Centrum (10 min)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
