'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Check, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CreditCard, ChevronDown, PenLine, Building2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { projects } from '../../../data/projects';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Contract text ──────────────────────────────────────────────────────────

function buildContractText(info: CustomerInfo, property: PropertyData | null, unitNumber: number | null) {
  const unitTypeLabel = property?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
  const now = new Date();
  const fmtDate = (d: Date) => format(d, 'dd MMMM yyyy', { locale: nl });
  const eindDatum = new Date(now.getTime() + 8 * 7 * 24 * 60 * 60 * 1000);

  return `RESERVERINGSOVEREENKOMST ${unitTypeLabel.toUpperCase()}

De ondergetekenden:

VVS Projectontwikkeling B.V.
Hammerstraat 10 A, 8161 PH EPE, Nederland
administratie@vvsbouw.nl | 06-85727480 | www.vvsprojectontwikkeling.nl
hierna te noemen: "Verkoper";

EN

${[info.firstName, info.lastName].filter(Boolean).join(' ') || '[Naam gegadigde]'}${info.company ? '\n' + info.company : ''}
${[info.address, info.postalCode, info.city].filter(Boolean).join(', ') || '[Adres]'}
${[info.email, info.phone].filter(Boolean).join(' | ') || '[Contactgegevens]'}
hierna te noemen: "Gegadigde";

═══════════════════════════════════════════

ARTIKEL 1 - RESERVERING EN RESERVERINGSPERIODE

1.1 De Verkoper reserveert de ${unitTypeLabel.toLowerCase()} met nummer ${unitNumber || '[unitnummer]'} gedurende acht (8) weken vanaf ${fmtDate(now)} tot ${fmtDate(eindDatum)} voor Gegadigde.

1.2 Uiterlijk vóór ${fmtDate(eindDatum)} zal de Gegadigde aan de Verkoper schriftelijk meedelen of hij tot aankoop wenst over te gaan.

1.3 Indien de Verkoper niet tijdig bericht heeft ontvangen, vervalt het recht op aankoop van rechtswege. De gehele reserveringsvergoeding vervalt dan volledig aan de Verkoper.

═══════════════════════════════════════════

ARTIKEL 2 - RESERVERINGSVERGOEDING

2.1 De Gegadigde is een reserveringsvergoeding verschuldigd ter hoogte van € 1.500,00, welke uiterlijk binnen 48 uur na factuurdatum voldaan dient te zijn.

2.2 De koopprijs van de unit bedraagt ${property?.sale_price ? '€ ' + property.sale_price.toLocaleString('nl-NL', { minimumFractionDigits: 2 }) : '[bedrag]'}. De reserveringsvergoeding wordt in mindering gebracht op de koopprijs bij aankoop.

2.3 Indien de reservering binnen 48 uur wordt geannuleerd, is Gegadigde slechts 25% verschuldigd. Na de eerste week van de reserveringsperiode heeft Gegadigde geen recht op terugbetaling.

═══════════════════════════════════════════

ARTIKEL 3 - EINDE VAN DE OVEREENKOMST

3.1 Deze Overeenkomst eindigt door:
    a) Faillissement of surseance van betaling van een der Partijen;
    b) Niet-tijdige betaling van de reserveringsvergoeding;
    c) Verstrijken van de reserveringsperiode;
    d) Aankoop van de Unit door Gegadigde.

═══════════════════════════════════════════

ARTIKEL 4 - SLOTBEPALINGEN

4.1 Deze Overeenkomst levert voor Gegadigde strikt persoonlijke rechten op en is niet overdraagbaar zonder schriftelijke toestemming van Verkoper.

4.2 Deze Overeenkomst wordt beheerst door Nederlands recht.

4.3 Geschillen worden voorgelegd aan de bevoegde rechter te Midden-Nederland.

═══════════════════════════════════════════

ONDERTEKENING

Aldus overeengekomen en ondertekend door Gegadigde:

Naam: ${[info.firstName, info.lastName].filter(Boolean).join(' ') || '_______________'}
Datum: ${fmtDate(now)}
Plaats: ${info.city || 'Almere'}

Digitale handtekening: [Zie bijlage]`;
}

// ─── Stripe payment form ─────────────────────────────────────────────────────

interface CustomerInfo {
  firstName: string; lastName: string; email: string; phone: string;
  company: string; address: string; city: string; postalCode: string; country: string;
}

interface PropertyData {
  id: string; unit_number: string; sale_price: number; gross_area: number;
  type: string; type_number: number | null; status: string;
}

