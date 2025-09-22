'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Calendar, Clock, FileText, Activity, MoreVertical, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PatientPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const patients = [
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      lastScan: '2024-01-20',
      status: 'Completed',
      result: 'Negative',
      type: 'Meningioma',
      nextAppointment: '2024-02-15'
    },
    // Add more patient data
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Patient Management
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500"
        >
          View and manage patient records and scan results
        </motion.p>
      </div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search patients..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button className="gap-2">
          Add New Patient
        </Button>
      </motion.div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/avatars/${patient.id}.jpg`} />
                        <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <div className="text-sm text-gray-500">Age: {patient.age}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last Scan: {patient.lastScan}
                      </div>
                      <Badge 
                        variant={patient.status === 'Completed' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {patient.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Activity className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-500">Result:</span>
                        <span className={`ml-1 font-medium ${
                          patient.result === 'Negative' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {patient.result}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50">
                        {patient.type}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Next Appointment: {patient.nextAppointment}
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button variant="outline" className="w-full gap-2">
                        <FileText className="h-4 w-4" />
                        View History
                      </Button>
                      <Button className="w-full gap-2">
                        New Scan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 