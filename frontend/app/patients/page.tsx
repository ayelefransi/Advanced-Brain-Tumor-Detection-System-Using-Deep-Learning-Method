'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { 
  Users, Search, Filter, 
  Plus, Calendar, Clock, 
  ArrowUpDown, MoreVertical,
  Brain, Home, Upload, BarChart3, Settings, LogOut, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import MobileMenu from '@/components/MobileMenu'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'

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
          {session?.user ? (
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
          ) : null}
        </div>
      </div>
    </div>
  </motion.div>
)

const SideNav = () => {
  const pathname = '/patients'
  const { data: session } = useSession()

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/upload', label: 'Upload Scan', icon: Upload },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="fixed hidden md:flex left-4 top-24 bottom-4 w-64 bg-background/60 backdrop-blur-xl rounded-2xl border shadow-2xl z-40"
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
            onClick={() => signOut()}
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

interface Patient {
  id: string
  firstName: string
  lastName: string
  age: number
  lastScan: string
  status: 'Healthy' | 'Under Treatment' | 'Critical'
  scanCount: number
  image?: string
  email?: string
  phone?: string
  diagnosis?: string
  nextAppointment?: string
}

const usePatientsData = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients')
        const data = await response.json()
        
        const formattedPatients = data.map((patient: any) => ({
          id: patient.id,
          firstName: patient.firstName || patient.name?.split(' ')[0] || '',
          lastName: patient.lastName || patient.name?.split(' ')[1] || '',
          age: patient.age || 0,
          lastScan: patient.lastScan || new Date().toISOString().split('T')[0],
          status: patient.status || 'Healthy',
          scanCount: patient.scanCount || 0,
          email: patient.email,
          phone: patient.phone,
          diagnosis: patient.diagnosis,
          nextAppointment: patient.nextAppointment
        }))
        
        setPatients(formattedPatients)
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  return { patients, loading }
}

const AddPatientForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    status: 'Healthy' as Patient['status']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add your logic to save the patient data
    console.log('New patient:', formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Patient['status'] }))}
        >
          <option value="Healthy">Healthy</option>
          <option value="Under Treatment">Under Treatment</option>
          <option value="Critical">Critical</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Patient</Button>
      </div>
    </form>
  )
}

export default function PatientsPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()
  const { patients, loading } = usePatientsData()

  const filteredPatients = patients.filter(patient => {
    const searchString = `${patient.firstName} ${patient.lastName} ${patient.email}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <TopNav session={session} />
      <SideNav />
      
      <div className="pt-32 px-4 md:pl-72 md:pr-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <motion.h1 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Patients Overview
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Manage and monitor patient records
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
                      animate={{
                        x: ['0%', '100%'],
                        backgroundSize: ['200% 100%', '200% 100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="relative">Add New Patient</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                  </DialogHeader>
                  <AddPatientForm onClose={() => document.querySelector('button[aria-label="Close"]')?.click()} />
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              { 
                title: 'Total Patients', 
                value: patients.length.toString(), 
                icon: Users 
              },
              { 
                title: 'Active Cases', 
                value: patients.filter(p => p.status === 'Under Treatment').length.toString(), 
                icon: Clock 
              },
              { 
                title: 'Critical Cases', 
                value: patients.filter(p => p.status === 'Critical').length.toString(), 
                icon: AlertCircle 
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none bg-background/60 backdrop-blur-xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <stat.icon className="h-8 w-8 text-primary relative" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-10 bg-background/60 backdrop-blur-xl border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-background/60 backdrop-blur-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="bg-background/60 backdrop-blur-xl">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </motion.div>

          {/* Patients List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none bg-background/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b">
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {loading ? (
                    <div className="p-8 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="h-8 w-8 mx-auto text-primary" />
                      </motion.div>
                      <p className="mt-2 text-muted-foreground">Loading patients...</p>
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No patients found
                    </div>
                  ) : (
                    filteredPatients.map((patient, index) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/patient-info/${patient.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={patient.image} />
                              <AvatarFallback>
                                {patient.firstName[0]}{patient.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Age: {patient.age}</span>
                                <span>•</span>
                                <span>Last Scan: {new Date(patient.lastScan).toLocaleDateString()}</span>
                                {patient.nextAppointment && (
                                  <>
                                    <span>•</span>
                                    <span>Next: {new Date(patient.nextAppointment).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-medium",
                                patient.status === 'Healthy' && "text-green-500",
                                patient.status === 'Critical' && "text-red-500",
                                patient.status === 'Under Treatment' && "text-yellow-500"
                              )}>
                                {patient.status}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {patient.scanCount} scans
                              </p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}