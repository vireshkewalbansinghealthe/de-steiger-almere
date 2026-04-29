'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
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
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredUnitData = hoveredUnit ? getUnit(hoveredUnit) : null;
  const typeLabel = unitType === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
  const tooltipImgSrc = hoveredUnitData?.type_number
    ? `/images/floorplans/${typeLabel}_Type_${hoveredUnitData.type_number}.png`
    : null;

  // Keep tooltip inside the container
  const containerW = containerRef.current?.offsetWidth ?? 0;
  const tooltipW = 220;
  const tooltipLeft = tooltipPos.x + 14 + tooltipW > containerW
    ? tooltipPos.x - tooltipW - 14
    : tooltipPos.x + 14;
  const tooltipTop = Math.max(8, tooltipPos.y - 20);

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

      {/* Rich hover tooltip */}
      {hoveredUnitData && (
        <div
          className="absolute z-20 pointer-events-none bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ left: tooltipLeft, top: tooltipTop, width: tooltipW }}
        >
          {/* Type floorplan image */}
          {tooltipImgSrc && (
            <div className="bg-gray-50 border-b border-gray-100 flex items-center justify-center h-28">
              <img
                src={tooltipImgSrc}
                alt={`Type ${hoveredUnitData.type_number}`}
                className="max-h-full max-w-full object-contain p-2"
                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Details */}
          <div className="p-3">
            {/* Status badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${
              hoveredUnitData.status === 'available' ? 'bg-green-100 text-green-700' :
              hoveredUnitData.status === 'reserved'  ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {hoveredUnitData.status === 'available' ? 'Beschikbaar' :
               hoveredUnitData.status === 'reserved'  ? 'Gereserveerd' : 'Verkocht'}
            </span>

            <div className="text-sm font-bold text-gray-900 leading-tight">
              {typeLabel} Type {hoveredUnitData.type_number}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Unit {hoveredUnitData.unit_number}</div>

            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              <div>
                <div className="text-gray-400">Oppervlak</div>
                <div className="font-semibold text-gray-800">{hoveredUnitData.gross_area} m²</div>
              </div>
              <div>
                <div className="text-gray-400">Prijs</div>
                <div className="font-semibold text-gray-800">
                  € {hoveredUnitData.sale_price?.toLocaleString('nl-NL')}
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-yellow-600 font-medium">
              Klik voor meer info →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
