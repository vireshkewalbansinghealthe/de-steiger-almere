'use client';

import { useState, useEffect, useReducer, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Download, FileText, Map as MapIcon } from 'lucide-react';
import SimpleFloorplan, { FloorplanUnit } from '@/components/SimpleFloorplan';
import UnitDrawer from '@/components/UnitDrawer';
import ContactSection from '@/components/ContactSection';
import FAQSection from '@/components/FAQSection';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UnitPolygon {
  unit_number: string;
  type?: 'bedrijfsunit' | 'opslagbox';
  points: string;
  floor?: string;
}

type Category = 'bedrijfsunits' | 'opslagboxen';
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

const OPSLAGBOX_FLOORS: { id: string; label: string; image: string }[] = [
  { id: 'bg',  label: 'Begane grond', image: '/images/floorplans/opslagbox0.webp' },
  { id: '1e', label: '1e verdieping', image: '/images/floorplans/opslagbox1.webp' },
  { id: '2e', label: '2e verdieping', image: '/images/floorplans/opslagbox2.webp' },
];

const BEDRIJFSUNITS_IMAGE = '/images/floorplans/Plattegronden_Hoge_Kwaliteit/Plattegrond_Totaal.webp';

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

// ─── Type selection reducer ───────────────────────────────────────────────────

type TypesAction =
  | { type: 'toggle'; typeNumber: number }
  | { type: 'clear' };

function typesReducer(state: number[], action: TypesAction): number[] {
  if (action.type === 'toggle') {
    return state.includes(action.typeNumber)
      ? state.filter(t => t !== action.typeNumber)
      : [...state, action.typeNumber];
  }
  return [];
}

// ─── TypeLegend ───────────────────────────────────────────────────────────────

