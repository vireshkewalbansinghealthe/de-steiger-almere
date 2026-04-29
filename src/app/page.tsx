'use client';

import { useState, useEffect } from 'react';
import SimpleFloorplan, { FloorplanUnit } from '../components/SimpleFloorplan';
import UnitDrawer from '../components/UnitDrawer';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UnitPolygon {
  unit_number: string;
  type?: 'bedrijfsunit' | 'opslagbox';
  points: string;
  floor?: string;
}

type Category = 'bedrijfsunits' | 'opslagboxen';
type OpslagboxFloor = 'bg' | '1e' | '2e';
type StatusFilter = 'all' | 'available';

interface TypeGroup {
  typeNumber: number;
  units: FloorplanUnit[];
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  available: number;
  reserved: number;
  sold: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OPSLAGBOX_FLOORS: { id: OpslagboxFloor; label: string; image: string }[] = [
  { id: 'bg',  label: 'Begane grond', image: '/images/floorplans/opslagbox0.png' },
  { id: '1e', label: '1e verdieping', image: '/images/floorplans/opslagbox1.png' },
  { id: '2e', label: '2e verdieping', image: '/images/floorplans/opslagbox2.png' },
];

const BEDRIJFSUNITS_IMAGE = '/images/floorplans/Plattegronden_Hoge_Kwaliteit/Plattegrond_Totaal.png';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByType(units: FloorplanUnit[]): TypeGroup[] {
  const map = new Map<number, FloorplanUnit[]>();
  for (const u of units) {
    const tn = u.type_number ?? 0;
    if (!map.has(tn)) map.set(tn, []);
    map.get(tn)!.push(u);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([typeNumber, us]) => ({
      typeNumber,
      units: us,
      minPrice: Math.min(...us.map(u => u.sale_price)),
      maxPrice: Math.max(...us.map(u => u.sale_price)),
      minArea: Math.min(...us.map(u => u.gross_area)),
      maxArea: Math.max(...us.map(u => u.gross_area)),
      available: us.filter(u => u.status === 'available').length,
      reserved: us.filter(u => u.status === 'reserved').length,
      sold: us.filter(u => u.status === 'sold').length,
    }));
}

// ─── TypeLegend ───────────────────────────────────────────────────────────────

function TypeLegend({
  groups,
  category,
  selectedTypes,
  onToggleType,
  statusFilter,
}: {
  groups: TypeGroup[];
  category: Category;
  selectedTypes: number[];
  onToggleType: (tn: number) => void;
  statusFilter: StatusFilter;
}) {
  const prefix = category === 'bedrijfsunits' ? 'Bedrijfsunit' : 'Opslagbox';
  const visibleGroups = statusFilter === 'available'
    ? groups.filter(g => g.available > 0)
    : groups;

  return (
    <div className="space-y-2">
      {visibleGroups.map(g => {
        const isSelected = selectedTypes.includes(g.typeNumber);
        const imgSrc = `/images/floorplans/${prefix}_Type_${g.typeNumber}.png`;
        const availCount = g.available;

        return (
          <button
            key={g.typeNumber}
            onClick={() => onToggleType(g.typeNumber)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 ${
              isSelected
                ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-300'
                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
              <img
                src={imgSrc}
                alt={`Type ${g.typeNumber}`}
                className="w-full h-full object-contain p-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {prefix} Type {g.typeNumber}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {g.minArea === g.maxArea ? `${g.minArea}m²` : `${g.minArea}–${g.maxArea}m²`}
                {' · '}
                {g.minPrice === g.maxPrice
                  ? `€ ${g.minPrice.toLocaleString('nl-NL')}`
                  : `v.a. € ${g.minPrice.toLocaleString('nl-NL')}`}
              </div>
            </div>
            {/* Availability */}
            <div className="flex-shrink-0 text-right">
              {availCount > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {availCount}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  vol
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── HomePage ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [category, setCategory] = useState<Category>('opslagboxen');
  const [opslagboxFloor, setOpslagboxFloor] = useState<OpslagboxFloor>('bg');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<FloorplanUnit | null>(null);

  const [units, setUnits] = useState<FloorplanUnit[]>([]);
  const [polygons, setPolygons] = useState<UnitPolygon[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingPolygons, setLoadingPolygons] = useState(true);

  // Fetch units
  useEffect(() => {
    setLoadingUnits(true);
    fetch('/api/units')
      .then(r => r.json())
      .then(d => setUnits(d.units ?? []))
      .catch(console.error)
      .finally(() => setLoadingUnits(false));
  }, []);

  // Fetch polygons
  useEffect(() => {
    fetch('/api/polygons')
      .then(r => r.json())
      .then(d => setPolygons(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingPolygons(false));
  }, []);

  // Reset selected types when category changes
  useEffect(() => { setSelectedTypes([]); }, [category]);

  const currentUnits = units.filter(u =>
    u.type === (category === 'bedrijfsunits' ? 'bedrijfsunit' : 'opslagbox')
  );

  const typeGroups = groupByType(currentUnits);

  const floorImage = category === 'bedrijfsunits'
    ? BEDRIJFSUNITS_IMAGE
    : OPSLAGBOX_FLOORS.find(f => f.id === opslagboxFloor)?.image ?? OPSLAGBOX_FLOORS[0].image;

  const toggleType = (tn: number) => {
    setSelectedTypes(prev =>
      prev.includes(tn) ? prev.filter(t => t !== tn) : [...prev, tn]
    );
  };

  const totalAvailable = currentUnits.filter(u => u.status === 'available').length;
  const totalUnits = currentUnits.length;

  const isLoading = loadingUnits || loadingPolygons;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-28 pb-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Steiger 74–77, Almere
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Vind uw ideale<br />
            <span className="text-yellow-400">bedrijfsruimte</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto">
            Kies direct vanuit de plattegrond — klik op een unit voor meer informatie of om te reserveren.
          </p>
        </div>
      </section>

      {/* ── Main section ─────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">

        {/* Category tabs + status filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          {/* Tabs */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 w-fit shadow-sm">
            {(['opslagboxen', 'bedrijfsunits'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  category === cat
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {cat === 'opslagboxen' ? 'Opslagboxen' : 'Bedrijfsunits'}
              </button>
            ))}
          </div>

          {/* Status filter + stats */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">
              <span className="font-semibold text-green-600">{totalAvailable}</span> beschikbaar van {totalUnits}
            </span>
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
              {([
                { id: 'all', label: 'Alle' },
                { id: 'available', label: 'Beschikbaar' },
              ] as { id: StatusFilter; label: string }[]).map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    statusFilter === f.id
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floor selector (opslagboxen only) */}
        {category === 'opslagboxen' && (
          <div className="flex gap-2 mb-4">
            {OPSLAGBOX_FLOORS.map(fl => (
              <button
                key={fl.id}
                onClick={() => setOpslagboxFloor(fl.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                  opslagboxFloor === fl.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {fl.label}
              </button>
            ))}
          </div>
        )}

        {/* Mobile stats */}
        <div className="sm:hidden text-sm text-gray-500 mb-4">
          <span className="font-semibold text-green-600">{totalAvailable}</span> beschikbaar van {totalUnits} units
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Plattegrond laden...</p>
            </div>
          </div>
        ) : (
          /* Desktop: floorplan left + legend right | Mobile: legend below map */
          <div className="flex flex-col lg:flex-row gap-4">

            {/* ── Floorplan ──────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Legend (color key) */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-green-400 opacity-80 inline-block" />
                  Beschikbaar
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-400 opacity-80 inline-block" />
                  Gereserveerd
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gray-400 opacity-80 inline-block" />
                  Verkocht
                </span>
                {selectedTypes.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-yellow-400 opacity-80 inline-block" />
                    Geselecteerd type
                  </span>
                )}
              </div>

              <SimpleFloorplan
                units={currentUnits}
                polygons={polygons}
                image={floorImage}
                floorFilter={category === 'opslagboxen' ? opslagboxFloor : undefined}
                unitType={category === 'bedrijfsunits' ? 'bedrijfsunit' : 'opslagbox'}
                highlightTypeNumbers={selectedTypes.length > 0 ? selectedTypes : undefined}
                statusFilter={statusFilter}
                onUnitClick={setSelectedUnit}
              />

              <p className="text-center text-xs text-gray-400 py-3">
                Klik op een unit om details te bekijken
              </p>
            </div>

            {/* ── Type Legend (sidebar) ────────────────────────────────── */}
            <div className="lg:w-72 xl:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Types
                  </h2>
                  {selectedTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedTypes([])}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      Wis filter
                    </button>
                  )}
                </div>

                <div className="p-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                  <TypeLegend
                    groups={typeGroups}
                    category={category}
                    selectedTypes={selectedTypes}
                    onToggleType={toggleType}
                    statusFilter={statusFilter}
                  />

                  {typeGroups.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Geen types gevonden
                    </div>
                  )}
                </div>
              </div>

              {/* Tip */}
              <p className="text-xs text-gray-400 text-center mt-3 px-2">
                Klik op een type om het te markeren op de plattegrond
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── Unit Drawer ────────────────────────────────────────────────────── */}
      <UnitDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  );
}
