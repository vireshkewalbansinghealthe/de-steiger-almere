'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Calendar, Phone, Mail, User, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';
import { FloorplanUnit } from './SimpleFloorplan';

interface UnitDrawerProps {
  unit: FloorplanUnit | null;
  onClose: () => void;
}

const escHtml = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function UnitDrawer({ unit, onClose }: UnitDrawerProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset form when unit changes
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

  const reserveSlug = unit
    ? `${unit.type}-type-${unit.type_number}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${unit ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer — right side on desktop, bottom sheet on mobile */}
      <div className={`fixed z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
        /* Mobile: bottom sheet */
        bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-2xl
        /* Desktop: right panel */
        sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-[420px] sm:rounded-none sm:rounded-l-2xl
        ${unit ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}
      `}>
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {typeLabel} Type {unit?.type_number}
            </div>
            <h2 className="text-xl font-bold text-gray-900">Unit {unit?.unit_number}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                unit?.status === 'available' ? 'bg-green-100 text-green-800' :
                unit?.status === 'reserved' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {unit?.status === 'available' ? 'Beschikbaar' :
                 unit?.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
              </span>
              <span className="text-sm text-gray-500">{unit?.gross_area}m²</span>
              <span className="text-sm font-semibold text-gray-900">
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
                className="w-full max-h-48 object-contain"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          <div className="p-5 space-y-6">
            {/* Reserve CTA (only if available) */}
            {unit?.status === 'available' && reserveSlug && (
              <Link
                href={`/reserveren/${reserveSlug}?unit=${unit.unit_number}`}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors"
              >
                <Calendar className="h-5 w-5" />
                Reserveer Nu — €1.500 aanbetaling
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {/* Contact form */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {unit?.status === 'available' ? 'Meer informatie aanvragen' : 'Interesse? Meld u aan voor terugkeer'}
              </h3>

              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Bedankt!</p>
                  <p className="text-sm text-gray-500 mt-1">We nemen zo snel mogelijk contact met u op.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Uw naam"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="E-mailadres"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="Telefoonnummer"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <textarea
                      rows={3}
                      placeholder="Uw vraag of bericht (optioneel)"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    {submitting ? 'Versturen...' : 'Aanvraag versturen'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
