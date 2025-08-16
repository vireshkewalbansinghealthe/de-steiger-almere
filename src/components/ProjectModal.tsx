'use client';

import { useState } from 'react';
import { Project } from '@/types';
import { X, MapPin, Home, Car, Calendar, Building, Leaf, Shield, Zap, Mail } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
      onClose();
    }, 3000);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'NU IN DE VERKOOP':
        return 'status-nu-in-verkoop';
      case 'COMING SOON':
        return 'status-coming-soon';
      case 'UITVERKOCHT':
        return 'status-uitverkocht';
      case 'NOG ÉÉN UNIT BESCHIKBAAR!':
        return 'status-nog-een-unit';
      case 'FASE II NU IN DE VERKOOP':
        return 'status-fase-2';
      case 'LAATSTE UNITS IN DE VERKOOP':
        return 'status-laatste-units';
      default:
        return 'status-nu-in-verkoop';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <Building className="h-24 w-24 text-slate-600" />
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`unity-status-badge ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
              </div>

              {/* Percentage Sold */}
              {project.percentageSold && (
                <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-2 py-1">
                  <span className="text-xs font-bold text-gray-700">
                    {project.percentageSold}% Verkocht
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {project.percentageSold && (
              <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                <div 
                  className={`h-2 rounded-full ${
                    project.percentageSold >= 90 ? 'bg-red-500' : 
                    project.percentageSold >= 70 ? 'bg-orange-500' : 
                    project.percentageSold >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${project.percentageSold}%` }}
                />
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{project.location}</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Price */}
            {project.startPrice && (
              <div className="mb-6">
                <span className="text-2xl font-bold text-slate-800">
                  {project.startPrice}
                </span>
              </div>
            )}

            {/* Unit Details Table (for bedrijfsunit types) */}
            {project.details?.unitDetails && project.details.unitDetails.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Beschikbare Units</h4>
                <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Unit</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Totaal Netto</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Industrie</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Kantoor</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Prijs</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.details.unitDetails.map((unit, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-white">
                            <td className="py-3 px-3 font-medium text-gray-900">#{unit.unitNumber}</td>
                            <td className="py-3 px-3 text-gray-700">{unit.netArea}m²</td>
                            <td className="py-3 px-3 text-gray-600 text-xs">
                              {unit.industrieNetto ? (
                                <div>
                                  <div>{unit.industrieNetto}m² netto</div>
                                  <div className="text-gray-500">{unit.industrieBruto}m² bruto</div>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="py-3 px-3 text-gray-600 text-xs">
                              {unit.kantoorNetto ? (
                                <div>
                                  <div>{unit.kantoorNetto}m² netto</div>
                                  <div className="text-gray-500">{unit.kantoorBruto}m² bruto</div>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="py-3 px-3 text-gray-900 font-medium">{unit.price}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                unit.status === 'beschikbaar' 
                                  ? 'bg-green-100 text-green-800'
                                  : unit.status === 'gereserveerd'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {unit.status === 'beschikbaar' ? 'Beschikbaar' : 
                                 unit.status === 'gereserveerd' ? 'Gereserveerd' : 'Verkocht'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>

          {/* Project Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Key Information */}
            <div>
              <h3 className="text-xl font-bold mb-4">Projectinformatie</h3>
              <div className="space-y-3">
                {project.units > 0 && (
                  <div className="flex items-center">
                    <Home className="h-5 w-5 mr-3 text-slate-800" />
                    <span>{project.units} bedrijfsunits</span>
                  </div>
                )}
                
                {project.parkingSpaces && (
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-3 text-slate-800" />
                    <span>{project.parkingSpaces} parkeerplaatsen</span>
                  </div>
                )}

                {project.garageBoxes && (
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-3 text-slate-800" />
                    <span>{project.garageBoxes} garageboxen</span>
                  </div>
                )}

                {project.buildingStart && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-slate-800" />
                    <span>Bouwstart {project.buildingStart}</span>
                  </div>
                )}

                {project.phase && (
                  <div className="flex items-center">
                    <span className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {project.phase}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-bold mb-4">Kenmerken</h3>
              <div className="space-y-3">
                {project.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {project.details && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Details</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Leaf className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">Duurzaamheid</h4>
                  </div>
                  <p className="text-sm text-green-700">{project.details.sustainability}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-slate-800 mr-2" />
                    <h4 className="font-semibold text-slate-800">Bereikbaarheid</h4>
                  </div>
                  <p className="text-sm text-slate-700">{project.details.accessibility}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-800">Faciliteiten</h4>
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {project.details?.facilities?.map((facility, index) => (
                      <li key={index}>• {facility}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Reservation CTA */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">
              Interesse in {project.name}?
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Start je reservering nu of schrijf je in voor updates!
            </p>
            
            {/* Reservation Button */}
            <div className="text-center mb-4">
              <a
                href={`/reserveren/${project.slug}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-lg"
              >
                Reserveer Nu
              </a>
            </div>

            {isSubmitted ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">Bedankt voor je aanmelding!</h4>
                <p className="text-green-600">Je ontvangt binnenkort meer informatie over dit project.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Je e-mailadres"
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="unity-btn-primary whitespace-nowrap disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Bezig...
                      </div>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Inschrijven
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 