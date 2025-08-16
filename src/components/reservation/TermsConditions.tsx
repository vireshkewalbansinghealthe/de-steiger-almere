'use client';

import { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, FileText, Check, X, Scroll } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface TermsConditionsProps {
  reservationData: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function TermsConditions({ reservationData, updateData, onNext, onPrev }: TermsConditionsProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(reservationData.termsAccepted || false);
  const [signatureData, setSignatureData] = useState(reservationData.signatureData || '');
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasReadTerms(true);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData('');
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const signature = sigCanvas.current.toDataURL();
      setSignatureData(signature);
    }
  };

  const handleNext = () => {
    updateData({
      termsAccepted,
      signatureData
    });
    onNext();
  };

  const isValid = termsAccepted && signatureData && hasReadTerms;

  const termsContent = `
ALGEMENE VOORWAARDEN DE STEIGER

Artikel 1 - Definities
In deze algemene voorwaarden wordt verstaan onder:
- Verhuurder: De Steiger B.V., gevestigd te Almere
- Huurder: De natuurlijke of rechtspersoon die een huurovereenkomst aangaat
- Bedrijfsunit: De te verhuren bedrijfsruimte inclusief bijbehorende faciliteiten
- Opslagbox: De te verhuren opslagruimte

Artikel 2 - Toepasselijkheid
Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, overeenkomsten en leveringen van De Steiger B.V.

Artikel 3 - Huurprijs en betalingsvoorwaarden
3.1 De huurprijs is exclusief BTW, tenzij anders vermeld
3.2 Betaling dient plaats te vinden binnen 30 dagen na factuurdatum
3.3 Bij laattijdige betaling zijn wij gerechtigd rente te berekenen

Artikel 4 - Huurperiode
4.1 De huurovereenkomst wordt aangegaan voor de overeengekomen periode
4.2 Verlenging is mogelijk na overleg met de verhuurder
4.3 Opzegging dient schriftelijk te geschieden met inachtneming van de opzegtermijn

Artikel 5 - Gebruik van de ruimte
5.1 De huurder dient de ruimte te gebruiken conform de bestemming
5.2 Onderverhuur is niet toegestaan zonder schriftelijke toestemming
5.3 De huurder is verantwoordelijk voor schade door eigen toedoen

Artikel 6 - Onderhoud en reparaties
6.1 Klein onderhoud is voor rekening van de huurder
6.2 Groot onderhoud wordt verzorgd door de verhuurder
6.3 Reparaties als gevolg van verkeerd gebruik zijn voor rekening van de huurder

Artikel 7 - Beëindiging
7.1 Bij beëindiging dient de ruimte in goede staat te worden opgeleverd
7.2 Eventuele achterstanden dienen te zijn voldaan
7.3 De borg wordt binnen 30 dagen na oplevering teruggestort

Artikel 8 - Aansprakelijkheid
8.1 De verhuurder is niet aansprakelijk voor schade aan eigendommen van de huurder
8.2 De huurder vrijwaart de verhuurder voor claims van derden
8.3 Aansprakelijkheid is beperkt tot het bedrag dat door verzekeringen wordt uitgekeerd

Artikel 9 - Geschillen
9.1 Op alle overeenkomsten is Nederlands recht van toepassing
9.2 Geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam
9.3 Partijen zullen eerst trachten geschillen in onderling overleg op te lossen

Artikel 10 - Slotbepalingen
10.1 Wijzigingen zijn alleen geldig indien schriftelijk overeengekomen
10.2 Nietigheid van een bepaling tast de geldigheid van overige bepalingen niet aan
10.3 Deze voorwaarden zijn gedeponeerd bij de Kamer van Koophandel

Door ondertekening bevestigt u akkoord te gaan met bovenstaande voorwaarden.
  `;

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Algemene voorwaarden
          </h2>
          <p className="text-gray-600">
            Lees en accepteer onze algemene voorwaarden om door te gaan
          </p>
        </div>

        {/* Terms Preview */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-500" />
              Algemene voorwaarden
            </h3>
            <button
              onClick={() => setShowTermsModal(true)}
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium text-sm"
            >
              <Scroll className="h-4 w-4 mr-1" />
              Volledig lezen
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 max-h-32 overflow-hidden relative">
            <div className="text-sm text-gray-600 leading-relaxed">
              {termsContent.substring(0, 300)}...
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => setTermsAccepted(!termsAccepted)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                termsAccepted 
                  ? 'bg-yellow-500 border-yellow-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {termsAccepted && <Check className="h-3 w-3" />}
            </button>
            <div className="flex-1">
              <label className="text-sm text-gray-700 cursor-pointer">
                Ik ga akkoord met de{' '}
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-yellow-600 hover:text-yellow-700 underline"
                >
                  algemene voorwaarden
                </button>
                {' '}van De Steiger B.V. en bevestig dat ik deze volledig heb gelezen en begrepen.
              </label>
              {!hasReadTerms && (
                <p className="text-xs text-amber-600 mt-1">
                  U moet eerst de volledige voorwaarden lezen voordat u kunt doorgaan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Digital Signature */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Digitale handtekening
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Plaats uw handtekening hieronder om de overeenkomst te bevestigen.
          </p>
          
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas w-full h-48 border rounded'
              }}
              onEnd={saveSignature}
            />
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                Teken hierboven met uw muis of vinger
              </span>
              <button
                onClick={clearSignature}
                className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                <X className="h-4 w-4 mr-1" />
                Wissen
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium px-6 py-3 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Vorige stap
          </button>

          <button
            onClick={handleNext}
            disabled={!isValid}
            className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Doorgaan naar betaling
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Algemene voorwaarden - De Steiger B.V.
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div 
              className="flex-1 overflow-y-auto p-6"
              onScroll={handleTermsScroll}
            >
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {termsContent}
              </div>
            </div>
            
            <div className="border-t p-6 flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-600">
                {hasReadTerms ? (
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Volledig gelezen
                  </div>
                ) : (
                  <span>Scroll naar beneden om alles te lezen</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Sluiten
                </button>
                <button
                  onClick={() => {
                    if (hasReadTerms) {
                      setTermsAccepted(true);
                      setShowTermsModal(false);
                    }
                  }}
                  disabled={!hasReadTerms}
                  className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Accepteren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
