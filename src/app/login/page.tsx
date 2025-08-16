'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Building2, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const returnTo = searchParams.get('returnTo');
  const isReservationFlow = returnTo?.includes('/reserveren/');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Redirect to returnTo URL if provided, otherwise to profile
        const redirectUrl = returnTo ? decodeURIComponent(returnTo) : '/profiel';
        router.push(redirectUrl);
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
              href="/"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar home
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Reservation Flow Banner */}
          {isReservationFlow && (
            <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-white">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                  <ShoppingCart className="h-4 w-4 text-slate-900" />
                </div>
                <div>
                  <div className="font-semibold">Reservering wordt voortgezet</div>
                  <div className="text-sm text-white/80">Log in om uw reservering af te ronden</div>
                </div>
              </div>
            </div>
          )}

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
              {isReservationFlow ? 'Bijna klaar!' : 'Welkom terug'}
            </h1>
            <p className="text-white/80">
              {isReservationFlow ? 'Log in om uw reservering te voltooien' : 'Log in op uw De Steiger account'}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Wachtwoord
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
                    placeholder="Uw wachtwoord"
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Inloggen...' : 'Inloggen'}
              </button>
            </form>

            {/* Forgot Password & Register Links */}
            <div className="mt-6 text-center space-y-4">
              <Link 
                href="/wachtwoord-vergeten"
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Wachtwoord vergeten?
              </Link>
              
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-3">
                  Nog geen account?
                </p>
                <Link
                  href="/registreren"
                  className="inline-flex items-center justify-center w-full bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Account aanmaken
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
