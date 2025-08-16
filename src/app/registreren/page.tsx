'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, Building2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters bevatten');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            full_name: `${formData.firstName} ${formData.lastName}`
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
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
        
        {/* Success Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Account aangemaakt!</h1>
              
              <p className="text-slate-600 mb-6">
                We hebben een bevestigingsmail gestuurd naar <strong>{formData.email}</strong>. 
                Klik op de link in de email om uw account te activeren.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
                >
                  Naar inlogpagina
                </Link>
                
                <Link
                  href="/"
                  className="block w-full text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Terug naar home
                </Link>
              </div>
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
          <div className="max-w-lg mx-auto px-4">
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
          <div className="max-w-lg w-full">
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
              <h1 className="text-3xl font-bold text-white mb-2">Account aanmaken</h1>
              <p className="text-white/80">Maak uw De Steiger account aan om te reserveren</p>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                      Voornaam
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        placeholder="Uw voornaam"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                      Achternaam
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      placeholder="Uw achternaam"
                    />
                  </div>
                </div>

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
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      placeholder="uw.email@example.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Telefoonnummer
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      placeholder="+31 6 12345678"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
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
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Bevestig wachtwoord
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        placeholder="Herhaal wachtwoord"
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
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Al een account?{' '}
                  <Link 
                    href="/login"
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Log hier in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
