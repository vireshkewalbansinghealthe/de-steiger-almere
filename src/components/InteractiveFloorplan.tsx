'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

interface Unit {
  id: string;
  name: string;
  type: 'bedrijfsunit' | 'opslagbox';
  unit_number: string;
  type_number?: number;
  gross_area: number;
  net_area: number;
  sale_price: number;
  status: 'available' | 'reserved' | 'sold';
}

interface UnitPolygon {
  unit_number: string;
  type?: 'bedrijfsunit' | 'opslagbox';
  points: string; // SVG polygon points (in percentages, e.g., "10,10 20,10 20,20 10,20")
  floor?: string; // 'main' | 'bg' | '1e' | '2e'
}

// Polygons worden geladen vanuit de database
const INITIAL_POLYGONS: UnitPolygon[] = [];

export default function InteractiveFloorplan({ 
  onUnitClick,
  highlightUnits = [],
  highlightType
}: { 
  onUnitClick?: (unit: Unit) => void,
  highlightUnits?: string[],
  highlightType?: 'bedrijfsunit' | 'opslagbox'
} = {}) {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [polygons, setPolygons] = useState<UnitPolygon[]>(INITIAL_POLYGONS);
  
  // Dev mode status for drawing polygons
  const [isDevMode, setIsDevMode] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{x: number, y: number}[]>([]);
  const [editingUnitNumber, setEditingUnitNumber] = useState("1");
  const [editingUnitType, setEditingUnitType] = useState<'bedrijfsunit' | 'opslagbox'>('bedrijfsunit');

  // Floorplan image switcher
  const [activeFloorplan, setActiveFloorplan] = useState<'bedrijfsunits' | 'opslagboxen'>('bedrijfsunits');
  const [viewTypeFilter, setViewTypeFilter] = useState<'all' | 'bedrijfsunit' | 'opslagbox'>('all');
  const [opslagboxFloor, setOpslagboxFloor] = useState<'bg' | '1e' | '2e'>('bg');

  const OPSLAGBOX_FLOORS = [
    { id: 'bg' as const, label: 'Begane Grond', image: '/images/floorplans/opslagbox0.png' },
    { id: '1e' as const, label: '1e Verdieping', image: '/images/floorplans/opslagbox1.png' },
    { id: '2e' as const, label: '2e Verdieping', image: '/images/floorplans/opslagbox2.png' },
  ];

  const currentImage = activeFloorplan === 'bedrijfsunits'
    ? '/images/floorplans/Plattegronden_Hoge_Kwaliteit/Plattegrond_Totaal.png'
    : OPSLAGBOX_FLOORS.find(f => f.id === opslagboxFloor)?.image || OPSLAGBOX_FLOORS[0].image;

  useEffect(() => {
    const fetchAllUnits = async () => {
      try {
        // Fetch ALL units without grouping, so we have status per specific unit number
        const response = await fetch('/api/units');
        const data = await response.json();
        setUnits(data.units || []);
      } catch (err) {
        console.error('Failed to fetch units for floorplan', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUnits();
  }, []);

  const getStatusColor = (status?: string) => {
    if (status === 'available') return 'rgba(34, 197, 94, 0.35)'; // Green, more transparent so you can read text
    if (status === 'reserved') return 'rgba(239, 68, 68, 0.35)'; // Red
    if (status === 'sold') return 'rgba(156, 163, 175, 0.4)'; // Gray
    return 'rgba(255, 255, 255, 0.2)'; // Unknown / Default
  };

  const getStatusBorderColor = (status?: string) => {
    if (status === 'available') return 'rgb(21, 128, 61)'; // Dark Green
    if (status === 'reserved') return 'rgb(185, 28, 28)'; // Dark Red
    if (status === 'sold') return 'rgb(75, 85, 99)'; // Dark Gray
    return 'rgb(255, 255, 255)'; // Unknown / Default
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDevMode) return;

    // Get click coordinates relative to the SVG size (in percentages)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  // Load polygons from database on mount (with localStorage fallback)
  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const res = await fetch('/api/polygons');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPolygons(data);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch polygons from DB', e);
      }
      // Fallback: localStorage (voor migratie van oude data)
      const saved = localStorage.getItem('drawnPolygons');
      if (saved) {
        try {
          setPolygons(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved polygons from localStorage', e);
        }
      }
    };
    fetchPolygons();
  }, []);

  // Zoom to highlighted units when polygons are loaded
  useEffect(() => {
    if (highlightUnits.length > 0 && polygons.length > 0 && transformComponentRef.current) {
      const firstUnit = highlightUnits[0];
      const targetPolygon = polygons.find(p => 
        p.unit_number === firstUnit && 
        (highlightType ? (p.type || 'bedrijfsunit') === highlightType : true)
      );
      if (targetPolygon) {
        const polyType = targetPolygon.type || 'bedrijfsunit';
        // Add a small delay to let the TransformComponent initialize and render SVG properly
        setTimeout(() => {
          transformComponentRef.current?.zoomToElement(`unit-${polyType}-${firstUnit}`, 3, 800);
        }, 500);
      }
    }
  }, [highlightUnits, highlightType, polygons]);

  const saveCurrentPolygon = async () => {
    if (currentPoints.length < 3) {
      alert("Een polygon heeft minimaal 3 punten nodig!");
      return;
    }
    const pointsStr = currentPoints.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const floor = editingUnitType === 'opslagbox' ? opslagboxFloor : 'main';
    const newPolygon = { unit_number: editingUnitNumber, type: editingUnitType, points: pointsStr, floor };
    const newPolygons = [...polygons, newPolygon];
    setPolygons(newPolygons);

    // Save to database
    try {
      await fetch('/api/polygons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polygons: newPolygons }),
      });
    } catch (e) {
      console.error('Failed to save polygons to DB', e);
    }

    setCurrentPoints([]);
    setEditingUnitNumber(String(parseInt(editingUnitNumber) + 1));
  };

  if (isLoading) return <div className="text-center p-10">Plattegrond laden...</div>;

  return (
    <div className="w-full relative">
      {/* Floorplan Type Tabs */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => { setActiveFloorplan('bedrijfsunits'); setViewTypeFilter('bedrijfsunit'); setEditingUnitType('bedrijfsunit'); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeFloorplan === 'bedrijfsunits' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          🏭 Bedrijfsunits
        </button>
        <button
          onClick={() => { setActiveFloorplan('opslagboxen'); setViewTypeFilter('opslagbox'); setEditingUnitType('opslagbox'); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeFloorplan === 'opslagboxen' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          📦 Opslagboxen
        </button>
        <button
          onClick={() => { setViewTypeFilter('all'); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${viewTypeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          Alles
        </button>
      </div>

      {/* Opslagboxen floor sub-tabs */}
      {activeFloorplan === 'opslagboxen' && (
        <div className="mb-3 flex gap-2">
          {OPSLAGBOX_FLOORS.map(floor => (
            <button
              key={floor.id}
              onClick={() => setOpslagboxFloor(floor.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${opslagboxFloor === floor.id ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {floor.label}
            </button>
          ))}
        </div>
      )}

      {/* Dev Mode Tools — hidden from public, uncomment to enable
      <div className="mb-4 flex gap-4 items-center bg-slate-100 p-4 rounded-xl border border-slate-200">
        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isDevMode} 
            onChange={(e) => setIsDevMode(e.target.checked)} 
            className="w-5 h-5"
          />
          Admin / Teken Modus Activeren
        </label>

        <button
          onClick={async () => {
            const saved = localStorage.getItem('drawnPolygons');
            if (!saved) {
              alert('Geen polygons gevonden in localStorage.');
              return;
            }
            try {
              const localPolygons = JSON.parse(saved);
              const res = await fetch('/api/polygons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ polygons: localPolygons }),
              });
              if (res.ok) {
                setPolygons(localPolygons);
                alert(`✅ ${localPolygons.length} polygons gemigreerd naar de database!`);
              } else {
                alert('❌ Fout bij migreren naar database.');
              }
            } catch (e) {
              alert('❌ Fout: ' + e);
            }
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold"
        >
          📦 Migreer naar DB
        </button>
        
        {isDevMode && (
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">Type:</span>
              <select 
                value={editingUnitType}
                onChange={(e) => setEditingUnitType(e.target.value as any)}
                className="border p-2 rounded text-sm"
              >
                <option value="bedrijfsunit">Bedrijfsunit</option>
                <option value="opslagbox">Opslagbox</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Unit Nr:</span>
              <input 
                type="text" 
                value={editingUnitNumber}
                onChange={(e) => setEditingUnitNumber(e.target.value)}
                className="border p-2 rounded w-20"
              />
            </div>
            <button 
              onClick={saveCurrentPolygon}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Opslaan & Volgende
            </button>
            <button 
              onClick={() => setCurrentPoints([])}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Wissen
            </button>
            <button 
              onClick={async () => {
                if (confirm('Weet je zeker dat je alles wilt wissen?')) {
                  setPolygons([]);
                  localStorage.removeItem('drawnPolygons');
                  await fetch('/api/polygons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ polygons: [] }),
                  });
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
            >
              Reset Alles
            </button>
            {activeFloorplan === 'opslagboxen' && (
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Afbeelding pad:</span>
                <input
                  type="text"
                  value={customOpslagboxImage}
                  onChange={(e) => setCustomOpslagboxImage(e.target.value)}
                  className="border p-1 rounded text-xs w-72"
                  placeholder="/images/floorplans/..."
                />
              </div>
            )}
            <div className="text-xs text-slate-500 ml-auto max-w-xs">
              Klik op de hoeken van de unit op de kaart. Klik dan op opslaan. Polygons worden automatisch opgeslagen in de database.
            </div>
          </div>
        )}
      </div>
      */}

      <div 
        className="relative w-full h-[60vh] min-h-[500px] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg bg-gray-50"
      >
        <TransformWrapper
          ref={transformComponentRef}
          initialScale={1}
          minScale={0.5}
          maxScale={8}
          centerZoomedOut={true}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: isDevMode }} // Disable double click zoom while drawing
          panning={{ disabled: isDevMode }} // Disable panning while drawing so you can click freely
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Controls Overlay */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200">
                <button 
                  onClick={() => zoomIn()} 
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold"
                  title="Inzoomen"
                >+</button>
                <button 
                  onClick={() => zoomOut()} 
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold"
                  title="Uitzoomen"
                >-</button>
                <button 
                  onClick={() => resetTransform()} 
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs"
                  title="Reset"
                >↺</button>
              </div>

              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                <div 
                  className="relative w-full h-full flex items-center justify-center"
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                >
                  <div className="relative w-full max-w-none">
                    {/* Background Image */}
                    <img 
                      src={currentImage}
                      alt="Plattegrond De Steiger" 
                      className="w-full h-auto object-contain"
                      draggable="false"
                    />

                    {/* SVG Overlay */}
                    <svg 
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100" 
                      preserveAspectRatio="none"
                      onClick={handleMapClick}
                      style={{ zIndex: 5 }}
                    >
                    {/* Drawn Polygons */}
                    {polygons.filter(poly => {
                      const typeMatch = viewTypeFilter === 'all' || (poly.type || 'bedrijfsunit') === viewTypeFilter;
                      if (!typeMatch) return false;
                      // For opslagboxen, only show polygons matching the current floor
                      if (activeFloorplan === 'opslagboxen' && poly.type === 'opslagbox') {
                        return (poly.floor || 'bg') === opslagboxFloor;
                      }
                      return true;
                    }).map((poly, idx) => {
                      const polyType = poly.type || 'bedrijfsunit'; // Default for old drawn polygons
                      const unitData = units.find(u => u.unit_number === poly.unit_number && u.type === polyType);
                      const status = unitData?.status || 'available'; // Default available if not in db yet for testing
                      
                      return (
                        <polygon
                          key={idx}
                          id={`unit-${polyType}-${poly.unit_number}`}
                          points={poly.points}
                          fill={getStatusColor(status)}
                          stroke={getStatusBorderColor(status)}
                          strokeWidth="0.1"
                          className="cursor-pointer transition-all duration-200 hover:stroke-yellow-400"
                          style={{ opacity: isDevMode ? 0.7 : 1 }}
                          onMouseEnter={() => {
                            if (!isDevMode && unitData) setHoveredUnit(unitData);
                          }}
                          onMouseLeave={() => {
                            if (!isDevMode) setHoveredUnit(null);
                          }}
                          onClick={(e) => {
                            if (!isDevMode && unitData) {
                              if (onUnitClick) {
                                onUnitClick(unitData);
                              } else {
                                window.location.href = `/${unitData.type}/${unitData.type}-type-${unitData.type_number}?unit=${unitData.unit_number}`;
                              }
                            }
                          }}
                        />
                      );
                    })}

                    {/* Currently drawing polygon */}
                    {isDevMode && currentPoints.length > 0 && (
                      <polygon
                        points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(59, 130, 246, 0.5)"
                        stroke="blue"
                        strokeWidth="0.2"
                      />
                    )}
                    {isDevMode && currentPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="0.3" fill="red" />
                    ))}
                  </svg>
                  </div>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Tooltip for hovering over units */}
      {!isDevMode && hoveredUnit && (
        <div 
          className="fixed z-50 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 pointer-events-none transform -translate-x-1/2 -translate-y-full w-64"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y - 20 
          }}
        >
          {hoveredUnit.images?.[0] && (
            <img 
              src={hoveredUnit.images[0]} 
              alt={hoveredUnit.name} 
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          <h4 className="font-bold text-lg mb-1">{hoveredUnit.name}</h4>
          <p className="text-gray-600 mb-2">Unit Nummer: {hoveredUnit.unit_number}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              hoveredUnit.status === 'available' ? 'bg-green-100 text-green-800' :
              hoveredUnit.status === 'reserved' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {hoveredUnit.status === 'available' ? 'Beschikbaar' :
               hoveredUnit.status === 'reserved' ? 'Gereserveerd' : 'Verkocht'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-3 border-t pt-3">
            <div className="text-gray-500">Oppervlakte</div>
            <div className="font-medium text-right">{hoveredUnit.gross_area} m²</div>
            <div className="text-gray-500">Prijs v.o.n.</div>
            <div className="font-medium text-right">
              {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(hoveredUnit.sale_price)}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500 opacity-50 border border-green-700"></div>
          <span className="text-sm font-medium">Beschikbaar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500 opacity-50 border border-red-700"></div>
          <span className="text-sm font-medium">Gereserveerd</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500 opacity-50 border border-gray-700"></div>
          <span className="text-sm font-medium">Verkocht</span>
        </div>
      </div>
    </div>
  );
}