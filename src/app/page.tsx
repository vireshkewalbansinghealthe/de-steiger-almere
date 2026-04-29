'use client';

import { useState, useEffect, useReducer } from 'react';
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
          <label
            key={g.typeNumber}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
              isSelected
                ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-300'
                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {/* Native checkbox — hidden, but drives the state */}
            <input
              type="checkbox"
              className="sr-only"
              checked={isSelected}
              onChange={() => onToggleType(g.typeNumber)}
            />
            {/* Visual checkbox */}
            <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors pointer-events-none ${
              isSelected ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300 bg-white'
            }`}>
              {isSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
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
          </label>
        );
      })}
    </div>
  );
}

// ─── HomePage ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [category, setCategory] = useState<Category>('opslagboxen');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTypes, dispatchTypes] = useReducer(typesReducer, []);
  const [selectedUnit, setSelectedUnit] = useState<FloorplanUnit | null>(null);

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

  // Reset selected types when category changes
  useEffect(() => { dispatchTypes({ type: 'clear' }); }, [category]);

  const currentUnits = units.filter(u =>
    u.type === (category === 'bedrijfsunits' ? 'bedrijfsunit' : 'opslagbox')
  );

  const typeGroups = groupByType(currentUnits);

  const floorImage = BEDRIJFSUNITS_IMAGE;

  const toggleType = (tn: number) => dispatchTypes({ type: 'toggle', typeNumber: tn });

  const totalAvailable = currentUnits.filter(u => u.status === 'available').length;
  const totalUnits = currentUnits.length;

  const isLoading = loadingUnits || loadingPolygons;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-0 px-4 text-center">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/beide2.png')" }}
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
          <div className="flex flex-col sm:flex-row bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1.5 gap-1.5 shadow-2xl mb-8 w-full max-w-xs sm:max-w-none sm:w-auto mx-auto">
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
        <div className="flex items-center justify-between mb-5">
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

        {/* Color key */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 opacity-80 inline-block" />Beschikbaar</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 opacity-80 inline-block" />Gereserveerd</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-400 opacity-80 inline-block" />Verkocht</span>
          {selectedTypes.length > 0 && (
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-400 opacity-80 inline-block" />Geselecteerd type</span>
          )}
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
                        highlightTypeNumbers={selectedTypes.length > 0 ? selectedTypes : undefined}
                        statusFilter={statusFilter}
                        onUnitClick={setSelectedUnit}
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
                    highlightTypeNumbers={selectedTypes.length > 0 ? selectedTypes : undefined}
                    statusFilter={statusFilter}
                    onUnitClick={setSelectedUnit}
                  />
                </div>
              )}

              <p className="text-center text-xs text-gray-400">
                Klik op een unit om details te bekijken
              </p>
            </div>

            {/* ── Type Legend (sidebar) ────────────────────────────────── */}
            <div className="lg:w-72 xl:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Types</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Selecteer meerdere types</p>
                  </div>
                  {selectedTypes.length > 0 && (
                    <button
                      onClick={() => dispatchTypes({ type: 'clear' })}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      Wis ({selectedTypes.length})
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

      {/* ── Contact section ──────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white mt-12 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Left: copy */}
            <div>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Contact</p>
              <h2 className="text-3xl font-black mb-4 leading-tight">
                Vragen of meer<br />informatie?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Wij helpen u graag verder. Vul het formulier in en we nemen zo snel mogelijk contact met u op.
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                <div>VVS Projectontwikkeling B.V.</div>
                <div>Steiger 74–77, Almere</div>
                <a href="mailto:administratie@vvsbouw.nl" className="block text-yellow-400 hover:text-yellow-300 transition-colors">
                  administratie@vvsbouw.nl
                </a>
                <a href="tel:0578769056" className="block text-yellow-400 hover:text-yellow-300 transition-colors">
                  0578 – 769 056
                </a>
              </div>
            </div>

            {/* Right: form */}
            <div>
              {contactSubmitted ? (
                <div className="bg-white/10 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">✓</div>
                  <p className="font-bold text-lg">Bericht ontvangen!</p>
                  <p className="text-slate-400 text-sm mt-1">We nemen zo snel mogelijk contact met u op.</p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 text-xs text-slate-400 underline hover:text-white"
                  >
                    Nog een bericht sturen
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required type="text" placeholder="Uw naam"
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="col-span-2 sm:col-span-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                    <input
                      required type="email" placeholder="E-mailadres"
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="col-span-2 sm:col-span-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <input
                    required type="tel" placeholder="Telefoonnummer"
                    value={contactForm.phone}
                    onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <textarea
                    rows={3} placeholder="Uw vraag of bericht (optioneel)"
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  />
                  <button
                    type="submit" disabled={contactSubmitting}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-colors"
                  >
                    {contactSubmitting ? 'Versturen...' : 'Stuur bericht'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Unit Drawer ────────────────────────────────────────────────────── */}
      <UnitDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  );
}
