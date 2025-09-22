'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Menu, X, Home, Upload, Brain, Users, BarChart, LogIn, 
  LogOut, User, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
   
    { name: 'Upload Scan', href: '/upload', icon: Upload },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: Brain },
  ]

  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
        className="fixed right-4 top-4 z-50 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white/90 transition-all duration-200"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-black" />
          ) : (
            <Menu className="h-6 w-6 text-black" />
          )}
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/70 backdrop-blur-xl"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 h-full w-full max-w-[350px] bg-white/80 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex h-full flex-col overflow-y-auto pt-16">
                {session && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-3">
                      {session.user?.image && (
                        <img src={session.user.image} alt="Profile" className="h-12 w-12 rounded-full ring-2 ring-white/50" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Welcome back,</p>
                        <p className="font-bold text-blue-600">{session.user?.name}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-2">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                            pathname === item.href
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100/50'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 border-t border-gray-200/50 pt-6"
                  >
                    {session ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/login' })
                            setIsOpen(false)
                          }}
                          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800"
                      >
                        <LogIn className="h-5 w-5" />
                        <span className="font-medium">Sign In</span>
                      </Link>
                    )}
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 