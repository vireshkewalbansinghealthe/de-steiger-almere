'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, Clock, User, FileText, CreditCard, Calendar, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { projects } from '@/data/projects';
import EmailVerificationModal from './EmailVerificationModal';

interface SelectedUnit {
  id: string;
  type: 'bedrijfsunit' | 'opslagbox';
  unitNumber: number;
  name: string;
  price: string;
  area: number;
  features: string[];
}

interface ReservationData {
  selectedUnits: SelectedUnit[];
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    passportNumber?: string;
  };
  contractSigned: boolean;
  signatureData?: string;
  termsAccepted: boolean;
  reservationExpiry?: Date;
}

interface EnhancedReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnit?: any;
  multiSelect?: boolean;
}

export default function EnhancedReservationModal({ 
  isOpen, 
  onClose, 
  initialUnit,
  multiSelect = false 
}: EnhancedReservationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationData>({
    selectedUnits: initialUnit ? [{
      id: initialUnit.id || `${initialUnit.type}-${initialUnit.unitNumber}`,
      type: initialUnit.type || 'bedrijfsunit',
      unitNumber: initialUnit.unitNumber,
      name: initialUnit.name || `${initialUnit.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'} ${initialUnit.unitNumber}`,
      price: initialUnit.price,
      area: initialUnit.grossArea || initialUnit.area || 0,
      features: initialUnit.features || []
    }] : [],
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Nederland'
    },
    contractSigned: false,
    termsAccepted: false
  });
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const supabase = createClient();

  const steps = [
    { id: 1, name: 'Selectie', icon: Plus, description: 'Kies uw units' },
    { id: 2, name: 'Authenticatie', icon: User, description: 'Login of registreer' },
    { id: 3, name: 'Gegevens', icon: FileText, description: 'Persoonlijke info' },
    { id: 4, name: 'Contract', icon: FileText, description: 'Digitaal contract' },
    { id: 5, name: 'Betaling', icon: CreditCard, description: 'Reservering betalen' }
  ];

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email_confirmed_at);
      
      if (event === 'SIGNED_UP' && session?.user) {
        // User just signed up, show verification modal
        setPendingUserEmail(session.user.email || '');
        setShowEmailVerification(true);
        setUser(session.user);
      } else if (event === 'SIGNED_IN' && session?.user) {
        if (session.user.email_confirmed_at) {
          // User is verified, proceed normally
          setUser(session.user);
          if (currentStep === 2) {
            setCurrentStep(3);
          }
          setShowEmailVerification(false);
        } else {
          // User exists but not verified
          setPendingUserEmail(session.user.email || '');
          setShowEmailVerification(true);
          setUser(session.user);
        }
      } else if (event === 'USER_UPDATED' && session?.user) {
        // Check if email was just confirmed
        if (session.user.email_confirmed_at) {
          setUser(session.user);
          setShowEmailVerification(false);
          if (currentStep === 2) {
            setCurrentStep(3);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowEmailVerification(false);
        setPendingUserEmail('');
      }
      
      // Handle specific auth errors
      if (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentStep, supabase]);

  // Auto-skip auth step if user is already logged in
  useEffect(() => {
    if (user && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [user, currentStep]);

  const updateReservationData = (updates: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...updates }));
  };

  const addUnit = (unit: any) => {
    const newUnit: SelectedUnit = {
      id: unit.id || `${unit.type}-${unit.unitNumber}`,
      type: unit.type || 'bedrijfsunit',
      unitNumber: unit.unitNumber,
      name: unit.name || `${unit.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'} ${unit.unitNumber}`,
      price: unit.price,
      area: unit.grossArea || unit.area || 0,
      features: unit.features || []
    };

    if (!reservationData.selectedUnits.find(u => u.id === newUnit.id)) {
      updateReservationData({
        selectedUnits: [...reservationData.selectedUnits, newUnit]
      });
    }
  };

  const removeUnit = (unitId: string) => {
    updateReservationData({
      selectedUnits: reservationData.selectedUnits.filter(u => u.id !== unitId)
    });
  };

  const calculateTotalPrice = () => {
    return reservationData.selectedUnits.reduce((total, unit) => {
      const priceStr = unit.price.replace(/[€.,\s]/g, '');
      return total + parseInt(priceStr);
    }, 0);
  };

  const calculateReservationFee = () => {
    return reservationData.selectedUnits.length * 1500; // €1,500 per unit
  };

  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Reservering - De Steiger</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-yellow-500 text-slate-900' 
                    : 'bg-slate-700 text-gray-300'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-yellow-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Unit Selection */}
          {currentStep === 1 && (
            <UnitSelectionStep
              reservationData={reservationData}
              addUnit={addUnit}
              removeUnit={removeUnit}
              multiSelect={multiSelect}
              onNext={goToNextStep}
            />
          )}

          {/* Step 2: Authentication */}
          {currentStep === 2 && (
            <AuthenticationStep
              user={user}
              onNext={goToNextStep}
              onPrev={goToPrevStep}
              authError={authError}
            />
          )}

          {/* Step 3: Customer Information */}
          {currentStep === 3 && (
            <CustomerInfoStep
              reservationData={reservationData}
              updateData={updateReservationData}
              onNext={goToNextStep}
              onPrev={goToPrevStep}
            />
          )}

          {/* Step 4: Digital Contract */}
          {currentStep === 4 && (
            <DigitalContractStep
              reservationData={reservationData}
              updateData={updateReservationData}
              onNext={goToNextStep}
              onPrev={goToPrevStep}
            />
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <PaymentStep
              reservationData={reservationData}
              totalPrice={calculateTotalPrice()}
              reservationFee={calculateReservationFee()}
              onPrev={goToPrevStep}
              onClose={onClose}
            />
          )}
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onVerified={() => {
          setShowEmailVerification(false);
          if (currentStep === 2) {
            setCurrentStep(3);
          }
        }}
        userEmail={pendingUserEmail}
      />
    </div>
  );
}

