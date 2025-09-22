'use client'

import { motion } from 'framer-motion'
import { Home, Upload, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

const SideNav = () => {
  const pathname = usePathname()
  const { toast } = useToast()

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/upload', label: 'Upload Scan', icon: Upload },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again"
      })
    }
  }

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="fixed hidden md:flex left-4 top-28 bottom-4 w-64 bg-background/60 backdrop-blur-xl rounded-2xl border shadow-2xl z-40"
    >
      <div className="flex flex-col h-full p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors",
                pathname === item.href 
                  ? "bg-accent/50 text-primary"
                  : "hover:bg-accent/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default SideNav 