'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Phone, Mail, User, MessageSquare, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { FloorplanUnit } from './SimpleFloorplan';

interface UnitDrawerProps {
  unit: FloorplanUnit | null;
  onClose: () => void;
}

export default function UnitDrawer({ unit, onClose }: UnitDrawerProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset when unit changes
  useEffect(() => {
    setSubmitted(false);
    setForm({ name: '', email: '', phone: '', message: '' });
    setImgError(false);
  }, [unit?.unit_number]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;
    setSubmitting(true);
    try {
      await fetch('/api/bezichtiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          unitInfo: `${unit.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'} Type ${unit.type_number} — Unit ${unit.unit_number}${form.message ? ' — ' + form.message : ''}`,
        }),
      });
    } catch (err) {
      console.error('Contact form error:', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  const typeLabel = unit?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
  const floorplanSrc = unit
    ? `/images/floorplans/${typeLabel}_Type_${unit.type_number}.png`
    : null;
  const reserveSlug = unit ? `${unit.type}-type-${unit.type_number}` : null;
  const isAvailable = unit?.status === 'available';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${unit ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
        bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-2xl
        sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-[400px] sm:rounded-none sm:rounded-l-2xl
        ${unit ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}
      `}>
        {/* Drag handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              {typeLabel} Type {unit?.type_number}
            </div>
            <h2 className="text-xl font-bold text-gray-900">Unit {unit?.unit_number}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAvailable ? 'bg-green-100 text-green-800' :
                unit?.status === 'reserved' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {isAvailable ? 'Beschikbaar' : unit?.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
              </span>
              <span className="text-sm text-gray-500">{unit?.gross_area}m²</span>
              <span className="text-sm font-bold text-gray-900">
                € {unit?.sale_price?.toLocaleString('nl-NL')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Floorplan image */}
          {floorplanSrc && !imgError && (
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <img
                src={floorplanSrc}
                alt={`Plattegrond ${typeLabel} Type ${unit?.type_number}`}
                className="w-full max-h-44 object-contain"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          <div className="p-5 space-y-5">
            {/* Contact / info form */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {isAvailable ? 'Informatie aanvragen' : 'Interesse? Meld u aan voor terugkeer'}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Vul uw gegevens in en wij nemen zo snel mogelijk contact met u op.
              </p>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Bericht verstuurd</p>
                  <p className="text-sm text-gray-400 mt-1">We nemen zo snel mogelijk contact met u op.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text" required placeholder="Uw naam"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email" required placeholder="E-mailadres"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel" required placeholder="Telefoonnummer"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      rows={2} placeholder="Uw vraag of bericht (optioneel)"
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={submitting}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {submitting ? 'Versturen...' : 'Aanvraag versturen'}
                  </button>
                </form>
              )}
            </div>

            {/* Reserve CTA — only if available, below the form */}
            {isAvailable && reserveSlug && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3 text-center">Klaar om te reserveren?</p>
                <Link
                  href={`/reserveren/${reserveSlug}?unit=${unit?.unit_number}`}
                  className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white font-semibold py-3 px-5 rounded-xl transition-all text-sm group"
                >
                  <Calendar className="h-4 w-4" />
                  Reserveer Unit {unit?.unit_number}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <p className="text-xs text-gray-400 text-center mt-2">€1.500 aanbetaling · wordt verrekend bij aankoop</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