function StripeForm({ clientSecret, reservationId, customerInfo }: {
  clientSecret: string;
  reservationId: string;
  customerInfo: CustomerInfo;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setPaymentError('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/betaling-bevestiging/${reservationId}`,
        payment_method_data: {
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              postal_code: customerInfo.postalCode,
              country: 'NL',
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Er is een fout opgetreden bij de betaling.');
      setProcessing(false);
    } else {
      router.push(`/betaling-bevestiging/${reservationId}`);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <PaymentElement className="mb-6" />
      {paymentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {paymentError}
        </div>
      )}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg"
      >
        {processing ? 'Betaling verwerken...' : 'Betaal €1.500 reserveringskosten'}
      </button>
    </form>
  );
}

// ─── Main reservation content ─────────────────────────────────────────────────

function ReservationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const slug = params.slug as string;
  const unitParam = searchParams.get('unit');
  const unitNumber = unitParam ? parseInt(unitParam, 10) : null;
  const project = projects.find(p => p.slug === slug);

  type Phase = 'loading' | 'form' | 'payment' | 'unavailable';
  const [phase, setPhase] = useState<Phase>('loading');
  const [unavailableMsg, setUnavailableMsg] = useState('');

  // Auth
  const [user, setUser] = useState<any>(null);
  const [authCollapsed, setAuthCollapsed] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Property
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  // Customer info
  const [info, setInfo] = useState<CustomerInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    company: '', address: '', city: '', postalCode: '', country: 'Nederland',
  });

  // Terms & signature
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Payment
  const [clientSecret, setClientSecret] = useState('');
  const [reservationId, setReservationId] = useState('');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      setAuthCollapsed(true);
      await loadProfile(currentUser);
    }

    if (unitNumber) {
      const type = slug.includes('bedrijfsunit') ? 'bedrijfsunit' : 'opslagbox';
      const { data: property } = await supabase
        .from('properties')
        .select('id, unit_number, sale_price, gross_area, type, type_number, status')
        .eq('unit_number', unitNumber.toString())
        .eq('type', type)
        .single();

      if (!property || property.status !== 'available') {
        setUnavailableMsg(
          !property ? 'Deze unit bestaat niet.' :
          property.status === 'reserved' ? 'Deze unit is al gereserveerd door iemand anders.' :
          'Deze unit is niet beschikbaar voor reservering.'
        );
        setPhase('unavailable');
        return;
      }
      setPropertyData(property);
    }
    setPhase('form');
  };

  const loadProfile = async (currentUser: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (profile) {
      setInfo({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || currentUser.email || '',
        phone: profile.phone || '',
        company: profile.company_name || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postal_code || '',
        country: profile.country || 'Nederland',
      });
    } else {
      setInfo(prev => ({
        ...prev,
        firstName: currentUser.user_metadata?.first_name || '',
        lastName: currentUser.user_metadata?.last_name || '',
        email: currentUser.email || '',
      }));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'register') {
        if (authData.password !== authData.confirmPassword) {
          setAuthError('Wachtwoorden komen niet overeen');
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.desteigeralmere.nl'}/auth/callback`,
            data: { first_name: authData.firstName, last_name: authData.lastName },
          },
        });
        if (error) throw error;
        if (data.user && !data.user.email_confirmed_at) {
          setAuthError('Controleer uw e-mail voor verificatie voordat u doorgaat.');
          return;
        }
        setUser(data.user);
        await loadProfile(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });
        if (error) throw error;
        setUser(data.user);
        await loadProfile(data.user);
      }
      setAuthCollapsed(true);
    } catch (err: any) {
      let msg = err.message || 'Er is een fout opgetreden';
      if (msg.includes('Email not confirmed')) msg = 'E-mailadres is nog niet bevestigd. Controleer uw inbox.';
      else if (msg.includes('Invalid login credentials')) msg = 'Ongeldige inloggegevens.';
      else if (msg.includes('User already registered')) msg = 'Er bestaat al een account. Probeer in te loggen.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const infoComplete = !!(
    info.firstName && info.lastName && info.email && info.phone &&
    info.address && info.city && info.postalCode
  );

  const isFormValid = !!(user && infoComplete && termsAccepted && signatureData);

  const handleSubmit = async () => {
    if (!isFormValid || !propertyData) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Niet ingelogd');

      const res = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          property_id: propertyData.id,
          customer_details: {
            first_name: info.firstName,
            last_name: info.lastName,
            email: info.email,
            phone: info.phone,
            company: info.company,
            address: info.address,
            city: info.city,
            postal_code: info.postalCode,
            country: info.country,
          },
          signature_data: signatureData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Er is een fout opgetreden');
      }

      const data = await res.json();
      setClientSecret(data.payment_intent.client_secret);
      setReservationId(data.reservation.id);
      setPhase('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Er is een fout opgetreden');
    } finally {
      setSubmitting(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Project niet gevonden</h1>
          <Link href="/" className="text-yellow-600 hover:text-yellow-700">Terug naar home</Link>
        </div>
      </div>
    );
  }

  const contractText = buildContractText(info, propertyData, unitNumber);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      {/* Sticky top bar */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-13 flex items-center gap-3 py-3">
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Terug</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-800 truncate">
            {phase === 'payment' ? 'Betaling' : 'Reservering'}
            {unitNumber && <span className="text-yellow-600 font-normal"> · Unit {unitNumber}</span>}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600" />
          </div>
        )}

        {/* Unavailable */}
        {phase === 'unavailable' && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unit niet beschikbaar</h2>
            <p className="text-gray-500 mb-6">{unavailableMsg}</p>
            <Link href="/" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 font-medium">
              Terug naar overzicht
            </Link>
          </div>
        )}

        {/* Form phase */}
        {phase === 'form' && (
          <div className="space-y-4">

            {/* Unit info */}
            {propertyData && (
              <div className="bg-white rounded-2xl shadow-sm border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{project.name}</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {propertyData.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'} {unitNumber}
                      {propertyData.type_number !== null && (
                        <span className="text-gray-400 font-normal"> · Type {propertyData.type_number}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">€ {propertyData.sale_price?.toLocaleString('nl-NL')}</div>
                    <div className="text-xs text-gray-400">{propertyData.gross_area}m²</div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: Account */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => { if (user) setAuthCollapsed(!authCollapsed); }}
              >
                <div className="flex items-center gap-3">
                  <SectionBadge num={1} done={!!user} />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">Account</div>
                    {user
                      ? <div className="text-xs text-green-600">Ingelogd als {user.email}</div>
                      : <div className="text-xs text-gray-400">Inloggen of registreren om door te gaan</div>
                    }
                  </div>
                </div>
                {user && <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${authCollapsed ? '' : 'rotate-180'}`} />}
              </button>

              {(!authCollapsed || !user) && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  {user ? (
                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ingelogd als <strong>{user.email}</strong></span>
                      <button
                        onClick={async () => { await supabase.auth.signOut(); setUser(null); setAuthCollapsed(false); setInfo({ firstName: '', lastName: '', email: '', phone: '', company: '', address: '', city: '', postalCode: '', country: 'Nederland' }); }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Uitloggen
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAuth} className="pt-4 space-y-3">
                      {/* Login / Register tabs */}
                      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        {(['login', 'register'] as const).map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => { setAuthMode(mode); setAuthError(''); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {mode === 'login' ? 'Inloggen' : 'Registreren'}
                          </button>
                        ))}
                      </div>

                      {authMode === 'register' && (
                        <div className="grid grid-cols-2 gap-3">
                          <input required type="text" placeholder="Voornaam" value={authData.firstName} onChange={e => setAuthData(p => ({ ...p, firstName: e.target.value }))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                          <input required type="text" placeholder="Achternaam" value={authData.lastName} onChange={e => setAuthData(p => ({ ...p, lastName: e.target.value }))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                        </div>
                      )}
                      <input required type="email" placeholder="E-mailadres" value={authData.email} onChange={e => setAuthData(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                      <div className="relative">
                        <input required type={showPassword ? 'text' : 'password'} placeholder="Wachtwoord" value={authData.password} onChange={e => setAuthData(p => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {authMode === 'register' && (
                        <input required type={showPassword ? 'text' : 'password'} placeholder="Wachtwoord bevestigen" value={authData.confirmPassword} onChange={e => setAuthData(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                      )}
                      {authError && <p className="text-red-500 text-sm">{authError}</p>}
                      <button type="submit" disabled={authLoading} className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                        {authLoading ? 'Bezig...' : authMode === 'register' ? 'Account aanmaken' : 'Inloggen'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: Uw gegevens */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <SectionBadge num={2} done={infoComplete} />
                <div className="text-sm font-semibold text-gray-900">Uw gegevens</div>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Voornaam *" value={info.firstName} onChange={v => setInfo(p => ({ ...p, firstName: v }))} placeholder="Voornaam" />
                  <Field label="Achternaam *" value={info.lastName} onChange={v => setInfo(p => ({ ...p, lastName: v }))} placeholder="Achternaam" />
                </div>
                <Field label="E-mailadres *" type="email" value={info.email} onChange={v => setInfo(p => ({ ...p, email: v }))} placeholder="uw@email.com" />
                <Field label="Telefoonnummer *" type="tel" value={info.phone} onChange={v => setInfo(p => ({ ...p, phone: v }))} placeholder="+31 6 12345678" />
                <Field label="Bedrijf (optioneel)" value={info.company} onChange={v => setInfo(p => ({ ...p, company: v }))} placeholder="Bedrijfsnaam" required={false} />
                <Field label="Adres *" value={info.address} onChange={v => setInfo(p => ({ ...p, address: v }))} placeholder="Straat en huisnummer" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Postcode *" value={info.postalCode} onChange={v => setInfo(p => ({ ...p, postalCode: v }))} placeholder="1234 AB" />
                  <Field label="Stad *" value={info.city} onChange={v => setInfo(p => ({ ...p, city: v }))} placeholder="Stad" />
                </div>
              </div>
            </div>

            {/* SECTION 3: Overeenkomst & handtekening */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <SectionBadge num={3} done={termsAccepted && !!signatureData} />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Reserveringsovereenkomst</div>
                  <div className="text-xs text-gray-400">Lees de overeenkomst en onderteken</div>
                </div>
              </div>
              <div className="p-5">
                {/* Contract preview + open button */}
                <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Reserveringsovereenkomst</p>
                    <p className="text-xs text-gray-500 mt-0.5">Lees de volledige overeenkomst voordat u akkoord gaat</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContractDrawerOpen(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors shadow-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Bekijk
                  </button>
                </div>

                {/* Akkoord checkbox — always visible */}
                <label className="flex items-start gap-3 cursor-pointer mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-blue-600 rounded flex-shrink-0"
                  />
                  <span className="text-sm text-blue-900 leading-snug">
                    <strong>Ik heb de reserveringsovereenkomst gelezen</strong> en ga akkoord met de voorwaarden en de reserveringsvergoeding van €1.500.
                  </span>
                </label>

                {/* Signature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PenLine className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-800">Handtekening</span>
                    </div>
                    {signatureData && (
                      <button
                        type="button"
                        onClick={() => { sigCanvas.current?.clear(); setSignatureData(''); }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Opnieuw tekenen
                      </button>
                    )}
                  </div>
                  <div className={`border-2 rounded-xl overflow-hidden bg-white transition-colors ${signatureData ? 'border-green-300' : 'border-dashed border-gray-300'}`}>
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{ className: 'w-full', style: { height: 130 } }}
                      onEnd={() => setSignatureData(sigCanvas.current?.toDataURL() || '')}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">
                    {signatureData ? '✓ Handtekening geplaatst' : 'Teken hierboven met uw muis of vinger'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-green-600/20"
            >
              {submitting ? 'Reservering aanmaken...' : 'Bevestig en ga naar betaling →'}
            </button>

            {/* Hint text about what's missing */}
            {!isFormValid && !submitting && (
              <p className="text-center text-xs text-gray-400 -mt-1">
                {!user ? 'Log eerst in (sectie 1)' :
                 !infoComplete ? 'Vul alle verplichte velden in (sectie 2)' :
                 !termsAccepted ? 'Accepteer de reserveringsovereenkomst (sectie 3)' :
                 !signatureData ? 'Zet uw handtekening (sectie 3)' : ''}
              </p>
            )}
          </div>
        )}

        {/* Payment phase */}
        {phase === 'payment' && clientSecret && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-green-900">Reservering aangemaakt</div>
                  <div className="text-sm text-green-700">Voltooi de betaling om uw reservering te bevestigen</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">Betaling</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Reserveringskosten · €1.500 · wordt verrekend bij aankoop</p>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: '#ca8a04', borderRadius: '12px', fontFamily: 'system-ui, sans-serif' },
                  },
                }}
              >
                <StripeForm clientSecret={clientSecret} reservationId={reservationId} customerInfo={info} />
              </Elements>
            </div>
          </div>
        )}

      </div>

      {/* ── Contract drawer ─────────────────────────────────────────────── */}
      {contractDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setContractDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">Reserveringsovereenkomst</h2>
                <p className="text-xs text-gray-400 mt-0.5">Lees de volledige overeenkomst</p>
              </div>
              <button
                onClick={() => setContractDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Contract text */}
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-xs font-mono leading-relaxed text-gray-700 whitespace-pre-wrap">
                {contractText}
              </pre>
            </div>
            {/* Footer */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setContractDrawerOpen(false)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionBadge({ num, done }: { num: number; done: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
      {done ? <Check className="h-4 w-4" /> : num}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required = true }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-shadow"
      />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ReservationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600" />
      </div>
    }>
      <ReservationContent />
    </Suspense>
  );
}
