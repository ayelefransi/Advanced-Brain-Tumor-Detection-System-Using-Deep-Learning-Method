'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { Brain, BarChart, Upload, Users, LogOut } from 'lucide-react'

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await auth.signOut()
  }

  if (!user) return null

  return (
    <header className="fixed top-0 w-full bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">BrainScan AI</span>
            </Link>

            <nav className="ml-10 space-x-4">
              <Link href="/dashboard">
                <BarChart className="h-5 w-5" />
                Dashboard
              </Link>
              <Link href="/upload">
                <Upload className="h-5 w-5" />
                Upload Scan
              </Link>
              <Link href="/patients">
                <Users className="h-5 w-5" />
                Patients
              </Link>
            </nav>
          </div>

          <Button onClick={handleSignOut} variant="ghost">
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

