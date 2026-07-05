'use client';

import React, { useState } from 'react';

export default function ContactSection() {
  const [view, setView] = useState<'initial' | 'choices' | 'form' | 'call'>('initial');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      await fetch('/api/bezichtiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          unitInfo: contactForm.message || undefined,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setContactSubmitting(false);
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <section className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden">
      {/* Decorative background elements for more "opvallend" look */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-block bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-4 border border-yellow-400/30">
                Contact
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Vragen of meer<br />informatie?
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Wij helpen u graag verder. Vul het formulier in of bel ons direct, en we nemen zo snel mogelijk contact met u op.
              </p>
              
              <div className="space-y-4 text-base">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white">VVS Projectontwikkeling B.V.</div>
                    <div className="text-sm">Steiger 74–77, Almere</div>
                  </div>
                </div>
                
                <a href="mailto:administratie@vvsbouw.nl" className="flex items-center gap-3 text-slate-300 hover:text-yellow-400 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-yellow-400/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">administratie@vvsbouw.nl</span>
                </a>
                
                <a href="tel:0365211900" className="flex items-center gap-3 text-yellow-400 hover:text-yellow-300 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-yellow-400/20 group-hover:bg-yellow-400/30 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="flex flex-col">
                    <span className="font-bold text-xl tracking-wide">Telefoon: 036-5211900</span>
                    <span className="font-bold text-xl tracking-wide">Mobiel: 06-85727480</span>
                  </span>
                </a>
              </div>
            </div>

            {/* Right: form or choices */}
            <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col justify-center min-h-[320px]">
              {view === 'initial' && (
                <div className="text-center">
                  <button
                    onClick={() => setView('choices')}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-5 px-8 rounded-xl text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-400/20"
                  >
                    Ik wil meer informatie
                  </button>
                </div>
              )}

              {view === 'choices' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold text-center mb-6">Hoe wilt u contact opnemen?</h3>
                  <button
                    onClick={() => setView('form')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl text-base transition-all flex items-center justify-between group border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span>Bel mij terug</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setView('call')}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 px-6 rounded-xl text-base transition-all flex items-center justify-between group shadow-lg shadow-yellow-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900/10 text-slate-900 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span>Bel ons</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors group-hover:translate-x-1 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setView('initial')}
                    className="w-full text-center text-sm text-slate-400 hover:text-white mt-4 transition-colors"
                  >
                    Terug
                  </button>
                </div>
              )}

              {view === 'call' && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400/20 text-yellow-400 mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Bel ons direct</h3>
                  <p className="text-slate-400 mb-8">Wij staan klaar om uw vragen te beantwoorden.</p>
                  <a
                    href="tel:0365211900"
                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-2xl py-4 px-8 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-400/20 tracking-wide"
                  >
                    <span className="flex flex-col leading-snug">
                      <span>Telefoon: 036-5211900</span>
                      <span>Mobiel: 06-85727480</span>
                    </span>
                  </a>
                  <div className="mt-8">
                    <button 
                      onClick={() => setView('choices')}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Terug naar opties
                    </button>
                  </div>
                </div>
              )}

              {view === 'form' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Laat uw gegevens achter</h3>
                    <button 
                      onClick={() => setView('choices')}
                      className="text-slate-400 hover:text-white transition-colors p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {contactSubmitted ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Bericht ontvangen!</h3>
                      <p className="text-slate-400 mb-6">We nemen zo snel mogelijk contact met u op.</p>
                      <button
                        onClick={() => setContactSubmitted(false)}
                        className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 underline underline-offset-4"
                      >
                        Nog een bericht sturen
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Uw naam</label>
                          <input
                            required type="text" placeholder="Jan Jansen"
                            value={contactForm.name}
                            onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">E-mailadres</label>
                          <input
                            required type="email" placeholder="jan@email.nl"
                            value={contactForm.email}
                            onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Telefoonnummer</label>
                        <input
                          required type="tel" placeholder="06 12345678"
                          value={contactForm.phone}
                          onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Uw vraag of bericht (optioneel)</label>
                        <textarea
                          rows={3} placeholder="Waar kunnen we u mee helpen?"
                          value={contactForm.message}
                          onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                          className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none transition-all"
                        />
                      </div>
                      
                      <button
                        type="submit" disabled={contactSubmitting}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-slate-900 font-bold py-4 rounded-xl text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-400/20 mt-2"
                      >
                        {contactSubmitting ? 'Versturen...' : 'Bel mij terug'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
