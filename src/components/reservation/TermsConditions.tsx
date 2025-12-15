'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, FileText, Check, X, Scroll } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import ContractView from './ContractView';

interface TermsConditionsProps {
  reservationData: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  project?: any;
}

export default function TermsConditions({ reservationData, updateData, onNext, onPrev, project }: TermsConditionsProps) {
  const [showContractModal, setShowContractModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(reservationData.termsAccepted || false);
  const [signatureData, setSignatureData] = useState(reservationData.signatureData || '');
  const [hasReadContract, setHasReadContract] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (reservationData.unitNumber && project) {
        try {
          const type = project.slug.includes('opslagbox') ? 'opslagbox' : 'bedrijfsunit';
          const response = await fetch(`/api/units?type=${type}&unit_number=${reservationData.unitNumber}`);
          if (response.ok) {
            const data = await response.json();
            if (data.units && data.units.length > 0) {
              setPropertyData(data.units[0]);
            }
          }
        } catch (error) {
          console.error('Error fetching property data:', error);
        }
    }
  };
    fetchPropertyData();
  }, [reservationData.unitNumber, project]);

  // Not needed anymore as ContractView handles this internally

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

  const isValid = termsAccepted && signatureData && hasReadContract;

  // Contract content is now handled by ContractView component

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Reserveringsovereenkomst
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Lees en onderteken de reserveringsovereenkomst om door te gaan
          </p>
        </div>

        {/* Contract Preview */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" />
              <span className="truncate">Reserveringsovereenkomst {propertyData?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}</span>
            </h3>
            <button
              onClick={() => setShowContractModal(true)}
              className="inline-flex items-center justify-center text-yellow-600 hover:text-yellow-700 font-medium text-sm bg-yellow-50 px-3 py-2 rounded-lg sm:bg-transparent sm:px-0 sm:py-0"
            >
              <Scroll className="h-4 w-4 mr-1" />
              Volledig lezen
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 max-h-32 overflow-hidden relative">
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold mb-2">RESERVERINGSOVEREENKOMST {propertyData?.type === 'bedrijfsunit' ? 'BEDRIJFSUNIT' : 'OPSLAGBOX'}</p>
              <p className="mb-1">Unit nummer: {reservationData.unitNumber || '[unit nummer]'}</p>
              <p className="mb-1">Gegadigde: {reservationData.customerInfo?.firstName} {reservationData.customerInfo?.lastName}</p>
              <p className="mb-1">Koopprijs: €{propertyData?.sale_price?.toLocaleString() || '[bedrag]'}</p>
              <p>Reserveringskosten: €1.500,00</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>

        {/* Contract Acceptance */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => setTermsAccepted(!termsAccepted)}
              className={`flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                termsAccepted 
                  ? 'bg-yellow-500 border-yellow-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {termsAccepted && <Check className="h-4 w-4 sm:h-3 sm:w-3" />}
            </button>
            <div className="flex-1 min-w-0">
              <label className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                Ik ga akkoord met de{' '}
                <button
                  onClick={() => setShowContractModal(true)}
                  className="text-yellow-600 hover:text-yellow-700 underline"
                >
                  reserveringsovereenkomst
                </button>
                {' '}van De Steiger B.V. en bevestig dat ik deze volledig heb gelezen en begrepen.
              </label>
              {!hasReadContract && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ U moet eerst het volledige contract lezen voordat u kunt doorgaan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Digital Signature */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
            Digitale handtekening
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Plaats uw handtekening hieronder om de overeenkomst te bevestigen.
          </p>
          
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4">
            <div className="w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                  className: 'signature-canvas w-full border rounded touch-none',
                  style: { 
                    width: '100%', 
                    height: '150px',
                    maxWidth: '100%',
                    touchAction: 'none'
                  }
              }}
              onEnd={saveSignature}
            />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-gray-500">
                👆 Teken met uw vinger of muis
              </span>
              <button
                onClick={clearSignature}
                className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                <X className="h-4 w-4 mr-1" />
                Wissen
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
          <button
            onClick={onPrev}
            className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800 font-medium px-4 sm:px-6 py-3 transition-colors border border-gray-200 rounded-lg sm:border-0"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Vorige stap
          </button>

          <button
            onClick={handleNext}
            disabled={!isValid}
            className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-6 sm:px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <span className="sm:hidden">Naar betaling</span>
            <span className="hidden sm:inline">Doorgaan naar betaling</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contract Modal */}
      {showContractModal && propertyData && (
        <ContractView
          reservationData={reservationData}
          propertyData={propertyData}
          onClose={() => {
            setShowContractModal(false);
            setHasReadContract(true); // Mark as read when they close the contract
          }}
        />
      )}
    </div>
  );
}
