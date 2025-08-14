'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Building, 
  Package, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  Calendar
} from 'lucide-react'

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'customer' | 'admin' | 'super_admin'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const getInitials = (first: string | null, last: string | null) => {
    const a = (first || '').trim()[0] || ''
    const b = (last || '').trim()[0] || ''
    return (a + b).toUpperCase() || 'DS'
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        router.push('/admin/login')
        return
      }

      setUser(user)
      setProfile(profile)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bedrijfsunits', href: '/admin/bedrijfsunits', icon: Building },
    { name: 'Opslagboxen', href: '/admin/opslagboxen', icon: Package },
    { name: 'Reserveringen', href: '/admin/reserveringen', icon: Calendar },
    { name: 'Berichten', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Gebruikers', href: '/admin/users', icon: Users },
    { name: 'Instellingen', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-slate-900/70 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200">De Steiger Admin</h1>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      active
                        ? 'text-white bg-white/10 ring-1 ring-white/10'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-4 h-5 w-5 ${active ? 'text-yellow-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          {/* Mobile sidebar profile footer */}
          <div className="mt-auto pt-4 border-t border-white/10 px-4">
            {profile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                    {getInitials(profile.first_name, profile.last_name)}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-white">{profile.first_name} {profile.last_name}</div>
                    <div className="text-xs text-slate-300/90">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200">De Steiger Admin</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-3 pb-4 space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'text-white bg-white/10 ring-1 ring-white/10'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-yellow-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            {/* Desktop sidebar profile footer */}
            {profile && (
              <div className="mt-auto px-3 pt-4 pb-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                      {getInitials(profile.first_name, profile.last_name)}
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm text-white">{profile.first_name} {profile.last_name}</div>
                      <div className="text-xs text-slate-300/90">{user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Uitloggen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/70 backdrop-blur border-b border-slate-200">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="flex items-center h-16">
                    <h2 className="text-2xl font-semibold text-slate-900">Admin Panel</h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-700">
                  {profile.first_name} {profile.last_name} ({profile.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
