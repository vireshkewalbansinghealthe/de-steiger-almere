'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface FloorplanUnit {
  id: string;
  unit_number: string;
  type: 'bedrijfsunit' | 'opslagbox';
  type_number?: number;
  gross_area: number;
  net_area?: number;
  sale_price: number;
  status: 'available' | 'reserved' | 'sold';
  name?: string;
  floor?: string;
}

interface UnitPolygon {
  unit_number: string;
  type?: 'bedrijfsunit' | 'opslagbox';
  points: string;
  floor?: string;
}

interface SimpleFloorplanProps {
  units: FloorplanUnit[];
  polygons: UnitPolygon[];
  image: string;
  floorFilter?: string; // for opslagboxen: 'bg' | '1e' | '2e'
  unitType: 'bedrijfsunit' | 'opslagbox';
  highlightTypeNumbers?: number[]; // highlight units of specific types
  highlightUnitNumber?: string;    // highlight a single specific unit
  statusFilter?: 'all' | 'available';
  onUnitClick: (unit: FloorplanUnit) => void;
}

const STATUS_FILL: Record<string, string> = {
  available: 'rgba(34, 197, 94, 0.35)',
  reserved: 'rgba(239, 68, 68, 0.35)',
  sold: 'rgba(156, 163, 175, 0.40)',
};
const STATUS_STROKE: Record<string, string> = {
  available: 'rgb(21, 128, 61)',
  reserved: 'rgb(185, 28, 28)',
  sold: 'rgb(75, 85, 99)',
};
const HIGHLIGHT_FILL = 'rgba(251, 191, 36, 0.55)';
const HIGHLIGHT_STROKE = 'rgb(202, 138, 4)';
const HOVER_FILL = 'rgba(251, 191, 36, 0.70)';

