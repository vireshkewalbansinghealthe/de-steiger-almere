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
  statusFilter = 'all',
  onUnitClick,
}: SimpleFloorplanProps) {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  // Track viewport-level cursor position for fixed tooltip
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const relevantPolygons = polygons.filter(p => {
    const matchesType = p.type === unitType || (!p.type && unitType === 'bedrijfsunit');
    const matchesFloor = floorFilter ? p.floor === floorFilter : true;
    return matchesType && matchesFloor;
  });

  const getUnit = (unitNumber: string) =>
    units.find(u => u.unit_number === unitNumber && u.type === unitType);

  const isHighlighted = (unit: FloorplanUnit | undefined) => {
    if (!highlightTypeNumbers || highlightTypeNumbers.length === 0) return false;
    return unit?.type_number !== undefined && highlightTypeNumbers.includes(unit.type_number);
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
              onMouseEnter={() => setHoveredUnit(poly.unit_number)}
              onMouseLeave={() => setHoveredUnit(null)}
              onClick={() => unit && onUnitClick(unit)}
            />
          );
        })}
      </svg>

      {/* Fixed viewport-level tooltip — rendered via portal logic with inline fixed style */}
      {hoveredUnitData && typeof window !== 'undefined' && (() => {
        const TW = 230;
        const TH = 200; // approx
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const left = cursorPos.x + 16 + TW > vw ? cursorPos.x - TW - 16 : cursorPos.x + 16;
        const top  = cursorPos.y - 20 + TH > vh ? cursorPos.y - TH - 8  : cursorPos.y - 20;
        const imgSrc = hoveredUnitData.type_number
          ? `/images/floorplans/${typeLabel}_Type_${hoveredUnitData.type_number}.png`
          : null;
        return (
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{ left, top, width: TW }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Floorplan image */}
              {imgSrc && (
                <div className="bg-gray-50 flex items-center justify-center h-32 border-b border-gray-100">
                  <img
                    src={imgSrc}
                    alt={`Type ${hoveredUnitData.type_number}`}
                    className="max-h-full max-w-full object-contain p-2"
                    onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                  />
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
