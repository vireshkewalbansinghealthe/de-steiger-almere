'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, FileText, Home, Clock, CreditCard } from 'lucide-react';

function ContractCompletedContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const processContractCompletion = async () => {
      try {
        const envelopeId = searchParams.get('envelopeId');
        const event = searchParams.get('event');
        
        if (!envelopeId) {
          setError('Geen contract ID gevonden');
          return;
        }

        // Check if contract was completed successfully
        if (event === 'signing_complete') {
          // TODO: Update reservation status in database
          // TODO: Send confirmation email
          // TODO: Trigger payment flow
          
          setContractData({
            envelopeId,
            status: 'completed',
            completedAt: new Date(),
          });
        } else if (event === 'decline') {
          setError('Contract werd geannuleerd');
        } else {
          // Default success case
          setContractData({
            envelopeId,
            status: 'completed',
            completedAt: new Date(),
          });
        }
        
      } catch (err) {
        console.error('Contract completion error:', err);
        setError('Er is een fout opgetreden bij het verwerken van uw contract');
      } finally {
        setLoading(false);
      }
    };

    processContractCompletion();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Contract wordt verwerkt...
          </h2>
          <p className="text-gray-600">
            Een moment geduld terwijl we uw ondertekening verwerken.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Contract Probleem
          </h2>
          <p className="text-red-600 mb-6">
            {error}
          </p>
          <Link
            href="/bedrijfsunits"
            className="inline-flex items-center bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Terug naar Units
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Contract Succesvol Ondertekend! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Gefeliciteerd! Uw koopcontract is digitaal ondertekend en rechtsgeldig geworden.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Contract ID:</strong> {contractData?.envelopeId}
            </p>
            <p className="text-sm text-green-800">
              <strong>Ondertekend op:</strong> {contractData?.completedAt?.toLocaleString('nl-NL')}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Wat gebeurt er nu?
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-yellow-500" />
                  Reserveringskosten Betalen
                </h3>
                <p className="text-gray-600 mb-3">
                  U heeft <strong>24 uur</strong> om de reserveringskosten te betalen om uw reservering te bevestigen.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    <strong>Deadline:</strong> {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('nl-NL')}
                  </p>
                </div>
                <button className="mt-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200">
                  Nu Betalen
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bevestiging & Documentatie
                </h3>
                <p className="text-gray-600">
                  Na betaling ontvangt u per e-mail:
                </p>
                <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                  <li>Ondertekend contract (PDF)</li>
                  <li>Betaalbevestiging</li>
                  <li>Contactgegevens van uw accountmanager</li>
                  <li>Tijdlijn voor de definitieve overdracht</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Definitieve Overdracht
                </h3>
                <p className="text-gray-600">
                  Binnen <strong>3 maanden</strong> wordt de definitieve overdracht via de notaris geregeld.
                  U krijgt hierover tijdig bericht.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Belangrijke Informatie
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">
                Reserveringsperiode
              </h3>
              <ul className="text-sm space-y-1">
                <li>• Geldig voor 4 weken na betaling</li>
                <li>• Automatische herinnering na 12 uur</li>
                <li>• Bij niet betalen vervalt reservering</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">
                Contact & Support
              </h3>
              <ul className="text-sm space-y-1">
                <li>• 📧 info@desteiger.nl</li>
                <li>• 📞 036-123-4567</li>
                <li>• 🕒 Ma-Vr 9:00-17:00</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/customer-portal"
            className="inline-flex items-center justify-center bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Mijn Reserveringen
          </Link>
          <Link
            href="/bedrijfsunits"
            className="inline-flex items-center justify-center bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Terug naar Units
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ContractCompletedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800" /></div>}>
      <ContractCompletedContent />
    </Suspense>
  );
}
