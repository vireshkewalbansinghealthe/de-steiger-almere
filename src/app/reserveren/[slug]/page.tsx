'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Building2, MapPin, User, CreditCard, FileText, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { projects } from '../../../data/projects';

// Step components
import PropertyInfo from '../../../components/reservation/PropertyInfo';
import CustomerInfo from '../../../components/reservation/CustomerInfo';
import TermsConditions from '../../../components/reservation/TermsConditions';
import PaymentStep from '../../../components/reservation/PaymentStep';

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authData, setAuthData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [reservationData, setReservationData] = useState({
    propertySlug: slug,
    unitNumber: null as number | null,
    customerInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
      company: '',
    address: '',
    city: '',
    postalCode: '',
      country: 'Nederland'
    },
    preferences: {
      moveInDate: '',
      duration: '12',
      additionalRequests: ''
    },
    termsAccepted: false,
    signatureData: '',
    paymentIntentId: ''
  });

  const project = projects.find(p => p.slug === slug);

  const steps = [
    { id: 1, title: 'Eigendom Info', icon: Building2, description: 'Bekijk eigendom details' },
    { id: 2, title: 'Uw Gegevens', icon: User, description: 'Persoonlijke informatie' },
    { id: 3, title: 'Voorwaarden', icon: FileText, description: 'Algemene voorwaarden' },
    { id: 4, title: 'Betaling', icon: CreditCard, description: 'Veilige betaling' }
  ];

  const authStep = { id: 1.5, title: 'Account', icon: User, description: 'Inloggen of registreren' };

  useEffect(() => {
    checkUser();
    
    // Check for unit parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitParam = urlParams.get('unit');
    if (unitParam) {
      const unitNumber = parseInt(unitParam, 10);
      if (!isNaN(unitNumber)) {
        setReservationData(prev => ({
          ...prev,
          unitNumber: unitNumber
        }));
      }
    }
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Only pre-fill data if user is logged in
    if (user) {
      setReservationData(prev => ({
              ...prev,
        customerInfo: {
          ...prev.customerInfo,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        }
      }));
    }
  };

  const handleStepChange = (targetStep: number) => {
    // If trying to go to step 2 or beyond without being logged in, go to auth step first
    if (targetStep >= 2 && !user) {
      setCurrentStep(1.5);
      return;
    }
    setCurrentStep(targetStep);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      handleStepChange(2); // This will go to 1.5 if not logged in, or 2 if logged in
    } else if (currentStep === 1.5) {
      // This is handled by the auth form submission
      return;
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1); // Skip the auth step when going back
    } else if (currentStep === 1.5) {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateReservationData = (data: any) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
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
            data: {
              first_name: authData.firstName,
              last_name: authData.lastName,
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.user.email_confirmed_at) {
          setAuthError('Controleer uw e-mail voor verificatie voordat u doorgaat.');
        } else {
          setUser(data.user);
          setCurrentStep(2);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (error) throw error;

        setUser(data.user);
        setCurrentStep(2);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Er is een fout opgetreden');
    } finally {
      setAuthLoading(false);
    }
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthError('');
    setAuthData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Eigendom niet gevonden</h1>
          <Link href="/" className="text-yellow-600 hover:text-yellow-700">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  // Handle URL step parameter for returning users after login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam && user) {
      const targetStep = parseInt(stepParam, 10);
      if (targetStep >= 1 && targetStep <= steps.length) {
        setCurrentStep(targetStep);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-16 sm:pt-20">
      {/* Mobile-Optimized Reservation Info Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-16 sm:top-20 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link 
                href={`/${project.slug.includes('opslagbox') ? 'opslagbox' : 'bedrijfsunit'}/${slug}`}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-2 sm:mr-4 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium">Terug</span>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  <span className="hidden sm:inline">Reservering - </span>{project.name}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center ml-2 flex-shrink-0">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {currentStep}/{steps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Mobile: Simplified horizontal progress */}
          <div className="sm:hidden py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">Voortgang</span>
              <span className="text-xs font-medium text-yellow-600">{Math.round((currentStep / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id || (currentStep === 1.5 && step.id === 2);
                const isCompleted = currentStep > step.id && !(currentStep === 1.5 && step.id === 2);
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 text-white' 
                        : isActive 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : step.id}
                    </div>
                    <span className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                      isActive ? 'text-yellow-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop: Full progress bar */}
          <div className="hidden sm:flex items-center justify-between py-6">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id || (currentStep === 1.5 && step.id === 2);
              const isCompleted = currentStep > step.id && !(currentStep === 1.5 && step.id === 2);
              const IconComponent = step.icon;
                  
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                        ? 'bg-yellow-500 border-yellow-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        isActive ? 'text-yellow-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400">{step.description}</div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-1 rounded-full transition-all duration-500 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          <div className="min-h-[400px] sm:min-h-[600px]">
            {/* Step Content with Smooth Transitions */}
            <div className="transition-all duration-500 ease-in-out">
          {currentStep === 1 && (
                <PropertyInfo 
                  project={project}
                  reservationData={reservationData}
                  updateData={updateReservationData}
                  onNext={nextStep}
                />
              )}
              
              {currentStep === 1.5 && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-6 sm:mb-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {authMode === 'register' ? 'Account aanmaken' : 'Inloggen'}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 px-2">
                        {authMode === 'register' 
                          ? 'Maak een account aan om door te gaan met uw reservering'
                          : 'Log in om door te gaan met uw reservering'
                        }
                      </p>
                    </div>

                    {authError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {authError}
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      {authMode === 'register' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Voornaam
                            </label>
                            <input
                              type="text"
                              required
                              value={authData.firstName}
                              onChange={(e) => setAuthData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                              placeholder="Uw voornaam"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Achternaam
                            </label>
                            <input
                              type="text"
                              required
                              value={authData.lastName}
                              onChange={(e) => setAuthData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                              placeholder="Uw achternaam"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-mailadres
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            required
                            value={authData.email}
                            onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="uw@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wachtwoord
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={authData.password}
                            onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Uw wachtwoord"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {authMode === 'register' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wachtwoord bevestigen
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={authData.confirmPassword}
                              onChange={(e) => setAuthData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                              placeholder="Bevestig uw wachtwoord"
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-4">
                          {authMode === 'register' ? 'Heeft u al een account?' : 'Nog geen account?'}
                          <button
                            type="button"
                            onClick={switchAuthMode}
                            className="ml-1 text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            {authMode === 'register' ? 'Inloggen' : 'Account aanmaken'}
                          </button>
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          Terug
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50"
                        >
                          {authLoading ? 'Bezig...' : (authMode === 'register' ? 'Account aanmaken' : 'Inloggen')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <CustomerInfo
                  reservationData={reservationData}
                  updateData={updateReservationData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              
              {currentStep === 3 && (
                <TermsConditions
                  reservationData={reservationData}
                  updateData={updateReservationData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              
              {currentStep === 4 && (
                <PaymentStep
                  project={project}
                  reservationData={reservationData}
                  updateData={updateReservationData}
                  onPrev={prevStep}
                />
              )}
              </div>
            </div>
        </div>
      </div>


    </div>
  );
}