function TypeLegend({
  groups,
  category,
  selectedTypeDetail,
  onSelectType,
  statusFilter,
}: {
  groups: TypeGroup[];
  category: Category;
  selectedTypeDetail: number | null;
  onSelectType: (tn: number) => void;
  statusFilter: StatusFilter;
}) {
  const prefix = category === 'bedrijfsunits' ? 'Bedrijfsunit' : 'Opslagbox';
  const visibleGroups = statusFilter === 'available'
    ? groups.filter(g => g.available > 0)
    : groups;

  return (
    <div className="space-y-2">
      {visibleGroups.map(g => {
        const isSelected = selectedTypeDetail === g.typeNumber;
        const imgSrc = `/images/floorplans/${prefix}_Type_${g.typeNumber}.webp`;

        return (
          <button
            key={g.typeNumber}
            onClick={() => onSelectType(g.typeNumber)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 text-left ${
              isSelected
                ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-300'
                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
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
                Type {g.typeNumber}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                {g.minArea === g.maxArea ? `${g.minArea} m²` : `${g.minArea}–${g.maxArea} m²`}
              </div>
              <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                {g.minPrice === g.maxPrice
                  ? `€ ${g.minPrice.toLocaleString('nl-NL')}`
                  : `vanaf € ${g.minPrice.toLocaleString('nl-NL')}`}
              </div>
            </div>
            {/* Availability badge */}
            <div className="flex-shrink-0 flex items-center gap-1">
              {g.available > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {g.available} vrij
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  vol
                </span>
              )}
              <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── TypeDetail ───────────────────────────────────────────────────────────────

function TypeDetail({
  group,
  category,
  units,
  highlightedUnitNumber,
  onBack,
  onUnitClick,
}: {
  group: TypeGroup;
  category: Category;
  units: FloorplanUnit[];
  highlightedUnitNumber: string | null;
  onBack: () => void;
  onUnitClick: (unit: FloorplanUnit) => void;
}) {
  const prefix = category === 'bedrijfsunits' ? 'Bedrijfsunit' : 'Opslagbox';
  const imgSrc = `/images/floorplans/${prefix}_Type_${group.typeNumber}.webp`;
  const typeUnits = units
    .filter(u => u.type_number === group.typeNumber)
    .sort((a, b) => parseInt(a.unit_number) - parseInt(b.unit_number));

  const typeSlug = category === 'bedrijfsunits' ? 'bedrijfsunit' : 'opslagbox';

  const statusLabel = (status: string) => {
    if (status === 'available') return { label: 'Vrij', cls: 'bg-green-100 text-green-700' };
    if (status === 'reserved')  return { label: 'Bezet', cls: 'bg-orange-100 text-orange-700' };
    return { label: 'Verkocht', cls: 'bg-gray-100 text-gray-500' };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0"
          title="Terug naar overzicht"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{prefix} Type {group.typeNumber}</div>
          <div className="text-xs text-gray-400">{typeUnits.length} units totaal</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Floorplan image */}
        <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-center min-h-[120px]">
          <img
            src={imgSrc}
            alt={`Type ${group.typeNumber} plattegrond`}
            className="max-h-36 w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Specs grid */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <div className="text-xs text-gray-400 mb-0.5">Oppervlakte</div>
            <div className="text-sm font-bold text-gray-900">
              {group.minArea === group.maxArea
                ? `${group.minArea} m²`
                : `${group.minArea}–${group.maxArea} m²`}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-2.5">
            <div className="text-xs text-yellow-600 mb-0.5">v.a. koopprijs</div>
            <div className="text-sm font-bold text-yellow-900">
              € {group.minPrice.toLocaleString('nl-NL')}
            </div>
          </div>
        </div>

        {/* Availability summary */}
        <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-100">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
              {group.available} beschikbaar
            </span>
            {group.reserved > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-medium">
                {group.reserved} gereserveerd
              </span>
            )}
          </div>
          <a 
            href={category === 'bedrijfsunits' ? '/pdf/technische_omschrijving_bedrijfsunits.pdf' : '/pdf/technische_omschrijving_opslagboxen.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-yellow-600 transition-colors"
            title="Download technische omschrijving"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>

        {/* Unit list */}
        <div className="p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
            Alle units
          </p>
          {typeUnits.map(unit => {
            const { label, cls } = statusLabel(unit.status);
            const isActive = highlightedUnitNumber === unit.unit_number;
            return (
              <div
                key={unit.unit_number}
                onClick={() => onUnitClick(unit)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 group ${
                  isActive
                    ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-300'
                    : 'border-gray-100 bg-white hover:border-yellow-200 hover:bg-yellow-50/40'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    Unit {unit.unit_number}
                  </div>
                  <div className="text-xs text-gray-500">
                    {unit.gross_area} m² · € {unit.sale_price.toLocaleString('nl-NL')}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
                    {label}
                  </span>
                  {unit.status === 'available' && (
                    <Link
                      href={`/reserveren/${typeSlug}-${unit.unit_number}`}
                      onClick={e => e.stopPropagation()}
                      className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-2 py-0.5 rounded-full transition-colors flex items-center gap-0.5"
                    >
                      <Calendar className="h-2.5 w-2.5" />
                      <span>Reserveer</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DownloadsSection({ category }: { category: Category }) {
  const downloads = [
    {
      label: 'Technische Omschrijving',
      file: category === 'bedrijfsunits' 
        ? '/pdf/technische_omschrijving_bedrijfsunits.pdf' 
        : '/pdf/technische_omschrijving_opslagboxen.pdf',
      icon: <FileText className="h-4 w-4" />
    },
    {
      label: 'Optielijst Afbouw',
      file: '/pdf/optielijst_afbouw.pdf',
      icon: <FileText className="h-4 w-4" />
    },
    {
      label: 'Projectplan Financiering',
      file: '/pdf/projectplan_financiering_kopers.pdf',
      icon: <FileText className="h-4 w-4" />
    },
    {
      label: 'Plattegrond (PDF)',
      file: '/pdf/technische_omschrijving_bedrijfsunits.pdf', // Fallback to TO if specific floorplan PDF isn't clear
      icon: <MapIcon className="h-4 w-4" />
    }
  ];

  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Downloads</h3>
      <div className="grid grid-cols-1 gap-2">
        {downloads.map((d, i) => (
          <a
            key={i}
            href={d.file}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
          >
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-yellow-100 text-gray-400 group-hover:text-yellow-600 transition-colors">
              {d.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{d.label}</div>
              <div className="text-[10px] text-gray-400">PDF Document</div>
            </div>
            <Download className="h-3.5 w-3.5 text-gray-300 group-hover:text-yellow-500" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── AanbodPage ───────────────────────────────────────────────────────────────

function AanbodPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialCategory: Category =
    tabParam === 'bedrijfsunits' ? 'bedrijfsunits' : 'opslagboxen';

  const [category, setCategory] = useState<Category>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTypes, dispatchTypes] = useReducer(typesReducer, []);
  const [selectedUnit, setSelectedUnit] = useState<FloorplanUnit | null>(null);
  const [selectedTypeDetail, setSelectedTypeDetail] = useState<number | null>(null);
  const [highlightedUnitNumber, setHighlightedUnitNumber] = useState<string | null>(null);

  // Contact form
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      await fetch('/api/bezichtiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          unitInfo: contactForm.message || undefined,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setContactSubmitting(false);
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }
  };

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

  // Reset selected types and detail view when category changes
  useEffect(() => {
    dispatchTypes({ type: 'clear' });
    setSelectedTypeDetail(null);
    setHighlightedUnitNumber(null);
  }, [category]);

  const currentUnits = units.filter(u =>
    u.type === (category === 'bedrijfsunits' ? 'bedrijfsunit' : 'opslagbox')
  );

  const typeGroups = groupByType(currentUnits);

  const floorImage = BEDRIJFSUNITS_IMAGE;

  const toggleType = (tn: number) => dispatchTypes({ type: 'toggle', typeNumber: tn });

  const totalAvailable = currentUnits.filter(u => u.status === 'available').length;
  const totalUnits = currentUnits.length;

  const availablePrices = currentUnits
    .filter(u => u.status === 'available' && u.sale_price > 0)
    .map(u => u.sale_price);
  const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : null;

  const isLoading = loadingUnits || loadingPolygons;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-0 px-4 text-center">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/beide2.webp')" }}
        />
        {/* Dark overlay — fades out at bottom so it flows into the content */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-950/95" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.22em] mb-4">
            Steiger 74–77 &nbsp;·&nbsp; Almere
          </p>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-[1.06] tracking-tight">
            Vind uw ideale<br />
            <span className="text-yellow-400">bedrijfsruimte</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed mb-8">
            Klik op een unit op de plattegrond voor details of reservering.
          </p>

          {/* ── Prominent category tabs inside hero ── */}
          <div className="flex flex-col xs:flex-row sm:inline-flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1.5 gap-1.5 shadow-2xl mb-8 w-full max-w-[280px] sm:w-auto mx-auto">
            {(['opslagboxen', 'bedrijfsunits'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                  category === cat
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                {cat === 'opslagboxen' ? 'Opslagboxen' : 'Bedrijfsunits'}
                {!isLoading && (
                  <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    category === cat ? 'bg-slate-100 text-slate-500' : 'bg-white/20 text-white/70'
                  }`}>
                    {cat === category
                      ? totalAvailable + ' vrij'
                      : units.filter(u =>
                          u.type === (cat === 'bedrijfsunits' ? 'bedrijfsunit' : 'opslagbox') &&
                          u.status === 'available'
                        ).length + ' vrij'
                    }
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </section>

      {/* ── Main section ─────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 pb-8">

        {/* Status filter + stats bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-green-600">{totalAvailable}</span>
            <span className="hidden sm:inline"> beschikbaar</span>
            <span className="text-gray-400"> / {totalUnits} units</span>
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

        {/* Starting price banner */}
        {!isLoading && lowestPrice !== null && (
          <div className="flex items-center justify-end gap-1.5 mb-4 text-sm text-gray-500">
            <span>{category === 'opslagboxen' ? 'Opslagboxen' : 'Bedrijfsunits'} vanaf</span>
            <span className="font-bold text-gray-900">€ {lowestPrice.toLocaleString('nl-NL')}</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Plattegrond laden...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">

            {/* ── Floorplan(s) ───────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-4">

              {category === 'opslagboxen' ? (
                /* All 3 floors stacked side-by-side */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {OPSLAGBOX_FLOORS.map(fl => (
                    <div key={fl.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <span className="text-xs font-semibold text-gray-700">{fl.label}</span>
                      </div>
                      <SimpleFloorplan
                        units={currentUnits}
                        polygons={polygons}
                        image={fl.image}
                        floorFilter={fl.id}
                        unitType="opslagbox"
                        highlightTypeNumbers={highlightedUnitNumber ? undefined : selectedTypeDetail !== null ? [selectedTypeDetail] : selectedTypes.length > 0 ? selectedTypes : undefined}
                        highlightUnitNumber={highlightedUnitNumber ?? undefined}
                        statusFilter={statusFilter}
                        onUnitClick={unit => {
                          setHighlightedUnitNumber(unit.unit_number);
                          setSelectedUnit(unit);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Single bedrijfsunits floorplan */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <SimpleFloorplan
                    units={currentUnits}
                    polygons={polygons}
                    image={floorImage}
                    unitType="bedrijfsunit"
                    highlightTypeNumbers={highlightedUnitNumber ? undefined : selectedTypeDetail !== null ? [selectedTypeDetail] : selectedTypes.length > 0 ? selectedTypes : undefined}
                    highlightUnitNumber={highlightedUnitNumber ?? undefined}
                    statusFilter={statusFilter}
                    onUnitClick={unit => {
                      setHighlightedUnitNumber(unit.unit_number);
                      setSelectedUnit(unit);
                    }}
                  />
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-green-500/30 border border-green-600 shadow-sm"></div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Beschikbaar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-red-500/30 border border-red-600 shadow-sm"></div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Gereserveerd</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-gray-400/40 border border-gray-500 shadow-sm"></div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Verkocht</span>
                </div>
                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-yellow-400/50 border border-yellow-600 shadow-sm"></div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Geselecteerd</span>
                </div>
                <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                <a 
                  href={category === 'bedrijfsunits' ? '/pdf/technische_omschrijving_bedrijfsunits.pdf' : '/pdf/technische_omschrijving_opslagboxen.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-400 rounded-lg transition-all group"
                >
                  <Download className="h-3.5 w-3.5 text-gray-400 group-hover:text-yellow-600" />
                  <span className="text-xs font-bold text-gray-600 group-hover:text-yellow-700 uppercase tracking-wider">Download Details</span>
                </a>
              </div>

              <p className="text-center text-xs text-gray-400">
                Klik op een unit om details te bekijken
              </p>
            </div>

            {/* ── Type sidebar (legend or detail) ──────────────────── */}
            <div className="lg:w-72 xl:w-80 flex-shrink-0">
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {selectedTypeDetail !== null ? (
                  /* ── Detail view ── */
                  (() => {
                    const group = typeGroups.find(g => g.typeNumber === selectedTypeDetail);
                    if (!group) return null;
                    return (
                      <TypeDetail
                        group={group}
                        category={category}
                        units={currentUnits}
                        highlightedUnitNumber={highlightedUnitNumber}
                        onBack={() => {
                          setSelectedTypeDetail(null);
                          setHighlightedUnitNumber(null);
                          dispatchTypes({ type: 'clear' });
                        }}
                        onUnitClick={unit => {
                          setHighlightedUnitNumber(unit.unit_number);
                          setSelectedUnit(unit);
                        }}
                      />
                    );
                  })()
                ) : (
                  /* ── Legend list ── */
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                      <h2 className="text-sm font-semibold text-gray-900">Types</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Klik voor details en beschikbaarheid</p>
                    </div>
                    <div className="p-3 overflow-y-auto flex-1">
                      <TypeLegend
                        groups={typeGroups}
                        category={category}
                        selectedTypeDetail={selectedTypeDetail}
                        onSelectType={tn => {
                          setSelectedTypeDetail(tn);
                          dispatchTypes({ type: 'clear' });
                          dispatchTypes({ type: 'toggle', typeNumber: tn });
                        }}
                        statusFilter={statusFilter}
                      />
                      {typeGroups.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          Geen types gevonden
                        </div>
                      )}

                      <DownloadsSection category={category} />
                    </div>
                  </>
                )}
              </div>

              {selectedTypeDetail === null && (
                <p className="text-xs text-gray-400 text-center mt-3 px-2">
                  Selecteer een type om de details te bekijken
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── FAQ section ──────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Contact section ──────────────────────────────────────────────── */}
      <ContactSection />

      {/* ── Unit Drawer ────────────────────────────────────────────────────── */}
      <UnitDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  );
}

export default function AanbodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    }>
      <AanbodPageContent />
    </Suspense>
  );
}
