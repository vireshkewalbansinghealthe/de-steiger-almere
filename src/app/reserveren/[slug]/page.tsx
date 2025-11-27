'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Building2, MapPin, User, CreditCard, FileText, Eye, EyeOff, Mail, Lock, AlertCircle, Clock } from 'lucide-react';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const supabase = createClient();
  const mountedRef = useRef(true);
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = loading, will be set after checking user
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
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [paymentLockSessionId, setPaymentLockSessionId] = useState<string | null>(null);
  const [hasPaymentLock, setHasPaymentLock] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const lockInitialized = useRef(false);
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
    { id: 2, title: 'Uw Gegevens', icon: User, description: 'Persoonlijke informatie' },
    { id: 3, title: 'Voorwaarden', icon: FileText, description: 'Algemene voorwaarden' },
    { id: 4, title: 'Betaling', icon: CreditCard, description: 'Veilige betaling' }
  ];

  const authStep = { id: 1.5, title: 'Account', icon: User, description: 'Inloggen of registreren' };

  useEffect(() => {
    const initPage = async () => {
      // First check if user is logged in
      await checkUser();
      
      // Then check for unit parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const unitParam = urlParams.get('unit');
      if (unitParam) {
        const unitNumber = parseInt(unitParam, 10);
        if (!isNaN(unitNumber)) {
          setReservationData(prev => ({
            ...prev,
            unitNumber: unitNumber
          }));
          // Check availability for this specific unit
          checkAvailability(unitNumber);
        }
      }
    };

    initPage();
  }, []);

  // Auto-advance to create lock if user is logged in and unit is already selected
  useEffect(() => {
    const initReservation = async () => {
      if (!user || !reservationData.unitNumber || hasPaymentLock) return;
      
      console.log('✅ Unit is pre-selected and user is logged in, checking for existing lock...');
      
      // Get property_id from unit_number
      const { data: property } = await supabase
        .from('properties')
        .select('id, status')
        .eq('unit_number', reservationData.unitNumber.toString())
        .eq('type', slug.includes('bedrijfsunit') ? 'bedrijfsunit' : 'opslagbox')
        .single();

      if (!property) {
        setUnavailableMessage('Deze unit bestaat niet.');
        setShowUnavailableModal(true);
        setCurrentStep(1.5);
        return;
      }

      if (property.status !== 'available') {
        setUnavailableMessage('Deze unit is niet meer beschikbaar.');
        setShowUnavailableModal(true);
        setCurrentStep(1.5);
        return;
      }

      // Check if user already has an active lock for this property
      const { data: existingLocks, error: lockError } = await supabase
        .from('payment_locks')
        .select('*')
        .eq('property_id', property.id)
        .eq('customer_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingLocks && existingLocks.length > 0) {
        // Restore existing lock (NO MODAL - user already confirmed)
        const existingLock = existingLocks[0];
        console.log('♻️ Restoring existing lock:', existingLock.session_id);
        
        const expiresAt = new Date(existingLock.expires_at);
        
        // Calculate remaining time
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        const totalSeconds = Math.max(0, Math.floor(diff / 1000));
        const minutesLeft = Math.floor(totalSeconds / 60);
        const secondsLeft = totalSeconds % 60;
        
        console.log(`⏱️ Lock restored with ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')} remaining`);
        
        // Set all lock-related state together
        lockInitialized.current = true; // Mark as initialized
        setPaymentLockSessionId(existingLock.session_id);
        setLockExpiresAt(expiresAt); // Set this FIRST before hasPaymentLock to ensure timer starts with correct time
        setRemainingMinutes(minutesLeft);
        setRemainingSeconds(secondsLeft);
        setHasPaymentLock(true); // Set this LAST to trigger timer useEffect with all data ready
        
        // Go directly to step 2 (NO MODAL!)
        setCurrentStep(2);
      } else {
        // Only create new lock if we haven't initialized yet
        if (!lockInitialized.current) {
          console.log('🔒 No existing lock found, creating new one (from initReservation - no modal)');
          lockInitialized.current = true; // Mark as initialized
          const lockCreated = await createPaymentLock(property.id, false); // Pass false to skip modal
          if (lockCreated) {
            setCurrentStep(2); // Go to step 2 after lock is created
          }
        } else {
          console.log('⚠️ Lock already initialized, skipping creation');
          setCurrentStep(2);
        }
      }
    };

    initReservation();
  }, [user, reservationData.unitNumber]);

  // Timer countdown for lock expiry
  useEffect(() => {
    if (!lockExpiresAt || !hasPaymentLock) {
      console.log('⏱️ Timer not starting - lockExpiresAt:', lockExpiresAt, 'hasPaymentLock:', hasPaymentLock);
      return;
    }

    console.log('⏱️ Starting timer with expiry:', lockExpiresAt.toISOString());

    // Immediately calculate and set the time (don't wait for first interval)
    const updateTimer = () => {
      const now = new Date();
      const diff = lockExpiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        // Lock expired
        setHasPaymentLock(false);
        setPaymentLockSessionId(null);
        setLockExpiresAt(null);
        setRemainingMinutes(0);
        setRemainingSeconds(0);
        setUnavailableMessage('Uw reserveringstijd is verlopen. De unit is weer beschikbaar voor andere klanten.');
        setShowUnavailableModal(true);
        return false; // Stop timer
      }
      
      const totalSeconds = Math.floor(diff / 1000);
      const minutesLeft = Math.floor(totalSeconds / 60);
      const secondsLeft = totalSeconds % 60;
      
      setRemainingMinutes(minutesLeft);
      setRemainingSeconds(secondsLeft);
      return true; // Continue timer
    };

    // Update immediately
    if (!updateTimer()) return;

    // Then update every second
    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, hasPaymentLock]);

  const checkAvailability = async (unitNumber: number) => {
    setCheckingAvailability(true);
    try {
      // Check if the property is available (simple status check)
      const { data: property } = await supabase
        .from('properties')
        .select('id, status')
        .eq('unit_number', unitNumber.toString())
        .eq('type', slug.includes('bedrijfsunit') ? 'bedrijfsunit' : 'opslagbox')
        .single();

      if (!property) {
        setUnavailableMessage('Deze unit bestaat niet.');
        setShowUnavailableModal(true);
        return;
      }

      // Simple check: Is the property available?
      if (property.status !== 'available') {
        setUnavailableMessage(
          property.status === 'reserved' 
            ? 'Deze unit is al gereserveerd.' 
            : 'Deze unit is niet beschikbaar voor reservering.'
        );
        setShowUnavailableModal(true);
        return;
      }

      // Property is available, proceed with reservation flow
      console.log('✅ Unit is available, proceeding...');
      
    } catch (error) {
      console.error('Error checking availability:', error);
      setUnavailableMessage('Er is een fout opgetreden bij het controleren van de beschikbaarheid.');
      setShowUnavailableModal(true);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Set initial step based on login status
    if (user) {
      console.log('✅ User is logged in, will create lock when unit is selected');
      // User is logged in - will go to step 2 after lock is created
      // Don't set step here, let the lock creation useEffect handle it
    } else {
      console.log('❌ User not logged in, showing auth step');
      setCurrentStep(1.5); // Show auth step
    }
    
    // Only pre-fill data if user is logged in
    if (user) {
      // Fetch complete profile data from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setReservationData(prev => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            company: profile.company_name || '',
            address: profile.address || '',
            city: profile.city || '',
            postalCode: profile.postal_code || '',
            country: profile.country || 'Nederland'
          }
        }));
      } else {
        // Fallback to user metadata if profile not found
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
    }
  };

  // Create payment lock when entering reservation flow
  const createPaymentLock = async (propertyId: string, showModal = true) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('No session, skipping payment lock');
        return false;
      }

      const sessionId = Math.random().toString(36).substring(7);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const response = await fetch('/api/reservations/create-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          session_id: sessionId,
          expires_at: expiresAt.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Property is locked by someone else
        setUnavailableMessage(data.error || 'Deze unit wordt momenteel door een andere klant gereserveerd.');
        setShowUnavailableModal(true);
        return false;
      }

      if (!response.ok) {
        console.error('Failed to create payment lock:', data);
        setUnavailableMessage('Er is een fout opgetreden bij het vergrendelen van de unit.');
        setShowUnavailableModal(true);
        return false;
      }

      // Use the lock data returned from the server
      const lock = data.lock;
      const isRestored = data.restored;
      const lockSessionId = lock.session_id;
      const lockExpiresAtDate = new Date(lock.expires_at);

      // Update state
      setPaymentLockSessionId(lockSessionId);
      setLockExpiresAt(lockExpiresAtDate);
      
      // Calculate remaining time based on server expiry
      const now = new Date();
      const diff = lockExpiresAtDate.getTime() - now.getTime();
      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const minutesLeft = Math.floor(totalSeconds / 60);
      const secondsLeft = totalSeconds % 60;
      
      setRemainingMinutes(minutesLeft);
      setRemainingSeconds(secondsLeft);
      
      // Enable lock
      setHasPaymentLock(true);
      
      console.log(isRestored ? '♻️ Payment lock restored:' : '✅ Payment lock created:', lockSessionId);
      
      // Show lock confirmation modal ONLY if showModal is true AND it's a NEW lock
      if (showModal && !isRestored) {
        setShowLockModal(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating payment lock:', error);
      setUnavailableMessage('Er is een fout opgetreden bij het vergrendelen van de unit.');
      setShowUnavailableModal(true);
      return false;
    }
  };

  // Confirm and start reservation flow after lock modal
  const confirmStartReservation = () => {
    setShowLockModal(false);
    setCurrentStep(2);
  };

  // Release payment lock
  const releasePaymentLock = async () => {
    if (!paymentLockSessionId || !hasPaymentLock) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await fetch('/api/reservations/release-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          session_id: paymentLockSessionId,
        }),
      });

      console.log('🔓 Payment lock released');
      setPaymentLockSessionId(null);
      setHasPaymentLock(false);
    } catch (error) {
      console.error('Error releasing payment lock:', error);
    }
  };

  const handleStepChange = async (targetStep: number, forcedUser?: any) => {
    const currentUser = forcedUser || user;

    // If trying to go to step 2 or beyond without being logged in, go to auth step first
    if (targetStep >= 2 && !currentUser) {
      setCurrentStep(1.5);
      return;
    }

    // Lock should already be created at this point
    // Just allow navigation
    setCurrentStep(targetStep);
  };

  const nextStep = () => {
    if (currentStep === 1.5) {
      // This is handled by the auth form submission / lock modal confirmation
      return;
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = async () => {
    // Can't go back from step 2 (would need to release lock and return to property page)
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Cleanup: Release payment lock on page leave (not on Fast Refresh)
  useEffect(() => {
    // Mark as mounted
    mountedRef.current = true;

    return () => {
      // Mark as unmounted
      mountedRef.current = false;
    };
  }, []);

  // Auto-cleanup of locks on navigation is disabled to support page refreshes.
  // We rely on the 10-minute expiry and the background cron job to clean up abandoned locks.
  // Explicit release happens only on payment completion or manual cancellation.

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
          await handleStepChange(2, data.user); // Pass the user explicitly to handleStepChange
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (error) throw error;

        setUser(data.user);
        await handleStepChange(2, data.user); // Pass the user explicitly to handleStepChange
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
                  {reservationData.unitNumber && (
                    <span className="text-yellow-600"> · Unit {reservationData.unitNumber}</span>
                  )}
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

      {/* Reservation Timer Banner */}
      {hasPaymentLock && lockExpiresAt && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3">
            <div className="flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                <strong className="font-mono">{remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}</strong> om uw reservering te voltooien
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Mobile: Simplified horizontal progress */}
          <div className="sm:hidden py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">Voortgang</span>
              <span className="text-xs font-medium text-yellow-600">
                {currentStep === 1.5 ? 0 : Math.round(((currentStep - 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${currentStep === 1.5 ? 0 : ((currentStep - 1) / steps.length) * 100}%` }}
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
            {/* Loading State */}
            {currentStep === 0 && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Een moment geduld...</p>
                </div>
              </div>
            )}

            {/* Step Content with Smooth Transitions */}
            <div className="transition-all duration-500 ease-in-out">
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
                project={project}
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

      {/* Unavailable Modal */}
      {/* Reservation Lock Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <Lock className="h-10 w-10 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Reservering Vergrendeld
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Deze unit is nu voor u vergrendeld. Andere klanten kunnen deze unit niet meer reserveren.
              </p>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-8 w-8 text-yellow-600 mr-2" />
                  <span className="text-4xl font-bold text-yellow-600 font-mono">
                    {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  U heeft <strong>{remainingMinutes} minuten en {remainingSeconds} seconden</strong> de tijd om uw reservering te voltooien. 
                  Na deze tijd wordt de unit automatisch weer vrijgegeven voor andere klanten.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 text-left leading-relaxed">
                    Zorg ervoor dat u alle stappen voltooit en de betaling afrondt binnen de gestelde tijd.
                  </p>
                </div>
              </div>

              <button
                onClick={confirmStartReservation}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-semibold text-lg transition-colors shadow-md"
              >
                Doorgaan met reserveren
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Unit tijdelijk niet beschikbaar
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {unavailableMessage}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 text-left">
                    Als een andere klant de reservering annuleert of de betaling niet afrondt, 
                    komt de unit automatisch weer beschikbaar.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowUnavailableModal(false);
                    router.push(`/${slug.includes('bedrijfsunit') ? 'bedrijfsunits' : 'opslagboxen'}`);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Terug naar overzicht
                </button>
                <button
                  onClick={() => {
                    setShowUnavailableModal(false);
                    if (reservationData.unitNumber) {
                      checkAvailability(reservationData.unitNumber);
                    }
                  }}
                  className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-medium transition-colors"
                >
                  Opnieuw proberen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay during availability check */}
      {checkingAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <span className="text-gray-700 font-medium">Beschikbaarheid controleren...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
