'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // User should have a session from clicking the recovery link
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };
    
    checkSession();

    // Listen for auth state changes (recovery link sets session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Wachtwoord moet minimaal 8 karakters bevatten';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Wachtwoord moet minimaal 1 hoofdletter bevatten';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Wachtwoord moet minimaal 1 kleine letter bevatten';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Wachtwoord moet minimaal 1 cijfer bevatten';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Zwak', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 2, label: 'Gemiddeld', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Sterk', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Invalid session - show error
  if (!isValidSession) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/up/Image2.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Link verlopen of ongeldig
              </h2>
              <p className="text-slate-600 mb-6">
                Deze wachtwoord herstel link is niet meer geldig. 
                Dit kan gebeuren als de link al is gebruikt of verlopen is.
              </p>
              <Link
                href="/wachtwoord-vergeten"
                className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all text-center"
              >
                Nieuwe link aanvragen
              </Link>
              <Link
                href="/login"
                className="block w-full mt-3 text-slate-600 hover:text-slate-800 text-sm"
              >
                Terug naar inloggen
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/up/Image2.png)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header with back button */}
        <div className="pt-20 pb-8">
          <div className="max-w-md mx-auto px-4">
            <Link 
              href="/login"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar inloggen
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21h8V9l-4-3-4 3v12zm2-8h2v2H5v-2zm0 4h2v2H5v-2zm4-4h2v2H9v-2z"/>
                    <rect x="13" y="4" width="3.5" height="3" rx="0.3"/>
                    <rect x="17" y="4" width="3.5" height="3" rx="0.3"/>
                    <rect x="13" y="8" width="3.5" height="3" rx="0.3"/>
                    <rect x="17" y="8" width="3.5" height="3" rx="0.3"/>
                    <rect x="13" y="12" width="3.5" height="3" rx="0.3"/>
                    <rect x="17" y="12" width="3.5" height="3" rx="0.3"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Nieuw wachtwoord instellen
              </h1>
              <p className="text-white/80">
                Kies een sterk en veilig wachtwoord
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {isSuccess ? (
                // Success State
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    Wachtwoord gewijzigd!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Uw wachtwoord is succesvol gewijzigd. 
                    U wordt automatisch doorgestuurd naar de inlogpagina...
                  </p>
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-500 mr-2" />
                    <span className="text-sm text-slate-500">Doorsturen...</span>
                  </div>
                </div>
              ) : (
                // Form State
                <>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                        Nieuw wachtwoord
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                          placeholder="Minimaal 8 karakters"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength.strength === 1 ? 'text-red-600' :
                              passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <ul className="mt-2 text-xs text-slate-500 space-y-1">
                            <li className={password.length >= 8 ? 'text-green-600' : ''}>
                              ✓ Minimaal 8 karakters
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                              ✓ Minimaal 1 hoofdletter
                            </li>
                            <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                              ✓ Minimaal 1 kleine letter
                            </li>
                            <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                              ✓ Minimaal 1 cijfer
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                        Bevestig wachtwoord
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                            confirmPassword && password !== confirmPassword 
                              ? 'border-red-300 bg-red-50' 
                              : confirmPassword && password === confirmPassword 
                                ? 'border-green-300 bg-green-50'
                                : 'border-slate-300'
                          }`}
                          placeholder="Herhaal uw wachtwoord"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">Wachtwoorden komen niet overeen</p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="mt-1 text-xs text-green-600">✓ Wachtwoorden komen overeen</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || password !== confirmPassword || !password}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Opslaan...' : 'Wachtwoord opslaan'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

