'use client';

import { useState } from 'react';
import { ArrowRight, MapPin, Building2, Home, Users } from 'lucide-react';

interface PropertyInfoProps {
  project: any;
  reservationData: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function PropertyInfo({ project, reservationData, updateData, onNext }: PropertyInfoProps) {
  const [selectedUnit, setSelectedUnit] = useState<number | null>(reservationData.unitNumber);

  const handleNext = () => {
    updateData({
      unitNumber: selectedUnit
    });
    onNext();
  };

  const availableUnits = project.details?.unitDetails?.filter((unit: any) => 
    unit.status === 'beschikbaar'
  ) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Selecteer uw {project.slug.includes('opslagbox') ? 'opslagbox' : 'bedrijfsunit'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Kies de unit die het beste bij uw behoeften past
          </p>
        </div>

        {/* Mobile-Optimized Property Overview */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-sm sm:text-base">{project.location}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Beschikbare Units</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableUnits.map((unit: any) => (
              <div
                key={unit.unitNumber}
                onClick={() => setSelectedUnit(unit.unitNumber)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedUnit === unit.unitNumber
                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-900">
                    Unit {unit.unitNumber}
                  </span>
                  <div className="w-4 h-4 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                    {selectedUnit === unit.unitNumber && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Bruto oppervlak:</span>
                    <span className="font-medium">{unit.grossArea}m²</span>
                  </div>
                  {unit.netArea && (
                    <div className="flex justify-between">
                      <span>Netto oppervlak:</span>
                      <span className="font-medium">{unit.netArea}m²</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Prijs:</span>
                    <span className="font-bold text-gray-900">{unit.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* What's Next Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">
            🎯 Wat gebeurt er hierna?
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mr-3">1</div>
              <span>We vragen uw persoonlijke gegevens (account vereist)</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mr-3">2</div>
              <span>U accepteert onze algemene voorwaarden en tekent digitaal</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mr-3">3</div>
              <span>Veilige betaling via Stripe (reserveringskosten: €1.500)</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Het hele proces duurt ongeveer 5-10 minuten. U kunt op elk moment stoppen en later verdergaan.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedUnit}
            className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start reservering
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
