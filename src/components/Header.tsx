'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X, Phone, Mail, Download, User, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function Header() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsInfoOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className={`text-3xl font-serif transition-colors duration-200 tracking-wide ${
                isScrolled 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 group-hover:from-yellow-700 group-hover:to-yellow-500' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 group-hover:from-yellow-300 group-hover:to-yellow-100'
              }`}>
                De Steiger
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Bedrijfsunits */}
            <Link
              href="/bedrijfsunits"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              Bedrijfsunits
            </Link>

            {/* Opslagboxen */}
            <Link
              href="/opslagboxen"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              Opslagboxen
            </Link>

            {/* Downloads */}
            <Link
              href="/downloads"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              <Download className="h-4 w-4 mr-1" />
              Downloads
            </Link>

            {/* Informatie Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                    : 'text-white hover:text-slate-300 hover:bg-white/10'
                }`}
              >
                Informatie
                <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              
              {/* Invisible bridge to prevent gap */}
              <div className="absolute right-0 top-full w-56 h-2 invisible group-hover:visible"></div>
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-200 transform-gpu origin-top-right">
                <div className="p-2">
                  <Link
                    href="/beleggers"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors duration-150"
                  >
                    <div className="mr-3 text-slate-800">💰</div>
                    <div>
                      <div className="font-medium">Voor Beleggers</div>
                      <div className="text-xs text-gray-500">Investeren in De Steiger</div>
                    </div>
                  </Link>
                  <Link
                    href="/ondernemers"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors duration-150"
                  >
                    <div className="mr-3 text-slate-800">🏢</div>
                    <div>
                      <div className="font-medium">Voor Ondernemers</div>
                      <div className="text-xs text-gray-500">Huur je ideale unit</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/over-unity"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              Over De Steiger
            </Link>

            {/* Contact Link */}
            <div className="ml-4">
              <Link
                href="/contact"
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-slate-800' 
                    : 'text-white hover:text-slate-300'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* User Menu */}
            <div className="ml-6 relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                        : 'text-white hover:text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {profile?.first_name || 'Profiel'}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profiel"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 inline mr-2" />
                        Mijn Profiel
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Uitloggen
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isScrolled 
                      ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Inloggen
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Modern Mobile Slide Menu */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Slide Panel */}
          <div className={`fixed top-0 right-0 h-full w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">De Steiger</h2>
                  <p className="text-sm text-gray-500">Almere</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
              {/* Mobile Bedrijfsunits */}
              <Link
                href="/bedrijfsunits"
                className="block text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Bedrijfsunits
              </Link>

              {/* Mobile Opslagboxen */}
              <Link
                href="/opslagboxen"
                className="block text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Opslagboxen
              </Link>

              {/* Mobile Downloads */}
              <Link
                href="/downloads"
                className="flex items-center text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Download className="h-4 w-4 mr-2" />
                Downloads
              </Link>

              {/* Mobile Informatie */}
              <div>
                <button
                  className="w-full flex justify-between items-center text-left text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                  onClick={() => setIsInfoOpen(!isInfoOpen)}
                >
                  Informatie
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${
                    isInfoOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                {isInfoOpen && (
                  <div className="mt-2 pl-4 space-y-1">
                    <Link
                      href="/beleggers"
                      className="flex items-center text-gray-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg transition-colors duration-150"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsInfoOpen(false);
                      }}
                    >
                      <span className="mr-2">💰</span>
                      Voor Beleggers
                    </Link>
                    <Link
                      href="/ondernemers"
                      className="flex items-center text-gray-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg transition-colors duration-150"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsInfoOpen(false);
                      }}
                    >
                      <span className="mr-2">🏢</span>
                      Voor Ondernemers
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/over-unity"
                className="block text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Over De Steiger
              </Link>

              {/* Mobile User Menu */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/profiel"
                    className="flex items-center text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mijn Profiel
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left text-gray-700 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Uitloggen
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Inloggen
                  </Link>
                </div>
              )}

              {/* Mobile CTA */}
              <div className={user ? "mt-4" : "pt-4 border-t border-gray-200 mt-4"}>
                <Link
                  href="/contact"
                  className="block w-full bg-slate-800 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}