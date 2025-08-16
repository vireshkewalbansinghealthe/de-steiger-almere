'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { email, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', { data, error })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('User logged in:', data.user.id)
        
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        console.log('Profile check:', { profile, profileError })

        if (profileError) {
          setError(`Profile check failed: ${profileError.message}`)
          setLoading(false)
          return
        }

        if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
          await supabase.auth.signOut()
          setError(`You do not have admin access. Role: ${profile?.role || 'none'}`)
          setLoading(false)
          return
        }

        console.log('Login successful, redirecting...')
        router.push('/admin')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/up/Image1.png')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/50 to-slate-900/70" />
        
        {/* Overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-white font-bold text-xl">DS</span>
            </div>
            <span className="ml-3 text-2xl font-bold">De Steiger</span>
          </div>
          
          {/* Main content */}
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Welkom bij het<br />
              <span className="text-yellow-400">Beheer Panel</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Beheer uw bedrijfsunits en opslagboxen in De Steiger 74/77, Almere. 
              Een moderne en professionele omgeving voor ondernemers.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">12</div>
                <div className="text-white/80 text-sm">Bedrijfsunit Types</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">16</div>
                <div className="text-white/80 text-sm">Opslagbox Types</div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-white/60 text-sm">
            © 2025 De Steiger. Alle rechten voorbehouden.
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-slate-800 mb-4">
              <span className="text-white font-bold text-2xl">DS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">De Steiger</h1>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Inloggen
            </h2>
            <p className="text-gray-600">
              Toegang tot het beheer panel
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 focus:z-10 text-sm transition-colors"
                  placeholder="admin@desteiger.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 focus:z-10 text-sm transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Inloggen...
                  </div>
                ) : (
                  'Inloggen'
                )}
              </button>
            </div>

            <div className="text-center space-y-3">
              <div>
                <Link
                  href="/admin/signup"
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                >
                  Nog geen account? Account aanmaken
                </Link>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/"
                  className="inline-flex items-center text-slate-600 hover:text-slate-800 text-sm transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Terug naar website
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
