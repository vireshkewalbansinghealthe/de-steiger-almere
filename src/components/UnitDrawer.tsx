'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { FloorplanUnit } from './SimpleFloorplan';

interface UnitDrawerProps {
  unit: FloorplanUnit | null;
  onClose: () => void;
}

export default function UnitDrawer({ unit, onClose }: UnitDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const typeLabel = unit?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
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
        bottom-0 left-0 right-0 rounded-t-2xl
        sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-[360px] sm:rounded-none sm:rounded-l-2xl
        ${unit ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}
      `}>
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              {typeLabel} · Type {unit?.type_number}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Unit {unit?.unit_number}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAvailable ? 'bg-green-100 text-green-800' :
                unit?.status === 'reserved' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-500'
              }`}>
                {isAvailable ? 'Beschikbaar' : unit?.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Floorplan image */}
          {unit && (
            <div className="bg-gray-50 border-b border-gray-100 p-6">
              <img
                src={`/images/floorplans/${typeLabel}_Type_${unit.type_number}.png`}
                alt={`Plattegrond ${typeLabel} Type ${unit.type_number}`}
                className="w-full max-h-52 object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-0.5">Oppervlakte</div>
                <div className="text-lg font-bold text-gray-900">{unit?.gross_area}m²</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-0.5">Koopprijs</div>
                <div className="text-lg font-bold text-gray-900">€ {unit?.sale_price?.toLocaleString('nl-NL')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Steiger 74-77, Almere</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 p-5 border-t border-gray-100">
          {isAvailable && reserveSlug ? (
            <>
              <Link
                href={`/reserveren/${reserveSlug}?unit=${unit?.unit_number}`}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-5 rounded-xl transition-colors text-sm group"
              >
                <Calendar className="h-4 w-4" />
                Reserveer Unit {unit?.unit_number}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="text-xs text-gray-400 text-center mt-2">€1.500 aanbetaling · wordt verrekend bij aankoop</p>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">
                {unit?.status === 'reserved' ? 'Deze unit is gereserveerd.' : 'Deze unit is verkocht.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Bekijk de andere beschikbare units op de plattegrond.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