// Unit Selection Step Component
function UnitSelectionStep({ 
  reservationData, 
  addUnit, 
  removeUnit, 
  multiSelect, 
  onNext 
}: any) {
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'bedrijfsunit' | 'opslagbox'>('all');

  useEffect(() => {
    // Filter projects by type
    const bedrijfsunits = projects.filter(project => project.id.startsWith('bedrijfsunit-'));
    const opslagboxen = projects.filter(project => project.id.startsWith('opslagbox-'));
    
    // Combine all available units
    const allUnits = [
      ...bedrijfsunits.flatMap(project => 
        // For bedrijfsunits, use units property or generate units from the project data
        (project.units ? 
          Array.from({length: project.units}, (_, i) => ({
            unitNumber: i + 1,
            type: 'bedrijfsunit',
            name: project.name,
            price: project.startPrice,
            grossArea: project.details?.unitDetails?.grossArea || 100,
            features: project.features,
            projectFeatures: project.features
          })) :
          [{
            unitNumber: 1,
            type: 'bedrijfsunit',
            name: project.name,
            price: project.startPrice,
            grossArea: project.details?.unitDetails?.grossArea || 100,
            features: project.features,
            projectFeatures: project.features
          }]
        )
      ),
      ...opslagboxen.flatMap(project => 
        // For opslagboxen, use garageBoxes property or generate units from the project data
        (project.garageBoxes ?
          Array.from({length: project.garageBoxes}, (_, i) => ({
            unitNumber: i + 1,
            type: 'opslagbox',
            name: project.name,
            price: project.startPrice,
            grossArea: project.details?.unitDetails?.grossArea || 30,
            features: project.features,
            projectFeatures: project.features
          })) :
          [{
            unitNumber: 1,
            type: 'opslagbox',
            name: project.name,
            price: project.startPrice,
            grossArea: project.details?.unitDetails?.grossArea || 30,
            features: project.features,
            projectFeatures: project.features
          }]
        )
      )
    ].filter(unit => unit.status === 'beschikbaar');
    
    setAvailableUnits(allUnits);
  }, []);

  const filteredUnits = availableUnits.filter(unit => 
    filter === 'all' || unit.type === filter
  );

  const canProceed = reservationData.selectedUnits.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Selecteer uw {multiSelect ? 'units' : 'unit'}
        </h3>
        <p className="text-gray-600">
          {multiSelect 
            ? 'U kunt meerdere units tegelijk reserveren voor uw bedrijf'
            : 'Selecteer de unit die u wilt reserveren'
          }
        </p>
        {reservationData.selectedUnits.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <Clock className="h-4 w-4 inline mr-1" />
              Reservering geldig tot: {new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')} (4 weken)
            </p>
          </div>
        )}
      </div>

      {/* Selected Units */}
      {reservationData.selectedUnits.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Geselecteerde units ({reservationData.selectedUnits.length})
          </h4>
          <div className="space-y-3">
            {reservationData.selectedUnits.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-900">
                    {unit.name} - Unit {unit.unitNumber}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {unit.area}m² • {unit.price}
                  </p>
                </div>
                {multiSelect && (
                  <button
                    onClick={() => removeUnit(unit.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Filter */}
      {multiSelect && (
        <div className="flex justify-center space-x-2">
          {[
            { key: 'all', label: 'Alle units' },
            { key: 'bedrijfsunit', label: 'Bedrijfsunits' },
            { key: 'opslagbox', label: 'Opslagboxen' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === item.key
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Available Units */}
      {multiSelect && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Beschikbare units
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredUnits.map((unit) => {
              const isSelected = reservationData.selectedUnits.find(u => u.id === `${unit.type}-${unit.unitNumber}`);
              return (
                <div
                  key={`${unit.type}-${unit.unitNumber}`}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    if (!isSelected) {
                      addUnit(unit);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">
                      Unit {unit.unitNumber}
                    </h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      unit.type === 'bedrijfsunit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {unit.type === 'bedrijfsunit' ? 'Bedrijf' : 'Opslag'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {unit.grossArea || unit.area}m²
                  </p>
                  <p className="font-semibold text-gray-900">{unit.price}</p>
                  {isSelected && (
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Geselecteerd
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Doorgaan naar inloggen
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Authentication Step Component
function AuthenticationStep({ user, onNext, onPrev, authError }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const supabase = createClient();

  // Handle existing user scenarios
  const handleAuthError = (error: any) => {
    if (error?.message?.includes('already registered')) {
      setLocalError('Dit e-mailadres is al geregistreerd. Probeer in te loggen.');
    } else if (error?.message?.includes('Invalid login credentials')) {
      setLocalError('Ongeldige inloggegevens. Controleer uw e-mail en wachtwoord.');
    } else if (error?.message?.includes('Email not confirmed')) {
      setLocalError('E-mail nog niet geverifieerd. Controleer uw inbox.');
    } else {
      setLocalError(error?.message || 'Er is een fout opgetreden bij het inloggen.');
    }
  };

  if (user) {
    const isVerified = user.email_confirmed_at;
    
    return (
      <div className="text-center space-y-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          isVerified ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          {isVerified ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <Mail className="h-8 w-8 text-yellow-600" />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isVerified ? 'Welkom terug!' : 'Bijna klaar!'}
          </h3>
          <p className="text-gray-600 mb-2">
            U bent ingelogd als: <strong>{user.email}</strong>
          </p>
          {!isVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                We controleren automatisch uw e-mailverificatie. U kunt alvast doorgaan met het invullen van uw gegevens.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium px-6 py-3 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Vorige stap
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200"
          >
            Doorgaan
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Inloggen of Registreren
        </h3>
        <p className="text-gray-600">
          Log in met uw bestaande account of maak een nieuw account aan
        </p>
      </div>

      {/* Error Messages */}
      {(localError || authError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">
              {localError || authError}
            </p>
          </div>
        </div>
      )}

      {/* Info about existing users */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">
              Heeft u al een account?
            </p>
            <p className="text-blue-700 text-xs">
              Gebruik de "Inloggen" tab hieronder. Voor nieuwe accounts gebruikt u "Registreren".
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading && (
          <div className="text-center mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Even geduld...</p>
          </div>
        )}
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#eab308',
                  brandAccent: '#ca8a04',
                },
              },
            },
            className: {
              button: 'auth-button',
              input: 'auth-input',
              label: 'auth-label',
            }
          }}
          providers={['google', 'apple']}
          redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
          showLinks={true}
          localization={{
            variables: {
              sign_up: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Registreren',
                loading_button_label: 'Registreren...',
                social_provider_text: 'Registreren met {{provider}}',
                link_text: 'Nog geen account? Registreer hier',
                confirmation_text: 'Controleer uw e-mail voor de verificatielink'
              },
              sign_in: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Inloggen',
                loading_button_label: 'Inloggen...',
                social_provider_text: 'Inloggen met {{provider}}',
                link_text: 'Heeft u al een account? Log hier in'
              }
            }
          }}
          onlyThirdPartyProviders={false}
        />
      </div>

      <div className="flex justify-start">
        <button
          onClick={onPrev}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium px-6 py-3 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Vorige stap
        </button>
      </div>
    </div>
  );
}

// Customer Info Step Component
function CustomerInfoStep({ reservationData, updateData, onNext, onPrev }: any) {
  const [formData, setFormData] = useState(reservationData.customerInfo);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'Dit veld is verplicht';
      }
    });

    // Email validation
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    // Phone validation
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Ongeldig telefoonnummer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateData({ customerInfo: formData });
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Uw contactgegevens
        </h3>
        <p className="text-gray-600">
          Deze gegevens worden gebruikt voor uw contract en communicatie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voornaam *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Uw voornaam"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Achternaam *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Uw achternaam"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mailadres *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="uw.email@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefoonnummer *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+31 6 12345678"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrijfsnaam (optioneel)
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Uw bedrijfsnaam"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adres *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Straatnaam en huisnummer"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postcode *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1234 AB"
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plaats *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Uw woonplaats"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paspoort/ID nummer
          </label>
          <input
            type="text"
            name="passportNumber"
            value={formData.passportNumber || ''}
            onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Voor identiteitsverificatie"
          />
        </div>
      </div>

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
          className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200"
        >
          Doorgaan naar contract
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Digital Contract Step Component
function DigitalContractStep({ reservationData, updateData, onNext, onPrev }: any) {
  const [contractGenerated, setContractGenerated] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContract = () => {
    setLoading(true);
    // Simulate contract generation
    setTimeout(() => {
      setContractGenerated(true);
      setLoading(false);
    }, 2000);
  };

  const sendToDocuSign = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would integrate with DocuSign API
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateData({ 
        contractSigned: true, 
        signatureData,
        termsAccepted: true 
      });
      onNext();
    } catch (error) {
      console.error('DocuSign integration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('nl-NL');
  const totalPrice = reservationData.selectedUnits.reduce((total, unit) => {
    const priceStr = unit.price.replace(/[€.,\s]/g, '');
    return total + parseInt(priceStr);
  }, 0);
  
  const contractPreview = `
═══════════════════════════════════════════════════════════
                    KOOPOVEREENKOMST
                   DE STEIGER B.V.
═══════════════════════════════════════════════════════════

CONTRACTPARTIJEN:

VERKOPER:
De Steiger B.V.
De Steiger 74/77
1234 AB Almere  
KvK: 12345678
BTW: NL123456789B01

KOPER:
Naam: ${reservationData.customerInfo.firstName} ${reservationData.customerInfo.lastName}
${reservationData.customerInfo.company ? `Bedrijf: ${reservationData.customerInfo.company}` : 'Particuliere aankoop'}
Adres: ${reservationData.customerInfo.address}
       ${reservationData.customerInfo.postalCode} ${reservationData.customerInfo.city}
       ${reservationData.customerInfo.country}

E-mail: ${reservationData.customerInfo.email}
Telefoon: ${reservationData.customerInfo.phone}
${reservationData.customerInfo.passportNumber ? `ID-nummer: ${reservationData.customerInfo.passportNumber}` : ''}

═══════════════════════════════════════════════════════════

ARTIKEL 1 - VERKOCHTE OBJECTEN

Hierbij wordt verkocht op De Steiger 74/77, Almere:

${reservationData.selectedUnits.map(unit => `
• ${unit.name} - Unit ${unit.unitNumber}
  Type: ${unit.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox'}
  Oppervlakte: ${unit.area}m²
  Koopprijs: ${unit.price}
  Kenmerken: ${unit.features.join(', ')}
`).join('')}

ARTIKEL 2 - FINANCIËLE BEPALINGEN

Totale koopprijs: € ${totalPrice.toLocaleString('nl-NL')} (exclusief BTW)
BTW (21%): € ${Math.round(totalPrice * 0.21).toLocaleString('nl-NL')}
TOTAAL INCLUSIEF BTW: € ${Math.round(totalPrice * 1.21).toLocaleString('nl-NL')}

ARTIKEL 3 - BETALINGSREGELING

1. Reserveringssom: € ${(reservationData.selectedUnits.length * 1500).toLocaleString('nl-NL')}
   (Te betalen binnen 24 uur na ondertekening)

2. Restbedrag: € ${(Math.round(totalPrice * 1.21) - (reservationData.selectedUnits.length * 1500)).toLocaleString('nl-NL')}
   (Te betalen binnen 3 maanden na reservering)

3. Bij niet tijdige betaling vervalt de reservering automatisch

ARTIKEL 4 - BEOOGD GEBRUIK

Gebruik conform bestemming: ${reservationData.customerInfo.intendedUse || 'Bedrijfsmatige activiteiten/opslag'}

Bijzondere wensen koper:
${reservationData.customerInfo.additionalRequests || 'Geen bijzondere wensen opgegeven'}

ARTIKEL 5 - LEVERING & OVERDRACHT

• Oplevering: Na volledige betaling en notariële overdracht
• Staat: Nieuwbouw conform specificaties
• Energielabel: A+
• Parkeerplaatsen: 2 stuks per bedrijfsunit inbegrepen

ARTIKEL 6 - GARANTIES & AANSPRAKELIJKHEID

• Garantie conform BRL 9100 standaard
• 10 jaar garantie op constructie
• 2 jaar garantie op afwerking
• Conformiteit met bouwvergunning

ARTIKEL 7 - JURIDISCHE BEPALINGEN

• Nederlands recht is van toepassing
• Rechtbank Amsterdam is bevoegd
• Eigendomsvoorbehoud tot volledige betaling
• Contract geldt onder ontbindende voorwaarde van financiering

═══════════════════════════════════════════════════════════

ONDERTEKENING

Door ondertekening verklaren partijen akkoord te gaan met alle bovenstaande voorwaarden.

Datum: ${currentDate}
Plaats: Almere

KOPER:                              VERKOPER:
${reservationData.customerInfo.firstName} ${reservationData.customerInfo.lastName}                    De Steiger B.V.

_________________________          _________________________
Handtekening                        Handtekening


Dit contract wordt digitaal ondertekend via DocuSign.
  `;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Digitaal Contract
        </h3>
        <p className="text-gray-600">
          Bekijk en onderteken uw koopcontract digitaal via DocuSign
        </p>
      </div>

      {!contractGenerated ? (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8">
            <FileText className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Contract Genereren
            </h4>
            <p className="text-gray-600 mb-6">
              We genereren uw persoonlijke koopcontract op basis van uw gegevens en geselecteerde units.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-6">
              <h5 className="font-medium text-gray-900 mb-3">Contract Details:</h5>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Aantal units:</span>
                  <span>{reservationData.selectedUnits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Totale koopprijs:</span>
                  <span>€{reservationData.selectedUnits.reduce((total, unit) => {
                    const priceStr = unit.price.replace(/[€.,\s]/g, '');
                    return total + parseInt(priceStr);
                  }, 0).toLocaleString('nl-NL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Koper:</span>
                  <span>{reservationData.customerInfo.firstName} {reservationData.customerInfo.lastName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={generateContract}
              disabled={loading}
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Contract genereren...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Contract Genereren
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Contract Preview */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Uw Koopcontract
                  </h4>
                  <p className="text-sm text-gray-600">
                    Lees het contract zorgvuldig door voordat u ondertekent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowContractModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
              >
                Volledig bekijken
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 max-h-96 overflow-y-auto border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line font-mono">
                {contractPreview}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Let op: Contract controleren
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Controleer alle gegevens zorgvuldig. Na ondertekening is dit contract juridisch bindend.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DocuSign Integration */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-900">
                  Digitale Ondertekening via DocuSign
                </h4>
                <p className="text-sm text-green-700">
                  Veilig en juridisch bindend ondertekenen
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Contract volledig lezen</p>
                  <p className="text-xs text-green-700">Lees alle voorwaarden zorgvuldig door</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Digitaal ondertekenen</p>
                  <p className="text-xs text-green-700">DocuSign stuurt u een beveiligde link</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Contract bevestiging</p>
                  <p className="text-xs text-green-700">U ontvangt een ondertekende kopie per e-mail</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="contractRead"
                  checked={hasReadContract}
                  onChange={(e) => setHasReadContract(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="contractRead" className="text-sm text-green-900">
                  Ik heb het contract volledig gelezen en ga akkoord met alle voorwaarden
                </label>
              </div>

              <button
                onClick={sendToDocuSign}
                disabled={!hasReadContract || loading}
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Voorbereiden voor DocuSign...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Ondertekenen via DocuSign
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium px-6 py-3 transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Vorige stap
            </button>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Koopcontract - De Steiger B.V.
              </h3>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line leading-relaxed font-mono text-sm">
                  {contractPreview}
                </div>
              </div>
            </div>
            
            <div className="border-t p-6 flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-600">
                <span>Dit contract wordt gegenereerd op basis van uw gegevens</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Sluiten
                </button>
                <button
                  onClick={() => {
                    setHasReadContract(true);
                    setShowContractModal(false);
                  }}
                  className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Gelezen & Akkoord
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Payment Step Component
function PaymentStep({ reservationData, totalPrice, reservationFee, onPrev, onClose }: any) {
  const [paymentMethod, setPaymentMethod] = useState('ideal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSuccess(true);
      
      // Set expiry date (4 weeks from now)
      const expiryDate = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
      
      // Schedule reminder email (12 hours from now)
      setTimeout(() => {
        console.log('Reminder email would be sent');
      }, 12 * 60 * 60 * 1000);
      
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Reservering Succesvol!
          </h3>
          <p className="text-gray-600 mb-4">
            Uw reservering is bevestigd. U heeft 3 maanden de tijd om de volledige koopsom te betalen.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <Calendar className="h-4 w-4 inline mr-1" />
              Reservering geldig tot: {new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Reservering Bevestigen
        </h3>
        <p className="text-gray-600">
          Betaal de reserveringskosten om uw units 4 weken te reserveren
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Reservering Overzicht
        </h4>
        <div className="space-y-3">
          {reservationData.selectedUnits.map((unit: any) => (
            <div key={unit.id} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {unit.name} Unit {unit.unitNumber} ({unit.area}m²)
              </span>
              <span className="font-medium text-gray-900">{unit.price}</span>
            </div>
          ))}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Totale koopprijs:</span>
              <span className="font-medium">€{totalPrice.toLocaleString('nl-NL')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Reserveringskosten (nu te betalen):</span>
              <span className="text-green-600">€{reservationFee.toLocaleString('nl-NL')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Betaalmethode
        </h4>
        <div className="space-y-3">
          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="ideal"
              checked={paymentMethod === 'ideal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3 flex items-center">
              <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">iD</span>
              </div>
              <span className="font-medium text-gray-900">iDEAL</span>
            </div>
          </label>
          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
            <input
              type="radio"
              name="paymentMethod"
              value="bancontact"
              disabled
              className="h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3 flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Bancontact (Binnenkort beschikbaar)</span>
            </div>
          </label>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-yellow-900 mb-2">
          Belangrijke Informatie
        </h4>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• U heeft 24 uur om de reserveringskosten te betalen</li>
          <li>• Na betaling heeft u 4 weken om de financiering rond te maken</li>
          <li>• Indien niet binnen 4 weken betaald, vervalt de reservering automatisch</li>
          <li>• U ontvangt na 12 uur een herinneringsmail indien nog niet betaald</li>
          <li>• Het resterende bedrag moet binnen 3 maanden via de notaris worden afgehandeld</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium px-6 py-3 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Vorige stap
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Bezig met betalen...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Betaal €{reservationFee.toLocaleString('nl-NL')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
