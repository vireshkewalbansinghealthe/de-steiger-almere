'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight, Layers, Ruler, Euro } from 'lucide-react';
import { FloorplanUnit } from './SimpleFloorplan';

interface UnitDrawerProps {
  unit: FloorplanUnit | null;
  onClose: () => void;
}

// Building photos shown after the type floorplan
const BUILDING_PHOTOS = [
  '/images/beide2.png',
  '/images/Image1.png',
  '/images/Image2.png',
  '/images/beide1.png',
  '/images/Image4.png',
  '/images/Image6.png',
  '/images/Image8.png',
];

export default function UnitDrawer({ unit, onClose }: UnitDrawerProps) {
  const [slide, setSlide] = useState(0);
  const [floorplanOk, setFloorplanOk] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const typeLabel = unit?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
  const floorplanSrc = unit ? `/images/floorplans/${typeLabel}_Type_${unit.type_number}.png` : null;

  // Slides: index 0 = floorplan (if loaded), rest = building photos
  const slides: { src: string; label: string }[] = [
    ...(floorplanOk && floorplanSrc ? [{ src: floorplanSrc, label: 'Plattegrond' }] : []),
    ...BUILDING_PHOTOS.map(src => ({ src, label: 'Foto' })),
  ];

  const totalSlides = slides.length;

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(s => (s + 1) % totalSlides);
    }, 3500);
  }, [totalSlides]);

  // Reset on unit change
  useEffect(() => {
    setSlide(0);
    setFloorplanOk(true);
  }, [unit?.unit_number]);

  // Autoplay
  useEffect(() => {
    if (!unit) return;
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [unit, startAutoPlay]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const goTo = (i: number) => {
    setSlide((i + totalSlides) % totalSlides);
    startAutoPlay();
  };

  const isAvailable = unit?.status === 'available';
  const reserveSlug = unit ? `${unit.type}-type-${unit.type_number}` : null;
  const pricePerM2 = unit && unit.gross_area > 0
    ? Math.round(unit.sale_price / unit.gross_area).toLocaleString('nl-NL')
    : null;

  const floorLabel = (floor?: string) => {
    if (!floor) return null;
    if (floor === '0' || floor === 'begane_grond') return 'Begane grond';
    if (floor === '1') return '1e verdieping';
    if (floor === '2') return '2e verdieping';
    return floor;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${unit ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
        bottom-0 left-0 right-0 rounded-t-2xl
        sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-[380px] sm:rounded-none sm:rounded-l-2xl
        ${unit ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}
      `}>
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Image slider */}
        <div className="relative flex-shrink-0 bg-gray-100 overflow-hidden" style={{ height: 220 }}>
          {slides.map((sl, i) => (
            <div
              key={sl.src}
              className={`absolute inset-0 transition-opacity duration-500 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={sl.src}
                alt={sl.label}
                className={`w-full h-full ${i === 0 && floorplanOk ? 'object-contain bg-gray-50 p-4' : 'object-cover'}`}
                onError={() => { if (i === 0) { setFloorplanOk(false); setSlide(0); } }}
              />
            </div>
          ))}

          {/* Prev / next arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={() => goTo(slide - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goTo(slide + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Slide label */}
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {slides[slide]?.label}
            </span>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === slide ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Title & status */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {typeLabel} · Type {unit?.type_number}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">Unit {unit?.unit_number}</h2>
                </div>
                <span className={`mt-1 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isAvailable ? 'bg-green-100 text-green-800' :
                  unit?.status === 'reserved' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {isAvailable ? 'Beschikbaar' : unit?.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                <span>Steiger 74–77, Almere</span>
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <Spec icon={<Euro className="h-4 w-4" />} label="Koopprijs" value={`€ ${unit?.sale_price?.toLocaleString('nl-NL')}`} highlight />
              <Spec icon={<Ruler className="h-4 w-4" />} label="Bruto opp." value={`${unit?.gross_area} m²`} />
              {pricePerM2 && (
                <Spec icon={<Euro className="h-4 w-4" />} label="Prijs per m²" value={`€ ${pricePerM2}`} />
              )}
              {unit?.floor !== undefined && floorLabel(unit.floor) && (
                <Spec icon={<Layers className="h-4 w-4" />} label="Verdieping" value={floorLabel(unit.floor)!} />
              )}
              <Spec icon={<Layers className="h-4 w-4" />} label="Type" value={`Type ${unit?.type_number}`} />
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 p-5 border-t border-gray-100 bg-white">
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
            <div className="text-center py-1">
              <p className="text-sm font-medium text-gray-600">
                {unit?.status === 'reserved' ? 'Deze unit is gereserveerd' : 'Deze unit is verkocht'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Bekijk andere beschikbare units op de plattegrond</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Spec({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 flex flex-col gap-1 ${highlight ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50'}`}>
      <div className={`flex items-center gap-1.5 text-xs ${highlight ? 'text-yellow-700' : 'text-gray-400'}`}>
        {icon}
        {label}
      </div>
      <div className={`text-base font-bold ${highlight ? 'text-yellow-900' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
