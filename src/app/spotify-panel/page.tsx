'use client';

import { useState, useEffect } from 'react';
import {
  LayoutGrid, BarChart2, FileText, Settings, LogOut,
  Music, TrendingUp, Globe, Eye, EyeOff, Flag,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const CAMPAIGN_START = new Date('2026-04-09');

// 30 days – UK streams (user's deliverable, ~25k/day)
const ukDaily: number[] = [
  14237, 15891, 16543, 17128, 18374,
  17986, 19612, 20047, 19834, 21193,
  22417, 21876, 23054, 22731, 24189,
  23647, 24512, 23938, 25071, 24388,
  25619, 24873, 26241, 25387, 26078,
  25743, 26831, 25492, 26317, 25189,
];

// Total streams (~30 % higher than UK — other territories included)
const totalDaily: number[] = ukDaily.map((v, i) => {
  const extras = [5821, 6134, 5947, 6312, 6078, 5934, 6241, 6087, 5812, 6398,
                  6174, 5947, 6321, 6087, 5934, 6412, 6187, 5821, 6341, 5978,
                  6214, 5934, 6387, 6071, 5847, 6213, 5934, 6187, 6041, 5912];
  return v + extras[i];
});

type Slice = { uk: number[]; total: number[]; labels: string[] };

function buildSlice(days: number): Slice {
  const n = Math.min(days, 30);
  const uk = ukDaily.slice(30 - n);
  const total = totalDaily.slice(30 - n);
  const labels = uk.map((_, i) => {
    const d = new Date(CAMPAIGN_START);
    d.setDate(d.getDate() + (30 - n) + i);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });
  return { uk, total, labels };
}

function fmt(n: number) {
  return new Intl.NumberFormat('nl-NL').format(n);
}

// ─── SVG Charts ───────────────────────────────────────────────────────────────

function LineChart({ slice }: { slice: Slice }) {
  const W = 800; const H = 200;
  const PAD = { top: 16, right: 20, bottom: 28, left: 52 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const all = [...slice.uk, ...slice.total];
  const minV = Math.floor(Math.min(...all) / 2000) * 2000;
  const maxV = Math.ceil(Math.max(...all) / 2000) * 2000;

  const xS = (i: number) => PAD.left + (i / (slice.uk.length - 1)) * cW;
  const yS = (v: number) => PAD.top + cH - ((v - minV) / (maxV - minV)) * cH;

  const path = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');

  const area = (arr: number[], col: string) => {
    const l = arr.length - 1;
    return `${path(arr)} L ${xS(l).toFixed(1)},${(PAD.top + cH).toFixed(1)} L ${xS(0).toFixed(1)},${(PAD.top + cH).toFixed(1)} Z`;
  };

  const yTicks = [minV, minV + (maxV - minV) * 0.25, minV + (maxV - minV) * 0.5,
                  minV + (maxV - minV) * 0.75, maxV].map(Math.round);

  const xTickN = slice.uk.length <= 7 ? slice.uk.length : 6;
  const xTicks = Array.from({ length: xTickN }, (_, i) =>
    Math.round((i / (xTickN - 1)) * (slice.uk.length - 1))
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="lgUK" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lgTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={PAD.left + cW} y1={yS(v)} y2={yS(v)} stroke="#ffffff0d" strokeWidth="1" />
          <text x={PAD.left - 8} y={yS(v) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            {v >= 1000 ? `${Math.round(v / 1000)}K` : v}
          </text>
        </g>
      ))}

      {xTicks.map((i) => (
        <text key={i} x={xS(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#4b5563">
          {slice.labels[i]}
        </text>
      ))}

      <path d={area(slice.total, '#3b82f6')} fill="url(#lgTotal)" />
      <path d={area(slice.uk, '#22c55e')} fill="url(#lgUK)" />

      <path d={path(slice.total)} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round" />
      <path d={path(slice.uk)} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ slice }: { slice: Slice }) {
  const W = 800; const H = 180;
  const PAD = { top: 12, right: 20, bottom: 28, left: 52 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const maxV = Math.ceil(Math.max(...slice.total) / 5000) * 5000;
  const n = slice.uk.length;
  const groupW = cW / n;
  const barW = Math.min((groupW - 4) / 2, 14);

  const yS = (v: number) => PAD.top + cH - (v / maxV) * cH;
  const yTicks = [0, maxV * 0.25, maxV * 0.5, maxV * 0.75, maxV].map(Math.round);

  const xTickN = n <= 7 ? n : 6;
  const xTicks = Array.from({ length: xTickN }, (_, i) =>
    Math.round((i / (xTickN - 1)) * (n - 1))
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={PAD.left + cW} y1={yS(v)} y2={yS(v)} stroke="#ffffff0d" strokeWidth="1" />
          <text x={PAD.left - 8} y={yS(v) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            {v >= 1000 ? `${Math.round(v / 1000)}K` : v}
          </text>
        </g>
      ))}

      {xTicks.map((i) => (
        <text key={i} x={PAD.left + i * groupW + groupW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#4b5563">
          {slice.labels[i]}
        </text>
      ))}

      {slice.total.map((tot, i) => {
        const uk = slice.uk[i];
        const cx = PAD.left + i * groupW + groupW / 2;
        return (
          <g key={i}>
            <rect x={cx - barW - 1} y={yS(tot)} width={barW} height={Math.max(0, PAD.top + cH - yS(tot))}
              fill="#3b82f6" rx="2" opacity="0.7" />
            <rect x={cx + 1} y={yS(uk)} width={barW} height={Math.max(0, PAD.top + cH - yS(uk))}
              fill="#22c55e" rx="2" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[#9ca3af] text-xs">{label}</p>
        <div className="text-[#9ca3af]">{icon}</div>
      </div>
      <p className="text-white text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-[#6b7280] text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Mock auth ────────────────────────────────────────────────────────────────

const DEMO_USER = { email: 'klant@demo.com', password: 'demo123', name: 'Demo Klant', initials: 'D' };

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        onLogin();
      } else {
        setError('Ongeldig e-mailadres of wachtwoord.');
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#22c55e] rounded-xl mb-4">
            <Music className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-white text-xl font-bold">Campaign Dashboard</h1>
          <p className="text-[#6b7280] text-sm mt-1">Inloggen bij je account</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-7 border border-white/5">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[#9ca3af] text-xs font-medium uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="klant@demo.com" required
                className="w-full bg-[#252525] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#4b5563] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9ca3af] text-xs font-medium uppercase tracking-wider mb-1.5">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-[#252525] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#4b5563] focus:outline-none focus:border-[#22c55e] transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-black font-bold py-2.5 rounded-lg transition-colors text-sm mt-1">
              {loading ? 'Inloggen…' : 'Inloggen'}
            </button>
          </form>
          <p className="text-[#6b7280] text-xs text-center mt-5">
            Demo: <span className="text-[#9ca3af]">klant@demo.com</span> / <span className="text-[#9ca3af]">demo123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const slice = buildSlice(30);
  const totalUK = ukDaily.reduce((a, b) => a + b, 0);
  const totalAll = totalDaily.reduce((a, b) => a + b, 0);
  const todayUK = ukDaily[29];
  const todayTotal = totalDaily[29];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-[#22c55e]" /> Overzicht
        </h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Samenvatting van je campagne</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Totaal streams (30d)" value={fmt(totalAll)} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard label="UK totaal (30d)" value={fmt(totalUK)} sub="100% UK" icon={<Flag className="w-4 h-4 text-[#22c55e]" />} />
        <StatCard label="Vandaag – Totaal" value={fmt(todayTotal)} icon={<BarChart2 className="w-4 h-4" />} />
        <StatCard label="Vandaag – UK" value={fmt(todayUK)} sub={`+${fmt(todayUK - ukDaily[28])} vs gisteren`} icon={<Globe className="w-4 h-4" />} />
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Stream trend – 30 dagen</h2>
          <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#3b82f6] inline-block rounded" />Totaal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#22c55e] inline-block rounded" />UK</span>
          </div>
        </div>
        <LineChart slice={slice} />
      </div>
    </div>
  );
}

// ─── Analytics tab ────────────────────────────────────────────────────────────

function AnalyseTab() {
  const [days, setDays] = useState(30);
  const slice = buildSlice(days);

  const ukTotal = slice.uk.reduce((a, b) => a + b, 0);
  const allTotal = slice.total.reduce((a, b) => a + b, 0);
  const peakUK = Math.max(...slice.uk);
  const peakDay = slice.labels[slice.uk.indexOf(peakUK)];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#22c55e]" /> Analyse
        </h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Diepgaande campagne statistieken</p>
      </div>

      {/* Time filter */}
      <div className="flex gap-2">
        {[7, 14, 30].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              days === d ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#9ca3af] hover:text-white border border-white/5'
            }`}>
            {d} dagen
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="flex gap-4">
        <StatCard
          label="Totaal streams"
          value={fmt(allTotal)}
          icon={<TrendingUp className="w-4 h-4 text-[#22c55e]" />}
        />
        <StatCard
          label="Piekdag"
          value={fmt(peakUK)}
          sub={peakDay}
          icon={<BarChart2 className="w-4 h-4 text-[#3b82f6]" />}
        />
        <StatCard
          label="UK totaal"
          value={fmt(ukTotal)}
          icon={<Globe className="w-4 h-4 text-yellow-500" />}
        />
      </div>

      {/* Line chart */}
      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Stream trend</h2>
          <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#3b82f6] inline-block rounded" />Totaal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#22c55e] inline-block rounded" />UK</span>
          </div>
        </div>
        <LineChart slice={slice} />
      </div>

      {/* Bar chart */}
      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Dagelijkse streams (Totaal vs UK)</h2>
          <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#3b82f6] rounded-sm inline-block opacity-70" />Totaal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#22c55e] rounded-sm inline-block" />UK</span>
          </div>
        </div>
        <BarChart slice={slice} />
      </div>
    </div>
  );
}

// ─── Reports tab ──────────────────────────────────────────────────────────────

function RapportagesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#22c55e]" /> Rapportages
        </h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Exporteerbare dagrapportages</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[#9ca3af] text-xs uppercase tracking-wider px-5 py-3">Datum</th>
              <th className="text-right text-[#9ca3af] text-xs uppercase tracking-wider px-5 py-3">Totaal</th>
              <th className="text-right text-[#9ca3af] text-xs uppercase tracking-wider px-5 py-3">UK</th>
              <th className="text-right text-[#9ca3af] text-xs uppercase tracking-wider px-5 py-3">UK %</th>
            </tr>
          </thead>
          <tbody>
            {ukDaily.map((uk, i) => {
              const d = new Date(CAMPAIGN_START);
              d.setDate(d.getDate() + i);
              const tot = totalDaily[i];
              const ukPct = ((uk / tot) * 100).toFixed(1);
              const isToday = i === 29;
              return (
                <tr key={i} className={`border-b border-white/[0.03] ${isToday ? 'bg-[#22c55e]/5' : 'hover:bg-white/[0.02]'}`}>
                  <td className="px-5 py-2.5 text-[#d1d5db]">
                    {d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isToday && <span className="ml-2 text-[10px] bg-[#22c55e]/20 text-[#22c55e] px-1.5 py-0.5 rounded-full">vandaag</span>}
                  </td>
                  <td className="px-5 py-2.5 text-right text-[#9ca3af] tabular-nums">{fmt(tot)}</td>
                  <td className="px-5 py-2.5 text-right text-white tabular-nums font-medium">{fmt(uk)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">
                    <span className="text-[#22c55e] text-xs">{ukPct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard shell ──────────────────────────────────────────────────────────

const NAV = [
  { id: 'overzicht', label: 'Overzicht', icon: LayoutGrid },
  { id: 'analyse', label: 'Analyse', icon: BarChart2 },
  { id: 'rapportages', label: 'Rapportages', icon: FileText },
] as const;

type Tab = typeof NAV[number]['id'];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('analyse');

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      {/* Sidebar */}
      <aside className="w-44 flex-shrink-0 bg-[#141414] border-r border-white/5 flex flex-col">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
              VP
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">Visible Projects</p>
              <p className="text-[#6b7280] text-[10px] truncate">Campaign Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-4">
          <p className="text-[#4b5563] text-[10px] uppercase tracking-widest px-2 mb-2">Menu</p>
          <div className="space-y-0.5">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  tab === id
                    ? 'bg-[#22c55e] text-black font-semibold'
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-white/5 px-2 pb-4 pt-3">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="w-7 h-7 bg-[#22c55e] rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
              D
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate leading-tight">{DEMO_USER.name}</p>
              <p className="text-[#6b7280] text-[10px]">klant</p>
            </div>
          </div>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#9ca3af] hover:text-white hover:bg-white/5 transition-colors">
              <Settings className="w-3.5 h-3.5" /> Instellingen
            </button>
            <button onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#9ca3af] hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Uitloggen
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-7">
        {tab === 'overzicht' && <OverviewTab />}
        {tab === 'analyse' && <AnalyseTab />}
        {tab === 'rapportages' && <RapportagesTab />}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function SpotifyPanelPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;
  return <Dashboard onLogout={() => setLoggedIn(false)} />;
}
