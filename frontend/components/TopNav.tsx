'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import MobileMenu from '@/components/MobileMenu'

const TopNav = ({ session }: { session: any }) => (
  <motion.div 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-4 left-4 right-4 h-20 bg-background/60 backdrop-blur-xl rounded-2xl border shadow-2xl z-50"
  >
    <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
      <motion.div 
        className="flex items-center gap-3"
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Brain className="h-7 w-7 text-primary relative" />
        </div>
        <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
          NeuroScan AI
        </h1>
      </motion.div>
      
      <div className="flex items-center gap-4">
        <MobileMenu />
        <div className="hidden md:flex items-center gap-4">
          {session?.user && (
            <motion.div 
              className="flex items-center gap-4 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-xl border shadow-lg"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center relative">
                  {session.user.email?.[0].toUpperCase()}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {session.user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  Pro Member
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
)

export default TopNav 