'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';

interface FloatingCallButtonProps {
  hidden?: boolean;
}

export default function FloatingCallButton({ hidden = false }: FloatingCallButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFormOpen(false);
      }
    }

    if (isOpen || isFormOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isFormOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/bezichtiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: 'terugbelverzoek@desteiger.nl', // dummy email as it might be required by API
          phone: formData.phone,
          unitInfo: 'Terugbelverzoek via zwevende knop',
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setIsSubmitted(false);
        setFormData({ name: '', phone: '' });
      }, 3000);
    }
  };

  if (hidden) return null;

  return (
    <>
      {/* Backdrop for form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity" />
      )}

      {/* Floating Form */}
      <div 
        ref={formRef}
        className={`fixed bottom-24 right-6 z-[60] w-[calc(100vw-3rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isFormOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
          <h3 className="font-bold">Bel mij terug</h3>
          <button 
            onClick={() => setIsFormOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900">Verzoek ontvangen!</h4>
              <p className="text-sm text-gray-500 mt-1">We bellen u zo snel mogelijk terug.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Laat uw naam en telefoonnummer achter, dan bellen wij u zo snel mogelijk terug.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Uw naam</label>
                <input
                  required type="text" placeholder="Naam"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Telefoonnummer</label>
                <input
                  required type="tel" placeholder="06 12345678"
                  value={formData.phone}
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md mt-2"
              >
                {isSubmitting ? 'Versturen...' : 'Bel mij terug'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[60]" ref={menuRef}>
        {/* Menu Options */}
        <div 
          className={`absolute bottom-full right-0 mb-4 flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${
            isOpen && !isFormOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            onClick={() => {
              setIsOpen(false);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-3 bg-white hover:bg-gray-50 text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl transition-colors border border-gray-100 whitespace-nowrap group w-full"
          >
            <div className="bg-slate-100 rounded-full p-2 group-hover:bg-yellow-100 transition-colors">
              <MessageCircle className="h-5 w-5 text-slate-700 group-hover:text-yellow-600" />
            </div>
            <span className="font-bold text-sm">Bel mij terug</span>
          </button>
          
          <a
            href="tel:0685727480"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 bg-white hover:bg-gray-50 text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl transition-colors border border-gray-100 whitespace-nowrap group"
          >
            <div className="bg-slate-100 rounded-full p-2 group-hover:bg-yellow-100 transition-colors">
              <Phone className="h-5 w-5 text-slate-700 group-hover:text-yellow-600" />
            </div>
            <span className="font-bold text-sm">Bel ons direct</span>
          </a>
        </div>

        {/* Main Button */}
        <button
          onClick={() => {
            if (isFormOpen) {
              setIsFormOpen(false);
            } else {
              setIsOpen(!isOpen);
            }
          }}
          className={`flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group ${
            isOpen || isFormOpen ? 'ring-4 ring-yellow-400/30' : ''
          }`}
          aria-label="Neem contact op"
        >
          <div className={`bg-slate-900 rounded-full p-2 transition-transform duration-300 ${isOpen || isFormOpen ? 'rotate-12' : 'group-hover:rotate-12'}`}>
            <Phone className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="font-bold text-sm whitespace-nowrap pr-2">
            Neem contact op
          </span>
        </button>
      </div>
    </>
  );
}
