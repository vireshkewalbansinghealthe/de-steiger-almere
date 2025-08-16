'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X, Phone, Mail, Download, User, LogOut, ArrowLeft } from 'lucide-react';
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
    if (typeof window === 'undefined') return; // Ensure this runs only on the client
    
    // Force scrolled state on reservation pages (no hero section)
    const isReservationPage = pathname?.startsWith('/reserveren') || false;
    
    if (isReservationPage) {
      setIsScrolled(true);
      return; // Don't add scroll listener for reservation pages
    }
    
    // Check initial scroll position for other pages
    setIsScrolled(window.scrollY > 50);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Ensure this runs only on the client
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
              <div className="flex items-center space-x-3">
                {/* Logo Icon */}
                <div className="relative">
                  <div className={`w-10 h-10 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                    isScrolled 
                      ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg' 
                      : 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-xl'
                  }`}>
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      {/* Buildings & Storage Icon */}
                      <svg className="w-full h-full p-1.5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                        {/* Building part */}
                        <path d="M3 21h8V9l-4-3-4 3v12zm2-8h2v2H5v-2zm0 4h2v2H5v-2zm4-4h2v2H9v-2z"/>
                        {/* Storage boxes part */}
                        <rect x="13" y="4" width="3.5" height="3" rx="0.3"/>
                        <rect x="17" y="4" width="3.5" height="3" rx="0.3"/>
                        <rect x="13" y="8" width="3.5" height="3" rx="0.3"/>
                        <rect x="17" y="8" width="3.5" height="3" rx="0.3"/>
                        <rect x="13" y="12" width="7.5" height="4" rx="0.3"/>
                        <rect x="13" y="17" width="7.5" height="3" rx="0.3"/>
                      </svg>
                    </div>
                    {/* Subtle highlight */}
                    <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
                  </div>
                </div>
                
                {/* Logo Text */}
                <div className="flex flex-col">
                  <div className={`text-2xl font-bold transition-colors duration-200 tracking-tight leading-none ${
                    isScrolled 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 group-hover:from-slate-900 group-hover:to-slate-700' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-50 to-white group-hover:from-yellow-100 group-hover:to-white'
                  }`}>
                    De Steiger
                  </div>
                  <div className={`text-xs font-medium tracking-wide uppercase transition-colors duration-200 ${
                    isScrolled 
                      ? 'text-yellow-600 group-hover:text-yellow-700' 
                      : 'text-yellow-300 group-hover:text-yellow-200'
                  }`}>
                    Bedrijfsunits & opslagboxen
                  </div>
                </div>
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

            {/* Contact Link */}
            <Link
              href="/contact"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              Contact
            </Link>

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
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <User className="h-4 w-4 mr-2" />
                  Inloggen
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Navigation Buttons */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Back to Overview Button - Show on detail pages */}
            {pathname && (pathname.includes('/bedrijfsunit/') || pathname.includes('/opslagbox/')) && (
              <Link
                href={pathname.includes('/bedrijfsunit/') ? '/bedrijfsunits' : '/opslagboxen'}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                    : 'text-white hover:text-slate-300 hover:bg-white/10'
                }`}
                title="Terug naar overzicht"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
            )}
            
            {/* Profile/Login Button */}
            <Link
              href={user ? "/profiel" : "/login"}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-slate-800 hover:bg-slate-50' 
                  : 'text-white hover:text-slate-300 hover:bg-white/10'
              }`}
              title={user ? "Mijn Profiel" : "Inloggen"}
            >
              <User className="h-6 w-6" />
            </Link>
            
            {/* Mobile Menu Button */}
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

        {/* Mobile Navigation Sidebar */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21h8V9l-4-3-4 3v12zm2-8h2v2H5v-2zm0 4h2v2H5v-2zm4-4h2v2H9v-2z"/>
                    <rect x="13" y="4" width="3.5" height="3" rx="0.3"/>
                    <rect x="17" y="4" width="3.5" height="3" rx="0.3"/>
                    <rect x="13" y="8" width="3.5" height="3" rx="0.3"/>
                    <rect x="17" y="8" width="3.5" height="3" rx="0.3"/>
                    <rect x="13" y="12" width="7.5" height="4" rx="0.3"/>
                    <rect x="13" y="17" width="7.5" height="3" rx="0.3"/>
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">De Steiger</div>
                  <div className="text-xs text-yellow-600 uppercase tracking-wide">Menu</div>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="px-6 py-6 space-y-1">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <Link
                    href="/bedrijfsunits"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 opacity-60"></div>
                    Bedrijfsunits
                  </Link>

                  <Link
                    href="/opslagboxen"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 opacity-60"></div>
                    Opslagboxen
                  </Link>

                  <Link
                    href="/downloads"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Download className="h-5 w-5 mr-3 text-yellow-500" />
                    Downloads
                  </Link>
                </div>

                {/* Informatie Section */}
                <div className="pt-4">
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 opacity-60"></div>
                      Informatie
                    </div>
                    <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${
                      isInfoOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isInfoOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pl-6 pt-2 space-y-1">
                      <Link
                        href="/beleggers"
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsInfoOpen(false);
                        }}
                      >
                        <span className="mr-3 text-base">💰</span>
                        Voor Beleggers
                      </Link>
                      <Link
                        href="/ondernemers"
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsInfoOpen(false);
                        }}
                      >
                        <span className="mr-3 text-base">🏢</span>
                        Voor Ondernemers
                      </Link>
                    </div>
                  </div>
                </div>

                <Link
                  href="/over-unity"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 opacity-60"></div>
                  Over De Steiger
                </Link>
              </div>

              {/* User Section */}
              <div className="mt-auto border-t border-gray-200">
                {user ? (
                  <div className="px-6 py-6 space-y-3">
                    <div className="px-4 py-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/profiel"
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3 text-yellow-500" />
                      Mijn Profiel
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                    >
                      <LogOut className="h-5 w-5 mr-3 text-yellow-500" />
                      Uitloggen
                    </button>
                  </div>
                ) : (
                  <div className="px-6 py-6">
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Inloggen
                    </Link>
                  </div>
                )}

                {/* Contact CTA */}
                <div className="px-6 pb-6">
                  <Link
                    href="/contact"
                    className="block w-full bg-slate-800 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}