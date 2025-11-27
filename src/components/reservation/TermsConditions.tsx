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
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Reserveringsovereenkomst
          </h2>
          <p className="text-gray-600">
            Lees en onderteken de reserveringsovereenkomst om door te gaan
          </p>
        </div>

        {/* Contract Preview */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-500" />
              Reserveringsovereenkomst {propertyData?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}
            </h3>
            <button
              onClick={() => setShowContractModal(true)}
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium text-sm"
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
                  onClick={() => setShowContractModal(true)}
                  className="text-yellow-600 hover:text-yellow-700 underline"
                >
                  reserveringsovereenkomst
                </button>
                {' '}van De Steiger B.V. en bevestig dat ik deze volledig heb gelezen en begrepen.
              </label>
              {!hasReadContract && (
                <p className="text-xs text-amber-600 mt-1">
                  U moet eerst het volledige contract lezen voordat u kunt doorgaan.
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