export default function SimpleFloorplan({
  units,
  polygons,
  image,
  floorFilter,
  unitType,
  highlightTypeNumbers,
  highlightUnitNumber,
  statusFilter = 'all',
  onUnitClick,
}: SimpleFloorplanProps) {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile: tap first shows mini preview, second tap (via button) opens drawer
  const [isTouch, setIsTouch] = useState(false);
  const [mobileTapped, setMobileTapped] = useState<string | null>(null);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  const BUILDING_PHOTOS = [
    '/images/beide1.webp',
    '/images/beide2.webp',
    '/images/Image1.webp',
    '/images/Image2.webp',
    '/images/Image4.webp',
    '/images/Image6.webp',
    '/images/Image8.webp',
    '/images/Image9.webp',
    '/images/Image10.webp',
    '/images/Image11.webp',
    '/images/Image12.webp',
    '/images/Image13.webp',
    '/images/Image14.webp',
    '/images/Image15.webp',
    '/images/Image16.webp',
    '/images/Image17.webp',
    '/images/Image19.webp',
    '/images/Image20.webp',
  ];
  const TOTAL_SLIDES = 1 + BUILDING_PHOTOS.length; // slide 0 = floorplan, rest = photos

  // Cleanup interval on unmount
  useEffect(() => () => { if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current); }, []);

  const relevantPolygons = polygons.filter(p => {
    const matchesType = p.type === unitType || (!p.type && unitType === 'bedrijfsunit');
    const matchesFloor = floorFilter ? p.floor === floorFilter : true;
    return matchesType && matchesFloor;
  });

  const getUnit = (unitNumber: string) =>
    units.find(u => u.unit_number === unitNumber && u.type === unitType);

  const isHighlighted = (unit: FloorplanUnit | undefined) => {
    if (!unit) return false;
    if (highlightUnitNumber) return unit.unit_number === highlightUnitNumber;
    if (!highlightTypeNumbers || highlightTypeNumbers.length === 0) return false;
    return unit.type_number !== undefined && highlightTypeNumbers.includes(unit.type_number);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const hoveredUnitData = hoveredUnit ? getUnit(hoveredUnit) : null;
  const typeLabel = unitType === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {/* Base floorplan image */}
      <img
        src={image}
        alt="Plattegrond"
        className="w-full h-auto block"
        draggable={false}
      />

      {/* SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredUnit(null)}
      >
        {relevantPolygons.map((poly) => {
          const unit = getUnit(poly.unit_number);
          if (!unit && statusFilter === 'available') return null;
          if (statusFilter === 'available' && unit?.status !== 'available') return null;

          const highlighted = isHighlighted(unit);
          const isHovered = hoveredUnit === poly.unit_number;

          const fill = isHovered
            ? HOVER_FILL
            : highlighted
            ? HIGHLIGHT_FILL
            : STATUS_FILL[unit?.status ?? ''] ?? 'rgba(255,255,255,0.15)';

          const stroke = highlighted || isHovered
            ? HIGHLIGHT_STROKE
            : STATUS_STROKE[unit?.status ?? ''] ?? 'white';

          return (
            <polygon
              key={`${poly.type ?? unitType}-${poly.unit_number}`}
              points={poly.points}
              fill={fill}
              stroke={stroke}
              strokeWidth="0.3"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => {
                if (isTouch) return;
                setHoveredUnit(poly.unit_number);
                setSlideIndex(0);
                if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
                cycleIntervalRef.current = setInterval(() => {
                  setSlideIndex(i => (i + 1) % TOTAL_SLIDES);
                }, 2000);
              }}
              onMouseLeave={() => {
                if (isTouch) return;
                setHoveredUnit(null);
                setSlideIndex(0);
                if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
              }}
              onClick={() => {
                if (!unit) return;
                if (isTouch) {
                  setMobileTapped(prev => prev === poly.unit_number ? null : poly.unit_number);
                } else {
                  onUnitClick(unit);
                }
              }}
            />
          );
        })}
      </svg>

      {/* Mobile tap preview — slides up from bottom */}
      {isTouch && mobileTapped && (() => {
        const tappedUnit = getUnit(mobileTapped);
        if (!tappedUnit) return null;
        const imgSrc = tappedUnit.type_number
          ? `/images/floorplans/${typeLabel}_Type_${tappedUnit.type_number}.webp`
          : null;
        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998] bg-black/20"
              onClick={() => setMobileTapped(null)}
            />
            {/* Card */}
            <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 pb-safe">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-sm mx-auto">
                {imgSrc && (
                  <div className="h-28 bg-gray-50 border-b border-gray-100">
                    <img src={imgSrc} alt="" className="w-full h-full object-contain p-3" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs text-gray-400">{typeLabel} Type {tappedUnit.type_number}</div>
                      <div className="font-bold text-gray-900 text-base">Unit {tappedUnit.unit_number}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      tappedUnit.status === 'available' ? 'bg-green-100 text-green-700' :
                      tappedUnit.status === 'reserved'  ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {tappedUnit.status === 'available' ? 'Beschikbaar' :
                       tappedUnit.status === 'reserved'  ? 'Gereserveerd' : 'Verkocht'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{tappedUnit.gross_area} m²</span>
                    <span className="font-semibold text-gray-900">€ {tappedUnit.sale_price?.toLocaleString('nl-NL')}</span>
                  </div>
                  <button
                    onClick={() => { onUnitClick(tappedUnit); setMobileTapped(null); }}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    Bekijk details →
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Fixed viewport-level tooltip — rendered via portal logic with inline fixed style */}
      {hoveredUnitData && typeof window !== 'undefined' && (() => {
        const TW = 230;
        const TH = 230;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const left = cursorPos.x + 16 + TW > vw ? cursorPos.x - TW - 16 : cursorPos.x + 16;
        const top  = cursorPos.y - 20 + TH > vh ? cursorPos.y - TH - 8  : cursorPos.y - 20;
        const imgSrc = hoveredUnitData.type_number
          ? `/images/floorplans/${typeLabel}_Type_${hoveredUnitData.type_number}.webp`
          : null;
        return (
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{ left, top, width: TW }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Image carousel — type floorplan first, then building photos */}
              {imgSrc && (
                <div className="relative h-32 border-b border-gray-100 overflow-hidden bg-gray-50">
                  {/* Slide 0: type floorplan */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${slideIndex === 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <img
                      src={imgSrc}
                      alt={`Type ${hoveredUnitData.type_number}`}
                      className="max-h-full max-w-full object-contain p-2"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  {/* Slides 1+: building photos */}
                  {BUILDING_PHOTOS.map((src, i) => (
                    <div
                      key={src}
                      className={`absolute inset-0 transition-opacity duration-500 ${slideIndex === i + 1 ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {/* Dot indicators */}
                  <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
                    {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-full transition-all duration-300 ${
                          slideIndex === i
                            ? 'w-3 h-1.5 bg-white'
                            : 'w-1.5 h-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Info */}
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-gray-900">
                    {typeLabel} Type {hoveredUnitData.type_number}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    hoveredUnitData.status === 'available' ? 'bg-green-100 text-green-700' :
                    hoveredUnitData.status === 'reserved'  ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {hoveredUnitData.status === 'available' ? 'Vrij' :
                     hoveredUnitData.status === 'reserved'  ? 'Bezet' : 'Verkocht'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">Unit #{hoveredUnitData.unit_number}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{hoveredUnitData.gross_area} m²</span>
                  <span className="font-semibold text-gray-900">€ {hoveredUnitData.sale_price?.toLocaleString('nl-NL')}</span>
                </div>
                <div className="mt-2 text-xs text-yellow-600 font-medium">Klik voor meer info →</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
