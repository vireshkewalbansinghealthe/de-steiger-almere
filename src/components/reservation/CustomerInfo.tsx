'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Mail, Phone, Building2, MapPin, Home } from 'lucide-react';

interface CustomerInfoProps {
  reservationData: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CustomerInfo({ reservationData, updateData, onNext, onPrev }: CustomerInfoProps) {
  const [formData, setFormData] = useState({
    firstName: reservationData.customerInfo?.firstName || '',
    lastName: reservationData.customerInfo?.lastName || '',
    email: reservationData.customerInfo?.email || '',
    phone: reservationData.customerInfo?.phone || '',
    company: reservationData.customerInfo?.company || '',
    address: reservationData.customerInfo?.address || '',
    city: reservationData.customerInfo?.city || '',
    postalCode: reservationData.customerInfo?.postalCode || '',
    country: reservationData.customerInfo?.country || 'Nederland',
    additionalRequests: reservationData.preferences?.additionalRequests || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    const { additionalRequests, ...customerInfo } = formData;
    updateData({
      customerInfo,
      preferences: {
        ...reservationData.preferences,
        additionalRequests
      }
    });
    onNext();
  };

  const isValid = formData.firstName && formData.lastName && formData.email && 
                  formData.phone && formData.address && formData.city && formData.postalCode;

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Uw contactgegevens
          </h2>
          <p className="text-gray-600">
            Vul uw gegevens in voor de reservering
          </p>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-yellow-500" />
              Persoonlijke gegevens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voornaam *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="Uw voornaam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achternaam *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="Uw achternaam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mailadres *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="uw.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefoonnummer *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="+31 6 12345678"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrijfsnaam (optioneel)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Uw bedrijfsnaam"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2 text-yellow-500" />
              Adresgegevens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="Straatnaam en huisnummer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="1234 AB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaats *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Uw woonplaats"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Additional Requests */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aanvullende wensen (optioneel)
            </h3>
            <textarea
              name="additionalRequests"
              value={formData.additionalRequests}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="Heeft u specifieke wensen of vragen over de unit? Laat het ons weten..."
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
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
            Volgende stap
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
