'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight, Layers, Ruler, Euro } from 'lucide-react';
import { FloorplanUnit } from './SimpleFloorplan';
import { useLayoutContext } from './ClientLayout';

interface UnitDrawerProps {
  unit: FloorplanUnit | null;
  onClose: () => void;
}

// Building photos shown after the type floorplan
const BEDRIJFSUNIT_PHOTOS = [
  '/images/Image13.png',
  '/images/Image14.png',
  '/images/Image15.png',
  '/images/beide2.png',
  '/images/Image1.png',
  '/images/Image2.png',
  '/images/beide1.png',
  '/images/Image4.png',
];

const OPSLAGBOX_PHOTOS = [
  '/images/up/opslagbox3.png',
  '/images/up/opslagbox4.png',
  '/images/beide2.png',
  '/images/Image1.png',
  '/images/Image2.png',
  '/images/beide1.png',
  '/images/Image4.png',
];

export default function UnitDrawer({ unit, onClose }: UnitDrawerProps) {
  const [slide, setSlide] = useState(0);
  const [floorplanOk, setFloorplanOk] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setIsDrawerOpen } = useLayoutContext();

  const typeLabel = unit?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
  const floorplanSrc = unit ? `/images/floorplans/${typeLabel}_Type_${unit.type_number}.png` : null;

  const buildingPhotos = unit?.type === 'bedrijfsunit' ? BEDRIJFSUNIT_PHOTOS : OPSLAGBOX_PHOTOS;

  // Slides: index 0 = floorplan (if loaded), rest = building photos
  const slides: { src: string; label: string }[] = [
    ...(floorplanOk && floorplanSrc ? [{ src: floorplanSrc, label: 'Plattegrond' }] : []),
    ...buildingPhotos.map(src => ({ src, label: 'Foto' })),
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
    setIsDrawerOpen(!!unit);
  }, [unit?.unit_number, setIsDrawerOpen, unit]);

  // Autoplay
  useEffect(() => {
    if (!unit) return;
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [unit, startAutoPlay]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, isFullscreen]);

  const goTo = (i: number) => {
    setSlide((i + totalSlides) % totalSlides);
    startAutoPlay();
  };

  const isAvailable = unit?.status === 'available';
  const reserveSlug = unit ? `${unit.type}-type-${unit.type_number}` : null;

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
        <div className="relative flex-shrink-0 bg-gray-100 overflow-hidden cursor-pointer group/slider" style={{ height: 220 }} onClick={() => setIsFullscreen(true)}>
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

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/0 group-hover/slider:bg-black/10 transition-colors flex items-center justify-center">
            <div className="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm">
              Klik voor vergroting
            </div>
          </div>

          {/* Prev / next arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(slide - 1); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(slide + 1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-10"
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
              <Spec icon={<Ruler className="h-4 w-4" />} label="Bruto oppervlakte" value={`${unit?.gross_area} m²`} />
              {unit?.floor !== undefined && floorLabel(unit.floor) && (
                <Spec icon={<Layers className="h-4 w-4" />} label="Verdieping" value={floorLabel(unit.floor)!} />
              )}
              <Spec icon={<Layers className="h-4 w-4" />} label="Type" value={`Type ${unit?.type_number}`} />
            </div>

            {/* FAQ Section */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Veelgestelde vragen</h3>
              <div className="space-y-4">
                <FAQItem 
                  question="Wat is de minimale huurtermijn?" 
                  answer="De units worden uitsluitend verkocht, niet verhuurd door De Steiger. Na aankoop bent u vrij om de unit zelf te verhuren." 
                />
                <FAQItem 
                  question="Is er 100% financiering mogelijk?" 
                  answer="Ja, via onze partners is 100% financiering mogelijk. U heeft geen eigen vermogen nodig." 
                />
                <FAQItem 
                  question="Wat zijn de servicekosten (VvE)?" 
                  answer="De indicatieve VvE bijdrage wordt binnenkort vastgesteld en dekt o.a. opstalverzekering en buitenonderhoud." 
                />
                <FAQItem 
                  question="Wanneer is de oplevering?" 
                  answer="De verwachte oplevering is in het derde kwartaal van 2026." 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 p-5 border-t border-gray-100 bg-white pb-24 sm:pb-5">
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

      {/* Fullscreen Carousel Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main image container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            {slides.map((sl, i) => (
              <div
                key={sl.src}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${i === slide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <img
                  src={sl.src}
                  alt={sl.label}
                  className="max-w-full max-h-full object-contain select-none"
                />
              </div>
            ))}

            {/* Navigation arrows */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(slide - 1); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(slide + 1); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronRight className="h-8 w-8 md:h-10 md:w-10" />
                </button>
              </>
            )}
          </div>

          {/* Bottom info & indicators */}
          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{slides[slide]?.label}</p>
              <p className="text-white/60 text-sm">Unit {unit?.unit_number} · Type {unit?.type_number}</p>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === slide ? 'w-8 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
      >
        <span className="font-semibold text-sm text-gray-900">{question}</span>
        <span className="text-gray-400 ml-2">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-sm text-gray-600 bg-white">
          {answer}
        </div>
      )}
    </div>
  );
}
