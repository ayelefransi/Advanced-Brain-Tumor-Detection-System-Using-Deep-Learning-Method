'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Brain, Upload, Users, BarChart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: Brain,
    },
    ...(session ? [
      {
        href: '/upload',
        label: 'Upload Scan',
        icon: Upload,
      },
      {
        href: '/patients',
        label: 'Patients',
        icon: Users,
      },
      {
        href: '/analytics',
        label: 'Analytics',
        icon: BarChart,
      },
    ] : [])
  ]

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login'
      })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="fixed top-0 w-full bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">NeuroScan AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <>
                {routes.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-600',
                        pathname === route.href
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{route.label}</span>
                    </Link>
                  )
                })}
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {session ? (
              <>
                {routes.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                        pathname === route.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{route.label}</span>
                    </Link>
                  )
                })}
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="block w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 