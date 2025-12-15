'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

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
                Wachtwoord vergeten?
              </h1>
              <p className="text-white/80">
                Geen probleem! Vul uw e-mailadres in en we sturen u een link om uw wachtwoord te herstellen.
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
                    E-mail verzonden!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    We hebben een link naar <strong>{email}</strong> gestuurd om uw wachtwoord te herstellen. 
                    Controleer ook uw spam folder.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> De link is 1 uur geldig. 
                      Geen e-mail ontvangen? Controleer uw spam folder of probeer het opnieuw.
                    </p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setEmail('');
                      }}
                      className="w-full bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Opnieuw proberen
                    </button>
                    <Link
                      href="/login"
                      className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all text-center"
                    >
                      Terug naar inloggen
                    </Link>
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
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        E-mailadres
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                          placeholder="uw.email@example.com"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verzenden...' : 'Verstuur herstel link'}
                    </button>
                  </form>

                  {/* Back to Login Link */}
                  <div className="mt-6 text-center">
                    <Link 
                      href="/login"
                      className="text-sm text-slate-600 hover:text-slate-800"
                    >
                      Weet u uw wachtwoord nog? <span className="text-yellow-600 font-medium">Inloggen</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

